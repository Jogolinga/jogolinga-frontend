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
  // Salutations
  {
    original: "I ni ce",
    french: "Bonjour",
    words: ["I", "ni", "ce"],
    category: 'Salutations',
    tags: ['salutations', 'quotidien']
  },
  {
    original: "N bɛ kɛnɛ",
    french: "Je vais bien",
    words: ["N", "bɛ", "kɛnɛ"],
    category: 'Salutations',
    tags: ['salutations', 'réponse']
  },
  {
    original: "I ni sogoma",
    french: "Bonjour (matin)",
    words: ["I", "ni", "sogoma"],
    category: 'Salutations',
    tags: ['salutations', 'matin']
  },
  {
    original: "I ni tile",
    french: "Bonjour (midi)",
    words: ["I", "ni", "tile"],
    category: 'Salutations',
    tags: ['salutations', 'midi']
  },
  {
    original: "I ni su",
    french: "Bonsoir",
    words: ["I", "ni", "su"],
    category: 'Salutations',
    tags: ['salutations', 'soir']
  },
  {
    original: "A ka san",
    french: "Bonne journée",
    words: ["A", "ka", "san"],
    category: 'Salutations',
    tags: ['au revoir', 'politesse']
  },
  {
    original: "I ka kɛnɛ wa?",
    french: "Comment vas-tu ?",
    words: ["I", "ka", "kɛnɛ", "wa", "?"],
    category: 'Salutations',
    tags: ['salutations', 'question']
  },
  {
    original: "An kɛlɛma",
    french: "Au revoir",
    words: ["An", "kɛlɛma"],
    category: 'Salutations',
    tags: ['au revoir', 'politesse']
  },
  {
    original: "I tɔgɔ ye mun ye?",
    french: "Quel est ton nom?",
    words: ["I", "tɔgɔ", "ye", "mun", "ye", "?"],
    category: 'Présentation',
    tags: ['présentation', 'question']
  },
  {
    original: "N tɔgɔ ye Ali ye",
    french: "Je m'appelle Ali",
    words: ["N", "tɔgɔ", "ye", "Ali", "ye"],
    category: 'Présentation',
    tags: ['présentation', 'réponse']
  },
  {
    original: "I bɛ bɔ min?",
    french: "D'où viens-tu?",
    words: ["I", "bɛ", "bɔ", "min", "?"],
    category: 'Présentation',
    tags: ['présentation', 'origine', 'question']
  },
  {
    original: "N bɛ bɔ Bamako",
    french: "Je viens de Bamako",
    words: ["N", "bɛ", "bɔ", "Bamako"],
    category: 'Présentation',
    tags: ['présentation', 'origine', 'réponse']
  },
  {
    original: "I si taa san mun ye?",
    french: "Quel âge as-tu?",
    words: ["I", "si", "taa", "san", "mun", "ye", "?"],
    category: 'Présentation',
    tags: ['présentation', 'âge', 'question']
  },
  {
    original: "N si taa san mugan ye",
    french: "J'ai vingt ans",
    words: ["N", "si", "taa", "san", "mugan", "ye"],
    category: 'Présentation',
    tags: ['présentation', 'âge', 'réponse']
  },

  // Présentation (ajouts)
  {
    original: "N ye [nom] ye",
    french: "Je m'appelle [nom]",
    words: ["N", "ye", "nom", "ye"],
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "I ye mini?",
    french: "Comment t'appelles-tu ?",
    words: ["I", "ye", "mini", "?"],
    category: 'Présentation',
    tags: ['présentation', 'question']
  },
  {
    original: "I bɛ bɔ dugukolo min na?",
    french: "D'où viens-tu ?",
    words: ["I", "bɛ", "bɔ", "dugukolo", "min", "na", "?"],
    category: 'Présentation',
    tags: ['origine', 'question']
  },

  // Loisirs et Culture

 
   {
    original: "A bɛ ka sinuwakan kalan",
    french: "Il apprend le chinois",
    words: ["A", "bɛ", "ka", "sinuwakan", "kalan"],
    category: 'Loisirs et culture',
    tags: ['origine', 'ville']
  },
   {
    original: "N bɛna o filimu laje",
    french: "Je vais suivre ce film",
    words: ["N", "bɛna", "o", "filimu", "lajɛ"],
    category: 'Loisirs et culture',
    tags: ['origine', 'ville']
  },
 
   {
    original: "I y'o flilimu in lajɛ wa ?",
    french: "As-tu suivi ce film ?",
    words: ["I", "y'", "o", "filimu", "in","laje","wa","?"],
    category: 'Loisirs et culture',
    tags: ['origine', 'ville']
  },
   {
    original: "Nin dɔnkili in ka di ne ye",
    french: "J'aime cette musique",
    words: ["Nin", "dɔnkili", "in", "ka", "di","ne","ye"],
    category: 'Loisirs et culture',
    tags: ['origine', 'ville']
  },
   {
    original: "Jɔn y'i dege nin kan in na",
    french: "Qui t'a appris cette langue",
    words: ["Jon", "y'i", "dege", "nin", "kan","in","na"],
    category: 'Loisirs et culture',
    tags: ['origine', 'ville']
  },

    {
    original: "Ka dɛmɛ!",
    french: "À l’aide !",
    words: ["Ka", "dɛmɛ", "!"],
    category: 'Urgences santé',
    tags: ['urgence', 'aide']
  },
  {
    original: "Dokotɔri bɛ se ka na?",
    french: "Est-ce qu’un médecin peut venir ?",
    words: ["Dokotɔri", "bɛ", "se", "ka", "na", "?"],
    category: 'Urgences santé',
    tags: ['santé', 'médecin']
  },
  {
    original: "N bɛ bɔli fɛ",
    french: "J’ai mal à la poitrine",
    words: ["N", "bɛ", "bɔli", "fɛ"],
    category: 'Urgences santé',
    tags: ['santé', 'douleur']
  },
  {
    original: "N bɛ tugu fɛ",
    french: "J’ai mal à la tête",
    words: ["N", "bɛ", "tugu", "fɛ"],
    category: 'Urgences santé',
    tags: ['santé', 'douleur']
  },
  {
    original: "N bɛ fɛ ka taa hɔpitɔri la",
    french: "Je dois aller à l’hôpital",
    words: ["N", "bɛ", "fɛ", "ka", "taa", "hɔpitɔri", "la"],
    category: 'Urgences santé',
    tags: ['santé', 'hôpital']
  },
  {
    original: "Donɔ ye ban na",
    french: "Quelqu’un est tombé malade",
    words: ["Donɔ", "ye", "ban", "na"],
    category: 'Urgences santé',
    tags: ['urgence', 'maladie']
  },
  {
    original: "N bɛ sɛbɛn ka dɛmɛ",
    french: "J’ai besoin d’aide",
    words: ["N", "bɛ", "sɛbɛn", "ka", "dɛmɛ"],
    category: 'Urgences santé',
    tags: ['urgence', 'aide']
  },

  

  // Vie quotidienne
  {
    original: "N bɛ ka dumuni dun",
    french: "Je vais manger",
    words: ["N", "bɛ", "ka", "dumuni", "dun"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },
   {
    original: "Jɔn bɛ dolo fɛ",
    french: "Qui veut de la bière",
    words: ["Jɔn", "bɛ", "dolo", "fɛ"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },

  {
    original: "Nodolo de ka di ne ye",
    french: "Moi je prefère la bierre de mil",
    words: ["Nodolo", "de", "ka", "di","ne","ye"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },

   {
    original: "I bɛ fɛ ka mun mi ?",
    french: "Que veux tu boire ?",
    words: ["I", "bɛ", "fɛ", "ka","mun","mi","?"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },
  {
    original: "An bɛna dumuni kɛ sisan",
    french: "On va manger maintenant",
    words: ["An", "bɛna", "dumuni", "kɛ","sisan",],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'activité']
  },
  {
    original: "N bɛ kɛnɛ",
    french: "Je vais bien",
    words: ["N", "bɛ", "kɛnɛ"],
    category: 'Vie quotidienne',
    tags: ['état', 'bien-être']
  },
  {
    original: "N bɛ juguman",
    french: "Je suis fatigué",
    words: ["N", "bɛ", "juguman"],
    category: 'Vie quotidienne',
    tags: ['état', 'fatigue']
  },
  {
    original: "Tile min bɛ?",
    french: "Quel jour sommes-nous ?",
    words: ["Tile", "min", "bɛ", "?"],
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "N bɛ ka sunɔgɔ",
    french: "Je vais dormir",
    words: ["N", "bɛ", "ka", "sunɔgɔ"],
    category: 'Vie quotidienne',
    tags: ['activité', 'repos']
  },
  {
    original: "N kɔnɔ bɛ",
    french: "J'ai faim",
    words: ["N", "kɔnɔ", "bɛ"],
    category: 'Vie quotidienne',
    tags: ['état', 'nourriture']
  },
  {
    original: "Waati min bɛ?",
    french: "Quelle heure est-il ?",
    words: ["Waati", "min", "bɛ", "?"],
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "N bɛ ka baara kɛ",
    french: "Je travaille",
    words: ["N", "bɛ", "ka", "baara", "kɛ"],
    category: 'Vie quotidienne',
    tags: ['activité', 'travail']
  },
  {
    original: "N bɛ sɛnɛ",
    french: "J'ai soif",
    words: ["N", "bɛ", "sɛnɛ"],
    category: 'Vie quotidienne',
    tags: ['état', 'besoin']
  },
  {
    original: "N bɛ ka taa so",
    french: "Je rentre à la maison",
    words: ["N", "bɛ", "ka", "taa", "so"],
    category: 'Vie quotidienne',
    tags: ['déplacement', 'maison']
  },

  // Au marché
  {
    original: "Nin sɔngɔ ye joli ye?",
    french: "Combien ça coûte ?",
    words: ["Nin", "sɔngɔ", "ye", "joli", "ye", "?"],
    category: 'Au marché',
    tags: ['prix', 'achat']
  },
  {
    original: "N bɛ ka san",
    french: "Je veux acheter",
    words: ["N", "bɛ", "ka", "san"],
    category: 'Au marché',
    tags: ['achat', 'intention']
  },
  {
    original: "A sɔngɔ ka dɔgɔ",
    french: "C'est bon marché",
    words: ["A", "sɔngɔ", "ka", "dɔgɔ"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "A sɔngɔ ka gɛlɛn kosɛbɛ",
    french: "C'est très cher",
    words: ["A", "sɔngɔ", "ka", "gɛlɛn", "kosɛbɛ"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "I bɛ se ka sɔngɔ dɔgɔya?",
    french: "Peux-tu baisser le prix ?",
    words: ["I", "bɛ", "se", "ka", "sɔngɔ", "dɔgɔya", "?"],
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "N bɛ ɲini ka fɛn dɔ san",
    french: "Je cherche à acheter quelque chose",
    words: ["N", "bɛ", "ɲini", "ka", "fɛn", "dɔ", "san"],
    category: 'Au marché',
    tags: ['achat', 'recherche']
  },
  {
    original: "Nin ye mun ye?",
    french: "Qu'est-ce que c'est que ça ?",
    words: ["Nin", "ye", "mun", "ye", "?"],
    category: 'Au marché',
    tags: ['question', 'information']
  },
  {
    original: "N tɛ a fɛ",
    french: "Je n'en veux pas",
    words: ["N", "tɛ", "a", "fɛ"],
    category: 'Au marché',
    tags: ['refus', 'négociation']
  },

  // Voyages
  {
    original: "N bɛ ka taa",
    french: "Je vais partir",
    words: ["N", "bɛ", "ka", "taa"],
    category: 'Voyages',
    tags: ['déplacement', 'voyage']
  },
  {
    original: "Waati min bɛ?",
    french: "Quelle heure est-il ?",
    words: ["Waati", "min", "bɛ", "?"],
    category: 'Voyages',
    tags: ['temps', 'question']
  },
  {
    original: "N mago bɛ i dɛmɛ la",
    french: "J'ai besoin de ton aide",
    words: ["N", "mago", "bɛ", "i", "dɛmɛ", "la"],
    category: 'Voyages',
    tags: ['aide', 'assistance']
  },
  {
    original: "Nin sira bɛ taa min?",
    french: "Où va cette route ?",
    words: ["Nin", "sira", "bɛ", "taa", "min", "?"],
    category: 'Voyages',
    tags: ['direction', 'question']
  },
  {
    original: "N bɛ ɲini [yɔrɔ]",
    french: "Je cherche [lieu]",
    words: ["N", "bɛ", "ɲini", "yɔrɔ"],
    category: 'Voyages',
    tags: ['recherche', 'lieu']
  },
  {
    original: "A janya kosɛbɛ",
    french: "C'est très loin",
    words: ["A", "janya", "kosɛbɛ"],
    category: 'Voyages',
    tags: ['distance', 'information']
  },

  // Famille et relations
  {
    original: "Nin ye mun ye?",
    french: "Qui est-ce ?",
    words: ["Nin", "ye", "mun", "ye", "?"],
    category: 'Famille et relations',
    tags: ['famille', 'question']
  },
  {
    original: "Nin den in hakili ka di kalanso la ",
    french: "Cet enfant est doué à l'école",
    words: ["Nin", "den", "in", "hakili", "ka","di","kalanso","la"],
    category: 'Famille et relations',
    tags: ['famille', 'question']
  },
   {
    original: "Nin den in hakili ka di kosɛbɛ ",
    french: "Cet enfant est très intelligent",
    words: ["Nin", "den", "in", "hakili", "ka","di","kosebe",],
    category: 'Famille et relations',
    tags: ['famille', 'question']
  },
  {
    original: "N den ye nin ye",
    french: "C'est mon enfant",
    words: ["N", "den", "ye", "nin", "ye"],
    category: 'Famille et relations',
    tags: ['famille', 'enfant']
  },
  {
    original: "N fa ye nin ye",
    french: "C'est mon père",
    words: ["N", "fa", "ye", "nin", "ye"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "N na ye nin ye",
    french: "C'est ma mère",
    words: ["N", "na", "ye", "nin", "ye"],
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "N bɛɛre ye nin ye",
    french: "C'est ma sœur",
    words: ["N", "bɛɛre", "ye", "nin", "ye"],
    category: 'Famille et relations',
    tags: ['famille', 'fratrie']
  },
  {
    original: "N kɔrɔ ye nin ye",
    french: "C'est mon frère",
    words: ["N", "kɔrɔ", "ye", "nin", "ye"],
    category: 'Famille et relations',
    tags: ['famille', 'fratrie']
  },
  {
    original: "N furow bɛ joli ye?",
    french: "Combien d'épouses as-tu ?",
    words: ["N", "furow", "bɛ", "joli", "ye", "?"],
    category: 'Famille et relations',
    tags: ['famille', 'mariage', 'question']
  },
  {
    original: "N denw bɛ joli ye?",
    french: "Combien d'enfants as-tu ?",
    words: ["N", "denw", "bɛ", "joli", "ye", "?"],
    category: 'Famille et relations',
    tags: ['famille', 'enfants', 'question']
  },
  // Phrases supplémentaires à ajouter au tableau sentencesToConstruct

// Première série de phrases
{
  original: "N bena safunɛ san",
  french: "Je vais acheter du savon",
  words: ["N", "bena", "safunɛ", "san"],
  category: 'Au marché',
  tags: ['achat', 'produits', 'quotidien']
},
{
  original: "Sini an bena taga dugu ra",
  french: "Demain nous irons dans une ville",
  words: ["Sini", "an", "bena", "taga", "dugu", "ra"],
  category: 'Voyages',
  tags: ['voyage', 'futur', 'déplacement', 'ville']
},
{
  original: "Ziditi tagara a ka dugu ra",
  french: "Judith est allée dans sa ville natale",
  words: ["Ziditi", "tagara", "a", "ka", "dugu", "ra"],
  category: 'Voyages',
  tags: ['voyage', 'passé', 'origine', 'famille']
},
{
  original: "Yan, dugudenw be jɔgɔn deme",
  french: "Ici, les citoyens s'entraident",
  words: ["Yan", "dugudenw", "be", "jɔgɔn", "deme"],
  category: 'Famille et relations',
  tags: ['communauté', 'solidarité', 'citoyens']
},
{
  original: "Fatumata ye Amɛdi deen ye",
  french: "Fatoumata est l'enfant d'Ahmed",
  words: ["Fatumata", "ye", "Amɛdi", "deen", "ye"],
  category: 'Famille et relations',
  tags: ['famille', 'enfant', 'parent', 'filiation']
},
{
  original: "Sogofeerela nin ye nafolotigi ye",
  french: "Le boucher là est riche",
  words: ["Sogofeerela", "nin", "ye", "nafolotigi", "ye"],
  category: 'Au marché',
  tags: ['métier', 'boucher', 'richesse', 'commerce']
},
{
  original: "Jɔɔn be sogo feere yan?",
  french: "Qui vend de la viande ici ?",
  words: ["Jɔɔn", "be", "sogo", "feere", "yan", "?"],
  category: 'Au marché',
  tags: ['question', 'viande', 'vendeur', 'commerce']
},
{
  original: "Kana kuma!",
  french: "Ne parle pas !",
  words: ["Kana", "kuma", "!"],
  category: 'Vie quotidienne',
  tags: ['ordre', 'négation', 'parole']
},
{
  original: "Seyidu ka kuma ka ca",
  french: "Seydou parle trop",
  words: ["Seyidu", "ka", "kuma", "ka", "ca"],
  category: 'Famille et relations',
  tags: ['comportement', 'parole', 'critique']
},
{
  original: "N be julakan men",
  french: "Je comprends le dioula",
  words: ["N", "be", "julakan", "men"],
  category: 'Loisirs et culture',
  tags: ['langue', 'compréhension', 'dioula']
},

// Deuxième série de phrases
{
  original: "Zaki te julakan mɛn",
  french: "Zaki ne comprend pas le dioula",
  words: ["Zaki", "te", "julakan", "mɛn"],
  category: 'Loisirs et culture',
  tags: ['langue', 'négation', 'compréhension', 'dioula']
},
{
  original: "N be arabukan mɛn dɔɔni dɔɔni",
  french: "Je comprends l'arabe un petit peu",
  words: ["N", "be", "arabukan", "mɛn", "dɔɔni", "dɔɔni"],
  category: 'Loisirs et culture',
  tags: ['langue', 'arabe', 'niveau', 'apprentissage']
},
{
  original: "Patirisiya ye sunguru ye",
  french: "Patricia est jolie",
  words: ["Patirisiya", "ye", "sunguru", "ye"],
  category: 'Famille et relations',
  tags: ['description', 'beauté', 'compliment']
},
{
  original: "Tidiyani kɛra kanbele ye",
  french: "Tidiani est devenu un jeune homme",
  words: ["Tidiyani", "kɛra", "kanbele", "ye"],
  category: 'Famille et relations',
  tags: ['âge', 'croissance', 'jeunesse', 'changement']
},
{
  original: "Amɛdi ye fatumata facɛ ye",
  french: "Ahmed et Fatoumata se sont mariés",
  words: ["Amɛdi", "ye", "fatumata", "facɛ", "ye"],
  category: 'Famille et relations',
  tags: ['mariage', 'union', 'famille', 'cérémonie']
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