import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, ReducedMotion } from 'framer-motion';
import './XPAnimation.css';

interface XPAnimationProps {
  xpGained: number;
  showAnimation: boolean;
  onAnimationComplete?: () => void;
  variant?: 'default' | 'large' | 'compact';
  className?: string;
}

const XPAnimation: React.FC<XPAnimationProps> = ({
  xpGained,
  showAnimation,
  onAnimationComplete,
  variant = 'default',
  className = ''
}) => {
  const [currentXP, setCurrentXP] = useState(0);
  const [showBurst, setShowBurst] = useState(false);

  // Détection de l'environnement mobile pour optimiser les animations
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768 || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
  }, []);

  // Réduire le nombre de particules sur mobile pour les performances
  const particleCount = useMemo(() => {
    if (isMobile) {
      return variant === 'compact' ? 3 : 4;
    }
    return variant === 'compact' ? 4 : 6;
  }, [isMobile, variant]);

  const burstParticleCount = useMobile ? 6 : 8;

  useEffect(() => {
    if (showAnimation && xpGained > 0) {
      // Animation progressive du compteur XP - plus rapide sur mobile
      const baseDuration = isMobile ? 1500 : 2000;
      const duration = Math.min(baseDuration, Math.max(800, xpGained * 40));
      const steps = Math.min(isMobile ? 40 : 60, xpGained);
      const stepDuration = duration / steps;
      const stepValue = xpGained / steps;

      let currentStep = 0;
      
      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.round(stepValue * currentStep);
        setCurrentXP(Math.min(newValue, xpGained));

        if (currentStep >= steps) {
          clearInterval(timer);
          setCurrentXP(xpGained);
          
          // Déclencher l'effet burst à la fin - plus court sur mobile
          setShowBurst(true);
          setTimeout(() => {
            setShowBurst(false);
            onAnimationComplete?.();
          }, isMobile ? 600 : 800);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [showAnimation, xpGained, onAnimationComplete, isMobile]);

  // Animations réduites sur mobile pour les performances
  const containerVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.9, 
      y: isMobile ? 10 : 20 
    },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      y: isMobile ? -10 : -20 
    }
  };

  const burstAnimation = {
    initial: { scale: 0, opacity: 1 },
    animate: { 
      scale: isMobile ? 1.5 : 2, 
      opacity: 0 
    },
    exit: { opacity: 0 }
  };

  const iconAnimation = showBurst ? {
    scale: [1, isMobile ? 1.2 : 1.3, 1],
    rotate: [0, 8, -8, 0]
  } : {};

  const counterAnimation = showBurst ? {
    scale: [1, isMobile ? 1.15 : 1.2, 1],
    color: ["#4f46e5", "#fbbf24", "#4f46e5"]
  } : {};

  if (!showAnimation || xpGained === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className={`xp-animation-container ${variant} ${className}`}
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ 
            duration: isMobile ? 0.4 : 0.5, 
            type: "spring", 
            bounce: isMobile ? 0.3 : 0.4 
          }}
        >
          {/* Effet de burst en arrière-plan */}
          <AnimatePresence>
            {showBurst && (
              <motion.div
                className="xp-burst-container"
                variants={burstAnimation}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ 
                  duration: isMobile ? 0.6 : 0.8, 
                  ease: "easeOut" 
                }}
              >
                {[...Array(burstParticleCount)].map((_, i) => {
                  const angle = (i * 360) / burstParticleCount;
                  const distance = isMobile ? 30 : 40;
                  
                  return (
                    <motion.div
                      key={i}
                      className="xp-burst-particle"
                      initial={{
                        scale: 0,
                        x: 0,
                        y: 0,
                        rotate: angle
                      }}
                      animate={{
                        scale: 1,
                        x: Math.cos((angle * Math.PI) / 180) * distance,
                        y: Math.sin((angle * Math.PI) / 180) * distance,
                        rotate: angle + 180
                      }}
                      transition={{
                        duration: isMobile ? 0.5 : 0.6,
                        delay: 0.1,
                        ease: "easeOut"
                      }}
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icône XP animée */}
          <motion.div
            className="xp-icon"
            animate={iconAnimation}
            transition={{ duration: isMobile ? 0.5 : 0.6 }}
          >
            ⭐
          </motion.div>

          {/* Compteur XP animé */}
          <motion.div
            className="xp-counter"
            animate={counterAnimation}
            transition={{ duration: isMobile ? 0.5 : 0.6 }}
          >
            <span className="xp-prefix">+</span>
            <span className="xp-value">{currentXP}</span>
            <span className="xp-suffix">XP</span>
          </motion.div>

          {/* Texte descriptif */}
          <motion.div
            className="xp-description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: isMobile ? 0.2 : 0.3, 
              duration: isMobile ? 0.3 : 0.4 
            }}
          >
            Expérience gagnée !
          </motion.div>

          {/* Particules flottantes - réduites sur mobile */}
          <div className="xp-floating-particles">
            {[...Array(particleCount)].map((_, i) => {
              const randomX = (Math.random() - 0.5) * (isMobile ? 80 : 100);
              const randomEndX = (Math.random() - 0.5) * (isMobile ? 100 : 120);
              
              return (
                <motion.div
                  key={i}
                  className="floating-particle"
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: randomX,
                    y: 20
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: isMobile ? -30 : -40,
                    x: randomEndX
                  }}
                  transition={{
                    duration: isMobile ? 1.5 : 2,
                    delay: 0.4 + i * 0.1,
                    ease: "easeOut"
                  }}
                />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPAnimation;
