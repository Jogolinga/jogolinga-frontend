import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';

import type { LanguageData, LanguageCode, WordData } from '../../../types/types';

// Configuration spécifique au bassa
export const bassaConfig = {
  code: 'bs' as LanguageCode,
  name: 'Bassa',
  nativeName: 'Ibibio',
  audioBasePath: '/audio/bassa/',
  illustrationBasePath: '/illustrations/bassa/',
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
    'Grammaire'
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000, // 1 jour
    maximumInterval: 365 * 24 * 60 * 60 * 1000, // 1 an
  }
} as const;

// Données principales de la langue bassa
export const bassa: LanguageData = {
  code: bassaConfig.code,
  name: bassaConfig.name,
  nativeName: bassaConfig.nativeName,
  categories,
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

// Fonctions utilitaires spécifiques au bassa
export const getBassaAudioPath = (filename: string): string => 
  `${bassaConfig.audioBasePath}${filename}`;

export const getBassaIllustrationPath = (filename: string): string => 
  `${bassaConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidBassaCategory = (category: string): boolean => 
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getBassaCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidBassaCategory(category)) {
    throw new Error(`Category ${category} does not exist in Bassa`);
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

// Types
export type BassaCategories = keyof typeof categories;
export type BassaConfig = typeof bassaConfig;
export type BassaLanguageData = typeof bassa;

// Export par défaut des données de la langue
export default bassa;