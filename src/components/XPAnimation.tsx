import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    if (showAnimation && xpGained > 0) {
      // Animation progressive du compteur XP
      const duration = Math.min(2000, Math.max(1000, xpGained * 50)); // Entre 1-2 secondes
      const steps = Math.min(60, xpGained); // Maximum 60 steps pour la fluidité
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
          
          // Déclencher l'effet burst à la fin
          setShowBurst(true);
          setTimeout(() => {
            setShowBurst(false);
            onAnimationComplete?.();
          }, 800);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [showAnimation, xpGained, onAnimationComplete]);

  if (!showAnimation || xpGained === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className={`xp-animation-container ${variant} ${className}`}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          {/* Effet de burst en arrière-plan */}
          <AnimatePresence>
            {showBurst && (
              <motion.div
                className="xp-burst-container"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="xp-burst-particle"
                    initial={{
                      scale: 0,
                      x: 0,
                      y: 0,
                      rotate: i * 45
                    }}
                    animate={{
                      scale: 1,
                      x: Math.cos((i * 45 * Math.PI) / 180) * 40,
                      y: Math.sin((i * 45 * Math.PI) / 180) * 40,
                      rotate: i * 45 + 180
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icône XP animée */}
          <motion.div
            className="xp-icon"
            animate={showBurst ? {
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ duration: 0.6 }}
          >
            ⭐
          </motion.div>

          {/* Compteur XP animé */}
          <motion.div
            className="xp-counter"
            animate={showBurst ? {
              scale: [1, 1.2, 1],
              color: ["#4f46e5", "#fbbf24", "#4f46e5"]
            } : {}}
            transition={{ duration: 0.6 }}
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
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            Expérience gagnée !
          </motion.div>

          {/* Particules flottantes */}
          <div className="xp-floating-particles">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="floating-particle"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: (Math.random() - 0.5) * 100,
                  y: 20
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  y: -40,
                  x: (Math.random() - 0.5) * 120
                }}
                transition={{
                  duration: 2,
                  delay: 0.5 + i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPAnimation;
