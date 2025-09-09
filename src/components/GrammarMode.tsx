import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Book, BookOpen, CheckCircle, Volume2, ArrowRight } from 'lucide-react';
import { getLanguageData } from '../data/languages';
import type { 
  GrammarModeProps, 
  GrammarCategory, 
  WordData, 
  GrammarItem,
  UserProgress
} from '../types/types';
import './GrammarMode.css';
import { useTheme } from './ThemeContext';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio';
import { useAudio } from '../hooks/hooks';
import XPAnimation from './XPAnimation';

import ConfirmationModal from './ConfirmationModal';
import { useSummaryAudio } from '../utils/summaryAudio';

// Constante pour les points XP
const XP_PER_GRAMMAR_RULE = 10;

interface SubcategoryCardProps {
  title: string;
  completed: boolean;
  onClick: () => void;
  count: number;
}

interface CategoryDetailsProps {
  category: string;
  rules: [string, WordData][];
  completedRules: Set<string>;
  onStartLearning: () => void;
  onBack: () => void;
  isMobileView?: boolean;
  onPlayAudio?: (audio: string) => Promise<void>;
  onExitAttempt?: (callback: () => void) => void;
  showExitConfirmation?: boolean;
  onExitConfirm?: () => void;
  onExitCancel?: () => void;
}

interface TestWord {
  word: string;
  data: WordData;
  correctAnswers: number;
  tested: number;
}

interface SessionResults {
  subcategory: string;
  masteredWords: TestWord[];
  date: number;
}

// ✅ SUPPRIMÉ: Fonctions saveProgress et loadProgress - maintenant centralisé

// Composant de bouton retour avec exit confirmation
const AdaptiveBackButton: React.FC<{
  onBack: () => void;
  isMobileView?: boolean;
  title?: string;
  onExitAttempt?: (callback: () => void) => void;
}> = ({ onBack, isMobileView = false, title, onExitAttempt }) => {
  const { theme } = useTheme();
  
  const handleBackClick = () => {
    console.log('🔄 AdaptiveBackButton clicked');
    console.log('🔄 onExitAttempt function:', typeof onExitAttempt);
    
    if (onExitAttempt) {
      console.log('🔄 Calling onExitAttempt');
      onExitAttempt(onBack);
    } else {
      console.log('🔄 No onExitAttempt, calling onBack directly');
      onBack();
    }
  };
  
  if (isMobileView) {
    return (
      <div className="grammar-header mobile-layout">
        <motion.button
          onClick={handleBackClick}
          className="mobile-header-back-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </motion.button>
        
        {title && (
          <h2 className="grammar-mobile-title">{title}</h2>
        )}
        
        <div className="grammar-header-spacer"></div>
      </div>
    );
  }
  
  return (
    <motion.button
      onClick={handleBackClick}
      className="grammar-action-button secondary"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={20} />
      <span>Retour</span>
    </motion.button>
  );
};

const hasValidAudio = (audio: string | undefined): boolean => {
  return !!audio && audio.trim() !== '';
};

const SubcategoryCard: React.FC<SubcategoryCardProps> = ({
  title,
  completed,
  onClick,
  count
}) => (
  <motion.div
    onClick={onClick}
    className="grammar-menu-item"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    style={{
      backgroundColor: completed ? '#d1fae5' : undefined,
      borderColor: completed ? '#6ee7b7' : undefined,
      color: completed ? '#059669' : undefined
    }}
  >
    <span className="grammar-menu-icon">
      {completed ? <CheckCircle size={24} /> : <Book size={24} />}
    </span>
    <span className="grammar-menu-label">{title}</span>
    <span className="grammar-menu-info">
      {count} mot{count > 1 ? 's' : ''} - {completed ? 'Complété' : 'À commencer'}
    </span>
  </motion.div>
);

