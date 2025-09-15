// paymentService.ts - Version OPTION 1 avec Stripe loadStripe
import subscriptionService, { SubscriptionTier } from './subscriptionService';
import { loadStripe, Stripe } from '@stripe/stripe-js'; // ← NOUVEAU IMPORT

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
    stripePriceId: process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY
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
    stripePriceId: process.env.REACT_APP_STRIPE_PRICE_ID_ANNUAL
  }
];

class PaymentService {
  // URL de l'API backend
  private apiUrl = process.env.REACT_APP_API_URL;
  
  // Token JWT pour l'authentification
  private authToken: string | null = null;

  // ← NOUVEAU : Instance Stripe Promise
  private stripePromise: Promise<Stripe | null>;

  constructor() {
    console.log('=== INITIALIZATION PAYMENTSERVICE ===');
    console.log('[PaymentService] Initialisation avec backend:', this.apiUrl);
    console.log('[PaymentService] NODE_ENV:', process.env.NODE_ENV);
    
    // Lister toutes les variables d'environnement qui commencent par REACT_APP_
    Object.keys(process.env).forEach(key => {
      if (key.startsWith('REACT_APP_')) {
        console.log(`[PaymentService] ${key}:`, process.env[key]);
      }
    });
    
    console.log('[PaymentService] Variables Stripe spécifiques:');
    console.log('[PaymentService] REACT_APP_STRIPE_PUBLISHABLE_KEY:', process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + '...');
    console.log('[PaymentService] REACT_APP_STRIPE_PRICE_ID_MONTHLY:', process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY);
    console.log('[PaymentService] REACT_APP_STRIPE_PRICE_ID_ANNUAL:', process.env.REACT_APP_STRIPE_PRICE_ID_ANNUAL);
    console.log('[PaymentService] REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

    // ← NOUVEAU : Initialiser Stripe avec la clé publique
    const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('❌ REACT_APP_STRIPE_PUBLISHABLE_KEY manquante !');
      console.error('   Ajoutez cette variable dans vos paramètres Vercel');
    } else {
      console.log('✅ Clé publique Stripe trouvée:', publishableKey.substring(0, 12) + '...');
    }
    
    this.stripePromise = loadStripe(publishableKey!);
    console.log('✅ Stripe Promise initialisée');
    console.log('=====================================');
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

  // ← MODIFIÉ : Initialisation du service avec vérification Stripe
  public async initialize(): Promise<boolean> {
    try {
      console.log('[PaymentService] Initialisation du service...');
      console.log('[PaymentService] URL API utilisée:', this.apiUrl);
      
      if (!this.apiUrl) {
        console.error('[PaymentService] ERREUR: apiUrl est undefined');
        return false;
      }
      
      // Tester la connexion au backend
      const healthUrl = `${this.apiUrl}/api/health`;
      console.log('[PaymentService] Test de connexion vers:', healthUrl);
      
      const response = await fetch(healthUrl);
      console.log('[PaymentService] Réponse du health check:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Backend inaccessible: ${response.status}`);
      }
      
      // ← NOUVEAU : Vérifier que Stripe est chargé
      console.log('[PaymentService] Vérification du chargement de Stripe...');
      const stripe = await this.stripePromise;
      if (!stripe) {
        console.error('❌ Stripe n\'a pas pu être chargé');
        console.error('   Vérifiez votre REACT_APP_STRIPE_PUBLISHABLE_KEY');
        return false;
      }
      console.log('✅ Stripe chargé avec succès');
      
      console.log('[PaymentService] Service initialisé avec succès');
      return true;
    } catch (error) {
      console.error('[PaymentService] Erreur d\'initialisation:', error);
      return false;
    }
  }

  // Récupérer dynamiquement le price ID correct avec logs détaillés
  private getActualPriceId(plan: SubscriptionPlan): string | undefined {
    console.log('=== GET ACTUAL PRICE ID ===');
    console.log('Plan demandé:', plan.id, plan.name);
    
    let priceId: string | undefined;
    
    if (plan.id === 'premium_monthly') {
      priceId = process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY;
      console.log('Prix mensuel depuis env:', priceId);
    } else if (plan.id === 'premium_yearly') {
      priceId = process.env.REACT_APP_STRIPE_PRICE_ID_ANNUAL;
      console.log('Prix annuel depuis env:', priceId);
    } else {
      priceId = plan.stripePriceId;
      console.log('Prix depuis plan.stripePriceId:', priceId);
    }
    
    console.log('Price ID final:', priceId);
    console.log('Est valide (!!priceId):', !!priceId);
    console.log('==========================');
    
    return priceId;
  }

  // Créer une session de paiement via le backend avec logs détaillés
  public async createCheckoutSession(plan: SubscriptionPlan, userEmail?: string): Promise<string> {
    console.log('=== CREATE CHECKOUT SESSION ===');
    console.log('Plan reçu:', {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      billingPeriod: plan.billingPeriod,
      stripePriceId: plan.stripePriceId
    });
    console.log('Email utilisateur:', userEmail);
    
    try {
      const actualPriceId = this.getActualPriceId(plan);
      
      console.log(`[PaymentService] Création d'une session pour le plan: ${plan.name} - ${plan.price}€/${plan.billingPeriod === 'monthly' ? 'mois' : 'an'}`);
      console.log('[PaymentService] Price ID récupéré:', actualPriceId);
      
      if (!actualPriceId) {
        console.error('[PaymentService] ERREUR: Price ID manquant pour le plan', plan.name);
        console.error('[PaymentService] Variables d\'environnement actuelles:');
        console.error('[PaymentService] MONTHLY:', process.env.REACT_APP_STRIPE_PRICE_ID_MONTHLY);
        console.error('[PaymentService] ANNUAL:', process.env.REACT_APP_STRIPE_PRICE_ID_ANNUAL);
        throw new Error(`Price ID manquant pour le plan ${plan.name}. Vérifiez vos variables d'environnement.`);
      }
      
      const requestBody = {
        planId: plan.id,
        priceId: actualPriceId,
        userEmail,
        metadata: {
          planName: plan.name,
          planPrice: plan.price,
          billingPeriod: plan.billingPeriod,
          planId: plan.id
        }
      };
      
      console.log('[PaymentService] Corps de la requête:', JSON.stringify(requestBody, null, 2));
      
      const url = `${this.apiUrl}/api/payments/create-checkout-session`;
      console.log('[PaymentService] URL de la requête:', url);
      
      const headers = this.getAuthHeaders();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      console.log('[PaymentService] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        console.log('[PaymentService] Tentative de lecture du body d\'erreur...');
        const errorData = await response.json().catch((err) => {
          console.log('[PaymentService] Impossible de parser le JSON d\'erreur:', err);
          return {};
        });
        console.error('[PaymentService] Erreur API:', response.status, errorData);
        throw new Error(errorData.error || `Erreur ${response.status} lors de la création de la session`);
      }

      const data = await response.json();
      console.log('[PaymentService] Réponse de l\'API:', data);
      
      if (!data.sessionId) {
        console.error('[PaymentService] ERREUR: Session ID manquant dans la réponse');
        console.error('[PaymentService] Données reçues:', data);
        throw new Error('Session ID manquant dans la réponse');
      }
      
      console.log('[PaymentService] Session créée avec succès:', data.sessionId);
      console.log('===============================');
      return data.sessionId;
    } catch (error) {
      console.error('[PaymentService] Erreur lors de la création de session:', error);
      console.error('[PaymentService] Stack trace:', error instanceof Error ? error.stack : 'Pas de stack');
      console.error('===============================');
      throw error;
    }
  }

