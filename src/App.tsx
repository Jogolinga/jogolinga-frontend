/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
//import './components/globals.css'
import './App.css';
import { ThemeProvider } from './components/ThemeContext';
import Privacy from './components/Privacy';
import Terms from './components/Terms';

// Languages import
import { languages, getLanguageData } from './data/languages';
import { type LanguageData } from './types/types';
import { verifyGoogleToken } from './services/authService';
import { resetProgress } from './utils/resetProgress';

// Components imports
import './components/QuizComponent/QuizNavigationButtons.css';
import LearnMode from './components/LearnMode';
import CategorySelection from './components/CategorySelection';
import SentenceConstructionGame from './components/SentenceConstructionGame';
import QuizComponent from './components/QuizComponent/QuizComponent';
import SentenceGapGame from './components/SentenceGapGame';
import CelebrationAnimation from './components/CelebrationAnimation';
import MainMenu, { MainTab } from './components/MainMenu';
import InteractiveMascot from './components/InteractiveMascotte';
import GrammarMode from './components/GrammarMode';
import GoogleAuth from './components/GoogleAuth';
import ConfirmationModal from './components/ConfirmationModal';
import RevisionMode from './components/RevisionMode/RevisionMode';
import LandingPage from './components/LandingPage';
import ProgressStats from './components/ProgressStats';


import { 
  getLastUsedLanguage, 
  saveLastUsedLanguage, 
  isFirstTimeUser, 
  markAppAsUsed,
  getLanguageInfo
} from './constants/languages';

import { GoogleDriveService } from './services/googleDriveService';

import './components/mobile-adjustments.css';
import './components/mobile-transitions.css';
import PullToRefresh from './components/PullToRefresh';
import SwipeNavigationManager from './components/SwipeNavigationManager';
import './components/SwipeNavigationManager.css';
import ExerciseMode from './components/ExerciseMode';

import SubscriptionModal from './components/SubscriptionModal';
import subscriptionService, { SubscriptionTier,  } from './services/subscriptionService';
import paymentService from './services/paymentService';

import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import PaymentSuccessPage from './components/PaymentSuccessPage';

// Utils and types imports
import { transformCategories } from './utils/utils';
import { DEFAULT_USER_PROGRESS } from './utils/resetProgress';
import { 
  WordData, 
  WolofWord,
  AppMode, 
  UserProgress, 
  LearnedWord, 
  LanguageCode, 
  Word,
  AnimatePresenceProps,
  serializeUserProgress,
  deserializeUserProgress,
  SerializedUserProgress
} from './types/types';

// ✅ CORRECTION 1 : Import correct de useRevisionProgress
import { useRevisionProgress } from './hooks/useRevisionProgress';

import MobileHeader from './components/MobileHeader';
import { cleanParentheses } from './utils/cleanParentheses';
import LanguageFirstSelection from './constants/LanguageFirstSelection';

const CORRECT_ANSWERS_TO_LEARN = 3;



function removeWhiteHeader() {
  // Supprimer l'élément blanc en haut si présent
  const whiteHeaders = document.querySelectorAll('.white-header-element, .header-spacer');
  whiteHeaders.forEach(el => {
    if (el) el.remove();
  });
  
  // S'assurer que la classe mobile-view est bien appliquée
  if (window.innerWidth <= 768) {
    document.body.classList.add('mobile-view');
    
    // Appliquer des styles supplémentaires
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.paddingTop = '60px';
    document.body.style.overflowX = 'hidden';
  }
}

// ✅ AJOUT: Fonction de mappage mode -> onglet
const getModeTab = (mode: AppMode): MainTab => {
  switch(mode) {
    case 'learn':
      return 'learn';
    case 'review':
      return 'review';
    case 'quiz':
    case 'sentenceGap':
    case 'exercise':
      return 'games';
    case 'progression':
      return 'stats';
    case 'grammar':
    case 'sentenceConstruction':
      return 'learn'; // Ces modes appartiennent à l'onglet learn
    default:
      return 'learn';
  }
};

interface SaveDataContext {
  mode?: string;
  sessionStats?: any;
  description?: string;
  includeGoogleDrive?: boolean;
  grammarSpecificData?: Array<{
    subcategory: string;
    masteredWords: Array<{
      word: string;
      data: {
        translation: string;
        explanation: string;
        example: string;
        audio?: string;
      };
      correctAnswers: number;
      tested: number;
    }>;
    date: number;
    xpGained: number;
  }>;
  learnSpecificData?: {
    category: string;
    subcategory: string;
    masteredWords: Array<{
      word: string;
      data: {
        translation: string;
        explanation: string;
        example: string;
        audio?: string;
      };
      category: string;
      subcategory: string;
      timestamp: number;
    }>;
    date: number;
    totalScore: number;
    maxScore: number;
    xpGained: number;
  };
  // ✅ NOUVEAU: Ajout pour SentenceConstructionGame
  sentenceSpecificData?: {
    category: string;
    subcategory: string;
    masteredSentences: Array<{
      original: string;
      french: string;
      audio?: string;
      mastered: boolean;
      timestamp: number;
      words: string[];
      category: string;
      attempts: number;
      firstAttemptCorrect: boolean;
    }>;
    date: number;
    totalScore: number;
    maxScore: number;
    xpGained: number;
  };
}

interface SaveDataInput {
  progress: SerializedUserProgress;
  completedCategories: string[];
  totalXP?: number;
  exercises?: {
    grammar?: {
      progress: Array<{
        subcategory: string;
        masteredWords: any[];
        date: number;
        xpGained: number;
      }>;
    };
    learn?: {
      progress: Array<{
        category: string;
        subcategory: string;
        masteredWords: any[];
        date: number;
        totalScore: number;
        maxScore: number;
        xpGained: number;
      }>;
    };
    // ✅ NOUVEAU: Ajout support sentences
     sentenceConstruction?: {
      sentences?: Array<{
        original: string;
        french: string;
        audio?: string;
        category: string;
        timestamp: number;
        nextReview: number;
        type: 'sentence';
        words: string[];
        isCorrect: boolean;
      }>;
      progress?: Array<{
        category: string;
        subcategory: string;
        masteredSentences: Array<{
          original: string;
          french: string;
          audio?: string;
          mastered: boolean;
          timestamp: number;
          words: string[];
          category: string;
          attempts: number;
          firstAttemptCorrect: boolean;
        }>;
        date: number;
        totalScore: number;
        maxScore: number;
        xpGained: number;
      }>;
      metadata?: {
        lastUpdated: number;
        totalSessions: number;
        totalSentences?: number;
        language: string;
      };
    };
  };
  _sessionEndTime?: number;
  _saveSource?: string;
  _description?: string;
  [key: string]: any;
}

