// Import statements
import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';
import type { LanguageData, LanguageCode } from '../../../types/types';

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
    'Grammaire',
  ],
  // Paramètres spécifiques pour la révision des mots en peul
  revisionSettings: {
    initialInterval: 24 * 60 * 60 * 1000, // 24 heures en millisecondes
    easeFactor: 2.5,
    minimumInterval: 24 * 60 * 60 * 1000, // 1 jour
    maximumInterval: 365 * 24 * 60 * 60 * 1000, // 1 an
  },
};

// Données principales de la langue peule
export const peul: LanguageData = {
  code: peulConfig.code,
  name: peulConfig.name,
  nativeName: peulConfig.nativeName,
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

// Fonctions utilitaires spécifiques au peul
export const getPeulAudioPath = (filename: string): string =>
  `${peulConfig.audioBasePath}${filename}`;

export const getPeulIllustrationPath = (filename: string): string =>
  `${peulConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidPeulCategory = (category: string): boolean =>
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getPeulCategoryWords = (category: string) => {
  if (!isValidPeulCategory(category)) {
    throw new Error(`Category ${category} does not exist in Peul`);
  }
  return categories[category as keyof typeof categories];
};

// Export des catégories et illustrations pour un accès direct
export { categories, categoryIllustrations, sentencesToConstruct };

// Type pour l'accès aux catégories
export type PeulCategories = keyof typeof categories;

// Export par défaut des données de la langue
export default peul;

// Assurez-vous que l'objet peul est du type LanguageData
export type PeulLanguageData = typeof peul;