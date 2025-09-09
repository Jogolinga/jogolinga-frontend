import type { 
  LanguageData, 
  LanguageCode, 
  CategoryDictionary,
  WordData
} from '../../types/types';

// Import des données existantes
import wolofCategories from './wolof/categories';
import wolofIllustrations from './wolof/illustrations';
import wolofSentences from './wolof/sentences';
import wolofSentencesgap from './wolof/categories/sentencesgap';

import bambaraCategories from './bambara/categories';
import bambaraIllustrations from './bambara/illustrations';
import bambaraSentences from './bambara/sentences';
import bambaraSentencesgap from './bambara/categories/sentencesgap';

import lingalaCategories from './lingala/categories';
import lingalaIllustrations from './lingala/illustrations';
import lingalaSentences from './lingala/sentences';
import lingalaSentencesgap from './lingala/categories/sentencesgap';

// Import des nouvelles données
import peulCategories from './peul/categories';
import peulIllustrations from './peul/illustrations';
import peulSentences from './peul/sentences';
import peulSentencesgap from './peul/categories/sentencesgap';

import copteCategories from './copte/categories';
import copteIllustrations from './copte/illustrations';
import copteSentences from './copte/sentences';
import copteSentencesgap from './copte/categories/sentencesgap';

// Import des données swahili (nouveau)
import swahiliCategories from './swahili/categories';
import swahiliIllustrations from './swahili/illustrations';
import swahiliSentences from './swahili/sentences';
import swahiliSentencesgap from './swahili/categories/sentencesgap';

// Ajouter en haut du fichier
const COMMON_SENTENCE_CATEGORIES = {
 
    'Salutations': {
      icon: '👋',
      description: 'Premiers contacts et formules de politesse',
    },
    'Présentation': {
      icon: '🤝',
      description: 'Se présenter et faire connaissance',
    },
    'Vie quotidienne': {
      icon: '🌞',
      description: 'Expressions du quotidien',
    },
    'Au marché': {
      icon: '🛍️',
      description: 'Faire ses courses et négocier',
    },
    'Voyages': {
      icon: '✈️',
      description: 'Se déplacer et visiter',
    },
    'Famille et relations': {
      icon: '👨‍👩‍👧‍👦',
      description: 'Parler de sa famille et de ses proches',
    },
    'Urgences et santé': {
      icon: '🏥',
      description: 'Expressions pour les situations médicales et urgentes',
    },
    'Loisirs et culture': {
      icon: '🎭',
      description: 'Parler de ses activités, passe-temps et culture',
    }
  } as const;

