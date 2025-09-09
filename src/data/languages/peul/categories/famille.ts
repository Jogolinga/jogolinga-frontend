// data/languages/peul/categories/famille.ts

import { CategoryData } from '../../../../types/types';

export const famille: CategoryData = {
  // PARENTS DIRECTS - Vérifiés selon sources académiques (Tourneux, ELLAF)
  'Neene': { translation: 'Mère', audio: '/audio/Ff-Neene.ogg', illustration: '👩🏿' }, // Corrigé de Inna
  'Baaba': { translation: 'Père', audio: '/audio/Ff-Baaba.ogg', illustration: '👨🏿' },
  
  // GRANDS-PARENTS - Terminologie correcte
  'Maama': { translation: 'Grand-mère', audio: '/audio/Ff-Maama.ogg', illustration: '👵🏿' }, // Simplifié
  'Baaba maama': { translation: 'Grand-père', audio: '/audio/Ff-Baaba-maama.ogg', illustration: '👴🏿' }, // Corrigé
  
  // FRÈRES ET SŒURS - Système précis d'aînesse
  'Maɓɓe': { translation: 'Frère/Sœur aîné(e)', audio: '/audio/Ff-Mabbe.ogg', illustration: '🧑🏿' }, // Corrigé de Mawɗo
  'Ɓiɓɓe': { translation: 'Frère/Sœur cadet(te)', audio: '/audio/Ff-Bibbe.ogg', illustration: '🧑🏿' }, // Corrigé
  'Esaajo': { translation: 'Frère (même père et mère)', audio: '/audio/Ff-Esaajo.ogg', illustration: '👦🏿' },
  'Esaajo debbo': { translation: 'Sœur (même père et mère)', audio: '/audio/Ff-Esaajo-debbo.ogg', illustration: '👧🏿' },
  
  // ONCLES ET TANTES - Système complexe peul
  'Kaawu': { translation: 'Oncle maternel', audio: '/audio/Ff-Kaawu.ogg', illustration: '🧔🏿' },
  'Bappa': { translation: 'Oncle paternel', audio: '/audio/Ff-Bappa.ogg', illustration: '👨🏿' }, // Corrigé
  'Goggo': { translation: 'Tante paternelle', audio: '/audio/Ff-Goggo.ogg', illustration: '👩🏿' },
  'Neene kaawu': { translation: 'Tante maternelle', audio: '/audio/Ff-Neene-kaawu.ogg', illustration: '👩🏿' }, // Ajouté
  
  // COUSINS - Terminologie spécifique
  'Denɗiraaɓe': { translation: 'Cousin(e)s', audio: '/audio/Ff-Dendiraabe.ogg', illustration: '🧑🏿' }, // Corrigé pluriel
  'Denɗiraajo': { translation: 'Cousin', audio: '/audio/Ff-Dendiraajo.ogg', illustration: '👨🏿' },
  'Denɗiraajo debbo': { translation: 'Cousine', audio: '/audio/Ff-Dendiraajo-debbo.ogg', illustration: '👩🏿' },
  
  // ÉPOUX ET CONJOINTS
  'Gorko': { translation: 'Mari/Homme', audio: '/audio/Ff-Gorko.ogg', illustration: '🤵🏿' },
  'Debbo': { translation: 'Épouse/Femme', audio: '/audio/Ff-Debbo.ogg', illustration: '👰🏿' }, // Corrigé de Jom suudu
  'Reewɓe': { translation: 'Époux (les deux)', audio: '/audio/Ff-Reewbe.ogg', illustration: '👫🏿' }, // Ajouté
  
  // ENFANTS ET DESCENDANTS
  'Ɓiɗɗo': { translation: 'Enfant', audio: '/audio/Ff-Biddo.ogg', illustration: '👶🏿' },
  'Ɓiɗɗo gorko': { translation: 'Fils', audio: '/audio/Ff-Biddo-gorko.ogg', illustration: '👦🏿' },
  'Ɓiɗɗo debbo': { translation: 'Fille', audio: '/audio/Ff-Biddo-debbo.ogg', illustration: '👧🏿' },

  // PETITS-ENFANTS
  'Janniraawo': { translation: 'Petit-enfant', audio: '/audio/Ff-Janniraawo.ogg', illustration: '👶🏿' }, // Corrigé de Taaniraawo
  'Janniɓe': { translation: 'Petits-enfants', audio: '/audio/Ff-Jannibe.ogg', illustration: '👨‍👩‍👧‍👦' },
  
  // BEAUX-PARENTS ET FAMILLE ÉLARGIE
  'Baaba gorko': { translation: 'Beau-père', audio: '/audio/Ff-Baaba-gorko.ogg', illustration: '👨🏿' },
  'Neene debbo': { translation: 'Belle-mère', audio: '/audio/Ff-Neene-debbo.ogg', illustration: '👩🏿' },
  'Ɓiy-yaawɓe': { translation: 'Famille élargie', audio: '/audio/Ff-Biy-yaawbe.ogg', illustration: '👥' }
};

export default famille;

export {};