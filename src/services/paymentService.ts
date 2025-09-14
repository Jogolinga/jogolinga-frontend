// paymentService.ts - Version Production Simplifiée
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
  // URL de l'API backend - Production uniquement
  private apiUrl = 'https://jogolinga-backend-production.up.railway.app';
  
  // Token JWT pour l'authentification
  private authToken: string | null = null;

  constructor() {
    console.log('[PaymentService] Mode production - Backend:', this.apiUrl);
  }

  // Définir le token d'authentification
  public setAuthToken(token: string): void {
    this.authToken = token;
    console.log('[PaymentService] Token d\'authentification configuré');
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

  // Récupérer le price ID Stripe correct
  private getPriceId(plan: SubscriptionPlan): string {
    if (plan.id === 'premium_monthly') {
      return 'price_1S6fiUQuDKrWMtCMYNGdkPM2';
    } else if (plan.id === 'premium_yearly') {
      return 'price_1S6fosQuDKrWMtCMyhsJdSgV';
    }
    throw new Error(`Price ID non défini pour le plan: ${plan.id}`);
  }

  // Initialisation du service
  public async initialize(): Promise<boolean> {
    try {
      console.log('[PaymentService] Test de connexion au backend...');
      
      const response = await fetch(`${this.apiUrl}/api/health`);
      if (!response.ok) {
        throw new Error(`Backend inaccessible: ${response.status}`);
      }
      
      console.log('[PaymentService] Backend accessible - Service prêt');
      return true;
    } catch (error) {
      console.error('[PaymentService] Erreur de connexion backend:', error);
      return false;
    }
  }

  // Ajouter cette méthode dans votre classe PaymentService

// Forcer l'activation du Premium (mode développement)
public async forceActivatePremium(billingPeriod: 'monthly' | 'yearly' = 'monthly'): Promise<boolean> {
  try {
    console.log('[PaymentService] Activation forcée du Premium en mode développement');
    
    // Déterminer le plan ID selon la période
    const planId = billingPeriod === 'yearly' ? 'premium_yearly' : 'premium_monthly';
    
    // Calculer la date d'expiration
    const expiresAt = Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000;
    
    // Mettre à jour l'abonnement via subscriptionService
    subscriptionService.updateSubscription(
      SubscriptionTier.PREMIUM,
      expiresAt,
      `dev_activation_${Date.now()}`,
      billingPeriod,
      planId
    );
    
    // Déclencher l'événement de mise à jour
    window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
      detail: { tier: SubscriptionTier.PREMIUM }
    }));
    
    console.log(`[PaymentService] Premium activé avec succès (${billingPeriod})`);
    return true;
  } catch (error) {
    console.error('[PaymentService] Erreur lors de l\'activation forcée:', error);
    return false;
  }
}

  // Créer une session de paiement
  public async createCheckoutSession(plan: SubscriptionPlan, userEmail?: string): Promise<string> {
    if (plan.tier === SubscriptionTier.FREE) {
      throw new Error('Impossible de créer une session pour un plan gratuit');
    }

    try {
      const priceId = this.getPriceId(plan);
      
      console.log(`[PaymentService] Création session: ${plan.name} - ${plan.price}€/${plan.billingPeriod === 'monthly' ? 'mois' : 'an'}`);
      console.log(`[PaymentService] Price ID: ${priceId}`);

      const response = await fetch(`${this.apiUrl}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          planId: plan.id,
          priceId: priceId,
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
      console.log('[PaymentService] Session créée:', data.sessionId);
      
      if (!data.sessionId) {
        throw new Error('Session ID manquant dans la réponse');
      }
      
      return data.sessionId;
    } catch (error) {
      console.error('[PaymentService] Erreur création session:', error);
      throw error;
    }
  }

  // Rediriger vers Stripe Checkout
  public async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      console.log('[PaymentService] Redirection vers Stripe...');
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
    } catch (error) {
      console.error('[PaymentService] Erreur redirection:', error);
      throw error;
    }
  }

  // Vérifier un paiement
  public async verifyPayment(sessionId: string): Promise<boolean> {
    try {
      console.log(`[PaymentService] Vérification paiement: ${sessionId}`);
      
      const response = await fetch(
        `${this.apiUrl}/api/payments/verify-payment?sessionId=${sessionId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[PaymentService] Erreur vérification:', response.status, errorData);
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log('[PaymentService] Résultat vérification:', data);
      
      if (data.status === 'completed') {
        console.log('[PaymentService] Paiement confirmé - Abonnement activé');
        
        // Notifier les composants de la mise à jour
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM }
        }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PaymentService] Erreur vérification paiement:', error);
      return false;
    }
  }

  // Vérifier l'abonnement actuel
  public async verifySubscription(): Promise<any> {
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

  // Vérifier l'accès à une fonctionnalité
  public async checkFeatureAccess(feature: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/check-access`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ feature })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PaymentService] Erreur vérification accès:', error);
      throw error;
    }
  }

  // Annuler un abonnement
  public async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/subscription/cancel`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur lors de l\'annulation');
      }

      const data = await response.json();
      
      if (data.success) {
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.FREE }
        }));
      }
      
      return data.success;
    } catch (error) {
      console.error('[PaymentService] Erreur annulation:', error);
      return false;
    }
  }

  // Portail client Stripe
  public async createCustomerPortalSession(): Promise<string> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/customer-portal`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/subscription`
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('[PaymentService] Erreur portail client:', error);
      throw error;
    }
  }

  // Récupérer les plans
  public getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  // Obtenir un plan par ID
  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  }

  // Calculer les économies annuelles
  public calculateYearlySavings(): { amount: number; percentage: number } {
    const monthlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
    const yearlyPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_yearly');
    
    if (!monthlyPlan || !yearlyPlan) {
      return { amount: 0, percentage: 0 };
    }

    const monthlyYearlyEquivalent = monthlyPlan.price * 12; // 4€ x 12 = 48€
    const savings = monthlyYearlyEquivalent - yearlyPlan.price; // 48€ - 40€ = 8€
    const percentage = Math.round((savings / monthlyYearlyEquivalent) * 100); // ~16%

    return { amount: savings, percentage };
  }

  // Obtenir un plan par tier et période
  public getPlanByTier(tier: SubscriptionTier, billingPeriod: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(
      plan => plan.tier === tier && plan.billingPeriod === billingPeriod
    ) || null;
  }

  // Vérifier la disponibilité du service
  public async isServiceAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Statistiques d'abonnement (admin)
  public async getSubscriptionStats(): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/api/admin/subscription-stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PaymentService] Erreur statistiques:', error);
      return null;
    }
  }
}

// Export du service
const paymentService = new PaymentService();
export default paymentService;
