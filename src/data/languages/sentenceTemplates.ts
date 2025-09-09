// src/data/sentenceTemplates.ts
import { LanguageCode } from '../../types/types';

// Nouveau type pour une phrase avec sa traduction
type SentenceWithTranslation = {
  original: string;  // Phrase dans la langue cible avec ____
  french: string;    // Traduction française avec indication du mot manquant
};

// Définir un type pour les catégories
type CategoryPhrases = {
  [category: string]: SentenceWithTranslation[];
};

// Définir le type pour l'objet complet des modèles de phrases
type LanguageTemplates = {
  [key in LanguageCode]?: CategoryPhrases;
};

export const sentenceTemplatesByLanguage: LanguageTemplates = {
  'wf': { // Wolof
    'Salutations et expressions courantes': [
      {
        original: "Salamalekum! ____?",
        french: "Bonjour! Comment ____?"
      },
      {
        original: "Na nga def? ____",
        french: "Comment vas-tu? ____"
      },
      {
        original: "____ ! Naka waa kër ga?",
        french: "____ ! Comment va la famille?"
      },
      {
        original: "____ rekk. Jam nga am?",
        french: "____ seulement. Es-tu en paix?"
      },
      {
        original: "Jërejëf! ____",
        french: "Merci! ____"
      },
      {
        original: "Mangiy fi ____",
        french: "Je suis ici ____"
      },
      {
        original: "____ nga def?",
        french: "____ fais-tu?"
      },
      {
        original: "Naka ____?",
        french: "Comment ____ ?"
      },
      {
        original: "Suba tey! ____",
        french: "Bonjour! ____"
      }
    ],
    'Nombres': [
      {
        original: "Am naa ____ xaalis",
        french: "J'ai ____ argent"
      },
      {
        original: "Jënd naa ____ mburu",
        french: "J'ai acheté ____ pains"
      },
      {
        original: "Fi ak Dakar, ____ kilomeetar la",
        french: "D'ici à Dakar, c'est ____ kilomètres"
      },
      {
        original: "Dinaa jox la ____ franc", 
        french: "Je vais te donner ____ francs"
      },
      {
        original: "Sama nekk ci ____ at la",
        french: "J'ai ____ ans"
      }
    ],
    'Temps': [
      {
        original: "____ laa ñëw",
        french: "Je suis venu ____"
      },
      {
        original: "Sama xarit dina ñëw ____ ji",
        french: "Mon ami viendra à ____ heures"
      },
      {
        original: "Dinaa la seetsi ____",
        french: "Je viendrai te voir ____"
      },
      {
        original: "Dafay liggéey ____ bi",
        french: "Il/Elle travaille ____ (moment de la journée)"
      },
      {
        original: "Bi ma ñëwee ____ la amagoon",
        french: "Quand je suis arrivé, c'était ____"
      }
    ],
    'Animaux': [
      {
        original: "____ bi dafa rey ci suuf jardinal",
        french: "Le ____ court dans le jardin"
      },
      {
        original: "Gis naa ____ bu mag liggéey ci loxo",
        french: "J'ai vu un grand ____ travailler avec ses pattes"
      },
      {
        original: "Ci ñaari fan, ____ yi dañuy dem ci ndànk",
        french: "À midi, les ____ vont à l'ombre"
      },
      {
        original: "Demb, ____ bi dafa xëy ci sël",
        french: "Hier, le ____ jouait dans l'herbe"
      },
      {
        original: "Sama dad di leen soxla ____ yi",
        french: "Mon père les nourrit, ces ____"
      },
      {
        original: "Ci suba, ____ bi dafa ñëw ci kër",
        french: "Le matin, le ____ vient à la maison"
      }
    ],
    'Famille et relations': [
      {
        original: "Sama ____ dafa ñëw",
        french: "Mon/Ma ____ est venu(e)"
      },
      {
        original: "Dama bëgg sama ____",
        french: "J'aime mon/ma ____"
      },
      {
        original: "____ bi dafa toog ci kër gi",
        french: "Le/La ____ est assis(e) dans la maison"
      },
      {
        original: "Man ak sama ____ danuy dem",
        french: "Moi et mon/ma ____, nous partons"
      },
      {
        original: "Sama jabar am na ____ bu bees",
        french: "Ma femme a un(e) nouveau/nouvelle ____"
      }
    ],
    'Nourriture et boissons': [
      {
        original: "Dama bëgg lekk ____",
        french: "J'aimerais manger du/de la ____"
      },
      {
        original: "____ bi dafa neex",
        french: "Le/La ____ est délicieux/délicieuse"
      },
      {
        original: "Togg na ____ bu bari",
        french: "Il/Elle a préparé beaucoup de ____"
      },
      {
        original: "Ñam ak jam! ____",
        french: "Bon appétit! ____"
      },
      {
        original: "Bëgg naa naan ____ bi",
        french: "Je voudrais boire du/de la ____"
      }
    ],
    'Couleurs': [
      {
        original: "Sama simis dafa ____",
        french: "Ma chemise est ____"
      },
      {
        original: "Bëgg naa yéré bu ____",
        french: "Je veux un vêtement ____"
      },
      {
        original: "Xoolal garab gi, dafa ____",
        french: "Regarde l'arbre, il est ____"
      },
      {
        original: "Sama kër gi ____ la",
        french: "Ma maison est ____"
      },
      {
        original: "Muus mi ____ la mel",
        french: "Le chat est de couleur ____"
      }
    ]
  },
  'ba': { // Bambara
    'Salutations et expressions courantes': [
      {
        original: "I ni ____! An ka kene?",
        french: "____ ! Comment vas-tu?"
      },
      {
        original: "I ni ce! ____",
        french: "Bonjour homme! ____"
      },
      {
        original: "I ni sogoma! ____",
        french: "Bonjour (matin)! ____"
      },
      {
        original: "I ni tile! ____",
        french: "Bonjour (après-midi)! ____"
      },
      {
        original: "____ ! I ka kene?",
        french: "____ ! Comment vas-tu?"
      },
      {
        original: "I togo? ____",
        french: "Ton nom? ____"
      }
    ],
    'Nombres': [
      {
        original: "N'ye ____ wari sara",
        french: "J'ai payé ____ d'argent"
      },
      {
        original: "N'ye ____ buru san",
        french: "J'ai acheté ____ pains"
      },
      {
        original: "Yan ni Bamako cɛ, kilomɛtiri ____",
        french: "Entre ici et Bamako, il y a ____ kilomètres"
      },
      {
        original: "N bɛ ____ sɔrɔ yan",
        french: "Je trouve ____ ici"
      },
      {
        original: "A bɛ ____ dɔrɔn fɛ",
        french: "Il/Elle n'en veut que ____"
      }
    ],
    'Temps': [
      {
        original: "N nana ____",
        french: "Je suis venu ____"
      },
      {
        original: "N teriké bɛna na ____",
        french: "Mon ami viendra ____"
      },
      {
        original: "N bɛna i ____ don min",
        french: "Je vais te voir ____ quand"
      },
      {
        original: "Sini ____ n bɛna taa",
        french: "Demain ____ je partirai"
      },
      {
        original: "A bɛ segin ____ fɛ",
        french: "Il/Elle revient vers ____"
      }
    ]
  },
  'la': { // Lingala
    'Salutations et expressions courantes': [
      {
        original: "Mbote ____ !",
        french: "Bonjour ____ !"
      },
      {
        original: "Mbote na yo! ____",
        french: "Bonjour à toi! ____"
      },
      {
        original: "____ na yo ya ntongo!",
        french: "____ à toi ce matin!"
      },
      {
        original: "____ na yo ya mokolo!",
        french: "____ à toi ce jour!"
      },
      {
        original: "____ na yo ya mpokwa!",
        french: "____ à toi ce soir!"
      }
    ],
    'Nombres': [
      {
        original: "Nazali na ____ mbongo",
        french: "J'ai ____ d'argent"
      },
      {
        original: "Nasombi ____ lipa",
        french: "J'ai acheté ____ pains"
      },
      {
        original: "Awa na Kinshasa, ____ ba kilomɛtrɛ",
        french: "D'ici à Kinshasa, il y a ____ kilomètres"
      },
      {
        original: "Nakopesa yo ____ francs",
        french: "Je vais te donner ____ francs"
      },
      {
        original: "Nazali na mibu ____",
        french: "J'ai ____ ans"
      }
    ]
  },
  'ff': { // Peul/Fulfulde
    'Salutations et expressions courantes': [
      {
        original: "Tana ____!",
        french: "____ !"
      },
      {
        original: "A ____ ma?",
        french: "Es-tu ____ ?"
      },
      {
        original: "Mi yiɗi ____ ma",
        french: "Je veux te ____"
      },
      {
        original: "Ko ____ woni?",
        french: "Qu'est-ce que ____ est?"
      },
      {
        original: "War ____ woɗɗani kam",
        french: "Tu dois ____ pour moi"
      }
    ]
  },
  'co': { // Corse
    'Salutations et expressions courantes': [
      {
        original: "____ ! Cumu và?",
        french: "____ ! Comment ça va?"
      },
      {
        original: "Sò ____ caru amicu",
        french: "Tu es ____ cher ami"
      },
      {
        original: "Ti ____ cù tuttu u mo core",
        french: "Je te ____ de tout mon cœur"
      },
      {
        original: "U to ____ hè bellu",
        french: "Ton ____ est beau"
      },
      {
        original: "Ùn cunnisciute micca ____ mi stona",
        french: "Je ne connais pas ____ qui m'étonne"
      }
    ]
  }
};

