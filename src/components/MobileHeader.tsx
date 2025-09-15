import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import LanguageSelector from "./LanguageSelector";
import { LanguageCode, AppMode } from "../types/types";
import "./MobileHeader.css";
import { useTheme } from "./ThemeContext";
import GoogleAuth from "./GoogleAuth";
import subscriptionService, { SubscriptionTier } from "../services/subscriptionService";

const buttonVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
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
  subscriptionTier = SubscriptionTier.FREE,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState<SubscriptionTier>(subscriptionTier);

  // 🔄 Écoute des mises à jour d'abonnement
  useEffect(() => {
    const updateSubscriptionTier = () => {
      setCurrentSubscriptionTier(subscriptionService.getCurrentTier());
    };
    updateSubscriptionTier();
    window.addEventListener("subscriptionUpdated", updateSubscriptionTier);
    return () => window.removeEventListener("subscriptionUpdated", updateSubscriptionTier);
  }, []);

  const isMainMenu = currentMode === "menu";
  const shouldShowTitle = !isMainMenu;
  const shouldShowLanguageSelector = isMainMenu && showLanguageSelector && languageCode && onLanguageChange;

  // 🎨 Styles dynamiques
  const headerBackground = isDarkMode
    ? "linear-gradient(to right, #cd853f, #8b4513)"
    : "linear-gradient(to right, #daa520, #f4e4bc)";
  const textColor = isDarkMode ? "white" : "#654321";
  const buttonBg = isDarkMode ? "rgba(255,255,255,0.15)" : "rgba(101,67,33,0.15)";
  const buttonHoverBg = isDarkMode ? "rgba(255,255,255,0.25)" : "rgba(101,67,33,0.25)";

  const subscriptionStyles =
    currentSubscriptionTier === SubscriptionTier.PREMIUM
      ? {
          background: isDarkMode
            ? "linear-gradient(45deg, #ffd700, #ffed4e)"
            : "linear-gradient(45deg, #f59e0b, #fbbf24)",
          color: isDarkMode ? "#8b4513" : "#654321",
          border: "none",
          fontWeight: "700",
        }
      : {
          background: buttonBg,
          color: textColor,
          border: "none",
          fontWeight: "600",
        };

  const subscriptionIcon = currentSubscriptionTier === SubscriptionTier.PREMIUM ? "⭐" : "🆓";
  const subscriptionTooltip =
    currentSubscriptionTier === SubscriptionTier.PREMIUM
      ? "Premium" + (subscriptionService.getCurrentPlanInfo()?.billingPeriod === "yearly" ? " Annuel" : "")
      : "Version Gratuite";

  return (
    <header
      className={`mobile-header ${isDarkMode ? "dark" : "light"} ${isMainMenu ? "main-menu" : "component-view"}`}
      style={{ background: headerBackground, color: textColor }}
    >
      {/* Zone gauche */}
      {isMainMenu && (
        <div className="header-left">
          {onOpenSubscription && (
            <motion.button
              className="subscription-button"
              onClick={onOpenSubscription}
              title={subscriptionTooltip}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              style={subscriptionStyles}
            >
              {subscriptionIcon}
            </motion.button>
          )}
          {shouldShowLanguageSelector && (
            <LanguageSelector value={languageCode!} onChange={onLanguageChange!} />
          )}
        </div>
      )}

      {/* Titre au centre */}
      {shouldShowTitle && (
        <div className="header-title">
          <h1>{title}</h1>
        </div>
      )}

      {/* Zone droite */}
      <div className="header-actions">
        <GoogleAuth onLogin={onLogin} onLogout={onLogout} isHeader hideLogo /> {/* ✅ logo masqué */}
        {isMainMenu && (
          <motion.button
            className="theme-toggle-button"
            onClick={toggleTheme}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            style={{ background: buttonBg, color: textColor }}
            onMouseEnter={(e) => (e.currentTarget.style.background = buttonHoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = buttonBg)}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;
