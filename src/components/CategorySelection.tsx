import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowLeft, CheckCircle} from 'lucide-react';
import { CategoryDictionary, WordData, UserProgress } from '../types/types';
import { useTheme } from './ThemeContext';
import CategoryPreview from './CategoryPreview';
import './CategorySelection.css';

interface CategorySelectionProps {
  languageCode: string;
  categories: CategoryDictionary;
  categoryIllustrations: { [key: string]: string };
  onSelectCategory: (category: string) => void;
  onStartRevision: (category: string) => void;
  completedCategories: string[];
  sessionLearnedWords: Set<string>;
  userProgress: UserProgress;
  onBackToMenu?: () => void;
  isMobileView?: boolean;
}

export const cleanWord = (word: string): string => {
  return word.split('(')[0].trim();
};

// Composant de bouton retour adaptatif
const AdaptiveBackButton: React.FC<{
  onBack: () => void;
  isMobileView?: boolean;
  title?: string;
}> = ({ onBack, isMobileView = false, title }) => {
  const { theme } = useTheme();
  
  if (isMobileView) {
    return (
      <div className="category-header mobile-layout">
        <motion.button
          onClick={onBack}
          className="mobile-header-back-button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Retour"
        >
          <ArrowLeft size={24} />
        </motion.button>
        
        {title && (
          <h2 className="category-mobile-title">{title}</h2>
        )}
        
        <div className="category-header-spacer"></div>
      </div>
    );
  }
  
  return (
    <motion.button
      onClick={onBack}
      className="back-button-top"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowLeft size={20} />
      <span>Retour</span>
    </motion.button>
  );
};

