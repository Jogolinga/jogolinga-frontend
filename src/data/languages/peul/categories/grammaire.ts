import { GrammarCategory } from '../../../../types/types';

export const grammaire: GrammarCategory = {
  'Pronoms_sujets': {
    'mi': {
      translation: "Je, moi",
      explanation: "Pronom personnel première personne du singulier",
      example: "Mi yaha. (Moi, je vais.)"
    },
    'aan': {
      translation: "Tu, toi",
      explanation: "Pronom personnel deuxième personne du singulier",
      example: "A yaha. (Toi, tu vas.)"
    },
    'o': {
      translation: "Il/Elle",
      explanation: "Pronom personnel troisième personne du singulier",
      example: "O yaha. (Il/Elle va.)"
    },
    'minen': {
      translation: "Nous",
      explanation: "Pronom personnel première personne du pluriel",
      example: "Minen njahi luumo. (Nous allons au marché.)"
    },
    'onon': {
      translation: "Vous",
      explanation: "Pronom personnel deuxième personne du pluriel",
      example: "Onon njahi lekki. (Vous allez à l’école.)"
    },
    'kamɓe': {
      translation: "Ils/Elles",
      explanation: "Pronom personnel troisième personne du pluriel",
      example: "Kamɓe njahi galle. (Eux/Elles vont à la maison.)"
    },
    'ko': {
      translation: "Cela, ça",
      explanation: "Pronom démonstratif neutre",
      example: "Ko ɗum. (C’est cela.)"
    }
  },

  'Conjugaison present': {
    'miɗo yaha': {
      translation: "Je vais",
      explanation: "Présent progressif à la première personne du singulier",
      example: "Miɗo yaha to luumo. (Je vais au marché.)"
    },
    'aɗa yaha': {
      translation: "Tu vas",
      explanation: "Présent progressif à la deuxième personne du singulier",
      example: "Aɗa yaha to lekkol. (Tu vas à l’école.)"
    },
    'omo yaha': {
      translation: "Il/Elle va",
      explanation: "Présent progressif à la troisième personne du singulier",
      example: "Omo yaha to galle. (Il/Elle va à la maison.)"
    },
    'minen ɗon yaha': {
      translation: "Nous allons",
      explanation: "Présent progressif à la première personne du pluriel",
      example: "Minen ɗon yaha to luumo. (Nous allons au marché.)"
    },
    'onon ɗon yaha': {
      translation: "Vous allez",
      explanation: "Présent progressif à la deuxième personne du pluriel",
      example: "Onon ɗon yaha to lekki. (Vous allez à l’école.)"
    },
    'ɓe ɗon yaha': {
      translation: "Ils/Elles vont",
      explanation: "Présent progressif à la troisième personne du pluriel",
      example: "ɓe ɗon yaha to galle. (Ils/Elles vont à la maison.)"
    }
  },

  'Conjugaison passe': {
    'mi yahii': {
      translation: "Je suis allé(e)",
      explanation: "Passé accompli à la première personne du singulier",
      example: "Mi yahii to luumo. (Je suis allé(e) au marché.)"
    },
    'a yahii': {
      translation: "Tu es allé(e)",
      explanation: "Passé accompli à la deuxième personne du singulier",
      example: "A yahii to lekkol. (Tu es allé(e) à l’école.)"
    },
    'o yahii': {
      translation: "Il/Elle est allé(e)",
      explanation: "Passé accompli à la troisième personne du singulier",
      example: "O yahii to galle. (Il/Elle est allé(e) à la maison.)"
    },
    'minen yahii': {
      translation: "Nous sommes allé(e)s",
      explanation: "Passé accompli à la première personne du pluriel",
      example: "Minen yahii to luumo. (Nous sommes allé(e)s au marché.)"
    },
    'onon yahii': {
      translation: "Vous êtes allé(e)s",
      explanation: "Passé accompli à la deuxième personne du pluriel",
      example: "Onon yahii to lekki. (Vous êtes allé(e)s à l’école.)"
    },
    'ɓe yahii': {
      translation: "Ils/Elles sont allé(e)s",
      explanation: "Passé accompli à la troisième personne du pluriel",
      example: "ɓe yahii to galle. (Ils/Elles sont allé(e)s à la maison.)"
    }
  },

  'Prepositions base': {
    'to': {
      translation: "À, dans, vers",
      explanation: "Préposition de lieu indiquant la direction ou la position",
      example: "Mi yaha to luumo. (Je vais au marché.)"
    },
    'e': {
      translation: "Dans, sur",
      explanation: "Préposition de position",
      example: "Miɗo woni e suudu. (Je suis dans la maison.)"
    },
    'haa': {
      translation: "Jusqu’à",
      explanation: "Préposition indiquant une limite",
      example: "Mi yaha haa lekki. (Je vais jusqu’à l’école.)"
    },
    'ko': {
      translation: "Avec",
      explanation: "Préposition d’accompagnement",
      example: "Mi yaha ko aan. (Je vais avec toi.)"
    },
    'wondi': {
      translation: "Chez",
      explanation: "Préposition indiquant le lieu d’une personne",
      example: "Mi yaha wondin o. (Je vais chez lui/elle.)"
    }
  },

  'Adjectifs qualificatifs': {
    'moƴƴo': {
      translation: "Bon, bonne",
      explanation: "Adjectif qualificatif positif",
      example: "Neɗɗo moƴƴo. (Une bonne personne.)"
    },
    'mawɗo': {
      translation: "Grand, grande",
      explanation: "Adjectif de taille",
      example: "Suudu mawɗo. (Une grande maison.)"
    },
    'pamaro': {
      translation: "Petit, petite",
      explanation: "Adjectif de taille",
      example: "Cukalel pamaro. (Un petit enfant.)"
    },
    'bonngo': {
      translation: "Mauvais, mauvaise",
      explanation: "Adjectif qualificatif négatif",
      example: "Golle bonngo. (Un mauvais travail.)"
    },
    'ɗoole': {
      translation: "Fort",
      explanation: "Adjectif exprimant la force",
      example: "Neɗɗo ɗoole. (Un homme fort.)"
    },
    'rewɓe': {
      translation: "Beau, belle",
      explanation: "Adjectif esthétique",
      example: "Debbo rewɓe. (Une belle femme.)"
    },
    'ɗukkere': {
      translation: "Rapide",
      explanation: "Adjectif de vitesse",
      example: "Ferde ɗukkere. (Un cheval rapide.)"
    }
  }
};

export default grammaire;

export {};
