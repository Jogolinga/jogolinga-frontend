// ===================================================================
// GoogleAuth.tsx - VERSION PRODUCTION AVEC NETTOYAGE COMPLET LOCALSTORAGE
// ===================================================================
import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import './GoogleAuth.css';

// Import du service sécurisé et du service de paiement
import secureAuthService from '../services/secureAuthService';
import paymentService from '../services/paymentService';

const clientId = '623022530041-selrf11milvgptfjvtnarvc6dnnn0bar.apps.googleusercontent.com';
const scopes = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly';

interface GoogleAuthProps {
  onLogin: (user: any) => void;
  onLogout: () => void;
  isHeader?: boolean;
  onForceLoginPage?: () => void;
  isMobile?: boolean;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

// Interface pour la réponse backend avec tous les types de tokens possibles
interface BackendUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  jwtToken?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  [key: string]: any; // Pour d'autres propriétés possibles
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ 
  onLogin, 
  onLogout, 
  isHeader = false,
  onForceLoginPage
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);

  // Vérification sécurisée des props
  const safeOnLogin = onLogin || (() => console.warn('onLogin prop non définie'));
  const safeOnLogout = onLogout || (() => console.warn('onLogout prop non définie'));

  // ⭐ FONCTION DE NETTOYAGE COMPLET AMÉLIORÉE
  const handleFullReset = async () => {
    try {
      console.log('[GoogleAuth] 🧹 Début du nettoyage complet...');
      
      // Nettoyer Google
      if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
        await gapi.auth2.getAuthInstance().signOut();
      }
      
      // Nettoyer notre backend
      secureAuthService.logout();
      
      // ⭐ NETTOYAGE COMPLET ET SYSTÉMATIQUE DU LOCALSTORAGE
      console.log('[GoogleAuth] 🗂️ Nettoyage localStorage...');
      
      // Option 1: Nettoyage ciblé (recommandé pour la sécurité)
      const keysToRemove = [
        // Tokens et authentification
        'googleToken', 'tokenExpires', 'googleScopes',
        'secureToken', 'secureUser', 'user_subscription',
        
        // Données utilisateur par langue - Progress
        'fr-progress', 'en-progress', 'es-progress', 'de-progress',
        'it-progress', 'pt-progress', 'ru-progress', 'ja-progress',
        'ko-progress', 'zh-progress', 'ar-progress', 'hi-progress',
        
        // Catégories complétées par langue
        'fr-completedCategories', 'en-completedCategories', 'es-completedCategories',
        'de-completedCategories', 'it-completedCategories', 'pt-completedCategories',
        'ru-completedCategories', 'ja-completedCategories', 'ko-completedCategories',
        'zh-completedCategories', 'ar-completedCategories', 'hi-completedCategories',
        
        // XP par langue
        'fr-totalXP', 'en-totalXP', 'es-totalXP', 'de-totalXP',
        'it-totalXP', 'pt-totalXP', 'ru-totalXP', 'ja-totalXP',
        'ko-totalXP', 'zh-totalXP', 'ar-totalXP', 'hi-totalXP',
        
        // Données d'exercices grammaire par langue
        'grammar-progress-fr', 'grammar-progress-en', 'grammar-progress-es',
        'grammar-progress-de', 'grammar-progress-it', 'grammar-progress-pt',
        'grammar-progress-ru', 'grammar-progress-ja', 'grammar-progress-ko',
        'grammar-progress-zh', 'grammar-progress-ar', 'grammar-progress-hi',
        
        // Révisions par langue
        'revision-history-fr', 'revision-history-en', 'revision-history-es',
        'revision-history-de', 'revision-history-it', 'revision-history-pt',
        'revision-history-ru', 'revision-history-ja', 'revision-history-ko',
        'revision-history-zh', 'revision-history-ar', 'revision-history-hi',
        
        // Autres données utilisateur
        'streak', 'lastAnswerCorrect', 'currentLanguage',
        
        // Données temporaires et états
        'lastActiveTab', 'showLanguageSelection', 'isFirstConnection'
      ];
      
      let removedCount = 0;
      keysToRemove.forEach(key => {
        try {
          if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            removedCount++;
            console.log(`[GoogleAuth] ✅ Supprimé: ${key}`);
          }
        } catch (error) {
          console.warn(`[GoogleAuth] ⚠️ Erreur suppression ${key}:`, error);
        }
      });
      
      console.log(`[GoogleAuth] 📊 ${removedCount} clés supprimées du localStorage`);

      // ⭐ DÉCLENCHER DES ÉVÉNEMENTS DE RÉINITIALISATION
      console.log('[GoogleAuth] 📡 Déclenchement des événements de nettoyage...');
      
      // Événement pour réinitialiser l'XP
      window.dispatchEvent(new CustomEvent('xpReset', { 
        detail: { 
          source: 'logout',
          timestamp: Date.now()
        }
      }));
      
      // Événement pour réinitialiser les révisions
      window.dispatchEvent(new CustomEvent('revisionDataCleared', { 
        detail: { 
          source: 'logout',
          timestamp: Date.now()
        }
      }));
      
      // Événement général de déconnexion
      window.dispatchEvent(new CustomEvent('userLoggedOut', { 
        detail: { 
          source: 'googleauth_logout',
          timestamp: Date.now()
        }
      }));
      
      // Option 2: Nettoyage alternatif - supprimer tout sauf les préférences UI
      // (Décommentez si vous préférez cette approche)
      /*
      const allKeys = Object.keys(localStorage);
      const keysToPreserve = [
        'theme', // Préférences de thème
        'language-preference', // Langue préférée pour le prochain login
        'ui-preferences' // Autres préférences UI
      ];
      
      allKeys.forEach(key => {
        if (!keysToPreserve.includes(key)) {
          try {
            localStorage.removeItem(key);
            console.log(`[GoogleAuth] ✅ Supprimé: ${key}`);
          } catch (error) {
            console.warn(`[GoogleAuth] ⚠️ Erreur suppression ${key}:`, error);
          }
        }
      });
      */
      
      // Réinitialiser les états
      setIsLoggedIn(false);
      setUser(null);
      setError(null);
      
      console.log('[GoogleAuth] ✅ Nettoyage complet terminé');
      
    } catch (error) {
      console.error('[GoogleAuth] ❌ Erreur lors du nettoyage:', error);
    }
  };

  useEffect(() => {
    // Vérifier d'abord si on a déjà une session sécurisée
    const checkExistingAuth = async () => {
      if (secureAuthService.isAuthenticated()) {
        const currentUser = secureAuthService.getCurrentUser();
        if (currentUser) {
          // NOUVEAU: Restaurer le token pour les paiements si disponible
          const token = secureAuthService.getToken();
          if (token) {
            console.log('[GoogleAuth] Restauration du token pour PaymentService');
            paymentService.setAuthToken(token);
          }
          
          setUser({
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            picture: currentUser.picture
          });
          setIsLoggedIn(true);
          setIsLoading(false);
          safeOnLogin(currentUser);
          return;
        }
      }

      // Sinon, initialiser Google API
      initializeGoogleAPI();
    };

    checkExistingAuth();

    // Écouter les changements d'état d'authentification
    const handleAuthChange = (event: CustomEvent) => {
      const { isAuthenticated, user: authUser } = event.detail;
      
      setIsLoggedIn(isAuthenticated);
      
      if (isAuthenticated && authUser) {
        setUser({
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          picture: authUser.picture
        });
      } else {
        setUser(null);
      }
    };

    window.addEventListener('authStatusChanged', handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange as EventListener);
    };
  }, [isHeader]);

  // Initialiser l'API Google avec protection contre les multiples initialisations
  const initializeGoogleAPI = () => {
    if (gapiInitialized) {
      setIsLoading(false);
      return;
    }

    const initGapi = async () => {
      try {
        console.log('[GoogleAuth] Initialisation de l\'API Google...');
        
        await gapi.load('auth2', async () => {
          try {
            const authInstance = await gapi.auth2.init({
              client_id: clientId,
              scope: scopes,
              fetch_basic_profile: true,
              ux_mode: 'popup',
              prompt: 'select_account'
            });

            setGapiInitialized(true);
            setIsLoading(false);
            console.log('[GoogleAuth] ✅ API Google initialisée avec succès');
          } catch (initError) {
            console.error('[GoogleAuth] ❌ Erreur d\'initialisation Google:', initError);
            setError('Erreur d\'initialisation Google');
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('[GoogleAuth] ❌ Erreur lors du chargement de l\'API Google:', error);
        setError('Impossible de charger l\'API Google');
        setIsLoading(false);
      }
    };

    initGapi();
  };

  // Connexion sécurisée avec Google
  const handleSecureLogin = async () => {
    if (isProcessing || !gapiInitialized) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('[GoogleAuth] 🚀 Début de la connexion sécurisée...');

      // 1. Obtenir l'instance d'authentification Google
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Instance Google Auth non disponible');
      }

      // 2. Connecter l'utilisateur et récupérer le token ID de Google
      const googleUser = await authInstance.signIn();

      // Récupérer le token ID de Google
      let authResponse = googleUser.getAuthResponse(true);
      let googleToken = authResponse.id_token;

      // 3. Vérifier l'expiration et rafraîchir si nécessaire
      if (Date.now() >= authResponse.expires_at) {
        authResponse = await googleUser.reloadAuthResponse();
        googleToken = authResponse.id_token;
      }

      if (!googleToken) {
        throw new Error('Impossible d\'obtenir un token Google valide');
      }

      // 5. Authentifier via notre backend sécurisé
      const backendUser: BackendUser = await secureAuthService.authenticateWithGoogle(googleToken);

      // Log pour diagnostic (à supprimer en production si souhaité)
      console.log('[GoogleAuth] Réponse backend complète:', backendUser);
      console.log('[GoogleAuth] Propriétés disponibles:', Object.keys(backendUser));

      // NOUVEAU: Configurer le token pour les paiements - VERSION ROBUSTE
      const { jwtToken, token, accessToken, access_token } = backendUser;
      const authToken = jwtToken || token || accessToken || access_token;

      if (authToken) {
        console.log('[GoogleAuth] Configuration du token pour PaymentService');
        paymentService.setAuthToken(authToken);
      } else {
        console.warn('[GoogleAuth] Aucun token JWT trouvé dans la réponse backend');
        console.warn('[GoogleAuth] Propriétés de token recherchées: jwtToken, token, accessToken, access_token');
      }

      // 6. Mettre à jour l'état local
      const userData = {
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        picture: backendUser.picture
      };
      
      setUser(userData);
      setIsLoggedIn(true);
      
      // Protection : Appel sécurisé de onLogin
      try {
        safeOnLogin(backendUser);
      } catch (callbackError) {
        console.error('Erreur callback onLogin:', callbackError);
      }

      // 7. Stocker aussi les infos Google pour compatibilité
      localStorage.setItem('googleToken', authResponse.access_token);
      localStorage.setItem('tokenExpires', String(authResponse.expires_at));
      localStorage.setItem('googleScopes', authResponse.scope);

    } catch (error) {
      console.error('Erreur connexion sécurisée:', error);
      
      // Diagnostic détaillé de l'erreur
      if (error instanceof Error) {
        if (error.message.includes('popup_closed_by_user')) {
          setError('Connexion annulée par l\'utilisateur');
        } else if (error.message.includes('network')) {
          setError('Erreur de réseau - vérifiez votre connexion');
        } else if (error.message.includes('401')) {
          setError('Token Google invalide - reconnectez-vous');
          await handleFullReset();
        } else if (error.message.includes('Backend inaccessible')) {
          setError('Serveur non disponible');
        } else {
          setError(`Erreur: ${error.message}`);
        }
      } else {
        setError('Erreur de connexion inconnue');
      }
      
      // En cas d'erreur backend, déconnecter Google aussi
      try {
        if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
          await gapi.auth2.getAuthInstance().signOut();
        }
      } catch (googleError) {
        console.error('Erreur déconnexion Google:', googleError);
      }

      setIsLoggedIn(false);
      setUser(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // ⭐ DÉCONNEXION SÉCURISÉE AVEC NETTOYAGE COMPLET
  const handleSecureLogout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log('[GoogleAuth] 🚪 Début de la déconnexion sécurisée...');

      // 1. Déconnecter du backend sécurisé
      secureAuthService.logout();

      // 2. Nettoyer le token du PaymentService
      console.log('[GoogleAuth] Nettoyage du token PaymentService lors de la déconnexion');
      try {
        paymentService.setAuthToken('');
      } catch (paymentError) {
        console.warn('[GoogleAuth] Erreur lors du nettoyage du token PaymentService:', paymentError);
      }

      // 3. Déconnecter de Google
      try {
        if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
          await gapi.auth2.getAuthInstance().signOut();
        }
      } catch (googleError) {
        console.warn('Erreur déconnexion Google (non critique):', googleError);
      }

      // 4. ⭐ NETTOYAGE COMPLET DU LOCALSTORAGE ⭐
      console.log('[GoogleAuth] 🧹 Nettoyage complet du localStorage...');
      
      // Méthode 1: Nettoyage ciblé avec toutes les clés possibles
      const keysToRemove = [
        // Tokens et authentification
        'googleToken', 'tokenExpires', 'googleScopes',
        'secureToken', 'secureUser', 'user_subscription',
        
        // Données utilisateur par langue - Progress
        'fr-progress', 'en-progress', 'es-progress', 'de-progress',
        'it-progress', 'pt-progress', 'ru-progress', 'ja-progress',
        'ko-progress', 'zh-progress', 'ar-progress', 'hi-progress',
        'wf-progress', // Ajout Wolof
        
        // Catégories complétées par langue
        'fr-completedCategories', 'en-completedCategories', 'es-completedCategories',
        'de-completedCategories', 'it-completedCategories', 'pt-completedCategories',
        'ru-completedCategories', 'ja-completedCategories', 'ko-completedCategories',
        'zh-completedCategories', 'ar-completedCategories', 'hi-completedCategories',
        'wf-completedCategories',
        
        // ⭐ XP par langue (CRITIQUE pour la barre de progression)
        'fr-totalXP', 'en-totalXP', 'es-totalXP', 'de-totalXP',
        'it-totalXP', 'pt-totalXP', 'ru-totalXP', 'ja-totalXP',
        'ko-totalXP', 'zh-totalXP', 'ar-totalXP', 'hi-totalXP',
        'wf-totalXP',
        
        // Données d'exercices grammaire par langue
        'grammar-progress-fr', 'grammar-progress-en', 'grammar-progress-es',
        'grammar-progress-de', 'grammar-progress-it', 'grammar-progress-pt',
        'grammar-progress-ru', 'grammar-progress-ja', 'grammar-progress-ko',
        'grammar-progress-zh', 'grammar-progress-ar', 'grammar-progress-hi',
        'grammar-progress-wf',
        
        // Construction de phrases par langue
        'sentence-construction-progress-fr', 'sentence-construction-progress-en',
        'sentence-construction-progress-es', 'sentence-construction-progress-de',
        'sentence-construction-progress-it', 'sentence-construction-progress-pt',
        'sentence-construction-progress-ru', 'sentence-construction-progress-ja',
        'sentence-construction-progress-ko', 'sentence-construction-progress-zh',
        'sentence-construction-progress-ar', 'sentence-construction-progress-hi',
        'sentence-construction-progress-wf',
        
        // Révisions par langue
        'revision-history-fr', 'revision-history-en', 'revision-history-es',
        'revision-history-de', 'revision-history-it', 'revision-history-pt',
        'revision-history-ru', 'revision-history-ja', 'revision-history-ko',
        'revision-history-zh', 'revision-history-ar', 'revision-history-hi',
        'revision-history-wf',
        
        // Exercices Learn par langue
        'learn-exercises-fr', 'learn-exercises-en', 'learn-exercises-es',
        'learn-exercises-de', 'learn-exercises-it', 'learn-exercises-pt',
        'learn-exercises-ru', 'learn-exercises-ja', 'learn-exercises-ko',
        'learn-exercises-zh', 'learn-exercises-ar', 'learn-exercises-hi',
        'learn-exercises-wf',
        
        // Autres données utilisateur
        'streak', 'lastAnswerCorrect', 'currentLanguage',
        
        // Données temporaires et états
        'lastActiveTab', 'showLanguageSelection', 'isFirstConnection',
        
        // Données de progression temporaires
        'sessionLearnedWords', 'sessionProgress', 'currentSession'
      ];
      
      // ⭐ MÉTHODE ALTERNATIVE : Nettoyage par pattern pour être sûr
      // Récupérer toutes les clés du localStorage
      const allKeys = Object.keys(localStorage);
      
      // Patterns à supprimer
      const patternsToRemove = [
        /^[a-z]{2}-progress$/,           // fr-progress, en-progress, etc.
        /^[a-z]{2}-completedCategories$/, // fr-completedCategories, etc.
        /^[a-z]{2}-totalXP$/,           // fr-totalXP, en-totalXP, etc.
        /^grammar-progress-[a-z]{2}$/,   // grammar-progress-fr, etc.
        /^sentence-construction-progress-[a-z]{2}$/, // sentence-construction-progress-fr, etc.
        /^revision-history-[a-z]{2}$/,   // revision-history-fr, etc.
        /^learn-exercises-[a-z]{2}$/,    // learn-exercises-fr, etc.
        /^google/i,                      // googleToken, etc.
        /^secure/i,                      // secureToken, etc.
        /^user_/i                        // user_subscription, etc.
      ];
      
      // Ajouter les clés trouvées par pattern
      allKeys.forEach(key => {
        const shouldRemove = patternsToRemove.some(pattern => pattern.test(key));
        if (shouldRemove && !keysToRemove.includes(key)) {
          keysToRemove.push(key);
        }
      });
      
      let removedCount = 0;
      keysToRemove.forEach(key => {
        try {
          if (localStorage.getItem(key) !== null) {
            localStorage.removeItem(key);
            removedCount++;
            console.log(`[GoogleAuth] ✅ Supprimé: ${key}`);
          }
        } catch (error) {
          console.warn(`[GoogleAuth] ⚠️ Erreur suppression ${key}:`, error);
        }
      });
      
      console.log(`[GoogleAuth] 📊 ${removedCount} clés supprimées du localStorage`);

      // 5. Nettoyer l'état local
      setIsLoggedIn(false);
      setUser(null);
      setError(null);

      // 6. Protection : Appel sécurisé de onLogout
      try {
        safeOnLogout();
      } catch (callbackError) {
        console.error('Erreur callback onLogout:', callbackError);
      }

      // 7. Rediriger si nécessaire
      if (onForceLoginPage) {
        try {
          onForceLoginPage();
        } catch (redirectError) {
          console.error('Erreur redirection:', redirectError);
        }
      }

      console.log('[GoogleAuth] ✅ Déconnexion et nettoyage terminés avec succès');

    } catch (error) {
      console.error('[GoogleAuth] ❌ Erreur lors de la déconnexion:', error);
      // Même en cas d'erreur, nettoyer l'état local
      setIsLoggedIn(false);
      setUser(null);
      setError(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Gestion d'erreur pour l'affichage
  const clearError = () => {
    setError(null);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className={isHeader ? "header-auth-loading" : "google-login-button"} style={{ cursor: 'default' }}>
        {isProcessing ? 'Connexion...' : 'Chargement...'}
      </div>
    );
  }

  // Rendu pour l'en-tête
  if (isHeader) {
    return (
      <div className="header-auth-container">
        {error && (
          <div 
            className="auth-error" 
            style={{ 
              color: 'red', 
              fontSize: '12px', 
              marginBottom: '5px',
              cursor: 'pointer'
            }}
            onClick={clearError}
            title="Cliquer pour masquer l'erreur"
          >
            ⚠️ {error}
          </div>
        )}
        
        {isLoggedIn ? (
          <div className="header-user-info">
            <button 
              onClick={handleSecureLogout}
              disabled={isProcessing}
              className="header-logout-button"
              type="button"
              aria-label="Se déconnecter"
              title={`Déconnecter ${user?.name || user?.email}`}
              style={{
                opacity: isProcessing ? 0.6 : 1,
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? '...' : 'Déconnexion'}
            </button>
          </div>
        ) : (
          <button
            onClick={handleSecureLogin}
            disabled={isProcessing || !gapiInitialized}
            className="header-login-button"
            type="button"
            aria-label="Se connecter avec Google"
            style={{
              opacity: (isProcessing || !gapiInitialized) ? 0.6 : 1,
              cursor: (isProcessing || !gapiInitialized) ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? '...' : gapiInitialized ? 'Connexion' : 'Init...'}
          </button>
        )}
      </div>
    );
  }

  // Rendu principal (page de connexion complète)
  return (
    <div className="login-container">
      {error && (
        <div className="auth-error" style={{ 
          background: '#fee', 
          color: '#c33', 
          padding: '10px', 
          marginBottom: '15px', 
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          ⚠️ {error}
          <button 
            onClick={clearError}
            style={{ 
              float: 'right', 
              background: 'transparent', 
              border: 'none', 
              color: '#c33',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {isLoggedIn && user ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '20px' }}>
            {user.picture && (
              <img 
                src={user.picture} 
                alt="Profile" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  marginBottom: '10px' 
                }} 
              />
            )}
            <div>
              <strong>{user.name}</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
            </div>
          </div>
          
          <button
            onClick={handleSecureLogout}
            disabled={isProcessing}
            className="google-login-button"
            style={{
              backgroundColor: '#dc3545',
              opacity: isProcessing ? 0.6 : 1,
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? 'Déconnexion...' : 'Se déconnecter'}
          </button>
        </div>
      ) : (
        <button
          onClick={handleSecureLogin}
          disabled={isProcessing || !gapiInitialized}
          className="google-login-button"
          style={{
            opacity: (isProcessing || !gapiInitialized) ? 0.6 : 1,
            cursor: (isProcessing || !gapiInitialized) ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Connexion...' : gapiInitialized ? 'Se connecter avec Google' : 'Initialisation...'}
        </button>
      )}
    </div>
  );
};

export default GoogleAuth;
