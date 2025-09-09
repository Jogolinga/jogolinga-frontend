import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2,
  ArrowLeft,
  CheckCircle,
  XCircle,

} from 'lucide-react';
import { useAudio } from '../hooks/hooks';
import { useTheme } from './ThemeContext';
import { WordData, LearnedWord, LanguageCode } from '../types/types';
import { shuffleArray } from '../utils/utils';
import { cleanParentheses } from '../utils/cleanParentheses';
import ProgressPie from './ProgressPie';
import XPAnimation from './XPAnimation';
import './DifficultWordsMode.css';

const TESTS_PER_WORD = 3;
const XP_PER_WORD = 15; // Plus d'XP pour les mots difficiles

interface DifficultWord extends WordData {
  word: string;
  category: string;
  subcategory?: string;
  failureCount: number;
  lastFailure: number;
}

interface DifficultWordsModeProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onWordsImproved?: (words: LearnedWord[]) => void;
  isMobileView?: boolean;
}

const DifficultWordsMode: React.FC<DifficultWordsModeProps> = ({
  languageCode,
  onBackToCategories,
  onWordsImproved,
  isMobileView = false
}) => {
  const { theme } = useTheme();
  const playAudio = useAudio();

  // États principaux
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([]);
  const [currentWords, setCurrentWords] = useState<DifficultWord[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [mode, setMode] = useState<'preview' | 'test' | 'summary'>('preview');
  const [testQueue, setTestQueue] = useState<string[]>([]);
  const [testScores, setTestScores] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [stableOptions, setStableOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // États pour l'animation XP
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Refs pour stabiliser les données
  const testScoresRef = useRef<Record<string, number>>({});
  const currentWordsRef = useRef<DifficultWord[]>([]);

  // Synchroniser les refs avec les states
  useEffect(() => {
    testScoresRef.current = testScores;
  }, [testScores]);

  useEffect(() => {
    currentWordsRef.current = currentWords;
  }, [currentWords]);

  // Charger les mots difficiles depuis localStorage
  const loadDifficultWords = useCallback(() => {
    try {
      setIsLoading(true);
      const difficultWordsKey = `${languageCode}-difficultWords`;
      const savedDifficultWords = localStorage.getItem(difficultWordsKey);
      
      if (savedDifficultWords) {
        const parsedWords: DifficultWord[] = JSON.parse(savedDifficultWords);
        
        // Filtrer les mots récemment échoués (dernières 24h) et trier par nombre d'échecs
        const recentDifficultWords = parsedWords
          .filter(word => Date.now() - word.lastFailure < 24 * 60 * 60 * 1000)
          .sort((a, b) => b.failureCount - a.failureCount)
          .slice(0, 10); // Limiter à 10 mots max

        console.log('Mots difficiles chargés:', recentDifficultWords);
        setDifficultWords(recentDifficultWords);
        
        if (recentDifficultWords.length > 0) {
          setCurrentWords(recentDifficultWords);
          setCurrentWordIndex(0);
          
          // Initialiser les scores
          const initialScores = Object.fromEntries(
            recentDifficultWords.map(word => [word.word, 0])
          );
          setTestScores(initialScores);
          testScoresRef.current = initialScores;
        }
      } else {
        console.log('Aucun mot difficile trouvé');
        setDifficultWords([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des mots difficiles:', error);
      setDifficultWords([]);
    } finally {
      setIsLoading(false);
    }
  }, [languageCode]);

  // Charger les mots difficiles au montage
  useEffect(() => {
    loadDifficultWords();
  }, [loadDifficultWords]);

  // Générer les options de réponse
  const generateStableOptions = useCallback((wordToTest: string, allCurrentWords: DifficultWord[]) => {
    const correctWord = allCurrentWords.find(word => word.word === wordToTest);
    if (!correctWord) return [];

    const correctTranslation = correctWord.translation;
    const otherTranslations = allCurrentWords
      .filter(word => word.word !== wordToTest)
      .map(word => word.translation);
    
    // Ajouter des distracteurs supplémentaires si nécessaire
    const wrongOptions = shuffleArray(otherTranslations).slice(0, 3);
    return shuffleArray([correctTranslation, ...wrongOptions]);
  }, []);

  // Démarrer le test
  const startTest = useCallback(() => {
    console.log('🎮 Démarrage du test des mots difficiles');
    
    if (currentWords.length === 0) {
      console.error('Aucun mot difficile disponible pour le test');
      return;
    }
    
    setMode('test');
    
    // Créer la file de test - chaque mot doit être testé TESTS_PER_WORD fois
    const queue = currentWords.flatMap(word => {
      const alreadyCorrect = testScores[word.word] || 0;
      const testsNeeded = Math.max(0, TESTS_PER_WORD - alreadyCorrect);
      return Array(testsNeeded).fill(word.word);
    });
    
    const shuffledQueue = shuffleArray(queue);
    console.log('Queue de test générée:', shuffledQueue);
    setTestQueue(shuffledQueue);
    
    if (shuffledQueue.length > 0) {
      const firstWord = shuffledQueue[0];
      const options = generateStableOptions(firstWord, currentWords);
      setStableOptions(options);
      
      const firstWordData = currentWords.find(word => word.word === firstWord);
      if (firstWordData?.audio) {
        setTimeout(() => {
          playAudio(firstWordData.audio!).catch(error => 
            console.error('Erreur lors de la lecture audio:', error)
          );
        }, 500);
      }
    }
  }, [currentWords, generateStableOptions, testScores, playAudio]);

  // Gérer la navigation dans le mode preview
  const handleNextWord = useCallback(() => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else if (mode === 'preview') {
      startTest();
    }
  }, [currentWordIndex, currentWords.length, mode, startTest]);

  // Gérer les réponses
  const handleAnswer = useCallback((answer: string) => {
    if (mode !== 'test' || testQueue.length === 0) return;

    const currentWord = testQueue[0];
    const wordData = currentWords.find(word => word.word === currentWord);
    if (!wordData) return;

    const isCorrect = answer === wordData.translation;
    
    setSelectedAnswer(answer);
    setFeedback(isCorrect ? 'Correct !' : `Incorrect. La bonne réponse est : ${wordData.translation}`);

    console.log('------- Difficult Word Progress -------');
    console.log('Word:', currentWord);
    console.log('Previous score:', (testScoresRef.current[currentWord] || 0), '/', TESTS_PER_WORD);

    // Mettre à jour les scores
    if (isCorrect) {
      const newScore = (testScoresRef.current[currentWord] || 0) + 1;
      testScoresRef.current[currentWord] = newScore;
      console.log('✅ Réponse correcte - Nouveau score:', newScore, '/', TESTS_PER_WORD);
    } else {
      console.log('❌ Réponse incorrecte - score inchangé');
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setFeedback(null);
      
      const newQueue = testQueue.slice(1);
      setTestQueue(newQueue);
        
      if (newQueue.length === 0) {
        // Fin du test
        console.log('🏁 Test terminé - Synchronisation des scores pour le résumé');
        setTestScores({ ...testScoresRef.current });
        setMode('summary');
        
        // Calculer l'XP gagné et déclencher l'animation
        const masteredCount = Object.values(testScoresRef.current).filter(score => score >= TESTS_PER_WORD).length;
        const totalXP = masteredCount * XP_PER_WORD;
        
        if (totalXP > 0) {
          setTimeout(() => {
            setXpGained(totalXP);
            setShowXPAnimation(true);
          }, 1000);
        }
      } else {
        // Continuer avec le mot suivant
        const nextWord = newQueue[0];
        const newOptions = generateStableOptions(nextWord, currentWords);
        setStableOptions(newOptions);

        const nextWordData = currentWords.find(word => word.word === nextWord);
        if (nextWordData?.audio) {
          playAudio(nextWordData.audio).catch(console.error);
        }
      }
    }, 1500);
  }, [mode, testQueue, currentWords, generateStableOptions, playAudio]);

  // Sauvegarder les améliorations et nettoyer les mots maîtrisés
  const handleSaveImprovements = useCallback(() => {
    const masteredWords: string[] = [];
    const improvedWordsData: LearnedWord[] = [];
    
    Object.entries(testScoresRef.current).forEach(([word, score]) => {
      if (score >= TESTS_PER_WORD) {
        masteredWords.push(word);
        
        const wordData = currentWords.find(w => w.word === word);
        if (wordData) {
          improvedWordsData.push({
            word: cleanParentheses(word),
            category: wordData.category,
            subcategory: wordData.subcategory || '',
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

    if (masteredWords.length > 0) {
      // Supprimer les mots maîtrisés de la liste des mots difficiles
      const difficultWordsKey = `${languageCode}-difficultWords`;
      const updatedDifficultWords = difficultWords.filter(
        word => !masteredWords.includes(word.word)
      );
      
      localStorage.setItem(difficultWordsKey, JSON.stringify(updatedDifficultWords));
      
      console.log('Mots améliorés et supprimés des mots difficiles:', masteredWords);
      
      // Notifier les mots améliorés
      if (onWordsImproved) {
        onWordsImproved(improvedWordsData);
      }
    }

    // Retourner aux catégories
    onBackToCategories();
  }, [currentWords, difficultWords, languageCode, onWordsImproved, onBackToCategories]);

  // Redémarrer une nouvelle session
  const handleStartNewSession = useCallback(() => {
    loadDifficultWords();
    setMode('preview');
    setCurrentWordIndex(0);
    setTestQueue([]);
    setTestScores({});
    setSelectedAnswer(null);
    setFeedback(null);
    setStableOptions([]);
    setShowXPAnimation(false);
    setXpGained(0);
    testScoresRef.current = {};
  }, [loadDifficultWords]);

  // Calculer les statistiques du résumé
  const summaryStats = useMemo(() => {
    const currentTestScores = testScoresRef.current;
    const totalScore = Object.values(currentTestScores).reduce((sum: number, score: number) => sum + score, 0);
    const maxScore = Object.keys(currentTestScores).length * TESTS_PER_WORD;
    const accuracy = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const masteredCount = Object.values(currentTestScores).filter(score => score >= TESTS_PER_WORD).length;
    const totalXPGained = masteredCount * XP_PER_WORD;

    return { totalScore, maxScore, accuracy, masteredCount, totalXPGained };
  }, [testScores]);

  // Affichage si aucun mot difficile
  if (!isLoading && difficultWords.length === 0) {
    return (
      <div className={`difficult-words-mode ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <div className="difficult-words-header">
          <motion.button
            onClick={onBackToCategories}
            className="back-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            <span>Retour</span>
          </motion.button>
          <h2>Mots Difficiles</h2>
        </div>
        
        <div className="no-difficult-words">
          <div className="no-words-icon">🎉</div>
          <h3>Aucun mot difficile !</h3>
          <p>Vous n'avez actuellement aucun mot marqué comme difficile. Continuez votre apprentissage pour identifier les mots qui nécessitent plus de pratique.</p>
          <motion.button
            onClick={onBackToCategories}
            className="back-to-categories-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Retour aux catégories
          </motion.button>
        </div>
      </div>
    );
  }

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className={`difficult-words-mode ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des mots difficiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`difficult-words-mode ${theme === 'dark' ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="difficult-words-header">
        <motion.button
          onClick={onBackToCategories}
          className="back-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          <span>Retour</span>
        </motion.button>
        <h2>Mots Difficiles</h2>
        <div className="difficult-words-info">
       
          <span>{difficultWords.length} mots à réviser</span>
        </div>
      </div>

      {/* Mode Preview */}
      {mode === 'preview' && (
        <div className="difficult-words-main">
          <div className="difficult-word-card">
            <div className="word-difficulty-info">
              <span className="difficulty-badge">
                {currentWords[currentWordIndex]?.failureCount || 0} échecs
              </span>
            </div>
            
            <h3>{cleanParentheses(currentWords[currentWordIndex]?.word || '')}</h3>
            
            <p className="word-translation">
              {currentWords[currentWordIndex]?.translation}
            </p>
            
            {currentWords[currentWordIndex]?.explanation && (
              <p className="word-explanation">
                {currentWords[currentWordIndex].explanation}
              </p>
            )}

            {currentWords[currentWordIndex]?.example && (
              <p className="word-example">
                <strong>Exemple : </strong>
                {currentWords[currentWordIndex].example}
              </p>
            )}
            
            {currentWords[currentWordIndex]?.audio && (
              <motion.button 
                onClick={() => playAudio(currentWords[currentWordIndex].audio!)}
                className="audio-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={32} />
              </motion.button>
            )}
          </div>

          <div className="progress-section">
            <div className="progress-text">
              {currentWordIndex + 1}/{currentWords.length}
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentWordIndex + 1) / currentWords.length) * 100}%` }}
              />
            </div>
          </div>

          <motion.button
            onClick={handleNextWord}
            className="next-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentWordIndex === currentWords.length - 1 ? "Commencer le test" : "Suivant"}
          </motion.button>
        </div>
      )}

      {/* Mode Test */}
      {mode === 'test' && (
        <div className="difficult-words-test">
          <div className="test-info">
            <div className="progress-pie-container">
              <ProgressPie 
                progress={(testScoresRef.current[testQueue[0]] || 0) / TESTS_PER_WORD} 
                size={48} 
              />
            </div>
            <span>{testQueue.length} questions restantes</span>
          </div>
          
          <div className="test-question">
            <h3>{cleanParentheses(testQueue[0] || '')}</h3>
            <p>Quelle est la traduction ?</p>
            
            {currentWords.find(word => word.word === testQueue[0])?.audio && (
              <motion.button 
                onClick={() => {
                  const wordData = currentWords.find(word => word.word === testQueue[0]);
                  if (wordData?.audio) {
                    playAudio(wordData.audio);
                  }
                }}
                className="audio-button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Volume2 size={24} />
              </motion.button>
            )}
          </div>
          
          <div className="test-options">
            {stableOptions.map((option, index) => (
              <motion.button
                key={`${option}-${index}`}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedAnswer}
                className={`test-option ${
                  selectedAnswer === option ? 'selected' : ''
                } ${
                  feedback && option === currentWords.find(word => word.word === testQueue[0])?.translation 
                    ? 'correct' 
                    : ''
                } ${
                  feedback && selectedAnswer === option && 
                  option !== currentWords.find(word => word.word === testQueue[0])?.translation 
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
          
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`test-feedback ${feedback.startsWith('Correct') ? 'correct' : 'incorrect'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mode Summary */}
      {mode === 'summary' && (
        <div className="difficult-words-summary">
          <h2 className="summary-title">📊 Résumé de la session</h2>
          
          {/* Animation XP */}
          <XPAnimation
            xpGained={xpGained}
            showAnimation={showXPAnimation}
            onAnimationComplete={() => {}}
            variant="large"
            className="success pulse"
          />
          
          {/* Statistiques */}
          <div className="summary-stats">
            <p>Score total : {summaryStats.totalScore}/{summaryStats.maxScore}</p>
            <div className="summary-progress-bar">
              <div 
                className="summary-progress-fill"
                style={{ width: `${(summaryStats.totalScore / summaryStats.maxScore) * 100}%` }}
              />
            </div>
            <p>Précision : {summaryStats.accuracy}%</p>
            <p>Mots améliorés : {summaryStats.masteredCount}/{Object.keys(testScores).length}</p>
            
            {summaryStats.totalXPGained > 0 && (
              <p className="xp-summary">
                🏆 <strong>{summaryStats.totalXPGained} XP</strong> gagnés !
              </p>
            )}
          </div>

          {/* Détail des mots */}
          <div className="summary-words">
            <h3>📝 Détail des mots :</h3>
            {Object.entries(testScores).map(([word, score]) => (
              <div key={word} className="summary-word">
                <span>{cleanParentheses(word)}</span>
                <div className="word-score">
                  <span>{score}/{TESTS_PER_WORD}</span>
                  {score === TESTS_PER_WORD ? (
                    <CheckCircle className="icon-success" />
                  ) : (
                    <XCircle className="icon-error" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="summary-actions">
            <motion.button
              onClick={handleSaveImprovements}
              className="save-improvements-button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sauvegarder les améliorations
            </motion.button>
            
            {difficultWords.length > currentWords.length && (
              <motion.button
                onClick={handleStartNewSession}
                className="new-session-button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
              
                Nouvelle session
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DifficultWordsMode;