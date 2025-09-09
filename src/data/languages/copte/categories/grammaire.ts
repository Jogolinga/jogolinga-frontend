import { GrammarCategory } from '../../../../types/types';

export const grammaire: GrammarCategory = {
  'Pronoms sujets': {
    'ⲁⲛⲟⲕ': {
      translation: "Je, moi",
      explanation: "Pronom personnel première personne du singulier",
      example: "ⲁⲛⲟⲕ ϯⲛⲁϣⲉ. (Moi, je vais.)"
    },
    'ⲛⲧⲟⲕ': {
      translation: "Tu, toi (masculin)",
      explanation: "Pronom personnel deuxième personne du singulier masculin",
      example: "ⲛⲧⲟⲕ ⲭⲛⲁϣⲉ. (Toi, tu vas.)"
    },
    'ⲛⲧⲟ': {
      translation: "Tu, toi (féminin)",
      explanation: "Pronom personnel deuxième personne du singulier féminin",
      example: "ⲛⲧⲟ ⲧⲉⲛⲁϣⲉ. (Toi, tu vas.)"
    },
    'ⲛⲧⲟϥ': {
      translation: "Il, lui",
      explanation: "Pronom personnel troisième personne du singulier masculin",
      example: "ⲛⲧⲟϥ ϥⲛⲁϣⲉ. (Lui, il va.)"
    },
    'ⲛⲧⲟⲥ': {
      translation: "Elle",
      explanation: "Pronom personnel troisième personne du singulier féminin",
      example: "ⲛⲧⲟⲥ ⲥⲛⲁϣⲉ. (Elle, elle va.)"
    },
    'ⲁⲛⲟⲛ': {
      translation: "Nous",
      explanation: "Pronom personnel première personne du pluriel",
      example: "ⲁⲛⲟⲛ ⲧⲉⲛⲛⲁϣⲉ. (Nous, nous allons.)"
    },
    'ⲛⲧⲱⲧⲉⲛ': {
      translation: "Vous",
      explanation: "Pronom personnel deuxième personne du pluriel",
      example: "ⲛⲧⲱⲧⲉⲛ ⲧⲉⲧⲉⲛⲛⲁϣⲉ. (Vous, vous allez.)"
    },
    'ⲛⲧⲱⲟⲩ': {
      translation: "Ils/Elles",
      explanation: "Pronom personnel troisième personne du pluriel",
      example: "ⲛⲧⲱⲟⲩ ⲥⲉⲛⲁϣⲉ. (Eux/Elles, ils/elles vont.)"
    }
  },
  'Conjugaison present': {
    'ϯⲥⲱⲧⲉⲙ': {
      translation: "J'écoute",
      explanation: "Forme du présent à la première personne du singulier",
      example: "ϯⲥⲱⲧⲉⲙ ⲉⲡⲓⲗⲟⲅⲟⲥ (J'écoute la parole)"
    },
    'ⲕⲥⲱⲧⲉⲙ': {
      translation: "Tu écoutes (masculin)",
      explanation: "Forme du présent à la deuxième personne du singulier masculin",
      example: "ⲕⲥⲱⲧⲉⲙ ⲉⲡⲓⲣⲉϥϯⲥⲃⲱ (Tu écoutes le maître)"
    },
    'ϥⲥⲱⲧⲉⲙ': {
      translation: "Il écoute",
      explanation: "Forme du présent à la troisième personne du singulier masculin",
      example: "ϥⲥⲱⲧⲉⲙ ⲉⲡⲓϩⲱⲥ (Il écoute le chant)"
    }
  },
  'Conjugaison passe': {
    'ⲁⲓⲥⲱⲧⲉⲙ': {
      translation: "J'ai écouté",
      explanation: "Passé accompli à la première personne du singulier",
      example: "ⲁⲓⲥⲱⲧⲉⲙ ⲉⲡⲓⲗⲟⲅⲟⲥ (J'ai écouté la parole)"
    },
    'ⲁⲕⲥⲱⲧⲉⲙ': {
      translation: "Tu as écouté (masculin)",
      explanation: "Passé accompli à la deuxième personne du singulier masculin",
      example: "ⲁⲕⲥⲱⲧⲉⲙ ⲉⲡⲓⲣⲉϥϯⲥⲃⲱ (Tu as écouté le maître)"
    },
    'ⲁϥⲥⲱⲧⲉⲙ': {
      translation: "Il a écouté",
      explanation: "Passé accompli à la troisième personne du singulier masculin",
      example: "ⲁϥⲥⲱⲧⲉⲙ ⲉⲡⲓϩⲱⲥ (Il a écouté le chant)"
    }
  },
  'Prepositions base': {
    'ϧⲉⲛ': {
      translation: "Dans, en",
      explanation: "Préposition de lieu indiquant la position",
      example: "ϧⲉⲛ ϯⲉⲕⲕⲗⲏⲥⲓⲁ (Dans l'église)"
    },
    'ⲉ': {
      translation: "Vers, à",
      explanation: "Préposition de direction",
      example: "ⲉ ϯⲉⲕⲕⲗⲏⲥⲓⲁ (Vers l'église)"
    },
    'ϩⲓ': {
      translation: "Sur",
      explanation: "Préposition de position",
      example: "ϩⲓ ⲡⲓⲙⲱⲓⲧ (Sur le chemin)"
    }
  },
  'Adjectifs qualificatifs': {
    'ⲁⲅⲁⲑⲟⲥ': {
      translation: "Bon, bonne",
      explanation: "Adjectif qualificatif positif",
      example: "ⲟⲩⲣⲱⲙⲓ ⲛ̀ⲁⲅⲁⲑⲟⲥ (Un homme bon)"
    },
    'ⲛⲓϣϯ': {
      translation: "Grand, grande",
      explanation: "Adjectif de taille",
      example: "ⲟⲩⲏⲓ ⲛ̀ⲛⲓϣϯ (Une grande maison)"
    },
    'ⲕⲟⲩϫⲓ': {
      translation: "Petit, petite",
      explanation: "Adjectif de taille",
      example: "ⲟⲩⲁⲗⲟⲩ ⲛ̀ⲕⲟⲩϫⲓ (Un petit enfant)"
    },
    'ⲡⲟⲛⲏⲣⲟⲥ': {
      translation: "Mauvais, mauvaise",
      explanation: "Adjectif qualificatif négatif",
      example: "ⲟⲩⲣⲱⲙⲓ ⲙ̀ⲡⲟⲛⲏⲣⲟⲥ (Un homme mauvais)"
    }
  }, 
  'Alphabet copte': {
    'ⲁ': {
      translation: "Alpha",
      explanation: "Première lettre de l'alphabet copte, prononcée comme 'a' dans 'chat'",
      example: "ⲁⲛⲟⲕ (anok - je, moi)"
    },
    'ⲃ': {
      translation: "Vita (Beta)",
      explanation: "Deuxième lettre de l'alphabet copte, prononcée comme 'v' ou 'b'",
      example: "ⲃⲁⲗ (val - œil)"
    },
    'ⲅ': {
      translation: "Gamma",
      explanation: "Troisième lettre de l'alphabet copte, prononcée comme 'g' dans 'gare'",
      example: "ⲅⲣⲁⲫⲏ (graphè - écriture)"
    },
    'ⲇ': {
      translation: "Delta",
      explanation: "Quatrième lettre de l'alphabet copte, prononcée comme 'd' dans 'dire'",
      example: "ⲇⲱⲣⲟⲛ (dôron - don)"
    },
    'ⲉ': {
      translation: "Ei",
      explanation: "Cinquième lettre de l'alphabet copte, prononcée comme 'é' dans 'été'",
      example: "ⲉⲓⲱⲧ (eiôt - père)"
    },
    'ⲍ': {
      translation: "Zeta",
      explanation: "Sixième lettre de l'alphabet copte, prononcée comme 'z' dans 'zèbre'",
      example: "ⲍⲱⲏ (zôè - vie)"
    },
    'ⲏ': {
      translation: "Eta",
      explanation: "Septième lettre de l'alphabet copte, prononcée comme 'è' long",
      example: "ⲏⲓ (èi - maison)"
    },
    'ⲑ': {
      translation: "Thêta",
      explanation: "Huitième lettre de l'alphabet copte, prononcée comme 'th' anglais dans 'think'",
      example: "ⲑⲉⲟⲥ (theos - Dieu)"
    },
    'ⲓ': {
      translation: "Iota",
      explanation: "Neuvième lettre de l'alphabet copte, prononcée comme 'i' dans 'vie'",
      example: "ⲓⲥ (is - abréviation pour Jésus)"
    },
    'ⲕ': {
      translation: "Kappa",
      explanation: "Dixième lettre de l'alphabet copte, prononcée comme 'k' dans 'képi'",
      example: "ⲕⲁⲥ (kas - os)"
    },
    'ⲗ': {
      translation: "Lambda",
      explanation: "Onzième lettre de l'alphabet copte, prononcée comme 'l' dans 'lune'",
      example: "ⲗⲁⲥ (las - langue)"
    },
    'ⲙ': {
      translation: "Mi",
      explanation: "Douzième lettre de l'alphabet copte, prononcée comme 'm' dans 'main'",
      example: "ⲙⲁⲁⲩ (maau - mère)"
    },
    'ⲛ': {
      translation: "Ni",
      explanation: "Treizième lettre de l'alphabet copte, prononcée comme 'n' dans 'nom'",
      example: "ⲛⲟⲩⲃ (noub - or)"
    },
    'ⲝ': {
      translation: "Ksi",
      explanation: "Quatorzième lettre de l'alphabet copte, prononcée comme 'ks' dans 'taxi'",
      example: "ⲝⲉⲛⲟⲥ (ksenos - étranger)"
    },
    'ⲟ': {
      translation: "O",
      explanation: "Quinzième lettre de l'alphabet copte, prononcée comme 'o' dans 'port'",
      example: "ⲟⲩⲣⲟ (ouro - roi)"
    },
    'ⲡ': {
      translation: "Pi",
      explanation: "Seizième lettre de l'alphabet copte, prononcée comme 'p' dans 'poire'",
      example: "ⲡⲓⲥⲧⲓⲥ (pistis - foi)"
    },
    'ⲣ': {
      translation: "Ro",
      explanation: "Dix-septième lettre de l'alphabet copte, prononcée comme 'r' roulé",
      example: "ⲣⲁⲛ (ran - nom)"
    },
    'ⲥ': {
      translation: "Sima",
      explanation: "Dix-huitième lettre de l'alphabet copte, prononcée comme 's' dans 'sel'",
      example: "ⲥⲱⲧⲙ (sôtm - écouter)"
    },
    'ⲧ': {
      translation: "Tau",
      explanation: "Dix-neuvième lettre de l'alphabet copte, prononcée comme 't' dans 'table'",
      example: "ⲧⲱⲃϩ (tôbh - prier)"
    },
    'ⲩ': {
      translation: "Epsilon",
      explanation: "Vingtième lettre de l'alphabet copte, prononcée comme 'u' français ou 'y' en position finale",
      example: "ⲩⲓⲟⲥ (uios - fils)"
    },
    'ⲫ': {
      translation: "Phi",
      explanation: "Vingt-et-unième lettre de l'alphabet copte, prononcée comme 'ph' dans 'philosophie'",
      example: "ⲫⲱⲃ (phôb - objet)"
    },
    'ⲭ': {
      translation: "Khi",
      explanation: "Vingt-deuxième lettre de l'alphabet copte, prononcée comme 'ch' allemand dans 'Bach'",
      example: "ⲭⲏⲣⲁ (khèra - veuve)"
    },
    'ⲯ': {
      translation: "Psi",
      explanation: "Vingt-troisième lettre de l'alphabet copte, prononcée comme 'ps' dans 'psychologie'",
      example: "ⲯⲩⲭⲏ (psukhè - âme)"
    },
    'ⲱ': {
      translation: "Ô",
      explanation: "Vingt-quatrième lettre de l'alphabet copte, prononcée comme 'ô' long",
      example: "ⲱⲛϧ (ônkh - vie)"
    },
    'ϣ': {
      translation: "Shai",
      explanation: "Vingt-cinquième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'ch' dans 'chat'",
      example: "ϣⲏⲣⲓ (shèri - fils)"
    },
    'ϥ': {
      translation: "Fai",
      explanation: "Vingt-sixième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'f' dans 'fin'",
      example: "ϥⲁⲓ (fai - porter)"
    },
    'ϧ': {
      translation: "Khai",
      explanation: "Vingt-septième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'kh' aspiré",
      example: "ϧⲉⲗⲗⲟ (khello - vieillard)"
    },
    'ϩ': {
      translation: "Hori",
      explanation: "Vingt-huitième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'h' aspiré",
      example: "ϩⲟ (ho - visage)"
    },
    'ϫ': {
      translation: "Djandja",
      explanation: "Vingt-neuvième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'dj' dans 'Djibouti'",
      example: "ϫⲱⲙ (djôm - livre)"
    },
    'ϭ': {
      translation: "Tchima",
      explanation: "Trentième lettre de l'alphabet copte, spécifique au copte, prononcée comme 'tch' dans 'tchèque'",
      example: "ϭⲓϫ (tchidj - main)"
    },
    'ϯ': {
      translation: "Ti",
      explanation: "Trente-et-unième lettre de l'alphabet copte, spécifique au copte, combinaison de tau et iota",
      example: "ϯⲛⲟⲩ (tinou - maintenant)"
    }
  },
};

export default grammaire;

export {};