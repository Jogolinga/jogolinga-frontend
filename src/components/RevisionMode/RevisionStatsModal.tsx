import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check} from 'lucide-react';
import './RevisionStatsModal.css';

// Interface pour les informations de révision
interface RevisionWordInfo {
  word: string;
  category: string;
  isCorrect: boolean;
  timestamp: number;
  nextReview: number;
  interval?: number;
  easeFactor?: number;
  translation?: string;
  audio?: string;
  isSentence?: boolean;
  grammarType?: 'rule' | 'conjugation' | 'vocabulary';
  subCategory?: string;
}

// Interface pour les props du modal
interface RevisionStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordDataMap: Record<string, Record<string, any>>;
  revisionHistory: RevisionWordInfo[];
  wordProgress?: Record<string, any>;
  isMobileView?: boolean;
}

const RevisionStatsModal: React.FC<RevisionStatsModalProps> = ({
  isOpen,
  onClose,
  wordDataMap,
  revisionHistory,
  wordProgress,
  isMobileView = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Détecter le mode sombre (peut être adapté selon votre implémentation)
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    window.addEventListener('storage', checkDarkMode);
    
    return () => window.removeEventListener('storage', checkDarkMode);
  }, []);

  // Grouper les mots par catégorie
 const groupedWords = useMemo(() => {
  if (!revisionHistory?.length) {
    // Si pas d'historique de révision, chercher dans les données de grammaire
    const grammarWords: RevisionWordInfo[] = [];
    
    try {
      // Récupérer les données de grammaire depuis localStorage
      const grammarStorageKey = `grammar-progress-${languageCode || 'wf'}`; // Fallback sur 'wf'
      const savedGrammarProgress = localStorage.getItem(grammarStorageKey);
      
      if (savedGrammarProgress) {
        const grammarProgress = JSON.parse(savedGrammarProgress) as GrammarProgress[];
        
        grammarProgress.forEach((categoryProgress) => {
          categoryProgress.masteredWords.forEach((wordData) => {
            // Créer un objet RevisionWordInfo pour chaque mot de grammaire
            grammarWords.push({
              word: wordData.word,
              category: 'Grammaire',
              isCorrect: true, // Les mots appris sont considérés comme corrects
              timestamp: categoryProgress.date || Date.now(),
              nextReview: Date.now() + (24 * 60 * 60 * 1000), // Défaut: dans 1 jour
              interval: 1,
              easeFactor: 2.5,
              translation: wordData.data.translation,
              grammarType: 'rule', // Défaut
              subCategory: categoryProgress.subcategory
            });
          });
        });
      }
      
      console.log(`📚 Grammaire trouvée: ${grammarWords.length} mots`);
    } catch (error) {
      console.error('Erreur lors du chargement des données de grammaire:', error);
    }
    
    if (grammarWords.length === 0) return {};
    
    // Grouper les mots de grammaire par catégorie
    return grammarWords.reduce<Record<string, RevisionWordInfo[]>>((acc, word) => {
      if (!acc[word.category]) {
        acc[word.category] = [];
      }
      acc[word.category].push(word);
      return acc;
    }, {});
  }

  // Traitement normal de l'historique + ajout des mots de grammaire
  const latestWords = new Map<string, RevisionWordInfo>();
  
  // D'abord, traiter l'historique de révision existant
  revisionHistory.forEach(word => {
    const key = `${word.word}-${word.category}`;
    const existing = latestWords.get(key);
    
    if (!existing || existing.timestamp < word.timestamp) {
      latestWords.set(key, word);
    }
  });
  
  // Ensuite, ajouter les mots de grammaire qui ne sont PAS dans l'historique
  try {
    const grammarStorageKey = `grammar-progress-${languageCode || 'wf'}`;
    const savedGrammarProgress = localStorage.getItem(grammarStorageKey);
    
    if (savedGrammarProgress) {
      const grammarProgress = JSON.parse(savedGrammarProgress) as GrammarProgress[];
      
      grammarProgress.forEach((categoryProgress) => {
        categoryProgress.masteredWords.forEach((wordData) => {
          const key = `${wordData.word}-Grammaire`;
          
          // Ajouter seulement si pas déjà dans l'historique
          if (!latestWords.has(key)) {
            latestWords.set(key, {
              word: wordData.word,
              category: 'Grammaire',
              isCorrect: true,
              timestamp: categoryProgress.date || Date.now(),
              nextReview: Date.now() + (24 * 60 * 60 * 1000),
              interval: 1,
              easeFactor: 2.5,
              translation: wordData.data.translation,
              grammarType: 'rule',
              subCategory: categoryProgress.subcategory
            });
          }
        });
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout des mots de grammaire:', error);
  }

  // Regrouper par catégorie
  const grouped = Array.from(latestWords.values()).reduce<Record<string, RevisionWordInfo[]>>((acc, word) => {
    if (!acc[word.category]) {
      acc[word.category] = [];
    }
    acc[word.category].push(word);
    return acc;
  }, {});

  // Trier par timestamp pour chaque catégorie
  Object.keys(grouped).forEach(category => {
    grouped[category].sort((a, b) => b.timestamp - a.timestamp);
  });

  return grouped;
}, [revisionHistory, languageCode]);

  const categories = Object.keys(groupedWords);

  // Fonction pour formater le temps de révision
  const getNextReviewTime = useCallback((nextReview: number) => {
    if (!nextReview) return "Non programmé";
    
    const now = Date.now();
    if (nextReview <= now) return "Disponible maintenant";
    
    const diff = nextReview - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Dans ${hours}h`;
    return "Bientôt";
  }, []);

  // Gestion de la fermeture du modal
  const handleClose = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onClose();
  }, [onClose]);

  // Gestion du clic sur l'overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // Fermer seulement si on clique directement sur l'overlay
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  // Gestion des touches clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // 🔧 NOUVEAU : Composant StatusIcon corrigé avec logique de statut améliorée
  const StatusIcon = React.memo<{ 
    wordItem: RevisionWordInfo;
    getNextReviewTime: (nextReview: number) => string;
  }>(({ wordItem, getNextReviewTime }) => {
    const now = Date.now();
    const isDue = wordItem.nextReview <= now;
    
    // Logique de statut améliorée
    let statusClass = '';
    let icon = null;
    
    if (isDue) {
      // Mot disponible pour révision
      statusClass = 'available';
      icon = <span style={{ fontSize: '14px' }}>🔄</span>; // Icône de révision
    } else if (wordItem.isCorrect) {
      // Mot maîtrisé (pas encore dû)
      statusClass = 'mastered';
      icon = <Check size={14} />; // ✅
    } else {
      // Mot échoué mais pas encore dû pour révision
      statusClass = 'needs-work';
      icon = <span style={{ fontSize: '14px' }}>⚠️</span>; // Avertissement
    }
    
    return (
      <div className={`revision-stats-modal-status-icon ${statusClass} ${isDarkMode ? 'dark' : ''}`}>
        {icon}
      </div>
    );
  });

  // Composant pour un item de mot mis à jour
  const WordItem = React.memo<{ 
    wordItem: RevisionWordInfo; 
    category: string;
    getNextReviewTime: (nextReview: number) => string;
  }>(({ wordItem, category, getNextReviewTime }) => {
    const translation = wordDataMap[category]?.[wordItem.word]?.translation || wordItem.translation;
    
    return (
      <motion.div 
        className={`revision-stats-modal-word-item ${isDarkMode ? 'dark' : ''}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Ligne principale avec mot et statut */}
        <div className="revision-stats-modal-word-header">
          <div className="revision-stats-modal-word-info">
            <StatusIcon 
              wordItem={wordItem} 
              getNextReviewTime={getNextReviewTime} 
            />
            <span className={`revision-stats-modal-word-text ${isDarkMode ? 'dark' : ''}`}>
              {wordItem.word}
            </span>
          </div>
        </div>

        {/* Traduction si disponible */}
        {translation && (
          <div className={`revision-stats-modal-translation ${isDarkMode ? 'dark' : ''}`}>
            {translation}
          </div>
        )}
        
        {/* Prochaine révision */}
        <div className="revision-stats-modal-next-review">
          <span className={`revision-stats-modal-next-review-text ${
            wordItem.nextReview <= Date.now() ? 'available' : 'pending'
          } ${isDarkMode ? 'dark' : ''}`}>
            {getNextReviewTime(wordItem.nextReview)}
          </span>
        </div>
      </motion.div>
    );
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="revision-stats-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
          style={{ cursor: 'pointer' }}
        >
          <motion.div 
            className={`revision-stats-modal ${isDarkMode ? 'dark' : ''}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.5
            }}
            onClick={e => e.stopPropagation()}
            style={{ cursor: 'default' }}
          >
            {/* Header */}
            <div className={`revision-stats-modal-header ${isDarkMode ? 'dark' : ''}`}>
              <h2 className={`revision-stats-modal-title ${isDarkMode ? 'dark' : ''}`}>
                Historique des révisions
              </h2>
              <button 
                onClick={handleClose} 
                className={`revision-stats-modal-close-btn ${isDarkMode ? 'dark' : ''}`}
                aria-label="Fermer le modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Sélecteur de catégorie */}
            <div className={`revision-stats-modal-category-selector ${isDarkMode ? 'dark' : ''}`}>
              <div className="revision-stats-modal-select-container">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`revision-stats-modal-select ${isDarkMode ? 'dark' : ''}`}
                >
                  <option value="all">Toutes les catégories ({categories.length})</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category} ({groupedWords[category]?.length || 0} mots)
                    </option>
                  ))}
                </select>
                <ChevronDown className="revision-stats-modal-select-icon" size={16} />
              </div>
            </div>

            {/* Liste des mots */}
            <div className={`revision-stats-modal-content ${isDarkMode ? 'dark' : ''}`}>
              {categories.length === 0 ? (
                <div className="revision-stats-modal-empty-state">
                  <div className="revision-stats-modal-empty-state-icon">📚</div>
                  <h3 className={`revision-stats-modal-empty-state-title ${isDarkMode ? 'dark' : ''}`}>
                    Aucun historique disponible
                  </h3>
                  <p className={`revision-stats-modal-empty-state-text ${isDarkMode ? 'dark' : ''}`}>
                    Commencez à réviser des mots pour voir votre historique ici.
                  </p>
                </div>
              ) : selectedCategory === 'all' ? (
                <div className="revision-stats-modal-categories">
                  {categories.map(category => (
                    <motion.div 
                      key={category}
                      className="revision-stats-modal-category-section"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className={`revision-stats-modal-category-title ${isDarkMode ? 'dark' : ''}`}>
                        <span className="revision-stats-modal-category-indicator"></span>
                        {category}
                        <span className={`revision-stats-modal-category-count ${isDarkMode ? 'dark' : ''}`}>
                          ({groupedWords[category]?.length || 0} mots)
                        </span>
                      </h3>
                      <div className="revision-stats-modal-words-grid">
                        {groupedWords[category]?.map((wordItem, index) => (
                          <WordItem
                            key={`${wordItem.word}-${wordItem.category}-${wordItem.timestamp}`}
                            wordItem={wordItem}
                            category={category}
                            getNextReviewTime={getNextReviewTime}
                          />
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {groupedWords[selectedCategory]?.length ? (
                    <>
                      <h3 className={`revision-stats-modal-category-title ${isDarkMode ? 'dark' : ''}`}>
                        <span className="revision-stats-modal-category-indicator"></span>
                        {selectedCategory}
                        <span className={`revision-stats-modal-category-count ${isDarkMode ? 'dark' : ''}`}>
                          ({groupedWords[selectedCategory].length} mots)
                        </span>
                      </h3>
                      <div className="revision-stats-modal-words-grid">
                        {groupedWords[selectedCategory].map((wordItem, index) => (
                          <WordItem
                            key={`${wordItem.word}-${wordItem.category}-${wordItem.timestamp}`}
                            wordItem={wordItem}
                            category={selectedCategory}
                            getNextReviewTime={getNextReviewTime}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="revision-stats-modal-empty-state">
                      <div className="revision-stats-modal-empty-state-icon">📖</div>
                      <h3 className={`revision-stats-modal-empty-state-title ${isDarkMode ? 'dark' : ''}`}>
                        Aucun mot dans cette catégorie
                      </h3>
                      <p className={`revision-stats-modal-empty-state-text ${isDarkMode ? 'dark' : ''}`}>
                        Cette catégorie ne contient pas encore de mots révisés.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RevisionStatsModal;