// Fonction modifiée pour générer des phrases de contexte
export const generateContextSentence = (
  word: string, 
  category: string, 
  languageCode: LanguageCode,
  translation: string // L'indice ou la traduction du mot à deviner
): { original: string; french: string } => {
  const templatesForLanguage: CategoryPhrases = sentenceTemplatesByLanguage[languageCode] || {};
  const templates = templatesForLanguage[category] || [];
  
  if (templates.length > 0) {
    // Sélectionner un template aléatoire
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Pour la phrase originale, nous gardons le trou
    const originalWithGap = template.original;
    
    // Vérifier si le mot doit être au pluriel dans la traduction française
    let wordInContext = translation;
    
    // Détecter les marqueurs de pluriel dans la phrase française
    const needsPlural = template.french.includes("les ____") || 
                       template.french.includes("ces ____") ||
                       template.french.includes("des ____") ||
                       template.french.includes("aux ____") ||
                       template.french.includes("mes ____") ||
                       template.french.includes("tes ____") ||
                       template.french.includes("ses ____") ||
                       template.french.includes("nos ____") ||
                       template.french.includes("vos ____") ||
                       template.french.includes("leurs ____");
                       
    // Ajouter 's' au mot si nécessaire et si ce n'est pas déjà un pluriel
    if (needsPlural && !wordInContext.endsWith('s') && !wordInContext.endsWith('x')) {
      // Cas spéciaux de pluriel en français
      if (wordInContext.endsWith('al')) {
        wordInContext = wordInContext.slice(0, -2) + 'aux';
      } else if (wordInContext.endsWith('au') || wordInContext.endsWith('eu')) {
        wordInContext = wordInContext + 'x';
      } else {
        wordInContext = wordInContext + 's';
      }
    }
    
    // Pour la traduction française, remplacer ____ par la traduction du mot
    const frenchWithTranslation = template.french.replace(
      new RegExp("____", 'g'), 
      wordInContext // Utiliser la version correcte (singulier/pluriel)
    );
    
    return {
      original: originalWithGap,
      french: frenchWithTranslation
    };
  }

  // Fallback
  return {
    original: `${word} ...`,
    french: `${translation} ...`
  };
};