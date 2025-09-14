// paymentService.ts - Version corrigée avec getActualPriceId uniquement
import subscriptionService, { SubscriptionTier } from './subscriptionService';

// Interface pour les plans d'abonnement
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  tier: SubscriptionTier;
  savings?: number;
}

// Plans disponibles avec vos tarifs finaux
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_plan',
    name: 'Plan Gratuit',
    description: 'Accès complet aux fonctionnalités de base',
    price: 0,
    currency: 'EUR',
    billingPeriod: 'monthly',
    features: [
      'Apprentissage de vocabulaire illimité',
      'Quiz illimitées',
      'Révision illimitée du vocabulaire',
      'Statistiques détaillées',
      'Accès aux catégories de base'
    ],
    tier: SubscriptionTier.FREE
  },
  {
    id: 'premium_monthly',
    name: 'Premium Mensuel',
    description: 'Accès aux fonctionnalités avancées avec facturation mensuelle',
    price: 4,
    currency: 'EUR',
    billingPeriod: 'monthly',
    features: [
      'Toutes les fonctionnalités gratuites',
      'Exercices interactifs avancés',
      'Grammaire complète avancée',
      'Construction de phrases interactive',
      'Phrases à trous avancées',
      'Analytics avancés et insights',
      'Mode hors-ligne complet',
      'Synchronisation Google Drive',
      'Accès à toutes les catégories premium'
    ],
    tier: SubscriptionTier.PREMIUM
  },
  {
    id: 'premium_yearly',
    name: 'Premium Annuel',
    description: 'Accès aux fonctionnalités avancées avec facturation annuelle - Économisez 16% !',
    price: 40,
    currency: 'EUR',
    billingPeriod: 'yearly',
    features: [
      'Toutes les fonctionnalités gratuites',
      'Exercices interactifs avancés',
      'Grammaire complète avancée',
      'Construction de phrases interactive', 
      'Phrases à trous avancées',
      'Analytics avancés et insights',
      'Mode hors-ligne complet',
      'Synchronisation Google Drive',
      'Accès à toutes les catégories premium',
      'Économisez 8€ sur l\'année'
    ],
    tier: SubscriptionTier.PREMIUM,
    savings: 8
  }
];

class PaymentService {
  // URL de l'API backend
  private apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Mode simulation pour développement local sans backend
  private simulatePayments = process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL;

  // Token JWT pour l'authentification
  private authToken: string | null = null;

  constructor() {
    console.log('[PaymentService] Variables d\'environnement:');
    console.log('- NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('- NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY);
    console.log('- NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL);
    console.log('- NODE_ENV:', process.env.NODE_ENV);

    console.log('[PaymentService] URL calculée:', this.apiUrl);
    console.log('[PaymentService] Mode simulation:', this.simulatePayments ? 'OUI' : 'NON');
    console.log('[PaymentService] Initialisation avec backend:', this.apiUrl);
  }

  // Définir le token d'authentification
  public setAuthToken(token: string): void {
    this.authToken = token;
    console.log('[PaymentService] Token d\'authentification défini');
  }

  // Obtenir les headers d'authentification
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  // Initialisation du service
  public async initialize(): Promise<boolean> {
    try {
      console.log('[PaymentService] Initialisation du service...');

      if (this.simulatePayments) {
        console.log('[PaymentService] Mode simulation activé');
        return true;
      }

      const response = await fetch(`${this.apiUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Backend inaccessible: ${response.status}`);
      }

      console.log('[PaymentService] Service initialisé avec succès');
      return true;
    } catch (error) {
      console.error('[PaymentService] Erreur d\'initialisation:', error);
      return false;
    }
  }

  // Récupérer dynamiquement le price ID correct
  private getActualPriceId(plan: SubscriptionPlan): string | undefined {
    if (plan.id === 'premium_monthly') {
      console.log('[PaymentService] Utilisation priceId mensuel:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY);
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    } else if (plan.id === 'premium_yearly') {
      console.log('[PaymentService] Utilisation priceId annuel:', process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL);
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
    }
    return undefined;
  }

  // Créer une session de paiement via le backend
  public async createCheckoutSession(plan: SubscriptionPlan, userEmail?: string): Promise<string> {
    if (this.simulatePayments) {
      console.log(`[PaymentService] Simulation de création de session pour le plan ${plan.name} (${plan.price}€)`);
      return `sim_checkout_${Date.now()}`;
    }

    try {
      const actualPriceId = this.getActualPriceId(plan);

      console.log(`[PaymentService] Création d'une session pour le plan: ${plan.name} - ${plan.price}€/${plan.billingPeriod === 'monthly' ? 'mois' : 'an'}`);

      console.log('DEBUG - Plan data:', {
        planId: plan.id,
        priceId: actualPriceId,
        name: plan.name,
        envVars: {
          monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY,
          annual: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL
        }
      });

      if (!actualPriceId) {
        throw new Error(`Price ID manquant pour le plan ${plan.name}. Vérifiez vos variables d'environnement.`);
      }

      const response = await fetch(`${this.apiUrl}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          planId: plan.id,
          priceId: actualPriceId,
          userEmail,
          metadata: {
            planName: plan.name,
            planPrice: plan.price,
            billingPeriod: plan.billingPeriod,
            planId: plan.id
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[PaymentService] Erreur API:', response.status, errorData);
        throw new Error(errorData.error || `Erreur ${response.status} lors de la création de la session`);
      }

      const data = await response.json();
      console.log('[PaymentService] Réponse de l\'API:', data);

      if (!data.sessionId) {
        throw new Error('Session ID manquant dans la réponse');
      }

      return data.sessionId;
    } catch (error) {
      console.error('[PaymentService] Erreur détaillée lors de la création de session:', error);
      throw error;
    }
  }

  // Vérifier l'abonnement actuel via le backend
  public async verifySubscription(): Promise<any> {
    if (this.simulatePayments) {
      return {
        isPremium: true,
        tier: 'premium',
        status: 'active'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PaymentService] Erreur vérification abonnement:', error);
      throw error;
    }
  }

  // Récupérer les plans d'abonnement
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Obtenir un plan par ID
  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  // Calculer les économies de l'abonnement annuel
  public calculateYearlySavings(): { amount: number; percentage: number } {
    const monthlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
    const yearlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_yearly');

    if (!monthlyPlan || !yearlyPlan) {
      return { amount: 0, percentage: 0 };
    }

    const monthlyYearlyEquivalent = monthlyPlan.price * 12; // 4€ x 12 = 48€
    const savings = monthlyYearlyEquivalent - yearlyPlan.price; // 48€ - 40€ = 8€
    const percentage = Math.round((savings / monthlyYearlyEquivalent) * 100); // ~16%

    console.log(`[PaymentService] Économies calculées: ${savings}€ (${percentage}%)`);
    return { amount: savings, percentage };
  }
}

// Singleton pattern pour le service de paiement
const paymentService = new PaymentService();
export default paymentService;
