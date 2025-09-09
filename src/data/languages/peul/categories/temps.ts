// data/languages/peul/categories/temps.ts
import { CategoryData } from '../../../../types/types';

export const temps: CategoryData = {
  // JOURS DE LA SEMAINE - Emprunts arabes standardisés
  'Altini': { translation: 'Lundi', audio: '/audio/Ff-Altini.ogg', illustration: '1️⃣' }, // Corrigé de Arata
  'Talaata': { translation: 'Mardi', audio: '/audio/Ff-Talaata.ogg', illustration: '2️⃣' },
  'Alarba': { translation: 'Mercredi', audio: '/audio/Ff-Alarba.ogg', illustration: '3️⃣' },
  'Alkamiisa': { translation: 'Jeudi', audio: '/audio/Ff-Alkamiisa.ogg', illustration: '4️⃣' },
  'Aljumma': { translation: 'Vendredi', audio: '/audio/Ff-Aljumma.ogg', illustration: '5️⃣' }, // Corrigé de Jumma
  'Asaɓt': { translation: 'Samedi', audio: '/audio/Ff-Asabt.ogg', illustration: '6️⃣' }, // Corrigé de Asete
  'Alhad': { translation: 'Dimanche', audio: '/audio/Ff-Alhad.ogg', illustration: '7️⃣' }, // Corrigé de Dewo

  // PARTIES DE LA JOURNÉE - Terminologie peule authentique
  'Subbaaka': { translation: 'Matin (tôt)', audio: '/audio/Ff-Subbaaka.ogg', illustration: '🌅' }, // Corrigé orthographe
  'Ɓaali': { translation: 'Matinée', audio: '/audio/Ff-Baali.ogg', illustration: '🌄' },
  'Ɓeeti': { translation: 'Milieu de journée', audio: '/audio/Ff-Beeti.ogg', illustration: '☀️' },
  'Ɲaali': { translation: 'Après-midi', audio: '/audio/Ff-Nyaali.ogg', illustration: '🌇' }, // Corrigé de Kiikiɗe
  'Hiinde': { translation: 'Soirée', audio: '/audio/Ff-Hiinde.ogg', illustration: '🌆' },
  'Keeri': { translation: 'Nuit (début)', audio: '/audio/Ff-Keeri.ogg', illustration: '🌙' },
  'Jemma': { translation: 'Nuit (profonde)', audio: '/audio/Ff-Jemma.ogg', illustration: '🌃' },

  // RÉFÉRENCE TEMPORELLE - Jours relatifs
  'Hannde': { translation: 'Aujourd\'hui', audio: '/audio/Ff-Hannde.ogg', illustration: '📍' },
  'Haŋki': { translation: 'Hier', audio: '/audio/Ff-Hanki.ogg', illustration: '⬅️' },
  'Janngo': { translation: 'Demain', audio: '/audio/Ff-Janngo.ogg', illustration: '➡️' },
  'Ɲiiri hannde': { translation: 'Avant-hier', audio: '/audio/Ff-Nyiiri-hannde.ogg', illustration: '⬅️⬅️' },
  'Yeeso janngo': { translation: 'Après-demain', audio: '/audio/Ff-Yeeso-janngo.ogg', illustration: '➡️➡️' },

  // UNITÉS DE TEMPS - Vocabulaire fondamental
  'Ɲalawma': { translation: 'Jour (24h)', audio: '/audio/Ff-Nyalawma.ogg', illustration: '📆' }, // Corrigé orthographe
  'Yontere': { translation: 'Semaine', audio: '/audio/Ff-Yontere.ogg', illustration: '📅' },
  'Lewru': { translation: 'Mois', audio: '/audio/Ff-Lewru.ogg', illustration: '🗓️' },
  'Duuɓi': { translation: 'Année', audio: '/audio/Ff-Duubi.ogg', illustration: '📊' }, // Corrigé de Hitaande
  'Duuɓi gooto': { translation: 'Une année', audio: '/audio/Ff-Duubi-gooto.ogg', illustration: '1️⃣📊' },

  // SAISONS - Importantes dans la culture pastorale peule
  'Ceeɗu': { translation: 'Saison sèche froide', audio: '/audio/Ff-Ceedu.ogg', illustration: '🏜️❄️' },
  'Ɓeelo': { translation: 'Saison sèche chaude', audio: '/audio/Ff-Beelo.ogg', illustration: '🏜️🔥' },
  'Ndungu': { translation: 'Saison des pluies', audio: '/audio/Ff-Ndungu.ogg', illustration: '🌧️' },

  // EXPRESSIONS TEMPORELLES COURANTES
  'Jooni': { translation: 'Maintenant', audio: '/audio/Ff-Jooni.ogg', illustration: '⏰' },
  'Ɗuum': { translation: 'Ce moment-là', audio: '/audio/Ff-Duum.ogg', illustration: '⏳' },
  'Teeminere': { translation: 'Longtemps', audio: '/audio/Ff-Teeminere.ogg', illustration: '⌛' },
  'Saɓɓu': { translation: 'Tôt', audio: '/audio/Ff-Sabbu.ogg', illustration: '⏰' },
  'Sakito': { translation: 'Tard', audio: '/audio/Ff-Sakito.ogg', illustration: '⏰' },

  // MOMENTS RELIGIEUX/CULTURELS
  'Subbaaka ṣalaa': { translation: 'Prière du matin', audio: '/audio/Ff-Subbaaka-salaa.ogg', illustration: '🕌🌅' },
  'Luhar': { translation: 'Prière de midi', audio: '/audio/Ff-Luhar.ogg', illustration: '🕌☀️' },
  'Magrib': { translation: 'Prière du coucher', audio: '/audio/Ff-Magrib.ogg', illustration: '🕌🌆' }
};

export default temps;