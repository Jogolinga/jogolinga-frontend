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
  Home,
  Book
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { 
  LanguageCode,
  UserProgress
} from '../types/types';
import { getLanguageData } from '../data/languages';
import { useAudio } from '../hooks/hooks';
import useSentenceRevision, { type SentenceRevisionInfo } from '../hooks/useSentenceRevision';
import ConfirmationModal from './ConfirmationModal';
import './SentenceConstructionGame.css';

const SENTENCES_PER_LESSON = 5;
const ItemTypes = { WORD: "word" };

interface WordWithId {
  id: string;
  text: string;
  index: number;
}

// ✅ NOUVEAU: Interface pour les mots français
interface FrenchWordWithId {
  id: string;
  text: string;
  index: number;
  isCorrect?: boolean;
}

// ✅ NOUVEAU: État pour le mode traduction
interface TranslationState {
  wolofSentence: string;
  correctFrenchWords: string[];
  availableFrenchWords: FrenchWordWithId[];
  constructedTranslation: FrenchWordWithId[];
  distractorWords: string[];
}

interface SentenceRevisionGameProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onAnswer?: (isCorrect: boolean) => void;
  userProgress?: UserProgress;
  disableConfirmationModal?: boolean; // ✅ NOUVEAU: Pour désactiver le modal
 
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

// ✅ NOUVEAU: Composant pour les mots français draggables
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

// ✅ NOUVEAU: Zone de drop pour la traduction
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

