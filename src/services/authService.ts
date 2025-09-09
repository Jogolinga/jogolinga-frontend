// Améliorations pour authService.ts

// Remplacer complètement le contenu du fichier authService.ts
// Dans authService.ts
export const verifyGoogleToken = async (): Promise<boolean> => {
  try {
    // Vérifier si gapi est disponible
    if (typeof gapi === 'undefined' || !gapi.auth2) {
      console.error("La bibliothèque Google API n'est pas disponible");
      return false;
    }

    // Vérifier si l'utilisateur est connecté
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      return false;
    }
    
    // Vérifier si le token est valide
    const authInstance = gapi.auth2.getAuthInstance();
    const currentUser = authInstance.currentUser.get();
    const authResponse = currentUser.getAuthResponse();
    
    // Vérifier si un rafraîchissement est nécessaire
    const expiresAt = authResponse.expires_at;
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (expiresAt - now < fiveMinutes) {
      console.log("Token proche de l'expiration, rafraîchissement...");
      try {
        await currentUser.reloadAuthResponse();
        const newAuthResponse = currentUser.getAuthResponse();
        localStorage.setItem('googleToken', newAuthResponse.access_token);
        localStorage.setItem('tokenExpires', String(newAuthResponse.expires_at));
        console.log("Token rafraîchi avec succès");
      } catch (refreshError) {
        console.error("Erreur lors du rafraîchissement du token:", refreshError);
        // Continuer même en cas d'échec du rafraîchissement
      }
    }
    
    // Vérifier également les scopes nécessaires
    if (!authResponse.scope.includes('https://www.googleapis.com/auth/drive.file')) {
      console.warn("Attention: Les permissions nécessaires pour Google Drive ne sont pas présentes");
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification du token:", error);
    return false;
  }
};

// Fonction pour rafraîchir le token si gapi est disponible
export const refreshGoogleToken = async (): Promise<boolean> => {
  try {
    // Si gapi n'est pas disponible dans la fenêtre
    if (typeof gapi === 'undefined' || !gapi.auth2) {
      console.error("La bibliothèque Google API n'est pas disponible");
      return false;
    }
  
    // Vérifier si l'utilisateur est connecté
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      console.log("Aucun utilisateur connecté, impossible de rafraîchir le token");
      return false;
    }
    
    // Récupérer l'utilisateur actuel
    const authInstance = gapi.auth2.getAuthInstance();
    const currentUser = authInstance.currentUser.get();
    
    // Forcer un rafraîchissement du token
    console.log("Tentative de rafraîchissement du token...");
    const newAuthResponse = await currentUser.reloadAuthResponse();
    
    // Mettre à jour le token dans localStorage
    localStorage.setItem('googleToken', newAuthResponse.access_token);
    localStorage.setItem('tokenExpires', String(newAuthResponse.expires_at));
    
    console.log("Token rafraîchi avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return false;
  }
};

// Fonction pour vérifier les scopes autorisés
export const checkRequiredScopes = (): boolean => {
  const requiredScopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ];
  
  // Récupérer les scopes stockés
  const scopes = localStorage.getItem('googleScopes');
  
  if (!scopes) {
    console.error("Aucun scope trouvé");
    return false;
  }
  
  // Vérifier que tous les scopes requis sont présents
  const hasAllRequiredScopes = requiredScopes.every(requiredScope => 
    scopes.includes(requiredScope)
  );
  
  if (!hasAllRequiredScopes) {
    console.error("Scopes manquants. Scopes actuels:", scopes);
    console.error("Scopes requis:", requiredScopes.join(', '));
  }
  
  return hasAllRequiredScopes;
};

// Fonction pour récupérer les informations utilisateur à partir du token
export const getUserInfoFromToken = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('googleToken');
    
    if (!token) {
      console.log("Aucun token Google trouvé");
      return null;
    }
    
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`Erreur lors de la récupération des infos utilisateur: ${response.status}`);
      return null;
    }
    
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Erreur lors de la récupération des infos utilisateur:", error);
    return null;
  }
};