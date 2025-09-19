import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { LanguageCode, AppMode } from '../types/types';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';

// Variants d'animation pour les boutons
const buttonVariants = {
  initial: {},
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
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
  const [authKey, setAuthKey] = useState(0);

  // Surveiller les changements d'abonnement
  useEffect(() => {
    const updateSubscriptionTier = () => {
      const tier = subscriptionService.getCurrentTier();
      setCurrentSubscriptionTier(tier);
    };

    const handleSubscriptionUpdate = (event: CustomEvent) => {
      console.log('[MobileHeader] Subscription update:', event.detail);
      updateSubscriptionTier();
    };

    updateSubscriptionTier();
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);

    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
    };
  }, []);

  // Déterminer les états d'affichage
  const isMainMenu = currentMode === 'menu';
  const shouldShowTitle = !isMainMenu;
  const shouldShowLanguageSelector = isMainMenu && showLanguageSelector && languageCode && onLanguageChange;

  // Gestionnaires d'événements
  const handleLogin = (user: any) => {
    console.log('[MobileHeader] Login:', user);
    onLogin(user);
  };

  const handleLogout = () => {
    console.log('[MobileHeader] Logout');
    setAuthKey(prev => prev + 1);
    onLogout();
  };

  const handleSubscriptionClick = () => {
    if (onOpenSubscription) {
      onOpenSubscription();
    }
  };

  // Styles selon le thème
  const getSubscriptionIcon = () => {
    return currentSubscriptionTier === SubscriptionTier.PREMIUM ? '⭐' : '🆓';
  };

  const getTooltipText = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      const planInfo = subscriptionService.getCurrentPlanInfo();
      return planInfo.billingPeriod === 'yearly' ? 'Premium Annuel' : 'Premium';
    }
    return 'Version Gratuite';
  };

  // Styles dynamiques basés sur le thème
  const headerStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '60px',
    padding: '0 16px',
    zIndex: 100000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxSizing: 'border-box' as const,
    background: isDarkMode 
      ? 'linear-gradient(135deg, #cd853f 0%, #8b4513 100%)' 
      : 'linear-gradient(135deg, #daa520 0%, #f4e4bc 100%)',
    color: isDarkMode ? 'white' : '#654321',
    boxShadow: isDarkMode
      ? '0px 4px 12px rgba(139, 69, 19, 0.4)'
      : '0px 4px 12px rgba(218, 165, 32, 0.4)',
    transition: 'background 0.3s ease, color 0.3s ease'
  };

  const buttonBaseStyles = {
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative' as const,
    transition: 'all 0.3s ease',
    width: '40px',
    height: '40px',
    background: isDarkMode 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(101, 67, 33, 0.2)',
    color: isDarkMode ? '#fff' : '#654321',
    border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(101, 67, 33, 0.4)'}`,
    boxShadow: `0 2px 6px ${isDarkMode ? 'rgba(0, 0, 0, 0.15)' : 'rgba(101, 67, 33, 0.15)'}`,
    backdropFilter: 'blur(10px)'
  };

  const authButtonStyles = {
    ...buttonBaseStyles,
    width: 'auto',
    minWidth: '80px',
    maxWidth: '120px',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };

  return (
    <header 
      ref={headerRef}
      style={headerStyles}
    >
      {/* SECTION GAUCHE - Spacer vide */}
      <div style={{ width: '40px' }} />

      {/* SECTION CENTRE - Titre OU Éléments centrés */}
      {shouldShowTitle ? (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '1.25rem',
          fontWeight: '600',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '200px',
          pointerEvents: 'none'
        }}>
          <h1 style={{
            fontSize: 'inherit',
            margin: 0,
            color: 'inherit'
          }}>
            {title}
          </h1>
        </div>
      ) : (
        /* Éléments centrés pour le menu principal */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}>
          {/* Bouton d'abonnement */}
          {onOpenSubscription && (
            <motion.button 
              onClick={handleSubscriptionClick}
              style={buttonBaseStyles}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              aria-label={getTooltipText()}
              title={getTooltipText()}
            >
              {getSubscriptionIcon()}
            </motion.button>
          )}

          {/* Sélecteur de langue */}
          {shouldShowLanguageSelector && (
            <div style={{
              width: '110px',
              minWidth: '110px',
              maxWidth: '110px',
              height: '40px',
              flexShrink: 0
            }}>
              <LanguageSelector 
                value={languageCode!}
                onChange={onLanguageChange!}
              />
            </div>
          )}
        </div>
      )}
      
      {/* SECTION DROITE - GoogleAuth seulement */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flex: '0 0 auto',
        maxWidth: '50%',
        marginLeft: 'auto'
      }}>
        {/* GoogleAuth */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}>
          <GoogleAuth 
            key={`mobile-auth-${authKey}`}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isHeader={true}
            isMobile={true}
          />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
