import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import './QuizComponent.css';
import { LanguageCode } from '../../types/types';
import { cleanParentheses } from '../../utils/cleanParentheses';
// ✅ AJOUT: Import du hook useSupabaseAudio
import { useSupabaseAudio } from '../../hooks/useSupabaseAudio';

interface Word {
  original: string;
  translation: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizComponentProps {
  languageCode: LanguageCode;
  words: Record<string, Word[]>;
  onComplete: (score: number) => void;
  onAnswerSubmit: (correct: boolean) => void;
  backgroundAudioUrl: string;
  correctAnswerSoundUrl: string;
  wrongAnswerSoundUrl: string;
  onGameFinished: () => void;
  isMobileView?: boolean;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  languageCode,
  words,
  onComplete,
  onAnswerSubmit,
  backgroundAudioUrl,
  correctAnswerSoundUrl,
  wrongAnswerSoundUrl,
  onGameFinished,
  isMobileView = false
}) => {
  const { theme } = useTheme();
  
  // ✅ AJOUT: Utilisation du hook useSupabaseAudio pour la lecture audio
  const { playWord } = useSupabaseAudio(languageCode);
  
  // Détection automatique de la vue mobile
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const effectiveIsMobileView = isMobileView || isMobile;
  
  // États du quiz
  const [quizQuestion, setQuizQuestion] = useState<QuizQuestion | null>(null);
  const [nextQuestion, setNextQuestion] = useState<QuizQuestion | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAnswerAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAnswerAudioRef = useRef<HTMLAudioElement | null>(null);
  const lifeLostRef = useRef(false);
  const nextQuestionTimeoutRef = useRef<NodeJS.Timeout>();
  const timerIntervalRef = useRef<NodeJS.Timeout>();

  // Initialisation audio
  useEffect(() => {
    backgroundAudioRef.current = new Audio(backgroundAudioUrl);
    correctAnswerAudioRef.current = new Audio(correctAnswerSoundUrl);
    wrongAnswerAudioRef.current = new Audio(wrongAnswerSoundUrl);
    
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.loop = true;
      backgroundAudioRef.current.volume = 0.5;
    }
    
    if (correctAnswerAudioRef.current) {
      correctAnswerAudioRef.current.volume = 0.7;
    }
    
    if (wrongAnswerAudioRef.current) {
      wrongAnswerAudioRef.current.volume = 0.7;
    }
    
    return () => {
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.pause();
        backgroundAudioRef.current = null;
      }
      if (correctAnswerAudioRef.current) {
        correctAnswerAudioRef.current.pause();
        correctAnswerAudioRef.current = null;
      }
      if (wrongAnswerAudioRef.current) {
        wrongAnswerAudioRef.current.pause();
        wrongAnswerAudioRef.current = null;
      }
    };
  }, [backgroundAudioUrl, correctAnswerSoundUrl, wrongAnswerSoundUrl]);


  const allWords = useMemo(() => {
  
    
    const flatWords = Object.values(words).flat();
  
    
    const filteredWords = flatWords.filter((word, index) => {
     
      
      if (!word) {
      
        return false;
      }
      
      if (!word.original || !word.translation) {
      
        return false;
      }
      
      if (typeof word.original !== 'string' || typeof word.translation !== 'string') {
      
        return false;
      }
      
      if (word.original.includes('_category') || word.translation.includes('_category')) {
        
        return false;
      }
      
      if (word.original.trim() === '' || word.translation.trim() === '') {
        
        return false;
      }
      
      
      return true;
    });
    

    
    return filteredWords;
  }, [words]);

  // ✅ AJOUT: Fonction pour jouer l'audio du mot de la question
  const playQuestionAudio = useCallback(async () => {
    if (!quizQuestion || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      await playWord(quizQuestion.question);
    } catch (error) {
      console.error('Erreur lors de la lecture audio de la question:', error);
    } finally {
      setIsPlayingAudio(false);
    }
  }, [quizQuestion, playWord, isPlayingAudio]);

  // ✅ MODIFICATION: Jouer l'audio automatiquement quand une nouvelle question apparaît
  useEffect(() => {
    if (quizQuestion && gameStarted && !showAnswer && !isTransitioning) {
      // Jouer l'audio du mot après un court délai
      const audioTimeout = setTimeout(() => {
        playQuestionAudio();
      }, 500);
      
      return () => clearTimeout(audioTimeout);
    }
  }, [quizQuestion, gameStarted, showAnswer, isTransitioning, playQuestionAudio]);

  // Génération de question avec logs détaillés
  const generateQuizQuestion = useCallback((preload = false) => {
   
    
    if (allWords.length < 4) {
    
      return null;
    }
    
    // Sélectionner le mot correct
    const correctWordIndex = Math.floor(Math.random() * allWords.length);
    const correctWord = allWords[correctWordIndex];
    

    // Générer les options incorrectes
    const usedTranslations = new Set([correctWord.translation]);
    const options: string[] = [correctWord.translation];
    
    
    
    let attempts = 0;
    const maxAttempts = 200;
    
    while (options.length < 4 && attempts < maxAttempts) {
      const randomIndex = Math.floor(Math.random() * allWords.length);
      const randomWord = allWords[randomIndex];
      
      if (randomWord && 
          randomWord.translation && 
          typeof randomWord.translation === 'string' &&
          randomWord.translation.trim() !== '' &&
          !usedTranslations.has(randomWord.translation)) {
        
       
        options.push(randomWord.translation);
        usedTranslations.add(randomWord.translation);
      }
      
      attempts++;
      
      if (attempts % 50 === 0) {
        
      }
    }
    

    
    if (options.length < 4) {
     
      return null;
    }
    
    // Mélanger les options
    const shuffledOptions = [...options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    const newQuestion: QuizQuestion = {
      question: correctWord.original,
      options: shuffledOptions,
      correctAnswer: correctWord.translation,
    };
    
    

    if (preload) {
     
      setNextQuestion(newQuestion);
      return newQuestion;
    }
    
    
    setIsLoadingQuestion(true);
    
    setTimeout(() => {
      setQuizQuestion(newQuestion);
      setQuestionKey(prev => prev + 1);
      setTimer(10);
      setSelectedAnswer(null);
      setShowAnswer(false);
      lifeLostRef.current = false;
      setIsLoadingQuestion(false);
      
    
      // Précharger la prochaine question
      setTimeout(() => {
        generateQuizQuestion(true);
      }, 1000);
      
      // Jouer l'audio de fond
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(error => {
          console.error('Error playing background audio:', error);
        });
      }
    }, 50);
    
    return newQuestion;
  }, [allWords]);

  // Transition vers la prochaine question
  const moveToNextQuestion = useCallback(() => {
   
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (nextQuestion) {
      
        setQuizQuestion(nextQuestion);
        setNextQuestion(null);
        setQuestionKey(prev => prev + 1);
        generateQuizQuestion(true);
      } else {
        
        generateQuizQuestion();
      }
      
      setTimer(10);
      setSelectedAnswer(null);
      setShowAnswer(false);
      setIsTransitioning(false);
      lifeLostRef.current = false;
      
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.currentTime = 0;
        backgroundAudioRef.current.play().catch(error => {
          console.error('Error playing background audio:', error);
        });
      }
    }, 300);
  }, [nextQuestion, generateQuizQuestion]);

  const handleQuizAnswer = useCallback(
    (answer: string) => {
      if (!quizQuestion || showAnswer || isTransitioning) return;

     

      clearTimeout(nextQuestionTimeoutRef.current);
      clearInterval(timerIntervalRef.current);
      
      setSelectedAnswer(answer);
      setShowAnswer(true);
      
      if (backgroundAudioRef.current && !backgroundAudioRef.current.paused) {
        backgroundAudioRef.current.pause();
      }

      const isCorrect = answer === quizQuestion.correctAnswer;
      const isTimeout = answer === '';
      
      onAnswerSubmit(isCorrect);

      if (isCorrect) {
        setQuizScore(prev => prev + 1);
        setStreak(prev => {
          const newStreak = prev + 1;
          setBestStreak(current => Math.max(current, newStreak));
          return newStreak;
        });
        
        if (correctAnswerAudioRef.current) {
          correctAnswerAudioRef.current.currentTime = 0;
          correctAnswerAudioRef.current.play().catch(console.error);
        }
      } else {
        if (!lifeLostRef.current) {
          setLives(prev => prev - 1);
          lifeLostRef.current = true;
        }
        setStreak(0);
        
        if (!isTimeout && wrongAnswerAudioRef.current) {
          wrongAnswerAudioRef.current.currentTime = 0;
          wrongAnswerAudioRef.current.play().catch(console.error);
        }
      }

      nextQuestionTimeoutRef.current = setTimeout(() => {
        if (lives > 1 || (lives === 1 && isCorrect)) {
          moveToNextQuestion();
        } else {
          setGameOver(true);
        }
      }, 1200);
    },
    [quizQuestion, showAnswer, lives, onAnswerSubmit, moveToNextQuestion, isTransitioning]
  );

  const handleStartQuiz = useCallback(() => {
    
    setGameStarted(true);
    setIsLoadingQuestion(true); // Activer le loading immédiatement
    
    // Lancer directement le quiz sans décompte
    setTimeout(() => {
      generateQuizQuestion();
    }, 100);
  }, [generateQuizQuestion, allWords.length]);

  const handleBackToMenu = useCallback(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause();
    }
    if (correctAnswerAudioRef.current) {
      correctAnswerAudioRef.current.pause();
    }
    if (wrongAnswerAudioRef.current) {
      wrongAnswerAudioRef.current.pause();
    }
    
    clearTimeout(nextQuestionTimeoutRef.current);
    clearInterval(timerIntervalRef.current);
    
    onGameFinished();
  }, [onGameFinished]);

  const AdaptiveBackButton: React.FC<{
    onBack: () => void;
    isMobileView?: boolean;
    title?: string;
  }> = ({ onBack, isMobileView = false, title }) => {
    
    if (isMobileView) {
      return (
        <div className="grammar-header mobile-layout">
          <motion.button
            onClick={onBack}
            className="mobile-header-back-button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Retour"
            style={{
              display: 'flex',
              visibility: 'visible',
              opacity: 1
            }}
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
        onClick={onBack}
        className="modern-back-button"
        whileHover={{ scale: 1.05, x: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronLeft size={20} />
        <span>Retour</span>
      </motion.button>
    );
  };

  // Timer - Sans décompte
  useEffect(() => {
    if (timer > 0 && !gameOver && !showAnswer && gameStarted && !isTransitioning && quizQuestion) {
      
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev === 1) {
            if (backgroundAudioRef.current) {
              backgroundAudioRef.current.pause();
            }
            if (wrongAnswerAudioRef.current) {
              wrongAnswerAudioRef.current.currentTime = 0;
              wrongAnswerAudioRef.current.play().catch(console.error);
            }
            
            handleQuizAnswer('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      console.log('⏰ [DEBUG] Timer not started, conditions:', {
        timer,
        gameOver,
        showAnswer,
        gameStarted,
        isTransitioning,
        hasQuestion: !!quizQuestion
      });
      clearInterval(timerIntervalRef.current);
    }
    
    return () => clearInterval(timerIntervalRef.current);
  }, [timer, gameOver, handleQuizAnswer, showAnswer, gameStarted, isTransitioning, quizQuestion]);

  // Nettoyage
  useEffect(() => {
    return () => {
      clearTimeout(nextQuestionTimeoutRef.current);
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  const handleRetry = useCallback(() => {
    setQuizScore(0);
    setLives(3);
    setGameOver(false);
    setStreak(0);
    setBestStreak(0);
    setTimer(10);
    setGameStarted(true);
    setIsTransitioning(false);
    setQuestionKey(0);
    setNextQuestion(null);
    setQuizQuestion(null);
    setIsLoadingQuestion(true); // Activer le loading pour retry aussi
    
    // Lancer directement une nouvelle question
    setTimeout(() => {
      generateQuizQuestion();
    }, 100);
  }, [generateQuizQuestion]);

  // Animations
  const containerVariants = {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -20 }
  };

  const questionVariants = {
    initial: { opacity: 0, x: 30, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -30, scale: 0.95 }
  };

  const optionVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    tap: { scale: 0.98 }
  };

  // Écran Game Over
  if (gameOver) {
    return (
      <div className="quiz-force-center" data-theme={theme}>
        <motion.div 
          className="quiz-container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
        >
          {effectiveIsMobileView ? (
            <AdaptiveBackButton 
              onBack={handleBackToMenu}
              isMobileView={true}
              title="Game Over!"
            />
          ) : (
            <div className="header-section">
              <AdaptiveBackButton 
                onBack={handleBackToMenu}
                isMobileView={false}
              />
              <div style={{ width: '100px' }}></div>
            </div>
          )}
          
          <div className="quiz-gameover-container">
            {!effectiveIsMobileView && <h2 className="quiz-gameover-title">Game Over!</h2>}
            <motion.div 
              className="quiz-gameover-score"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Score Final: {quizScore}
            </motion.div>
            <motion.div 
              className="quiz-buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button onClick={handleRetry} className="quiz-button">
                Réessayer
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Écran de démarrage
  if (!gameStarted) {
    return (
      <div className="quiz-force-center" data-theme={theme}>
        <motion.div 
          className="quiz-container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5 }}
        >
          {effectiveIsMobileView ? (
            <AdaptiveBackButton 
              onBack={handleBackToMenu}
              isMobileView={true}
              title="Quiz Mode"
            />
          ) : (
            <div className="header-section">
              <AdaptiveBackButton 
                onBack={handleBackToMenu}
                isMobileView={false}
              />
              <div style={{ width: '100px' }}></div>
            </div>
          )}
          
          <div className="quiz-start-container">
            {!effectiveIsMobileView && <h2 className="quiz-title">Quiz Mode</h2>}
            <motion.p 
              className="quiz-description"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Testez vos connaissances en répondant aux questions dans le temps imparti.
              Vous avez 3 vies et 10 secondes pour répondre à chaque question.
            </motion.p>
            <motion.button 
              onClick={handleStartQuiz}
              className="quiz-start-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Commencer le Quiz
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Interface de jeu principale - Lancement direct
  return (
    <div className="quiz-force-center" data-theme={theme}>
      <motion.div 
        className="quiz-container"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        {effectiveIsMobileView ? (
          <AdaptiveBackButton 
            onBack={handleBackToMenu}
            isMobileView={true}
            title="Quiz Mode"
          />
        ) : (
          <div className="header-section">
            <AdaptiveBackButton 
              onBack={handleBackToMenu}
              isMobileView={false}
            />
            <div style={{ width: '100px' }}></div>
          </div>
        )}
        
        {!effectiveIsMobileView && <h2 className="quiz-title">Quiz Mode</h2>}
        
        <motion.div 
          className="quiz-score"
          key={quizScore}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
        >
          Score: {quizScore}
        </motion.div>
        
        <div className="quiz-info">
          <div className="quiz-timer">
            <motion.div 
              animate={timer <= 3 ? { scale: [1, 1.1, 1], color: ['#fff', '#ff6b6b', '#fff'] } : {}}
              transition={{ repeat: timer <= 3 ? Infinity : 0, duration: 0.5 }}
            >
              Temps: {timer}s
            </motion.div>
          </div>
          <div className="quiz-lives">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 1 }}
                animate={i >= lives ? { scale: [1, 1.2, 0.8], opacity: [1, 0.5, 0.3] } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Heart 
                  fill={i < lives ? "#e74c3c" : "none"}
                  color={i < lives ? "#e74c3c" : "#bdc3c7"}
                  size={24}
                  className="heart"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="quiz-question-container">
          {quizQuestion && !isLoadingQuestion ? (
            <motion.div
              key={questionKey}
              variants={questionVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="quiz-content"
            >
              <motion.h3 
                className="quiz-question"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Que signifie "{cleanParentheses(quizQuestion.question)}" ?
                {/* ✅ AJOUT: Bouton pour rejouer l'audio */}
                <motion.button
                  onClick={playQuestionAudio}
                  className="quiz-audio-replay-button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isPlayingAudio}
                  style={{
                    marginLeft: '10px',
                    padding: '5px 10px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '5px',
                    cursor: isPlayingAudio ? 'wait' : 'pointer',
                    opacity: isPlayingAudio ? 0.5 : 1
                  }}
                >
                  {isPlayingAudio ? '🔊' : '🔈'}
                </motion.button>
              </motion.h3>
              
              <div className="quiz-options">
               
                {quizQuestion.options && Array.isArray(quizQuestion.options) && quizQuestion.options.length === 4 ? (
                  quizQuestion.options.map((option, index) => {
                 
                    
                    if (!option || typeof option !== 'string' || option.trim() === '') {
                      
                      return (
                        <div 
                          key={`invalid-${index}`}
                          className="quiz-option"
                          style={{ 
                            background: '#ff4444', 
                            color: 'white',
                            fontSize: '12px'
                          }}
                        >
                          OPTION INVALIDE {index}
                        </div>
                      );
                    }
                    
                    return (
                      <motion.button
                        key={`${questionKey}-${index}-${option}`}
                        onClick={() => {
                          
                          if (!showAnswer && !isTransitioning) {
                            handleQuizAnswer(option);
                          }
                        }}
                        className={`quiz-option ${
                          showAnswer
                            ? option === quizQuestion.correctAnswer
                              ? 'correct'
                              : option === selectedAnswer
                              ? 'incorrect'
                              : ''
                            : ''
                        }`}
                        disabled={showAnswer || isTransitioning}
                        variants={optionVariants}
                        initial="initial"
                        animate="animate"
                        whileHover={!showAnswer && !isTransitioning ? "hover" : {}}
                        whileTap={!showAnswer && !isTransitioning ? "tap" : {}}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        style={{
                          minHeight: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid #8b4513',
                          borderRadius: '8px',
                          padding: '10px',
                          background: showAnswer 
                            ? (option === quizQuestion.correctAnswer 
                              ? '#22c55e' 
                              : option === selectedAnswer 
                              ? '#ef4444' 
                              : 'linear-gradient(135deg, #8b4513, #5d3317)')
                            : 'linear-gradient(135deg, #8b4513, #5d3317)',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: showAnswer || isTransitioning ? 'default' : 'pointer'
                        }}
                      >
                        {option}
                      </motion.button>
                    );
                  })
                ) : (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    textAlign: 'center', 
                    color: '#ef4444',
                    fontSize: '16px',
                    fontWeight: '600',
                    padding: '20px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: '2px solid #ef4444'
                  }}>
                    ❌ ERREUR CRITIQUE: Options manquantes ou invalides
                    <br />
                    <small>
                      Options reçues: {quizQuestion.options ? JSON.stringify(quizQuestion.options) : 'null'}
                      <br />
                      Type: {typeof quizQuestion.options}
                      <br />
                      Array: {Array.isArray(quizQuestion.options) ? 'Oui' : 'Non'}
                      <br />
                      Longueur: {quizQuestion.options?.length || 'N/A'}
                    </small>
                  </div>
                )}
              </div>
            </motion.div>
          ) : isLoadingQuestion ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="quiz-loading"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
                fontSize: '18px',
                color: 'var(--grammar-dark-text)'
              }}
            >
              ⏳ Chargement de la question...
            </motion.div>
          ) : (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              fontSize: '18px',
              color: 'var(--grammar-dark-text)',
              textAlign: 'center',
              padding: '20px'
            }}>
              ⏳ Préparation du quiz...
            </div>
          )}
        </div>

        <AnimatePresence>
          {showAnswer && (
            <motion.div
              className={`quiz-feedback ${selectedAnswer === quizQuestion?.correctAnswer ? 'correct' : 'incorrect'}`}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                rotateX: [0, -10, 0]
              }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{ 
                duration: 0.4,
                ease: "backOut"
              }}
              style={{
                position: 'fixed',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                textAlign: 'center',
                minWidth: effectiveIsMobileView ? '140px' : '120px',
                maxWidth: effectiveIsMobileView ? '90vw' : '300px',
                bottom: effectiveIsMobileView ? '80px' : '120px'
              }}
            >
              {selectedAnswer === quizQuestion?.correctAnswer ? 'Correct !' : 'Incorrect !'}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default QuizComponent;