import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio';
import {  useUserProgress, useConfirmationDialog } from '../hooks/hooks';
import { WordData, LearnModeProps, LearnedWord, LanguageCode, deserializeUserProgress, UserProgress, AppMode } from '../types/types';
import { shuffleArray } from '../utils/utils';
import { getLanguageData } from '../data/languages';
import { useTheme } from './ThemeContext';
import './LearnMode.css';
import ProgressPie from './ProgressPie';
import { useSummaryAudio } from '../utils/summaryAudio';
import { cleanParentheses } from '../utils/cleanParentheses';
import XPAnimation from './XPAnimation';
import ConfirmationModal from './ConfirmationModal';

const WORDS_PER_LESSON = 5;
const TESTS_PER_WORD = 3;
const XP_PER_WORD = 10;

interface LearnModeExtendedProps extends LearnModeProps {
  languageCode: LanguageCode;
  onAnswer?: (correct: boolean) => void;
  words?: Record<string, Record<string, WordData>>;
  isLoading?: boolean;
  sessionLearnedWords: Set<string>;
  setMode: React.Dispatch<React.SetStateAction<AppMode>>;
  isMobileView?: boolean; 
  onSessionComplete?: () => void;
  saveProgressOnSummary?: (progress: UserProgress, context?: any) => Promise<void>;
}

// ✅ NOUVEAU: Composant AdaptiveBackButton comme dans WordListPreview
const AdaptiveBackButton: React.FC<{
  onBack: () => void;
  isMobileView?: boolean;
  title?: string;
}> = ({ onBack, isMobileView = false, title }) => {
  const { theme } = useTheme();
  
  if (isMobileView) {
    return (
      <>
        {/* Bouton flottant en haut à gauche comme dans WordListPreview */}
        <motion.button
          onClick={onBack}
          className="mobile-header-back-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </motion.button>
        
        {/* Header mobile simplifié sans le bouton central */}
        {title && (
          <div className="learn-mode-mobile-header">
            <h2 className="learn-mode-mobile-title">{title}</h2>
          </div>
        )}
      </>
    );
  }
  
  return (
    <motion.button
      onClick={onBack}
      className="learn-mode-back-button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={20} />
      <span>Retour</span>
    </motion.button>
  );
};

