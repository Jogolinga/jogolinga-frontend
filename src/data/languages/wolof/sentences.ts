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
    description: 'Se présenter et apprendre les démonstratifs',
  },
  'Vie quotidienne': {
    icon: '🌞',
    description: 'Expressions du quotidien et présent démonstratif',
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
    description: 'Parler de sa famille et apprendre les pluriels',
  },
  'Urgences et santé': {
    icon: '🏥',
    description: 'Situations d\'urgence et santé',
  },
  'Loisirs et culture': {
    icon: '🎭',
    description: 'Activités culturelles et divertissement',
  },
} as const;

export const sentencesToConstruct: Sentence[] = [
  // Phrases démonstratives - intégrées dans "Vie quotidienne"
  {
    original: "Mangi fii",
    french: "Je suis ici",
    words: ["Mangi", "fii"],
    audio: "/audio/sentences/demonstratives/mangi_fii.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'présence', 'localisation', 'grammaire']
  },
  {
    original: "Yangi toog",
    french: "Tu es assis",
    words: ["Yangi", "toog"],
    audio: "/audio/sentences/demonstratives/yangi_toog.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'position', 'présent', 'grammaire']
  },
  {
    original: "Mungi dem",
    french: "Il/Elle est en train de partir",
    words: ["Mungi", "dem"],
    audio: "/audio/sentences/demonstratives/mungi_dem.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'mouvement', 'départ', 'grammaire']
  },
  {
    original: "Ñungi toog ci kër gi",
    french: "Nous sommes assis dans cette maison",
    words: ["Ñungi", "toog", "ci", "kër", "gi"],
    audio: "/audio/sentences/demonstratives/nungi_toog_ci_ker_gi.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'pluriel', 'localisation', 'grammaire']
  },
  {
    original: "Yéénangi xool",
    french: "Vous êtes en train de regarder",
    words: ["Yéénangi", "xool"],
    audio: "/audio/sentences/demonstratives/yeenangi_xool.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'action', 'présent', 'grammaire']
  },
  {
    original: "Ñungë nellaw",
    french: "Ils/Elles dorment",
    words: ["Ñungë", "nellaw"],
    audio: "/audio/sentences/demonstratives/nunge_nellaw.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'pluriel', 'sommeil', 'grammaire']
  },
  {
    original: "Taksi bangi dem",
    french: "Ce taxi-ci s'en va",
    words: ["Taksi", "bangi", "dem"],
    audio: "/audio/sentences/demonstratives/taksi_bangi_dem.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'transport', 'proximité', 'grammaire']
  },
  {
    original: "Jiggéén jangi toog",
    french: "Cette femme-là est assise",
    words: ["Jiggéén", "jangi", "toog"],
    audio: "/audio/sentences/demonstratives/jiggeen_jangi_toog.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'éloignement', 'position', 'grammaire']
  },
  {
    original: "Goor gangiy liggéy",
    french: "Ce garçon-ci est en train de travailler",
    words: ["Goor", "gangiy", "liggéy"],
    audio: "/audio/sentences/demonstratives/goor_gangiy_liggey.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'proximité', 'travail', 'grammaire']
  },
  {
    original: "Nit ñangiy lekk cééb bi",
    french: "Ces personnes sont en train de manger ce riz",
    words: ["Nit", "ñangiy", "lekk", "cééb", "bi"],
    audio: "/audio/sentences/demonstratives/nit_nangiy_lekk_ceeb_bi.mp3",
    category: 'Vie quotidienne',
    tags: ['démonstratif', 'pluriel', 'nourriture', 'grammaire']
  },

  // Phrases avec démonstratifs et distance - intégrées dans "Présentation"
  {
    original: "Bunt bi nekk fii",
    french: "Cette porte-ci est ici",
    words: ["Bunt", "bi", "nekk", "fii"],
    audio: "/audio/sentences/demonstratives/bunt_bi_nekk_fii.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'proximité', 'objet', 'grammaire']
  },
  {
    original: "Cin lë am ndox",
    french: "Cette marmite-là contient de l'eau",
    words: ["Cin", "lë", "am", "ndox"],
    audio: "/audio/sentences/demonstratives/cin_le_am_ndox.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'éloignement', 'récipient', 'grammaire']
  },
  {
    original: "Fas wi gudd na",
    french: "Ce cheval-ci est grand",
    words: ["Fas", "wi", "gudd", "na"],
    audio: "/audio/sentences/demonstratives/fas_wi_gudd_na.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'animal', 'description', 'grammaire']
  },
  {
    original: "Nit ki rafet na",
    french: "Cette personne-ci est belle",
    words: ["Nit", "ki", "rafet", "na"],
    audio: "/audio/sentences/demonstratives/nit_ki_rafet_na.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'beauté', 'personne', 'grammaire']
  },
  {
    original: "Kër boobu yombul",
    french: "Cette maison là-bas n'est pas bon marché",
    words: ["Kër", "boobu", "yombul"],
    audio: "/audio/sentences/demonstratives/ker_boobu_yombul.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'distance', 'négation', 'grammaire']
  },
  {
    original: "Xar bëlé gudd na lool",
    french: "Ce mouton là-bas au loin est très grand",
    words: ["Xar", "bëlé", "gudd", "na", "lool"],
    audio: "/audio/sentences/demonstratives/xar_bele_gudd_na_lool.mp3",
    category: 'Présentation',
    tags: ['démonstratif', 'distance_lointaine', 'animal', 'grammaire']
  },

  // Phrases avec pluriels - intégrées dans "Famille et relations"
  {
    original: "Bunt yi ubbalu",
    french: "Ces portes ne s'ouvrent pas",
    words: ["Bunt", "yi", "ubbalu"],
    audio: "/audio/sentences/pluriels/bunt_yi_ubbalu.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'négation', 'action', 'grammaire']
  },
  {
    original: "Cin yë am ndox",
    french: "Ces marmites-là contiennent de l'eau",
    words: ["Cin", "yë", "am", "ndox"],
    audio: "/audio/sentences/pluriels/cin_ye_am_ndox.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'récipient', 'contenu', 'grammaire']
  },
  {
    original: "Fas yi gudd nañu",
    french: "Ces chevaux-ci sont grands",
    words: ["Fas", "yi", "gudd", "nañu"],
    audio: "/audio/sentences/pluriels/fas_yi_gudd_nanu.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'animal', 'description', 'grammaire']
  },
  {
    original: "Nit ñi rafet nañu",
    french: "Ces personnes-ci sont belles",
    words: ["Nit", "ñi", "rafet", "nañu"],
    audio: "/audio/sentences/pluriels/nit_ni_rafet_nanu.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'personne', 'beauté', 'grammaire']
  },
  {
    original: "Xaj yi dañuy daw",
    french: "Ces chiens sont en train de courir",
    words: ["Xaj", "yi", "dañuy", "daw"],
    audio: "/audio/sentences/pluriels/xaj_yi_danuy_daw.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'animal', 'mouvement', 'grammaire']
  },
  {
    original: "Téere yi jafe nañu",
    french: "Ces livres-ci sont chers",
    words: ["Téere", "yi", "jafe", "nañu"],
    audio: "/audio/sentences/pluriels/teere_yi_jafe_nanu.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'objet', 'prix', 'grammaire']
  },
  {
    original: "Jiggéen yi dañuy tog",
    french: "Ces femmes sont en train de cuisiner",
    words: ["Jiggéen", "yi", "dañuy", "tog"],
    audio: "/audio/sentences/pluriels/jiggeen_yi_danuy_tog.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'personne', 'cuisine', 'grammaire']
  },
  {
    original: "Goor yi dañuy liggéy",
    french: "Ces hommes sont en train de travailler",
    words: ["Goor", "yi", "dañuy", "liggéy"],
    audio: "/audio/sentences/pluriels/goor_yi_danuy_liggey.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'personne', 'travail', 'grammaire']
  },
  {
    original: "Xar yi lekk nañu xob yi",
    french: "Ces moutons mangent ces feuilles",
    words: ["Xar", "yi", "lekk", "nañu", "xob", "yi"],
    audio: "/audio/sentences/pluriels/xar_yi_lekk_nanu_xob_yi.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'animal', 'nourriture', 'grammaire']
  },
  {
    original: "Doom yi bëgg nañu jel téere yi",
    french: "Ces enfants veulent prendre ces livres",
    words: ["Doom", "yi", "bëgg", "nañu", "jel", "téere", "yi"],
    audio: "/audio/sentences/pluriels/doom_yi_begg_nanu_jel_teere_yi.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'enfant', 'désir', 'grammaire']
  },
  {
    original: "Taksi yooyu dem nañu dekk bë",
    french: "Ces taxis là-bas vont en ville",
    words: ["Taksi", "yooyu", "dem", "nañu", "dekk", "bë"],
    audio: "/audio/sentences/pluriels/taksi_yooyu_dem_nanu_dekk_be.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'transport', 'destination', 'grammaire']
  },
  {
    original: "Muus yi dañuy japp genn yi",
    french: "Ces chats sont en train d'attraper ces souris",
    words: ["Muus", "yi", "dañuy", "japp", "genn", "yi"],
    audio: "/audio/sentences/pluriels/muus_yi_danuy_japp_genn_yi.mp3",
    category: 'Famille et relations',
    tags: ['pluriel', 'animal', 'chasse', 'grammaire']
  },

  // Salutations
  {
    original: "Nanga def ?",
    french: "Comment allez-vous ?",
    words: ["Nanga", "def", "?"],
    audio: "/audio/sentences/salutations/nanga_def.mp3",
    category: 'Salutations',
    tags: ['salutations', 'quotidien']
  },
  {
    original: "Maa ngi ci jàmm",
    french: "Je vais bien",
    words: ["Maa", "ngi", "ci", "jàmm"],
    audio: "/audio/sentences/salutations/maa_ngi_ci_jamm.mp3",
    category: 'Salutations',
    tags: ['salutations', 'réponses']
  },
  {
    original: "Ba beneen yoon",
    french: "À la prochaine fois",
    words: ["Ba", "beneen", "yoon"],
    audio: "/audio/sentences/salutations/ba_beneen_yoon.mp3",
    category: 'Salutations',
    tags: ['au revoir', 'politesse']
  },
  {
    original: "Jàmm nga fanaan",
    french: "Bonne nuit",
    words: ["Jàmm", "nga", "fanaan"],
    audio: "/audio/sentences/salutations/jamm_nga_fanaan.mp3",
    category: 'Salutations',
    tags: ['au revoir', 'nuit']
  },
  {
    original: "Na nga def ?",
    french: "Comment vas-tu ?",
    words: ["Na", "nga", "def", "?"],
    audio: "/audio/sentences/salutations/na_nga_def.mp3",
    category: 'Salutations',
    tags: ['salutations', 'informel']
  },
  {
    original: "Salamaalekum",
    french: "Bonjour (salutation traditionnelle)",
    words: ["Salamaalekum"],
    audio: "/audio/sentences/salutations/salamaalekum.mp3",
    category: 'Salutations',
    tags: ['salutations', 'traditionnel']
  },
  {
    original: "Maalekum salaam",
    french: "Bonjour (réponse à Salamaalekum)",
    words: ["Maalekum", "salaam"],
    audio: "/audio/sentences/salutations/maalekum_salaam.mp3",
    category: 'Salutations',
    tags: ['salutations', 'réponse']
  },
  {
    original: "Jàmm ak jàmm",
    french: "Paix et paix (au revoir)",
    words: ["Jàmm", "ak", "jàmm"],
    audio: "/audio/sentences/salutations/jamm_ak_jamm.mp3",
    category: 'Salutations',
    tags: ['au revoir', 'traditionnel']
  },
  {
    original: "Nunga def ?",
    french: "Comment allez-vous ? (pluriel)",
    words: ["Nunga", "def", "?"],
    audio: "/audio/sentences/salutations/nunga_def.mp3",
    category: 'Salutations',
    tags: ['salutations', 'pluriel']
  },
  {
    original: "Mangi fi rekk",
    french: "Je vais bien (littéralement: je suis là seulement)",
    words: ["Mangi", "fi", "rekk"],
    audio: "/audio/sentences/salutations/mangi_fi_rekk.mp3",
    category: 'Salutations',
    tags: ['réponse', 'informel']
  },
  {
    original: "Bu suba",
    french: "À demain",
    words: ["Bu", "suba"],
    audio: "/audio/sentences/salutations/bu_suba.mp3",
    category: 'Salutations',
    tags: ['au revoir', 'temps']
  },
  {
    original: "Baal ma",
    french: "Pardon / Excuse-moi",
    words: ["Baal", "ma"],
    audio: "/audio/sentences/salutations/baal_ma.mp3",
    category: 'Salutations',
    tags: ['politesse', 'excuses']
  },
 
  {
    original: "Mangi fii",
    french: "Je suis ici",
    words: ["Mangi", "fii"],
    audio: "/audio/sentences/salutations/mangi_fii.mp3",
    category: 'Salutations',
    tags: ['localisation', 'présence']
  },

  // Présentation
  {
    original: "Mangi jang wolof",
    french: "J'apprends le wolof",
    words: ["Mangi", "jang", "wolof"],
    audio: "/audio/sentences/presentation/mangi_jang_wolof.mp3",
    category: 'Présentation',
    tags: ['apprentissage', 'présentation']
  },
  {
    original: "Noo tudd ?",
    french: "Comment t'appelles-tu ?",
    words: ["Noo", "tudd", "?"],
    audio: "/audio/sentences/presentation/noo_tudd.mp3",
    category: 'Présentation',
    tags: ['présentation', 'nom']
  },
  {
    original: "Fo dëkk ?",
    french: "Où habites-tu ?",
    words: ["Fo", "dëkk", "?"],
    audio: "/audio/sentences/presentation/fo_dekk.mp3",
    category: 'Présentation',
    tags: ['lieu', 'habitation']
  },
  {
    original: "Mangi dëkk ci Dakar",
    french: "J'habite à Dakar",
    words: ["Mangi", "dëkk", "ci", "Dakar"],
    audio: "/audio/sentences/presentation/mangi_dekk_ci_dakar.mp3",
    category: 'Présentation',
    tags: ['lieu', 'ville']
  },
  {
    original: "Fan nga joge ?",
    french: "D'où viens-tu ?",
    words: ["Fan", "nga", "joge", "?"],
    audio: "/audio/sentences/presentation/fan_nga_joge.mp3",
    category: 'Présentation',
    tags: ['origine', 'question']
  },
  {
    original: "Sama tur mooy",
    french: "Mon nom est",
    words: ["Sama", "tur", "mooy"],
    audio: "/audio/sentences/presentation/sama_tur_mooy.mp3",
    category: 'Présentation',
    tags: ['nom', 'présentation']
  },
  {
    original: "Ban att nga am ?",
    french: "Quel âge as-tu ?",
    words: ["Ban", "att", "nga", "am", "?"],
    audio: "/audio/sentences/presentation/ban_att_nga_am.mp3",
    category: 'Présentation',
    tags: ['âge', 'question']
  },
  {
    original: "Lu nga def ci benn fan ?",
    french: "Que fais-tu dans la vie ?",
    words: ["Lu", "nga", "def", "ci", "benn", "fan", "?"],
    audio: "/audio/sentences/presentation/lu_nga_def_ci_benn_fan.mp3",
    category: 'Présentation',
    tags: ['métier', 'question']
  },
  {
    original: "Dama liggéey ci",
    french: "Je travaille dans/à",
    words: ["Dama", "liggéey", "ci"],
    audio: "/audio/sentences/presentation/dama_liggeey_ci.mp3",
    category: 'Présentation',
    tags: ['métier', 'travail']
  },
  {
    original: "Liggéeykat laa",
    french: "Je suis un travailleur",
    words: ["Liggéeykat", "laa"],
    audio: "/audio/sentences/presentation/liggeeykat_laa.mp3",
    category: 'Présentation',
    tags: ['métier', 'identité']
  },
  {
    original: "Damay jàngale",
    french: "Je suis enseignant",
    words: ["Damay", "jàngale"],
    audio: "/audio/sentences/presentation/damay_jangale.mp3",
    category: 'Présentation',
    tags: ['métier', 'éducation']
  },
  {
    original: "Man damay waxyi wolof",
    french: "Je parle un peu wolof",
    words: ["Man", "damay", "waxyi", "wolof"],
    audio: "/audio/sentences/presentation/man_damay_waxyi_wolof.mp3",
    category: 'Présentation',
    tags: ['langue', 'capacité']
  },
  {
    original: "Mangi jel sumë tééré",
    french: "Je prends mon livre",
    words: ["Mangi", "jel", "sumë", "tééré"],
    audio: "/audio/sentences/presentation/mangi_jel_sume_teere.mp3",
    category: 'Présentation',
    tags: ['possessif', 'objet', 'livre']
  },
  {
    original: "Ñewkatu Sénégal, dañuy liggey bu baax",
    french: "Les couturiers du Sénégal travaillent bien",
    words: ["Ñewkatu", "Sénégal", "dañuy", "liggey", "bu", "baax"],
    audio: "/audio/sentences/presentation/newkat_u_senegal_danuy_liggey_bu_baax.mp3",
    category: 'Présentation',
    tags: ['métier', 'pays', 'qualité', 'travail']
  },
  {
    original: "Di naa jang tééré bi subë",
    french: "Je lirai ce livre demain",
    words: ["Di", "naa", "jang", "tééré", "bi", "subë"],
    audio: "/audio/sentences/presentation/di_naa_jang_teere_bi_sube.mp3",
    category: 'Présentation',
    tags: ['futur', 'lecture', 'livre']
  },
  {
    original: "Duma dem ja subë",
    french: "Je n'irai pas au marché demain",
    words: ["Duma", "dem", "ja", "subë"],
    audio: "/audio/sentences/presentation/duma_dem_ja_sube.mp3",
    category: 'Présentation',
    tags: ['futur', 'négation', 'marché']
  },

  // Vie quotidienne
  {
    original: "Dama xiif",
    french: "J'ai faim",
    words: ["Dama", "xiif"],
    audio: "/audio/sentences/vie_quotidienne/dama_xiif.mp3",
    category: 'Vie quotidienne',
    tags: ['état', 'nourriture']
  },
  {
    original: "Dama mar",
    french: "J'ai soif",
    words: ["Dama", "mar"],
    audio: "/audio/sentences/vie_quotidienne/dama_mar.mp3",
    category: 'Vie quotidienne',
    tags: ['état', 'boisson']
  },
  {
    original: "Dama sonn",
    french: "Je suis fatigué(e)",
    words: ["Dama", "sonn"],
    audio: "/audio/sentences/vie_quotidienne/dama_sonn.mp3",
    category: 'Vie quotidienne',
    tags: ['état', 'fatigue']
  },
  {
    original: "Nañu naan attaaya",
    french: "Nous avons bu du thé",
    words: ["Nañu", "naan", "attaaya"],
    audio: "/audio/sentences/vie_quotidienne/nanu_naan_attaaya.mp3",
    category: 'Vie quotidienne',
    tags: ['boisson', 'social']
  },
  {
    original: "Lekk naa ba suur",
    french: "J'ai bien mangé",
    words: ["Lekk", "naa", "ba", "suur"],
    audio: "/audio/sentences/vie_quotidienne/lekk_naa_ba_suur.mp3",
    category: 'Vie quotidienne',
    tags: ['nourriture', 'satisfaction']
  },
  {
    original: "Dama toog di noppaliku",
    french: "Je me repose",
    words: ["Dama", "toog", "di", "noppaliku"],
    audio: "/audio/sentences/vie_quotidienne/dama_toog_di_noppaliku.mp3",
    category: 'Vie quotidienne',
    tags: ['repos', 'activité']
  },
  {
    original: "Lu bees am ?",
    french: "Quoi de neuf ?",
    words: ["Lu", "bees", "am", "?"],
    audio: "/audio/sentences/vie_quotidienne/lu_bees_am.mp3",
    category: 'Vie quotidienne',
    tags: ['conversation', 'quotidien']
  },
  {
    original: "Dama feebar",
    french: "Je suis malade",
    words: ["Dama", "feebar"],
    audio: "/audio/sentences/vie_quotidienne/dama_feebar.mp3",
    category: 'Vie quotidienne',
    tags: ['santé', 'état']
  },
  {
    original: "Dama toog ci kër gi",
    french: "Je reste à la maison",
    words: ["Dama", "toog", "ci", "kër", "gi"],
    audio: "/audio/sentences/vie_quotidienne/dama_toog_ci_ker_gi.mp3",
    category: 'Vie quotidienne',
    tags: ['maison', 'activité']
  },
  {
    original: "Dama bëgg nelaw",
    french: "J'ai envie de dormir",
    words: ["Dama", "bëgg", "nelaw"],
    audio: "/audio/sentences/vie_quotidienne/dama_begg_nelaw.mp3",
    category: 'Vie quotidienne',
    tags: ['sommeil', 'état']
  },
  {
    original: "Ban waxtu jot ?",
    french: "Quelle heure est-il ?",
    words: ["Ban", "waxtu", "jot", "?"],
    audio: "/audio/sentences/vie_quotidienne/ban_waxtu_jot.mp3",
    category: 'Vie quotidienne',
    tags: ['temps', 'question']
  },
  {
    original: "Ndax am nga safara ?",
    french: "As-tu du feu ?",
    words: ["Ndax", "am", "nga", "safara", "?"],
    audio: "/audio/sentences/vie_quotidienne/ndax_am_nga_safara.mp3",
    category: 'Vie quotidienne',
    tags: ['utilitaire', 'question']
  },
  {
    original: "Mangi fii di lekk",
    french: "Je suis en train de manger",
    words: ["Mangi", "fii", "di", "lekk"],
    audio: "/audio/sentences/vie_quotidienne/mangi_fii_di_lekk.mp3",
    category: 'Vie quotidienne',
    tags: ['progressif', 'présent', 'action']
  },
  {
    original: "Yéénangi toog",
    french: "Vous êtes assis",
    words: ["Yéénangi", "toog"],
    audio: "/audio/sentences/vie_quotidienne/yeenangi_toog.mp3",
    category: 'Vie quotidienne',
    tags: ['présent', 'état', 'position']
  },
  {
    original: "Ñungë nellaw",
    french: "Ils dorment",
    words: ["Ñungë", "nellaw"],
    audio: "/audio/sentences/vie_quotidienne/nunge_nellaw.mp3",
    category: 'Vie quotidienne',
    tags: ['présent', 'action', 'sommeil']
  },
  {
    original: "mungiy dem",
    french: "Il est en train de partir",
    words: ["mu","ngi", "dem"],
    audio: "/audio/sentences/vie_quotidienne/mungiy_dem.mp3",
    category: 'Vie quotidienne',
    tags: ['mouvement', 'départ', 'progressif']
  },
  {
    original: "yangiy tog",
    french: "Tu es en train de cuisiner",
    words: ["yangiy", "tog"],
    audio: "/audio/sentences/vie_quotidienne/yangiy_tog.mp3",
    category: 'Vie quotidienne',
    tags: ['progressif', 'cuisine']
  },
  {
    original: "yéénangiy dox",
    french: "Vous êtes en train de marcher",
    words: ["yéénangiy", "dox"],
    audio: "/audio/sentences/vie_quotidienne/yeenangy_dox.mp3",
    category: 'Vie quotidienne',
    tags: ['progressif', 'mouvement']
  },
  {
    original: "Job, dafay liggey",
    french: "Diop est en train de travailler",
    words: ["Job", "dafay", "liggey"],
    audio: "/audio/sentences/vie_quotidienne/job_dafay_liggey.mp3",
    category: 'Vie quotidienne',
    tags: ['travail', 'progressif', 'nom propre']
  },
  {
    original: "Kañ ngëy xiim attaya ?",
    french: "Quand fais-tu du thé ?",
    words: ["Kañ", "ngëy", "xiim", "attaya", "?"],
    audio: "/audio/sentences/vie_quotidienne/kan_ngey_xiim_attaya.mp3",
    category: 'Vie quotidienne',
    tags: ['thé', 'temps', 'question']
  },
  {
    original: "Cééb bi mo gënë neex cééb boobu",
    french: "Ce riz-ci est meilleur que celui-là",
    words: ["Cééb", "bi", "mo", "gënë", "neex", "cééb", "boobu"],
    audio: "/audio/sentences/vie_quotidienne/ceeb_bi_mo_gene_neex_ceeb_boobu.mp3",
    category: 'Vie quotidienne',
    tags: ['comparaison', 'nourriture', 'qualité']
  },
  {
    original: "Man maa gënë yakkamti yow",
    french: "Je suis plus pressé que toi",
    words: ["Man", "maa", "gënë", "yakkamti", "yow"],
    audio: "/audio/sentences/vie_quotidienne/man_maa_gene_yakkamti_yow.mp3",
    category: 'Vie quotidienne',
    tags: ['comparaison', 'état', 'urgence']
  },

  // Au marché
  {
    original: "Nañu dem ca màrse ba",
    french: "Allons au marché",
    words: ["Nañu", "dem", "ca", "màrse", "ba"],
    audio: "/audio/sentences/au_marche/nanu_dem_ca_marse_ba.mp3",
    category: 'Au marché',
    tags: ['déplacement', 'shopping']
  },
  {
    original: "Ñaata la ?",
    french: "Combien ça coûte ?",
    words: ["Ñaata", "la", "?"],
    audio: "/audio/sentences/au_marche/naata_la.mp3",
    category: 'Au marché',
    tags: ['prix', 'achat']
  },
  {
    original: "Dafa jafe",
    french: "C'est trop cher",
    words: ["Dafa", "jafe"],
    audio: "/audio/sentences/au_marche/dafa_jafe.mp3",
    category: 'Au marché',
    tags: ['prix', 'négociation']
  },
  {
    original: "Waññi ko tuuti",
    french: "Baisse un peu le prix",
    words: ["Waññi", "ko", "tuuti"],
    audio: "/audio/sentences/au_marche/wanni_ko_tuuti.mp3",
    category: 'Au marché',
    tags: ['négociation', 'prix']
  },
  {
    original: "Am nga doomi jën ?",
    french: "As-tu du poisson ?",
    words: ["Am", "nga", "doomi", "jën", "?"],
    audio: "/audio/sentences/au_marche/am_nga_doomi_jen.mp3",
    category: 'Au marché',
    tags: ['nourriture', 'question']
  },
  {
    original: "Dama bëgg jënd",
    french: "Je veux acheter",
    words: ["Dama", "bëgg", "jënd"],
    audio: "/audio/sentences/au_marche/dama_begg_jend.mp3",
    category: 'Au marché',
    tags: ['achat', 'intention']
  },
  {
    original: "Ndax am nga yére yu bees ?",
    french: "As-tu des vêtements neufs ?",
    words: ["Ndax", "am", "nga", "yére", "yu", "bees", "?"],
    audio: "/audio/sentences/au_marche/ndax_am_nga_yere_yu_bees.mp3",
    category: 'Au marché',
    tags: ['vêtements', 'question']
  },
  {
    original: "Fan la butik bi nekk ?",
    french: "Où se trouve la boutique ?",
    words: ["Fan", "la", "butik", "bi", "nekk", "?"],
    audio: "/audio/sentences/au_marche/fan_la_butik_bi_nekk.mp3",
    category: 'Au marché',
    tags: ['lieu', 'question']
  },
  {
    original: "Dama bëgg wecciku",
    french: "Je veux échanger de l'argent",
    words: ["Dama", "bëgg", "wecciku"],
    audio: "/audio/sentences/au_marche/dama_begg_wecciku.mp3",
    category: 'Au marché',
    tags: ['argent', 'service']
  },
  {
    original: "Ndax man naa fay ci kaart ?",
    french: "Puis-je payer par carte ?",
    words: ["Ndax", "man", "naa", "fay", "ci", "kaart", "?"],
    audio: "/audio/sentences/au_marche/ndax_man_naa_fay_ci_kaart.mp3",
    category: 'Au marché',
    tags: ['paiement', 'question']
  },
  {
    original: "Dama bëgg jend jën wu yomb",
    french: "Je veux acheter du poisson bon marché",
    words: ["Dama", "bëgg", "jend", "jën", "wu", "yomb"],
    audio: "/audio/sentences/au_marche/dama_begg_jend_jen_wu_yomb.mp3",
    category: 'Au marché',
    tags: ['achat', 'nourriture', 'prix']
  },
  {
    original: "yangi tog cééb-u yapp",
    french: "Tu cuisines du riz à la viande",
    words: ["yangi", "tog", "cééb-u", "yapp"],
    audio: "/audio/sentences/au_marche/yangi_tog_ceeb_u_yapp.mp3",
    category: 'Au marché',
    tags: ['cuisine', 'riz', 'viande']
  },
  {
    original: "jend jën wu jafé",
    french: "Acheter du poisson cher",
    words: ["jend", "jën", "wu", "jafé"],
    audio: "/audio/sentences/au_marche/jend_jen_wu_jafe.mp3",
    category: 'Au marché',
    tags: ['achat', 'poisson', 'prix']
  },
  {
    original: "lakk ko ci safara wi",
    french: "Le griller sur le feu",
    words: ["lakk", "ko", "ci", "safara", "wi"],
    audio: "/audio/sentences/au_marche/lakk_ko_ci_safara_wi.mp3",
    category: 'Au marché',
    tags: ['cuisson', 'feu', 'grillade']
  },
  {
    original: "Ñaata jën ngëy jel tey ?",
    french: "Combien de poissons vas-tu prendre aujourd'hui ?",
    words: ["Ñaata", "jën", "ngëy", "jel", "tey", "?"],
    audio: "/audio/sentences/au_marche/naata_jen_ngey_jel_tey.mp3",
    category: 'Au marché',
    tags: ['quantité', 'poisson', 'question', 'temps']
  },
  {
    original: "Ñaata kilo ceeb ngëy mën a jel ?",
    french: "Combien de kilos de riz peux-tu prendre ?",
    words: ["Ñaata", "kilo", "ceeb", "ngëy", "mën", "a", "jel", "?"],
    audio: "/audio/sentences/au_marche/naata_kilo_ceeb_ngey_men_a_jel.mp3",
    category: 'Au marché',
    tags: ['poids', 'riz', 'capacité', 'question']
  },

  // Voyages
  {
    original: "Fan la gaar bi nekk ?",
    french: "Où se trouve la gare ?",
    words: ["Fan", "la", "gaar", "bi", "nekk", "?"],
    audio: "/audio/sentences/voyages/fan_la_gaar_bi_nekk.mp3",
    category: 'Voyages',
    tags: ['transport', 'lieu']
  },
  {
    original: "Kañ la kar bi di dem ?",
    french: "Quand part le bus ?",
    words: ["Kañ", "la", "kar", "bi", "di", "dem", "?"],
    audio: "/audio/sentences/voyages/kan_la_kar_bi_di_dem.mp3",
    category: 'Voyages',
    tags: ['transport', 'horaire']
  },
  {
    original: "Wóor na ma dama réer",
    french: "Je crois que je suis perdu(e)",
    words: ["Wóor", "na", "ma", "dama", "réer"],
    audio: "/audio/sentences/voyages/woor_na_ma_dama_reer.mp3",
    category: 'Voyages',
    tags: ['orientation', 'aide']
  },
  {
    original: "Ban hotel nga xam ci gox bi ?",
    french: "Quel hôtel connais-tu dans le quartier ?",
    words: ["Ban", "hotel", "nga", "xam", "ci", "gox", "bi", "?"],
    audio: "/audio/sentences/voyages/ban_hotel_nga_xam_ci_gox_bi.mp3",
    category: 'Voyages',
    tags: ['hébergement', 'information']
  },
  {
    original: "Ñaata waxtu lay jot ?",
    french: "Combien de temps ça va prendre ?",
    words: ["Ñaata", "waxtu", "lay", "jot", "?"],
    audio: "/audio/sentences/voyages/naata_waxtu_lay_jot.mp3",
    category: 'Voyages',
    tags: ['temps', 'trajet']
  },
  {
    original: "Fan lañuy weesu ?",
    french: "Par où doit-on passer ?",
    words: ["Fan", "lañuy", "weesu", "?"],
    audio: "/audio/sentences/voyages/fan_lanuy_weesu.mp3",
    category: 'Voyages',
    tags: ['direction', 'trajet']
  },
  {
    original: "Ndax am nga bataaxal ?",
    french: "As-tu un billet ?",
    words: ["Ndax", "am", "nga", "bataaxal", "?"],
    audio: "/audio/sentences/voyages/ndax_am_nga_bataaxal.mp3",
    category: 'Voyages',
    tags: ['transport', 'document']
  },
  {
    original: "Fii mooy teranga bi",
    french: "C'est ici la réception",
    words: ["Fii", "mooy", "teranga", "bi"],
    audio: "/audio/sentences/voyages/fii_mooy_teranga_bi.mp3",
    category: 'Voyages',
    tags: ['hôtel', 'lieu']
  },
  {
    original: "Ñaata lay jar ?",
    french: "Combien coûte le trajet ?",
    words: ["Ñaata", "lay", "jar", "?"],
    audio: "/audio/sentences/voyages/naata_lay_jar.mp3",
    category: 'Voyages',
    tags: ['prix', 'transport']
  },
  {
    original: "Ndax man naa denc samay bagaas ?",
    french: "Puis-je déposer mes bagages ?",
    words: ["Ndax", "man", "naa", "denc", "samay", "bagaas", "?"],
    audio: "/audio/sentences/voyages/ndax_man_naa_denc_samay_bagaas.mp3",
    category: 'Voyages',
    tags: ['bagage', 'service']
  },
  {
    original: "Dama soxla ndimbal",
    french: "J'ai besoin d'aide",
    words: ["Dama", "soxla", "ndimbal"],
    audio: "/audio/sentences/voyages/dama_soxla_ndimbal.mp3",
    category: 'Voyages',
    tags: ['aide', 'assistance']
  },
  {
    original: "Wax ma yoon wi jëm",
    french: "Indique-moi le chemin vers",
    words: ["Wax", "ma", "yoon", "wi", "jëm"],
    audio: "/audio/sentences/voyages/wax_ma_yoon_wi_jem.mp3",
    category: 'Voyages',
    tags: ['direction', 'aide']
  },
  {
    original: "Taksi bangi jogé Ndakaru",
    french: "Ce taxi vient de Dakar",
    words: ["Taksi", "bangi", "jogé", "Ndakaru"],
    audio: "/audio/sentences/voyages/taksi_bangi_joge_ndakaru.mp3",
    category: 'Voyages',
    tags: ['transport', 'origine']
  },
  {
    original: "Gan saxaar lë jel ?",
    french: "Quel train a-t-il pris ?",
    words: ["Gan", "saxaar", "lë", "jel", "?"],
    audio: "/audio/sentences/voyages/gan_saxaar_le_jel.mp3",
    category: 'Voyages',
    tags: ['train', 'transport', 'question']
  },
  {
    original: "Lu tax ngëy jel saxaar gi ?",
    french: "Pourquoi prends-tu le train ?",
    words: ["Lu", "tax", "ngëy", "jel", "saxaar", "gi", "?"],
    audio: "/audio/sentences/voyages/lu_tax_ngey_jel_saxaar_gi.mp3",
    category: 'Voyages',
    tags: ['raison', 'train', 'question', 'motivation']
  },
  {
    original: "yoon wi digganté Ndakaru ak Ndar sorinë",
    french: "La route entre Dakar et Saint-Louis est longue",
    words: ["yoon", "wi", "digganté", "Ndakaru", "ak", "Ndar", "sorinë"],
    audio: "/audio/sentences/voyages/yoon_wi_diggante_ndakaru_ak_ndar_sorine.mp3",
    category: 'Voyages',
    tags: ['route', 'distance', 'villes', 'géographie']
  },
  {
    original: "Subë, damay dem dekk-bë",
    french: "Demain, j'irai en ville",
    words: ["Subë", "damay", "dem", "dekk-bë"],
    audio: "/audio/sentences/voyages/sube_damay_dem_dekk_be.mp3",
    category: 'Voyages',
    tags: ['futur', 'ville', 'déplacement']
  },
  {
    original: "kañ ngë fii ñow ?",
    french: "Quand es-tu venu ?",
    words: ["kañ", "ngë", "fii", "ñow", "?"],
    audio: "/audio/sentences/voyages/kan_nge_fii_now.mp3",
    category: 'Voyages',
    tags: ['temps', 'question', 'passé']
  },
  {
    original: "fan ngë dem ?",
    french: "Où vas-tu ?",
    words: ["fan", "ngë", "dem", "?"],
    audio: "/audio/sentences/voyages/fan_nge_dem.mp3",
    category: 'Voyages',
    tags: ['direction', 'question', 'mouvement']
  },

  // Famille et relations
  {
    original: "Ndax am nga waa kër ?",
    french: "As-tu une famille ?",
    words: ["Ndax", "am", "nga", "waa", "kër", "?"],
    audio: "/audio/sentences/famille/ndax_am_nga_waa_ker.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'questions']
  },
  {
    original: "Ñaata doom nga am ?",
    french: "Combien d'enfants as-tu ?",
    words: ["Ñaata", "doom", "nga", "am", "?"],
    audio: "/audio/sentences/famille/naata_doom_nga_am.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'enfants']
  },
  {
    original: "Sama jabar la",
    french: "C'est ma femme",
    words: ["Sama", "jabar", "la"],
    audio: "/audio/sentences/famille/sama_jabar_la.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'présentation']
  },
  {
    original: "Kañ ngay takk ?",
    french: "Quand te maries-tu ?",
    words: ["Kañ", "ngay", "takk", "?"],
    audio: "/audio/sentences/famille/kan_ngay_takk.mp3",
    category: 'Famille et relations',
    tags: ['mariage', 'question']
  },
  {
    original: "Sama doom ju góor ji",
    french: "Mon fils",
    words: ["Sama", "doom", "ju", "góor", "ji"],
    audio: "/audio/sentences/famille/sama_doom_ju_goor_ji.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'enfant']
  },
  {
    original: "Sama doom ju jigéen ji",
    french: "Ma fille",
    words: ["Sama", "doom", "ju", "jigéen", "ji"],
    audio: "/audio/sentences/famille/sama_doom_ju_jigeen_ji.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'enfant']
  },
  {
    original: "Sama baay mooy",
    french: "Mon père est",
    words: ["Sama", "baay", "mooy"],
    audio: "/audio/sentences/famille/sama_baay_mooy.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Sama yaay mooy",
    french: "Ma mère est",
    words: ["Sama", "yaay", "mooy"],
    audio: "/audio/sentences/famille/sama_yaay_mooy.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'parent']
  },
  {
    original: "Mag bi la",
    french: "C'est l'aîné(e)",
    words: ["Mag", "bi", "la"],
    audio: "/audio/sentences/famille/mag_bi_la.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'description']
  },
  {
    original: "Rakk bi la",
    french: "C'est le/la cadet(te)",
    words: ["Rakk", "bi", "la"],
    audio: "/audio/sentences/famille/rakk_bi_la.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'description']
  },
  {
    original: "Ndax am nga rakk ?",
    french: "As-tu des frères et sœurs cadets ?",
    words: ["Ndax", "am", "nga", "rakk", "?"],
    audio: "/audio/sentences/famille/ndax_am_nga_rakk.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'question']
  },
  {
    original: "Ndax am nga mag ?",
    french: "As-tu des frères et sœurs aînés ?",
    words: ["Ndax", "am", "nga", "mag", "?"],
    audio: "/audio/sentences/famille/ndax_am_nga_mag.mp3",
    category: 'Famille et relations',
    tags: ['famille', 'question']
  },
  {
    original: "Job ak Juf angi toog ci kër gi",
    french: "Diop et Diouf sont assis dans cette maison",
    words: ["Job", "ak", "Juf", "angi", "toog", "ci", "kër", "gi"],
    audio: "/audio/sentences/famille/job_ak_juf_angi_toog_ci_ker_gi.mp3",
    category: 'Famille et relations',
    tags: ['noms propres', 'localisation', 'état']
  },
  {
    original: "Aysatu angiy dem këram",
    french: "Aïssatou s'en va chez elle",
    words: ["Aysatu", "angiy", "dem", "këram"],
    audio: "/audio/sentences/famille/aysatu_angiy_dem_keram.mp3",
    category: 'Famille et relations',
    tags: ['mouvement', 'possessif', 'maison']
  },
  {
    original: "Tijan angi jang tééré-u Aminata",
    french: "Tidiane lit le livre d'Aminata",
    words: ["Tijan", "angi", "jang", "tééré-u", "Aminata"],
    audio: "/audio/sentences/famille/tijan_angi_jang_teere_u_aminata.mp3",
    category: 'Famille et relations',
    tags: ['lecture', 'possession', 'livre']
  },

  // Urgences et santé
  {
    original: "Fan la lopitaan bi nekk ?",
    french: "Où est l'hôpital ?",
    words: ["Fan", "la", "lopitaan", "bi", "nekk", "?"],
    audio: "/audio/sentences/urgences/fan_la_lopitaan_bi_nekk.mp3",
    category: 'Urgences et santé',
    tags: ['lieu', 'médical']
  },
  {
    original: "Dama am metitu bopp",
    french: "J'ai mal à la tête",
    words: ["Dama", "am", "metitu", "bopp"],
    audio: "/audio/sentences/urgences/dama_am_metitu_bopp.mp3",
    category: 'Urgences et santé',
    tags: ['douleur', 'symptôme']
  },
  {
    original: "Sunu xaritu bi dafa gaawa soxla ndimbal",
    french: "Notre ami a besoin d'aide urgente",
    words: ["Sunu", "xaritu", "bi", "dafa", "gaawa", "soxla", "ndimbal"],
    audio: "/audio/sentences/urgences/sunu_xaritu_bi_dafa_gaawa_soxla_ndimbal.mp3",
    category: 'Urgences et santé',
    tags: ['urgence', 'aide']
  },
  {
    original: "Dama am tàndaray",
    french: "J'ai de la fièvre",
    words: ["Dama", "am", "tàndaray"],
    audio: "/audio/sentences/urgences/dama_am_tandaray.mp3",
    category: 'Urgences et santé',
    tags: ['symptôme', 'maladie']
  },
  {
    original: "Wax ma garab ngir metit",
    french: "Donne-moi un médicament pour la douleur",
    words: ["Wax", "ma", "garab", "ngir", "metit"],
    audio: "/audio/sentences/urgences/wax_ma_garab_ngir_metit.mp3",
    category: 'Urgences et santé',
    tags: ['médicament', 'demande']
  },
  {
    original: "Fan la fajkat bi nekk ?",
    french: "Où est le médecin ?",
    words: ["Fan", "la", "fajkat", "bi", "nekk", "?"],
    audio: "/audio/sentences/urgences/fan_la_fajkat_bi_nekk.mp3",
    category: 'Urgences et santé',
    tags: ['médical', 'personnel']
  },
  {
    original: "Dama bëgg am rendez-vous ak fajkat",
    french: "Je voudrais prendre rendez-vous avec un médecin",
    words: ["Dama", "bëgg", "am", "rendez-vous", "ak", "fajkat"],
    audio: "/audio/sentences/urgences/dama_begg_am_rendez_vous_ak_fajkat.mp3",
    category: 'Urgences et santé',
    tags: ['rendez-vous', 'médical']
  },
  {
    original: "Dama soxla garab",
    french: "J'ai besoin de médicaments",
    words: ["Dama", "soxla", "garab"],
    audio: "/audio/sentences/urgences/dama_soxla_garab.mp3",
    category: 'Urgences et santé',
    tags: ['médicament', 'besoin']
  },
  {
    original: "Yónni ambulaas",
    french: "Envoyez une ambulance",
    words: ["Yónni", "ambulaas"],
    audio: "/audio/sentences/urgences/yonni_ambulaas.mp3",
    category: 'Urgences et santé',
    tags: ['urgence', 'transport']
  },
  {
    original: "Dama soxla ndimbal gaaw",
    french: "J'ai besoin d'aide urgente",
    words: ["Dama", "soxla", "ndimbal", "gaaw"],
    audio: "/audio/sentences/urgences/dama_soxla_ndimbal_gaaw.mp3",
    category: 'Urgences et santé',
    tags: ['urgence', 'aide']
  },
  {
    original: "Métitu bi dafa am ci sama biir",
    french: "La douleur est dans mon ventre",
    words: ["Métitu", "bi", "dafa", "am", "ci", "sama", "biir"],
    audio: "/audio/sentences/urgences/metitu_bi_dafa_am_ci_sama_biir.mp3",
    category: 'Urgences et santé',
    tags: ['douleur', 'localisation']
  },

  // Loisirs et culture
  {
    original: "Lu ngay bëgg def tey ?",
    french: "Que veux-tu faire aujourd'hui ?",
    words: ["Lu", "ngay", "bëgg", "def", "tey", "?"],
    audio: "/audio/sentences/loisirs/lu_ngay_begg_def_tey.mp3",
    category: 'Loisirs et culture',
    tags: ['activité', 'question']
  },
  {
    original: "Dama bëgg seetsi filem",
    french: "Je veux voir un film",
    words: ["Dama", "bëgg", "seetsi", "filem"],
    audio: "/audio/sentences/loisirs/dama_begg_seetsi_filem.mp3",
    category: 'Loisirs et culture',
    tags: ['film', 'activité']
  },
  {
    original: "Dama bëgg dem ciné bi",
    french: "Je veux aller au cinéma",
    words: ["Dama", "bëgg", "dem", "ciné", "bi"],
    audio: "/audio/sentences/loisirs/dama_begg_dem_cine_bi.mp3",
    category: 'Loisirs et culture',
    tags: ['cinéma', 'sortie']
  },
  {
    original: "Dama bëgg dégg mbalax",
    french: "J'aime écouter le mbalax",
    words: ["Dama", "bëgg", "dégg", "mbalax"],
    audio: "/audio/sentences/loisirs/dama_begg_degg_mbalax.mp3",
    category: 'Loisirs et culture',
    tags: ['musique', 'préférence']
  },
  {
    original: "Kan moy sa musicien bi nga gën di bëgg ?",
    french: "Quel est ton musicien préféré ?",
    words: ["Kan", "moy", "sa", "musicien", "bi", "nga", "gën", "di", "bëgg", "?"],
    audio: "/audio/sentences/loisirs/kan_moy_sa_musicien_bi_nga_gen_di_begg.mp3",
    category: 'Loisirs et culture',
    tags: ['musique', 'préférence']
  },
  {
    original: "Kañ la spectacle bi ?",
    french: "Quand est le spectacle ?",
    words: ["Kañ", "la", "spectacle", "bi", "?"],
    audio: "/audio/sentences/loisirs/kan_la_spectacle_bi.mp3",
    category: 'Loisirs et culture',
    tags: ['événement', 'temps']
  },
  {
    original: "Dama bëgg bind taalif",
    french: "J'aime écrire des poèmes",
    words: ["Dama", "bëgg", "bind", "taalif"],
    audio: "/audio/sentences/loisirs/dama_begg_bind_taalif.mp3",
    category: 'Loisirs et culture',
    tags: ['écriture', 'art']
  },
  {
    original: "Ndax am nga benn xalam ?",
    french: "As-tu un instrument de musique ?",
    words: ["Ndax", "am", "nga", "benn", "xalam", "?"],
    audio: "/audio/sentences/loisirs/ndax_am_nga_benn_xalam.mp3",
    category: 'Loisirs et culture',
    tags: ['musique', 'instrument']
  },
  {
    original: "Dama bëgg fécc",
    french: "J'aime danser",
    words: ["Dama", "bëgg", "fécc"],
    audio: "/audio/sentences/loisirs/dama_begg_fecc.mp3",
    category: 'Loisirs et culture',
    tags: ['danse', 'activité']
  },
  {
    original: "Ñëwal ñu dem teeru",
    french: "Viens, allons à la plage",
    words: ["Ñëwal", "ñu", "dem", "teeru"],
    audio: "/audio/sentences/loisirs/newal_nu_dem_teeru.mp3",
    category: 'Loisirs et culture',
    tags: ['plage', 'invitation']
  },
  {
    original: "Ndax bëgg nga taggat yaram ?",
    french: "Aimes-tu le sport ?",
    words: ["Ndax", "bëgg", "nga", "taggat","yaram","?"],
    audio: "/audio/sentences/loisirs/ndax_begg_nga_taggat_yaram.mp3",
    category: 'Loisirs et culture',
    tags: ['sport', 'préférence']
  },
  {
    original: "Fan la terrain bi nekk ?",
    french: "Où est le terrain de sport ?",
    words: ["Fan", "la", "terrain", "bi", "nekk", "?"],
    audio: "/audio/sentences/loisirs/fan_la_terrain_bi_nekk.mp3",
    category: 'Loisirs et culture',
    tags: ['sport', 'lieu']
  },
  {
    original: "Fan ngéén fekk tablo bu rafet bi ?",
    french: "Où avez-vous trouvé ce beau tableau ?",
    words: ["Fan", "ngéén", "fekk", "tablo", "bu", "rafet", "bi", "?"],
    audio: "/audio/sentences/loisirs/fan_ngeen_fekk_tablo_bu_rafet_bi.mp3",
    category: 'Loisirs et culture',
    tags: ['art', 'tableau', 'lieu', 'beauté']
  },
  {
    original: "Ñaata weer lë liggéy-u tabax bi wara yàgg ?",
    french: "Combien de mois doit durer ce travail de construction ?",
    words: ["Ñaata", "weer", "lë", "liggéy-u", "tabax", "bi", "wara", "yàgg", "?"],
    audio: "/audio/sentences/loisirs/naata_weer_le_liggeey_u_tabax_bi_wara_yagg.mp3",
    category: 'Loisirs et culture',
    tags: ['construction', 'durée', 'travail', 'temps']
  },
  {
    original: "ñu toog waxtaan tuuti",
    french: "Qu'on s'assoie et discute un peu",
    words: ["ñu", "toog", "waxtaan", "tuuti"],
    audio: "/audio/sentences/loisirs/nu_toog_waxtaan_tuuti.mp3",
    category: 'Loisirs et culture',
    tags: ['conversation', 'social', 'repos']
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

export const getAllTags = () => {
  const allTags = new Set<string>();
  sentencesToConstruct.forEach(sentence => {
    sentence.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

export const getRandomSentences = (count: number = 10) => {
  const shuffled = [...sentencesToConstruct].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getSentencesByDifficulty = (difficulty: 'débutant' | 'intermédiaire' | 'avancé') => {
  const beginnerTags = ['salutations', 'présentation', 'temps', 'localisation', 'réponse'];
  const intermediateTags = ['progressif', 'possessif', 'interrogation', 'négation', 'achat'];
  const advancedTags = ['comparaison', 'conditionnel', 'emphase', 'relatif', 'construction'];
  
  switch (difficulty) {
    case 'débutant':
      return sentencesToConstruct.filter(sentence => 
        sentence.tags.some(tag => beginnerTags.includes(tag))
      );
    case 'intermédiaire':
      return sentencesToConstruct.filter(sentence => 
        sentence.tags.some(tag => intermediateTags.includes(tag))
      );
    case 'avancé':
      return sentencesToConstruct.filter(sentence => 
        sentence.tags.some(tag => advancedTags.includes(tag))
      );
    default:
      return sentencesToConstruct;
  }
};

export const searchSentences = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return sentencesToConstruct.filter(sentence => 
    sentence.original.toLowerCase().includes(lowerQuery) ||
    sentence.french.toLowerCase().includes(lowerQuery) ||
    sentence.words.some(word => word.toLowerCase().includes(lowerQuery)) ||
    sentence.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export default sentencesToConstruct;
 