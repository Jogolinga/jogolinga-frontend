import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { LanguageCode, AppMode } from '../types/types';
import './MobileHeader.css';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';
import secureAuthService from '../services/secureAuthService';

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
  
  // 🔧 FIX: État pour forcer le re-mount du GoogleAuth
  const [authKey, setAuthKey] = useState(0);
  
  // 🔧 FIX: Debug et surveillance de l'état d'authentification
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // 🔧 FIX: Debug de l'état d'authentification (à supprimer en production si souhaité)
  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        isAuthenticated: secureAuthService.isAuthenticated(),
        user: secureAuthService.getCurrentUser()?.email,
        hasToken: !!secureAuthService.getToken(),
        authKey: authKey
      };
      setDebugInfo(info);
      console.log('[MobileHeader] Debug Auth:', info);
    };

    updateDebugInfo();
    
    // Surveiller les changements d'authentification
    const handleAuthDebug = (event: CustomEvent) => {
      console.log('[MobileHeader] Auth event reçu:', event.detail);
      updateDebugInfo();
    };

    window.addEventListener('authStatusChanged', handleAuthDebug as EventListener);

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthDebug as EventListener);
    };
  }, [authKey]);

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

  // 🔧 FIX: Gestionnaire de login amélioré
  const handleLogin = (user: any) => {
    console.log('[MobileHeader] GoogleAuth onLogin appelé:', user);
    console.log('[MobileHeader] AuthKey avant login:', authKey);
    onLogin(user);
  };

  // 🔧 FIX: Gestionnaire de logout amélioré avec reset du GoogleAuth
  const handleLogout = () => {
    console.log('[MobileHeader] GoogleAuth onLogout appelé');
    console.log('[MobileHeader] AuthKey avant logout:', authKey);
    
    // Incrémenter authKey pour forcer le re-mount du GoogleAuth
    setAuthKey(prev => {
      const newKey = prev + 1;
      console.log('[MobileHeader] Nouveau authKey:', newKey);
      return newKey;
    });
    
    // Appeler le callback parent
    onLogout();
    
    // Petit délai pour s'assurer que le re-mount se fait bien
    setTimeout(() => {
      console.log('[MobileHeader] Post-logout, authKey:', authKey + 1);
    }, 100);
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
  }, [isDarkMode, authKey]); // 🔧 FIX: Ajouter authKey comme dépendance

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
        justifyContent: 'space-between', // Toujours space-between pour une répartition équilibrée
        padding: '0 16px',
        boxShadow: isDarkMode 
          ? '0px 4px 8px rgba(139, 69, 19, 0.3)' 
          : '0px 4px 8px rgba(218, 165, 32, 0.3)',
        margin: 0,
        border: 'none'
      }}
    >
      {/* 🔧 DEBUG: Affichage des infos de debug (à supprimer en production) */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            fontSize: '10px',
            zIndex: 99999,
            whiteSpace: 'nowrap'
          }}
        >
          Auth: {debugInfo.isAuthenticated ? '✅' : '❌'} | 
          User: {debugInfo.user || 'None'} | 
          Key: {debugInfo.authKey}
        </div>
      )}

      {/* Section gauche - Seulement visible dans le menu principal */}
      {isMainMenu ? (
        <div 
          className="header-left" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            flex: '0 0 auto',
            opacity: 1,
            visibility: 'visible',
            minWidth: 'fit-content'
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
                width: 40,
                height: 40,
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 1,
                visibility: 'visible',
                transition: 'all 0.3s ease',
                fontSize: '18px',
                padding: 0,
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
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
                height: 40,
                opacity: 1,
                visibility: 'visible',
                display: 'block',
                flexShrink: 0
              }}
            >
              <LanguageSelector 
                value={languageCode!}
                onChange={onLanguageChange!}
              />
            </div>
          )}
        </div>
      ) : (
        // Section vide pour maintenir la structure flex
        <div style={{ flex: '0 0 auto', width: 0 }} />
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
            textAlign: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none'
          }}
        >
          <h1 style={{ 
            color: getTextColor(), 
            fontSize: '1.25rem', 
            margin: 0,
            opacity: 1,
            visibility: 'visible',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '200px'
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
          gap: 12,
          flex: '0 0 auto',
          margin-left: 'auto',
          opacity: 1,
          visibility: 'visible',
          minWidth: 'fit-content',
          zIndex: 2
        }}
      >
        {/* 🔧 FIX: GoogleAuth avec key et gestion mobile améliorée */}
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
            key={`mobile-auth-${authKey}`} // 🔧 FIX: Key unique pour forcer re-mount
            onLogin={handleLogin} // 🔧 FIX: Gestionnaire amélioré
            onLogout={handleLogout} // 🔧 FIX: Gestionnaire avec reset
            isHeader={true}
            isMobile={true} // 🔧 FIX: Indiquer que c'est mobile
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
            aria-label={`Passer en mode ${isDarkMode ? 'clair' : 'sombre'}`}
            title={`Passer en mode ${isDarkMode ? 'clair' : 'sombre'}`}
            style={{
              background: isDarkMode 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(101, 67, 33, 0.15)',
              border: `2px solid ${isDarkMode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(101, 67, 33, 0.3)'}`,
              color: isDarkMode ? '#fff' : '#654321',
              width: 40,
              height: 40,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1,
              visibility: 'visible',
              transition: 'all 0.3s ease',
              flexShrink: 0,
              pointerEvents: 'auto',
              zIndex: 100001,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDarkMode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(101, 67, 33, 0.25)';
              e.currentTarget.style.borderColor = isDarkMode 
                ? 'rgba(255, 255, 255, 0.5)' 
                : 'rgba(101, 67, 33, 0.5)';
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDarkMode 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(101, 67, 33, 0.15)';
              e.currentTarget.style.borderColor = isDarkMode 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'rgba(101, 67, 33, 0.3)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }}
          >
            {isDarkMode ? (
              <Sun 
                size={22} 
                style={{ 
                  color: '#fff',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  strokeWidth: 2
                }} 
              />
            ) : (
              <Moon 
                size={22} 
                style={{ 
                  color: '#654321',
                  filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
                  strokeWidth: 2
                }} 
              />
            )}
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
