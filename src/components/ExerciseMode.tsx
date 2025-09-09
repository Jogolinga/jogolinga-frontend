import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLanguageData } from '../data/languages';
import { LanguageCode, WordData } from '../types/types';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Volume2, RotateCw } from 'lucide-react';
import { useUserProgress, useAudio } from '../hooks/hooks';
import './ExerciseMode.css';

// ===============================================
// INTERFACES ET TYPES
// ===============================================

interface ExerciseModeProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onExerciseComplete: () => void;
  checkDailyLimit?: (limitType: 'dailyRevisions' | 'exercisesPerDay') => boolean;
}

type ExerciseType = 'translation' | 'multipleChoice' | 'association';
type ExerciseStatus = 'dashboard' | 'countdown' | 'loading' | 'exercise' | 'summary';

interface Exercise {
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  category: string;
  subcategory?: string;
  wordKey?: string;
  pairs?: Array<{
    left: string;
    right: string;
    id: string;
  }>;
  data?: {
    translation?: string;
    audio?: string;
  };
}

interface UserStats {
  totalExercises: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  averageScore: number;
  exercisesToday: number;
  lastSessionDate: string;
}

interface SessionResult {
  correct: number;
  total: number;
  exercises: Exercise[];
  userAnswers: string[];
  isCorrect: boolean[];
  sessionId: string;
  duration: number;
  score: number;
}

// ===============================================
// FONCTIONS UTILITAIRES
// ===============================================

const shuffleArray = <T extends any>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const cleanParentheses = (text: string): string => {
  return text.replace(/\s*\([^)]*\)/g, '');
};

const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,?!;:'"\-_()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const compareWithTolerance = (userAnswer: string, correctAnswer: string): boolean => {
  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = normalizeText(correctAnswer);

  if (normalizedUser === normalizedCorrect) {
    return true;
  }

  const maxDistance = normalizedCorrect.length <= 5 ? 1 : 2;
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);

  return distance <= maxDistance;
};

const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

// ===============================================
// SYSTÈME DE MAPPING POUR LES CATÉGORIES
// ===============================================

/**
 * Mapping entre les noms affichés et les clés réelles des catégories
 * Permet de gérer les différences de nommage entre les langues
 */
const createCategoryMapping = (languageData: any) => {
  const realCategories = Object.keys(languageData.categories || {});
  
  // Mapping explicite pour les cas connus
  const explicitMapping: Record<string, string[]> = {
    'Salutations et expressions courantes': ['Salutations', 'Expressions', 'Salutations et expressions courantes'],
    'Nourriture et boissons': ['Nourriture', 'Boissons', 'Nourriture et boissons', 'Alimentation'],
    'Famille et relations': ['Famille', 'Relations', 'Famille et relations'],
    'Parties du corps': ['Corps', 'Parties du corps', 'Anatomie'],
    'Verbes courants': ['Verbes', 'Verbes courants', 'Actions'],
    'Nombres': ['Nombres', 'Numéros', 'Chiffres'],
    'Temps': ['Temps', 'Temporel', 'Chronologie'],
    'Couleurs': ['Couleurs', 'Colors'],
    'Animaux': ['Animaux', 'Faune'],
    'Grammaire': ['Grammaire', 'Grammar', 'Grammatical'],
    'Objets du quotidien': ['Objets du quotidien', 'Objets', 'Quotidien']
  };

  // Fonction pour trouver la correspondance
  const findMatchingCategory = (displayName: string): string | null => {
    // 1. Correspondance exacte
    if (realCategories.includes(displayName)) {
      return displayName;
    }

    // 2. Correspondance via mapping explicite
    const possibleKeys = explicitMapping[displayName] || [];
    for (const key of possibleKeys) {
      if (realCategories.includes(key)) {
        return key;
      }
    }

    // 3. Correspondance partielle (insensible à la casse)
    const normalizedDisplay = displayName.toLowerCase().replace(/[^a-z]/g, '');
    for (const realKey of realCategories) {
      const normalizedReal = realKey.toLowerCase().replace(/[^a-z]/g, '');
      if (normalizedDisplay.includes(normalizedReal) || normalizedReal.includes(normalizedDisplay)) {
        return realKey;
      }
    }

    return null;
  };

  return { findMatchingCategory, realCategories };
};

// ===============================================
// FONCTION D'EXTRACTION DES MOTS (GÈRE LES SOUS-CATÉGORIES)
// ===============================================

const extractWordsFromCategory = (categoryData: any): Array<{
  word: string;
  originalWord: string;
  data: WordData;
  cleanedTranslation: string;
}> => {
  const extractedWords: Array<{
    word: string;
    originalWord: string;
    data: WordData;
    cleanedTranslation: string;
  }> = [];

  const processEntries = (entries: any, parentKey = '') => {
    Object.entries(entries).forEach(([key, value]) => {
      // Si c'est un mot avec une traduction directe
      if (value && 
          typeof value === 'object' && 
          (value as any).translation && 
          !key.includes('_')) {
        
        const cleanedWord = cleanParentheses(key);
        const cleanedTranslation = cleanParentheses((value as WordData).translation || '');
        
        if (cleanedTranslation.length > 0) {
          extractedWords.push({
            word: cleanedWord,
            originalWord: key,
            data: value as WordData,
            cleanedTranslation
          });
        }
      }
      // Si c'est une sous-catégorie (comme "Pronoms personnels", "Prépositions", etc.)
      else if (value && 
               typeof value === 'object' && 
               !(value as any).translation &&
               !key.includes('_')) {
        
        console.log(`🔍 Exploration de la sous-catégorie "${key}"`);
        processEntries(value, key);
      }
    });
  };

  processEntries(categoryData);
  
  console.log(`📝 Mots extraits au total: ${extractedWords.length}`);
  if (extractedWords.length > 0) {
    console.log(`📝 Exemples: ${extractedWords.slice(0, 3).map(w => w.word).join(', ')}`);
  }
  
  return extractedWords;
};

