// src/context/NavigationManager.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { AppMode } from '../types/types';

// Structure pour représenter un niveau de navigation
export interface NavigationState {
  mode: AppMode;
  category?: string | null;
  subcategory?: string | null;
  data?: any; // Pour des données supplémentaires si nécessaire
}

interface NavigationContextType {
  navigationStack: NavigationState[];
  currentState: NavigationState;
  pushState: (state: NavigationState) => void;
  popState: () => NavigationState | undefined;
  replaceState: (state: NavigationState) => void;
  resetStack: (initialState?: NavigationState) => void;
  canGoBack: () => boolean;
}

// Valeur par défaut pour le menu principal
const defaultState: NavigationState = {
  mode: 'menu',
  category: null,
  subcategory: null
};

const NavigationContext = createContext<NavigationContextType>({
  navigationStack: [defaultState],
  currentState: defaultState,
  pushState: () => {},
  popState: () => undefined,
  replaceState: () => {},
  resetStack: () => {},
  canGoBack: () => false
});

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigationStack, setNavigationStack] = useState<NavigationState[]>([defaultState]);

  // Obtenir l'état de navigation actuel (le dernier de la pile)
  const currentState = navigationStack[navigationStack.length - 1];

  // Ajouter un nouvel état à la pile
  const pushState = useCallback((state: NavigationState) => {
    setNavigationStack(prevStack => [...prevStack, state]);
  }, []);

  // Retirer le dernier état et revenir au précédent
  const popState = useCallback(() => {
    if (navigationStack.length <= 1) return undefined;
    
    let newStack = [...navigationStack];
    const removedState = newStack.pop();
    setNavigationStack(newStack);
    return removedState;
  }, [navigationStack]);

  // Remplacer l'état actuel
  const replaceState = useCallback((state: NavigationState) => {
    setNavigationStack(prevStack => {
      const newStack = [...prevStack];
      newStack[newStack.length - 1] = state;
      return newStack;
    });
  }, []);

  // Réinitialiser la pile avec un seul état
  const resetStack = useCallback((initialState: NavigationState = defaultState) => {
    setNavigationStack([initialState]);
  }, []);

  // Vérifier si on peut revenir en arrière
  const canGoBack = useCallback(() => {
    return navigationStack.length > 1;
  }, [navigationStack]);

  return (
    <NavigationContext.Provider 
      value={{ 
        navigationStack, 
        currentState,
        pushState, 
        popState, 
        replaceState,
        resetStack,
        canGoBack
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export {}; 