import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Book, CheckCircle, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { LanguageCode, UserProgress, LearnedSentence } from '../types/types';
import { getLanguageData } from '../data/languages';
import useSentenceRevision, { type SentenceRevisionInfo } from '../hooks/useSentenceRevision';
import './ProgressStats.css';

// Interface pour les sessions de grammaire
interface GrammarSession {
  subcategory: string;
  masteredWords: Array<{
    word: string;
    data: {
      translation: string;
      explanation?: string;
      example?: string;
      audio?: string;
    }
  }>;
  date: number;
}

// ✅ AJOUTER CETTE INTERFACE DANS ProgressStats.tsx (après les autres interfaces)

// Interface pour les stats calculées
interface CalculatedStats {
  level: number;
  totalXP: number;
  remainingXP: number;
  xpForNextLevel: number;
  progress: number;
  vocabularyWords: number;
  masteredGrammarWords: number;
  masteredSentences: number;
  totalWords: number;
  description: string;
  badge: string;
  isMaxLevel: boolean;
  nextLevelXP: number;
  debug: {
    expectedXP: number;
    xpDifference: number;
    isCoherent: boolean;
    calculationTimestamp: number;
  };
}

interface ProgressStatsProps {
  languageCode: LanguageCode;
  userProgress: UserProgress;
  onBackToMenu: () => void;
  completedCategories: string[];
  currentStreak?: number;
  learnedWordsCount?: number;
}

// Fonction utilitaire pour nettoyer les mots (sans parenthèses)
const cleanWord = (word: string): string => {
  return word.split('(')[0].trim();
};

// Points XP par mot/élément appris
const XP_PER_ELEMENT = 10;
const XP_PER_SENTENCE = 15;

// Définition des niveaux (même que MainMenu)
const LEVELS = [
  { threshold: 0, required: 250 },     // Niveau 1: 0-250 XP
  { threshold: 250, required: 500 },   // Niveau 2: 250-750 XP
  { threshold: 750, required: 750 },   // Niveau 3: 750-1500 XP
  { threshold: 1500, required: 1000 }, // Niveau 4: 1500-2500 XP
  { threshold: 2500, required: 1250 }, // Niveau 5: 2500-3750 XP
  { threshold: 3750, required: 1250 }  // Niveau 6: 3750-5000 XP
];

// Descriptions des niveaux
const LEVEL_DESCRIPTIONS = {
  1: "Débutant",
  2: "Élémentaire",
  3: "Intermédiaire",
  4: "Avancé",
  5: "Expert",
  6: "Maître"
} as const;

// Badges des niveaux
const BADGES = {
  1: "🌱",
  2: "🌿",
  3: "🌲",
  4: "🌳",
  5: "🌺",
  6: "💎"
} as const;

