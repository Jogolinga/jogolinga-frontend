// ===================================================================
// GoogleAuth.tsx - VERSION PRODUCTION AVEC INTÉGRATION PAYMENTSERVICE
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

  // Nettoyage complet
  const handleFullReset = async () => {
    try {
      // Nettoyer Google
      if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
        await gapi.auth2.getAuthInstance().signOut();
      }
      
      // Nettoyer notre backend
      secureAuthService.logout();
      
      // Nettoyer localStorage complètement
      const keysToRemove = [
        'googleToken', 'tokenExpires', 'googleScopes',
        'secureToken', 'secureUser', 'user_subscription'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Réinitialiser les états
      setIsLoggedIn(false);
      setUser(null);
      setError(null);
      
    } catch (error) {
      console.error('Erreur nettoyage:', error);
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
    // Protection : Éviter les multiples initialisations
    if (gapiInitialized) {
      setIsLoading(false);
      return;
    }

    const start = () => {
      gapi.client.init({
        clientId: clientId,
        scope: scopes
      }).then(() => {
        setGapiInitialized(true);
        
        // Vérifier si l'utilisateur est connecté côté Google
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance.isSignedIn.get()) {
          // Session Google existante détectée
        }
        
        // Écouter les changements d'état Google
        authInstance.isSignedIn.listen(handleGoogleAuthChange);
        setIsLoading(false);
      }).catch((error: Error) => {
        console.error('Erreur initialisation Google API:', error);
        setError('Erreur d\'initialisation de l\'authentification Google');
        setIsLoading(false);
        setGapiInitialized(false);
      });
    };

    // Protection : Vérifier si gapi est disponible
    if (typeof gapi !== 'undefined' && gapi.load) {
      gapi.load('client:auth2', start);
    } else {
      console.error('GAPI non disponible');
      setError('Google API non disponible');
      setIsLoading(false);
    }
  };

  // Gérer les changements d'état Google
  const handleGoogleAuthChange = (isSignedIn: boolean) => {
    if (!isSignedIn && isLoggedIn) {
      handleSecureLogout();
    }
  };

  // Connexion sécurisée
  const handleSecureLogin = async () => {
    if (isProcessing) {
      return;
    }

    if (!gapiInitialized) {
      setError('Service d\'authentification non initialisé');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Connecter à Google d'abord
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance) {
        throw new Error('Instance d\'authentification Google non disponible');
      }

      const googleUser = await authInstance.signIn();
      
      // 2. Récupérer le token ID de Google
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

      // 4. Test de l'API backend avant authentification (commenté temporairement)
      /*
      try {
        console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        console.log('Using API URL:', apiUrl);
        const healthResponse = await fetch(`${apiUrl}/api/health`);
        if (!healthResponse.ok) {
          throw new Error(`Backend inaccessible: ${healthResponse.status}`);
        }
      } catch (backendError) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'localhost:3001';
        setError(`Le serveur backend n'est pas accessible (${apiUrl}). Vérifiez qu'il est démarré.`);
        return;
      }
      */

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

  // Déconnexion sécurisée
  const handleSecureLogout = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // 1. Déconnecter du backend sécurisé
      secureAuthService.logout();

      // NOUVEAU: Nettoyer le token du PaymentService
      console.log('[GoogleAuth] Nettoyage du token PaymentService lors de la déconnexion');
      // Note: PaymentService n'a pas de méthode clearToken, mais setAuthToken(null) peut être ajouté si nécessaire
      try {
        paymentService.setAuthToken(''); // ou null selon l'implémentation de paymentService
      } catch (paymentError) {
        console.warn('[GoogleAuth] Erreur lors du nettoyage du token PaymentService:', paymentError);
      }

      // 2. Déconnecter de Google
      try {
        if (gapi.auth2 && gapi.auth2.getAuthInstance()) {
          await gapi.auth2.getAuthInstance().signOut();
        }
      } catch (googleError) {
        console.warn('Erreur déconnexion Google (non critique):', googleError);
      }

      // 3. Nettoyer l'état local
      setIsLoggedIn(false);
      setUser(null);
      setError(null);

      // 4. Nettoyer le stockage local
      localStorage.removeItem('googleToken');
      localStorage.removeItem('tokenExpires');
      localStorage.removeItem('googleScopes');

      // Protection : Appel sécurisé de onLogout
      try {
        safeOnLogout();
      } catch (callbackError) {
        console.error('Erreur callback onLogout:', callbackError);
      }

      // 5. Rediriger si nécessaire
      if (onForceLoginPage) {
        try {
          onForceLoginPage();
        } catch (redirectError) {
          console.error('Erreur redirection:', redirectError);
        }
      }

    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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
        <div className="authenticated-user">
          <div className="user-info" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '15px',
            padding: '15px',
            background: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            {user.picture && (
              <img 
                src={user.picture} 
                alt={user.name}
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  marginRight: '12px' 
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{user.name}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>{user.email}</div>
              <div style={{ color: '#28a745', fontSize: '12px', marginTop: '2px' }}>
                ✅ Connecté de manière sécurisée
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSecureLogout}
            disabled={isProcessing}
            className="google-login-button"
            type="button"
            aria-label="Se déconnecter"
            style={{ 
              backgroundColor: isProcessing ? '#ccc' : '#dc3545',
              cursor: isProcessing ? 'not-allowed' : 'pointer'
            }}
          >
            {isProcessing ? '⏳ Déconnexion...' : '🚪 Se déconnecter'}
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '300px' }}>
          <button 
            onClick={handleSecureLogin}
            disabled={isProcessing || !gapiInitialized}
            className="google-login-button"
            type="button"
            aria-label="Se connecter avec Google"
            style={{
              backgroundColor: (isProcessing || !gapiInitialized) ? '#ccc' : '#4285f4',
              cursor: (isProcessing || !gapiInitialized) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '10px'
            }}
          >
            {isProcessing ? (
              '⏳ Connexion en cours...'
            ) : !gapiInitialized ? (
              '⏳ Initialisation...'
            ) : (
              <>
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google logo" 
                  className="google-icon"
                />
                <span>Se connecter avec Google</span>
              </>
            )}
          </button>
          
          <div style={{ 
            marginTop: '10px', 
            fontSize: '12px', 
            color: '#666', 
            textAlign: 'center' 
          }}>
            🔒 Connexion sécurisée via notre backend
            {!gapiInitialized && (
              <div style={{ color: '#f80', marginTop: '5px' }}>
                ⏳ Initialisation en cours...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleAuth;
