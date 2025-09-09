import { CategoryDictionary, WordProgress, Word } from '../types/types';

// Définition de l'interface WolofWord
export interface WolofWord {
  wolof: string;
  english: string;
}

// Fonction de transformation des catégories
export function transformCategories(categories: CategoryDictionary): Record<string, Word[]> {
  console.log("Transforming categories:", categories);
  const transformed: Record<string, Word[]> = {};

  for (const [category, words] of Object.entries(categories)) {
    console.log(`Processing category: ${category}`, words);
    transformed[category] = Object.entries(words).map(([wolof, details]) => ({
      original: wolof,
      translation: details.translation,
      audio: details.audio,
      illustration: details.illustration,
      explanation: details.explanation,
      example: details.example,
    }));
  }

  console.log("Transformed categories:", transformed);
  return transformed;
}

// Mélanger un tableau
export const shuffleArray = <T,>(array: T[]): T[] => {
  console.log("Shuffling array:", array);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  console.log("Shuffled array:", shuffled);
  return shuffled;
};

export const WORDS_PER_LESSON = 5;
export const CORRECT_ANSWERS_TO_LEARN = 3;

// Calculer la progression
export const calculateProgress = (correctAnswers: number, totalTests: number, totalRequired: number): number => {
  console.log(`Calculating progress: correctAnswers=${correctAnswers}, totalTests=${totalTests}, totalRequired=${totalRequired}`);
  if (totalTests === 0) return 0;
  const progressPercentage = (correctAnswers / totalRequired) * 100;
  const progress = Math.min(Math.round(progressPercentage), 100);
  console.log("Progress calculated:", progress);
  return progress;
};

// Obtenir un sous-ensemble aléatoire d'un tableau
export const getRandomSubset = <T,>(array: T[], size: number): T[] => {
  console.log(`Getting random subset: size=${size}, array=`, array);
  const shuffled = shuffleArray(array);
  const subset = shuffled.slice(0, size);
  console.log("Random subset:", subset);
  return subset;
};

// Formater le temps en minutes:secondes
export const formatTime = (seconds: number): string => {
  console.log("Formatting time:", seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formattedTime = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  console.log("Formatted time:", formattedTime);
  return formattedTime;
};

// Vérifier si deux tableaux sont égaux
export const arraysEqual = (a: any[], b: any[]): boolean => {
  console.log("Checking array equality:", a, b);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  console.log("Arrays are equal:", true);
  return true;
};

// Capitaliser la première lettre d'une chaîne
export const capitalizeFirstLetter = (string: string): string => {
  console.log("Capitalizing first letter of:", string);
  const capitalized = string.charAt(0).toUpperCase() + string.slice(1);
  console.log("Capitalized string:", capitalized);
  return capitalized;
};

// Générer un ID unique
export const generateUniqueId = (): string => {
  const uniqueId = Math.random().toString(36).substr(2, 9);
  console.log("Generated unique ID:", uniqueId);
  return uniqueId;
};

// Calculer le prochain intervalle de révision
export const calculateNextReview = (wordProgress: WordProgress, performance: number): WordProgress => {
  console.log("Calculating next review interval for:", wordProgress, "with performance:", performance);
  const { interval, easeFactor } = wordProgress;
  let newInterval: number;
  let newEaseFactor = easeFactor;

  if (performance >= 4) { // Réponse correcte
    if (interval === 0) {
      newInterval = 1;
    } else if (interval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newEaseFactor = easeFactor + (0.1 - (5 - performance) * (0.08 + (5 - performance) * 0.02));
  } else { // Réponse incorrecte
    newInterval = 1;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }

  newEaseFactor = Math.max(1.3, Math.min(2.5, newEaseFactor));
  const updatedWordProgress = {
    ...wordProgress,
    interval: newInterval,
    easeFactor: newEaseFactor,
    lastReviewed: Date.now(),
    nextReview: Date.now() + newInterval * 24 * 60 * 60 * 1000, // Convertir les jours en millisecondes
  };
  console.log("Next review calculated:", updatedWordProgress);
  return updatedWordProgress;
};

// Déterminer si un mot doit être révisé
export const shouldReviewWord = (wordProgress: WordProgress): boolean => {
  const shouldReview = Date.now() >= wordProgress.nextReview;
  console.log("Should review word:", wordProgress, "Result:", shouldReview);
  return shouldReview;
};

// Calculer le score de priorité pour la révision
export const calculateReviewPriority = (wordProgress: WordProgress): number => {
  const daysSinceLastReview = (Date.now() - wordProgress.lastReviewed) / (24 * 60 * 60 * 1000);
  const priority = daysSinceLastReview / wordProgress.interval;
  console.log("Review priority calculated for:", wordProgress, "Priority:", priority);
  return priority;
};

// Trier les mots à réviser par priorité
export const sortWordsByReviewPriority = (wordsToReview: [string, WordProgress][]): [string, WordProgress][] => {
  console.log("Sorting words by review priority:", wordsToReview);
  const sortedWords = wordsToReview.sort((a, b) => calculateReviewPriority(b[1]) - calculateReviewPriority(a[1]));
  console.log("Sorted words:", sortedWords);
  return sortedWords;
};

export default {
  transformCategories,
  shuffleArray,
  calculateProgress,
  getRandomSubset,
  formatTime,
  arraysEqual,
  capitalizeFirstLetter,
  generateUniqueId,
  calculateNextReview,
  shouldReviewWord,
  calculateReviewPriority,
  sortWordsByReviewPriority,
};