const App: React.FC = () => {
  // States
const [currentLanguage, setCurrentLanguage] = useState<LanguageCode | null>(null);
  const [showLanguageSelection, setShowLanguageSelection] = useState(false);
  const [isFirstConnection, setIsFirstConnection] = useState(false);
  const [languageData, setLanguageData] = useState<LanguageData>(languages.wf);
  const [mode, setMode] = useState<AppMode>('menu');
  const [completedCategories, setCompletedCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const [userProgress, setUserProgress] = useState<UserProgress>({
  learnedWords: new Set<string>(),
  wordsToReview: new Set<string>(),
  wordProgress: {},
  recentlyLearnedWords: [],
  language: 'wf' // Valeur temporaire, sera mise à jour
});
  const [reviewDue, setReviewDue] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState<boolean>(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);
  
  // ✅ AJOUT: State pour tracker l'onglet précédent
  const [lastActiveTab, setLastActiveTab] = useState<MainTab>('learn');
  
  const { 
    revisionProgress,
    addWordsToReview,
    getSessionWords,
  } = useRevisionProgress(currentLanguage);
  
  const [sessionLearnedWords, setSessionLearnedWords] = useState<Set<string>>(new Set());
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
  const [navigationHistory, setNavigationHistory] = useState<AppMode[]>(['menu']);
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(SubscriptionTier.FREE);
  const [blockedFeature, setBlockedFeature] = useState<string | null>(null);
  const [premiumFeatureLabel, setPremiumFeatureLabel] = useState<string>('');
  const location = useLocation();
 

  const handleOpenSubscription = () => {
    setShowSubscriptionModal(true);
  };

  // 🔧 FIX 1: Améliorer refreshSubscriptionStatus avec reset des variables
  const refreshSubscriptionStatus = useCallback(() => {
    const tier = subscriptionService.getCurrentTier();
    setSubscriptionTier(tier);
    
    // 🆕 AJOUT: Reset des variables de modal quand Premium détecté
    if (tier === SubscriptionTier.PREMIUM) {
      setBlockedFeature(null);
      setPremiumFeatureLabel('');
      setShowSubscriptionModal(false);
      console.log("✅ Premium détecté - reset modal state");
    }
    
    console.log("Statut d'abonnement rafraîchi:", tier);
  }, []);


 


 

// ✅ PROTECTION ANTI-BOUCLE pour éviter les remontages constants
useEffect(() => {
  if (isMobileView && mode === undefined) {
    console.log("⚠️ Mode undefined en mobile, correction");
    setMode('menu');
  }
}, [isMobileView, mode]);

// ✅ STABILISATION DU RENDU MOBILE
useEffect(() => {
  if (isMobileView) {
    // S'assurer que les styles restent corrects
    if (!document.body.classList.contains('mobile-view')) {
      document.body.classList.add('mobile-view');
    }
    
    // Empêcher les conflits de styles
    const preventStyleConflicts = () => {
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.margin = '0';
      document.body.style.padding = '60px 0 0 0';
    };
    
    preventStyleConflicts();
    
    // Vérifier périodiquement que les styles sont maintenus
    const intervalId = setInterval(preventStyleConflicts, 2000);
    
    return () => clearInterval(intervalId);
  }
}, [isMobileView]);
  
  // Et appelez-la après chaque navigation
  useEffect(() => {
    refreshSubscriptionStatus();
  }, [mode, refreshSubscriptionStatus]);

  useEffect(() => {
    console.log("État du localStorage:", localStorage.getItem('user_subscription'));
    
    const tier = subscriptionService.getCurrentTier();
    console.log("Tier retourné par le service:", tier);
    console.log("Est-ce premium?", tier === SubscriptionTier.PREMIUM);
    console.log("Comparaison de chaînes:", tier.toString() === "premium");
    
    setSubscriptionTier(tier);
  }, []);

  // HOOK DE RÉCUPÉRATION MOBILE POST-RESET
useEffect(() => {
  console.log('🔧 Vérification état mobile:', { mode, selectedCategory, isMobileView });
  
  if (isMobileView) {
    // ✅ PROTECTION contre les états undefined
    if (mode === undefined || mode === null) {
      console.log('⚠️ Mode undefined/null détecté, correction vers menu');
      setMode('menu');
      return;
    }
    
    // ✅ MAINTIEN des styles mobile
    if (!document.body.classList.contains('mobile-view')) {
      console.log('⚠️ Classe mobile-view manquante, correction');
      document.body.classList.add('mobile-view');
      document.body.style.cssText = `
        margin: 0 !important;
        padding: 60px 0 0 0 !important;
        background-color: #0f172a !important;
        min-height: 100vh !important;
        overflow-x: hidden !important;
      `;
    }
  }
}, [isMobileView, mode, selectedCategory, currentLanguage]);

  // ✅ AJOUT : useEffect pour surveiller les changements de revisionProgress
  useEffect(() => {
    console.log('🔄 revisionProgress changé dans App:', {
      wordsToReviewSize: revisionProgress.wordsToReview.size,
      wordsToReviewList: Array.from(revisionProgress.wordsToReview)
    });
  }, [revisionProgress.wordsToReview]);

  const [revisionProgressState, setRevisionProgress] = useState({
    wordsToReview: new Set<string>()
  });

  const handleStartRevision = useCallback((category: string) => {
    setSelectedCategory(category);
    setMode('review');
  }, []);

  const getUniqueLearnedWordsCount = useCallback(() => {
    // Créer un Set de mots nettoyés pour éliminer les doublons
    const uniqueCleanWords = new Set<string>();
    
    // Parcourir tous les mots appris et ajouter leur version nettoyée
    Array.from(userProgress.learnedWords).forEach(word => {
      const cleanWord = cleanParentheses(word);
      uniqueCleanWords.add(cleanWord);
    });
    
    // Faire de même pour les mots appris en session
    Array.from(sessionLearnedWords || []).forEach(word => {
      const cleanWord = cleanParentheses(word);
      uniqueCleanWords.add(cleanWord);
    });
    
    // Retourner le nombre de mots uniques
    return uniqueCleanWords.size;
  }, [userProgress.learnedWords, sessionLearnedWords]);

 

  // Memoized values
  const transformedWords = React.useMemo(() => {
    const transformed = transformCategories(languageData.categories);
    return transformed as Record<string, Word[]>;
  }, [languageData.categories]);

// ===================================================================
// FONCTION loadDataFromGoogleDrive COMPLÈTE - Pour App.tsx
// ===================================================================

const loadDataFromGoogleDrive = useCallback(async () => {
  console.log("===== 🚀 CHARGEMENT DEPUIS GOOGLE DRIVE - VERSION COMPLÈTE =====");
  console.log("🌍 Contexte:", {
    currentLanguage,
    hasUser: !!user,
    hasToken: !!localStorage.getItem('googleToken')
  });
  
  setIsLoading(true);
  
  try {
    const token = localStorage.getItem('googleToken');
    if (!token) {
      console.error("❌ Pas de token Google trouvé dans localStorage");
      setIsLoading(false);
      return;
    }

    console.log("🔑 Token récupéré, création du service Drive");
    const driveService = new GoogleDriveService(token);
    
    console.log(`📡 Tentative de chargement des données pour langue: ${currentLanguage}`);
    const data = await driveService.loadData(currentLanguage);
    
    console.log("📦 Réponse complète de l'API Drive:", {
      hasData: !!data,
      hasProgress: !!data?.progress,
      hasCompletedCategories: !!data?.completedCategories,
      hasTotalXP: data?.totalXP !== undefined,
      hasExercises: !!data?.exercises,
      hasGrammarExercises: !!data?.exercises?.grammar,
      hasGrammarProgress: !!data?.exercises?.grammar?.progress,
      grammarSessionsCount: data?.exercises?.grammar?.progress?.length || 0,
      hasLearnExercises: !!data?.exercises?.learn,
      hasLearnProgress: !!data?.exercises?.learn?.progress,
      learnSessionsCount: data?.exercises?.learn?.progress?.length || 0
    });
    
    if (data?.progress) {
      console.log("✅ 📊 TRAITEMENT DONNÉES GÉNÉRALES DEPUIS GOOGLE DRIVE");
      
      // ===================================================================
      // 1. TRAITEMENT DONNÉES GÉNÉRALES (UserProgress)
      // ===================================================================
      
      let deserializedProgress: UserProgress;
      
      try {
        deserializedProgress = deserializeUserProgress(data.progress as SerializedUserProgress);
        console.log("📊 Progression désérialisée:", {
          learnedWordsSize: deserializedProgress.learnedWords?.size || 0,
          recentlyLearnedWordsLength: deserializedProgress.recentlyLearnedWords?.length || 0,
          language: deserializedProgress.language,
          hasWordProgress: Object.keys(deserializedProgress.wordProgress || {}).length > 0
        });
        
        // ✅ Fusionner avec les données locales existantes si disponibles
        const existingStorageKey = `${currentLanguage}-progress`;
        const existingLocalData = localStorage.getItem(existingStorageKey);
        
        if (existingLocalData) {
          console.log("🔄 Fusion avec données locales existantes");
          const existingData = JSON.parse(existingLocalData);
          const existingProgress = deserializeUserProgress(existingData);
          
          const mergedProgress: UserProgress = {
            ...existingProgress,
            ...deserializedProgress,
            // Fusionner les mots appris (union des Sets)
            learnedWords: new Set([
              ...Array.from(existingProgress.learnedWords || []),
              ...Array.from(deserializedProgress.learnedWords || [])
            ]),
            // Fusionner les mots récents (éviter doublons)
            recentlyLearnedWords: [
              ...Array.from(existingProgress.recentlyLearnedWords || []),
              ...Array.from(deserializedProgress.recentlyLearnedWords || [])
            ].filter((word, index, arr) => 
              arr.findIndex((w: LearnedWord) => w.word === word.word && w.timestamp === word.timestamp) === index
            )
          };
          
          setUserProgress(mergedProgress);
          console.log("✅ Données fusionnées appliquées");
        } else {
          console.log("🆕 Application directe des données Google Drive");
          setUserProgress(deserializedProgress);
        }
        
        // Sauvegarder en localStorage (toujours)
        const serialized = serializeUserProgress(deserializedProgress);
        localStorage.setItem(existingStorageKey, JSON.stringify(serialized));
        console.log("💾 Données sauvegardées en localStorage");
        
      } catch (deserializationError) {
        console.error("❌ Erreur lors de la désérialisation:", deserializationError);
        setIsLoading(false);
        return;
      }
      
      // ===================================================================
      // 2. TRAITEMENT CATÉGORIES COMPLÉTÉES
      // ===================================================================
      
      if (data.completedCategories && Array.isArray(data.completedCategories)) {
        console.log("📁 Traitement catégories complétées:", data.completedCategories);
        
        const existingCategoriesKey = `${currentLanguage}-completedCategories`;
        const existingCategories = localStorage.getItem(existingCategoriesKey);
        const localCategories = existingCategories ? JSON.parse(existingCategories) : [];
        
        const mergedCategories = [
          ...localCategories,
          ...data.completedCategories.filter((cat: string) => !localCategories.includes(cat))
        ];
        
        setCompletedCategories(mergedCategories);
        localStorage.setItem(existingCategoriesKey, JSON.stringify(mergedCategories));
        console.log(`✅ Catégories mises à jour: ${mergedCategories.length} total`);
      }
      
      // ===================================================================
      // 3. TRAITEMENT XP
      // ===================================================================
      
      if (data.totalXP !== undefined && typeof data.totalXP === 'number') {
        console.log(`🏆 Traitement XP depuis Google Drive: ${data.totalXP}`);
        
        const currentLocalXP = parseInt(localStorage.getItem(`${currentLanguage}-totalXP`) || '0');
        const finalXP = Math.max(currentLocalXP, data.totalXP);
        
        if (finalXP !== currentLocalXP) {
          localStorage.setItem(`${currentLanguage}-totalXP`, finalXP.toString());
          console.log(`🏆 XP restauré: ${currentLocalXP} → ${finalXP}`);
          
          window.dispatchEvent(new CustomEvent('xpUpdated', { 
            detail: { 
              newTotal: finalXP, 
              gained: finalXP - currentLocalXP,
              source: 'google_drive_restore'
            } 
          }));
        } else {
          console.log(`🏆 XP déjà à jour: ${currentLocalXP}`);
        }
      }
      
      // ===================================================================
      // 4. SYNCHRONISATION SYSTÈME DE RÉVISION
      // ===================================================================
      
      console.log("🔄 Synchronisation avec le système de révision...");
      
      try {
        const wordsForRevision = Array.from(deserializedProgress.learnedWords || [])
          .map((word: string) => {
            const recentWord = (deserializedProgress.recentlyLearnedWords || [])
              .find((recent: LearnedWord) => recent.word === word);
            
            return {
              word: word,
              category: recentWord?.category || 'Général',
              isGrammar: recentWord?.category === 'Grammaire',
              subCategory: recentWord?.subcategory || '',
              grammarType: 'vocabulary' as const,
              translation: recentWord?.translation || '',
              audio: recentWord?.audio || ''
            };
          })
          .filter(wordData => wordData.word && wordData.word.trim() !== '');
        
        if (wordsForRevision.length > 0 && addWordsToReview) {
          console.log(`📤 Envoi de ${wordsForRevision.length} mots vers le système de révision`);
          await addWordsToReview(wordsForRevision);
          console.log("✅ Mots ajoutés au système de révision");
        } else {
          console.log("📭 Aucun mot à ajouter au système de révision");
        }
        
      } catch (revisionError) {
        console.error("❌ Erreur synchronisation révision (non bloquante):", revisionError);
      }
      
      console.log("✅ 📊 DONNÉES GÉNÉRALES TRAITÉES AVEC SUCCÈS");
      
    } else {
      console.log("📭 Aucune donnée générale trouvée sur Google Drive");
      
      // ✅ INITIALISATION VIDE pour nouveau navigateur
      const initialProgress: UserProgress = {
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [] as LearnedWord[],
        language: currentLanguage
      };
      
      setUserProgress(initialProgress);
      console.log("🆕 Initialisation avec progression vide");
    }
    
    // ===================================================================
    // 5. TRAITEMENT SPÉCIFIQUE DONNÉES GRAMMAIRE
    // ===================================================================
    
    console.log("📚 === DÉBUT TRAITEMENT GRAMMAIRE ===");
    console.log("🔍 Vérification structure données grammaire...");
    console.log("📦 data.exercises:", !!data.exercises);
    console.log("📦 data.exercises?.grammar:", !!data.exercises?.grammar);  
    console.log("📦 data.exercises?.grammar?.progress:", !!data.exercises?.grammar?.progress);
    
    if (data.exercises?.grammar?.progress && Array.isArray(data.exercises.grammar.progress)) {
      console.log("✅ 📚 DONNÉES GRAMMAIRE TROUVÉES SUR GOOGLE DRIVE");
      
      try {
        const grammarStorageKey = `grammar-progress-${currentLanguage}`;
        const driveGrammarSessions = data.exercises.grammar.progress;
        
        console.log(`📚 ${driveGrammarSessions.length} sessions grammaire sur Google Drive:`);
        driveGrammarSessions.forEach((session: any, index: number) => {
          console.log(`  📝 Session ${index + 1}: ${session.subcategory} (${session.masteredWords?.length || 0} mots, date: ${new Date(session.date).toLocaleString()})`);
        });
        
        // ✅ Fusionner avec les données grammaire locales si disponibles
        const existingGrammarData = localStorage.getItem(grammarStorageKey);
        const localGrammarSessions = existingGrammarData ? JSON.parse(existingGrammarData) : [];
        
        console.log(`📱 ${localGrammarSessions.length} sessions grammaire en local`);
        
        let finalGrammarSessions: any[];
        
        if (localGrammarSessions.length === 0) {
          // Aucune donnée locale : Utiliser directement les données Google Drive
          console.log("🆕 Application directe données grammaire Google Drive");
          finalGrammarSessions = [...driveGrammarSessions];
        } else {
          // Fusion intelligente avec les données locales existantes
          console.log("🔄 Fusion intelligente données grammaire");
          
          const mergedSessions = [...localGrammarSessions];
          let addedCount = 0;
          let updatedCount = 0;
          
          driveGrammarSessions.forEach((driveSession: any) => {
            // Chercher une session similaire (même sous-catégorie, date proche)
            const existingIndex = localGrammarSessions.findIndex((localSession: any) => 
              localSession.subcategory === driveSession.subcategory &&
              Math.abs(localSession.date - driveSession.date) < 60000 // 1 minute de tolérance
            );
            
            if (existingIndex === -1) {
              // Session complètement nouvelle
              mergedSessions.push(driveSession);
              addedCount++;
              console.log(`  ➕ Nouvelle session: ${driveSession.subcategory}`);
            } else {
              // Session existante - comparer et prendre la meilleure
              const localSession = mergedSessions[existingIndex];
              const driveWordsCount = driveSession.masteredWords?.length || 0;
              const localWordsCount = localSession.masteredWords?.length || 0;
              
              // Prendre la session avec le plus de mots ou la plus récente
              if (driveWordsCount > localWordsCount || 
                  (driveWordsCount === localWordsCount && driveSession.date > localSession.date)) {
                mergedSessions[existingIndex] = driveSession;
                updatedCount++;
                console.log(`  🔄 Session mise à jour: ${driveSession.subcategory} (${driveWordsCount} vs ${localWordsCount} mots)`);
              } else {
                console.log(`  ✓ Session locale conservée: ${localSession.subcategory}`);
              }
            }
          });
          
          finalGrammarSessions = mergedSessions;
          console.log(`📊 Fusion terminée: ${addedCount} ajoutées, ${updatedCount} mises à jour`);
        }
        
        // ✅ SAUVEGARDE LOCALE DES DONNÉES GRAMMAIRE FUSIONNÉES
        localStorage.setItem(grammarStorageKey, JSON.stringify(finalGrammarSessions));
        console.log(`💾 ${finalGrammarSessions.length} sessions grammaire sauvegardées en localStorage`);
        
        // ✅ CALCUL ET AFFICHAGE DES RÈGLES COMPLÉTÉES
        const allCompletedRules = new Set<string>();
        let totalWordsProcessed = 0;
        
        finalGrammarSessions.forEach((session: any, sessionIndex: number) => {
          console.log(`📝 Traitement session ${sessionIndex + 1}: ${session.subcategory}`);
          
          if (session.masteredWords && Array.isArray(session.masteredWords)) {
            session.masteredWords.forEach((wordData: any, wordIndex: number) => {
              if (wordData.word && typeof wordData.word === 'string') {
                allCompletedRules.add(wordData.word);
                totalWordsProcessed++;
                console.log(`    ✓ Règle ${wordIndex + 1}: ${wordData.word}`);
              } else {
                console.warn(`    ⚠️ Mot invalide dans session ${sessionIndex + 1}, mot ${wordIndex + 1}:`, wordData);
              }
            });
          } else {
            console.warn(`  ⚠️ Session ${sessionIndex + 1} sans masteredWords valide:`, session);
          }
        });
        
        console.log(`📚 RÉSULTAT FINAL GRAMMAIRE:`);
        console.log(`  📊 ${finalGrammarSessions.length} sessions traitées`);
        console.log(`  📊 ${totalWordsProcessed} mots traités au total`);
        console.log(`  📊 ${allCompletedRules.size} règles uniques complétées`);
        console.log(`  📋 Règles:`, Array.from(allCompletedRules));
        
        // ✅ DÉCLENCHEMENT ÉVÉNEMENT AVEC DÉLAI DE SÉCURITÉ
        setTimeout(() => {
          console.log("📢 Déclenchement événement grammarProgressSynced...");
          
          const eventDetail = {
            sessions: finalGrammarSessions,
            language: currentLanguage,
            totalSessions: finalGrammarSessions.length,
            completedRules: Array.from(allCompletedRules),
            totalCompletedRules: allCompletedRules.size,
            source: 'google_drive_load'
          };
          
          console.log("📢 Détails événement:", eventDetail);
          
          window.dispatchEvent(new CustomEvent('grammarProgressSynced', { detail: eventDetail }));
          console.log("✅ Événement grammarProgressSynced déclenché avec succès");
        }, 200); // Délai de sécurité pour s'assurer que tout est prêt
        
        console.log("✅ 📚 DONNÉES GRAMMAIRE TRAITÉES AVEC SUCCÈS");
        
      } catch (grammarError) {
        console.error("❌ ERREUR CRITIQUE lors du traitement grammaire:", grammarError);
        console.error("📋 Stack trace:", grammarError instanceof Error ? grammarError.stack : 'No stack');
        
        // ✅ FALLBACK : Essayer de charger au moins les données locales
        console.log("🔄 Tentative de récupération avec données locales...");
        const grammarStorageKey = `grammar-progress-${currentLanguage}`;
        const fallbackData = localStorage.getItem(grammarStorageKey);
        
        if (fallbackData) {
          try {
            const fallbackSessions = JSON.parse(fallbackData);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('grammarProgressSynced', { 
                detail: { 
                  sessions: fallbackSessions,
                  language: currentLanguage,
                  totalSessions: fallbackSessions.length,
                  source: 'fallback_local'
                } 
              }));
              console.log("✅ Données grammaire locales utilisées en fallback");
            }, 200);
          } catch (fallbackError) {
            console.error("❌ Erreur fallback données grammaire:", fallbackError);
          }
        }
      }
      
    } else {
      console.log("📚 AUCUNE DONNÉE GRAMMAIRE sur Google Drive");
      console.log("🔍 Structure disponible:");
      console.log("  📦 data keys:", data ? Object.keys(data) : 'data is null');
      console.log("  📦 exercises keys:", data?.exercises ? Object.keys(data.exercises) : 'exercises missing');
      
      // ✅ VÉRIFIER ET UTILISER DONNÉES LOCALES SI DISPONIBLES
      const grammarStorageKey = `grammar-progress-${currentLanguage}`;
      const localGrammarData = localStorage.getItem(grammarStorageKey);
      
      if (localGrammarData) {
        try {
          const localGrammarSessions = JSON.parse(localGrammarData);
          console.log(`📱 ${localGrammarSessions.length} sessions grammaire trouvées en local`);
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('grammarProgressSynced', { 
              detail: { 
                sessions: localGrammarSessions,
                language: currentLanguage,
                totalSessions: localGrammarSessions.length,
                source: 'local_only'
              } 
            }));
            console.log("✅ Événement déclenché avec données grammaire locales uniquement");
          }, 200);
          
        } catch (parseError) {
          console.error("❌ Erreur parsing données grammaire locales:", parseError);
        }
      } else {
        console.log("📱 Aucune donnée grammaire locale non plus");
        
        // ✅ DÉCLENCHER ÉVÉNEMENT VIDE pour initialiser proprement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('grammarProgressSynced', { 
            detail: { 
              sessions: [],
              language: currentLanguage,
              totalSessions: 0,
              source: 'empty_initialization'
            } 
          }));
          console.log("✅ Événement déclenché avec initialisation vide");
        }, 200);
      }
    }
    
    console.log("📚 === FIN TRAITEMENT GRAMMAIRE ===");

    // ===================================================================
    // 6. NOUVEAU: TRAITEMENT LEARNMODE depuis recentlyLearnedWords
    // ===================================================================
    
    console.log("📖 === DÉBUT TRAITEMENT LEARNMODE depuis recentlyLearnedWords ===");
    
    // Utiliser les données de userProgress qui ont été mises à jour
    const currentUserProgress = userProgress;
    
    if (currentUserProgress && currentUserProgress.recentlyLearnedWords && Array.isArray(currentUserProgress.recentlyLearnedWords)) {
      console.log("🔍 Analyse des mots récents pour LearnMode...");
      
      // Filtrer les mots LearnMode (non-grammaire)
      const learnModeWords = currentUserProgress.recentlyLearnedWords.filter(word => 
        word.category && word.category !== 'Grammaire'
      );
      
      console.log(`📖 ${learnModeWords.length} mots LearnMode trouvés dans recentlyLearnedWords:`, 
        learnModeWords.map(w => `${w.word} (${w.category})`));
      
      if (learnModeWords.length > 0) {
        console.log("✅ 📖 DONNÉES LEARNMODE TROUVÉES dans recentlyLearnedWords");
        
        try {
          // Grouper les mots par catégorie pour créer des sessions
          const wordsByCategory: Record<string, any[]> = {};
          
          learnModeWords.forEach(word => {
            const category = word.category;
            if (!wordsByCategory[category]) {
              wordsByCategory[category] = [];
            }
            
            wordsByCategory[category].push({
              word: word.word,
              data: {
                translation: word.translation || '',
                explanation: word.explanation || '',
                example: word.example || '',
                audio: word.audio || ''
              },
              category: word.category,
              subcategory: word.subcategory || '',
              timestamp: word.timestamp
            });
          });
          
          // Distribution par catégorie dans localStorage
          Object.entries(wordsByCategory).forEach(([categoryName, words]) => {
            const categoryKey = `${currentLanguage}-${categoryName}-learnedWords`;
            const wordsArray = words.map(w => cleanParentheses(w.word));
            
            // Fusionner avec les mots existants dans cette catégorie
            const existingCategoryWords = localStorage.getItem(categoryKey);
            const existingWordsArray = existingCategoryWords ? JSON.parse(existingCategoryWords) : [];
            
            const mergedCategoryWords = [...new Set([...existingWordsArray, ...wordsArray])];
            localStorage.setItem(categoryKey, JSON.stringify(mergedCategoryWords));
            
            console.log(`📁 Catégorie ${categoryName}: ${mergedCategoryWords.length} mots sauvés`);
          });
          
          // Déclencher l'événement learnProgressSynced
          setTimeout(() => {
            console.log("📢 Déclenchement événement learnProgressSynced depuis recentlyLearnedWords...");
            
            const sessions = Object.entries(wordsByCategory).map(([category, words]) => ({
              category: category,
              subcategory: '',
              masteredWords: words,
              date: Math.max(...words.map(w => w.timestamp)),
              totalScore: words.length * 3,
              maxScore: words.length * 3,
              xpGained: words.length * 10
            }));
            
            const eventDetail = {
              sessions: sessions,
              language: currentLanguage,
              totalSessions: sessions.length,
              source: 'recently_learned_words'
            };
            
            window.dispatchEvent(new CustomEvent('learnProgressSynced', { detail: eventDetail }));
            console.log("✅ Événement learnProgressSynced déclenché avec succès");
          }, 300);
          
          console.log("✅ 📖 DONNÉES LEARNMODE TRAITÉES AVEC SUCCÈS depuis recentlyLearnedWords");
          
        } catch (learnError) {
          console.error("❌ ERREUR lors du traitement LearnMode depuis recentlyLearnedWords:", learnError);
        }
      } else {
        console.log("📭 Aucun mot LearnMode trouvé dans recentlyLearnedWords");
      }
    } else {
      console.log("📭 Pas de recentlyLearnedWords dans userProgress");
    }
    
    console.log("📖 === FIN TRAITEMENT LEARNMODE depuis recentlyLearnedWords ===");
    
    // ===================================================================
    // 6. NOUVEAU: TRAITEMENT SPÉCIFIQUE DONNÉES LEARNMODE
    // ===================================================================
    
    console.log("📖 === DÉBUT TRAITEMENT LEARNMODE ===");
    console.log("🔍 Vérification structure données LearnMode...");
    console.log("📦 data.exercises:", !!data.exercises);
    console.log("📦 data.exercises?.learn:", !!data.exercises?.learn);  
    console.log("📦 data.exercises?.learn?.progress:", !!data.exercises?.learn?.progress);
    
    if (data.exercises?.learn?.progress && Array.isArray(data.exercises.learn.progress)) {
      console.log("✅ 📖 DONNÉES LEARNMODE TROUVÉES SUR GOOGLE DRIVE");
      
      try {
        const learnStorageKey = `learn-progress-${currentLanguage}`;
        const driveLearnSessions = data.exercises.learn.progress;
        
        console.log(`📖 ${driveLearnSessions.length} sessions LearnMode sur Google Drive:`);
        driveLearnSessions.forEach((session: any, index: number) => {
          console.log(`  📝 Session ${index + 1}: ${session.category} (${session.masteredWords?.length || 0} mots, date: ${new Date(session.date).toLocaleString()})`);
        });
        
        // ✅ Fusionner avec les données LearnMode locales si disponibles
        const existingLearnData = localStorage.getItem(learnStorageKey);
        const localLearnSessions = existingLearnData ? JSON.parse(existingLearnData) : [];
        
        console.log(`📱 ${localLearnSessions.length} sessions LearnMode en local`);
        
        let finalLearnSessions: any[];
        
        if (localLearnSessions.length === 0) {
          // Aucune donnée locale : Utiliser directement les données Google Drive
          console.log("🆕 Application directe données LearnMode Google Drive");
          finalLearnSessions = [...driveLearnSessions];
        } else {
          // Fusion intelligente avec les données locales existantes
          console.log("🔄 Fusion intelligente données LearnMode");
          
          const mergedSessions = [...localLearnSessions];
          let addedCount = 0;
          let updatedCount = 0;
          
          driveLearnSessions.forEach((driveSession: any) => {
            // Chercher une session similaire (même catégorie, date proche)
            const existingIndex = localLearnSessions.findIndex((localSession: any) => 
              localSession.category === driveSession.category &&
              Math.abs(localSession.date - driveSession.date) < 60000 // 1 minute de tolérance
            );
            
            if (existingIndex === -1) {
              // Session complètement nouvelle
              mergedSessions.push(driveSession);
              addedCount++;
              console.log(`  ➕ Nouvelle session: ${driveSession.category}`);
            } else {
              // Session existante - comparer et prendre la meilleure
              const localSession = mergedSessions[existingIndex];
              const driveWordsCount = driveSession.masteredWords?.length || 0;
              const localWordsCount = localSession.masteredWords?.length || 0;
              
              // Prendre la session avec le plus de mots ou la plus récente
              if (driveWordsCount > localWordsCount || 
                  (driveWordsCount === localWordsCount && driveSession.date > localSession.date)) {
                mergedSessions[existingIndex] = driveSession;
                updatedCount++;
                console.log(`  🔄 Session mise à jour: ${driveSession.category} (${driveWordsCount} vs ${localWordsCount} mots)`);
              } else {
                console.log(`  ✓ Session locale conservée: ${localSession.category}`);
              }
            }
          });
          
          finalLearnSessions = mergedSessions;
          console.log(`📊 Fusion terminée: ${addedCount} ajoutées, ${updatedCount} mises à jour`);
        }
        
        // ✅ SAUVEGARDE LOCALE DES DONNÉES LEARNMODE FUSIONNÉES
        localStorage.setItem(learnStorageKey, JSON.stringify(finalLearnSessions));
        console.log(`💾 ${finalLearnSessions.length} sessions LearnMode sauvegardées en localStorage`);
        
        // ✅ DISTRIBUTION PAR CATÉGORIE et AFFICHAGE DES MOTS COMPLÉTÉS
        const allCompletedWordsByCategory: Record<string, Set<string>> = {};
        let totalWordsProcessed = 0;
        
        finalLearnSessions.forEach((session: any, sessionIndex: number) => {
          console.log(`📝 Traitement session LearnMode ${sessionIndex + 1}: ${session.category}`);
          
          if (!allCompletedWordsByCategory[session.category]) {
            allCompletedWordsByCategory[session.category] = new Set<string>();
          }
          
          if (session.masteredWords && Array.isArray(session.masteredWords)) {
            session.masteredWords.forEach((wordData: any, wordIndex: number) => {
              if (wordData.word && typeof wordData.word === 'string') {
                allCompletedWordsByCategory[session.category].add(wordData.word);
                totalWordsProcessed++;
                console.log(`    ✓ Mot ${wordIndex + 1}: ${wordData.word}`);
              } else {
                console.warn(`    ⚠️ Mot invalide dans session ${sessionIndex + 1}, mot ${wordIndex + 1}:`, wordData);
              }
            });
          } else {
            console.warn(`  ⚠️ Session ${sessionIndex + 1} sans masteredWords valide:`, session);
          }
        });
        
        // ✅ SAUVEGARDE PAR CATÉGORIE DANS LOCALSTORAGE
        Object.entries(allCompletedWordsByCategory).forEach(([categoryName, wordsSet]) => {
          const categoryKey = `${currentLanguage}-${categoryName}-learnedWords`;
          const wordsArray = Array.from(wordsSet);
          
          // Fusionner avec les mots existants dans cette catégorie
          const existingCategoryWords = localStorage.getItem(categoryKey);
          const existingWordsArray = existingCategoryWords ? JSON.parse(existingCategoryWords) : [];
          
          const mergedCategoryWords = [...new Set([...existingWordsArray, ...wordsArray])];
          localStorage.setItem(categoryKey, JSON.stringify(mergedCategoryWords));
          
          console.log(`📁 Catégorie ${categoryName}: ${mergedCategoryWords.length} mots sauvés (${wordsArray.length} de Google Drive)`);
        });
        
        console.log(`📖 RÉSULTAT FINAL LEARNMODE:`);
        console.log(`  📊 ${finalLearnSessions.length} sessions traitées`);
        console.log(`  📊 ${totalWordsProcessed} mots traités au total`);
        console.log(`  📊 ${Object.keys(allCompletedWordsByCategory).length} catégories avec mots`);
        Object.entries(allCompletedWordsByCategory).forEach(([category, words]) => {
          console.log(`  📋 ${category}: ${words.size} mots`);
        });
        
        // ✅ DÉCLENCHEMENT ÉVÉNEMENT AVEC DÉLAI DE SÉCURITÉ
        setTimeout(() => {
          console.log("📢 Déclenchement événement learnProgressSynced...");
          
          const eventDetail = {
            sessions: finalLearnSessions,
            language: currentLanguage,
            totalSessions: finalLearnSessions.length,
            categoriesCount: Object.keys(allCompletedWordsByCategory).length,
            totalWords: totalWordsProcessed,
            source: 'google_drive_load'
          };
          
          console.log("📢 Détails événement LearnMode:", eventDetail);
          
          window.dispatchEvent(new CustomEvent('learnProgressSynced', { detail: eventDetail }));
          console.log("✅ Événement learnProgressSynced déclenché avec succès");
        }, 300); // Délai légèrement plus long pour s'assurer que tout est prêt
        
        console.log("✅ 📖 DONNÉES LEARNMODE TRAITÉES AVEC SUCCÈS");
        
      } catch (learnError) {
        console.error("❌ ERREUR CRITIQUE lors du traitement LearnMode:", learnError);
        console.error("📋 Stack trace:", learnError instanceof Error ? learnError.stack : 'No stack');
        
        // ✅ FALLBACK : Essayer de charger au moins les données locales
        console.log("🔄 Tentative de récupération avec données LearnMode locales...");
        const learnStorageKey = `learn-progress-${currentLanguage}`;
        const fallbackData = localStorage.getItem(learnStorageKey);
        
        if (fallbackData) {
          try {
            const fallbackSessions = JSON.parse(fallbackData);
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('learnProgressSynced', { 
                detail: { 
                  sessions: fallbackSessions,
                  language: currentLanguage,
                  totalSessions: fallbackSessions.length,
                  source: 'fallback_local'
                } 
              }));
              console.log("✅ Données LearnMode locales utilisées en fallback");
            }, 300);
          } catch (fallbackError) {
            console.error("❌ Erreur fallback données LearnMode:", fallbackError);
          }
        }
      }
      
    } else {
      console.log("📖 AUCUNE DONNÉE LEARNMODE sur Google Drive");
      console.log("🔍 Structure disponible:");
      console.log("  📦 data keys:", data ? Object.keys(data) : 'data is null');
      console.log("  📦 exercises keys:", data?.exercises ? Object.keys(data.exercises) : 'exercises missing');
      
      // ✅ VÉRIFIER ET UTILISER DONNÉES LOCALES SI DISPONIBLES
      const learnStorageKey = `learn-progress-${currentLanguage}`;
      const localLearnData = localStorage.getItem(learnStorageKey);
      
      if (localLearnData) {
        try {
          const localLearnSessions = JSON.parse(localLearnData);
          console.log(`📱 ${localLearnSessions.length} sessions LearnMode trouvées en local`);
          
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('learnProgressSynced', { 
              detail: { 
                sessions: localLearnSessions,
                language: currentLanguage,
                totalSessions: localLearnSessions.length,
                source: 'local_only'
              } 
            }));
            console.log("✅ Événement déclenché avec données LearnMode locales uniquement");
          }, 300);
          
        } catch (parseError) {
          console.error("❌ Erreur parsing données LearnMode locales:", parseError);
        }
      } else {
        console.log("📱 Aucune donnée LearnMode locale non plus");
        
        // ✅ DÉCLENCHER ÉVÉNEMENT VIDE pour initialiser proprement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('learnProgressSynced', { 
            detail: { 
              sessions: [],
              language: currentLanguage,
              totalSessions: 0,
              source: 'empty_initialization'
            } 
          }));
          console.log("✅ Événement LearnMode déclenché avec initialisation vide");
        }, 300);
      }
    }
    
    console.log("📖 === FIN TRAITEMENT LEARNMODE ===");


   // ===================================================================
