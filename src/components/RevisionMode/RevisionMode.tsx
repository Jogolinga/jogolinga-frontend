import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Book,
  BookOpen,
  RotateCw,
  ChevronDown,
  ChevronUp,
 
} from 'lucide-react';

import { useRevisionProgress, RevisionWordInfo, GrammarWordInfo } from '../../hooks/useRevisionProgress';
import { shuffleArray } from '../../utils/utils';
import { getLanguageData } from '../../data/languages';
import RevisionStatsModal from './RevisionStatsModal';
import { 
  WordData, 
  LanguageCode, 
} from '../../types/types';
import ProgressPie from '../ProgressPie';
import './RevisionMode.css';
import { useUserProgress } from '../../hooks/hooks';
import { useSupabaseAudio } from '../../hooks/useSupabaseAudio'; // ✅ Nouveau système
import { useTheme } from '../ThemeContext';
import { cleanParentheses } from '../../utils/cleanParentheses';
// Note: ExitConfirmationDialog importé mais utilisation remplacée par ConfirmationModal
import ConfirmationModal from '../ConfirmationModal';

interface RevisionModeProps {
  languageCode: LanguageCode;
  onBackToMenu: () => void;
  onWordRevised?: (word: string, isCorrect: boolean) => void;
  onUpdateRevisionState?: (state: any) => void;
  checkDailyLimit?: (limitType: 'dailyRevisions' | 'exercisesPerDay') => boolean;
}

interface GrammarProgress {
  subcategory: string;
  masteredWords: {
    word: string;
    data: {
      translation: string;
      explanation?: string;
      example?: string;
    }
  }[];
  date: number;
}

interface LearnedSentence {
  french: string;
  original: string;
  audio?: string;
  mastered: boolean;
  category: string;
  timestamp: number;
  grammarType?: 'rule' | 'conjugation' | 'vocabulary';
  subCategory?: string;
}

interface WordPair {
  id: string;
  word: string;
  translation: string;
  audio?: string;
  matched: boolean;
}



interface DraggedItem {
  id: string;
  type: 'word' | 'translation';
  content: string;
  audio?: string;
}

// Nouveau type pour les exercices mixtes avec variantes
interface RevisionExercise {
  id: string;
  type: 'qcm' | 'matching';
  word: string;
  wordData: WordData;
  options?: string[]; // Pour QCM
  pairs?: WordPair[]; // Pour appariement
  variant?: 'classic' | 'reverse'; // Pour QCM : classique ou inversé
  targetWord?: string; // Pour appariement : le mot principal à tester
}

type SessionPhase = 'category-selection' | 'exercise' | 'complete';

// Catégories avec leurs icônes
const categoryIllustrations: Record<string, string> = {
  'Salutations et expressions courantes': '👋',
  'Nombres': '🔢',
  'Temps': '⏰',
  'Animaux': '🐘',
  'Famille': '👨‍👩‍👧‍👦',
  'Nourriture': '🍽️',
  'Couleurs': '🎨',
  'Maison': '🏠',
  'Corps': '🧍',
  'Vêtements': '👕',
  'Transport': '🚗',
  'Nature': '🌳',
  'Sports': '⚽',
  'Métiers': '👨‍⚕️',
  'École': '📚',
  'Émotions': '😊',
  'Grammaire': '📖',
  'Conjugaison': '✏️',
  'Expressions': '💭'
};

const RevisionMode: React.FC<RevisionModeProps> = ({
  languageCode,
  onBackToMenu,
  onWordRevised,
  onUpdateRevisionState,
 
}) => {
  const { playWord } = useSupabaseAudio(languageCode);
  const {
    revisionProgress,
    sessionState,
    updateRevisionProgress,
    getSessionWords,
  
    finishSession,
    resetSession,
    
    syncWithDrive,
  } = useRevisionProgress(languageCode);

  const languageData = getLanguageData(languageCode);
  const carouselRef = useRef<HTMLDivElement>(null);

  // États de base
  const [currentWords, setCurrentWords] = useState<[string, WordData][]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionPhase, setSessionPhase] = useState<SessionPhase>('category-selection');
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // États pour l'affichage de la liste des mots
  const [showWordsList, setShowWordsList] = useState(false);

  // États pour la session mixte
  const [currentExercises, setCurrentExercises] = useState<RevisionExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentExercise, setCurrentExercise] = useState<RevisionExercise | null>(null);

  // États de navigation
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // États spécifiques à la grammaire
  const [isGrammarMode, setIsGrammarMode] = useState(false);
  const [grammarSubCategory, setGrammarSubCategory] = useState<string | null>(null);
  const [grammarType, setGrammarType] = useState<'rule' | 'conjugation' | 'vocabulary'>('rule');
  const [wordDataMap, setWordDataMap] = useState<Record<string, Record<string, WordData>>>({});

  // États pour le test d'appariement
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [matches, setMatches] = useState<Map<string, string>>(new Map());
  const [incorrectMatches, setIncorrectMatches] = useState<Set<string>>(new Set());
  const [matchAttempts, setMatchAttempts] = useState<Map<string, number>>(new Map());
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState<string | null>(null);
  
  // État pour l'ordre fixe des traductions dans l'appariement
  const [shuffledTranslations, setShuffledTranslations] = useState<WordPair[]>([]);

  // Hook de progression utilisateur
  const { userProgress } = useUserProgress(languageCode, selectedCategory || '');
  const { theme } = useTheme();

  // État des statistiques et données de session
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    totalAttempts: 0,
    grammarProgress: {
      rules: 0,
      conjugations: 0,
      vocabulary: 0
    } as Record<string, number> 
  });

  const [tempSessionData, setTempSessionData] = useState<Array<{
    word: string;
    isCorrect: boolean;
    category: string;
    timestamp: number;
    exerciseType: 'qcm' | 'qcm-reverse' | 'matching';
    attempts: number;
  }>>([]);

  // États pour la gestion de sauvegarde
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Fonction pour vérifier si un fichier audio est valide
  const hasValidAudio = (audio: string | undefined): boolean => {
    return !!audio && audio.trim() !== '';
  };

  // Fonction pour forcer la migration au démarrage
  const forceMigrationOnStart = useCallback(() => {
    console.log('🔄 Vérification et migration forcée au démarrage...');
    
    try {
      // Vérifier s'il y a des mots dans l'ancien système global
      const globalLearnedKey = `${languageCode}-allLearnedWords`;
      const savedGlobalLearned = localStorage.getItem(globalLearnedKey);
      
      if (savedGlobalLearned) {
        const globalWords = JSON.parse(savedGlobalLearned) as string[];
        console.log(`📚 ${globalWords.length} mots trouvés dans l'ancien système global`);
        
        // Forcer la répartition même si la migration a déjà été faite
        Object.keys(languageData.categories).forEach(categoryName => {
          const categoryWords = languageData.categories[categoryName];
          if (!categoryWords) return;
          
          const categoryLearnedKey = `${languageCode}-${categoryName}-learnedWords`;
          let categoryLearnedWords: string[] = [];
          
          // Charger la liste existante
          try {
            const saved = localStorage.getItem(categoryLearnedKey);
            if (saved) {
              categoryLearnedWords = JSON.parse(saved) as string[];
            }
          } catch (error) {
            console.error(`Erreur chargement ${categoryName}:`, error);
          }
          
          let hasNewWords = false;
          
          Object.keys(categoryWords).forEach(word => {
            if (word.includes('_')) return;
            
            const cleanWord = cleanParentheses(word);
            
            // Si le mot est dans la liste globale mais PAS dans la catégorie
            if ((globalWords.includes(cleanWord) || globalWords.includes(word)) && 
                !categoryLearnedWords.includes(cleanWord)) {
              categoryLearnedWords.push(cleanWord);
              hasNewWords = true;
              console.log(`🔄 Migration forcée: ${cleanWord} → ${categoryName}`);
            }
          });
          
          // Sauvegarder si il y a de nouveaux mots
          if (hasNewWords) {
            localStorage.setItem(categoryLearnedKey, JSON.stringify(categoryLearnedWords));
            console.log(`📁 ${categoryName} mis à jour: ${categoryLearnedWords.length} mots`);
          }
        });
      }
      
      // Marquer la migration comme terminée
      const migrationKey = `${languageCode}-forced-migration-completed`;
      localStorage.setItem(migrationKey, 'true');
      
    } catch (error) {
      console.error('❌ Erreur lors de la migration forcée:', error);
    }
  }, [languageCode, languageData.categories]);

  // Fonctions de navigation et défilement
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    const container = carouselRef.current;
    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    );
  }, []);

