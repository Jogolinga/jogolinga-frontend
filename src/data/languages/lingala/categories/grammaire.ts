import { GrammarCategory } from '../../../../types/types';

export const grammaire: GrammarCategory = {
  'Pronoms personnels sujets': {
    'ngai': {
      translation: "Je, moi",
      explanation: "Pronom personnel première personne du singulier",
      example: "Ngai nazali koliya. (Je suis en train de manger.)"
    },
    'yo': {
      translation: "Tu, toi",
      explanation: "Pronom personnel deuxième personne du singulier",
      example: "Yo ozali koloba. (Tu es en train de parler.)"
    },
    'ye': {
      translation: "Il/Elle",
      explanation: "Pronom personnel troisième personne du singulier",
      example: "Ye azali kosala. (Il/Elle est en train de travailler.)"
    },
    'biso': {
      translation: "Nous",
      explanation: "Pronom personnel première personne du pluriel",
      example: "Biso tozali koyekola. (Nous sommes en train d'étudier.)"
    },
    'bino': {
      translation: "Vous",
      explanation: "Pronom personnel deuxième personne du pluriel",
      example: "Bino bozali kolala. (Vous êtes en train de dormir.)"
    },
    'bango': {
      translation: "Ils/Elles",
      explanation: "Pronom personnel troisième personne du pluriel",
      example: "Bango bazali kosana. (Ils/Elles sont en train de jouer.)"
    }
  },

  'Conjugaison au present': {
  'nazali': {
    translation: "Je suis",
    explanation: "Forme conjuguée de 'être' à la première personne du singulier",
    example: "Nazali na ndako. (Je suis à la maison.)"
  },
  'ozali': {
    translation: "Tu es",
    explanation: "Forme conjuguée de 'être' à la deuxième personne du singulier",
    example: "Ozali malamu. (Tu es bien.)"
  },
  'azali': {
    translation: "Il/Elle est",
    explanation: "Forme conjuguée de 'être' à la troisième personne du singulier",
    example: "Azali awa. (Il/Elle est ici.)"
  },
  'tozali': {
    translation: "Nous sommes",
    explanation: "Forme conjuguée de 'être' à la première personne du pluriel",
    example: "Tozali na mosala. (Nous sommes au travail.)"
  },
  'bozali': {
    translation: "Vous êtes", 
    explanation: "Forme conjuguée de 'être' à la deuxième personne du pluriel",
    example: "Bozali malamu? (Vous allez bien?)"
  },
  'bazali': {
    translation: "Ils/Elles sont",
    explanation: "Forme conjuguée de 'être' à la troisième personne du pluriel",
    example: "Bazali na bokebi. (Ils sont attentifs.)"
  },
  'nazali_na': {
    translation: "J'ai",
    explanation: "Littéralement 'je suis avec', expression possessive",
    example: "Nazali na mbongo. (J'ai de l'argent.)"
  }
},

  'Conjugaison au passe': {
  'nazalaki': {
    translation: "J'étais",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Nazalaki na mboka. (J'étais au village.)"
  },
  'ozalaki': {
    translation: "Tu étais",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Ozalaki awa. (Tu étais ici.)"
  },
  'azalaki': {
    translation: "Il/Elle était",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Azalaki awa. (Il/Elle était ici.)"
  },
  'tozalaki': {
    translation: "Nous étions",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Tozalaki elongo. (Nous étions ensemble.)"
  },
  'bozalaki': {
    translation: "Vous étiez",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Bozalaki wapi? (Où étiez-vous?)"
  },
  'bazalaki': {
    translation: "Ils/Elles étaient",
    explanation: "Forme conjuguée de 'être' au passé",
    example: "Bazalaki na esengo. (Ils étaient heureux.)"
  },
  },

 'Prépositions de base': {
    'na': {
      translation: "À, avec, dans",
      explanation: "Préposition polyvalente indiquant la possession, la localisation ou l'accompagnement",
      example: "Nazali na likambo. (J'ai un problème.)"
    },
    'ya': {
      translation: "De, appartenant à",
      explanation: "Préposition de possession ou d'origine",
      example: "Kitabu ya mwana. (Livre de l'enfant.)"
    },
    'mpo na': {
      translation: "Pour, à cause de",
      explanation: "Préposition indiquant le but ou la raison",
      example: "Nazali kosala mpo na biso. (Je travaille pour nous.)"
    },
    'liboso ya': {
      translation: "Devant, avant",
      explanation: "Préposition spatiale ou temporelle",
      example: "Azali liboso ya ndako. (Il est devant la maison.)"
    },
    'mpeme ya': {
      translation: "À côté de",
      explanation: "Préposition de proximité spatiale",
      example: "Nzambe azali mpeme ya moto. (Dieu est à côté de la personne.)"
    },
    'kati na': {
      translation: "Entre, à l'intérieur de",
      explanation: "Préposition de localisation ou de relation",
      example: "Kati na mokili. (Entre les gens.)"
    },
    'nsima ya': {
      translation: "Derrière, après",
      explanation: "Préposition spatiale ou temporelle",
      example: "Azali nsima ya ndako. (Il est derrière la maison.)"
    },
    'kuna': {
      translation: "Dans, à",
      explanation: "Préposition de localisation",
      example: "Nazali kuna mboka. (Je suis dans la ville.)"
    },
    'likolo ya': {
      translation: "Sur, au-dessus de",
      explanation: "Préposition spatiale",
      example: "Kitabu ezali likolo ya mesa. (Le livre est sur la table.)"
    },
    'kati ya': {
      translation: "Parmi, entre",
      explanation: "Préposition indiquant une position ou une sélection dans un groupe",
      example: "Kati ya bato nyingi. (Parmi beaucoup de personnes.)"
    },
    'na liboso ya': {
      translation: "En face de, devant",
      explanation: "Préposition de positionnement spatial",
      example: "Nazali na liboso ya salle. (Je suis en face de la salle.)"
    },
    'mpaka': {
      translation: "Jusqu'à, vers",
      explanation: "Préposition indiquant une limite ou une destination",
      example: "Nazali kokende mpaka mboka. (Je vais jusqu'à la ville.)"
    },
    'sima ya': {
      translation: "Après, suite à",
      explanation: "Préposition temporelle ou séquentielle",
      example: "Sima ya mosala. (Après le travail.)"
    },
    'krofala': {
      translation: "Sous, en dessous de",
      explanation: "Préposition spatiale indiquant une position inférieure",
      example: "Kitabu ekomi krofala ya table. (Le livre est sous la table.)"
    },
    'mibale': {
      translation: "Avec, ensemble avec",
      explanation: "Préposition d'accompagnement ou de compagnie",
      example: "Nazali kota mibale mama. (Je viens avec maman.)"
    }
  },

 'Adjectifs qualificatifs': {
    'monene': {
        translation: "Grand",
        explanation: "Adjectif qualificatif de taille",
        example: "ndako monene (grande maison)"
    },
    'moke': {
        translation: "Petit", 
        explanation: "Adjectif qualificatif de taille",
        example: "mwana moke (petit enfant)"
    },
    'malamu': {
        translation: "Bon, bien",
        explanation: "Adjectif qualificatif positif", 
        example: "bilei malamu (bonne nourriture)"
    },
    'mabe': {
        translation: "Mauvais",
        explanation: "Adjectif qualificatif négatif",
        example: "moto mabe (mauvaise personne)"
    },
    'fifi': {
        translation: "Propre",
        explanation: "Adjectif qualificatif de propreté",
        example: "ndako fifi (maison propre)"
    },
    'makasi': {
        translation: "Fort",
        explanation: "Adjectif qualificatif de force",
        example: "mwana makasi (enfant fort)"
    },
    'lelo': {
        translation: "Nouveau",
        explanation: "Adjectif qualificatif de nouveauté",
        example: "kiti lelo (chaise neuve)"
    },
    'zali': {
        translation: "Vieux",
        explanation: "Adjectif qualificatif d'ancienneté",
        example: "moto zali (personne âgée)"
    },
    'fukuta': {
        translation: "Sale",
        explanation: "Adjectif qualificatif de saleté",
        example: "mboka fukuta (vêtement sale)"
    },
    'yindo': {
        translation: "Grand, important",
        explanation: "Adjectif qualificatif d'importance",
        example: "mosala yindo (travail important)"
    },
    'tindami': {
        translation: "Intelligent, brillant",
        explanation: "Adjectif qualificatif d'intelligence",
        example: "mwana tindami (enfant intelligent)"
    },
    'ndeke': {
        translation: "Léger",
        explanation: "Adjectif qualificatif de poids",
        example: "sac ndeke (sac léger)"
    },
    'lozo': {
        translation: "Difficile",
        explanation: "Adjectif qualificatif de difficulté",
        example: "mosala lozo (travail difficile)"
    },
    'nzuri': {
        translation: "Beau, joli",
        explanation: "Adjectif qualificatif esthétique",
        example: "mboka nzuri (belle robe)"
    },
    'kobongisa': {
        translation: "Rapide",
        explanation: "Adjectif qualificatif de vitesse",
        example: "moto kobongisa (personne rapide)"
    },
    'liboso': {
        translation: "Premier",
        explanation: "Adjectif qualificatif de position",
        example: "mokambi liboso (premier leader)"
    },
    'ya suka': {
        translation: "Dernier",
        explanation: "Adjectif qualificatif de position finale",
        example: "elongi ya suka (dernier arrivé)"
    },
    'koleka': {
        translation: "Long",
        explanation: "Adjectif qualificatif de longueur",
        example: "nzela koleka (long chemin)"
    },
    'moto': {
        translation: "Chaud",
        explanation: "Adjectif qualificatif de température",
        example: "mai moto (eau chaude)"
    },
    'bilulu': {
        translation: "Froid",
        explanation: "Adjectif qualificatif de température",
        example: "somo bilulu (boisson froide)"
    },

    'luesu': {
      translation: "Sec",
      explanation: "Adjectif qualificatif d'état",
      example: "mbota luesu (vêtement sec)"
  },
  'mabele': {
      translation: "Humide",
      explanation: "Adjectif qualificatif d'état",
      example: "ntete mabele (sol humide)"
  },
  'yaya': {
      translation: "Mou, doux",
      explanation: "Adjectif qualificatif de texture",
      example: "libulu yaya (coussin doux)"
  },
  'mpimpa': {
      translation: "Dur, solide",
      explanation: "Adjectif qualificatif de dureté",
      example: "mpete mpimpa (pierre dure)"
  },
  'kosikaka': {
      translation: "Large",
      explanation: "Adjectif qualificatif de dimension",
      example: "nzela kosikaka (route large)"
  },
  'leki': {
      translation: "Étroit",
      explanation: "Adjectif qualificatif de dimension",
      example: "mboka leki (ruelle étroite)"
  },
  'mpembele': {
      translation: "Rouge",
      explanation: "Adjectif qualificatif de couleur",
      example: "likofa mpembele (chemise rouge)"
  },
  'luingu': {
      translation: "Bleu",
      explanation: "Adjectif qualificatif de couleur",
      example: "mpemba luingu (crayon bleu)"
  },
  'mosali': {
      translation: "Fatigué",
      explanation: "Adjectif qualificatif d'état physique",
      example: "moto mosali (personne fatiguée)"
  }
}
};

export default grammaire;