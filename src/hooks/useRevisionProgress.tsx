import { useState, useCallback, useEffect, useRef } from 'react';
import { LanguageCode } from '../types/types';
import RevisionDriveService from './RevisionDriveService';

export interface RevisionWordInfo {
  word: string;
  category: string;
  isCorrect: boolean;
  timestamp: number;
  nextReview: number;
  interval: number;    
  easeFactor: number;
  translation?: string;
  audio?: string;
}

export interface GrammarWordInfo extends RevisionWordInfo {
  grammarType: 'rule' | 'conjugation' | 'vocabulary';
  subCategory?: string;
}

export interface SessionStats {
  total: number;
  correct: number;
  accuracy: number;
  isComplete: boolean;
}

export interface GrammarProgress {
  rules: Set<string>;
  lastReviewed: number | null;
}

export interface RevisionProgress {
  wordsToReview: Set<string>;
  sessionWords: RevisionWordInfo[];
  language: LanguageCode;
  grammarProgress?: GrammarProgress;
}

interface SessionState {
  isComplete: boolean;
  stats: SessionStats | null;
  reviewedWords?: RevisionWordInfo[];
}

interface SessionResult {
  stats: SessionStats;
  isComplete: boolean;
  showStats: boolean;
  reviewedWords: RevisionWordInfo[]; 
}

interface FinishSessionOptions {
  showStats?: boolean;
  lastWordInfo?: {
    word: string;
    category: string;
    isCorrect: boolean;
    timestamp: number;
    translation?: string;
    audio?: string;
  };
} 

const REVISION_STORAGE_PREFIX = 'revision';
const SESSION_HISTORY_KEY = 'sessionHistory';
const GRAMMAR_STORAGE_KEY = 'grammar';
const METADATA_STORAGE_KEY = 'metadata';

const cleanWordKey = (word: string): string => {
  // D'abord supprimer les parenthèses
  const withoutParentheses = word.replace(/\s*\([^)]*\)/g, '');
  // Puis appliquer le nettoyage existant si nécessaire
  return withoutParentheses.split(/[(:]/)[0].trim();
};

const createGrammarKey = (word: string, category: string, subCategory?: string): string => {
  const cleanWord = cleanWordKey(word);
  return `grammar:${category}:${subCategory || 'general'}:${cleanWord}`;
};

const createDefaultRevisionProgress = (languageCode: LanguageCode): RevisionProgress => ({
  wordsToReview: new Set<string>(),
  sessionWords: [],
  language: languageCode,
  grammarProgress: {
    rules: new Set<string>(),
    lastReviewed: null
  }
});

