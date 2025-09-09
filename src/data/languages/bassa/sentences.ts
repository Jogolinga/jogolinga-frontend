// src/data/languages/wolof/sentences.ts

interface Sentence {
    original: string;
    french: string;
    words: string[];
    audio?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    category?: string;  // Catégorie thématique optionnelle
    tags?: string[];    // Tags optionnels pour filtrage
  }
  
  export const sentencesToConstruct: Sentence[] = [
    // Salutations et présentations
    {
      original: "Mangi jang wolof",
      french: "J'apprends le wolof",
      words: ["Mangi", "jang", "wolof"],
      difficulty: 'easy',
      category: 'Présentation',
      tags: ['apprentissage', 'présentation']
    },
    {
      original: "Nanga def ?",
      french: "Comment allez-vous ?",
      words: ["Nanga", "def", "?"],
      difficulty: 'easy',
      category: 'Salutations',
      tags: ['salutations', 'quotidien']
    },
    {
      original: "Maa ngi ci jàmm",
      french: "Je vais bien",
      words: ["Maa", "ngi", "ci", "jàmm"],
      difficulty: 'easy',
      category: 'Salutations',
      tags: ['salutations', 'réponses']
    },
  
    // Questions et réponses courantes
    {
      original: "Fo dëkk ?",
      french: "Où habites-tu ?",
      words: ["Fo", "dëkk", "?"],
      difficulty: 'medium',
      category: 'Questions',
      tags: ['lieu', 'habitation']
    },
    {
      original: "Noo tudd ?",
      french: "Comment t'appelles-tu ?",
      words: ["Noo", "tudd", "?"],
      difficulty: 'easy',
      category: 'Questions',
      tags: ['présentation', 'nom']
    },
  
    // Expressions de politesse
    {
      original: "Amul solo",
      french: "De rien / Il n'y a pas de quoi",
      words: ["Amul", "solo"],
      difficulty: 'medium',
      category: 'Politesse',
      tags: ['remerciement', 'politesse']
    },
    {
      original: "Ba beneen yoon",
      french: "À la prochaine fois",
      words: ["Ba", "beneen", "yoon"],
      difficulty: 'medium',
      category: 'Salutations',
      tags: ['au revoir', 'politesse']
    },
  
    // Besoins et états
    {
      original: "Dama xiif",
      french: "J'ai faim",
      words: ["Dama", "xiif"],
      difficulty: 'easy',
      category: 'Besoins',
      tags: ['état', 'nourriture']
    },
    {
      original: "Dama mar",
      french: "J'ai soif",
      words: ["Dama", "mar"],
      difficulty: 'easy',
      category: 'Besoins',
      tags: ['état', 'boisson']
    },
  
    // Phrases du quotidien
    {
      original: "Nañu dem ca màrse ba",
      french: "Allons au marché",
      words: ["Nañu", "dem", "ca", "màrse", "ba"],
      difficulty: 'hard',
      category: 'Quotidien',
      tags: ['déplacement', 'shopping']
    },
    {
      original: "Ñaata la ?",
      french: "Combien ça coûte ?",
      words: ["Ñaata", "la", "?"],
      difficulty: 'medium',
      category: 'Shopping',
      tags: ['prix', 'achat']
    },
  
    // Expressions d'état et de sentiment
    {
      original: "Dama sonn",
      french: "Je suis fatigué(e)",
      words: ["Dama", "sonn"],
      difficulty: 'easy',
      category: 'États',
      tags: ['état', 'fatigue']
    },
  
    // Activités et actions
    {
      original: "Nañu naan attaaya",
      french: "Buvons du thé",
      words: ["Nañu", "naan", "attaaya"],
      difficulty: 'medium',
      category: 'Activités',
      tags: ['boisson', 'social']
    },
    {
      original: "Dama bëgg jàng làkk wi",
      french: "Je veux apprendre la langue",
      words: ["Dama", "bëgg", "jàng", "làkk", "wi"],
      difficulty: 'hard',
      category: 'Apprentissage',
      tags: ['étude', 'langue']
    },
  
    // Voyage et déplacement
    {
      original: "Dama bëgg dem Senegaal",
      french: "Je veux aller au Sénégal",
      words: ["Dama", "bëgg", "dem", "Senegaal"],
      difficulty: 'medium',
      category: 'Voyage',
      tags: ['déplacement', 'pays']
    },
  
    // Questions sur la famille
    {
      original: "Ndax am nga waa kër ?",
      french: "As-tu une famille?",
      words: ["Ndax", "am", "nga", "waa", "kër", "?"],
      difficulty: 'hard',
      category: 'Famille',
      tags: ['famille', 'questions']
    },
  
    // Plage et loisirs
    {
      original: "Nañu dem ci tefes bi",
      french: "Allons à la plage",
      words: ["Nañu", "dem", "ci", "tefes", "bi"],
      difficulty: 'medium',
      category: 'Loisirs',
      tags: ['plage', 'activité']
    },
  
    // Expressions de désir
    {
      original: "Dama bëgg naan ndox",
      french: "Je veux boire de l'eau",
      words: ["Dama", "bëgg", "naan", "ndox"],
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