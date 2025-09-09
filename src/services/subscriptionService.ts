// subscriptionService.ts - Version complète avec distinction mensuel/annuel

// Énumération des tiers d'abonnement
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium'
}

// Interface pour la structure d'abonnement
export interface Subscription {
  tier: SubscriptionTier;
  features: string[];
  startDate: number;
  expiresAt: number | null;
  paymentId: string;
  billingPeriod?: 'monthly' | 'yearly'; // 🆕 AJOUT: Période de facturation
  planId?: string; // 🆕 AJOUT: ID du plan (premium_monthly, premium_yearly, free_plan)
}

// Interface pour les données utilisateur
export interface UserSubscriptionData {
  userId: string;
  subscription: Subscription;
  paymentHistory: Array<{
    date: number;
    amount: number;
    plan: string;
    status: string;
  }>;
}

class SubscriptionService {
  private userId: string = 'default_user';
  private currentSubscription: Subscription | null = null;

  constructor() {
    this.loadSubscriptionFromStorage();
  }

  // Charger l'abonnement depuis le localStorage
  private loadSubscriptionFromStorage(): void {
    try {
      const stored = localStorage.getItem('user_subscription');
      if (stored) {
        const userData: UserSubscriptionData = JSON.parse(stored);
        this.currentSubscription = userData.subscription;
        
        // 🆕 MIGRATION: Ajouter les nouveaux champs si ils n'existent pas
        if (!this.currentSubscription.billingPeriod) {
          this.currentSubscription.billingPeriod = 'monthly'; // Par défaut mensuel
        }
        if (!this.currentSubscription.planId) {
          // Déterminer le planId basé sur le tier et la période
          if (this.currentSubscription.tier === SubscriptionTier.PREMIUM) {
            this.currentSubscription.planId = this.currentSubscription.billingPeriod === 'yearly' 
              ? 'premium_yearly' 
              : 'premium_monthly';
          } else {
            this.currentSubscription.planId = 'free_plan';
          }
        }
        
        console.log('[SubscriptionService] Abonnement chargé:', {
          tier: this.currentSubscription.tier,
          billingPeriod: this.currentSubscription.billingPeriod,
          planId: this.currentSubscription.planId,
          expiresAt: this.currentSubscription.expiresAt 
            ? new Date(this.currentSubscription.expiresAt).toLocaleDateString() 
            : 'Jamais'
        });
      } else {
        // Initialiser avec un abonnement gratuit par défaut
        this.initializeFreeSubscription();
      }
    } catch (error) {
      console.error('[SubscriptionService] Erreur lors du chargement:', error);
      this.initializeFreeSubscription();
    }
  }

  // Initialiser un abonnement gratuit par défaut
  private initializeFreeSubscription(): void {
    this.currentSubscription = {
      tier: SubscriptionTier.FREE,
      features: this.getFeaturesByTier(SubscriptionTier.FREE),
      startDate: Date.now(),
      expiresAt: null,
      paymentId: 'free_plan',
      billingPeriod: 'monthly', // 🆕 AJOUT: Par défaut mensuel
      planId: 'free_plan' // 🆕 AJOUT: ID du plan gratuit
    };
    console.log('[SubscriptionService] Abonnement gratuit initialisé');
  }

