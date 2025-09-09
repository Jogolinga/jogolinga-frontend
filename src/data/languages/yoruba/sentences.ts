// src/data/languages/yoruba/sentences.ts

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
  'Urgences et santé': {
    icon: '🚨',
    description: 'Expressions pour les situations médicales et urgentes',
  },
  'Loisirs et culture': {
    icon: '🎭',
    description: 'Parler de ses activités, passe-temps et culture',
  },
} as const;

export const sentencesToConstruct: Sentence[] = [
  // ===== SALUTATIONS =====
  {
    original: "Ẹ káàárọ̀",
    french: "Bonjour (matin)",
    words: ["Ẹ", "káàárọ̀"],
    category: 'Salutations',
    tags: ['salutations', 'matin']
  },
  {
    original: "Ẹ káàsán",
    french: "Bon après-midi",
    words: ["Ẹ", "káàsán"],
    category: 'Salutations',
    tags: ['salutations', 'après-midi']
  },
  {
    original: "Ẹ káalẹ́",
    french: "Bonsoir",
    words: ["Ẹ", "káalẹ́"],
    category: 'Salutations',
    tags: ['salutations', 'soir']
  },
  {
    original: "Báwo ni?",
    french: "Comment ça va ?",
    words: ["Báwo", "ni"],
    category: 'Salutations',
    tags: ['salutations', 'question']
  },
  {
    original: "Mo wà dáadáa",
    french: "Je vais bien",
    words: ["Mo", "wà", "dáadáa"],
    category: 'Salutations',
    tags: ['réponse', 'état']
  },
  {
    original: "Àlàáfíà ni",
    french: "C'est la paix (tout va bien)",
    words: ["Àlàáfíà", "ni"],
    category: 'Salutations',
    tags: ['salutations', 'réponse']
  },
  {
    original: "Ó dàbọ̀",
    french: "Au revoir",
    words: ["Ó", "dàbọ̀"],
    category: 'Salutations',
    tags: ['salutations', 'au revoir']
  },

  // ===== PRÉSENTATION =====
  {
    original: "Orúkọ mi ni …",
    french: "Mon nom est / Je m'appelle …",
    words: ["Orúkọ", "mi", "ni"],
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "A ń pe mi ní …",
    french: "On m'appelle …",
    words: ["A", "ń", "pe", "mi", "ní"],
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "Kí ni orúkọ rẹ?",
    french: "Comment tu t'appelles ?",
    words: ["Kí", "ni", "orúkọ", "rẹ"],
    category: 'Présentation',
    tags: ['présentation', 'question']
  },
  {
    original: "Mo wá láti …",
    french: "Je viens de …",
    words: ["Mo", "wá", "láti"],
    category: 'Présentation',
    tags: ['origine', 'lieu']
  },
  {
    original: "Níbo ni o ti wá?",
    french: "Tu viens d'où ?",
    words: ["Níbo", "ni", "o", "ti", "wá"],
    category: 'Présentation',
    tags: ['origine', 'question']
  },
  {
    original: "Mo jẹ́ ọmọ ọdún mẹ́wàá",
    french: "J'ai dix ans",
    words: ["Mo", "jẹ́", "ọmọ", "ọdún", "mẹ́wàá"],
    category: 'Présentation',
    tags: ['âge', 'description']
  },
  {
    original: "Nibo ni o ń gbé?",
    french: "Où habites-tu ?",
    words: ["Nibo", "ni", "o", "ń", "gbé"],
    category: 'Présentation',
    tags: ['lieu', 'question']
  },

  // ===== VIE QUOTIDIENNE =====
  {
    original: "Mo ti rẹ̀",
    french: "Je suis fatigué",
    words: ["Mo", "ti", "rẹ̀"],
    category: 'Vie quotidienne',
    tags: ['état', 'fatigue']
  },
  {
    original: "Mo ń jẹun",
    french: "Je mange",
    words: ["Mo", "ń", "jẹun"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },
  {
    original: "Ọ̀fun ń gbẹ mí",
    french: "J'ai soif (la gorge est sèche)",
    words: ["Ọ̀fun", "ń", "gbẹ", "mí"],
    category: 'Vie quotidienne',
    tags: ['boisson', 'état']
  },
  {
    original: "Kíni agogo sọ?",
    french: "Quelle heure est-il ?",
    words: ["Kíni", "agogo", "sọ"],
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "Mo ń lọ",
    french: "Je pars / J'y vais",
    words: ["Mo", "ń", "lọ"],
    category: 'Vie quotidienne',
    tags: ['déplacement', 'action']
  },
  {
    original: "Mo ń sùn",
    french: "Je dors",
    words: ["Mo", "ń", "sùn"],
    category: 'Vie quotidienne',
    tags: ['repos', 'activité']
  },
  {
    original: "Mo fẹ́ ṣe iṣẹ́ ile",
    french: "Je fais les tâches ménagères",
    words: ["Mo", "fẹ́", "ṣe", "iṣẹ́", "ile"],
    category: 'Vie quotidienne',
    tags: ['maison', 'activité']
  },

  // ===== AU MARCHÉ =====
  {
    original: "Ẹ̀ló ni?",
    french: "Combien ça coûte ?",
    words: ["Ẹ̀ló", "ni"],
    category: 'Au marché',
    tags: ['prix', 'question']
  },
  {
    original: "Mo ń wá …",
    french: "Je cherche …",
    words: ["Mo", "ń", "wá"],
    category: 'Au marché',
    tags: ['achat', 'recherche']
  },
  {
    original: "Ó gbowólórí jù",
    french: "C'est trop cher",
    words: ["Ó", "gbowólórí", "jù"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "Mo lè san díẹ̀",
    french: "Je peux payer un peu",
    words: ["Mo", "lè", "san", "díẹ̀"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "Mo fẹ́ ra …",
    french: "Je veux acheter …",
    words: ["Mo", "fẹ́", "ra"],
    category: 'Au marché',
    tags: ['achat', 'intention']
  },
  {
    original: "Kò sí",
    french: "Il n'y en a pas",
    words: ["Kò", "sí"],
    category: 'Au marché',
    tags: ['disponibilité', 'négation']
  },

  // ===== VOYAGES =====
  {
    original: "Mo ń lọ sí …",
    french: "Je vais à …",
    words: ["Mo", "ń", "lọ", "sí"],
    category: 'Voyages',
    tags: ['déplacement', 'destination']
  },
  {
    original: "Tákísì wà níbo?",
    french: "Où est le taxi ?",
    words: ["Tákísì", "wà", "níbo"],
    category: 'Voyages',
    tags: ['transport', 'lieu']
  },
  {
    original: "Awakọ̀ wà níbo?",
    french: "Où est le chauffeur ?",
    words: ["Awakọ̀", "wà", "níbo"],
    category: 'Voyages',
    tags: ['transport', 'personne']
  },
  {
    original: "Mo fẹ́ ra tikẹ́ẹ̀tì",
    french: "Je veux un billet",
    words: ["Mo", "fẹ́", "ra", "tikẹ́ẹ̀tì"],
    category: 'Voyages',
    tags: ['transport', 'document']
  },
  {
    original: "Ó jìnà",
    french: "C'est loin",
    words: ["Ó", "jìnà"],
    category: 'Voyages',
    tags: ['distance', 'description']
  },

  // ===== FAMILLE ET RELATIONS =====
  {
    original: "Ìyá mi",
    french: "Ma mère",
    words: ["Ìyá", "mi"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Bàbá mi",
    french: "Mon père",
    words: ["Bàbá", "mi"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Ọkọ mi",
    french: "Mon mari",
    words: ["Ọkọ", "mi"],
    category: 'Famille et relations',
    tags: ['famille', 'conjoint']
  },
  {
    original: "Aya mi",
    french: "Ma femme",
    words: ["Aya", "mi"],
    category: 'Famille et relations',
    tags: ['famille', 'conjoint']
  },
  {
    original: "Mo ní àwọn ọmọ",
    french: "J'ai des enfants",
    words: ["Mo", "ní", "àwọn", "ọmọ"],
    category: 'Famille et relations',
    tags: ['famille', 'enfant']
  },
  {
    original: "Ìyá ńlá mi",
    french: "Ma grand-mère",
    words: ["Ìyá", "ńlá", "mi"],
    category: 'Famille et relations',
    tags: ['famille', 'grand-parent']
  },

  // ===== URGENCES ET SANTÉ =====
  {
    original: "Ẹ gbà mí!",
    french: "Au secours ! / À l'aide !",
    words: ["Ẹ", "gbà", "mí"],
    category: 'Urgences et santé',
    tags: ['urgence', 'aide']
  },
  {
    original: "Ara mi ò yá",
    french: "Je ne me sens pas bien / Je suis malade",
    words: ["Ara", "mi", "ò", "yá"],
    category: 'Urgences et santé',
    tags: ['santé', 'état']
  },
  {
    original: "Mo nílò dókítà",
    french: "J'ai besoin d'un docteur",
    words: ["Mo", "nílò", "dókítà"],
    category: 'Urgences et santé',
    tags: ['santé', 'médecin']
  },
  {
    original: "Ilé ìwòsàn wà níbo?",
    french: "Où est l'hôpital ?",
    words: ["Ilé", "ìwòsàn", "wà", "níbo"],
    category: 'Urgences et santé',
    tags: ['santé', 'lieu', 'urgence']
  },
  {
    original: "Orí mi ń dun",
    french: "J'ai mal à la tête",
    words: ["Orí", "mi", "ń", "dun"],
    category: 'Urgences et santé',
    tags: ['santé', 'douleur', 'tête']
  },
  {
    original: "Mo nílò òògùn",
    french: "J'ai besoin de médicaments",
    words: ["Mo", "nílò", "òògùn"],
    category: 'Urgences et santé',
    tags: ['santé', 'médicament']
  },

  // ===== LOISIRS ET CULTURE =====
  {
    original: "Mo fẹ́ràn orin",
    french: "J'aime la musique",
    words: ["Mo", "fẹ́ràn", "orin"],
    category: 'Loisirs et culture',
    tags: ['loisirs', 'musique', 'goûts']
  },
  {
    original: "Mo ń ṣeré bọ́ọ̀lù",
    french: "Je joue au football",
    words: ["Mo", "ń", "ṣeré", "bọ́ọ̀lù"],
    category: 'Loisirs et culture',
    tags: ['sport', 'football', 'jeu']
  },
  {
    original: "Ẹ jẹ́ ká kọrin pọ̀",
    french: "Chantons ensemble",
    words: ["Ẹ", "jẹ́", "ká", "kọrin", "pọ̀"],
    category: 'Loisirs et culture',
    tags: ['musique', 'social', 'chant']
  },
  {
    original: "Mo ń ka ìwé",
    french: "Je lis un livre",
    words: ["Mo", "ń", "ka", "ìwé"],
    category: 'Loisirs et culture',
    tags: ['lecture', 'livre', 'culture']
  },
  {
    original: "Ẹ jẹ́ ká lọ sí sinimá",
    french: "Allons au cinéma",
    words: ["Ẹ", "jẹ́", "ká", "lọ", "sí", "sinimá"],
    category: 'Loisirs et culture',
    tags: ['cinéma', 'sortie', 'culture']
  },
  {
    original: "Mo fẹ́ràn eré",
    french: "J'aime les jeux",
    words: ["Mo", "fẹ́ràn", "eré"],
    category: 'Loisirs et culture',
    tags: ['jeu', 'loisirs', 'plaisir']
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
