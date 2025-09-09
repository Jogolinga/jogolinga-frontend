import React, { useState, useCallback, useRef, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useFixedAppStyles } from './useAppStyles';
import { 
  ArrowLeft,
  Volume2,
  RotateCw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Home,
  Book,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { 
  LanguageCode,
  SentenceConstructionGameProps,
  Sentence,
  UserProgress,
  LearnedSentence
} from '../types/types';
import { getLanguageData } from '../data/languages';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio'; // ✅ Nouveau système
import useSentenceRevision, { type SentenceRevisionInfo } from '../hooks/useSentenceRevision';
import SentenceRevisionGame from './SentenceRevisionGame';
import ConfirmationModal from './ConfirmationModal';
import XPAnimation from './XPAnimation';

import './SentenceConstructionGame.css';
import { useSummaryAudio } from '../utils/summaryAudio';
const SENTENCES_PER_LESSON = 5;
const ItemTypes = { WORD: "word" };

// ✅ SYSTÈME DE SAUVEGARDE OPTIMISÉ
interface OptimizedSessionData {
  id: string;
  startTime: number;
  endTime?: number;
  language: LanguageCode;
  category?: string;
  sentences: LearnedSentence[];
  stats: {
    score: number;
    totalItems: number;
    accuracy: number;
    duration: number;
    xpGained: number;
  };
}


class SimpleSaveManager {
  private currentSession: OptimizedSessionData | null = null;
  private saveTimeout: NodeJS.Timeout | null = null;
  private readonly SAVE_DELAY = 5000;

  startSession(language: LanguageCode, category?: string): string {
    const sessionId = `sentence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      startTime: Date.now(),
      language,
      category,
      sentences: [],
      stats: {
        score: 0,
        totalItems: 0,
        accuracy: 0,
        duration: 0,
        xpGained: 0
      }
    };
    
    console.log(`📝 Session démarrée: ${sessionId}`);
    return sessionId;
  }

  addSentence(sentence: LearnedSentence, score: number, totalItems: number) {
    if (!this.currentSession) return;

    this.currentSession.sentences.push(sentence);
    this.currentSession.stats.score = score;
    this.currentSession.stats.totalItems = totalItems;
    this.currentSession.stats.accuracy = totalItems > 0 ? (score / totalItems) * 100 : 0;

    localStorage.setItem(
      `${this.currentSession.language}-temp-session`, 
      JSON.stringify(this.currentSession)
    );
  }

  async finishSession(): Promise<{ xpGained: number; sessionData: OptimizedSessionData } | null> {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.stats.duration = this.currentSession.endTime - this.currentSession.startTime;
    
    // ✅ CORRECTION: Calculer l'XP seulement pour les phrases MAÎTRISÉES
    const masteredSentences = this.currentSession.sentences.filter(s => s.mastered);
    const xpGained = masteredSentences.length * 15; // Au lieu de this.currentSession.sentences.length * 15
    this.currentSession.stats.xpGained = xpGained;

    console.log(`🏁 Session finalisée: ${this.currentSession.id} - XP: ${xpGained} (${masteredSentences.length}/${this.currentSession.sentences.length} phrases maîtrisées)`);

    const result = {
      xpGained,
      sessionData: { ...this.currentSession }
    };

    this.currentSession = null;
    return result;
  }

  clearTimers(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
      console.log('⏰ Timer de sauvegarde annulé');
    }
  }

  hasActiveTimers(): boolean {
    return this.saveTimeout !== null;
  }

  hasRealDataToSave(): boolean {
    if (this.currentSession && this.currentSession.sentences.length > 0) {
      return true;
    }
    
    const tempKeys = Object.keys(localStorage).filter(key => key.endsWith('-temp-session'));
    return tempKeys.some(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return data.sentences && Array.isArray(data.sentences) && data.sentences.length > 0;
      } catch {
        return false;
      }
    });
  }

  reset(): void {
    console.log('🔄 Reset du SaveManager');
    this.currentSession = null;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
  }
}

const saveManager = new SimpleSaveManager();


const useSentenceXP = (languageCode: LanguageCode, category?: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  const startSession = useCallback(() => {
    const id = saveManager.startSession(languageCode, category);
    setSessionId(id);
    return id;
  }, [languageCode, category]);

  const addSentence = useCallback((sentence: LearnedSentence, score: number, totalItems: number) => {
    if (sessionId) {
      saveManager.addSentence(sentence, score, totalItems);
    }
  }, [sessionId]);

  const finishSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const result = await saveManager.finishSession();
      
      if (result && result.xpGained > 0) {
        setXpGained(result.xpGained);
        // ✅ Ne pas déclencher l'animation automatiquement ici
        console.log(`🎉 XP prêt pour animation: +${result.xpGained} XP`);
      }
      
      setSessionId(null);
      
    } catch (error) {
      console.error('Erreur finalisation session:', error);
    }
  }, [sessionId]);

  // ✅ NOUVELLE FONCTION: Déclencher l'animation manuellement
  const triggerXPAnimation = useCallback(() => {
    console.log('🎬 Déclenchement manuel de l\'animation XP');
    if (xpGained > 0) {
      setShowXPAnimation(true);
    }
  }, [xpGained]);

  const handleXPAnimationComplete = useCallback(() => {
    console.log('🎬 Animation XP terminée - MAIS on garde la valeur affichée');
    setShowXPAnimation(false);
    // ✅ CORRECTION: Ne plus remettre xpGained à zéro pour garder l'affichage
    // setXpGained(0); - SUPPRIMÉ
  }, []);

  return {
    startSession,
    addSentence,
    finishSession,
    sessionId,
    triggerXPAnimation, // ✅ CORRECTION: Exposer la fonction
    xpAnimationProps: {
      xpGained,
      showAnimation: showXPAnimation,
      onAnimationComplete: handleXPAnimationComplete,
      variant: 'large' as const,
      className: 'session-complete-xp'
    }
  };
};

// ✅ INTERFACES DND
interface WordWithId {
  id: string;
  text: string;
  index: number;
}

interface FrenchWordWithId {
  id: string;
  text: string;
  index: number;
  isCorrect?: boolean;
}

interface TranslationState {
  wolofSentence: string;
  correctFrenchWords: string[];
  availableFrenchWords: FrenchWordWithId[];
  constructedTranslation: FrenchWordWithId[];
  distractorWords: string[];
}

interface DraggableWordProps {
  word: WordWithId;
  index: number;
  moveWord: (dragIndex: number, hoverIndex: number) => void;
  isCorrect: boolean;
  onWordClick?: (word: WordWithId) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({ word, index, moveWord, isCorrect, onWordClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WORD,
    item: { type: ItemTypes.WORD, id: word.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.WORD,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      moveWord(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`modern-word-item ${isDragging ? 'dragging' : ''} ${isCorrect ? 'success' : ''} constructed-word`}
      style={{ cursor: 'pointer' }}
      onClick={() => onWordClick?.(word)}
    >
      {word.text}
    </div>
  );
};

const DraggableFrenchWord: React.FC<{
  word: FrenchWordWithId;
  index: number;
  moveWord: (dragIndex: number, hoverIndex: number) => void;
  isCorrect: boolean;
  source: 'available' | 'constructed';
  onWordClick?: (word: FrenchWordWithId) => void;
}> = ({ word, index, moveWord, isCorrect, source, onWordClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.WORD,
    item: { type: ItemTypes.WORD, id: word.id, index, source, word },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.WORD,
    hover(item: { index: number; source: string }, monitor) {
      if (!ref.current || source !== 'constructed' || item.source !== 'constructed') return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      moveWord(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  if (source === 'constructed') {
    drag(drop(ref));
  } else {
    drag(ref);
  }

  return (
    <div
      ref={ref}
      className={`modern-word-item ${isDragging ? 'dragging' : ''} ${isCorrect ? 'success' : ''} ${source === 'available' ? 'available-french-word' : 'constructed-french-word'}`}
      onClick={() => onWordClick?.(word)}
      style={{ cursor: 'pointer' }}
    >
      {word.text}
    </div>
  );
};

const TranslationDropZone: React.FC<{
  constructedWords: FrenchWordWithId[];
  onWordDrop: (word: FrenchWordWithId) => void;
  moveWord: (dragIndex: number, hoverIndex: number) => void;
  isCorrect: boolean;
  onWordClick?: (word: FrenchWordWithId) => void;
}> = ({ constructedWords, onWordDrop, moveWord, isCorrect, onWordClick }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.WORD,
    drop: (item: { id: string; source: string; word?: FrenchWordWithId }) => {
      if (item.source === 'available' && item.word) {
        onWordDrop(item.word);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`modern-construction-area translation-drop-zone ${isOver ? 'drop-over' : ''} ${isCorrect ? 'success' : ''}`}
    >
      {constructedWords.length === 0 ? (
        <div className="drop-zone-placeholder">
          Glissez les mots français ici pour former la traduction
        </div>
      ) : (
        constructedWords.map((word, index) => (
          <DraggableFrenchWord
            key={word.id}
            word={word}
            index={index}
            moveWord={moveWord}
            isCorrect={isCorrect}
            source="constructed"
            onWordClick={onWordClick}
          />
        ))
      )}
    </div>
  );
};

// ✅ COMPOSANT PRINCIPAL
const SentenceConstructionGame: React.FC<SentenceConstructionGameProps> = ({
  languageCode,
  onBackToCategories,
  onAnswer,
  onGameComplete,
  onSentencesLearned,
  saveProgressOnSummary, 
  userProgress
}) => {
  const { playWord } = useSupabaseAudio(languageCode);
  const languageData = getLanguageData(languageCode);
  
  const {
    getSessionHistory,
    isLearnedSentence
  } = useSentenceRevision(languageCode);
  
  const {
    startSession,
    addSentence,
    finishSession,
    sessionId,
    triggerXPAnimation, // ✅ NOUVEAU: Récupérer la fonction
    xpAnimationProps
  } = useSentenceXP(languageCode);

  // États du jeu
  const [mode, setMode] = useState<'category-selection' | 'category-details' | 'preview' | 'test' | 'summary' | 'all-categories' | 'revision'>('category-selection');
  const [gameMode, setGameMode] = useState<'construction' | 'translation'>('construction');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSentences, setCurrentSentences] = useState<Sentence[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [constructedWords, setConstructedWords] = useState<WordWithId[]>([]);
  const [availableWords, setAvailableWords] = useState<WordWithId[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalPhrases, setTotalPhrases] = useState(0);
  const [learnedSentences, setLearnedSentences] = useState<LearnedSentence[]>([]);

  // États pour le mode traduction
  const [translationState, setTranslationState] = useState<TranslationState | null>(null);
  const [translationAttempts, setTranslationAttempts] = useState(0);
  const [showTranslationCorrection, setShowTranslationCorrection] = useState(false);
  const [isTranslationCorrect, setIsTranslationCorrect] = useState(false);

  // États pour les modes mélangés
  const [sentenceModes, setSentenceModes] = useState<('construction' | 'translation')[]>([]);

  // États pour le modal de confirmation
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void | null>(null);

  const [shouldSave, setShouldSave] = useState(false);
const [saveCompleted, setSaveCompleted] = useState(false);
const [hasSavedThisSession, setHasSavedThisSession] = useState(false);
const [xpGained, setXpGained] = useState(0);

 const { playSummaryAudio } = useSummaryAudio();
  // États pour tracker les tentatives
  const [sentenceAttempts, setSentenceAttempts] = useState<Record<string, {
    attempts: number;
    firstAttemptCorrect: boolean;
    totalAttempts: number;
  }>>({});

  // ✅ NOUVEAU: États pour le système XP à deux étapes
  const [summaryStep, setSummaryStep] = useState<'results' | 'xp'>('results');

  // ✅ DEBUG: Ajout d'un useEffect pour surveiller l'état XP
  useEffect(() => {
    console.log('🔍 DEBUG XP State:', {
      xpGained: xpAnimationProps.xpGained,
      showAnimation: xpAnimationProps.showAnimation,
      masteredCount: learnedSentences.filter(s => s.mastered).length,
      summaryStep,
      mode
    });
  }, [xpAnimationProps.xpGained, xpAnimationProps.showAnimation, learnedSentences, summaryStep, mode]);

  useFixedAppStyles('sentenceConstruction');

  // Nettoyage au démontage
  useEffect(() => {
    console.log('🚀 SentenceConstructionGame monté');
    
    return () => {
      console.log('🧹 SentenceConstructionGame démonté');
      
      if (saveManager.hasActiveTimers()) {
        saveManager.clearTimers();
      }
    };
  }, []);

  // Fonction pour filtrer les phrases non maîtrisées
  const filterUnlearnedSentences = useCallback((sentences: Sentence[]): Sentence[] => {
    return sentences.filter(sentence => {
      const isAlreadyMastered = isLearnedSentence(sentence.original);
      if (isAlreadyMastered) {
        console.log(`📝 Phrase "${sentence.original}" déjà maîtrisée - exclue de la session`);
      }
      return !isAlreadyMastered;
    });
  }, [isLearnedSentence]);

  const convertToRevisionInfo = useCallback((sentence: LearnedSentence): SentenceRevisionInfo => {
    return {
      original: sentence.original,
      french: sentence.french,
      audio: sentence.audio,
      category: sentence.category,
      timestamp: sentence.timestamp || Date.now(),
      nextReview: Date.now() + (10 * 60 * 1000),
      type: 'sentence' as const,
      words: sentence.words || sentence.original.split(' '),
      isCorrect: true
    };
  }, []);

  const getLearnedSentencesCountForRevision = useCallback((): number => {
    console.log('🔍 getLearnedSentencesCountForRevision - vérification unifiée');
    
    const localKey = `sentence-revision-${languageCode}-sessionHistory`;
    const localData = localStorage.getItem(localKey);
    let localCount = 0;
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          localCount = parsed.filter((sentence: any) => 
            sentence.type === 'sentence' && sentence.original && sentence.french
          ).length;
        }
      } catch (error) {
        console.error('❌ Erreur parsing localStorage:', error);
      }
    }
    
    const sessionHistory = getSessionHistory();
    const hookCount = sessionHistory.filter((sentence: SentenceRevisionInfo) => 
      sentence.type === 'sentence' && sentence.original && sentence.french
    ).length;
    
    const finalCount = Math.max(localCount, hookCount);
    console.log('📊 Final count:', finalCount);
    
    return finalCount;
  }, [getSessionHistory, languageCode]);

  const cleanupOldSavingMarkers = useCallback(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('saving-'));
    const now = Date.now();
    const maxAge = 10 * 60 * 1000;
    
    keys.forEach(key => {
      try {
        const timestamp = parseInt(key.split('-')[1]);
        if (now - timestamp > maxAge) {
          localStorage.removeItem(key);
          console.log('🧹 Marqueur de sauvegarde ancien supprimé:', key);
        }
      } catch (error) {
        // Ignorer les erreurs de parsing
      }
    });
  }, []);

  useEffect(() => {
    cleanupOldSavingMarkers();
  }, [cleanupOldSavingMarkers]);

  // Fonctions utilitaires
  const cleanWord = useCallback((word: string): string => {
    return word.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  }, []);

  const cleanSentence = useCallback((sentence: string): string => {
    return sentence.split(' ').map(word => cleanWord(word)).filter(word => word.length > 0).join(' ');
  }, [cleanWord]);

  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const createWordsWithIds = useCallback((words: string[]) => {
    return words.map((word, index) => ({
      id: `${word}-${index}-${Date.now()}`,
      text: word,
      index
    }));
  }, []);

  const createFrenchWordsWithIds = useCallback((words: string[]): FrenchWordWithId[] => {
    return words.map((word, index) => ({
      id: `french-${word}-${index}-${Date.now()}`,
      text: word,
      index
    }));
  }, []);

  const generateDistractorWords = useCallback((currentFrench: string, allSentences: Sentence[]): string[] => {
    const currentWords = cleanSentence(currentFrench).toLowerCase().split(' ');
    const allWords = allSentences
      .filter(s => s.french !== currentFrench)
      .flatMap(s => cleanSentence(s.french).toLowerCase().split(' '))
      .filter(word => word.length > 2 && !currentWords.includes(word));
    
    const uniqueWords = [...new Set(allWords)];
    const shuffled = shuffleArray(uniqueWords);
    return shuffled.slice(0, Math.min(5, Math.floor(currentWords.length * 0.6)));
  }, [cleanSentence]);

  const generateMixedModes = useCallback((sentences: Sentence[]): ('construction' | 'translation')[] => {
    return sentences.map(() => Math.random() < 0.5 ? 'construction' : 'translation');
  }, []);

  // ✅ NOUVEAU: Fonction pour passer à l'étape XP
  const handleShowXP = useCallback(() => {
    console.log('🎯 Passage à l\'étape XP dans SentenceConstruction');
    console.log('🎯 XP disponible:', xpAnimationProps.xpGained);
    
    setSummaryStep('xp');
    
    // ✅ CORRECTION: Utiliser la fonction exposée par le hook
    triggerXPAnimation();
  }, [xpAnimationProps.xpGained, triggerXPAnimation]);

  // ✅ NOUVEAU: Fonction pour reset du summary state
  const resetSummaryState = useCallback(() => {
    setSummaryStep('results');
  }, []);


  const handleSentenceSummaryComplete = useCallback(async () => {
  if (hasSavedThisSession) {
    console.log('⚠️ SENTENCE - Sauvegarde déjà effectuée pour cette session, ignorer');
    return;
  }
  
  console.log('=== 🔄 SENTENCE - DÉBUT SAUVEGARDE CENTRALISÉE ===');
  
  try {
    // ✅ Filtrer seulement les phrases vraiment maîtrisées (premier coup)
    const masteredSentences = learnedSentences.filter(s => {
      const isMastered = s.mastered;
      console.log(`🎯 SENTENCE - Phrase ${s.original}: ${isMastered ? 'MAÎTRISÉE' : 'NON MAÎTRISÉE'}`);
      return isMastered;
    });
    
    console.log('🎯 SENTENCE - Phrases maîtrisées:', masteredSentences.map(s => s.original));
    
    if (masteredSentences.length > 0) {
      const totalXPGained = masteredSentences.length * 15; // 15 XP par phrase maîtrisée
      

       playSummaryAudio();
       
      // ✅ 2. Préparer les mots pour la révision (format standard)
      const wordsToAdd = masteredSentences.map(sentence => ({
        word: sentence.original,
        category: sentence.category || 'Phrases',
        subcategory: selectedCategory || '',
        language: languageCode,
        timestamp: sentence.timestamp || Date.now(),
        translation: sentence.french,
        explanation: '',
        example: sentence.french,
        audio: sentence.audio
      }));
      
      // ✅ 3. Envoyer vers la révision via onSentencesLearned
      try {
        if (onSentencesLearned) {
          console.log('📤 SENTENCE - Envoi vers révision...');
          onSentencesLearned(masteredSentences);
          console.log('✅ SENTENCE - Révision mise à jour');
        }
      } catch (revisionError) {
        console.error('❌ SENTENCE - Erreur révision (non bloquante):', revisionError);
      }
      
      // ✅ 4. Préparer les données localStorage spécifiques aux phrases
      const storageKey = `sentence-progress-${languageCode}`;
      const existingProgress = localStorage.getItem(storageKey);
      const currentProgress = existingProgress ? JSON.parse(existingProgress) : [];
      
      const newSentenceSession = {
        category: selectedCategory || 'Mixed',
        subcategory: selectedCategory || '',
        masteredSentences: masteredSentences.map(sentence => ({
          original: sentence.original,
          french: sentence.french,
          audio: sentence.audio,
          mastered: sentence.mastered,
          timestamp: sentence.timestamp || Date.now(),
          words: sentence.words || sentence.original.split(' '),
          category: sentence.category || 'Phrases',
          attempts: sentence.attempts || 1,
          firstAttemptCorrect: sentence.firstAttemptCorrect !== false
        })),
        date: Date.now(),
        totalScore: score,
        maxScore: totalPhrases,
        xpGained: totalXPGained
      };
      
      // ✅ 5. Préparer les données pour saveProgressOnSummary
      const sentenceProgress: UserProgress = {
        learnedWords: new Set(masteredSentences.map(s => s.original)),
        wordsToReview: new Set(),
        wordProgress: {},
        recentlyLearnedWords: wordsToAdd,
        language: languageCode
      };
      
      const contextData = {
  mode: 'sentenceConstruction',
  sessionStats: {
    sentencesLearned: masteredSentences.length,
    totalSentences: totalPhrases,
    score: score,
    totalXP: totalXPGained,
    category: selectedCategory
  },
  description: `Session phrases ${selectedCategory || 'Mixed'} - ${masteredSentences.length} phrases maîtrisées (+${totalXPGained} XP)`,
  includeGoogleDrive: true,
  sentenceSpecificData: newSentenceSession // ✅ à bien inclure ici
};

      
      console.log('💾 SENTENCE - Données préparées pour sauvegarde centralisée:');
      console.log('📊 Phrases apprises:', sentenceProgress.learnedWords.size);
      console.log('📊 XP gagné:', totalXPGained);
      
      // ✅ 6. Appel sauvegarde centralisée
      if (!saveProgressOnSummary) {
        throw new Error('saveProgressOnSummary function not available');
      }
      
      console.log('🚀 SENTENCE - Appel saveProgressOnSummary...');
      await saveProgressOnSummary(sentenceProgress, contextData);
      console.log('✅ SENTENCE - Sauvegarde centralisée réussie');
      
      // ✅ 7. Sauvegarde localStorage (backup local)
      const updatedSentenceProgress = [...currentProgress, newSentenceSession];
      localStorage.setItem(storageKey, JSON.stringify(updatedSentenceProgress));
      console.log('✅ SENTENCE - Sauvegarde localStorage réussie');
      
      // ✅ 8. Animation XP
      if (totalXPGained > 0) {
        setXpGained(totalXPGained);
      }
      
    } else {
      console.log('📭 SENTENCE - Aucune phrase maîtrisée cette session');
    }
    
    setSaveCompleted(true);
    setHasSavedThisSession(true);
    console.log('✅ SENTENCE - Session terminée avec succès');
    
  } catch (error) {
    console.error('❌ SENTENCE - ERREUR CRITIQUE:', error);
    console.error('🔍 Détails:', {
      message: error instanceof Error ? error.message : String(error),
      learnedSentencesLength: learnedSentences.length,
      selectedCategory: selectedCategory,
      languageCode: languageCode
    });
    
    setHasSavedThisSession(false);
    setSaveCompleted(false);
    alert(`Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  console.log('=== ✅ SENTENCE - FIN SAUVEGARDE CENTRALISÉE ===');
}, [
  learnedSentences,
  selectedCategory,
  languageCode,
  onSentencesLearned,
  saveProgressOnSummary,
  hasSavedThisSession,
  score,
  totalPhrases,
  setXpGained,
  setSaveCompleted,
  setHasSavedThisSession
]);

  // Démarrer la session
  useEffect(() => {
    if (mode === 'test' && currentSentences.length > 0 && !sessionId) {
      const newSessionId = startSession();
      console.log(`🚀 Session démarrée: ${newSessionId}`);
    }
  }, [mode, currentSentences.length, sessionId, startSession]);



  useEffect(() => {
  if (mode === 'summary' && sessionId && learnedSentences.length > 0 && shouldSave && !hasSavedThisSession) {
    console.log('🚀 SENTENCE - Déclenchement UNIQUE de la sauvegarde centralisée...');
    
    setHasSavedThisSession(true);
    
    const performSave = async () => {
      try {
        await handleSentenceSummaryComplete();
        setShouldSave(false);
      } catch (error) {
        console.error('❌ SENTENCE - Erreur lors de la sauvegarde:', error);
        setHasSavedThisSession(false);
      }
    };
    
    performSave();
  }
}, [mode, sessionId, learnedSentences, shouldSave, hasSavedThisSession, handleSentenceSummaryComplete]);

  // Sauvegarde unifiée au résumé
 useEffect(() => {
  if (mode === 'summary' && sessionId && learnedSentences.length > 0) {
    console.log('📊 RÉSUMÉ - Préparation sauvegarde unifiée des phrases');
    
    const sessionKey = `saving-${sessionId}`;
    if (localStorage.getItem(sessionKey)) {
      console.log('⚠️ Sauvegarde déjà effectuée pour cette session, ignorée');
      return;
    }
    
    // ✅ NOUVEAU: Déclencher shouldSave au lieu de sauvegarder directement
    localStorage.setItem(sessionKey, 'preparing');
    setShouldSave(true);
    setHasSavedThisSession(false);
  }
}, [mode, sessionId, learnedSentences]);

  // Gestionnaires d'événements
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    const categorySentences = languageData.sentencesToConstruct.filter(
      sentence => sentence.category === category
    );
    
    const unlearnedSentences = filterUnlearnedSentences(categorySentences);
    
    console.log(`📊 Catégorie "${category}": ${categorySentences.length} phrases totales, ${unlearnedSentences.length} non maîtrisées`);
    
    setCurrentSentences(unlearnedSentences);
    setMode('category-details');
  }, [languageData.sentencesToConstruct, filterUnlearnedSentences]);

  const handleStartAllCategories = useCallback(() => {
    const allSentences = languageData.sentencesToConstruct;
    const unlearnedSentences = filterUnlearnedSentences(allSentences);
    
    if (unlearnedSentences.length === 0) {
      console.log('🎉 Toutes les phrases sont déjà maîtrisées !');
      alert('Félicitations ! Toutes les phrases sont déjà maîtrisées. Essayez le mode révision.');
      return;
    }
    
    const shuffled = shuffleArray(unlearnedSentences).slice(0, SENTENCES_PER_LESSON);
    const modes = generateMixedModes(shuffled);
    
    console.log(`📊 Mode mélangé: ${unlearnedSentences.length} phrases non maîtrisées, ${shuffled.length} sélectionnées`);
    
    setCurrentSentences(shuffled);
    setSentenceModes(modes);
    setTotalPhrases(shuffled.length);
    setMode('preview');
    setCurrentSentenceIndex(0);
    
    if (modes[0] === 'construction') {
      resetSentence(0);
    } else {
      prepareTranslationMode(shuffled[0]);
    }
  }, [languageData.sentencesToConstruct, generateMixedModes, filterUnlearnedSentences]);

  const resetSentence = useCallback((index: number) => {
    if (currentSentences[index]) {
      const sentence = currentSentences[index];
      const wordsToUse = sentence.words || sentence.original.split(' ');
      setConstructedWords([]);
      setAvailableWords(createWordsWithIds(shuffleArray(wordsToUse)));
      setAttempts(0);
      setShowCorrection(false);
      setIsCorrect(false);
    }
  }, [currentSentences, createWordsWithIds]);

  const prepareTranslationMode = useCallback((sentence: Sentence) => {
    const cleanedFrench = cleanSentence(sentence.french);
    const frenchWords = cleanedFrench.split(' ');
    const distractorWords = generateDistractorWords(sentence.french, currentSentences);
    
    const allAvailableWords = [...frenchWords, ...distractorWords];
    const shuffledWords = shuffleArray(allAvailableWords);
    
    const translationState: TranslationState = {
      wolofSentence: sentence.original,
      correctFrenchWords: frenchWords,
      availableFrenchWords: createFrenchWordsWithIds(shuffledWords),
      constructedTranslation: [],
      distractorWords
    };
    
    setTranslationState(translationState);
    setTranslationAttempts(0);
    setShowTranslationCorrection(false);
    setIsTranslationCorrect(false);
  }, [currentSentences, generateDistractorWords, createFrenchWordsWithIds, cleanSentence]);

  const handleStartLearning = useCallback(() => {
    if (selectedCategory) {
      const categorySentences = languageData.sentencesToConstruct.filter(
        sentence => sentence.category === selectedCategory
      );
      
      const unlearnedSentences = filterUnlearnedSentences(categorySentences);
      
      if (unlearnedSentences.length === 0) {
        console.log(`🎉 Toutes les phrases de "${selectedCategory}" sont déjà maîtrisées !`);
        alert(`Félicitations ! Toutes les phrases de "${selectedCategory}" sont déjà maîtrisées.`);
        setMode('category-selection');
        return;
      }
      
      const shuffled = shuffleArray(unlearnedSentences).slice(0, SENTENCES_PER_LESSON);
      const modes = generateMixedModes(shuffled);
      
      console.log(`📊 Catégorie "${selectedCategory}": ${unlearnedSentences.length} phrases non maîtrisées, ${shuffled.length} sélectionnées`);
      
      setCurrentSentences(shuffled);
      setSentenceModes(modes);
      setTotalPhrases(shuffled.length);
      
      if (shuffled.length > 0) {
        setMode('preview');
        setCurrentSentenceIndex(0);
        if (modes[0] === 'construction') {
          resetSentence(0);
        } else {
          prepareTranslationMode(shuffled[0]);
        }
      }
    }
  }, [selectedCategory, languageData.sentencesToConstruct, resetSentence, generateMixedModes, prepareTranslationMode, filterUnlearnedSentences]);
  
  const handleAnswer = useCallback(async (answer: string) => {
  if (!currentSentences[currentSentenceIndex]) return;

  const currentSentence = currentSentences[currentSentenceIndex];
  const constructedText = answer;
  const correctText = currentSentence.original;
  const isAnswerCorrect = constructedText.toLowerCase() === correctText.toLowerCase();
  
  const sentenceKey = `${currentSentence.original}-${currentSentenceIndex}`;
  const currentAttempts = sentenceAttempts[sentenceKey] || { 
    attempts: 0, 
    firstAttemptCorrect: false, 
    totalAttempts: 0 
  };
  
  currentAttempts.totalAttempts++;
  
  if (currentAttempts.attempts === 0) {
    currentAttempts.firstAttemptCorrect = isAnswerCorrect;
  }
  
  currentAttempts.attempts++;
  
  setSentenceAttempts(prev => ({
    ...prev,
    [sentenceKey]: currentAttempts
  }));
  
  setIsCorrect(isAnswerCorrect);
  onAnswer?.(isAnswerCorrect);

  if (isAnswerCorrect) {
    // ✅ MODIFICATION: Score uniquement si réussi du premier coup
    const isTrulyMastered = currentAttempts.firstAttemptCorrect && currentAttempts.attempts === 1;
    
    // ✅ NOUVEAU: Le score n'augmente que si c'est maîtrisé (premier coup)
    let newScore = score;
    if (isTrulyMastered) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    const learnedSentence: LearnedSentence = {
      original: currentSentence.original,
      french: currentSentence.french,
      audio: currentSentence.audio,
      mastered: isTrulyMastered,
      timestamp: Date.now(),
      words: currentSentence.words || currentSentence.original.split(' '),
      category: currentSentence.category || 'Salutations',
      interval: 1,
      attempts: currentAttempts.totalAttempts,
      firstAttemptCorrect: currentAttempts.firstAttemptCorrect
    };
    
    setLearnedSentences(prev => [...prev, learnedSentence]);
    addSentence(learnedSentence, newScore, totalPhrases);
    
    console.log('✅ Phrase stockée en mémoire (sauvegarde au résumé):', learnedSentence.original);
    console.log(`📊 Performance: ${currentAttempts.totalAttempts} tentatives, premier coup: ${currentAttempts.firstAttemptCorrect ? 'OUI' : 'NON'}, maîtrisée: ${isTrulyMastered ? 'OUI' : 'NON'}`);
    console.log(`🎯 Score: ${isTrulyMastered ? 'Augmenté' : 'Inchangé'} - Nouveau score: ${newScore}`);
    
    setTimeout(async () => {
      if (currentSentenceIndex < currentSentences.length - 1) {
        const nextIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextIndex);
        
        if (sentenceModes[nextIndex] === 'construction') {
          setGameMode('construction');
          resetSentence(nextIndex);
        } else {
          setGameMode('translation');
          prepareTranslationMode(currentSentences[nextIndex]);
        }
      } else {
        setMode('summary');
        setShowCorrection(false);
        
        if (onGameComplete) {
          onGameComplete();
        }
      }
    }, 1000);
  } else {
    setAttempts(prev => prev + 1);
    if (attempts + 1 >= 2) {
      setShowCorrection(true);
    }
  }
}, [
  currentSentences,
  currentSentenceIndex,
  sentenceModes,
  onAnswer,
  attempts,
  resetSentence,
  prepareTranslationMode,
  onGameComplete,
  score,
  totalPhrases,
  addSentence,
  sentenceAttempts
]);

  // Gestionnaires pour le mode traduction
  const addFrenchWord = useCallback((word: FrenchWordWithId) => {
    if (!translationState) return;
    
    setTranslationState(prev => ({
      ...prev!,
      constructedTranslation: [...prev!.constructedTranslation, { ...word, index: prev!.constructedTranslation.length }],
      availableFrenchWords: prev!.availableFrenchWords.filter(w => w.id !== word.id)
    }));
  }, [translationState]);

  const removeFrenchWordByClick = useCallback((wordToRemove: FrenchWordWithId) => {
    if (isTranslationCorrect || !translationState) return;
    
    const wordIndex = translationState.constructedTranslation.findIndex(w => w.id === wordToRemove.id);
    if (wordIndex === -1) return;
    
    const newConstructedTranslation = translationState.constructedTranslation.filter(w => w.id !== wordToRemove.id);
    const updatedAvailableWords = [...translationState.availableFrenchWords, { 
      ...wordToRemove, 
      index: translationState.availableFrenchWords.length 
    }];
    
    setTranslationState(prev => ({
      ...prev!,
      constructedTranslation: newConstructedTranslation,
      availableFrenchWords: updatedAvailableWords
    }));
  }, [translationState, isTranslationCorrect]);

  const moveTranslationWord = useCallback((dragIndex: number, hoverIndex: number) => {
    if (!translationState) return;
    
    const dragWord = translationState.constructedTranslation[dragIndex];
    const newWords = [...translationState.constructedTranslation];
    newWords.splice(dragIndex, 1);
    newWords.splice(hoverIndex, 0, dragWord);
    
    setTranslationState(prev => ({
      ...prev!,
      constructedTranslation: newWords.map((word, index) => ({ ...word, index }))
    }));
  }, [translationState]);

  const handleTranslationAnswer = useCallback(() => {
  if (!translationState) return;
  
  const constructedText = translationState.constructedTranslation.map(w => cleanWord(w.text)).join(' ');
  const correctText = translationState.correctFrenchWords.map(w => cleanWord(w)).join(' ');
  const isAnswerCorrect = constructedText.toLowerCase() === correctText.toLowerCase();
  
  const currentSentence = currentSentences[currentSentenceIndex];
  const sentenceKey = `${currentSentence.original}-${currentSentenceIndex}-translation`;
  const currentAttempts = sentenceAttempts[sentenceKey] || { 
    attempts: 0, 
    firstAttemptCorrect: false, 
    totalAttempts: 0 
  };
  
  currentAttempts.totalAttempts++;
  
  if (currentAttempts.attempts === 0) {
    currentAttempts.firstAttemptCorrect = isAnswerCorrect;
  }
  
  currentAttempts.attempts++;
  
  setSentenceAttempts(prev => ({
    ...prev,
    [sentenceKey]: currentAttempts
  }));
  
  setIsTranslationCorrect(isAnswerCorrect);
  onAnswer?.(isAnswerCorrect);

  if (isAnswerCorrect) {
    // ✅ MODIFICATION: Score uniquement si réussi du premier coup
    const isTrulyMastered = currentAttempts.firstAttemptCorrect && currentAttempts.attempts === 1;
    
    // ✅ NOUVEAU: Le score n'augmente que si c'est maîtrisé (premier coup)
    let newScore = score;
    if (isTrulyMastered) {
      newScore = score + 1;
      setScore(newScore);
    }
    
    const learnedSentence: LearnedSentence = {
      original: currentSentence.original,
      french: currentSentence.french,
      audio: currentSentence.audio,
      mastered: isTrulyMastered,
      timestamp: Date.now(),
      words: currentSentence.words || currentSentence.original.split(' '),
      category: currentSentence.category || 'Salutations',
      interval: 1,
      attempts: currentAttempts.totalAttempts,
      firstAttemptCorrect: currentAttempts.firstAttemptCorrect
    };
    
    setLearnedSentences(prev => [...prev, learnedSentence]);
    addSentence(learnedSentence, newScore, totalPhrases);
    
    console.log('✅ Phrase traduction stockée en mémoire (sauvegarde au résumé):', learnedSentence.original);
    console.log(`📊 Performance traduction: ${currentAttempts.totalAttempts} tentatives, premier coup: ${currentAttempts.firstAttemptCorrect ? 'OUI' : 'NON'}, maîtrisée: ${isTrulyMastered ? 'OUI' : 'NON'}`);
    console.log(`🎯 Score: ${isTrulyMastered ? 'Augmenté' : 'Inchangé'} - Nouveau score: ${newScore}`);
    
    setTimeout(() => {
      if (currentSentenceIndex < currentSentences.length - 1) {
        const nextIndex = currentSentenceIndex + 1;
        setCurrentSentenceIndex(nextIndex);
        
        if (sentenceModes[nextIndex] === 'construction') {
          setGameMode('construction');
          resetSentence(nextIndex);
        } else {
          setGameMode('translation');
          prepareTranslationMode(currentSentences[nextIndex]);
        }
      } else {
        setMode('summary');
        setShowTranslationCorrection(false);
      }
    }, 1500);
  } else {
    setTranslationAttempts(prev => prev + 1);
    if (translationAttempts + 1 >= 2) {
      setShowTranslationCorrection(true);
    }
  }
}, [
  translationState, 
  cleanWord,
  onAnswer, 
  score, 
  currentSentenceIndex, 
  currentSentences, 
  sentenceModes,
  translationAttempts, 
  resetSentence,
  prepareTranslationMode,
  addSentence,
  totalPhrases,
  sentenceAttempts
]);

  const moveWord = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragWord = constructedWords[dragIndex];
    const newWords = [...constructedWords];
    newWords.splice(dragIndex, 1);
    newWords.splice(hoverIndex, 0, dragWord);
    setConstructedWords(newWords.map((word, index) => ({ ...word, index })));
  }, [constructedWords]);

  const addWord = useCallback((word: WordWithId) => {
    setConstructedWords(prev => [...prev, { ...word, index: prev.length }]);
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
  }, []);

  const removeWordByClick = useCallback((wordToRemove: WordWithId) => {
    if (isCorrect) return;
    
    const wordIndex = constructedWords.findIndex(w => w.id === wordToRemove.id);
    if (wordIndex === -1) return;
    
    const newConstructedWords = constructedWords.filter(w => w.id !== wordToRemove.id);
    setConstructedWords(newConstructedWords);
    
    setAvailableWords(prev => [...prev, { ...wordToRemove, index: prev.length }]);
  }, [constructedWords, isCorrect]);

  const handleNavigationWithConfirmation = useCallback((navigationCallback: () => void) => {
    const isInActiveSession = (mode === 'test' || mode === 'preview') && currentSentenceIndex < currentSentences.length;
    const hasProgress = learnedSentences.length > 0 || score > 0;
    
    if (isInActiveSession || hasProgress) {
      console.log('⚠️ Navigation avec progression - demande de confirmation');
      
      setPendingNavigation(() => navigationCallback);
      setShowExitModal(true);
    } else {
      navigationCallback();
    }
  }, [mode, currentSentenceIndex, currentSentences.length, learnedSentences.length, score]);

  const handleExitConfirm = useCallback(() => {
    setShowExitModal(false);
    
    console.log('🧹 Session abandonnée - nettoyage des données temporaires');
    
    setLearnedSentences([]);
    
    const tempSessionKey = `${languageCode}-temp-session`;
    localStorage.removeItem(tempSessionKey);
    console.log('🗑️ Données temporaires supprimées:', tempSessionKey);
    
    saveManager.reset();
    
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation, languageCode]);

  const handleExitCancel = useCallback(() => {
    setShowExitModal(false);
    setPendingNavigation(null);
  }, []);

  const continueTrainingWithoutSave = useCallback(async () => {
    console.log('🔄 Redémarrage session avec filtrage des phrases maîtrisées');
    
    setScore(0);
    setIsCorrect(false);
    setShowCorrection(false);
    setCurrentSentenceIndex(0);
    setConstructedWords([]);
    setAvailableWords([]);
    setLearnedSentences([]);
    setSentenceAttempts({});
    resetSummaryState();
    
    let allSentences: Sentence[] = [];
    
    if (mode === 'all-categories' || !selectedCategory) {
      allSentences = languageData.sentencesToConstruct;
    } else if (selectedCategory) {
      allSentences = languageData.sentencesToConstruct.filter(
        sentence => sentence.category === selectedCategory
      );
    }
    
    const unlearnedSentences = filterUnlearnedSentences(allSentences);
    
    if (unlearnedSentences.length === 0) {
      console.log('🎉 Plus de phrases à apprendre dans cette catégorie !');
      alert('Félicitations ! Toutes les phrases sont maîtrisées. Redirection vers les catégories...');
      setMode('category-selection');
      return;
    }
    
    const shuffled = shuffleArray(unlearnedSentences).slice(0, SENTENCES_PER_LESSON);
    const modes = generateMixedModes(shuffled);
    
    console.log(`🔄 Redémarrage: ${unlearnedSentences.length} phrases disponibles, ${shuffled.length} sélectionnées`);
    
    setCurrentSentences(shuffled);
    setSentenceModes(modes);
    setTotalPhrases(shuffled.length);
    setMode('preview');
    
    setTimeout(() => {
      if (modes[0] === 'construction') {
        resetSentence(0);
      } else {
        prepareTranslationMode(shuffled[0]);
      }
    }, 100);
  }, [
    selectedCategory, 
    languageData.sentencesToConstruct, 
    resetSentence, 
    prepareTranslationMode,
    generateMixedModes,
    mode,
    filterUnlearnedSentences,
    resetSummaryState
  ]);



  const handleBackToCategoriesWithoutSave = useCallback(async () => {
    console.log('🔙 Retour aux catégories');
    resetSummaryState();
    setMode('category-selection');
  }, [resetSummaryState]);
  
  if (isLoading) {
    return (
      <div className="modern-sentence-game">
        <div className="loading-overlay">Chargement en cours...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="modern-sentence-game top-aligned">
        <div className="modern-game-container">
          {mode !== 'revision' && (
            <header className="modern-game-header" style={{ marginTop: 0, paddingTop: '1rem' }}>
              <button 
                onClick={() => {
                  if (mode === 'category-selection') {
                    onBackToCategories();
                  } else if (mode === 'summary' || mode === 'category-details' || mode === 'all-categories') {
                    setMode('category-selection');
                    setSelectedCategory(null);
                  } else if (mode === 'preview') {
                    handleNavigationWithConfirmation(() => {
                      if (selectedCategory) {
                        setMode('category-details');
                      } else {
                        setMode('category-selection');
                      }
                    });
                  } else if (mode === 'test') {
                    handleNavigationWithConfirmation(() => {
                      if (selectedCategory) {
                        setMode('category-details');
                      } else {
                        setMode('category-selection');
                      }
                    });
                  }
                }}
                className="modern-back-button"
              >
                <ArrowLeft size={16} />
                <span>Retour</span>
              </button>
              <h1 className="modern-header-title" style={{ margin: 0 }}>
                {selectedCategory 
                  ? `${selectedCategory} - ${languageData.name}` 
                  : "Construction de phrases"}
              </h1>
            </header>
          )}

          {/* ✅ ANIMATION XP INTÉGRÉE - SEULEMENT en mode summary et étape xp */}
          {mode === 'summary' && summaryStep === 'xp' && (
            <XPAnimation {...xpAnimationProps} />
          )}

          {mode === 'category-details' && selectedCategory && (
            <button 
              onClick={handleStartLearning}
              className="sticky-learn-button"
            >
              Commencer l'apprentissage
            </button>
          )}

          {mode === 'category-selection' && (
            <div className="modern-main-content">
              <div className="category-description">
                <p>Choisissez une situation et apprenez à construire des phrases utiles.</p>
              </div>

              {getLearnedSentencesCountForRevision() > 0 && (
                <button
                  onClick={() => setMode('revision')}
                  className="mixed-categories-button revision-button"
                  style={{ 
                    background: 'linear-gradient(45deg, #059669, #10b981)',
                    marginBottom: '1rem'
                  }}
                >
                  📖 Réviser toutes mes phrases ({getLearnedSentencesCountForRevision()})
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setMode('all-categories');
                }}
                className="mixed-categories-button"
              >
                <RotateCw size={18} />
                S'entraîner avec des phrases de toutes catégories
              </button>

              <div className="modern-categories-grid">
                {Object.entries(languageData.sentenceCategories).map(([category, info]) => (
                  <motion.button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="modern-category-card"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="modern-category-header">
                      <div className="modern-category-icon">{info.icon}</div>
                      <h3 className="modern-category-title">{category}</h3>
                    </div>
                    <p className="modern-category-description">{info.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {mode === 'revision' && (
            <SentenceRevisionGame
              languageCode={languageCode}
              onBackToCategories={() => setMode('category-selection')}
              onAnswer={onAnswer}
              userProgress={userProgress}
              disableConfirmationModal={true}
            />
          )}

          {mode === 'all-categories' && (
            <div className="modern-main-content">
              <div className="modern-category-stats">
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Mode mélangé</h3>
                  <p className="modern-stat-value">Toutes catégories</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases disponibles</h3>
                  <p className="modern-stat-value">{filterUnlearnedSentences(languageData.sentencesToConstruct).length}</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases maîtrisées</h3>
                  <p className="modern-stat-value">{languageData.sentencesToConstruct.length - filterUnlearnedSentences(languageData.sentencesToConstruct).length}</p>
                </div>
              </div>

              <div className="modern-action-buttons">
                <button
                  onClick={handleStartAllCategories}
                  className="modern-primary-button"
                >
                  <RotateCw size={16} />
                  <span>Commencer avec des phrases mélangées</span>
                </button>
              </div>

              <div className="modern-sentence-list">
                <p className="modern-info-text">
                  Dans ce mode, vous vous entraînerez avec des phrases aléatoires de toutes les catégories non maîtrisées.
                  Les modes construction et traduction seront mélangés automatiquement.
                </p>
              </div>
            </div>
          )}

          {mode === 'category-details' && selectedCategory && (
            <div className="modern-main-content">{/* Contenu category-details... */}
              <div className="modern-category-stats">
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases totales</h3>
                  <p className="modern-stat-value">{languageData.sentencesToConstruct.filter(s => s.category === selectedCategory).length}</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases à apprendre</h3>
                  <p className="modern-stat-value">{currentSentences.length}</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases maîtrisées</h3>
                  <p className="modern-stat-value">
                    {languageData.sentencesToConstruct
                      .filter(s => s.category === selectedCategory)
                      .filter(sentence => isLearnedSentence(sentence.original)).length}
                  </p>
                </div>
              </div>

              <div className="modern-sentence-list">
                {currentSentences.length > 0 && (
                  <>
                    <h4>Phrases à apprendre ({currentSentences.length})</h4>
                    {currentSentences.map((sentence, index) => (
                      <div key={`unlearned-${index}`} className="modern-sentence-card">
                        <p className="modern-sentence-french">{sentence.french}</p>
                        <p className="modern-sentence-original">{sentence.original}</p>
                        {sentence.audio && (
                          <button
                            onClick={() => playWord(sentence.audio!)}
                            className="modern-audio-button"
                          >
                            <Volume2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {languageData.sentencesToConstruct
                  .filter(s => s.category === selectedCategory)
                  .filter(sentence => isLearnedSentence(sentence.original)).length > 0 && (
                  <>
                    <h4 style={{ marginTop: '2rem', color: '#10b981' }}>
                      Phrases maîtrisées ({languageData.sentencesToConstruct
                        .filter(s => s.category === selectedCategory)
                        .filter(sentence => isLearnedSentence(sentence.original)).length})
                    </h4>
                    {languageData.sentencesToConstruct
                      .filter(s => s.category === selectedCategory)
                      .filter(sentence => isLearnedSentence(sentence.original))
                      .map((sentence, index) => (
                        <div key={`mastered-${index}`} className="modern-sentence-card mastered">
                          <p className="modern-sentence-french">{sentence.french}</p>
                          <p className="modern-sentence-original">{sentence.original}</p>
                          
                          <div className="mastered-badge">
                            <CheckCircle size={16} />
                            <span>Maîtrisée</span>
                          </div>
                          
                          {sentence.audio && (
                            <button
                              onClick={() => playWord(sentence.audio!)}
                              className="modern-audio-button"
                            >
                              <Volume2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                  </>
                )}

                {currentSentences.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    border: '2px solid #10b981'
                  }}>
                    <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem' }} />
                    <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>Félicitations !</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Toutes les phrases de cette catégorie sont déjà maîtrisées.
                    </p>
                    <button
                      onClick={() => setMode('revision')}
                      className="modern-primary-button"
                      style={{ background: '#10b981' }}
                    >
                      <Book size={16} />
                      Réviser ces phrases
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === 'preview' && currentSentences[currentSentenceIndex] && (
            <div className="modern-main-content">
              <div className="modern-preview-container">
                <div className="modern-preview-decoration"></div>
                
                <div className={`mode-indicator ${sentenceModes[currentSentenceIndex]}`}>
                  {sentenceModes[currentSentenceIndex] === 'construction' ? 'Construction' : 'Traduction'}
                </div>
                
                <p className="modern-target-phrase">
                  {currentSentences[currentSentenceIndex].french}
                </p>
                <p className="modern-phrase-translation">
                  {currentSentences[currentSentenceIndex].original}
                </p>

                <div className="modern-preview-actions">
                  {currentSentences[currentSentenceIndex].audio && (
                    <button 
                      onClick={() => playWord(currentSentences[currentSentenceIndex].audio!)}
                      className="modern-reset-button"
                    >
                      <Volume2 size={20} />
                      Écouter
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (currentSentenceIndex < currentSentences.length - 1) {
                        setCurrentSentenceIndex(prev => prev + 1);
                      } else {
                        const currentMode = sentenceModes[0];
                        setGameMode(currentMode);
                        setMode('test');
                        setCurrentSentenceIndex(0);
                        
                        if (currentMode === 'construction') {
                          resetSentence(0);
                        } else {
                          prepareTranslationMode(currentSentences[0]);
                        }
                      }
                    }}
                    className={currentSentenceIndex === currentSentences.length - 1 ? "modern-verify-button" : "modern-reset-button"}
                  >
                    {currentSentenceIndex === currentSentences.length - 1 ? (
                      <>
                        <CheckCircle size={16} />
                        Commencer les exercices
                      </>
                    ) : (
                      <>
                        Suivant
                        <ChevronRight />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {mode === 'test' && gameMode === 'construction' && (
            <div className="modern-main-content">
              <div className="instruction">
                <div className="score-display">
                  Score : {score}/{totalPhrases}
                </div>
              
                <p className="modern-target-phrase">
                  {currentSentences[currentSentenceIndex].french}
                </p>
              </div>

              <div className={`modern-construction-area ${isCorrect ? 'success' : ''}`}>
                {constructedWords.map((word, index) => (
                  <DraggableWord
                    key={word.id}
                    word={word}
                    index={index}
                    moveWord={moveWord}
                    isCorrect={isCorrect}
                    onWordClick={removeWordByClick}
                  />
                ))}
              </div>

              <div className="modern-available-words">
                {availableWords.map((word) => (
                  <button
                    key={word.id}
                    onClick={() => addWord(word)}
                    className="modern-word-item"
                    disabled={isCorrect}
                  >
                    {word.text}
                  </button>
                ))}
              </div>

              <div className="modern-test-actions">
                <button
                  onClick={() => handleAnswer(constructedWords.map(w => w.text).join(' '))}
                  disabled={constructedWords.length === 0 || isCorrect}
                  className="modern-verify-button"
                >
                  <CheckCircle size={16} />
                  Vérifier
                </button>
              </div>

              {showCorrection && (
                <div className={`modern-feedback-message ${isCorrect ? 'success' : 'error'}`}>
                  <p>Phrase correcte :</p>
                  <p className="modern-correct-sentence">
                    {currentSentences[currentSentenceIndex].original}
                  </p>
                  
                  {currentSentences[currentSentenceIndex].audio && (
                    <button 
                      onClick={() => playWord(currentSentences[currentSentenceIndex].audio!)}
                      className="modern-reset-button mt-4"
                    >
                      <Volume2 size={16} />
                      Écouter
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === 'test' && gameMode === 'translation' && translationState && (
            <div className="modern-main-content">
              <div className="instruction">
                <div className="score-display">
                  Score : {score}/{totalPhrases}
                </div>
                <div className="mode-indicator translation">
                  Mode Traduction
                </div>
                <p className="modern-target-phrase">
                  Traduisez cette phrase en français :
                </p>
                <p className="modern-wolof-sentence">
                  {translationState.wolofSentence}
                </p>
              </div>

              <TranslationDropZone
                constructedWords={translationState.constructedTranslation}
                onWordDrop={addFrenchWord}
                moveWord={moveTranslationWord}
                isCorrect={isTranslationCorrect}
                onWordClick={removeFrenchWordByClick}
              />

              <div className="modern-available-words french-words-container">
                <h4 className="words-section-title">Mots disponibles :</h4>
                <div className="french-words-grid">
                  {translationState.availableFrenchWords.map((word) => (
                    <DraggableFrenchWord
                      key={word.id}
                      word={word}
                      index={word.index}
                      moveWord={() => {}}
                      isCorrect={false}
                      source="available"
                      onWordClick={addFrenchWord}
                    />
                  ))}
                </div>
              </div>

              <div className="modern-test-actions">
                {currentSentences[currentSentenceIndex].audio && (
                  <button 
                    onClick={() => playWord(currentSentences[currentSentenceIndex].audio!)}
                    className="modern-reset-button"
                  >
                    <Volume2 size={16} />
                    Écouter
                  </button>
                )}

                <button
                  onClick={handleTranslationAnswer}
                  disabled={translationState.constructedTranslation.length === 0 || isTranslationCorrect}
                  className="modern-verify-button"
                >
                  <CheckCircle size={16} />
                  Vérifier la traduction
                </button>
              </div>

              {showTranslationCorrection && (
                <div className={`modern-feedback-message ${isTranslationCorrect ? 'success' : 'error'}`}>
                  <p>Traduction correcte :</p>
                  <p className="modern-correct-sentence">
                    {translationState.correctFrenchWords.join(' ')}
                  </p>
                  
                  {currentSentences[currentSentenceIndex].audio && (
                    <button 
                      onClick={() => playWord(currentSentences[currentSentenceIndex].audio!)}
                      className="modern-reset-button mt-4"
                    >
                      <Volume2 size={16} />
                      Écouter à nouveau
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ✅ MODE SUMMARY AVEC SYSTÈME À DEUX ÉTAPES */}
          {mode === 'summary' && (
            <div className="modern-main-content">
              <div className="modern-summary-container">
                <h2 className="modern-summary-title">Résumé de la session</h2>
                <p className="modern-summary-score">Score : {score}/{totalPhrases}</p>
                
                {/* ✅ ÉTAPE 1: Affichage des résultats */}
                {summaryStep === 'results' && (
                  <>
                    <div className="modern-summary-stats">
                      <div className="summary-stat-card">
  <span className="stat-label">Phrases réussies du 1er coup</span>
  <span className="stat-value">{score}</span>
</div>
<div className="summary-stat-card">
  <span className="stat-label">Phrases apprises</span>
  <span className="stat-value">{learnedSentences.length}</span>
</div>
<div className="summary-stat-card">
  <span className="stat-label">Taux de maîtrise</span>
  <span className="stat-value">{totalPhrases > 0 ? Math.round((score / totalPhrases) * 100) : 0}%</span>
</div>
                      <div className="summary-stat-card modes-mixed">
                        <span className="stat-label">Modes utilisés</span>
                        <span className="stat-value">Mélangés</span>
                      </div>
                    </div>

                    {/* Sections phrases détaillées */}
                    <div className="modern-session-sentences">
                      <h3 className="section-title">Phrases de la session</h3>
                      
                      {/* Phrases maîtrisées */}
                      {learnedSentences.filter(s => s.mastered).length > 0 && (
                        <div className="mastered-sentences-section" style={{
                          marginBottom: '2rem',
                          padding: '1rem',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '8px',
                          borderLeft: '4px solid #10b981'
                        }}>
                          <h4 className="subsection-title" style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <CheckCircle size={20} style={{ color: '#10b981' }} />
                            Phrases maîtrisées ({learnedSentences.filter(s => s.mastered).length})
                          </h4>
                          <p className="section-description" style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem',
                            fontStyle: 'italic'
                          }}>
                            Réussies du premier coup - envoyées en révision
                          </p>
                          {learnedSentences.filter(sentence => sentence.mastered).map((sentence, index) => (
                            <div key={index} className="modern-sentence-card mastered" style={{
                              marginBottom: '1rem',
                              padding: '1rem',
                              background: 'var(--bg-secondary)',
                              borderRadius: '8px',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                              <div className="sentence-mode-indicator" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                              }}>
                                <span className="mode-badge mastered" style={{
                                  background: '#10b981',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem'
                                }}>
                                  Maîtrisée
                                </span>
                                <span className="attempts-badge" style={{
                                  background: 'rgba(107, 114, 128, 0.1)',
                                  color: 'var(--text-secondary)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem'
                                }}>
                                  {sentence.attempts} tentative(s)
                                </span>
                              </div>
                              <p className="modern-sentence-french" style={{ 
                                fontWeight: 'bold', 
                                marginBottom: '0.5rem',
                                color: 'var(--text-primary)'
                              }}>
                                {sentence.french}
                              </p>
                              <p className="modern-sentence-original" style={{ 
                                color: 'var(--text-secondary)',
                                marginBottom: '0.5rem'
                              }}>
                                {sentence.original}
                              </p>
                              {sentence.audio && (
                                <button
                                  onClick={() => playWord(sentence.audio!)}
                                  className="modern-audio-button mt-2"
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid #10b981',
                                    color: '#10b981',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Volume2 size={16} />
                                </button>
                              )}
                              <div className="mastered-badge" style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '0.5rem',
                                width: 'fit-content'
                              }}>
                                <CheckCircle size={16} />
                                <span>Réussie du premier coup</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Phrases non apprises */}
                      {learnedSentences.filter(s => !s.mastered).length > 0 && (
                        <div className="not-learned-sentences-section" style={{
                          marginBottom: '2rem',
                          padding: '1rem',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: '8px',
                          borderLeft: '4px solid #ef4444'
                        }}>
                          <h4 className="subsection-title" style={{
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            marginBottom: '0.5rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <XCircle size={20} style={{ color: '#ef4444' }} />
                            Phrases non apprises ({learnedSentences.filter(s => !s.mastered).length})
                          </h4>
                          <p className="section-description" style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '1rem',
                            fontStyle: 'italic'
                          }}>
                            Réussies après correction - considérées comme non apprises
                          </p>
                          {learnedSentences.filter(sentence => !sentence.mastered).map((sentence, index) => (
                            <div key={index} className="modern-sentence-card not-learned" style={{
                              marginBottom: '1rem',
                              padding: '1rem',
                              background: 'var(--bg-secondary)',
                              borderRadius: '8px',
                              border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              <div className="sentence-mode-indicator">
                                <span className="mode-badge not-learned" style={{
                                  background: '#ef4444',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem'
                                }}>
                                  Non apprise
                                </span>
                                <span className="attempts-badge" style={{
                                  background: 'rgba(107, 114, 128, 0.1)',
                                  color: 'var(--text-secondary)',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '0.75rem'
                                }}>
                                  {sentence.attempts} tentative(s)
                                </span>
                              </div>
                              <p className="modern-sentence-french">{sentence.french}</p>
                              <p className="modern-sentence-original">{sentence.original}</p>
                              {sentence.audio && (
                                <button
                                  onClick={() => playWord(sentence.audio!)}
                                  className="modern-audio-button mt-2"
                                >
                                  <Volume2 size={16} />
                                </button>
                              )}
                              <div className="not-learned-badge" style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#dc2626',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '0.5rem',
                                width: 'fit-content'
                              }}>
                                <XCircle size={16} />
                                <span>Échouée au premier essai - non apprise</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ✅ NOUVEAU: Bouton pour voir les récompenses XP */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <motion.button
                        onClick={handleShowXP}
                        className="continue-button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          background: xpAnimationProps.xpGained > 0 
                            ? 'linear-gradient(45deg, #8b4513, #a0522d)' 
                            : 'linear-gradient(45deg, #6b7280, #4b5563)',
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
                        <ArrowRight size={20} />
                      </motion.button>
                      
                      <div style={{
                        marginTop: '12px',
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic'
                      }}>
                        {xpAnimationProps.xpGained > 0 ? (
                          <>Voir les récompenses XP gagnées 🏆</>
                        ) : (
                          <>Terminer la session</>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* ✅ ÉTAPE 2: Affichage XP avec animation */}
                {summaryStep === 'xp' && (
                  <>
                    <div className="summary-content">
                      <h3 className="summary-heading">Félicitations ! 🎉</h3>
                      
                      {/* ✅ NOUVEAU: Résumé XP détaillé style GrammarMode */}
                      <div className="xp-summary" style={{
                        marginTop: '16px',
                        padding: '20px',
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: '16px',
                        border: '3px solid #3b82f6',
                        textAlign: 'center',
                        boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                      }}>
                        {/* ✅ AFFICHAGE STATIQUE - utilise les données réelles des phrases maîtrisées */}
                        <div style={{
                          fontSize: '2em',
                          fontWeight: '800',
                          color: '#3b82f6',
                          marginBottom: '8px',
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          🏆 <strong>+{learnedSentences.filter(s => s.mastered).length * 15} XP</strong>
                        </div>

                        {/* Détail du calcul */}
                        <div style={{
                          fontSize: '1.1em',
                          color: 'var(--text-secondary)',
                          marginBottom: '16px'
                        }}>
                          15 XP × {learnedSentences.filter(s => s.mastered).length} phrase{learnedSentences.filter(s => s.mastered).length > 1 ? 's' : ''} maîtrisée{learnedSentences.filter(s => s.mastered).length > 1 ? 's' : ''}
                        </div>
                        
                        {/* ✅ NOUVEAU: Grille des phrases avec XP individuel */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                          gap: '12px',
                          marginTop: '20px'
                        }}>
                          {learnedSentences.filter(s => s.mastered).map((sentence, index) => (
                            <div key={index} style={{
                              padding: '12px',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              borderRadius: '12px',
                              border: '2px solid #10b981',
                              textAlign: 'center'
                            }}>
                              <div style={{
                                fontWeight: '600',
                                color: 'var(--text-primary)',
                                marginBottom: '4px',
                                fontSize: '0.9em'
                              }}>
                                {sentence.original}
                              </div>
                              <div style={{
                                fontSize: '0.8em',
                                color: 'var(--text-secondary)',
                                marginBottom: '4px'
                              }}>
                                {sentence.french}
                              </div>
                              <div style={{
                                fontSize: '0.9em',
                                color: '#10b981',
                                fontWeight: '700'
                              }}>
                                +15 XP
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* ✅ MODIFICATION: Boutons d'action seulement à l'étape XP */}
                    <div className="modern-action-buttons">
                      <button
                        onClick={() => {
                          resetSummaryState();
                          continueTrainingWithoutSave();
                        }}
                        className="modern-primary-button"
                      >
                        <RotateCw size={16} />
                        Continuer l'apprentissage
                      </button>

                      <button
                        onClick={() => {
                          resetSummaryState();
                          handleBackToCategoriesWithoutSave();
                        }}
                        className="modern-secondary-button"
                      >
                        <Home size={16} />
                        Retour aux catégories
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ MODAL DE CONFIRMATION DE SORTIE */}
        <ConfirmationModal
          isOpen={showExitModal}
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
          title="Quitter la session ?"
          message={`Vous êtes en cours d'apprentissage. ${learnedSentences.length > 0 ? `Vous avez appris ${learnedSentences.length} phrase(s) qui seront sauvegardées.` : 'Votre progression sera sauvegardée.'} Voulez-vous vraiment quitter ?`}
          confirmText="Oui, quitter"
          cancelText="Continuer l'apprentissage"
          confirmButtonStyle="danger"
        />
      </div>
    </DndProvider>
  );
};

export default SentenceConstructionGame;