  // Obtenir les fonctionnalités par tier
  private getFeaturesByTier(tier: SubscriptionTier): string[] {
  switch (tier) {
    case SubscriptionTier.FREE:
      return [
        // ✅ CORRECTION: Features gratuites ILLIMITÉES
        'learn_unlimited',      // ✅ Apprentissage illimité
        'quiz_unlimited',       // ✅ Quiz illimité  
        'revision_unlimited',   // ✅ Révision illimitée
        'progress_stats',       // ✅ Statistiques gratuites
        'categories_basic'      // ✅ Accès aux catégories de base
        // ❌ exercise_unlimited RETIRÉ - maintenant Premium uniquement
      ];
    case SubscriptionTier.PREMIUM:
      return [
        'learn_unlimited',
        'quiz_unlimited', 
        'revision_unlimited',
        'exercise_unlimited',    // ✅ Exercices maintenant Premium uniquement
        'progress_stats',         // ✅ Aussi disponible en gratuit
        'categories_full',        // ✅ Toutes les catégories
        'grammar_full',           // ❌ Premium uniquement
        'sentence_construction',  // ❌ Premium uniquement
        'sentence_gap',          // ❌ Premium uniquement  
        'exercise_mode',         // ❌ Premium uniquement
        'offline_mode',          // ❌ Premium uniquement
        'progress_stats_advanced', // ✅ NOUVEAU: Stats avancées Premium
        'google_drive_sync'      // ❌ Premium uniquement
      ];
    default:
      return [];
  }
}

  // 🔧 MODIFICATION: Méthode updateSubscription avec nouveaux paramètres
  public updateSubscription(
    tier: SubscriptionTier, 
    expiresAt?: number | null, 
    paymentId?: string,
    billingPeriod?: 'monthly' | 'yearly', // 🆕 AJOUT
    planId?: string // 🆕 AJOUT
  ): void {
    try {
      const now = Date.now();
      
      const subscription: Subscription = {
        tier,
        features: this.getFeaturesByTier(tier),
        startDate: now,
        expiresAt: expiresAt || null,
        paymentId: paymentId || `local_${now}`,
        billingPeriod: billingPeriod || 'monthly', // 🆕 AJOUT: Par défaut mensuel
        planId: planId || (tier === SubscriptionTier.PREMIUM ? 'premium_monthly' : 'free_plan') // 🆕 AJOUT
      };

      const userData: UserSubscriptionData = {
        userId: this.userId,
        subscription,
        paymentHistory: this.getPaymentHistory()
      };

      localStorage.setItem('user_subscription', JSON.stringify(userData));
      this.currentSubscription = subscription;

      console.log(`[SubscriptionService] Abonnement mis à jour:`, {
        tier,
        billingPeriod: subscription.billingPeriod,
        planId: subscription.planId,
        expiresAt: expiresAt ? new Date(expiresAt).toLocaleDateString() : 'Jamais'
      });
    } catch (error) {
      console.error('[SubscriptionService] Erreur lors de la mise à jour:', error);
    }
  }

  // Obtenir l'abonnement actuel
  public getCurrentSubscription(): Subscription | null {
    return this.currentSubscription;
  }

  // Obtenir le tier actuel
  public getCurrentTier(): SubscriptionTier {
    if (!this.currentSubscription) {
      return SubscriptionTier.FREE;
    }

    // Vérifier l'expiration pour les abonnements Premium
    if (this.currentSubscription.tier === SubscriptionTier.PREMIUM && 
        this.currentSubscription.expiresAt && 
        Date.now() > this.currentSubscription.expiresAt) {
      console.log('[SubscriptionService] Abonnement Premium expiré, retour au plan gratuit');
      this.updateSubscription(
        SubscriptionTier.FREE,
        null,
        'expired',
        'monthly',
        'free_plan'
      );
      return SubscriptionTier.FREE;
    }

    return this.currentSubscription.tier;
  }

  // 🆕 NOUVELLE MÉTHODE: Obtenir la période de facturation actuelle
  public getCurrentBillingPeriod(): 'monthly' | 'yearly' | null {
    const subscription = this.getCurrentSubscription();
    return subscription?.billingPeriod || null;
  }

  // 🆕 NOUVELLE MÉTHODE: Obtenir l'ID du plan actuel
  public getCurrentPlanId(): string | null {
    const subscription = this.getCurrentSubscription();
    return subscription?.planId || null;
  }

  // 🆕 NOUVELLE MÉTHODE: Vérifier si l'utilisateur a un plan spécifique
  public hasSpecificPlan(planId: string): boolean {
    const currentPlanId = this.getCurrentPlanId();
    return currentPlanId === planId;
  }