// 7. NOUVEAU: TRAITEMENT SPÉCIFIQUE DONNÉES SENTENCES - VERSION CORRIGÉE
// ===================================================================

console.log("📝 === DÉBUT TRAITEMENT SENTENCES ===");
console.log("🔍 Vérification structure données Sentences...");
console.log("📦 data.exercises:", !!data.exercises);
console.log("📦 data.exercises?.sentences:", !!data.exercises?.sentences);  
console.log("📦 data.exercises?.sentences?.progress:", !!data.exercises?.sentences?.progress);
console.log("📦 data.exercises?.sentenceConstruction:", !!data.exercises?.sentenceConstruction);
console.log("📦 data.exercises?.sentenceConstruction?.progress:", !!data.exercises?.sentenceConstruction?.progress);
console.log("📦 data.exercises?.sentenceConstruction?.sentences:", !!data.exercises?.sentenceConstruction?.sentences);

// ✅ CORRECTION: Vérifier les différents formats possibles
let driveSentenceSessions: any[] = [];

// Format 1: Nouveau format sentenceConstruction avec progress
if (data.exercises?.sentenceConstruction?.progress && Array.isArray(data.exercises.sentenceConstruction.progress)) {
  console.log("✅ 📝 DONNÉES SENTENCES TROUVÉES dans exercises.sentenceConstruction.progress (format principal)");
  driveSentenceSessions = data.exercises.sentenceConstruction.progress;
  console.log(`📝 ${driveSentenceSessions.length} sessions trouvées dans sentenceConstruction.progress`);
}
// Format 2: Nouveau format sentenceConstruction avec sentences directes
else if (data.exercises?.sentenceConstruction?.sentences && Array.isArray(data.exercises.sentenceConstruction.sentences)) {
  console.log("✅ 📝 DONNÉES SENTENCES TROUVÉES dans exercises.sentenceConstruction.sentences (format direct)");
  
  const directSentences = data.exercises.sentenceConstruction.sentences;
  console.log(`📝 ${directSentences.length} phrases directes trouvées`);
  
  // Convertir le format direct en format sessions pour compatibilité
  const groupedByCategory = directSentences.reduce((acc: any, sentence: any) => {
    const category = sentence.category || 'Salutations';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      original: sentence.original,
      french: sentence.french,
      audio: sentence.audio,
      mastered: sentence.isCorrect !== false,
      timestamp: sentence.timestamp || Date.now(),
      words: sentence.words || sentence.original?.split(' ') || [],
      category: sentence.category || category,
      attempts: 1,
      firstAttemptCorrect: sentence.isCorrect !== false
    });
    return acc;
  }, {});
  
  // Créer des sessions artificielles par catégorie
  driveSentenceSessions = Object.entries(groupedByCategory).map(([category, sentences]: [string, any]) => ({
    category,
    subcategory: category,
    masteredSentences: sentences,
    date: Math.max(...sentences.map((s: any) => s.timestamp || Date.now())),
    totalScore: sentences.filter((s: any) => s.mastered).length,
    maxScore: sentences.length,
    xpGained: sentences.filter((s: any) => s.mastered).length * 15
  }));
  
  console.log(`📝 Créées ${driveSentenceSessions.length} sessions artificielles depuis phrases directes`);
}
// Format 3: Ancien format sentences
else if (data.exercises?.sentences?.progress && Array.isArray(data.exercises.sentences.progress)) {
  console.log("✅ 📝 DONNÉES SENTENCES TROUVÉES dans exercises.sentences.progress (ancien format)");
  driveSentenceSessions = data.exercises.sentences.progress;
  console.log(`📝 ${driveSentenceSessions.length} sessions trouvées dans ancien format sentences`);
}

if (driveSentenceSessions.length > 0) {
  console.log("✅ 📝 DONNÉES SENTENCES TROUVÉES SUR GOOGLE DRIVE");
  
  try {
    const sentenceStorageKey = `sentence-progress-${currentLanguage}`;
    
    console.log(`📝 ${driveSentenceSessions.length} sessions Sentences sur Google Drive:`);
    driveSentenceSessions.forEach((session: any, index: number) => {
      console.log(`  📝 Session ${index + 1}: ${session.category} (${session.masteredSentences?.length || 0} phrases, date: ${new Date(session.date).toLocaleString()})`);
    });
    
    // ✅ Fusionner avec les données Sentences locales si disponibles
    const existingSentenceData = localStorage.getItem(sentenceStorageKey);
    const localSentenceSessions = existingSentenceData ? JSON.parse(existingSentenceData) : [];
    
    console.log(`📱 ${localSentenceSessions.length} sessions Sentences en local`);
    
    let finalSentenceSessions: any[];
    
    if (localSentenceSessions.length === 0) {
      // Aucune donnée locale : Utiliser directement les données Google Drive
      console.log("🆕 Application directe données Sentences Google Drive");
      finalSentenceSessions = [...driveSentenceSessions];
    } else {
      // Fusion intelligente avec les données locales existantes
      console.log("🔄 Fusion intelligente données Sentences");
      
      const mergedSessions = [...localSentenceSessions];
      let addedCount = 0;
      let updatedCount = 0;
      
      driveSentenceSessions.forEach((driveSession: any) => {
        // Chercher une session similaire (même catégorie, date proche)
        const existingIndex = localSentenceSessions.findIndex((localSession: any) => 
          localSession.category === driveSession.category &&
          Math.abs(localSession.date - driveSession.date) < 60000 // 1 minute de tolérance
        );
        
        if (existingIndex === -1) {
          // Session complètement nouvelle
          mergedSessions.push(driveSession);
          addedCount++;
          console.log(`  ➕ Nouvelle session: ${driveSession.category}`);
        } else {
          // Session existante - comparer et prendre la meilleure
          const localSession = mergedSessions[existingIndex];
          const driveSentencesCount = driveSession.masteredSentences?.length || 0;
          const localSentencesCount = localSession.masteredSentences?.length || 0;
          
          // Prendre la session avec le plus de phrases ou la plus récente
          if (driveSentencesCount > localSentencesCount || 
              (driveSentencesCount === localSentencesCount && driveSession.date > localSession.date)) {
            mergedSessions[existingIndex] = driveSession;
            updatedCount++;
            console.log(`  🔄 Session mise à jour: ${driveSession.category} (${driveSentencesCount} vs ${localSentencesCount} phrases)`);
          } else {
            console.log(`  ✓ Session locale conservée: ${localSession.category}`);
          }
        }
      });
      
      finalSentenceSessions = mergedSessions;
      console.log(`📊 Fusion terminée: ${addedCount} ajoutées, ${updatedCount} mises à jour`);
    }
    
    // ✅ SAUVEGARDE LOCALE DES DONNÉES SENTENCES FUSIONNÉES
    localStorage.setItem(sentenceStorageKey, JSON.stringify(finalSentenceSessions));
    console.log(`💾 ${finalSentenceSessions.length} sessions Sentences sauvegardées en localStorage`);
    
    // ✅ DISTRIBUTION PAR CATÉGORIE et AFFICHAGE DES PHRASES COMPLÉTÉES
    const allCompletedSentencesByCategory: Record<string, Set<string>> = {};
    let totalSentencesProcessed = 0;
    
    finalSentenceSessions.forEach((session: any, sessionIndex: number) => {
      console.log(`📝 Traitement session Sentences ${sessionIndex + 1}: ${session.category}`);
      
      if (!allCompletedSentencesByCategory[session.category]) {
        allCompletedSentencesByCategory[session.category] = new Set<string>();
      }
      
      if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
        session.masteredSentences.forEach((sentenceData: any, sentenceIndex: number) => {
          if (sentenceData.original && typeof sentenceData.original === 'string') {
            allCompletedSentencesByCategory[session.category].add(sentenceData.original);
            totalSentencesProcessed++;
            console.log(`    ✓ Phrase ${sentenceIndex + 1}: ${sentenceData.original}`);
          } else {
            console.warn(`    ⚠️ Phrase invalide dans session ${sessionIndex + 1}, phrase ${sentenceIndex + 1}:`, sentenceData);
          }
        });
      } else {
        console.warn(`  ⚠️ Session ${sessionIndex + 1} sans masteredSentences valide:`, session);
      }
    });
    
    // ✅ SAUVEGARDE PAR CATÉGORIE DANS LOCALSTORAGE (pour compatibilité avec le système de révision)
    Object.entries(allCompletedSentencesByCategory).forEach(([categoryName, sentencesSet]) => {
      const categoryKey = `${currentLanguage}-${categoryName}-learnedSentences`;
      const sentencesArray = Array.from(sentencesSet);
      
      // Fusionner avec les phrases existantes dans cette catégorie
      const existingCategorySentences = localStorage.getItem(categoryKey);
      const existingSentencesArray = existingCategorySentences ? JSON.parse(existingCategorySentences) : [];
      
      const mergedCategorySentences = [...new Set([...existingSentencesArray, ...sentencesArray])];
      localStorage.setItem(categoryKey, JSON.stringify(mergedCategorySentences));
      
      console.log(`📁 Catégorie ${categoryName}: ${mergedCategorySentences.length} phrases sauvées (${sentencesArray.length} de Google Drive)`);
    });
    
    // ✅ NOUVEAU: SAUVEGARDE POUR useSentenceRevision
    const sentenceRevisionKey = `sentence-revision-${currentLanguage}-sessionHistory`;
    const revisionSentences: any[] = [];
    
    finalSentenceSessions.forEach((session: any) => {
      if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
        session.masteredSentences.forEach((sentence: any) => {
          if (sentence.original && sentence.french && sentence.mastered) {
            revisionSentences.push({
              original: sentence.original,
              french: sentence.french,
              audio: sentence.audio,
              category: sentence.category || session.category || 'Salutations',
              timestamp: sentence.timestamp || Date.now(),
              nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
              type: 'sentence',
              words: sentence.words || sentence.original.split(' '),
              isCorrect: true // Les phrases maîtrisées sont correctes
            });
          }
        });
      }
    });
    
    if (revisionSentences.length > 0) {
      // Fusionner avec les données de révision existantes
      const existingRevisionData = localStorage.getItem(sentenceRevisionKey);
      const existingRevisionSentences = existingRevisionData ? JSON.parse(existingRevisionData) : [];
      
      const mergedRevisionSentences = [...existingRevisionSentences];
      revisionSentences.forEach(newSentence => {
        const existingIndex = mergedRevisionSentences.findIndex((s: any) => 
          s.original === newSentence.original && s.category === newSentence.category
        );
        
        if (existingIndex >= 0) {
          // Mettre à jour avec les données les plus récentes
          mergedRevisionSentences[existingIndex] = {
            ...mergedRevisionSentences[existingIndex],
            ...newSentence,
            timestamp: Math.max(mergedRevisionSentences[existingIndex].timestamp, newSentence.timestamp)
          };
        } else {
          mergedRevisionSentences.push(newSentence);
        }
      });
      
      localStorage.setItem(sentenceRevisionKey, JSON.stringify(mergedRevisionSentences));
      console.log(`📚 ${mergedRevisionSentences.length} phrases sauvées pour useSentenceRevision`);
    }
    
    console.log(`📝 RÉSULTAT FINAL SENTENCES:`);
    console.log(`  📊 ${finalSentenceSessions.length} sessions traitées`);
    console.log(`  📊 ${totalSentencesProcessed} phrases traitées au total`);
    console.log(`  📊 ${Object.keys(allCompletedSentencesByCategory).length} catégories avec phrases`);
    console.log(`  📚 ${revisionSentences.length} phrases ajoutées au système de révision`);
    Object.entries(allCompletedSentencesByCategory).forEach(([category, sentences]) => {
      console.log(`  📋 ${category}: ${sentences.size} phrases`);
    });
    
    // ✅ DÉCLENCHEMENT ÉVÉNEMENT AVEC DÉLAI DE SÉCURITÉ
    setTimeout(() => {
      console.log("📢 Déclenchement événement sentenceProgressSynced...");
      
      const eventDetail = {
        sessions: finalSentenceSessions,
        language: currentLanguage,
        totalSessions: finalSentenceSessions.length,
        categoriesCount: Object.keys(allCompletedSentencesByCategory).length,
        totalSentences: totalSentencesProcessed,
        revisionSentencesCount: revisionSentences.length,
        source: 'google_drive_load'
      };
      
      console.log("📢 Détails événement Sentences:", eventDetail);
      
      window.dispatchEvent(new CustomEvent('sentenceProgressSynced', { detail: eventDetail }));
      console.log("✅ Événement sentenceProgressSynced déclenché avec succès");
    }, 500); // Délai pour s'assurer que tout est prêt
    
    console.log("✅ 📝 DONNÉES SENTENCES TRAITÉES AVEC SUCCÈS");
    
  } catch (sentenceError) {
    console.error("❌ ERREUR CRITIQUE lors du traitement Sentences:", sentenceError);
    console.error("📋 Stack trace:", sentenceError instanceof Error ? sentenceError.stack : 'No stack');
    
    // ✅ FALLBACK : Essayer de charger au moins les données locales
    console.log("🔄 Tentative de récupération avec données Sentences locales...");
    const sentenceStorageKey = `sentence-progress-${currentLanguage}`;
    const fallbackData = localStorage.getItem(sentenceStorageKey);
    
    if (fallbackData) {
      try {
        const fallbackSessions = JSON.parse(fallbackData);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('sentenceProgressSynced', { 
            detail: { 
              sessions: fallbackSessions,
              language: currentLanguage,
              totalSessions: fallbackSessions.length,
              source: 'fallback_local'
            } 
          }));
          console.log("✅ Données Sentences locales utilisées en fallback");
        }, 500);
      } catch (fallbackError) {
        console.error("❌ Erreur fallback données Sentences:", fallbackError);
      }
    }
  }
  
} else {
  console.log("📝 AUCUNE DONNÉE SENTENCES sur Google Drive");
  console.log("🔍 Structure disponible:");
  console.log("  📦 data keys:", data ? Object.keys(data) : 'data is null');
  console.log("  📦 exercises keys:", data?.exercises ? Object.keys(data.exercises) : 'exercises missing');
  
  // ✅ VÉRIFIER ET UTILISER DONNÉES LOCALES SI DISPONIBLES
  const sentenceStorageKey = `sentence-progress-${currentLanguage}`;
  const localSentenceData = localStorage.getItem(sentenceStorageKey);
  
  if (localSentenceData) {
    try {
      const localSentenceSessions = JSON.parse(localSentenceData);
      console.log(`📱 ${localSentenceSessions.length} sessions Sentences trouvées en local`);
      
      // ✅ NOUVEAU: Synchroniser aussi avec useSentenceRevision depuis les données locales
      const sentenceRevisionKey = `sentence-revision-${currentLanguage}-sessionHistory`;
      const existingRevisionData = localStorage.getItem(sentenceRevisionKey);
      const existingRevisionSentences = existingRevisionData ? JSON.parse(existingRevisionData) : [];
      
      const localRevisionSentences: any[] = [];
      localSentenceSessions.forEach((session: any) => {
        if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
          session.masteredSentences.forEach((sentence: any) => {
            if (sentence.original && sentence.french && sentence.mastered) {
              localRevisionSentences.push({
                original: sentence.original,
                french: sentence.french,
                audio: sentence.audio,
                category: sentence.category || session.category || 'Salutations',
                timestamp: sentence.timestamp || Date.now(),
                nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
                type: 'sentence',
                words: sentence.words || sentence.original.split(' '),
                isCorrect: true
              });
            }
          });
        }
      });
      
      if (localRevisionSentences.length > 0) {
        const mergedLocalRevision = [...existingRevisionSentences];
        localRevisionSentences.forEach(newSentence => {
          const existingIndex = mergedLocalRevision.findIndex((s: any) => 
            s.original === newSentence.original && s.category === newSentence.category
          );
          
          if (existingIndex >= 0) {
            mergedLocalRevision[existingIndex] = {
              ...mergedLocalRevision[existingIndex],
              ...newSentence,
              timestamp: Math.max(mergedLocalRevision[existingIndex].timestamp, newSentence.timestamp)
            };
          } else {
            mergedLocalRevision.push(newSentence);
          }
        });
        
        localStorage.setItem(sentenceRevisionKey, JSON.stringify(mergedLocalRevision));
        console.log(`📚 ${mergedLocalRevision.length} phrases locales synchronisées avec useSentenceRevision`);
      }
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sentenceProgressSynced', { 
          detail: { 
            sessions: localSentenceSessions,
            language: currentLanguage,
            totalSessions: localSentenceSessions.length,
            revisionSentencesCount: localRevisionSentences.length,
            source: 'local_only'
          } 
        }));
        console.log("✅ Événement déclenché avec données Sentences locales uniquement");
      }, 500);
      
    } catch (parseError) {
      console.error("❌ Erreur parsing données Sentences locales:", parseError);
    }
  } else {
    console.log("📱 Aucune donnée Sentences locale non plus");
    
    // ✅ DÉCLENCHER ÉVÉNEMENT VIDE pour initialiser proprement
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('sentenceProgressSynced', { 
        detail: { 
          sessions: [],
          language: currentLanguage,
          totalSessions: 0,
          source: 'empty_initialization'
        } 
      }));
      console.log("✅ Événement Sentences déclenché avec initialisation vide");
    }, 500);
  }
}

