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
    icon: '🏥',
    description: 'Expressions pour les situations médicales et urgentes',
  },
  'Loisirs et culture': {
    icon: '🎭',
    description: 'Parler de ses activités, passe-temps et culture',
  }
} as const;

export const sentencesToConstruct: Sentence[] = [
  // ==========================================
  // SALUTATIONS - PHRASES COMPLÈTES
  // ==========================================
  
  {
    original: "Mbote na bino baninga",
    french: "Bonjour à vous les amis",
    words: ["Mbote", "na", "bino", "baninga"],
    category: 'Salutations',
    tags: ['salutations', 'groupe', 'amitié']
  },
  
  {
    original: "Nazali malamu, natondi yo",
    french: "Je vais bien, merci",
    words: ["Nazali", "malamu", ",", "natondi", "yo"],
    category: 'Salutations',
    tags: ['état', 'remerciement']
  },
  
  {
    original: "Mokolo ya lelo ezali kitoko",
    french: "Cette journée est belle",
    words: ["Mokolo", "ya", "lelo", "ezali", "kitoko"],
    category: 'Salutations',
    tags: ['temps', 'appréciation']
  },
  
  {
    original: "Nalingi koyoka sango na yo",
    french: "J'aimerais entendre tes nouvelles",
    words: ["Nalingi", "koyoka", "sango", "na", "yo"],
    category: 'Salutations',
    tags: ['intérêt', 'nouvelles']
  },
  
  {
    original: "Tomonana na pokwa ya lelo",
    french: "On se voit ce soir",
    words: ["Tomonana", "na", "pokwa", "ya", "lelo"],
    category: 'Salutations',
    tags: ['rendez-vous', 'temps']
  },
  
  {
    original: "Bosepela mingi na mokolo malamu",
    french: "Réjouissez-vous en cette belle journée",
    words: ["Bosepela", "mingi", "na", "mokolo", "malamu"],
    category: 'Salutations',
    tags: ['souhait', 'joie']
  },

  // ==========================================
  // PRÉSENTATION - PHRASES STRUCTURÉES
  // ==========================================
  
  {
    original: "Kombo na ngai ezali Pierre",
    french: "Mon nom est Pierre",
    words: ["Kombo", "na", "ngai", "ezali", "Pierre"],
    category: 'Présentation',
    tags: ['identité', 'nom']
  },
  
  {
    original: "Nasalaka mosala na banque",
    french: "Je travaille à la banque",
    words: ["Nasalaka", "mosala", "na", "banque"],
    category: 'Présentation',
    tags: ['travail', 'lieu']
  },
  
  {
    original: "Nazali moto ya Kinshasa",
    french: "Je suis de Kinshasa",
    words: ["Nazali", "moto", "ya", "Kinshasa"],
    category: 'Présentation',
    tags: ['origine', 'ville']
  },
  
  {
    original: "Nalobaka lingala na franséza",
    french: "Je parle lingala et français",
    words: ["Nalobaka", "lingala", "na", "franséza"],
    category: 'Présentation',
    tags: ['langues', 'compétence']
  },
  
  {
    original: "Mbula na ngai ezali tuku mitano",
    french: "J'ai cinquante ans",
    words: ["Mbula", "na", "ngai", "ezali", "tuku", "mitano"],
    category: 'Présentation',
    tags: ['âge', 'nombre']
  },
  
  {
    original: "Nalingi kolakisa yo ndako na ngai",
    french: "J'aimerais te montrer ma maison",
    words: ["Nalingi", "kolakisa", "yo", "ndako", "na", "ngai"],
    category: 'Présentation',
    tags: ['invitation', 'domicile']
  },
  
  {
    original: "Libota na ngai ezali na bato mingi",
    french: "Ma famille est nombreuse",
    words: ["Libota", "na", "ngai", "ezali", "na", "bato", "mingi"],
    category: 'Présentation',
    tags: ['famille', 'quantité']
  },

  // ==========================================
  // VIE QUOTIDIENNE - PHRASES COMPLÈTES
  // ==========================================
  
  {
    original: "Nalamukaka na ngonga ya libwa",
    french: "Je me réveille le matin",
    words: ["Nalamukaka", "na", "ngonga", "ya", "libwa"],
    category: 'Vie quotidienne',
    tags: ['routine', 'temps']
  },
  
  {
    original: "Nakoliaka ndunda na mbuma",
    french: "Je mange des légumes et des fruits",
    words: ["Nakoliaka", "ndunda", "na", "mbuma"],
    category: 'Vie quotidienne',
    tags: ['nourriture', 'santé']
  },
  
  {
    original: "Namelaka mayi mingi na mokolo",
    french: "Je bois beaucoup d'eau par jour",
    words: ["Namelaka", "mayi", "mingi", "na", "mokolo"],
    category: 'Vie quotidienne',
    tags: ['hydratation', 'santé']
  },
  
  {
    original: "Nasalaka mosala na ndako",
    french: "Je fais le travail à la maison",
    words: ["Nasalaka", "mosala", "na", "ndako"],
    category: 'Vie quotidienne',
    tags: ['ménage', 'responsabilité']
  },
  
  {
    original: "Nasukolaka bilamba na mpokwa",
    french: "Je lave les vêtements le soir",
    words: ["Nasukolaka", "bilamba", "na", "mpokwa"],
    category: 'Vie quotidienne',
    tags: ['ménage', 'temps']
  },
  
  {
    original: "Natambolaka na nzela mingi",
    french: "Je marche beaucoup sur les routes",
    words: ["Natambolaka", "na", "nzela", "mingi"],
    category: 'Vie quotidienne',
    tags: ['exercice', 'déplacement']
  },
  
  {
    original: "Nakolalaka na ngonga ya zomi",
    french: "Je dors à dix heures",
    words: ["Nakolalaka", "na", "ngonga", "ya", "zomi"],
    category: 'Vie quotidienne',
    tags: ['sommeil', 'horaire']
  },

  // ==========================================
  // AU MARCHÉ - PHRASES TRANSACTIONNELLES
  // ==========================================
  
  {
    original: "Nalingi kosomba ndunda kitoko",
    french: "Je veux acheter de beaux légumes",
    words: ["Nalingi", "kosomba", "ndunda", "kitoko"],
    category: 'Au marché',
    tags: ['achat', 'qualité']
  },
  
  {
    original: "Moteki akolakisa biloko na ye",
    french: "Le vendeur montre ses marchandises",
    words: ["Moteki", "akolakisa", "biloko", "na", "ye"],
    category: 'Au marché',
    tags: ['commerce', 'présentation']
  },
  
  {
    original: "Nazali koluka mbuma ya nsafu",
    french: "Je cherche des mangues fraîches",
    words: ["Nazali", "koluka", "mbuma", "ya", "nsafu"],
    category: 'Au marché',
    tags: ['recherche', 'fruits']
  },
  
  {
    original: "Mwasi akokataka ntalo na ngai",
    french: "La dame négocie le prix avec moi",
    words: ["Mwasi", "akokataka", "ntalo", "na", "ngai"],
    category: 'Au marché',
    tags: ['négociation', 'prix']
  },
  
  {
    original: "Napesaka mbongo na moteki",
    french: "Je donne l'argent au vendeur",
    words: ["Napesaka", "mbongo", "na", "moteki"],
    category: 'Au marché',
    tags: ['paiement', 'transaction']
  },
  
  {
    original: "Bato bazali kosomba bilei",
    french: "Les gens achètent de la nourriture",
    words: ["Bato", "bazali", "kosomba", "bilei"],
    category: 'Au marché',
    tags: ['commerce', 'communauté']
  },
  
  {
    original: "Wenze ezali na bato mingi",
    french: "Le marché est plein de monde",
    words: ["Wenze", "ezali", "na", "bato", "mingi"],
    category: 'Au marché',
    tags: ['lieu', 'affluence']
  },

  // ==========================================
  // VOYAGES - PHRASES DE DÉPLACEMENT
  // ==========================================
  
  {
    original: "Nakei na Brazzaville na motuka",
    french: "Je vais à Brazzaville en voiture",
    words: ["Nakei", "na", "Brazzaville", "na", "motuka"],
    category: 'Voyages',
    tags: ['destination', 'transport']
  },
  
  {
    original: "Motambolisi akolakisa nzela",
    french: "Le guide montre le chemin",
    words: ["Motambolisi", "akolakisa", "nzela"],
    category: 'Voyages',
    tags: ['guidance', 'direction']
  },
  
  {
    original: "Nalingi kokota na mpenza",
    french: "Je veux entrer dans l'avion",
    words: ["Nalingi", "kokota", "na", "mpenza"],
    category: 'Voyages',
    tags: ['transport', 'aviation']
  },
  
  {
    original: "Bapasajè bazali kozela motuka",
    french: "Les passagers attendent le véhicule",
    words: ["Bapasajè", "bazali", "kozela", "motuka"],
    category: 'Voyages',
    tags: ['attente', 'transport']
  },
  
  {
    original: "Mokambi akoloba na mikolo",
    french: "Le capitaine parle aux passagers",
    words: ["Mokambi", "akoloba", "na", "mikolo"],
    category: 'Voyages',
    tags: ['communication', 'autorité']
  },
  
  {
    original: "Nazali kotala bisika ya kitoko",
    french: "Je regarde de beaux paysages",
    words: ["Nazali", "kotala", "bisika", "ya", "kitoko"],
    category: 'Voyages',
    tags: ['observation', 'beauté']
  },
  
  {
    original: "Mobembo mokomisi nga na ndako",
    french: "Le voyage me ramène à la maison",
    words: ["Mobembo", "mokomisi", "nga", "na", "ndako"],
    category: 'Voyages',
    tags: ['retour', 'domicile']
  },

  // ==========================================
  // FAMILLE ET RELATIONS - PHRASES FAMILIALES
  // ==========================================
  
  {
    original: "Mama na ngai akolamisa bilei",
    french: "Ma mère prépare la nourriture",
    words: ["Mama", "na", "ngai", "akolamisa", "bilei"],
    category: 'Famille et relations',
    tags: ['famille', 'cuisine']
  },
  
  {
    original: "Tata azali kotanga gazeti",
    french: "Papa lit le journal",
    words: ["Tata", "azali", "kotanga", "gazeti"],
    category: 'Famille et relations',
    tags: ['famille', 'lecture']
  },
  
  {
    original: "Bana bazali kosakana na libanda",
    french: "Les enfants jouent dehors",
    words: ["Bana", "bazali", "kosakana", "na", "libanda"],
    category: 'Famille et relations',
    tags: ['enfance', 'jeu']
  },
  
  {
    original: "Koko akoloba masolo ya kala",
    french: "Grand-mère raconte des histoires d'autrefois",
    words: ["Koko", "akoloba", "masolo", "ya", "kala"],
    category: 'Famille et relations',
    tags: ['tradition', 'récit']
  },
  
  {
    original: "Ndeko na ngai azali kosala devoirs",
    french: "Mon frère fait ses devoirs",
    words: ["Ndeko", "na", "ngai", "azali", "kosala", "devoirs"],
    category: 'Famille et relations',
    tags: ['éducation', 'fratrie']
  },
  
  {
    original: "Libota mobimba ezali kosangana",
    french: "Toute la famille se réunit",
    words: ["Libota", "mobimba", "ezali", "kosangana"],
    category: 'Famille et relations',
    tags: ['réunion', 'unité']
  },
  
  {
    original: "Balingi baninga bazali koya",
    french: "Mes amis chers viennent",
    words: ["Balingi", "baninga", "bazali", "koya"],
    category: 'Famille et relations',
    tags: ['amitié', 'visite']
  },

  // ==========================================
  // URGENCES ET SANTÉ - PHRASES MÉDICALES
  // ==========================================
  
  {
    original: "Monganga azali kotala mokono na ngai",
    french: "Le médecin examine ma jambe",
    words: ["Monganga", "azali", "kotala", "mokono", "na", "ngai"],
    category: 'Urgences et santé',
    tags: ['médical', 'examen']
  },
  
  {
    original: "Nazali na mpasi ya motó makasi",
    french: "J'ai un fort mal de tête",
    words: ["Nazali", "na", "mpasi", "ya", "motó", "makasi"],
    category: 'Urgences et santé',
    tags: ['douleur', 'symptôme']
  },
  
  {
    original: "Muasi azali kopesa nkisi",
    french: "L'infirmière donne le médicament",
    words: ["Muasi", "azali", "kopesa", "nkisi"],
    category: 'Urgences et santé',
    tags: ['soins', 'traitement']
  },
  
  {
    original: "Baleki bazali kokamataka motuka ya mbalaka",
    french: "Les urgentistes prennent l'ambulance",
    words: ["Baleki", "bazali", "kokamataka", "motuka", "ya", "mbalaka"],
    category: 'Urgences et santé',
    tags: ['urgence', 'transport']
  },
  
  {
    original: "Nakozonga na lopitalo lobi",
    french: "Je retournerai à l'hôpital demain",
    words: ["Nakozonga", "na", "lopitalo", "lobi"],
    category: 'Urgences et santé',
    tags: ['rendez-vous', 'suivi']
  },
  
  {
    original: "Mobele akokata na mbeli",
    french: "Le malade guérit avec le temps",
    words: ["Mobele", "akokata", "na", "mbeli"],
    category: 'Urgences et santé',
    tags: ['guérison', 'temps']
  },
  
  {
    original: "Tosengeli kolingaka nzoto na biso",
    french: "Nous devons prendre soin de notre corps",
    words: ["Tosengeli", "kolingaka", "nzoto", "na", "biso"],
    category: 'Urgences et santé',
    tags: ['prévention', 'conseil']
  },

  // ==========================================
  // LOISIRS ET CULTURE - PHRASES RÉCRÉATIVES
  // ==========================================
  
  {
    original: "Nabetaka mbonda na baninga na ngai",
    french: "Je joue au football avec mes amis",
    words: ["Nabetaka", "mbonda", "na", "baninga", "na", "ngai"],
    category: 'Loisirs et culture',
    tags: ['sport', 'amitié']
  },
  
  {
    original: "Moyembi azali koyemba nzembo kitoko",
    french: "Le chanteur chante une belle chanson",
    words: ["Moyembi", "azali", "koyemba", "nzembo", "kitoko"],
    category: 'Loisirs et culture',
    tags: ['musique', 'performance']
  },
  
  {
    original: "Bato bazali kobina na rythme",
    french: "Les gens dansent en rythme",
    words: ["Bato", "bazali", "kobina", "na", "rythme"],
    category: 'Loisirs et culture',
    tags: ['danse', 'musique']
  },
  
  {
    original: "Nalingi kotanga mikanda ya masolo",
    french: "J'aime lire des livres d'histoires",
    words: ["Nalingi", "kotanga", "mikanda", "ya", "masolo"],
    category: 'Loisirs et culture',
    tags: ['lecture', 'récit']
  },
  
  {
    original: "Batali bazali kosala masano na cinéma",
    french: "Les acteurs font un spectacle au cinéma",
    words: ["Batali", "bazali", "kosala", "masano", "na", "cinéma"],
    category: 'Loisirs et culture',
    tags: ['théâtre', 'divertissement']
  },
  
  {
    original: "Nakende na fête ya libala",
    french: "Je vais à une fête de mariage",
    words: ["Nakende", "na", "fête", "ya", "libala"],
    category: 'Loisirs et culture',
    tags: ['célébration', 'tradition']
  },
  
  {
    original: "Basali bazali kopesa concert na ziko",
    french: "Les musiciens donnent un concert ce soir",
    words: ["Basali", "bazali", "kopesa", "concert", "na", "ziko"],
    category: 'Loisirs et culture',
    tags: ['musique', 'événement']
  },

  // ==========================================
  // PHRASES COMPLEXES SUPPLÉMENTAIRES
  // ==========================================

  // Expressions de temps et durée
  {
    original: "Nakosalaka mosala longwa na ngonga ya libwa tii na mpokwa",
    french: "Je travaille du matin jusqu'au soir",
    words: ["Nakosalaka", "mosala", "longwa", "na", "ngonga", "ya", "libwa", "tii", "na", "mpokwa"],
    category: 'Vie quotidienne',
    tags: ['travail', 'durée', 'routine']
  },

  // Expressions de cause et conséquence
  {
    original: "Nazali kosepela mpenza soki namonaki yo",
    french: "Je suis très heureux quand je te vois",
    words: ["Nazali", "kosepela", "mpenza", "soki", "namonaki", "yo"],
    category: 'Famille et relations',
    tags: ['émotion', 'condition', 'joie']
  },

  // Expressions de comparaison
  {
    original: "Mwana oyo aleki bandeko na ye na malangá",
    french: "Cet enfant est plus intelligent que ses frères",
    words: ["Mwana", "oyo", "aleki", "bandeko", "na", "ye", "na", "malangá"],
    category: 'Famille et relations',
    tags: ['comparaison', 'intelligence', 'enfants']
  },

  // Expressions de possession étendue
  {
    original: "Motuka ya mobali na ngai ezali na langi ya motane",
    french: "La voiture de mon mari est de couleur rouge",
    words: ["Motuka", "ya", "mobali", "na", "ngai", "ezali", "na", "langi", "ya", "motane"],
    category: 'Famille et relations',
    tags: ['possession', 'description', 'couleur']
  },

  // Expressions d'opinion et de sentiment
  {
    original: "Nakanisi ete mokolo ya lobi ekozala malamu",
    french: "Je pense que demain sera une bonne journée",
    words: ["Nakanisi", "ete", "mokolo", "ya", "lobi", "ekozala", "malamu"],
    category: 'Vie quotidienne',
    tags: ['opinion', 'futur', 'espoir']
  },

  // Expressions d'action réciproque
  {
    original: "Bana bazali kosunga bango na bango na misala",
    french: "Les enfants s'entraident dans les travaux",
    words: ["Bana", "bazali", "kosunga", "bango", "na", "bango", "na", "misala"],
    category: 'Famille et relations',
    tags: ['entraide', 'coopération', 'travail']
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