const generateFallbackExercises = (languageData: any, languageInfo: any): Exercise[] => {
  console.log('🔄 Génération d\'exercices de fallback');
  
  const fallbackExercises: Exercise[] = [];
  const allCategories = Object.keys(languageData.categories || {});
  
  // Prendre les premières catégories disponibles
  const availableCategories = allCategories.slice(0, 5);
  
  availableCategories.forEach(categoryKey => {
    const categoryWords = languageData.categories[categoryKey];
    if (!categoryWords) return;

    // Utiliser la nouvelle fonction d'extraction
    const validWords = extractWordsFromCategory(categoryWords).slice(0, 3);

    validWords.forEach(({ word, data, cleanedTranslation, originalWord }) => {
      if (cleanedTranslation) {
        // Exercice de traduction simple
        fallbackExercises.push({
          type: 'translation',
          question: `Traduisez '${cleanedTranslation}' en ${languageInfo.name}`,
          correctAnswer: word,
          category: categoryKey,
          wordKey: originalWord
        });
      }
    });
  });

  console.log('🔄 Exercices de fallback générés:', fallbackExercises.length);
  return fallbackExercises;
};

// ===============================================
// FONCTION DE DÉBOGAGE POUR LES CATÉGORIES
// ===============================================

const debugCategoryStructure = (languageData: any) => {
  console.log('🔍 Structure des catégories disponibles:');
  if (languageData?.categories) {
    Object.keys(languageData.categories).forEach(key => {
      const category = languageData.categories[key];
      
      // Compter les mots en utilisant la nouvelle fonction d'extraction
      const extractedWords = extractWordsFromCategory(category);
      const wordCount = extractedWords.length;
      
      console.log(`  - "${key}": ${wordCount} mots`);
      
      // Afficher quelques exemples de mots
      if (wordCount > 0) {
        const sampleWords = extractedWords.slice(0, 3).map(w => w.word);
        console.log(`    Exemples: ${sampleWords.join(', ')}`);
      } else {
        // Afficher la structure interne si pas de mots directs
        const subKeys = Object.keys(category || {}).slice(0, 3);
        if (subKeys.length > 0) {
          console.log(`    Sous-catégories: ${subKeys.join(', ')}`);
        }
      }
    });
  } else {
    console.log('  Aucune catégorie trouvée!');
  }
};

// ===============================================
// COMPOSANT PRINCIPAL
// ===============================================

