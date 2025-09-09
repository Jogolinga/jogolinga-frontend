// data/languages/peul/categories/animaux.ts

import { CategoryData } from '../../../../types/types';

export const animaux: CategoryData = {
  // ANIMAUX DOMESTIQUES - Vérifiés selon les sources académiques
  'Rawaandu': { translation: 'Chien', audio: '/audio/Ff-Rawaandu.ogg', illustration: '🐕' },
  'Muusu': { translation: 'Chat', audio: '/audio/Ff-Muusu.ogg', illustration: '🐈' },
  'Puccu': { translation: 'Cheval', audio: '/audio/Ff-Puccu.ogg', illustration: '🐎' },
  'Nagge': { translation: 'Vache', audio: '/audio/Ff-Nagge.ogg', illustration: '🐄' },
  'Ɓeewa': { translation: 'Chèvre', audio: '/audio/Ff-Beewa.ogg', illustration: '🐐' }, // Corrigé de Mbeewa
  'Ɓaalu': { translation: 'Mouton', audio: '/audio/Ff-Baalu.ogg', illustration: '🐑' }, // Corrigé de Mbaalu
  'Araawa': { translation: 'Âne', audio: '/audio/Ff-Araawa.ogg', illustration: '🫏' }, // Déplacé plus haut
  'Ngaari': { translation: 'Taureau', audio: '/audio/Ff-Ngaari.ogg', illustration: '🐂' },
  
  // VOLAILLE - Avec terminologie correcte
  'Gertogal': { translation: 'Poule', audio: '/audio/Ff-Gertogal.ogg', illustration: '🐔' },
  'Jaawngal': { translation: 'Pintade', audio: '/audio/Ff-Jaawngal.ogg', illustration: '🦃' }, // Corrigé de Jawle
  
  // OISEAUX - Terminologie précisée
  'Ɗonndu': { translation: 'Oiseau (générique)', audio: '/audio/Ff-Donndu.ogg', illustration: '🐦' }, // Corrigé de Sonndu et Conndi
  'Ceekol': { translation: 'Milan', audio: '/audio/Ff-Ceekol.ogg', illustration: '🪶' }, // Précisé (pas aigle)
  'Kuungal': { translation: 'Corbeau', audio: '/audio/Ff-Kuungal.ogg', illustration: '🐦‍⬛' },
  'Pooli': { translation: 'Papillon', audio: '/audio/Ff-Pooli.ogg', illustration: '🦋' },
  
  // POISSONS
  'Liingu': { translation: 'Poisson (générique)', audio: '/audio/Ff-Liingu.ogg', illustration: '🐟' },
  
  // ANIMAUX SAUVAGES - Avec corrections importantes
  'Ɲiiwa': { translation: 'Éléphant', audio: '/audio/Ff-Nyiiwa.ogg', illustration: '🐘' }, // Corrigé orthographe
  'Gaynaawo': { translation: 'Lion', audio: '/audio/Ff-Gaynaawo.ogg', illustration: '🦁' }, // Corrigé de "Rawaandu ladde"
  'Fowru': { translation: 'Hyène', audio: '/audio/Ff-Fowru.ogg', illustration: '🐺' },
  'Ɓoodi': { translation: 'Serpent', audio: '/audio/Ff-Boodi.ogg', illustration: '🐍' }, // Corrigé de Mboddi
  'Geru': { translation: 'Antilope', audio: '/audio/Ff-Geru.ogg', illustration: '🦌' },
  'Ngabbu': { translation: 'Hippopotame', audio: '/audio/Ff-Ngabbu.ogg', illustration: '🦛' },
  'Jiire': { translation: 'Écureuil', audio: '/audio/Ff-Jiire.ogg', illustration: '🐿️' }, // Corrigé de Jaalnde
  'Ɓooju': { translation: 'Lièvre', audio: '/audio/Ff-Booju.ogg', illustration: '🐇' }, // Ajouté terme correct
  
  // ANIMAUX RARES/EXOTIQUES - À vérifier ou supprimer si non attestés
  'Faaba': { translation: 'Rhinocéros', audio: '/audio/Ff-Faaba.ogg', illustration: '🦏' }, // À vérifier
  'Ɓaydi': { translation: 'Zèbre', audio: '/audio/Ff-Baydi.ogg', illustration: '🦓' }, // Remplace "Mbabba" (âne sauvage)
  
  // INSECTES ET ARTHROPODES
  'Ciiwu': { translation: 'Sauterelle/Criquet', audio: '/audio/Ff-Ciiwu.ogg', illustration: '🦗' }, // Ajouté
  'Nammari': { translation: 'Abeille', audio: '/audio/Ff-Nammari.ogg', illustration: '🐝' }, // Ajouté
  'Ɓannge': { translation: 'Mouche', audio: '/audio/Ff-Bannge.ogg', illustration: '🪰' } // Ajouté
};

export default animaux;

export {};