export const useRevisionProgress = (languageCode: LanguageCode) => {
  const progressKey = `${REVISION_STORAGE_PREFIX}-${languageCode}-progress`;
  const historyKey = `${REVISION_STORAGE_PREFIX}-${languageCode}-${SESSION_HISTORY_KEY}`;
  const grammarKey = `${REVISION_STORAGE_PREFIX}-${languageCode}-${GRAMMAR_STORAGE_KEY}`;
  const pendingSave = useRef<NodeJS.Timeout | null>(null);
  
  // Référence au service Google Drive
  const driveServiceRef = useRef<RevisionDriveService | null>(null);

  // Initialiser le service Google Drive
  const getDriveService = useCallback(() => {
    if (!driveServiceRef.current) {
      const token = localStorage.getItem('googleToken');
      if (token) {
        try {
          driveServiceRef.current = new RevisionDriveService(token);
        } catch (error) {
          console.error('Error initializing Google Drive service:', error);
          return null;
        }
      } else {
        return null;
      }
    }
    return driveServiceRef.current;
  }, []);

  const loadSessionHistory = useCallback((): RevisionWordInfo[] => {
    try {
      const savedHistory = localStorage.getItem(historyKey);
      if (!savedHistory) return [];
      
      const history = JSON.parse(savedHistory) as RevisionWordInfo[];
      return history;
    } catch (error) {
      console.error('Error loading session history:', error);
      return [];
    }
  }, [historyKey]);

  const loadLanguageProgress = useCallback((): RevisionProgress | null => {
    try {
      const savedProgress = localStorage.getItem(progressKey);
      const sessionHistory = loadSessionHistory();
      const savedGrammarProgress = localStorage.getItem(grammarKey);
      
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        const wordsToReview = new Set<string>(
          Array.isArray(parsed.wordsToReview) 
            ? parsed.wordsToReview.filter((word: string) => 
                word.startsWith(`${languageCode}:`) || 
                word.startsWith('grammar:'))
            : []
        );

        const grammarProgress = savedGrammarProgress 
          ? JSON.parse(savedGrammarProgress) 
          : { rules: [], lastReviewed: null };

        return {
          wordsToReview,
          sessionWords: sessionHistory,
          language: languageCode,
          grammarProgress: {
            rules: new Set(grammarProgress.rules),
            lastReviewed: grammarProgress.lastReviewed
          }
        };
      }
      return null;
    } catch (error) {
      console.error('Error loading revision progress:', error);
      return null;
    }
  }, [languageCode, loadSessionHistory, progressKey, grammarKey]);

  const [currentSessionWords, setCurrentSessionWords] = useState<RevisionWordInfo[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>({
    isComplete: false,
    stats: null
  });

  const [revisionProgress, setRevisionProgress] = useState<RevisionProgress>(() => {
    return loadLanguageProgress() || createDefaultRevisionProgress(languageCode);
  });

  // Fonction pour synchroniser avec Google Drive
  const syncWithDrive = useCallback(async (): Promise<boolean> => {
    console.log("Tentative de sauvegarde sur Google Drive");
    try {
      const driveService = getDriveService();
      
      if (!driveService) {
        console.log('Google Drive service not available');
        return false;
      }
      
      // Préparer les données à synchroniser
      const sessionHistory = loadSessionHistory();
      const learnedWords = new Set<string>();
      
      // Extraire les mots appris de l'historique
      sessionHistory.forEach(word => {
        if (word.isCorrect) {
          learnedWords.add(word.word);
        }
      });
      
      // Sauvegarder sur Drive
      await driveService.saveRevisionData(
        languageCode,
        sessionHistory,
        learnedWords
      );
      
      console.log("Sauvegarde réussie sur Google Drive");
      return true;
    } catch (error) {
      console.error('Error syncing with Google Drive:', error);
      return false;
    }
  }, [getDriveService, loadSessionHistory, languageCode]);

  const saveSessionHistory = useCallback((newHistory: RevisionWordInfo[]) => {
    try {
      const existingHistory = loadSessionHistory();
      
      const uniqueNewWords = newHistory.filter(newWord => 
        !existingHistory.some(existingWord => 
          existingWord.word === newWord.word &&
          existingWord.category === newWord.category &&
          Math.abs(existingWord.timestamp - newWord.timestamp) < 1000
        )
      );

      const mergedHistory = [...uniqueNewWords, ...existingHistory]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 1000);
      
      localStorage.setItem(historyKey, JSON.stringify(mergedHistory));
      return mergedHistory;
    } catch (error) {
      console.error('Error saving session history:', error);
      return loadSessionHistory();
    }
  }, [historyKey, loadSessionHistory]);

  const saveProgress = useCallback(async (progress: RevisionProgress, shouldSaveHistory: boolean = false) => {
    try {
      const dataToSave = {
        ...progress,
        wordsToReview: Array.from(progress.wordsToReview),
        timestamp: Date.now()
      };
      
      localStorage.setItem(progressKey, JSON.stringify(dataToSave));
      
      if (progress.grammarProgress) {
        localStorage.setItem(grammarKey, JSON.stringify({
          rules: Array.from(progress.grammarProgress.rules),
          lastReviewed: progress.grammarProgress.lastReviewed
        }));
      }
      
      if (shouldSaveHistory && currentSessionWords.length > 0) {
        saveSessionHistory(currentSessionWords);
      }
    } catch (error) {
      console.error('Error saving revision progress:', error);
      throw error;
    }
  }, [progressKey, grammarKey, currentSessionWords, saveSessionHistory]);

  const updateRevisionProgress = useCallback(async (
    word: string, 
    isCorrect: boolean,
    category: string,
    options?: {
      isGrammar?: boolean;
      subCategory?: string;
      grammarType?: 'rule' | 'conjugation' | 'vocabulary';
      translation?: string;
      audio?: string;
    }
  ) => {
    console.group('updateRevisionProgress');
    console.log('Mise à jour du progress pour:', { word, isCorrect, category, options });
  
    const now = Date.now();
    const history = loadSessionHistory();
    const previousReviews = history
      .filter(item => {
        if (options?.isGrammar) {
          return item.word === word && 
                 item.category === category &&
                 (item as GrammarWordInfo).grammarType === options.grammarType;
        }
        return item.word === word && item.category === category;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  
    let interval = 1;
    let easeFactor = 2.5;
    
    if (previousReviews.length > 0) {
      const lastReview = previousReviews[0];
      if (isCorrect) {
        interval = options?.isGrammar
          ? lastReview.interval * (lastReview.easeFactor * 0.8)
          : lastReview.interval * lastReview.easeFactor;
        easeFactor = Math.min(2.5, lastReview.easeFactor + (options?.isGrammar ? 0.05 : 0.1));
      } else {
        interval = Math.max(1, lastReview.interval * 0.5);
        easeFactor = Math.max(1.3, lastReview.easeFactor - (options?.isGrammar ? 0.3 : 0.2));
      }
    }
  
    // Limitation à un maximum de 7 jours (7 * 24 * 60 * 60 * 1000 ms)
    const MAX_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
    const nextReviewDate = now + Math.min(Math.round(interval) * 24 * 60 * 60 * 1000, MAX_INTERVAL_MS);
  
    const baseWordInfo = {
      word,
      category,
      isCorrect,
      timestamp: now,
      nextReview: nextReviewDate,
      interval,
      easeFactor,
      translation: options?.translation,
      audio: options?.audio
    };
  
    const wordInfo: RevisionWordInfo | GrammarWordInfo = options?.isGrammar 
      ? {
          ...baseWordInfo,
          grammarType: options.grammarType || 'vocabulary',
          subCategory: options.subCategory
        } as GrammarWordInfo
      : baseWordInfo;
  
    setCurrentSessionWords(prev => {
      const newWords = [...prev];
      const existingIndex = newWords.findIndex(item => 
        item.word === word && 
        item.category === category &&
        (options?.isGrammar ? 
          (item as GrammarWordInfo).grammarType === options.grammarType : true)
      );
      
      if (existingIndex >= 0) {
        newWords[existingIndex] = wordInfo;
      } else {
        newWords.push(wordInfo);
      }
      
      return newWords;
    });
  
    setRevisionProgress(prev => {
      const newProgress = { ...prev };
      let wordKey: string;
      
      if (options?.isGrammar) {
        wordKey = createGrammarKey(word, category, options.subCategory);
      } else {
        wordKey = `${languageCode}:${category}:${cleanWordKey(word)}`;
      }
  
      if (isCorrect) {
        // Modification ici aussi pour utiliser la même limite de 7 jours
        const requiredInterval = options?.isGrammar ? 7 : 7; // Uniformisation à 7 jours max
        if (interval > requiredInterval) {
          newProgress.wordsToReview.delete(wordKey);
          if (options?.isGrammar && newProgress.grammarProgress) {
            newProgress.grammarProgress.rules.delete(wordKey);
          }
        }
      } else {
        newProgress.wordsToReview.add(wordKey);
        if (options?.isGrammar && newProgress.grammarProgress) {
          newProgress.grammarProgress.rules.add(wordKey);
        }
      }
  
      if (options?.isGrammar && newProgress.grammarProgress) {
        newProgress.grammarProgress.lastReviewed = now;
      }
  
      return newProgress;
    });
  
    await saveSessionHistory([wordInfo]);
    await saveProgress(revisionProgress, true);
    
    console.groupEnd();
  }, [languageCode, loadSessionHistory, saveSessionHistory, saveProgress, revisionProgress]);

  // Dans useRevisionProgress.tsx
  const addWordsToReview = useCallback(async (words: Array<{
    word: string;
    category: string;
    isGrammar?: boolean;
    subCategory?: string;
    grammarType?: 'rule' | 'conjugation' | 'vocabulary';
    translation?: string;
    audio?: string;
  }>) => {
    console.log("addWordsToReview - Mots à ajouter:", words);
    
    // Créer un tableau pour stocker toutes les clés à ajouter
    const keysToAdd: string[] = [];
    
    words.forEach(({ word, category, isGrammar, subCategory, grammarType }) => {
      let wordKey: string;
      
      if (isGrammar) {
        wordKey = createGrammarKey(word, category, subCategory);
      } else {
        wordKey = `${languageCode}:${category}:${cleanWordKey(word)}`;
      }
      
      keysToAdd.push(wordKey);
    });
    
    console.log("Clés à ajouter:", keysToAdd);
    
    // Utiliser une mise à jour fonctionnelle pour garantir l'état le plus récent
    const newProgress = await new Promise<RevisionProgress>((resolve) => {
      setRevisionProgress(prev => {
        // Créer une copie de l'ensemble existant
        const newWordsToReview = new Set(prev.wordsToReview);
        
        // Ajouter chaque clé à l'ensemble
        keysToAdd.forEach(key => newWordsToReview.add(key));
        
        console.log("Nouvelles clés après ajout:", Array.from(newWordsToReview));
        
        const updatedProgress = {
          ...prev,
          wordsToReview: newWordsToReview
        };
        
        // Résoudre la promesse avec le nouvel état
        resolve(updatedProgress);
        
        return updatedProgress;
      });
    });
    
    // Sauvegarder immédiatement les changements
    await saveProgress(newProgress);
    
    // Forcer un rafraîchissement de l'interface utilisateur
    setTimeout(() => {
      // Cette mise à jour ne change rien mais force un re-rendu
      setRevisionProgress(current => ({...current}));
    }, 100);
    
    return newProgress;
  }, [languageCode, saveProgress]);

  const calculateSessionStats = useCallback((): SessionStats => {
    const total = currentSessionWords.length;
    const correct = currentSessionWords.filter(w => w.isCorrect).length;
    return {
      total,
      correct,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      isComplete: sessionState.isComplete
    };
  }, [currentSessionWords, sessionState.isComplete]);

  const finishSession = useCallback(async (options: FinishSessionOptions = {}): Promise<SessionResult | null> => {
    if (currentSessionWords.length > 0) {
      try {
        const finalSessionWords = options.lastWordInfo 
          ? [...currentSessionWords, {
              ...options.lastWordInfo,
              interval: 1,
              easeFactor: 2.5,
              nextReview: options.lastWordInfo.timestamp + (1 * 24 * 60 * 60 * 1000) // 1 jour pour commencer
            } as RevisionWordInfo] 
          : [...currentSessionWords];
          
        const finalStats = {
          total: finalSessionWords.length,
          correct: finalSessionWords.filter(w => w.isCorrect).length,
          accuracy: finalSessionWords.length > 0 ? 
            (finalSessionWords.filter(w => w.isCorrect).length / finalSessionWords.length) * 100 : 0,
          isComplete: true
        };
        
        await saveProgress(revisionProgress, true);
        await saveSessionHistory(finalSessionWords);
        
        // Tenter la sauvegarde sur Google Drive
        try {
          await syncWithDrive();
        } catch (driveError) {
          console.error("Erreur lors de la sauvegarde Google Drive:", driveError);
          // On continue même si la sauvegarde Drive échoue
        }
        
        setSessionState({
          isComplete: true,
          stats: finalStats,
          reviewedWords: finalSessionWords
        });
        
        return {
          stats: finalStats,
          isComplete: true,
          showStats: options.showStats ?? true,
          reviewedWords: finalSessionWords
        };
      } catch (error) {
        console.error('Erreur dans finishSession:', error);
        throw error;
      }
    }
    return null;
  }, [currentSessionWords, revisionProgress, saveProgress, saveSessionHistory, syncWithDrive]);

  const resetSession = useCallback(() => {
    setCurrentSessionWords([]);
    setSessionState({
      isComplete: false,
      stats: null
    });
    setRevisionProgress(prev => ({
      ...prev,
      wordsToReview: prev.wordsToReview
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (pendingSave.current) {
        clearTimeout(pendingSave.current);
        saveProgress(revisionProgress).catch(console.error);
      }
    };
  }, [revisionProgress, saveProgress]);

  // Ajoutez ce useEffect dans useRevisionProgress.tsx après les autres useEffect

useEffect(() => {
  const handleRevisionDataSynced = (event: CustomEvent) => {
    console.log("🔄 Événement revisionDataSynced reçu dans useRevisionProgress:", event.detail);
    
    const { sessionHistory, learnedWords, language, source } = event.detail;
    
    // Vérifier que c'est bien pour la langue actuelle
    if (language !== languageCode) {
      console.log(`🔄 Événement pour langue ${language}, ignoré (langue actuelle: ${languageCode})`);
      return;
    }
    
    try {
      // Mettre à jour l'historique de session si disponible
      if (sessionHistory && Array.isArray(sessionHistory) && sessionHistory.length > 0) {
        console.log(`🔄 Mise à jour historique de session: ${sessionHistory.length} entrées`);
        
        // Sauvegarder l'historique (la fonction saveSessionHistory gère déjà la fusion)
        const updatedHistory = saveSessionHistory(sessionHistory);
        console.log(`✅ Historique mis à jour: ${updatedHistory.length} entrées total`);
      }
      
      // Mettre à jour les mots appris si disponible
      if (learnedWords && Array.isArray(learnedWords) && learnedWords.length > 0) {
        console.log(`🔄 Mise à jour mots appris: ${learnedWords.length} mots`);
        
        setRevisionProgress(prev => {
          const newProgress = { ...prev };
          
          // Ajouter les mots aux mots à réviser
          learnedWords.forEach((word: string) => {
            // Trouver la catégorie du mot depuis l'historique
            const wordEntry = sessionHistory?.find((entry: any) => entry.word === word);
            const category = wordEntry?.category || 'Général';
            
            const wordKey = `${languageCode}:${category}:${cleanWordKey(word)}`;
            newProgress.wordsToReview.add(wordKey);
          });
          
          console.log(`✅ ${learnedWords.length} mots ajoutés aux mots à réviser`);
          console.log(`📊 Total mots à réviser: ${newProgress.wordsToReview.size}`);
          
          return newProgress;
        });
      }
      
      // Forcer la sauvegarde des changements
      setTimeout(async () => {
        try {
          await saveProgress(revisionProgress, true);
          console.log("✅ Progression de révision sauvegardée après synchronisation");
        } catch (error) {
          console.error("❌ Erreur lors de la sauvegarde après synchronisation:", error);
        }
      }, 100);
      
      console.log(`✅ Synchronisation révision terminée (source: ${source})`);
      
    } catch (error) {
      console.error("❌ Erreur lors de la synchronisation des données de révision:", error);
    }
  };

  // Écouter l'événement personnalisé
  window.addEventListener('revisionDataSynced', handleRevisionDataSynced as EventListener);
  
  return () => {
    window.removeEventListener('revisionDataSynced', handleRevisionDataSynced as EventListener);
  };
}, [languageCode, saveSessionHistory, saveProgress, revisionProgress]);

  const getWordMetadata = useCallback((wordKey: string) => {
    try {
      const metadataKey = `${METADATA_STORAGE_KEY}:${wordKey}`;
      const savedMetadata = localStorage.getItem(metadataKey);
      if (savedMetadata) {
        return JSON.parse(savedMetadata);
      }
    } catch (error) {
      console.error('Error loading word metadata:', error);
    }
    return null;
  }, []);

  return {
    revisionProgress,
    updateRevisionProgress,
    getSessionWords: loadSessionHistory,
    getSessionStats: calculateSessionStats,
    addWordsToReview,
    getWordMetadata,
    getCurrentSessionWords: useCallback(() => currentSessionWords, [currentSessionWords]),
    getCurrentSessionStats: calculateSessionStats,
    finishSession,
    resetSession,
    sessionState,
    syncWithDrive
  };
};

export default useRevisionProgress;