const CategorySelection: React.FC<CategorySelectionProps> = ({
  languageCode,
  categories,
  categoryIllustrations,
  onSelectCategory,
  onStartRevision,
  completedCategories,
  userProgress,
  sessionLearnedWords = new Set<string>(),
  onBackToMenu,
  isMobileView = false
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // État pour forcer le rechargement des statistiques
  const [statsRefreshTrigger, setStatsRefreshTrigger] = useState(0);
  
  // Filtrer les catégories pour exclure "Grammaire"
  const categoryList = useMemo(() => 
    Object.keys(categories).filter(category => category !== 'Grammaire'),
    [categories]
  );
  
  // Fonction de chargement des mots appris identique à WordListPreview
  const loadLearnedWordsFromStorage = useCallback((targetCategory: string): Set<string> => {
    const learnedWords = new Set<string>();
    
  
    
    try {
      // 1. Catégorie spécifique localStorage
      const categoryLearnedKey = `${languageCode}-${targetCategory}-learnedWords`;
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      
      if (savedCategoryLearned) {
        const categoryWords = JSON.parse(savedCategoryLearned) as string[];
        categoryWords.forEach(word => {
          learnedWords.add(word);
          learnedWords.add(cleanWord(word)); // Ajouter aussi la version nettoyée
        });
      
      }
      
      // 2. Session locale par catégorie
      const sessionLearnedKey = `${languageCode}-${targetCategory}-sessionLearned`;
      const savedSessionLearned = localStorage.getItem(sessionLearnedKey);
      
      if (savedSessionLearned) {
        const sessionWords = JSON.parse(savedSessionLearned) as string[];
        sessionWords.forEach(word => {
          learnedWords.add(word);
          learnedWords.add(cleanWord(word));
        });
      
      }
      
      // 3. Fallback liste globale (pour compatibilité)
      const globalLearnedKey = `${languageCode}-allLearnedWords`;
      const savedGlobalLearned = localStorage.getItem(globalLearnedKey);
      
      if (savedGlobalLearned) {
        const globalWords = JSON.parse(savedGlobalLearned) as string[];
        globalWords.forEach(word => {
          learnedWords.add(word);
          learnedWords.add(cleanWord(word));
        });
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement des mots appris:', error);
    }
    

    return learnedWords;
  }, [languageCode]);

  // Surveillance des changements dans localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Vérifier si le changement concerne notre langue
      if (event.key && (
        event.key.includes(`${languageCode}-`) ||
        event.key.includes(`${languageCode}-allLearnedWords`)
      )) {
      
        setStatsRefreshTrigger(prev => prev + 1);
      }
    };

    // Écouter les événements de changement de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Surveillance supplémentaire: Polling périodique pour les changements internes
    const pollInterval = setInterval(() => {
      setStatsRefreshTrigger(prev => prev + 1);
    }, 2000); // Vérifier toutes les 2 secondes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [languageCode]);

  // Fonction de vérification des mots appris identique à WordListPreview
  const isWordLearned = useCallback((word: string, categoryLearnedWords: Set<string>): boolean => {
    const baseWord = cleanWord(word);
    const variations = [
      word,
      baseWord,
      word.toLowerCase(),
      baseWord.toLowerCase()
    ];
    
    return variations.some(variant => categoryLearnedWords.has(variant));
  }, []);
  
  // Calcul des statistiques par catégorie avec la même logique que WordListPreview
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; learned: number; percentage: number }> = {};
    
    categoryList.forEach(category => {
      const categoryWords = Object.keys(categories[category])
        .filter(key => !key.includes('_'));
      
      // Utiliser la même fonction de chargement que WordListPreview
      const categoryLearnedWords = loadLearnedWordsFromStorage(category);
      
      const learnedCount = categoryWords.reduce((count, word) => {
        return isWordLearned(word, categoryLearnedWords) ? count + 1 : count;
      }, 0);
      
      stats[category] = {
        total: categoryWords.length,
        learned: learnedCount,
        percentage: categoryWords.length > 0 ? Math.round((learnedCount / categoryWords.length) * 100) : 0
      };
      
      // Debug: Log pour vérifier
    
    });
    
    return stats;
  }, [categoryList, categories, loadLearnedWordsFromStorage, isWordLearned, statsRefreshTrigger]);
  
  // Forcer la mise à jour au changement de langue/userProgress
  useEffect(() => {
   
    setStatsRefreshTrigger(prev => prev + 1);
  }, [languageCode, userProgress.learnedWords, sessionLearnedWords]);
  
  // Gestion des clics sur les catégories
  const handleCategoryClick = useCallback((category: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Animation de sélection
    const element = e?.currentTarget as HTMLElement;
    if (element) {
      element.style.transform = 'scale(1.05)';
      element.style.zIndex = '100';
      
      setTimeout(() => {
        element.style.transform = '';
        element.style.zIndex = '';
      }, 300);
    }
    
    setTimeout(() => {
      setSelectedCategory(category);
      setShowPreview(true);
    }, 150);
  }, []);

  // Gestion de la prévisualisation
  const handleStartLearning = useCallback(() => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
    }
  }, [selectedCategory, onSelectCategory]);
  
  const handleStartRevision = useCallback(() => {
    if (selectedCategory) {
      onStartRevision(selectedCategory);
    }
  }, [selectedCategory, onStartRevision]);
  
  const handleBackFromPreview = useCallback(() => {
    setShowPreview(false);
    setSelectedCategory(null);
  }, []);
  
  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showPreview) return;
      
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (onBackToMenu) {
            onBackToMenu();
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPreview, onBackToMenu]);
  
  // Si on affiche la prévisualisation
  if (showPreview && selectedCategory) {
    const categoryWords = Object.entries(categories[selectedCategory])
      .filter(([key]) => !key.includes('_')) as [string, WordData][];
      
    return (
      <CategoryPreview
        category={selectedCategory}
        words={categoryWords}
        onStartLearning={handleStartLearning}
        onStartRevision={handleStartRevision}
        onBack={handleBackFromPreview}
        completedWords={loadLearnedWordsFromStorage(selectedCategory)}
        sessionLearnedWords={sessionLearnedWords}
        onBackToMenu={onBackToMenu}
        isMobileView={isMobileView}
        languageCode={languageCode}
      />
    );
  }
  
  // Interface principale avec layout unifié (même interface pour mobile et desktop)
  return (
    <div className="component-wrapper" data-theme={theme}>
      {/* Particules de fond */}
      <div className="background-particles" id="particles" />
      
      {/* Bouton retour adaptatif */}
      {onBackToMenu && (
        <AdaptiveBackButton
          onBack={onBackToMenu}
          isMobileView={isMobileView}
        />
      )}
      
      <div className="category-selection">
        {/* AFFICHAGE UNIFIÉ STYLE SENTENCECONSTRUCTION - POUR MOBILE ET DESKTOP */}
        <div className="mobile-categories-content">
          {/* Titre principal */}
          <h2>Choisissez une catégorie</h2>
          
          {/* Description introductive */}
          <div className="category-description" style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-xl)',
            padding: 'var(--spacing-lg)',
            background: 'rgba(139, 69, 19, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--category-dark-border)'
          }}>
            Choisissez une situation et apprenez à construire des phrases utiles.
          </div>

          {/* Grille des catégories style SentenceConstruction - POUR TOUS LES ÉCRANS */}
          <div className="unified-categories-grid">
            {categoryList.map((category, index) => {
              const isCompleted = completedCategories.includes(category);
              const stats = categoryStats[category] || { total: 0, learned: 0, percentage: 0 };
              
              return (
                <div 
                  key={`unified-${category}-${statsRefreshTrigger}`}
                  className="unified-category-card"
                  onClick={(e) => handleCategoryClick(category, e)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Sélectionner la catégorie ${category}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCategoryClick(category);
                    }
                  }}
                >
                  {/* Header de la carte */}
                  <div className="category-header">
                    <div className="category-icon">
                      {categoryIllustrations[category] || '📚'}
                    </div>
                    <h3 className="category-name">
                      {category}
                    </h3>
                  </div>
                  
                  {/* Description de la catégorie */}
                  <p className="category-description">
                    Description de la catégorie {category}
                  </p>
                  
                  {/* Badge de progression */}
                  {stats.total > 0 && (
                    <div className={`progress-badge ${stats.percentage === 100 ? 'completed' : ''}`}>
                      {stats.learned}/{stats.total}
                    </div>
                  )}
                  
                  {/* Badge de complétion */}
                  {isCompleted && (
                    <div className="completed-checkmark">
                      <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Statistiques globales unifiées */}
          <div className="global-stats">
            <h3>📊 Votre progression</h3>
            <div className="stats-container">
              <div className="stat-item">
                <div>
                  <span className="stat-value">
                    {Object.values(categoryStats).reduce((sum, stat) => sum + stat.learned, 0)}
                  </span>
                  <span className="stat-label">Mots appris</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div>
                  <span className="stat-value">
                    {completedCategories.length}
                  </span>
                  <span className="stat-label">Catégories complètes</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div>
                  <span className="stat-value">
                    {Math.round(
                      (Object.values(categoryStats).reduce((sum, stat) => sum + stat.learned, 0) /
                       Math.max(Object.values(categoryStats).reduce((sum, stat) => sum + stat.total, 0), 1)) * 100
                    )}%
                  </span>
                  <span className="stat-label">Progression totale</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelection;