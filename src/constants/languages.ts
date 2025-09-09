import type { LanguageCode, LanguageData, CategoryDictionary } from '../types/types';
import { wolof } from '../data/languages/wolof';
import { bambara } from '../data/languages/bambara';
import lingala from '../data/languages/lingala';
import { peul } from '../data/languages/peul';
import { copte } from '../data/languages/copte';
import { swahili } from '../data/languages/swahili';

export const LANGUAGES: Record<LanguageCode, LanguageData> = {
  'wf': {
    ...wolof,
    code: 'wf',
  },
  'ba': {
    ...bambara,
    code: 'ba',
  },
  'la': {
    ...lingala,
    code: 'la',
  },
  'ff': {
    ...peul,
    code: 'ff',
  },
  'co': {
    ...copte,
    code: 'co',
  },
   'sw': {
    ...swahili,
    code: 'sw',
  }
};

export const LANGUAGE_CODES = {
  WOLOF: 'wf' as LanguageCode,
  BAMBARA: 'ba' as LanguageCode,
  LINGALA: 'la' as LanguageCode,
  PEUL: 'ff' as LanguageCode,
  COPTE: 'co' as LanguageCode,
  SWAHILI: 'sw' as LanguageCode
} as const;

// ✅ SUPPRIMÉ: DEFAULT_LANGUAGE (plus de langue par défaut)
// export const DEFAULT_LANGUAGE: LanguageCode = LANGUAGE_CODES.WOLOF;

export const AVAILABLE_LANGUAGES = Object.keys(LANGUAGES) as LanguageCode[];

export const getLanguageInfo = (code: LanguageCode): LanguageData => {
  const language = LANGUAGES[code];
  if (!language) {
    throw new Error(`Language ${code} not found`);
  }
  return language;
};

export const isLanguageAvailable = (code: string): code is LanguageCode => {
  return code in LANGUAGES;
};

// ✅ NOUVEAU: Fonction pour récupérer la dernière langue utilisée
export const getLastUsedLanguage = (): LanguageCode | null => {
  try {
    const lastLanguage = localStorage.getItem('lastUsedLanguage') as LanguageCode;
    if (lastLanguage && isLanguageAvailable(lastLanguage)) {
      console.log('🔍 Dernière langue trouvée:', lastLanguage);
      return lastLanguage;
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de la récupération de la dernière langue utilisée:', error);
  }
  console.log('🔍 Aucune langue précédente trouvée');
  return null;
};

// ✅ NOUVEAU: Fonction pour sauvegarder la dernière langue utilisée
export const saveLastUsedLanguage = (language: LanguageCode): void => {
  try {
    localStorage.setItem('lastUsedLanguage', language);
    console.log('💾 Langue sauvegardée:', language);
  } catch (error) {
    console.warn('⚠️ Erreur lors de la sauvegarde de la dernière langue utilisée:', error);
  }
};

// ✅ NOUVEAU: Fonction pour vérifier si c'est la première utilisation
export const isFirstTimeUser = (): boolean => {
  try {
    const hasEverUsedApp = localStorage.getItem('hasEverUsedApp');
    const lastUsedLanguage = getLastUsedLanguage();
    
    const isFirstTime = !hasEverUsedApp && !lastUsedLanguage;
    console.log('🔍 Première utilisation détectée:', isFirstTime);
    
    return isFirstTime;
  } catch (error) {
    console.warn('⚠️ Erreur lors de la vérification première utilisation:', error);
    return true; // Par défaut, considérer comme première utilisation
  }
};

// ✅ NOUVEAU: Fonction pour marquer la première utilisation comme terminée
export const markAppAsUsed = (): void => {
  try {
    localStorage.setItem('hasEverUsedApp', 'true');
    console.log('✅ Application marquée comme utilisée');
  } catch (error) {
    console.warn('⚠️ Erreur lors du marquage de première utilisation:', error);
  }
};

// ✅ NOUVEAU: Fonction pour obtenir les informations d'affichage des langues
export const getLanguageDisplayInfo = () => {
  return {
    wf: { name: 'Wolof', flag: '🇸🇳', description: 'Langue du Sénégal', color: '#10B981' },
    ba: { name: 'Bambara', flag: '🇲🇱', description: 'Langue du Mali', color: '#F59E0B' },
    la: { name: 'Lingala', flag: '🇨🇩', description: 'Langue du Congo', color: '#3B82F6' },
    ff: { name: 'Peul', flag: '🇸🇳', description: 'Langue peule', color: '#8B5CF6' },
    co: { name: 'Copte', flag: '🇪🇬', description: 'Langue de l\'Égypte antique', color: '#EF4444' },
    sw: { name: 'Swahili', flag: 'TZ', description: 'Langue de la Tanzanie', color: '#06B6D4' }
  } as const;
};