console.log("📝 === FIN TRAITEMENT SENTENCES ==="); 

// Dans App.tsx, modifier la section de traitement des données de révision dans loadDataFromGoogleDrive

// ===================================================================
// 8. TRAITEMENT SPÉCIFIQUE DONNÉES DE RÉVISION - VERSION CORRIGÉE
// ===================================================================

console.log("🔄 === DÉBUT TRAITEMENT RÉVISION ===");

// Essayer de charger le fichier revision.json spécifique
let revisionFileData = null;
try {
  revisionFileData = await driveService.loadData(currentLanguage, 'revision');
  console.log("📦 Fichier revision.json chargé:", !!revisionFileData);
} catch (revisionLoadError) {
  console.log("📭 Pas de fichier revision.json spécifique, utilisation des métadonnées");
}

// Vérifier les deux sources possibles de données de révision
const revisionData = revisionFileData?._metadata?.revisionData || data._metadata?.revisionData;

if (revisionData) {
  console.log("✅ 🔄 DONNÉES DE RÉVISION TROUVÉES");
  
  try {
    console.log("🔄 Données de révision:", {
      hasSessionHistory: !!revisionData.sessionHistory,
      sessionHistoryLength: revisionData.sessionHistory?.length || 0,
      hasLearnedWords: !!revisionData.learnedWords,
      learnedWordsCount: revisionData.learnedWords?.length || 0
    });
    
    // ✅ NOUVEAU: SYNCHRONISER LES MOTS APPRIS DEPUIS L'HISTORIQUE DE RÉVISION
    if (revisionData.sessionHistory && Array.isArray(revisionData.sessionHistory)) {
      console.log("🔍 Analyse de l'historique de révision pour extraire les mots appris...");
      
      // Regrouper les mots par catégorie depuis l'historique de révision
      const learnedWordsByCategory: Record<string, Set<string>> = {};
      
      revisionData.sessionHistory.forEach((entry: any) => {
        if (entry.isCorrect && entry.word && entry.category) {
          const cleanWord = cleanParentheses(entry.word);
          
          if (!learnedWordsByCategory[entry.category]) {
            learnedWordsByCategory[entry.category] = new Set();
          }
          
          learnedWordsByCategory[entry.category].add(cleanWord);
          console.log(`  ✅ Mot appris trouvé: ${cleanWord} → ${entry.category}`);
        }
      });
      
      // Sauvegarder les mots appris par catégorie dans localStorage
      Object.entries(learnedWordsByCategory).forEach(([categoryName, wordsSet]) => {
        if (categoryName === 'Grammaire') {
          // Pour la grammaire, utiliser le système spécialisé
          const grammarStorageKey = `grammar-progress-${currentLanguage}`;
          const existingGrammarData = localStorage.getItem(grammarStorageKey);
          const existingGrammarSessions = existingGrammarData ? JSON.parse(existingGrammarData) : [];
          
          // Créer une session artificielle pour les mots de grammaire révisés
          const grammarWordsArray = Array.from(wordsSet);
          if (grammarWordsArray.length > 0) {
            const artificialGrammarSession = {
              subcategory: 'Révision synchronisée',
              masteredWords: grammarWordsArray.map(word => ({
                word: word,
                data: {
                  translation: 'Mot révisé synchronisé',
                  explanation: '',
                  example: ''
                }
              })),
              date: Date.now()
            };
            
            // Vérifier si cette session n'existe pas déjà
            const sessionExists = existingGrammarSessions.some((session: any) => 
              session.subcategory === 'Révision synchronisée' &&
              session.masteredWords.length === grammarWordsArray.length
            );
            
            if (!sessionExists) {
              existingGrammarSessions.push(artificialGrammarSession);
              localStorage.setItem(grammarStorageKey, JSON.stringify(existingGrammarSessions));
              console.log(`📚 ${grammarWordsArray.length} mots de grammaire synchronisés depuis les révisions`);
            }
          }
        } else {
          // Pour les autres catégories
          const categoryKey = `${currentLanguage}-${categoryName}-learnedWords`;
          const existingCategoryWords = localStorage.getItem(categoryKey);
          const existingWordsArray = existingCategoryWords ? JSON.parse(existingCategoryWords) : [];
          
          // Fusionner avec les mots existants
          const wordsArray = Array.from(wordsSet);
          const mergedCategoryWords = [...new Set([...existingWordsArray, ...wordsArray])];
          
          // Sauvegarder seulement si il y a de nouveaux mots
          if (mergedCategoryWords.length > existingWordsArray.length) {
            localStorage.setItem(categoryKey, JSON.stringify(mergedCategoryWords));
            console.log(`📁 ${categoryName}: ${mergedCategoryWords.length} mots total (${wordsArray.length} depuis révisions)`);
          }
        }
      });
      
      // ✅ NOUVEAU: METTRE À JOUR LA PROGRESSION GÉNÉRALE AVEC LES MOTS RÉVISÉS
      const allRevisedWords = new Set<string>();
      Object.values(learnedWordsByCategory).forEach(categoryWords => {
        categoryWords.forEach(word => allRevisedWords.add(word));
      });
      
      if (allRevisedWords.size > 0) {
        console.log(`📊 ${allRevisedWords.size} mots uniques trouvés dans l'historique de révision`);
        
        // Mettre à jour userProgress pour inclure ces mots
        setUserProgress(prev => {
          const existingLearnedWords = Array.from(prev.learnedWords || []);
          const newLearnedWords = new Set([
            ...existingLearnedWords,
            ...Array.from(allRevisedWords)
          ]);
          
          // Créer des LearnedWord pour recentlyLearnedWords
          const newRecentlyLearned = Array.from(allRevisedWords)
            .filter(word => !existingLearnedWords.includes(word))
            .map(word => {
              // Trouver la catégorie du mot
              let wordCategory = 'Général';
              for (const [category, words] of Object.entries(learnedWordsByCategory)) {
                if (words.has(word)) {
                  wordCategory = category;
                  break;
                }
              }
              
              return {
                word: word,
                category: wordCategory,
                timestamp: Date.now(),
                language: currentLanguage,
                translation: 'Synchronisé depuis révision'
              } as LearnedWord;
            });
          
          const updatedProgress = {
            ...prev,
            learnedWords: newLearnedWords,
            recentlyLearnedWords: [
              ...prev.recentlyLearnedWords,
              ...newRecentlyLearned
            ]
          };
          
          console.log(`📈 Progression mise à jour: ${newLearnedWords.size} mots appris total`);
          
          // Sauvegarder aussi en localStorage
          const serialized = serializeUserProgress(updatedProgress);
          const storageKey = `${currentLanguage}-progress`;
          localStorage.setItem(storageKey, JSON.stringify(serialized));
          
          return updatedProgress;
        });
      }
    }
    
    // ✅ TRAITEMENT HISTORIQUE DE SESSION (existant)
    if (revisionData.sessionHistory && Array.isArray(revisionData.sessionHistory)) {
      const historyKey = `revision-${currentLanguage}-sessionHistory`;
      
      console.log(`🔄 ${revisionData.sessionHistory.length} entrées d'historique de révision trouvées`);
      
      // Fusionner avec l'historique local existant
      const existingHistory = localStorage.getItem(historyKey);
      const localHistory = existingHistory ? JSON.parse(existingHistory) : [];
      
      const mergedHistory = [...localHistory];
      let addedCount = 0;
      
      revisionData.sessionHistory.forEach((driveEntry: any) => {
        // Chercher une entrée similaire
        const existingIndex = localHistory.findIndex((localEntry: any) => 
          localEntry.word === driveEntry.word &&
          localEntry.category === driveEntry.category &&
          Math.abs(localEntry.timestamp - driveEntry.timestamp) < 5000
        );
        
        if (existingIndex === -1) {
          mergedHistory.push(driveEntry);
          addedCount++;
        } else {
          // Mettre à jour avec les données les plus complètes
          const localEntry = mergedHistory[existingIndex];
          if (driveEntry.timestamp > localEntry.timestamp || 
              (driveEntry.nextReview && !localEntry.nextReview)) {
            mergedHistory[existingIndex] = {
              ...localEntry,
              ...driveEntry,
              timestamp: Math.max(localEntry.timestamp, driveEntry.timestamp)
            };
          }
        }
      });
      
      // Trier par timestamp décroissant et limiter
      const finalHistory = mergedHistory
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, 1000);
      
      localStorage.setItem(historyKey, JSON.stringify(finalHistory));
      console.log(`💾 ${finalHistory.length} entrées d'historique sauvegardées (${addedCount} nouvelles)`);
    }
    
    // ✅ TRAITEMENT MOTS À RÉVISER (existant)
    if (revisionData.learnedWords && Array.isArray(revisionData.learnedWords)) {
      console.log(`🔄 ${revisionData.learnedWords.length} mots appris en révision trouvés`);
      
      // Synchroniser avec useRevisionProgress
      const progressKey = `revision-${currentLanguage}-progress`;
      const existingProgress = localStorage.getItem(progressKey);
      let currentProgress = existingProgress ? JSON.parse(existingProgress) : {
        wordsToReview: [],
        timestamp: Date.now()
      };
      
      // Créer des clés pour les mots de révision
      const revisionWordKeys = revisionData.learnedWords.map((word: string) => {
        // Déterminer la catégorie du mot depuis l'historique
        const wordEntry = revisionData.sessionHistory?.find((entry: any) => entry.word === word);
        const category = wordEntry?.category || 'Général';
        
        return `${currentLanguage}:${category}:${word}`;
      });
      
      // Fusionner avec les mots existants
      const existingWordsToReview = Array.isArray(currentProgress.wordsToReview) 
        ? currentProgress.wordsToReview 
        : [];
      
      const mergedWordsToReview = [...new Set([
        ...existingWordsToReview,
        ...revisionWordKeys
      ])];
      
      const updatedProgress = {
        ...currentProgress,
        wordsToReview: mergedWordsToReview,
        timestamp: Date.now()
      };
      
      localStorage.setItem(progressKey, JSON.stringify(updatedProgress));
      console.log(`📚 ${mergedWordsToReview.length} mots total dans le système de révision`);
    }
    
    // ✅ DÉCLENCHEMENT ÉVÉNEMENT AVEC DÉLAI DE SÉCURITÉ
    setTimeout(() => {
      console.log("📢 Déclenchement événement revisionDataSynced...");
      
      const eventDetail = {
        sessionHistory: revisionData.sessionHistory || [],
        learnedWords: revisionData.learnedWords || [],
        language: currentLanguage,
        totalEntries: revisionData.sessionHistory?.length || 0,
        totalLearnedWords: revisionData.learnedWords?.length || 0,
        source: 'google_drive_load'
      };
      
      window.dispatchEvent(new CustomEvent('revisionDataSynced', { detail: eventDetail }));
      console.log("✅ Événement revisionDataSynced déclenché avec succès");
    }, 800); // Délai pour s'assurer que tout est prêt
    
    console.log("✅ 🔄 DONNÉES DE RÉVISION TRAITÉES AVEC SUCCÈS");
    
  } catch (revisionError) {
    console.error("❌ ERREUR CRITIQUE lors du traitement Révision:", revisionError);
  }
  
} else {
  console.log("🔄 AUCUNE DONNÉE DE RÉVISION sur Google Drive");
  
  // ✅ VÉRIFIER ET UTILISER DONNÉES LOCALES SI DISPONIBLES
  const historyKey = `revision-${currentLanguage}-sessionHistory`;
  const localRevisionData = localStorage.getItem(historyKey);
  
  if (localRevisionData) {
    try {
      const localRevisionHistory = JSON.parse(localRevisionData);
      console.log(`📱 ${localRevisionHistory.length} entrées de révision trouvées en local`);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('revisionDataSynced', { 
          detail: { 
            sessionHistory: localRevisionHistory,
            learnedWords: [],
            language: currentLanguage,
            totalEntries: localRevisionHistory.length,
            source: 'local_only'
          } 
        }));
        console.log("✅ Événement déclenché avec données Révision locales uniquement");
      }, 800);
      
    } catch (parseError) {
      console.error("❌ Erreur parsing données Révision locales:", parseError);
    }
  } else {
    console.log("📱 Aucune donnée Révision locale non plus");
    
    // ✅ DÉCLENCHER ÉVÉNEMENT VIDE pour initialiser proprement
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('revisionDataSynced', { 
        detail: { 
          sessionHistory: [],
          learnedWords: [],
          language: currentLanguage,
          totalEntries: 0,
          source: 'empty_initialization'
        } 
      }));
      console.log("✅ Événement Révision déclenché avec initialisation vide");
    }, 800);
  }
}

console.log("🔄 === FIN TRAITEMENT RÉVISION ===");
    
    console.log("✅ ===== CHARGEMENT GOOGLE DRIVE TERMINÉ AVEC SUCCÈS =====");
    
  } catch (error) {
    console.error('❌ ===== ERREUR CRITIQUE CHARGEMENT GOOGLE DRIVE =====');
    console.error('🔍 Type erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('🔍 Message:', error instanceof Error ? error.message : String(error));
    console.error('🔍 Stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // ✅ DIAGNOSTIC ERREUR
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        console.error("🚫 PROBLÈME D'AUTHENTIFICATION Google Drive");
        console.error("💡 Solutions: Vérifier token, se reconnecter");
      } else if (error.message.includes('429') || error.message.includes('Rate Limit')) {
        console.error("🚫 RATE LIMITING Google Drive");
        console.error("💡 Solutions: Attendre, réessayer plus tard");
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        console.error("🚫 PROBLÈME RÉSEAU");
        console.error("💡 Solutions: Vérifier connexion internet");
      } else {
        console.error("🚫 ERREUR GOOGLE DRIVE GÉNÉRIQUE");
      }
    }
    
    // ✅ CHARGEMENT DE SECOURS DEPUIS LOCALSTORAGE
    console.log("🔄 ===== DÉMARRAGE CHARGEMENT DE SECOURS =====");
    
    try {
      // Chargement données générales
      const localStorageKey = `${currentLanguage}-progress`;
      const savedProgress = localStorage.getItem(localStorageKey);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        const deserializedProgress = deserializeUserProgress(parsed);
        setUserProgress(deserializedProgress);
        console.log("✅ Données générales chargées depuis localStorage en secours");
      } else {
        console.log("📭 Aucune donnée générale locale pour le secours");
      }
      
      // Chargement données grammaire
      const grammarStorageKey = `grammar-progress-${currentLanguage}`;
      const localGrammarData = localStorage.getItem(grammarStorageKey);
      
      if (localGrammarData) {
        const localGrammarSessions = JSON.parse(localGrammarData);
        console.log(`📱 ${localGrammarSessions.length} sessions grammaire chargées en secours`);
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('grammarProgressSynced', { 
            detail: { 
              sessions: localGrammarSessions,
              language: currentLanguage,
              totalSessions: localGrammarSessions.length,
              source: 'error_fallback_local'
            } 
          }));
          console.log("✅ Données grammaire locales appliquées en secours");
        }, 200);
      } else {
        console.log("📭 Aucune donnée grammaire locale pour le secours");
      }
      
      // ✅ NOUVEAU: Chargement données LearnMode en secours
      const learnStorageKey = `learn-progress-${currentLanguage}`;
      const localLearnData = localStorage.getItem(learnStorageKey);
      
      if (localLearnData) {
        const localLearnSessions = JSON.parse(localLearnData);
        console.log(`📱 ${localLearnSessions.length} sessions LearnMode chargées en secours`);
        
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('learnProgressSynced', { 
            detail: { 
              sessions: localLearnSessions,
              language: currentLanguage,
              totalSessions: localLearnSessions.length,
              source: 'error_fallback_local'
            } 
          }));
          console.log("✅ Données LearnMode locales appliquées en secours");
        }, 300);
      } else {
        console.log("📭 Aucune donnée LearnMode locale pour le secours");
      }
      
      console.log("✅ ===== CHARGEMENT DE SECOURS TERMINÉ =====");
      
    } catch (fallbackError) {
      console.error("❌ ERREUR CRITIQUE MÊME EN SECOURS:", fallbackError);
      console.error("💥 Impossible de récupérer les données, initialisation par défaut");
      
      // Initialisation par défaut en cas d'échec complet
      setUserProgress({
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [] as LearnedWord[],
        language: currentLanguage
      });
      
      // ✅ NOUVEAU: Événements de secours pour initialisation vide
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('grammarProgressSynced', { 
          detail: { 
            sessions: [],
            language: currentLanguage,
            totalSessions: 0,
            source: 'error_fallback_empty'
          } 
        }));
        
        window.dispatchEvent(new CustomEvent('learnProgressSynced', { 
          detail: { 
            sessions: [],
            language: currentLanguage,
            totalSessions: 0,
            source: 'error_fallback_empty'
          } 
        }));
        
        console.log("✅ Événements de secours vides déclenchés");
      }, 400);
    }
    
  } finally {
    setIsLoading(false);
    console.log("🏁 ===== PROCESSUS CHARGEMENT TERMINÉ =====");
    console.log(`⏱️ Temps écoulé: ${Date.now() - performance.now()}ms`);
  }
}, [currentLanguage, setUserProgress, setCompletedCategories, addWordsToReview, user]);

