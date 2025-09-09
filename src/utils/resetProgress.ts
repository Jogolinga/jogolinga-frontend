import { Dispatch, SetStateAction } from 'react';
import { UserProgress, LanguageCode, LearnedWord, WordProgress } from '../types/types';
import { 
  getLanguageData, 
  wolofCategories,
  bambaraCategories,
  LANGUAGE_CODES 
} from '../data/languages';
import { DEFAULT_SETTINGS } from './revisionHelpers';
// ✅ SUPPRIMÉ: import { DEFAULT_LANGUAGE } from '../constants';
import { GoogleDriveService } from '../services/googleDriveService';

// ✅ AJOUT: Constante locale pour remplacer DEFAULT_LANGUAGE
const FALLBACK_LANGUAGE: LanguageCode = 'wf'; // Wolof comme langue de fallback

export interface ResetProgressOptions {
  setCompletedCategories: Dispatch<SetStateAction<string[]>>;
  setUserProgress: Dispatch<SetStateAction<UserProgress>>;
  setQuizScore: Dispatch<SetStateAction<number>>;
  user: any | null;
  saveDataToGoogleDrive: () => Promise<void>;
  currentLanguage: LanguageCode;
}

// ✅ MODIFICATION: DEFAULT_USER_PROGRESS devient une fonction
export const createDefaultUserProgress = (language: LanguageCode): UserProgress => ({
  learnedWords: new Set<string>(),
  wordsToReview: new Set<string>(),
  wordProgress: {},
  recentlyLearnedWords: [],
  language: language // Utilise la langue passée en paramètre
});

// ✅ EXPORT pour compatibilité avec le reste du code
export const DEFAULT_USER_PROGRESS = createDefaultUserProgress(FALLBACK_LANGUAGE);

interface ProgressState {
  completedCategories: string[];
  userProgress: UserProgress;
  quizScore: number;
}

interface SavedProgress {
  learnedWords: string[];
  wordsToReview: string[];
  wordProgress: Record<string, WordProgress>;
  recentlyLearnedWords: LearnedWord[];
  revisionSettings: typeof DEFAULT_SETTINGS;
  language: LanguageCode;
  experience?: {
    totalXP: number;
    currentLevel: number;
    xpForNextLevel: number;
    history: any[];
  };
}

// Vérification de la disponibilité du localStorage
const checkStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.error('localStorage non disponible:', e);
    return false;
  }
};

// Fonction de sauvegarde avec retry
const saveWithRetry = async (key: string, data: any, maxRetries = 3): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      const saved = localStorage.getItem(key);
      if (!saved) throw new Error('Vérification de sauvegarde échouée');
      return true;
    } catch (error) {
      console.error(`Tentative ${i + 1}/${maxRetries} échouée:`, error);
      if (i === maxRetries - 1) break;
      
      // Nettoyage et attente avant retry
      await clearOldData();
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  return false;
};