// Configuration spécifique au wolof
export const wolofConfig = {
  code: 'wf' as LanguageCode,
  name: 'Wolof',
  nativeName: 'Wolof',
  audioBasePath: '/audio/wolof/',
  illustrationBasePath: '/illustrations/wolof/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Objets du quotidien',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Configuration spécifique au bambara
export const bambaraConfig = {
  code: 'ba' as LanguageCode,
  name: 'Bambara',
  nativeName: 'Bamanankan',
  audioBasePath: '/audio/bambara/',
  illustrationBasePath: '/illustrations/bambara/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Objets du quotidien',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Configuration spécifique au lingala
export const lingalaConfig = {
  code: 'la' as LanguageCode,
  name: 'Lingala',
  nativeName: 'Lingála',
  audioBasePath: '/audio/lingala/',
  illustrationBasePath: '/illustrations/lingala/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Objects du quotidien',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Configuration spécifique au peul
export const peulConfig = {
  code: 'ff' as LanguageCode,
  name: 'Peul',
  nativeName: 'Fulfulde',
  audioBasePath: '/audio/peul/',
  illustrationBasePath: '/illustrations/peul/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Configuration spécifique au copte
export const copteConfig = {
  code: 'co' as LanguageCode,
  name: 'Copte',
  nativeName: 'Copte',
  audioBasePath: '/audio/copte/',
  illustrationBasePath: '/illustrations/copte/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Configuration spécifique au swahili (nouveau)
export const swahiliConfig = {
  code: 'sw' as LanguageCode,
  name: 'Swahili',
  nativeName: 'Kiswahili',
  audioBasePath: '/audio/swahili/',
  illustrationBasePath: '/illustrations/swahili/',
  defaultCategories: [
    'Salutations et expressions courantes',
    'Nombres',
    'Temps',
    'Animaux',
    'Famille et relations',
    'Nourriture et boissons',
    'Couleurs',
    'Parties du corps',
    'Objets du quotidien',
    'Verbes courants',
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000,
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000,
    maximumInterval: 365 * 24 * 60 * 60 * 1000,
  }
} as const;

// Création des données wolof
export const wolofData: LanguageData = {
  code: wolofConfig.code,
  name: wolofConfig.name,
  nativeName: wolofConfig.nativeName,
  categories: wolofCategories,
  categoryIllustrations: wolofIllustrations,
  sentencesToConstruct: wolofSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  sentencesGap: wolofSentencesgap
};

// Création des données bambara
export const bambaraData: LanguageData = {
  code: bambaraConfig.code,
  name: bambaraConfig.name,
  nativeName: bambaraConfig.nativeName,
  categories: bambaraCategories,
  categoryIllustrations: bambaraIllustrations,
  sentencesToConstruct: bambaraSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  sentencesGap: bambaraSentencesgap
};

// Création des données lingala
export const lingalaData: LanguageData = {
  code: lingalaConfig.code,
  name: lingalaConfig.name,
  nativeName: lingalaConfig.nativeName,
  categories: lingalaCategories,
  categoryIllustrations: lingalaIllustrations,
  sentencesToConstruct: lingalaSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  sentencesGap: lingalaSentencesgap
};

// Création des données peul
export const peulData: LanguageData = {
  code: peulConfig.code,
  name: peulConfig.name,
  nativeName: peulConfig.nativeName,
  categories: peulCategories,
  categoryIllustrations: peulIllustrations,
  sentencesToConstruct: peulSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  // Si peul n'a pas encore de sentencesGap, utilisez un objet vide
  sentencesGap: peulSentencesgap || {}
};

// Création des données copte
export const copteData: LanguageData = {
  code: copteConfig.code,
  name: copteConfig.name,
  nativeName: copteConfig.nativeName,
  categories: copteCategories,
  categoryIllustrations: copteIllustrations,
  sentencesToConstruct: copteSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  sentencesGap: copteSentencesgap
  // Si copte n'a pas encore de sentencesGap, utilisez un objet vide

};

// Création des données swahili (nouveau)
export const swahiliData: LanguageData = {
  code: swahiliConfig.code,
  name: swahiliConfig.name,
  nativeName: swahiliConfig.nativeName,
  categories: swahiliCategories,
  categoryIllustrations: swahiliIllustrations,
  sentencesToConstruct: swahiliSentences,
  sentenceCategories: COMMON_SENTENCE_CATEGORIES,
  sentencesGap: swahiliSentencesgap || {}
};

// Export de l'objet languages
export const languages = {
  wf: wolofData,
  ba: bambaraData,
  la: lingalaData,
  ff: peulData,
  co: copteData,
  sw: swahiliData // Ajout du swahili
} satisfies Record<LanguageCode, LanguageData>;

// Export des constantes de langue
export const LANGUAGE_CODES = {
  WOLOF: 'wf' as const,
  BAMBARA: 'ba' as const,
  LINGALA: 'la' as const,
  PEUL: 'ff' as const,
  COPTE: 'co' as const,
  SWAHILI: 'sw' as const // Ajout du swahili
} as const;

export const DEFAULT_LANGUAGE = LANGUAGE_CODES.WOLOF;

// Export de la fonction getLanguageData avec logging
export const getLanguageData = (languageCode: LanguageCode): LanguageData => {
  console.log('Getting language data for:', languageCode);
  console.log('Available languages:', Object.keys(languages));
  
  const lang = languages[languageCode];
  if (!lang) {
    console.error('Language not found:', languageCode);
    throw new Error(`Language ${languageCode} not supported`);
  }
  
  console.log('Found language data:', {
    name: lang.name,
    categories: Object.keys(lang.categories),
    illustrations: Object.keys(lang.categoryIllustrations),
    sentences: lang.sentencesToConstruct.length
  });
  
  return lang;
};

// Fonctions utilitaires communes
export const getLanguageAudioPath = (languageCode: LanguageCode, filename: string): string => {
  const config = {
    [LANGUAGE_CODES.WOLOF]: wolofConfig,
    [LANGUAGE_CODES.BAMBARA]: bambaraConfig,
    [LANGUAGE_CODES.LINGALA]: lingalaConfig,
    [LANGUAGE_CODES.PEUL]: peulConfig,
    [LANGUAGE_CODES.COPTE]: copteConfig,
    [LANGUAGE_CODES.SWAHILI]: swahiliConfig // Ajout du swahili
  }[languageCode];
  return `${config.audioBasePath}${filename}`;
};

// Fonctions utilitaires pour Wolof
export const getWolofIllustrationPath = (filename: string): string => 
  `${wolofConfig.illustrationBasePath}${filename}`;

export const isValidWolofCategory = (category: string): boolean => 
  Object.keys(wolofCategories).includes(category);

export const getWolofCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidWolofCategory(category)) {
    throw new Error(`Category ${category} does not exist in Wolof`);
  }

  const categoryData = wolofCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Fonctions utilitaires pour Bambara
export const getBambaraIllustrationPath = (filename: string): string => 
  `${bambaraConfig.illustrationBasePath}${filename}`;

export const isValidBambaraCategory = (category: string): boolean => 
  Object.keys(bambaraCategories).includes(category);

export const getBambaraCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidBambaraCategory(category)) {
    throw new Error(`Category ${category} does not exist in Bambara`);
  }

  const categoryData = bambaraCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Fonctions utilitaires pour Lingala
export const getLingalaIllustrationPath = (filename: string): string => 
  `${lingalaConfig.illustrationBasePath}${filename}`;

export const isValidLingalaCategory = (category: string): boolean => 
  Object.keys(lingalaCategories).includes(category);

export const getLingalaCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidLingalaCategory(category)) {
    throw new Error(`Category ${category} does not exist in Lingala`);
  }

  const categoryData = lingalaCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Fonctions utilitaires pour Peul
export const getPeulIllustrationPath = (filename: string): string => 
  `${peulConfig.illustrationBasePath}${filename}`;

export const isValidPeulCategory = (category: string): boolean => 
  Object.keys(peulCategories).includes(category);

export const getPeulCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidPeulCategory(category)) {
    throw new Error(`Category ${category} does not exist in Peul`);
  }

  const categoryData = peulCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Fonctions utilitaires pour Copte
export const getCopteIllustrationPath = (filename: string): string => 
  `${copteConfig.illustrationBasePath}${filename}`;

export const isValidCopteCategory = (category: string): boolean => 
  Object.keys(copteCategories).includes(category);

export const getCopteCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidCopteCategory(category)) {
    throw new Error(`Category ${category} does not exist in Copte`);
  }

  const categoryData = copteCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Fonctions utilitaires pour Swahili (nouveau)