// ✅ CORRECTION 11: useEffect avec ordre de dépendances correct
useEffect(() => {
  console.log("🔄 Effet de chargement initial déclenché");
  console.log("User:", !!user, "CurrentLanguage:", currentLanguage);
  
  // Toujours charger les données locales d'abord
  const loadLocalFirst = async () => {
    // Charger localStorage
    try {
      const storageKey = `${currentLanguage}-progress`;
      const savedProgress = localStorage.getItem(storageKey);
      const savedCategories = localStorage.getItem(`${currentLanguage}-completedCategories`);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        const deserializedProgress = deserializeUserProgress(parsed);
        setUserProgress(deserializedProgress);
      }
      
      if (savedCategories) {
        setCompletedCategories(JSON.parse(savedCategories));
      }
      
      console.log("✅ Données locales chargées");
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
      setUserProgress({
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [] as LearnedWord[],
        language: currentLanguage
      });
    }
  };
  
  // Charger local d'abord
 loadLocalFirst();

// Puis charger depuis Google Drive si connecté - AVEC DÉLAI
setTimeout(() => {
  if ((user || localStorage.getItem('userEmail')) && localStorage.getItem('googleToken')) {
    console.log("☁️ Chargement Google Drive...");
    loadDataFromGoogleDrive();
  } else {
    console.log("📱 Pas de connexion Google - mode local uniquement");
  }
}, 1500); // Attendre 1.5 seconde pour l'initialisation
}, [user, currentLanguage, loadDataFromGoogleDrive]);

// useEffect séparé pour Google Drive - NOUVEAU
useEffect(() => {
  const checkAndLoadGoogleDrive = async () => {
    const token = localStorage.getItem('googleToken');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log('🔍 Vérification Google Drive:', {
      hasToken: !!token,
      hasEmail: !!userEmail,
      hasCurrentLanguage: !!currentLanguage,
      userState: !!user
    });
    
    if (token && currentLanguage && (user || userEmail)) {
      console.log("☁️ Chargement Google Drive (useEffect séparé)...");
      try {
        await loadDataFromGoogleDrive();
      } catch (error) {
        console.error("Erreur chargement Google Drive:", error);
      }
    } else {
      console.log("⏸️ Conditions non remplies pour Google Drive");
    }
  };

  // Délai pour s'assurer que tous les états sont initialisés
  const timer = setTimeout(checkAndLoadGoogleDrive, 800);
  return () => clearTimeout(timer);
}, [currentLanguage, user, loadDataFromGoogleDrive]); // Dépendances





  const handleUpdateRevisionState = useCallback((updatedState) => {
    // Utilisez le hook existant ou obtenez de nouvelles données fraîches
    const { revisionProgress: freshRevisionProgress } = useRevisionProgress(currentLanguage);
    
    // Vous pouvez simplifier en passant directement le nouveau state reçu
    setRevisionProgress(updatedState || freshRevisionProgress);
  }, [currentLanguage]);

  // Amélioration de la fonction de vérification du token dans App.tsx
  // Remplacer cette fonction dans App.tsx
  const verifyGoogleTokenValidity = useCallback(async () => {
    const token = localStorage.getItem('googleToken');
    
    if (!token) return false;
    
    try {
      // Vérification directe avec l'API Google Drive
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error("Token invalide ou expiré:", response.status);
        return false;
      }
      
      // Récupérer les informations utilisateur
      const data = await response.json();
      
      if (data.user) {
        console.log("Token valide, utilisateur:", data.user.displayName || "Inconnu");
        return true;
      } else {
        console.error("Réponse valide mais sans données utilisateur");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      return false;
    }
  }, []);

  const handleComponentMount = useCallback((componentName: string) => {
    console.log(`Composant monté: ${componentName}`);
    
    // Sur mobile, s'assurer que seul le composant actuel est visible
    if (isMobileView) {
      const appContainer = document.querySelector('.App');
      if (appContainer) {
        const allComponents = appContainer.querySelectorAll(':scope > div');
        
        // Masquer tous les composants sauf le dernier (actuel)
        allComponents.forEach((component, index) => {
          if (index === allComponents.length - 1) {
            // Le dernier composant (actuel) doit être visible
            (component as HTMLElement).style.display = 'flex';
            (component as HTMLElement).style.zIndex = '10';
          } else {
            // Les autres composants doivent être masqués
            (component as HTMLElement).style.display = 'none';
            (component as HTMLElement).style.zIndex = '1';
          }
        });
      }
    }
  }, [isMobileView]);

  // ✅ NOUVELLE FONCTION : Sauvegarde automatique lors des résumés uniquement
