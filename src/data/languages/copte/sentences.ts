// src/data/languages/coptic/sentences.ts

interface Sentence {
  original: string;
  french: string;
  words: string[];
  audio?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

export const sentencesToConstruct: Sentence[] = [
  // Salutations et présentations
  {
      original: "ϯϫⲱ ⲙ̀ⲙⲟⲥ ⲛ̀ϯⲕⲟⲡⲧⲓⲕⲏ",
      french: "J'apprends le copte",
      words: ["ϯϫⲱ", "ⲙ̀ⲙⲟⲥ", "ⲛ̀ϯⲕⲟⲡⲧⲓⲕⲏ"],
      difficulty: 'easy',
      category: 'Présentation',
      tags: ['apprentissage', 'présentation']
  },
  {
      original: "ⲛⲁⲛⲉ ⲧⲟⲟⲩⲓ",
      french: "Bonjour (bon matin)",
      words: ["ⲛⲁⲛⲉ", "ⲧⲟⲟⲩⲓ"],
      difficulty: 'easy',
      category: 'Salutations',
      tags: ['salutations', 'quotidien']
  },
  {
      original: "ϯϣⲗⲏⲗ ⲉϫⲱⲕ",
      french: "Je prie pour toi",
      words: ["ϯϣⲗⲏⲗ", "ⲉϫⲱⲕ"],
      difficulty: 'easy',
      category: 'Salutations',
      tags: ['salutations', 'réponses']
  },

  // Questions et réponses courantes
  {
      original: "ⲉⲕϣⲟⲡ ⲧⲱⲛ?",
      french: "Où habites-tu ?",
      words: ["ⲉⲕϣⲟⲡ", "ⲧⲱⲛ", "?"],
      difficulty: 'medium',
      category: 'Questions',
      tags: ['lieu', 'habitation']
  },
  {
      original: "ⲛⲓⲙ ⲡⲉ ⲡⲉⲕⲣⲁⲛ?",
      french: "Quel est ton nom ?",
      words: ["ⲛⲓⲙ", "ⲡⲉ", "ⲡⲉⲕⲣⲁⲛ", "?"],
      difficulty: 'easy',
      category: 'Questions',
      tags: ['présentation', 'nom']
  },

  // Expressions de politesse
  {
      original: "ϣⲉⲡϩⲙⲟⲧ",
      french: "Merci",
      words: ["ϣⲉⲡϩⲙⲟⲧ"],
      difficulty: 'medium',
      category: 'Politesse',
      tags: ['remerciement', 'politesse']
  },
  {
      original: "ⲙⲟϣⲓ ϧⲉⲛ ⲟⲩϩⲓⲣⲏⲛⲏ",
      french: "Va en paix",
      words: ["ⲙⲟϣⲓ", "ϧⲉⲛ", "ⲟⲩϩⲓⲣⲏⲛⲏ"],
      difficulty: 'medium',
      category: 'Salutations',
      tags: ['au revoir', 'politesse']
  },

  // Besoins et états
  {
      original: "ϯϩⲟⲕⲉⲣ",
      french: "J'ai faim",
      words: ["ϯϩⲟⲕⲉⲣ"],
      difficulty: 'easy',
      category: 'Besoins',
      tags: ['état', 'nourriture']
  },
  {
      original: "ϯⲟⲃⲓ",
      french: "J'ai soif",
      words: ["ϯⲟⲃⲓ"],
      difficulty: 'easy',
      category: 'Besoins',
      tags: ['état', 'boisson']
  },

  // Phrases du quotidien
  {
      original: "ⲙⲁⲣⲟⲛ ⲉϯⲁⲅⲟⲣⲁ",
      french: "Allons au marché",
      words: ["ⲙⲁⲣⲟⲛ", "ⲉϯⲁⲅⲟⲣⲁ"],
      difficulty: 'hard',
      category: 'Quotidien',
      tags: ['déplacement', 'shopping']
  },
  {
      original: "ⲟⲩⲏⲣ ⲡⲉ?",
      french: "Combien ça coûte ?",
      words: ["ⲟⲩⲏⲣ", "ⲡⲉ", "?"],
      difficulty: 'medium',
      category: 'Shopping',
      tags: ['prix', 'achat']
  },

  // Expressions d'état et de sentiment
  {
      original: "ϯϧⲓⲥⲓ",
      french: "Je suis fatigué(e)",
      words: ["ϯϧⲓⲥⲓ"],
      difficulty: 'easy',
      category: 'États',
      tags: ['état', 'fatigue']
  },

  // Activités et actions religieuses
  {
      original: "ⲙⲁⲣⲉⲛϣⲗⲏⲗ",
      french: "Prions",
      words: ["ⲙⲁⲣⲉⲛ", "ϣⲗⲏⲗ"],
      difficulty: 'medium',
      category: 'Activités',
      tags: ['religion', 'social']
  },
  {
      original: "ϯⲟⲩⲱϣ ⲉⲥⲱⲧⲉⲙ ⲉⲡⲓⲗⲟⲅⲟⲥ",
      french: "Je veux entendre la parole",
      words: ["ϯⲟⲩⲱϣ", "ⲉⲥⲱⲧⲉⲙ", "ⲉⲡⲓⲗⲟⲅⲟⲥ"],
      difficulty: 'hard',
      category: 'Apprentissage',
      tags: ['religion', 'étude']
  },

  // Église et spiritualité
  {
      original: "ϯⲟⲩⲱϣ ⲉϣⲉ ⲉϯⲉⲕⲕⲗⲏⲥⲓⲁ",
      french: "Je veux aller à l'église",
      words: ["ϯⲟⲩⲱϣ", "ⲉϣⲉ", "ⲉϯⲉⲕⲕⲗⲏⲥⲓⲁ"],
      difficulty: 'medium',
      category: 'Religion',
      tags: ['déplacement', 'église']
  },

  // Questions sur la famille
  {
      original: "ⲟⲩⲟⲛⲧⲉⲕ ⲥⲩⲅⲅⲉⲛⲏⲥ?",
      french: "As-tu une famille?",
      words: ["ⲟⲩⲟⲛⲧⲉⲕ", "ⲥⲩⲅⲅⲉⲛⲏⲥ", "?"],
      difficulty: 'hard',
      category: 'Famille',
      tags: ['famille', 'questions']
  },

  // Monastère et vie monastique
  {
      original: "ⲙⲁⲣⲟⲛ ⲉⲡⲓⲙⲟⲛⲁⲥⲧⲏⲣⲓⲟⲛ",
      french: "Allons au monastère",
      words: ["ⲙⲁⲣⲟⲛ", "ⲉⲡⲓⲙⲟⲛⲁⲥⲧⲏⲣⲓⲟⲛ"],
      difficulty: 'medium',
      category: 'Religion',
      tags: ['monastère', 'activité']
  },

  // Expressions de désir
  {
      original: "ϯⲟⲩⲱϣ ⲉⲥⲱ ⲙ̀ⲙⲟⲩ",
      french: "Je veux boire de l'eau",
      words: ["ϯⲟⲩⲱϣ", "ⲉⲥⲱ", "ⲙ̀ⲙⲟⲩ"],
      difficulty: 'easy',
      category: 'Besoins',
      tags: ['boisson', 'désir']
  }
];

// Fonctions utilitaires pour les phrases
export const getSentencesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard') =>
  sentencesToConstruct.filter(sentence => sentence.difficulty === difficulty);

export const getSentencesByCategory = (category: string) =>
  sentencesToConstruct.filter(sentence => sentence.category === category);

export const getSentencesByTags = (tags: string[]) =>
  sentencesToConstruct.filter(sentence => 
      tags.some(tag => sentence.tags?.includes(tag))
  );

// Configuration pour la progression de l'apprentissage
export const sentenceLearningConfig = {
  minSentencesPerLesson: 3,
  maxSentencesPerLesson: 5,
  difficultyProgression: {
      beginner: ['easy'],
      intermediate: ['easy', 'medium'],
      advanced: ['easy', 'medium', 'hard']
  },
  reviewInterval: {
      easy: 7 * 24 * 60 * 60 * 1000, // 7 jours
      medium: 3 * 24 * 60 * 60 * 1000, // 3 jours
      hard: 24 * 60 * 60 * 1000 // 1 jour
  }
};

export {}

export default sentencesToConstruct;