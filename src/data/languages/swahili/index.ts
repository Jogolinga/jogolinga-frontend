import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';

import type { LanguageData, LanguageCode, WordData } from '../../../types/types';

// Configuration spécifique au swahili
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

// Données principales de la langue swahili
export const swahili: LanguageData = {
  code: swahiliConfig.code,
  name: swahiliConfig.name,
  nativeName: swahiliConfig.nativeName,
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

// Fonctions utilitaires spécifiques au swahili
export const getSwahiliAudioPath = (filename: string): string => 
  `${swahiliConfig.audioBasePath}${filename}`;

export const getSwahiliIllustrationPath = (filename: string): string => 
  `${swahiliConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidSwahiliCategory = (category: string): boolean => 
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getSwahiliCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidSwahiliCategory(category)) {
    throw new Error(`Category ${category} does not exist in Swahili`);
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
export type SwahiliCategories = keyof typeof categories;
export type SwahiliConfig = typeof swahiliConfig;
export type SwahiliLanguageData = typeof swahili;

// Export par défaut des données de la langue
export default swahili;