const saveProgressOnSummary = useCallback(async (
  newProgress: UserProgress,
  context?: SaveDataContext
) => {
  console.log(`💾 SAUVEGARDE CENTRALISÉE - ${context?.mode?.toUpperCase() || 'GÉNÉRAL'}`);
  
  try {
    let updatedProgress = { ...newProgress };
    
    // ✅ Gestion spécialisée par mode
    if (context?.mode === 'grammar' && context?.sessionStats?.rulesLearned) {
      console.log('🔄 Mode GRAMMAIRE - Synchronisation...');
      
      const grammarRules = Array.from(newProgress.learnedWords || []);
      const currentLearnedWords = Array.from(userProgress.learnedWords || []);
      const newLearnedWords = new Set([...currentLearnedWords, ...grammarRules]);
      
      updatedProgress = { ...updatedProgress, learnedWords: newLearnedWords };
      
      if (context.sessionStats.totalXP) {
        const currentXP = parseInt(localStorage.getItem(`${currentLanguage}-totalXP`) || '0');
        const newTotalXP = currentXP + context.sessionStats.totalXP;
        localStorage.setItem(`${currentLanguage}-totalXP`, newTotalXP.toString());
        
        window.dispatchEvent(new CustomEvent('xpUpdated', { 
          detail: { 
            newTotal: newTotalXP, 
            gained: context.sessionStats.totalXP,
            source: 'grammar'
          } 
        }));
      }
    }
    
    // ✅ NOUVEAU: Gestion spécialisée pour LearnMode
    if (context?.mode === 'learn' && context?.sessionStats?.wordsLearned) {
      console.log('🔄 Mode LEARNMODE - Synchronisation...');
      
      const learnWords = Array.from(newProgress.learnedWords || []);
      const currentLearnedWords = Array.from(userProgress.learnedWords || []);
      const newLearnedWords = new Set([...currentLearnedWords, ...learnWords]);
      
      updatedProgress = { ...updatedProgress, learnedWords: newLearnedWords };
      
      // Gestion XP pour LearnMode
      if (context.sessionStats.wordsLearned > 0) {
        const xpGained = context.sessionStats.wordsLearned * 10; // 10 XP par mot
        const currentXP = parseInt(localStorage.getItem(`${currentLanguage}-totalXP`) || '0');
        const newTotalXP = currentXP + xpGained;
        localStorage.setItem(`${currentLanguage}-totalXP`, newTotalXP.toString());
        
        window.dispatchEvent(new CustomEvent('xpUpdated', { 
          detail: { 
            newTotal: newTotalXP, 
            gained: xpGained,
            source: 'learn'
          } 
        }));
      }
    }

    // ✅ NOUVEAU: Gestion spécialisée pour SentenceConstructionGame
    if (context?.mode === 'sentenceConstruction' && context?.sessionStats?.sentencesLearned) {
      console.log('🔄 Mode SENTENCES - Synchronisation...');
      
      const sentenceWords = Array.from(newProgress.learnedWords || []);
      const currentLearnedWords = Array.from(userProgress.learnedWords || []);
      const newLearnedWords = new Set([...currentLearnedWords, ...sentenceWords]);
      
      updatedProgress = { ...updatedProgress, learnedWords: newLearnedWords };
      
      // Gestion XP pour SentenceConstruction
      if (context.sessionStats.sentencesLearned > 0) {
        const xpGained = context.sessionStats.sentencesLearned * 15; // 15 XP par phrase
        const currentXP = parseInt(localStorage.getItem(`${currentLanguage}-totalXP`) || '0');
        const newTotalXP = currentXP + xpGained;
        localStorage.setItem(`${currentLanguage}-totalXP`, newTotalXP.toString());
        
        window.dispatchEvent(new CustomEvent('xpUpdated', { 
          detail: { 
            newTotal: newTotalXP, 
            gained: xpGained,
            source: 'sentences'
          } 
        }));
      }
    }
    
    // ✅ Sauvegarde locale
    console.log('💾 DÉBUT sauvegarde locale...');
    
    setUserProgress(prevProgress => ({
      ...prevProgress,
      ...updatedProgress,
      learnedWords: updatedProgress.learnedWords || prevProgress.learnedWords,
      recentlyLearnedWords: [
        ...(prevProgress.recentlyLearnedWords || []),
        ...(updatedProgress.recentlyLearnedWords || [])
      ]
    }));
    
    const serialized = serializeUserProgress(updatedProgress);
    const storageKey = `${currentLanguage}-progress`;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(serialized));
      console.log('✅ Sauvegarde localStorage réussie');
    } catch (localStorageError) {
      console.error('❌ Erreur localStorage:', localStorageError);
      throw new Error(`Erreur sauvegarde locale: ${localStorageError}`);
    }
    
    // ✅ Sauvegarde Google Drive CONDITIONNELLE
    if (context?.includeGoogleDrive) {
      console.log('☁️ DÉBUT sauvegarde Google Drive...');
      
      const token = localStorage.getItem('googleToken');
      if (!token) {
        console.warn('⚠️ Pas de token Google - sauvegarde Drive ignorée');
        return;
      }
      
      try {
        // Délai de sécurité
        const lastSaveTime = parseInt(localStorage.getItem('lastGoogleDriveSave') || '0');
        const timeSinceLastSave = Date.now() - lastSaveTime;
        const minInterval = 10000;
        
        if (timeSinceLastSave < minInterval) {
          const waitTime = minInterval - timeSinceLastSave;
          console.log(`⏰ Délai Google Drive: ${waitTime}ms`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        // Création service Drive
        const driveService = new GoogleDriveService(token);
        
        // Récupération XP
        let currentXP = 0;
        try {
          currentXP = parseInt(localStorage.getItem(`${currentLanguage}-totalXP`) || '0');
        } catch (xpError) {
          console.warn('⚠️ Erreur récupération XP:', xpError);
          currentXP = 0;
        }
        
        // ✅ Préparation données avec type correct
        const dataToSave: SaveDataInput = { 
          progress: serialized,
          completedCategories: completedCategories || [],
          totalXP: currentXP,
          _sessionEndTime: Date.now(),
          _saveSource: context.mode || 'unknown',
          _description: context.description || 'Sauvegarde automatique centralisée'
        };
        
        // ✅ Ajout données grammaire spécifiques
        if (context?.grammarSpecificData && Array.isArray(context.grammarSpecificData)) {
          console.log('📚 GRAMMAR - Ajout données grammaire à Google Drive');
          
          dataToSave.exercises = {
            grammar: {
              progress: context.grammarSpecificData
            }
          };
          
          console.log(`📚 ${context.grammarSpecificData.length} sessions grammaire incluses`);
        }
        
        // ✅ Ajout données LearnMode spécifiques
        if (context?.learnSpecificData) {
          console.log('📖 LEARNMODE - Ajout données LearnMode à Google Drive');
          
          if (!dataToSave.exercises) {
            dataToSave.exercises = {};
          }
          
          // Charger les sessions existantes
          const existingLearnData = localStorage.getItem(`learn-progress-${currentLanguage}`);
          const existingLearnSessions = existingLearnData ? JSON.parse(existingLearnData) : [];
          
          const updatedLearnSessions = [...existingLearnSessions, context.learnSpecificData];
          
          dataToSave.exercises.learn = {
            progress: updatedLearnSessions
          };
          
          // Sauvegarder aussi en localStorage pour backup
          localStorage.setItem(`learn-progress-${currentLanguage}`, JSON.stringify(updatedLearnSessions));
          
          console.log(`📖 ${updatedLearnSessions.length} sessions LearnMode incluses`);
        }

        // ✅ NOUVEAU: Ajout données Sentences spécifiques
        if (context?.sentenceSpecificData) {
          console.log('📝 SENTENCES - Ajout données Sentences à Google Drive');
          
          if (!dataToSave.exercises) {
            dataToSave.exercises = {};
          }
          
          // Charger les sessions existantes
          const existingSentenceData = localStorage.getItem(`sentence-progress-${currentLanguage}`);
          const existingSentenceSessions = existingSentenceData ? JSON.parse(existingSentenceData) : [];
          
          const updatedSentenceSessions = [...existingSentenceSessions, context.sentenceSpecificData];
          
          dataToSave.exercises.sentenceConstruction = {
    // Préparer les phrases pour useSentenceRevision
    sentences: updatedSentenceSessions.flatMap(session => 
      session.masteredSentences?.filter((sentence: any) => sentence.mastered).map((sentence: any) => ({
        original: sentence.original,
        french: sentence.french,
        audio: sentence.audio,
        category: sentence.category || session.category || 'Salutations',
        timestamp: sentence.timestamp || Date.now(),
        nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
        type: 'sentence' as const,
        words: sentence.words || sentence.original?.split(' ') || [],
        isCorrect: true
      })) || []
    ),
    progress: updatedSentenceSessions,
    metadata: {
      lastUpdated: Date.now(),
      totalSessions: updatedSentenceSessions.length,
      language: currentLanguage
    }
  };
          
          // Sauvegarder aussi en localStorage pour backup
          localStorage.setItem(`sentence-progress-${currentLanguage}`, JSON.stringify(updatedSentenceSessions));
          
          console.log(`📝 ${updatedSentenceSessions.length} sessions Sentences incluses`);
        }
        
        console.log('📤 Données finales pour Google Drive:', {
          progressSize: JSON.stringify(serialized).length,
          categoriesCount: (completedCategories || []).length,
          totalXP: currentXP,
          source: context.mode,
          hasGrammarData: !!(context?.grammarSpecificData?.length),
          grammarSessionsCount: context?.grammarSpecificData?.length || 0,
          hasLearnData: !!context?.learnSpecificData,
          learnCategory: context?.learnSpecificData?.category,
          hasSentenceData: !!context?.sentenceSpecificData,
          sentenceCategory: context?.sentenceSpecificData?.category
        });
        
        // Appel saveData
        await driveService.saveData(currentLanguage, dataToSave);
        
        localStorage.setItem('lastGoogleDriveSave', Date.now().toString());
        console.log("✅ Sauvegarde Google Drive réussie avec données spécifiques");
        
      } catch (driveError) {
        console.error("❌ Erreur sauvegarde Google Drive:", driveError);
        console.log("💡 Sauvegarde locale réussie, erreur Google Drive ignorée");
      }
    }
    
    console.log('✅ Sauvegarde centralisée terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur CRITIQUE dans saveProgressOnSummary:', error);
    throw new Error(`Sauvegarde centralisée échouée: ${error instanceof Error ? error.message : String(error)}`);
  }
}, [currentLanguage, setUserProgress, completedCategories, userProgress]);

  // Loading and progress management
  const loadUserProgress = useCallback(() => {
  if (!currentLanguage) {
    console.log("❌ loadUserProgress: Pas de langue pour charger la progression");
    return;
  }
  
  try {
    const storageKey = `${currentLanguage}-progress`;
    const savedProgress = localStorage.getItem(storageKey);
    const savedCategories = localStorage.getItem(`${currentLanguage}-completedCategories`);
    
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      const deserializedProgress = deserializeUserProgress(parsed);
      setUserProgress(deserializedProgress);
      console.log('✅ Progression chargée pour:', currentLanguage);
    }
    
    if (savedCategories) {
      setCompletedCategories(JSON.parse(savedCategories));
    }
    
    if (user) {
      loadDataFromGoogleDrive();
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    // ✅ PROTECTION: Créer une progression par défaut avec la langue actuelle
    if (currentLanguage) {
      setUserProgress({
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [],
        language: currentLanguage
      });
    }
  }
}, [currentLanguage, user, loadDataFromGoogleDrive]);

  // ✅ MODIFIÉ: saveSessionProgress pour Google Drive (appelé dans les résumés)
  const saveSessionProgress = useCallback(async () => {
    console.log("===== SAUVEGARDE GOOGLE DRIVE - FIN DE SESSION =====");
    const token = localStorage.getItem('googleToken');
    if (!token) {
      console.log("Aucun token Google trouvé, sauvegarde Drive ignorée");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // ✅ IMPORTANT : Marquer qu'une sauvegarde Google Drive est en cours
      console.log('🔄 Marquage du processus de sauvegarde Google Drive');
      
      // Utiliser le même format de données que dans le test du MainMenu
      const dataToSave = { 
        progress: serializeUserProgress(userProgress),
        completedCategories: completedCategories || [],
        _sessionEndTime: Date.now()
      };
      
      // Créer un nouveau service Drive avec le token actuel
      const driveService = new GoogleDriveService(token);
      
      // Sauvegarder les données
      await driveService.saveData(currentLanguage, dataToSave);
      
      console.log("✅ Sauvegarde Google Drive réussie");
      
      // Facultatif: vérifier que la sauvegarde a fonctionné
      const fileExists = await driveService.isFileExists(currentLanguage);
      if (fileExists) {
        console.log("✅ Vérification: fichier bien sauvegardé sur Google Drive");
      }
      
      // ✅ IMPORTANT : NE PAS changer selectedCategory ou mode ici
      console.log('💡 Sauvegarde Google Drive terminée - état de l\'app préservé');
      
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde Google Drive:", error);
    } finally {
      setIsLoading(false);
      console.log("===== FIN SAUVEGARDE GOOGLE DRIVE =====");
    }
  }, [userProgress, completedCategories, currentLanguage, setIsLoading]);

  const handleQuizAnswer = useCallback((correct: boolean) => {
    setLastAnswerCorrect(correct);
    if (correct) {
      setCurrentStreak(prev => prev + 1);
    } else {
      setCurrentStreak(0);
    }
  }, []);

  const handleWordsLearned = useCallback(async (words: LearnedWord[]) => {
    console.group('DEBUG - handleWordsLearned COMPLET');
    console.log('Mots reçus:', words);
    
    try {
      const cleanWords = words.map(w => ({
        ...w,
        word: w.word.split('(')[0].trim()
      }));
  
      console.log('Mots après nettoyage:', cleanWords);
  
      // ✅ NOUVEAU : Sauvegarde immédiate vers la révision
      if (cleanWords.length > 0) {
        console.log('📤 ENVOI IMMÉDIAT vers useRevisionProgress...');
        
        // Préparer les mots pour la révision avec le bon format
        const wordsForRevision = cleanWords.map(word => ({
          word: word.word,
          category: word.category || 'Grammaire',
          isGrammar: word.category === 'Grammaire',
          subCategory: word.subcategory || '',
          grammarType: (word as any).grammarType || 'vocabulary' as 'rule' | 'conjugation' | 'vocabulary',
          translation: word.translation,
          audio: word.audio
        }));
        
        console.log('📤 Mots formatés pour révision:', wordsForRevision);
        
        try {
          console.log('🚀 Appel de addWordsToReview...');
          const result = await addWordsToReview(wordsForRevision);
          console.log('✅ Mots ajoutés à la révision avec succès:', result);
          
          // ✅ NOUVEAU : Diagnostic après ajout
          setTimeout(() => {
            console.log('🔍 Diagnostic post-ajout:');
           
          }, 1000);
          
        } catch (revisionError) {
          console.error('❌ Erreur lors de l\'ajout à la révision:', revisionError);
          // Continuer même si l'ajout à la révision échoue
        }
      }
      
      // ✅ Mise à jour en mémoire pour l'affichage immédiat
      setUserProgress(prev => ({
        ...prev,
        recentlyLearnedWords: [...prev.recentlyLearnedWords, ...cleanWords],
        learnedWords: new Set([
          ...Array.from(prev.learnedWords),
          ...cleanWords.map(w => w.word)
        ])
      }));
      
      console.log('✅ handleWordsLearned - mots ajoutés en mémoire et en révision');
      
    } catch (error) {
      console.error('Error in handleWordsLearned:', error);
    }
    console.groupEnd();
  }, [addWordsToReview]);

  const handleSuccess = useCallback(() => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  }, []);


  const handleLanguageFirstSelection = useCallback((language: LanguageCode) => {
  console.log('🌍 Première sélection de langue:', language);
  
  try {
    // ✅ VÉRIFICATION: S'assurer que la langue est valide
    const newLanguageData = getLanguageInfo(language);
    
    // Sauvegarder la langue sélectionnée
    setCurrentLanguage(language);
    saveLastUsedLanguage(language);
    markAppAsUsed();
    
    // Charger les données de la langue
    setLanguageData(newLanguageData);
    
    // Initialiser la progression utilisateur
    setUserProgress({
      learnedWords: new Set<string>(),
      wordsToReview: new Set<string>(),
      wordProgress: {},
      recentlyLearnedWords: [],
      language: language
    });
    
    // Masquer le sélecteur
    setShowLanguageSelection(false);
    setIsFirstConnection(false);
    
    console.log('✅ Langue initialisée avec succès:', language);
    
    // ✅ SUPPRIMÉ: Ne pas appeler loadUserProgress ici car les useEffects vont s'en charger
    // Juste déclencher le chargement Google Drive si nécessaire
    setTimeout(() => {
      if (user && localStorage.getItem('googleToken')) {
        console.log('☁️ Déclenchement chargement Google Drive différé');
        loadDataFromGoogleDrive();
      }
    }, 1000);
    
  } catch (error) {
    console.error('❌ Erreur lors de la première sélection:', error);
    alert(`Erreur lors du chargement de la langue ${language}. Veuillez réessayer.`);
    // En cas d'erreur, réafficher le sélecteur
    setShowLanguageSelection(true);
    setCurrentLanguage(null);
    setLanguageData(null);
  }
}, [user, loadDataFromGoogleDrive]);

 const handleLanguageChange = useCallback((newLanguage: LanguageCode) => {
  console.log('🌍===== DÉBUT CHANGEMENT DE LANGUE =====');
  console.log('🔄 Changement:', currentLanguage, '->', newLanguage);
  
  // Éviter les changements inutiles
  if (currentLanguage === newLanguage) {
    console.log('⏭️ Même langue sélectionnée, ignoré');
    return;
  }
  
  try {
    // ✅ 1. SAUVEGARDE DE LA PROGRESSION ACTUELLE (si une langue était déjà sélectionnée)
    if (currentLanguage) {
      console.log('💾 Sauvegarde de la progression actuelle pour:', currentLanguage);
      
      // Sauvegarder la progression actuelle dans localStorage
      const currentProgressKey = `${currentLanguage}-progress`;
      const currentCategoriesKey = `${currentLanguage}-completedCategories`;
      
      try {
        const serializedProgress = serializeUserProgress(userProgress);
        localStorage.setItem(currentProgressKey, JSON.stringify(serializedProgress));
        localStorage.setItem(currentCategoriesKey, JSON.stringify(completedCategories));
        
        console.log('✅ Progression sauvegardée pour', currentLanguage);
        console.log('📊 Mots appris:', userProgress.learnedWords.size);
        console.log('📚 Catégories complétées:', completedCategories.length);
      } catch (saveError) {
        console.error('❌ Erreur lors de la sauvegarde:', saveError);
      }
    }
    
    // ✅ 2. MISE À JOUR DE LA LANGUE COURANTE
    console.log('🔄 Mise à jour de la langue courante');
    setCurrentLanguage(newLanguage);
    saveLastUsedLanguage(newLanguage);
    
    // ✅ 3. CHARGEMENT DES DONNÉES DE LA NOUVELLE LANGUE
    console.log('📖 Chargement des données de langue pour:', newLanguage);
    try {
      const newLanguageData = getLanguageData(newLanguage);
      setLanguageData(newLanguageData);
      console.log('✅ Données de langue chargées:', newLanguageData.name);
    } catch (languageDataError) {
      console.error('❌ Erreur lors du chargement des données de langue:', languageDataError);
      // Fallback vers une langue par défaut ou gestion d'erreur
      return;
    }
    
    // ✅ 4. CHARGEMENT DE LA PROGRESSION DE LA NOUVELLE LANGUE
    console.log('📊 Chargement de la progression pour:', newLanguage);
    
    const newProgressKey = `${newLanguage}-progress`;
    const newCategoriesKey = `${newLanguage}-completedCategories`;
    
    let newUserProgress: UserProgress;
    let newCompletedCategories: string[] = [];
    
    try {
      // Tenter de charger la progression sauvegardée
      const savedProgress = localStorage.getItem(newProgressKey);
      const savedCategories = localStorage.getItem(newCategoriesKey);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        newUserProgress = deserializeUserProgress(parsed);
        console.log('✅ Progression chargée depuis localStorage');
        console.log('📊 Mots appris trouvés:', newUserProgress.learnedWords.size);
      } else {
        // Créer une nouvelle progression vide
        newUserProgress = {
          learnedWords: new Set<string>(),
          wordsToReview: new Set<string>(),
          wordProgress: {},
          recentlyLearnedWords: [],
          language: newLanguage
        };
        console.log('🆕 Nouvelle progression créée');
      }
      
      if (savedCategories) {
        newCompletedCategories = JSON.parse(savedCategories);
        console.log('✅ Catégories complétées chargées:', newCompletedCategories.length);
      }
    } catch (progressError) {
      console.error('❌ Erreur lors du chargement de la progression:', progressError);
      
      // Fallback: progression vide
      newUserProgress = {
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [],
        language: newLanguage
      };
      newCompletedCategories = [];
      console.log('🛡️ Fallback: progression vide créée');
    }
    
    // ✅ 5. MISE À JOUR DES ÉTATS
    console.log('🔄 Mise à jour des états de l\'application');
    
    setUserProgress(newUserProgress);
    setCompletedCategories(newCompletedCategories);
    
    // ✅ 6. RÉINITIALISATION DE L'INTERFACE
    console.log('🔄 Réinitialisation de l\'interface');
    
    // Revenir au menu principal
    setMode('menu');
    setSelectedCategory(null);
    
    // Réinitialiser les états de session
    setCurrentStreak(0);
    setLastAnswerCorrect(null);
    setSessionLearnedWords(new Set());
    
    // Forcer un re-rendu avec un token de reset
    setResetToken(prev => prev + 1);
    
    // ✅ 7. SYNCHRONISATION AVEC LE SYSTÈME DE RÉVISION
    console.log('🔄 Synchronisation avec le système de révision');
    
    try {
      // Mettre à jour le système de révision avec les nouveaux mots
      if (newUserProgress.learnedWords.size > 0) {
        const wordsForRevision = Array.from(newUserProgress.learnedWords).map((word: string) => {
          const recentWord = newUserProgress.recentlyLearnedWords.find(
            (recent: LearnedWord) => recent.word === word
          );
          
          return {
            word: word,
            category: recentWord?.category || 'Général',
            isGrammar: recentWord?.category === 'Grammaire',
            subCategory: recentWord?.subcategory || '',
            grammarType: 'vocabulary' as const,
            translation: recentWord?.translation || '',
            audio: recentWord?.audio || ''
          };
        });
        
        if (addWordsToReview && wordsForRevision.length > 0) {
          addWordsToReview(wordsForRevision);
          console.log('✅ Mots synchronisés avec le système de révision:', wordsForRevision.length);
        }
      }
    } catch (revisionError) {
      console.error('⚠️ Erreur synchronisation révision (non critique):', revisionError);
    }
    
    // ✅ 8. CHARGEMENT DEPUIS GOOGLE DRIVE (SI CONNECTÉ)
    if (user && localStorage.getItem('googleToken')) {
      console.log('☁️ Tentative de chargement depuis Google Drive');
      setTimeout(() => {
        try {
          loadDataFromGoogleDrive();
          console.log('✅ Chargement Google Drive initié');
        } catch (driveError) {
          console.error('❌ Erreur Google Drive:', driveError);
        }
      }, 500); // Délai pour s'assurer que les états sont mis à jour
    } else {
      console.log('📱 Mode local uniquement - pas de compte Google connecté');
    }
    
    // ✅ 9. NETTOYAGE MOBILE
    if (isMobileView) {
      console.log('📱 Nettoyage spécifique mobile');
      
      // S'assurer que les styles mobile restent corrects
      setTimeout(() => {
        if (!document.body.classList.contains('mobile-view')) {
          document.body.classList.add('mobile-view');
        }
        
        document.body.style.cssText = `
          margin: 0 !important;
          padding: 60px 0 0 0 !important;
          background-color: #0f172a !important;
          min-height: 100vh !important;
          overflow-x: hidden !important;
        `;
      }, 100);
    }
    
    // ✅ 10. NOTIFICATION DE SUCCÈS
    console.log('🎉 Changement de langue terminé avec succès');
    console.log('🌍 Nouvelle langue active:', newLanguage);
    console.log('📊 Mots appris dans cette langue:', newUserProgress.learnedWords.size);
    console.log('📚 Catégories complétées:', newCompletedCategories.length);
    
    // Optionnel: Déclencher un événement pour notifier d'autres composants
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: {
        oldLanguage: currentLanguage,
        newLanguage: newLanguage,
        wordsCount: newUserProgress.learnedWords.size,
        categoriesCount: newCompletedCategories.length
      }
    }));
    
  } catch (error) {
    console.error('💥 ERREUR CRITIQUE lors du changement de langue:', error);
    
    // Gestion d'erreur: essayer de revenir à un état stable
    try {
      setMode('menu');
      setSelectedCategory(null);
      
      // Si on ne peut pas changer de langue, au moins éviter un crash
      if (currentLanguage) {
        console.log('🛡️ Tentative de maintien de la langue actuelle');
      } else {
        console.log('🛡️ Tentative de fallback vers une langue par défaut');
        // Vous pourriez vouloir définir une langue de fallback ici
      }
    } catch (fallbackError) {
      console.error('💥 ERREUR CRITIQUE DE FALLBACK:', fallbackError);
      // En dernier recours, recharger la page
      console.log('🔄 Rechargement de la page en dernier recours');
      window.location.reload();
    }
  }
  
  console.log('🌍===== FIN CHANGEMENT DE LANGUE =====');
}, [
  currentLanguage,
  userProgress,
  completedCategories,
  setCurrentLanguage,
  setLanguageData,
  setUserProgress,
  setCompletedCategories,
  setMode,
  setSelectedCategory,
  setCurrentStreak,
  setLastAnswerCorrect,
  setSessionLearnedWords,
  setResetToken,
  addWordsToReview,
  user,
  loadDataFromGoogleDrive,
  isMobileView
]);

  const handleLogin = useCallback((response: any) => {
    try {
      if (response?.credential) {
        console.log("Connexion Google réussie, sauvegarde du token");
        localStorage.setItem('googleToken', response.credential);
        
        // S'assurer que le user est bien défini
        const decodedToken = response.decodedToken || {};
        console.log("Configuration de l'état user avec:", decodedToken);
        setUser(decodedToken);
        
        // Charger les données depuis Google Drive
        loadDataFromGoogleDrive();
        setShowLandingPage(false);
      }
    } catch (error) {
      console.error('Error handling login:', error);
    }
  }, [loadDataFromGoogleDrive]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setCompletedCategories([]);
    setUserProgress({
      ...DEFAULT_USER_PROGRESS,
      language: currentLanguage
    });
    setCurrentStreak(0);
    setLastAnswerCorrect(null);
    setShowLandingPage(true);
  }, [currentLanguage]);

  const forceLoginPage = useCallback(() => {
    setShowLandingPage(true);
    setUser(null);
    // Autres opérations de nettoyage si nécessaire
  }, []);

  const selectCategory = useCallback((category: string): void => {
    setSelectedCategory(category);
    setMode('learn');
  }, []);

  const handleBackFromLearn = useCallback(() => {
    console.log('🔙 handleBackFromLearn appelé - mode:', mode, 'selectedCategory:', selectedCategory);
    
    // ✅ CORRECTION : Ne pas changer selectedCategory si on est en mode summary
    if (mode === 'learn' && selectedCategory) {
      // ✅ Vérifier qu'on n'est pas dans le processus de résumé
      const isInSummaryProcess = localStorage.getItem(`${currentLanguage}-${selectedCategory}-summary-in-progress`);
      
      if (!isInSummaryProcess) {
        console.log('✅ Navigation normale - remise à zéro de selectedCategory');
        setSelectedCategory(null);
      } else {
        console.log('⏸️ Résumé en cours - selectedCategory préservé');
      }
    }
  }, [mode, selectedCategory, currentLanguage]);

  // 🔧 FIX 4: Améliorer handleSubscriptionSuccess
  const handleSubscriptionSuccess = useCallback(() => {
    console.log("🎉 handleSubscriptionSuccess appelé");
    
    // Forcer le refresh du statut
    const tier = subscriptionService.getCurrentTier();
    console.log("🔍 Tier après succès:", tier);
    
    setSubscriptionTier(tier);
    
    // 🆕 AJOUT: Reset complet du modal state
    setShowSubscriptionModal(false);
    setBlockedFeature(null);
    setPremiumFeatureLabel('');
    
    console.log("✅ Modal fermé et variables reset");
    
    if (blockedFeature) {
      console.log("🔄 Redirection vers la fonctionnalité demandée:", blockedFeature);
      
      // Redirection vers la fonctionnalité demandée
      if (blockedFeature === 'categories_full' && selectedCategory) {
        setMode('learn');
      } else if (blockedFeature === 'revision_basic' || blockedFeature === 'revision_unlimited') {
        setMode('review');
      } else if (blockedFeature === 'grammar_full') {
        setMode('grammar');
      } else if (blockedFeature === 'sentence_construction') {
        setMode('sentenceConstruction');
      } else if (blockedFeature === 'sentence_gap') {
        setMode('sentenceGap');
      } else if (blockedFeature === 'exercise_basic' || blockedFeature === 'exercise_mode') {
        setMode('exercise');
      } else if (blockedFeature === 'progress_stats_basic' || blockedFeature === 'progress_stats') {
        setMode('progression');
      }
    }
  }, [blockedFeature, selectedCategory, subscriptionService]);

  const handleResetProgress = useCallback(() => {
    setShowResetConfirmation(true);
  }, []);

  const confirmResetProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Début de la réinitialisation de la progression...");
      
      // Utilisation de la fonction resetProgress avec tous les paramètres nécessaires
      await resetProgress({
        setCompletedCategories,
        setUserProgress,
        setQuizScore: () => {}, // App.tsx n'utilise pas directement de quizScore
        user,
        saveDataToGoogleDrive: async () => {
          // Créer un état vide pour la sauvegarde
          const emptyProgress: UserProgress = {
            learnedWords: new Set<string>(),
            wordsToReview: new Set<string>(),
            wordProgress: {},
            recentlyLearnedWords: [],
            language: currentLanguage
          };
          
          // Sérialiser pour Google Drive
          const serializedProgress = serializeUserProgress(emptyProgress);
          
          // Sauvegarder sur Google Drive si un token est disponible
          const token = localStorage.getItem('googleToken');
          if (token) {
            try {
              const driveService = new GoogleDriveService(token);
              await driveService.saveData(currentLanguage, {
                progress: serializedProgress,
                completedCategories: [],
                timestamp: Date.now(),
                _metadata: {
                  type: 'reset',
                  timestamp: Date.now(),
                  lastUpdated: new Date().toISOString()
                }
              });
              console.log("État vide sauvegardé sur Google Drive après réinitialisation");
            } catch (driveError) {
              console.error("Erreur lors de la sauvegarde sur Google Drive:", driveError);
            }
          }
        },
        currentLanguage
      });
      
      // Fermer la boîte de dialogue de confirmation
      setShowResetConfirmation(false);
      
      console.log("Réinitialisation terminée, rafraîchissement de la page...");
      
      // La fonction resetProgress s'occupe de recharger la page
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      setIsLoading(false);
      setShowResetConfirmation(false);
      
      // Afficher une notification d'erreur à l'utilisateur
      alert("Une erreur est survenue lors de la réinitialisation. Veuillez réessayer.");
    }
  }, [currentLanguage, user, setCompletedCategories, setUserProgress, setShowResetConfirmation]);

  // ✅ MODIFIÉ : updateWordProgress sans sauvegarde automatique
  const updateWordProgress = useCallback((category: string, word: string, correct: boolean) => {
    handleQuizAnswer(correct);
    
    setUserProgress(prev => {
      const updatedProgress = {
        ...prev,
        wordProgress: {
          ...prev.wordProgress,
          [word]: {
            ...prev.wordProgress[word],
            correct: correct ? (prev.wordProgress[word]?.correct || 0) + 1 : prev.wordProgress[word]?.correct || 0,
            incorrect: !correct ? (prev.wordProgress[word]?.incorrect || 0) + 1 : prev.wordProgress[word]?.incorrect || 0,
            tested: (prev.wordProgress[word]?.tested || 0) + 1,
            lastReviewed: Date.now(),
            interval: correct ? (prev.wordProgress[word]?.interval || 1) * 2 : 1,
            language: currentLanguage
          }
        }
      };
  
      // La logique était inversée ici - il faut ajouter à wordsToReview quand le mot est appris
      const progressForWord = updatedProgress.wordProgress[word];
      if (progressForWord.correct >= CORRECT_ANSWERS_TO_LEARN) {
        updatedProgress.learnedWords = new Set([...prev.learnedWords, word]);
        updatedProgress.wordsToReview = new Set([...prev.wordsToReview, word]); // Ajout à wordsToReview
      }
  
      // ✅ SUPPRESSION : Plus de sauvegarde automatique
      console.log('📝 updateWordProgress - progression mise à jour en mémoire uniquement');
      console.log('💡 La sauvegarde aura lieu lors du résumé de session');
      
      return updatedProgress;
    });
  }, [currentLanguage, handleQuizAnswer]); // ✅ Suppression de saveProgress des dépendances

  const handleCategoryComplete = useCallback((category: string) => {
    const newCategories = [...completedCategories];
    if (!newCategories.includes(category)) {
      newCategories.push(category);
      localStorage.setItem(`${currentLanguage}-completedCategories`, JSON.stringify(newCategories));
      setCompletedCategories(newCategories);
    }
    handleSuccess();
  }, [currentLanguage, completedCategories, handleSuccess]);

  const getWordsForReview = useCallback((): [string, string][] => {
    const categories = languageData.categories;
    console.log("Langue actuelle:", currentLanguage);
    console.log("Categories disponibles:", Object.keys(categories));
    console.log("Contenu des catégories:", categories);
    
    // D'abord vérifier les mots à réviser
    const wordsToReview = Array.from(userProgress.wordsToReview)
      .filter(word => {
        // Vérifier dans toutes les catégories
        const exists = Object.values(categories).some(category => 
          Object.keys(category).includes(word)
        );
        console.log(`Vérification du mot ${word}: ${exists ? 'existe' : 'n\'existe pas'} dans les catégories`);
        return exists;
      })
      .map(word => {
        // Trouver la catégorie correcte
        const category = Object.keys(categories).find(cat => 
          Object.keys(categories[cat]).includes(word)
        ) || '';
        return [category, word] as [string, string];
      });

    console.log('Mots filtrés pour la révision:', wordsToReview);
    return wordsToReview;
  }, [userProgress.wordsToReview, languageData.categories, currentLanguage]);

  const checkReviewDue = useCallback(() => {
    const now = Date.now();
    const isDue = Array.from(userProgress.wordsToReview).some(word => {
      const wordProgress = userProgress.wordProgress[word];
      return wordProgress && wordProgress.nextReview <= now;
    });
    setReviewDue(isDue);
  }, [userProgress]);

  const getTitleForMode = (mode: AppMode): string => {
    switch(mode) {
      case 'menu': return 'JogoLinga';
      case 'learn': return 'Vocabulaire';
      case 'review': return 'Révision';
      case 'quiz': return 'Quiz';
      case 'grammar': return 'Grammaire';
      case 'sentenceConstruction': return 'Construction de phrases';
      case 'sentenceGap': return 'Phrases à trous';
      case 'exercise': return 'Exercices';  
      default: return 'JogoLinga';
    }
  };


 
 // 🔧 FIX 3: Modifier selectMode pour éviter les vérifications inutiles
