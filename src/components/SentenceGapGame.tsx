import React, { useState, useEffect, useCallback } from 'react';
import type { LanguageCode, LearnedWord, RevisionSentence } from '../types/types';
import { getLanguageData } from '../data/languages';
import { useAudio, useUserProgress } from '../hooks/hooks';
import { useRevisionProgress } from '../hooks/useRevisionProgress';
import { useTheme } from './ThemeContext';
import { ArrowLeft, RotateCw, CheckCircle, XCircle } from 'lucide-react';

import { 
  normalizeText, 
  calculateSimilarity, 
  SentenceWithGap 
} from '../utils/sentencesgapUtils';
import './SentenceGap.css';

interface SentenceGapGameProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onGameComplete: () => void;
  onAnswer?: (correct: boolean) => void;
  isMobileView?: boolean;
}

// Interface pour les tentatives de phrases
interface SentenceAttempt {
  sentence: string;
  translation: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  category?: string;
  timestamp: number;
}

interface GameStats {
  correct: number;
  incorrect: number;
  startTime: number;
  seriesCompleted: number;
  lastSeriesTime: number | null;
  currentSeriesAttempts: SentenceAttempt[];
}

// Constantes
const SCORE_TO_COMPLETE = 20;
const PHRASES_PER_SERIES = 10; // Nombre de phrases par série