  // 🆕 NOUVELLE MÉTHODE: Obtenir les informations détaillées du plan actuel
  public getCurrentPlanInfo(): { tier: SubscriptionTier; planId: string; billingPeriod: string; expiresAt: Date | null } {
    const subscription = this.getCurrentSubscription();
    if (!subscription) {
      return {
        tier: SubscriptionTier.FREE,
        planId: 'free_plan',
        billingPeriod: 'monthly',
        expiresAt: null
      };
    }

    return {
      tier: subscription.tier,
      planId: subscription.planId || 'free_plan',
      billingPeriod: subscription.billingPeriod || 'monthly',
      expiresAt: subscription.expiresAt ? new Date(subscription.expiresAt) : null
    };
  }

  // Vérifier si une fonctionnalité est disponible
  public hasFeature(feature: string): boolean {
    if (!this.currentSubscription) {
      return false;
    }

    const currentTier = this.getCurrentTier();
    if (currentTier === SubscriptionTier.FREE) {
      return false; // En mode gratuit, les fonctionnalités premium ne sont pas disponibles
    }

    return this.currentSubscription.features.includes(feature);
  }

  // Obtenir toutes les fonctionnalités disponibles pour l'utilisateur actuel
  public getAvailableFeatures(): string[] {
    const currentTier = this.getCurrentTier();
    return this.getFeaturesByTier(currentTier);
  }

  // Vérifier si l'abonnement est expiré
  public isSubscriptionExpired(): boolean {
    if (!this.currentSubscription || !this.currentSubscription.expiresAt) {
      return false; // Les abonnements gratuits n'expirent pas
    }

    return Date.now() > this.currentSubscription.expiresAt;
  }