const selectMode = useCallback((selectedMode: AppMode): void => {
  console.log(`🎯 selectMode appelé: ${mode} -> ${selectedMode}`);
  
  if (mode === selectedMode) {
    console.log(`🚀 [Navigation] Mode ${selectedMode} déjà actif, ignoré`);
    return;
  }

  const currentTier = subscriptionService.getCurrentTier();
  console.log(`🔍 [Navigation] Tier actuel: ${currentTier}`);
  
  if (currentTier === SubscriptionTier.PREMIUM) {
    setBlockedFeature(null);
    setPremiumFeatureLabel('');
    setShowSubscriptionModal(false);
    console.log("🔧 [Navigation] Reset modal state pour utilisateur Premium");
  }

  if (selectedMode !== 'menu') {
    const newTab = getModeTab(selectedMode);
    setLastActiveTab(newTab);
    console.log(`📌 Onglet sauvegardé pour le mode ${selectedMode}: ${newTab}`);
  }

  if (selectedMode === 'menu' && mode === 'review') {
    console.log('🔄 Retour de révision au menu - réinitialisation de selectedCategory');
    setSelectedCategory(null);
  }

  // ✅ CORRECTION MAJEURE: Modes GRATUITS illimités
  const freeUnlimitedModes = ['menu', 'learn', 'review', 'quiz', 'progression'];
  const isPremiumOnlyMode = !freeUnlimitedModes.includes(selectedMode);
  
 if (isPremiumOnlyMode && currentTier !== SubscriptionTier.PREMIUM) {
  // 🔧 Définir seulement les modes Premium avec un type partiel
  const premiumOnlyFeatures: Partial<Record<AppMode, string>> = {
    'grammar': 'grammar_full',
    'sentenceConstruction': 'sentence_construction',
    'sentenceGap': 'sentence_gap',
    'exercise': 'exercise_unlimited'  // ✅ AJOUT: Mode exercices Premium
  };
  
  const requiredFeature = premiumOnlyFeatures[selectedMode];
  
  if (requiredFeature) {
    console.log(`❌ [SUBSCRIPTION] Accès bloqué au mode Premium: ${selectedMode}`);
    setBlockedFeature(requiredFeature);
    setPremiumFeatureLabel(getTitleForMode(selectedMode));
    setShowSubscriptionModal(true);
    return;
  }
}
  
  // ✅ Modes accessibles en gratuit
  console.log(`✅ [SUBSCRIPTION] Accès autorisé au mode: ${selectedMode}`);
  
  // Navigation normale
  console.log(`🚀 [NAVIGATION] Passage au mode: ${selectedMode}`);
  
  const appContainer = document.querySelector('.App');
  if (appContainer) {
    appContainer.classList.add('mode-transition');
    
    setTimeout(() => {
      console.log(`🚀 [Navigation] SETMODE appelé: ${selectedMode}`);
      setMode(selectedMode);
      setNavigationHistory(prev => [...prev, selectedMode]);
      
      if (selectedMode === 'learn') {
        setCurrentStreak(0);
        setLastAnswerCorrect(null);
      } else if (selectedMode === 'menu') {
        const isComingFromSummary = navigationHistory[navigationHistory.length - 1] === 'learn' && selectedCategory;
        if (!isComingFromSummary) {
          console.log('🔄 Retour au menu - réinitialisation de selectedCategory');
          setSelectedCategory(null);
        }
      }
      
      setTimeout(() => {
        appContainer.classList.remove('mode-transition');
      }, 100);
    }, 150);
  } else {
    console.log(`🚀 [Navigation] Fallback SETMODE: ${selectedMode}`);
    setMode(selectedMode);
    setNavigationHistory(prev => [...prev, selectedMode]);
    
    if (selectedMode === 'learn') {
      setCurrentStreak(0);
      setLastAnswerCorrect(null);
    } else if (selectedMode === 'menu') {
      const isComingFromSummary = navigationHistory[navigationHistory.length - 1] === 'learn' && selectedCategory;
      if (!isComingFromSummary) {
        console.log('🔄 Fallback - réinitialisation de selectedCategory');
        setSelectedCategory(null);
      }
    }
  }
}, [
  mode, 
  subscriptionService, 
  subscriptionTier, 
  setBlockedFeature,
  setPremiumFeatureLabel,
  setShowSubscriptionModal,
  getTitleForMode,
  navigationHistory,
  selectedCategory,
  isMobileView
]);


 useEffect(() => {
    console.log('🔍 Vérification première connexion...');
    
    const lastUsedLanguage = getLastUsedLanguage();
    const hasEverUsedApp = localStorage.getItem('hasEverUsedApp');
    
    if (!hasEverUsedApp && !lastUsedLanguage) {
      console.log('🆕 Première connexion détectée - affichage du sélecteur de langue');
      setIsFirstConnection(true);
      setShowLanguageSelection(true);
      setCurrentLanguage(null);
    } else if (lastUsedLanguage) {
      console.log('🔄 Langue précédente trouvée:', lastUsedLanguage);
      setCurrentLanguage(lastUsedLanguage);
      setIsFirstConnection(false);
      setShowLanguageSelection(false);
      
      // Charger les données de la langue
      const newLanguageData = getLanguageData(lastUsedLanguage);
      setLanguageData(newLanguageData);
    } else {
      console.log('⚠️ Situation inattendue - affichage du sélecteur');
      setIsFirstConnection(true);
      setShowLanguageSelection(true);
      setCurrentLanguage(null);
    }
  }, []);


useEffect(() => {
  console.log("📄 Effet de chargement initial déclenché");
  console.log("User:", !!user, "CurrentLanguage:", currentLanguage);
  
  // ✅ PROTECTION: Ne rien faire si pas de langue sélectionnée
  if (!currentLanguage) {
    console.log('⚠️ useEffect sync: Pas de langue sélectionnée, skip');
    return;
  }

  
  
  // Toujours charger les données locales d'abord
  const loadLocalFirst = async () => {
    try {
      const storageKey = `${currentLanguage}-progress`;
      const savedProgress = localStorage.getItem(storageKey);
      const savedCategories = localStorage.getItem(`${currentLanguage}-completedCategories`);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        const deserializedProgress = deserializeUserProgress(parsed);
        setUserProgress(deserializedProgress);
      }
      
      if (savedCategories) {
        setCompletedCategories(JSON.parse(savedCategories));
      }
      
      console.log("✅ Données locales chargées pour:", currentLanguage);
    } catch (error) {
      console.error('❌ Erreur chargement localStorage:', error);
      // ✅ PROTECTION: Créer progression par défaut avec langue actuelle
      setUserProgress({
        learnedWords: new Set<string>(),
        wordsToReview: new Set<string>(),
        wordProgress: {},
        recentlyLearnedWords: [],
        language: currentLanguage
      });
    }
  };
  
  // Charger local d'abord
  loadLocalFirst();
  
  // Puis charger depuis Google Drive si connecté
  if (user && localStorage.getItem('googleToken')) {
    console.log("☁️ Chargement Google Drive...");
    loadDataFromGoogleDrive();
  } else {
    console.log("📱 Pas de connexion Google - mode local uniquement");
  }
}, [user, currentLanguage, loadDataFromGoogleDrive]);

  // ✅ AJOUT : useEffect de debug pour traquer les changements
  useEffect(() => {
    console.log('🔍 [DEBUG] selectedCategory changed:', selectedCategory, 'mode:', mode);
    
    // Si selectedCategory devient null pendant que nous sommes en mode learn, investiguer
    if (selectedCategory === null && mode === 'learn') {
      console.warn('⚠️ selectedCategory est devenu null en mode learn - possible problème');
      console.trace('Stack trace pour selectedCategory = null');
    }
  }, [selectedCategory, mode]);

  useEffect(() => {
    console.log('🔍 [DEBUG] mode changed:', mode, 'selectedCategory:', selectedCategory);
  }, [mode]);

  // Effects
useEffect(() => {
  // ✅ PROTECTION: Ne charger que si currentLanguage est défini
  if (currentLanguage) {
    console.log('📊 Chargement initial de la progression pour:', currentLanguage);
    loadUserProgress();
  } else {
    console.log('⚠️ useEffect initial: Pas de langue sélectionnée, skip');
  }
}, []);

  useEffect(() => {
    checkReviewDue();
  }, [checkReviewDue]);

useEffect(() => {
  // ✅ PROTECTION: Ne charger que si currentLanguage est défini
  if (!currentLanguage) {
    console.log('⚠️ useEffect langue: currentLanguage est null, skip');
    return;
  }

  console.log("Langue sélectionnée:", currentLanguage);
  console.log("Données de langue:", languageData);
  
  // ✅ PROTECTION: Vérifier que la langue est disponible
  try {
    const newLanguageData = getLanguageData(currentLanguage);
    setLanguageData(newLanguageData);
    console.log('✅ Données de langue chargées:', newLanguageData.name);
    
    // ✅ PROTECTION: Charger la progression seulement si langue valide
    console.log('📊 Rechargement progression pour langue:', currentLanguage);
    loadUserProgress();
    
  } catch (error) {
    console.error('❌ Erreur chargement données langue:', error);
    console.error('❌ Langue problématique:', currentLanguage);
    // Ne pas planter l'app, juste logger l'erreur
    return;
  }
}, [currentLanguage]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
      
      // Ajouter ou retirer la classe "mobile-view" au body
      if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };
    
    // Initialiser
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Charger l'état d'abonnement au démarrage
    const tier = subscriptionService.getCurrentTier();
    console.log("[DEBUG] État d'abonnement chargé:", tier);
    setSubscriptionTier(tier);
  }, []);

  useEffect(() => {
    // Initialiser revisionProgressState avec les données de revisionProgress
    setRevisionProgress(revisionProgress);
  }, [revisionProgress]);

  useEffect(() => {
    // Appliquer immédiatement
    removeWhiteHeader();
    
    // Écouter les événements de scroll qui pourraient faire réapparaître l'élément blanc
    const handleScroll = () => {
      if (window.scrollY <= 10) {
        removeWhiteHeader();
      }
    };
    
    // Écouter les événements de redimensionnement
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
      removeWhiteHeader();
      
      // Ajouter ou retirer la classe "mobile-view" au body
      if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
      } else {
        document.body.classList.remove('mobile-view');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    // Exécuter également après un court délai pour s'assurer que tous les éléments sont chargés
    const timeoutId = setTimeout(removeWhiteHeader, 500);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    // Initialiser le service de paiement
    paymentService.initialize().catch(error => 
      console.error('Erreur lors de l\'initialisation du service de paiement:', error)
    );
  }, []);

  // 🔧 FIX 6: Améliorer le useEffect pour les paramètres d'URL de paiement
  useEffect(() => {
    const tier = subscriptionService.getCurrentTier();
    setSubscriptionTier(tier);
    
    // Vérifier si on est sur la page de paiement réussi
    if (location.pathname === '/payment-success') {
      console.log("🔍 Sur la page de succès de paiement");
      
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');
      
      if (sessionId) {
        console.log("🔄 Vérification du paiement pour sessionId:", sessionId);
        
        paymentService.verifyPayment(sessionId).then(success => {
          if (success) {
            console.log("✅ Paiement vérifié avec succès");
            
            // 🆕 AJOUT: Reset du modal après vérification réussie
            setSubscriptionTier(SubscriptionTier.PREMIUM);
            setShowSubscriptionModal(false);
            setBlockedFeature(null);
            setPremiumFeatureLabel('');
          }
        }).catch(error => {
          console.error("❌ Erreur lors de la vérification:", error);
        });
      }
    }
  }, [location]);

  // Ajoutez cette fonction pour initialiser le service de paiement
  useEffect(() => {
    paymentService.initialize();
  }, []);

  // 🔧 FIX 5: Ajouter un useEffect pour surveiller les événements subscription
  useEffect(() => {
    const handleSubscriptionUpdate = (event: CustomEvent) => {
      console.log("🔔 Événement subscriptionUpdated reçu:", event.detail);
      
      const newTier = event.detail.tier;
      setSubscriptionTier(newTier);
      
      // 🆕 AJOUT: Si Premium, reset immédiat du modal
      if (newTier === SubscriptionTier.PREMIUM) {
        console.log("🔧 Premium activé via événement - reset modal");
        setShowSubscriptionModal(false);
        setBlockedFeature(null);
        setPremiumFeatureLabel('');
      }
    };

    // Écouter l'événement personnalisé
    window.addEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
    
    return () => {
      window.removeEventListener('subscriptionUpdated', handleSubscriptionUpdate as EventListener);
    };
  }, []);

  // Dans App.tsx
  useEffect(() => {
    const token = localStorage.getItem('googleToken');
    if (token && !user) {
      console.log("Token trouvé au démarrage, mais user non défini");
      // Ne pas essayer de décoder le token JWT, utiliser une approche plus robuste
      setUser({ isAuthenticated: true }); // Créer un objet user simple
      
      // Vérifier le token directement via une requête à l'API
      const verifyToken = async () => {
        try {
          const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const userData = await response.json();
            setUser({
              isAuthenticated: true,
              ...userData
            });
          } else {
            // Token invalide, le supprimer
            localStorage.removeItem('googleToken');
            setUser(null);
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du token:", error);
        }
      };
      
      verifyToken();
    }
  }, [user]);

console.log('🔍 RENDER DEBUG App:', {
  mode,
  selectedCategory,
  isMobileView,
  showLandingPage,
  currentLanguage,
  lastActiveTab,
  showLanguageSelection,
  isFirstConnection,
  renderTime: new Date().toLocaleTimeString()
});

// Fix LandingPage mobile AVEC vérification de langue
if (isMobileView && showLandingPage) {
  const hasToken = localStorage.getItem('googleToken');
  const hasLanguage = currentLanguage !== null;
  
  // Ne masquer la LandingPage que si on a BOTH un token ET une langue
  if (hasToken && hasLanguage) {
    console.log('🔧 Force masquage LandingPage mobile (token + langue OK)');
    setShowLandingPage(false);
  } else if (hasToken && !hasLanguage) {
    console.log('🔧 Token présent mais pas de langue - affichage sélecteur');
    setShowLandingPage(false);
    setShowLanguageSelection(true);
    setIsFirstConnection(true);
  }
}

 // ✅ CONDITION 1 : Sélecteur de langue (PREMIÈRE PRIORITÉ)
// ✅ CONDITION 1 : Sélecteur de langue (PREMIÈRE PRIORITÉ)
if ((showLanguageSelection && isFirstConnection) || (!currentLanguage && !showLandingPage)) {
  console.log('🌍 Affichage du sélecteur de langue:', { showLanguageSelection, isFirstConnection, currentLanguage });
  return (
    <ThemeProvider>
      <LanguageFirstSelection 
        onLanguageSelect={handleLanguageFirstSelection}
        isVisible={true}
      />
    </ThemeProvider>
  );
}

  // ✅ CONDITION 2 : Protection contre rendu sans langue (DEUXIÈME PRIORITÉ)
  if (!currentLanguage || !languageData) {
    return (
      <ThemeProvider>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          textAlign: 'center',
          zIndex: 9999
        }}>
          <div>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🌍</div>
            <div>Chargement de l'application...</div>
          </div>
        </div>
      </ThemeProvider>
    );
  }

 console.log('🔍 RENDER DEBUG App:', {
  mode,
  selectedCategory,
  isMobileView,
  showLandingPage,
  currentLanguage,
  lastActiveTab,
  renderTime: new Date().toLocaleTimeString()
});