const LearnMode: React.FC<LearnModeExtendedProps> = ({
  languageCode,
  category,
  subcategory,
  onBackToCategories,
  onGameComplete,
  onWordLearned,
  onWordsLearned,
  isLoading = false,
  resetToken,
  words,
  isMobileView,
  onAnswer,
  onSessionComplete,
  saveProgressOnSummary,
}) => {
  const { theme } = useTheme();
  const { playWord } = useSupabaseAudio(languageCode);
  const languageData = getLanguageData(languageCode);
  const { userProgress, updateProgress, addRecentlyLearnedWords, getFullWordKey } = useUserProgress(languageCode, category, resetToken);
  const { isOpen, open, close } = useConfirmationDialog(false);

  // États principaux
  const [currentWords, setCurrentWords] = useState<[string, WordData][]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [mode, setMode] = useState<'preview' | 'test' | 'summary'>('preview');
  const [testQueue, setTestQueue] = useState<string[]>([]);
  const [testScores, setTestScores] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [stableOptions, setStableOptions] = useState<string[]>([]);
  const [showExitConfirmation, setShowExitConfirmation] = useState<boolean>(false);

  // États pour gérer la sauvegarde de manière stable
  const [shouldSave, setShouldSave] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [isProcessingSummary, setIsProcessingSummary] = useState(false);

  // ✅ NOUVEAU : États pour la gestion XP en deux étapes
  const [summaryStep, setSummaryStep] = useState<'results' | 'xp'>('results');
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Mots définitivement appris VS temporairement maîtrisés
  const learnedWordsRef = useRef(new Set<string>());
  const [tempMasteredWords, setTempMasteredWords] = useState<Set<string>>(new Set());
  const [sessionLearnedWords, setSessionLearnedWords] = useState<Set<string>>(new Set());
  
  // Ref pour les mots temporairement maîtrisés
  const tempMasteredWordsRef = useRef<Set<string>>(new Set());
  
  // Ref pour figer les mots de la session une fois commencée
  const sessionWordsRef = useRef<[string, WordData][]>([]);
  const sessionStartedRef = useRef(false);
  
  // Refs pour stabiliser les données
  const testScoresRef = useRef<Record<string, number>>({});
  const currentWordsRef = useRef<[string, WordData][]>([]);
  
  const storageKey = `${languageCode}-${category}-completed`;


  const { playSummaryAudio } = useSummaryAudio();

  // 🔧 NOUVEAU : Fonction pour charger les mots appris PAR CATÉGORIE
  const getCategoryLearnedWords = useCallback((targetCategory: string): Set<string> => {
    const categoryLearnedKey = `${languageCode}-${targetCategory}-learnedWords`;
    
    try {
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      if (savedCategoryLearned) {
        const categoryWords = JSON.parse(savedCategoryLearned) as string[];
        return new Set(categoryWords);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de la catégorie ${targetCategory}:`, error);
    }
    
    return new Set();
  }, [languageCode]);

  // 🔧 NOUVEAU : Fonction pour sauvegarder les mots appris PAR CATÉGORIE
  const saveCategoryLearnedWords = useCallback((targetCategory: string, wordsToAdd: string[]) => {
    const categoryLearnedKey = `${languageCode}-${targetCategory}-learnedWords`;
    
    try {
      // Charger la liste existante
      let categoryLearnedWords: string[] = [];
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      
      if (savedCategoryLearned) {
        categoryLearnedWords = JSON.parse(savedCategoryLearned) as string[];
      }
      
      // Ajouter les nouveaux mots sans doublons
      wordsToAdd.forEach(word => {
        if (!categoryLearnedWords.includes(word)) {
          categoryLearnedWords.push(word);
          console.log(`✅ Mot ajouté à la catégorie ${targetCategory}: ${word}`);
        }
      });
      
      // Sauvegarder la liste mise à jour
      localStorage.setItem(categoryLearnedKey, JSON.stringify(categoryLearnedWords));
      console.log(`💾 Sauvegarde catégorie ${targetCategory}: ${categoryLearnedWords.length} mots`);
      
      return categoryLearnedWords;
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde de la catégorie ${targetCategory}:`, error);
      return [];
    }
  }, [languageCode]);

  // 🔧 NOUVEAU : Migration automatique des données existantes
  const migrateToCategories = useCallback(() => {
    const migrationKey = `${languageCode}-migration-to-categories-completed`;
    
    if (localStorage.getItem(migrationKey)) {
      console.log('🔄 Migration déjà effectuée');
      return;
    }
    
    console.log('🔄 Début de la migration vers stockage par catégorie...');
    
    try {
      // Charger l'ancienne liste globale
      const globalLearnedKey = `${languageCode}-allLearnedWords`;
      const savedGlobalLearned = localStorage.getItem(globalLearnedKey);
      
      if (savedGlobalLearned) {
        const globalWords = JSON.parse(savedGlobalLearned) as string[];
        console.log(`📚 Migration de ${globalWords.length} mots globaux`);
        
        // Répartir les mots par catégorie
        Object.keys(languageData.categories).forEach(categoryName => {
          const categoryWords = languageData.categories[categoryName];
          if (!categoryWords) return;
          
          const categoryLearnedWords: string[] = [];
          
          Object.keys(categoryWords).forEach(word => {
            if (word.includes('_')) return;
            
            const cleanWord = cleanParentheses(word);
            
            // Si le mot est dans la liste globale, l'ajouter à cette catégorie
            if (globalWords.includes(cleanWord) || globalWords.includes(word)) {
              if (!categoryLearnedWords.includes(cleanWord)) {
                categoryLearnedWords.push(cleanWord);
              }
            }
          });
          
          // Sauvegarder pour cette catégorie
          if (categoryLearnedWords.length > 0) {
            const categoryLearnedKey = `${languageCode}-${categoryName}-learnedWords`;
            localStorage.setItem(categoryLearnedKey, JSON.stringify(categoryLearnedWords));
            console.log(`📁 Migration ${categoryName}: ${categoryLearnedWords.length} mots`);
          }
        });
        
        // Marquer la migration comme terminée
        localStorage.setItem(migrationKey, 'true');
        console.log('✅ Migration vers stockage par catégorie terminée');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la migration:', error);
    }
  }, [languageCode, languageData.categories]);

  // ✅ NOUVEAU : Fonction pour passer à l'étape XP
  const handleShowXP = useCallback(() => {
    console.log('🎯 Passage à l\'étape XP');
    
    const totalXPGained = Object.values(testScoresRef.current).filter(score => score >= TESTS_PER_WORD).length * XP_PER_WORD;
    
    if (totalXPGained > 0) {
      setSummaryStep('xp');
      setXpGained(totalXPGained);
      
      setTimeout(() => {
        setShowXPAnimation(true);
      }, 300);
    } else {
      setSummaryStep('xp');
    }
  }, []);

  // ✅ NOUVEAU : Fonction pour réinitialiser les états du résumé
  const resetSummaryState = useCallback(() => {
    setSummaryStep('results');
    setShowXPAnimation(false);
    setXpGained(0);
    setShouldSave(false);
    setSaveCompleted(false);
    setIsProcessingSummary(false);
  }, []);

  // Synchroniser les refs avec les states
  useEffect(() => {
    testScoresRef.current = testScores;
  }, [testScores]);

  useEffect(() => {
    currentWordsRef.current = currentWords;
  }, [currentWords]);

  // Nettoyage lors du changement de mode
  useEffect(() => {
    if (mode === 'test') {
      console.log('🔄 Mode test activé - réinitialisation de la sélection');
      setSelectedAnswer(null);
    }
  }, [mode]);

  // Initialisation et chargement
  useEffect(() => {
    if (isLessonComplete) {
      localStorage.setItem(storageKey, 'true');
    }
  }, [isLessonComplete, storageKey]);

  useEffect(() => {
    const isCompleted = localStorage.getItem(storageKey) === 'true';
    if (isCompleted) {
      setIsLessonComplete(true);
    }
  }, [storageKey]);

  // 🔧 MODIFIÉ : Initialisation de learnedWordsRef avec stockage par catégorie
  useEffect(() => {
    console.log('🔄 Initialisation de learnedWordsRef par catégorie...');
    const categoryLearnedWords = getCategoryLearnedWords(category);
    learnedWordsRef.current = new Set([...categoryLearnedWords]);
    console.log(`✅ learnedWordsRef initialisé pour ${category}:`, Array.from(learnedWordsRef.current));
  }, [category, getCategoryLearnedWords]);

  useEffect(() => {
    if (resetToken) {
      console.log('🔄 Reset token détecté - réinitialisation des références');
      learnedWordsRef.current = new Set();
      setTempMasteredWords(new Set());
      sessionStartedRef.current = false;
      sessionWordsRef.current = [];
      resetSummaryState(); // ✅ NOUVEAU
    }
  }, [resetToken, resetSummaryState]);

  // 🔧 MODIFIÉ : Mémoriser la liste des mots appris par catégorie
  const stableLearnedWords = useMemo(() => {
    const categoryLearnedWords = getCategoryLearnedWords(category);
    const allLearned = [
      ...Array.from(learnedWordsRef.current),
      ...Array.from(categoryLearnedWords)
    ];
    return allLearned.sort().join(',');
  }, [category, getCategoryLearnedWords]);

  // Effectuer la migration au montage
  useEffect(() => {
    migrateToCategories();
  }, [migrateToCategories]);

  const generateStableOptions = useCallback((wordToTest: string, allCurrentWords: [string, WordData][]) => {
    const correctWord = allCurrentWords.find(([word]) => word === wordToTest);
    if (!correctWord) return [];

    const correctTranslation = correctWord[1].translation;
    const otherTranslations = allCurrentWords
      .filter(([word]) => word !== wordToTest)
      .map(([_, data]) => data.translation);
    
    const wrongOptions = shuffleArray(otherTranslations).slice(0, 3);
    return shuffleArray([correctTranslation, ...wrongOptions]);
  }, []);

  const startTest = useCallback(() => {
    console.log('🎮 Starting Test Session');
    console.log('Words to learn:', currentWords.map(([word]) => word));
    console.log('Tests required per word:', TESTS_PER_WORD);
    
    if (currentWords.length === 0) {
      console.error('Impossible de démarrer le test : aucun mot disponible');
      return;
    }
    
    // Réinitialisation au début du test
    console.log('🧹 Réinitialisation au début du test...');
    setSelectedAnswer(null);
    
    // Figer les mots de la session
    sessionWordsRef.current = [...currentWords];
    sessionStartedRef.current = true;
    
    // Initialiser la ref des scores
    testScoresRef.current = { ...testScores };
    
    setMode('test');
    
    // Créer la file de test
    const queue = currentWords.flatMap(([word]) => {
      const alreadyCorrect = testScores[word] || 0;
      const testsNeeded = Math.max(0, TESTS_PER_WORD - alreadyCorrect);
      return Array(testsNeeded).fill(word);
    });
    
    const shuffledQueue = shuffleArray(queue);
    console.log('Queue de test générée:', shuffledQueue);
    setTestQueue(shuffledQueue);
    
    if (shuffledQueue.length > 0) {
      const firstWord = shuffledQueue[0];
      const options = generateStableOptions(firstWord, currentWords);
      setStableOptions(options);
      /*
      const firstWordData = currentWords.find(([word]) => word === firstWord)?.[1];
      if (firstWordData?.audio) {
        setTimeout(() => {
         playWord(firstWordData.audio!).catch(error => 
            console.error('Erreur lors de la lecture audio:', error)
          );
        }, 500);
      }*/
    }
    
    // Sauvegarde temporaire pour reprise de session
    const sessionData = {
      words: currentWords.map(([word]) => word),
      scores: testScores,
      timestamp: Date.now(),
      mode: 'test',
      currentIndex: 0,
    };
    
    try {
      const inProgressKey = `${languageCode}-${category}-inProgress`;
      localStorage.setItem(inProgressKey, JSON.stringify(sessionData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session de test:', error);
    }
  }, [currentWords, generateStableOptions, testScores, playWord, languageCode, category]);

  const handleNextWord = useCallback(async () => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else if (mode === 'preview') {
      startTest();
    }
  }, [currentWordIndex, currentWords.length, mode, startTest]);


const handleSummaryComplete = useCallback(async () => {
  console.log('=== 🔄 LEARNMODE - DÉBUT SAUVEGARDE CENTRALISÉE ===');
  
  const currentTestScores = testScoresRef.current;
  const currentWordsData = sessionWordsRef.current.length > 0 ? sessionWordsRef.current : currentWordsRef.current;
  const tempMasteredWordsSet = tempMasteredWordsRef.current || new Set();
  
  console.log('📊 Scores de test finaux:', JSON.stringify(currentTestScores, null, 2));
  console.log('🎯 Mots temporairement maîtrisés:', Array.from(tempMasteredWordsSet));
  
  try {
    // Nettoyer les sessions temporaires
    const storageKeysToClean = [
      `${languageCode}-${category}-inProgress`,
      `${languageCode}-${category}-temp`,
      `${languageCode}-${category}-session`
    ];
    
    storageKeysToClean.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🧹 Session temporaire nettoyée: ${key}`);
    });

    // IDENTIFIER les mots RÉELLEMENT maîtrisés selon les scores finaux
    const definitiveMasteredWords: string[] = [];
    const masteredWordsData: LearnedWord[] = [];
    
    Object.entries(currentTestScores).forEach(([word, score]) => {
      if (score >= TESTS_PER_WORD) {
        const cleanWord = cleanParentheses(word);
        definitiveMasteredWords.push(cleanWord);
        
        const wordData = currentWordsData.find(([w]) => w === word)?.[1];
        if (wordData) {
          masteredWordsData.push({
            word: cleanWord,
            category: category,
            subcategory: subcategory || '',
            language: languageCode,
            timestamp: Date.now(),
            audio: wordData.audio || '',
            translation: wordData.translation || '',
            explanation: wordData.explanation || '',
            example: wordData.example || ''
          });
        }
      }
    });
    
    if (definitiveMasteredWords.length > 0) {
      console.log('💾 SAUVEGARDE UNIFIÉE des mots maîtrisés:', definitiveMasteredWords);
      

       playSummaryAudio();
      // 🔧 Sauvegarder dans la catégorie spécifique (localStorage)
      const categoryLearnedWords = saveCategoryLearnedWords(category, definitiveMasteredWords);
      
      // Ajouter aux références définitives EN MÉMOIRE
      definitiveMasteredWords.forEach(word => {
        learnedWordsRef.current.add(word);
        userProgress.learnedWords.add(word);
        console.log(`✅ Mot définitivement appris dans ${category}: ${word}`);
      });
      
      // Préparer la progression finale
      const finalProgress: UserProgress = {
        ...userProgress,
        learnedWords: new Set([
          ...Array.from(userProgress.learnedWords),
          ...definitiveMasteredWords
        ]),
        recentlyLearnedWords: [
          ...userProgress.recentlyLearnedWords,
          ...masteredWordsData
        ]
      };
      
      // ✅ NOUVEAU: Préparer les données spécifiques LearnMode (comme GrammarMode)
      const learnSpecificData = {
        category: category,
        subcategory: subcategory || '',
        masteredWords: masteredWordsData.map(word => ({
          word: word.word,
          data: {
            translation: word.translation,
            explanation: word.explanation,
            example: word.example,
            audio: word.audio
          },
          category: word.category,
          subcategory: word.subcategory,
          timestamp: word.timestamp
        })),
        date: Date.now(),
        totalScore: Object.values(currentTestScores).reduce((sum: number, score: number) => sum + score, 0),
        maxScore: Object.keys(currentTestScores).length * TESTS_PER_WORD,
        xpGained: definitiveMasteredWords.length * XP_PER_WORD
      };
      
      // ✅ SAUVEGARDE UNIFIÉE avec données spécifiques LearnMode
      if (saveProgressOnSummary) {
        console.log('💾 EXÉCUTION de la sauvegarde UNIFIÉE (locale + Google Drive)...');
        
        const totalScore = Object.values(currentTestScores).reduce((sum: number, score: number) => {
          return sum + score;
        }, 0);
        
        const maxScore = Object.keys(currentTestScores).length * TESTS_PER_WORD;
        const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
        
       await saveProgressOnSummary(finalProgress, {
  mode: 'learn',
  sessionStats: {
    wordsLearned: definitiveMasteredWords.length,
    totalScore: totalScore,
    maxScore: maxScore,
    accuracy: accuracy
  },
  description: `Fin de session d'apprentissage ${category} - ${definitiveMasteredWords.length} mots maîtrisés`,
  includeGoogleDrive: true, // ✅ Important
  learnSpecificData: {
    category: category,
    subcategory: subcategory || '',
    masteredWords: masteredWordsData.map(w => ({
      word: w.word,
      data: {
        translation: w.translation,
        explanation: w.explanation,
        example: w.example,
        audio: w.audio || ''
      },
      category: w.category,
      subcategory: w.subcategory,
      timestamp: w.timestamp
    })),
    date: Date.now(),
    totalScore: totalScore,
    maxScore: maxScore,
    xpGained: definitiveMasteredWords.length * 10
  }
});

        
        console.log('✅ Sauvegarde UNIFIÉE terminée (locale + Google Drive avec données spécifiques)');
      } else {
        console.warn('⚠️ saveProgressOnSummary non disponible - pas de sauvegarde');
      }
      
      // ENVOI DES MOTS VERS LA RÉVISION
      console.log('📤 Envoi des mots maîtrisés vers la révision...');
      
      try {
        onWordsLearned(masteredWordsData);
        console.log('✅ Mots envoyés vers la révision avec succès');
        
        // Faire tous les appels updateProgress/onWordLearned à la fin
        Object.entries(currentTestScores).forEach(([word, score]) => {
          const wordData = currentWordsData.find(([w]) => w === word)?.[1];
          if (wordData) {
            for (let i = 0; i < score; i++) {
              updateProgress(word, true, subcategory);
              onAnswer?.(true);
            }
            if (score >= TESTS_PER_WORD) {
              onWordLearned(word, true);
              console.log(`📤 onWordLearned appelé pour: ${word}`);
            }
          }
        });
        
      } catch (revisionError) {
        console.error('❌ Erreur lors de l\'envoi vers la révision:', revisionError);
      }
      
      // ✅ Mise à jour des statistiques globales optionnelle
      try {
        const globalStatsKey = `${languageCode}-category-stats`;
        let globalStats: Record<string, number> = {};
        const savedGlobalStats = localStorage.getItem(globalStatsKey);
        
        if (savedGlobalStats) {
          globalStats = JSON.parse(savedGlobalStats);
        }
        
        globalStats[category] = categoryLearnedWords.length;
        localStorage.setItem(globalStatsKey, JSON.stringify(globalStats));
        console.log('📊 Statistiques globales mises à jour:', globalStats);
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour des statistiques:', error);
      }
    } else {
      console.log('📭 Aucun mot maîtrisé à sauvegarder définitivement');
    }
    
    console.log('🔄 Les mots non maîtrisés restent disponibles pour les prochaines sessions');
    
    // Nettoyer explicitement la clé des mots en attente
    const pendingWordsKey = `${languageCode}-${category}-pendingWords`;
    localStorage.removeItem(pendingWordsKey);
    console.log('🧹 Nettoyage de la clé pendingWords');
    
    // Nettoyer les mots temporaires
    setTempMasteredWords(new Set());
    console.log('🧹 Mots temporaires nettoyés');
    
    // Marquer la sauvegarde comme terminée
    setSaveCompleted(true);
    setIsProcessingSummary(false);
    
    console.log('💡 RÉSUMÉ PRÊT À ÊTRE AFFICHÉ - Sauvegarde unifiée terminée');
    
  } catch (error) {
    console.error('❌ Erreur dans handleSummaryComplete:', error);
    setIsProcessingSummary(false);
  }
  
  console.log('=== ✅ LEARNMODE - FIN SAUVEGARDE CENTRALISÉE ===');
}, [
  category,
  languageCode,
  subcategory,
  onWordsLearned,
  saveProgressOnSummary,
  updateProgress,
  onAnswer,
  onWordLearned,
  saveCategoryLearnedWords,
  playSummaryAudio
]);