const ExerciseMode: React.FC<ExerciseModeProps> = ({
  languageCode,
  onBackToCategories,
  onExerciseComplete,
  checkDailyLimit
}) => {
  // ===============================================
  // HOOKS ET VARIABLES
  // ===============================================

  const { theme } = useTheme();
  const languageInfo = getLanguageData(languageCode);
  const { userProgress } = useUserProgress(languageCode, '');
  const playAudio = useAudio();

  // ===============================================
  // ÉTATS PRINCIPAUX - AVEC INITIALISATION DYNAMIQUE
  // ===============================================

  // Fonction pour obtenir l'état initial depuis localStorage
  const getInitialExerciseState = () => {
    try {
      const savedState = localStorage.getItem(`exerciseMode_${languageCode}_state`);
      if (savedState) {
        const state = JSON.parse(savedState);
        console.log('🔄 État initial depuis localStorage:', state);
        
        if (state.status === 'exercise' && state.exercises?.length > 0) {
          console.log('✅ Restauration état initial depuis localStorage');
          return {
            exerciseStatus: state.status,
            countdown: state.countdown || 0,
            exercises: state.exercises || [],
            currentExercise: state.exercises[state.exerciseIndex || 0] || null,
            exerciseIndex: state.exerciseIndex || 0,
            sessionUserAnswers: state.sessionUserAnswers || [],
            sessionCorrectAnswers: state.sessionCorrectAnswers || [],
            score: state.score || 0,
            streak: state.streak || 0,
            sessionStartTime: state.sessionStartTime || Date.now()
          };
        }
      }
    } catch (error) {
      console.error('❌ Erreur restauration état initial:', error);
    }
    
    console.log('🆕 Initialisation état par défaut');
    return {
      exerciseStatus: 'countdown' as ExerciseStatus,
      countdown: 3,
      exercises: [],
      currentExercise: null,
      exerciseIndex: 0,
      sessionUserAnswers: [],
      sessionCorrectAnswers: [],
      score: 0,
      streak: 0,
      sessionStartTime: 0
    };
  };

  const initialState = getInitialExerciseState();

  const [exerciseStatus, setExerciseStatus] = useState<ExerciseStatus>(initialState.exerciseStatus);
  const [countdown, setCountdown] = useState<number>(initialState.countdown);
  const [isCountdownActive, setIsCountdownActive] = useState<boolean>(initialState.exerciseStatus === 'countdown');
  
  // États pour les exercices
  const [exercises, setExercises] = useState<Exercise[]>(initialState.exercises);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(initialState.currentExercise);
  const [exerciseIndex, setExerciseIndex] = useState(initialState.exerciseIndex);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResult | null>(null);
  const [sessionUserAnswers, setSessionUserAnswers] = useState<string[]>(initialState.sessionUserAnswers);
  const [sessionCorrectAnswers, setSessionCorrectAnswers] = useState<boolean[]>(initialState.sessionCorrectAnswers);
  const [score, setScore] = useState<number>(initialState.score);
  const [streak, setStreak] = useState<number>(initialState.streak);
  const [sessionStartTime, setSessionStartTime] = useState<number>(initialState.sessionStartTime);

  // États pour les statistiques
  const [userStats, setUserStats] = useState<UserStats>({
    totalExercises: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageScore: 0,
    exercisesToday: 0,
    lastSessionDate: ''
  });

  // États spécifiques pour les exercices d'association
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);
  const [selectedRightItem, setSelectedRightItem] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState<string[]>([]);
  const [pairsAssociations, setPairsAssociations] = useState<Record<string, string>>({});
  const [shuffledLeftItems, setShuffledLeftItems] = useState<string[]>([]);
  const [shuffledRightItems, setShuffledRightItems] = useState<string[]>([]);

  // États pour les particules
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; delay: number; duration: number }>>([]);

  // ===============================================
  // FONCTION GENERATEMIEXERCISES CORRIGÉE
  // ===============================================

  const generateMixedExercises = useCallback((): Exercise[] => {
    console.log('🚀 Début de génération des exercices pour:', languageCode);
    
    const languageData = getLanguageData(languageCode);
    console.log('📊 Données de langue récupérées:', languageData);
    
    if (!languageData || !languageData.categories) {
      console.error('❌ Aucune donnée de langue trouvée pour:', languageCode);
      return [];
    }

    // Déboguer la structure des catégories
    debugCategoryStructure(languageData);
    
    const { findMatchingCategory, realCategories } = createCategoryMapping(languageData);
    console.log('🗂️ Catégories réelles disponibles:', realCategories);
    
    const allExercises: Exercise[] = [];

    // Catégories prioritaires à essayer
    const priorityCategories = [
      'Salutations et expressions courantes',
      'Nombres',
      'Temps',
      'Couleurs',
      'Nourriture et boissons',
      'Animaux',
      'Famille et relations',
      'Parties du corps',
      'Verbes courants',
      'Grammaire',
      'Objets du quotidien'
    ];

    // Collecter toutes les catégories disponibles (prioritaires + réelles)
    const categoriesToProcess: string[] = [];
    
    // 1. Ajouter les catégories prioritaires qui ont une correspondance
    priorityCategories.forEach(category => {
      const matchedKey = findMatchingCategory(category);
      if (matchedKey) {
        categoriesToProcess.push(matchedKey);
        console.log(`✅ Correspondance trouvée: "${category}" -> "${matchedKey}"`);
      } else {
        console.warn(`⚠️ Aucune correspondance pour: "${category}"`);
      }
    });

    // 2. Ajouter les catégories réelles non encore incluses (fallback)
    realCategories.forEach(realCategory => {
      if (!categoriesToProcess.includes(realCategory)) {
        categoriesToProcess.push(realCategory);
        console.log(`🔄 Ajout catégorie fallback: "${realCategory}"`);
      }
    });

    console.log('📂 Catégories finales à traiter:', categoriesToProcess);

    // Si aucune catégorie n'est disponible, retourner des exercices de base
    if (categoriesToProcess.length === 0) {
      console.error('❌ Aucune catégorie disponible !');
      return generateFallbackExercises(languageData, languageInfo);
    }

    // Générer des exercices pour chaque catégorie disponible
    categoriesToProcess.forEach(categoryKey => {
      const categoryWords = languageData.categories[categoryKey];
      console.log(`📁 Traitement de la catégorie "${categoryKey}":`, categoryWords);
      
      if (!categoryWords || typeof categoryWords !== 'object') {
        console.warn(`⚠️ Données invalides pour la catégorie "${categoryKey}"`);
        return;
      }

      // Extraire les mots de la catégorie (gérer les sous-catégories)
      const words = extractWordsFromCategory(categoryWords);

      console.log(`🔤 Mots valides extraits pour "${categoryKey}":`, words.length, 'mots');

      if (words.length === 0) {
        console.warn(`⚠️ Aucun mot valide trouvé pour la catégorie "${categoryKey}"`);
        return;
      }

      // Sélectionner quelques mots par catégorie (plus généreux)
      const wordsToUse = Math.min(8, words.length); // Augmenté de 5 à 8
      const selectedWords = shuffleArray(words).slice(0, wordsToUse);
      console.log(`✅ Mots sélectionnés pour "${categoryKey}":`, selectedWords.length, 'mots');

      selectedWords.forEach(({ word, originalWord, data, cleanedTranslation }) => {
        // Exercice de traduction (Fr → Langue)
        allExercises.push({
          type: 'translation',
          question: `Traduisez '${cleanedTranslation}' en ${languageInfo.name}`,
          correctAnswer: word,
          category: categoryKey,
          wordKey: originalWord
        });

        // Exercice de traduction inverse (Langue → Fr)
        allExercises.push({
          type: 'translation',
          question: `Que signifie '${word}' en français ?`,
          correctAnswer: cleanedTranslation,
          category: categoryKey,
          wordKey: originalWord
        });

        // Exercice de choix multiple si assez d'options
        const otherWords = words
          .filter(w => w.word !== word)
          .map(w => w.word);

        if (otherWords.length >= 3) {
          const wrongOptions = shuffleArray(otherWords).slice(0, 3);
          const options = shuffleArray([word, ...wrongOptions]);

          allExercises.push({
            type: 'multipleChoice',
            question: `Quel est le mot ${languageInfo.name} pour '${cleanedTranslation}'?`,
            options,
            correctAnswer: word,
            category: categoryKey,
            wordKey: originalWord,
            data: {
              audio: data.audio
            }
          });
        }
      });

      // Exercice d'association pour cette catégorie si assez de mots
      if (selectedWords.length >= 3) {
        const pairCount = Math.min(4, selectedWords.length);
        const pairWords = selectedWords.slice(0, pairCount);

        const pairs = pairWords.map(({ word, cleanedTranslation }, index) => ({
          left: word,
          right: cleanedTranslation,
          id: `pair-${categoryKey}-${index}`
        }));

        allExercises.push({
          type: 'association',
          question: `Associez les mots ${languageInfo.name} avec leur traduction française`,
          correctAnswer: pairs.map(p => `${p.left}:${p.right}`).join(','), 
          category: categoryKey,
          pairs: pairs
        });
      }
    });

    console.log('🎯 Total des exercices générés:', allExercises.length);

    // Si pas assez d'exercices, utiliser le fallback
    if (allExercises.length < 5) {
      console.warn('⚠️ Pas assez d\'exercices générés, utilisation du fallback');
      const fallbackExercises = generateFallbackExercises(languageData, languageInfo);
      allExercises.push(...fallbackExercises);
    }

    // Mélanger tous les exercices et en prendre 20 (ou le maximum disponible)
    const shuffledExercises = shuffleArray(allExercises);
    const targetCount = Math.min(20, Math.max(10, allExercises.length)); // Entre 10 et 20
    const finalExercises = shuffledExercises.slice(0, targetCount);
    
    console.log('✅ Exercices finaux sélectionnés:', finalExercises.length);
    console.log('📋 Premier exercice:', finalExercises[0]);
    
    return finalExercises;
  }, [languageCode, languageInfo.name]);

  // ===============================================
  // FONCTIONS DE GESTION DES STATISTIQUES
  // ===============================================

  const loadUserStats = useCallback(() => {
    const savedStats = localStorage.getItem(`exerciseStats_${languageCode}`);
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      setUserStats(stats);
    }
  }, [languageCode]);

  const saveUserStats = useCallback((newStats: UserStats) => {
    localStorage.setItem(`exerciseStats_${languageCode}`, JSON.stringify(newStats));
    setUserStats(newStats);
  }, [languageCode]);

  const updateStats = useCallback((sessionResult: SessionResult) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = userStats.lastSessionDate === today;

    const newStats: UserStats = {
      ...userStats,
      totalExercises: userStats.totalExercises + sessionResult.total,
      correctAnswers: userStats.correctAnswers + sessionResult.correct,
      currentStreak: sessionResult.score >= 70 ? userStats.currentStreak + 1 : 0,
      bestStreak: Math.max(userStats.bestStreak, sessionResult.score >= 70 ? userStats.currentStreak + 1 : 0),
      averageScore: Math.round(((userStats.averageScore * (userStats.totalExercises / sessionResult.total)) + sessionResult.score) / ((userStats.totalExercises / sessionResult.total) + 1)),
      exercisesToday: isToday ? userStats.exercisesToday + sessionResult.total : sessionResult.total,
      lastSessionDate: today
    };

    saveUserStats(newStats);
  }, [userStats, saveUserStats]);

  // ===============================================
  // FONCTIONS DE DÉCOMPTE - SUPPRESSION DU DÉMARRAGE MANUEL
  // ===============================================

  const finishCountdownAndStartExercises = useCallback(() => {
    console.log('✅ Fin du décompte, génération des exercices...');
    
    // Passer directement en mode chargement
    setExerciseStatus('loading');
    
    // Génération des exercices après un délai
    setTimeout(() => {
      try {
        const newExercises = generateMixedExercises();
        console.log('📊 Exercices générés:', newExercises.length);
        
        if (newExercises.length === 0) {
          console.error('❌ Aucun exercice généré !');
          // Nettoyer l'état sauvé avant de sortir
          localStorage.removeItem(`exerciseMode_${languageCode}_state`);
          onBackToCategories();
          alert('Impossible de générer des exercices.');
          return;
        }
        
        const firstExercise = newExercises[0];
        console.log('🎯 Premier exercice:', firstExercise);
        
        let leftItems: string[] = [];
        let rightItems: string[] = [];
        
        if (firstExercise?.type === 'association' && firstExercise.pairs) {
          leftItems = shuffleArray([...firstExercise.pairs].map(p => p.left));
          rightItems = shuffleArray([...firstExercise.pairs].map(p => p.right));
        }
        
        // Mise à jour de tous les états
        setExercises(newExercises);
        setSessionUserAnswers(Array(newExercises.length).fill(''));
        setSessionCorrectAnswers(Array(newExercises.length).fill(false));
        setCurrentExercise(firstExercise);
        setExerciseIndex(0);
        setUserAnswer('');
        setIsCorrect(null);
        setScore(0);
        setStreak(0);
        setSessionResults(null);
        setCompletedPairs([]);
        setPairsAssociations({});
        setSelectedLeftItem(null);
        setSelectedRightItem(null);
        setShuffledLeftItems(leftItems);
        setShuffledRightItems(rightItems);
        setSessionStartTime(Date.now());
        
        console.log('🎮 Transition vers mode exercice');
        setExerciseStatus('exercise');
        
        // DIAGNOSTIC CRITIQUE : Tracer juste après la transition
        console.trace('🔍 Stack trace après setExerciseStatus(exercise):');
        
  // Vérifier l'état dans la prochaine frame
          setTimeout(() => {
            console.log('🔍 ===== VÉRIFICATION POST-TRANSITION =====');
            console.log('📊 exerciseStatus actuel:', exerciseStatus);
            console.log('🎮 exercises.length:', exercises.length);
            console.log('🎯 currentExercise présent:', !!currentExercise);
            console.log('💾 État localStorage:', localStorage.getItem(`exerciseMode_${languageCode}_state`));
            
            // Si l'état a changé de manière inattendue, forcer la restauration
            if (exerciseStatus !== 'exercise') {
              console.error('💥 PROBLÈME DÉTECTÉ: exerciseStatus a changé après transition!');
              console.error('📊 État attendu: exercise, état actuel:', exerciseStatus);
              console.log('🔄 TENTATIVE DE RESTAURATION FORCÉE...');
              
              // Tentative de restauration forcée
              const savedState = localStorage.getItem(`exerciseMode_${languageCode}_state`);
              if (savedState) {
                try {
                  const state = JSON.parse(savedState);
                  if (state.status === 'exercise' && state.exercises?.length > 0) {
                    console.log('🔧 Restauration forcée en cours...');
                    
                    setExerciseStatus('exercise');
                    setExercises(state.exercises);
                    setCurrentExercise(state.exercises[state.exerciseIndex || 0]);
                    setExerciseIndex(state.exerciseIndex || 0);
                    setSessionUserAnswers(state.sessionUserAnswers || []);
                    setSessionCorrectAnswers(state.sessionCorrectAnswers || []);
                    setScore(state.score || 0);
                    setStreak(state.streak || 0);
                    setSessionStartTime(state.sessionStartTime || Date.now());
                    
                    console.log('✅ Restauration forcée terminée');
                  }
                } catch (error) {
                  console.error('❌ Erreur restauration forcée:', error);
                }
              }
            }
          }, 100);
        
        // Vérification supplémentaire après un délai plus long
        setTimeout(() => {
          console.log('🔍 ===== VÉRIFICATION TARDIVE (1s) =====');
          console.log('📊 exerciseStatus final:', exerciseStatus);
          if (exerciseStatus !== 'exercise') {
            console.error('💥 PROBLÈME PERSISTANT: Le mode exercise ne s\'est pas maintenu!');
          }
        }, 1000);
        
      } catch (error) {
        console.error('💥 Erreur lors de la génération:', error);
        localStorage.removeItem(`exerciseMode_${languageCode}_state`);
        onBackToCategories();
        alert(`Erreur: ${error}`);
      }
    }, 1500); // Délai de 1.5s pour voir l'écran de chargement
  }, [generateMixedExercises, onBackToCategories, languageCode]);

  // ===============================================
  // EFFET POUR LE DÉCOMPTE - CONDITION SIMPLIFIÉE
  // ===============================================

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    console.log('⏰ ===== USEEFFECT COUNTDOWN =====');
    console.log('📊 exerciseStatus:', exerciseStatus);
    console.log('⏱️ countdown:', countdown);
    
    // Condition simplifiée : seulement si on est en mode countdown
    if (exerciseStatus === 'countdown') {
      if (countdown > 0) {
        console.log('⏱️ Décompte actuel:', countdown);
        timer = setTimeout(() => {
          setCountdown((prev: number) => {
            const newCountdown = prev - 1;
            console.log('⏰ Nouveau décompte:', newCountdown);
            return newCountdown;
          });
        }, 1000);
      } else if (countdown === 0) {
        console.log('🚀 Fin du décompte, lancement des exercices');
        // Attendre un peu avant de passer au chargement
        timer = setTimeout(() => {
          finishCountdownAndStartExercises();
        }, 1000);
      }
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [countdown, exerciseStatus, finishCountdownAndStartExercises]);

  // ===============================================
  // FONCTIONS DE NAVIGATION CORRIGÉES
  // ===============================================

  const goBackToDashboard = useCallback(() => {
    console.log('🔙 ===== RETOUR DASHBOARD =====');
    console.log('📊 État actuel - exerciseStatus:', exerciseStatus);
    console.log('⏱️ État actuel - countdown:', countdown);
    console.trace('🔍 Stack trace du retour:');
    
    // Nettoyer l'état sauvé
    localStorage.removeItem(`exerciseMode_${languageCode}_state`);
    console.log('🗑️ État localStorage nettoyé');
    
    // Retour direct aux catégories
    onBackToCategories();
  }, [exerciseStatus, countdown, onBackToCategories, languageCode]);

  // ===============================================
  // FONCTIONS DE GESTION DES EXERCICES
  // ===============================================

  const checkAnswer = useCallback((answer: string) => {
    if (!currentExercise) return;
  
    let correct = false;
  
    if (currentExercise.type === 'association' && answer === "association-completed") {
      correct = true;
    } else {
      const cleanedAnswer = cleanParentheses(answer);
  
      if (Array.isArray(currentExercise.correctAnswer)) {
        correct = currentExercise.correctAnswer.some(ans => 
          compareWithTolerance(cleanedAnswer, cleanParentheses(ans))
        );
      } else {
        correct = compareWithTolerance(
          cleanedAnswer, 
          cleanParentheses(currentExercise.correctAnswer.toString())
        );
      }
    }
  
    setIsCorrect(correct);
    setUserAnswer(answer);
  
    if (correct) {
      setScore((prev: number) => prev + 1);
      setStreak((prev: number) => prev + 1);
    } else {
      setStreak(0);
    }
  
    setSessionUserAnswers(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = answer;
      return updated;
    });
  
    setSessionCorrectAnswers(prev => {
      const updated = [...prev];
      updated[exerciseIndex] = correct;
      return updated;
    });

    // Afficher le feedback
    showFeedback(correct, correct ? "Excellent !" : `Pas tout à fait... La bonne réponse était : ${Array.isArray(currentExercise.correctAnswer) ? currentExercise.correctAnswer[0] : currentExercise.correctAnswer}`);
  
    if (currentExercise.data?.audio) {
      setTimeout(() => {
        playAudio(currentExercise.data?.audio || '').catch(console.error);
      }, 500);
    }
  
    setTimeout(() => {
      if (exerciseIndex < exercises.length - 1) {
        setExerciseIndex((prev: number) => prev + 1);
        const nextExercise = exercises[exerciseIndex + 1];
        setCurrentExercise(nextExercise);
        setUserAnswer('');
        setIsCorrect(null);
        setCompletedPairs([]);
        setPairsAssociations({});
        setSelectedLeftItem(null);
        setSelectedRightItem(null);

        if (nextExercise?.type === 'association' && nextExercise.pairs) {
          const leftItems = [...nextExercise.pairs].map(p => p.left);
          const rightItems = [...nextExercise.pairs].map(p => p.right);
          setShuffledLeftItems(shuffleArray(leftItems));
          setShuffledRightItems(shuffleArray(rightItems));
        }
      } else {
        const finalCorrectAnswers = [...sessionCorrectAnswers.slice(0, exerciseIndex), correct];
        const correctCount = finalCorrectAnswers.filter(Boolean).length;
        const totalCount = exercises.length;
        const duration = Date.now() - sessionStartTime;
        const finalScore = Math.round((correctCount / totalCount) * 100);

        const sessionResult: SessionResult = {
          correct: correctCount,
          total: totalCount,
          exercises: exercises,
          userAnswers: [...sessionUserAnswers.slice(0, exerciseIndex), answer],
          isCorrect: finalCorrectAnswers,
          sessionId: `session-${Date.now()}`,
          duration: duration,
          score: finalScore
        };

        setSessionResults(sessionResult);
        updateStats(sessionResult);
        setExerciseStatus('summary');
        
        setTimeout(() => {
          if (checkDailyLimit) {
            checkDailyLimit('exercisesPerDay');
          }
          onExerciseComplete();
        }, 2000);
      }
    }, 1500);
  }, [
    currentExercise, 
    exerciseIndex, 
    exercises, 
    sessionUserAnswers, 
    sessionCorrectAnswers, 
    sessionStartTime,
    playAudio,
    updateStats,
    onExerciseComplete,
    checkDailyLimit
  ]);

  // ===============================================
  // FONCTIONS D'INTERFACE
  // ===============================================

  const showFeedback = (isCorrect: boolean, message: string) => {
    const feedbackZone = document.querySelector('.immersive-feedback-zone') as HTMLElement;
    const feedbackText = document.querySelector('.feedback-text') as HTMLElement;
    const feedbackIcon = document.querySelector('.feedback-icon') as HTMLElement;
    
    if (feedbackZone && feedbackText && feedbackIcon) {
      feedbackText.textContent = message;
      feedbackIcon.textContent = isCorrect ? '✨' : '💪';
      feedbackZone.className = `immersive-feedback-zone ${isCorrect ? 'correct' : 'incorrect'} show`;
      
      setTimeout(() => {
        feedbackZone.classList.remove('show');
      }, 3000);
    }
  };

  const createParticles = useCallback(() => {
    const particleCount = 50;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 3
      });
    }

    setParticles(newParticles);
  }, []);

 const updateProgress = (current: number, total: number) => {
    const progressCircle = document.querySelector('.card-progress-ring-fill') as SVGCircleElement;
    const progressText = document.querySelector('.card-progress-ring-text') as HTMLElement;
    
    if (progressCircle && progressText) {
      const circumference = 2 * Math.PI * 16; // rayon de 16
      const progress = (current / total) * 100;
      const offset = circumference - (progress / 100) * circumference;
      
      progressCircle.style.strokeDasharray = circumference.toString();
      progressCircle.style.strokeDashoffset = offset.toString();
      progressText.textContent = `${current}/${total}`;
    }
  };

  // ===============================================
  // HOOKS D'EFFETS - DIAGNOSTIC COMPLET
  // ===============================================

  useEffect(() => {
    console.log('🎯 ===== COMPOSANT ExerciseMode MONTÉ =====');
    console.log('📊 État initial - exerciseStatus:', exerciseStatus);
    console.log('⏱️ État initial - countdown:', countdown);
    console.log('🎮 État initial - exercises.length:', exercises.length);
    console.log('🎯 État initial - currentExercise:', !!currentExercise);
    console.log('🗂️ Props reçues:', { languageCode, onBackToCategories: !!onBackToCategories, onExerciseComplete: !!onExerciseComplete });
    
    // Si on a déjà un état restauré, ne pas faire l'initialization normale
    if (exerciseStatus === 'exercise' && exercises.length > 0) {
      console.log('✅ État déjà restauré, pas d\'initialization normale');
      
      // Configurer les items d'association si nécessaire
      if (currentExercise?.type === 'association' && currentExercise.pairs) {
        const leftItems = [...currentExercise.pairs].map(p => p.left);
        const rightItems = [...currentExercise.pairs].map(p => p.right);
        setShuffledLeftItems(shuffleArray(leftItems));
        setShuffledRightItems(shuffleArray(rightItems));
      }
      
      return;
    }
    
    // Initialization normale seulement si pas d'état restauré
    loadUserStats();
    createParticles();

    // DIAGNOSTIC : Tracer tous les démontages
    return () => {
      console.log('💥 ===== COMPOSANT ExerciseMode DÉMONTÉ =====');
      console.log('📊 État final - exerciseStatus:', exerciseStatus);
      console.trace('🔍 Stack trace du démontage:');
    };
  }, [languageCode]); // Dépendances minimales pour éviter les remontages

  // Traquer les changements d'état pour diagnostic
  useEffect(() => {
    console.log('🔄 ===== CHANGEMENT exerciseStatus =====');
    console.log('📊 Nouveau exerciseStatus:', exerciseStatus);
    console.log('⏱️ Countdown actuel:', countdown);
    console.log('🎮 Exercises length:', exercises.length);
    console.log('🎯 Current exercise:', !!currentExercise);
    console.trace('🔍 Stack trace du changement:');
  }, [exerciseStatus]);

  // Sauvegarder l'état pour persistance
  useEffect(() => {
    // Sauvegarder l'état quand il change (sauf countdown initial)
    if (exerciseStatus !== 'countdown' || exercises.length > 0) {
      const exerciseState = {
        status: exerciseStatus,
        countdown,
        exerciseIndex,
        exercises: exercises.map(ex => ({ ...ex, pairs: ex.pairs || [] })),
        sessionStartTime,
        score,
        streak,
        sessionUserAnswers,
        sessionCorrectAnswers
      };
      
      localStorage.setItem(`exerciseMode_${languageCode}_state`, JSON.stringify(exerciseState));
      console.log('💾 État ExerciseMode sauvegardé:', { status: exerciseStatus, exercisesCount: exercises.length });
    }
  }, [exerciseStatus, countdown, exerciseIndex, exercises, sessionStartTime, score, streak, sessionUserAnswers, sessionCorrectAnswers, languageCode]);

  useEffect(() => {
    if (exerciseStatus === 'exercise' && exercises.length > 0 && currentExercise) {
      updateProgress(exerciseIndex + 1, exercises.length);
      console.log('📊 Progression mise à jour:', `${exerciseIndex + 1}/${exercises.length}`);
    }
  }, [exerciseIndex, exercises.length, exerciseStatus, currentExercise]);

  // DIAGNOSTIC: Surveiller les remontages inattendus
  useEffect(() => {
    if (exerciseStatus === 'exercise' && exercises.length === 0) {
      console.error('⚠️ ===== ÉTAT INCOHÉRENT DÉTECTÉ =====');
      console.error('📊 exerciseStatus = exercise mais exercises.length = 0');
      console.error('🔍 Cela indique un remontage du composant');
      console.trace('🔍 Stack trace de l\'état incohérent:');
    }
  }, [exerciseStatus, exercises.length]);

  // ===============================================
  // RENDU DU DÉCOMPTE
  // ===============================================

  const renderCountdown = () => {
    return (
      <div className="immersive-dashboard-container">
        <div className="immersive-dashboard-icon">🎯</div>
        <h1 className="immersive-dashboard-title">Exercices - {languageInfo.name}</h1>
        <p className="immersive-dashboard-description" style={{ marginBottom: '3rem' }}>
          Testez vos connaissances avec des exercices variés et mélangés de toutes les catégories dans une expérience immersive unique.
        </p>
        
        <div 
          className="immersive-dashboard-icon countdown-icon"
          style={{
            fontSize: '8rem',
            color: countdown <= 1 ? '#ff6b6b' : countdown <= 2 ? '#ffa726' : '#daa520',
            textShadow: '0 0 30px rgba(218, 165, 32, 0.8)',
            margin: '2rem 0'
          }}
        >
          {countdown || '🚀'}
        </div>
        
        <h2 className="immersive-dashboard-title" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
          {countdown > 0 ? `Démarrage dans ${countdown}...` : 'C\'est parti !'}
        </h2>
        
        <p className="immersive-dashboard-description">
          {countdown > 0 ? 'Préparez-vous pour les exercices !' : 'Génération des exercices...'}
        </p>
      </div>
    );
  };

  // ===============================================
  // RENDU DU COMPOSANT PRINCIPAL
  // ===============================================

  return (
    <div 
      className={`exercise-immersive-container ${theme === 'dark' ? 'dark' : ''}`}
      data-show-back-button="true"
    >
      {/* Particules d'arrière-plan */}
      <div className="particles-container">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`
            }}
          />
        ))}
      </div>

      {/* BOUTON RETOUR PERMANENT - TOUJOURS VISIBLE */}
      <button 
        className="permanent-back-button"
        onClick={goBackToDashboard}
        title="Retour aux catégories"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Container principal */}
      <div className="exercise-main-container">
        <AnimatePresence exitBeforeEnter>
          {/* Écran de décompte - ÉTAT INITIAL */}
          {exerciseStatus === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.3 }}
            >
              {renderCountdown()}
            </motion.div>
          )}

          {/* Écran de chargement */}
          {exerciseStatus === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="immersive-dashboard-container">
                <div 
                  className="immersive-dashboard-icon loading-icon"
                  style={{ 
                    fontSize: '4rem'
                  }}
                >
                  ⚙️
                </div>
                <h1 className="immersive-dashboard-title">Génération des exercices...</h1>
                <p className="immersive-dashboard-description">
                  Préparation de votre session personnalisée
                </p>
                
                {/* Barre de progression stylisée */}
                <div className="loading-progress-container">
                  <div className="loading-progress-bar" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Exercice en cours */}
          {exerciseStatus === 'exercise' && currentExercise && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
            <div className="exercise-immersive-card active">
                {/* Progression dans la carte */}
                <div className="card-progress-header">
                  <div className="card-progress-ring-container">
                    <svg>
                      <circle className="card-progress-ring-bg" cx="20" cy="20" r="16"></circle>
                      <circle className="card-progress-ring-fill" cx="20" cy="20" r="16" 
                              strokeDasharray="100.53" strokeDashoffset="80"></circle>
                    </svg>
                    <div className="card-progress-ring-text">{exerciseIndex + 1}/{exercises.length}</div>
                  </div>
                 
                </div>

                {/* Bouton retour dans la carte */}
                <button 
                  className="card-back-button"
                  onClick={goBackToDashboard}
                  title="Retour au dashboard"
                >
                  <ArrowLeft size={20} />
                </button>

              
               
                {currentExercise && (
                  <>
                    {/* Zone de question */}
                    <div className="immersive-question-zone">
                      <div className="question-animated-icon">
                        {currentExercise.type === 'translation' ? '💬' :
                         currentExercise.type === 'multipleChoice' ? '🤔' : '🔗'}
                      </div>
                      <h2 className="immersive-question-text">{currentExercise.question}</h2>
                      <span className="immersive-question-category">{currentExercise.category}</span>
                    </div>

                    {/* Zone de réponse */}
                    <div className="immersive-answer-zone">
                      {/* EXERCICES DE CHOIX MULTIPLES */}
                      {currentExercise.type === 'multipleChoice' && currentExercise.options && (
                        <div className="immersive-options-grid">
                          {currentExercise.options.map((option, index) => {
                            const cleanedOption = cleanParentheses(option);
                            
                            return (
                              <button
                                key={index}
                                className={`immersive-option-card 
                                  ${userAnswer === option ? 'selected' : ''}
                                  ${isCorrect !== null && option === currentExercise.correctAnswer ? 'correct' : ''}
                                  ${isCorrect === false && userAnswer === option ? 'incorrect' : ''}
                                `}
                                onClick={() => checkAnswer(option)}
                                disabled={userAnswer !== ''}
                              >
                                {cleanedOption}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* EXERCICES DE TRADUCTION */}
                      {currentExercise.type === 'translation' && (
                        <>
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Votre réponse..."
                            className="immersive-translation-input"
                            disabled={isCorrect !== null}
                            autoFocus
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && userAnswer && isCorrect === null) {
                                checkAnswer(userAnswer);
                              }
                            }}
                          />
                          
                          <button
                            onClick={() => checkAnswer(userAnswer)}
                            className="immersive-submit-btn"
                            disabled={!userAnswer || isCorrect !== null}
                          >
                            Vérifier
                          </button>
                        </>
                      )}

                      {/* EXERCICES D'ASSOCIATION */}
                      {currentExercise.type === 'association' && currentExercise.pairs && (
                        <div className="immersive-association-container">
                          {/* Colonne gauche */}
                          <div className="immersive-association-column">
                            <div className="immersive-association-header">{languageInfo.name}</div>
                            {shuffledLeftItems.map((item, index) => (
                              <button
                                key={`left-${index}`}
                                className={`immersive-association-item 
                                  ${selectedLeftItem === item ? 'selected' : ''} 
                                  ${completedPairs.includes(item) ? 'matched' : ''}
                                `}
                                onClick={() => {
                                  if (completedPairs.includes(item)) return;
                                  setSelectedLeftItem(item);
                                  if (selectedRightItem) {
                                    const correctPair = currentExercise.pairs?.find(p => p.left === item && p.right === selectedRightItem);
                                    if (correctPair) {
                                      setCompletedPairs(prev => [...prev, item, selectedRightItem]);
                                      setPairsAssociations(prev => ({ ...prev, [item]: selectedRightItem }));
                                    }
                                    setSelectedLeftItem(null);
                                    setSelectedRightItem(null);
                                    
                                    if (completedPairs.length + 2 === (currentExercise.pairs?.length || 0) * 2) {
                                      setTimeout(() => checkAnswer("association-completed"), 500);
                                    }
                                  }
                                }}
                                disabled={completedPairs.includes(item)}
                              >
                                {cleanParentheses(item)}
                              </button>
                            ))}
                          </div>

                          {/* Colonne des connexions */}
                          <div className="immersive-connection-lines">
                            {Array.from({ length: Math.max(shuffledLeftItems.length, shuffledRightItems.length) }, (_, i) => (
                              <div key={i} style={{ fontSize: '1.5rem', color: 'rgba(139, 69, 19, 0.3)' }}>
                                ↔️
                              </div>
                            ))}
                          </div>

                          {/* Colonne droite */}
                          <div className="immersive-association-column">
                            <div className="immersive-association-header">Français</div>
                            {shuffledRightItems.map((item, index) => (
                              <button
                                key={`right-${index}`}
                                className={`immersive-association-item 
                                  ${selectedRightItem === item ? 'selected' : ''} 
                                  ${completedPairs.includes(item) ? 'matched' : ''}
                                `}
                                onClick={() => {
                                  if (completedPairs.includes(item)) return;
                                  setSelectedRightItem(item);
                                  if (selectedLeftItem) {
                                    const correctPair = currentExercise.pairs?.find(p => p.left === selectedLeftItem && p.right === item);
                                    if (correctPair) {
                                      setCompletedPairs(prev => [...prev, selectedLeftItem, item]);
                                      setPairsAssociations(prev => ({ ...prev, [selectedLeftItem]: item }));
                                    }
                                    setSelectedLeftItem(null);
                                    setSelectedRightItem(null);
                                    
                                    if (completedPairs.length + 2 === (currentExercise.pairs?.length || 0) * 2) {
                                      setTimeout(() => checkAnswer("association-completed"), 500);
                                    }
                                  }
                                }}
                                disabled={completedPairs.includes(item)}
                              >
                                {cleanParentheses(item)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Résumé de session */}
          {exerciseStatus === 'summary' && sessionResults && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="exercise-immersive-card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ 
                    fontSize: '4rem', 
                    marginBottom: '1rem',
                    filter: sessionResults.score >= 80 ? 'hue-rotate(120deg)' : sessionResults.score >= 60 ? 'hue-rotate(60deg)' : 'hue-rotate(0deg)'
                  }}>
                    {sessionResults.score >= 80 ? '🎉' : sessionResults.score >= 60 ? '👍' : '💪'}
                  </div>
                  <h3 className="immersive-question-text">
                    {sessionResults.score >= 80 ? 'Excellent travail !' : sessionResults.score >= 60 ? 'Bien joué !' : 'Continuez vos efforts !'}
                  </h3>
                </div>

                {/* Score principal */}
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2rem',
                  marginBottom: '3rem'
                }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #daa520, #8b4513)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'var(--shadow-glow)',
                    color: 'white'
                  }}>
                    <span style={{ 
                      fontSize: '32px', 
                      fontWeight: '700'
                    }}>
                      {sessionResults.score}%
                    </span>
                    <span style={{ 
                      fontSize: '14px'
                    }}>
                      Score
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '1.5rem',
                    maxWidth: '500px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#228b22',
                        marginBottom: '0.25rem'
                      }}>
                        {sessionResults.correct}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--exercise-text-secondary)',
                        fontWeight: '600'
                      }}>
                        Réussis
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#ef4444',
                        marginBottom: '0.25rem'
                      }}>
                        {sessionResults.total - sessionResults.correct}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--exercise-text-secondary)',
                        fontWeight: '600'
                      }}>
                        Manqués
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#daa520',
                        marginBottom: '0.25rem'
                      }}>
                        {Math.floor(sessionResults.duration / 60000)}:{String(Math.floor((sessionResults.duration % 60000) / 1000)).padStart(2, '0')}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--exercise-text-secondary)',
                        fontWeight: '600'
                      }}>
                        Temps
                      </div>
                    </div>
                    <div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#daa520',
                        marginBottom: '0.25rem'
                      }}>
                        {Math.round(sessionResults.duration / sessionResults.total / 1000)}s
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: 'var(--exercise-text-secondary)',
                        fontWeight: '600'
                      }}>
                        Par question
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '1rem', 
                  width: '100%', 
                  maxWidth: '300px',
                  margin: '0 auto'
                }}>
                  <button 
                    className="immersive-start-button"
                    onClick={() => {
                      console.log('🔄 Redémarrage du décompte');
                      // Redémarrer le décompte automatiquement
                      setExerciseStatus('countdown');
                      setCountdown(3);
                      setIsCountdownActive(true);
                      
                      // Reset des états des exercices
                      setExercises([]);
                      setCurrentExercise(null);
                      setExerciseIndex(0);
                      setUserAnswer('');
                      setIsCorrect(null);
                      setScore(0);
                      setStreak(0);
                      setSessionResults(null);
                      setSessionUserAnswers([]);
                      setSessionCorrectAnswers([]);
                      setCompletedPairs([]);
                      setPairsAssociations({});
                      setSelectedLeftItem(null);
                      setSelectedRightItem(null);
                      setShuffledLeftItems([]);
                      setShuffledRightItems([]);
                    }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem',
                      padding: '1rem 2rem'
                    }}
                  >
                    <RotateCw size={18} />
                    <span>Nouvelle session</span>
                  </button>
                  
                  <button 
                    className="immersive-back-button"
                    onClick={goBackToDashboard}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem',
                      padding: '0.8rem 1.5rem'
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>Retour au dashboard</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone de feedback */}
        <div className="immersive-feedback-zone">
          <span className="feedback-icon">✨</span>
          <span className="feedback-text">Feedback message</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseMode;