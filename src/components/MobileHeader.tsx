import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { LanguageCode, AppMode } from '../types/types';
import './MobileHeader.css';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import subscriptionService, { SubscriptionTier } from '../services/subscriptionService';

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

  const isMainMenu = currentMode === 'menu';
  const shouldShowTitle = !isMainMenu;
  const shouldShowLanguageSelector = isMainMenu && showLanguageSelector && languageCode && onLanguageChange;

  const getHeaderBackground = () =>
    isDarkMode
      ? 'linear-gradient(to right, #cd853f, #8b4513)'
      : 'linear-gradient(to right, #daa520, #f4e4bc)';

  const getTextColor = () => (isDarkMode ? 'white' : '#654321');

  const getButtonBackground = () =>
    isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(101,67,33,0.15)';

  const getButtonHoverBackground = () =>
    isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(101,67,33,0.25)';

  const getSubscriptionButtonStyles = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      return {
        background: isDarkMode
          ? 'linear-gradient(45deg, #ffd700, #ffed4e)'
          : 'linear-gradient(45deg, #f59e0b, #fbbf24)',
        color: isDarkMode ? '#8b4513' : '#654321',
        border: 'none',
        fontWeight: '700'
      };
    }
    return {
      background: getButtonBackground(),
      color: getTextColor(),
      border: 'none',
      fontWeight: '600'
    };
  };

  const handleSubscriptionClick = () => {
    console.log('[MobileHeader] Subscription button clicked');
    onOpenSubscription?.();
  };

  return (
    <header
      ref={headerRef}
      className={`mobile-header ${isDarkMode ? 'dark' : 'light'} ${isMainMenu ? 'main-menu' : 'component-view'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isMainMenu ? 'space-between' : 'flex-end',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        padding: '0 12px',
        background: getHeaderBackground(),
        color: getTextColor(),
        zIndex: 1000,
        boxShadow: isDarkMode
          ? '0px 4px 8px rgba(139, 69, 19, 0.3)'
          : '0px 4px 8px rgba(218, 165, 32, 0.3)',
      }}
    >
      {/* Zone gauche */}
      {isMainMenu && (
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {onOpenSubscription && (
            <motion.button
              onClick={handleSubscriptionClick}
              className="subscription-status-button"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={{
                ...getSubscriptionButtonStyles(),
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              {currentSubscriptionTier === SubscriptionTier.PREMIUM ? '⭐' : '🆓'}
            </motion.button>
          )}

          {shouldShowLanguageSelector && (
            <LanguageSelector value={languageCode!} onChange={onLanguageChange!} />
          )}
        </div>
      )}

      {/* Titre centré uniquement dans les composants */}
      {shouldShowTitle && (
        <div className="header-title" style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', color: getTextColor() }}>{title}</h1>
        </div>
      )}

      {/* Zone droite */}
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GoogleAuth
          onLogin={onLogin}
          onLogout={onLogout}
          isHeader={true}
          hideLogo={true} // ✅ NOUVELLE PROP pour supprimer le logo Google
        />

        {isMainMenu && (
          <motion.button
            onClick={toggleTheme}
            className="theme-toggle-button"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            style={{
              background: getButtonBackground(),
              color: getTextColor(),
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
