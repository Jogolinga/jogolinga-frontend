// Import statements
import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';

import sentencesgap from './categories/sentencesgap';

import type { LanguageData, LanguageCode, WordData, RevisionSentenceCollection } from '../../../types/types';

const typedSentencesgap: RevisionSentenceCollection = sentencesgap;

// Configuration spécifique au copte
export const copteConfig = {
  code: 'co' as LanguageCode,
  name: 'Copte',
  nativeName: 'ⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ',
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
    'Grammaire',
  ],
  // Paramètres spécifiques pour la révision des mots en copte
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000, // 1 jour
    maximumInterval: 365 * 24 * 60 * 60 * 1000, // 1 an
  },
};

// Données principales de la langue copte
export const copte: LanguageData = {
  code: copteConfig.code,
  name: copteConfig.name,
  nativeName: copteConfig.nativeName,
  categories,
  sentencesGap: typedSentencesgap,
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

// Fonctions utilitaires spécifiques au copte
export const getCopteAudioPath = (filename: string): string =>
  `${copteConfig.audioBasePath}${filename}`;

export const getCopteIllustrationPath = (filename: string): string =>
  `${copteConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidCopteCategory = (category: string): boolean =>
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getCopteCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidCopteCategory(category)) {
    throw new Error(`Category ${category} does not exist in Copte`);
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
export type CopteCategories = keyof typeof categories;

// Export par défaut des données de la langue
export default copte;

// Assurez-vous que l'objet copte est du type LanguageData
export type CopteLanguageData = typeof copte;