useEffect(() => {
  const handleLearnProgressSynced = (event: CustomEvent) => {
    const { sessions, language, totalSessions, source } = event.detail;
    
    console.log('📚 LEARNMODE - Événement learnProgressSynced reçu:', {
      language,
      totalSessions,
      source,
      currentLanguage: languageCode
    });
    
    if (language === languageCode) {
      console.log(`📚 LEARNMODE - Traitement ${totalSessions} sessions pour ${language}`);
      
      // Créer un map pour grouper les mots par catégorie
      const wordsByCategory: Record<string, string[]> = {};
      
      sessions.forEach((session: any, sessionIndex: number) => {
        console.log(`📝 LEARNMODE - Session ${sessionIndex + 1}: ${session.category} (${session.masteredWords?.length || 0} mots)`);
        
        if (session.masteredWords && Array.isArray(session.masteredWords)) {
          const categoryName = session.category;
          if (!wordsByCategory[categoryName]) {
            wordsByCategory[categoryName] = [];
          }
          
          session.masteredWords.forEach((wordData: any) => {
            if (wordData.word && typeof wordData.word === 'string') {
              const cleanWord = cleanParentheses(wordData.word);
              if (!wordsByCategory[categoryName].includes(cleanWord)) {
                wordsByCategory[categoryName].push(cleanWord);
              }
            }
          });
        }
      });
      
      // Sauvegarder chaque catégorie dans localStorage
      Object.entries(wordsByCategory).forEach(([categoryName, words]) => {
        const categoryKey = `${language}-${categoryName}-learnedWords`;
        
        // Fusionner avec les mots existants
        const existingWords = localStorage.getItem(categoryKey);
        const existingWordsArray = existingWords ? JSON.parse(existingWords) : [];
        
        const mergedWords = [...new Set([...existingWordsArray, ...words])];
        localStorage.setItem(categoryKey, JSON.stringify(mergedWords));
        
        console.log(`📁 LEARNMODE - Catégorie ${categoryName}: ${mergedWords.length} mots sauvés`);
        
        // Si c'est la catégorie actuelle, mettre à jour l'état
        if (categoryName === category) {
          const categoryLearnedWords = new Set(mergedWords);
          // Mettre à jour learnedWordsRef si nécessaire
          mergedWords.forEach(word => {
            learnedWordsRef.current.add(word);
          });
          console.log(`✅ LEARNMODE - Catégorie actuelle ${category} mise à jour avec ${mergedWords.length} mots`);
        }
      });
      
      console.log(`📊 LEARNMODE - Synchronisation terminée: ${Object.keys(wordsByCategory).length} catégories traitées`);
    }
  };

  window.addEventListener('learnProgressSynced', handleLearnProgressSynced as EventListener);
  
  return () => {
    window.removeEventListener('learnProgressSynced', handleLearnProgressSynced as EventListener);
  };
}, [languageCode, category]);




  // useEffect dédié pour déclencher la sauvegarde une seule fois
  useEffect(() => {
    if (shouldSave && mode === 'summary' && !saveCompleted && !isProcessingSummary) {
      console.log('🚀 Déclenchement de la sauvegarde du résumé...');
      setIsProcessingSummary(true);
      
      const performSave = async () => {
        try {
          await handleSummaryComplete();
          setShouldSave(false);
        } catch (error) {
          console.error('❌ Erreur lors de la sauvegarde:', error);
          setIsProcessingSummary(false);
        }
      };
      
      performSave();
    }
  }, [shouldSave, mode, saveCompleted, isProcessingSummary, handleSummaryComplete]);

  // ✅ MODIFIÉ : handleAnswer simplifié sans feedback
  const handleAnswer = useCallback((answer: string) => {
    if (mode !== 'test' || testQueue.length === 0) return;

    const currentWord = testQueue[0];
    const wordData = currentWords.find(([word]) => word === currentWord)?.[1];
    if (!wordData) return;

    const displayWord = cleanParentheses(currentWord);
    const isCorrect = answer === wordData.translation;
    
    // ✅ GARDER : Code couleur sur les boutons
    setSelectedAnswer(answer);

    console.log('------- Word Learning Progress -------');
    console.log('Word:', displayWord, '(Key:', currentWord, ')');
    console.log('Previous score:', (testScoresRef.current[currentWord] || 0), '/', TESTS_PER_WORD);

    // CALCULER les nouveaux scores dans la REF SEULEMENT
    if (isCorrect) {
      const newScore = (testScoresRef.current[currentWord] || 0) + 1;
      testScoresRef.current[currentWord] = newScore;
      console.log('✅ Correct answer - New score:', newScore, '/', TESTS_PER_WORD);
      
      if (newScore >= TESTS_PER_WORD) {
        console.log('🎯 Word TEMPORARILY mastered (sauvegarde au résumé)');
        
        const cleanWord = cleanParentheses(currentWord);
        const currentTempMastered = tempMasteredWordsRef.current || new Set();
        currentTempMastered.add(cleanWord);
        tempMasteredWordsRef.current = currentTempMastered;
        console.log('⏳ Ajouté aux mots temporairement maîtrisés (ref):', cleanWord);
      }
    } else {
      console.log('❌ Incorrect answer - score remains:', (testScoresRef.current[currentWord] || 0));
    }
    console.log('--------------------------------');

    // ✅ SIMPLIFIER : Délai réduit et nettoyage simplifié
    setTimeout(() => {
      setSelectedAnswer(null); // Nettoyer seulement la sélection
      
      const newQueue = testQueue.slice(1);
      
      if (newQueue.length === 0) {
        // FIN DU TEST
        console.log('🏁 Test terminé - Synchronisation des scores pour le résumé');
        setTestScores({ ...testScoresRef.current });
        setMode('summary');
        
        // Marquer qu'une sauvegarde doit avoir lieu
        setShouldSave(true);
        setSaveCompleted(false);
        setIsProcessingSummary(false);
      } else {
        // QUESTION SUIVANTE
        console.log('➡️ Passage à la question suivante...');
        setTestQueue(newQueue);
        
        const nextWord = newQueue[0];
        const newOptions = generateStableOptions(nextWord, currentWords);
        setStableOptions(newOptions);

        const nextWordData = currentWords.find(([word]) => word === nextWord)?.[1];
        if (nextWordData?.audio) {
          playWord(nextWordData.audio).catch(console.error);
        }
      }
    }, 1000); // ✅ RÉDUIT : 1 seconde au lieu de 1.5
  }, [
    mode,
    testQueue,
    currentWords,
    generateStableOptions,
    playWord
  ]);

  const handleExitConfirm = useCallback(() => {
    console.log('🚪 Confirmation de sortie - ABANDON COMPLET sans sauvegarde');
    
    setShowExitConfirmation(false);
    
    // Nettoyage complet sans aucune sauvegarde
    const tempMasteredWordsSet = tempMasteredWordsRef.current || new Set();
    console.log('🧹 Nettoyage des mots temporaires...', Array.from(tempMasteredWordsSet));
    
    // Nettoyer userProgress des mots temporaires
    tempMasteredWordsSet.forEach(word => {
      const cleanWord = cleanParentheses(word);
      const variations = [word, cleanWord, word.toLowerCase(), cleanWord.toLowerCase()];
      
      variations.forEach(variant => {
        if (userProgress.learnedWords.has(variant)) {
          if (!learnedWordsRef.current.has(variant)) {
            userProgress.learnedWords.delete(variant);
            console.log(`❌ Supprimé de userProgress (temporaire): ${variant}`);
          }
        }
      });
    });
    
    // Supprimer les sessions temporaires
    const storageKeys = [
      `${languageCode}-${category}-inProgress`,
      `${languageCode}-${category}-sessionLearned`,
      `${languageCode}-${category}-temp`,
      `${languageCode}-${category}-pendingWords`,
      `${languageCode}-${category}-session`,
      `${languageCode}-${category}-progress`
    ];
    
    storageKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`🗑️ Supprimé: ${key}`);
    });
    
    // Réinitialiser les états
    setMode('preview');
    setCurrentWords([]);
    setCurrentWordIndex(0);
    setTestQueue([]);
    setTestScores({});
    setSelectedAnswer(null);
    setStableOptions([]);
    setSessionLearnedWords(new Set());
    setTempMasteredWords(new Set());
    setShouldSave(false);
    setSaveCompleted(false);
    setIsProcessingSummary(false);
    setShowXPAnimation(false);
    setXpGained(0);
    sessionStartedRef.current = false;
    sessionWordsRef.current = [];
    tempMasteredWordsRef.current = new Set();
    
    // ✅ NOUVEAU : Reset des états du résumé
    resetSummaryState();
    
    console.log('🎯 Session annulée - AUCUNE sauvegarde effectuée');
    
    if (onBackToCategories) {
      onBackToCategories();
    }
  }, [
    languageCode, 
    category, 
    onBackToCategories, 
    userProgress.learnedWords,
    resetSummaryState
  ]);

  const handleBackButton = useCallback(() => {
    console.log('Bouton retour pressé. Mode actuel:', mode);
    
    if (mode === 'summary' || isLessonComplete) {
      console.log('Mode summary/complète - retour direct aux catégories');
      
      // ✅ NOUVEAU : Réinitialiser les états du résumé lors de la sortie
      resetSummaryState();
      
      if (onBackToCategories) {
        onBackToCategories();
      }
      return;
    }
    
    if (currentWords.length > 0) {
      console.log('Session en cours - affichage de la confirmation de sortie');
      setShowExitConfirmation(true);
    } else {
      console.log('Aucun mot chargé - retour direct aux catégories');
      if (onBackToCategories) {
        onBackToCategories();
      }
    }
  }, [mode, isLessonComplete, currentWords.length, onBackToCategories, resetSummaryState]);

  // 🔧 MODIFIÉ : allWords useMemo avec stockage par catégorie
  const allWords = useMemo(() => {
    // PROTECTION : Si une session est active, ne pas recalculer
    if (sessionStartedRef.current || mode === 'test' || mode === 'summary') {
      console.log('🔒 Session active ou résumé - pas de recalcul de allWords');
      return [];
    }

    let categoryData: Record<string, WordData> = {};
    
    if (words && subcategory && words[subcategory]) {
      categoryData = words[subcategory];
    } else {
      categoryData = (languageData.categories[category] || {}) as Record<string, WordData>;
    }

    console.log('Loading words from category:', category);
    
    // 🔧 NOUVEAU : Charger seulement les mots appris de CETTE catégorie
    const categoryLearnedWords = getCategoryLearnedWords(category);
    console.log(`Mots appris dans ${category}:`, Array.from(categoryLearnedWords));

    const entries = Object.entries(categoryData).filter(([word]) => {
      if (!word) return false;
      if (word.includes('_')) return false;
      
      const cleanWord = word.split('(')[0].trim();
      const isLearnedInThisCategory = categoryLearnedWords.has(cleanWord) || categoryLearnedWords.has(word);
      
      console.log(`Filtrage du mot ${word} dans ${category}: ${isLearnedInThisCategory ? 'déjà appris' : 'à apprendre'}`);
      return !isLearnedInThisCategory;
    });

    console.log('Filtered words to learn:', entries);
    return entries;
  }, [
    category, 
    languageData.categories, 
    words, 
    subcategory, 
    mode,
    getCategoryLearnedWords
  ]);

  const getRemainingWords = useCallback((newLearnedWords: string[] = []): [string, WordData][] => {
    // 🔧 MODIFIÉ : Utiliser les mots appris de la catégorie + les nouveaux
    const categoryLearnedWords = getCategoryLearnedWords(category);
    const learnedWordsSet = new Set([
      ...Array.from(categoryLearnedWords),
      ...Array.from(tempMasteredWords),
      ...newLearnedWords.map(word => cleanParentheses(word))
    ]);
    
    return allWords.filter(([word]) => {
      const cleanWord = cleanParentheses(word);
      return !learnedWordsSet.has(cleanWord) && !learnedWordsSet.has(word);
    });
  }, [allWords, category, getCategoryLearnedWords, tempMasteredWords]);

  const loadNextWords = useCallback((newLearnedWords: string[] = []) => {
    const storageKey = `${languageCode}-${category}-inProgress`;
    const pendingWordsKey = `${languageCode}-${category}-pendingWords`;
    
    console.log('🔍 loadNextWords appelé');
    console.log('📚 Chargement de nouveaux mots (mots incomplets ignorés)...');
    
    const savedProgress = localStorage.getItem(storageKey);
    
    // Charger session uniquement si elle est récente et valide
    if (savedProgress) {
      try {
        const { 
          words, 
          scores, 
          timestamp, 
          mode: savedMode = 'preview',
          currentIndex = 0 
        } = JSON.parse(savedProgress);

        // Session récente (moins de 24h)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          let categoryData: Record<string, WordData> = {};
          
          if (words && subcategory && words[subcategory]) {
            categoryData = words[subcategory];
          } else {
            categoryData = (languageData.categories[category] || {}) as Record<string, WordData>;
          }

          const restoredWords = words.map((word: string) => [
            word,
            categoryData[word]
          ] as [string, WordData]);

          setCurrentWords(restoredWords);
          setTestScores(scores);
          setMode(savedMode);
          setCurrentWordIndex(currentIndex);

          if (savedMode === 'test') {
            const queue = restoredWords.flatMap(([word]: [string, WordData]) =>
              Array(TESTS_PER_WORD - (scores[word] || 0)).fill(word)
            );
            const shuffledQueue: string[] = shuffleArray(queue) as string[];
            setTestQueue(shuffledQueue);
            
            if (shuffledQueue.length > 0) {
              const firstWord = shuffledQueue[0];
              const options = generateStableOptions(firstWord, restoredWords);
              setStableOptions(options);
            }
          }

          localStorage.removeItem(storageKey);
          return;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des mots en cours:', error);
      }
    }

    // Charger de nouveaux mots
    const remainingWords = getRemainingWords(newLearnedWords);
    const nextWords = remainingWords.slice(0, WORDS_PER_LESSON);

    if (nextWords.length > 0) {
      console.log('📚 Chargement de nouveaux mots:', nextWords.map(([w]) => w));
      
      setCurrentWords(nextWords);
      setCurrentWordIndex(0);
      setMode('preview');
      const initialScores = Object.fromEntries(nextWords.map(([word]) => [word, 0]));
      setTestScores(initialScores);
      testScoresRef.current = initialScores;
      setTestQueue([]);
      setStableOptions([]);
      setIsLessonComplete(false);
      setTempMasteredWords(new Set());
      setShouldSave(false);
      setSaveCompleted(false);
      setIsProcessingSummary(false);
      setShowXPAnimation(false);
      setXpGained(0);
      sessionStartedRef.current = false;
      sessionWordsRef.current = [];
      tempMasteredWordsRef.current = new Set();
      
      // ✅ NOUVEAU : Reset des états du résumé
      resetSummaryState();
      
      const newSession = {
        words: nextWords.map(([word]) => word),
        scores: {},
        timestamp: Date.now(),
        mode: 'preview',
        currentIndex: 0
      };
      localStorage.setItem(storageKey, JSON.stringify(newSession));
    } else {
      setIsLessonComplete(true);
    }
  }, [
    languageCode, 
    category, 
    subcategory,
    words,
    getRemainingWords, 
    languageData.categories,
    generateStableOptions,
    resetSummaryState
  ]);

  const handleStartNewSession = useCallback(() => {
    console.log('🆕 Démarrage d\'une nouvelle session');
    
    // FORCER LA RÉINITIALISATION COMPLÈTE DES ÉTATS
    console.log('🔄 Réinitialisation forcée de tous les états...');
    
    // ✅ NOUVEAU : Réinitialiser les états du résumé
    resetSummaryState();
    
    // 1. Réinitialiser tous les états liés aux mots
    setCurrentWords([]);
    setCurrentWordIndex(0);
    setTestQueue([]);
    setTestScores({});
    setSelectedAnswer(null);
    setStableOptions([]);
    
    // 2. Réinitialiser les états de session
    setSessionLearnedWords(new Set());
    setTempMasteredWords(new Set());
    
    // 3. Réinitialiser les états de sauvegarde (déjà fait dans resetSummaryState)
    
    // 4. Réinitialiser les états d'animation XP (déjà fait dans resetSummaryState)
    
    // 5. Réinitialiser les références
    sessionStartedRef.current = false;
    sessionWordsRef.current = [];
    tempMasteredWordsRef.current = new Set();
    testScoresRef.current = {};
    
    // 6. Forcer le mode preview AVANT de charger les nouveaux mots
    console.log('🔄 Passage en mode preview...');
    setMode('preview');
    
    // 7. Attendre que le changement de mode soit appliqué
    setTimeout(() => {
      console.log('🔄 Chargement des nouveaux mots...');
      loadNextWords();
    }, 100);
    
  }, [loadNextWords, resetSummaryState]);

  const handleGameComplete = useCallback(() => {
    console.log('🏁 Terminaison de la catégorie');
    
    // ✅ NOUVEAU : Réinitialiser les états du résumé
    resetSummaryState();
    
    // Appeler la fonction de completion qui navigue vers les catégories
    if (onGameComplete) {
      onGameComplete();
    }
  }, [onGameComplete, resetSummaryState]);

  useEffect(() => {
    loadNextWords();
  }, [loadNextWords, resetToken]);

  // Nettoyage lors du changement de testQueue
  useEffect(() => {
    if (testQueue.length > 0) {
      setSelectedAnswer(null);
    }
  }, [testQueue]);

  // Effets de sauvegarde simplifiés
  useEffect(() => {
    if (mode === 'preview' && currentWords.length > 0) {
      // Sauvegarder uniquement l'état de navigation, pas les mots appris
      const dataToSave = {
        words: currentWords.map(([word]) => word),
        scores: {},
        timestamp: Date.now(),
        mode: mode,
        currentIndex: currentWordIndex
      };
      const storageKey = `${languageCode}-${category}-inProgress`;
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [mode, currentWords, currentWordIndex, languageCode, category]);

  useEffect(() => {
    if (mode === 'preview' && currentWords[currentWordIndex]) {
      const [, { audio }] = currentWords[currentWordIndex];
      if (audio) {
        playWord(audio).catch(console.error);
      }
    }
  }, [mode, currentWordIndex, currentWords, playWord]);

  useEffect(() => {
    setSessionLearnedWords(new Set());
    setTempMasteredWords(new Set());
  }, [category, subcategory]);

  // Calculer les valeurs du résumé
  const currentTestScores = testScoresRef.current;
  const totalScore = Object.values(currentTestScores).reduce((sum: number, score: number) => {
    return sum + score;
  }, 0);
  const maxScore = Object.keys(currentTestScores).length * TESTS_PER_WORD;
  const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  
  // Calculer remainingWords correctement pour le résumé
  const masteredWordsInSession = Object.entries(currentTestScores)
    .filter(([_, score]) => score >= TESTS_PER_WORD)
    .map(([word, _]) => cleanParentheses(word));
  
  // 🔧 MODIFIÉ : Calculer le nombre de mots restants avec stockage par catégorie
  let categoryData: Record<string, WordData> = {};
  if (words && subcategory && words[subcategory]) {
    categoryData = words[subcategory];
  } else {
    categoryData = (languageData.categories[category] || {}) as Record<string, WordData>;
  }
  
  // Tous les mots de la catégorie
  const allCategoryWords = Object.keys(categoryData).filter(word => 
    word && !word.includes('_')
  );
  
  // Mots déjà appris avant cette session (dans cette catégorie uniquement)
  const categoryLearnedWords = getCategoryLearnedWords(category);
  const previouslyLearnedWords = Array.from(categoryLearnedWords);
  
  // Mots appris dans cette session
  const newlyLearnedWords = masteredWordsInSession;
  
  // Calculer les mots restants
  const allLearnedWords = [...previouslyLearnedWords, ...newlyLearnedWords];
  const remainingWords = allCategoryWords.filter(word => {
    const cleanWord = cleanParentheses(word);
    return !allLearnedWords.some(learned => 
      cleanParentheses(learned) === cleanWord || learned === word
    );
  }).length;

  // Compter les mots réellement maîtrisés (score = 3/3)
  const masteredWordsCount = Object.values(currentTestScores).filter(score => score >= TESTS_PER_WORD).length;

  // Calculer l'XP gagné
  const totalXPGained = masteredWordsCount * XP_PER_WORD;

  // ✅ Interface - Mode résumé EN PREMIER POUR CORRIGER L'AFFICHAGE
  if (mode === 'summary') {
    return (
      <div className={`learn-mode-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
        {/* Header */}
        <AdaptiveBackButton 
          onBack={handleBackButton}
          isMobileView={isMobileView}
          title={isMobileView ? category : undefined}
        />
        
        {!isMobileView && (
          <div className="learn-mode-header">
            <h2>{category}</h2>
          </div>
        )}
        
        <h2 className="learn-mode-summary-title">📊 Résumé de session</h2>
        
        {/* ✅ NOUVEAU : Affichage conditionnel selon l'étape */}
        {summaryStep === 'results' && (
          <>
            {/* Indicateur de sauvegarde */}
            {isProcessingSummary && !saveCompleted && (
              <div className="learn-mode-saving-indicator">
                <div className="loading-spinner"></div>
                <span>Sauvegarde en cours...</span>
              </div>
            )}
            
            {saveCompleted && (
              <div className="learn-mode-save-success">
                <CheckCircle className="icon-success" />
                <span>Progression sauvegardée dans {category} !</span>
              </div>
            )}
            
            {/* Statistiques de session */}
            <div className="learn-mode-summary-score">
              <p>Score total : {totalScore}/{maxScore}</p>
              <div className="learn-mode-progress-bar">
                <div 
                  className="learn-mode-progress-fill"
                  style={{ width: `${(totalScore / maxScore) * 100}%` }}
                />
              </div>
              <p>Précision : {accuracy}%</p>
              <p>Mots maîtrisés : {masteredWordsCount}/{Object.keys(currentTestScores).length}</p>
            </div>

            {/* Détail des mots */}
            <div className="learn-mode-summary-words">
              {/* Mots maîtrisés */}
              {masteredWordsCount > 0 && (
                <>
                  <h3>🎉 Mots maîtrisés :</h3>
                  {Object.entries(currentTestScores)
                    .filter(([_, score]) => score >= TESTS_PER_WORD)
                    .map(([word, score]) => (
                      <div key={word} className="learn-mode-summary-word mastered">
                        <span>{cleanParentheses(word)}</span>
                        <div className="learn-mode-word-score">
                          <span>{score}/{TESTS_PER_WORD}</span>
                          <CheckCircle className="icon-success" />
                        </div>
                      </div>
                    ))
                  }
                </>
              )}
              
              {/* Mots non maîtrisés */}
              {Object.entries(currentTestScores).filter(([_, score]) => score < TESTS_PER_WORD).length > 0 && (
                <>
                  <h3>📚 À revoir :</h3>
                  {Object.entries(currentTestScores)
                    .filter(([_, score]) => score < TESTS_PER_WORD)
                    .map(([word, score]) => (
                      <div key={word} className="learn-mode-summary-word not-mastered">
                        <span>{cleanParentheses(word)}</span>
                        <div className="learn-mode-word-score">
                          <span>{score}/{TESTS_PER_WORD}</span>
                          <XCircle className="icon-error" />
                        </div>
                      </div>
                    ))
                  }
                </>
              )}
            </div>

            {/* ✅ NOUVEAU : Bouton pour passer à l'XP */}
            {saveCompleted && (
              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <motion.button
                  onClick={handleShowXP}
                  className="learn-mode-next-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: totalXPGained > 0 
                      ? 'linear-gradient(45deg, #f59e0b, #d97706)' 
                      : 'linear-gradient(45deg, #6b7280, #4b5563)',
                    color: 'white',
                    border: '2px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    margin: '0 auto',
                    minWidth: '280px',
                    boxShadow: '0px 4px 12px rgba(245, 158, 11, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {totalXPGained > 0 ? (
                    <>
                      <span>Voir mes récompenses XP</span>
                      <span style={{ fontSize: '18px' }}>🏆</span>
                    </>
                  ) : (
                    <>
                      <span>Terminer la session</span>
                    </>
                  )}
                </motion.button>
                
                {totalXPGained > 0 && (
                  <div style={{
                    marginTop: '12px',
                    fontSize: '14px',
                    color: theme === 'dark' ? '#94a3b8' : '#64748b',
                    fontStyle: 'italic'
                  }}>
                    🎉 Vous avez gagné {totalXPGained} XP dans cette session !
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ✅ NOUVEAU : Étape XP */}
        {summaryStep === 'xp' && (
          <>
            {/* Animation XP */}
            <XPAnimation
              xpGained={xpGained}
              showAnimation={showXPAnimation}
              onAnimationComplete={() => {
                // Animation terminée
              }}
              variant="large"
              className="success pulse"
            />
            
            {/* Résumé XP détaillé */}
            {totalXPGained > 0 && (
              <div className="xp-summary" style={{
                marginTop: '20px',
                padding: '20px',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#f0f9ff',
                borderRadius: '16px',
                border: '3px solid #3b82f6',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
              }}>
                <div style={{
                  fontSize: '2em',
                  fontWeight: '800',
                  color: theme === 'dark' ? '#60a5fa' : '#1e40af',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  🏆 <strong>+{totalXPGained} XP</strong>
                </div>
                <div style={{
                  fontSize: '1.1em',
                  color: theme === 'dark' ? '#94a3b8' : '#64748b',
                  marginBottom: '16px'
                }}>
                  {XP_PER_WORD} XP × {masteredWordsCount} mot{masteredWordsCount > 1 ? 's' : ''} maîtrisé{masteredWordsCount > 1 ? 's' : ''}
                </div>
                
                {/* Détail des mots avec XP */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginTop: '20px'
                }}>
                  {Object.entries(currentTestScores)
                    .filter(([_, score]) => score >= TESTS_PER_WORD)
                    .map(([word, score]) => (
                      <div key={word} style={{
                        padding: '12px',
                        backgroundColor: theme === 'dark' ? '#334155' : '#e0f2fe',
                        borderRadius: '12px',
                        border: `2px solid ${theme === 'dark' ? '#475569' : '#0891b2'}`,
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: theme === 'dark' ? '#f8fafc' : '#0c4a6e',
                          marginBottom: '4px'
                        }}>
                          {cleanParentheses(word)}
                        </div>
                        <div style={{
                          fontSize: '0.9em',
                          color: '#10b981',
                          fontWeight: '700'
                        }}>
                          +{XP_PER_WORD} XP
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions finales */}
            <div className="learn-mode-summary-actions" style={{ marginTop: '32px' }}>
              {remainingWords > 0 ? (
                <motion.button
                  onClick={() => {
                    resetSummaryState();
                    handleStartNewSession();
                  }}
                  className="learn-mode-next-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Nouvelle session ({remainingWords} mots restants dans {category})
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => {
                    resetSummaryState();
                    handleGameComplete();
                  }}
                  className="learn-mode-complete-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Terminer la catégorie {category}
                </motion.button>
              )}
              
              <motion.button
                onClick={() => {
                  resetSummaryState();
                  if (onBackToCategories) {
                    onBackToCategories();
                  }
                }}
                className="learn-mode-back-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ 
                  marginTop: '12px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                Retour aux catégories
              </motion.button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Interface - Leçon complète
  if (isLessonComplete) {
    return (
      <div className={`learn-mode-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="completion-container"
        >
          <h2 className="learn-mode-complete-title">
            Félicitations ! Vous avez terminé toutes les leçons de la catégorie {category}.
          </h2>
          
          <motion.button
            onClick={onBackToCategories}
            className="learn-mode-back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowLeft size={20} />
            <span>Retour aux catégories</span>
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Interface principale - Mode preview et test
  return (
    <div className={`learn-mode-container ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {/* ✅ MODIFIÉ: Bouton flottant + header séparé en mobile */}
      <AdaptiveBackButton 
        onBack={handleBackButton}
        isMobileView={isMobileView}
        title={isMobileView ? category : undefined}
      />
      
      {/* Header desktop uniquement */}
      {!isMobileView && (
        <div className="learn-mode-header">
          <h2>{category}</h2>
        </div>
      )}
      
      {/* Mode preview */}
      {mode === "preview" && (
        <div className="learn-mode-main">
          <div className="learn-mode-word">
            <h3>{cleanParentheses(currentWords[currentWordIndex]?.[0])}</h3>

            {currentWords[currentWordIndex]?.[1].illustration && (
              <div className="learn-mode-illustration">
                {currentWords[currentWordIndex][1].illustration}
              </div>
            )}
            
            <p className="learn-mode-translation">
              {currentWords[currentWordIndex]?.[1].translation}
            </p>
            
            {currentWords[currentWordIndex]?.[1].explanation && (
              <p className="learn-mode-explanation">
                {currentWords[currentWordIndex][1].explanation}
              </p>
            )}

            {currentWords[currentWordIndex]?.[1].example && (
              <p className="learn-mode-example">
                <strong>Exemple : </strong>
                {currentWords[currentWordIndex][1].example}
              </p>
            )}
            
            {currentWords[currentWordIndex]?.[1].audio && (
              <motion.button 
                onClick={() => playWord(currentWords[currentWordIndex][1].audio!)}
                className="learn-mode-audio-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={32} />
              </motion.button>
            )}
          </div>

          <div className="learn-mode-progress">
            <div className="learn-mode-progress-text">
              {currentWordIndex + 1}/{currentWords.length}
            </div>
            <div className="learn-mode-progress-bar">
              <div 
                className="learn-mode-progress-fill"
                style={{ width: `${((currentWordIndex + 1) / currentWords.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.button
            onClick={handleNextWord}
            className="learn-mode-next-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentWordIndex === currentWords.length - 1 ? "Commencer le test" : "Suivant"}
          </motion.button>
        </div>
      )} 

      {/* Mode test */}
      {mode === "test" && (
        <div className="learn-mode-test">
          <div className="learn-mode-test-info">
            <div className="w-12 h-12">
              <ProgressPie 
                progress={(testScoresRef.current[testQueue[0]] || 0) / TESTS_PER_WORD} 
                size={48} 
              />
            </div>
            <span>{testQueue.length} questions restantes</span>
          </div>
          
          <div className="learn-mode-question">
            <h3>{cleanParentheses(testQueue[0])}</h3>

            <p>Quelle est la traduction ?</p>
            
            {/* Bouton audio pour entendre le mot */}
            {currentWords.find(([word]) => word === testQueue[0])?.[1].audio && (
              <motion.button 
                onClick={() => playWord(currentWords.find(([word]) => word === testQueue[0])?.[1].audio!)}
                className="learn-mode-audio-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{ margin: '10px auto' }}
              >
                <Volume2 size={24} />
              </motion.button>
            )}
          </div>
          
          {/* ✅ MODIFIÉ : Boutons avec code couleur seulement */}
          <div className="learn-mode-options">
            {stableOptions.map((option, index) => (
              <motion.button
                key={`${option}-${index}`}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`learn-mode-option ${
                  selectedAnswer === option ? 'selected' : ''
                } ${
                  selectedAnswer && option === currentWords.find(([word]) => word === testQueue[0])?.[1].translation 
                    ? 'correct' 
                    : ''
                } ${
                  selectedAnswer && selectedAnswer === option && 
                  option !== currentWords.find(([word]) => word === testQueue[0])?.[1].translation 
                    ? 'incorrect' 
                    : ''
                }`}
                whileHover={!selectedAnswer ? { scale: 1.02 } : undefined}
                whileTap={!selectedAnswer ? { scale: 0.98 } : undefined}
              >
                {option}
              </motion.button>
            ))}
          </div>
          
          {/* ✅ SUPPRIMÉ : Section feedback complètement supprimée */}
        </div>
      )}
      
      {/* Boîte de dialogue de confirmation de sortie */}
      <ConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={handleExitConfirm}
        onCancel={() => setShowExitConfirmation(false)}
        message="Attention ! Si vous quittez maintenant, votre progression dans cette leçon ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
        title="Quitter l'apprentissage ?"
        confirmText="Quitter"
        cancelText="Continuer l'apprentissage"
        confirmButtonStyle="danger"
        position="top"
      />
    </div>
  );
};

export default LearnMode;
