// useAppStyles.ts - Hook personnalisé pour gérer les styles d'App

import { useEffect } from 'react';

export type AppMode = 
  | 'menu' 
  | 'sentenceConstruction' 
  | 'sentenceGap' 
  | 'learn' 
  | 'review' 
  | 'quiz' 
  | 'exercise';

interface AppStyleConfig {
  justifyContent: 'center' | 'flex-start';
  alignItems: 'center' | 'stretch';
  padding: string;
  minHeight: string;
}

const STYLE_CONFIGS: Record<AppMode, AppStyleConfig> = {
  menu: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    minHeight: '100vh'
  },
  sentenceConstruction: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '0',
    minHeight: '100vh'
  },
  sentenceGap: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '0',
    minHeight: '100vh'
  },
  learn: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '1rem',
    minHeight: '100vh'
  },
  review: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '1rem',
    minHeight: '100vh'
  },
  quiz: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '0',
    minHeight: '100vh'
  },
  exercise: {
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    padding: '0',
    minHeight: '100vh'
  }
};

export const useAppStyles = (mode: AppMode) => {
  useEffect(() => {
    const appElement = document.querySelector('.App') as HTMLElement;
    
    if (!appElement) {
      console.warn('Element .App non trouvé');
      return;
    }

    // Obtenir la configuration pour ce mode
    const config = STYLE_CONFIGS[mode];
    
    // Sauvegarder les styles originaux
    const originalStyles = {
      justifyContent: appElement.style.justifyContent,
      alignItems: appElement.style.alignItems,
      padding: appElement.style.padding,
      minHeight: appElement.style.minHeight
    };

    // Appliquer les nouveaux styles
    appElement.style.justifyContent = config.justifyContent;
    appElement.style.alignItems = config.alignItems;
    appElement.style.padding = config.padding;
    appElement.style.minHeight = config.minHeight;
    
    // Ajouter une classe pour identifier le mode actuel
    appElement.className = `App ${mode}-active`;
    
    console.log(`Styles appliqués pour le mode: ${mode}`, config);

    // Fonction de nettoyage
    return () => {
      if (appElement) {
        // Restaurer les styles originaux
        Object.assign(appElement.style, originalStyles);
        
        // Retirer les classes de mode
        appElement.className = 'App';
        
        console.log(`Styles restaurés après le mode: ${mode}`);
      }
    };
  }, [mode]);
};

// Hook alternatif plus simple
export const useFixedAppStyles = (mode: AppMode) => {
  useEffect(() => {
    const appElement = document.querySelector('.App') as HTMLElement;
    
    if (appElement) {
      // Simplement changer la classe CSS
      appElement.className = `App ${mode}-active`;
    }
    
    return () => {
      if (appElement) {
        appElement.className = 'App menu-active'; // Retour au menu par défaut
      }
    };
  }, [mode]);
};

export{};