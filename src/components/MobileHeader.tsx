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

  return (
    <header 
      ref={headerRef}
      className={`mobile-header ${isDarkMode ? 'dark' : 'light'} ${isMainMenu ? 'main-menu' : 'component-view'}`}
    >
      {/* SECTION GAUCHE - Elements fixes */}
      {isMainMenu ? (
        <div className="header-left">
          {/* Bouton d'abonnement */}
          {onOpenSubscription && (
            <motion.button 
              onClick={handleSubscriptionClick}
              className="subscription-status-button"
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
            <div className="language-selector-small">
              <LanguageSelector 
                value={languageCode!}
                onChange={onLanguageChange!}
              />
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: 0 }} />
      )}

      {/* SECTION CENTRE - Titre (composants seulement) */}
      {shouldShowTitle && (
        <div className="header-title">
          <h1>{title}</h1>
        </div>
      )}
      
      {/* SECTION DROITE - Actions */}
      <div className="header-actions">
        {/* GoogleAuth */}
        <div className="mobile-google-auth-container">
          <GoogleAuth 
            key={`mobile-auth-${authKey}`}
            onLogin={handleLogin}
            onLogout={handleLogout}
            isHeader={true}
            isMobile={true}
          />
        </div>
        
        {/* Bouton de thème (menu principal seulement) */}
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
          >
            {isDarkMode ? (
              <Sun size={22} strokeWidth={2.5} />
            ) : (
              <Moon size={22} strokeWidth={2.5} />
            )}
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
