import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  RotateCw, 
  MessageSquare, 
  Book, 
  Moon,
  Sun,
  XSquare,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { 
  BarChart, 
  Award, 
  Lock 
} from './common/EmojiIcons';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from './LanguageSelector';
import { LanguageCode, LearnedSentence } from '../types/types';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import './MainMenu.css';
import { useSecureAuth, useFeatureAccess } from '../hooks/useSecureAuth';
import { SubscriptionTier } from '../services/subscriptionService'; // Garder juste le type
import PremiumButton from './PremiumButton';
import './mobile-fixes.css';

// Types pour TypeScript
export type AppMode = 
  | 'menu' 
  | 'learn' 
  | 'review' 
  | 'quiz' 
  | 'sentenceConstruction' 
  | 'sentenceGap' 
  | 'grammar'
  | 'exercise'
  | 'progression';

export type MainTab = 'learn' | 'review' | 'games' | 'stats';
export type SubModule = 
  | 'vocabulary' 
  | 'construction' 
  | 'grammar' 
  | 'revision' 
  | 'quiz' 
  | 'sentenceGap' 
  | 'exercises' 
  | 'progression';

// Interface pour les props
interface MainMenuProps {
  onSelectMode: (mode: AppMode) => void;
  reviewDue: boolean;
  onResetProgress: () => void;
  learnedWordsCount: number;
  languageCode: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  isMobileView?: boolean;
  revisionProgress?: {
    wordsToReview: Set<string>;
  };
  onLogin?: (response: any) => void;
  onLogout?: () => void;
  onForceLoginPage?: () => void; 
  userProgress?: any;
  completedCategories?: string[];
  onOpenSubscription?: () => void;
  subscriptionTier?: SubscriptionTier;
  refreshTrigger?: number;
  onResetQuotas?: () => void;
  // Prop pour définir l'onglet initial
  initialTab?: MainTab;
  isFirstVisit?: boolean;
}

// Points XP par mot/élément appris
const XP_PER_ELEMENT = 10;

// Définition des niveaux
const LEVELS = [
  { threshold: 0, required: 250 },       // Niveau 1: 0-250
  { threshold: 250, required: 500 },     // Niveau 2: 250-750
  { threshold: 750, required: 750 },     // Niveau 3: 750-1500
  { threshold: 1500, required: 1000 },   // Niveau 4: 1500-2500
  { threshold: 2500, required: 1500 },   // Niveau 5: 2500-4000
  { threshold: 4000, required: 2000 },   // Niveau 6: 4000-6000
  { threshold: 6000, required: 2500 },   // Niveau 7: 6000-8500
  { threshold: 8500, required: 3000 },   // Niveau 8: 8500-11 500
  { threshold: 11500, required: 4000 },  // Niveau 9: 11 500-15 500
  { threshold: 15500, required: 4500 }   // Niveau 10: 15 500-20 000
];

// Descriptions des niveaux
const LEVEL_DESCRIPTIONS = {
  1: "Germe",
  2: "Jeune pousse",
  3: "Feuillage léger",
  4: "Tige enracinée",
  5: "Petit palmier",
  6: "Floraison",
  7: "Arbre mature",
  8: "Arbre vénérable",
  9: "Sage du bois sacré",
  10: "Maître Baobab"
} as const;

// Badges des niveaux
const BADGES = {
  1: "🌱",       // Germe – Commencement
  2: "🌿",       // Jeune pousse – Croissance initiale
  3: "🍃",       // Feuillage – Expansion
  4: "🌾",       // Herbe haute – Stabilité et enracinement
  5: "🌴",       // Petit palmier – Résilience
  6: "🌻",       // Floraison – Épanouissement
  7: "🌳",       // Arbre mature – Force
  8: "🌳✨",     // Arbre vénérable – Respecté
  9: "🌳🌀",     // Arbre mystique – Savoir profond
  10: "🌳👑"     // **Maître Baobab** – Souveraineté, sagesse, vie
} as const;

// Variants d'animation optimisés
const mobileVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  hover: {},
  tap: {}
};

const desktopVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.3 } },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

// Variants pour les éléments de menu
const menuItemMobileVariants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  hover: {},
  tap: {}
};

const menuItemDesktopVariants = {
  hidden: { opacity: 0, y: 20, scale: 1 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut"
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: {
    y: 0,
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Fonction pour récupérer le nombre de phrases apprises
const getLearnedSentencesCount = (languageCode: LanguageCode): number => {
  const storageKey = `sentence-construction-progress-${languageCode}`;
  try {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress) as LearnedSentence[];
      return progress.filter(p => p.mastered).length;
    }
  } catch (error) {
    console.error('Erreur lors du calcul des phrases apprises:', error);
  }
  return 0;
};

// Fonction pour calculer le niveau basé sur l'XP
const calculateXPLevel = (words: number, languageCode: LanguageCode) => {
  const totalXP = parseInt(localStorage.getItem(`${languageCode}-totalXP`) || '0');
  
  if (totalXP === 0) {
    const uniqueWords = new Set<string>();
    
    try {
      const progressKey = `${languageCode}-progress`;
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        const learned = parsed.learnedWords || [];
        learned.forEach((word: string) => {
          const cleanWord = word.split('(')[0].trim();
          uniqueWords.add(cleanWord);
        });
      }
    } catch (e) {
      console.error("Erreur lors de la récupération des mots appris:", e);
    }
    
    const learnedSentences = getLearnedSentencesCount(languageCode);
    const totalElements = uniqueWords.size + learnedSentences;
    const calculatedXP = totalElements * XP_PER_ELEMENT;
    localStorage.setItem(`${languageCode}-totalXP`, calculatedXP.toString());
    
    console.log(`📊 XP calculé pour ${languageCode}: ${calculatedXP} (${uniqueWords.size} mots + ${learnedSentences} phrases)`);
  }
  
  const finalXP = parseInt(localStorage.getItem(`${languageCode}-totalXP`) || '0');

  let currentLevel = 1;
  let currentThreshold = 0;
  let requiredXP = LEVELS[0].required;

  for (let i = 0; i < LEVELS.length; i++) {
    if (finalXP >= LEVELS[i].threshold) {
      currentLevel = i + 1;
      currentThreshold = LEVELS[i].threshold;
      requiredXP = LEVELS[i].required;
    } else {
      break;
    }
  }

  const progressInCurrentLevel = finalXP - currentThreshold;
  const progressPercent = Math.min(1, progressInCurrentLevel / requiredXP);

  return {
    level: currentLevel,
    progress: progressPercent,
    totalXP: finalXP,
    xpForNextLevel: currentThreshold + requiredXP,
    remainingXP: requiredXP - progressInCurrentLevel,
    description: LEVEL_DESCRIPTIONS[currentLevel as keyof typeof LEVEL_DESCRIPTIONS],
    totalElements: Math.floor(finalXP / XP_PER_ELEMENT),
  };
};

