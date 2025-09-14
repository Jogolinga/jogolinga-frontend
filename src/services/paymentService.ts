// paymentService.ts - Version intégrée avec backend Railway
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
  stripePriceId?: string;
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
    tier: SubscriptionTier.PREMIUM,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY
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
    savings: 8,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL
  }
];

class PaymentService {
  // URL de l'API backend
private apiUrl = 'https://jogolinga-backend-production.up.railway.app';


   
  // Token JWT pour l'authentification
  private authToken: string | null = null;

  constructor() {
    console.log('[PaymentService] Initialisation avec backend:', this.apiUrl);
    console.log('[PaymentService] Mode simulation:', this.simulatePayments ? 'OUI' : 'NON');
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

  // Initialisation du service (plus besoin de Stripe côté frontend)
  public async initialize(): Promise<boolean> {
    try {
      console.log('[PaymentService] Initialisation du service...');
      
      if (this.simulatePayments) {
        console.log('[PaymentService] Mode simulation activé');
        return true;
      }
      
      // Tester la connexion au backend
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
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    } else if (plan.id === 'premium_yearly') {
      return process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
    }
    return plan.stripePriceId;
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

  // Rediriger vers la page de paiement Stripe
  public async redirectToCheckout(sessionId: string): Promise<void> {
    if (this.simulatePayments) {
      console.log(`[PaymentService] Simulation de redirection vers la page de paiement pour la session ${sessionId}`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      window.location.href = `${window.location.origin}/payment-success?session_id=${sessionId}&simulated=true`;
      return;
    }

    try {
      console.log('[PaymentService] Redirection vers Stripe Checkout...');
      
      // Redirection directe vers Stripe Checkout avec l'ID de session
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      
    } catch (error) {
      console.error('[PaymentService] Erreur lors de la redirection:', error);
      throw error;
    }
  }

  // Vérifier l'état d'un paiement via le backend
  public async verifyPayment(sessionId: string): Promise<boolean> {
    if (this.simulatePayments && sessionId.startsWith('sim_checkout_')) {
      console.log(`[PaymentService] Simulation de vérification pour la session ${sessionId}`);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simuler la mise à jour d'abonnement
      const defaultPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_yearly');
      const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
      
      subscriptionService.updateSubscription(
        SubscriptionTier.PREMIUM, 
        expiresAt, 
        sessionId,
        defaultPlan?.billingPeriod || 'yearly',
        defaultPlan?.id || 'premium_yearly'
      );
      
      // Déclencher un événement pour notifier les composants
      window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
        detail: { tier: SubscriptionTier.PREMIUM }
      }));
      
      return true;
    }

    try {
      console.log(`[PaymentService] Vérification du paiement pour la session ${sessionId}`);
      
      const response = await fetch(
        `${this.apiUrl}/api/payments/verify-payment?sessionId=${sessionId}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders()
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[PaymentService] Erreur API:', response.status, errorData);
        throw new Error(errorData.error || `Erreur ${response.status} lors de la vérification du paiement`);
      }

      const data = await response.json();
      console.log('[PaymentService] Réponse de vérification du paiement:', data);
      
      if (data.status === 'completed') {
        // Le backend a déjà mis à jour l'abonnement en base
        console.log('[PaymentService] Paiement vérifié et abonnement mis à jour');
        
        // Déclencher un événement pour notifier les composants frontend
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM }
        }));
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PaymentService] Erreur de vérification de paiement:', error);
      
      if (this.simulatePayments) {
        console.log('[PaymentService] Mode simulation: considérer le paiement comme réussi malgré l\'erreur');
        return true;
      }
      
      return false;
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

  // Vérifier l'accès à une fonctionnalité via le backend
  public async checkFeatureAccess(feature: string): Promise<any> {
    if (this.simulatePayments) {
      return {
        hasAccess: true,
        isPremium: true
      };
    }

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

  // Annuler un abonnement via le backend
  public async cancelSubscription(): Promise<boolean> {
    if (this.simulatePayments) {
      console.log('[PaymentService] Simulation d\'annulation d\'abonnement');
      
      subscriptionService.updateSubscription(
        SubscriptionTier.FREE,
        null,
        'cancelled',
        'monthly',
        'free_plan'
      );
      
      window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
        detail: { tier: SubscriptionTier.FREE }
      }));
      
      return true;
    }

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
        // Déclencher un événement pour notifier les composants
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.FREE }
        }));
      }
      
      return data.success;
    } catch (error) {
      console.error('[PaymentService] Erreur d\'annulation d\'abonnement:', error);
      return false;
    }
  }

  // Créer une session du portail client Stripe
  public async createCustomerPortalSession(): Promise<string> {
    if (this.simulatePayments) {
      return `${window.location.origin}/subscription`;
    }

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

  // Obtenir le plan correspondant à un tier et période de facturation
  public getPlanByTier(tier: SubscriptionTier, billingPeriod: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(
      plan => plan.tier === tier && plan.billingPeriod === billingPeriod
    ) || null;
  }

  // Vérifier si le service est disponible
  public async isServiceAvailable(): Promise<boolean> {
    if (this.simulatePayments) return true;
    
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Activation forcée de Premium pour les tests
  public forceActivatePremium(duration: number = 365, billingPeriod: 'monthly' | 'yearly' = 'yearly'): void {
    console.log('[PaymentService] Activation forcée de l\'abonnement Premium');
    
    const expiresAt = Date.now() + (duration * 24 * 60 * 60 * 1000);
    const dummyPaymentId = `force_premium_${Date.now()}`;
    const planId = billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_yearly';
    
    subscriptionService.updateSubscription(
      SubscriptionTier.PREMIUM, 
      expiresAt, 
      dummyPaymentId,
      billingPeriod,
      planId
    );
    
    window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
      detail: { tier: SubscriptionTier.PREMIUM }
    }));
    
    console.log('[PaymentService] Abonnement Premium activé jusqu\'au', new Date(expiresAt).toLocaleDateString());
  }

  // Vérifier si on est en mode simulation
  public isSimulationMode(): boolean {
    return this.simulatePayments;
  }

  // Obtenir des statistiques d'abonnement (admin)
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
      console.error('[PaymentService] Erreur récupération statistiques:', error);
      return null;
    }
  }
}

// Singleton pattern pour le service de paiement
const paymentService = new PaymentService();
export default paymentService;
