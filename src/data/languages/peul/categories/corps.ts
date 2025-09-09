// data/languages/peul/categories/corps.ts

import { CategoryData } from '../../../../types/types';

export const corps: CategoryData = {
  // TÊTE ET VISAGE - Vérifiés selon sources académiques
  'Hoore': { translation: 'Tête', illustration: '🧠', audio: '/audio/Ff-Hoore.ogg' },
  'Yeeso': { translation: 'Visage', illustration: '😊', audio: '/audio/Ff-Yeeso.ogg' },
  'Yitere': { translation: 'Œil', illustration: '👁️', audio: '/audio/Ff-Yitere.ogg' },
  'Kine': { translation: 'Nez', illustration: '👃', audio: '/audio/Ff-Kine.ogg' },
  'Hunduko': { translation: 'Bouche', illustration: '👄', audio: '/audio/Ff-Hunduko.ogg' },
  'Noppi': { translation: 'Oreille', illustration: '👂', audio: '/audio/Ff-Noppi.ogg' },
  'Ɲiinde': { translation: 'Dent', illustration: '🦷', audio: '/audio/Ff-Nyiinde.ogg' }, // Corrigé orthographe
  'Ɗemngal': { translation: 'Langue', illustration: '👅', audio: '/audio/Ff-Demngal.ogg' },
  'Leeɓi': { translation: 'Lèvres', illustration: '💋', audio: '/audio/Ff-Leebi.ogg' }, // Corrigé sens : pas cheveux mais lèvres
  'Ɗabbi': { translation: 'Cheveux', illustration: '💇', audio: '/audio/Ff-Dabbi.ogg' }, // Terme correct pour cheveux
  
  // MEMBRES - Avec précisions anatomiques
  'Junngo': { translation: 'Bras', illustration: '💪', audio: '/audio/Ff-Junngo.ogg' }, // Précisé : bras seulement
  'Junni': { translation: 'Main', illustration: '🤚', audio: '/audio/Ff-Junni.ogg' }, // Séparé main de bras
  'Koyngal': { translation: 'Jambe', illustration: '🦵', audio: '/audio/Ff-Koyngal.ogg' }, // Précisé : jambe seulement
  'Poddu': { translation: 'Pied', illustration: '🦶', audio: '/audio/Ff-Poddu.ogg' }, // Séparé pied de jambe
  'Hoondu': { translation: 'Doigt', illustration: '👆', audio: '/audio/Ff-Hoondu.ogg' },
  'Ɓerndu': { translation: 'Orteil', illustration: '🦶', audio: '/audio/Ff-Berndu.ogg' }, // Corrigé de Poddu
  'Feɗeendu': { translation: 'Ongle', illustration: '💅', audio: '/audio/Ff-Fedeendu.ogg' },
  'Ɓalɓe': { translation: 'Épaule', illustration: '🫱', audio: '/audio/Ff-Balbe.ogg' }, // Corrigé orthographe
  
  // TRONC ET ORGANES INTERNES
  'Ɓernde': { translation: 'Cœur', illustration: '❤️', audio: '/audio/Ff-Bernde.ogg' },
  'Reedu': { translation: 'Ventre/Estomac', illustration: '🫃', audio: '/audio/Ff-Reedu.ogg' },
  'Ɓaawo': { translation: 'Dos', illustration: '🫸', audio: '/audio/Ff-Baawo.ogg' }, // Corrigé orthographe
  'Heyre': { translation: 'Foie', illustration: '🫀', audio: '/audio/Ff-Heyre.ogg' },
  'Ɓeccal': { translation: 'Côte', illustration: '🦴', audio: '/audio/Ff-Beccal.ogg' }, // Ajouté terme important
  
  // AJOUTS IMPORTANTS - Termes manquants essentiels
  'Woore': { translation: 'Cou', illustration: '🫱', audio: '/audio/Ff-Woore.ogg' },
  'Fuɗɗe': { translation: 'Poitrine', illustration: '🫁', audio: '/audio/Ff-Fudde.ogg' },
  'Keewnde': { translation: 'Os', illustration: '🦴', audio: '/audio/Ff-Keewnde.ogg' },
  'Ɓulnde': { translation: 'Genou', illustration: '🦵', audio: '/audio/Ff-Bulnde.ogg' },
  'Kuurgal': { translation: 'Talon', illustration: '🦶', audio: '/audio/Ff-Kuurgal.ogg' }
};

export default corps;

export {};