const SentenceGapGame: React.FC<SentenceGapGameProps> = ({
  languageCode,
  onBackToCategories,
  onGameComplete,
  onAnswer,
  isMobileView = false
}) => {
  const { theme } = useTheme();
  const [currentSentence, setCurrentSentence] = useState<SentenceWithGap | null>(null);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isClose, setIsClose] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    startTime: Date.now(),
    seriesCompleted: 0,
    lastSeriesTime: null,
    currentSeriesAttempts: []
  });
  
  // État pour afficher le temps de la série
  const [displaySeriesTime, setDisplaySeriesTime] = useState<boolean>(false);
  const [currentSeriesCount, setCurrentSeriesCount] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const playAudio = useAudio();
  const languageData = getLanguageData(languageCode);
  const { userProgress } = useUserProgress(languageCode, '');
  const { getSessionWords } = useRevisionProgress(languageCode);
  const [showChronometer, setShowChronometer] = useState<boolean>(false);
  const [showStartScreen, setShowStartScreen] = useState<boolean>(true);
  

  const startTest = () => {
    setShowStartScreen(false);
    // Réinitialiser les statistiques et le chronomètre
    setGameStats(prev => ({
      ...prev,
      startTime: Date.now(),
      correct: 0,
      incorrect: 0,
      currentSeriesAttempts: []
    }));
    setCurrentSeriesCount(0);
    setScore(0);
    setStreak(0);
    // Charger la première phrase
    getNextSentence();
  };

  // Récupérer uniquement les mots révisés
  const getRevisedWords = useCallback((): Set<string> => {
    // Obtenir l'historique des sessions de révision
    const sessionHistory = getSessionWords();
    const revisedWords = new Set<string>();
    
    // 1. Ajouter les mots qui ont été révisés correctement
    sessionHistory.forEach(item => {
      if (item.isCorrect && !('grammarType' in item)) {
        // Vérification plus sûre pour la propriété isSentence
        const isSentence = 'isSentence' in item ? item.isSentence : false;
        
        if (!isSentence) {
          revisedWords.add(item.word);
        }
      }
    });
    
    // 2. Ajouter les mots appris normalement depuis userProgress
    Array.from(userProgress.learnedWords).forEach(word => {
      revisedWords.add(word);
    });
  
    // 3. Ajouter aussi les mots récemment appris s'ils existent
    if (userProgress.recentlyLearnedWords && userProgress.recentlyLearnedWords.length > 0) {
      userProgress.recentlyLearnedWords.forEach(learnedWord => {
        revisedWords.add(learnedWord.word);
      });
    }
    
    return revisedWords;
  }, [getSessionWords, userProgress]);

  const normalizeForComparison = (word: string): string => {
    return word.toLowerCase().replace(/_/g, ' ').trim();
  };

  // Récupérer les phrases du sentencesGap filtré par mots révisés
  const getSentencesGapPhrases = useCallback((): RevisionSentence[] => {
    const revisedWords = getRevisedWords();
    const allPhrases: RevisionSentence[] = [];
  
    if (!languageData.sentencesGap) {
      console.log("Structure de sentencesGap:", languageData.sentencesGap);
      console.log("Mots révisés:", Array.from(revisedWords));
      return [];
    }
    
    // Journalisation pour débogage
    console.log("Clés dans sentencesGap:", Object.keys(languageData.sentencesGap));
    console.log("Mots révisés:", Array.from(revisedWords));
    
    // Filtrer les phrases qui contiennent au moins un mot révisé
    Object.entries(languageData.sentencesGap).forEach(([word, sentencesList]) => {
      // Normaliser le mot clé
      const normalizedWord = normalizeForComparison(word);
      
      // Vérifier si ce mot normalisé est dans les mots révisés
      const wordIsRevised = Array.from(revisedWords).some(revisedWord => 
        normalizeForComparison(revisedWord) === normalizedWord
      );
      
      if (wordIsRevised) {
        sentencesList.forEach(sentence => {
          allPhrases.push({
            ...sentence,
            testWord: word
          });
        });
      } else {
        // Recherche des mots révisés dans cette phrase
        sentencesList.forEach(sentence => {
          const sentenceWords = sentence.original.split(' ');
          
          // Trouver les mots révisés dans cette phrase
          const revisedWordsInSentence = sentenceWords
            .filter(sentenceWord => {
              const cleanWord = normalizeForComparison(
                sentenceWord.replace(/[.,;!?()[\]{}'"]/g, '')
              );
              return Array.from(revisedWords).some(revisedWord => 
                normalizeForComparison(revisedWord) === cleanWord
              );
            })
            .map(w => w.replace(/[.,;!?()[\]{}'"]/g, ''));
          
          if (revisedWordsInSentence.length > 0) {
            allPhrases.push({
              ...sentence,
              testWord: revisedWordsInSentence[Math.floor(Math.random() * revisedWordsInSentence.length)]
            });
          }
        });
      }
    });
    
    console.log("Phrases trouvées:", allPhrases.length);
    return allPhrases;
  }, [languageData, getRevisedWords]);

  // Fonction pour obtenir la catégorie d'un mot
  const getWordCategory = useCallback((word: string): string | undefined => {
    for (const [category, words] of Object.entries(languageData.categories)) {
      if (Object.keys(words).includes(word)) {
        return category;
      }
    }
    return undefined;
  }, [languageData.categories]);

  // Fonction principale qui génère une nouvelle phrase à trous
  
const getNextSentence = useCallback(() => {
  try {
    const sentencesGapPhrases = getSentencesGapPhrases();
    
    if (sentencesGapPhrases.length > 0) {
      // Choisir une phrase aléatoire dans la collection
      const randomIndex = Math.floor(Math.random() * sentencesGapPhrases.length);
      const sentence = sentencesGapPhrases[randomIndex];
      
      if (!sentence) {
        console.error("Aucune phrase trouvée à l'index", randomIndex);
        setCurrentSentence({
          original: "Aucune phrase trouvée",
          french: "Veuillez réessayer",
          displayText: "Aucune phrase trouvée",
          gapWord: "",
          category: ""
        });
        return;
      }
      
      // Générer la phrase à trous spécifiquement avec le mot révisé à tester
      const original = sentence.original;
      let displayText = original;
      const testWord = sentence.testWord || '';
      
      // Remplacer l'occurrence du mot à tester par des tirets
      if (testWord) {
        try {
          // Créer une expression régulière qui inclut les limites de mot
          const regex = new RegExp(`\\b${testWord}\\b`, 'i');
          displayText = original.replace(regex, '_____');
        } catch (e) {
          console.error("Erreur dans l'expression régulière:", e);
          displayText = original;
        }
      } else {
        displayText = original;
      }
      
      setCurrentSentence({
        original: sentence.original,
        french: sentence.french,
        displayText,
        gapWord: testWord || '',
        audio: sentence.audio,
        category: getWordCategory(testWord),
        isRevisionSentence: true
      });
      
      setUserInput('');
      setFeedback('');
      setIsClose(false);
    } else {
      // Si aucune phrase disponible dans sentencesGap
      console.warn("Aucune phrase disponible avec les mots révisés");
      setCurrentSentence({
        original: "Aucune phrase avec vos mots révisés",
        french: "Révisez plus de mots de la partie Grammaire pour débloquer des phrases",
        displayText: "Aucune phrase avec vos mots révisés",
        gapWord: "",
        category: ""
      });
    }
  } catch (error) {
    console.error("Erreur dans getNextSentence:", error);
    setCurrentSentence({
      original: "Une erreur s'est produite",
      french: "Veuillez réessayer",
      displayText: "Une erreur s'est produite",
      gapWord: "",
      category: ""
    });
  }
}, [getSentencesGapPhrases, getWordCategory]);

  // Fonction pour démarrer une nouvelle série
  const startNewSeries = () => {
    setShowSummary(false);
    setCurrentSeriesCount(0);
    setGameStats(prev => ({
      ...prev,
      startTime: Date.now(),
      currentSeriesAttempts: []
    }));
    getNextSentence();
  };
  
  // Fonction pour formatter le temps au format mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  // Calculer les statistiques de la série actuelle
  const seriesStats = {
    totalAttempts: gameStats.currentSeriesAttempts.length,
    correctAttempts: gameStats.currentSeriesAttempts.filter(a => a.isCorrect).length,
    accuracy: gameStats.currentSeriesAttempts.length > 0
      ? Math.round((gameStats.currentSeriesAttempts.filter(a => a.isCorrect).length / gameStats.currentSeriesAttempts.length) * 100)
      : 0,
    duration: gameStats.lastSeriesTime || Math.floor((Date.now() - gameStats.startTime) / 1000)
  };

  useEffect(() => {
    getNextSentence();
    
    // Initialiser le chronomètre
    setGameStats(prev => ({
      ...prev,
      startTime: Date.now()
    }));
    setCurrentSeriesCount(0);
  }, [getNextSentence]);
  
  // Mettre à jour le chronomètre toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSeriesCount < PHRASES_PER_SERIES && !showSummary) {
        const elapsed = Math.floor((Date.now() - gameStats.startTime) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameStats.startTime, currentSeriesCount, showSummary]);

  // Ajouter les styles CSS pour l'écran de résumé
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Styles pour l'écran de résumé de la série */
      .series-summary-container {
        padding: 20px;
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
      }
      
      .series-summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .summary-stat-item {
        background-color: #f8fafc;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        border-top: 4px solid #4f46e5;
        transition: transform 0.2s ease;
      }
      
      .summary-stat-item:hover {
        transform: translateY(-4px);
      }
      
      .dark-mode .summary-stat-item {
        background-color: #1e293b;
        border-top-color: #6366f1;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      }
      
      .summary-stat-label {
        display: block;
        font-size: 14px;
        color: #64748b;
        margin-bottom: 8px;
      }
      
      .dark-mode .summary-stat-label {
        color: #94a3b8;
      }
      
      .summary-stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #1e293b;
      }
      
      .dark-mode .summary-stat-value {
        color: #f1f5f9;
      }
      
      .summary-section-title {
        font-size: 20px;
        font-weight: 600;
        color: #1e293b;
        margin: 40px 0 20px;
        text-align: center;
        position: relative;
      }
      
      .dark-mode .summary-section-title {
        color: #f8fafc;
      }
      
      .summary-section-title::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background-color: #4f46e5;
        border-radius: 3px;
      }
      
      .dark-mode .summary-section-title::after {
        background-color: #6366f1;
      }
      
      .series-attempts-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 40px;
      }
      
      .attempt-card {
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        border-left: 4px solid #9ca3af;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      .attempt-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
      }
      
      .attempt-card.correct {
        border-left-color: #10b981;
      }
      
      .attempt-card.incorrect {
        border-left-color: #ef4444;
      }
      
      .dark-mode .attempt-card {
        background-color: #1e293b;
        border-left-color: #475569;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      
      .dark-mode .attempt-card.correct {
        border-left-color: #059669;
      }
      
      .dark-mode .attempt-card.incorrect {
        border-left-color: #dc2626;
      }
      
      .attempt-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      
      .dark-mode .attempt-header {
        background-color: #0f172a;
        border-bottom-color: #334155;
      }
      
      .attempt-number {
        font-weight: 600;
        font-size: 14px;
        color: #64748b;
      }
      
      .dark-mode .attempt-number {
        color: #94a3b8;
      }
      
      .attempt-result {
        font-weight: 600;
        font-size: 14px;
        padding: 4px 10px;
        border-radius: 20px;
      }
      
      .attempt-result.correct {
        background-color: #dcfce7;
        color: #059669;
      }
      
      .attempt-result.incorrect {
        background-color: #fee2e2;
        color: #dc2626;
      }
      
      .dark-mode .attempt-result.correct {
        background-color: #064e3b;
        color: #34d399;
      }
      
      .dark-mode .attempt-result.incorrect {
        background-color: #7f1d1d;
        color: #fca5a5;
      }
      
      .attempt-sentence {
        padding: 16px;
        font-size: 18px;
        line-height: 1.5;
        color: #1e293b;
        background-color: #ffffff;
      }
      
      .dark-mode .attempt-sentence {
        color: #f8fafc;
        background-color: #1e293b;
      }
      
      .gap-highlight {
        font-weight: 700;
        color: #4f46e5;
        background-color: #eff6ff;
        padding: 2px 6px;
        border-radius: 4px;
        border-bottom: 2px solid #4f46e5;
      }
      
      .dark-mode .gap-highlight {
        color: #818cf8;
        background-color: #172554;
        border-bottom-color: #6366f1;
      }
      
      .attempt-details {
        padding: 16px;
        background-color: #f8fafc;
        border-top: 1px solid #e2e8f0;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .dark-mode .attempt-details {
        background-color: #0f172a;
        border-top-color: #334155;
      }
      
      .attempt-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .attempt-label {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
      }
      
      .dark-mode .attempt-label {
        color: #94a3b8;
      }
      
      .attempt-value {
        font-size: 14px;
        color: #1e293b;
        padding: 8px 12px;
        background-color: #ffffff;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
      }
      
      .dark-mode .attempt-value {
        color: #f8fafc;
        background-color: #1e293b;
        border-color: #334155;
      }
      
      .attempt-value.correct {
        background-color: #f0fdf4;
        border-color: #bbf7d0;
        color: #10b981;
      }
      
      .dark-mode .attempt-value.correct {
        background-color: #064e3b;
        border-color: #059669;
        color: #34d399;
      }
      
      .attempt-value.incorrect {
        background-color: #fef2f2;
        border-color: #fecaca;
        color: #ef4444;
      }
      
      .dark-mode .attempt-value.incorrect {
        background-color: #7f1d1d;
        border-color: #b91c1c;
        color: #fca5a5;
      }
      
      .attempt-value.category {
        background-color: #f0f9ff;
        border-color: #bae6fd;
        color: #0284c7;
      }
      
      .dark-mode .attempt-value.category {
        background-color: #0c4a6e;
        border-color: #0369a1;
        color: #7dd3fc;
      }
      
      .summary-actions {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 40px;
      }
      
      .new-series-button {
        padding: 16px 20px;
        background-color: #4f46e5;
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);
      }
      
      .new-series-button:hover {
        background-color: #4338ca;
        transform: translateY(-2px);
        box-shadow: 0 6px 10px rgba(79, 70, 229, 0.3);
      }
      
      .dark-mode .new-series-button {
        background-color: #6366f1;
        box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
      }
      
      .dark-mode .new-series-button:hover {
        background-color: #4f46e5;
        box-shadow: 0 6px 10px rgba(99, 102, 241, 0.4);
      }
      
      /* Styles pour le chronomètre et la série */
      .series-time-feedback {
        background-color: #4f46e5 !important;
        color: white !important;
        animation: pulse 1.5s infinite;
        border-left: 4px solid #3730a3 !important;
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
        }
      }
      
      .dark-mode .series-time-feedback {
        background-color: #4338ca !important;
        border-left-color: #3730a3 !important;
      }
      
      /* Mise à jour du style pour l'affichage du score */
      .sentence-gap-score {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 30px;
      }
      
      @media (min-width: 640px) {
        .sentence-gap-score {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      
      .score-item {
        background-color: #f8fafc;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
      }
      
      .score-item:hover {
        transform: translateY(-2px);
      }
      
      .dark-mode .score-item {
        background-color: #1e293b;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      /* Style spécial pour le chronomètre */
      .score-item:nth-child(3) {
        background-color: #eff6ff;
        border-left: 3px solid #3b82f6;
      }
      
      .dark-mode .score-item:nth-child(3) {
        background-color: #172554;
        border-left: 3px solid #60a5fa;
      }
      
      /* Style pour le compteur de phrases */
      .score-item:nth-child(4) {
        background-color: #ecfdf5;
        border-left: 3px solid #10b981;
      }
      
      .dark-mode .score-item:nth-child(4) {
        background-color: #022c22;
        border-left: 3px solid #34d399;
      }

      /* NOUVEAU : Styles pour le bouton retour desktop */
      .desktop-back-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background-color: #f8fafc;
        color: #64748b;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
        width: fit-content;
      }
      
      .desktop-back-button:hover {
        background-color: #e2e8f0;
        color: #475569;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .dark-mode .desktop-back-button {
        background-color: #1e293b;
        color: #94a3b8;
        border-color: #334155;
      }
      
      .dark-mode .desktop-back-button:hover {
        background-color: #334155;
        color: #f1f5f9;
      }

      /* AMÉLIORATION : Positionnement du bouton retour en haut du jeu */
      .sentence-gap-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 0 20px;
      }

      .sentence-gap-header-left {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .sentence-gap-title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #1e293b;
      }

      .dark-mode .sentence-gap-title {
        color: #f8fafc;
      }
      
      /* NOUVEAU : Bouton retour unifié pour desktop et mobile */
      .unified-back-button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background-color: #f8fafc;
        color: #64748b;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-decoration: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 20px;
        width: fit-content;
      }
      
      .unified-back-button:hover {
        background-color: #e2e8f0;
        color: #475569;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .dark-mode .unified-back-button {
        background-color: #1e293b;
        color: #94a3b8;
        border-color: #334155;
      }
      
      .dark-mode .unified-back-button:hover {
        background-color: #334155;
        color: #f1f5f9;
      }

      /* Styles responsifs */
      @media (max-width: 768px) {
        .series-summary-stats {
          grid-template-columns: 1fr;
          gap: 12px;
        }
        
        .attempt-sentence {
          font-size: 16px;
          padding: 12px;
        }
        
        .attempt-header {
          padding: 10px 12px;
        }
        
        .summary-stat-value {
          font-size: 24px;
        }
        
        .summary-section-title {
          font-size: 18px;
          margin: 30px 0 16px;
        }

        .desktop-back-button {
          display: none;
        }

        .sentence-gap-header {
          flex-direction: column;
          gap: 10px;
          align-items: flex-start;
          padding: 16px;
        }

        .sentence-gap-header-left {
          width: 100%;
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .sentence-gap-title {
          font-size: 20px;
        }

        /* Mobile : ajuster le padding du bouton unifié */
        .unified-back-button {
          padding: 10px 16px;
          font-size: 13px;
          margin-bottom: 12px;
        }
      }
      
      @media (min-width: 768px) {
        .summary-actions {
          flex-direction: row;
          justify-content: center;
        }
        
        .new-series-button, .back-button {
          min-width: 220px;
        }
      }
    `;

    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const validateAnswer = (input: string, correct: string): number => {
    const normalizedInput = normalizeText(input);
    const normalizedCorrect = normalizeText(correct);
    
    if (normalizedInput === normalizedCorrect) return 1;
    return calculateSimilarity(normalizedInput, normalizedCorrect);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSentence || !currentSentence.gapWord) return;
  
    const similarity = validateAnswer(userInput, currentSentence.gapWord);
    const isCorrect = similarity >= 0.9;
    
    // Incrémenter le compteur de série
    const newSeriesCount = currentSeriesCount + 1;
    setCurrentSeriesCount(newSeriesCount);
  
    // Enregistrer cette tentative
    const attempt: SentenceAttempt = {
      sentence: currentSentence.displayText,
      translation: currentSentence.french,
      userAnswer: userInput,
      correctAnswer: currentSentence.gapWord,
      isCorrect: isCorrect,
      category: currentSentence.category,
      timestamp: Date.now()
    };
    
    setGameStats(prev => ({
      ...prev,
      currentSeriesAttempts: [...prev.currentSeriesAttempts, attempt]
    }));
  
    if (isCorrect) {
      setFeedback('Correct !');
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setGameStats(prev => ({
        ...prev,
        correct: prev.correct + 1
      }));
      onAnswer?.(true);
  
      if (currentSentence.audio) {
        try {
          await playAudio(currentSentence.audio);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    } else if (similarity >= 0.7) {
      setFeedback(`Presque ! La réponse correcte était : ${currentSentence.gapWord}`);
      setIsClose(true);
      setStreak(0);
      setGameStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1
      }));
      onAnswer?.(false);
    } else {
      setFeedback(`Incorrect. La réponse correcte était : ${currentSentence.gapWord}`);
      setStreak(0);
      setGameStats(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1
      }));
      onAnswer?.(false);
    }
  
    // Vérifier si une série est terminée
    if (newSeriesCount >= PHRASES_PER_SERIES) {
      const seriesTime = Math.floor((Date.now() - gameStats.startTime) / 1000);
      
      setGameStats(prev => ({
        ...prev,
        seriesCompleted: prev.seriesCompleted + 1,
        lastSeriesTime: seriesTime
      }));
      
      // Montrer l'écran de résumé et afficher le chrono à ce moment
      setShowSummary(true);
      setShowChronometer(true);  // Afficher le chrono dans le résumé
    }
  
    setTimeout(() => {
      if (newSeriesCount < PHRASES_PER_SERIES) {
        getNextSentence();
      }
    }, 2000);
  };

  useEffect(() => {
    if (score >= SCORE_TO_COMPLETE) {
      onGameComplete();
    }
  }, [score, onGameComplete]);

  // Calculer les statistiques pour l'affichage
  const revisedWords = getRevisedWords();
  const sentencesGapPhrases = getSentencesGapPhrases();
  const availablePhrases = sentencesGapPhrases.length;

  // Si écran de résumé
  if (showSummary) {
    return (
      <div className={`sentence-gap-game ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <div className="sentence-gap-header">
          <div className="sentence-gap-header-left">
            {/* Bouton retour unifié pour desktop et mobile */}
            <button 
              onClick={onBackToCategories}
              className="unified-back-button"
            >
              <ArrowLeft size={16} />
              <span>Retour au menu</span>
            </button>
            <h1 className="sentence-gap-title">
              Résumé de la série - {languageData.name}
            </h1>
          </div>
        </div>
        
        <div className="series-summary-container">
          <div className="series-summary-stats">
            {/* Mettre en valeur le temps total avec un style spécial */}
            <div className="summary-stat-item" style={{ 
              borderColor: '#3b82f6', 
              borderWidth: '2px', 
              borderStyle: 'solid',
              animation: 'pulse 2s infinite'
            }}>
              <span className="summary-stat-label">Temps total</span>
              <span className="summary-stat-value">{formatTime(seriesStats.duration)}</span>
            </div>
            <div className="summary-stat-item">
              <span className="summary-stat-label">Précision</span>
              <span className="summary-stat-value">{seriesStats.accuracy}%</span>
            </div>
            <div className="summary-stat-item">
              <span className="summary-stat-label">Phrases</span>
              <span className="summary-stat-value">{seriesStats.correctAttempts}/{seriesStats.totalAttempts}</span>
            </div>
          </div>
          
          <h2 className="summary-section-title">Détail des phrases</h2>
          
          <div className="series-attempts-list">
            {gameStats.currentSeriesAttempts.map((attempt, index) => (
              <div key={index} className={`attempt-card ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="attempt-header">
                  <span className="attempt-number">#{index + 1}</span>
                  <span className={`attempt-result ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                    {attempt.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="attempt-sentence">
                  <p dangerouslySetInnerHTML={{ 
                    __html: attempt.sentence.replace('_____', `<span class="gap-highlight">${attempt.correctAnswer}</span>`) 
                  }} />
                </div>
                
                <div className="attempt-details">
                  <div className="attempt-item">
                    <span className="attempt-label">Traduction:</span>
                    <span className="attempt-value">{attempt.translation}</span>
                  </div>
                  <div className="attempt-item">
                    <span className="attempt-label">Votre réponse:</span>
                    <span className={`attempt-value ${attempt.isCorrect ? 'correct' : 'incorrect'}`}>
                      {attempt.userAnswer || '(vide)'}
                    </span>
                  </div>
                  {!attempt.isCorrect && (
                    <div className="attempt-item">
                      <span className="attempt-label">Réponse correcte:</span>
                      <span className="attempt-value correct">{attempt.correctAnswer}</span>
                    </div>
                  )}
                  {attempt.category && (
                    <div className="attempt-item">
                      <span className="attempt-label">Catégorie:</span>
                      <span className="attempt-value category">{attempt.category}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="summary-actions">
            <button 
              onClick={startNewSeries}
              className="new-series-button"
            >
              <RotateCw size={18} />
              <span>Nouvelle série</span>
            </button>
            
            <button 
              onClick={onBackToCategories} 
              className="back-button"
            >
              <ArrowLeft size={20} />
              <span>Retour au menu</span>
            </button>
          </div>
        </div>
      </div>
    );
  
  }
  
  if (showStartScreen) {
    return (
      <div className={`sentence-gap-game ${theme === 'dark' ? 'dark-mode' : ''}`}>
        <div className="sentence-gap-header">
          <div className="sentence-gap-header-left">
            {/* Bouton retour unifié pour desktop et mobile */}
            <button 
              onClick={onBackToCategories}
              className="unified-back-button"
            >
              <ArrowLeft size={16} />
              <span>Retour au menu</span>
            </button>
            <h1 className="sentence-gap-title">
              Phrases à trous - {languageData.name}
            </h1>
          </div>
        </div>
  
        <div className="sentence-gap-info">
        
        </div>
  
        <div className="sentence-gap-content" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>Prêt à commencer ?</h2>
          
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px' }}>
            Ce mode vous permet de tester vos connaissances en complétant des phrases avec les mots que vous avez appris.
            <br /><br />
            Vous allez compléter une série de {PHRASES_PER_SERIES} phrases. Votre temps sera chronométré.
          </p>
          
          <button
            onClick={startTest}
            className="verify-button"
            style={{ 
              width: '200px', 
              margin: '0 auto', 
              fontSize: '18px',
              padding: '15px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>▶️</span> Commencer le test
          </button>
        </div>
      </div>
    );
  }
  
   
return (
  <div className={`sentence-gap-game ${theme === 'dark' ? 'dark-mode' : ''}`}>
    <div className="sentence-gap-header">
      <div className="sentence-gap-header-left">
        {/* Bouton retour unifié pour desktop et mobile */}
        <button 
          onClick={onBackToCategories}
          className="unified-back-button"
        >
          <ArrowLeft size={16} />
          <span>Retour au menu</span>
        </button>
        <h1 className="sentence-gap-title">
          Révision - {languageData.name}
        </h1>
      </div>
    </div>

    <div className="sentence-gap-info">
    
    </div>

    <div className="sentence-gap-score">
  <div className="score-item">
    <span className="score-label">Score</span>
    <span className="score-value">{score}</span>
  </div>
  <div className="score-item">
    <span className="score-label">Série</span>
    <span className="score-value">{streak}</span>
  </div>
  {/* Affichez le chrono seulement dans le résumé */}
  {showSummary && (
    <div className="score-item">
      <span className="score-label">Temps</span>
      <span className="score-value">
        {formatTime(seriesStats.duration)}
      </span>
    </div>
  )}
  <div className="score-item">
    <span className="score-label">Phrase</span>
    <span className="score-value">{currentSeriesCount}/{PHRASES_PER_SERIES}</span>
  </div>
</div>

    <div className="sentence-gap-content">
      <p className="sentence-gap-instruction">Complétez la phrase :</p>
      {currentSentence ? (
        <>
          <p className="sentence-gap-phrase">{currentSentence.displayText}</p>
          <p className="sentence-gap-translation">{currentSentence.french}</p>
          {currentSentence.category && (
            <p className="sentence-gap-category">Catégorie: {currentSentence.category}</p>
          )}

          {currentSentence.gapWord ? (
            <form onSubmit={handleSubmit} className="sentence-gap-form">
              <div className="sentence-gap-input">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Votre réponse"
                  autoFocus
                />
                <button type="submit" className="verify-button" disabled={!userInput}>
                  <span>✓</span> Vérifier
                </button>
              </div>
            </form>
          ) : (
            <div className="no-words-message">
              <p>Vous devez d'abord réviser des mots dans le mode Révision.</p>
            </div>
          )}
        </>
      ) : (
        <div className="no-words-message">
          <p>Chargement des phrases en cours...</p>
        </div>
      )}

      <div className="sentence-gap-actions">
        <button
          onClick={getNextSentence}
          className="next-button"
          disabled={!currentSentence || !currentSentence.gapWord}
        >
          <span>↻</span> Nouvelle phrase
        </button>
      </div>

      {feedback && (
        <div
          className={`sentence-gap-feedback ${
            feedback.startsWith('Correct')
              ? 'feedback-success'
              : isClose
              ? 'feedback-warning'
              : 'feedback-error'
          }`}
        >
          {feedback}
        </div>
      )}
      
      {/* Affichage du temps de la série */}
      {displaySeriesTime && gameStats.lastSeriesTime !== null && (
        <div className="sentence-gap-feedback series-time-feedback">
          <span>Série terminée en </span>
          <strong>{formatTime(gameStats.lastSeriesTime)}</strong>
          <span> !</span>
        </div>
      )}
    </div>
  </div>
);
};

export default SentenceGapGame;