import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  UserProgress, 
  WordProgress, 
  LearnedWord, 
  LanguageCode,
  SerializedUserProgress
} from '../types/types';
import { CORRECT_ANSWERS_TO_LEARN } from '../utils/utils';
import { cleanParentheses } from '../utils/cleanParentheses';

const MASTERY_THRESHOLD = 0.8;

// Hooks auxiliaires
export const useConfirmationDialog = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
};

export const useAudio = () => {
  const playAudio = useCallback((audioSrc: string): Promise<void> => {
    return new Promise((resolve) => {  // Ne pas utiliser reject
      try {
        console.log('Tentative de lecture audio:', audioSrc);
        const audio = new Audio(audioSrc);
        
        audio.onended = () => {
          audio.remove();
          resolve();
        };

        audio.onerror = (e) => {
          // Gérer silencieusement l'erreur
          console.log(`Fichier audio non disponible: ${audioSrc}`);
          audio.remove();
          resolve();  // Résoudre la promesse au lieu de la rejeter
        };

        audio.play().catch(error => {
          console.log(`Erreur de lecture ignorée pour: ${audioSrc}`);
          resolve();  // Résoudre la promesse même en cas d'erreur
        });
      } catch (error) {
        console.log('Erreur dans playAudio ignorée:', audioSrc);
        resolve();  // Résoudre la promesse pour ne pas interrompre le flux
      }
    });
  }, []);

  return playAudio;
};

export const useError = () => {
  const [error, setError] = useState<string | null>(null);
  const showError = useCallback((message: string) => setError(message), []);
  const clearError = useCallback(() => setError(null), []);
  return { error, showError, clearError };
};

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);
  return { isLoading, startLoading, stopLoading };
};

// Fonctions utilitaires
const createDefaultWordProgress = (languageCode: LanguageCode): WordProgress => ({
  correct: 0,
  incorrect: 0,
  tested: 0,
  lastReviewed: 0,
  nextReview: 0,
  interval: 1,
  easeFactor: 2.5,
  language: languageCode
});

const createDefaultUserProgress = (languageCode: LanguageCode): UserProgress => ({
  learnedWords: new Set<string>(),
  wordsToReview: new Set<string>(),
  wordProgress: {},
  recentlyLearnedWords: [],
  language: languageCode
});

