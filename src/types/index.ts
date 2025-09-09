import { Dispatch, SetStateAction } from 'react';

export interface WordData {
  original: string;
  translation: string;
  audio?: string;
  explanation?: string;
  example?: string;
}

export interface UserProgress {
  learnedWords: Set<string>;
  wordsToReview: Set<string>;
  wordProgress: Record<string, WordProgressData>;
  recentlyLearnedWords: LearnedWord[];
  language: LanguageCode;
}

export interface WordProgressData {
  correct: number;
  incorrect: number;
  tested: number;
  lastReviewed: number;
  nextReview: number;
  interval: number;
  easeFactor: number;
  language: LanguageCode;
}

export type LanguageCode = 'wf' | 'ba'|'la' | 'co'|'ff'|'sw';

export interface LearnedWord {
  word: string;
  timestamp: number;
  category: string;
}

export interface DispatchTypes {
  setCompletedCategories: Dispatch<SetStateAction<string[]>>;
  setUserProgress: Dispatch<SetStateAction<UserProgress>>;
  setQuizScore: Dispatch<SetStateAction<number>>;
}