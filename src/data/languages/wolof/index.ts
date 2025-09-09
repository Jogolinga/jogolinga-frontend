// Import statements
import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';
import sentencesgap from './categories/sentencesgap';
import type { LanguageData, LanguageCode, WordData,RevisionSentenceCollection } from '../../../types/types';


const typedSentencesgap: RevisionSentenceCollection = sentencesgap;

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
  // Paramètres spécifiques pour la révision des mots en wolof
  
};

// Données principales de la langue wolof
export const wolof: LanguageData = {
  code: wolofConfig.code,
  name: wolofConfig.name,
  nativeName: wolofConfig.nativeName,
  categories,
  sentencesGap: sentencesgap,
  categoryIllustrations,
  sentencesToConstruct,
  sentenceCategories: {
    'Salutations': {
      icon: '👋',
      description: 'Premiers contacts et formules de politesse'
    },
    'Présentation': {
      icon: '🤝',
      description: 'Se présenter et faire connaissance'
    },
    'Vie quotidienne': {
      icon: '🌞',
      description: 'Expressions du quotidien'
    },
    'Au marché': {
      icon: '🛍️',
      description: 'Faire ses courses et négocier'
    },
    'Voyages': {
      icon: '✈️',
      description: 'Se déplacer et visiter'
    },
    'Famille et relations': {
      icon: '👨‍👩‍👧‍👦',
      description: 'Parler de sa famille et de ses proches'
    }
  },
};

// Fonctions utilitaires spécifiques au wolof
export const getWolofAudioPath = (filename: string): string =>
  `${wolofConfig.audioBasePath}${filename}`;

export const getWolofIllustrationPath = (filename: string): string =>
  `${wolofConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidWolofCategory = (category: string): boolean =>
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getWolofCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidWolofCategory(category)) {
    throw new Error(`Category ${category} does not exist in Wolof`);
  }

  const categoryData = categories[category];

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
    console.error(`Error processing category ${category}:`, error);
    throw error;
  }
};

// Export des catégories et illustrations pour un accès direct
export { categories, categoryIllustrations, sentencesToConstruct };

// Type pour l'accès aux catégories
export type WolofCategories = keyof typeof categories;

// Export par défaut des données de la langue
export default wolof;

// Assurez-vous que l'objet wolof est du type LanguageData
export type WolofLanguageData = typeof wolof;
