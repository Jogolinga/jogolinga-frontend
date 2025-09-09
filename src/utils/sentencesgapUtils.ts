// src/utils/sentencesgapUtils.ts
import { RevisionSentence, RevisionSentenceCollection } from '../types/types';

/**
 * Structure pour stocker les phrases avec un trou
 */
export interface SentenceWithGap {
  original: string;
  french: string;
  displayText: string;
  gapWord: string;
  audio?: string;
  category?: string;
  isRevisionSentence?: boolean;
  nextReview?: number;
  reviewCount?: number;
  lastReviewSuccess?: boolean;
}

/**
 * Normalise le texte pour la comparaison
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Calcule la similarité entre deux chaînes
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] !== str2[j - 1] ? 1 : 0;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return 1 - matrix[len1][len2] / Math.max(len1, len2);
}

/**
 * Récupère toutes les phrases associées à un mot spécifique
 * @param collection La collection de phrases à trous
 * @param word Le mot à rechercher
 * @returns Un tableau de phrases contenant ce mot
 */
export const getSentencesForWord = (
  collection: RevisionSentenceCollection,
  word: string
): RevisionSentence[] => {
  if (!collection || !word) return [];
  
  // Si le mot est une clé directe dans la collection
  if (collection[word]) {
    return collection[word];
  }
  
  // Recherche dans toutes les phrases pour trouver celles qui contiennent ce mot
  const result: RevisionSentence[] = [];
  Object.values(collection).forEach(sentences => {
    sentences.forEach(sentence => {
      if (sentence.original.includes(` ${word} `) || 
          sentence.original.startsWith(`${word} `) || 
          sentence.original.endsWith(` ${word}`)) {
        result.push(sentence);
      }
    });
  });
  
  return result;
};

/**
 * Obtient tous les mots disponibles dans une collection de phrases
 * @param collection La collection de phrases à analyser
 * @returns Un ensemble de mots uniques
 */
export const getAllWords = (
  collection: RevisionSentenceCollection
): Set<string> => {
  const words = new Set<string>();
  
  // Ajouter d'abord les clés directes
  Object.keys(collection).forEach(key => {
    words.add(key);
  });
  
  // Ajouter tous les mots de toutes les phrases
  Object.values(collection).forEach(sentences => {
    sentences.forEach(sentence => {
      const sentenceWords = sentence.original
        .split(' ')
        .map(word => word.replace(/[.,;!?()[\]{}'"]/g, ''));
      
      sentenceWords.forEach(word => {
        if (word && word.length > 1) { // Ignorer les mots trop courts
          words.add(word);
        }
      });
    });
  });
  
  return words;
};

/**
 * Génère une phrase à trous à partir d'une phrase complète
 * @param sentence La phrase complète
 * @returns La phrase avec un trou à la place du mot choisi
 */
export function generateGapSentence(sentence: string): { displayText: string; gapWord: string } {
  const PUNCTUATION_MARKS = new Set(['?', '!', '.', ',', ';', ':', '"', "'", '(', ')', '[', ']', '{', '}']);
  
  const isValidWord = (word: string): boolean => {
    // Vérifie si le mot ne contient pas que de la ponctuation
    const withoutPunctuation = word.split('').filter(char => !PUNCTUATION_MARKS.has(char)).join('');
    return withoutPunctuation.length > 0;
  };
  
  const words = sentence.split(' ');
  
  // Filtrer les mots valides
  const validWordIndices = words
    .map((word, index) => ({ word, index }))
    .filter(({ word }) => isValidWord(word) && word.length >= 3)
    .map(({ index }) => index);
  
  if (validWordIndices.length === 0) {
    // Si aucun mot valide, prendre un mot au hasard
    const randomIndex = Math.floor(Math.random() * words.length);
    const gapWord = words[randomIndex];
    words[randomIndex] = '_____';
    
    return {
      displayText: words.join(' '),
      gapWord
    };
  }
  
  // Choisir un mot aléatoire parmi les mots valides
  const randomValidIndex = validWordIndices[Math.floor(Math.random() * validWordIndices.length)];
  const gapWord = words[randomValidIndex];
  words[randomValidIndex] = '_____';
  
  return {
    displayText: words.join(' '),
    gapWord
  };
}

/**
 * Génère une phrase à trous à partir d'un objet phrase
 * @param sentence La phrase complète
 * @param wordToHide Le mot à cacher (si non spécifié, un mot sera choisi aléatoirement)
 * @returns La phrase avec un trou à la place du mot choisi
 */
export const createGapSentence = (
  sentence: RevisionSentence,
  wordToHide?: string
): { displayText: string; gapWord: string } => {
  const words = sentence.original.split(' ');
  
  if (!wordToHide) {
    // Choisir un mot aléatoire non vide et non ponctuation
    const validWords = words.filter(word => {
      const cleanWord = word.replace(/[.,;!?()[\]{}'"]/g, '');
      return cleanWord.length > 1;
    });
    
    if (validWords.length === 0) {
      return { displayText: sentence.original, gapWord: '' };
    }
    
    const randomIndex = Math.floor(Math.random() * validWords.length);
    wordToHide = validWords[randomIndex];
  }
  
  // Remplacer le mot par un trou
  const resultWords = [...words];
  const wordIndex = words.findIndex(w => w === wordToHide);
  
  if (wordIndex !== -1) {
    resultWords[wordIndex] = '_____';
    return {
      displayText: resultWords.join(' '),
      gapWord: wordToHide
    };
  }
  
  return { displayText: sentence.original, gapWord: '' };
};

// Exporter un objet par défaut vide pour s'assurer que le fichier est traité comme un module
export default {};