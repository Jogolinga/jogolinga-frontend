import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  RotateCw,
  ChevronRight,
  X,
  ArrowLeft, // ✅ AJOUT: Import d'ArrowLeft pour le bouton mobile
} from 'lucide-react';
import { WordData } from '../types/types';
import { useTheme } from './ThemeContext';
import './WordListPreview.css';
import { useSupabaseAudio } from '../hooks/useSupabaseAudio';

interface WordListPreviewProps {
  title: string;
  words: [string, WordData][];
  onBack: () => void;
  onStartLearning: () => void;
  onStartRevision: () => void;
  completedWordsCount: number;
  playAudio: (audioSrc: string) => Promise<void>;
  completedWords: Set<string>;
  isMobileView?: boolean;
  languageCode: string;
}

type SortOrder = 'default' | 'alphabetical' | 'learned' | 'progress';

// ✅ NOUVEAU: Composant AdaptiveBackButton comme dans GrammarMode
const AdaptiveBackButton: React.FC<{
  onBack: () => void;
  isMobileView?: boolean;
  title?: string;
}> = ({ onBack, isMobileView = false, title }) => {
  const { theme } = useTheme();
  
  if (isMobileView) {
    return (
      <div className="grammar-header mobile-layout">
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
          <h2 className="grammar-mobile-title">{title}</h2>
        )}
        
        <div className="grammar-header-spacer"></div>
      </div>
    );
  }
  
  return (
    <motion.button
      onClick={onBack}
      className="modern-back-button"
      whileHover={{ scale: 1.05, x: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <ChevronLeft size={20} />
      <span>Retour</span>
    </motion.button>
  );
};

const WordListPreview: React.FC<WordListPreviewProps> = ({ 
  title, 
  words, 
  onBack, 
  onStartLearning,
  onStartRevision,
  completedWordsCount = 0,
  playAudio,
  completedWords,
  isMobileView = false,
  languageCode
}) => {
  const { theme } = useTheme();
  
  // États pour forcer le rechargement des mots appris
  const [learnedWordsRefreshTrigger, setLearnedWordsRefreshTrigger] = useState(0);
  
  // CLÉ STABLE qui inclut maintenant le trigger de rafraîchissement
  const stableComponentKey = useMemo(() => {
    return `wordlist-${title}-${words.length}-${learnedWordsRefreshTrigger}`;
  }, [title, words.length, learnedWordsRefreshTrigger]);
  
  // États avec clés uniques pour éviter les conflits
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [audioLoading, setAudioLoading] = useState<string | null>(null);
  const [isChangingPage, setIsChangingPage] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Configuration
  const itemsPerPage = 5;
  
  // Fonction de nettoyage des mots (supprime les parenthèses)
  const cleanWord = useCallback((word: string): string => {
    return word.split('(')[0].trim();
  }, []);
  
  // Fonction pour charger les mots appris depuis localStorage
  const loadLearnedWordsFromStorage = useCallback((): Set<string> => {
    const learnedWords = new Set<string>();
    
    try {
      // 1. Charger les mots de la catégorie spécifique
      const categoryLearnedKey = `${languageCode}-${title}-learnedWords`;
      const savedCategoryLearned = localStorage.getItem(categoryLearnedKey);
      
      if (savedCategoryLearned) {
        const categoryWords = JSON.parse(savedCategoryLearned) as string[];
        categoryWords.forEach(word => {
          learnedWords.add(word);
          learnedWords.add(cleanWord(word)); // Ajouter aussi la version nettoyée
        });
       
      }
      
      // 2. Charger les mots de la session locale
      const sessionLearnedKey = `${languageCode}-${title}-sessionLearned`;
      const savedSessionLearned = localStorage.getItem(sessionLearnedKey);
      
      if (savedSessionLearned) {
        const sessionWords = JSON.parse(savedSessionLearned) as string[];
        sessionWords.forEach(word => {
          learnedWords.add(word);
          learnedWords.add(cleanWord(word));
        });
    
      }
      
      // 3. Fallback: liste globale (pour compatibilité)
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
  }, [languageCode, title, cleanWord]);
  
  // État local pour les mots appris avec rechargement automatique
  const [localLearnedWords, setLocalLearnedWords] = useState<Set<string>>(() => 
    loadLearnedWordsFromStorage()
  );
  
  // SURVEILLANCE: Surveiller les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      // Vérifier si le changement concerne notre langue et catégorie
      if (event.key && (
        event.key.includes(`${languageCode}-${title}-`) ||
        event.key.includes(`${languageCode}-allLearnedWords`)
      )) {
     
        
        // Recharger les mots appris
        const newLearnedWords = loadLearnedWordsFromStorage();
        setLocalLearnedWords(newLearnedWords);
        
        // Forcer le rafraîchissement du composant
        setLearnedWordsRefreshTrigger(prev => prev + 1);
      }
    };

    // Écouter les événements de changement de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // SURVEILLANCE SUPPLÉMENTAIRE: Polling périodique pour les changements internes
    const pollInterval = setInterval(() => {
      const currentLearnedWords = loadLearnedWordsFromStorage();
      
      // Comparer avec l'état actuel
      if (currentLearnedWords.size !== localLearnedWords.size) {
       
        setLocalLearnedWords(currentLearnedWords);
        setLearnedWordsRefreshTrigger(prev => prev + 1);
      }
    }, 2000); // Vérifier toutes les 2 secondes
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [languageCode, title, loadLearnedWordsFromStorage, localLearnedWords.size]);
  
  // RÉINITIALISER UNIQUEMENT quand la catégorie change vraiment
  useEffect(() => {

    setExpandedWord(null);
    setCurrentPage(0);
    setSearchQuery('');
    setSortOrder('default');
    setAudioLoading(null);
    setIsChangingPage(false);
    
    // RECHARGEMENT: Recharger les mots appris au changement de catégorie
    const newLearnedWords = loadLearnedWordsFromStorage();
    setLocalLearnedWords(newLearnedWords);
    setLearnedWordsRefreshTrigger(prev => prev + 1);
  }, [title, languageCode, loadLearnedWordsFromStorage]);
  
  // Vérification mise à jour avec l'état local
  const isWordLearned = useCallback((word: string): boolean => {
    const baseWord = cleanWord(word);
    const variations = [
      word,
      baseWord,
      word.toLowerCase(),
      baseWord.toLowerCase()
    ];
    
    return variations.some(variant => localLearnedWords.has(variant));
  }, [localLearnedWords, cleanWord]);
  
  // RECALCUL: Calcul dynamique du nombre de mots complétés
  const recalculatedCompletedWordsCount = useMemo(() => {
    return words.reduce((count: number, [word]: [string, WordData]) => {
      return isWordLearned(word) ? count + 1 : count;
    }, 0);
  }, [words, isWordLearned]);
  
  // Utiliser le count recalculé au lieu de celui des props
  const effectiveCompletedWordsCount = recalculatedCompletedWordsCount;
  const isCategoryCompleted = effectiveCompletedWordsCount === words.length;
  
  // Filtrage et tri des mots (memoized pour performance)
  const processedWords = useMemo(() => {
    // Filtrage
    let filtered = words.filter(([word, data]) => {
      if (searchQuery === '') return true;
      const searchLower = searchQuery.toLowerCase();
      return (
        word.toLowerCase().includes(searchLower) || 
        data.translation.toLowerCase().includes(searchLower) ||
        data.explanation?.toLowerCase().includes(searchLower) ||
        data.example?.toLowerCase().includes(searchLower)
      );
    });
    
    // Tri
    const sorted = [...filtered].sort((a, b) => {
      const [wordA, dataA] = a;
      const [wordB, dataB] = b;
      
      switch (sortOrder) {
        case 'alphabetical':
          return cleanWord(wordA).localeCompare(cleanWord(wordB));
        
        case 'learned':
          const aLearned = isWordLearned(wordA) ? 1 : 0;
          const bLearned = isWordLearned(wordB) ? 1 : 0;
          return bLearned - aLearned;
        
        case 'progress':
          // Tri par progression (mots avec explications/exemples en premier)
          const aHasDetails = (dataA.explanation || dataA.example) ? 1 : 0;
          const bHasDetails = (dataB.explanation || dataB.example) ? 1 : 0;
          return bHasDetails - aHasDetails;
        
        default:
          return 0; // Garde l'ordre original
      }
    });
    
    return sorted;
  }, [words, searchQuery, sortOrder, isWordLearned, cleanWord]);
  
  // Pagination
  const totalPages = Math.ceil(processedWords.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const visibleWords = processedWords.slice(startIndex, startIndex + itemsPerPage);
  
  // Calcul du pourcentage de progression
  const progressPercentage = words.length > 0 ? Math.round((effectiveCompletedWordsCount / words.length) * 100) : 0;
  
  // GESTION DE PAGINATION CORRIGÉE - Évite le déploiement infini
  const changePage = useCallback((newPage: number) => {
    
    
   
    
    
    // Marquer qu'un changement est en cours
    setIsChangingPage(true);
    
    // Fermer les détails lors du changement de page
    setExpandedWord(null);
    
    // Changer la page après un court délai pour éviter les conflits
    setTimeout(() => {
      setCurrentPage(newPage);
      
      // Scroll doux vers le haut
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      
      // Débloquer après le changement de page
      setTimeout(() => {
        setIsChangingPage(false);
      }, 300);
    }, 50);
    
  }, [totalPages, currentPage, isChangingPage]);
  
  // Gestion des gestes tactiles
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (isChangingPage) return;
    setTouchStart(e.touches[0].clientX);
  }, [isChangingPage]);
  
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null || isChangingPage) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changePage(currentPage + 1);
      } else {
        changePage(currentPage - 1);
      }
    }
    
    setTouchStart(null);
  }, [touchStart, currentPage, changePage, isChangingPage]);
  
  // Gestion de l'audio avec état de chargement
  const handleAudioPlay = useCallback(async (audioSrc: string, word: string) => {
    try {
      setAudioLoading(word);
      await playAudio(audioSrc);
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    } finally {
      setAudioLoading(null);
    }
  }, [playAudio]);
  
  // Gestion de l'expansion des détails
  const toggleWordDetails = useCallback((word: string) => {
    if (isChangingPage) return;
    setExpandedWord(prev => prev === word ? null : word);
  }, [isChangingPage]);
  
  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(0);
    setExpandedWord(null);
    setIsChangingPage(false);
  }, [searchQuery, sortOrder]);
  
  // VARIANTS D'ANIMATION OPTIMISÉS pour éviter les conflits
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.02,
        duration: 0.15
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.1,
        staggerChildren: 0.01,
        staggerDirection: -1
      }
    }
  };
  
  const itemVariants = {
    hidden: { 
      y: 8,
      opacity: 0 
    },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.15,
        ease: "easeOut"
      }
    },
    exit: {
      y: -8,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };
  
  const detailsVariants = {
    hidden: { 
      height: 0, 
      opacity: 0,
      paddingTop: 0,
      paddingBottom: 0 
    },
    visible: { 
      height: "auto", 
      opacity: 1,
      paddingTop: "var(--spacing-lg)",
      paddingBottom: "var(--spacing-lg)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      paddingTop: 0,
      paddingBottom: 0,
      transition: {
        duration: 0.15
      }
    }
  };
  
  // Génération des numéros de page à afficher
  const getPageNumbers = useCallback(() => {
    const maxVisible = 5;
    const pages: number[] = [];
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage < 3) {
        for (let i = 0; i < maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage > totalPages - 3) {
        for (let i = totalPages - maxVisible; i < totalPages; i++) {
          pages.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // Gestion du retour avec animation de sortie
  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  // CLÉ UNIQUE POUR LA GRILLE DE MOTS basée sur la page actuelle
  const wordsGridKey = useMemo(() => {
    return `words-grid-${currentPage}-${processedWords.length}-${learnedWordsRefreshTrigger}`;
  }, [currentPage, processedWords.length, learnedWordsRefreshTrigger]);

  const renderContent = () => (
    <motion.div 
      className="word-list-preview"
      ref={contentRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* ✅ MODIFIÉ: Header avec le nouveau composant AdaptiveBackButton */}
      <motion.div 
        className="header-section"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <AdaptiveBackButton 
          onBack={handleBack}
          isMobileView={isMobileView}
          title={isMobileView ? title : undefined}
        />
        
        {/* ✅ MODIFIÉ: Titre conditionnel pour mobile */}
        {!isMobileView && (
          <motion.h2 
            className="page-title"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.2 }}
          >
            {title}
          </motion.h2>
        )}
        
        <div style={{ width: isMobileView ? '60px' : '100px' }}></div>
      </motion.div>

      {/* Carte de progression */}
      <motion.div 
        className="progress-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <div className="progress-info">
          <h3>Progression de la catégorie</h3>
          <p className="progress-text">
            {effectiveCompletedWordsCount} sur {words.length} expressions apprises
          </p>
          {effectiveCompletedWordsCount > 0 && (
            <motion.p 
              className="progress-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              style={{ color: 'var(--success-green)', fontWeight: 600, marginTop: 'var(--spacing-sm)' }}
            >
              🎉 Excellent travail ! Continuez ainsi !
            </motion.p>
          )}
        </div>
        
        <div className="progress-circle-container">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="rgba(226, 232, 240, 0.3)"
              strokeWidth="8"
            />
            <motion.circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="var(--success-green)"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - effectiveCompletedWordsCount / words.length)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
              animate={{ 
                strokeDashoffset: 2 * Math.PI * 45 * (1 - effectiveCompletedWordsCount / words.length) 
              }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
            />
          </svg>
          <motion.div 
            className="progress-percentage"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            {progressPercentage}%
          </motion.div>
        </div>
      </motion.div>

      {/* Liste des mots */}
      {processedWords.length === 0 ? (
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-message">
            {searchQuery 
              ? `Aucun mot ne correspond à "${searchQuery}"` 
              : "Aucun mot disponible dans cette catégorie"
            }
          </p>
          {searchQuery && (
            <p className="empty-state-suggestion">
              Essayez une recherche différente ou effacez le filtre
            </p>
          )}
        </motion.div>
      ) : (
        // CLÉ UNIQUE POUR FORCER LE RENOUVELLEMENT À CHAQUE CHANGEMENT DE PAGE
        <motion.div 
          key={wordsGridKey}
          className="words-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {visibleWords.map(([word, data], index) => {
            const isLearned = isWordLearned(word);
            const globalIndex = startIndex + index + 1;
            const hasDetails = Boolean(data.explanation || data.example);
            const isExpanded = expandedWord === word;
            
            return (
              <motion.div
                key={`${word}-${globalIndex}-${currentPage}-${learnedWordsRefreshTrigger}`}
                className={`word-card ${isLearned ? 'learned' : ''}`}
                variants={itemVariants}
                onClick={() => hasDetails && toggleWordDetails(word)}
                whileHover={{ 
                  y: -6, 
                  transition: { type: "tween", duration: 0.2 } 
                }}
                style={{ 
                  cursor: hasDetails ? 'pointer' : 'default',
                  pointerEvents: isChangingPage ? 'none' : 'auto'
                }}
              >
                <div className="word-header">
                  <div className="word-main-content">
                    <div className="word-number-title">
                      <motion.div 
                        className={`word-number ${isLearned ? 'learned' : ''}`}
                        initial={isLearned ? { scale: 0 } : undefined}
                        animate={isLearned ? { scale: 1 } : undefined}
                        transition={isLearned ? { type: "spring", delay: 0.1, duration: 0.3 } : undefined}
                      >
                        {isLearned ? '✓' : globalIndex}
                      </motion.div>
                      <div className="foreign-word">
                        {word}
                      </div>
                    </div>
                    <div className="translation">
                      {data.translation}
                    </div>
                  </div>
                  
                  <div className="word-actions">
                    {data.audio && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAudioPlay(data.audio!, word);
                        }}
                        className="audio-button"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={audioLoading === word || isChangingPage}
                      >
                        {audioLoading === word ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            ⟳
                          </motion.div>
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </motion.button>
                    )}
                    
                    {hasDetails && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWordDetails(word);
                        }}
                        className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isChangingPage}
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </motion.button>
                    )}
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && hasDetails && (
                    <motion.div
                      key={`details-${word}`}
                      className="word-details"
                      variants={detailsVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {data.explanation && (
                        <motion.div 
                          className="word-explanation"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05, duration: 0.2 }}
                        >
                          <span className="detail-label">💡 Explication</span>
                          <div className="word-explanation-content">
                            {data.explanation}
                          </div>
                        </motion.div>
                      )}
                      
                      {data.example && (
                        <motion.div 
                          className="word-example"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1, duration: 0.2 }}
                        >
                          <span className="detail-label">📝 Exemple</span>
                          <div className="example-content">
                            {data.example}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <motion.div 
          className="pagination-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <div className="pagination-controls">
            <motion.button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 0 || isChangingPage}
              className="pagination-button"
              whileHover={currentPage !== 0 && !isChangingPage ? { scale: 1.15 } : undefined}
              whileTap={currentPage !== 0 && !isChangingPage ? { scale: 0.95 } : undefined}
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <div className="page-numbers">
              {getPageNumbers().map((pageNum) => (
                <motion.button
                  key={`page-${pageNum}`}
                  onClick={() => changePage(pageNum)}
                  className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                  whileHover={pageNum !== currentPage && !isChangingPage ? { scale: 1.1, y: -2 } : undefined}
                  whileTap={pageNum !== currentPage && !isChangingPage ? { scale: 0.95 } : undefined}
                  disabled={isChangingPage}
                  style={{
                    opacity: isChangingPage ? 0.6 : 1
                  }}
                >
                  {pageNum + 1}
                </motion.button>
              ))}
            </div>
            
            <motion.button
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages - 1 || isChangingPage}
              className="pagination-button"
              whileHover={currentPage !== totalPages - 1 && !isChangingPage ? { scale: 1.15 } : undefined}
              whileTap={currentPage !== totalPages - 1 && !isChangingPage ? { scale: 0.95 } : undefined}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
          
          <div className="page-indicator">
            Page {currentPage + 1} sur {totalPages}
            {processedWords.length !== words.length && (
              <span style={{ opacity: 0.7, marginLeft: 'var(--spacing-sm)' }}>
                (filtré)
              </span>
            )}
            {isChangingPage && (
              <span style={{ opacity: 0.7, marginLeft: 'var(--spacing-sm)', fontSize: '12px' }}>
                Chargement...
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Boutons d'action */}
      <motion.div 
        className="action-buttons"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.3 }}
      >
        {isCategoryCompleted ? (
          <motion.button
            onClick={onStartRevision}
            className="action-button secondary"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
            disabled={isChangingPage}
          >
            <RotateCw size={20} />
            <span>Réviser la catégorie</span>
          </motion.button>
        ) : (
          <motion.button
            onClick={onStartLearning}
            className="action-button primary"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
            disabled={isChangingPage}
          >
            <CheckCircle size={20} />
            <span>Commencer l'apprentissage ({words.length - effectiveCompletedWordsCount})</span>
          </motion.button>
        )}
        
        {effectiveCompletedWordsCount > 0 && !isCategoryCompleted && (
          <motion.button
            onClick={onStartRevision}
            className="action-button secondary"
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ y: 0, scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            disabled={isChangingPage}
          >
            <RotateCw size={20} />
            <span>Réviser les mots appris ({effectiveCompletedWordsCount})</span>
          </motion.button>
        )}
        
        {/* ✅ SUPPRIMÉ: Le bouton retour mobile ici car maintenant c'est dans le header */}
      </motion.div>
    </motion.div>
  );

  // RENDU PRINCIPAL STABLE
  return (
    <div className="word-list-preview-container" data-theme={theme}>
      <motion.div
        key={stableComponentKey}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};

export default WordListPreview;