  // Obtenir le nombre de jours restants pour l'abonnement Premium
  public getDaysRemaining(): number | null {
    if (!this.currentSubscription || 
        this.currentSubscription.tier !== SubscriptionTier.PREMIUM || 
        !this.currentSubscription.expiresAt) {
      return null;
    }

    const now = Date.now();
    const expiresAt = this.currentSubscription.expiresAt;
    
    if (now >= expiresAt) {
      return 0; // Expiré
    }

    const diffMs = expiresAt - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Obtenir l'historique des paiements
  public getPaymentHistory(): Array<{ date: number; amount: number; plan: string; status: string; }> {
    try {
      const stored = localStorage.getItem('user_subscription');
      if (stored) {
        const userData: UserSubscriptionData = JSON.parse(stored);
        return userData.paymentHistory || [];
      }
    } catch (error) {
      console.error('[SubscriptionService] Erreur lors de la récupération de l\'historique:', error);
    }
    return [];
  }

  // Ajouter un paiement à l'historique
  public addPaymentToHistory(amount: number, plan: string, status: string = 'completed'): void {
    try {
      const currentHistory = this.getPaymentHistory();
      const newPayment = {
        date: Date.now(),
        amount,
        plan,
        status
      };

      currentHistory.push(newPayment);

      // Garder seulement les 50 derniers paiements
      const limitedHistory = currentHistory.slice(-50);

      const userData: UserSubscriptionData = {
        userId: this.userId,
        subscription: this.currentSubscription!,
        paymentHistory: limitedHistory
      };

      localStorage.setItem('user_subscription', JSON.stringify(userData));
      
      console.log('[SubscriptionService] Paiement ajouté à l\'historique:', newPayment);
    } catch (error) {
      console.error('[SubscriptionService] Erreur lors de l\'ajout du paiement:', error);
    }
  }

  // Réinitialiser l'abonnement (pour les tests)
  public resetSubscription(): void {
    localStorage.removeItem('user_subscription');
    this.initializeFreeSubscription();
    console.log('[SubscriptionService] Abonnement réinitialisé');
  }

  // 🆕 NOUVELLE MÉTHODE: Migrer d'un plan à un autre
  public changePlan(newPlanId: string, billingPeriod: 'monthly' | 'yearly'): void {
    if (!this.currentSubscription) {
      console.error('[SubscriptionService] Aucun abonnement actuel pour changer de plan');
      return;
    }

    // Calculer la nouvelle date d'expiration basée sur la période
    let newExpiresAt = this.currentSubscription.expiresAt;
    if (this.currentSubscription.tier === SubscriptionTier.PREMIUM) {
      const now = Date.now();
      if (billingPeriod === 'monthly') {
        newExpiresAt = now + (30 * 24 * 60 * 60 * 1000); // 30 jours
      } else if (billingPeriod === 'yearly') {
        newExpiresAt = now + (365 * 24 * 60 * 60 * 1000); // 365 jours
      }
    }

    this.updateSubscription(
      this.currentSubscription.tier,
      newExpiresAt,
      `plan_change_${Date.now()}`,
      billingPeriod,
      newPlanId
    );

    console.log(`[SubscriptionService] Plan changé vers: ${newPlanId} (${billingPeriod})`);
  }

  // 🆕 NOUVELLE MÉTHODE: Obtenir le statut de l'abonnement pour l'affichage
  public getSubscriptionStatus(): {
    tier: SubscriptionTier;
    planName: string;
    isActive: boolean;
    daysRemaining: number | null;
    expiresAt: Date | null;
    billingPeriod: string;
  } {
    const planInfo = this.getCurrentPlanInfo();
    const daysRemaining = this.getDaysRemaining();
    const isExpired = this.isSubscriptionExpired();

    let planName = 'Plan Gratuit';
    if (planInfo.tier === SubscriptionTier.PREMIUM) {
      planName = planInfo.billingPeriod === 'yearly' ? 'Premium Annuel' : 'Premium Mensuel';
    }

    return {
      tier: planInfo.tier,
      planName,
      isActive: planInfo.tier === SubscriptionTier.PREMIUM && !isExpired,
      daysRemaining,
      expiresAt: planInfo.expiresAt,
      billingPeriod: planInfo.billingPeriod
    };
  }

  // 🆕 NOUVELLE MÉTHODE: Vérifier si l'utilisateur peut accéder à une fonctionnalité
  public canAccessFeature(feature: string): { allowed: boolean; reason?: string } {
    const currentTier = this.getCurrentTier();
    
    // Vérifier si l'abonnement est expiré
    if (this.isSubscriptionExpired()) {
      return {
        allowed: false,
        reason: 'Votre abonnement Premium a expiré. Renouvelez pour continuer à utiliser cette fonctionnalité.'
      };
    }

    // Vérifier si la fonctionnalité est disponible pour le tier actuel
    if (!this.hasFeature(feature)) {
      if (currentTier === SubscriptionTier.FREE) {
        return {
          allowed: false,
          reason: 'Cette fonctionnalité est réservée aux abonnés Premium. Passez à Premium pour y accéder.'
        };
      }
    }

    return { allowed: true };
  }

  // Debug: Afficher l'état complet de l'abonnement
  public debugSubscriptionState(): void {
    console.log('[SubscriptionService] État complet de l\'abonnement:', {
      currentSubscription: this.currentSubscription,
      currentTier: this.getCurrentTier(),
      currentPlanId: this.getCurrentPlanId(),
      currentBillingPeriod: this.getCurrentBillingPeriod(),
      isExpired: this.isSubscriptionExpired(),
      daysRemaining: this.getDaysRemaining(),
      availableFeatures: this.getAvailableFeatures(),
      paymentHistory: this.getPaymentHistory(),
      subscriptionStatus: this.getSubscriptionStatus()
    });
  }
}

// Singleton pattern pour le service d'abonnement
const subscriptionService = new SubscriptionService();
export default subscriptionService;

// Exposer le service dans window pour le debugging
if (typeof window !== 'undefined') {
  (window as any).subscriptionService = subscriptionService;
}