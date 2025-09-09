

export interface WordDictionary {
  [key: string]: {
    translation: string;
    audio?: string;
    illustration?: string;
    explanation?: string; 
  };
}
  export interface CategoryDictionary {
    [key: string]: WordDictionary | GrammarCategory;
  }

  
  
  export const categories: CategoryDictionary = {
    'Salutations et expressions courantes': {
      'Salamalekum': { translation: 'Bonjour' },
    'Ba beneen yoon': { translation: 'Au revoir',audio: '/audio/ba_bennen_yoon.mp3' },
    'Na nga def?': { translation: 'Comment allez-vous?' },
    'Maa ngi fi rekk': { translation: 'Je vais bien' },
    'Jërejëf': { translation: 'Merci',audio: '/audio/wo-jërëjëf.ogg' },
    'Amul solo': { translation: 'De rien' },
    'Baal ma': { translation: 'S\'il vous plaît / Excusez-moi' },
    'Fanaan bu neex': { translation: 'Bonne nuit' },
    'Ñam ak jam': { translation: 'Bon appétit' },
    'Naka nga yendoo?': { translation: 'Comment s\'est passée votre journée?' },
    'Naka tëdd?': { translation: 'Avez-vous bien dormi?' },
    'Naka waa kër ga?': { translation: 'Comment va la famille?' },
    'Jam nga am?': { translation: 'Tout va bien?' },
    'Mangi ci jàmm': { translation: 'Je suis en paix / Ça va bien' },
    'Jàmm rekk': { translation: 'Tout va bien' },
    'Waaw': { translation: 'Oui',audio: '/audio/waaw.mp3' },
    'Déedéet': { translation: 'Non', audio: '/audio/deedeet.mp3' },
    'Bul tëë': { translation: 'Je vous en prie' },
    'Suba tey': { translation: 'Bonjour (le matin)' },
    'Ngëndal bu neex': { translation: 'Bon après-midi' },
    },
    'Nombres': {
  'Tus': { translation: 'Zero', audio: '/audio/Wo-tus.wav', illustration: '0' },
  'Benn': { translation: 'Un', audio: '/audio/Wo-benn.ogg', illustration: '1️⃣' },
  'Ñaar': { translation: 'Deux', audio: '/audio/Wo-Ñaar.ogg', illustration: '2️⃣' },
  'Ñett': { translation: 'Trois', audio: '/audio/Wo-Ñett.ogg', illustration: '3️⃣' },
  'Ñent': { translation: 'Quatre', audio: '/audio/Wo-Ñent.ogg', illustration: '4️⃣' },
  'Juroom': { translation: 'Cinq', audio: '/audio/Wo-Juroom.ogg', illustration: '5️⃣' },
  'Juroom benn': { translation: 'Six', audio: '/audio/juroom_benn.wav', illustration: '6️⃣' },
  'Juroom ñaar': { translation: 'Sept', audio: '/audio/juroom_ñaar.wav', illustration: '7️⃣' },
  'Juroom ñett': { translation: 'Huit', audio: '/audio/juroom_ñett.wav', illustration: '8️⃣' },
  'Juroom ñeent': { translation: 'Neuf', audio: '/audio/juroom_ñeent.wav', illustration: '9️⃣' },
  'Fukk': { translation: 'Dix', audio: '/audio/Wo-Fukk.ogg', illustration: '🔟' },
  'Fukk ak benn': { translation: 'Onze', audio: '/audio/Fukk_ak_benn.wav', illustration: '1️⃣1️⃣' },
  'Fukk ak ñaar': { translation: 'Douze', audio: '/audio/Fukk_ak_ñaar.wav', illustration: '1️⃣2️⃣' },
  'Fukk ak ñett': { translation: 'Treize', audio: '/audio/Fukk_ak_ñett.wav', illustration: '1️⃣3️⃣' },
  'Fukk ak ñeent': { translation: 'Quatorze', audio: '/audio/Fukk_ak_ñeent.wav', illustration: '1️⃣4️⃣' },
  'Fukk ak juroom': { translation: 'Quinze', audio: '/audio/Fukk_ak_juroom.wav', illustration: '1️⃣5️⃣' },
  'Fukk ak juroom benn': { translation: 'Seize', audio: '/audio/Fukk_ak_juroom-benn.wav', illustration: '1️⃣6️⃣' },
  'Fukk ak juroom ñaar': { translation: 'Dix-sept', audio: '/audio/Fukk_ak_juroom-ñaar.wav', illustration: '1️⃣7️⃣' },
  'Fukk ak juroom ñett': { translation: 'Dix-huit', audio: '/audio/Fukk_ak_juroom-ñett.wav', illustration: '1️⃣8️⃣' },
  'Fukk ak juroom ñeent': { translation: 'Dix-neuf', audio: '/audio/Fukk_ak_juroom-ñeent.wav', illustration: '1️⃣9️⃣' },
  'Ñaar fukk': { translation: 'Vingt', audio: '/audio/Ñaar_fukk.wav', illustration: '2️⃣0️⃣' },
  'Ñaar fukk ak benn': { translation: 'Vingt-et-un', audio: '/audio/Wo-Ñaar-fukk-ak-benn.ogg', illustration: '2️⃣1️⃣' },
  'Ñaar fukk ak ñaar': { translation: 'Vingt-deux', audio: '/audio/Wo-Ñaar-fukk-ak-ñaar.ogg', illustration: '2️⃣2️⃣' },
  'Ñaar fukk ak ñett': { translation: 'Vingt-trois', audio: '/audio/Wo-Ñaar-fukk-ak-ñett.ogg', illustration: '2️⃣3️⃣' },
  'Ñaar fukk ak ñeent': { translation: 'Vingt-quatre', audio: '/audio/Wo-Ñaar-fukk-ak-ñeent.ogg', illustration: '2️⃣4️⃣' },
  'Ñaar fukk ak juroom': { translation: 'Vingt-cinq', audio: '/audio/Wo-Ñaar-fukk-ak-juroom.ogg', illustration: '2️⃣5️⃣' },
  'Fanweer': { translation: 'Trente', audio: '/audio/Wo-Fanweer.ogg', illustration: '3️⃣0️⃣' },
  'Fanweer ak benn': { translation: 'Trente-et-un', audio: '/audio/Wo-Fanweer-ak-benn.ogg', illustration: '3️⃣1️⃣' },
  'Ñent fukk': { translation: 'Quarante', audio: '/audio/Ñent-fukk.wav', illustration: '4️⃣0️⃣' },
  'Ñent fukk ak benn': { translation: 'Quarante-et-un', audio: '/audio/Wo-Ñent-fukk-ak-benn.ogg', illustration: '4️⃣1️⃣' },
  'Juroom fukk': { translation: 'Cinquante', audio: '/audio/Wo-Juroom-fukk.ogg', illustration: '5️⃣0️⃣' },
  'Juroom fukk ak benn': { translation: 'Cinquante-et-un', audio: '/audio/Wo-Juroom-fukk-ak-benn.ogg', illustration: '5️⃣1️⃣' },
  'Juroom benn fukk': { translation: 'Soixante', audio: '/audio/Wo-Juroom-benn-fukk.ogg', illustration: '6️⃣0️⃣' },
  'Juroom benn fukk ak benn': { translation: 'Soixante-et-un', audio: '/audio/Wo-Juroom-benn-fukk-ak-benn.ogg', illustration: '6️⃣1️⃣' },
  'Juroom ñaar fukk': { translation: 'Soixante-dix', audio: '/audio/Wo-Juroom-ñaar-fukk.ogg', illustration: '7️⃣0️⃣' },
  'Juroom ñaar fukk ak benn': { translation: 'Soixante-et-onze', audio: '/audio/Wo-Juroom-ñaar-fukk-ak-benn.ogg', illustration: '7️⃣1️⃣' },
  'Juroom ñett fukk': { translation: 'Quatre-vingts', audio: '/audio/Wo-Juroom-ñett-fukk.ogg', illustration: '8️⃣0️⃣' },
  'Juroom ñett fukk ak benn': { translation: 'Quatre-vingt-un', audio: '/audio/Wo-Juroom-ñett-fukk-ak-benn.ogg', illustration: '8️⃣1️⃣' },
  'Juroom ñeent fukk': { translation: 'Quatre-vingt-dix', audio: '/audio/Wo-Juroom-ñeent-fukk.ogg', illustration: '9️⃣0️⃣' },
  'Juroom ñeent fukk ak benn': { translation: 'Quatre-vingt-onze', audio: '/audio/Wo-Juroom-ñeent-fukk-ak-benn.ogg', illustration: '9️⃣1️⃣' },
  'Téeméer': { translation: 'Cent', audio: '/audio/Téemeer.wav', illustration: '💯' },
  'Ñaar téeméer': { translation: 'Deux cents', audio: '/audio/Wo-Ñaar-téeméer.ogg', illustration: '2️⃣0️⃣0️⃣' },
  'Ñett téeméer': { translation: 'Trois cents', audio: '/audio/Wo-Ñett-téeméer.ogg', illustration: '3️⃣0️⃣0️⃣' },
  'Ñeent téeméer': { translation: 'Quatre cents', audio: '/audio/Wo-Ñeent-téeméer.ogg', illustration: '4️⃣0️⃣0️⃣' },
  'Juroom téeméer': { translation: 'Cinq cents', audio: '/audio/Wo-Juroom-téeméer.ogg', illustration: '5️⃣0️⃣0️⃣' },
  'Juroom benn téeméer': { translation: 'Six cents', audio: '/audio/Wo-Juroom-benn-téeméer.ogg', illustration: '6️⃣0️⃣0️⃣' },
  'Juroom ñaar téeméer': { translation: 'Sept cents', audio: '/audio/Wo-Juroom-ñaar-téeméer.ogg', illustration: '7️⃣0️⃣0️⃣' },
  'Juroom ñett téeméer': { translation: 'Huit cents', audio: '/audio/Wo-Juroom-ñett-téeméer.ogg', illustration: '8️⃣0️⃣0️⃣' },
  'Juroom ñeent téeméer': { translation: 'Neuf cents', audio: '/audio/Wo-Juroom-ñeent-téeméer.ogg', illustration: '9️⃣0️⃣0️⃣' },
  'Junni': { translation: 'Mille', audio: '/audio/Wo-Junni.ogg', illustration: '1️⃣0️⃣0️⃣0️⃣' },
  'Ñaar junni': { translation: 'Deux mille', audio: '/audio/Wo-Ñaar-junni.ogg', illustration: '2️⃣0️⃣0️⃣0️⃣' },
  'Fukk junni': { translation: 'Dix mille', audio: '/audio/Wo-Fukk-junni.ogg', illustration: '1️⃣0️⃣0️⃣0️⃣0️⃣' },
  'Téeméer junni': { translation: 'Cent mille', audio: '/audio/Wo-Téeméer-junni.ogg', illustration: '1️⃣0️⃣0️⃣0️⃣0️⃣0️⃣' },
  'Milliyon': { translation: 'Million', audio: '/audio/Milion.wav', illustration: '1️⃣0️⃣0️⃣0️⃣0️⃣0️⃣0️⃣' },
},
   'Temps': {
  'Altine': { translation: 'Lundi', audio: '/audio/Wo-Altine.ogg', illustration: '1️⃣' },
  'Talaata': { translation: 'Mardi', audio: '/audio/Wo-Talaata.ogg', illustration: '2️⃣' },
  'Àllarba': { translation: 'Mercredi', audio: '/audio/Wo-Àllarba.ogg', illustration: '3️⃣' },
  'Alxames': { translation: 'Jeudi', audio: '/audio/Wo-Alxames.ogg', illustration: '4️⃣' },
  'Àjjuma': { translation: 'Vendredi', audio: '/audio/Wo-Àjjuma.ogg', illustration: '5️⃣' },
  'Gaawu': { translation: 'Samedi', audio: '/audio/Wo-Gaawu.ogg', illustration: '6️⃣' },
  'Dibéer': { translation: 'Dimanche', audio: '/audio/Wo-Dibéer.ogg', illustration: '7️⃣' },
  'Demb': { translation: 'Hier', audio: '/audio/Wo-demb.ogg', illustration: '⬅️' },
  'Bés': { translation: 'Jour', audio: '/audio/Wo-Bés.ogg', illustration: '📆' },
  'Suba': { translation: 'Matin', audio: '/audio/Wo-Suba.ogg', illustration: '🌅' },
  'Ngoon': { translation: 'Après-midi', audio: '/audio/Wo-Ngoon.ogg', illustration: '🌇' },
  'Guddi': { translation: 'Nuit', audio: '/audio/Wo-Guddi.ogg', illustration: '🌙' },
  'Weer': { translation: 'Mois', audio: '/audio/Wo-Weer.ogg', illustration: '📅' },
  'At': { translation: 'Année', audio: '/audio/Wo-At.ogg', illustration: '🗓️' },
},
    'Animaux': {
  'Xaj': { translation: 'Chien', audio: '/audio/Wo-Xaj.ogg', illustration: '🐕' },
  'Muus': { translation: 'Chat', audio: '/audio/Wo-Muus.ogg', illustration: '🐈' },
  'Fas': { translation: 'Cheval', audio: '/audio/Wo-Fas.ogg', illustration: '🐎' },
  'Nag': { translation: 'Vache', audio: '/audio/Wo-Nag.ogg', illustration: '🐄' },
  'Bëy': { translation: 'Chèvre', audio: '/audio/Wo-Bëy.ogg', illustration: '🐐' },
  'Xar': { translation: 'Mouton', audio: '/audio/Wo-Xar.ogg', illustration: '🐑' },
  'Ginaar': { translation: 'Poule', audio: '/audio/Wo-Ginaar.ogg', illustration: '🐔' },
  'Nëtt': { translation: 'Oiseau', audio: '/audio/Wo-Nëtt.ogg', illustration: '🐦' },
  'Jën': { translation: 'Poisson', audio: '/audio/Wo-jën.ogg', illustration: '🐟' },
  'Ñay': { translation: 'Éléphant', audio: '/audio/Wo-Ñay.ogg', illustration: '🐘' },
  'Gaynde': { translation: 'Lion', audio: '/audio/Wo-Gaynde.ogg', illustration: '🦁' },
  'Bukki': { translation: 'Hyène', audio: '/audio/Wo-Bukki.ogg', illustration: '🐺' },
  'Naat': { translation: 'Serpent', audio: '/audio/Wo-Naat.ogg', illustration: '🐍' },
  'Mbaam': { translation: 'Âne', audio: '/audio/Wo-Mbaam.ogg', illustration: '🐴' },
  'Mbaam àll': { translation: 'Zèbre', audio: '/audio/Wo-Mbaam-àll.ogg', illustration: '🦓' },
  'Njakar': { translation: 'Souris', audio: '/audio/Wo-Njakar.ogg', illustration: '🐭' },
  'Ngàmba': { translation: 'Crocodile', audio: '/audio/Wo-Ngàmba.ogg', illustration: '🐊' },
  'Ñey': { translation: 'Singe', audio: '/audio/Wo-Ñey.ogg', illustration: '🐒' },
  'Màtt': { translation: 'Chacal', audio: '/audio/Wo-Màtt.ogg', illustration: '🐺' },
  'Guñéew': { translation: 'Panthère', audio: '/audio/Wo-Guñéew.ogg', illustration: '🐆' },
  'Niir': { translation: 'Hippopotame', audio: '/audio/Wo-Niir.ogg', illustration: '🦛' },
  'Tanxal': { translation: 'Gazelle', audio: '/audio/Wo-Tanxal.ogg', illustration: '🦌' },
  'Mbàmbaar': { translation: 'Girafe', audio: '/audio/Wo-Mbàmbaar.ogg', illustration: '🦒' },
  'Gàtt': { translation: 'Coq', audio: '/audio/Wo-Gàtt.ogg', illustration: '🐓' },
  'Béy': { translation: 'Bœuf', audio: '/audio/Wo-Béy.ogg', illustration: '🐂' },
  'Mbott': { translation: 'Grenouille', audio: '/audio/Wo-Mbott.ogg', illustration: '🐸' },
  'Jasig': { translation: 'Crocodile', audio: '/audio/Wo-Jasig.ogg', illustration: '🐸' },
  'Yàpp': { translation: 'Biche', audio: '/audio/Wo-Yàpp.ogg', illustration: '🦌' },
  'Sàmba': { translation: 'Éléphant (femelle)', audio: '/audio/Wo-Sàmba.ogg', illustration: '🐘' },
  'Tànk': { translation: 'Tortue', audio: '/audio/Wo-Tànk.ogg', illustration: '🐢' },
  'Kéwél': { translation: 'Antilope', audio: '/audio/Wo-Kéwél.ogg', illustration: '🦌' },
  'Xàmba': { translation: 'Iguane', audio: '/audio/Wo-Xàmba.ogg', illustration: '🦎' },
  'Njombor': { translation: 'Lièvre', audio: '/audio/Wo-Njombor.ogg', illustration: '🐰' },
  'Lëg': { translation: 'Corbeau', audio: '/audio/Wo-Lëg.ogg', illustration: '🐦' },
  'Siig': { translation: 'Aigle', audio: '/audio/Wo-Siig.ogg', illustration: '🦅' },
  'Ndobin': { translation: 'Vautour', audio: '/audio/Wo-Ndobin.ogg', illustration: '🦅' },
  'Pecc': { translation: 'Pigeon', audio: '/audio/Wo-Pecc.ogg', illustration: '🕊️' },
  'Laaya': { translation: 'Caméléon', audio: '/audio/Wo-Laaya.ogg', illustration: '🦎' },
  'Xoñ': { translation: 'Mouche', audio: '/audio/Wo-Xoñ.ogg', illustration: '🪰' },
  'Yamb': { translation: 'Abeille', audio: '/audio/Wo-Yamb.ogg', illustration: '🐝' },
  'Dënn': { translation: 'Fourmi', audio: '/audio/Wo-Dënn.ogg', illustration: '🐜' },
  'Sàx': { translation: 'Termite', audio: '/audio/Wo-Sàx.ogg', illustration: '🐜' },
  'Cuy': { translation: 'Ver de terre', audio: '/audio/Wo-Cuy.ogg', illustration: '🪱' },
  'Sàngara': { translation: 'Scorpion', audio: '/audio/Wo-Sàngara.ogg', illustration: '🦂' },
  'Jakkaloor': { translation: 'Chacal', audio: '/audio/Wo-Jakkaloor.ogg', illustration: '🐺' },
  'Mbuɓ': { translation: 'Moustique', audio: '/audio/Wo-Mbuɓ.ogg', illustration: '🦟' },
  'Ndiindiin': { translation: 'Papillon', audio: '/audio/Wo-Ndiindiin.ogg', illustration: '🦋' },
  'Golo': { translation: 'Singe', audio: '/audio/Wo-Golo.ogg', illustration: '🐒' },
  'Yéek': { translation: 'Perroquet', audio: '/audio/Wo-Yéek.ogg', illustration: '🦜' },
  'Xu': { translation: 'Scarabée', audio: '/audio/Wo-Xu.ogg', illustration: '🪲' },
  'Kànja': { translation: 'Pintade', audio: '/audio/Wo-Kànja.ogg', illustration: '🐔' },
},

    'Famille et relations': {
  'Yaay': { translation: 'Mère', audio: '/audio/Wo-Yaay.ogg', illustration: '👩🏿' },
  'Baay': { translation: 'Père', audio: '/audio/Wo-Baay.ogg', illustration: '👨🏿' },
  'Mag': { translation: 'Frère aîné', audio: '/audio/Wo-Mag.ogg', illustration: '👦🏿' },
  'Rakk': { translation: 'Frère cadet / Sœur cadette', audio: '/audio/Wo-Rakk.ogg', illustration: '👦🏿👧🏿' },
  'Jigéen': { translation: 'Sœur aînée', audio: '/audio/Wo-Jigéen.ogg', illustration: '👧🏿' },
  'Maam bu góor': { translation: 'Grand-père', audio: '/audio/Wo-Maam-bu-góor.ogg', illustration: '👴🏿' },
  'Maam bu jigéen': { translation: 'Grand-mère', audio: '/audio/Wo-Maam-bu-jigéen.ogg', illustration: '👵🏿' },
  'Nijaay': { translation: 'Oncle paternel', audio: '/audio/Wo-Nijaay.ogg', illustration: '🧔🏿' },
  'Xarit': { translation: 'Oncle maternel', audio: '/audio/Wo-Xarit.ogg', illustration: '🧔🏿' },
  'Jëkër': { translation: 'Tante paternelle', audio: '/audio/Wo-Jëkër.ogg', illustration: '👩🏿' },
  'Nijjay': { translation: 'Tante maternelle', audio: '/audio/Wo-Nijjay.ogg', illustration: '👩🏿' },
  'Doomu nijaay': { translation: 'Cousin(e)', audio: '/audio/Wo-Doomu-nijaay.ogg', illustration: '🧑🏿' },
  'Jabar': { translation: 'Épouse', audio: '/audio/Wo-Jabar.ogg', illustration: '👰🏿' },
  'Jëkkër': { translation: 'Mari', audio: '/audio/Wo-Jëkkër.ogg', illustration: '🤵🏿' },
  'Séy': { translation: 'Époux/Épouse', audio: '/audio/Wo-Séy.ogg', illustration: '💑🏿' },
  'Doom': { translation: 'Enfant', audio: '/audio/Wo-Doom.ogg', illustration: '👶🏿' },
  'Doom bu góor': { translation: 'Fils', audio: '/audio/Wo-Doom-bu-góor.ogg', illustration: '👦🏿' },
  'Doom bu jigéen': { translation: 'Fille', audio: '/audio/Wo-Doom-bu-jigéen.ogg', illustration: '👧🏿' },
  'Sët': { translation: 'Petit-fils/Petite-fille', audio: '/audio/Wo-Sët.ogg', illustration: '👶🏿' },
  'Goro': { translation: 'Beau-frère', audio: '/audio/Wo-Goro.ogg', illustration: '🤵🏿' },
  'Njëkke': { translation: 'Belle-sœur', audio: '/audio/Wo-Njëkke.ogg', illustration: '👰🏿' },
  'Goro bu jigéen': { translation: 'Belle-sœur (épouse du frère)', audio: '/audio/Wo-Goro-bu-jigéen.ogg', illustration: '👰🏿' },
},
    'Nourriture et boissons': {
      'Ndox': { translation: 'Eau', audio: '/audio/Wo-Ndox.ogg', illustration: '💧' },
    
      'Mburu': { translation: 'Pain', audio: '/audio/Wo-Mburu.ogg', illustration: '🍞' },
    
      'Ceeb': { translation: 'Riz', audio: '/audio/Wo-ceeb.ogg', illustration: '🍚' },
    
      'Ceebu jen': { translation: 'Riz au poisson', audio: '/audio/Ceebu_jen.mp3', illustration: '🐟🍚' },
    
      'Yàpp': { translation: 'Viande', audio: '/audio/Wo-Yapp.ogg', illustration: '🥩' },
    
      'Jën': { translation: 'Poisson', audio: '/audio/Wo-Jën.ogg', illustration: '🐠' },
    
      'Nen': { translation: 'Oeuf', audio: '/audio/Wo-nen.ogg', illustration: '🥚' },
    
      'Ñam-xoyor': { translation: 'Légumes', audio: '/audio/Wo-Ñam-xoyor.ogg', illustration: '🥕🥦' },
    
      'Doomi garab': { translation: 'Fruit', audio: '/audio/Wo-Doomi-garab.ogg', illustration: '🍎' },
    
      'Meew': { translation: 'Lait', audio: '/audio/Wo-Meew.ogg', illustration: '🥛' },
    
      'Kafee': { translation: 'Café', audio: '/audio/Wo-Kafee.ogg', illustration: '☕' },
    
      'Ataaya': { translation: 'Thé', audio: '/audio/Wo-Ataaya.ogg', illustration: '🍵' },
    
      'Suukar': { translation: 'Sucre', audio: '/audio/Wo-Suukar.ogg', illustration: '🍬' },
    
      'Xorom': { translation: 'Sel', audio: '/audio/Wo-Xorom.ogg', illustration: '🧂' },
    
      'Maafe': { translation: 'Sauce à base d\'arachide', audio: '/audio/Wo-Maafe.ogg', illustration: '🥜🥣' },
    
      'Yassa': { translation: 'Plat à base de poulet ou de poisson', audio: '/audio/Wo-Yassa.ogg', illustration: '🍗🐟' },
    
      'Thiéboudienne': { translation: 'Plat national sénégalais (riz au poisson)', audio: '/audio/Wo-Thiéboudienne.ogg', illustration: '🇸🇳🍚🐟' },
    
      'Thiéré': { translation: 'Couscous', audio: '/audio/Wo-Thiéré.ogg', illustration: '🍲' },
    
      'Bissap': { translation: 'Boisson à base d\'hibiscus', audio: '/audio/Wo-Bissap.ogg', illustration: '🌺🥤' },
    
      'Bouye': { translation: 'Boisson à base de fruit de baobab', audio: '/audio/Wo-Bouye.ogg', illustration: '🌳🥤' },
    
      'Sombi': { translation: 'Dessert à base de riz et de lait', audio: '/audio/Wo-Sombi.ogg', illustration: '🍚🥛🍨' },
    
      'Ngalax': { translation: 'Dessert à base de mil', audio: '/audio/Wo-Ngalax.ogg', illustration: '🌾🍨' },
    
      'Thiakry': { translation: 'Dessert à base de couscous et de lait caillé', audio: '/audio/Wo-Thiakry.ogg', illustration: '🍲🥛🍨' }
    },
    'Couleurs': {
  'Weex': { translation: 'Blanc', illustration: '⚪', audio: '/audio/Wo-Weex.ogg' },
  'Ñuul': { translation: 'Noir', illustration: '⚫', audio: '/audio/Wo-Ñuul.ogg' },
  'Xonq': { translation: 'Rouge', illustration: '🔴', audio: '/audio/Wo-Xonq.ogg' },
  'Blu': { translation: 'Bleu', illustration: '🔵', audio: '/audio/Wo-Blu.ogg' },
  'Wert': { translation: 'Vert', illustration: '🟢', audio: '/audio/Wo-Wert.ogg' },
  'Melo': { translation: 'Jaune', illustration: '🟡', audio: '/audio/Wo-Melo.ogg' },
  'Gris': { translation: 'Gris', illustration: '⚪', audio: '/audio/Wo-Gris.ogg' },
  'Caf': { translation: 'Marron', illustration: '🟤', audio: '/audio/Wo-Caf.ogg' },
  'Oraans': { translation: 'Orange', illustration: '🟠', audio: '/audio/Wo-Oraans.ogg' },
  'Wiolet': { translation: 'Violet', illustration: '🟣', audio: '/audio/Wo-Wiolet.ogg' },
  'Roos': { translation: 'Rose', illustration: '�pink', audio: '/audio/Wo-Roos.ogg' },
  'Xonq curr': { translation: 'Rouge foncé', illustration: '🔴', audio: '/audio/Wo-Xonq-curr.ogg' },
  'Blu curr': { translation: 'Bleu foncé', illustration: '🔵', audio: '/audio/Wo-Blu-curr.ogg' },
  'Wert curr': { translation: 'Vert foncé', illustration: '🟢', audio: '/audio/Wo-Wert-curr.ogg' },
  'Melo curr': { translation: 'Jaune foncé', illustration: '🟡', audio: '/audio/Wo-Melo-curr.ogg' },
},

'Parties du corps': {
  'Bopp': { translation: 'Tête', illustration: '🧠', audio: '/audio/Wo-Bopp.ogg' },
  'Bët': { translation: 'Yeux', illustration: '👁️', audio: '/audio/Wo-Bët.ogg' },
  'Bakkan': { translation: 'Nez', illustration: '👃', audio: '/audio/Wo-Bakkan.ogg' },
  'Gémmiñ': { translation: 'Bouche', illustration: '👄', audio: '/audio/Wo-Gémmiñ.ogg' },
  'Nopp': { translation: 'Oreille', illustration: '👂', audio: '/audio/Wo-nopp.ogg' },
  'Loxo': { translation: 'Bras / Main', illustration: '💪🤚', audio: '/audio/Wo-Loxo.ogg' },
  'Tànk': { translation: 'Jambe / Pied', illustration: '🦵👣', audio: '/audio/Wo-Tànk.ogg' },
  'Xol': { translation: 'Cœur', illustration: '❤️', audio: '/audio/Wo-Xol.ogg' },
  'Kanam': { translation: 'Visage', illustration: '😊', audio: '/audio/Wo-Kanam.ogg' },
  'Biir': { translation: 'Ventre', illustration: '🫃', audio: '/audio/Wo-Biir.ogg' },
  'Dënn': { translation: 'Dos', illustration: '🦴', audio: '/audio/Wo-Dënn.ogg' },
  'Baaraam': { translation: 'Doigt', illustration: '👆', audio: '/audio/Wo-Baaraam.ogg' },
  'Bëñ': { translation: 'Dent', illustration: '🦷', audio: '/audio/Wo-Bëñ.ogg' },
  'Làmmiñ': { translation: 'Langue', illustration: '👅', audio: '/audio/Wo-Làmmiñ.ogg' },
  'Sëq': { translation: 'Cheveux', illustration: '💇', audio: '/audio/Wo-Sëq.ogg' },
  'Baarama tànk': { translation: 'Orteil', illustration: '🦶', audio: '/audio/Wo-Baarama-tànk.ogg' },
  'Yoxo': { translation: 'Ongle', illustration: '💅', audio: '/audio/Wo-Yoxo.ogg' },
  'Ponk': { translation: 'Épaule', illustration: '🙆', audio: '/audio/Wo-Ponk.ogg' },
  'Wéñ': { translation: 'Foie', illustration: '🫀', audio: '/audio/Wo-wéñ.ogg' },
},
    'Verbes courants': {
    'Nekk': { translation: 'Être', audio: '/audio/Wo-nekk.ogg' },
    'Am': { translation: 'Avoir', audio: '/audio/Wo-am.ogg' },
    'Def': { translation: 'Faire', audio: '/audio/Wo-def.ogg' },
    'Dem': { translation: 'Aller', audio: '/audio/Wo-dem.ogg' },
    'Ñëw': { translation: 'Venir', audio: '/audio/Wo-Ñëw.ogg' },
    'Gis': { translation: 'Voir', audio: '/audio/Wo-Gis.ogg' },
    'Dégg': { translation: 'Entendre', audio: '/audio/Wo-degg.ogg' },
    'Lekk': { translation: 'Manger', audio: '/audio/Wo-Lekk.ogg' },
    'Naan': { translation: 'Boire', audio: '/audio/Wo-Naan.ogg' },
    'Nelaw': { translation: 'Dormir', audio: '/audio/Wo-nelaw.ogg' },
    'Wax': { translation: 'Parler', audio: '/audio/Wo-Wax.ogg' },
    'Bind': { translation: 'Écrire', audio: '/audio/Wo-Bind.ogg' },
    'Jàng': { translation: 'Lire', audio: '/audio/Wo-Jang.ogg' },
    'Bëgg': { translation: 'Aimer / Vouloir', audio: '/audio/Wo-Bëgg.ogg' },
    'Liggéey': { translation: 'Travailler', audio: '/audio/Wo-Liggéey.ogg' },
    'Toog': { translation: 'S\'asseoir', audio: '/audio/Wo-Toog.ogg' },
    'Taxaw': { translation: 'Se lever / Être debout', audio: '/audio/Wo-Taxaw.ogg' },
    'Dox': { translation: 'Marcher', audio: '/audio/Wo-Dox.ogg' },
    'Faj': { translation: 'Guérir', audio: '/audio/Wo-faj.ogg' },
    'Joxe': { translation: 'Donner', audio: '/audio/Wo-Joxe.ogg' },
    'Jël': { translation: 'Prendre', audio: '/audio/Wo-Jël.ogg' },
    'Xool': { translation: 'Regarder', audio: '/audio/Wo-Xool.ogg' },
    'Xam': { translation: 'Savoir / Connaître', audio: '/audio/Wo-Xam.ogg' },
    'Jaaxle': { translation: 'Être surpris', audio: '/audio/Wo-Jaaxle.ogg' },
    'Yëngal': { translation: 'Bouger', audio: '/audio/Wo-Yëngal.ogg' },
    'Niroo': { translation: 'Ressembler', audio: '/audio/Wo-niroo.ogg' },
    'Nuyu': { translation: 'Saluer', audio: '/audio/Wo-nuyu.ogg' },
    'Noppi': { translation: 'Se taire', audio: '/audio/Wo-noppi.ogg' },
    'Waññi': { translation: 'Baisser', audio: '/audio/Wo-waññi.ogg' },
    'Seet': { translation: 'Chercher', audio: '/audio/Wo-Seet.ogg' },
    'Laaj': { translation: 'Demander', audio: '/audio/Wo-Laaj.ogg' },
    'And': { translation: 'Marcher', audio: '/audio/Wo-and.ogg' },
    'Wut': { translation: 'Chercher / Rechercher', audio: '/audio/Wo-Wut.ogg' },
    'Togg': { translation: 'Cuisiner', audio: '/audio/Wo-Togg.ogg' },
    'Ràbb': { translation: 'Tisser', audio: '/audio/Wo-Ràbb.ogg' },
    'Wàcc': { translation: 'Descendre', audio: '/audio/Wo-Wàcc.ogg' },
    'Yéeg': { translation: 'Monter', audio: '/audio/Wo-Yéeg.ogg' },
    'Tëdd': { translation: 'Se coucher', audio: '/audio/Wo-Tëdd.ogg' },
    'Sàng': { translation: 'Se laver', audio: '/audio/Wo-Sàng.ogg' },
    'Sang': { translation: 'Se doucher', audio: '/audio/Wo-Sang.ogg' },
    'Juddu': { translation: 'Naitre', audio: '/audio/Wo-juddu.ogg' },
    'Raxas': { translation: 'Laver', audio: '/audio/Wo-Raxas.ogg' },
    'Foot': { translation: 'Laver (les vêtements)', audio: '/audio/Wo-Foot.ogg' },
    'Fàtte': { translation: 'Oublier', audio: '/audio/Wo-Fàtte.ogg' },
    'Xalaat': { translation: 'Penser', audio: '/audio/Wo-Xalaat.ogg' },
    'Dëgg': { translation: 'Être vrai', audio: '/audio/Wo-Dëgg.ogg' },
    'Fen': { translation: 'Mentir', audio: '/audio/Wo-Fen.ogg' },
    'Xaar': { translation: 'Attendre', audio: '/audio/Wo-Xaar.ogg' },
    'Yàq': { translation: 'Gâter / Détruire', audio: '/audio/Wo-Yàq.ogg' },
    'Defar': { translation: 'Réparer / Fabriquer', audio: '/audio/Wo-Defar.ogg' },
    'Jaay': { translation: 'Vendre', audio: '/audio/Wo-Jaay.ogg' },
    'Jënd': { translation: 'Acheter', audio: '/audio/Wo-Jënd.ogg' },
    'Fey': { translation: 'Payer', audio: '/audio/Wo-Fey.ogg' },
    'Ànd': { translation: 'Accompagner', audio: '/audio/Wo-Ànd.ogg' },
    'Tëj': { translation: 'Fermer', audio: '/audio/Wo-Tëj.ogg' },
    'Ubbi': { translation: 'Ouvrir', audio: '/audio/Wo-Ubbi.ogg' },
    'Wàññi': { translation: 'Diminuer', audio: '/audio/Wo-Wàññi.ogg' },
    'Yokk': { translation: 'Augmenter', audio: '/audio/Wo-Yokk.ogg' },
    'Bañ': { translation: 'Refuser', audio: '/audio/Wo-Bañ.ogg' },
    'Nangu': { translation: 'Accepter', audio: '/audio/Wo-Nangu.ogg' },
    'Wóor': { translation: 'Être sûr', audio: '/audio/Wo-Wóor.ogg' },
    'Dëgër': { translation: 'Être dur / Fort', audio: '/audio/Wo-Dëgër.ogg' },
    'Ñàkk': { translation: 'Manquer', audio: '/audio/Wo-Ñàkk.ogg' },
    'Sàcc': { translation: 'Voler (dérober)', audio: '/audio/Wo-Sàcc.ogg' },
    'Naaw': { translation: 'Voler (dans les airs)', audio: '/audio/Wo-Naaw.ogg' },
    'Tànn': { translation: 'Choisir', audio: '/audio/Wo-Tànn.ogg' },
    'Xëpp': { translation: 'Verser', audio: '/audio/Wo-Xëpp.ogg' },
    'Sotti': { translation: 'Finir / Terminer', audio: '/audio/Wo-Sotti.ogg' },
    'Tamm': { translation: 'Goûter', audio: '/audio/Wo-Tamm.ogg' },
    'Xeex': { translation: 'Se battre', audio: '/audio/Wo-Xeex.ogg' },
    'Daw': { translation: 'Courir', audio: '/audio/Wo-Daw.ogg' },
    'Ree': { translation: 'Rire', audio: '/audio/Wo-Ree.ogg' },
    'Jooy': { translation: 'Pleurer', audio: '/audio/Wo-Jooy.ogg' },
    'Dàq': { translation: 'Chasser / Renvoyer', audio: '/audio/Wo-Dàq.ogg' },
    'Wàdd': { translation: 'Tuer', audio: '/audio/Wo-Wàdd.ogg' },
    'Ñakk': { translation: 'Peigner', audio: '/audio/Wo-Ñakk.ogg' },
    'Dagg': { translation: 'Couper', audio: '/audio/Wo-Dagg.ogg' },
    'Takk': { translation: 'Attacher', audio: '/audio/Wo-Takk.ogg' },
    'Fass': { translation: 'Détacher', audio: '/audio/Wo-Fass.ogg' },
    'Téj': { translation: 'Clôturer', audio: '/audio/Wo-Téj.ogg' },
    'Tijji': { translation: 'Ouvrir (une porte)', audio: '/audio/Wo-Tijji.ogg' },
    'Xàll': { translation: 'Fermer (une porte)', audio: '/audio/Wo-Xàll.ogg' },
    'Taal': { translation: 'Allumer', audio: '/audio/Wo-Taal.ogg' },
    'Xëy': { translation: 'Se réveiller', audio: '/audio/Wo-Xëy.ogg' },
    'Yee': { translation: 'Réveiller', audio: '/audio/Wo-Yee.ogg' },
    'Làq': { translation: 'Cacher', audio: '/audio/Wo-Làq.ogg' },
    'Nëbb': { translation: 'Se cacher', audio: '/audio/Wo-Nëbb.ogg' },
    'Dàjale': { translation: 'Rassembler', audio: '/audio/Wo-Dàjale.ogg' },
    'Féex': { translation: 'Être froid', audio: '/audio/Wo-Féex.ogg' },
    'Tàng': { translation: 'Être chaud', audio: '/audio/Wo-Tàng.ogg' },
    'Jur': { translation: 'Donner naissance', audio: '/audio/Wo-Jur.ogg' },
    'Màgg': { translation: 'Grandir', audio: '/audio/Wo-Màgg.ogg' },
    'Yaatu': { translation: 'Être large', audio: '/audio/Wo-Yaatu.ogg' },
    'Gàtt': { translation: 'Être court', audio: '/audio/Wo-Gàtt.ogg' },
    'Gudd': { translation: 'Être long', audio: '/audio/Wo-Gudd.ogg' },
},

'Grammaire': {
  'Pronoms personnels': {
    'Maa ngi': { translation: "Je (en train de)", explanation: "Utilisé pour exprimer une action en cours" },
    'Yaa ngi': { translation: "Tu (en train de)", explanation: "Deuxième personne du singulier, action en cours" },
    'Mu ngi': { translation: "Il/Elle (en train de)", explanation: "Troisième personne du singulier, action en cours" },
    'Nu ngi': { translation: "Nous (en train de)", explanation: "Première personne du pluriel, action en cours" },
    'Yeena ngi': { translation: "Vous (en train de)", explanation: "Deuxième personne du pluriel, action en cours" },
    'Ñu ngi': { translation: "Ils/Elles (en train de)", explanation: "Troisième personne du pluriel, action en cours" },
    
    'Maa': { translation: "Je (emphatique)", explanation: "Utilisé pour mettre l'accent sur le sujet" },
    'Yaa': { translation: "Tu (emphatique)", explanation: "Deuxième personne du singulier, emphatique" },
    'Moom': { translation: "Lui/Elle (emphatique)", explanation: "Troisième personne du singulier, emphatique" },
    'Nun': { translation: "Nous (emphatique)", explanation: "Première personne du pluriel, emphatique" },
    'Yeen': { translation: "Vous (emphatique)", explanation: "Deuxième personne du pluriel, emphatique" },
    'Ñoom': { translation: "Eux/Elles (emphatique)", explanation: "Troisième personne du pluriel, emphatique" },
    
    'Ma': { translation: "Je (objet)", explanation: "Utilisé comme objet direct ou indirect" },
    'La': { translation: "Tu/Vous (objet)", explanation: "Deuxième personne, objet direct ou indirect" },
    'Ko': { translation: "Le/La/Lui (objet)", explanation: "Troisième personne du singulier, objet direct ou indirect" },
    'Nu': { translation: "Nous (objet)", explanation: "Première personne du pluriel, objet direct ou indirect" },
    'Leen': { translation: "Vous (objet pluriel)", explanation: "Deuxième personne du pluriel, objet direct ou indirect" },
    'Léen': { translation: "Les/Leur (objet)", explanation: "Troisième personne du pluriel, objet direct ou indirect" },
    
    'Sama': { translation: "Mon/Ma", explanation: "Possessif première personne du singulier" },
    'Sa': { translation: "Ton/Ta", explanation: "Possessif deuxième personne du singulier" },
    'Borom': { translation: "Son/Sa", explanation: "Possessif troisième personne du singulier" },
    'Sunu': { translation: "Notre", explanation: "Possessif première personne du pluriel" },
    'Seen': { translation: "Votre", explanation: "Possessif deuxième personne du pluriel" },
    'Séen': { translation: "Leur", explanation: "Possessif troisième personne du pluriel" },
    
    'Man': { translation: "Moi", explanation: "Pronom tonique première personne du singulier" },
    'Yow': { translation: "Toi", explanation: "Pronom tonique deuxième personne du singulier" },
    'Môom': { translation: "Lui/Elle", explanation: "Pronom tonique troisième personne du singulier" },
    'Nûn': { translation: "Nous", explanation: "Pronom tonique première personne du pluriel" },
    'Yéen': { translation: "Vous", explanation: "Pronom tonique deuxième personne du pluriel" },
    'Ñôom': { translation: "Eux/Elles", explanation: "Pronom tonique troisième personne du pluriel" },
  },
  'Temps verbaux': {
    'Dina dem': { 
      translation: "Il/Elle ira", 
      explanation: "Futur simple, exprime une action qui se déroulera dans le futur" 
    },
    'Demoon na': { 
      translation: "Il/Elle était allé(e)", 
      explanation: "Plus-que-parfait, exprime une action passée antérieure à une autre action passée" 
    },
    'Dem na': { 
      translation: "Il/Elle est allé(e)", 
      explanation: "Passé composé, exprime une action achevée dans un passé récent" 
    },
    'Dafa dem': { 
      translation: "Il/Elle est allé(e)", 
      explanation: "Passé emphatique, met l'accent sur l'action accomplie" 
    },
    'Demul': { 
      translation: "Il/Elle n'est pas allé(e)", 
      explanation: "Négation du passé" 
    },
    'Demu': { 
      translation: "Il/Elle n'est pas allé(e)", 
      explanation: "Autre forme de négation du passé" 
    },
    'Dina demoon': { 
      translation: "Il/Elle serait allé(e)", 
      explanation: "Conditionnel passé" 
    },
    'Dinaa dem': { 
      translation: "J'irai", 
      explanation: "Futur, première personne du singulier" 
    },
    'Du dem': { 
      translation: "Il/Elle n'ira pas", 
      explanation: "Futur négatif" 
    },
    'Demati na': { 
      translation: "Il/Elle est allé(e) de nouveau", 
      explanation: "Passé avec notion de répétition" 
    },
    'Daan na dem': { 
      translation: "Il/Elle avait l'habitude d'aller", 
      explanation: "Passé habituel" 
    },
    'Demoon naa': { 
      translation: "J'étais allé(e)", 
      explanation: "Plus-que-parfait, première personne du singulier" 
    },
    'Maa ngi dem': { 
      translation: "Je suis en train d'aller", 
      explanation: "Présent progressif" 
    },
    'Mu ngi dem': { 
      translation: "Il/Elle est en train d'aller", 
      explanation: "Présent progressif, troisième personne du singulier" 
    },
    'Dem nga': { 
      translation: "Tu es allé(e)", 
      explanation: "Passé simple, deuxième personne du singulier" 
    },
    'Dama dem': { 
      translation: "Je suis allé(e)", 
      explanation: "Passé emphatique, première personne du singulier" 
    },
    'Demal': { 
      translation: "Va !", 
      explanation: "Impératif, deuxième personne du singulier" 
    },
    'Demleen': { 
      translation: "Allez !", 
      explanation: "Impératif, deuxième personne du pluriel" 
    },
    'Damay dem': { 
      translation: "Je vais (habituellement)", 
      explanation: "Présent habituel, première personne du singulier" 
    },
    'Dafa doon dem': { 
      translation: "Il/Elle était en train d'aller", 
      explanation: "Imparfait, action en cours dans le passé" 
    },
    'Su demee': { 
      translation: "S'il/elle va", 
      explanation: "Conditionnel présent" 
    },
    'Bu demee': { 
      translation: "Quand il/elle ira", 
      explanation: "Futur dans le passé ou futur hypothétique" 
    },
    'Demuma': { 
      translation: "Je ne suis pas allé(e)", 
      explanation: "Négation du passé, première personne du singulier" 
    },
    'Duma dem': { 
      translation: "Je n'irai pas", 
      explanation: "Futur négatif, première personne du singulier" 
    },
  },
  'Prépositions': {
    'Ci': { 
      translation: "Dans, sur, à", 
      explanation: "Préposition de lieu générale, utilisée pour indiquer la position ou la direction" 
    },
    'Ca': { 
      translation: "Dans, vers", 
      explanation: "Variante de 'ci', souvent utilisée pour indiquer un mouvement vers un lieu" 
    },
    'Fi': { 
      translation: "Ici", 
      explanation: "Préposition de lieu indiquant la proximité immédiate" 
    },
    'Fa': { 
      translation: "Là", 
      explanation: "Préposition de lieu indiquant un endroit un peu éloigné" 
    },
    'Fu': { 
      translation: "Où", 
      explanation: "Préposition interrogative de lieu" 
    },
    'Ak': { 
      translation: "Avec, et", 
      explanation: "Indique l'accompagnement ou l'addition" 
    },
    'Ngir': { 
      translation: "Pour, à cause de", 
      explanation: "Indique le but ou la raison" 
    },
    'Ndax': { 
      translation: "À cause de, parce que", 
      explanation: "Indique la cause ou la raison" 
    },
    'Ba': { 
      translation: "Jusqu'à", 
      explanation: "Indique une limite dans le temps ou l'espace" 
    },
    'Bala': { 
      translation: "Avant de", 
      explanation: "Indique une action qui précède une autre" 
    },
    'Ginnaaw': { 
      translation: "Derrière, après", 
      explanation: "Peut indiquer une position spatiale ou temporelle" 
    },
    'Ci biir': { 
      translation: "À l'intérieur de", 
      explanation: "Locution prépositionnelle indiquant l'intériorité" 
    },
    'Ci kaw': { 
      translation: "Sur, au-dessus de", 
      explanation: "Locution prépositionnelle indiquant une position supérieure" 
    },
    'Ci ron': { 
      translation: "Sous, en dessous de", 
      explanation: "Locution prépositionnelle indiquant une position inférieure" 
    },
    'Ci digg': { 
      translation: "Au milieu de", 
      explanation: "Locution prépositionnelle indiquant une position centrale" 
    },
    'Ci wetu': { 
      translation: "À côté de", 
      explanation: "Locution prépositionnelle indiquant la proximité" 
    },
    'Ci kanam': { 
      translation: "Devant, en face de", 
      explanation: "Locution prépositionnelle indiquant une position frontale" 
    },
    'Ci gannaaw': { 
      translation: "Derrière", 
      explanation: "Locution prépositionnelle indiquant une position à l'arrière" 
    },
    'Ci diggu': { 
      translation: "Entre", 
      explanation: "Locution prépositionnelle indiquant une position intermédiaire" 
    },
    'Li dale': { 
      translation: "Depuis", 
      explanation: "Indique le point de départ dans le temps" 
    },
    'Ba mu jëkk': { 
      translation: "Avant", 
      explanation: "Indique une antériorité dans le temps" 
    },
    'Bi mu weesu': { 
      translation: "Après", 
      explanation: "Indique une postériorité dans le temps" 
    },
    'Ci bir': { 
      translation: "Pendant", 
      explanation: "Indique une durée" 
    },
    'Ngir seen mbiri': { 
      translation: "Pour le compte de", 
      explanation: "Indique le bénéficiaire d'une action" 
    },
    'Ci mbiri': { 
      translation: "À propos de, concernant", 
      explanation: "Indique le sujet ou le thème" 
    },
    'Ci lu jëm': { 
      translation: "Vers", 
      explanation: "Indique une direction ou une orientation" 
    },
    'Ni': { 
      translation: "Comme", 
      explanation: "Indique une comparaison ou une manière" 
    },
    'Sëriñ': { 
      translation: "Sans", 
      explanation: "Indique l'absence ou le manque" 
    },
    'Dalal ak': { 
      translation: "À partir de", 
      explanation: "Indique un point de départ dans le temps ou l'espace" 
    },
    'Jaar ci': { 
      translation: "À travers", 
      explanation: "Indique un passage ou une traversée" 
    },
  },
  'Adjectifs': {
// Apparence physique
'Rafet': {
translation: "Beau, belle",
explanation: "Décrit une apparence agréable"
},
'Buul': {
translation: "Laid, moche",
explanation: "Opposé de 'rafet'"
},
'Rëy': {
translation: "Gros, corpulent",
explanation: "Décrit une forte corpulence"
},
'Njool': {
translation: "Mince, svelte",
explanation: "Décrit une faible corpulence"
},
'Gudd': {
translation: "Grand, long",
explanation: "Décrit la taille ou la longueur"
},
'Gàtt': {
translation: "Court, petit",
explanation: "Opposé de 'gudd'"
},
'Yomboo': {
translation: "Maigre, squelettique",
explanation: "Décrit une maigreur extrême"
},
'Naat': {
translation: "Large, vaste",
explanation: "Décrit une grande étendue ou largeur"
},
'Wànt': {
translation: "Étroit, serré",
explanation: "Opposé de 'naat'"
},
// Traits de caractère
'Baax': {
  translation: "Bon, gentil",
  explanation: "Décrit une personne de bonne nature"
},
'Soxor': {
  translation: "Généreux, charitable",
  explanation: "Décrit une personne qui aime donner"
},
'Naqari': {
  translation: "Intelligent, futé",
  explanation: "Décrit une personne douée intellectuellement"
},
'Muñ': {
  translation: "Patient",
  explanation: "Décrit une personne qui sait attendre calmement" 
},
'Jom': {
  translation: "Courageux, brave",
  explanation: "Décrit une personne qui n'a pas peur"
},
'Wóor': {
  translation: "Honnête, intègre",
  explanation: "Décrit une personne droite et sincère"
},
'Goor': {
  translation: "Viril, masculin",
  explanation: "Décrit un homme aux qualités viriles"
},
'Jigéen': {
  translation: "Féminin",
  explanation: "Décrit une femme aux qualités féminines"
},
'Taqale': {
  translation: "Poli, courtois",
  explanation: "Décrit une personne aux manières raffinées"
},
'Reew': {
  translation: "Impoli, grossier",
  explanation: "Opposé de 'taqale'"
},

// États et conditions  
'Bax': {
  translation: "Ivre, soûl",
  explanation: "Décrit une personne en état d'ébriété"
},
'Xiif': {
  translation: "Affamé",
  explanation: "Décrit l'état d'avoir faim"  
},
'Waar': {
  translation: "Épuisé, exténué", 
  explanation: "Décrit un état de fatigue extrême"
},
'Xonxon': {
  translation: "Essoufflé, haletant",
  explanation: "Décrit une respiration difficile suite à un effort"
},
'Wooral': {
  translation: "Paresseux, fainéant",
  explanation: "Décrit un manque de motivation à agir"  
},
'Tàng': {
  translation: "Chaud, chaleureux",
  explanation: "Décrit la sensation de chaleur"
},
'Sedd': {
  translation: "Froid, frais",
  explanation: "Décrit la sensation de fraîcheur" 
},
'Tooy': {
  translation: "Rugueux, râpeux",
  explanation: "Décrit une surface non lisse au toucher"
},
'Tiis': {
  translation: "Lisse, poli",
  explanation: "Décrit une surface régulière et douce"
},
'Saf': {
  translation: "Pur, immaculé",
  explanation: "Décrit quelque chose de propre et sans tache" 
},
'Tilim': {
  translation: "Sale, souillé",
  explanation: "Opposé de 'set'" 
},

// Temps et âge
'Bees': {
  translation: "Nouveau, neuf",
  explanation: "Décrit quelque chose de récent"  
},
'Ndank': {
  translation: "Lent, tardif",
  explanation: "Décrit un rythme peu rapide"
},
'Gawe': {
  translation: "Rapide, précoce", 
  explanation: "Décrit un rythme rapide ou un évènement arrivé plus tôt que prévu"
},
'Saa': {
  translation: "Tôt, à l'avance",
  explanation: "Décrit un moment peu tardif"
},
'Guddeek': {
  translation: "Tardif, en retard",
  explanation: "Opposé de 'saa' - décrit un moment dépassé"   
},
  
// Quantité et mesure  
'Bëri': {
  translation: "Nombreux, abondant",
  explanation: "Décrit une grande quantité"
},
'Néew': {
  translation: "Rare, peu nombreux",
  explanation: "Décrit une faible quantité"  
},

'Xàtt': {
  translation: "Étroit, resserré",
  explanation: "Opposé de 'naat' - décrit une faible largeur"
},
'Diis': {
  translation: "Épais, dense",
  explanation: "Décrit quelque chose de forte épaisseur" 
},  
'Meng': {
  translation: "Mince, fin",
  explanation: "Opposé de 'diis' - décrit une faible épaisseur"
},

// Jugement et appréciation
'Neex': {
  translation: "Délicieux, savoureux",
  explanation: "Décrit quelque chose d'agréable au goût"
},
'Forox': {
  translation: "Mauvais, répugnant",
  explanation: "Décrit quelque chose de désagréable au goût ou à l'odeur"
},

'Ñaaw': {
  translation: "Laid, moche",
  explanation: "Opposé de 'rafet' - désagréable esthétiquement"
},
'Yomb': {
  translation: "Facile, aisé",
  explanation: "Décrit quelque chose de simple à réaliser"  
},
'Jafé': {
  translation: "Difficile, ardu",
  explanation: "Décrit quelque chose de compliqué à réaliser"
},  
'Ndaw': {
  translation: "Jeune, juvénile",
  explanation: "Relatif à la jeunesse ou au début de quelque chose" 
},
'Màggat': {
  translation: "Vieux, âgé",
  explanation: "Relatif à un âge avancé ou une longue durée"
}
  }
},
  };

  export interface GrammarItem {
    translation: string;
    explanation: string;
  }
  export interface GrammarCategory {
    [subcategory: string]: {
      [key: string]: GrammarItem;
    };
  }

  
  export const categoryIllustrations: { [key: string]: string } = {
    'Salutations et expressions courantes': '👋',
    'Nombres': '🔢',
    'Temps': '📅',
    'Animaux': '🐘',
    'Famille et relations': '👨‍👩‍👧‍👦',
    'Nourriture et boissons': '🍽️',
    'Couleurs': '🎨',
    'Parties du corps': '🧑',
    'Verbes courants': '🏃‍♂️',
    'Grammaire':'📚',
  };


  export interface Sentence {
    wolof: string;
    french: string;
    words: string[];
    audio?: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }
  
  export const sentencesToConstruct: Sentence[] = [
    {
      wolof: "Mangi jang wolof",
      french: "J'apprends le wolof",
      words: ["Mangi", "jang", "wolof"],
      difficulty: 'easy'
  },
  {
      wolof: "Jang naa lekkool bi",
      french: "J'ai étudié à l'école",
      words: ["Jang", "naa", "lekkool", "bi"],
      difficulty: 'medium'
  },
  {
      wolof: "Dama bëgg lekk ceeb",
      french: "Je veux manger du riz",
      words: ["Dama", "bëgg", "lekk", "ceeb"],
      difficulty: 'medium'
  },
  {
      wolof: "Sama kër nekk ci Dakar",
      french: "Ma maison est à Dakar",
      words: ["Sama", "kër", "nekk", "ci", "Dakar"],
      difficulty: 'hard'
  },
  {
      wolof: "Nanga def ?",
      french: "Comment allez-vous ?",
      words: ["Nanga", "def","?"],
      difficulty: 'easy'
  },
  {
      wolof: "Maa ngi ci jàmm",
      french: "Je vais bien",
      words: ["Maa", "ngi", "ci", "jàmm"],
      difficulty: 'easy'
  },
  {
      wolof: "Fo dëkk ?",
      french: "Où habites-tu ?",
      words: ["Fo", "dëkk","?"],
      difficulty: 'medium'
  },
  {
      wolof: "Noo tudd ?",
      french: "Comment t'appelles-tu ?",
      words: ["Noo", "tudd","?"],
      difficulty: 'easy'
  },
 
  {
      wolof: "Amul solo",
      french: "De rien / Il n'y a pas de quoi",
      words: ["Amul", "solo"],
      difficulty: 'medium'
  },
  {
      wolof: "Ba beneen yoon",
      french: "À la prochaine fois",
      words: ["Ba", "beneen", "yoon"],
      difficulty: 'medium'
  },
  {
      wolof: "Dama xiif",
      french: "J'ai faim",
      words: ["Dama", "xiif"],
      difficulty: 'easy'
  },
  {
      wolof: "Dama mar",
      french: "J'ai soif",
      words: ["Dama", "mar"],
      difficulty: 'easy'
  },
  {
      wolof: "Nañu dem ca màrse ba",
      french: "Allons au marché",
      words: ["Nañu", "dem", "ca", "màrse", "ba"],
      difficulty: 'hard'
  },
  {
      wolof: "Ñaata la ?",
      french: "Combien ça coûte ?",
      words: ["Ñaata", "la","?"],
      difficulty: 'medium'
  },
  {
      wolof: "Dafa jaaxal",
      french: "C'est cher",
      words: ["Dafa", "jaaxal"],
      difficulty: 'medium'
  },
  {
      wolof: "Dama sonn",
      french: "Je suis fatigué(e)",
      words: ["Dama", "sonn"],
      difficulty: 'easy'
  },
  {
      wolof: "Fan la liggéey?",
      french: "Où travailles-tu ?",
      words: ["Fan", "la", "liggéey ?"],
      difficulty: 'medium'
  },
  {
      wolof: "Nañu naan attaaya",
      french: "Buvons du thé",
      words: ["Nañu", "naan", "attaaya"],
      difficulty: 'medium'
  },
  {
      wolof: "Dama bëgg jàng làkk wi",
      french: "Je veux apprendre la langue",
      words: ["Dama", "bëgg", "jàng", "làkk", "wi"],
      difficulty: 'hard'
  },
{
  wolof: "Dama bëgg dem Senegaal",
  french: "Je veux aller au Sénégal",
  words: ["Dama", "bëgg", "dem", "Senegaal"],
  difficulty: 'medium'
},
{
  wolof: "Ndax am nga waa kër ?",
  french: "As-tu une famille?",
  words: ["Ndax", "am", "nga", "waa", "kër", "?"],
  difficulty: 'hard'
},
{
  wolof: "Nañu dem ci tefes bi",
  french: "Allons à la plage",
  words: ["Nañu", "dem", "ci", "tefes", "bi"],
  difficulty: 'medium'
},
{
  wolof: "Dama bëgg naan ndox",
  french: "Je veux boire de l'eau",
  words: ["Dama", "bëgg", "naan", "ndox"],
  difficulty: 'easy'
},
{
  wolof: "Sama xarit dafa febar",
  french: "Mon ami est malade",
  words: ["Sama", "xarit", "dafa", "febar"],
  difficulty: 'medium'
},
{
  wolof: "Tijan angi jàng téeré-u Aminata",
  french: "Tidiane lit le livre d'Aminata",
  words: ["Tijan", "angi", "jàng", "téeré-u", "Aminata"],
  difficulty: 'medium'
},
{
  wolof: "Mungiy ubi bunt-u taksi bi",
  french: "Il/elle ouvre la porte de ce taxi",
  words: ["Mungiy", "ubi", "bunt-u", "taksi", "bi"],
  difficulty: 'medium'
},
{
  wolof: "Yangi togg ceeb-u yapp",
  french: "Tu cuisines du riz à la viande",
  words: ["Yangi", "togg", "ceeb-u", "yapp"],
  difficulty: 'medium'
},
{
  wolof: "Mangi dugg ci kër-u taabal gi",
  french: "J'entre dans cet immeuble (maison à étage)",
  words: ["Mangi", "dugg", "ci", "kër-u", "taabal", "gi"],
  difficulty: 'hard'
},

// Sentences from Image 2
{
  wolof: "Mungi jënd jën wu bari tey",
  french: "Il/Elle achète beaucoup de poisson aujourd'hui",
  words: ["Mungi", "jënd", "jën", "wu", "bari", "tey"],
  difficulty: 'medium'
},
{
  wolof: "Maa léy bayyi fi, di jënd jën wu yomb wi",
  french: "Je te laisse ici, acheté ce poisson bon marché",
  words: ["Maa", "léy", "bayyi", "fi", "di", "jënd", "jën", "wu", "yomb", "wi"],
  difficulty: 'hard'
},
{
  wolof: "Tey Ndey angiy tog yapp bu bari",
  french: "Aujourd'hui, Ndey cuisine beaucoup de viande",
  words: ["Tey", "Ndey", "angiy", "tog", "yapp", "bu", "bari"],
  difficulty: 'medium'
},
{
  wolof: "Yéenangiy taal safara wu rëy di up saxar si",
  french: "Vous allumez un grand feu, en ventilant la fumée",
  words: ["Yéenangiy", "taal", "safara", "wu", "rëy", "di", "up", "saxar", "si"],
  difficulty: 'hard'
},
{
  wolof: "Ñungi jel yapp, dag ko ak paaka bu rëy, té lakk ko ci safara wi",
  french: "Ils prenent la viande, la coupent avec un grand couteau, et la grillent sur le feu",
  words: ["Ñungi", "jel", "yapp", "dag", "ko", "ak", "paaka", "bu", "rëy", "té", "lakk", "ko", "ci", "safara", "wi"],
  difficulty: 'hard'
},
{
  wolof: "Ban téeré ngay jàng ?",
  french: "Quel livre lis-tu?",
  words: ["Ban", "téeré", "ngay", "jàng", "?"],
  difficulty: 'medium'
},
{
  wolof: "Téeré bi may jàng mooy moom",
  french: "C'est ce livre que je suis en train de lire",
  words: ["Téeré", "bi", "may", "jàng", "mooy", "moom"],
  difficulty: 'hard'
},
{
  wolof: "Can kër ngeen dem ?",
  french: "À quelle maison êtes-vous allés?",
  words: ["Can", "kër", "ngeen", "dem", "?"],
  difficulty: 'medium'
},
{
  wolof: "Kër gi lañu dem",
  french: "C'est à cette maison-là que nous sommes allés",
  words: ["Kër", "gi", "lañu", "dem"],
  difficulty: 'medium'
},
{
  wolof: "Ban taksi laa jel ?",
  french: "Quel taxi ai-je pris?",
  words: ["Ban", "taksi", "laa", "jel", "?"],
  difficulty: 'medium'
},
{
  wolof: "Taksi bi laa jel",
  french: "C'est ce taxi que j'ai pris",
  words: ["Taksi", "bi", "laa", "jel"],
  difficulty: 'medium'
},
{
  wolof: "Ban ceeb ngeen di lekk ?",
  french: "Quel riz êtes-vous en train de manger?",
  words: ["Ban", "ceeb", "ngeen", "di", "lekk", "?"],
  difficulty: 'medium'
},
{
  wolof: "Ceeb bi ñu ngi ko di lekk",
  french: "C'est ce riz que nous sommes en train de manger",
  words: ["Ceeb", "bi", "ñu", "ngi", "ko", "di", "lekk"],
  difficulty: 'hard'
},
{
  wolof: "Lan cin ?",
  french: "Quelle marmite?",
  words: ["Lan", "cin", "?"],
  difficulty: 'easy'
},
{
  wolof: "Fan fas ?",
  french: "Quel cheval ?",
  words: ["Fan", "fas", "?"],
  difficulty: 'easy'
},
{
  wolof: "Kan nit ?",
  french: "Quelle personne?",
  words: ["Kan", "nit", "?"],
  difficulty: 'easy'
},
{
  wolof: "Fan jiggéen ?",
  french: "Quelle femme ?",
  words: ["Fan", "jiggéen", "?"],
  difficulty: 'easy'
},
{
  wolof: "Muus man ?",
  french: "Quel chat ?",
  words: ["Muus", "man", "?"],
  difficulty: 'easy'
},
    
  ];