const ProgressStats: React.FC<ProgressStatsProps> = ({ 
  languageCode, 
  userProgress, 
  onBackToMenu,
  completedCategories,
  currentStreak = 0,
  learnedWordsCount
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'achievements'>('overview');
  const [vocabularyWords, setVocabularyWords] = useState<string[]>([]);
  const [grammarProgress, setGrammarProgress] = useState<GrammarSession[]>([]);
  const [learnedSentences, setLearnedSentences] = useState<LearnedSentence[]>([]);
  const [updateCounter, setUpdateCounter] = useState<number>(0);
  const [sentencesLoaded, setSentencesLoaded] = useState<boolean>(false);
  const languageData = getLanguageData(languageCode);
  
  // ✅ NOUVEAU : Écouteur d'événements XP comme MainMenu
  useEffect(() => {
    const handleXPUpdate = (event: CustomEvent) => {
      // Forcer un re-rendu pour refléter les nouveaux niveaux
      setUpdateCounter(prev => prev + 1);
    };
    
    window.addEventListener('xpUpdated', handleXPUpdate as EventListener);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXPUpdate as EventListener);
    };
  }, []);

  // ✅ NOUVELLES FONCTIONS UTILITAIRES AMÉLIORÉES
  const cleanAndNormalizeWord = useCallback((word: string): string => {
    return word
      .replace(/\([^)]*\)/g, '') // Supprimer parenthèses
      .replace(/\s*-\s*[^-]*$/g, '') // Supprimer explications après tiret
      .replace(/\s+/g, ' ') // Normaliser espaces multiples
      .trim() // Supprimer espaces début/fin
      .toLowerCase();
  }, []);

  // ✅ NOUVELLE détection de phrase plus stricte
  const isRealPhrase = useCallback((word: string): boolean => {
    const cleaned = cleanAndNormalizeWord(word);
    
    // Conditions pour être considéré comme une phrase :
    // 1. Au moins 3 mots APRÈS nettoyage
    // 2. Contient des mots de liaison typiques
    // 3. Structure de phrase complète
    
    const words = cleaned.split(' ').filter(w => w.length > 0);
    
    if (words.length < 3) {
      console.log(`📝 "${word}" -> "${cleaned}" = ${words.length} mots = VOCABULAIRE`);
      return false;
    }
    
    // Vérifier si c'est vraiment une phrase (pas juste des mots collés)
    const liaisons = ['et', 'ou', 'le', 'la', 'les', 'un', 'une', 'des', 'dans', 'sur', 'avec', 'pour', 'par', 'de', 'du', 'en'];
    const hasLiaisons = words.some(w => liaisons.includes(w));
    
    const isPhrase = words.length >= 4 || (words.length >= 3 && hasLiaisons);
    console.log(`📝 "${word}" -> "${cleaned}" = ${words.length} mots, liaisons: ${hasLiaisons} = ${isPhrase ? 'PHRASE' : 'VOCABULAIRE'}`);
    
    return isPhrase;
  }, [cleanAndNormalizeWord]);

  // ✅ OPTION 2: Utiliser userProgress au lieu des clés localStorage séparées
  const loadVocabularyWordsFromUserProgress = useCallback(() => {
    const vocabularyWordsSet = new Set<string>();
    
    try {
      // Récupérer tous les mots appris depuis userProgress
      const allLearnedWords = Array.from(userProgress.learnedWords);
      
      // Filtrer pour ne garder que les vrais mots de vocabulaire
      allLearnedWords.forEach(word => {
        const cleanedWord = cleanWord(word);
        
        // ✅ UTILISER LA NOUVELLE DÉTECTION
        const isPhrase = isRealPhrase(word);
        const isGrammarRule = word.includes('règle') || word.includes('conjugaison') || 
                            word.includes('accord') || word.includes('temps') ||
                            word.includes('grammaire');
        
        // Si c'est identifié comme phrase ou grammaire, l'exclure du vocabulaire
        if (isPhrase || isGrammarRule) {
          console.log(`🔄 "${word}" exclu du vocabulaire (${isPhrase ? 'phrase' : 'grammaire'})`);
          return;
        }
        
        // Vérifier que ce mot existe dans une catégorie de vocabulaire (pas Grammaire)
        let isVocabularyWord = false;
        Object.keys(languageData.categories).forEach(categoryName => {
          if (categoryName === 'Grammaire' || categoryName === '_hidden') return;
          
          const categoryData = languageData.categories[categoryName];
          if (categoryData && typeof categoryData === 'object') {
            const categoryWordKeys = Object.keys(categoryData).filter(key => !key.includes('_'));
            if (categoryWordKeys.some(categoryWord => 
              cleanWord(categoryWord) === cleanedWord || categoryWord === word
            )) {
              isVocabularyWord = true;
            }
          }
        });
        
        if (isVocabularyWord) {
          vocabularyWordsSet.add(cleanedWord);
          console.log(`✅ Mot vocabulaire confirmé: ${cleanedWord}`);
        } else {
          console.log(`❌ "${word}" pas trouvé dans les catégories de vocabulaire`);
        }
      });
      
      return Array.from(vocabularyWordsSet);
      
    } catch (error) {
      console.error('Erreur lors du chargement du vocabulaire depuis userProgress:', error);
      return [];
    }
  }, [languageCode, languageData.categories, userProgress.learnedWords, isRealPhrase]);

  // ✅ OPTION 2: Charger grammaire depuis userProgress + localStorage (fallback)
  const loadGrammarWordsFromUserProgress = useCallback(() => {
    try {
      // D'abord essayer localStorage pour les sessions détaillées
      const grammarStorageKey = `grammar-progress-${languageCode}`;
      const savedGrammarProgress = localStorage.getItem(grammarStorageKey);
      
      if (savedGrammarProgress) {
        const parsedGrammarProgress = JSON.parse(savedGrammarProgress) as GrammarSession[];
        const grammarWordsCount = parsedGrammarProgress.reduce((acc, session) => {
          return acc + session.masteredWords.length;
        }, 0);
        
        setGrammarProgress(parsedGrammarProgress);
        return grammarWordsCount;
      }
      
      // Fallback: estimer depuis userProgress
      const allLearnedWords = Array.from(userProgress.learnedWords);
      let grammarWordsCount = 0;
      
      allLearnedWords.forEach(word => {
        // Identifier les mots de grammaire par patterns
        const isGrammarRule = word.includes('règle') || word.includes('conjugaison') || 
                            word.includes('accord') || word.includes('temps') ||
                            word.includes('grammaire');
        
        // Ou vérifier si le mot existe dans la catégorie Grammaire
        if (languageData.categories['Grammaire']) {
          const grammarCategory = languageData.categories['Grammaire'];
          Object.keys(grammarCategory).forEach(subcategoryName => {
            if (subcategoryName.includes('_')) return;
            const subcategory = grammarCategory[subcategoryName];
            if (Object.keys(subcategory).includes(word)) {
              grammarWordsCount++;
            }
          });
        }
        
        if (isGrammarRule) {
          grammarWordsCount++;
        }
      });
      
      setGrammarProgress([]);
      return grammarWordsCount;
      
    } catch (error) {
      console.error('Erreur lors du chargement de la grammaire:', error);
      setGrammarProgress([]);
      return 0;
    }
  }, [languageCode, userProgress.learnedWords, languageData.categories]);

  // ✅ OPTION 2: Charger phrases depuis userProgress + localStorage (fallback) - CORRIGÉ
  const loadSentencesFromUserProgress = useCallback(() => {
    try {
      // D'abord essayer localStorage pour les données détaillées
      const sentenceRevisionKey = `sentence-revision-${languageCode}-sessionHistory`;
      const savedRevisionData = localStorage.getItem(sentenceRevisionKey);
      
      if (savedRevisionData) {
        try {
          const parsed = JSON.parse(savedRevisionData);
          if (Array.isArray(parsed)) {
            const sentencesFromRevision = parsed
              .filter((item: any) => 
                item.type === 'sentence' && 
                item.original && 
                item.original.trim() !== '' &&
                item.french && 
                item.french.trim() !== '' &&
                isRealPhrase(item.original) // ✅ VÉRIFICATION STRICTE
              )
              .map((item: any) => ({
                original: item.original,
                french: item.french,
                audio: item.audio,
                mastered: true, // Si elle est en révision, elle est maîtrisée
                timestamp: item.timestamp || Date.now(),
                words: item.words || item.original.split(' '),
                category: item.category || 'Salutations',
                interval: 1,
                attempts: 1,
                firstAttemptCorrect: true
              }));
            
            setLearnedSentences(sentencesFromRevision);
            setSentencesLoaded(true);
            return sentencesFromRevision;
          }
        } catch (parseError) {
          console.error('Erreur parsing sentences:', parseError);
        }
      }
      
      // Fallback : estimer depuis userProgress mais avec détection stricte
      const allLearnedWords = Array.from(userProgress.learnedWords);
      const estimatedSentences: LearnedSentence[] = [];
      
      allLearnedWords.forEach(word => {
        // ✅ UTILISER LA DÉTECTION STRICTE
        if (isRealPhrase(word)) {
          estimatedSentences.push({
            original: word,
            french: word, // Approximation
            audio: '',
            mastered: true,
            timestamp: Date.now(),
            words: word.split(' '),
            category: 'Estimé',
            interval: 1,
            attempts: 1,
            firstAttemptCorrect: true
          });
        }
      });
      
      console.log(`📊 Phrases détectées par estimation: ${estimatedSentences.length}`);
      estimatedSentences.forEach(s => console.log(`  - "${s.original}"`));
      
      setLearnedSentences(estimatedSentences);
      setSentencesLoaded(true);
      return estimatedSentences;
      
    } catch (error) {
      console.error('Erreur lors du chargement des phrases:', error);
      setLearnedSentences([]);
      setSentencesLoaded(true);
      return [];
    }
  }, [languageCode, userProgress.learnedWords, isRealPhrase]);

  // ✅ EFFET PRINCIPAL : Chargement avec vérification de cohérence depuis userProgress
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Charger les phrases D'ABORD
        const sentences = loadSentencesFromUserProgress();
        
        // 2. Charger la grammaire
        const grammarWordsCount = loadGrammarWordsFromUserProgress();
        
        // 3. Attendre puis charger le vocabulaire avec vérification
        setTimeout(() => {
          const vocabularyWordsArray = loadVocabularyWordsFromUserProgress();
          setVocabularyWords(vocabularyWordsArray);
        }, 200);
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };
    
    loadAllData();
  }, [
    languageCode, 
    loadVocabularyWordsFromUserProgress, 
    loadGrammarWordsFromUserProgress, 
    loadSentencesFromUserProgress,
    updateCounter,
    userProgress.learnedWords // ✅ Dépendance sur userProgress
  ]);

