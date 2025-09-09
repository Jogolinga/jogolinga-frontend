// paymentService.ts - Version complète avec distinction mensuel/annuel
import { loadStripe } from '@stripe/stripe-js';
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
  savings?: number; // Économies en euros pour l'offre annuelle
  stripePriceId?: string; // ID Stripe pour le plan
}

// Plans disponibles avec nouveaux prix
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free_plan',
    name: 'Plan Gratuit',
    description: 'Accès complet aux fonctionnalités de base',
    price: 0,
    currency: 'EUR',
    billingPeriod: 'monthly',
    features: [
      // ✅ CORRECTION: Fonctionnalités gratuites (sans exercices)
      '✅ Apprentissage de vocabulaire illimité',
      '✅ Quiz illimitées',
      '✅ Révision illimitée du vocabulaire',
      '✅ Statistiques détaillées',
      '✅ Accès aux catégories de base'
    ],
    tier: SubscriptionTier.FREE
  },
  {
    id: 'premium_monthly',
    name: 'Premium Mensuel',
    description: 'Accès aux fonctionnalités avancées avec facturation mensuelle',
    price: 3,
    currency: 'EUR',
    billingPeriod: 'monthly',
    features: [
      '✅ Toutes les fonctionnalités gratuites',
      '✨ Exercices interactifs avancés',
      '✨ Grammaire complète avancée',
      '✨ Construction de phrases interactive',
      '✨ Phrases à trous avancées',
      '✨ Analytics avancés et insights',
      '✨ Mode hors-ligne complet',
      '✨ Synchronisation Google Drive',
      '✨ Accès à toutes les catégories premium'
    ],
    tier: SubscriptionTier.PREMIUM,
    stripePriceId: process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID || 'price_monthly_3eur'
  },
  {
    id: 'premium_yearly',
    name: 'Premium Annuel',
    description: 'Accès aux fonctionnalités avancées avec facturation annuelle - Économisez 20% !',
    price: 30,
    currency: 'EUR',
    billingPeriod: 'yearly',
    features: [
      '✅ Toutes les fonctionnalités gratuites',
      '✨ Exercices interactifs avancés',
      '✨ Grammaire complète avancée',
      '✨ Construction de phrases interactive', 
      '✨ Phrases à trous avancées',
      '✨ Analytics avancés et insights',
      '✨ Mode hors-ligne complet',
      '✨ Synchronisation Google Drive',
      '✨ Accès à toutes les catégories premium',
      '🎉 Économisez 20% sur l\'année'
    ],
    tier: SubscriptionTier.PREMIUM,
    savings: 6,
    stripePriceId: process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID || 'price_yearly_30eur'
  }
];

class PaymentService {
  // URL de l'API de paiement
  private apiUrl = process.env.REACT_APP_PAYMENT_API_URL || 'http://localhost:3001/api/payments';
  
  // Clé publique Stripe
  private stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
  
  // Flag pour simuler des paiements en dev
  private simulatePayments = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_STRIPE_TEST;
  
  // Promesse Stripe pour l'initialisation
  private stripePromise: Promise<any> | null = null;

  // Initialisation de la connexion à la plateforme de paiement
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initialisation du service de paiement...');
      console.log('URL API:', this.apiUrl);
      console.log('Mode simulation:', this.simulatePayments ? 'OUI' : 'NON');
      
      // En mode simulation, pas besoin d'initialiser Stripe
      if (this.simulatePayments) {
        console.log('Mode simulation activé - pas de connexion Stripe nécessaire');
        return true;
      }
      
      // Initialiser Stripe avec la clé publique
      if (!this.stripePublicKey) {
        console.error('ERREUR: Clé publique Stripe non définie!');
        console.error('Vérifiez que REACT_APP_STRIPE_PUBLIC_KEY est définie dans votre .env');
        return false;
      }
      
      console.log('Clé publique Stripe trouvée:', this.stripePublicKey.substring(0, 10) + '...');
      this.stripePromise = loadStripe(this.stripePublicKey);
      
      // Vérifier que l'initialisation a réussi
      const stripe = await this.stripePromise;
      if (!stripe) {
        throw new Error('Impossible d\'initialiser Stripe');
      }
      
