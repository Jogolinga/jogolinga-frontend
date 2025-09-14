import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  ChevronRight, 
} from 'lucide-react';
import { 
  Lock,
  CreditCard,
  ShieldCheck as ShieldIcon 
} from './common/EmojiIcons';
import paymentService, { SubscriptionPlan, SUBSCRIPTION_PLANS } from '../services/paymentService';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';
import { useTheme } from './ThemeContext';
import './SubscriptionModal.css';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
  blockedFeature?: string | null;
}

// Variants optimisés pour éviter les conflits
const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 300,
      duration: 0.3
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 20, 
    transition: { 
      duration: 0.2 
    } 
  }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userEmail,
  blockedFeature
}) => {
  const { theme } = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [featureTitle, setFeatureTitle] = useState<string>("");
  
  // Ref pour forcer l'affichage
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // État pour détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Validation complète des variables d'environnement
  const validateEnvironmentVariables = useCallback(() => {
    console.log('=== DIAGNOSTIC VARIABLES D\'ENVIRONNEMENT PRODUCTION ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('MONTHLY Price ID présent:', !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY);
    console.log('ANNUAL Price ID présent:', !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL);
    
    const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    const issues = [];
    
    if (!monthlyPriceId) {
      issues.push('❌ NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY manquant');
    }
    
    if (!annualPriceId) {
      issues.push('❌ NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL manquant');
    }
    
    if (!apiUrl) {
      issues.push('❌ NEXT_PUBLIC_API_URL manquant');
    }
    
    if (issues.length > 0) {
      console.error('Variables d\'environnement manquantes:', issues);
      return false;
    }
    
    console.log('✅ Toutes les variables d\'environnement sont présentes');
    console.log('=======================================================');
    return true;
  }, []);

  // Validation spécifique d'un plan avec messages d'erreur détaillés
  const validatePriceId = useCallback((plan: SubscriptionPlan): string => {
    let priceId: string | undefined;
    
    if (plan.id === 'premium_monthly') {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    } else if (plan.id === 'premium_yearly') {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
    } else {
      priceId = plan.stripePriceId;
    }
    
    if (!priceId) {
      const errorMessage = `Configuration manquante pour ${plan.name}

Variables d'environnement requises :
${plan.id === 'premium_monthly' ? '• NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY' : '• NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL'} (actuellement: ${priceId || 'NON DÉFINIE'})

Étapes pour corriger :
1. Créez le produit dans votre dashboard Stripe (${plan.price}€/${plan.billingPeriod === 'monthly' ? 'mois' : 'an'})
2. Copiez le Price ID (commence par "price_")
3. Ajoutez-le dans vos variables d'environnement Vercel
4. Redéployez votre application

Si le problème persiste, vérifiez que les variables sont bien synchronisées entre Vercel et votre code.`;
      
      throw new Error(errorMessage);
    }
    
    console.log(`✅ Price ID validé pour ${plan.name}: ${priceId.substring(0, 12)}...`);
    return priceId;
  }, []);

  // Détecter le mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fonction pour forcer l'affichage du modal
  const forceModalDisplay = useCallback(() => {
    if (overlayRef.current && modalRef.current) {
      // Ajouter les classes de force
      overlayRef.current.classList.add('force-display', 'modal-force-front');
      modalRef.current.classList.add('force-display');
      
      // Ajouter classe au body pour désactiver les interactions en arrière-plan
      document.body.classList.add('modal-open');
      
      // Styles inline pour garantir l'affichage
      overlayRef.current.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 2147483647 !important;
        display: flex !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
        background: rgba(0, 0, 0, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        align-items: flex-start !important;
        justify-content: center !important;
        padding: ${isMobile ? '70px 8px 15px 8px' : '80px 20px 20px 20px'} !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
      `;
      
      modalRef.current.style.cssText = `
        position: relative !important;
        z-index: 2147483646 !important;
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        transform: none !important;
        width: ${isMobile ? 'calc(100% - 16px)' : '100%'} !important;
        max-width: ${isMobile ? 'calc(100% - 16px)' : '1000px'} !important;
        margin: 0 auto !important;
        padding: ${isMobile ? '16px' : '48px'} !important;
        border-radius: ${isMobile ? '12px' : '20px'} !important;
        max-height: ${isMobile ? 'calc(100vh - 85px)' : 'calc(100vh - 100px)'} !important;
        overflow-y: auto !important;
        box-sizing: border-box !important;
        background: ${theme === 'dark' ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)'} !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8) !important;
        border: 2px solid ${theme === 'dark' ? 'rgba(139, 69, 19, 0.4)' : 'rgba(218, 165, 32, 0.4)'} !important;
        backdrop-filter: blur(15px) !important;
        color: ${theme === 'dark' ? '#f1f5f9' : '#2d1810'} !important;
      `;
    }
  }, [isMobile, theme]);

  // Forcer l'affichage correct du modal
  useEffect(() => {
    if (isOpen) {
      // Désactiver le scroll du body
      document.body.style.overflow = 'hidden';
      
      // Applications multiples pour contrer les re-renders
      forceModalDisplay();
      setTimeout(forceModalDisplay, 50);
      setTimeout(forceModalDisplay, 100);
      setTimeout(forceModalDisplay, 200);
      setTimeout(forceModalDisplay, 500);
      
      // Observer pour détecter les changements
      const observer = new MutationObserver(() => {
        if (overlayRef.current && !overlayRef.current.classList.contains('force-display')) {
          forceModalDisplay();
        }
      });
      
      if (overlayRef.current) {
        observer.observe(overlayRef.current, {
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      }
      
      return () => {
        observer.disconnect();
        document.body.style.overflow = 'unset';
        document.body.classList.remove('modal-open');
      };
    } else {
      // Nettoyage quand le modal se ferme
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
  }, [isOpen, forceModalDisplay]);

  // Chargement des données avec validation complète
  useEffect(() => {
    if (isOpen) {
      // Validation des variables d'environnement au démarrage
      const envValid = validateEnvironmentVariables();
      if (!envValid) {
        setError('Configuration incomplète. Vérifiez vos variables d\'environnement Vercel.');
      }
      
      const tier = subscriptionService.getCurrentTier();
      const planId = subscriptionService.getCurrentPlanId();
      
      setCurrentTier(tier);
      setCurrentPlanId(planId);
      
      console.log('[SubscriptionModal] État actuel:', { tier, planId });
      
      if (tier === SubscriptionTier.FREE) {
        // Si gratuit, sélectionner le plan mensuel par défaut
        const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
        setSelectedPlan(premiumMonthly || null);
      } else if (tier === SubscriptionTier.PREMIUM && planId) {
        // Si Premium, sélectionner le plan actuel
        const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        setSelectedPlan(currentPlan || null);
        console.log('[SubscriptionModal] Plan actuel sélectionné:', currentPlan?.name);
      }

      if (blockedFeature) {
        setFeatureTitle(getFeatureTitle(blockedFeature));
      } else {
        setFeatureTitle("");
      }
    }
  }, [isOpen, blockedFeature, validateEnvironmentVariables]);

  const getFeatureTitle = (feature: string): string => {
    switch(feature) {
      case 'revision_unlimited': 
      case 'revision_limited': 
        return 'Révisions illimitées';
      case 'grammar_full': return 'Grammaire complète';
      case 'sentence_construction': return 'Construction de phrases';
      case 'sentence_gap': return 'Phrases à trous';
      case 'exercise_mode': 
      case 'exercise_limited': 
        return 'Exercices illimités';
      case 'progress_stats': return 'Statistiques détaillées';
      case 'categories_full': return 'Toutes les catégories';
      default: return 'Fonctionnalité Premium';
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    console.log('[SubscriptionModal] Plan sélectionné:', plan.name, plan.id);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan.tier === SubscriptionTier.FREE) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('[SubscriptionModal] Début du processus d\'abonnement PRODUCTION:', {
        plan: selectedPlan.name,
        planId: selectedPlan.id,
        billingPeriod: selectedPlan.billingPeriod,
        price: selectedPlan.price,
        apiUrl: process.env.NEXT_PUBLIC_API_URL
      });

      // Validation du Price ID AVANT de continuer
      try {
        const validatedPriceId = validatePriceId(selectedPlan);
        console.log('✅ Price ID validé pour la requête:', validatedPriceId.substring(0, 12) + '...');
      } catch (validationError) {
        console.error('❌ Erreur de validation Price ID:', validationError);
        setError(validationError.message);
        return;
      }

      // Vérification de l'API backend
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error('URL de l\'API backend manquante (NEXT_PUBLIC_API_URL)');
      }

      console.log('🚀 Création de session de paiement Stripe via Railway...');
      console.log('📡 URL de l\'API:', process.env.NEXT_PUBLIC_API_URL);
      
      const sessionId = await paymentService.createCheckoutSession(selectedPlan, userEmail);
      console.log('✅ Session Stripe créée avec succès:', sessionId);
      
      console.log('🔗 Redirection vers Stripe Checkout...');
      await paymentService.redirectToCheckout(sessionId);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'abonnement:', error);
      
      // Messages d'erreur spécifiques selon le type d'erreur
      if (error.message.includes('Price ID manquant') || error.message.includes('Configuration manquante')) {
        setError(`Erreur de configuration Stripe : ${error.message}`);
      } else if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        setError('Erreur de connexion au serveur. Vérifiez que votre backend Railway est actif et accessible.');
      } else if (error.message.includes('Backend inaccessible')) {
        setError('Le serveur de paiement est temporairement indisponible. Veuillez réessayer dans quelques instants.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Erreur d\'authentification. Veuillez vous reconnecter.');
      } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
        setError('Données de requête invalides. Veuillez réessayer.');
      } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
        setError('Erreur interne du serveur. Notre équipe a été notifiée.');
      } else {
        setError(`Erreur inattendue : ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Vérifier si un plan est le plan actuel
  const isPlanCurrent = (plan: SubscriptionPlan): boolean => {
    return currentTier === plan.tier && currentPlanId === plan.id;
  };

  // Obtenir le texte du bouton selon l'état
  const getButtonText = (plan: SubscriptionPlan): string => {
    if (isPlanCurrent(plan)) {
      return '✅ Votre plan actuel';
    }
    
    if (plan.tier === SubscriptionTier.FREE) {
      return 'Rester au plan gratuit';
    }
    
    return 'Sélectionner';
  };

  // Obtenir la classe CSS du bouton
  const getButtonClass = (plan: SubscriptionPlan): string => {
    if (isPlanCurrent(plan)) {
      return 'current-plan-button';
    }
    
    return `select-plan-button ${plan.tier === SubscriptionTier.PREMIUM ? 'premium' : ''}`;
  };

  // Gérer la résiliation d'abonnement
  const handleCancelSubscription = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir résilier votre abonnement Premium ? Vous perdrez immédiatement l\'accès à toutes les fonctionnalités Premium.')) {
      try {
        setIsLoading(true);
        setError(null);

        console.log('[SubscriptionModal] Résiliation d\'abonnement via Railway...');

        const success = await paymentService.cancelSubscription();
        
        if (success) {
          console.log('[SubscriptionModal] Résiliation réussie');
          
          setCurrentTier(SubscriptionTier.FREE);
          setCurrentPlanId('free_plan');
          
          // Sélectionner automatiquement le plan mensuel
          const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
          setSelectedPlan(premiumMonthly || null);
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Afficher un message de confirmation
          alert('Votre abonnement a été résilié avec succès. Vous êtes maintenant sur le plan gratuit.');
          
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          throw new Error('La résiliation a échoué');
        }
        
      } catch (error) {
        console.error('Erreur lors de la résiliation:', error);
        setError('Une erreur est survenue lors de la résiliation. Veuillez réessayer ou contacter le support.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        ref={overlayRef}
        className={`subscription-modal-overlay force-display modal-force-front ${theme === 'dark' ? 'dark-mode' : ''}`}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleOverlayClick}
      >
        <motion.div 
          ref={modalRef}
          className="subscription-modal force-display"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="modal-close-button" 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: isMobile ? '12px' : '16px',
              right: isMobile ? '12px' : '16px',
              zIndex: 2147483645,
              width: isMobile ? '40px' : '44px',
              height: isMobile ? '40px' : '44px'
            }}
          >
            <X size={isMobile ? 20 : 24} />
          </button>
          
          <div className="modal-header">
            {featureTitle ? (
              <>
                <div className="blocked-feature-icon">
                  <Lock size={isMobile ? 24 : 28} />
                </div>
                <h2>Accédez à {featureTitle}</h2>
                <p>Passez à la version Premium pour débloquer cette fonctionnalité et bien plus encore.</p>
              </>
            ) : (
              <>
                <h2>Choisissez votre plan</h2>
                <p>Débloquez toutes les fonctionnalités pour un apprentissage optimal</p>
                {/* Affichage du plan actuel */}
                {currentTier === SubscriptionTier.PREMIUM && currentPlanId && (
                  <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                  }}>
                    <p style={{ 
                      color: '#10b981', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      margin: 0
                    }}>
                      🎉 Vous êtes actuellement abonné au {
                        currentPlanId === 'premium_monthly' ? 'Premium Mensuel' : 'Premium Annuel'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Indicateur de mode production */}
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '600',
                margin: 0
              }}>
                🔒 Paiements sécurisés via Stripe
              </p>
            </div>
          </div>
          
          <div className="plans-container">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <motion.div 
                key={plan.id}
                className={`plan-card ${plan.tier === SubscriptionTier.PREMIUM ? 'premium' : ''} ${selectedPlan?.id === plan.id ? 'selected' : ''} ${isPlanCurrent(plan) ? 'current' : ''}`}
                onClick={() => handleSelectPlan(plan)}
                whileHover={isMobile ? {} : { y: -5 }}
                whileTap={isMobile ? {} : { scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * SUBSCRIPTION_PLANS.indexOf(plan) }}
                style={{
                  ...(isPlanCurrent(plan) ? {
                    borderColor: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3), 0 15px 30px rgba(16, 185, 129, 0.2)'
                  } : {})
                }}
              >
                {plan.tier === SubscriptionTier.PREMIUM && (
                  <div className="premium-badge">
                    <span role="img" aria-label="Award" className="emoji-icon">🏆</span>
                    <span>Premium</span>
                  </div>
                )}
                
                <h3>{plan.name}</h3>
                
                {plan.price > 0 ? (
                  <div className="price">
                    <span className="amount">{plan.price}</span>
                    <span className="currency">€</span>
                    <span className="period">/{plan.billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
                    {plan.billingPeriod === 'yearly' && plan.savings && (
                      <span className="savings">Économisez {plan.savings}€</span>
                    )}
                  </div>
                ) : (
                  <div className="price">
                    <span className="free">Gratuit</span>
                  </div>
                )}
                
                <ul className="features">
                  {plan.features.map((feature, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <Check size={16} className="check-icon" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {isPlanCurrent(plan) ? (
                  <motion.button 
                    className="current-plan-button"
                    disabled
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    ✅ Votre plan actuel
                  </motion.button>
                ) : plan.tier === SubscriptionTier.FREE && currentTier === SubscriptionTier.PREMIUM ? (
                  <motion.button 
                    className="cancel-subscription-button"
                    onClick={() => handleCancelSubscription()}
                    disabled={isLoading}
                    whileHover={isMobile ? {} : { scale: 1.03 }}
                    whileTap={isMobile ? {} : { scale: 0.97 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: '#ef4444',
                      borderColor: '#ef4444',
                      color: 'white'
                    }}
                  >
                    🚫 Résilier l'abonnement
                  </motion.button>
                ) : (
                  <motion.button 
                    className={getButtonClass(plan)}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading}
                    whileHover={isMobile ? {} : { scale: 1.03 }}
                    whileTap={isMobile ? {} : { scale: 0.97 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {getButtonText(plan)}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '20px',
                whiteSpace: 'pre-line'
              }}
            >
              <p style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>
                {error}
              </p>
            </motion.div>
          )}
          
          {selectedPlan && selectedPlan.tier === SubscriptionTier.PREMIUM && !isPlanCurrent(selectedPlan) && (
            <motion.div 
              className="checkout-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="secure-payment">
                <ShieldIcon size={16} />
                <span>Paiement sécurisé via Stripe</span>
              </div>
              
              {/* Résumé du plan sélectionné */}
              <div style={{
                background: 'rgba(210, 105, 30, 0.1)',
                border: '1px solid rgba(210, 105, 30, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  color: theme === 'dark' ? '#f1f5f9' : '#2d1810'
                }}>
                  {selectedPlan.price}€/{selectedPlan.billingPeriod === 'monthly' ? 'mois' : 'an'}
                </p>
                {selectedPlan.billingPeriod === 'yearly' && selectedPlan.savings && (
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#10b981',
                    fontWeight: '600'
                  }}>
                    💰 Vous économisez {selectedPlan.savings}€ par rapport au plan mensuel !
                  </p>
                )}
              </div>
              
              <motion.button
                className="subscribe-button"
                onClick={handleSubscribe}
                disabled={isLoading}
                whileHover={isMobile ? {} : { scale: 1.05 }}
                whileTap={isMobile ? {} : { scale: 0.95 }}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #d2691e 0%, #8b4513 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(210, 105, 30, 0.3)'
                }}
              >
                {isLoading ? (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>S'abonner maintenant</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </motion.button>
              
              <p style={{
                textAlign: 'center',
                fontSize: '12px',
                color: theme === 'dark' ? '#94a3b8' : '#64748b',
                marginTop: '16px',
                lineHeight: '1.5'
              }}>
                En vous abonnant, vous acceptez nos Conditions Générales et notre Politique de Confidentialité. 
                Vous pouvez annuler votre abonnement à tout moment via votre compte.
              </p>
              
              {/* Informations supplémentaires pour rassurer */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🔒</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                    Paiement 100% sécurisé
                  </span>
                </div>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px', 
                  fontSize: '12px', 
                  color: theme === 'dark' ? '#94a3b8' : '#64748b',
                  lineHeight: '1.4'
                }}>
                  <li>Traitement sécurisé par Stripe</li>
                  <li>Aucune donnée bancaire stockée</li>
                  <li>Annulation possible à tout moment</li>
                  <li>Facture envoyée par email</li>
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Ajout du CSS pour l'animation de rotation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default SubscriptionModal;