const calculateStats = useCallback((): CalculatedStats => {
  console.group('📊 CALCUL STATS PROGRESSION');
  
  // ✅ DEBUG DÉTAILLÉ DES MOTS APPRIS
  console.group('🔍 ANALYSE DÉTAILLÉE DES MOTS APPRIS');
  const allWords = Array.from(userProgress.learnedWords);
  console.log(`Total mots dans userProgress: ${allWords.length}`);

  allWords.forEach(word => {
    const cleaned = cleanWord(word);
    const isPhrase = isRealPhrase(word);
    const wordCount = cleaned.split(' ').filter(w => w.length > 0).length;
    
    console.log(`"${word}" -> "${cleaned}" (${wordCount} mots) -> ${isPhrase ? '📝 PHRASE' : '📚 VOCAB'}`);
  });
  console.groupEnd();
  
  try {
    // ╔════════════════════════════════════════════════════════════════════════════════════════╗
    // 🎯 RÉCUPÉRATION XP DEPUIS LOCALSTORAGE (source de vérité unique)
    // ╚════════════════════════════════════════════════════════════════════════════════════════╝
    
    let finalXP = parseInt(localStorage.getItem(`${languageCode}-totalXP`) || '0');
    console.log(`📊 XP depuis localStorage: ${finalXP}`);
    
    // ✅ NOUVEAU: Ne PAS recalculer automatiquement, utiliser l'XP existant
    // L'XP est géré par MainMenu et les événements xpUpdated
    
    // ╔════════════════════════════════════════════════════════════════════════════════════════╗
    // 🎯 CALCUL DU NIVEAU (identique à MainMenu)
    // ╚════════════════════════════════════════════════════════════════════════════════════════╝
    
    let currentLevel = 1;
    let currentThreshold = 0;
    let requiredXP = LEVELS[0].required;

    for (let i = 0; i < LEVELS.length; i++) {
      if (finalXP >= LEVELS[i].threshold) {
        currentLevel = i + 1;
        currentThreshold = LEVELS[i].threshold;
        requiredXP = LEVELS[i].required;
      } else {
        break;
      }
    }

    const progressInCurrentLevel = finalXP - currentThreshold;
    const progressPercent = Math.min(1, progressInCurrentLevel / requiredXP);
    const xpForNextLevel = currentThreshold + requiredXP;
    const remainingXP = requiredXP - progressInCurrentLevel;
    
    console.log(`🏆 Niveau: ${currentLevel}, XP: ${finalXP}`);
    
    // ╔════════════════════════════════════════════════════════════════════════════════════════╗
    // 🎯 COMPTAGE DES ÉLÉMENTS PAR MODULE (depuis userProgress et état local)
    // ╚════════════════════════════════════════════════════════════════════════════════════════╝
    
    const vocabularyWordsCount = vocabularyWords.length;
    const masteredGrammarWords = grammarProgress.reduce((acc, session) => {
      return acc + session.masteredWords.length;
    }, 0);
    const masteredSentencesCount = learnedSentences.filter(s => s.mastered).length;
    const totalElementsCount = vocabularyWordsCount + masteredGrammarWords + masteredSentencesCount;
    
    console.log(`📊 Éléments: Vocab=${vocabularyWordsCount}, Gram=${masteredGrammarWords}, Phrases=${masteredSentencesCount}`);
    
    // ╔════════════════════════════════════════════════════════════════════════════════════════╗
    // 🎯 VÉRIFICATION DE COHÉRENCE (informatif uniquement)
    // ╚════════════════════════════════════════════════════════════════════════════════════════╝
    
    const expectedXP = (vocabularyWordsCount + masteredGrammarWords) * XP_PER_ELEMENT + 
                       masteredSentencesCount * XP_PER_SENTENCE;
    
    const isCoherent = Math.abs(finalXP - expectedXP) <= 50;
    
    if (!isCoherent) {
      console.warn(`⚠️ Incohérence détectée:`);
      console.warn(`  - XP stocké: ${finalXP}`);
      console.warn(`  - XP calculé: ${expectedXP}`);
      console.warn(`  - Différence: ${Math.abs(finalXP - expectedXP)}`);
      console.warn(`  - Cette différence est normale si l'XP provient de MainMenu`);
    }
    
    // ╔════════════════════════════════════════════════════════════════════════════════════════╗
    // 🎯 CONSTRUCTION DE L'OBJET STATS FINAL
    // ╚════════════════════════════════════════════════════════════════════════════════════════╝
    
    const stats: CalculatedStats = {
      level: currentLevel,
      totalXP: finalXP, // ✅ Utiliser l'XP de localStorage tel quel
      remainingXP: Math.max(0, remainingXP),
      xpForNextLevel: Math.min(xpForNextLevel, LEVELS[LEVELS.length - 1].threshold + LEVELS[LEVELS.length - 1].required),
      progress: progressPercent,
      
      vocabularyWords: vocabularyWordsCount,
      masteredGrammarWords: masteredGrammarWords,
      masteredSentences: masteredSentencesCount,
      totalWords: totalElementsCount,
      
      description: LEVEL_DESCRIPTIONS[Math.min(currentLevel, 10) as keyof typeof LEVEL_DESCRIPTIONS] || "Niveau inconnu",
      badge: BADGES[Math.min(currentLevel, 10) as keyof typeof BADGES] || "❓",
      
      isMaxLevel: currentLevel >= 10,
      nextLevelXP: currentLevel < 10 ? requiredXP - progressInCurrentLevel : 0,
      
      debug: {
        expectedXP,
        xpDifference: Math.abs(finalXP - expectedXP),
        isCoherent,
        calculationTimestamp: Date.now()
      }
    };
    
    console.log(`✅ Stats calculées - Niveau: ${stats.level}, XP: ${stats.totalXP}`);
    console.groupEnd();
    return stats;
    
  } catch (error) {
    console.error('❌ Erreur calcul stats:', error);
    console.groupEnd();
    
    return {
      level: 1,
      totalXP: 0,
      remainingXP: 250,
      xpForNextLevel: 250,
      progress: 0,
      vocabularyWords: 0,
      masteredGrammarWords: 0,
      masteredSentences: 0,
      totalWords: 0,
      description: "Germe",
      badge: "🌱",
      isMaxLevel: false,
      nextLevelXP: 250,
      debug: {
        expectedXP: 0,
        xpDifference: 0,
        isCoherent: true,
        calculationTimestamp: Date.now()
      }
    };
  }
}, [
  languageCode, 
  vocabularyWords,
  grammarProgress, 
  learnedSentences, 
  updateCounter,
  userProgress.learnedWords,
  isRealPhrase
]);

  const stats = calculateStats();
  
  // Calculer les stats par catégorie depuis userProgress
  const getCategoryStats = () => {
    const categories = Object.keys(languageData.categories)
      .filter(categoryName => categoryName !== "_hidden" && categoryName !== "Grammaire")
      .map(categoryName => {
        const categoryWords = Object.keys(languageData.categories[categoryName])
          .filter(word => !word.includes('_'))
          .map(word => cleanWord(word));
        
        const uniqueCategoryWords = new Set(categoryWords);
        
        // ✅ Utiliser userProgress pour vérifier les mots complétés
        const completedWords = Array.from(uniqueCategoryWords).filter(word => 
          Array.from(userProgress.learnedWords).some(learnedWord => 
            cleanWord(learnedWord) === word
          )
        );
        
        return {
          name: categoryName,
          total: uniqueCategoryWords.size,
          completed: completedWords.length,
          progress: uniqueCategoryWords.size > 0 ? completedWords.length / uniqueCategoryWords.size : 0,
          isCompleted: completedCategories.includes(categoryName)
        };
      });
      
    return categories;
  };

  // Obtenir les sous-catégories de grammaire
  const getGrammarSubcategories = () => {
    const subcategoryMap = new Map<string, {
      words: number;
      total: number;
      progress: number;
      isCompleted: boolean;
    }>();
    
    if (languageData.categories['Grammaire']) {
      const grammarCategory = languageData.categories['Grammaire'];
      
      Object.keys(grammarCategory).forEach(subcategoryName => {
        if (subcategoryName.includes('_')) return;
        
        const subcategory = grammarCategory[subcategoryName];
        const totalWords = Object.keys(subcategory).length;
        
        let masteredWords = 0;
        
        grammarProgress.forEach(session => {
          if (session.subcategory === subcategoryName) {
            masteredWords += session.masteredWords.length;
          }
        });
        
        subcategoryMap.set(subcategoryName, {
          words: masteredWords,
          total: totalWords,
          progress: totalWords > 0 ? masteredWords / totalWords : 0,
          isCompleted: masteredWords >= totalWords
        });
      });
    }
    
    return Array.from(subcategoryMap.entries()).map(([name, stats]) => ({
      name: `Grammaire - ${name}`,
      completed: stats.words,
      total: stats.total,
      progress: stats.progress,
      isCompleted: stats.isCompleted
    }));
  };

  const categoryStats = getCategoryStats();
  const grammarSubcategoryStats = getGrammarSubcategories();
  const allCategoryStats = [...categoryStats, ...grammarSubcategoryStats];

  return (
    <div className={`progress-stats-container ${theme}`}>
      <div className="progress-stats-header">
        <h1 className="progress-stats-title">Statistiques & Progression</h1>
        <motion.button 
          onClick={onBackToMenu}
          className="progress-back-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} /> Retour
        </motion.button>
      </div>
      
      <div className="progress-stats-tabs">
        <button 
          className={`progress-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Aperçu
        </button>
        <button 
          className={`progress-tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>
        <button 
          className={`progress-tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Réussites
        </button>
      </div>
      
      <div className="progress-stats-content">
        {activeTab === 'overview' && (
          <div className="progress-overview">
            <div className="progress-level-card">
              <div className="progress-level-header">
                <div className="progress-level-badge">
                  {stats.badge}
                </div>
                <div className="progress-level-info">
                  <h2>Niveau {stats.level}</h2>
                  <p>{stats.description}</p>
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${stats.progress * 100}%` }}
                  />
                </div>
                <div className="progress-stats">
                  <span>{stats.totalXP} XP</span>
                  <span>{stats.xpForNextLevel} XP</span>
                </div>
                <p className="progress-next-level">
                  {stats.remainingXP} XP avant le niveau {Math.min(stats.level + 1, 6)}
                </p>
              </div>
            </div>
            
            {/* ✅ CORRECTION: Stats cards avec sources séparées */}
            <div className="progress-stats-grid">
              <div className="progress-stat-card">
                <div className="progress-stat-icon">
                  <Book size={20} />
                </div>
                <div className="progress-stat-content">
                  <h3>{stats.vocabularyWords}</h3>
                  <p>Mots de vocabulaire</p>
                  <small style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                
                  </small>
                </div>
              </div>
              
              <div className="progress-stat-card">
                <div className="progress-stat-icon">
                  <MessageSquare size={20} />
                </div>
                <div className="progress-stat-content">
                  <h3>{stats.masteredSentences}</h3>
                  <p>Phrases maîtrisées</p>
                  <small style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                 
                  </small>
                </div>
              </div>
              
              <div className="progress-stat-card">
                <div className="progress-stat-icon">
                  📚
                </div>
                <div className="progress-stat-content">
                  <h3>{stats.masteredGrammarWords}</h3>
                  <p>Règles de grammaire</p>
                  <small style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                 
                  </small>
                </div>
              </div>
              
              <div className="progress-stat-card">
                <div className="progress-stat-icon">
                  🎯
                </div>
                <div className="progress-stat-content">
                  <h3>{stats.totalWords}</h3>
                  <p>Total éléments</p>
                  <small style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                
                  </small>
                </div>
              </div>
            </div>
            
            <div className="progress-completion-chart">
              <h3>Progression globale</h3>
              <div className="progress-completion-container">
                <div className="progress-completion-info">
                  <p className="progress-completion-percentage">
                    {Math.round((stats.vocabularyWords / Object.keys(languageData.categories)
                      .filter(category => category !== "_hidden" && category !== "Grammaire")
                      .reduce((acc, category) => {
                        const uniqueCatWords = new Set(
                          Object.keys(languageData.categories[category])
                            .filter(word => !word.includes('_'))
                            .map(word => cleanWord(word))
                        );
                        return acc + uniqueCatWords.size;
                      }, 0)) * 100) || 0}%
                  </p>
                  <p className="progress-completion-text">du vocabulaire appris</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="progress-details">
            <div className="progress-category-completion">
              <h3>Progression par catégorie</h3>
              <div className="category-progress-list">
                {allCategoryStats.map((category, index) => (
                  <div 
                    key={`${category.name}-${index}`} 
                    className={`category-progress-item ${category.isCompleted ? 'completed' : ''}`}
                  >
                    <div className="category-info">
                      <span className="category-name">{category.name}</span>
                      <span className="category-stats">
                        {category.completed}/{category.total || '?'} éléments
                      </span>
                    </div>
                    <div className="category-progress-bar">
                      <div 
                        className="category-progress-fill"
                        style={{ width: `${category.progress * 100}%` }}
                      />
                    </div>
                    {category.isCompleted && (
                      <div className="category-completed-badge">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ✅ NOUVELLE SECTION: Détail des phrases apprises */}
            {learnedSentences.length > 0 && (
              <div className="progress-sentences-detail">
                <h3>Phrases maîtrisées ({stats.masteredSentences})</h3>
                <div className="sentences-list">
                  {learnedSentences
                    .filter(sentence => sentence.mastered)
                    .slice(0, 10) // Afficher seulement les 10 premières
                    .map((sentence, index) => (
                      <div key={index} className="sentence-detail-item">
                        <div className="sentence-content">
                          <div className="sentence-french">{sentence.french}</div>
                          <div className="sentence-original">{sentence.original}</div>
                        </div>
                        <div className="sentence-category">
                          {sentence.category}
                        </div>
                        <div className="sentence-status mastered">
                          <CheckCircle size={16} />
                          Maîtrisée
                        </div>
                      </div>
                    ))}
                  {learnedSentences.filter(s => s.mastered).length > 10 && (
                    <div className="sentences-more">
                      Et {learnedSentences.filter(s => s.mastered).length - 10} autres phrases...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ SECTION POUR LES PHRASES EN COURS D'APPRENTISSAGE */}
            {learnedSentences.filter(s => !s.mastered).length > 0 && (
              <div className="progress-sentences-learning">
                <h3>Phrases en cours d'apprentissage ({learnedSentences.filter(s => !s.mastered).length})</h3>
                <div className="sentences-list">
                  {learnedSentences
                    .filter(sentence => !sentence.mastered)
                    .slice(0, 5)
                    .map((sentence, index) => (
                      <div key={index} className="sentence-detail-item learning">
                        <div className="sentence-content">
                          <div className="sentence-french">{sentence.french}</div>
                          <div className="sentence-original">{sentence.original}</div>
                        </div>
                        <div className="sentence-category">
                          {sentence.category}
                        </div>
                        <div className="sentence-status learning">
                          🔄 En cours
                        </div>
                      </div>
                    ))}
                  {learnedSentences.filter(s => !s.mastered).length > 5 && (
                    <div className="sentences-more">
                      Et {learnedSentences.filter(s => !s.mastered).length - 5} autres phrases...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ SECTION POUR LE VOCABULAIRE DÉTAILLÉ */}
            {vocabularyWords.length > 0 && (
              <div className="progress-vocabulary-detail">
                <h3>Mots de vocabulaire appris ({vocabularyWords.length})</h3>
                <div className="vocabulary-grid">
                  {vocabularyWords.slice(0, 20).map((word, index) => (
                    <div key={index} className="vocabulary-item">
                      <span className="vocabulary-word">{word}</span>
                    </div>
                  ))}
                  {vocabularyWords.length > 20 && (
                    <div className="vocabulary-more">
                      Et {vocabularyWords.length - 20} autres mots...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ✅ SECTION POUR LA GRAMMAIRE DÉTAILLÉE */}
            {grammarProgress.length > 0 && (
              <div className="progress-grammar-detail">
                <h3>Règles de grammaire maîtrisées ({stats.masteredGrammarWords})</h3>
                <div className="grammar-sessions-list">
                  {grammarProgress.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="grammar-session-item">
                      <div className="grammar-session-header">
                        <h4>{session.subcategory}</h4>
                        <span className="grammar-session-count">
                          {session.masteredWords.length} règle{session.masteredWords.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grammar-words-grid">
                        {session.masteredWords.slice(0, 6).map((wordData, wordIndex) => (
                          <div key={wordIndex} className="grammar-word-item">
                            <span className="grammar-word">{wordData.word}</span>
                            <span className="grammar-translation">{wordData.data.translation}</span>
                          </div>
                        ))}
                        {session.masteredWords.length > 6 && (
                          <div className="grammar-words-more">
                            +{session.masteredWords.length - 6} autres
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'achievements' && (
          <div className="progress-achievements">
            <h3>Vos réussites</h3>
            <div className="achievements-grid">
              <div className={`achievement-card ${stats.vocabularyWords >= 5 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🔤</div>
                <div className="achievement-info">
                  <h4>Premiers mots</h4>
                  <p>Apprenez 5 mots de vocabulaire</p>
                </div>
                {stats.vocabularyWords >= 5 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.vocabularyWords >= 25 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">📚</div>
                <div className="achievement-info">
                  <h4>Vocabulaire de base</h4>
                  <p>Apprenez 25 mots de vocabulaire</p>
                </div>
                {stats.vocabularyWords >= 25 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.vocabularyWords >= 50 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🎓</div>
                <div className="achievement-info">
                  <h4>Étudiant assidu</h4>
                  <p>Apprenez 50 mots de vocabulaire</p>
                </div>
                {stats.vocabularyWords >= 50 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.masteredSentences >= 5 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">💬</div>
                <div className="achievement-info">
                  <h4>Constructeur de phrases</h4>
                  <p>Maîtrisez 5 phrases</p>
                </div>
                {stats.masteredSentences >= 5 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.masteredSentences >= 15 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🗣️</div>
                <div className="achievement-info">
                  <h4>Maître des phrases</h4>
                  <p>Maîtrisez 15 phrases</p>
                </div>
                {stats.masteredSentences >= 15 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.level >= 2 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🌱</div>
                <div className="achievement-info">
                  <h4>Niveau 2 atteint</h4>
                  <p>Atteignez le niveau 2</p>
                </div>
                {stats.level >= 2 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.level >= 3 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🌿</div>
                <div className="achievement-info">
                  <h4>Niveau 3 atteint</h4>
                  <p>Atteignez le niveau 3</p>
                </div>
                {stats.level >= 3 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.level >= 4 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🌲</div>
                <div className="achievement-info">
                  <h4>Niveau 4 atteint</h4>
                  <p>Atteignez le niveau 4</p>
                </div>
                {stats.level >= 4 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${categoryStats.some(c => c.isCompleted) ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🏆</div>
                <div className="achievement-info">
                  <h4>Catégorie complète</h4>
                  <p>Complétez une catégorie entière</p>
                </div>
                {categoryStats.some(c => c.isCompleted) && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.masteredGrammarWords >= 5 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">📖</div>
                <div className="achievement-info">
                  <h4>Apprenti grammairien</h4>
                  <p>Maîtrisez 5 règles de grammaire</p>
                </div>
                {stats.masteredGrammarWords >= 5 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.masteredGrammarWords >= 15 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">📜</div>
                <div className="achievement-info">
                  <h4>Expert grammairien</h4>
                  <p>Maîtrisez 15 règles de grammaire</p>
                </div>
                {stats.masteredGrammarWords >= 15 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.totalWords >= 100 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🎖️</div>
                <div className="achievement-info">
                  <h4>Centurion</h4>
                  <p>Apprenez 100 éléments au total</p>
                </div>
                {stats.totalWords >= 100 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${currentStreak >= 5 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🔥</div>
                <div className="achievement-info">
                  <h4>Série de 5</h4>
                  <p>Obtenez une série de 5 bonnes réponses</p>
                </div>
                {currentStreak >= 5 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${currentStreak >= 10 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">⚡</div>
                <div className="achievement-info">
                  <h4>Série de 10</h4>
                  <p>Obtenez une série de 10 bonnes réponses</p>
                </div>
                {currentStreak >= 10 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.totalXP >= 500 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">💎</div>
                <div className="achievement-info">
                  <h4>Collectionneur d'XP</h4>
                  <p>Obtenez 500 XP</p>
                </div>
                {stats.totalXP >= 500 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
              
              <div className={`achievement-card ${stats.totalXP >= 1000 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🌟</div>
                <div className="achievement-info">
                  <h4>Millionnaire d'XP</h4>
                  <p>Obtenez 1000 XP</p>
                </div>
                {stats.totalXP >= 1000 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              {/* ✅ NOUVEAUX ACHIEVEMENTS SPÉCIFIQUES AUX MODULES */}
              <div className={`achievement-card ${stats.vocabularyWords >= 10 && stats.masteredSentences >= 5 && stats.masteredGrammarWords >= 3 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🎯</div>
                <div className="achievement-info">
                  <h4>Apprenant complet</h4>
                  <p>Maîtrisez au moins 10 mots, 5 phrases et 3 règles</p>
                </div>
                {stats.vocabularyWords >= 10 && stats.masteredSentences >= 5 && stats.masteredGrammarWords >= 3 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              <div className={`achievement-card ${stats.vocabularyWords >= 100 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🔍</div>
                <div className="achievement-info">
                  <h4>Maître du vocabulaire</h4>
                  <p>Apprenez 100 mots de vocabulaire</p>
                </div>
                {stats.vocabularyWords >= 100 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>

              <div className={`achievement-card ${stats.masteredSentences >= 50 ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">🎪</div>
                <div className="achievement-info">
                  <h4>Orateur expérimenté</h4>
                  <p>Maîtrisez 50 phrases</p>
                </div>
                {stats.masteredSentences >= 50 && (
                  <div className="achievement-badge">
                    <CheckCircle size={16} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressStats;