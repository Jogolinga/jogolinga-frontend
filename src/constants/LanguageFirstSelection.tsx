import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountryFlag from '../styles/components/CountryFlag';
import { getLanguageDisplayInfo } from '../constants/languages';
import type { LanguageCode } from '../types/types';

interface LanguageFirstSelectionProps {
  onLanguageSelect: (language: LanguageCode) => void;
  isVisible: boolean;
}

const LanguageFirstSelection: React.FC<LanguageFirstSelectionProps> = ({ 
  onLanguageSelect, 
  isVisible 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Obtenir les informations d'affichage des langues
  const languages = getLanguageDisplayInfo();
  const languageArray = Object.entries(languages) as [LanguageCode, typeof languages[LanguageCode]][];

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || 
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Forcer l'affichage avec les styles qui marchent
  useEffect(() => {
    if (isVisible) {
      const forceDisplay = () => {
        const overlay = document.querySelector('.language-first-selection-overlay');
        if (overlay) {
          console.log('Composant trouvé, application des styles de force');
          (overlay as HTMLElement).style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            z-index: 99999 !important;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            opacity: 1 !important;
            visibility: visible !important;
            width: 100vw !important;
            height: 100vh !important;
            flex-direction: column !important;
            padding: 20px !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          `;
          
          // Forcer aussi le container interne
          const container = overlay.querySelector('.language-selection-container');
          if (container) {
            (container as HTMLElement).style.cssText = `
              display: block !important;
              opacity: 1 !important;
              visibility: visible !important;
              transform: none !important;
              z-index: 100000 !important;
              background: rgba(255, 255, 255, 0.97) !important;
              border-radius: ${isMobile ? '20px' : '32px'} !important;
              padding: ${isMobile ? '30px 20px' : '50px 40px'} !important;
              box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) !important;
              max-width: ${isMobile ? '90vw' : '600px'} !important;
              width: 100% !important;
              text-align: center !important;
              position: relative !important;
              backdrop-filter: blur(20px) !important;
              border: 1px solid rgba(255, 255, 255, 0.2) !important;
            `;
          }

          // Forcer le style de la grille des langues avec hauteur adaptée
          const grid = overlay.querySelector('.languages-grid');
          if (grid) {
            (grid as HTMLElement).style.cssText = `
              display: grid !important;
              grid-template-columns: ${isMobile ? (window.innerWidth > 600 ? 'repeat(3, 1fr)' : window.innerWidth > 480 ? 'repeat(2, 1fr)' : '1fr') : 'repeat(3, 1fr)'} !important;
              gap: ${isMobile ? '12px' : '20px'} !important;
              max-width: 500px !important;
              margin: 0 auto 24px auto !important;
              max-height: ${isMobile ? '60vh' : 'none'} !important;
              overflow-y: ${isMobile ? 'auto' : 'visible'} !important;
              padding: ${isMobile ? '10px' : '0'} !important;
            `;
          }

          // Forcer le style des cartes de langues pour mobile
          const cards = overlay.querySelectorAll('.language-card');
          cards.forEach(card => {
            if (isMobile) {
              (card as HTMLElement).style.cssText += `
                min-height: 80px !important;
                padding: 12px 8px !important;
                font-size: 14px !important;
              `;
            }
          });
        }
      };

      // Appliquer immédiatement
      forceDisplay();
      
      // Et après un court délai pour s'assurer que React a fini de rendre
      const timeoutId = setTimeout(forceDisplay, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible, isMobile]);

  // Gestion de la sélection de langue
  const handleLanguageSelect = (language: LanguageCode) => {
    if (isAnimating) return;
    
    console.log('🌍 Langue sélectionnée:', language);
    setSelectedLanguage(language);
    setIsAnimating(true);
    
    // Vibration tactile sur mobile
    if (isMobile && 'vibrate' in navigator) {
      try {
        navigator.vibrate([50, 25, 50]);
      } catch (e) {
        console.log('Vibration non supportée');
      }
    }
    
    // Animation de confirmation puis callback
    setTimeout(() => {
      onLanguageSelect(language);
    }, 1200);
  };

  // Gestion des touches clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible || isAnimating) return;

      // Navigation par touches numériques (1-6)
      const keyNum = parseInt(event.key);
      if (keyNum >= 1 && keyNum <= languageArray.length) {
        const selectedLang = languageArray[keyNum - 1][0];
        handleLanguageSelect(selectedLang);
        return;
      }

      // Navigation par flèches
      if (selectedLanguage) {
        const currentIndex = languageArray.findIndex(([code]) => code === selectedLanguage);
        let newIndex = currentIndex;

        switch (event.key) {
          case 'ArrowLeft':
            newIndex = currentIndex > 0 ? currentIndex - 1 : languageArray.length - 1;
            break;
          case 'ArrowRight':
            newIndex = currentIndex < languageArray.length - 1 ? currentIndex + 1 : 0;
            break;
          case 'ArrowUp':
            newIndex = currentIndex >= 3 ? currentIndex - 3 : currentIndex;
            break;
          case 'ArrowDown':
            newIndex = currentIndex < languageArray.length - 3 ? currentIndex + 3 : currentIndex;
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            handleLanguageSelect(selectedLanguage);
            return;
        }

        if (newIndex !== currentIndex) {
          event.preventDefault();
          setSelectedLanguage(languageArray[newIndex][0]);
        }
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, selectedLanguage, isAnimating, languageArray]);

  // Empêcher le scroll sur mobile quand ouvert
  useEffect(() => {
    if (isVisible && isMobile) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isVisible, isMobile]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="language-first-selection-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Particules d'arrière-plan animées */}
        <div className="background-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="particle"
              initial={{ 
                opacity: 0,
                scale: 0,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#ffffff',
                pointerEvents: 'none'
              }}
            />
          ))}
        </div>

        <motion.div
          className="language-selection-container"
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.3, 
            duration: 0.7,
            type: "spring",
            stiffness: 100
          }}
        >
          {/* En-tête avec animation */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="selection-header"
            style={{ marginBottom: '32px' }}
          >
            <motion.div
              style={{ 
                fontSize: isMobile ? '48px' : '64px', 
                marginBottom: '16px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🌍
            </motion.div>
            
            <h1 style={{
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: '900',
              color: '#1e293b',
              marginBottom: '8px',
              background: 'linear-gradient(45deg, #1e293b, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Choisissez votre langue
            </h1>
            
            <p style={{
              fontSize: isMobile ? '14px' : '18px',
              color: '#64748b',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Sélectionnez la langue que vous souhaitez apprendre
            </p>

            {/* Indication des raccourcis clavier (desktop uniquement) */}
            {!isMobile && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}
              >
                💡 Utilisez les touches 1-6 ou les flèches pour naviguer, Entrée pour sélectionner
              </motion.p>
            )}
          </motion.div>

          {/* Grille des langues */}
          <div className="languages-grid">
            {languageArray.map(([code, { name, description, color }], index) => (
              <motion.div
                key={code}
                initial={{ scale: 0, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ 
                  delay: 0.7 + (index * 0.1), 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 150
                }}
                className={`language-card ${selectedLanguage === code ? 'selected' : ''}`}
                onClick={() => handleLanguageSelect(code)}
                onMouseEnter={() => !isAnimating && setSelectedLanguage(code)}
                style={{
                  background: selectedLanguage === code ? color : '#ffffff',
                  border: `3px solid ${selectedLanguage === code ? color : '#e2e8f0'}`,
                  borderRadius: '20px',
                  padding: isMobile ? '20px 12px' : '24px 16px',
                  cursor: isAnimating ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: selectedLanguage === code ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
                  boxShadow: selectedLanguage === code ? 
                    `0 20px 25px ${color}33, 0 10px 10px ${color}22, inset 0 1px 0 rgba(255,255,255,0.2)` : 
                    '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.05)',
                  opacity: isAnimating && selectedLanguage !== code ? 0.3 : 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Effet de brillance au survol */}
                {selectedLanguage === code && (
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* Numéro de raccourci */}
                {!isMobile && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: selectedLanguage === code ? 'rgba(255,255,255,0.9)' : color,
                    color: selectedLanguage === code ? color : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </div>
                )}
                
                {/* Drapeau avec animation */}
                <motion.div 
                  style={{
                    fontSize: isMobile ? '32px' : '40px',
                    marginBottom: '12px',
                    filter: selectedLanguage === code ? 'brightness(1.2) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'brightness(1)'
                  }}
                  animate={selectedLanguage === code ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 2, -2, 0]
                  } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: selectedLanguage === code ? Infinity : 0
                  }}
                >
                  <CountryFlag 
                    languageCode={code} 
                    size={isMobile ? 36 : 44} 
                  />
                </motion.div>
                
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '700',
                  color: selectedLanguage === code ? '#ffffff' : '#1e293b',
                  margin: '0 0 6px 0',
                  transition: 'color 0.3s ease',
                  textShadow: selectedLanguage === code ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                }}>
                  {name}
                </h3>
                
                <p style={{
                  fontSize: isMobile ? '11px' : '13px',
                  color: selectedLanguage === code ? 'rgba(255,255,255,0.9)' : '#64748b',
                  margin: '0',
                  fontWeight: '500',
                  transition: 'color 0.3s ease',
                  lineHeight: '1.3'
                }}>
                  {description}
                </p>

                {/* Checkmark de sélection */}
                {selectedLanguage === code && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: isMobile ? '24px' : '28px',
                      height: isMobile ? '24px' : '28px',
                      background: '#ffffff',
                      color: color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      boxShadow: `0 4px 12px ${color}44, 0 2px 4px rgba(0,0,0,0.1)`,
                      border: `2px solid ${color}`
                    }}
                  >
                    ✓
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Message de confirmation */}
          <AnimatePresence>
            {selectedLanguage && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                style={{
                  padding: isMobile ? '16px' : '20px',
                  background: `linear-gradient(135deg, ${languages[selectedLanguage].color}15, ${languages[selectedLanguage].color}25)`,
                  border: `2px solid ${languages[selectedLanguage].color}40`,
                  borderRadius: '16px',
                  color: languages[selectedLanguage].color,
                  fontWeight: '600',
                  fontSize: isMobile ? '14px' : '16px',
                  margin: '16px 0 0 0',
                  boxShadow: `0 8px 16px ${languages[selectedLanguage].color}20`
                }}
              >
                {isAnimating ? (
                  <motion.div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{
                        width: '20px',
                        height: '20px',
                        border: `3px solid ${languages[selectedLanguage].color}30`,
                        borderTop: `3px solid ${languages[selectedLanguage].color}`,
                        borderRadius: '50%'
                      }}
                    />
                    <span>Chargement de {languages[selectedLanguage].name}...</span>
                  </motion.div>
                ) : (
                  <>
                    <motion.span
                      animate={{ rotate: [0, 20, -20, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                      style={{ display: 'inline-block', marginRight: '8px' }}
                    >
                      🎉
                    </motion.span>
                    Excellent choix ! Cliquez pour confirmer {languages[selectedLanguage].name}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions supplémentaires */}
          {!selectedLanguage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              style={{
                fontSize: '12px',
                color: '#94a3b8',
                marginTop: '16px',
                fontStyle: 'italic'
              }}
            >
              {isMobile ? 'Touchez une langue pour commencer' : 'Cliquez sur une langue pour commencer votre apprentissage'}
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LanguageFirstSelection;