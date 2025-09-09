// revisionHelpers.ts
import { UserProgress, WordProgress, CategoryDictionary,LanguageCode } from '../types/types';

export interface RevisionStats {
  totalWords: number;
  wordsToReview: number;
  masteredWords: number;
  progress: number;
}

export interface RevisionSettings {
  wordsPerSession: number;
  minReviewInterval: number;
  maxReviewInterval: number;
  baseEaseFactor: number;
}

export const DEFAULT_SETTINGS: RevisionSettings = {
  wordsPerSession: 5,
  minReviewInterval: 24 * 60 * 60 * 1000, // 1 jour en ms
  maxReviewInterval: 30 * 24 * 60 * 60 * 1000, // 30 jours en ms
  baseEaseFactor: 2.5,
};

export const DEFAULT_WORD_PROGRESS: WordProgress = {
  correct: 0,
  incorrect: 0,
  tested: 0,
  lastReviewed: 0,
  nextReview: 0,
  interval: 0,
  easeFactor: 2.5,
  language: 'wf' as LanguageCode
};

export const shouldWordBeReviewed = (
  wordProgress: WordProgress | undefined,
  settings: RevisionSettings = DEFAULT_SETTINGS
): boolean => {
  if (!wordProgress) return true;
  
  const now = Date.now();
  
  if (wordProgress.tested === 0) return true;
  if (wordProgress.nextReview && now >= wordProgress.nextReview) return true;
  
  const totalAttempts = wordProgress.correct + wordProgress.incorrect;
  if (totalAttempts > 0) {
    const successRate = (wordProgress.correct / totalAttempts) * 100;
    if (successRate < 70) return true;
  }
  
  return false;
};

export const calculateNextReview = (
  wordProgress: WordProgress,
  isCorrect: boolean,
  settings: RevisionSettings = DEFAULT_SETTINGS
): number => {
  const now = Date.now();
  
  if (!wordProgress.interval || !isCorrect) {
    return now + settings.minReviewInterval;
  }
  
  const newInterval = Math.min(
    wordProgress.interval * wordProgress.easeFactor,
    settings.maxReviewInterval / (24 * 60 * 60 * 1000)
  );
  
  return now + (newInterval * 24 * 60 * 60 * 1000);
};

export const updateWordProgress = (
  currentProgress: WordProgress | undefined,
  isCorrect: boolean,
  settings: RevisionSettings = DEFAULT_SETTINGS
): WordProgress => {
  const now = Date.now();
  const oldProgress = currentProgress || { ...DEFAULT_WORD_PROGRESS };
  
  const newProgress: WordProgress = {
    ...oldProgress,
    correct: isCorrect ? oldProgress.correct + 1 : oldProgress.correct,
    incorrect: !isCorrect ? oldProgress.incorrect + 1 : oldProgress.incorrect,
    tested: oldProgress.tested + 1,
    lastReviewed: now,
    interval: oldProgress.interval || 1,
    easeFactor: oldProgress.easeFactor,
    language: oldProgress.language,
    nextReview: now // Sera mis à jour plus tard
  };
  
  if (isCorrect) {
    newProgress.easeFactor = Math.min(3.0, oldProgress.easeFactor + 0.1);
    newProgress.interval = oldProgress.interval ? oldProgress.interval * 2 : 1;
  } else {
    newProgress.easeFactor = Math.max(1.3, oldProgress.easeFactor - 0.2);
    newProgress.interval = 1;
  }
  
  newProgress.nextReview = calculateNextReview(newProgress, isCorrect, settings);
  
  return newProgress;
};

export const getWordsToReview = (
  userProgress: UserProgress,
  categories: CategoryDictionary,
  settings: RevisionSettings = DEFAULT_SETTINGS
): [string, string][] => {
  const wordsToReview: [string, string][] = [];
  
  Object.entries(categories).forEach(([categoryName, categoryWords]) => {
    Object.keys(categoryWords).forEach(word => {
      const progress = userProgress.wordProgress[word];
      if (shouldWordBeReviewed(progress, settings)) {
        wordsToReview.push([categoryName, word]);
      }
    });
  });
  
  return wordsToReview;
};

export const getRevisionStats = (userProgress: UserProgress): RevisionStats => {
  const totalWords = Object.keys(userProgress.wordProgress).length;
  const wordsToReview = Array.from(userProgress.wordsToReview).length;
  const masteredWords = Array.from(userProgress.learnedWords).length;
  
  return {
    totalWords,
    wordsToReview,
    masteredWords,
    progress: totalWords > 0 ? (masteredWords / totalWords) * 100 : 0
  };
};

export const getDueWords = (userProgress: UserProgress): string[] => {
  const now = Date.now();
  return Object.entries(userProgress.wordProgress)
    .filter(([_, progress]) => progress.nextReview <= now)
    .map(([word]) => word);
};

// Export default groupé
export default {
  shouldWordBeReviewed,
  calculateNextReview,
  updateWordProgress,
  getWordsToReview,
  getRevisionStats,
  getDueWords,
  DEFAULT_SETTINGS
};