const MainMenu: React.FC<MainMenuProps> = ({
  onSelectMode,
  reviewDue,
  onResetProgress,
  learnedWordsCount,
  languageCode,
  onForceLoginPage,
  onLanguageChange,
  isMobileView = false,
  revisionProgress = { wordsToReview: new Set<string>() },
  onLogin,
  onLogout,
  userProgress,
  completedCategories = [],
  onOpenSubscription,
  subscriptionTier = SubscriptionTier.FREE,
  refreshTrigger,
  onResetQuotas,
  initialTab = 'learn'
}) => {

   const { 
    subscription, 
    checkAccess, 
    isLoadingSubscription 
  } = useSecureAuth();

  // ✅ NOUVEAU : État pour l'abonnement
  const [currentSubscriptionTier, setCurrentSubscriptionTier] = useState<SubscriptionTier>(
    subscription?.tier === 'premium' ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE
  );

  const { theme, toggleTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<MainTab>(initialTab);
  const [subModule, setSubModule] = useState<SubModule | null>(null);
  const [showNoReviewMessage, setShowNoReviewMessage] = useState<boolean>(false);
  const [showSubscriptionTooltip, setShowSubscriptionTooltip] = useState<string | null>(null);
  
  // État pour la largeur d'écran
  const [screenWidth, setScreenWidth] = useState<number>(0);
  
 
  
  const renderCountRef = useRef(0);

  // État pour l'initialisation
  const [hasInitialized, setHasInitialized] = useState(false);

  // Surveiller les changements d'abonnement (nouveau)
 useEffect(() => {
  if (subscription) {
    const newTier = subscription.isPremium ? SubscriptionTier.PREMIUM : SubscriptionTier.FREE;
    if (newTier !== currentSubscriptionTier) {
      console.log('[MainMenu] Changement abonnement:', newTier);
      setCurrentSubscriptionTier(newTier);
    }
  }
}, [subscription, currentSubscriptionTier]);

  // Fonctions helper pour le bouton d'abonnement (nouvelles)
  const getSubscriptionButtonStyles = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      // Utilisateur Premium - bouton doré
      return {
        background: theme === 'dark' 
          ? 'linear-gradient(45deg, #ffd700, #ffed4e)' 
          : 'linear-gradient(45deg, #f59e0b, #fbbf24)',
        color: theme === 'dark' ? '#8b4513' : '#654321',
        border: `2px solid ${theme === 'dark' ? '#ffd700' : '#f59e0b'}`,
        boxShadow: `0 2px 8px ${theme === 'dark' ? 'rgba(255, 215, 0, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
        fontWeight: '700'
      };
    } else {
      // Utilisateur gratuit - style ocre/sable
      return {
        background: theme === 'dark'
          ? 'linear-gradient(45deg, #cd853f, #8b4513)'
          : 'linear-gradient(45deg, #daa520, #f4e4bc)',
        color: 'white',
        border: `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: theme === 'dark'
          ? '0 4px 12px rgba(139, 69, 19, 0.4)'
          : '0 4px 12px rgba(218, 165, 32, 0.3)',
        fontWeight: '600'
      };
    }
  };

 const getSubscriptionButtonText = () => {
  if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
    // ✅ NOUVEAU : Utiliser les données de subscription sécurisée
    if (subscription?.billingPeriod === 'yearly') {
      return 'Premium Annuel';
    } else {
      return 'Premium';
    }
  } else {
    return 'Passer à Premium';
  }
};

  const getSubscriptionIcon = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      return '⭐';
    } else {
      return '🚀';
    }
  };

  const getButtonHoverStyles = () => {
    if (currentSubscriptionTier === SubscriptionTier.PREMIUM) {
      return {
        transform: 'scale(1.05)',
        boxShadow: `0 6px 16px ${theme === 'dark' ? 'rgba(255, 215, 0, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`
      };
    } else {
      return {
        transform: 'translateY(-2px)',
        boxShadow: theme === 'dark'
          ? '0 6px 16px rgba(139, 69, 19, 0.5)'
          : '0 6px 16px rgba(218, 165, 32, 0.4)'
      };
    }
  };

  // Configuration des modules avec useMemo pour éviter les re-renders
  const modules = useMemo(() => ({
    learn: [
      { 
        id: 'vocabulary' as SubModule, 
        mode: 'learn' as AppMode,
        label: 'Vocabulaire', 
        icon: <BookOpen size={24} />, 
        color: '#10b981', 
        bgColor: '#d1fae5',
        borderColor: '#a7f3d0',
        premium: false,
        feature: 'learn_basic',
        description: 'Apprenez de nouveaux mots'
      },
      { 
        id: 'construction' as SubModule, 
        mode: 'sentenceConstruction' as AppMode,
        label: 'Construction', 
        icon: <Book size={24} />, 
        color: '#f59e0b', 
        bgColor: '#fef3c7',
        borderColor: '#fde68a',
        premium: true,
        feature: 'sentence_construction',
        description: 'Créez vos propres phrases'
      },
      { 
        id: 'grammar' as SubModule, 
        mode: 'grammar' as AppMode,
        label: 'Grammaire', 
        icon: <Book size={24} />, 
        color: '#EC4899', 
        bgColor: '#fce7f3',
        borderColor: '#fbcfe8',
        premium: true,
        feature: 'grammar_full',
        description: 'Apprenez la grammaire'
      }
    ],
    review: [
      { 
        id: 'revision' as SubModule, 
        mode: 'review' as AppMode,
        label: 'Révision', 
        icon: <RotateCw size={24} />, 
        color: '#3b82f6', 
        bgColor: '#dbeafe',
        borderColor: '#bfdbfe',
        premium: false,
        feature: 'revision_basic',
        description: 'Révisez les mots appris'
      }
    ],
    games: [
      { 
        id: 'quiz' as SubModule, 
        mode: 'quiz' as AppMode,
        label: 'Quiz', 
        icon: <Book size={24} />, 
        color: '#8b5cf6', 
        bgColor: '#ede9fe',
        borderColor: '#ddd6fe',
        premium: false,
        feature: 'quiz_basic',
        description: 'Testez vos connaissances'
      },
      { 
        id: 'sentenceGap' as SubModule, 
        mode: 'sentenceGap' as AppMode,
        label: 'Phrases à trous', 
        icon: <MessageSquare size={24} />, 
        color: '#6366f1', 
        bgColor: '#e0e7ff',
        borderColor: '#c7d2fe',
        premium: true,
        feature: 'sentence_gap',
        description: 'Complétez les phrases'
      },
      { 
       id: 'exercises' as SubModule, 
      mode: 'exercise' as AppMode,
      label: 'Exercices', 
      icon: <Book size={24} />, 
      color: '#8b5cf6', 
      bgColor: '#ede9fe',
      borderColor: '#ddd6fe',
      premium: true,                    // ✅ CORRECTION: Changer de false à true
      feature: 'exercise_unlimited',    // ✅ CORRECTION: Feature Premium
      description: 'Exercices pratiques'
      }
    ],
    stats: [
      { 
        id: 'progression' as SubModule, 
        mode: 'progression' as AppMode,
        label: 'Statistiques', 
        icon: <BarChart size={24} />, 
        color: '#0ea5e9', 
        bgColor: '#e0f2fe',
        borderColor: '#bae6fd',
        premium: false,
        feature: 'progress_stats_basic',
        description: 'Suivez vos progrès'
      }
    ]
  }), [currentSubscriptionTier]);

  useEffect(() => {
    // Synchroniser avec initialTab seulement si on n'a pas encore initialisé
    if (!hasInitialized && initialTab !== activeTab) {
      console.log(`🔄 INITIALISATION - Changement d'onglet initial: ${activeTab} -> ${initialTab}`);
      setActiveTab(initialTab);
      
      if (modules[initialTab] && modules[initialTab].length > 0) {
        const defaultModule = modules[initialTab][0].id;
        console.log(`🔄 INITIALISATION - Module par défaut pour onglet ${initialTab}: ${defaultModule}`);
        setSubModule(defaultModule);
      } else {
        setSubModule(null);
      }
      
      setHasInitialized(true);
    }
  }, [initialTab, activeTab, modules, hasInitialized]);

  // useEffect pour surveiller la largeur d'écran
  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      console.log(`📐 Largeur écran détectée: ${newWidth}px`);
      setScreenWidth(newWidth);
    };

    // Initialisation immédiate
    handleResize();
    
    // Écouter les changements de taille
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Log lors de chaque render
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`MainMenu render #${renderCountRef.current}, mobile: ${isMobileView}, screenWidth: ${screenWidth}px, activeTab: ${activeTab}, initialTab: ${initialTab}`);
  });

  // Force mobile display avec grid fix
  useEffect(() => {
    if (isMobileView && screenWidth > 0) {
      console.log('🔧 FORCE MOBILE DISPLAY - Version corrigée avec grid');
      
      const forceMobileDisplay = () => {
        // 1. Forcer les conteneurs principaux
        const containers = [
          '.mobile-app-container',
          '.mobile-main-content', 
          '.modern-main-container'
        ];
        
        containers.forEach(selector => {
          const element = document.querySelector(selector) as HTMLElement;
          if (element) {
            element.style.cssText = `
              display: block !important;
              width: 100% !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: relative !important;
              z-index: 1000 !important;
              transform: none !important;
              background-color: #0f172a !important;
            `;
            console.log(`✅ Container forcé: ${selector}`);
          }
        });

        // 2. Forcer les éléments du menu SANS écraser les couleurs
        const menuElements = [
          '.modern-logo-container',
          '.modern-level-card', 
          '.modern-menu-container',
          '.modern-section-title'
        ];
        
        menuElements.forEach(selector => {
          const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
          elements.forEach(el => {
            // Préserver les styles existants
            const currentBg = el.style.backgroundColor;
            const currentColor = el.style.color;
            const currentBorder = el.style.borderColor;
            
            el.style.cssText = `
              display: block !important;
              opacity: 1 !important;
              visibility: visible !important;
              position: relative !important;
              transform: none !important;
              z-index: 1003 !important;
              ${currentBg ? `background-color: ${currentBg} !important;` : ''}
              ${currentColor ? `color: ${currentColor} !important;` : ''}
              ${currentBorder ? `border-color: ${currentBorder} !important;` : ''}
            `;
          });
          if (elements.length > 0) {
            console.log(`✅ Éléments menu forcés: ${selector} (${elements.length})`);
          }
        });

        // 3. Forcer la grille avec la bonne configuration
        const menuGrids = document.querySelectorAll('.modern-menu-grid') as NodeListOf<HTMLElement>;
        menuGrids.forEach(el => {
          // Calculer les colonnes selon la largeur actuelle
          let columns = '1fr';
          if (screenWidth > 600) {
            columns = '1fr 1fr 1fr';
          } else if (screenWidth > 480) {
            columns = '1fr 1fr';
          }
          
          el.style.cssText = `
            display: grid !important;
            grid-template-columns: ${columns} !important;
            gap: 12px !important;
            width: 100% !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            z-index: 1006 !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 15px 0 !important;
          `;
          console.log(`✅ Grille forcée avec ${columns} pour largeur ${screenWidth}px`);
        });

        // 4. Préserver les couleurs des items de menu
        const menuItems = document.querySelectorAll('.modern-menu-item') as NodeListOf<HTMLElement>;
        console.log(`🔍 Nombre d'items de menu trouvés: ${menuItems.length}`);
        
        menuItems.forEach((el, index) => {
          // Récupérer les couleurs depuis les styles computed
          const computedStyle = window.getComputedStyle(el);
          const currentBg = computedStyle.backgroundColor;
          const currentColor = computedStyle.color;
          const currentBorder = computedStyle.borderColor;
          
          // Appliquer les styles sans écraser les couleurs
          el.style.cssText = `
            display: flex !important;
            align-items: center !important;
            padding: 15px !important;
            width: 100% !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
            z-index: ${1007 + index} !important;
            border-radius: 12px !important;
            margin-bottom: 12px !important;
            cursor: pointer !important;
            position: relative !important;
            box-sizing: border-box !important;
            background-color: ${currentBg} !important;
            color: ${currentColor} !important;
            border-color: ${currentBorder} !important;
          `;
          console.log(`✅ Item de menu forcé: ${index} (couleurs préservées)`);
        });

        // 5. Navigation bottom
        const bottomNav = document.querySelector('.bottom-navigation') as HTMLElement;
        if (bottomNav) {
          bottomNav.style.cssText = `
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 70px !important;
            background: #1e293b !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-around !important;
            z-index: 10000 !important;
            opacity: 1 !important;
            visibility: visible !important;
            transform: none !important;
          `;
          console.log('✅ Navigation bottom forcée');
        }

        console.log('🎯 FORCE MOBILE DISPLAY terminé');
      };

      // Un seul appel immédiat + surveillance simple
      forceMobileDisplay();
      
      // Surveillance allégée
      const monitoringInterval = setInterval(() => {
        const menuItems = document.querySelectorAll('.modern-menu-item');
        if (menuItems.length === 0) {
          console.log('⚠️ Items de menu disparus, correction...');
          forceMobileDisplay();
        }
      }, 3000);

      return () => {
        clearInterval(monitoringInterval);
      };
    }
  }, [isMobileView, screenWidth]);

  // Surveillance XP
  useEffect(() => {
    const handleXPUpdate = (event: CustomEvent) => {
      console.log('🏆 MainMenu - Événement XP reçu:', event.detail);
      
      const { newTotal, gained, source } = event.detail;
      console.log(`✨ XP mis à jour: +${gained} XP (${source}) - Total: ${newTotal} XP`);
    };
    
    window.addEventListener('xpUpdated', handleXPUpdate as EventListener);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXPUpdate as EventListener);
    };
  }, []);
  
  // Calculer l'XP et le niveau
  const levelInfo = calculateXPLevel(learnedWordsCount, languageCode);
  const currentBadge = BADGES[Math.min(levelInfo.level, 6) as keyof typeof BADGES];

  // Nouvelle fonction auxiliaire pour éviter la duplication de code
 // ✅ NOUVEAU : Vérification sécurisée
