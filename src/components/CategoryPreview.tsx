import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { WordData } from '../types/types';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio'; // ✅ Nouveau système
import { useTheme } from './ThemeContext';
import WordListPreview from './WordListPreview';
import './CategoryPreview.css';

interface CategoryPreviewProps {
  category: string;
  words: [string, WordData][];
  onStartLearning: () => void;
  onStartRevision: () => void;
  onBack: () => void;
  completedWords: Set<string>;
  isMobileView?: boolean;
  sessionLearnedWords: Set<string>;
  onBackToMenu?: () => void;
  languageCode: string;
}

// Fonction utilitaire pour nettoyer les mots (sans parenthèses)
export const cleanWord = (word: string): string => {
  return word.split('(')[0].trim();
};

const CategoryPreview: React.FC<CategoryPreviewProps> = ({
  category,
  words,
  onStartLearning,
  onStartRevision,
  onBack,
  completedWords,
  isMobileView = false,
  sessionLearnedWords,
  onBackToMenu,
  languageCode
}) => {
  const { playWord } = useSupabaseAudio(languageCode);
  const { theme } = useTheme();

  // 🆕 NOUVEAU: État pour forcer le rechargement
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ✅ CLÉ STABLE - ne change que si category ou languageCode change
  const stableKey = useMemo(() => {
    return `category-${category}-${languageCode}-${refreshTrigger}`;
  }, [category, languageCode, refreshTrigger]);

  // 🆕 NOUVEAU: Fonction pour charger les mots appris depuis localStorage
  const loadLearnedWordsFromStorage = useCallback((): Set<string> => {
    const learnedWords = new Set<string>();
    
   
    
    try {
      // 1. Ajouter les mots des props (sources fiables)
      completedWords.forEach(word => {
        learnedWords.add(word);
        learnedWords.add(cleanWord(word));
       
      });
      
      sessionLearnedWords.forEach(word => {
        learnedWords.add(word);
        learnedWords.add(cleanWord(word));
      
      });
      
      // 2. Charger depuis localStorage avec vérification par catégorie
      // Session locale spécifique à la catégorie
      const sessionLearnedKey = `${languageCode}-${category}-sessionLearned`;
      const savedSessionLearned = localStorage.getItem(sessionLearnedKey);
      
      if (savedSessionLearned) {
        const sessionLearnedArray = JSON.parse(savedSessionLearned);
        if (Array.isArray(sessionLearnedArray)) {
          sessionLearnedArray.forEach((word: string) => {
            learnedWords.add(word);
            learnedWords.add(cleanWord(word));
           
          });
        }
      }
      
      // 🆕 NOUVEAU: Charger les mots spécifiques à cette catégorie
      const categoryLearnedKey = `${languageCode}-${category}-learnedWords`;
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      
      if (savedCategoryLearned) {
        const categoryLearnedArray = JSON.parse(savedCategoryLearned);
        if (Array.isArray(categoryLearnedArray)) {
          categoryLearnedArray.forEach((word: string) => {
            learnedWords.add(word);
            learnedWords.add(cleanWord(word));
            
          });
        }
      }
      
      // Liste globale (plus conservatrice, pour compatibilité)
      const globalLearnedKey = `${languageCode}-allLearnedWords`;
      const savedGlobalLearned = localStorage.getItem(globalLearnedKey);
      
      if (savedGlobalLearned) {
        const globalLearnedArray = JSON.parse(savedGlobalLearned);
        if (Array.isArray(globalLearnedArray)) {
          globalLearnedArray.forEach((word: string) => {
            // ⚠️ VALIDATION: ne considérer que les mots qui correspondent à cette catégorie
           
            learnedWords.add(word);
            learnedWords.add(cleanWord(word));
           
          });
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture des mots depuis localStorage:', error);
    }
    
    
    return learnedWords;
  }, [completedWords, sessionLearnedWords, languageCode, category]);

  // 🆕 NOUVEAU: État local pour les mots appris avec rechargement automatique
  const [unifiedCompletedWords, setUnifiedCompletedWords] = useState<Set<string>>(() => 
    loadLearnedWordsFromStorage()
  );

  // 🆕 SURVEILLANCE: Surveiller les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Vérifier si le changement concerne notre langue et catégorie
      if (event.key && (
        event.key.includes(`${languageCode}-${category}-`) ||
        event.key.includes(`${languageCode}-allLearnedWords`)
      )) {
      
        
        // Recharger les mots appris
        const newLearnedWords = loadLearnedWordsFromStorage();
        setUnifiedCompletedWords(newLearnedWords);
        setRefreshTrigger(prev => prev + 1);
      }
    };

    // Écouter les événements de changement de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // 🆕 SURVEILLANCE SUPPLÉMENTAIRE: Polling périodique pour les changements internes
    const pollInterval = setInterval(() => {
      const currentLearnedWords = loadLearnedWordsFromStorage();
      
      // Comparer avec l'état actuel
      if (currentLearnedWords.size !== unifiedCompletedWords.size) {
       
        setUnifiedCompletedWords(currentLearnedWords);
        setRefreshTrigger(prev => prev + 1);
      }
    }, 2000); // Vérifier toutes les 2 secondes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [languageCode, category, loadLearnedWordsFromStorage, unifiedCompletedWords.size]);

  // Calculer le nombre de mots complétés avec memoization
  const completedWordsCount = useMemo(() => {
    return words.reduce((count: number, [word]: [string, WordData]) => {
      // Nettoyer le mot (retirer les parenthèses)
      const baseWord = cleanWord(word);
      
      // Vérifier toutes les variations possibles
      const variations = [
        word,                // Avec parenthèses (ex: "Tus (Zero)")
        baseWord,            // Sans parenthèses (ex: "Tus")
        word.toLowerCase(),  // En minuscules avec parenthèses
        baseWord.toLowerCase() // En minuscules sans parenthèses
      ];
      
      // Un mot est considéré comme complété si l'une de ses variations est dans l'ensemble unifié
      const isCompleted = variations.some(variant => unifiedCompletedWords.has(variant));
      
      return isCompleted ? count + 1 : count;
    }, 0);
  }, [words, unifiedCompletedWords]);

  // Filtrer les mots pour exclure les sous-catégories et autres éléments spéciaux
  const filteredWords = useMemo(() => {
    return words.filter(([word]: [string, WordData]) => !word.includes('_'));
  }, [words]);

  // Forcer la mise à jour au changement de catégorie
  useEffect(() => {

    
    // Recharger les mots appris
    const newLearnedWords = loadLearnedWordsFromStorage();
    setUnifiedCompletedWords(newLearnedWords);
    setRefreshTrigger(prev => prev + 1);
  }, [category, languageCode, loadLearnedWordsFromStorage]);

  // Logs de débogage optimisés
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
     
    }
  }, [category, words.length, filteredWords.length, completedWordsCount, unifiedCompletedWords.size, stableKey]);

  // Gestionnaires d'événements avec useCallback pour éviter les re-renders
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleStartLearning = useCallback(() => {
    onStartLearning();
  }, [onStartLearning]);

  const handleStartRevision = useCallback(() => {
    onStartRevision();
  }, [onStartRevision]);

  // Optimiser le playAudio pour éviter les conflits
  const optimizedPlayAudio = useCallback(async (audioSrc: string) => {
    try {
      await playWord(audioSrc);
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    }
  }, [playWord]);

  return (
    <div 
      className={`category-preview ${isMobileView ? 'no-center mobile-view' : ''}`} 
      data-theme={theme}
      key={stableKey} // ✅ CLÉ STABLE
    >
      <WordListPreview
        key={stableKey} // ✅ MÊME CLÉ STABLE
        title={category}
        words={filteredWords}
        onBack={handleBack}
        onStartLearning={handleStartLearning}
        onStartRevision={handleStartRevision}
        completedWordsCount={completedWordsCount}
        playAudio={optimizedPlayAudio}
        completedWords={unifiedCompletedWords}
        isMobileView={isMobileView}
        languageCode={languageCode} // 🆕 AJOUT: Passer languageCode
      />
    </div>
  );
};

// Mémoisation du composant pour éviter les re-renders inutiles
export default React.memo(CategoryPreview, (prevProps, nextProps) => {
  // Comparaison personnalisée pour optimiser les performances
  return (
    prevProps.category === nextProps.category &&
    prevProps.words.length === nextProps.words.length &&
    prevProps.completedWords.size === nextProps.completedWords.size &&
    prevProps.sessionLearnedWords.size === nextProps.sessionLearnedWords.size &&
    prevProps.isMobileView === nextProps.isMobileView &&
    prevProps.languageCode === nextProps.languageCode
  );
});