import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { LanguageCode, AppMode } from '../types/types';
import './MobileHeader.css';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';

// Variants d'animation pour les boutons
const buttonVariants = {
  initial: {},
  hover: { scale: 1.1 },
  tap: { scale: 0.9 }
};

interface MobileHeaderProps {
  title: string;
  languageCode?: LanguageCode;
  onLanguageChange?: (code: LanguageCode) => void;
  showLanguageSelector?: boolean;
  currentMode: AppMode;
  onLogin: (response: any) => void;
  onLogout: () => void;
  onOpenSubscription?: () => void;
  subscriptionTier?: SubscriptionTier;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  languageCode,
  onLanguageChange,
  showLanguageSelector = false,
  currentMode,
  onLogin,
  onLogout,
  onOpenSubscription,
  subscriptionTier = SubscriptionTier.FREE
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const headerRef = useRef<HTMLElement>(null);
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState<SubscriptionTier>(subscriptionTier);

  // Surveiller les changements d'abonnement
  useEffect(() => {
    const updateSubscriptionTier = () => {
      const tier = subscriptionService.getCurrentTier();
      setCurrentSubscriptionTier(tier);
    };

    // Écouter les événements de mise à jour d'abonnement
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      console.log('[MobileHeader] Événement subscription update reçu:', event.detail);
      updateSubscriptionTier();
    };

    // Mise à jour initiale
    updateSubscriptionTier();

    // Écouter les événements
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);

    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
    };
  }, []);

  // Déterminer si on est dans le menu principal
  const isMainMenu = currentMode === 'menu';
  
  // Déterminer si on doit afficher le titre
  const shouldShowTitle = !isMainMenu;
  
  // Déterminer si on doit afficher le sélecteur de langue (seulement dans le menu principal)
  const shouldShowLanguageSelector = isMainMenu && showLanguageSelector && languageCode && onLanguageChange;

  // Couleurs selon le thème
  const getHeaderBackground = () => {
    if (isDarkMode) {
      // Mode sombre : Ocre vers terre cuite/marron
      return 'linear-gradient(to right, #cd853f, #8b4513)';
    } else {
      // Mode clair : Ocre clair vers sable/beige
      return 'linear-gradient(to right, #daa520, #f4e4bc)';
    }
  };

  const getTextColor = () => {
    if (isDarkMode) {
      return 'white'; // Texte blanc en mode sombre
    } else {
      return '#654321'; // Texte brun foncé en mode clair
    }
  };

  const getButtonBackground = () => {
    if (isDarkMode) {
      return 'rgba(255, 255, 255, 0.15)'; // Boutons transparents blancs en mode sombre
    } else {
      return 'rgba(101, 67, 33, 0.15)'; // Boutons transparents bruns en mode clair
    }
  };

  const getButtonHoverBackground = () => {
    if (isDarkMode) {
      return 'rgba(255, 255, 255, 0.25)';
    } else {
      return 'rgba(101, 67, 33, 0.25)';
    }
  };

  // Styles spéciaux pour le bouton d'abonnement (icône seulement)
  const getSubscriptionButtonStyles = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      // Utilisateur Premium - bouton doré
      return {
        background: isDarkMode 
          ? 'linear-gradient(45deg, #ffd700, #ffed4e)' 
          : 'linear-gradient(45deg, #f59e0b, #fbbf24)',
        color: isDarkMode ? '#8b4513' : '#654321',
        border: `2px solid ${isDarkMode ? '#ffd700' : '#f59e0b'}`,
        boxShadow: `0 2px 8px ${isDarkMode ? 'rgba(255, 215, 0, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
        fontWeight: '700'
      };
    } else {
      // Utilisateur gratuit - bouton normal
      return {
        background: getButtonBackground(),
        color: getTextColor(),
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(101, 67, 33, 0.3)'}`,
        boxShadow: 'none',
        fontWeight: '600'
      };
    }
  };

  // Obtenir le texte du tooltip
  const getTooltipText = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      const planInfo = subscriptionService.getCurrentPlanInfo();
      if (planInfo.billingPeriod === 'yearly') {
        return 'Premium Annuel';
      } else {
        return 'Premium';
      }
    } else {
      return 'Version Gratuite';
    }
  };

  // Obtenir l'icône du bouton d'abonnement
  const getSubscriptionIcon = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      return '⭐';
    } else {
      return '🆓';
    }
  };

  // Gérer le clic sur le bouton d'abonnement
  const handleSubscriptionClick = () => {
    console.log('[MobileHeader] Clic sur bouton d\'abonnement');
    if (onOpenSubscription) {
      onOpenSubscription();
    }
  };

  // Force le header à être visible (système de protection)
  useEffect(() => {
    const forceHeaderVisible = () => {
      const header = headerRef.current || document.querySelector('.mobile-header');
      if (header) {
        const headerElement = header as HTMLElement;
        
        // Force les styles essentiels avec les bonnes couleurs
        headerElement.style.setProperty('display', 'flex', 'important');
        headerElement.style.setProperty('visibility', 'visible', 'important');
        headerElement.style.setProperty('opacity', '1', 'important');
        headerElement.style.setProperty('position', 'fixed', 'important');
        headerElement.style.setProperty('top', '0', 'important');
        headerElement.style.setProperty('z-index', '100000', 'important');
        headerElement.style.setProperty('background', getHeaderBackground(), 'important');
        headerElement.style.setProperty('color', getTextColor(), 'important');
        
        // Force la visibilité des enfants
        const children = headerElement.querySelectorAll('*');
        children.forEach(child => {
          const childElement = child as HTMLElement;
          childElement.style.setProperty('opacity', '1', 'important');
          childElement.style.setProperty('visibility', 'visible', 'important');
          childElement.style.setProperty('color', getTextColor(), 'important');
        });

        // ✅ NOUVEAU: Forcer les pointer-events pour GoogleAuth
        const googleAuthElements = headerElement.querySelectorAll('.header-auth-container, .header-login-button, .header-logout-button, .header-user-info button');
        googleAuthElements.forEach(element => {
          const el = element as HTMLElement;
          el.style.setProperty('pointer-events', 'auto', 'important');
          el.style.setProperty('cursor', 'pointer', 'important');
          el.style.setProperty('z-index', '100001', 'important');
        });
      }
    };

    // Application initiale
    forceHeaderVisible();
    setTimeout(forceHeaderVisible, 100);
    
    // Observer pour maintenir la visibilité
    const observer = new MutationObserver(() => {
      const header = headerRef.current || document.querySelector('.mobile-header');
      if (header) {
        const computed = getComputedStyle(header);
        if (computed.display === 'none' || computed.visibility === 'hidden') {
          forceHeaderVisible();
        }
      }
    });
    
    if (headerRef.current) {
      observer.observe(headerRef.current, {
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }
    
    return () => observer.disconnect();
  }, [isDarkMode]); // Ajouter isDarkMode comme dépendance

  return (
    <header 
      ref={headerRef}
      className={`mobile-header ${isDarkMode ? 'dark' : 'light'} ${isMainMenu ? 'main-menu' : 'component-view'}`}
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: 60,
        background: getHeaderBackground(),
        color: getTextColor(),
        zIndex: 100000,
        opacity: 1,
        visibility: 'visible',
        alignItems: 'center',
        justifyContent: isMainMenu ? 'space-between' : 'flex-end',
        padding: '0 16px',
        boxShadow: isDarkMode 
          ? '0px 4px 8px rgba(139, 69, 19, 0.3)' 
          : '0px 4px 8px rgba(218, 165, 32, 0.3)',
        margin: 0,
        border: 'none'
      }}
    >
      {/* Section gauche - Seulement visible dans le menu principal */}
      {isMainMenu && (
        <div 
          className="header-left" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, // Augmenté pour plus d'espace
            minWidth: 80,
            opacity: 1,
            visibility: 'visible'
          }}
        >
          {/* Bouton d'abonnement - Maintenant seulement l'icône */}
          {onOpenSubscription && (
            <motion.button 
              onClick={handleSubscriptionClick}
              className="subscription-status-button"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              aria-label={getTooltipText()}
              title={getTooltipText()} // Tooltip natif
              style={{
                ...getSubscriptionButtonStyles(),
                width: 36, // Taille fixe comme les autres boutons
                height: 36,
                borderRadius: '50%', // Bouton rond
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1,
                visibility: 'visible',
                transition: 'all 0.2s ease',
                fontSize: '16px', // Taille de l'icône
                padding: 0, // Pas de padding pour un bouton rond
                flexShrink: 0 // Empêche le rétrécissement
              }}
              onMouseEnter={(e) => {
                if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = `0 4px 12px ${isDarkMode ? 'rgba(255, 215, 0, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`;
                } else {
                  e.currentTarget.style.background = getButtonHoverBackground();
                }
              }}
              onMouseLeave={(e) => {
                if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = `0 2px 8px ${isDarkMode ? 'rgba(255, 215, 0, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`;
                } else {
                  const styles = getSubscriptionButtonStyles();
                  e.currentTarget.style.background = styles.background;
                }
              }}
            >
              {getSubscriptionIcon()}
            </motion.button>
          )}

          {shouldShowLanguageSelector && (
            <div 
              className="language-selector-small" 
              style={{ 
                minWidth: 110, 
                height: 36,
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                flexShrink: 0 // Empêche le rétrécissement
              }}
            >
              <LanguageSelector 
                value={languageCode!}
                onChange={onLanguageChange!}
              />
            </div>
          )}
        </div>
      )}

      {/* Section centrale - Titre (seulement dans les composants) */}
      {shouldShowTitle && (
        <div 
          className="header-title" 
          style={{ 
            color: getTextColor(),
            opacity: 1,
            visibility: 'visible',
            flex: 1,
            textAlign: 'center'
          }}
        >
          <h1 style={{ 
            color: getTextColor(), 
            fontSize: '1.25rem', 
            margin: 0,
            opacity: 1,
            visibility: 'visible'
          }}>
            {title}
          </h1>
        </div>
      )}
      
      {/* Section droite - Actions */}
      <div 
        className="header-actions" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, // Augmenté pour plus d'espace
          minWidth: 'auto',
          opacity: 1,
          visibility: 'visible'
        }}
      >
        {/* ✅ CORRECTION: GoogleAuth avec conteneur fixe et styles explicites */}
        <div 
          className="mobile-google-auth-container"
          style={{ 
            opacity: 1, 
            visibility: 'visible', 
            flexShrink: 0,
            pointerEvents: 'auto',
            zIndex: 100001,
            position: 'relative'
          }}
        >
          <GoogleAuth 
            onLogin={(user) => {
              console.log('[MobileHeader] GoogleAuth onLogin appelé:', user);
              onLogin(user);
            }}
            onLogout={() => {
              console.log('[MobileHeader] GoogleAuth onLogout appelé');
              onLogout();
            }}
            isHeader={true}
          />
        </div>
        
        {/* Bouton changement de thème - seulement dans le menu principal */}
        {isMainMenu && (
          <motion.button 
            onClick={toggleTheme}
            className="theme-toggle-button"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            aria-label="Changer le thème"
            style={{
              background: getButtonBackground(),
              border: 'none',
              color: getTextColor(),
              width: 36,
              height: 36,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1,
              visibility: 'visible',
              transition: 'all 0.2s ease',
              flexShrink: 0, // Empêche le rétrécissement
              pointerEvents: 'auto',
              zIndex: 100001
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = getButtonHoverBackground();
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = getButtonBackground();
            }}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;