// Nettoyage des anciennes données
const clearOldData = async (): Promise<void> => {
  try {
    const pattern = /^(temp|inProgress|test|learn)/;
    Object.keys(localStorage).forEach(key => {
      if (pattern.test(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
};

const getCategoriesForLanguage = (languageCode: LanguageCode) => {
  switch (languageCode) {
    case LANGUAGE_CODES.WOLOF:
      return wolofCategories;
    case LANGUAGE_CODES.BAMBARA:
      return bambaraCategories;
    default:
      return wolofCategories;
  }
};

const clearAllCategoryStates = async (languageCode: LanguageCode): Promise<void> => {
  if (!checkStorageAvailable()) return;

  const categories = getCategoriesForLanguage(languageCode);
  const keysToRemove: string[] = [];
  
  Object.keys(categories).forEach(category => {
    keysToRemove.push(
      `${languageCode}_learnState_${category}`,
      `${languageCode}_currentWordIndex_${category}`,
      `${languageCode}_testProgress_${category}`,
      `${languageCode}_categoryProgress_${category}`,
      // Ajout des nouvelles clés de session
      `${languageCode}-${category}-sessionLearned`,
      `${languageCode}-${category}-inProgress`,
      `${languageCode}_${category}_sessionLearned`,
      `${languageCode}_${category}_inProgress`
    );
    
    if (category === 'Grammaire') {
      const grammarCategory = categories[category];
      if (grammarCategory && typeof grammarCategory === 'object') {
        Object.keys(grammarCategory).forEach(subcategory => {
          keysToRemove.push(
            `${languageCode}_learnState_${category}_${subcategory}`,
            `${languageCode}_currentWordIndex_${category}_${subcategory}`,
            `${languageCode}_testProgress_${category}_${subcategory}`,
            `${languageCode}-${category}-${subcategory}-sessionLearned`,
            `${languageCode}-${category}-${subcategory}-inProgress`
          );
        });
      }
    }
  });

  // Suppression par lots avec vérification
  for (const key of keysToRemove) {
    try {
      localStorage.removeItem(key);
      if (localStorage.getItem(key)) {
        console.error(`Échec de la suppression de ${key}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }
};

// NOUVELLE FONCTION : Nettoyage spécifique des données de statistiques
const clearAllStatsData = async (languageCode: LanguageCode): Promise<void> => {
  if (!checkStorageAvailable()) return;

  console.log(`🧹 Nettoyage des données de statistiques pour ${languageCode}...`);

  // Clés spécifiques aux statistiques et données de progression
  const statsKeys = [
    // Données de grammaire
    `grammar-progress-${languageCode}`,
    `${languageCode}-grammar-progress`,
    `grammar_progress_${languageCode}`,
    `${languageCode}_grammar_progress`,
    
    // Données de construction de phrases
    `sentence-construction-progress-${languageCode}`,
    `${languageCode}-sentence-construction-progress`,
    `sentenceConstruction-${languageCode}`,
    `${languageCode}-sentenceConstruction`,
    
    // Données de phrases à trous
    `sentence-gap-progress-${languageCode}`,
    `${languageCode}-sentence-gap-progress`,
    
    // Listes globales de mots appris
    `${languageCode}-allLearnedWords`,
    `${languageCode}_allLearnedWords`,
    `allLearnedWords-${languageCode}`,
    `allLearnedWords_${languageCode}`,
    
    // Données d'expérience et de niveau
    `${languageCode}-experience`,
    `${languageCode}_experience`,
    `experience-${languageCode}`,
    `experience_${languageCode}`,
    
    // Données de streak et temps d'apprentissage
    `${languageCode}-streak`,
    `${languageCode}_streak`,
    `${languageCode}-learningTime`,
    `${languageCode}_learningTime`,
    
    // Métadonnées de progression
    `${languageCode}-metadata`,
    `${languageCode}_metadata`,
    `metadata-${languageCode}`,
    `metadata_${languageCode}`,
    
    // Sessions et historique
    `${languageCode}-sessions`,
    `${languageCode}_sessions`,
    `sessions-${languageCode}`,
    `sessions_${languageCode}`,
    
    // Statistiques générales
    `${languageCode}-stats`,
    `${languageCode}_stats`,
    `stats-${languageCode}`,
    `stats_${languageCode}`,
    
    // ✅ AJOUT: Nouvelles clés pour le système de révision
    `revision-${languageCode}-progress`,
    `revision-${languageCode}-sessionHistory`,
    `${languageCode}-revision-progress`,
    `${languageCode}-revision-sessionHistory`,
    
    // ✅ AJOUT: Clés pour les modes d'apprentissage
    `learn-progress-${languageCode}`,
    `sentence-progress-${languageCode}`,
    `${languageCode}-learn-progress`,
    `${languageCode}-sentence-progress`,
    
    // ✅ AJOUT: Clés XP et progression générale
    `${languageCode}-totalXP`,
    `${languageCode}-completedCategories`,
    `${languageCode}-progress`
  ];

  // Supprimer toutes les clés de statistiques
  for (const key of statsKeys) {
    try {
      localStorage.removeItem(key);
      console.log(`✅ Supprimé: ${key}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de ${key}:`, error);
    }
  }

  // Recherche et suppression de toutes les clés contenant des mots-clés de statistiques
  const statsPatterns = [
    'grammar',
    'sentence',
    'allLearnedWords',
    'sessionLearned',
    'inProgress',
    'experience',
    'streak',
    'learningTime',
    'metadata',
    'sessions',
    'stats',
    'revision',
    'learn',
    'totalXP',
    'progress'
  ];

  Object.keys(localStorage).forEach(key => {
    // Vérifier si la clé est liée à la langue ET contient un pattern de statistiques
    const isRelatedToLanguage = key.includes(languageCode);
    const containsStatsPattern = statsPatterns.some(pattern => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isRelatedToLanguage && containsStatsPattern) {
      console.log(`🔍 Trouvé et supprimé: ${key}`);
      localStorage.removeItem(key);
    }
  });
};

const clearAllProgressData = async (languageCode: LanguageCode): Promise<void> => {
  if (!checkStorageAvailable()) return;

  console.log(`Début de la suppression des données de progression pour ${languageCode}...`);

  // Clés générales à supprimer
  const keysToRemove = [
    'completedCategories',
    'categoryProgress',
    'quizScore',
    'currentWordIndex',
    'userProgress',
    'learnedWords',
    'wordsToReview',
    'wordProgress',
    'recentlyLearnedWords',
    'sentenceConstructionProgress',
    'sentenceGapProgress',
    'grammarProgress',
    'reviewProgress',
    'lastLearnedCategory',
    'lastLearnedWord',
    'currentLearningSession',
    'learningStats',
    'testScores',
    'revisionSettings',
    'totalXP',
    'progress'
  ];

  // Clés spécifiques à la grammaire
  const grammarKeys = [
    'grammar-progress',
    'grammar-metadata',
    'grammar-rules',
    'grammar-history',
    'grammar-settings',
    'grammar-subcategories',
    'grammar-mastered',
    'grammar-revision'
  ];

  // Clés d'historique de révision
  const revisionHistoryKeys = [
    'sessionHistory',
    'revisionHistory',
    'revisionProgress',
    'reviewHistory',
    'reviewProgress',
    'reviewSessions',
    'revisionSessions',
    'revisionStats',
    'reviewStats'
  ];

  // Préfixes pour les clés de révision
  const revisionPrefix = 'revision';
  const grammarStorageKey = 'grammar';
  const metadataStorageKey = 'metadata';
  const historyKey = 'sessionHistory';

  // Ajouter les clés de grammaire et d'historique à la liste générale
  keysToRemove.push(...grammarKeys, ...revisionHistoryKeys);

  // Nettoyer toutes les variations possibles des clés
  console.log("Suppression des clés avec différents formats...");
  for (const key of keysToRemove) {
    // Différents formats de clés possibles
    const keyVariations = [
      `${languageCode}_${key}`,
      `${languageCode}-${key}`,
      `${key}_${languageCode}`,
      `${key}-${languageCode}`,
      `grammar_${languageCode}_${key}`,
      `grammar-${languageCode}-${key}`,
      `${languageCode}_grammar_${key}`,
      `${languageCode}-grammar-${key}`,
      `revision_${languageCode}_${key}`,
      `revision-${languageCode}-${key}`,
      `${languageCode}_revision_${key}`,
      `${languageCode}-revision-${key}`
    ];

    for (const variation of keyVariations) {
      await saveWithRetry(variation, null);
      // Suppression directe comme backup
      localStorage.removeItem(variation);
    }
  }

  // Supprimer explicitement les clés de révision et d'historique
  console.log("Suppression explicite des clés d'historique de révision...");
  const explicitRevisionKeys = [
    `${revisionPrefix}-${languageCode}-${historyKey}`,
    `${revisionPrefix}-${languageCode}-progress`,
    `${revisionPrefix}_${languageCode}_${historyKey}`,
    `${revisionPrefix}_${languageCode}_progress`,
    `${languageCode}-${revisionPrefix}-${historyKey}`,
    `${languageCode}-${revisionPrefix}-progress`,
    `${languageCode}_${revisionPrefix}_${historyKey}`,
    `${languageCode}_${revisionPrefix}_progress`
  ];

  // Supprimer explicitement les clés de grammaire connues
  console.log("Suppression explicite des clés de grammaire...");
  const explicitGrammarKeys = [
    `grammar-progress-${languageCode}`,
    `${revisionPrefix}-${languageCode}-${grammarStorageKey}`,
    `${grammarStorageKey}-${languageCode}-progress`,
    `${grammarStorageKey}-${languageCode}-data`,
    `${grammarStorageKey}-${languageCode}-mastered`,
    `${grammarStorageKey}-${languageCode}-learned`,
    `${grammarStorageKey}-${languageCode}-rules`,
    `${languageCode}-${grammarStorageKey}`,
    `${languageCode}_${grammarStorageKey}`
  ];

  const allExplicitKeys = [...explicitRevisionKeys, ...explicitGrammarKeys];
  for (const key of allExplicitKeys) {
    localStorage.removeItem(key);
    console.log(`Suppression de la clé: ${key}`);
  }

  // Parcourir tout le localStorage pour trouver des clés liées à la langue, à la grammaire ou à la révision
  console.log("Recherche et suppression de toutes les clés liées à la grammaire et à la révision...");
  Object.keys(localStorage).forEach(key => {
    // Vérifier si la clé est liée à la langue spécifiée
    const isRelatedToLanguage = key.includes(languageCode);
    
    // Vérifier si la clé est liée à la grammaire ou à la révision (différentes variations possibles)
    const isRelatedToGrammar = 
      key.includes('grammar') || 
      key.includes('Grammar') || 
      key.includes('grammaire') || 
      key.includes('Grammaire');
    
    const isRelatedToRevision = 
      key.includes('revision') || 
      key.includes('review') || 
      key.includes('session') || 
      key.includes('history');

    // Vérifier les variations possibles de "Grammaire" ou révision avec le code de langue
    const isSpecialCategory = 
      key.includes(`${languageCode}_Grammaire`) || 
      key.includes(`${languageCode}-Grammaire`) ||
      key.includes(`${languageCode}_revision`) ||
      key.includes(`${languageCode}-revision`);

    // Si la clé est liée à la fois à la langue et à la grammaire/révision, ou est une catégorie spéciale
    if ((isRelatedToLanguage && (isRelatedToGrammar || isRelatedToRevision)) || isSpecialCategory) {
      console.log(`Suppression de la clé trouvée: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Nettoyage spécifique des clés de session de mots appris
  console.log("Nettoyage spécifique des clés de session pour les mots...");
  const sessionLearnedPatterns = [
    `-${languageCode}-`,
    `_${languageCode}_`,
    `${languageCode}-`
  ];

  Object.keys(localStorage).forEach(key => {
    // Vérifier si la clé est liée aux mots appris en session
    const isSessionLearned = 
      (key.includes('sessionLearned') || key.includes('allLearnedWords')) && 
      sessionLearnedPatterns.some(pattern => key.includes(pattern));
      
    if (isSessionLearned) {
      console.log(`Suppression de la clé de session trouvée: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Supprimer spécifiquement les clés pour chaque catégorie
  console.log("Suppression des clés de session par catégorie...");
  const categories = Object.keys(getCategoriesForLanguage(languageCode));
  categories.forEach(category => {
    const categorySessionKeys = [
      `${languageCode}-${category}-sessionLearned`,
      `${languageCode}_${category}_sessionLearned`,
      `${category}-${languageCode}-sessionLearned`,
      `${category}_${languageCode}_sessionLearned`,
      `${languageCode}-${category}-inProgress`,
      `${languageCode}_${category}_inProgress`,
      `${category}-${languageCode}-inProgress`,
      `${category}_${languageCode}_inProgress`,
      // ✅ AJOUT: Nouvelles variations pour les mots appris par catégorie
      `${languageCode}-${category}-learnedWords`,
      `${languageCode}-${category}-learnedSentences`
    ];
    
    categorySessionKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Tentative de suppression de: ${key}`);
    });
  });

  // Supprimer la liste globale des mots appris
  console.log("Suppression de la liste globale des mots appris...");
  const globalListKeys = [
    `${languageCode}-allLearnedWords`,
    `${languageCode}_allLearnedWords`,
    `allLearnedWords-${languageCode}`,
    `allLearnedWords_${languageCode}`
  ];
  
  globalListKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Tentative de suppression de: ${key}`);
  });

  // ⭐ NOUVEAU : Appeler le nettoyage spécifique des statistiques
  await clearAllStatsData(languageCode);

  // Supprimer aussi les états par catégorie
  await clearAllCategoryStates(languageCode);
  
  // Nettoyer les données temporaires
  await clearOldData();

  console.log(`Suppression des données de progression pour ${languageCode} terminée.`);
};

// Fonction pour supprimer les données sur Google Drive
const deleteDataFromGoogleDrive = async (languageCode: LanguageCode): Promise<boolean> => {
  console.log("===== SUPPRESSION DES DONNÉES SUR GOOGLE DRIVE =====");
  
  try {
    // Récupérer le token Google
    const token = localStorage.getItem('googleToken');
    if (!token) {
      console.log("Aucun token Google trouvé, aucune suppression à faire");
      return false;
    }
    
    // Créer une instance du service Google Drive
    const driveService = new GoogleDriveService(token);
    
    // Supprimer les fichiers principaux
    console.log(`Suppression du fichier de données principal pour ${languageCode}`);
    await driveService.deleteFile(languageCode, 'data');
    
    // Supprimer les fichiers d'exercices
    const exerciseTypes = ['grammar', 'sentenceConstruction', 'sentenceGap', 'quiz'];
    for (const type of exerciseTypes) {
      console.log(`Suppression du fichier ${type} pour ${languageCode}`);
      await driveService.deleteFile(languageCode, type);
    }
    
    console.log("Suppression des données sur Google Drive réussie");
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression des données sur Google Drive:", error);
    return false;
  } finally {
    console.log("===== FIN SUPPRESSION GOOGLE DRIVE =====");
  }
};

export const resetProgress = async (options: ResetProgressOptions): Promise<void> => {
  const { 
    setCompletedCategories, 
    setUserProgress, 
    setQuizScore, 
    user, 
    saveDataToGoogleDrive, 
    currentLanguage 
  } = options;

  if (!checkStorageAvailable()) {
    throw new Error('LocalStorage non disponible');
  }

  try {
    console.log("===== DÉBUT RÉINITIALISATION COMPLÈTE =====");
    console.log('🌍 Langue courante:', currentLanguage);
    
    // ⭐ NOUVEAU : Affichage de debug avant suppression
    console.log("📊 État du localStorage AVANT suppression:");
    Object.keys(localStorage).forEach(key => {
      if (key.includes(currentLanguage)) {
        console.log(`- ${key}: ${localStorage.getItem(key)?.slice(0, 100)}...`);
      }
    });

    // Sauvegarde temporaire des données essentielles
    const tempKey = `${currentLanguage}_reset_temp`;
    await saveWithRetry(tempKey, { timestamp: Date.now() });

    // Reset des états React - ✅ UTILISER currentLanguage au lieu de DEFAULT_LANGUAGE
    setCompletedCategories([]);
    setUserProgress(createDefaultUserProgress(currentLanguage));
    setQuizScore(0);

    // Suppression des données sur Google Drive si un utilisateur est connecté
    if (user) {
      console.log("Utilisateur connecté, tentative de suppression sur Google Drive");
      await deleteDataFromGoogleDrive(currentLanguage);
      
      // Après la suppression, sauvegarder un état vide pour écraser toute donnée résiduelle
      await saveDataToGoogleDrive();
    }

    // Nettoyage des données locales (maintenant avec nettoyage des stats)
    await clearAllProgressData(currentLanguage);

    // ⭐ NOUVEAU : Vérification après suppression
    console.log("📊 État du localStorage APRÈS suppression:");
    Object.keys(localStorage).forEach(key => {
      if (key.includes(currentLanguage)) {
        console.log(`- ${key}: ENCORE PRÉSENT!`);
      }
    });

    // Sauvegarde du nouvel état - ✅ UTILISER currentLanguage
    const defaultSavedProgress: SavedProgress = {
      learnedWords: [],
      wordsToReview: [],
      wordProgress: {},
      recentlyLearnedWords: [],
      revisionSettings: DEFAULT_SETTINGS,
      language: currentLanguage // ✅ Utiliser currentLanguage au lieu de DEFAULT_LANGUAGE
    };

    const savePromises = [
      saveWithRetry(`${currentLanguage}-progress`, defaultSavedProgress),
      saveWithRetry(`${currentLanguage}-completedCategories`, []),
      saveWithRetry(`${currentLanguage}-quizScore`, '0')
    ];

    const categories = getCategoriesForLanguage(currentLanguage);
    Object.keys(categories).forEach(category => {
      savePromises.push(
        saveWithRetry(`${currentLanguage}_currentWordIndex_${category}`, '0')
      );
    });

    await Promise.all(savePromises);

    // ⭐ NOUVEAU : Suppression finale et forcée de toutes les clés restantes
    console.log("🧹 Nettoyage final et forcé...");
    const remainingKeys = Object.keys(localStorage).filter(key => 
      key.includes(currentLanguage) && key !== tempKey
    );
    
    remainingKeys.forEach(key => {
      console.log(`🗑️ Suppression forcée de: ${key}`);
      localStorage.removeItem(key);
    });

    // Nettoyage final
    localStorage.removeItem(tempKey);
    console.log("✅ Réinitialisation de la progression terminée avec succès");
    
    // ⭐ NOUVEAU : Délai avant rechargement pour permettre la suppression complète
    console.log("⏳ Attente de 500ms avant rechargement...");
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Rechargement de la page
    console.log("🔄 Rechargement de la page pour appliquer les changements");
    window.location.reload();
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    throw error;
  } finally {
    console.log("===== FIN RÉINITIALISATION COMPLÈTE =====");
  }
};

export const checkResetNeeded = (userProgress: UserProgress): boolean => {
  return (
    userProgress.learnedWords.size > 0 ||
    userProgress.wordsToReview.size > 0 ||
    Object.keys(userProgress.wordProgress).length > 0 ||
    userProgress.recentlyLearnedWords.length > 0
  );
};

export const getCurrentProgress = (languageCode: LanguageCode): ProgressState => {
  if (!checkStorageAvailable()) {
    return {
      completedCategories: [],
      userProgress: createDefaultUserProgress(languageCode), // ✅ Utiliser la fonction
      quizScore: 0
    };
  }

  const defaultProgress: ProgressState = {
    completedCategories: [],
    userProgress: createDefaultUserProgress(languageCode), // ✅ Utiliser la fonction
    quizScore: 0
  };

  try {
    const savedUserProgress = localStorage.getItem(`${languageCode}-progress`);
    if (!savedUserProgress) return defaultProgress;

    const parsed = JSON.parse(savedUserProgress) as SavedProgress;
    const recentlyLearned = parsed.recentlyLearnedWords || [];
    
    const validRecentlyLearned: LearnedWord[] = recentlyLearned
      .map(word => {
        if (typeof word === 'string') {
          return {
            word,
            category: '',
            language: languageCode,
            timestamp: Date.now()
          };
        }
        return word as LearnedWord;
      })
      .filter((word): word is LearnedWord => Boolean(word));

    const completedCategories = JSON.parse(
      localStorage.getItem(`${languageCode}-completedCategories`) || '[]'
    );
    const quizScore = parseInt(
      localStorage.getItem(`${languageCode}-quizScore`) || '0'
    );

    return {
      completedCategories,
      userProgress: {
        learnedWords: new Set(parsed.learnedWords || []),
        wordsToReview: new Set(parsed.wordsToReview || []),
        wordProgress: parsed.wordProgress || {},
        recentlyLearnedWords: validRecentlyLearned,
        language: languageCode,
      },
      quizScore
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error);
    return defaultProgress;
  }
};

export default {
  resetProgress,
  checkResetNeeded,
  getCurrentProgress,
  DEFAULT_USER_PROGRESS
};