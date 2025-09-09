// SubscriptionModal.tsx - Version complète avec distinction mensuel/annuel + corrections superposition
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
  const [isSimulationMode, setIsSimulationMode] = useState<boolean>(
    process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_STRIPE_TEST
  );
  
  // Ref pour forcer l'affichage
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // État pour détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState<boolean>(false);

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
      console.log('🔧 Forçage de l\'affichage du modal...');
      
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
      
      console.log('✅ Styles forcés appliqués');
    }
  }, [isMobile, theme]);

  // Forcer l'affichage correct du modal en mode mobile
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 SubscriptionModal ouvert, application des corrections...');
      
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
          console.log('🔄 Re-application des styles forcés');
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

  // Ajouter un gestionnaire d'événements pour s'assurer que le modal reste au premier plan
  useEffect(() => {
    if (isOpen) {
      const handleFocus = () => {
        if (overlayRef.current) {
          forceModalDisplay();
        }
      };
      
      const handleClick = (e: MouseEvent) => {
        // Si le clic n'est pas dans le modal, le remettre au premier plan
        if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
          e.preventDefault();
          e.stopPropagation();
          forceModalDisplay();
        }
      };
      
      window.addEventListener('focus', handleFocus);
      document.addEventListener('click', handleClick, true);
      
      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [isOpen, forceModalDisplay]);

  // Chargement des données avec plan actuel
  useEffect(() => {
    if (isOpen) {
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
      
      setIsSimulationMode(
        process.env.NODE_ENV === 'development' && !process.env.REACT_APP_USE_STRIPE_TEST
      );
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
    console.log('[SubscriptionModal] Plan sélectionné:', plan.name, plan.id);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || selectedPlan.tier === SubscriptionTier.FREE) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('[SubscriptionModal] Début du processus d\'abonnement:', {
        plan: selectedPlan.name,
        planId: selectedPlan.id,
        billingPeriod: selectedPlan.billingPeriod,
        priceId: selectedPlan.stripePriceId
      });

      if (isSimulationMode) {
        console.log("[SubscriptionModal] Mode DEV détecté, simulation du paiement");
        
        // Inclure les informations du plan dans la simulation
        subscriptionService.updateSubscription(
          SubscriptionTier.PREMIUM,
          Date.now() + (selectedPlan.billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000,
          `sim_payment_${Date.now()}`,
          selectedPlan.billingPeriod,
          selectedPlan.id
        );
        
        if (onSuccess) {
          onSuccess();
        }
        
        setTimeout(() => {
          onClose();
        }, 1000);
        
        return;
      }

      const sessionId = await paymentService.createCheckoutSession(selectedPlan, userEmail);
      await paymentService.redirectToCheckout(sessionId);
      
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
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

        console.log('[SubscriptionModal] Résiliation d\'abonnement demandée');

        if (isSimulationMode) {
          // En mode simulation, résilier directement
          console.log('[SubscriptionModal] Résiliation en mode simulation');
          
          subscriptionService.updateSubscription(
            SubscriptionTier.FREE,
            null,
            'cancelled_by_user',
            'monthly',
            'free_plan'
          );
          
          setCurrentTier(SubscriptionTier.FREE);
          setCurrentPlanId('free_plan');
          
          // Sélectionner automatiquement le plan mensuel pour un éventuel re-abonnement
          const premiumMonthly = SUBSCRIPTION_PLANS.find(p => p.id === 'premium_monthly');
          setSelectedPlan(premiumMonthly || null);
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Fermer le modal après un délai
          setTimeout(() => {
            onClose();
          }, 1500);
          
        } else {
          // En mode réel, appeler l'API de résiliation
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: isMobile ? '70px 8px 15px 8px' : '80px 20px 20px 20px',
          overflowY: 'auto',
          boxSizing: 'border-box',
          opacity: 1,
          visibility: 'visible',
          pointerEvents: 'auto'
        }}
      >
        <motion.div 
          ref={modalRef}
          className="subscription-modal force-display"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'relative',
            zIndex: 2147483646,
            width: isMobile ? 'calc(100% - 16px)' : '100%',
            maxWidth: isMobile ? 'calc(100% - 16px)' : '1000px',
            margin: '0 auto',
            padding: isMobile ? '16px' : '48px',
            borderRadius: isMobile ? '12px' : '20px',
            maxHeight: isMobile ? 'calc(100vh - 85px)' : 'calc(100vh - 100px)',
            overflowY: 'auto',
            boxSizing: 'border-box',
            display: 'block',
            opacity: 1,
            visibility: 'visible',
            transform: 'none'
          }}
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
                  // Style spécial pour le plan actuel
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
                
               
                
                {plan.price > 0 ? (
                  <div className="price">
                    <span className="amount">{plan.price}</span>
                    <span className="currency">€</span>
                    <span className="period">/{plan.billingPeriod === 'monthly' ? 'mois' : 'an'}</span>
                    {/* Affichage des économies pour l'annuel */}
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
                
                {/* Bouton avec logique améliorée et gestion résiliation */}
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
                  /* Bouton spécial pour résilier vers le gratuit */
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
                    🚫 Résilier l'abonnement et repasser au plan gratuit
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
              {error}
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
                <span>Paiement sécurisé</span>
              </div>
              
              {isSimulationMode && (
                <div className="dev-mode-notice">
                  <p>Mode développement détecté - Le paiement sera simulé</p>
                </div>
              )}
              
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
                  color: theme === 'dark' ? '#d2691e' : '#8b4513',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {selectedPlan.name}
                </h4>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '24px', 
                  fontWeight: '700',
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
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SubscriptionModal;