import React from 'react';

// Types de base pour les langues
export type LanguageCode = 'wf' | 'ba' | 'la'| 'ff'| 'co'| 'sw';

// Type de base pour les mots
export interface Word {
  original: string;
  translation: string;
  audio?: string;
  illustration?: string;
  explanation?: string;
  example?: string;
}

export interface LearnedSentence {
  original: string;
  french: string;
  audio?: string;
  mastered: boolean;
  category: string;
  timestamp: number;
  words: string[];        // Ajout de la compatibilité 
  translation?: string;  // Ajout de la compatibilité
  type?: 'sentence';
  interval: number; 
    attempts: number;
  firstAttemptCorrect: boolean;
}

// Nouvelle interface pour les catégories de phrases
export interface SentenceCategory {
  icon: string;
  description: string;
}

export interface SentenceCategoryDictionary {
  [category: string]: SentenceCategory;
}

export interface RevisionSessionInfo {
  category: string;
  words: string[];
  scores: Record<string, number>;
  timestamp: number;
  learnedWords: string[];
  mode: 'preview' | 'test' | 'summary';
  currentIndex: number;
}

export interface SentenceForReview {
  original: string;
  french: string;
  audio?: string;
  category: string;
  type: 'word' | 'sentence' | 'grammar';
  mastered: boolean;
  timestamp: number;
}

export interface LastWordInfo {
  word: string;
  category: string;
  isCorrect: boolean;
  timestamp: number;
  type: 'word' | 'sentence' | 'grammar';
  french?: string;
  audio?: string;
  nextReview?: number;  
  interval?: number;    
  easeFactor?: number;  
  words?: string[];     
}

export interface LastSentenceInfo {
  original: string;
  french: string;
  category: string;
  isCorrect: boolean;
  timestamp: number;
  nextReview: number;
  audio?: string;
  words: string[];
}

export interface FinishSessionOptions {
  showStats?: boolean;
  lastSentenceInfo?: LastSentenceInfo;
  lastWordInfo?: LastWordInfo;
}

export interface RevisionProgress {
  wordsToReview: Set<string>;
  revisionProgress: Record<string, WordProgress>;
  recentlyReviewed: LearnedWord[];
  language: LanguageCode;
   sessionHistory?: RevisionWordInfo[];
}

export interface WolofWord extends Word {
  audio?: string;
  illustration?: string;
  explanation?: string;
  example?: string;
}

export interface LingalaWord extends Word {
  audio?: string;
  illustration?: string;
  explanation?: string;
  example?: string;
}

// Types pour les données de langue et catégories
export interface WordData {
  translation: string;
  audio?: string;
  fr?: string;
  illustration?: string;
  explanation?: string;
  example?: string;
  type?: 'word' | 'sentence' | 'grammar';
  displayName?: string;
}

export interface CategoryData {
  [word: string]: WordData;
}

export interface CategoryDictionary {
  [category: string]: CategoryData | GrammarCategory;
}

export interface LanguageData {
  code: LanguageCode;
  name: string;
  nativeName: string;
  categories: CategoryDictionary;
  categoryIllustrations: { [key: string]: string };
  sentencesToConstruct: Sentence[];
  sentenceCategories: SentenceCategoryDictionary;
  sentencesGap?: RevisionSentenceCollection;
}

// ✅ MODIFICATION: Types pour les données utilisateur - LearnedWord étendu
export interface LearnedWord {
  word: string;
  category: string;
  subcategory?: string;
  language: LanguageCode;
  timestamp?: number;
  // ✅ AJOUT: Nouvelles propriétés optionnelles
  audio?: string;        
  translation?: string;  
  explanation?: string;  
  example?: string;      
}

export interface WordProgress {
  correct: number;
  incorrect: number;
  tested: number;
  lastReviewed: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  language: LanguageCode;
  category?: string;
}

export interface SerializedUserProgress {
  learnedWords: string[];
  wordsToReview: string[];
  wordProgress: {
    [key: string]: WordProgress;
  };
  recentlyLearnedWords: LearnedWord[];
  language: LanguageCode;
  timestamp?: number;
}

export interface UserProgress {
  learnedWords: Set<string>;
  wordsToReview: Set<string>;
  wordProgress: {
    [key: string]: WordProgress;
  };
  recentlyLearnedWords: LearnedWord[];
  language: LanguageCode;
}

