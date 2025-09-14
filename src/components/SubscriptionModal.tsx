// SubscriptionModal.tsx - Version minimale sans erreurs TypeScript
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
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Validation simplifiée sans messages complexes
  const validatePriceId = useCallback((plan: SubscriptionPlan): boolean => {
    if (plan.id === 'premium_monthly') {
      return !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY;
    } else if (plan.id === 'premium_yearly') {
      return !!process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_ANNUAL;
    }
    return !!plan.stripePriceId;
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

  // Chargement des données
  useEffect(() => {
    if (isOpen) {
      const tier = subscriptionService.getCurrentTier();
      const planId = subscriptionService.getCurrentPlanId();
      
      setCurrentTier(tier);
      setCurrentPlanId(planId);
      
      if (tier === SubscriptionTier.FREE) {
        const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
        setSelectedPlan(premiumMonthly || null);
      } else if (tier === SubscriptionTier.PREMIUM && planId) {
        const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        setSelectedPlan(currentPlan || null);
      }

      if (blockedFeature) {
        setFeatureTitle(getFeatureTitle(blockedFeature));
      } else {
        setFeatureTitle("");
      }
    }
  }, [isOpen, blockedFeature]);

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
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan.tier === SubscriptionTier.FREE) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validation simplifiée
      if (!validatePriceId(selectedPlan)) {
        setError('Configuration Stripe manquante. Vérifiez vos variables d\'environnement.');
        return;
      }

      if (!process.env.NEXT_PUBLIC_API_URL) {
        setError('URL de l\'API backend manquante.');
        return;
      }

      const sessionId = await paymentService.createCheckoutSession(selectedPlan, userEmail);
      await paymentService.redirectToCheckout(sessionId);
      
    } catch {
      setError('Une erreur est survenue lors du traitement de votre demande. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isPlanCurrent = (plan: SubscriptionPlan): boolean => {
    return currentTier === plan.tier && currentPlanId === plan.id;
  };

  const getButtonText = (plan: SubscriptionPlan): string => {
    if (isPlanCurrent(plan)) {
      return '✅ Votre plan actuel';
    }
    
    if (plan.tier === SubscriptionTier.FREE) {
      return 'Rester au plan gratuit';
    }
    
    return 'Sélectionner';
  };

  const getButtonClass = (plan: SubscriptionPlan): string => {
    if (isPlanCurrent(plan)) {
      return 'current-plan-button';
    }
    
    return `select-plan-button ${plan.tier === SubscriptionTier.PREMIUM ? 'premium' : ''}`;
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir résilier votre abonnement Premium ?')) {
      try {
        setIsLoading(true);
        setError(null);

        const success = await paymentService.cancelSubscription();
        
        if (success) {
          setCurrentTier(SubscriptionTier.FREE);
          setCurrentPlanId('free_plan');
          
          const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
          setSelectedPlan(premiumMonthly || null);
          
          if (onSuccess) {
            onSuccess();
          }
          
          alert('Votre abonnement a été résilié avec succès.');
          
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setError('La résiliation a échoué');
        }
        
      } catch {
        setError('Une erreur est survenue lors de la résiliation.');
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
        className={`subscription-modal-overlay ${theme === 'dark' ? 'dark-mode' : ''}`}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={handleOverlayClick}
      >
        <motion.div 
          ref={modalRef}
          className="subscription-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="modal-close-button" 
            onClick={onClose}
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
                {currentTier === SubscriptionTier.PREMIUM && currentPlanId && (
                  <div className="current-plan-notice">
                    <p>
                      🎉 Vous êtes actuellement abonné au {
                        currentPlanId === 'premium_monthly' ? 'Premium Mensuel' : 'Premium Annuel'
                      }
                    </p>
                  </div>
                )}
              </>
            )}
            
            <div className="production-notice">
              <p>🔒 Paiements sécurisés via Stripe</p>
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
            >
              <p>{error}</p>
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
              
              <div className="plan-summary">
                <h4>{selectedPlan.name}</h4>
                <p className="plan-price">
                  {selectedPlan.price}€/{selectedPlan.billingPeriod === 'monthly' ? 'mois' : 'an'}
                </p>
                {selectedPlan.billingPeriod === 'yearly' && selectedPlan.savings && (
                  <p className="savings-notice">
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
              >
                {isLoading ? (
                  <div className="loading-spinner" />
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>S'abonner maintenant</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </motion.button>
              
              <p className="terms-text">
                En vous abonnant, vous acceptez nos Conditions Générales et notre Politique de Confidentialité. 
                Vous pouvez annuler votre abonnement à tout moment.
              </p>
              
              <div className="security-info">
                <div className="security-header">
                  <span>🔒</span>
                  <span>Paiement 100% sécurisé</span>
                </div>
                <ul className="security-list">
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
    </AnimatePresence>
  );
};

export default SubscriptionModal;