const CategoryDetails: React.FC<CategoryDetailsProps> = ({
  category,
  rules,
  completedRules,
  onStartLearning,
  onBack,
  isMobileView = false,
  onPlayAudio,
  onExitAttempt,
  showExitConfirmation = false,
  onExitConfirm,
  onExitCancel
}) => {
  const categoryCompletedRules = new Set(
    Array.from(completedRules).filter(rule =>
      rules.some(([currentRule]) => currentRule === rule)
    )
  );

  const remainingRules = rules.filter(([rule]) => !categoryCompletedRules.has(rule));
  const { theme } = useTheme();
  
  return (
    <>
      <div className="grammar-category-container" data-theme={theme}>
        <div className="grammar-main-container card" data-theme={theme}>
          <div className="grammar-header">
            <AdaptiveBackButton 
              onBack={onBack} 
              isMobileView={isMobileView}
              title={isMobileView ? category : undefined}
              onExitAttempt={onExitAttempt}
            />
            {!isMobileView && <h2 className="grammar-logo-title">{category}</h2>}
          </div>
     
          <div className="grammar-level-card">
            <div className="grammar-level-info">
              <div className="grammar-badge">
                <span>{categoryCompletedRules.size}/{rules.length}</span>
              </div>
              <div className="grammar-level-text">
                <h2 className="grammar-level-title">Progression</h2>
                <p className="grammar-level-description">
                  {categoryCompletedRules.size} sur {rules.length} mots appris
                </p>
              </div>
            </div>
            
            <div className="grammar-progress-bar">
              <div 
                className="grammar-progress-fill"
                style={{ width: `${(categoryCompletedRules.size / rules.length) * 100}%` }}
              />
            </div>
          </div>

          {remainingRules.length > 0 && (
            <motion.button
              className="grammar-sticky-button"
              onClick={onStartLearning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Commencer l'apprentissage ({remainingRules.length} mots restants)
            </motion.button>
          )}

          <div className="word-list-container">
            {rules.map(([word, data]) => (
              <div 
                key={word} 
                className="word-item-card"
                style={{
                  backgroundColor: categoryCompletedRules.has(word) ? '#1c9114ff' : undefined,
                  borderColor: categoryCompletedRules.has(word) ? '#6ee7b7' : undefined
                }}
              >
                <div className="word-content">
                  <h4>{word}</h4>
                  <p>{data.translation}</p>
                  {hasValidAudio(data.audio) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayAudio && onPlayAudio(data.audio!);
                      }}
                      className="audio-button"
                      aria-label="Écouter la prononciation"
                    >
                      <Volume2 size={16} />
                    </button>
                  )}
                </div>
                {categoryCompletedRules.has(word) && (
                  <div className="word-check">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {remainingRules.length === 0 && (
            <div className="completed-message">
              <CheckCircle size={32} color="#10b981" />
              <p>Félicitations ! Vous avez maîtrisé tous les mots de cette catégorie.</p>
              <motion.button
                className="grammar-action-button secondary"
                onClick={onBack}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Retour aux catégories
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={onExitConfirm || (() => {})}
        onCancel={onExitCancel || (() => {})}
        message="Attention ! Si vous quittez maintenant, votre progression dans cette leçon ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
        title="Quitter l'apprentissage ?"
        confirmText="Quitter"
        cancelText="Continuer l'apprentissage"
        confirmButtonStyle="danger"
        position="top"
      />
    </>
  );
};

// Fonctions utilitaires
const shuffleArray = <T extends any>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Composant principal GrammarMode
const GrammarMode: React.FC<GrammarModeProps> = ({
  languageCode,
  onBackToCategories,
  onCategoryComplete,
  onWordsLearned,
  resetToken,
  isLoading = false, 
  isMobileView,
  onSessionComplete,
  saveProgressOnSummary
}) => {
  const { playWord } = useSupabaseAudio(languageCode);
  
  // États existants
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [completedRules, setCompletedRules] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'selection' | 'category-details' | 'preview' | 'test' | 'summary'>('selection');
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [learningWords, setLearningWords] = useState<[string, WordData][]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [testWords, setTestWords] = useState<TestWord[]>([]);
  const [currentTestWord, setCurrentTestWord] = useState<TestWord | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stableOptions, setStableOptions] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);
  const [testQueue, setTestQueue] = useState<Array<{word: string, data: WordData}>>([]);
  const [showContinueButton, setShowContinueButton] = useState<boolean>(false);
  const { theme } = useTheme();

  // États pour la sauvegarde automatique centralisée
  const [shouldSave, setShouldSave] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);
  const [hasSavedThisSession, setHasSavedThisSession] = useState(false);

  // États pour l'animation XP
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  
  // États pour l'exit confirmation
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingExit, setPendingExit] = useState<(() => void) | null>(null);
  
  // États pour la gestion du résumé en étapes
  const [summaryStep, setSummaryStep] = useState<'results' | 'xp'>('results');

  const currentTestWordRef = useRef<TestWord | null>(null);
  const testQueueRef = useRef<Array<{word: string, data: WordData}>>([]);
  const selectedSubcategoryRef = useRef<string | null>(null);
  const testWordsRef = useRef<TestWord[]>([]);

  const { playSummaryAudio } = useSummaryAudio();

  useEffect(() => {
    currentTestWordRef.current = currentTestWord;
  }, [currentTestWord]);

  useEffect(() => {
    testQueueRef.current = testQueue;
  }, [testQueue]);

  useEffect(() => {
    selectedSubcategoryRef.current = selectedSubcategory;
  }, [selectedSubcategory]);

  useEffect(() => {
    testWordsRef.current = testWords;
  }, [testWords]);
  
  // Effets existants
  useEffect(() => {
    const token = localStorage.getItem('googleToken');
    if (token) {
      setUser({ token });
    }
  }, []);

  const languageData = useMemo(() => {
    try {
      return getLanguageData(languageCode);
    } catch (error) {
      console.error('Error loading language data:', error);
      return null;
    }
  }, [languageCode]);

  const grammarCategories = useMemo(() => {
    if (!languageData?.categories) return {};
    try {
      return (languageData.categories['Grammaire'] || {}) as GrammarCategory;
    } catch (error) {
      console.error('Error accessing grammar categories:', error);
      return {};
    }
  }, [languageData]);

  const currentSubcategoryRules = useMemo(() => {
    if (!selectedSubcategory || !grammarCategories[selectedSubcategory]) return [];
    
    return Object.entries(grammarCategories[selectedSubcategory])
      .filter(([key]) => !key.includes('_'))
      .map(([key, value]) => {
        const grammarItem = value as GrammarItem;
        return [key, {
          translation: grammarItem.translation || grammarItem.fr || '',
          explanation: grammarItem.explanation || grammarItem.desc || '',
          example: grammarItem.example || grammarItem.examples?.[0] || '',
          audio: grammarItem.audio || undefined
        }] as [string, WordData];
      });
  }, [selectedSubcategory, grammarCategories]);
  
  // ✅ NOUVEAU : Chargement initial centralisé (localStorage seulement)
  useEffect(() => {
    const initializeProgress = async () => {
      console.log('🔄 Initialisation progression grammaire centralisée...');
      
      // Charger seulement depuis localStorage pour les spécificités grammaire
      const storageKey = `grammar-progress-${languageCode}`;
      const savedProgress = localStorage.getItem(storageKey);
      
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          const savedRules = new Set<string>();
          progress.forEach((session: SessionResults) => {
            session.masteredWords.forEach((word: TestWord) => {
              savedRules.add(word.word);
            });
          });
          setCompletedRules(savedRules);
          console.log('✅ Progression grammaire chargée depuis localStorage:', savedRules.size, 'règles');
        } catch (error) {
          console.error('❌ Erreur lors du chargement de la progression grammaire:', error);
        }
      } else {
        console.log('📝 Aucune progression grammaire trouvée, initialisation vide');
      }
    };

    initializeProgress();
  }, [languageCode, resetToken]);



  // Fonction stable pour générer les mauvaises réponses
  const generateWrongAnswers = useCallback((correctAnswer: string, allRules: [string, WordData][]): string[] => {
    const otherTranslations = allRules
      .filter(([, data]) => data.translation && data.translation !== correctAnswer)
      .map(([, data]) => data.translation);
    return shuffleArray(otherTranslations).slice(0, 3);
  }, []);

  // Fonction stable pour préparer les options
  const prepareOptionsForWord = useCallback((word: TestWord) => {
    if (!word?.data?.translation) {
      console.warn('⚠️ prepareOptionsForWord: word invalide');
      return;
    }
    
    console.log('🎯 Préparation options pour:', word.word);
    const options = [
      word.data.translation, 
      ...generateWrongAnswers(word.data.translation, currentSubcategoryRules)
    ].filter(Boolean);
    
    if (options.length >= 4) {
      const shuffledOptions = shuffleArray(options);
      console.log('✅ Options préparées:', shuffledOptions.length);
      setStableOptions(shuffledOptions);
    } else {
      console.error('❌ Pas assez d\'options disponibles');
    }
  }, [generateWrongAnswers, currentSubcategoryRules]);

  // handleContinue sans dépendances
  const handleContinue = useCallback((updatedScores?: TestWord[]) => {
    console.log('🔄 HandleContinue - START');
    
    const currentWord = currentTestWordRef.current;
    const currentQueue = testQueueRef.current;
    const currentSubcat = selectedSubcategoryRef.current;
    const currentTestWords = testWordsRef.current;
    
    if (!currentWord) {
      console.warn('⚠️ Pas de currentTestWord');
      return;
    }
    
    if (currentQueue.length === 0) {
      console.warn('⚠️ testQueue vide');
      return;
    }
    
    // Nettoyer l'UI immédiatement
    setSelectedAnswer(null);
    setFeedback(null);
    setShowContinueButton(false);
    
    // Traiter la queue
    const newQueue = currentQueue.slice(1);
    console.log(`📋 Queue: ${currentQueue.length} → ${newQueue.length}`);
    
    // Vérifier fin de test AVANT mise à jour
    if (newQueue.length === 0) {
      console.log("🏁 FIN DU TEST - Passage au résumé");
      
      setTestQueue([]);
      setCurrentTestWord(null);
      setStableOptions([]);
      
      const finalScores = updatedScores || currentTestWords;
      const masteredWords = finalScores.filter((w: TestWord) => w.correctAnswers >= 3);
      
      setSessionResults({
        subcategory: currentSubcat || '',
        masteredWords,
        date: Date.now()
      });
      
      setMode('summary');
      setHasSavedThisSession(false);
      setShouldSave(true);
      
      return;
    }
    
    // Préparer la question suivante
    setTestQueue(newQueue);
    
    const nextTest = newQueue[0];
    const finalScores = updatedScores || currentTestWords;
    const nextWordStats = finalScores.find((w: TestWord) => w.word === nextTest.word) || {
      word: nextTest.word,
      data: nextTest.data,
      correctAnswers: 0,
      tested: 0
    };
    
    console.log('🎯 Question suivante:', nextWordStats.word);
    
    // Préparer les options AVANT de définir le mot
    const options = [
      nextWordStats.data.translation, 
      ...generateWrongAnswers(nextWordStats.data.translation, currentSubcategoryRules)
    ].filter(Boolean);
    
    if (options.length >= 4) {
      const shuffledOptions = shuffleArray(options);
      console.log('✅ Options préparées SYNC:', shuffledOptions.length);
      
      setStableOptions(shuffledOptions);
      setCurrentTestWord(nextWordStats);
      
      console.log('✅ Mot et options définis ensemble');
    } else {
      console.error('❌ Pas assez d\'options disponibles pour', nextWordStats.word);
      if (newQueue.length > 1) {
        setTimeout(() => handleContinue(updatedScores), 50);
      }
    }
    
  }, [generateWrongAnswers, currentSubcategoryRules]);

  // handleAnswer simplifié et typé correctement
  const handleAnswer = useCallback(async (answer: string) => {
    const currentWord = currentTestWord;
    const currentTestWords = testWords;
    
    if (!currentWord?.data?.translation) return;
    
    console.log(`🎯 Réponse: ${answer} (attendu: ${currentWord.data.translation})`);
    
    const isCorrect = answer === currentWord.data.translation;
    setSelectedAnswer(answer);
    setFeedback(isCorrect ? 'Correct !' : `Incorrect. La bonne réponse est : ${currentWord.data.translation}`);

    // Audio
    if (currentWord.data.audio) {
      try {
        await playWord(currentWord.data.audio);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }

    // Mise à jour scores
    const updatedScores = currentTestWords.map((word: TestWord) => 
      word.word === currentWord.word
        ? {
            ...word,
            correctAnswers: isCorrect ? word.correctAnswers + 1 : word.correctAnswers,
            tested: word.tested + 1
          }
        : word
    );
    
    setTestWords(updatedScores);
    
    if (isCorrect) {
      setTimeout(() => {
        handleContinue(updatedScores);
      }, 800);
    } else {
      setShowContinueButton(true);
    }
    
  }, [currentTestWord, testWords, playWord, handleContinue]);

  // Bouton continuer simplifié
  const handleContinueButtonClick = useCallback(() => {
    console.log('🔄 Clic continuer');
    handleContinue();
  }, [handleContinue]);

  const handleStartLearning = useCallback(() => {
    if (!currentSubcategoryRules?.length) return;
    const uncompletedRules = currentSubcategoryRules.filter(([rule]) => !completedRules.has(rule));
    if (uncompletedRules.length > 0) {
      const selectedRules = uncompletedRules.slice(0, 5);
      setLearningWords(selectedRules);
      setTestWords(selectedRules.map(([word, data]) => ({
        word,
        data,
        correctAnswers: 0,
        tested: 0
      })));
      
      setPreviewIndex(0);
      setMode('preview');
      setHasSavedThisSession(false);
    }
  }, [currentSubcategoryRules, completedRules]);

  const handleNextPreview = useCallback(() => {
    if (!learningWords?.length) return;
    if (previewIndex < learningWords.length - 1) {
      setPreviewIndex(prev => prev + 1);
    } else {
      const testQueue: Array<{word: string, data: WordData}> = [];
      
      learningWords.forEach(([word, data]) => {
        for (let i = 0; i < 3; i++) {
          testQueue.push({ word, data });
        }
      });
      
      const shuffledTestQueue = shuffleArray(testQueue);
      
      setTestWords(learningWords.map(([word, data]) => ({
        word,
        data,
        correctAnswers: 0,
        tested: 0
      })));
      
      if (shuffledTestQueue.length > 0) {
        const firstTest = shuffledTestQueue[0];
        const firstTestWord = {
          word: firstTest.word,
          data: firstTest.data,
          correctAnswers: 0,
          tested: 0
        };
        
        console.log('🎯 Préparation options pour premier mot:', firstTestWord.word);
        const options = [
          firstTestWord.data.translation, 
          ...generateWrongAnswers(firstTestWord.data.translation, currentSubcategoryRules)
        ].filter(Boolean);
        
        if (options.length >= 4) {
          const shuffledOptions = shuffleArray(options);
          console.log('✅ Options préparées SYNC pour premier mot:', shuffledOptions.length);
          
          setTestQueue(shuffledTestQueue);
          setStableOptions(shuffledOptions);
          setCurrentTestWord(firstTestWord);
          setMode('test');
          
          console.log('✅ Test initié avec mot et options ensemble');
        } else {
          console.error('❌ Impossible de démarrer le test - pas assez d\'options');
        }
      }
    }
  }, [previewIndex, learningWords, generateWrongAnswers, currentSubcategoryRules]);

  // ✅ SAUVEGARDE CENTRALISÉE - Version corrigée
const handleGrammarSummaryComplete = useCallback(async () => {
  if (hasSavedThisSession) {
    console.log('⚠️ GRAMMAR - Sauvegarde déjà effectuée pour cette session, ignorer');
    return;
  }
  
  console.log('=== 🔄 GRAMMAR - DÉBUT SAUVEGARDE CENTRALISÉE ===');
  
  try {
    const masteredWords = testWords.filter(w => {
      const isMastered = w.correctAnswers >= 3;
      console.log(`🎯 GRAMMAR - Mot ${w.word}: ${w.correctAnswers}/3 -> ${isMastered ? 'MAÎTRISÉ' : 'NON MAÎTRISÉ'}`);
      return isMastered;
    });
    
    console.log('🎯 GRAMMAR - Mots maîtrisés:', masteredWords.map(w => w.word));
    
    if (masteredWords.length > 0) {
      const totalXPGained = masteredWords.length * XP_PER_GRAMMAR_RULE;
      
      // ✅ 1. Préparer les mots pour la révision
      const wordsToAdd = masteredWords.map(word => ({
        word: word.word,
        category: 'Grammaire',
        subcategory: selectedSubcategory || '',
        language: languageCode,
        timestamp: Date.now(),
        translation: word.data.translation,
        explanation: word.data.explanation,
        example: word.data.example,
        audio: word.data.audio
      }));

       playSummaryAudio();
      
      // ✅ 2. Envoyer vers la révision
      try {
        if (onWordsLearned) {
          console.log('📤 GRAMMAR - Envoi vers révision...');
          onWordsLearned(wordsToAdd);
          console.log('✅ GRAMMAR - Révision mise à jour');
        }
      } catch (revisionError) {
        console.error('❌ GRAMMAR - Erreur révision (non bloquante):', revisionError);
      }
      
      // ✅ 3. Préparer les données localStorage grammaire
      const storageKey = `grammar-progress-${languageCode}`;
      const existingProgress = localStorage.getItem(storageKey);
      const currentProgress = existingProgress ? JSON.parse(existingProgress) : [];
      
      const newGrammarSession = {
        subcategory: selectedSubcategory || '',
        masteredWords: masteredWords.map(word => ({
          word: word.word,
          data: {
            translation: word.data.translation,
            explanation: word.data.explanation,
            example: word.data.example,
            audio: word.data.audio
          },
          correctAnswers: word.correctAnswers,
          tested: word.tested
        })),
        date: Date.now(),
        xpGained: totalXPGained
      };
      
      const updatedGrammarProgress = [...currentProgress, newGrammarSession];
      
      // ✅ 4. Préparer les données pour saveProgressOnSummary
      const grammarProgress: UserProgress = {
        learnedWords: new Set(masteredWords.map(w => w.word)),
        wordsToReview: new Set(),
        wordProgress: {},
        recentlyLearnedWords: wordsToAdd,
        language: languageCode
      };
      
      const contextData = {
        mode: 'grammar',
        sessionStats: {
          rulesLearned: masteredWords.length,
          totalXP: totalXPGained,
          subcategory: selectedSubcategory
        },
        description: `Session grammaire ${selectedSubcategory} - ${masteredWords.length} règles maîtrisées (+${totalXPGained} XP)`,
        includeGoogleDrive: true,
        // ✅ CRUCIAL: Inclure les données grammaire spécifiques
        grammarSpecificData: updatedGrammarProgress
      };
      
      console.log('💾 GRAMMAR - Données préparées pour sauvegarde centralisée:');
      console.log('📊 Mots appris:', grammarProgress.learnedWords.size);
      console.log('📊 Sessions grammaire:', updatedGrammarProgress.length);
      console.log('📊 XP gagné:', totalXPGained);
      
      // ✅ 5. Appel sauvegarde centralisée
      if (!saveProgressOnSummary) {
        throw new Error('saveProgressOnSummary function not available');
      }
      
      console.log('🚀 GRAMMAR - Appel saveProgressOnSummary...');
      await saveProgressOnSummary(grammarProgress, contextData);
      console.log('✅ GRAMMAR - Sauvegarde centralisée réussie');
      
      // ✅ 6. Mise à jour état local après sauvegarde réussie
      setCompletedRules(prev => {
        const newRules = new Set(prev);
        masteredWords.forEach(word => newRules.add(word.word));
        return newRules;
      });
      
      // ✅ 7. Sauvegarde localStorage (backup local)
      localStorage.setItem(storageKey, JSON.stringify(updatedGrammarProgress));
      console.log('✅ GRAMMAR - Sauvegarde localStorage réussie');
      
      // ✅ 8. Animation XP
      if (totalXPGained > 0) {
        setXpGained(totalXPGained);
      }
      
    } else {
      console.log('📭 GRAMMAR - Aucun mot maîtrisé cette session');
    }
    
    setSaveCompleted(true);
    setHasSavedThisSession(true);
    console.log('✅ GRAMMAR - Session terminée avec succès');
    
  } catch (error) {
    console.error('❌ GRAMMAR - ERREUR CRITIQUE:', error);
    console.error('🔍 Détails:', {
      message: error instanceof Error ? error.message : String(error),
      testWordsLength: testWords.length,
      selectedSubcategory: selectedSubcategory,
      languageCode: languageCode
    });
    
    setHasSavedThisSession(false);
    setSaveCompleted(false);
    alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log('=== ✅ GRAMMAR - FIN SAUVEGARDE CENTRALISÉE ===');
}, [
  testWords,
  selectedSubcategory,
  languageCode,
  onWordsLearned,
  saveProgressOnSummary,
  hasSavedThisSession,
  XP_PER_GRAMMAR_RULE
]);

useEffect(() => {
  const handleGrammarProgressSynced = (event: CustomEvent) => {
    const { sessions, language, newSessionsCount } = event.detail;
    
    if (language === languageCode) {
      console.log(`📚 GRAMMAR - Données synchronisées: ${sessions.length} sessions (${newSessionsCount} nouvelles)`);
      
      // Recalculer completedRules
      const allCompletedRules = new Set<string>();
      
      sessions.forEach((session: any) => {
        if (session.masteredWords && Array.isArray(session.masteredWords)) {
          session.masteredWords.forEach((wordData: any) => {
            if (wordData.word) {
              allCompletedRules.add(wordData.word);
            }
          });
        }
      });
      
      console.log(`📚 GRAMMAR - completedRules mis à jour: ${allCompletedRules.size} règles`);
      setCompletedRules(allCompletedRules);
    }
  };

  window.addEventListener('grammarProgressSynced', handleGrammarProgressSynced as EventListener);
  
  return () => {
    window.removeEventListener('grammarProgressSynced', handleGrammarProgressSynced as EventListener);
  };
}, [languageCode]);

  useEffect(() => {
    if (shouldSave && mode === 'summary' && !saveCompleted && !hasSavedThisSession) {
      console.log('🚀 GRAMMAR - Déclenchement UNIQUE de la sauvegarde centralisée...');
      
      setHasSavedThisSession(true);
      
      const performSave = async () => {
        try {
          await handleGrammarSummaryComplete();
          setShouldSave(false);
        } catch (error) {
          console.error('❌ GRAMMAR - Erreur lors de la sauvegarde:', error);
          setHasSavedThisSession(false);
        }
      };
      
      performSave();
    }
  }, [shouldSave, mode, saveCompleted, hasSavedThisSession, handleGrammarSummaryComplete]);

  useEffect(() => {
    if (mode === 'summary' && summaryStep === 'results') {
      console.log('⏰ GRAMMAR - Délai de sécurité pour le bouton continuer');
      
      const timer = setTimeout(() => {
        console.log('✅ GRAMMAR - Affichage forcé du bouton continuer après délai');
        setShowContinueButton(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowContinueButton(false);
    }
  }, [mode, summaryStep]);

  // Logique d'exit simplifiée
  const handleExitAttempt = useCallback((exitCallback: () => void) => {
  console.log('🚪 GrammarMode - Tentative de sortie - Mode:', mode);
  
  if (showExitConfirmation) {
    console.log('⚠️ GrammarMode - Modal déjà ouvert, ignoré');
    return;
  }
  
  // ✅ CORRECTION: Exclure explicitement le mode 'summary'
  const hasActiveSession = (
    (mode === 'preview' && learningWords.length > 0) ||
    (mode === 'test' && (currentTestWord !== null || testQueue.length > 0))
    // ❌ SUPPRIMÉ: (mode === 'category-details' && learningWords.length > 0)
    // Le mode 'summary' ne doit JAMAIS déclencher le modal
  );
  
  // Condition supplémentaire pour category-details uniquement si on a une session en cours
  const hasCategorySession = (
    mode === 'category-details' && 
    (learningWords.length > 0 || testWords.length > 0 || currentTestWord !== null)
  );
  
  if (hasActiveSession || hasCategorySession) {
    console.log('⚠️ GrammarMode - Session active détectée - Affichage de la confirmation');
    setPendingExit(() => exitCallback);
    setShowExitConfirmation(true);
    console.log('✅ GrammarMode - Modal d\'exit ouvert');
  } else {
    console.log('✅ GrammarMode - Pas de session active - Sortie directe');
    exitCallback();
  }
}, [mode, currentTestWord, testQueue.length, learningWords.length, testWords.length, showExitConfirmation]);

  const cleanupState = useCallback(() => {
    console.log('🧹 GrammarMode - Nettoyage de l\'état');
    setCurrentTestWord(null);
    setTestQueue([]);
    setLearningWords([]);
    setPreviewIndex(0);
    setSelectedAnswer(null);
    setFeedback(null);
    setShowContinueButton(false);
    setStableOptions([]);
    setTestWords([]);
    setShowExitConfirmation(false);
    setPendingExit(null);
  }, []);

  const handleBackToCategories = useCallback(() => {
    console.log('🔙 GrammarMode - Retour aux catégories');
    cleanupState();
    onBackToCategories();
  }, [cleanupState, onBackToCategories]);

  const handleExitConfirm = useCallback(() => {
    console.log('✅ GrammarMode - Confirmation de sortie');
    
    setShowExitConfirmation(false);
    const callbackToExecute = pendingExit;
    setPendingExit(null);
    
    if (callbackToExecute) {
      console.log('🚀 GrammarMode - Exécution du callback de sortie');
      try {
        callbackToExecute();
      } catch (error) {
        console.error('❌ GrammarMode - Erreur lors de l\'exécution du callback:', error);
      }
    } else {
      console.warn('⚠️ GrammarMode - Aucun callback de sortie à exécuter');
    }
  }, [pendingExit]);

  const handleExitCancel = useCallback(() => {
    console.log('🚫 GrammarMode - Annulation de la sortie');
    setShowExitConfirmation(false);
    setPendingExit(null);
  }, []);

  const handleShowXP = useCallback(() => {
    console.log('🎯 Passage à l\'étape XP');
    
    if (xpGained > 0) {
      setSummaryStep('xp');
      
      setTimeout(() => {
        setShowXPAnimation(true);
      }, 300);
    } else {
      setSummaryStep('xp');
    }
  }, [xpGained]);

  const resetSummaryState = useCallback(() => {
    setSummaryStep('results');
    setShowXPAnimation(false);
    setXpGained(0);
    setShouldSave(false);
    setSaveCompleted(false);
    setShowContinueButton(false);
    setHasSavedThisSession(false);
  }, []);
  
 const handlePlayAudio = useCallback(async (audioSrc: string) => {
  try {
    // Extraire le mot du chemin audio (si c'est un chemin)
    const word = audioSrc.includes('/') 
      ? audioSrc.split('/').pop()?.replace(/\.(mp3|wav|ogg)$/, '') || audioSrc
      : audioSrc;
    
    const success = await playWord(word);
    if (!success) {
      console.log(`Audio non disponible pour: ${word}`);
    }
  } catch (error) {
    console.error('Erreur lecture audio:', error);
  }
}, [playWord]);

  if (isLoading) {
    return (
      <div className="component-wrapper">
        <div className="grammar-main-container card" data-theme={theme}>
          <div className="loading-overlay">Chargement en cours...</div>
        </div>
      </div>
    );
  }

  if (!languageData) {
    return (
      <div className="component-wrapper">
        <div className="grammar-main-container card" data-theme={theme}>
          <div className={`grammar-error ${theme}`}>Erreur de chargement des données</div>
        </div>
      </div>
    );
  }

  if (mode === 'category-details' && selectedSubcategory) {
    return (
      <CategoryDetails
        category={selectedSubcategory}
        rules={currentSubcategoryRules}
        completedRules={completedRules}
        onStartLearning={handleStartLearning}
        onBack={() => {
          setMode('selection');
          setSelectedSubcategory(null);
        }}
        isMobileView={isMobileView}
        onPlayAudio={handlePlayAudio}
        onExitAttempt={handleExitAttempt}
        showExitConfirmation={showExitConfirmation}
        onExitConfirm={handleExitConfirm}
        onExitCancel={handleExitCancel}
      />
    );
  }

  if (mode === 'preview' && selectedSubcategory && learningWords.length > 0) {
    const currentWord = learningWords[previewIndex];
    return (
      <>
        <div className="component-wrapper">
          <div className="grammar-main-container card" data-theme={theme}>
            <div className="grammar-header">
              <AdaptiveBackButton 
                onBack={() => handleExitAttempt(() => {
                  setMode('category-details');
                  setLearningWords([]);
                })}
                isMobileView={isMobileView}
                title={isMobileView ? selectedSubcategory : undefined}
                onExitAttempt={handleExitAttempt}
              />
              {!isMobileView && <h2>{selectedSubcategory}</h2>}
            </div>
      
            <div className="grammar-level-card">
              <div className="preview-progress">
                <p>Mot {previewIndex + 1} sur {learningWords.length}</p>
                <div className="grammar-progress-bar">
                  <div 
                    className="grammar-progress-fill"
                    style={{ width: `${((previewIndex + 1) / learningWords.length) * 100}%` }}
                  />
                </div>
              </div>
      
              <div className="word-preview-card">
                <h3>{currentWord[0]}</h3>
                <p className="translation">{currentWord[1].translation}</p>
                {currentWord[1].explanation && (
                  <p className="explanation">
                    {currentWord[1].explanation}
                  </p>
                )}
                {currentWord[1].example && (
                  <div className="example">
                    <strong>Exemple:</strong>
                    <p>{currentWord[1].example}</p>
                  </div>
                )}
                
                {hasValidAudio(currentWord[1].audio) && (
                  <motion.button 
                    onClick={() => playWord(currentWord[1].audio!)}
                    className="learn-mode-audio-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Écouter la prononciation"
                  >
                    <Volume2 size={24} />
                  </motion.button>
                )}
              </div>
            </div>
      
            <motion.button
              onClick={handleNextPreview}
              className="grammar-action-button primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {previewIndex === learningWords.length - 1 ? 'Commencer le test' : 'Suivant'}
            </motion.button>
          </div>
        </div>
        
        {isMobileView && (
          <button
            onClick={() => handleExitAttempt(() => {
              setMode('category-details');
              setLearningWords([]);
            })}
            className="mobile-fixed-button"
            aria-label="Retour"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Retour</span>
          </button>
        )}

        <ConfirmationModal
          isOpen={showExitConfirmation}
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
          message="Attention ! Si vous quittez maintenant, votre progression dans cette leçon ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
          title="Quitter l'apprentissage ?"
          confirmText="Quitter"
          cancelText="Continuer l'apprentissage"
          confirmButtonStyle="danger"
          position="top"
        />
      </>
    );
  }

  if (mode === 'test' && currentTestWord && stableOptions.length === 4) {
    console.log(`🎮 RENDER TEST - Mot: ${currentTestWord.word}, Options: ${stableOptions.length}, Queue: ${testQueue.length}`);
    
    return (
      <>
        <div className="component-wrapper">
          <div className="grammar-main-container card" data-theme={theme}>
            <div className="grammar-header">
              <AdaptiveBackButton 
                onBack={() => handleExitAttempt(() => {
                  setMode('category-details');
                  setTestWords([]);
                  setTestQueue([]);
                })}
                onExitAttempt={handleExitAttempt}
                isMobileView={isMobileView}
                title={isMobileView ? `Test - ${selectedSubcategory}` : undefined}
              />
              {!isMobileView && <h2>Test - {selectedSubcategory}</h2>}
            </div>
      
            <div className="grammar-level-card test-content">
              <div className="test-progress">
                <h3>Score pour ce mot: {currentTestWord.correctAnswers}/3</h3>
                <p style={{ fontSize: '0.9em', color: theme === 'dark' ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                  3 bonnes réponses requises pour maîtriser ce mot
                </p>
              </div>
      
              <div className="test-card">
                <h3>{currentTestWord.word}</h3>
                <p>Choisissez la bonne traduction :</p>
                
                {hasValidAudio(currentTestWord.data.audio) && (
                  <motion.button 
                    onClick={() => playWord(currentTestWord.data.audio!)}
                    className="learn-mode-audio-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ margin: '10px auto' }}
                    aria-label="Écouter la prononciation"
                  >
                    <Volume2 size={24} />
                  </motion.button>
                )}
              </div>
      
              <div key={`test-${currentTestWord.word}-${Date.now()}`} className="test-content-inner">
                <div className="options-grid">
                  {stableOptions.map((option, index) => (
                    <motion.button
                      key={`${currentTestWord.word}-${option}-${index}`}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={`option-button ${
                        selectedAnswer === option 
                          ? option === currentTestWord.data.translation ? 'correct' : 'incorrect'
                          : ''
                      }`}
                      whileHover={!selectedAnswer ? { scale: 1.05 } : undefined}
                      whileTap={!selectedAnswer ? { scale: 0.95 } : undefined}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
      
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      key={`feedback-${currentTestWord?.word}-${Date.now()}`}
                      className={`feedback ${feedback.startsWith('Correct') ? 'correct' : 'incorrect'}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      {feedback}
                      {!feedback.startsWith('Correct') && currentTestWord.data.example && (
                        <div className="incorrect-feedback-example">
                          <p className="example-title">Exemple :</p>
                          <p className="example-content">{currentTestWord.data.example}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <AnimatePresence>
                  {showContinueButton && (
                    <motion.button
                      key={`continue-${currentTestWord?.word}-${Date.now()}`}
                      onClick={handleContinueButtonClick}
                      className="continue-button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        marginTop: '16px'
                      }}
                    >
                      <ArrowRight size={16} />
                      <span>Continuer</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        
        {isMobileView && (
          <button
            onClick={() => handleExitAttempt(() => {
              setMode('category-details');
              setTestWords([]);
              setTestQueue([]);
            })}
            className="mobile-fixed-button"
            aria-label="Retour"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Retour</span>
          </button>
        )}

        <ConfirmationModal
          isOpen={showExitConfirmation}
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
          message="Attention ! Si vous quittez maintenant, votre progression dans cette leçon ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
          title="Quitter l'apprentissage ?"
          confirmText="Quitter"
          cancelText="Continuer l'apprentissage"
          confirmButtonStyle="danger"
          position="top"
        />
      </>
    );
  }

  if (mode === 'test') {
    console.log(`🔍 DEBUG TEST - currentTestWord: ${!!currentTestWord}, options: ${stableOptions.length}, queue: ${testQueue.length}`);
    
    if (!currentTestWord) {
      console.error('❌ Pas de currentTestWord en mode test');
    }
    if (stableOptions.length !== 4) {
      console.error(`❌ Options incorrectes: ${stableOptions.length}/4`);
    }
  }

  if (mode === 'summary' && sessionResults) {
    const masteredWordsCount = sessionResults.masteredWords.length;
    const totalXPGained = masteredWordsCount * XP_PER_GRAMMAR_RULE;
    
    return (
      <>
        <div className="component-wrapper">
          <div className="grammar-main-container card" data-theme={theme}>
            <div className="grammar-header">
              <AdaptiveBackButton 
                onBack={() => {
                  setMode('category-details');
                  setTestWords([]);
                  setTestQueue([]);
                }}
                onExitAttempt={handleExitAttempt}
                isMobileView={isMobileView}
                title={isMobileView ? `Résumé - ${selectedSubcategory}` : undefined}
              />
              {!isMobileView && <h2>Résumé - {selectedSubcategory}</h2>}
            </div>
            
            <div className="grammar-level-card">
              {summaryStep === 'xp' && (
                <XPAnimation
                  xpGained={xpGained}
                  showAnimation={showXPAnimation}
                  onAnimationComplete={() => {
                    // Animation terminée
                  }}
                  variant="large"
                  className="success pulse"
                />
              )}

              {shouldSave && !saveCompleted && (
                <div className="grammar-saving-indicator" style={{
                  padding: '12px',
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  <div className="loading-spinner" style={{ display: 'inline-block', marginRight: '8px' }}></div>
                  <span>Sauvegarde en cours...</span>
                </div>
              )}
              
              {saveCompleted && summaryStep === 'results' && (
                <div className="grammar-save-success" style={{
                  padding: '12px',
                  backgroundColor: theme === 'dark' ? '#064e3b' : '#067a0aff',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  marginBottom: '16px',
                  textAlign: 'center',
                  color: theme === 'dark' ? '#34d399' : '#059669'
                }}>
                  <CheckCircle style={{ display: 'inline-block', marginRight: '8px' }} size={16} />
                  <span>Progression sauvegardée automatiquement !</span>
                </div>
              )}

              {summaryStep === 'results' && (
                <>
                  <div className="summary-content">
                    <h3 className="summary-heading">Mots maîtrisés dans cette session :</h3>
                    <div className="summary-badge">
                      {sessionResults.masteredWords.length} mot{sessionResults.masteredWords.length !== 1 ? 's' : ''}
                    </div>
                  </div>
          
                  <div className="mastered-rules">
                    {sessionResults.masteredWords.map((word, index) => (
                      <div key={index} className="mastered-word-card">
                        <div className="word-content">
                          <h4>{word.word}</h4>
                          <p>{word.data.translation}</p>
                          {word.data.explanation && (
                            <p className="explanation">{word.data.explanation}</p>
                          )}
                          
                          {hasValidAudio(word.data.audio) && (
                            <button 
                              onClick={() => playWord(word.data.audio!)}
                              className="audio-button"
                              aria-label="Écouter la prononciation"
                            >
                              <Volume2 size={16} />
                            </button>
                          )}
                        </div>
                        <div className="mastery-indicator">
                          <CheckCircle className="mastery-icon" size={20} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {(saveCompleted || showContinueButton) && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <motion.button
                        onClick={handleShowXP}
                        className="continue-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: saveCompleted 
                            ? 'linear-gradient(45deg, #8b4513, #a0522d)' 
                            : 'linear-gradient(45deg, #f59e0b, #d97706)',
                          color: '#f5deb3',
                          border: '2px solid rgba(139, 69, 19, 0.3)',
                          borderRadius: '12px',
                          padding: '16px 32px',
                          fontSize: '16px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '12px',
                          margin: '0 auto',
                          minWidth: '200px',
                          boxShadow: '0px 4px 12px rgba(139, 69, 19, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>Continuer</span>
                        {!saveCompleted && <span style={{fontSize: '12px'}}></span>}
                        <ArrowRight size={20} />
                      </motion.button>
                      
                      <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: theme === 'dark' ? '#94a3b8' : '#64748b',
                        fontStyle: 'italic'
                      }}>
                        {totalXPGained > 0 ? (
                          <>Voir les récompenses XP gagnées 🏆</>
                        ) : (
                          <>Terminer la session</>
                        )}
                        {!saveCompleted && <> (Affiché automatiquement)</>}
                      </div>
                    </div>
                  )}
                </>
              )}

              {summaryStep === 'xp' && (
                <>
                  <div className="summary-content">
                    <h3 className="summary-heading">Félicitations ! 🎉</h3>
                    
                    <div className="xp-summary" style={{
                      marginTop: '16px',
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
                        {XP_PER_GRAMMAR_RULE} XP × {sessionResults.masteredWords.length} règle{sessionResults.masteredWords.length > 1 ? 's' : ''} maîtrisée{sessionResults.masteredWords.length > 1 ? 's' : ''}
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                        marginTop: '20px'
                      }}>
                        {sessionResults.masteredWords.map((word, index) => (
                          <div key={index} style={{
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
                              {word.word}
                            </div>
                            <div style={{
                              fontSize: '0.9em',
                              color: '#10b981',
                              fontWeight: '700'
                            }}>
                              +{XP_PER_GRAMMAR_RULE} XP
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
      
              {(summaryStep === 'xp' || (saveCompleted && totalXPGained === 0)) && (
                <div className="summary-actions">
                  <motion.button
                    className="grammar-action-button secondary"
                    onClick={() => {
                      setMode('selection');
                      setLearningWords([]);
                      setTestWords([]);
                      setCurrentTestWord(null);
                      setSessionResults(null);
                      resetSummaryState();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Retour aux catégories
                  </motion.button>
                  
                  {currentSubcategoryRules.some(([rule]) => !completedRules.has(rule)) && (
                    <motion.button
                      className="grammar-action-button primary"
                      onClick={() => {
                        setSessionResults(null);
                        setMode('category-details');
                        resetSummaryState();
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continuer l'apprentissage
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isMobileView && (
          <button
            onClick={() => {
              if (summaryStep === 'results') {
                setMode('selection');
                setLearningWords([]);
                setTestWords([]);
                setCurrentTestWord(null);
                setSessionResults(null);
                resetSummaryState();
              } else {
                setMode('selection');
                setLearningWords([]);
                setTestWords([]);
                setCurrentTestWord(null);
                setSessionResults(null);
                resetSummaryState();
              }
            }}
            className="mobile-fixed-button"
            aria-label="Retour aux catégories"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            <span>Retour aux catégories</span>
          </button>
        )}
      </>
    );
  }

  // Vue principale avec calcul du nombre de catégories et classe conditionnelle
  const categoryEntries = Object.entries(grammarCategories);
  const categoryCount = categoryEntries.length;

  return (
    <>
      <div className="component-wrapper">
        <div className="grammar-main-container card" data-theme={theme}>
          <div className="grammar-header">
            <AdaptiveBackButton 
              onBack={onBackToCategories}
              onExitAttempt={handleExitAttempt}
              isMobileView={isMobileView} 
              title={isMobileView ? `Grammaire ${languageData.name}` : undefined}
            />
            {!isMobileView && <h1 className="grammar-logo-title">Grammaire {languageData.name}</h1>}
          </div>
      
          <div className="grammar-level-card">
            <div className="grammar-decoration"></div>
            <h2 className="grammar-intro-title">Apprenez la grammaire étape par étape</h2>
            <p className="grammar-intro-text">
              Choisissez une sous-catégorie pour commencer à apprendre la grammaire {languageData.name}.
              Chaque section contient des règles à apprendre et des exercices pratiques.
            </p>
          </div>
      
          <div className={`grammar-menu-grid ${categoryCount === 3 ? 'has-three-items' : ''}`}>
            {categoryEntries.map(([subcategory, content]) => {
              if (typeof content !== 'object' || !content) return null;
              
              const rules = Object.entries(content)
                .filter(([key]) => !key.includes('_'));
                
              const categoryCompletedRules = rules.filter(([rule]) => 
                completedRules.has(rule)
              ).length;
              
              const isSubcategoryCompleted = categoryCompletedRules === rules.length && rules.length > 0;

              return (
                <SubcategoryCard
                  key={subcategory}
                  title={subcategory}
                  completed={isSubcategoryCompleted}
                  onClick={() => {
                    setSelectedSubcategory(subcategory);
                    setMode('category-details');
                  }}
                  count={rules.length}
                />
              );
            })}
          </div>
      
          <div className="grammar-stats-container">
            <div className="grammar-stat-card">
              <h4 className="grammar-stat-title">Règles maîtrisées</h4>
              <p className="grammar-stat-value">{completedRules.size}</p>
            </div>
            <div className="grammar-stat-card">
              <h4 className="grammar-stat-title">Progrès total</h4>
              <p className="grammar-stat-value">
                {Math.round((completedRules.size / 
                  Object.values(grammarCategories).reduce((acc, cat) => 
                    acc + Object.keys(cat).filter(key => !key.includes('_')).length, 0
                  )) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ConfirmationModal principal pour toutes les confirmations d'exit */}
      <ConfirmationModal
        isOpen={showExitConfirmation}
        onConfirm={handleExitConfirm}
        onCancel={handleExitCancel}
        message="Attention ! Si vous quittez maintenant, votre progression dans cette leçon ne sera pas sauvegardée. Voulez-vous vraiment abandonner ?"
        title="Quitter l'apprentissage ?"
        confirmText="Quitter"
        cancelText="Continuer l'apprentissage"
        confirmButtonStyle="danger"
        position="top"
      />
    </>
  );
};

export default GrammarMode;