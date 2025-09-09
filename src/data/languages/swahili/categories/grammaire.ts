// data/languages/swahili/categories/grammaire.ts

import { GrammarCategory } from '../../../../types/types';

export const grammaire: GrammarCategory = {
  'Pronoms personnels': {
    // Pronoms sujets
    'Ni': { 
      translation: "Je", 
      explanation: "Première personne du singulier - sujet",
      example: "Ni mwalimu. (Je suis enseignant.)"
    },
    'U': { 
      translation: "Tu", 
      explanation: "Deuxième personne du singulier - sujet",
      example: "U mwalimu. (Tu es enseignant.)"
    },
    'A': { 
      translation: "Il/Elle", 
      explanation: "Troisième personne du singulier - sujet",
      example: "A mwalimu. (Il/Elle est enseignant.)"
    },
    'Tu': { 
      translation: "Nous", 
      explanation: "Première personne du pluriel - sujet",
      example: "Tu walimu. (Nous sommes enseignants.)"
    },
    'M': { 
      translation: "Vous", 
      explanation: "Deuxième personne du pluriel - sujet",
      example: "M walimu. (Vous êtes enseignants.)"
    },
    'Wa': { 
      translation: "Ils/Elles", 
      explanation: "Troisième personne du pluriel - sujet",
      example: "Wa walimu. (Ils/Elles sont enseignants.)"
    },

    // Pronoms objets
    'Ni (Moi)': { 
      translation: "Me/Moi", 
      explanation: "Première personne du singulier - objet",
      example: "Ananiita. (Il/Elle m'appelle.)"
    },
    'Ku': { 
      translation: "Te/Toi", 
      explanation: "Deuxième personne du singulier - objet",
      example: "Ninakuita. (Je t'appelle.)"
    },
    'M (Le/La)': { 
      translation: "Le/La", 
      explanation: "Troisième personne du singulier - objet",
      example: "Ninamwita. (Je l'appelle.)"
    },
    'Tu (Nous)': { 
      translation: "Nous", 
      explanation: "Première personne du pluriel - objet",
      example: "Anatuita. (Il/Elle nous appelle.)"
    },
    'Wa (Vous)': { 
      translation: "Vous", 
      explanation: "Deuxième personne du pluriel - objet",
      example: "Ninawaita. (Je vous appelle.)"
    },
    'Wa (Les)': { 
      translation: "Les", 
      explanation: "Troisième personne du pluriel - objet",
      example: "Ninawaita. (Je les appelle.)"
    },

    // Pronoms possessifs
    'Yangu': { 
      translation: "Mon/Ma", 
      explanation: "Possessif première personne du singulier (classe ya/zi)",
      example: "Nyumba yangu. (Ma maison.)"
    },
    'Yako': { 
      translation: "Ton/Ta", 
      explanation: "Possessif deuxième personne du singulier (classe ya/zi)",
      example: "Nyumba yako. (Ta maison.)"
    },
    'Yake': { 
      translation: "Son/Sa", 
      explanation: "Possessif troisième personne du singulier (classe ya/zi)",
      example: "Nyumba yake. (Sa maison.)"
    },
    'Yetu': { 
      translation: "Notre", 
      explanation: "Possessif première personne du pluriel (classe ya/zi)",
      example: "Nyumba yetu. (Notre maison.)"
    },
    'Yenu': { 
      translation: "Votre", 
      explanation: "Possessif deuxième personne du pluriel (classe ya/zi)",
      example: "Nyumba yenu. (Votre maison.)"
    },
    'Yao': { 
      translation: "Leur", 
      explanation: "Possessif troisième personne du pluriel (classe ya/zi)",
      example: "Nyumba yao. (Leur maison.)"
    }
  },

  'Temps verbaux': {
    'Na': { 
      translation: "Présent/Présent progressif", 
      explanation: "Temps présent, exprime une action en cours ou habituelle",
      example: "Ninasoma. (Je lis/Je suis en train de lire.)"
    },
    'Li': { 
      translation: "Passé", 
      explanation: "Passé simple, exprime une action accomplie",
      example: "Nilisoma. (J'ai lu.)"
    },
    'Ta': { 
      translation: "Futur", 
      explanation: "Futur simple, exprime une action future",
      example: "Nitasoma. (Je lirai.)"
    },
    'Me': { 
      translation: "Parfait", 
      explanation: "Temps parfait, exprime un état résultant d'une action passée",
      example: "Nimesoma. (J'ai fini de lire.)"
    },
    'Ki': { 
      translation: "Conditionnel", 
      explanation: "Mode conditionnel, exprime une condition ou possibilité",
      example: "Nikisoma. (Si je lis.)"
    },
    'Nge': { 
      translation: "Conditionnel hypothétique", 
      explanation: "Conditionnel irréel, exprime une hypothèse",
      example: "Ningesoma. (Je lirais - si c'était possible.)"
    },
    'Ngali': { 
      translation: "Conditionnel passé", 
      explanation: "Conditionnel passé, exprime ce qui aurait pu arriver",
      example: "Ningalisoma. (J'aurais lu.)"
    },
    'Hu': { 
      translation: "Habituel", 
      explanation: "Temps habituel, exprime une action répétée ou habituelle",
      example: "Husoma. (Je lis habituellement.)"
    }
  },

  'Prépositions': {
    'Katika': { 
      translation: "Dans, à", 
      explanation: "Préposition de lieu, indique la position à l'intérieur",
      example: "Kiko katika nyumba. (C'est dans la maison.)"
    },
    'Kwa': { 
      translation: "Chez, avec, par", 
      explanation: "Préposition polyvalente pour lieu, moyen, accompagnement",
      example: "Nenda kwa daktari. (Va chez le docteur.)"
    },
    'Na': { 
      translation: "Avec, et", 
      explanation: "Conjonction et préposition d'accompagnement",
      example: "Nenda na mimi. (Viens avec moi.)"
    },
    'Bila': { 
      translation: "Sans", 
      explanation: "Préposition d'exclusion ou d'absence",
      example: "Alifika bila chakula. (Il est arrivé sans nourriture.)"
    },
    'Baada ya': { 
      translation: "Après", 
      explanation: "Locution prépositionnelle temporelle de postériorité",
      example: "Baada ya kula. (Après avoir mangé.)"
    },
    'Kabla ya': { 
      translation: "Avant", 
      explanation: "Locution prépositionnelle temporelle d'antériorité",
      example: "Kabla ya kwenda. (Avant d'aller.)"
    },
    'Juu ya': { 
      translation: "Sur, au-dessus de", 
      explanation: "Locution prépositionnelle de position supérieure",
      example: "Kitabu kiko juu ya meza. (Le livre est sur la table.)"
    },
    'Chini ya': { 
      translation: "Sous, en dessous de", 
      explanation: "Locution prépositionnelle de position inférieure",
      example: "Paka yu chini ya meza. (Le chat est sous la table.)"
    }
  },

  'Adjectifs': {
    'Mzuri': {
      translation: "Bon, beau, bien",
      explanation: "Adjectif qualificatif positif général",
      example: "Nyumba nzuri. (Une belle maison.)"
    },
    'Mbaya': {
      translation: "Mauvais, laid",
      explanation: "Adjectif qualificatif négatif, opposé de mzuri",
      example: "Hali ya anga mbaya. (Le temps est mauvais.)"
    },
    'Mkubwa': {
      translation: "Grand, gros",
      explanation: "Adjectif de taille - grande dimension",
      example: "Nyumba kubwa. (Une grande maison.)"
    },
    'Mdogo': {
      translation: "Petit, jeune",
      explanation: "Adjectif de taille - petite dimension",
      example: "Mtoto mdogo. (Un petit enfant.)"
    },
    'Mrefu': {
      translation: "Long, grand (taille)",
      explanation: "Adjectif de longueur ou de hauteur",
      example: "Mti mrefu. (Un grand arbre.)"
    },
    'Mfupi': {
      translation: "Court, petit (taille)",
      explanation: "Adjectif de longueur courte, opposé de mrefu",
      example: "Kamba fupi. (Une corde courte.)"
    },
    'Mpya': {
      translation: "Nouveau, neuf",
      explanation: "Adjectif temporel indiquant la nouveauté",
      example: "Gari jipya. (Une voiture neuve.)"
    },
    'Mzee': {
      translation: "Vieux, âgé",
      explanation: "Adjectif temporel indiquant l'âge avancé",
      example: "Mzee mkongwe. (Un vieil homme.)"
    }
  }
};

export default grammaire;

export {};