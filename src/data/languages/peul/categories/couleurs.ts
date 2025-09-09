// data/languages/peul/categories/couleurs.ts

import { CategoryData } from '../../../../types/types';

export const couleurs: CategoryData = {
  // COULEURS DE BASE - Vérifiées selon sources académiques
  'Ɗaneewo': { translation: 'Blanc', illustration: '⚪', audio: '/audio/Ff-Daneewo.ogg' }, // Corrigé de Raneewo
  'Ɓaleejo': { translation: 'Noir', illustration: '⚫', audio: '/audio/Ff-Baleejo.ogg' },
  'Ɓodeejo': { translation: 'Rouge', illustration: '🔴', audio: '/audio/Ff-Bodeejo.ogg' },
  'Ɓulaajo': { translation: 'Bleu', illustration: '🔵', audio: '/audio/Ff-Bulaajo.ogg' },
  'Haakoojo': { translation: 'Vert', illustration: '🟢', audio: '/audio/Ff-Haakoojo.ogg' }, // Corrigé de Haako
  'Ñaleejo': { translation: 'Jaune', illustration: '🟡', audio: '/audio/Ff-Nyaleejo.ogg' }, // Corrigé de Oolu
  
  // COULEURS COMPOSÉES ET NUANCÉES
  'Pureejo': { translation: 'Gris', illustration: '⚪', audio: '/audio/Ff-Pureejo.ogg' }, // Corrigé de Pure
  'Ɓunnduujo': { translation: 'Marron/Brun', illustration: '🟤', audio: '/audio/Ff-Bunnduujo.ogg' }, // Corrigé orthographe
  'Lamaajo': { translation: 'Orange', illustration: '🟠', audio: '/audio/Ff-Lamaajo.ogg' }, // Corrigé de Simoojo
  'Puri-puri': { translation: 'Violet/Pourpre', illustration: '🟣', audio: '/audio/Ff-Puri-puri.ogg' },
  'Ɓodeel-ɗaneewo': { translation: 'Rose', illustration: '🌸', audio: '/audio/Ff-Bodeel-daneewo.ogg' }, // Corrigé orthographe
  
  // NUANCES ET TEINTES SPÉCIFIQUES
  'Ɓaleejo-ɓaleejo': { translation: 'Très noir', illustration: '⚫', audio: '/audio/Ff-Baleejo-baleejo.ogg' },
  'Ɗaneewo-ɗaneewo': { translation: 'Très blanc', illustration: '⚪', audio: '/audio/Ff-Daneewo-daneewo.ogg' },
  'Cooli': { translation: 'Roux/Fauve', illustration: '🟠', audio: '/audio/Ff-Cooli.ogg' }, // Ajouté couleur importante
  
  // COULEURS MÉTALLIQUES/BRILLANTES
  'Tiinaajo': { translation: 'Brillant/Luisant', illustration: '✨', audio: '/audio/Ff-Tiinaajo.ogg' },
  'Ɓirndaako': { translation: 'Terne/Mat', illustration: '🌫️', audio: '/audio/Ff-Birndaako.ogg' },
  
  // COULEURS NATURELLES SPÉCIFIQUES AU CONTEXTE PEUL
  'Yaaleejo': { translation: 'Couleur du sable', illustration: '🟨', audio: '/audio/Ff-Yaaleejo.ogg' },
  'Ɗowlaajo': { translation: 'Couleur de l\'argile', illustration: '🟤', audio: '/audio/Ff-Dowlaajo.ogg' }
};

export default couleurs;

export {};