const checkAndSelectModule = async (tabId: MainTab, moduleId: SubModule, module: any) => {
  console.log(`🔍 [DEBUG] checkAndSelectModule - Module:`, {
    id: moduleId,
    label: module.label,
    premium: module.premium,
    feature: module.feature
  });
  
  if (module.premium) {
    console.log(`🔒 [DEBUG] Vérification accès sécurisé pour: ${module.feature}`);
    
    try {
      const hasAccess = await checkAccess(module.feature);
      console.log(`🔒 [DEBUG] Résultat vérification: ${hasAccess}`);
      
      if (!hasAccess) {
        console.log(`❌ [DEBUG] Accès refusé par le serveur`);
        if (onOpenSubscription) {
          console.log(`🔄 [DEBUG] Ouverture du modal d'abonnement`);
          onOpenSubscription();
          return;
        }
      } else {
        console.log(`✅ [DEBUG] Accès autorisé par le serveur`);
      }
    } catch (error) {
      console.error(`❌ [DEBUG] Erreur vérification accès:`, error);
      if (onOpenSubscription) {
        onOpenSubscription();
        return;
      }
    }
  } else {
    console.log(`🆓 [DEBUG] Module gratuit - accès direct`);
  }
  
  console.log(`🚀 [DEBUG] Exécution onSelectMode("${module.mode}")`);
  onSelectMode(module.mode);
};
  // Fonction handleModuleSelect simplifiée
 const handleModuleSelect = async (tabId: MainTab, moduleId: SubModule, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    console.log(`🎯 handleModuleSelect appelé: tabId=${tabId}, moduleId=${moduleId}, activeTab=${activeTab}, isMobile=${isMobileView}`);
    
    // Pour mobile, toujours traiter le clic immédiatement
    if (isMobileView) {
      console.log('📱 Mode mobile détecté - traitement immédiat du clic');
      
      // Changer d'onglet si nécessaire
      if (activeTab !== tabId) {
        console.log(`📱 Changement d'onglet mobile: ${activeTab} -> ${tabId}`);
        setActiveTab(tabId);
      }
      
      // Sélectionner le module
      setSubModule(moduleId);
      
      // Trouver le module et exécuter l'action
      const selectedModule = modules[tabId].find(m => m.id === moduleId);
      if (!selectedModule) {
        console.error(`❌ Module non trouvé: ${moduleId} dans l'onglet ${tabId}`);
        return;
      }
      
      console.log(`📱 Module trouvé: ${selectedModule.label}, mode: ${selectedModule.mode}`);
      
      // Vérifier les accès premium
     if (selectedModule.premium && !subscription?.isPremium) { // ✅ NOUVEAU
  console.log(`🔒 Module premium bloqué: ${moduleId}`);
  if (onOpenSubscription) {
    onOpenSubscription();
    return;
  }
}
      
      // Exécuter l'action immédiatement
      console.log(`🚀 Exécution onSelectMode: ${selectedModule.mode}`);
      onSelectMode(selectedModule.mode);
      return;
    }
    
    // Logique desktop inchangée
    if (activeTab !== tabId) {
      console.log(`🖥️ Module appartient à un autre onglet (${tabId}), changement d'onglet d'abord`);
      
      setActiveTab(tabId);
      
      setTimeout(() => {
        const targetModule = modules[tabId].find(m => m.id === moduleId);
        if (targetModule) {
          console.log(`🖥️ Après changement d'onglet, sélection du module: ${moduleId}`);
          setSubModule(moduleId);
          checkAndSelectModule(tabId, moduleId, targetModule);
        }
      }, 350);
      
      return;
    }
    
    setSubModule(moduleId);
    
    const selectedModule = modules[tabId].find(m => m.id === moduleId);
    if (!selectedModule) {
      console.error(`❌ Module non trouvé: ${moduleId} dans l'onglet ${tabId}`);
      return;
    }
    
   await checkAndSelectModule(tabId, moduleId, selectedModule);

  };

  useEffect(() => {
  const handleXPUpdate = (event: CustomEvent) => {
    console.log('🏆 MainMenu - Événement XP reçu:', event.detail);
    
    const { newTotal, gained, source } = event.detail;
    console.log(`✨ XP mis à jour: +${gained} XP (${source}) - Total: ${newTotal} XP`);
    
    // ✅ NOUVEAU : Déclencher une synchronisation XP différée
    if (source !== 'google_drive_sync') {
      setTimeout(() => {
        // Déclencher un événement pour synchroniser l'XP
        window.dispatchEvent(new CustomEvent('syncXPToGoogleDrive'));
      }, 2000); // Attendre 2 secondes pour éviter les appels trop fréquents
    }
  };
  
  window.addEventListener('xpUpdated', handleXPUpdate as EventListener);
  
  return () => {
    window.removeEventListener('xpUpdated', handleXPUpdate as EventListener);
  };
}, []);

  // Effet pour mettre à jour le titre et le contenu lors du changement d'onglet
  useEffect(() => {
    console.log(`🔄 useEffect changement d'onglet détecté: ${activeTab}`);
    
    // Mise à jour immédiate du titre de section
    const updateSectionTitle = () => {
      const sectionTitle = document.querySelector('.modern-section-title span');
      if (sectionTitle) {
        let newTitle = '';
        if (activeTab === 'learn') {
          newTitle = "Modules d'apprentissage";
        } else if (activeTab === 'review') {
          newTitle = "Modules de révision";
        } else if (activeTab === 'games') {
          newTitle = "Modules de jeux";
        } else if (activeTab === 'stats') {
          newTitle = "Statistiques";
        }
        
        console.log(`📝 Mise à jour titre: "${sectionTitle.textContent}" -> "${newTitle}"`);
        sectionTitle.textContent = newTitle;
      }
    };
    
    // Mise à jour immédiate du module par défaut
    const updateDefaultModule = () => {
      if (modules[activeTab] && modules[activeTab].length > 0) {
        const defaultModule = modules[activeTab][0].id;
        console.log(`🎯 Définition du module par défaut pour l'onglet ${activeTab}: ${defaultModule}`);
        setSubModule(defaultModule);
      } else {
        console.log(`⚠️ Aucun module trouvé pour l'onglet ${activeTab}`);
        setSubModule(null);
      }
    };
    
    if (isMobileView) {
      // Version mobile : mise à jour immédiate
      updateSectionTitle();
      updateDefaultModule();
    } else {
      // Version desktop avec animation
      const menuGrid = document.querySelector('.modern-menu-grid');
      if (menuGrid) {
        menuGrid.classList.add('fade-out');
        (menuGrid as HTMLElement).style.pointerEvents = 'none';
        
        setTimeout(() => {
          updateSectionTitle();
          updateDefaultModule();
          
          menuGrid.classList.add('tab-transition');
          menuGrid.classList.remove('fade-out');
          (menuGrid as HTMLElement).style.pointerEvents = 'auto';
          
          setTimeout(() => {
            menuGrid.classList.remove('tab-transition');
          }, 300);
          
          window.dispatchEvent(new Event('resize'));
        }, 300);
      } else {
        // Fallback sans animation
        updateSectionTitle();
        updateDefaultModule();
      }
    }
    
    // Log final pour vérification
    console.log(`✅ Changement d'onglet terminé - activeTab: ${activeTab}, modules disponibles:`, modules[activeTab]?.map(m => m.label));
  }, [activeTab, modules, isMobileView]);

  // Fonction de gestion du changement d'onglet manuel
  const handleTabChange = (tab: MainTab) => {
    if (activeTab === tab) return;
    
    console.log(`🔄 CLIC MANUEL - handleTabChange: ${activeTab} -> ${tab}`);
    
    // Marquer que l'utilisateur a fait un clic manuel
    setHasInitialized(true);
    
    // Changer l'onglet actif
    setActiveTab(tab);
  };

  const handleLogin = onLogin || (() => {});
  const handleLogout = onLogout || (() => {});

  // Choix des variants selon la plateforme
  const getVariants = () => isMobileView ? mobileVariants : desktopVariants;
  const getMenuItemVariants = () => isMobileView ? menuItemMobileVariants : menuItemDesktopVariants;

  // getMobileGridColumns avec state
  const getMobileGridColumns = useMemo(() => {
    if (!isMobileView || screenWidth === 0) return {};
    
    console.log(`🎯 Calcul grid pour largeur: ${screenWidth}px`);
    
    if (screenWidth > 600) {
      console.log('📱 Layout: 3 colonnes (tablette)');
      return { gridTemplateColumns: '1fr 1fr 1fr' };
    } else if (screenWidth > 480) {
      console.log('📱 Layout: 2 colonnes (mobile moyen)');
      return { gridTemplateColumns: '1fr 1fr' };
    } else {
      console.log('📱 Layout: 1 colonne (petit mobile)');
      return { gridTemplateColumns: '1fr' };
    }
  }, [isMobileView, screenWidth]);

  return (
    <div 
      className={`modern-main-container ${theme} ${isMobileView ? 'mobile-view-container' : ''}`}
      style={{
        ...(isMobileView ? {
          display: 'grid !important' as any,
          ...getMobileGridColumns,
          gap: '12px',
          width: '100%',
          maxWidth: '100%',
          margin: '15px 0'
        } : {})
      }}
    >
      {/* Header avec sélecteur de langue - ne l'affiche pas en mode mobile */}
      {!isMobileView && (
        <header className="modern-header">
          <div className="modern-header-left">
            <div className="desktop-language-selector-container">
              <LanguageSelector 
                value={languageCode}
                onChange={onLanguageChange}
              />
            </div>
          </div>
          
         <div className="modern-header-actions">
      {/* ✅ CORRECTION: Toujours afficher le composant GoogleAuth */}
      <div className="header-auth-container">
        <GoogleAuth 
          onLogin={onLogin || (() => {})}
          onLogout={onLogout || (() => {})}
          isHeader={true}
          onForceLoginPage={onForceLoginPage}
        />
      </div>
            
            
            <motion.button 
              onClick={toggleTheme}
              className="modern-theme-button"
              variants={getVariants()}
              whileHover="hover"
              whileTap="tap"
              aria-label="Changer le thème"
            >
              {theme === 'light' ? 
                <Moon size={20} /> : 
                <Sun size={20} />
              }
            </motion.button>
          </div>
        </header>
      )}

      {/* Logo et informations utilisateur */}
      <div 
        className="modern-logo-container"
        style={{
          ...(isMobileView ? {
            textAlign: 'center',
            marginBottom: '20px',
            padding: '10px',
            display: 'block !important' as any,
            opacity: 1,
            visibility: 'visible'
          } : {})
        }}
      >
        <motion.div 
          className="modern-logo-circle"
          variants={getVariants()}
          initial="initial"
          animate="animate"
          style={{
            ...(isMobileView ? {
              width: '60px',
              height: '60px',
              margin: '0 auto 15px auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            } : {})
          }}
        >
          <img 
            src="/assets/logo.jpg" 
            alt="JogoLinga Logo" 
            className="modern-logo-image"
          />
        </motion.div>
        
        <motion.h1 
          className="modern-logo-title"
          variants={getVariants()}
          initial="initial"
          animate="animate"
          style={{
            ...(isMobileView ? {
              fontSize: '24px',
              margin: '0',
              color: 'white'
            } : {})
          }}
        >
          JogoLinga
        </motion.h1>
        
        {/* Bouton d'abonnement unifié - UNIQUEMENT en vue desktop */}
        {!isMobileView && onOpenSubscription && (
          <motion.button
            className="subscription-status-button-desktop"
            onClick={() => {
              console.log('[MainMenu] Clic sur bouton d\'abonnement desktop');
              if (onOpenSubscription) {
                onOpenSubscription();
              }
            }}
            variants={getVariants()}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            aria-label={`Voir l'abonnement - ${getSubscriptionButtonText()}`}
            style={{
              ...getSubscriptionButtonStyles(),
              height: 40,
              borderRadius: 20,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '0 20px',
              opacity: 1,
              visibility: 'visible',
              transition: 'all 0.3s ease',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              maxWidth: 'none',
              overflow: 'visible',
              textOverflow: 'unset',
              margin: '8px 0 0 0',
              minWidth: '180px'
            }}
            onMouseEnter={(e) => {
              const hoverStyles = getButtonHoverStyles();
              Object.assign(e.currentTarget.style, hoverStyles);
            }}
            onMouseLeave={(e) => {
              const baseStyles = getSubscriptionButtonStyles();
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = baseStyles.boxShadow;
            }}
          >
            <span style={{ fontSize: '16px' }}>
              {getSubscriptionIcon()}
            </span>
            <span style={{ 
              fontSize: '14px',
              fontWeight: 'inherit',
              letterSpacing: '0.5px'
            }}>
              {getSubscriptionButtonText()}
            </span>
          </motion.button>
        )}
      </div>

      {/* Niveau et progression avec style ludique */}
      <motion.div 
        className="modern-level-card"
        variants={getVariants()}
        initial="initial"
        animate="animate"
        style={{
          ...(isMobileView ? {
            borderRadius: '12px',
            padding: '15px',
            margin: '15px 0',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            display: 'block !important' as any,
            opacity: 1,
            visibility: 'visible'
          } : {})
        }}
      >
        <div className="modern-decoration"></div>
        
        <div 
          className="modern-level-info"
          style={{
            ...(isMobileView ? {
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              flexWrap: 'wrap'
            } : {})
          }}
        >
          <div className="modern-badge">
            <span>{currentBadge}</span>
          </div>
          <div className="modern-level-text">
            <h2 className="modern-level-title">Niveau {levelInfo.level}</h2>
            <p className="modern-level-description">{levelInfo.description}</p>
          </div>
        </div>
        
        <div 
          className="modern-progress-bar"
          style={{
            ...(isMobileView ? {
              width: '100%',
              height: '8px',
              borderRadius: '4px',
              margin: '15px 0',
              overflow: 'hidden'
            } : {})
          }}
        >
          <motion.div 
            className="modern-progress-fill"
            custom={levelInfo.progress}
            initial={{ width: 0 }}
            animate={{ 
              width: `${levelInfo.progress * 100}%`,
              transition: { delay: 0.5, duration: 0.8 } 
            }}
          >
            {[20, 40, 60, 80].map((pos) => (
              <div key={pos} className="modern-progress-marker" style={{ left: `${pos}%` }}>
                <div className="modern-marker-line"></div>
              </div>
            ))}
          </motion.div>
        </div>
        
        <div 
          className="modern-progress-stats"
          style={{
            ...(isMobileView ? {
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              fontSize: '12px'
            } : {})
          }}
        >
          <div className="modern-stat-badge modern-stat-badge-primary">
            {levelInfo.totalXP}/{levelInfo.xpForNextLevel} XP
          </div>
          <div className="modern-stat-badge modern-stat-badge-secondary">
            {levelInfo.remainingXP} XP avant niveau {Math.min(levelInfo.level + 1, 6)}
          </div>
        </div>
      </motion.div>

      {/* Onglets pour navigation desktop - UNIQUEMENT sur desktop */}
      {!isMobileView && (
        <motion.div 
          className="desktop-tabs"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button 
            className={`desktop-tab ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => handleTabChange('learn')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BookOpen className="desktop-tab-icon" size={16} />
            <span>Apprendre</span>
          </motion.button>
          
          <motion.button 
            className={`desktop-tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => handleTabChange('review')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCw className="desktop-tab-icon" size={16} />
            <span>Réviser</span>
          </motion.button>
          
          <motion.button 
            className={`desktop-tab ${activeTab === 'games' ? 'active' : ''}`}
            onClick={() => handleTabChange('games')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Book className="desktop-tab-icon" size={16} />
            <span>Pratiquer</span>
          </motion.button>
          
          <motion.button 
            className={`desktop-tab ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => handleTabChange('stats')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <BarChart className="desktop-tab-icon" size={16} />
            <span>Stats</span>
          </motion.button>
        </motion.div>
      )}
      
      {/* Conteneur pour les modules avec classe spéciale no-phantom-clicks */}
      <div 
        className="modern-menu-container no-phantom-clicks"
        style={{
          ...(isMobileView ? {
            width: '100%',
            margin: '20px 0',
            display: 'block !important' as any,
            opacity: 1,
            visibility: 'visible'
          } : {})
        }}
      >
        <motion.h3 
          className="modern-section-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ position: 'relative', zIndex: 5 }}
        >
          <span>
            {activeTab === 'learn' ? 'Modules d\'apprentissage' : 
             activeTab === 'review' ? 'Modules de révision' : 
             activeTab === 'games' ? 'Modules de jeux' : 'Statistiques'}
          </span>
        </motion.h3>

        <div className="menu-grid-wrapper" style={{ position: 'relative', zIndex: 5 }}>
          <div 
            key={`tab-grid-${activeTab}`}
            className={`modern-menu-grid ${activeTab === 'learn' ? 'learn-grid' : 
                                        activeTab === 'review' ? 'review-grid' : 
                                        activeTab === 'games' ? 'games-grid' : 'stats-grid'}`}
            style={{
              position: 'relative',
              zIndex: 6,
              ...(isMobileView ? {
                display: 'grid !important' as any,
                ...getMobileGridColumns,
                gap: '12px',
                width: '100%',
                maxWidth: '100%',
                margin: '15px 0'
              } : {})
            }}
          >
            <AnimatePresence>
              {modules[activeTab].map((module, index) => (
                <motion.div
                  key={`${activeTab}-${module.id}`}
                  custom={index}
                  variants={getMenuItemVariants()}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: 20 }}
                  whileHover={isMobileView ? {} : "hover"}
                  whileTap={isMobileView ? {} : "tap"}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    console.log(`🖱️ Clic sur module: ${module.label} (${module.id}) dans onglet ${activeTab}`);
                    handleModuleSelect(activeTab, module.id, e);
                  }}
                 className={`modern-menu-item ${module.premium && !subscription?.isPremium ? 'premium-locked' : ''} ${subModule === module.id ? 'active' : ''}`}
                  onMouseEnter={() => {
                   if (module.premium && !subscription?.isPremium) {
                      setShowSubscriptionTooltip(module.id);
                    }
                  }}
                  onMouseLeave={() => setShowSubscriptionTooltip(null)}
                  style={{
                    backgroundColor: module.bgColor,
                    borderColor: module.borderColor,
                    color: module.color,
                    position: 'relative',
                    zIndex: 10,
                    ...(isMobileView ? {
                      display: 'flex !important' as any,
                      alignItems: 'center',
                      padding: '15px',
                      borderRadius: '12px',
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      overflow: 'hidden',
                      opacity: 1,
                      visibility: 'visible',
                      transform: 'none'
                    } : {})
                  }}
                  data-module-id={`${activeTab}-${module.id}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Module ${module.label}`}
                >
                  <div 
                    className="modern-menu-icon"
                    style={{
                      ...(isMobileView ? {
                        marginRight: '15px',
                        flexShrink: 0
                      } : {})
                    }}
                  >
                    {React.cloneElement(module.icon, { color: module.color })}
                  </div>
                  <div 
                    className="modern-menu-content"
                    style={{
                      ...(isMobileView ? {
                        flex: 1,
                        minWidth: 0
                      } : {})
                    }}
                  >
                    <span 
                      className="modern-menu-label"
                      style={{
                        ...(isMobileView ? {
                          fontWeight: 'bold',
                          fontSize: '16px',
                          marginBottom: '4px',
                          display: 'block'
                        } : {})
                      }}
                    >
                      {module.label}
                    </span>
                    <span 
                      className="modern-menu-description"
                      style={{
                        ...(isMobileView ? {
                          fontSize: '13px',
                          opacity: 0.8,
                          display: 'block'
                        } : {})
                      }}
                    >
                      {module.description}
                    </span>
                  </div>
                  
                  {/* Badge de notification pour le mode Révision */}
                  {module.id === 'revision' && reviewDue && (
                    <div className="modern-menu-badge notification"></div>
                  )}
                  
                  {/* Indicateur Premium */}
                  {module.premium && !subscription?.isPremium && (
                    <div className="premium-lock-icon">
                      <Lock size={16} />
                    </div>
                  )}
                  
                  {/* Tooltip Premium */}
                  <AnimatePresence>
                    {showSubscriptionTooltip === module.id && (
                      <motion.div 
                        className="premium-tooltip"
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Award size={16} className="premium-tooltip-icon" />
                        <span>Fonctionnalité Premium</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                 
                  
                  {/* Disponible en Premium */}
                 {module.premium && !subscription?.isPremium && (
                    <div className="premium-upgrade-badge">
                      <Award size={12} />
                      <span>Premium</span>
                    </div>
                  )}
                  
                  {/* Icône de flèche pour l'action */}
                  <div className="menu-item-action">
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Bouton réinitialisation */}
      <motion.button 
        onClick={onResetProgress}
        className="modern-reset-button"
        variants={getVariants()}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <XSquare size={16} />
        <span>Réinitialiser la progression</span>
      </motion.button>

      {/* Message "pas de révision" */}
      <AnimatePresence>
        {showNoReviewMessage && (
          <motion.div 
            className="modern-notification"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            Aucune révision disponible pour le moment
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lien vers la version premium */}
      {currentSubscriptionTier !== SubscriptionTier.PREMIUM && onOpenSubscription && (
        <motion.div 
          className="premium-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>
            Débloquez toutes les fonctionnalités avec 
            <motion.button 
              className="premium-link" 
              onClick={onOpenSubscription}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award size={14} /> Premium
            </motion.button>
          </p>
        </motion.div>
      )}

      {/* Ajout du bouton Premium flottant pour les utilisateurs freemium */}
      {currentSubscriptionTier !== SubscriptionTier.PREMIUM && onOpenSubscription && (
        <PremiumButton 
          onClick={() => {
            onOpenSubscription && onOpenSubscription();
          }}
          withPulse={true}
        />
      )}
      
      {/* Navigation inférieure - UNIQUEMENT SUR MOBILE */}
     {isMobileView && (
  <motion.button 
    onClick={toggleTheme}
    className="mobile-theme-toggle-button"
    variants={getVariants()}
    initial="initial"
    animate="animate"
    whileHover="hover"
    whileTap="tap"
    aria-label={`Passer en mode ${theme === 'dark' ? 'clair' : 'sombre'}`}
    style={{
      width: '100%',
      height: '50px',
      margin: '15px 0',
      borderRadius: '12px',
      border: 'none',
      background: theme === 'dark' 
        ? 'linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))' 
        : 'linear-gradient(45deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02))',
      color: theme === 'dark' ? 'white' : '#333',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: theme === 'dark'
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: `2px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
      backdropFilter: 'blur(10px)'
    }}
  >
    {theme === 'dark' ? (
      <>
        <Sun size={24} strokeWidth={2.5} />
        <span>Mode Clair</span>
      </>
    ) : (
      <>
        <Moon size={24} strokeWidth={2.5} />
        <span>Mode Sombre</span>
      </>
    )}
  </motion.button>
)}
        >
          <div className="bottom-nav-container">
            <button 
              className={`bottom-nav-item ${activeTab === 'learn' ? 'active' : ''}`}
              onClick={() => handleTabChange('learn')}
            >
              <BookOpen size={24} />
              <span className="bottom-nav-label">Apprendre</span>
            </button>
            
            <button 
              className={`bottom-nav-item ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => handleTabChange('review')}
            >
              <RotateCw size={24} />
              <span className="bottom-nav-label">Réviser</span>
            </button>
            
            <button 
              className={`bottom-nav-item ${activeTab === 'games' ? 'active' : ''}`}
              onClick={() => handleTabChange('games')}
            >
              <Book size={24} />
              <span className="bottom-nav-label">Pratiquer</span>
            </button>
            
            <button 
              className={`bottom-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => handleTabChange('stats')}
            >
             <BarChart size={24}  />
              <span className="bottom-nav-label">Stats</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