      console.log('Service de paiement Stripe initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du service de paiement:', error);
      return false;
    }
  }

  // Créer une session de paiement
  public async createCheckoutSession(plan: SubscriptionPlan, userEmail?: string): Promise<string> {
    if (this.simulatePayments) {
      // En développement, on simule une session
      console.log(`Simulation de création de session pour le plan ${plan.name} (${plan.price}€)`);
      return `sim_checkout_${Date.now()}`;
    }

    try {
      console.log(`Création d'une session pour le plan: ${plan.name} - ${plan.price}€/${plan.billingPeriod === 'monthly' ? 'mois' : 'an'}`);
      console.log(`Envoi de la requête à: ${this.apiUrl}/create-checkout-session`);
      console.log('Données envoyées:', {
        planId: plan.id,
        priceId: plan.stripePriceId,
        userEmail,
        successUrl: `${window.location.origin}/payment-success`,
        cancelUrl: `${window.location.origin}/payment-cancel`,
      });
      
      const response = await fetch(`${this.apiUrl}/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          priceId: plan.stripePriceId,
          userEmail,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/payment-cancel`,
          metadata: {
            planName: plan.name,
            planPrice: plan.price,
            billingPeriod: plan.billingPeriod,
            planId: plan.id  // 🆕 AJOUT: Inclure l'ID du plan dans les métadonnées
          }
        }),
      });

      // Vérification de la réponse HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API:', response.status, errorData);
        throw new Error(errorData.message || `Erreur ${response.status} lors de la création de la session`);
      }

      const data = await response.json();
      console.log('Réponse de l\'API:', data);
      
      if (!data.sessionId) {
        throw new Error('Session ID manquant dans la réponse');
      }
      
      return data.sessionId;
    } catch (error) {
      console.error('Erreur détaillée lors de la création de session:', error);
      throw error;
    }
  }

  // Rediriger vers la page de paiement
  public async redirectToCheckout(sessionId: string): Promise<void> {
    if (this.simulatePayments) {
      // En dev, simuler le processus avec une redirection vers une page locale
      console.log(`Simulation de redirection vers la page de paiement pour la session ${sessionId}`);
      
      // Simuler un délai pour l'expérience utilisateur
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Rediriger vers une page de succès simulée
      window.location.href = `${window.location.origin}/payment-success?session_id=${sessionId}&simulated=true`;
      return;
    }

    try {
      // En mode réel, utiliser l'API Stripe pour la redirection
      console.log('Initialisation de la redirection Stripe...');
      
      // Attendre que Stripe soit chargé
      const stripe = await this.stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe n\'est pas initialisé');
      }
      
      console.log(`Redirection Stripe pour la session: ${sessionId}`);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(`Erreur Stripe: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur lors de la redirection vers la plateforme de paiement:', error);
      
      // En cas d'erreur, essayer une redirection directe
      console.log('Tentative de redirection directe vers Stripe...');
      try {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`;
      } catch (redirectError) {
        console.error('Échec de la redirection directe:', redirectError);
        throw error;
      }
    }
  }

  // Vérifier l'état d'un paiement
  public async verifyPayment(sessionId: string): Promise<boolean> {
    if (this.simulatePayments && sessionId.startsWith('sim_checkout_')) {
      // En dev, simuler un paiement réussi après une période d'attente
      console.log(`Simulation de vérification pour la session ${sessionId}`);
      
      // Attendre un moment pour simuler le traitement en arrière-plan
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 🔧 SIMULATION : Déterminer le plan basé sur un plan par défaut (annuel)
      const defaultPlan = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_yearly');
      const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
      
      console.log("Mise à jour de l'abonnement vers PREMIUM:", SubscriptionTier.PREMIUM);
      
      // 🆕 MODIFICATION: Inclure la période de facturation et l'ID du plan
      subscriptionService.updateSubscription(
        SubscriptionTier.PREMIUM, 
        expiresAt, 
        sessionId,
        defaultPlan?.billingPeriod || 'yearly', // 🆕 AJOUT: Période de facturation
        defaultPlan?.id || 'premium_yearly' // 🆕 AJOUT: ID du plan
      );
      
      // Déclencher un événement pour notifier les composants
      try {
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM }
        }));
        console.log('[PaymentService] Événement subscriptionUpdated émis avec succès');
      } catch (error) {
        console.error('[PaymentService] Erreur lors de l\'émission de l\'événement:', error);
      }
      
      return true;
    }

    try {
      console.log(`Vérification du paiement pour la session ${sessionId}`);
      
      const response = await fetch(`${this.apiUrl}/verify-payment?sessionId=${sessionId}`);
      
      // Vérifier la réponse HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API:', response.status, errorData);
        throw new Error(errorData.message || `Erreur ${response.status} lors de la vérification du paiement`);
      }

      const data = await response.json();
      console.log('Réponse de vérification du paiement:', data);
      
      if (data.status === 'completed') {
        // Calculer la date d'expiration basée sur le type d'abonnement
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === data.planId);
        let expiresAt = Date.now();
        
        if (plan?.billingPeriod === 'monthly') {
          expiresAt += 30 * 24 * 60 * 60 * 1000; // 30 jours
        } else if (plan?.billingPeriod === 'yearly') {
          expiresAt += 365 * 24 * 60 * 60 * 1000; // 365 jours
        } else {
          expiresAt += 365 * 24 * 60 * 60 * 1000; // 365 jours par défaut
        }

        // 🔧 MODIFICATION: Inclure la période de facturation et l'ID du plan
        subscriptionService.updateSubscription(
          SubscriptionTier.PREMIUM, 
          expiresAt, 
          data.subscriptionId,
          plan?.billingPeriod || 'monthly', // 🆕 AJOUT: Période de facturation
          plan?.id || 'premium_monthly' // 🆕 AJOUT: ID du plan
        );
        
        // Déclencher un événement pour notifier les composants
        try {
          window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
            detail: { tier: SubscriptionTier.PREMIUM }
          }));
          console.log('[PaymentService] Événement subscriptionUpdated émis avec succès');
        } catch (error) {
          console.error('[PaymentService] Erreur lors de l\'émission de l\'événement:', error);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur de vérification de paiement:', error);
      
      // En mode développement, considérer le paiement comme réussi même en cas d'erreur
      if (this.simulatePayments) {
        console.log('Mode simulation: considérer le paiement comme réussi malgré l\'erreur');
        
        const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);
        
        // 🆕 MODIFICATION: Inclure la période de facturation et l'ID du plan
        subscriptionService.updateSubscription(
          SubscriptionTier.PREMIUM, 
          expiresAt, 
          sessionId,
          'yearly', // Mode simulation par défaut : annuel
          'premium_yearly' // Mode simulation par défaut : plan annuel
        );
        
        // Déclencher un événement
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM }
        }));
        
        return true;
      }
      
      return false;
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

    const monthlyYearlyEquivalent = monthlyPlan.price * 12; // 3€ x 12 = 36€
    const savings = monthlyYearlyEquivalent - yearlyPlan.price; 
    const percentage = Math.round((savings / monthlyYearlyEquivalent) * 100); 

    console.log(`Économies calculées: ${savings}€ (${percentage}%)`);
    return { amount: savings, percentage };
  }

  // Annuler un abonnement
  public async cancelSubscription(): Promise<boolean> {
    const currentSubscription = subscriptionService.getCurrentSubscription();
    
    if (!currentSubscription || !currentSubscription.paymentId) {
      console.error('Aucun abonnement actif à annuler');
      return false;
    }

    if (this.simulatePayments) {
      console.log(`Simulation d'annulation pour l'abonnement ${currentSubscription.paymentId}`);
      
      // Rétrograder l'utilisateur au niveau gratuit
      subscriptionService.updateSubscription(
        SubscriptionTier.FREE,
        null,
        'cancelled',
        'monthly',
        'free_plan'
      );
      
      // Déclencher un événement pour notifier les composants
      window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
        detail: { tier: SubscriptionTier.FREE }
      }));
      
      return true;
    }

    try {
      console.log(`Annulation de l'abonnement ${currentSubscription.paymentId}`);
      
      const response = await fetch(`${this.apiUrl}/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentSubscription.paymentId,
        }),
      });

      // Vérifier la réponse HTTP
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur API:', response.status, errorData);
        throw new Error(errorData.message || `Erreur ${response.status} lors de l'annulation de l'abonnement`);
      }

      const data = await response.json();
      console.log('Réponse d\'annulation:', data);
      
      // Rétrograder l'utilisateur au niveau gratuit
      subscriptionService.updateSubscription(
        SubscriptionTier.FREE,
        null,
        'cancelled',
        'monthly',
        'free_plan'
      );
      
      // Déclencher un événement pour notifier les composants
      window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
        detail: { tier: SubscriptionTier.FREE }
      }));
      
      return true;
    } catch (error) {
      console.error('Erreur d\'annulation d\'abonnement:', error);
      return false;
    }
  }
  
  // 🔧 MODIFICATION: Nouvelle méthode pour forcer l'activation avec choix de période
  public forceActivatePremium(duration: number = 365, billingPeriod: 'monthly' | 'yearly' = 'yearly'): void {
    console.log('[PaymentService] Activation forcée de l\'abonnement Premium');
    
    const expiresAt = Date.now() + (duration * 24 * 60 * 60 * 1000);
    const dummyPaymentId = `force_premium_${Date.now()}`;
    const planId = billingPeriod === 'monthly' ? 'premium_monthly' : 'premium_yearly';
    
    // 🔧 MODIFICATION: Inclure la période de facturation
    subscriptionService.updateSubscription(
      SubscriptionTier.PREMIUM, 
      expiresAt, 
      dummyPaymentId,
      billingPeriod, // 🆕 AJOUT: Période de facturation
      planId // 🆕 AJOUT: ID du plan
    );
    
    // Déclencher un événement pour notifier les composants
    window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
      detail: { tier: SubscriptionTier.PREMIUM }
    }));
    
    console.log('[PaymentService] Abonnement Premium activé jusqu\'au', new Date(expiresAt).toLocaleDateString());
    console.log('[PaymentService] Période de facturation:', billingPeriod);
    console.log('[PaymentService] Plan ID:', planId);
  }

  // Vérifier si on est en mode simulation
  public isSimulationMode(): boolean {
    return this.simulatePayments;
  }

  // Obtenir le plan correspondant à un tier et période de facturation
  public getPlanByTier(tier: SubscriptionTier, billingPeriod: 'monthly' | 'yearly' = 'monthly'): SubscriptionPlan | null {
    return SUBSCRIPTION_PLANS.find(
      plan => plan.tier === tier && plan.billingPeriod === billingPeriod
    ) || null;
  }

  // Vérifier si Stripe est disponible
  public async isStripeAvailable(): Promise<boolean> {
    if (this.simulatePayments) return true;
    
    try {
      const stripe = await this.stripePromise;
      return stripe !== null;
    } catch {
      return false;
    }
  }
}

// Singleton pattern pour le service de paiement
const paymentService = new PaymentService();
export default paymentService;

export {};