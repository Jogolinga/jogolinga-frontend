import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { Clock, ShieldCheck } from './common/EmojiIcons';
import paymentService from '../services/paymentService';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';
import { useTheme } from './ThemeContext';
import './PaymentSuccessPage.css';

// Définition des variants d'animation pour éviter les problèmes d'ombres incompatibles
const containerVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.3 }
  }
};

// Variants pour les boutons
const buttonVariants = {
  initial: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { delay: 1.2 }
  },
  hover: { 
    scale: 1.05, 
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.95 
  }
};

// Variants pour l'icône de succès
const successIconVariants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 10,
      delay: 0.3
    }
  }
};

// Variants pour les éléments avec entrée depuis le bas
const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.2, duration: 0.5 }
  }
};

// Variants pour les listes
const listItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({ 
    opacity: 1, 
    x: 0,
    transition: { delay: 0.8 + i * 0.1 }
  })
};

const PaymentSuccessPage: React.FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [currentTier, setCurrentTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [showRedirectMessage, setShowRedirectMessage] = useState<boolean>(false);
  const [verificationAttempts, setVerificationAttempts] = useState<number>(0);

  useEffect(() => {
    // Fonction pour vérifier périodiquement le statut de l'abonnement
    const checkSubscriptionStatus = () => {
      const tier = subscriptionService.getCurrentTier();
      console.log("Vérification du statut d'abonnement:", tier);
      
      if (tier === SubscriptionTier.PREMIUM) {
        setCurrentTier(SubscriptionTier.PREMIUM);
        if (isVerifying) {
          setIsVerifying(false);
          setIsSuccess(true);
        }
        return true;
      }
      return false;
    };

    const verifyPayment = async () => {
      try {
        // Extraire le sessionId des paramètres d'URL
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');
        
        if (!sessionId) {
          console.log("Aucun session_id trouvé dans l'URL");
          setIsVerifying(false);
          setIsSuccess(false);
          return;
        }
        
        console.log(`Vérification de la session: ${sessionId}`);
        
        // Lancer le compteur pour simuler le traitement
        const interval = setInterval(() => {
          setProcessingTime(prev => {
            if (prev >= 100) {
              clearInterval(interval);
              return 100;
            }
            return prev + 5;
          });
        }, 200);
        
        // Vérifier le paiement - tentatives multiples
        let success = false;
        
        // Première tentative de vérification du paiement
        success = await paymentService.verifyPayment(sessionId);
        
        // Si la première vérification échoue, programmer des vérifications répétées
        if (!success) {
          console.log("Premier essai échoué, programmation des vérifications périodiques");
          
          // Programme une vérification toutes les 3 secondes, jusqu'à 5 fois
          const maxAttempts = 5;
          setVerificationAttempts(1); // Premier essai déjà effectué
          
          const verificationInterval = setInterval(async () => {
            setVerificationAttempts(prev => {
              const newValue = prev + 1;
              console.log(`Tentative de vérification ${newValue}/${maxAttempts}`);
              return newValue;
            });
            
            // Vérifier si l'abonnement a été mis à jour entre-temps
            const tier = subscriptionService.getCurrentTier();
            if (tier === SubscriptionTier.PREMIUM) {
              clearInterval(verificationInterval);
              setIsSuccess(true);
              setIsVerifying(false);
              return;
            }
            
            // Nouvelle tentative de vérification
            const retrySuccess = await paymentService.verifyPayment(sessionId);
            if (retrySuccess) {
              clearInterval(verificationInterval);
              success = true;
              
              // Mettre à jour l'interface
              clearInterval(interval);
              setProcessingTime(100);
              
              setTimeout(() => {
                setIsSuccess(true);
                setIsVerifying(false);
                
                // Mettre à jour le tier affiché
                const subscription = subscriptionService.getCurrentSubscription();
                if (subscription) {
                  setCurrentTier(subscription.tier);
                  
                  // Formater la date d'expiration
                  if (subscription.expiresAt) {
                    const expiryDateObj = new Date(subscription.expiresAt);
                    setExpiryDate(expiryDateObj.toLocaleDateString());
                  }
                }
              }, 500);
            }
            
            // Arrêter après un nombre maximum de tentatives
            if (verificationAttempts >= maxAttempts) {
              clearInterval(verificationInterval);
              clearInterval(interval);
              setProcessingTime(100);
              
              // Si toujours pas de succès après toutes les tentatives
              if (!success) {
                setTimeout(() => {
                  setIsSuccess(false);
                  setIsVerifying(false);
                }, 500);
              }
            }
          }, 3000);
        } else {
          // Le paiement a été vérifié avec succès dès la première tentative
          // Nettoyage et finalisation
          clearInterval(interval);
          setProcessingTime(100);
          
          // Délai pour montrer l'animation complète
          setTimeout(() => {
            setIsSuccess(true);
            
            // Mettre à jour le niveau d'abonnement affiché
            const subscription = subscriptionService.getCurrentSubscription();
            if (subscription) {
              setCurrentTier(subscription.tier);
              
              // Formater la date d'expiration
              if (subscription.expiresAt) {
                const expiryDateObj = new Date(subscription.expiresAt);
                setExpiryDate(expiryDateObj.toLocaleDateString());
              }
            }
            
            setIsVerifying(false);
          }, 500);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        setIsSuccess(false);
        setIsVerifying(false);
      }
    };
    
    // Vérifier d'abord si l'abonnement est déjà à jour
    if (checkSubscriptionStatus()) {
      console.log("Abonnement Premium déjà actif, pas besoin de vérification");
      return;
    }
    
    // Si l'abonnement n'est pas encore Premium, vérifier le paiement
    verifyPayment();
    
    // Vérification périodique de l'abonnement (toutes les 2 secondes)
    const subscriptionCheckInterval = setInterval(() => {
      if (checkSubscriptionStatus()) {
        clearInterval(subscriptionCheckInterval);
      }
    }, 2000);
    
    // Nettoyage à la destruction du composant
    return () => {
      clearInterval(subscriptionCheckInterval);
    };
  }, [location.search, isVerifying]);

  const handleContinue = () => {
    // Afficher un message de redirection
    setShowRedirectMessage(true);
    
    // Forcer la mise à jour du niveau d'abonnement avant la redirection
    const tier = subscriptionService.getCurrentTier();
    console.log("Niveau d'abonnement confirmé:", tier);
    
    // S'assurer que le localStorage est bien mis à jour
    if (String(tier).toLowerCase() === String(SubscriptionTier.PREMIUM).toLowerCase()) {
      console.log("Réinitialisation de l'abonnement premium pour s'assurer qu'il est correctement enregistré");
      const expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 an par défaut
      subscriptionService.updateSubscription(SubscriptionTier.PREMIUM, expiresAt);
      
      // Déclencher un événement pour notifier les composants
      try {
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: SubscriptionTier.PREMIUM }
        }));
        console.log('[PaymentSuccessPage] Événement subscriptionUpdated émis avant redirection');
      } catch (error) {
        console.error('[PaymentSuccessPage] Erreur lors de l\'émission de l\'événement:', error);
      }
    }
    
    // Redirection après un court délai pour montrer l'animation
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const handleRetry = () => {
    // Réinitialiser l'état pour recommencer la vérification
    setIsVerifying(true);
    setProcessingTime(0);
    setVerificationAttempts(0);
    
    // Extraire le sessionId des paramètres d'URL
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      // Forcer une nouvelle vérification
      paymentService.verifyPayment(sessionId)
        .then(success => {
          if (success) {
            // Mettre à jour l'interface
            setProcessingTime(100);
            setTimeout(() => {
              setIsSuccess(true);
              setIsVerifying(false);
              
              // Mettre à jour le niveau d'abonnement affiché
              const subscription = subscriptionService.getCurrentSubscription();
              if (subscription) {
                setCurrentTier(subscription.tier);
                
                // Formater la date d'expiration
                if (subscription.expiresAt) {
                  const expiryDateObj = new Date(subscription.expiresAt);
                  setExpiryDate(expiryDateObj.toLocaleDateString());
                }
              }
            }, 500);
          } else {
            setTimeout(() => {
              setIsSuccess(false);
              setIsVerifying(false);
            }, 500);
          }
        })
        .catch(error => {
          console.error('Erreur lors de la vérification du paiement:', error);
          setTimeout(() => {
            setIsSuccess(false);
            setIsVerifying(false);
          }, 500);
        });
    } else {
      // Si pas de sessionId, mettre directement en échec
      setTimeout(() => {
        setIsSuccess(false);
        setIsVerifying(false);
      }, 500);
    }
  };

  return (
    <div className={`payment-success-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <motion.div 
        className="success-container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {isVerifying ? (
          <div className="verifying-payment">
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${processingTime}%` }}
                ></div>
              </div>
              <span className="progress-text">{processingTime}%</span>
            </div>
            <h2>Vérification du paiement...</h2>
            <p>Veuillez patienter pendant que nous confirmons votre transaction.</p>
            {verificationAttempts > 0 && (
              <p className="verification-attempts">
                Tentative {verificationAttempts}/5
              </p>
            )}
            <div className="verify-animation">
              <ShieldCheck className="shield-icon" size={24} />
              <div className="pulse-circles">
                <div className="pulse pulse-1"></div>
                <div className="pulse pulse-2"></div>
                <div className="pulse pulse-3"></div>
              </div>
            </div>
          </div>
        ) : isSuccess ? (
          <motion.div 
            className="payment-confirmed"
            variants={fadeUpVariants}
            initial="initial"
            animate="animate"
          >
            <motion.div 
              className="success-icon"
              variants={successIconVariants}
              initial="initial"
              animate="animate"
            >
              <CheckCircle size={64} color="#10b981" />
            </motion.div>
            
            <h1>Paiement réussi !</h1>
            <p>Votre abonnement Premium est maintenant actif.</p>
            
            <motion.div 
              className="subscription-details"
              variants={fadeUpVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.5 }}
            >
              <div className="detail-item">
                <strong>Abonnement :</strong>
                <span>Premium</span>
              </div>
              
              {expiryDate && (
                <div className="detail-item">
                  <strong>Valide jusqu'au :</strong>
                  <span>{expiryDate}</span>
                </div>
              )}
              
              <div className="detail-item">
                <strong>Statut :</strong>
                <span className="status-active">
                  <div className="status-dot"></div>
                  Actif
                </span>
              </div>
            </motion.div>
            
            <motion.div 
              className="features-unlocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h3>Fonctionnalités débloquées :</h3>
              <ul>
                {[
                  "Vocabulaire illimité",
                  "Quiz illimités",
                  "Révision illimitée",
                  "Toutes les catégories",
                  "Grammaire complète",
                  "Mode hors-ligne",
                  "Synchronisation Google Drive"
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    custom={index}
                    variants={listItemVariants}
                    initial="initial"
                    animate="animate"
                  >
                    <CheckCircle size={18} className="feature-check" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
            <motion.button
              className="continue-button"
              onClick={handleContinue}
              variants={buttonVariants}
              initial="initial"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
            >
              {showRedirectMessage ? (
                "Redirection en cours..."
              ) : (
                <>
                  Commencer l'apprentissage
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            className="payment-error"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="error-icon">
              <Clock size={48} />
            </div>
            
            <h1>Paiement en attente</h1>
            <p>Votre transaction est en cours de traitement.</p>
            
            <motion.div 
              className="error-details"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p>
                Le paiement est en cours de traitement par notre système. 
                Si vous avez déjà été débité, veuillez patienter quelques instants. 
                Si le problème persiste, contactez notre service client.
              </p>
            </motion.div>
            
            <div className="error-actions">
              <motion.button
                className="try-again-button"
                onClick={handleRetry}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Vérifier à nouveau
              </motion.button>
              
              <motion.button
                className="back-to-home-button"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour à l'accueil
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccessPage;
