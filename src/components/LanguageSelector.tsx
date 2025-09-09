import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import CountryFlag from '../styles/components/CountryFlag';
import { useTheme } from './ThemeContext';
import type { LanguageCode } from '../types/types';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
  variant?: 'default' | 'large';
  showDescriptions?: boolean;
  className?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  value, 
  onChange,
  variant = 'large',
  showDescriptions = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  const languages = {
    wf: { name: 'Wolof', flag: '🇸🇳', description: 'Langue du Sénégal' },
    ba: { name: 'Bambara', flag: '🇲🇱', description: 'Langue du Mali' },
    la: { name: 'Lingala', flag: '🇨🇩', description: 'Langue du Congo' },
    ff: { name: 'Peul', flag: '🇸🇳', description: 'Langue peule' },
    co: { name: 'Copte', flag: '🇪🇬', description: 'Langue de l\'Égypte antique' },
    sw: { name: 'Swahili', flag: 'TZ', description: 'Langue de la Tanzanie' }
  } as const;

  const languageArray = Object.entries(languages);

  // Détection mobile améliorée
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialiser les index avec la langue sélectionnée
  useEffect(() => {
    const selectedIndex = languageArray.findIndex(([code]) => code === value);
    if (selectedIndex !== -1) {
      setCurrentIndex(selectedIndex);
      setSelectedIndex(selectedIndex);
    }
  }, []);

  // Synchroniser quand la prop value change
  useEffect(() => {
    if (!isOpen) {
      const selectedIndex = languageArray.findIndex(([code]) => code === value);
      if (selectedIndex !== -1 && selectedIndex !== currentIndex) {
        setCurrentIndex(selectedIndex);
        setSelectedIndex(selectedIndex);
      }
    }
  }, [value, isOpen]);

  // Fonction de fermeture améliorée
  const handleClose = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsOpen(false);
    
    // Reset à la langue actuellement sélectionnée
    const actualSelectedIndex = languageArray.findIndex(([code]) => code === value);
    if (actualSelectedIndex !== -1) {
      setCurrentIndex(actualSelectedIndex);
      setSelectedIndex(actualSelectedIndex);
    }
    
    // Restaurer le scroll sur mobile
    if (isMobile) {
      document.body.style.overflow = 'auto';
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Gestion des clics extérieurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!isOpen) return;
      
      const target = event.target as Node;
      
      if (containerRef.current && !containerRef.current.contains(target)) {
        handleClose();
      }
    };

    let timeoutId: NodeJS.Timeout;
    
    if (isOpen) {
      timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('touchstart', handleClickOutside, { passive: true, capture: true });
      }, 150);
      
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
      
      if (isMobile) {
        document.body.style.overflow = 'auto';
      }
    };
  }, [isOpen, isMobile]);

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          handleClose();
          break;
        case 'ArrowLeft':
          if (isMobile) {
            event.preventDefault();
            navigateCarousel('prev');
          }
          break;
        case 'ArrowRight':
          if (isMobile) {
            event.preventDefault();
            navigateCarousel('next');
          }
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isMobile) {
            confirmSelection();
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, currentIndex, isMobile]);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    if (!isOpen) {
      const actualSelectedIndex = languageArray.findIndex(([code]) => code === value);
      if (actualSelectedIndex !== -1) {
        setCurrentIndex(actualSelectedIndex);
        setSelectedIndex(actualSelectedIndex);
      }
    }
    
    setIsOpen(!isOpen);
    
    if (isMobile && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        console.log('Vibration non supportée');
      }
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleDirectChange = (code: LanguageCode) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    onChange(code);
    setIsOpen(false);
    
    const newIndex = languageArray.findIndex(([langCode]) => langCode === code);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
      setSelectedIndex(newIndex);
    }
    
    if (isMobile) {
      document.body.style.overflow = 'auto';
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
    
    setTimeout(() => {
      buttonRef.current?.focus();
    }, 100);
  };

  // Navigation du carrousel avec rotation infinie
  const navigateCarousel = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' 
      ? (currentIndex === 0 ? languageArray.length - 1 : currentIndex - 1)
      : (currentIndex === languageArray.length - 1 ? 0 : currentIndex + 1);
    
    setCurrentIndex(newIndex);
    
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {
        console.log('Vibration non supportée');
      }
    }
  };

  // Confirmer la sélection
  const confirmSelection = () => {
    if (currentIndex >= 0 && currentIndex < languageArray.length) {
      const [code] = languageArray[currentIndex];
      handleDirectChange(code as LanguageCode);
    }
  };

  // Navigation tactile (swipe)
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      navigateCarousel('next');
    } else if (isRightSwipe) {
      navigateCarousel('prev');
    }
  };

  const currentLanguage = languages[value];

  // Classes CSS dynamiques
  const containerClasses = [
    'language-selector-container',
    theme,
    variant === 'large' && isMobile ? 'mobile-variant-large' : '',
    className
  ].filter(Boolean).join(' ');

  const buttonClasses = [
    'language-selector-button',
    isOpen ? 'active' : ''
  ].filter(Boolean).join(' ');

  const dropdownClasses = [
    'language-dropdown',
    isMobile ? 'mobile-carousel-dropdown' : ''
  ].filter(Boolean).join(' ');

  const flagSize = 24;
  const shouldShowDescriptions = showDescriptions && !isMobile;

  return (
    <div ref={containerRef} className={containerClasses}>
      <button 
        ref={buttonRef}
        onClick={handleToggle}
        className={buttonClasses}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Langue sélectionnée: ${currentLanguage.name}. Cliquez pour ouvrir le sélecteur de langue.`}
        disabled={isAnimating}
        type="button"
      >
        <span className="language-flag" aria-hidden="true">
          <CountryFlag languageCode={value} size={flagSize} />
        </span>
        <span className="language-name">{currentLanguage.name}</span>
        <ChevronDown 
          className={`language-chevron ${isOpen ? 'rotate' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay pour mobile */}
          {isMobile && (
            <div 
              className="dropdown-overlay"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClose();
              }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                zIndex: 100005,
                backdropFilter: 'blur(4px)',
                cursor: 'pointer'
              }}
              aria-label="Fermer le sélecteur de langue"
            />
          )}
          
          <div 
            ref={dropdownRef}
            className={dropdownClasses}
            role="listbox"
            aria-label="Sélectionner une langue"
            style={{
              zIndex: 100010,
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile ? (
              <div className="mobile-carousel-container" style={{ 
                display: 'block', 
                width: '100%',
                padding: '16px' // Réduit de 20px à 16px
              }}>
                {/* Indicateurs de position - Plus compacts */}
                <div className="carousel-indicators" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '6px', // Réduit de 8px à 6px
                  marginBottom: '12px', // Réduit de 20px à 12px
                  padding: '0'
                }}>
                  {languageArray.map((_, index) => (
                    <div
                      key={index}
                      className={`carousel-indicator ${index === currentIndex ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      style={{ 
                        width: '10px', // Réduit de 12px à 10px
                        height: '10px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)', // Réduit de 1.3 à 1.2
                        background: index === currentIndex ? 
                          (theme === 'dark' ? '#ffffff' : '#8b4513') : 
                          (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(139,69,19,0.4)'),
                        border: index === currentIndex ? 
                          `2px solid ${theme === 'dark' ? '#8b4513' : '#ffffff'}` : 
                          '2px solid transparent',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Carrousel principal - Version compacte */}
                <div 
                  className="carousel-wrapper"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '140px', // Réduit de 200px à 140px
                    overflow: 'hidden',
                    borderRadius: '16px', // Réduit de 20px à 16px
                    marginBottom: '12px', // Réduit de 20px à 12px
                    border: `2px solid ${theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(139,69,19,0.3)'}`,
                    background: theme === 'dark' 
                      ? 'linear-gradient(135deg, rgba(139,69,19,0.3), rgba(101,67,33,0.3))'
                      : 'linear-gradient(135deg, rgba(245,222,179,0.3), rgba(218,165,32,0.3))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Boutons de navigation - Plus petits */}
                 

                  {/* Container du carrousel - Version compacte */}
                  <div 
                    ref={carouselRef}
                    className="carousel-content"
                    style={{
                      display: 'flex',
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Afficher SEULEMENT l'élément actuel */}
                    {languageArray.map(([code, { name, description }], index) => {
                      const isCurrentItem = index === currentIndex;
                      const isSelectedLanguage = code === value;
                      
                      if (!isCurrentItem) return null;
                      
                      return (
                        <div
                          key={code}
                          className="current-carousel-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmSelection();
                          }}
                          style={{
                            flex: '1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '16px', // Réduit de 30px 20px à 16px
                            cursor: 'pointer',
                            height: '100%',
                            boxSizing: 'border-box',
                            position: 'relative',
                            background: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(139,69,19,0.1)',
                            borderRadius: '16px',
                            transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            opacity: 1,
                            transform: 'scale(1)',
                            pointerEvents: 'auto',
                            visibility: 'visible',
                            zIndex: 10
                          }}
                          data-language={code}
                        >
                          <div 
                            style={{
                              width: '60px', // Réduit de 80px à 60px
                              height: '60px',
                              borderRadius: '50%',
                              border: `3px solid ${theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(139,69,19,0.8)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '8px', // Réduit de 16px à 8px
                              fontSize: '30px', // Réduit de 40px à 30px
                              background: 'rgba(255,255,255,0.95)',
                              boxShadow: '0 6px 12px rgba(0,0,0,0.3)', // Réduit l'ombre
                              transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            }}
                          >
                            <CountryFlag 
                              languageCode={code as LanguageCode} 
                              size={48} // Réduit de 64 à 48
                            />
                          </div>
                          
                          <div style={{ width: '100%', textAlign: 'center' }}>
                            <h3 
                              style={{
                                fontSize: '18px', // Réduit de 22px à 18px
                                fontWeight: '900',
                                color: '#ffffff',
                                margin: '0 0 4px 0', // Réduit de 8px à 4px
                                textShadow: '0 3px 6px rgba(0,0,0,1)',
                                lineHeight: '1.2',
                                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                              }}
                            >
                              {name}
                            </h3>
                          </div>
                          
                          {isSelectedLanguage && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: '12px', // Réduit de 20px à 12px
                                right: '12px',
                                width: '24px', // Réduit de 32px à 24px
                                height: '24px',
                                background: theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(205,133,63,0.95)',
                                color: theme === 'dark' ? '#8b4513' : '#ffffff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px', // Réduit de 18px à 14px
                                fontWeight: 'bold',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.4)', // Réduit l'ombre
                                border: `2px solid ${theme === 'dark' ? '#8b4513' : '#ffffff'}`, // Réduit de 3px à 2px
                                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                              }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

              
                 
                </div>

                {/* Boutons d'action - Plus compacts */}
                <div className="carousel-actions" style={{ 
                  display: 'flex', 
                  gap: '8px', // Réduit de 12px à 8px
                  justifyContent: 'center'
                }}>
                  <button
                    className="carousel-action-button carousel-select"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmSelection();
                    }}
                    disabled={currentIndex === languageArray.findIndex(([code]) => code === value)}
                    style={{
                      padding: '8px 16px', // Réduit de 12px 24px à 8px 16px
                      borderRadius: '20px', // Réduit de 25px à 20px
                      border: '2px solid transparent',
                      fontSize: '13px', // Réduit de 14px à 13px
                      fontWeight: '600',
                      cursor: currentIndex === languageArray.findIndex(([code]) => code === value) ? 'not-allowed' : 'pointer',
                      minWidth: '100px', // Réduit de 120px à 100px
                      textAlign: 'center',
                      background: currentIndex === languageArray.findIndex(([code]) => code === value) ? 
                        'rgba(139,69,19,0.3)' : 'linear-gradient(45deg, #cd853f, #8b4513)',
                      color: '#ffffff',
                      opacity: currentIndex === languageArray.findIndex(([code]) => code === value) ? 0.5 : 1,
                      transform: currentIndex === languageArray.findIndex(([code]) => code === value) ? 'none' : 'scale(1)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {currentIndex === languageArray.findIndex(([code]) => code === value) ? 'Sélectionné' : 'Sélectionner'}
                  </button>
                  <button
                    className="carousel-action-button carousel-cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    style={{
                      padding: '8px 16px', // Réduit de 12px 24px à 8px 16px
                      borderRadius: '20px', // Réduit de 25px à 20px
                      border: '2px solid rgba(139,69,19,0.4)',
                      fontSize: '13px', // Réduit de 14px à 13px
                      fontWeight: '600',
                      cursor: 'pointer',
                      minWidth: '100px', // Réduit de 120px à 100px
                      textAlign: 'center',
                      background: 'rgba(255,255,255,0.9)',
                      color: '#8b4513'
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              // Liste classique pour desktop
              <ul className="language-list" role="none" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {Object.entries(languages).map(([code, { name, description }], index) => (
                  <li 
                    key={code}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectChange(code as LanguageCode);
                    }}
                    className={`language-option ${value === code ? 'selected' : ''}`}
                    role="option"
                    aria-selected={value === code}
                    tabIndex={0}
                    data-language={code}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(218,165,32,0.1)'}`,
                      color: theme === 'dark' ? '#ffffff' : '#654321'
                    }}
                  >
                    <span className="language-option-flag" aria-hidden="true">
                      <CountryFlag 
                        languageCode={code as LanguageCode} 
                        size={24} 
                      />
                    </span>
                    <div className="language-option-content" style={{ flex: 1 }}>
                      <span className="language-option-name" style={{ fontSize: '14px', fontWeight: '500' }}>{name}</span>
                      {shouldShowDescriptions && (
                        <span className="language-option-description" style={{ fontSize: '11px', opacity: 0.7, fontStyle: 'italic', marginTop: '2px' }}>{description}</span>
                      )}
                    </div>
                    {value === code && (
                      <span className="language-option-check" aria-hidden="true" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        ✓
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;