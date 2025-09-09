import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './polyfills';

// Définition des types pour le Hot Module Replacement
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  }
}

// Déclaration du type pour module.hot
declare const module: {
  hot?: {
    accept(path: string, callback: () => void): void;
  };
};

// S'assurer que l'élément root existe
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Utiliser la nouvelle API createRoot pour React 18
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Si vous voulez commencer à mesurer les performances dans votre application,
// passez une fonction pour consigner les résultats
reportWebVitals();

// Configuration du Hot Module Replacement (HMR) de manière sûre avec TypeScript
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./App', () => {
    // Importer dynamiquement le nouveau composant App
    const NextApp = require('./App').default;
    // Utiliser la même instance de root pour le HMR
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <NextApp />
        </BrowserRouter>
      </React.StrictMode>
    );
  });
}