// Fix LandingPage mobile
if (isMobileView && showLandingPage) {
  const hasToken = localStorage.getItem('googleToken');
  if (hasToken) {
    console.log('🔧 Force masquage LandingPage mobile');
    setShowLandingPage(false);
  }
}

  // ✅ RENDU PRINCIPAL (TROISIÈME PRIORITÉ - seulement si langue sélectionnée)
  return (
  <ThemeProvider>
    <Routes>
       <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />
      {/* ✅ Route spéciale pour la page de succès de paiement */}
      <Route path="/payment-success" element={<PaymentSuccessPage />} />

      {/* ✅ Route par défaut qui reprend tout ton rendu actuel */}
      <Route
        path="/*"
        element={
          <>
            {showLandingPage && !isMobileView ? (
              <LandingPage 
                onLogin={handleLogin}
                onContinueAsGuest={() => setShowLandingPage(false)}
              />
            ) : (
              <motion.div 
                className="App"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Votre contenu App existant */}
                {isMobileView ? (
                  <div className="mobile-app-container" style={{
                    display: 'block',
                    width: '100%',
                    minHeight: '100vh',
                    backgroundColor: '#0f172a',
                    paddingTop: '60px'
                  }}>
                    {/* Header mobile - TOUJOURS visible */}
                    <MobileHeader
                      title={getTitleForMode(mode)}
                      languageCode={currentLanguage}
                      onLanguageChange={handleLanguageChange}
                      showLanguageSelector={true}
                      currentMode={mode}
                      onLogin={handleLogin}
                      onLogout={handleLogout}
                      onOpenSubscription={handleOpenSubscription}
                      subscriptionTier={subscriptionTier}
                    />
                    
                    {/* CONTENU PRINCIPAL avec vérifications */}
                    <div className="mobile-main-content" style={{
                      display: 'block',
                      width: '100%',
                      minHeight: 'calc(100vh - 140px)',
                      backgroundColor: '#0f172a',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      
                      {/* DEBUG - À retirer après test */}
                      {process.env.NODE_ENV === 'development' && (
                        <div style={{
                          position: 'fixed',
                          top: '70px',
                          right: '10px',
                          background: 'rgba(0,0,0,0.8)',
                          color: 'white',
                          padding: '5px',
                          fontSize: '10px',
                          zIndex: 9999,
                          borderRadius: '4px'
                        }}>
                          Mode: {mode || 'undefined'} | Cat: {selectedCategory || 'null'} | Tab: {lastActiveTab}
                        </div>
                      )}
                      
                      {/* ✅ MENU - Mode par défaut sûr */}
                      {(!mode || mode === 'menu') && (
                        <div style={{
                          display: 'block',
                          width: '100%',
                          minHeight: 'calc(100vh - 140px)',
                          backgroundColor: '#0f172a',
                          padding: '20px'
                        }}>
                          {console.log('🔍 RENDU MainMenu Mobile - mode:', mode, 'lastActiveTab:', lastActiveTab)}
                          <MainMenu 
                            languageCode={currentLanguage}
                            onSelectMode={(selectedMode) => {
                              console.log('🎯 MainMenu Mobile onSelectMode:', selectedMode);
                              selectMode(selectedMode);
                            }}
                            reviewDue={reviewDue}
                            onResetProgress={handleResetProgress}
                            learnedWordsCount={getUniqueLearnedWordsCount()}
                            onLanguageChange={handleLanguageChange}
                            isMobileView={true}
                            revisionProgress={revisionProgressState}
                            onOpenSubscription={handleOpenSubscription}
                            onLogin={handleLogin}
                            onLogout={handleLogout} 
                            onForceLoginPage={forceLoginPage}
                            subscriptionTier={subscriptionTier}
                            // ✅ NOUVEAU: Passer l'onglet précédent
                            initialTab={lastActiveTab}
                          />
                        </div>
                      )}
                      
                      {/* ✅ SELECTION CATÉGORIE - Avec protection */}
                      {mode === 'learn' && !selectedCategory && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a', padding: '20px' }}>
                          {console.log('🔍 RENDU CategorySelection Mobile - mode:', mode, 'selectedCategory:', selectedCategory)}
                          <CategorySelection 
                            languageCode={currentLanguage}
                            categories={languageData.categories}
                            categoryIllustrations={languageData.categoryIllustrations}
                            onSelectCategory={selectCategory}
                            onStartRevision={handleStartRevision}
                            completedCategories={completedCategories}
                            sessionLearnedWords={sessionLearnedWords}
                            userProgress={userProgress}
                            onBackToMenu={() => selectMode('menu')}
                            isMobileView={true}
                          />
                        </div>
                      )}
                      
                      {/* ✅ APPRENTISSAGE - Avec double protection */}
                      {mode === 'learn' && selectedCategory && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU LearnMode Mobile - mode:', mode, 'selectedCategory:', selectedCategory)}
                          <LearnMode 
                            languageCode={currentLanguage}
                            category={selectedCategory}
                            onBackToCategories={handleBackFromLearn}
                            onGameComplete={() => handleCategoryComplete(selectedCategory)}
                            onWordLearned={(word: string, correct: boolean) => 
                              updateWordProgress(selectedCategory, word, correct)}
                            onWordsLearned={(words) => {
                              handleWordsLearned(words);
                              setSessionLearnedWords(prev => 
                                new Set([...prev, ...words.map(w => w.word)])
                              );
                            }}
                            resetToken={resetToken}
                            onAnswer={handleQuizAnswer}
                            isLoading={isLoading}
                            sessionLearnedWords={sessionLearnedWords}
                            setMode={setMode}
                            onSessionComplete={saveSessionProgress}
                            saveProgressOnSummary={saveProgressOnSummary}
                          />
                        </div>
                      )}

                      {/* ✅ RÉVISION */}
                      {mode === 'review' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU RevisionMode Mobile - mode:', mode)}
                          <RevisionMode 
                            languageCode={currentLanguage}
                            onBackToMenu={() => selectMode('menu')}
                            onWordRevised={(word: string, isCorrect: boolean) => {
                              setCurrentStreak(isCorrect ? prev => prev + 1 : 0);
                              setLastAnswerCorrect(isCorrect);
                              console.log('🔍 onWordRevised Mobile - mise à jour mémoire uniquement');
                            }}
                            onUpdateRevisionState={handleUpdateRevisionState}
                          />
                        </div>
                      )}

                      {/* ✅ QUIZ */}
                      {mode === 'quiz' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU QuizComponent Mobile - mode:', mode)}
                          <QuizComponent
                            languageCode={currentLanguage}
                            words={transformedWords}
                            onComplete={handleSuccess}
                            onAnswerSubmit={handleQuizAnswer}
                            backgroundAudioUrl="/ambiance/Chronometre.wav"
                            correctAnswerSoundUrl="/ambiance/Correct.mp3"
                            wrongAnswerSoundUrl="/ambiance/Erreur.mp3"
                            onGameFinished={() => selectMode('menu')}
                          />
                        </div>
                      )}

                      {/* ✅ GRAMMAIRE */}
                      {mode === 'grammar' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU GrammarMode Mobile - mode:', mode)}
                          <GrammarMode 
                            languageCode={currentLanguage}
                            onBackToCategories={() => selectMode("menu")}
                            onCategoryComplete={(category: string) => {
                              handleCategoryComplete(category);
                            }}
                            resetToken={resetToken}
                            onWordsLearned={(words) => {
                              handleWordsLearned(words);
                              console.log('🔍 onWordsLearned (GrammarMode Mobile) - mise à jour mémoire uniquement');
                            }}
                            saveProgressOnSummary={saveProgressOnSummary}
                            onSessionComplete={saveSessionProgress}
                            isMobileView={true}
                          />
                        </div>
                      )}

                      {/* ✅ CONSTRUCTION DE PHRASES */}
                      {mode === 'sentenceConstruction' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU SentenceConstructionGame Mobile - mode:', mode)}
                          <SentenceConstructionGame
                            languageCode={currentLanguage}
                            onBackToCategories={() => selectMode('menu')}
                            onAnswer={handleQuizAnswer}
                            onGameComplete={handleSuccess}
                            onSentencesLearned={(sentences) => {
                              const wordsToAdd = sentences.filter(s => s.mastered).map(sentence => ({
                                word: sentence.original,
                                category: sentence.category,
                                language: currentLanguage,
                                timestamp: sentence.timestamp,
                                translation: sentence.french,
                                audio: sentence.audio
                              }));
                              addWordsToReview(wordsToAdd);
                              console.log('🔍 onSentencesLearned Mobile - mise à jour mémoire uniquement');
                            }}
                            saveProgressOnSummary={saveProgressOnSummary}
                            userProgress={userProgress}
                            isMobileView={true}
                          />
                        </div>
                      )}

                      {/* ✅ PHRASES À TROUS */}
                      {mode === 'sentenceGap' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU SentenceGapGame Mobile - mode:', mode)}
                          <SentenceGapGame 
                            languageCode={currentLanguage}
                            onGameComplete={handleSuccess}
                            onBackToCategories={() => selectMode("menu")}
                            onAnswer={handleQuizAnswer}
                          />
                        </div>
                      )}

                      {/* ✅ EXERCICES */}
                      {mode === 'exercise' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU ExerciseMode Mobile - mode:', mode)}
                          <ExerciseMode 
                            languageCode={currentLanguage}
                            onBackToCategories={() => selectMode("menu")}
                            onExerciseComplete={handleSuccess}
                          />
                        </div>
                      )}

                      {/* ✅ STATISTIQUES */}
                      {mode === 'progression' && (
                        <div style={{ display: 'block', width: '100%', backgroundColor: '#0f172a' }}>
                          {console.log('🔍 RENDU ProgressStats Mobile - mode:', mode)}
                          <ProgressStats
                            languageCode={currentLanguage}
                            userProgress={userProgress}
                            onBackToMenu={() => selectMode("menu")}
                            completedCategories={completedCategories}
                            currentStreak={currentStreak}
                          />
                        </div>
                      )}
                      
                      {/* ✅ FALLBACK AMÉLIORÉ */}
                      {mode && !['menu', 'learn', 'review', 'quiz', 'grammar', 'sentenceConstruction', 'sentenceGap', 'exercise', 'progression'].includes(mode) && (
                        <div style={{
                          display: 'block',
                          width: '100%',
                          minHeight: 'calc(100vh - 140px)',
                          backgroundColor: '#0f172a',
                          color: 'white',
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <h2>Mode non reconnu: {mode}</h2>
                          <p>Mode supportés: menu, learn, review, quiz, grammar, sentenceConstruction, sentenceGap, exercise, progression</p>
                          <button 
                            onClick={() => {
                              console.log('🔄 Correction de mode non reconnu vers menu');
                              setMode('menu');
                              setSelectedCategory(null);
                            }}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '15px 30px',
                              borderRadius: '8px',
                              fontSize: '16px',
                              cursor: 'pointer'
                            }}
                          >
                            Retour au menu
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* ✅ NAVIGATION BOTTOM - Version améliorée */}
                    <div className="bottom-navigation" style={{
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '80px',
                      backgroundColor: '#1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      zIndex: 1000,
                      flexWrap: 'wrap',
                      gap: '5px'
                    }}>
                      <button onClick={() => selectMode('menu')} style={{
                        background: mode === 'menu' ? '#10b981' : 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        📚 <span>Menu</span>
                      </button>
                      <button onClick={() => selectMode('learn')} style={{
                        background: mode === 'learn' ? '#10b981' : 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🎓 <span>Apprendre</span>
                      </button>
                      <button onClick={() => selectMode('review')} style={{
                        background: mode === 'review' ? '#10b981' : 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🔄 <span>Réviser</span>
                      </button>
                      <button onClick={() => selectMode('grammar')} style={{
                        background: mode === 'grammar' ? '#10b981' : 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        📖 <span>Grammaire</span>
                      </button>
                      <button onClick={() => selectMode('quiz')} style={{
                        background: mode === 'quiz' ? '#10b981' : 'transparent',
                        color: 'white',
                        border: 'none',
                        padding: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🎯 <span>Quiz</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="desktop-navigation-container">
                    {mode === 'menu' && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU MainMenu DESKTOP - mode:', mode, 'lastActiveTab:', lastActiveTab)}
                        <MainMenu 
                          languageCode={currentLanguage}
                          onSelectMode={(selectedMode) => {
                            console.log('🎯 MainMenu DESKTOP onSelectMode appelé avec:', selectedMode);
                            selectMode(selectedMode);
                          }}
                          reviewDue={reviewDue}
                          onResetProgress={handleResetProgress}
                          learnedWordsCount={getUniqueLearnedWordsCount()}
                          onLanguageChange={handleLanguageChange}
                          isMobileView={isMobileView}
                          revisionProgress={revisionProgressState}
                          onOpenSubscription={handleOpenSubscription}
                          onLogin={handleLogin}
                          onLogout={handleLogout} 
                          onForceLoginPage={forceLoginPage}
                          subscriptionTier={subscriptionTier}
                          // ✅ NOUVEAU: Passer l'onglet précédent
                          initialTab={lastActiveTab}
                        />
                      </div>
                    )}

                    {mode === 'learn' && !selectedCategory && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU CategorySelection DESKTOP - mode:', mode, 'selectedCategory:', selectedCategory)}
                        <CategorySelection 
                          languageCode={currentLanguage}
                          categories={languageData.categories}
                          categoryIllustrations={languageData.categoryIllustrations}
                          onSelectCategory={selectCategory}
                          onStartRevision={handleStartRevision}
                          completedCategories={completedCategories}
                          sessionLearnedWords={sessionLearnedWords}
                          userProgress={userProgress}
                          onBackToMenu={() => selectMode('menu')}
                          isMobileView={false}
                        />
                      </div>
                    )}

                    {mode === 'learn' && selectedCategory && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU LearnMode DESKTOP - mode:', mode, 'selectedCategory:', selectedCategory)}
                        <LearnMode 
                          languageCode={currentLanguage}
                          category={selectedCategory}
                          onBackToCategories={() => {
                            console.log('🔙 LearnMode onBackToCategories appelé');
                            
                            // ✅ Marquer la fin du résumé si nécessaire
                            localStorage.removeItem(`${currentLanguage}-${selectedCategory}-summary-in-progress`);
                            
                            handleBackFromLearn();
                          }}
                          onGameComplete={() => {
                            console.log('🏆 LearnMode onGameComplete appelé');
                            handleCategoryComplete(selectedCategory);
                          }}
                          onWordLearned={(word: string, correct: boolean) => 
                            updateWordProgress(selectedCategory, word, correct)}
                          onWordsLearned={(words) => {
                            handleWordsLearned(words);
                            setSessionLearnedWords(prev => 
                              new Set([...prev, ...words.map(w => w.word)])
                            );
                          }}
                          resetToken={resetToken}
                          onAnswer={handleQuizAnswer}
                          isLoading={isLoading}
                          sessionLearnedWords={sessionLearnedWords}
                          setMode={setMode}
                          onSessionComplete={saveSessionProgress}
                          saveProgressOnSummary={saveProgressOnSummary}
                        />
                      </div>
                    )}

                    {mode === 'review' && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU RevisionMode DESKTOP - mode:', mode)}
                        <RevisionMode 
                          languageCode={currentLanguage}
                          onBackToMenu={() => selectMode('menu')}
                          onWordRevised={(word: string, isCorrect: boolean) => {
                            setCurrentStreak(isCorrect ? prev => prev + 1 : 0);
                            setLastAnswerCorrect(isCorrect);
                            console.log('🔍 onWordRevised - mise à jour mémoire uniquement');
                          }}
                          onUpdateRevisionState={handleUpdateRevisionState}
                        />
                      </div>
                    )}

                    {mode === 'quiz' && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU QuizComponent DESKTOP - mode:', mode)}
                        <QuizComponent
                          languageCode={currentLanguage}
                          words={transformedWords}
                          onComplete={handleSuccess}
                          onAnswerSubmit={handleQuizAnswer}
                          backgroundAudioUrl="/ambiance/Chronometre.wav"
                          correctAnswerSoundUrl="/ambiance/Correct.mp3"
                          wrongAnswerSoundUrl="/ambiance/Erreur.mp3"
                          onGameFinished={() => selectMode('menu')}
                        />
                      </div>
                    )}

                    {mode === "sentenceConstruction" && (
                      <div className="desktop-component-wrapper">
                        <SentenceConstructionGame
                          languageCode={currentLanguage}
                          onBackToCategories={() => {
                            selectMode('menu');
                          }}
                          onAnswer={(isCorrect) => {
                            handleQuizAnswer(isCorrect);
                          }}
                          onGameComplete={() => {
                            handleSuccess();
                          }}
                          onSentencesLearned={(sentences) => {
                            // ✅ NOUVEAU: Vérifier si les phrases sont déjà dans le système
                            console.log('🔍 onSentencesLearned - vérification avant ajout');
                            
                            const sentencesToAdd = sentences.filter(sentence => {
                              // Vérifier si la phrase existe déjà dans revisionProgress
                              const alreadyExists = Array.from(revisionProgress.wordsToReview).some(key => 
                                key.includes(sentence.original)
                              );
                              
                              if (alreadyExists) {
                                console.log('⚠️ Phrase déjà en révision, ignorée:', sentence.original);
                                return false;
                              }
                              
                              return true;
                            });
                            
                            if (sentencesToAdd.length > 0) {
                              const wordsToAdd = sentencesToAdd.map(sentence => ({
                                word: sentence.original,
                                category: sentence.category,
                                language: currentLanguage,
                                timestamp: sentence.timestamp,
                                translation: sentence.french,
                                audio: sentence.audio
                              }));
                              
                              addWordsToReview(wordsToAdd);
                              console.log('🔍 Phrases ajoutées au système mots (sans doublons):', sentencesToAdd.length);
                            } else {
                              console.log('🔍 Aucune nouvelle phrase à ajouter (toutes déjà présentes)');
                            }
                          }}
                          saveProgressOnSummary={saveProgressOnSummary}
                          userProgress={userProgress}
                        />
                      </div>
                    )}

                    {mode === "sentenceGap" && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU SentenceGapGame DESKTOP - mode:', mode)}
                        <SentenceGapGame 
                          languageCode={currentLanguage}
                          onGameComplete={handleSuccess}
                          onBackToCategories={() => selectMode("menu")}
                          onAnswer={handleQuizAnswer}
                        />
                      </div>
                    )}

                    {mode === "exercise" && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU ExerciseMode DESKTOP - mode:', mode)}
                        <ExerciseMode 
                          languageCode={currentLanguage}
                          onBackToCategories={() => selectMode("menu")}
                          onExerciseComplete={handleSuccess}
                        />
                      </div>
                    )}

                    {mode === "progression" && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU ProgressStats DESKTOP - mode:', mode)}
                        <ProgressStats
                          languageCode={currentLanguage}
                          userProgress={userProgress}
                          onBackToMenu={() => selectMode("menu")}
                          completedCategories={completedCategories}
                          currentStreak={currentStreak}
                        />
                      </div>
                    )}

                    {mode === "grammar" && (
                      <div className="desktop-component-wrapper">
                        {console.log('🔍 RENDU GrammarMode DESKTOP - mode:', mode)}
                        <GrammarMode 
                          languageCode={currentLanguage}
                          onBackToCategories={() => selectMode("menu")}
                          onCategoryComplete={(category: string) => {
                            handleCategoryComplete(category);
                          }}
                          resetToken={resetToken}
                          onWordsLearned={(words) => {
                            handleWordsLearned(words);
                            console.log('🔍 onWordsLearned (GrammarMode) - mise à jour mémoire uniquement');
                          }}
                          saveProgressOnSummary={saveProgressOnSummary}
                          onSessionComplete={saveSessionProgress}
                          isMobileView={isMobileView}
                        />
                      </div>
                    )}
                  </div>
                )}

                {showCelebration && <CelebrationAnimation />}

                <ConfirmationModal
                  isOpen={showResetConfirmation}
                  onConfirm={confirmResetProgress}
                  onCancel={() => setShowResetConfirmation(false)}
                  message="Êtes-vous sûr de vouloir réinitialiser toute votre progression ? Cette action est irréversible."
                />
              </motion.div>
            )}

            <>
              {/* Affichage du modal d'abonnement */}
              <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                onSuccess={handleSubscriptionSuccess}
                userEmail={user?.email}
              />

              {/* Ajoutez ce code pour la boîte de dialogue de confirmation */}
              <ConfirmationModal
                isOpen={showExitConfirmation}
                onConfirm={() => {
                  setShowExitConfirmation(false);
                  setMode('menu');
                }}
                onCancel={() => setShowExitConfirmation(false)}
                message="Êtes-vous sûr de vouloir quitter ? Votre progression ne sera pas sauvegardée."
              />
            </>
          </>
        }
      />
    </Routes>
  </ThemeProvider>
);

};

export default App;