const isWordDueForRevision = useCallback((word: string, category: string, grammarType?: string): boolean => {
  const cleanWord = cleanParentheses(word);
  const history = getSessionWords();
  const now = Date.now();
  
  // Filtrer l'historique pour ce mot spécifique dans cette catégorie
  const wordHistory = history.filter(item => {
    const itemCleanWord = cleanParentheses(item.word);
    
    if (grammarType && 'grammarType' in item) {
      const grammarItem = item as GrammarWordInfo;
      return itemCleanWord === cleanWord && 
             grammarItem.grammarType === grammarType &&
             item.category === category;
    } else if (!grammarType && !('grammarType' in item)) {
      return itemCleanWord === cleanWord && item.category === category;
    }
    
    return false;
  }).sort((a, b) => b.timestamp - a.timestamp);

  // Vérification : Mot appris dans cette catégorie ?
  let isWordLearned = false;
  
  if (category === 'Grammaire') {
    // Pour la grammaire : vérifier dans grammar-progress
    const storageKey = `grammar-progress-${languageCode}`;
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress) as GrammarProgress[];
        const allGrammarWords = progress.flatMap((p: GrammarProgress) => p.masteredWords);
        
        isWordLearned = allGrammarWords.some(wordData => {
          const grammarCleanWord = cleanParentheses(wordData.word);
          return grammarCleanWord === cleanWord || wordData.word === word;
        });
        
        console.log(`🔍 Grammaire - Mot ${cleanWord} appris: ${isWordLearned}`);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification grammaire:', error);
    }
  } else {
    // Vérification : Seulement dans la catégorie spécifique
    const categoryLearnedKey = `${languageCode}-${category}-learnedWords`;
    try {
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      if (savedCategoryLearned) {
        const categoryWords = JSON.parse(savedCategoryLearned) as string[];
        isWordLearned = categoryWords.includes(cleanWord) || categoryWords.includes(word);
      }
    } catch (error) {
      console.error(`Erreur lors de la vérification ${category}:`, error);
    }
  }

  // Si le mot n'a jamais été appris DANS CETTE CATÉGORIE, il ne peut pas être révisé
  if (!isWordLearned) {
    console.log(`❌ Mot ${cleanWord} non appris dans ${category}`);
    return false;
  }

  // Si pas d'historique de révision, le mot est dû pour sa première révision
  if (wordHistory.length === 0) {
    console.log(`✅ Mot ${cleanWord} dû pour première révision`);
    return true;
  }

  const lastReview = wordHistory[0];
  
  // Vérifier explicitement si le mot a une nextReview programmée
  if (lastReview.nextReview && typeof lastReview.nextReview === 'number') {
    const isDue = lastReview.nextReview <= now;
    console.log(`🔄 Mot ${cleanWord} - Next review: ${new Date(lastReview.nextReview).toLocaleDateString()}, Due: ${isDue}`);
    return isDue;
  }
  
  // FALLBACK : Si pas de nextReview définie, calculer selon l'historique
  const daysSinceLastReview = (now - lastReview.timestamp) / (24 * 60 * 60 * 1000);
  
  // Compter les succès consécutifs depuis le début de l'historique
  let consecutiveCorrect = 0;
  for (const review of wordHistory) {
    if (review.isCorrect) {
      consecutiveCorrect++;
    } else {
      break;
    }
  }
  
  // Intervalles basés sur les succès consécutifs
  let revisionInterval: number;
  switch (consecutiveCorrect) {
    case 0:
      revisionInterval = 0; // Échec récent : révision immédiate
      break;
    case 1:
      revisionInterval = 1; // 1er succès : révision dans 1 jour
      break;
    case 2:
      revisionInterval = 3; // 2ème succès : révision dans 3 jours
      break;
    case 3:
      revisionInterval = 7; // 3ème succès : révision dans 1 semaine
      break;
    case 4:
      revisionInterval = 14; // 4ème succès : révision dans 2 semaines
      break;
    default:
      revisionInterval = 30; // 5+ succès : révision dans 1 mois
      break;
  }
  
  const isDue = daysSinceLastReview >= revisionInterval;
  console.log(`📊 Mot ${cleanWord} - ${consecutiveCorrect} succès, ${daysSinceLastReview.toFixed(1)} jours écoulés, interval: ${revisionInterval}, due: ${isDue}`);
  return isDue;
}, [getSessionWords, languageCode]);

  // Fonction pour vérifier et corriger les doublons inter-catégories
  const checkAndCleanCrossCategory = useCallback(() => {
    console.log('🧹 Nettoyage des doublons inter-catégories...');
    
    // Pour chaque catégorie, vérifier que les mots lui appartiennent vraiment
    Object.keys(languageData.categories).forEach(categoryName => {
      if (categoryName === 'Grammaire') return; // Skip grammaire
      
      const categoryLearnedKey = `${languageCode}-${categoryName}-learnedWords`;
      const categoryWords = languageData.categories[categoryName];
      
      if (!categoryWords) return;
      
      try {
        const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
        if (!savedCategoryLearned) return;
        
        const learnedWords = JSON.parse(savedCategoryLearned) as string[];
        const validWords: string[] = [];
        const invalidWords: string[] = [];
        
        // Vérifier chaque mot appris
        learnedWords.forEach(learnedWord => {
          const cleanLearnedWord = cleanParentheses(learnedWord);
          
          // Vérifier si le mot existe dans cette catégorie
          const existsInCategory = Object.keys(categoryWords).some(categoryWord => {
            if (categoryWord.includes('_')) return false;
            const cleanCategoryWord = cleanParentheses(categoryWord);
            return cleanCategoryWord === cleanLearnedWord || categoryWord === learnedWord;
          });
          
          if (existsInCategory) {
            validWords.push(learnedWord);
          } else {
            invalidWords.push(learnedWord);
            console.log(`❌ Mot "${learnedWord}" supprimé de ${categoryName} (n'appartient pas à cette catégorie)`);
          }
        });
        
        // Sauvegarder seulement les mots valides
        if (invalidWords.length > 0) {
          localStorage.setItem(categoryLearnedKey, JSON.stringify(validWords));
          console.log(`🧹 ${categoryName}: ${invalidWords.length} mots supprimés, ${validWords.length} mots conservés`);
        }
        
      } catch (error) {
        console.error(`Erreur lors du nettoyage de ${categoryName}:`, error);
      }
    });
  }, [languageCode, languageData.categories]);

  // Fonction pour synchroniser depuis LearnMode
  const syncFromLearnMode = useCallback(() => {
    console.log('🔄 Synchronisation depuis LearnMode...');
    
    // Vérifier s'il y a de nouveaux mots dans l'ancien système global
    try {
      const globalLearnedKey = `${languageCode}-allLearnedWords`;
      const savedGlobalLearned = localStorage.getItem(globalLearnedKey);
      
      if (savedGlobalLearned) {
        const globalWords = JSON.parse(savedGlobalLearned) as string[];
        
        // Pour chaque catégorie, vérifier s'il y a de nouveaux mots à migrer
        Object.keys(languageData.categories).forEach(categoryName => {
          if (categoryName === 'Grammaire') return;
          
          const categoryWords = languageData.categories[categoryName];
          if (!categoryWords) return;
          
          const categoryLearnedKey = `${languageCode}-${categoryName}-learnedWords`;
          let categoryLearnedWords: string[] = [];
          
          try {
            const saved = localStorage.getItem(categoryLearnedKey);
            if (saved) {
              categoryLearnedWords = JSON.parse(saved) as string[];
            }
          } catch (error) {
            console.error(`Erreur chargement ${categoryName}:`, error);
            return;
          }
          
          let hasNewWords = false;
          
          // Chercher les mots globaux qui appartiennent à cette catégorie
          globalWords.forEach(globalWord => {
            const cleanGlobalWord = cleanParentheses(globalWord);
            
            // Vérifier si le mot appartient à cette catégorie ET n'est pas déjà dans la liste
            const belongsToCategory = Object.keys(categoryWords).some(categoryWord => {
              if (categoryWord.includes('_')) return false;
              const cleanCategoryWord = cleanParentheses(categoryWord);
              return cleanCategoryWord === cleanGlobalWord || categoryWord === globalWord;
            });
            
            if (belongsToCategory && !categoryLearnedWords.includes(cleanGlobalWord)) {
              categoryLearnedWords.push(cleanGlobalWord);
              hasNewWords = true;
              console.log(`🔄 Synchronisation: ${cleanGlobalWord} → ${categoryName}`);
            }
          });
          
          // Sauvegarder si il y a de nouveaux mots
          if (hasNewWords) {
            localStorage.setItem(categoryLearnedKey, JSON.stringify(categoryLearnedWords));
            console.log(`📁 ${categoryName} synchronisé: ${categoryLearnedWords.length} mots total`);
          }
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }, [languageCode, languageData.categories]);

  const getDueWordsForCategory = useCallback((category: string): [string, WordData][] => {
  const isGrammarCategory = category === 'Grammaire';
  
  // Pour les phrases construites (inchangé)
  const sentenceStorageKey = `sentence-construction-progress-${languageCode}`;
  let sentencesForReview: [string, WordData][] = [];
  try {
    const savedSentences = localStorage.getItem(sentenceStorageKey);
    if (savedSentences) {
      const sentences = JSON.parse(savedSentences) as LearnedSentence[];
      sentencesForReview = sentences
        .filter(sentence => 
          sentence.category === category && 
          sentence.mastered &&
          isWordDueForRevision(sentence.original, category)
        )
        .map(sentence => [
          cleanParentheses(sentence.original),
          {
            translation: sentence.french,
            audio: sentence.audio
          }
        ] as [string, WordData]);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des phrases:', error);
  }
  
  // Pour la grammaire - CORRECTION ICI
  if (isGrammarCategory) {
    const storageKey = `grammar-progress-${languageCode}`;
    try {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress) as GrammarProgress[];
        const allGrammarWords = progress.flatMap((p: GrammarProgress) => p.masteredWords);
        
        const uniqueGrammarWords: {[key: string]: [string, WordData]} = {};
        
        allGrammarWords.forEach(wordData => {
          const cleanWord = cleanParentheses(wordData.word);
          
          // CORRECTION : Utiliser la fonction isWordDueForRevision avec le bon grammarType
          // Déterminer le grammarType basé sur la subcategory ou un défaut
          let detectedGrammarType: 'rule' | 'conjugation' | 'vocabulary' = 'rule';
          
          // Logique pour déterminer le type de grammaire basé sur la subcategory
          const subcategory = progress.find(p => p.masteredWords.includes(wordData))?.subcategory?.toLowerCase();
          if (subcategory) {
            if (subcategory.includes('conjugaison') || subcategory.includes('verbe')) {
              detectedGrammarType = 'conjugation';
            } else if (subcategory.includes('vocabulaire') || subcategory.includes('mot')) {
              detectedGrammarType = 'vocabulary';
            }
          }
          
          // Vérifier si le mot est dû pour révision AVEC le type de grammaire
          if (isWordDueForRevision(cleanWord, category, detectedGrammarType) && !uniqueGrammarWords[cleanWord]) {
            uniqueGrammarWords[cleanWord] = [
              cleanWord,
              {
                translation: wordData.data.translation,
                explanation: wordData.data.explanation || '',
                example: wordData.data.example || ''
              }
            ];
          }
        });

        const grammarWordsArray = Object.values(uniqueGrammarWords);
        console.log(`📚 Grammaire - ${grammarWordsArray.length} mots dus pour révision`);
        return [...grammarWordsArray, ...sentencesForReview];
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des mots de grammaire:', error);
    }
    return sentencesForReview;
  }
  
  // Pour les mots normaux (inchangé)
  const categoryWords = languageData.categories[category];
  if (!categoryWords) {
    return sentencesForReview;
  }

  const uniqueWords: {[key: string]: [string, WordData]} = {};
  
  Object.entries(categoryWords)
    .filter(([key]) => !key.includes('_'))
    .forEach(([word, data]) => {
      const cleanWord = cleanParentheses(word);
      
      if (isWordDueForRevision(cleanWord, category) && !uniqueWords[cleanWord]) {
        uniqueWords[cleanWord] = [cleanWord, data as WordData];
      }
    });
  
  const normalWordsArray = Object.values(uniqueWords);
  return [...normalWordsArray, ...sentencesForReview];
}, [
  languageCode,
  languageData.categories,
  isWordDueForRevision,
  grammarType
]);

  // Fonction pour obtenir les catégories filtrées
  const getFilteredCategories = useCallback(() => {
    const categories = Object.keys(languageData.categories)
      .filter(category => {
        const dueWords = getDueWordsForCategory(category);
        const hasDueWords = dueWords.length > 0;
        return hasDueWords;
      });
    
    return categories;
  }, [languageData.categories, getDueWordsForCategory]);

  // Génération d'exercices mixtes avec tests multiples par mot
  const generateMixedExercises = useCallback((words: [string, WordData][]): RevisionExercise[] => {
    // Validation préalable
    if (words.length === 0) {
      console.warn('⚠️ Aucun mot disponible pour la génération d\'exercices');
      return [];
    }

    const exercises: RevisionExercise[] = [];
    const shuffledWords = shuffleArray([...words]);
    
    // Fonction pour créer un pool global d'options pour les mots
    const createWordOptionsPool = (excludeWord: string): string[] => {
      const allWords: string[] = [];
      
      // 1. Mots de la catégorie actuelle
      const currentCategoryWords = languageData.categories[selectedCategory || ''];
      if (currentCategoryWords && typeof currentCategoryWords === 'object') {
        Object.keys(currentCategoryWords as Record<string, WordData>)
          .filter(w => !w.includes('_'))
          .forEach(w => {
            const cleanW = cleanParentheses(w);
            if (cleanW !== excludeWord && !allWords.includes(cleanW)) {
              allWords.push(cleanW);
            }
          });
      }
      
      // 2. Si pas assez de mots, ajouter des mots d'autres catégories
      if (allWords.length < 10) {
        Object.entries(languageData.categories)
          .filter(([catName]) => catName !== selectedCategory && catName !== 'Grammaire')
          .forEach(([, categoryWords]) => {
            if (typeof categoryWords === 'object' && categoryWords !== null) {
              Object.keys(categoryWords as Record<string, WordData>)
                .filter(w => !w.includes('_'))
                .forEach(w => {
                  const cleanW = cleanParentheses(w);
                  if (cleanW !== excludeWord && !allWords.includes(cleanW) && allWords.length < 50) {
                    allWords.push(cleanW);
                  }
                });
            }
          });
      }
      
      return shuffleArray(allWords);
    };
    
    // Fonction pour créer un pool d'options de traductions françaises
    const createTranslationOptionsPool = (excludeTranslation: string): string[] => {
      const allTranslations: string[] = [];
      
      // 1. Traductions de la catégorie actuelle
      const currentCategoryWords = languageData.categories[selectedCategory || ''];
      if (currentCategoryWords && typeof currentCategoryWords === 'object') {
        Object.values(currentCategoryWords as Record<string, WordData>)
          .forEach(data => {
            if (typeof data === 'object' && data !== null && 'translation' in data) {
              const translation = data.translation;
              if (translation !== excludeTranslation && !allTranslations.includes(translation)) {
                allTranslations.push(translation);
              }
            }
          });
      }
      
      // 2. Si pas assez de traductions, ajouter d'autres catégories
      if (allTranslations.length < 10) {
        Object.entries(languageData.categories)
          .filter(([catName]) => catName !== selectedCategory && catName !== 'Grammaire')
          .forEach(([, categoryWords]) => {
            if (typeof categoryWords === 'object' && categoryWords !== null) {
              Object.values(categoryWords as Record<string, WordData>)
                .forEach(data => {
                  if (typeof data === 'object' && data !== null && 'translation' in data) {
                    const translation = data.translation;
                    if (translation !== excludeTranslation && !allTranslations.includes(translation) && allTranslations.length < 50) {
                      allTranslations.push(translation);
                    }
                  }
                });
            }
          });
      }
      
      return shuffleArray(allTranslations);
    };
    
    // 1. Créer les exercices QCM pour chaque mot
    shuffledWords.forEach((wordPair, wordIndex) => {
      const [word, wordData] = wordPair;
      const cleanWord = cleanParentheses(word);
      
      // QCM CLASSIQUE : Français → Langue cible
      const wordOptionsPool = createWordOptionsPool(cleanWord);
      let qcmOptions: string[];
      
      if (wordOptionsPool.length >= 3) {
        // Assez d'options disponibles
        const wrongOptions = wordOptionsPool.slice(0, 3);
        qcmOptions = shuffleArray([cleanWord, ...wrongOptions]);
      } else {
        // Pas assez d'options - utiliser ce qu'on a + fallback
        const availableOptions = wordOptionsPool.slice(0, 2);
        const fallbackCount = 3 - availableOptions.length;
        const fallbacks = [`Option ${String.fromCharCode(65 + availableOptions.length + 1)}`, 
                          `Option ${String.fromCharCode(65 + availableOptions.length + 2)}`].slice(0, fallbackCount);
        qcmOptions = shuffleArray([cleanWord, ...availableOptions, ...fallbacks]);
      }
      
      exercises.push({
        id: `qcm-${wordIndex}`,
        type: 'qcm',
        word,
        wordData,
        options: qcmOptions,
        variant: 'classic'
      });
      
      // QCM INVERSÉ : Langue cible → Français
      const translationOptionsPool = createTranslationOptionsPool(wordData.translation);
      let frenchOptions: string[];
      
      if (translationOptionsPool.length >= 3) {
        // Assez de traductions disponibles
        const wrongTranslations = translationOptionsPool.slice(0, 3);
        frenchOptions = shuffleArray([wordData.translation, ...wrongTranslations]);
      } else {
        // Pas assez de traductions - utiliser ce qu'on a + fallback
        const availableTranslations = translationOptionsPool.slice(0, 2);
        const fallbackCount = 3 - availableTranslations.length;
        const fallbacks = [`Traduction ${String.fromCharCode(65 + availableTranslations.length + 1)}`, 
                          `Traduction ${String.fromCharCode(65 + availableTranslations.length + 2)}`].slice(0, fallbackCount);
        frenchOptions = shuffleArray([wordData.translation, ...availableTranslations, ...fallbacks]);
      }
      
      exercises.push({
        id: `qcm-reverse-${wordIndex}`,
        type: 'qcm',
        word,
        wordData,
        options: frenchOptions,
        variant: 'reverse'
      });
    });
    
    // 2. Ajouter UN SEUL exercice d'appariement s'il y a assez de mots
    if (words.length >= 2) {
      const groupSize = Math.min(4, words.length);
      const groupWords = shuffledWords.slice(0, groupSize);
      
      const pairs: WordPair[] = groupWords.map((wordPair, pairIndex) => ({
        id: `pair-matching-${pairIndex}`,
        word: cleanParentheses(wordPair[0]),
        translation: wordPair[1].translation,
        audio: wordPair[1].audio,
        matched: false
      }));
      
      // Utiliser le premier mot comme mot principal pour les statistiques
      exercises.push({
        id: 'matching-session',
        type: 'matching',
        word: shuffledWords[0][0],
        wordData: shuffledWords[0][1],
        pairs,
        targetWord: cleanParentheses(shuffledWords[0][0])
      });
    }
    
    // 3. Mélanger tous les exercices pour une session variée
    const finalExercises = shuffleArray(exercises);
    
    return finalExercises;
  }, [languageData.categories, selectedCategory]);

  // Fonction de sauvegarde sécurisée
  const handleSessionSave = useCallback(async () => {
    if (isSaving || hasSaved || tempSessionData.length === 0) {
      return;
    }

    setIsSaving(true);
    
    try {
      const dataToSave = [...tempSessionData];
      
      // Grouper les données par mot pour éviter les doublons
      const wordPerformances = new Map<string, {
        attempts: number;
        successes: number;
        exerciseTypes: Set<string>;
      }>();
      
      dataToSave.forEach(wordInfo => {
        const existing = wordPerformances.get(wordInfo.word) || {
          attempts: 0,
          successes: 0,
          exerciseTypes: new Set()
        };
        
        existing.attempts += 1;
        if (wordInfo.isCorrect) existing.successes += 1;
        existing.exerciseTypes.add(wordInfo.exerciseType);
        
        wordPerformances.set(wordInfo.word, existing);
      });
      
      // Mettre à jour la progression pour chaque mot unique
      for (const [word, performance] of wordPerformances) {
        const successRate = performance.successes / performance.attempts;
        const isCorrect = successRate >= 0.75 && performance.attempts >= 1;
        
        await updateRevisionProgress(
          word,
          isCorrect,
          selectedCategory || '',
          isGrammarMode ? {
            isGrammar: true,
            subCategory: grammarSubCategory || undefined,
            grammarType
          } : undefined
        );
      }
      
      // Finaliser la session
      await finishSession({ 
        showStats: true, 
        lastWordInfo: dataToSave[dataToSave.length - 1]
      });

      if (syncWithDrive) {
        await syncWithDrive();
      }

      setHasSaved(true);
      
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    tempSessionData,
    selectedCategory,
    isGrammarMode,
    grammarSubCategory,
    grammarType,
    updateRevisionProgress,
    finishSession,
    syncWithDrive,
    isSaving,
    hasSaved
  ]);

  // Gestion du bouton retour
  const handleBackButton = useCallback(() => {
    // Seule la phase d'exercice nécessite une confirmation, pas le résumé
    if (sessionPhase === 'exercise') {
      setShowExitConfirmation(true);
    } else {
      onBackToMenu();
    }
  }, [sessionPhase, onBackToMenu]);

  // Gestion de la confirmation de sortie
  const handleExitConfirm = useCallback(() => {
    setShowExitConfirmation(false);
    setTempSessionData([]);
    setIsSaving(false);
    setHasSaved(false);
    setSessionPhase('category-selection');
    setCurrentExercises([]);
    setCurrentExerciseIndex(0);
    setCurrentExercise(null);
    setSelectedAnswer(null);
    setFeedback(null);
    setIsTransitioning(false);
    setShuffledTranslations([]); // Reset des traductions mélangées
    onBackToMenu();
  }, [onBackToMenu]);

  // Sélection de catégorie
  const handleCategorySelect = useCallback((category: string, isGrammar: boolean = false) => {
    const dueWords = getDueWordsForCategory(category);
    
    setSelectedCategory(category);
    setCurrentWords(dueWords);
    setIsGrammarMode(isGrammar);
    
    // Fermer automatiquement la liste des mots si elle était ouverte
    setShowWordsList(false);
    
    if (isGrammar) {
      setGrammarType('rule');
      setGrammarSubCategory(null);
    }
    
    const newWordDataMap: Record<string, Record<string, WordData>> = {
      [category]: Object.fromEntries(dueWords.map(([word, data]) => [word, data]))
    };
    setWordDataMap(newWordDataMap);
  }, [getDueWordsForCategory]);

  // Fonction pour basculer l'affichage de la liste des mots
  const toggleWordsList = useCallback(() => {
    setShowWordsList(prev => !prev);
  }, []);

  // Démarrage de la révision avec exercices mixtes multiples
  const startRevision = useCallback(() => {
    if (currentWords.length === 0) {
      setFeedback("Pas de mots disponibles pour la révision dans cette catégorie.");
      return;
    }
  
    // Limiter à 4-6 mots pour permettre plusieurs tests par mot
    const maxWords = Math.min(6, currentWords.length);
    const selectedWords = shuffleArray([...currentWords]).slice(0, maxWords);
    
    // Générer les exercices mixtes (2-3 exercices par mot)
    const exercises = generateMixedExercises(selectedWords);
    
    console.log(`🎯 Session créée: ${selectedWords.length} mots → ${exercises.length} exercices`);
    console.log('Détail des exercices:', exercises.map(ex => ({
      type: ex.type,
      variant: ex.variant,
      word: cleanParentheses(ex.word)
    })));
    
    setCurrentExercises(exercises);
    setCurrentExerciseIndex(0);
    setCurrentExercise(exercises[0] || null);
    setSessionPhase('exercise');
    
    // Réinitialiser TOUS les états de feedback
    setSelectedAnswer(null);
    setFeedback(null);
    setIsTransitioning(false);
    setIsSaving(false);
    setHasSaved(false);
    
    // Fermer la liste des mots lors du démarrage
    setShowWordsList(false);
    
    // Initialiser l'ordre mélangé pour le premier exercice d'appariement
    if (exercises[0]?.type === 'matching' && exercises[0]?.pairs) {
      setShuffledTranslations(shuffleArray([...exercises[0].pairs]));
      setMatches(new Map());
      setSelectedWord(null);
      setSelectedTranslation(null);
      setIncorrectMatches(new Set());
      setMatchAttempts(new Map());
    }
  }, [currentWords, generateMixedExercises]);

  // useEffect pour initialiser l'ordre mélangé des traductions
  useEffect(() => {
    if (currentExercise?.type === 'matching' && currentExercise.pairs) {
      setShuffledTranslations(shuffleArray([...currentExercise.pairs]));
    }
  }, [currentExercise?.id, currentExercise?.type]);

  // Gestion des réponses QCM améliorée
  const handleQCMAnswer = useCallback(async (answer: string) => {
    if (!answer || isTransitioning || !currentExercise) return;
    
    setIsTransitioning(true);
    const cleanWord = cleanParentheses(currentExercise.word);
    
    // Déterminer la bonne réponse selon la variante
    const correctAnswer = currentExercise.variant === 'reverse' 
      ? currentExercise.wordData.translation
      : cleanWord;
    
    const isCorrect = answer === correctAnswer;
    
    setSelectedAnswer(answer);
    setFeedback(isCorrect 
      ? 'Correct !' 
      : `Incorrect. La bonne réponse est : ${correctAnswer}`
    );
  
    if (currentExercise.wordData.audio) {
      try {
        await playWord(currentExercise.wordData.audio);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  
    // Ajouter seulement à tempSessionData, PAS d'appel direct à updateRevisionProgress
    setTempSessionData(prev => {
      // Vérifier si ce résultat n'existe pas déjà
      const exists = prev.some(item => 
        item.word === cleanWord &&
        item.exerciseType === (currentExercise.variant === 'reverse' ? 'qcm-reverse' : 'qcm') &&
        Math.abs(item.timestamp - Date.now()) < 5000 // Moins de 5 secondes d'écart
      );
      
      if (exists) {
        return prev; // Ne pas ajouter de doublon
      }
      
      return [...prev, {
        word: cleanWord,
        isCorrect,
        category: selectedCategory || '',
        timestamp: Date.now(),
        exerciseType: currentExercise.variant === 'reverse' ? 'qcm-reverse' : 'qcm',
        attempts: 1
      }];
    });
    
    onWordRevised?.(cleanWord, isCorrect);

    setSessionStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      totalAttempts: prev.totalAttempts + 1,
      grammarProgress: isGrammarMode ? {
        ...prev.grammarProgress,
        [grammarType]: prev.grammarProgress[grammarType] + (isCorrect ? 1 : 0)
      } : prev.grammarProgress
    }));

    // Attendre, puis nettoyer TOUS les états avant de passer au suivant
    setTimeout(() => {
      // 1. D'abord, nettoyer tous les états de la question actuelle
      setSelectedAnswer(null);
      setFeedback(null);  
      setIsTransitioning(false);
      
      // 2. Ensuite, passer à l'exercice suivant
      if (currentExerciseIndex < currentExercises.length - 1) {
        const nextIndex = currentExerciseIndex + 1;
        setCurrentExerciseIndex(nextIndex);
        setCurrentExercise(currentExercises[nextIndex]);
        
        // 3. Initialiser les états pour l'exercice suivant
        if (currentExercises[nextIndex]?.type === 'matching') {
          setMatches(new Map());
          setSelectedWord(null);
          setSelectedTranslation(null);
          setIncorrectMatches(new Set());
          setMatchAttempts(new Map());
          // Initialiser l'ordre mélangé pour le nouvel exercice d'appariement
          if (currentExercises[nextIndex]?.pairs) {
            setShuffledTranslations(shuffleArray([...currentExercises[nextIndex].pairs!]));
          }
        }
      } else {
        // Session terminée
        setSessionPhase('complete');
      }
    }, 1500);
  }, [
    currentExercise,
    isTransitioning,
    selectedCategory,
    onWordRevised,
    isGrammarMode,
    grammarType,
    playWord,
    currentExerciseIndex,
    currentExercises
  ]);

  // Gestion de l'appariement (adaptée)
  const handleWordSelect = useCallback((word: string) => {
    if (matches.has(word)) return;
    setSelectedWord(prev => prev === word ? null : word);
    setIncorrectMatches(prev => {
      const newSet = new Set(prev);
      newSet.delete(word);
      return newSet;
    });
  }, [matches]);

  const handleTranslationSelect = useCallback((translation: string) => {
    if (Array.from(matches.values()).includes(translation)) return;
    setSelectedTranslation(prev => prev === translation ? null : translation);
    setIncorrectMatches(prev => {
      const newSet = new Set(prev);
      newSet.delete(translation);
      return newSet;
    });
  }, [matches]);

  // Améliorer la gestion du feedback dans l'appariement
  const checkMatch = useCallback((word: string, translation: string) => {
    if (!currentExercise || currentExercise.type !== 'matching') return;
    
    const pair = currentExercise.pairs?.find(p => p.word === word);
    const isCorrect = pair?.translation === translation;
    
    const currentAttempts = matchAttempts.get(word) || 0;
    setMatchAttempts(prev => new Map(prev).set(word, currentAttempts + 1));
    
    if (isCorrect) {
      setMatches(prev => new Map(prev).set(word, translation));
      setSelectedWord(null);
      setSelectedTranslation(null);
      
      if (pair?.audio) {
        playWord(pair.audio);
      }
      
      // Enregistrer le résultat réussi pour le mot ciblé
      const targetWord = currentExercise.targetWord || word;
      setTempSessionData(prev => [...prev, {
        word: targetWord,
        isCorrect: true,
        category: selectedCategory || '',
        timestamp: Date.now(),
        exerciseType: 'matching',
        attempts: currentAttempts + 1
      }]);
      
      // Vérifier si tous les appariements sont terminés
      if (currentExercise.pairs && matches.size + 1 >= currentExercise.pairs.length) {
        setTimeout(() => {
          // Nettoyer le feedback avant de passer au suivant
          setFeedback(null);
          setSelectedAnswer(null);
          
          if (currentExerciseIndex < currentExercises.length - 1) {
            const nextIndex = currentExerciseIndex + 1;
            setCurrentExerciseIndex(nextIndex);
            setCurrentExercise(currentExercises[nextIndex]);
            
            // Réinitialiser les états d'appariement
            setMatches(new Map());
            setSelectedWord(null);
            setSelectedTranslation(null);
            setIncorrectMatches(new Set());
            setMatchAttempts(new Map());
            // Réinitialiser l'ordre mélangé pour le nouvel exercice
            if (currentExercises[nextIndex]?.type === 'matching' && currentExercises[nextIndex]?.pairs) {
              setShuffledTranslations(shuffleArray([...currentExercises[nextIndex].pairs!]));
            }
          } else {
            setSessionPhase('complete');
          }
        }, 1000);
      }
    } else {
      setIncorrectMatches(prev => new Set([...prev, word, translation]));
      
      // Enregistrer l'échec seulement pour le mot ciblé
      const targetWord = currentExercise.targetWord || word;
      if (word === targetWord) {
        setTempSessionData(prev => [...prev, {
          word: targetWord,
          isCorrect: false,
          category: selectedCategory || '',
          timestamp: Date.now(),
          exerciseType: 'matching',
          attempts: currentAttempts + 1
        }]);
      }
      
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
        setIncorrectMatches(prev => {
          const newSet = new Set(prev);
          newSet.delete(word);
          newSet.delete(translation);
          return newSet;
        });
      }, 1000);
    }
  }, [currentExercise, matches, matchAttempts, playWord, selectedCategory, currentExerciseIndex, currentExercises]);

  useEffect(() => {
    if (selectedWord && selectedTranslation) {
      checkMatch(selectedWord, selectedTranslation);
    }
  }, [selectedWord, selectedTranslation, checkMatch]);

  // Drag & Drop pour l'appariement
  const handleDragStart = useCallback((
    e: any,
    id: string,
    type: 'word' | 'translation',
    content: string,
    audio?: string
  ) => {
    const draggedData: DraggedItem = { id, type, content, audio };
    setDraggedItem(draggedData);
    e.dataTransfer.setData('application/json', JSON.stringify(draggedData));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: any, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropZoneActive(targetId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDropZoneActive(null);
  }, []);

  const handleDrop = useCallback((e: any, targetContent: string, targetType: 'word' | 'translation') => {
    e.preventDefault();
    setDropZoneActive(null);
    
    try {
      const draggedData: DraggedItem = JSON.parse(e.dataTransfer.getData('application/json'));
      
      if (draggedData.type === targetType) return;
      
      const word = draggedData.type === 'word' ? draggedData.content : targetContent;
      const translation = draggedData.type === 'translation' ? draggedData.content : targetContent;
      
      checkMatch(word, translation);
    } catch (error) {
      console.error('Erreur lors du drop:', error);
    }
    
    setDraggedItem(null);
  }, [checkMatch]);

  const handlePlayAudio = useCallback((word: string) => {
    if (!currentExercise || currentExercise.type !== 'matching') return;
    const pair = currentExercise.pairs?.find(p => p.word === word);
    if (pair?.audio) {
      playWord(pair.audio);
    }
  }, [currentExercise, playWord]);

  // useEffect de nettoyage lors du changement d'exercice
  useEffect(() => {
    // Réinitialiser le feedback à chaque changement d'exercice
    setSelectedAnswer(null);
    setFeedback(null);
    setIsTransitioning(false);
  }, [currentExerciseIndex, currentExercise?.id]);

  // Contrôler la sauvegarde avec useEffect
  useEffect(() => {
    if (sessionPhase === 'complete' && tempSessionData.length > 0 && !hasSaved && !isSaving) {
      // Déclencher la sauvegarde avec un délai pour éviter les appels multiples
      const saveTimeout = setTimeout(() => {
        handleSessionSave();
      }, 100);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [sessionPhase, tempSessionData.length, hasSaved, isSaving, handleSessionSave]);

  // Nettoyer le feedback lors du reset de session
  const handleResetSession = useCallback(() => {
    // Nettoyer TOUS les états de feedback
    setSelectedAnswer(null);
    setFeedback(null);
    setIsTransitioning(false);
    
    // Nettoyer les autres états
    setTempSessionData([]);
    setIsSaving(false);
    setHasSaved(false);
    resetSession();
    setSessionPhase('category-selection');
    setCurrentExercises([]);
    setCurrentExerciseIndex(0);
    setCurrentExercise(null);
    
    // Fermer la liste des mots lors du reset
    setShowWordsList(false);
    
    // Nettoyer les états d'appariement
    setMatches(new Map());
    setSelectedWord(null);
    setSelectedTranslation(null);
    setIncorrectMatches(new Set());
    setMatchAttempts(new Map());
    setShuffledTranslations([]); // Reset des traductions mélangées
  }, [resetSession]);

  const handleContinueRevision = useCallback(() => {
    console.log('🔄 Tentative de continuation de la révision...');
    
    // 1. Vérifier s'il y a encore des mots à réviser dans la catégorie actuelle
    if (selectedCategory) {
      const currentCategoryDueWords = getDueWordsForCategory(selectedCategory);
      console.log(`📚 ${currentCategoryDueWords.length} mots dus dans ${selectedCategory}`);
      
      if (currentCategoryDueWords.length > 0) {
        // Il y a encore des mots à réviser dans cette catégorie
        console.log('✅ Lancement d\'une nouvelle session dans la même catégorie');
        
        // Nettoyer l'état actuel
        setTempSessionData([]);
        setIsSaving(false);
        setHasSaved(false);
        setSelectedAnswer(null);
        setFeedback(null);
        setIsTransitioning(false);
        
        // Réinitialiser les états d'appariement
        setMatches(new Map());
        setSelectedWord(null);
        setSelectedTranslation(null);
        setIncorrectMatches(new Set());
        setMatchAttempts(new Map());
        setShuffledTranslations([]);
        
        // Mettre à jour les mots actuels
        setCurrentWords(currentCategoryDueWords);
        
        // Lancer directement une nouvelle session
        setTimeout(() => {
          startRevision();
        }, 100);
        
        return;
      }
    }
    
    // 2. Si pas de mots dans la catégorie actuelle, chercher dans d'autres catégories
    console.log('🔍 Recherche de mots dans d\'autres catégories...');
    const allFilteredCategories = getFilteredCategories();
    
    if (allFilteredCategories.length > 0) {
      // Il y a d'autres catégories avec des mots à réviser
      const nextCategory = allFilteredCategories[0];
      console.log(`✅ Basculement vers la catégorie: ${nextCategory}`);
      
      // Nettoyer l'état actuel complètement
      setTempSessionData([]);
      setIsSaving(false);
      setHasSaved(false);
      setSelectedAnswer(null);
      setFeedback(null);
      setIsTransitioning(false);
      
      // Réinitialiser les états d'appariement
      setMatches(new Map());
      setSelectedWord(null);
      setSelectedTranslation(null);
      setIncorrectMatches(new Set());
      setMatchAttempts(new Map());
      setShuffledTranslations([]);
      
      // Sélectionner la nouvelle catégorie et ses mots
      const nextCategoryWords = getDueWordsForCategory(nextCategory);
      setSelectedCategory(nextCategory);
      setCurrentWords(nextCategoryWords);
      setIsGrammarMode(nextCategory === 'Grammaire');
      
      if (nextCategory === 'Grammaire') {
        setGrammarType('rule');
        setGrammarSubCategory(null);
      }
      
      // Mettre à jour la map des données
      const newWordDataMap: Record<string, Record<string, WordData>> = {
        [nextCategory]: Object.fromEntries(nextCategoryWords.map(([word, data]) => [word, data]))
      };
      setWordDataMap(newWordDataMap);
      
      // Lancer directement une nouvelle session dans la nouvelle catégorie
      setTimeout(() => {
        startRevision();
      }, 100);
      
      return;
    }
    
    // 3. Aucune révision disponible - retour à la sélection de catégorie
    console.log('ℹ️ Aucune révision disponible - retour à la sélection');
    handleResetSession();
    setSelectedCategory(null);
    setCurrentWords([]);
  }, [
    selectedCategory,
    getDueWordsForCategory,
    getFilteredCategories,
    startRevision,
    handleResetSession,
    setWordDataMap
  ]);

  // useEffect pour migration et nettoyage au montage
  useEffect(() => {
    const migrationKey = `${languageCode}-complete-migration-v2`;
    
    if (!localStorage.getItem(migrationKey)) {
      console.log('🚀 Migration complète v2...');
      
      // 1. Migration forcée
      forceMigrationOnStart();
      
      // 2. Synchronisation depuis LearnMode
      setTimeout(() => {
        syncFromLearnMode();
      }, 500);
      
      // 3. Nettoyage des doublons
      setTimeout(() => {
        checkAndCleanCrossCategory();
      }, 1000);
      
      // Marquer comme terminé
      localStorage.setItem(migrationKey, 'true');
      console.log('✅ Migration complète v2 terminée');
    }
  }, [languageCode, forceMigrationOnStart, syncFromLearnMode, checkAndCleanCrossCategory]);

  // Surveiller les changements de localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes(languageCode) && event.key?.includes('learnedWords')) {
        console.log('📡 Changement détecté dans localStorage:', event.key);
        
        // Forcer le recalcul
        setTimeout(() => {
          if (selectedCategory) {
            const dueWords = getDueWordsForCategory(selectedCategory);
            setCurrentWords(dueWords);
            console.log(`🔄 Mise à jour ${selectedCategory}: ${dueWords.length} mots`);
          }
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [languageCode, selectedCategory, getDueWordsForCategory]);

  // Fonction de nettoyage lors du démontage
  useEffect(() => {
    return () => {
      // Nettoyage au démontage pour éviter les fuites mémoire
      setTempSessionData([]);
      setIsSaving(false);
      setHasSaved(false);
      setShuffledTranslations([]);
    };
  }, []);

  // Condition d'affichage renforcée pour le feedback
  const shouldShowFeedback = feedback && !isTransitioning && selectedAnswer;

  const dueWordsCount = revisionProgress.wordsToReview.size;

  return (
    <div 
      className={`revision-mode-wrapper ${theme === 'dark' ? 'dark-mode' : ''} ${showStatsModal ? 'modal-open' : ''}`} 
      data-theme={theme}
    >
      {/* Bouton retour fixe en haut à gauche - style CategorySelection avec gestion z-index */}
      <motion.button
        onClick={handleBackButton}
        className="revision-back-button-top"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          zIndex: showStatsModal ? 50 : 100,
          opacity: showStatsModal ? 0.3 : 1,
          pointerEvents: showStatsModal ? 'none' : 'auto'
        }}
      >
        <ArrowLeft size={20} />
        <span>Retour</span>
      </motion.button>

      <div className="revision-mode">
        {/* Header simplifié sans bouton retour */}
        <header className="revision-header">
          <h1 className="revision-title">Révision - {languageData.name}</h1>
        </header>

        {/* Phase de sélection des catégories */}
        {sessionPhase === 'category-selection' && (
          <div className="vocabulary-mode">
            {dueWordsCount === 0 ? (
              <div className="revision-empty">
                <h2>Pas de mots à réviser</h2>
                <p>Aucun mot n'est disponible pour la révision. Continuez à apprendre de nouveaux mots pour pouvoir les réviser plus tard.</p>
               
              </div>
            ) : (
              <>
                <div className="vocabulary-mode-header">
                  <h2 className="vocabulary-mode-title">Choisissez une catégorie à réviser</h2>
                </div>

                {/* Utilisation de getFilteredCategories */}
                {getFilteredCategories().length === 0 ? (
                  <div className="empty-categories-message">
                    <div className="empty-icon">🎉</div>
                    <p>Toutes les révisions sont à jour !</p>
                    <p>Vous avez révisé tous les mots disponibles. Revenez plus tard pour de nouvelles révisions ou apprenez de nouveaux mots.</p>
                    
                    
                  </div>
                ) : (
                  <div className="categories-carousel">
                    <button
                      className={`carousel-button prev ${!canScrollLeft ? 'disabled' : ''}`}
                      onClick={() => scroll('left')}
                      disabled={!canScrollLeft}
                    >
                      <ChevronLeft />
                    </button>

                    <div 
                      className="categories-container"
                      ref={carouselRef}
                      onScroll={handleScroll}
                    >
                      {/* Utilisation de getFilteredCategories */}
                      {getFilteredCategories().map(categoryName => {
                        const dueWords = getDueWordsForCategory(categoryName);
                        const isGrammar = categoryName === 'Grammaire';
                        return (
                          <div
                            key={categoryName}
                            onClick={() => handleCategorySelect(categoryName, isGrammar)}
                            className={`category-card ${selectedCategory === categoryName ? 'selected' : ''} ${isGrammar ? 'grammar' : ''}`}
                          >
                            <div className="category-illustration">
                              {categoryIllustrations[categoryName] || '📚'}
                            </div>
                            <h3 className="category-name">{categoryName}</h3>
                            <p className="category-stats">
                              {dueWords.length} mot{dueWords.length !== 1 ? 's' : ''} à réviser
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className={`carousel-button next ${!canScrollRight ? 'disabled' : ''}`}
                      onClick={() => scroll('right')}
                      disabled={!canScrollRight}
                    >
                      <ChevronRight />
                    </button>
                  </div>
                )}

                {/* Section catégorie sélectionnée avec affichage optimisé */}
                {selectedCategory && currentWords.length > 0 && (
                  <div className="selected-category">
                    
                    {/* Bouton pour afficher/masquer la liste des mots */}
                    <div className="words-list-toggle">
                      <motion.button
                        onClick={toggleWordsList}
                        className="toggle-words-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {showWordsList ? (
                          <>
                            <span>Masquer la liste ({currentWords.length} mots)</span>
                            <ChevronUp size={16} />
                          </>
                        ) : (
                          <>
                            <span>Voir la liste ({currentWords.length} mots)</span>
                            <ChevronDown size={16} />
                          </>
                        )}
                      </motion.button>
                    </div>
                    
                    {/* Liste des mots avec animation et scroll optimisé */}
                    <AnimatePresence>
                      {showWordsList && (
                        <motion.div
                          className="words-list-container"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="words-list">
                            {currentWords.map(([word, data], index) => (
                              <motion.div 
                                key={`${word}-${index}`} 
                                className="word-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                              >
                                <div className="word-info">
                                  <span className="word-text">{cleanParentheses(word)}</span>
                                  <span className="word-translation">{data.translation}</span>
                                </div>
                                
                                {hasValidAudio(data.audio) && (
                                  <button 
                                    className="audio-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playWord(data.audio!);
                                    }}
                                  >
                                    <Volume2 size={20} />
                                  </button>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Bouton de démarrage plus visible */}
                    <div className="start-session-container">
                      <motion.button
                        onClick={startRevision}
                        className="start-mixed-revision-button"
                        disabled={currentWords.length === 0}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <RotateCw size={20} />
                        <span>Commencer la session</span>
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Phase d'exercice avec affichage optimisé */}
        {sessionPhase === 'exercise' && currentExercise && (
          <div className="revision-test">
            {/* Header d'exercice amélioré */}
            <div className="exercise-header">
              <div className="exercise-progress">
                <div className="progress-circle">
                  <ProgressPie 
                    progress={currentExerciseIndex / currentExercises.length}
                    size={56} 
                  />
                </div>
                <div className="progress-info">
                  <span className="current-progress">
                    Exercice {currentExerciseIndex + 1} / {currentExercises.length}
                  </span>
                  <span className="exercise-type">
                    {currentExercise.type === 'qcm' ? (
                      currentExercise.variant === 'reverse' ? '🔄 QCM Inversé' : '📝 QCM Classique'
                    ) : '🔗 Appariement'}
                  </span>
                </div>
              </div>
              <div className="exercise-category">
                <span className="category-badge">{selectedCategory}</span>
              </div>
            </div>

            {currentExercise.type === 'qcm' ? (
              // Test QCM avec design plus clair
              <div className="test-container">
                <div className="question-section">
                  <div className="question-card">
                    {currentExercise.variant === 'reverse' ? (
                      // QCM inversé : Langue cible → Français
                      <>
                        <div className="question-label">Traduisez en français :</div>
                        <h3 className="word-to-translate">{cleanParentheses(currentExercise.word)}</h3>
                        {hasValidAudio(currentExercise.wordData.audio) && (
                          <button 
                            className="audio-button-large"
                            onClick={() => playWord(currentExercise.wordData.audio!)}
                          >
                            <Volume2 size={24} />
                            <span>Écouter</span>
                          </button>
                        )}
                      </>
                    ) : (
                      // QCM classique : Français → Langue cible
                      <>
                        <div className="question-label">Traduisez :</div>
                        <h3 className="word-to-translate">{currentExercise.wordData.translation}</h3>
                        <div className="question-hint">
                          En {languageCode === 'wf' ? 'Wolof' : languageCode === 'la' ? 'Lingala' : 'langue cible'}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="answer-section">
                  <div className="options-grid">
                    {currentExercise.options?.map((option, index) => {
                      const isCorrectAnswer = currentExercise.variant === 'reverse' 
                        ? option === currentExercise.wordData.translation
                        : option === cleanParentheses(currentExercise.word);
                        
                      return (
                        <motion.button
                          key={`${option}-${index}`}
                          onClick={() => handleQCMAnswer(option)}
                          disabled={!!selectedAnswer}
                          className={`learn-mode-option ${
                            selectedAnswer === option ? 'selected' : ''
                          } ${
                            feedback && isCorrectAnswer ? 'correct' : ''
                          } ${
                            feedback && selectedAnswer === option && !isCorrectAnswer
                              ? 'incorrect' 
                              : ''
                          }`}
                          whileHover={!selectedAnswer ? { scale: 1.02 } : undefined}
                          whileTap={!selectedAnswer ? { scale: 0.98 } : undefined}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                          <span className="option-text">{option}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {shouldShowFeedback && (
                    <motion.div
                      className={`feedback-message ${feedback.startsWith('Correct') ? 'correct' : 'incorrect'}`}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="feedback-icon">
                        {feedback.startsWith('Correct') ? '✅' : '❌'}
                      </div>
                      <div className="feedback-text">{feedback}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Test d'appariement avec design optimisé
              <div className="matching-test-container">
                <div className="matching-header">
                  <div className="matching-progress">
                    <span className="progress-text">
                      {matches.size} / {currentExercise.pairs?.length || 0} appariements réalisés
                    </span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${(matches.size / (currentExercise.pairs?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="matching-instructions">
                  <div className="instruction-card">
                    <div className="instruction-icon">🎯</div>
                    <p>Cliquez ou glissez pour associer les mots à leur traduction</p>
                  </div>
                </div>

                <div className="matching-area">
                  <div className="words-column">
                    <div className="column-header">
                      <h4>Mots en {languageCode === 'wf' ? 'Wolof' : languageCode === 'la' ? 'Lingala' : 'Langue cible'}</h4>
                    </div>
                    <div className="items-list">
                      {currentExercise.pairs?.map((pair, index) => {
                        const isMatched = matches.has(pair.word);
                        const isSelected = selectedWord === pair.word;
                        const isIncorrect = incorrectMatches.has(pair.word);
                        
                        return (
                          <motion.div
                            key={`word-${index}`}
                            className={`matching-item word-item ${
                              isMatched ? 'matched' : ''
                            } ${isSelected ? 'selected' : ''} ${
                              isIncorrect ? 'incorrect' : ''
                            } ${dropZoneActive === pair.word ? 'drop-active' : ''}`}
                            onClick={() => !isMatched && handleWordSelect(pair.word)}
                            draggable={!isMatched}
                            onDragStart={(e) => handleDragStart(e, `word-${index}`, 'word', pair.word, pair.audio)}
                            onDragOver={(e) => handleDragOver(e, pair.word)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, pair.word, 'word')}
                            whileHover={!isMatched ? { scale: 1.02 } : undefined}
                            whileTap={!isMatched ? { scale: 0.98 } : undefined}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            layout
                          >
                            <div className="item-content">
                              <span className="item-text">{pair.word}</span>
                              
                              <div className="item-actions">
                                {pair.audio && (
                                  <button
                                    className="audio-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayAudio(pair.word);
                                    }}
                                  >
                                    <Volume2 size={16} />
                                  </button>
                                )}
                                
                                {isMatched && (
                                  <CheckCircle size={20} className="match-icon" />
                                )}
                                
                                {isIncorrect && (
                                  <XCircle size={20} className="incorrect-icon" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="connection-indicator">
                    <div className="connection-line">
                      <div className="line-animation"></div>
                    </div>
                    <div className="connection-icon">↔</div>
                  </div>

                  <div className="translations-column">
                    <div className="column-header">
                      <h4>Traductions en Français</h4>
                    </div>
                    <div className="items-list">
                      {/* Utilisation de shuffledTranslations au lieu de shuffleArray */}
                      {shuffledTranslations.map((pair, index) => {
                        const isMatched = Array.from(matches.values()).includes(pair.translation);
                        const isSelected = selectedTranslation === pair.translation;
                        const isIncorrect = incorrectMatches.has(pair.translation);
                        
                        return (
                          <motion.div
                            key={`translation-${index}`}
                            className={`matching-item translation-item ${
                              isMatched ? 'matched' : ''
                            } ${isSelected ? 'selected' : ''} ${
                              isIncorrect ? 'incorrect' : ''
                            } ${dropZoneActive === pair.translation ? 'drop-active' : ''}`}
                            onClick={() => !isMatched && handleTranslationSelect(pair.translation)}
                            draggable={!isMatched}
                            onDragStart={(e) => handleDragStart(e, `translation-${index}`, 'translation', pair.translation)}
                            onDragOver={(e) => handleDragOver(e, pair.translation)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, pair.translation, 'translation')}
                            whileHover={!isMatched ? { scale: 1.02 } : undefined}
                            whileTap={!isMatched ? { scale: 0.98 } : undefined}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            layout
                          >
                            <div className="item-content">
                              <span className="item-text">{pair.translation}</span>
                              
                              <div className="item-actions">
                                {isMatched && (
                                  <CheckCircle size={20} className="match-icon" />
                                )}
                                
                                {isIncorrect && (
                                  <XCircle size={20} className="incorrect-icon" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Barre de progression d'exercice plus visible */}
            <div className="exercise-progress-container">
              <div className="exercise-progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentExerciseIndex / currentExercises.length) * 100}%` }}
                />
              </div>
              <div className="progress-labels">
                <span>Exercice {currentExerciseIndex + 1}</span>
                <span>{currentExercises.length} total</span>
              </div>
            </div>
          </div>
        )}

        {/* Phase de session terminée avec statistiques détaillées */}
        {sessionPhase === 'complete' && (
          <div className="revision-complete">
            <motion.div
              className="completion-header"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="completion-icon">🎉</div>
              <h2>Session terminée !</h2>
              <p>Excellente session de révision dans <strong>{selectedCategory}</strong></p>
            </motion.div>

            <motion.div 
              className="session-summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3>📊 Résumé de la session</h3>
              
              <div className="summary-stats">
                <div className="stat-card primary">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <span className="stat-number">{tempSessionData.filter(item => item.isCorrect).length}</span>
                    <span className="stat-label">Bonnes réponses</span>
                  </div>
                </div>
               
                <div className="stat-card accent">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-content">
                    <span className="stat-number">
                      {tempSessionData.length > 0 ? Math.round((tempSessionData.filter(item => item.isCorrect).length / tempSessionData.length) * 100) : 0}%
                    </span>
                    <span className="stat-label">Score global</span>
                  </div>
                </div>
              </div>

              <motion.div 
                className="completion-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ 
                  width: '100%',
                  padding: '40px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  margin: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  alignItems: 'center'
                }}
              >
                
                <motion.button 
                  onClick={handleContinueRevision}
                  className="continue-revision-button primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  style={{
                    padding: '20px 40px',
                    background: 'linear-gradient(135deg, #4a7c59, #2d5016)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    minWidth: '280px',
                    boxShadow: '0px 8px 24px rgba(74, 124, 89, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🚀</span>
                    <span>Continuer les révisions</span>
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '400', 
                    opacity: '0.8', 
                    textTransform: 'none', 
                    letterSpacing: 'normal' 
                  }}>
                    Nouvelle session automatique
                  </span>
                </motion.button>
                
                <motion.button 
                  onClick={() => {
                    handleResetSession();
                    if (selectedCategory) {
                      handleCategorySelect(selectedCategory, isGrammarMode);
                    }
                  }}
                  className="back-to-categories-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 0.4 }}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #8b4513, #5d3317)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '200px',
                    boxShadow: '0px 8px 24px rgba(139, 69, 19, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⬅️</span>
                  <span>Retour aux catégories</span>
                </motion.button>
              </motion.div>

              <div className="words-summary">
                <h4>📚 Mots révisés</h4>
                <div className="words-grid">
                  {(() => {
                    const uniqueWords = Array.from(new Set(tempSessionData.map(item => item.word)));
                    
                    return uniqueWords.map((word, index) => {
                      const wordData = tempSessionData.filter(item => item.word === word);
                      const correct = wordData.filter(item => item.isCorrect).length;
                      const total = wordData.length;
                      const successRate = total > 0 ? correct / total : 0;
                      const isSuccess = successRate >= 0.75;
                      
                      return (
                        <motion.div 
                          key={`${word}-${index}`} 
                          className={`word-summary-item ${isSuccess ? 'success' : 'needs-review'}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="word-summary-content">
                            <span className="word">{word}</span>
                            <div className="word-score">
                              <span className="score-text">{correct}/{total}</span>
                              <span className="score-icon">
                                {isSuccess ? '✅' : '🔄'}
                              </span>
                            </div>
                          </div>
                          <div className="word-progress-bar">
                            <div 
                              className="word-progress-fill"
                              style={{ width: `${(correct / total) * 100}%` }}
                            />
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal de statistiques avec z-index géré */}
        <RevisionStatsModal 
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          revisionHistory={getSessionWords().map(word => ({
            ...word,
            isCorrect: word.isCorrect ?? false,
            nextReview: word.nextReview ?? Date.now() + (24 * 60 * 60 * 1000)
          }))}
          wordDataMap={wordDataMap}
          wordProgress={userProgress.wordProgress}  
          languageCode={languageCode}
        />

        <ConfirmationModal
          isOpen={showExitConfirmation}
          onConfirm={handleExitConfirm}
          onCancel={() => setShowExitConfirmation(false)}
          message="Attention ! Si vous quittez maintenant, votre progression de révision ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
          title="Quitter la révision ?"
          confirmText="Quitter"
          cancelText="Continuer la révision"
          confirmButtonStyle="danger"
          position="top"
        />
      </div>

      {/* Bouton stats fixe en bas à droite avec gestion z-index */}
      <motion.button 
        className="show-stats-button" 
        onClick={() => setShowStatsModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          zIndex: showStatsModal ? 50 : 100,
          opacity: showStatsModal ? 0.3 : 1,
          pointerEvents: showStatsModal ? 'none' : 'auto'
        }}
      >
        <RotateCw size={20} />
        <span>Prochaines révisions</span>
      </motion.button>
    </div>
  );
};

export default RevisionMode;