// Hook principal
export const useUserProgress = (
  languageCode: LanguageCode,
  category: string,
  resetToken?: number
) => {
  const progressKey = `${languageCode}-progress`;
  const tempKey = `${languageCode}-${category}-temp`;
  const pendingSave = useRef<NodeJS.Timeout | null>(null);
  const lastSaveAttempt = useRef<number>(Date.now());

  // Vérification localStorage
  const checkStorageAvailable = useCallback(() => {
    try {
      const testKey = `${languageCode}_storage_test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('LocalStorage non disponible:', e);
      return false;
    }
  }, [languageCode]);

  // Nettoyage
  const cleanupOldData = useCallback(async () => {
    const keysToKeep = [progressKey, tempKey];
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key) && key.startsWith(languageCode)) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error('Erreur lors du nettoyage:', e);
        }
      }
    });
  }, [languageCode, progressKey, tempKey]);

  // Sauvegarde avec retry
  const saveWithRetry = useCallback(async (
    key: string,
    data: any,
    maxRetries: number = 3
  ): Promise<boolean> => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        const saved = localStorage.getItem(key);
        if (!saved) throw new Error('Vérification de sauvegarde échouée');
        return true;
      } catch (error) {
        console.error(`Tentative ${i + 1}/${maxRetries} échouée:`, error);
        if (i === maxRetries - 1) break;
        await cleanupOldData();
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    return false;
  }, [cleanupOldData]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    if (!checkStorageAvailable()) {
      return createDefaultUserProgress(languageCode);
    }

    try {
      const savedProgress = localStorage.getItem(progressKey);
      let progress = createDefaultUserProgress(languageCode);

      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        progress = {
          learnedWords: new Set(parsed.learnedWords || []),
          wordsToReview: new Set(parsed.wordsToReview || []),
          wordProgress: parsed.wordProgress || {},
          recentlyLearnedWords: parsed.recentlyLearnedWords || [],
          language: languageCode
        };
      }

      const tempProgress = localStorage.getItem(tempKey);
      if (tempProgress) {
        try {
          const { words, timestamp } = JSON.parse(tempProgress);
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            words.forEach((word: string) => {
              progress.learnedWords.add(word);
            });
          }
          localStorage.removeItem(tempKey);
        } catch (e) {
          console.error('Erreur lors de la lecture des données temporaires:', e);
        }
      }

      return progress;
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
      return createDefaultUserProgress(languageCode);
    }
  });

  const saveProgress = useCallback(async (
    progress: UserProgress,
    temporary: boolean = false
  ) => {
    if (!checkStorageAvailable()) return false;

    if (pendingSave.current) {
      clearTimeout(pendingSave.current);
    }

    const key = temporary ? tempKey : progressKey;
    const data = temporary ? {
      words: Array.from(progress.learnedWords),
      timestamp: Date.now()
    } : {
      learnedWords: Array.from(progress.learnedWords),
      wordsToReview: Array.from(progress.wordsToReview),
      wordProgress: progress.wordProgress,
      recentlyLearnedWords: progress.recentlyLearnedWords,
      language: progress.language
    };

    pendingSave.current = setTimeout(async () => {
      await saveWithRetry(key, data);
      lastSaveAttempt.current = Date.now();
    }, 1000);

  }, [progressKey, tempKey, saveWithRetry, checkStorageAvailable]);

  const getFullWordKey = useCallback((word: string, subcategory?: string) => {
    const cleanWord = cleanParentheses(word);
    return subcategory ? `${subcategory}:${cleanWord}` : cleanWord;
  }, []);

  const updateProgress = useCallback((
    word: string,
    isCorrect: boolean,
    subcategory?: string,
    forceReset: boolean = false
  ) => {
    setUserProgress((prev: UserProgress) => {
      if (forceReset) {
        const newProgress = { ...prev };
        delete newProgress.wordProgress[word];
        newProgress.learnedWords.delete(word);
        newProgress.wordsToReview.delete(word);
        newProgress.recentlyLearnedWords = newProgress.recentlyLearnedWords.filter(
          w => getFullWordKey(w.word, w.subcategory) !== word
        );
        saveProgress(newProgress);
        return newProgress;
      }

      const wordProgress = prev.wordProgress[word] || createDefaultWordProgress(prev.language);
      const updatedWordProgress: WordProgress = {
        ...wordProgress,
        correct: isCorrect ? wordProgress.correct + 1 : wordProgress.correct,
        incorrect: !isCorrect ? wordProgress.incorrect + 1 : wordProgress.incorrect,
        tested: wordProgress.tested + 1,
        lastReviewed: Date.now(),
        interval: isCorrect ? wordProgress.interval * wordProgress.easeFactor : Math.max(1, wordProgress.interval / 2),
        easeFactor: isCorrect ? Math.min(2.5, wordProgress.easeFactor + 0.1) : Math.max(1.3, wordProgress.easeFactor - 0.2),
        nextReview: Date.now() + (wordProgress.interval * 24 * 60 * 60 * 1000),
        language: prev.language
      };

      const newProgress = {
        ...prev,
        wordProgress: {
          ...prev.wordProgress,
          [word]: updatedWordProgress
        }
      };

      const masteryRatio = updatedWordProgress.correct / updatedWordProgress.tested;

      if (masteryRatio >= MASTERY_THRESHOLD && updatedWordProgress.tested >= CORRECT_ANSWERS_TO_LEARN) {
        newProgress.learnedWords.add(word);
        newProgress.wordsToReview.add(word);
      } else {
        newProgress.wordsToReview.add(word);
        if (updatedWordProgress.tested >= CORRECT_ANSWERS_TO_LEARN && !isCorrect) {
          newProgress.learnedWords.delete(word);
        }
      }

      saveProgress(newProgress);
      return newProgress;
    });
  }, [getFullWordKey, saveProgress]);

  const addRecentlyLearnedWords = useCallback((words: LearnedWord[]) => {
    setUserProgress((prev: UserProgress) => {
      const newProgress = {
        ...prev,
        recentlyLearnedWords: [
          ...prev.recentlyLearnedWords,
          ...words.map(w => ({
            ...w,
            word: getFullWordKey(w.word, w.subcategory),
            language: languageCode,
            timestamp: Date.now()
          }))
        ]
      };

      words.forEach(w => {
        const fullKey = getFullWordKey(w.word, w.subcategory);
        newProgress.learnedWords.add(fullKey);
      });
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [languageCode, getFullWordKey, saveProgress]);

  const resetProgress = useCallback(() => {
    const defaultProgress = createDefaultUserProgress(languageCode);
    setUserProgress(defaultProgress);
    localStorage.removeItem(progressKey);
    localStorage.removeItem(tempKey);
  }, [languageCode, progressKey, tempKey]);

  const getWordProgress = useCallback((word: string, subcategory?: string): WordProgress => {
    const fullWordKey = getFullWordKey(word, subcategory);
    return userProgress.wordProgress[fullWordKey] || createDefaultWordProgress(userProgress.language);
  }, [userProgress, getFullWordKey]);

  // Effets
  useEffect(() => {
    if (resetToken) {
      resetProgress();
    }
  }, [resetToken, resetProgress]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        saveProgress(userProgress, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [userProgress, saveProgress]);

  return {
    userProgress,
    updateProgress,
    resetProgress,
    addRecentlyLearnedWords,
    getWordProgress,
    getFullWordKey
  };
};

export default {
  useAudio,
  useUserProgress,
  useLoading,
  useError,
  useConfirmationDialog
};