const SentenceRevisionGame: React.FC<SentenceRevisionGameProps> = ({
  languageCode,
  onBackToCategories,
  onAnswer,
  userProgress,
  disableConfirmationModal = false, // ✅ NOUVEAU: Par défaut false
  
}) => {
  const playAudio = useAudio();
  const languageData = getLanguageData(languageCode);
  
  // Hook de révision
  const {
    revisionProgress,
    updateRevisionProgress,
    getSessionHistory,
    finishSession,
    resetSession,
    sessionState,
    isLearnedSentence
  } = useSentenceRevision(languageCode);
  
  const [mode, setMode] = useState<'selection' | 'test' | 'summary'>('selection');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [constructedWords, setConstructedWords] = useState<WordWithId[]>([]);
  const [availableWords, setAvailableWords] = useState<WordWithId[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showCorrection, setShowCorrection] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPhrases, setTotalPhrases] = useState(0);

  // ✅ NOUVEAU: États pour le mode traduction en révision
  const [translationState, setTranslationState] = useState<TranslationState | null>(null);
  const [isTranslationCorrect, setIsTranslationCorrect] = useState(false);
  const [showTranslationCorrection, setShowTranslationCorrection] = useState(false);

  // États pour la révision
  const [revisionSentences, setRevisionSentences] = useState<SentenceRevisionInfo[]>([]);
  const [revisionMode, setRevisionMode] = useState<'drag-drop' | 'text-input' | 'translation'>('drag-drop'); // ✅ Ajout du mode translation
  const [textInput, setTextInput] = useState('');
  const [showTextCorrection, setShowTextCorrection] = useState(false);
  const [revisionResults, setRevisionResults] = useState<Array<{sentence: SentenceRevisionInfo, isCorrect: boolean, timestamp: number}>>([]);

  // ✅ NOUVEAU: États pour le modal de confirmation
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void | null>(null);

  useFixedAppStyles('sentenceConstruction');

  // ✅ CORRECTION: Calculer TOUTES les phrases apprises (sans filtre de temps)
  const getAllLearnedSentences = useCallback((): SentenceRevisionInfo[] => {
    console.log('🔍 === DEBUT getAllLearnedSentences CORRIGÉ ===');
    
    // Vérifier localStorage directement
    const localKey = `sentence-revision-${languageCode}-sessionHistory`;
    const localData = localStorage.getItem(localKey);
    console.log('📱 localStorage key:', localKey);
    console.log('📱 localStorage data exists:', !!localData);
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        console.log('📱 localStorage parsed length:', Array.isArray(parsed) ? parsed.length : 'not array');
        
        if (Array.isArray(parsed)) {
          // ✅ NOUVELLE LOGIQUE: Validation stricte des phrases
          const validSentences = parsed.filter((sentence: any) => {
            const isValid = sentence.type === 'sentence' && 
              sentence.original && sentence.original.trim() !== '' &&
              sentence.french && sentence.french.trim() !== '' &&
              sentence.category && sentence.category.trim() !== '';
            
            if (!isValid) {
              console.warn('❌ Phrase invalide filtrée:', {
                original: sentence.original || 'MANQUANT',
                french: sentence.french || 'MANQUANT',
                category: sentence.category || 'MANQUANT',
                type: sentence.type || 'MANQUANT'
              });
            }
            
            return isValid;
          });
          
          console.log('📱 localStorage - phrases valides:', validSentences.length);
          console.log('📱 localStorage - phrases filtrées:', parsed.length - validSentences.length);
          
          // ✅ NOUVEAU: Log détaillé des phrases trouvées
          validSentences.forEach((s, index) => {
            console.log(`  ${index + 1}. "${s.original}" -> "${s.french}" (catégorie: ${s.category})`);
          });
          
          if (validSentences.length > 0) {
            // ✅ Mélanger aléatoirement les phrases valides
            const shuffledSentences = shuffleArray(validSentences);
            console.log('✅ Phrases valides mélangées depuis localStorage');
            console.log('🔍 === FIN getAllLearnedSentences CORRIGÉ ===');
            return shuffledSentences.slice(0, SENTENCES_PER_LESSON);
          }
        }
      } catch (error) {
        console.error('❌ Erreur parsing localStorage:', error);
      }
    }
    
    // Utiliser les données du hook comme fallback
    const sessionHistory = getSessionHistory();
    console.log('📚 getSessionHistory() length:', sessionHistory.length);
    
    if (sessionHistory.length > 0) {
      const validFromSession = sessionHistory.filter((sentence: SentenceRevisionInfo) => {
        const isValid = sentence.type === 'sentence' && 
          sentence.original && sentence.original.trim() !== '' &&
          sentence.french && sentence.french.trim() !== '' &&
          sentence.category && sentence.category.trim() !== '';
        
        if (!isValid) {
          console.warn('❌ Phrase invalide dans sessionHistory:', {
            original: sentence.original || 'MANQUANT',
            french: sentence.french || 'MANQUANT',
            category: sentence.category || 'MANQUANT',
            type: sentence.type || 'MANQUANT'
          });
        }
        
        return isValid;
      });
      
      console.log('📚 SessionHistory - phrases valides:', validFromSession.length);
      console.log('📚 SessionHistory - phrases filtrées:', sessionHistory.length - validFromSession.length);
      
      // ✅ NOUVEAU: Log détaillé des phrases du hook
      validFromSession.forEach((s, index) => {
        console.log(`  ${index + 1}. "${s.original}" -> "${s.french}" (catégorie: ${s.category})`);
      });
      
      if (validFromSession.length > 0) {
        const shuffledSentences = shuffleArray(validFromSession);
        console.log('🔍 === FIN getAllLearnedSentences CORRIGÉ ===');
        return shuffledSentences.slice(0, SENTENCES_PER_LESSON);
      }
    }
    
    console.log('❌ Aucune phrase valide trouvée');
    console.log('🔍 === FIN getAllLearnedSentences CORRIGÉ ===');
    return [];
  }, [getSessionHistory, languageCode]);

  // ✅ CORRECTION: Compter toutes les phrases apprises (pas seulement celles dues)
  const getLearnedSentencesCount = useCallback((): number => {
    console.log('🔍 getLearnedSentencesCount - début du comptage détaillé');
    
    // ✅ NOUVEAU: Compter TOUTES les phrases apprises depuis localStorage
    const localKey = `sentence-revision-${languageCode}-sessionHistory`;
    const localData = localStorage.getItem(localKey);
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) {
          const validCount = parsed.filter((sentence: any) => {
            const isValid = sentence.type === 'sentence' && 
              sentence.original && sentence.original.trim() !== '' &&
              sentence.french && sentence.french.trim() !== '' &&
              sentence.category && sentence.category.trim() !== '';
            
            return isValid;
          }).length;
          
          console.log("🔍 getLearnedSentencesCount result (localStorage):", validCount);
          console.log("📱 Données localStorage - Total:", parsed.length, "Valides:", validCount);
          return validCount;
        }
      } catch (error) {
        console.error('❌ Erreur comptage localStorage:', error);
      }
    }
    
    // Fallback sur le hook
    const sessionHistory = getSessionHistory();
    const hookCount = sessionHistory.filter((sentence: SentenceRevisionInfo) => {
      const isValid = sentence.type === 'sentence' && 
        sentence.original && sentence.original.trim() !== '' &&
        sentence.french && sentence.french.trim() !== '' &&
        sentence.category && sentence.category.trim() !== '';
      
      return isValid;
    }).length;
    
    console.log("🔍 getLearnedSentencesCount result (fallback hook):", hookCount);
    console.log("📚 Données hook - Total:", sessionHistory.length, "Valides:", hookCount);
    return hookCount;
  }, [getSessionHistory, languageCode]);

  const createWordsWithIds = useCallback((words: string[]) => {
    return words.map((word, index) => ({
      id: `${word}-${index}-${Date.now()}`,
      text: word,
      index
    }));
  }, []);

  // ✅ NOUVEAU: Fonction pour créer les mots français avec IDs
  const createFrenchWordsWithIds = useCallback((words: string[]): FrenchWordWithId[] => {
    return words.map((word, index) => ({
      id: `french-${word}-${index}-${Date.now()}`,
      text: word,
      index
    }));
  }, []);

  // ✅ NOUVEAU: Fonction pour nettoyer les mots
  const cleanWord = useCallback((word: string): string => {
    return word
      .replace(/\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // ✅ NOUVEAU: Fonction pour nettoyer les phrases
  const cleanSentence = useCallback((sentence: string): string => {
    return sentence
      .split(' ')
      .map(word => cleanWord(word))
      .filter(word => word.length > 0)
      .join(' ');
  }, [cleanWord]);

  // ✅ NOUVEAU: Générer des mots distracteurs
  const generateDistractorWords = useCallback((currentFrench: string): string[] => {
    // Pour la révision, on peut utiliser des mots de base communs
    const commonWords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'avec', 'pour', 'dans', 'sur'];
    const currentWords = cleanSentence(currentFrench).toLowerCase().split(' ');
    const distractors = commonWords.filter(word => !currentWords.includes(word));
    return distractors.slice(0, 3); // 3 mots distracteurs
  }, [cleanSentence]);

  const shuffleArray = <T extends any>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // ✅ NOUVEAU: Fonction pour gérer la navigation avec confirmation
  const handleNavigationWithConfirmation = useCallback((navigationCallback: () => void) => {
    // Vérifier si on est dans une session active de révision
    const isInActiveRevision = mode === 'test' && currentSentenceIndex < revisionSentences.length;
    const hasRevisionProgress = revisionResults.length > 0 || score > 0;
    
    if (isInActiveRevision || hasRevisionProgress) {
      // Demander confirmation avant de quitter
      setPendingNavigation(() => navigationCallback);
      setShowExitModal(true);
    } else {
      // Navigation directe si pas de progression
      navigationCallback();
    }
  }, [mode, currentSentenceIndex, revisionSentences.length, revisionResults.length, score]);

  // ✅ NOUVEAU: Gérer la confirmation de sortie
  const handleExitConfirm = useCallback(() => {
    setShowExitModal(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  // ✅ NOUVEAU: Gérer l'annulation de sortie
  const handleExitCancel = useCallback(() => {
    setShowExitModal(false);
    setPendingNavigation(null);
  }, []);

  // Fonction pour préparer la révision
  const prepareRevisionSentence = useCallback((sentence: SentenceRevisionInfo) => {
    const wordsToUse = sentence.words || sentence.original.split(' ');
    setConstructedWords([]);
    setAvailableWords(createWordsWithIds(shuffleArray(wordsToUse)));
    setAttempts(0);
    setShowCorrection(false);
    setIsCorrect(false);
  }, [createWordsWithIds]);

  // ✅ NOUVEAU: Fonction pour préparer le mode traduction en révision
  const prepareTranslationMode = useCallback((sentence: SentenceRevisionInfo) => {
    const cleanedFrench = cleanSentence(sentence.french);
    const frenchWords = cleanedFrench.split(' ');
    const distractorWords = generateDistractorWords(sentence.french);
    
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
    setIsTranslationCorrect(false);
    setShowTranslationCorrection(false);
  }, [cleanSentence, generateDistractorWords, createFrenchWordsWithIds]);

  // ✅ MODIFIÉ: Gestionnaire pour démarrer la révision (toutes phrases apprises)
  const handleStartRevision = useCallback(() => {
    const sentencesToRevise = getAllLearnedSentences();
    if (sentencesToRevise.length === 0) {
      alert("Aucune phrase apprise à réviser pour le moment !");
      return;
    }

    console.log(`🎯 Démarrage révision avec ${sentencesToRevise.length} phrases mélangées`);
    setRevisionSentences(sentencesToRevise);
    setCurrentSentenceIndex(0);
    setScore(0);
    setTotalPhrases(sentencesToRevise.length);
    setMode('test');
    setRevisionResults([]);
    
    // ✅ NOUVEAU: Choisir aléatoirement entre 3 modes
    const modes = ['drag-drop', 'text-input', 'translation'];
    const randomMode = modes[Math.floor(Math.random() * modes.length)] as 'drag-drop' | 'text-input' | 'translation';
    setRevisionMode(randomMode);
    
    if (randomMode === 'drag-drop') {
      prepareRevisionSentence(sentencesToRevise[0]);
    } else if (randomMode === 'translation') {
      prepareTranslationMode(sentencesToRevise[0]);
    } else {
      setTextInput('');
      setShowTextCorrection(false);
      setIsCorrect(false);
    }
    
    resetSession();
  }, [getAllLearnedSentences, prepareRevisionSentence, prepareTranslationMode, resetSession]);

  // Gestionnaire pour les réponses en révision (drag-drop)
  const handleRevisionAnswer = useCallback(async (answer: string) => {
    if (!revisionSentences[currentSentenceIndex]) return;

    const currentSentence = revisionSentences[currentSentenceIndex];
    const constructedText = answer;
    const correctText = currentSentence.original;
    const isAnswerCorrect = constructedText.toLowerCase() === correctText.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    onAnswer?.(isAnswerCorrect);

    const revisionResult = {
      sentence: currentSentence,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now()
    };
    
    setRevisionResults(prev => [...prev, revisionResult]);

    if (isAnswerCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      setTimeout(() => {
        if (currentSentenceIndex < revisionSentences.length - 1) {
          const nextIndex = currentSentenceIndex + 1;
          setCurrentSentenceIndex(nextIndex);
          
          const modes = ['drag-drop', 'text-input', 'translation'];
          const randomMode = modes[Math.floor(Math.random() * modes.length)] as 'drag-drop' | 'text-input' | 'translation';
          setRevisionMode(randomMode);
          
          if (randomMode === 'drag-drop') {
            prepareRevisionSentence(revisionSentences[nextIndex]);
          } else if (randomMode === 'translation') {
            prepareTranslationMode(revisionSentences[nextIndex]);
          } else {
            setTextInput('');
            setShowTextCorrection(false);
            setIsCorrect(false);
          }
        } else {
          setMode('summary');
        }
      }, 1000);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= 2) {
        setShowCorrection(true);
      }
    }
  }, [
    revisionSentences,
    currentSentenceIndex,
    onAnswer,
    attempts,
    score,
    prepareRevisionSentence,
    prepareTranslationMode
  ]);

  // Gestionnaire pour les réponses en saisie de texte
  const handleTextInputAnswer = useCallback(async () => {
    if (!revisionSentences[currentSentenceIndex] || !textInput.trim()) return;

    const currentSentence = revisionSentences[currentSentenceIndex];
    const userAnswer = textInput.trim();
    const correctText = currentSentence.original;
    const isAnswerCorrect = userAnswer.toLowerCase() === correctText.toLowerCase();
    
    setIsCorrect(isAnswerCorrect);
    onAnswer?.(isAnswerCorrect);

    const revisionResult = {
      sentence: currentSentence,
      isCorrect: isAnswerCorrect,
      timestamp: Date.now()
    };
    
    setRevisionResults(prev => [...prev, revisionResult]);

    if (isAnswerCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      setTimeout(() => {
        if (currentSentenceIndex < revisionSentences.length - 1) {
          const nextIndex = currentSentenceIndex + 1;
          setCurrentSentenceIndex(nextIndex);
          
          const modes = ['drag-drop', 'text-input', 'translation'];
          const randomMode = modes[Math.floor(Math.random() * modes.length)] as 'drag-drop' | 'text-input' | 'translation';
          setRevisionMode(randomMode);
          
          if (randomMode === 'drag-drop') {
            prepareRevisionSentence(revisionSentences[nextIndex]);
          } else if (randomMode === 'translation') {
            prepareTranslationMode(revisionSentences[nextIndex]);
          } else {
            setTextInput('');
            setShowTextCorrection(false);
            setIsCorrect(false);
          }
        } else {
          setMode('summary');
        }
      }, 1000);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= 2) {
        setShowTextCorrection(true);
      }
    }
  }, [
    revisionSentences,
    currentSentenceIndex,
    textInput,
    onAnswer,
    attempts,
    score,
    prepareRevisionSentence,
    prepareTranslationMode
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

  // ✅ NOUVEAU: Gestionnaires pour le mode traduction
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
    
    console.log('✅ Mot français retiré (révision):', wordToRemove.text);
  }, [translationState, isTranslationCorrect]);

   const removeWordByClick = useCallback((wordToRemove: WordWithId) => {
      if (isCorrect) return;
      
      const wordIndex = constructedWords.findIndex(w => w.id === wordToRemove.id);
      if (wordIndex === -1) return;
      
      const newConstructedWords = constructedWords.filter(w => w.id !== wordToRemove.id);
      setConstructedWords(newConstructedWords);
      
      setAvailableWords(prev => [...prev, { ...wordToRemove, index: prev.length }]);
    }, [constructedWords, isCorrect]);

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

  // ✅ NOUVEAU: Gestionnaire pour les réponses de traduction
  const handleTranslationAnswer = useCallback(() => {
    if (!translationState) return;
    
    const constructedText = translationState.constructedTranslation.map(w => cleanWord(w.text)).join(' ');
    const correctText = translationState.correctFrenchWords.map(w => cleanWord(w)).join(' ');
    const isAnswerCorrect = constructedText.toLowerCase() === correctText.toLowerCase();
    
    setIsTranslationCorrect(isAnswerCorrect);
    onAnswer?.(isAnswerCorrect);

    const revisionResult = {
      sentence: revisionSentences[currentSentenceIndex],
      isCorrect: isAnswerCorrect,
      timestamp: Date.now()
    };
    
    setRevisionResults(prev => [...prev, revisionResult]);

    if (isAnswerCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      
      setTimeout(() => {
        if (currentSentenceIndex < revisionSentences.length - 1) {
          const nextIndex = currentSentenceIndex + 1;
          setCurrentSentenceIndex(nextIndex);
          
          const modes = ['drag-drop', 'text-input', 'translation'];
          const randomMode = modes[Math.floor(Math.random() * modes.length)] as 'drag-drop' | 'text-input' | 'translation';
          setRevisionMode(randomMode);
          
          if (randomMode === 'drag-drop') {
            prepareRevisionSentence(revisionSentences[nextIndex]);
          } else if (randomMode === 'translation') {
            prepareTranslationMode(revisionSentences[nextIndex]);
          } else {
            setTextInput('');
            setShowTextCorrection(false);
            setIsCorrect(false);
          }
        } else {
          setMode('summary');
        }
      }, 1000);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts + 1 >= 2) {
        setShowTranslationCorrection(true);
      }
    }
  }, [
    translationState,
    cleanWord,
    onAnswer,
    revisionSentences,
    currentSentenceIndex,
    score,
    attempts,
    prepareRevisionSentence,
    prepareTranslationMode
  ]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="modern-sentence-game top-aligned">
        <div className="modern-game-container">
          <header className="modern-game-header" style={{ marginTop: 0, paddingTop: '1rem' }}>
            <button 
              onClick={() => {
                if (mode === 'selection') {
                  onBackToCategories();
                } else if (mode === 'summary') {
                  setMode('selection');
                } else if (mode === 'test') {
                  // ✅ Navigation avec confirmation pour test (session active de révision)
                  handleNavigationWithConfirmation(() => {
                    setMode('selection');
                  });
                }
              }}
              className="modern-back-button"
            >
              <ArrowLeft size={16} />
              <span>Retour</span>
            </button>
            <h1 className="modern-header-title" style={{ margin: 0 }}>
              Révision - {languageData.name}
            </h1>
          </header>

          {/* Mode sélection de révision */}
          {mode === 'selection' && (
            <div className="modern-main-content">
              <div className="modern-category-stats">
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases apprises</h3>
                  <p className="modern-stat-value">{getLearnedSentencesCount()}</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Phrases maîtrisées</h3>
                  <p className="modern-stat-value">{revisionProgress.learnedSentences.size}</p>
                </div>
                <div className="modern-stat-card">
                  <h3 className="modern-stat-title">Historique total</h3>
                  <p className="modern-stat-value">{getSessionHistory().length}</p>
                </div>
              </div>

              <div className="modern-action-buttons">
                <button
                  onClick={handleStartRevision}
                  className="modern-primary-button"
                  disabled={getLearnedSentencesCount() === 0}
                >
                  <Book size={16} />
                  <span>Commencer la révision ({getLearnedSentencesCount()} phrases)</span>
                </button>
              </div>

              <div className="modern-sentence-list">
                <h3>Phrases disponibles pour révision</h3>
                <p className="modern-info-text">
                  ✨ <strong>Système simplifié :</strong> Révisez toutes vos phrases apprises dans un ordre aléatoire. 
                  Pas de contrainte de temps, juste de la pratique !
                </p>
                {getAllLearnedSentences().map((sentence, index) => (
                  <div 
                    key={index} 
                    className="modern-sentence-card revision-card"
                  >
                    <p className="modern-sentence-french">{sentence.french}</p>
                    <p className="modern-sentence-original">{sentence.original}</p>
                    <div className="revision-info">
                      <span className="category-badge">{sentence.category}</span>
                      <span className="time-badge">
                        Apprise le: {new Date(sentence.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {sentence.audio && (
                      <button
                        onClick={() => playAudio(sentence.audio!)}
                        className="modern-audio-button"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mode test de révision */}
          {mode === 'test' && revisionSentences[currentSentenceIndex] && (
            <div className="modern-main-content">
              <div className="instruction">
                <div className="score-display">
                  Révision : {score}/{totalPhrases}
                </div>
                <div className={`mode-indicator revision ${revisionMode}`}>
                  Mode Révision - {revisionMode === 'drag-drop' ? 'Glisser-Déposer' : revisionMode === 'translation' ? 'Traduction' : 'Saisie de texte'}
                </div>
              
                <p className="modern-target-phrase" style={{ color: 'var(--text-primary, #374151)' }}>
                  {revisionMode === 'translation' ? 'Traduisez cette phrase en français :' : revisionSentences[currentSentenceIndex].french}
                </p>
                
                {revisionMode === 'translation' && (
                  <p className="modern-wolof-sentence">
                    {revisionSentences[currentSentenceIndex].original}
                  </p>
                )}
              </div>

              {revisionMode === 'drag-drop' ? (
                // Mode glisser-déposer
                <>
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
                    {revisionSentences[currentSentenceIndex].audio && (
                      <button 
                        onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
                        className="modern-reset-button"
                      >
                        <Volume2 size={16} />
                        Écouter
                      </button>
                    )}

                    <button
                      onClick={() => handleRevisionAnswer(constructedWords.map(w => w.text).join(' '))}
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
                        {revisionSentences[currentSentenceIndex].original}
                      </p>
                      
                      {revisionSentences[currentSentenceIndex].audio && (
                        <button 
                          onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
                          className="modern-reset-button mt-4"
                        >
                          <Volume2 size={16} />
                          Écouter
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : revisionMode === 'translation' && translationState ? (
                // Mode traduction
                <>
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
                    {revisionSentences[currentSentenceIndex].audio && (
                      <button 
                        onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
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
                      
                      {revisionSentences[currentSentenceIndex].audio && (
                        <button 
                          onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
                          className="modern-reset-button mt-4"
                        >
                          <Volume2 size={16} />
                          Écouter à nouveau
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Mode saisie de texte
                <>
                  <div className="modern-text-input-container">
                    <label htmlFor="sentence-input" className="text-input-label" style={{ color: 'var(--text-primary, #374151)' }}>
                      Tapez la phrase en {languageData.name.toLowerCase()} :
                    </label>
                    <input
                      id="sentence-input"
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && textInput.trim() && !isCorrect) {
                          handleTextInputAnswer();
                        }
                      }}
                      className={`modern-text-input ${isCorrect ? 'success' : ''}`}
                      placeholder="Écrivez votre réponse ici..."
                      disabled={isCorrect}
                      autoFocus
                      style={{
                        color: 'var(--text-primary, #374151)',
                        backgroundColor: 'var(--bg-primary, #ffffff)',
                        borderColor: 'var(--border-primary, #d1d5db)'
                      }}
                    />
                  </div>

                  <div className="modern-test-actions">
                    <button
                      onClick={() => setTextInput('')}
                      disabled={!textInput.trim() || isCorrect}
                      className="modern-reset-button"
                    >
                      <XCircle size={16} />
                      Effacer
                    </button>

                    {revisionSentences[currentSentenceIndex].audio && (
                      <button 
                        onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
                        className="modern-reset-button"
                      >
                        <Volume2 size={16} />
                        Écouter
                      </button>
                    )}

                    <button
                      onClick={handleTextInputAnswer}
                      disabled={!textInput.trim() || isCorrect}
                      className="modern-verify-button"
                    >
                      <CheckCircle size={16} />
                      Vérifier
                    </button>
                  </div>

                  {showTextCorrection && (
                    <div className={`modern-feedback-message ${isCorrect ? 'success' : 'error'}`}>
                      <p>Phrase correcte :</p>
                      <p className="modern-correct-sentence" style={{ color: 'var(--success-color, #10b981)' }}>
                        {revisionSentences[currentSentenceIndex].original}
                      </p>
                      {!isCorrect && (
                        <p className="user-answer" style={{ color: 'var(--text-secondary, #6b7280)' }}>
                          Votre réponse : <span className="incorrect-answer" style={{ color: 'var(--error-color, #dc2626)' }}>{textInput}</span>
                        </p>
                      )}
                      
                      {revisionSentences[currentSentenceIndex].audio && (
                        <button 
                          onClick={() => playAudio(revisionSentences[currentSentenceIndex].audio!)}
                          className="modern-reset-button mt-4"
                        >
                          <Volume2 size={16} />
                          Écouter
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Résumé de révision */}
          {mode === 'summary' && (
            <div className="modern-main-content">
              <div className="modern-summary-container">
                <h2 className="modern-summary-title">Résumé de la révision</h2>
                <p className="modern-summary-score">Score : {score}/{totalPhrases}</p>
                
                <div className="modern-summary-stats">
                  <div className="summary-stat-card">
                    <span className="stat-label">Phrases révisées</span>
                    <span className="stat-value">{score}</span>
                  </div>
                  <div className="summary-stat-card">
                    <span className="stat-label">Total disponible</span>
                    <span className="stat-value">{getLearnedSentencesCount()}</span>
                  </div>
                  <div className="summary-stat-card">
                    <span className="stat-label">Précision</span>
                    <span className="stat-value">{totalPhrases > 0 ? Math.round((score / totalPhrases) * 100) : 0}%</span>
                  </div>
                  <div className="summary-stat-card revision-mode">
                    <span className="stat-label">Mode</span>
                    <span className="stat-value">Révision Libre</span>
                  </div>
                </div>

                <div className="modern-session-sentences">
                  <h3 className="section-title">Phrases révisées</h3>
                  {revisionResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`modern-sentence-card revision-completed ${result.isCorrect ? 'success' : 'failed'}`}
                    >
                      <p className="modern-sentence-french">{result.sentence.french}</p>
                      <p className="modern-sentence-original">{result.sentence.original}</p>
                      <div className="revision-info">
                        <span className="category-badge">{result.sentence.category}</span>
                        <span className={`result-badge ${result.isCorrect ? 'success' : 'failed'}`}>
                          {result.isCorrect ? (
                            <>
                              <CheckCircle size={16} />
                              Réussie
                            </>
                          ) : (
                            <>
                              <XCircle size={16} />
                              Échouée
                            </>
                          )}
                        </span>
                      </div>
                      {result.sentence.audio && (
                        <button
                          onClick={() => playAudio(result.sentence.audio!)}
                          className="modern-audio-button mt-2"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="modern-action-buttons">
                  <button
                    onClick={async () => {
                      console.log('💾 SAUVEGARDE des résultats de révision...');
                      
                      for (const result of revisionResults) {
                        try {
                          await updateRevisionProgress(result.sentence, result.isCorrect);
                          console.log(`✅ Résultat sauvegardé: ${result.sentence.original} - ${result.isCorrect ? 'Réussi' : 'Échoué'}`);
                        } catch (error) {
                          console.error(`❌ Erreur sauvegarde: ${result.sentence.original}`, error);
                        }
                      }

                      if (revisionResults.length > 0) {
                        const lastResult = revisionResults[revisionResults.length - 1];
                        await finishSession({
                          showStats: true,
                          lastSentenceInfo: {
                            original: lastResult.sentence.original,
                            french: lastResult.sentence.french,
                            category: lastResult.sentence.category,
                            isCorrect: lastResult.isCorrect,
                            timestamp: lastResult.timestamp,
                            nextReview: Date.now() + (lastResult.isCorrect ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000),
                            audio: lastResult.sentence.audio,
                            words: lastResult.sentence.words
                          }
                        });
                      }
                      
                      console.log('✅ SAUVEGARDE TERMINÉE - Retour à la sélection');
                      
                      setRevisionResults([]);
                      setMode('selection');
                    }}
                    className="modern-primary-button"
                  >
                    💾 Sauvegarder et continuer
                  </button>

                  {getLearnedSentencesCount() > 0 && (
                    <button
                      onClick={async () => {
                        for (const result of revisionResults) {
                          try {
                            await updateRevisionProgress(result.sentence, result.isCorrect);
                          } catch (error) {
                            console.error(`❌ Erreur sauvegarde: ${result.sentence.original}`, error);
                          }
                        }
                        
                        setRevisionResults([]);
                        handleStartRevision();
                      }}
                      className="modern-secondary-button"
                    >
                      🔄 Nouvelle révision ({getLearnedSentencesCount()} phrases)
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      for (const result of revisionResults) {
                        try {
                          await updateRevisionProgress(result.sentence, result.isCorrect);
                        } catch (error) {
                          console.error(`❌ Erreur sauvegarde: ${result.sentence.original}`, error);
                        }
                      }
                      
                      setRevisionResults([]);
                      setMode('selection');
                    }}
                    className="modern-secondary-button"
                  >
                    <Home size={16} />
                    Retour au menu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmation de sortie - seulement si activé */}
        {!disableConfirmationModal && (
          <ConfirmationModal
            isOpen={showExitModal}
            onConfirm={handleExitConfirm}
            onCancel={handleExitCancel}
            title="Quitter la révision ?"
            message={`Vous êtes en cours de révision. ${revisionResults.length > 0 ? `Vous avez révisé ${revisionResults.length} phrase(s) qui ne seront pas sauvegardées.` : 'Votre progression ne sera pas sauvegardée.'} Voulez-vous vraiment quitter ?`}
            confirmText="Oui, quitter"
            cancelText="Continuer la révision"
            confirmButtonStyle="danger"
          />
        )}
      </div>
    </DndProvider>
  );
};

export default SentenceRevisionGame;