// ✅ MODIFICATION: Props des composants avec saveProgressOnSummary
export interface LanguageSelectorProps {
  value: LanguageCode;
  onChange: (value: LanguageCode) => void;
}

export interface LearnModeProps {
  languageCode: LanguageCode;
  category: string;
  subcategory?: string;
  onBackToCategories: () => void;
  onGameComplete: () => void;
  onWordLearned: (word: string, correct: boolean) => void;
  onWordsLearned: (words: LearnedWord[]) => void;
  resetToken?: number;
  words?: Record<string, Record<string, WordData>>;
  onAnswer?: (correct: boolean) => void;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

export interface MainMenuProps {
  languageCode: LanguageCode;
  onSelectMode: (mode: AppMode) => void;
  reviewDue: boolean;
  onResetProgress: () => void;
  learnedWordsCount: number;
  onLanguageChange: (lang: LanguageCode) => void;
}

export interface CategorySelectionProps {
  languageCode: LanguageCode;
  categories: CategoryDictionary;
  categoryIllustrations: { [key: string]: string };
  onSelectCategory: (category: string) => void;
  completedCategories: string[];
}

export interface RevisionSentence {
  original: string;
  french: string;
  audio?: string;
  testWord?: string;
}

export interface RevisionSentenceCollection {
  [word: string]: RevisionSentence[];
}

// Nouvelle interface pour la sélection de catégories de phrases
export interface SentenceCategorySelectionProps {
  languageCode: LanguageCode;
  categories: SentenceCategoryDictionary;
  onSelectCategory: (category: string) => void;
  onBack: () => void;
}

// ✅ MODIFICATION: RevisionModeProps avec saveProgressOnSummary
export interface RevisionModeProps {
  languageCode: LanguageCode;
  onBackToMenu: () => void;
  onWordRevised: (word: string, isCorrect: boolean) => void;
  onUpdateRevisionState?: (state: any) => void;
  checkDailyLimit?: (limitType: 'dailyRevisions' | 'exercisesPerDay') => boolean;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

// ✅ MODIFICATION: QuizComponentProps avec saveProgressOnSummary
export interface QuizComponentProps {
  languageCode: LanguageCode;
  words: Record<string, Word[]>;
  onComplete: (score: number) => void;
  onAnswerSubmit?: (correct: boolean) => void;
  backgroundAudioUrl: string;
  correctAnswerSoundUrl: string;
  wrongAnswerSoundUrl: string;
  onGameFinished?: () => void;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

// ✅ CORRECTION: SentenceConstructionGameProps avec userProgress requis
export interface SentenceConstructionGameProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onGameComplete: () => void;
  onAnswer?: (correct: boolean) => void;
  onSentencesLearned?: (sentences: LearnedSentence[]) => void; 
  isMobileView?: boolean;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
  userProgress: UserProgress; // ✅ AJOUT: Propriété requise
onCategoryComplete?: (category: string) => void;

}

export type SentenceConstructionMode = 'selection' | 'category-details' | 'preview' | 'test' | 'summary' | 'category-selection'| 
'revision';

// ✅ MODIFICATION: SentenceGapGameProps avec saveProgressOnSummary
export interface SentenceGapGameProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onGameComplete: () => void;
  onAnswer?: (correct: boolean) => void;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

// ✅ AJOUT: Nouveau type pour ExerciseModeProps
export interface ExerciseModeProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onExerciseComplete: () => void;
  checkDailyLimit?: (limitType: 'dailyRevisions' | 'exercisesPerDay') => boolean;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

// Types pour la révision
export interface RevisionWordInfo {
  word: string;
  category: string;
  isCorrect?: boolean;
  timestamp: number;
  nextReview?: number;
  interval?: number;    
  easeFactor?: number;
  translation?: string;
  audio?: string;
  isSentence?: boolean;
  grammarType?: 'rule' | 'conjugation' | 'vocabulary';
  subCategory?: string;
}

export interface GrammarWordInfo extends RevisionWordInfo {
  grammarType: 'rule' | 'conjugation' | 'vocabulary';
  subCategory?: string;
}

export interface SaveDataInput {
  progress: SerializedUserProgress;
  completedCategories: string[];
  type?: string;  
  timestamp?: number;
  _metadata?: {  
    type: string;
    grammarProgress?: any;
    sentenceProgress?: any;
    timestamp: number;
    lastUpdated: string;
    [key: string]: any;
  };
  exercises?: {
    [exerciseType: string]: {
      progress: any;
      timestamp: number;
      lastUpdated: string;
      [key: string]: any;
    };
  };
}

export interface DriveResponse {
  progress: SerializedUserProgress;
  completedCategories: string[];
  type?: string;  
  timestamp?: number;  
  _metadata?: {  
    type: string;  
    grammarProgress?: any;  
    sentenceProgress?: any;  
    timestamp: number;  
    lastUpdated: string;  
    [key: string]: any;  
  };
  exercises?: {
    [exerciseType: string]: {
      progress: any;
      timestamp: number;
      lastUpdated: string;
      [key: string]: any;
    };
  };
}

// ✅ MODIFICATION: GrammarModeProps avec saveProgressOnSummary
export interface GrammarModeProps {
  languageCode: LanguageCode;
  onBackToCategories: () => void;
  onCategoryComplete: (category: string) => void;
  onWordsLearned?: (words: LearnedWord[]) => void;
  resetToken: number;
  isLoading?: boolean;
  isMobileView?: boolean;
  onSessionComplete?: () => void;
  saveProgressOnSummary?: (newProgress: UserProgress, context?: any) => Promise<void>;
}

// Types pour la grammaire
export interface GrammarItem {
  translation?: string;
  fr?: string;
  explanation?: string;
  example?: string;
  examples?: string[];
  desc?: string;
  audio?: string;
}

export interface GrammarSubcategory {
  [key: string]: GrammarItem;
}

export interface GrammarCategory {
  [subcategory: string]: GrammarSubcategory;
}

export interface GrammarStructure {
  [category: string]: GrammarCategory;
}

// Types pour les phrases
export interface Sentence {
  original: string;
  french: string;
  words: string[];
  audio?: string;
  category?: string;
  tags?: string[];
}

// Configuration et paramètres
export interface RevisionSettings {
  initialInterval: number;
  easeFactor: number;
  minimumInterval: number;
  maximumInterval: number;
}

export interface ResetProgressOptions {
  setCompletedCategories: (categories: string[]) => void;
  setUserProgress: (progress: UserProgress) => void;
  setQuizScore: (score: number) => void;
  user: any | null;
  saveDataToGoogleDrive: () => Promise<void>;
  currentLanguage: LanguageCode;
}

export type AppMode = 'menu' | 'learn' | 'review' | 'quiz' | 'sentenceConstruction' | 'sentenceGap' | 'grammar'| 'exercise'| 'progression';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface ProgressPieProps {
  progress: number;
  size?: number;
  className?: string;
}

export const DEFAULT_SETTINGS: RevisionSettings = {
  initialInterval: 24 * 60 * 60 * 1000,
  easeFactor: 2.5,
  minimumInterval: 24 * 60 * 60 * 1000,
  maximumInterval: 365 * 24 * 60 * 60 * 1000
};

export interface AnimatePresenceProps {
  children?: React.ReactNode;
  initial?: boolean;
  custom?: any;
  onExitComplete?: () => void;
  exitBeforeEnter?: boolean;
  presenceAffectsLayout?: boolean;
  mode?: "sync" | "wait" | "popLayout";
}

// ✅ AJOUT: Interface pour RevisionStatsModal
export interface RevisionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordDataMap: Record<string, Record<string, WordData>>;
  revisionHistory: RevisionWordInfo[];
  wordProgress?: Record<string, any>;
  isMobileView?: boolean;
}

// Fonctions de sérialisation
export const serializeUserProgress = (progress: UserProgress): SerializedUserProgress => ({
  learnedWords: Array.from(progress.learnedWords),
  wordsToReview: Array.from(progress.wordsToReview),
  wordProgress: progress.wordProgress,
  recentlyLearnedWords: progress.recentlyLearnedWords,
  language: progress.language
});

export const deserializeUserProgress = (serialized: SerializedUserProgress): UserProgress => ({
  learnedWords: new Set(serialized.learnedWords),
  wordsToReview: new Set(serialized.wordsToReview),
  wordProgress: serialized.wordProgress,
  recentlyLearnedWords: serialized.recentlyLearnedWords,
  language: serialized.language
});

export default {};