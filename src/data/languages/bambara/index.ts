import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';

import type { LanguageData, LanguageCode, WordData } from '../../../types/types';

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
    'Grammaire'
  ],
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000, // 1 jour
    maximumInterval: 365 * 24 * 60 * 60 * 1000, // 1 an
  }
} as const;

// Données principales de la langue bambara
export const bambara: LanguageData = {
  code: bambaraConfig.code,
  name: bambaraConfig.name,
  nativeName: bambaraConfig.nativeName,
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

// Fonctions utilitaires spécifiques au bambara
export const getBambaraAudioPath = (filename: string): string => 
  `${bambaraConfig.audioBasePath}${filename}`;

export const getBambaraIllustrationPath = (filename: string): string => 
  `${bambaraConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidBambaraCategory = (category: string): boolean => 
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getBambaraCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidBambaraCategory(category)) {
    throw new Error(`Category ${category} does not exist in Bambara`);
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
export type BambaraCategories = keyof typeof categories;
export type BambaraConfig = typeof bambaraConfig;
export type BambaraLanguageData = typeof bambara;

// Export par défaut des données de la langue
export default bambara;