  // ← MODIFIÉ : Nouvelle méthode de redirection avec l'API Stripe officielle
  public async redirectToCheckout(sessionId: string): Promise<void> {
    try {
      console.log('🚀 [PaymentService] Redirection vers Stripe Checkout...');
      console.log('🆔 [PaymentService] Session ID:', sessionId);
      
      // Attendre que Stripe soit chargé
      console.log('⏳ [PaymentService] Chargement de Stripe...');
      const stripe = await this.stripePromise;
      
      if (!stripe) {
        console.error('❌ [PaymentService] Stripe n\'a pas pu être chargé');
        console.error('   Vérifiez votre REACT_APP_STRIPE_PUBLISHABLE_KEY');
        throw new Error('Stripe n\'est pas disponible. Vérifiez votre configuration.');
      }

      console.log('✅ [PaymentService] Stripe chargé avec succès');
      console.log('🔄 [PaymentService] Redirection en cours...');
      
      // Utiliser l'API officielle Stripe au lieu de la redirection manuelle
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        console.error('❌ [PaymentService] Erreur Stripe lors de la redirection:', error);
        throw new Error(`Erreur Stripe: ${error.message}`);
      }

      // Si on arrive ici, c'est qu'il y a eu un problème (normalement on est redirigé)
      console.log('⚠️ [PaymentService] Aucune redirection effectuée - cela pourrait indiquer un problème');
      
    } catch (error) {
      console.error('💥 [PaymentService] Erreur lors de la redirection:', error);
      throw error;
    }
  }

  // ← NOUVEAU : Méthode combinée mise à jour
  public async createCheckoutSessionAndRedirect(plan: SubscriptionPlan, userEmail?: string): Promise<void> {
    try {
      console.log('🎯 [PaymentService] Début du processus de paiement complet');
      
      // 1. Créer la session via le backend
      console.log('📝 [PaymentService] Étape 1: Création de la session...');
      const sessionId = await this.createCheckoutSession(plan, userEmail);
      
      // 2. Rediriger avec l'API Stripe officielle
      console.log('🚀 [PaymentService] Étape 2: Redirection vers Stripe...');
      await this.redirectToCheckout(sessionId);
      
      console.log('✅ [PaymentService] Processus terminé avec succès');
      
    } catch (error) {
      console.error('💥 [PaymentService] Erreur dans le processus complet:', error);
      throw error;
    }
  }

  // Vérifier l'état d'un paiement via le backend
  public async verifyPayment(sessionId: string): Promise<boolean> {
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
        
        // Déclencher un événement pour notifier les composants
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM, planId: data.planId }
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PaymentService] Erreur vérification paiement:', error);
      return false;
    }
  }

  // Annuler un abonnement
  public async cancelSubscription(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/payments/cancel-subscription`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
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
