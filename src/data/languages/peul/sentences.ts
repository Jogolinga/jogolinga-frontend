// src/data/languages/swahili/sentences.ts

interface Sentence {
  original: string;
  french: string;
  words: string[];
  audio?: string;
  category: string;
  tags: string[];
}

export const SENTENCE_CATEGORIES = {
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
} as const;

export const sentencesToConstruct: Sentence[] = [
  // ===== SALUTATIONS =====
  {
    original: "Salamu aleikum",
    french: "La paix soit sur vous (salutation islamique)",
    words: ["Salamu", "aleikum"],
    category: 'Salutations',
    tags: ['salutations', 'traditionnel', 'islamique']
  },
  {
    original: "Wa aleikum salaam",
    french: "Et sur vous la paix (réponse à Salamu aleikum)",
    words: ["Wa", "aleikum", "salaam"],
    category: 'Salutations',
    tags: ['réponse', 'traditionnel', 'islamique']
  },
  {
    original: "Habari za asubuhi",
    french: "Bonjour (nouvelles du matin)",
    words: ["Habari", "za", "asubuhi"],
    category: 'Salutations',
    tags: ['salutations', 'matin']
  },
  {
    original: "Nzuri za asubuhi",
    french: "Bien du matin (réponse au bonjour)",
    words: ["Nzuri", "za", "asubuhi"],
    category: 'Salutations',
    tags: ['salutations', 'matin', 'réponse']
  },
  {
    original: "Habari za mchana", 
    french: "Bon après-midi",
    words: ["Habari", "za", "mchana"],
    category: 'Salutations',
    tags: ['salutations', 'après-midi']
  },
  {
    original: "Habari za jioni",
    french: "Bonsoir",
    words: ["Habari", "za", "jioni"],
    category: 'Salutations',
    tags: ['salutations', 'soir']
  },
  {
    original: "Amani tu",
    french: "Paix seulement",
    words: ["Amani", "tu"],
    category: 'Salutations',
    tags: ['salutations', 'paix']
  },

  // ===== PRÉSENTATION =====
  {
    original: "Jina langu ni",
    french: "Mon nom est / Je m'appelle",
    words: ["Jina", "langu", "ni"],
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "Ninaitwa",
    french: "Je m'appelle",
    words: ["Ninaitwa"],
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "Jina lako nani",
    french: "Comment tu t'appelles ?",
    words: ["Jina", "lako", "nani"],
    category: 'Présentation',
    tags: ['présentation', 'question']
  },
  {
    original: "Nina jina",
    french: "J'ai un nom",
    words: ["Nina", "jina"],
    category: 'Présentation',
    tags: ['nom', 'identité']
  },
  {
    original: "Ninatoka",
    french: "Je viens de",
    words: ["Ninatoka"],
    category: 'Présentation',
    tags: ['origine', 'lieu']
  },
  {
    original: "Unatoka wapi",
    french: "Tu viens d'où ?",
    words: ["Unatoka", "wapi"],
    category: 'Présentation',
    tags: ['origine', 'question']
  },
  {
    original: "Nina miaka kumi",
    french: "J'ai dix ans",
    words: ["Nina", "miaka", "kumi"],
    category: 'Présentation',
    tags: ['âge', 'description']
  },

  // ===== VIE QUOTIDIENNE =====
  {
    original: "Nimechoka",
    french: "Je suis fatigué",
    words: ["Nimechoka"],
    category: 'Vie quotidienne',
    tags: ['état', 'fatigue']
  },
  {
    original: "Ninakula",
    french: "Je mange",
    words: ["Ninakula"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },
  {
    original: "Nina kiu",
    french: "J'ai soif",
    words: ["Nina", "kiu"],
    category: 'Vie quotidienne',
    tags: ['boisson', 'état']
  },
  {
    original: "Saa ngapi",
    french: "Quelle heure est-il ?",
    words: ["Saa", "ngapi"],
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "Ni wakati gani",
    french: "C'est quelle heure ?",
    words: ["Ni", "wakati", "gani"],
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "Ninaenda",
    french: "Je pars / Je vais",
    words: ["Ninaenda"],
    category: 'Vie quotidienne',
    tags: ['déplacement', 'action']
  },
  {
    original: "Ninalala",
    french: "Je dors",
    words: ["Ninalala"],
    category: 'Vie quotidienne',
    tags: ['repos', 'activité']
  },

  // ===== AU MARCHÉ =====
  {
    original: "Bei ngapi",
    french: "Combien ça coûte ?",
    words: ["Bei", "ngapi"],
    category: 'Au marché',
    tags: ['prix', 'question']
  },
  {
    original: "Ni gharama gani",
    french: "C'est quel prix ?",
    words: ["Ni", "gharama", "gani"],
    category: 'Au marché',
    tags: ['prix', 'question']
  },
  {
    original: "Ninataka",
    french: "Je cherche / Je veux",
    words: ["Ninataka"],
    category: 'Au marché',
    tags: ['achat', 'recherche']
  },
  {
    original: "Ni ghali sana",
    french: "C'est trop cher",
    words: ["Ni", "ghali", "sana"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "Nataka kununua",
    french: "Je veux acheter",
    words: ["Nataka", "kununua"],
    category: 'Au marché',
    tags: ['achat', 'intention']
  },
  {
    original: "Hakuna",
    french: "Il n'y en a pas",
    words: ["Hakuna"],
    category: 'Au marché',
    tags: ['disponibilité', 'négation']
  },

  // ===== VOYAGES =====
  {
    original: "Ninaenda",
    french: "Je vais à",
    words: ["Ninaenda"],
    category: 'Voyages',
    tags: ['déplacement', 'destination']
  },
  {
    original: "Teksi iko wapi",
    french: "Où est le taxi ?",
    words: ["Teksi", "iko", "wapi"],
    category: 'Voyages',
    tags: ['transport', 'lieu']
  },
  {
    original: "Dereva yu wapi",
    french: "Où est le chauffeur ?",
    words: ["Dereva", "yu", "wapi"],
    category: 'Voyages',
    tags: ['transport', 'personne']
  },
  {
    original: "Nataka tiketi",
    french: "Je veux un billet",
    words: ["Nataka", "tiketi"],
    category: 'Voyages',
    tags: ['transport', 'document']
  },
  {
    original: "Ni mbali",
    french: "C'est loin",
    words: ["Ni", "mbali"],
    category: 'Voyages',
    tags: ['distance', 'description']
  },

  // ===== FAMILLE ET RELATIONS =====
  {
    original: "Mama",
    french: "Mère",
    words: ["Mama"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Baba",
    french: "Père",
    words: ["Baba"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Mume wangu",
    french: "Mon mari",
    words: ["Mume", "wangu"],
    category: 'Famille et relations',
    tags: ['famille', 'conjoint']
  },
  {
    original: "Mke wangu",
    french: "Ma femme",
    words: ["Mke", "wangu"],
    category: 'Famille et relations',
    tags: ['famille', 'conjoint']
  },
  {
    original: "Nina watoto",
    french: "J'ai des enfants",
    words: ["Nina", "watoto"],
    category: 'Famille et relations',
    tags: ['famille', 'enfant']
  },
  {
    original: "Nyawira wangu",
    french: "Ma grand-mère",
    words: ["Nyawira", "wangu"],
    category: 'Famille et relations',
    tags: ['famille', 'grand-parent']
  }
];

// Fonctions utilitaires
export const getSentencesByCategory = (category: keyof typeof SENTENCE_CATEGORIES) =>
  sentencesToConstruct.filter(sentence => sentence.category === category);

export const getSentencesByTags = (tags: string[]) =>
  sentencesToConstruct.filter(sentence => 
    tags.some(tag => sentence.tags.includes(tag))
  );

export const getCategories = () => SENTENCE_CATEGORIES;

export default sentencesToConstruct;