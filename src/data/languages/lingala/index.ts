import { categories } from './categories';
import { categoryIllustrations } from './illustrations';
import { sentencesToConstruct } from './sentences';
import sentencesgap from './categories/sentencesgap';

import type { LanguageData, LanguageCode, WordData,RevisionSentenceCollection } from '../../../types/types';


const typedSentencesgap: RevisionSentenceCollection = sentencesgap;

export const lingalaConfig = {
  code: 'la' as LanguageCode,
  name: 'Lingala',
  nativeName: 'Lingala',
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
    'Objets du quotidien',
    'Verbes courants',
   
  ],
 
} as const;



// Données principales de la langue lingala
export const lingala : LanguageData = {
  code: lingalaConfig.code,
  name: lingalaConfig.name,
  nativeName: lingalaConfig.nativeName,
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


export const getLingalaAudioPath = (filename: string): string => 
  `${lingalaConfig.audioBasePath}${filename}`;

export const getLingalaIllustrationPath = (filename: string): string => 
  `${lingalaConfig.illustrationBasePath}${filename}`;

// Fonction pour vérifier si une catégorie existe
export const isValidLingalaCategory = (category: string): boolean => 
  Object.keys(categories).includes(category);

// Fonction pour obtenir les mots d'une catégorie
export const getLingalaCategoryWords = (category: string): Record<string, WordData> | null => {
  if (!isValidLingalaCategory(category)) {
    throw new Error(`Category ${category} does not exist in Lingala`);
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
export type LingalaCategories = keyof typeof categories;
export type LingalaConfig = typeof lingalaConfig;
export type LingalaLanguageData = typeof lingala;

// Export par défaut des données de la langue
export default lingala;