export const getSwahiliIllustrationPath = (filename: string): string => 
  `${swahiliConfig.illustrationBasePath}${filename}`;

export const isValidSwahiliCategory = (category: string): boolean => 
  Object.keys(swahiliCategories).includes(category);

export const getSwahiliCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidSwahiliCategory(category)) {
    throw new Error(`Category ${category} does not exist in Swahili`);
  }

  const categoryData = swahiliCategories[category];
  if (category === 'Grammaire') {
    return null;
  }

  try {
    const wordData = Object.entries(categoryData).reduce((acc, [key, value]) => {
      if ('translation' in value) {
        acc[key] = value as WordData;
      }
      return acc;
    }, {} as Record<string, WordData>);

    return wordData;
  } catch (error) {
    throw new Error(`Error processing category ${category}: ${error}`);
  }
};

// Export des données et utilitaires spécifiques
export {
  wolofCategories,
  wolofIllustrations,
  wolofSentences,
  bambaraCategories,
  bambaraIllustrations,
  bambaraSentences,
  lingalaCategories,
  lingalaIllustrations,
  lingalaSentences,
  peulCategories,
  peulIllustrations,
  peulSentences,
  copteCategories,
  copteIllustrations,
  copteSentences,
  swahiliCategories,
  swahiliIllustrations,
  swahiliSentences // Export des données swahili
};

// Types d'export
export type WolofCategories = keyof typeof wolofCategories;
export type BambaraCategories = keyof typeof bambaraCategories;
export type LingalaCategories = keyof typeof lingalaCategories;
export type PeulCategories = keyof typeof peulCategories;
export type CopteCategories = keyof typeof copteCategories;
export type SwahiliCategories = keyof typeof swahiliCategories; // Nouveau type

// Types des données de langue
export type WolofLanguageData = typeof wolofData;
export type BambaraLanguageData = typeof bambaraData;
export type LingalaLanguageData = typeof lingalaData;
export type PeulLanguageData = typeof peulData;
export type CopteLanguageData = typeof copteData;
export type SwahiliLanguageData = typeof swahiliData; // Nouveau type

export default languages;