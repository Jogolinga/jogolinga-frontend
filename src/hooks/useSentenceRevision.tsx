import { useState, useCallback, useEffect, useRef } from 'react';
import { LanguageCode } from '../types/types';
import { GoogleDriveService } from '../services/googleDriveService';

export interface SentenceRevisionInfo {
  original: string;
  french: string;
  audio?: string;
  category: string;
  timestamp: number;
  nextReview: number;
  type: 'sentence';
  words: string[];
  isCorrect: boolean;
}

interface RevisionProgress {
  sentences: SentenceRevisionInfo[];
  lastReviewed: number | null;
  learnedSentences: Set<string>;
}

interface SessionStats {
  total: number;
  correct: number;
  accuracy: number;
  isComplete: boolean;
}

interface SessionState {
  isComplete: boolean;
  stats: SessionStats | null;
  reviewedWords?: SentenceRevisionInfo[];
}

interface SentenceRevisionState {
  revisionProgress: RevisionProgress;
  sessionHistory: SentenceRevisionInfo[];
  isInitialized: boolean;
  sessionState: SessionState;
}

interface UseSentenceRevisionOptions {
  readOnly?: boolean;
  lazyInit?: boolean;
}

// ✅ Interface pour les données Google Drive
interface DriveData {
  exercises?: {
    sentences?: {
      progress?: any[];
    };
    sentenceConstruction?: {
      sentences?: any[];
      progress?: any[];
      metadata?: any;
    };
  };
  progress?: {
    recentlyLearnedWords?: any[];
  };
  completedCategories?: string[];
}

const useSentenceRevision = (
  languageCode: LanguageCode, 
  options: UseSentenceRevisionOptions = {}
) => {
  const { readOnly = false, lazyInit = false } = options;
  
  const [state, setState] = useState<SentenceRevisionState>({
    revisionProgress: {
      sentences: [],
      lastReviewed: null,
      learnedSentences: new Set<string>()
    },
    sessionHistory: [],
    isInitialized: false,
    sessionState: {
      isComplete: false,
      stats: null
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const initializationRef = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Fonction d'initialisation améliorée
  const initializeRevision = useCallback(async () => {
    if (initializationRef.current || state.isInitialized) {
      console.log('🔄 Révision déjà initialisée - ignoré');
      return;
    }

    console.log('🚀 [useSentenceRevision] Initialisation du système de révision...');
    initializationRef.current = true;
    setIsLoading(true);

    try {
      // 1. Charger depuis localStorage principal
      const localKey = `sentence-revision-${languageCode}-sessionHistory`;
      const localData = localStorage.getItem(localKey);
      
      let loadedSentences: SentenceRevisionInfo[] = [];
      
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) {
            loadedSentences = parsed.filter((item: any) => 
              item.type === 'sentence' && 
              item.original && item.original.trim() !== '' &&
              item.french && item.french.trim() !== ''
            );
            console.log(`📚 ${loadedSentences.length} phrases chargées depuis localStorage principal`);
          }
        } catch (error) {
          console.error('❌ Erreur parsing localStorage principal:', error);
        }
      }

      // 2. ✅ NOUVEAU: Charger depuis les données de progression de phrases
      const progressKey = `sentence-progress-${languageCode}`;
      const progressData = localStorage.getItem(progressKey);
      
      if (progressData) {
        try {
          const progressSessions = JSON.parse(progressData);
          if (Array.isArray(progressSessions)) {
            console.log(`📊 ${progressSessions.length} sessions de progression trouvées`);
            
            const progressSentences: SentenceRevisionInfo[] = [];
            progressSessions.forEach((session: any) => {
              if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
                session.masteredSentences.forEach((sentence: any) => {
                  if (sentence.original && sentence.french && sentence.mastered) {
                    progressSentences.push({
                      original: sentence.original,
                      french: sentence.french,
                      audio: sentence.audio,
                      category: sentence.category || session.category || 'Salutations',
                      timestamp: sentence.timestamp || Date.now(),
                      nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
                      type: 'sentence',
                      words: sentence.words || sentence.original.split(' '),
                      isCorrect: true // Les phrases maîtrisées sont considérées comme correctes
                    });
                  }
                });
              }
            });
            
            console.log(`📚 ${progressSentences.length} phrases extraites des sessions de progression`);
            
            // Fusionner avec les phrases existantes
            const mergedSentences = [...loadedSentences];
            progressSentences.forEach(newSentence => {
              const existingIndex = mergedSentences.findIndex(s => 
                s.original === newSentence.original && s.category === newSentence.category
              );
              
              if (existingIndex >= 0) {
                // Mettre à jour avec les données les plus récentes
                mergedSentences[existingIndex] = {
                  ...mergedSentences[existingIndex],
                  ...newSentence,
                  timestamp: Math.max(mergedSentences[existingIndex].timestamp, newSentence.timestamp)
                };
              } else {
                mergedSentences.push(newSentence);
              }
            });
            
            loadedSentences = mergedSentences;
            console.log(`📚 Total après fusion: ${loadedSentences.length} phrases`);
          }
        } catch (error) {
          console.error('❌ Erreur parsing données de progression:', error);
        }
      }

      // 3. Charger depuis Google Drive seulement si readOnly = false
      if (!readOnly) {
        try {
          const additionalSentences = await loadFromGoogleDrive(loadedSentences);
          loadedSentences = additionalSentences;
        } catch (error) {
          console.error('❌ Erreur chargement Google Drive:', error);
        }
      }

      // 4. Mise à jour de l'état
      setState(prev => ({
        ...prev,
        revisionProgress: {
          sentences: loadedSentences,
          lastReviewed: loadedSentences.length > 0 ? Math.max(...loadedSentences.map(s => s.timestamp)) : null,
          learnedSentences: new Set(loadedSentences.filter(s => s.isCorrect).map(s => s.original))
        },
        sessionHistory: loadedSentences,
        isInitialized: true
      }));

      // 5. Sauvegarder le résultat fusionné en localStorage
      if (loadedSentences.length > 0) {
        try {
          localStorage.setItem(localKey, JSON.stringify(loadedSentences));
          console.log('✅ Données fusionnées sauvegardées en localStorage');
        } catch (error) {
          console.error('❌ Erreur sauvegarde fusion:', error);
        }
      }

      console.log(`✅ Système de révision initialisé avec ${loadedSentences.length} phrases`);

    } catch (error) {
      console.error('❌ Erreur initialisation révision:', error);
    } finally {
      setIsLoading(false);
    }
  }, [languageCode, readOnly, state.isInitialized]);

  // ✅ Fonction de chargement Google Drive améliorée
  const loadFromGoogleDrive = useCallback(async (existingSentences: SentenceRevisionInfo[]) => {
    const token = localStorage.getItem('googleToken');
    if (!token) {
      console.log('🔍 Pas de token Google Drive - chargement local seulement');
      return existingSentences;
    }

    try {
      console.log('🔍 SENTENCES - Chargement depuis Google Drive');
      const driveService = new GoogleDriveService(token);
      const data: DriveData = await driveService.loadData(languageCode);

      console.log('🔍 Structure Google Drive reçue:', {
        hasExercises: !!data?.exercises,
        hasSentences: !!data?.exercises?.sentences,
        hasSentenceConstruction: !!data?.exercises?.sentenceConstruction,
        sentenceConstructionKeys: data?.exercises?.sentenceConstruction ? Object.keys(data.exercises.sentenceConstruction) : []
      });

      let driveSentences: SentenceRevisionInfo[] = [];

      // ✅ Vérifier les différents formats possibles
      if (data?.exercises?.sentenceConstruction) {
        console.log('✅ Données sentenceConstruction trouvées');
        
        // Format 1: sentences directes
        if (Array.isArray(data.exercises.sentenceConstruction.sentences)) {
          console.log(`📚 Format direct: ${data.exercises.sentenceConstruction.sentences.length} phrases`);
          driveSentences = data.exercises.sentenceConstruction.sentences.map((item: any) => ({
            original: item.original,
            french: item.french,
            audio: item.audio,
            category: item.category || 'Salutations',
            timestamp: item.timestamp || Date.now(),
            nextReview: item.nextReview || Date.now() + (24 * 60 * 60 * 1000),
            type: 'sentence' as const,
            words: item.words || item.original?.split(' ') || [],
            isCorrect: item.isCorrect !== false
          }));
        }
        
        // Format 2: progress avec sessions
        else if (Array.isArray(data.exercises.sentenceConstruction.progress)) {
          console.log(`📚 Format sessions: ${data.exercises.sentenceConstruction.progress.length} sessions`);
          data.exercises.sentenceConstruction.progress.forEach((session: any) => {
            if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
              session.masteredSentences.forEach((sentence: any) => {
                if (sentence.original && sentence.french) {
                  driveSentences.push({
                    original: sentence.original,
                    french: sentence.french,
                    audio: sentence.audio,
                    category: sentence.category || session.category || 'Salutations',
                    timestamp: sentence.timestamp || Date.now(),
                    nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
                    type: 'sentence' as const,
                    words: sentence.words || sentence.original.split(' '),
                    isCorrect: sentence.mastered || sentence.firstAttemptCorrect || true
                  });
                }
              });
            }
          });
        }
      }
      
      // ✅ Fallback: ancien format sentences
      else if (data?.exercises?.sentences?.progress && Array.isArray(data.exercises.sentences.progress)) {
        console.log('✅ Ancien format sentences trouvé');
        data.exercises.sentences.progress.forEach((session: any) => {
          if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
            session.masteredSentences.forEach((sentence: any) => {
              if (sentence.original && sentence.french) {
                driveSentences.push({
                  original: sentence.original,
                  french: sentence.french,
                  audio: sentence.audio,
                  category: sentence.category || session.category || 'Salutations',
                  timestamp: sentence.timestamp || Date.now(),
                  nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
                  type: 'sentence' as const,
                  words: sentence.words || sentence.original.split(' '),
                  isCorrect: sentence.mastered || sentence.firstAttemptCorrect || true
                });
              }
            });
          }
        });
      }

      if (driveSentences.length > 0) {
        console.log(`📚 ${driveSentences.length} phrases chargées depuis Google Drive`);
        
        // Fusionner avec les phrases existantes
        const mergedSentences = [...existingSentences];
        driveSentences.forEach(newSentence => {
          const existingIndex = mergedSentences.findIndex(s => 
            s.original === newSentence.original && s.category === newSentence.category
          );
          
          if (existingIndex >= 0) {
            mergedSentences[existingIndex] = {
              ...mergedSentences[existingIndex],
              ...newSentence,
              timestamp: Math.max(mergedSentences[existingIndex].timestamp, newSentence.timestamp)
            };
          } else {
            mergedSentences.push(newSentence);
          }
        });
        
        return mergedSentences;
      } else {
        console.log('🔍 Aucune phrase trouvée dans Google Drive');
      }
    } catch (error) {
      console.error('❌ Erreur chargement Google Drive:', error);
    }

    return existingSentences;
  }, [languageCode]);

  // ✅ NOUVEAU: Écouter l'événement sentenceProgressSynced
  useEffect(() => {
    const handleSentenceProgressSynced = (event: CustomEvent) => {
      console.log('🔔 [useSentenceRevision] Événement sentenceProgressSynced reçu:', {
        totalSessions: event.detail.totalSessions,
        source: event.detail.source,
        language: event.detail.language
      });
      
      if (event.detail.language !== languageCode) {
        console.log('🔍 Événement pour une autre langue, ignoré');
        return;
      }
      
      if (event.detail.sessions && Array.isArray(event.detail.sessions)) {
        const sentences: SentenceRevisionInfo[] = [];
        
        event.detail.sessions.forEach((session: any) => {
          if (session.masteredSentences && Array.isArray(session.masteredSentences)) {
            session.masteredSentences.forEach((sentence: any) => {
              if (sentence.original && sentence.french && sentence.mastered) {
                sentences.push({
                  original: sentence.original,
                  french: sentence.french,
                  audio: sentence.audio,
                  category: sentence.category || session.category || 'Salutations',
                  timestamp: sentence.timestamp || Date.now(),
                  nextReview: (sentence.timestamp || Date.now()) + (24 * 60 * 60 * 1000),
                  type: 'sentence',
                  words: sentence.words || sentence.original.split(' '),
                  isCorrect: true // Les phrases maîtrisées sont correctes
                });
              }
            });
          }
        });
        
        if (sentences.length > 0) {
          console.log(`📚 ${sentences.length} phrases synchronisées depuis l'événement`);
          
          setState(prev => {
            const existingSentences = prev.sessionHistory;
            const newSentences = [...existingSentences];
            
            sentences.forEach(newSentence => {
              const existingIndex = newSentences.findIndex(s => 
                s.original === newSentence.original && s.category === newSentence.category
              );
              
              if (existingIndex >= 0) {
                newSentences[existingIndex] = {
                  ...newSentences[existingIndex],
                  ...newSentence,
                  timestamp: Math.max(newSentences[existingIndex].timestamp, newSentence.timestamp)
                };
              } else {
                newSentences.push(newSentence);
              }
            });
            
            // Sauvegarder immédiatement en localStorage
            const localKey = `sentence-revision-${languageCode}-sessionHistory`;
            try {
              localStorage.setItem(localKey, JSON.stringify(newSentences));
              console.log('✅ Phrases synchronisées sauvegardées en localStorage');
            } catch (error) {
              console.error('❌ Erreur sauvegarde localStorage après sync:', error);
            }
            
            return {
              ...prev,
              sessionHistory: newSentences,
              revisionProgress: {
                sentences: newSentences,
                lastReviewed: Date.now(),
                learnedSentences: new Set(newSentences.filter(s => s.isCorrect).map(s => s.original))
              },
              isInitialized: true
            };
          });
        }
      }
    };

    window.addEventListener('sentenceProgressSynced', handleSentenceProgressSynced as EventListener);
    
    return () => {
      window.removeEventListener('sentenceProgressSynced', handleSentenceProgressSynced as EventListener);
    };
  }, [languageCode]);

  // ✅ Initialisation conditionnelle au montage
  useEffect(() => {
    if (!lazyInit && !readOnly) {
      console.log('🔄 Initialisation automatique du système de révision');
      initializeRevision();
    } else {
      console.log('🔄 Initialisation différée du système de révision');
    }
  }, [initializeRevision, lazyInit, readOnly]);

  // ✅ Fonction de sauvegarde locale
  const saveLocalProgress = useCallback((sentences: SentenceRevisionInfo[]) => {
    try {
      const localKey = `sentence-revision-${languageCode}-sessionHistory`;
      const dataToSave = sentences.slice(0, 3000); // Limiter à 3000 phrases max
      localStorage.setItem(localKey, JSON.stringify(dataToSave));
      console.log(`✅ ${dataToSave.length} phrases sauvegardées en localStorage`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde locale:', error);
    }
  }, [languageCode]);

  // ✅ Fonction de sauvegarde Google Drive
  const saveToGoogleDrive = useCallback(async (sentences: SentenceRevisionInfo[]) => {
    if (readOnly) {
      console.log('🔒 Mode lecture seule - pas de sauvegarde Google Drive');
      return;
    }

    const token = localStorage.getItem('googleToken');
    if (!token) {
      console.log('🔍 Pas de token - sauvegarde locale seulement');
      return;
    }

    try {
      console.log('💾 Début sauvegarde', sentences.length, 'phrases sur Google Drive');
      
      const driveService = new GoogleDriveService(token);
      const existingData: DriveData = await driveService.loadData(languageCode) || {};
      
      // ✅ Structure finale compatible avec le nouveau format
      const finalData = {
        progress: {
          learnedWords: sentences.filter(s => s.isCorrect).map(s => s.original),
          wordsToReview: sentences.map(s => s.original),
          wordProgress: {},
          recentlyLearnedWords: sentences.map(s => ({
            word: s.original,
            category: s.category,
            language: languageCode,
            timestamp: s.timestamp,
            translation: s.french,
            audio: s.audio
          })),
          language: languageCode
        },
        exercises: {
          ...existingData.exercises,
          sentenceConstruction: {
            sentences: sentences,
            metadata: {
              lastUpdated: Date.now(),
              totalSentences: sentences.length,
              language: languageCode
            }
          }
        },
        completedCategories: existingData.completedCategories || [],
        _lastSaved: Date.now(),
        _saveSource: 'SentenceRevision',
        _saveDate: new Date().toISOString().split('T')[0]
      };

      await driveService.saveData(languageCode, finalData);
      console.log('✅ Sauvegarde des phrases réussie sur Google Drive');

    } catch (error) {
      console.error('❌ Erreur sauvegarde Google Drive:', error);
      throw error;
    }
  }, [languageCode, readOnly]);

  // ✅ Ajouter des phrases à la révision
  const addSentencesToReview = useCallback(async (sentenceInfo: SentenceRevisionInfo) => {
    if (!state.isInitialized && !readOnly) {
      console.log('🔄 Initialisation automatique avant ajout');
      await initializeRevision();
    }

    // Charger les phrases existantes
    const localKey = `sentence-revision-${languageCode}-sessionHistory`;
    let existingSentences: SentenceRevisionInfo[] = [];
    
    try {
      const existingData = localStorage.getItem(localKey);
      if (existingData) {
        const parsed = JSON.parse(existingData);
        if (Array.isArray(parsed)) {
          existingSentences = parsed.filter((s: any) => 
            s.original && s.original.trim() !== '' &&
            s.french && s.french.trim() !== '' &&
            s.category && s.category.trim() !== ''
          );
        }
      }
    } catch (error) {
      console.error('❌ Erreur lecture localStorage existant:', error);
    }

    console.log(`📚 Phrases existantes: ${existingSentences.length}`);
    
    const newSentences = [...existingSentences];
    
    // Vérifier si la phrase existe déjà
    const existingIndex = newSentences.findIndex(s => 
      s.original.trim().toLowerCase() === sentenceInfo.original.trim().toLowerCase() && 
      s.category === sentenceInfo.category
    );

    if (existingIndex >= 0) {
      // Mettre à jour la phrase existante
      const existingSentence = newSentences[existingIndex];
      newSentences[existingIndex] = {
        ...existingSentence,
        ...sentenceInfo,
        timestamp: Math.max(existingSentence.timestamp, sentenceInfo.timestamp),
        isCorrect: sentenceInfo.isCorrect || existingSentence.isCorrect
      };
      console.log('🔄 Phrase existante mise à jour:', sentenceInfo.original);
    } else {
      // Ajouter une nouvelle phrase
      if (!sentenceInfo.original?.trim() || !sentenceInfo.french?.trim()) {
        console.error('❌ Phrase invalide ignorée:', sentenceInfo);
        return;
      }
      
      const newSentence = {
        ...sentenceInfo,
        timestamp: Date.now(),
        nextReview: Date.now() + (24 * 60 * 60 * 1000)
      };
      
      newSentences.unshift(newSentence);
      console.log('✅ Nouvelle phrase ajoutée:', sentenceInfo.original);
    }

    // Filtrer et limiter les phrases
    const validSentences = newSentences.filter(s => 
      s.original && s.original.trim() !== '' &&
      s.french && s.french.trim() !== '' &&
      s.category && s.category.trim() !== ''
    ).slice(0, 3000);

    // Mettre à jour l'état
    setState(prev => ({
      ...prev,
      sessionHistory: validSentences,
      revisionProgress: {
        sentences: validSentences,
        lastReviewed: Date.now(),
        learnedSentences: new Set(validSentences.filter(s => s.isCorrect).map(s => s.original))
      }
    }));

    // Sauvegarder en localStorage
    try {
      localStorage.setItem(localKey, JSON.stringify(validSentences));
      console.log(`✅ ${validSentences.length} phrases sauvegardées en localStorage`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }

    // Programmer une sauvegarde Google Drive différée
    if (!readOnly) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        saveToGoogleDrive(validSentences).catch(error => {
          console.error('❌ Erreur sauvegarde différée:', error);
        });
      }, 5000);
    }

  }, [state.isInitialized, readOnly, initializeRevision, languageCode, saveToGoogleDrive]);

  // ✅ Vérifier si une phrase est apprise
  const isLearnedSentence = useCallback((original: string): boolean => {
    return state.sessionHistory.some(s => 
      s.original === original && s.isCorrect
    );
  }, [state.sessionHistory]);

  // ✅ Mettre à jour le progrès de révision
  const updateRevisionProgress = useCallback(async (
    sentenceOrWord: SentenceRevisionInfo | string, 
    isCorrect: boolean,
    category?: string,
    options?: {
      translation?: string;
      audio?: string;
    }
  ) => {
    let sentenceInfo: SentenceRevisionInfo;
    
    if (typeof sentenceOrWord === 'string') {
      sentenceInfo = {
        original: sentenceOrWord,
        french: options?.translation || '',
        audio: options?.audio,
        category: category || 'Révision',
        timestamp: Date.now(),
        nextReview: Date.now() + (isCorrect ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000),
        type: 'sentence',
        words: sentenceOrWord.split(' '),
        isCorrect: isCorrect
      };
    } else {
      sentenceInfo = {
        ...sentenceOrWord,
        isCorrect: isCorrect,
        timestamp: Date.now(),
        nextReview: Date.now() + (isCorrect ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000)
      };
    }
    
    await addSentencesToReview(sentenceInfo);
  }, [addSentencesToReview]);

  // ✅ Terminer une session
  const finishSession = useCallback(async (options?: {
    showStats?: boolean;
    lastSentenceInfo?: any;
  }) => {
    const stats: SessionStats = {
      total: state.sessionHistory.length,
      correct: state.sessionHistory.filter(s => s.isCorrect).length,
      accuracy: state.sessionHistory.length > 0 ? 
        (state.sessionHistory.filter(s => s.isCorrect).length / state.sessionHistory.length) * 100 : 0,
      isComplete: true
    };

    setState(prev => ({
      ...prev,
      sessionState: {
        isComplete: true,
        stats: stats,
        reviewedWords: state.sessionHistory
      }
    }));

    return {
      stats,
      isComplete: true,
      showStats: options?.showStats ?? true,
      reviewedWords: state.sessionHistory
    };
  }, [state.sessionHistory]);

  // ✅ Réinitialiser une session
  const resetSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      sessionState: {
        isComplete: false,
        stats: null
      }
    }));
  }, []);

  // ✅ Obtenir l'historique de session
  const getSessionHistory = useCallback((): SentenceRevisionInfo[] => {
    return [...state.sessionHistory];
  }, [state.sessionHistory]);

  // ✅ Nettoyer les timeouts au démontage
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Fonctions principales
    addSentencesToReview,
    isLearnedSentence,
    getSessionHistory,
    updateRevisionProgress,
    finishSession,
    resetSession,
    
    // État
    revisionProgress: state.revisionProgress,
    sessionState: state.sessionState,
    isLoading,
    isInitialized: state.isInitialized,
    
    // Fonctions utilitaires
    initializeRevision,
    saveToGoogleDrive: readOnly ? undefined : saveToGoogleDrive,
    saveLocalProgress
  };
};

export default useSentenceRevision;