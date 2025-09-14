// ===================================================================
// services/secureAuthService.ts - AUTHENTIFICATION FRONTEND SÉCURISÉE
// ===================================================================

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Interface pour l'utilisateur avec token (utilisée dans GoogleAuth)
interface UserWithToken extends User {
  jwtToken?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
}

interface SubscriptionStatus {
  isPremium: boolean;
  tier: 'free' | 'premium';
  status: string;
  expiresAt?: string;
  billingPeriod?: string;
  planId?: string;
}

interface AccessCheck {
  hasAccess: boolean;
  isPremium: boolean;
  tier: string;
  feature: string;
  reason?: string;
}

class SecureAuthService {
  private apiUrl = 'https://jogolinga-backend-production.up.railway.app' ;
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    console.log('🔐 SecureAuthService initialisé');
    
    // Récupérer le token stocké
    this.token = localStorage.getItem('secureToken');
    const storedUser = localStorage.getItem('secureUser');
    
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
        console.log('✅ Utilisateur récupéré depuis localStorage:', this.user?.email);
      } catch (error) {
        console.error('❌ Erreur parsing utilisateur stocké:', error);
        localStorage.removeItem('secureUser');
      }
    }

    // Vérifier si le token est encore valide au démarrage
    if (this.token) {
      this.verifyStoredToken();
    }
  }

  // ===================================================================
  // AUTHENTIFICATION GOOGLE SÉCURISÉE
  // ===================================================================

  /**
   * Authentifier avec Google via le backend sécurisé
   * @param googleToken - Token ID de Google
   */
  async authenticateWithGoogle(googleToken: string): Promise<UserWithToken> {
    try {
      console.log('🔐 Authentification avec Google via backend...');
      
      const response = await fetch(`${this.apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ googleToken })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data: AuthResponse = await response.json();

      if (!data.success || !data.token) {
        throw new Error('Réponse d\'authentification invalide');
      }

      // Stocker le token JWT et les infos utilisateur
      this.token = data.token;
      this.user = data.user;

      localStorage.setItem('secureToken', data.token);
      localStorage.setItem('secureUser', JSON.stringify(data.user));

      console.log('✅ Authentification réussie:', data.user.email);

      // Déclencher un événement pour notifier les composants
      window.dispatchEvent(new CustomEvent('authStatusChanged', { 
        detail: { isAuthenticated: true, user: data.user }
      }));

      // MODIFICATION: Retourner l'utilisateur avec le token inclus
      const userWithToken: UserWithToken = {
        ...data.user,
        jwtToken: data.token,  // Ajouter le token pour GoogleAuth
        token: data.token      // Alternative pour compatibilité
      };

      return userWithToken;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      
      // Nettoyer en cas d'erreur
      this.logout();
      
      throw new Error(error instanceof Error ? error.message : 'Authentification échouée');
    }
  }

  // ===================================================================
  // GESTION DES TOKENS ET SESSIONS
  // ===================================================================

  /**
   * Vérifier si le token stocké est encore valide
   */
  async verifyStoredToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${this.apiUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid && data.user) {
          this.user = data.user;
          localStorage.setItem('secureUser', JSON.stringify(data.user));
          console.log('✅ Token valide, utilisateur confirmé');
          return true;
        }
      }

      // Token invalide, nettoyer
      console.log('❌ Token invalide, nettoyage...');
      this.logout();
      return false;
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      this.logout();
      return false;
    }
  }

  /**
   * Déconnexion complète
   */
  logout(): void {
    console.log('🚪 Déconnexion...');
    
    // Nettoyer le stockage local
    this.token = null;
    this.user = null;
    localStorage.removeItem('secureToken');
    localStorage.removeItem('secureUser');
    
    // Nettoyer aussi l'ancien système si présent
    localStorage.removeItem('googleToken');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user_subscription');

    // Déclencher un événement
    window.dispatchEvent(new CustomEvent('authStatusChanged', { 
      detail: { isAuthenticated: false, user: null }
    }));

    console.log('✅ Déconnexion terminée');
  }

  // ===================================================================
  // VÉRIFICATIONS D'ABONNEMENT SÉCURISÉES
  // ===================================================================

  /**
   * Vérifier le statut d'abonnement via le backend
   */
  async verifySubscription(): Promise<SubscriptionStatus> {
    if (!this.token) {
      return { isPremium: false, tier: 'free', status: 'unauthenticated' };
    }

    try {
      const response = await fetch(`${this.apiUrl}/subscription/verify`, {
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expiré, déconnecter
          this.logout();
          throw new Error('Session expirée, reconnectez-vous');
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const subscription = await response.json();
      console.log('✅ Statut abonnement vérifié:', subscription.tier);

      return subscription;
    } catch (error) {
      console.error('❌ Erreur vérification abonnement:', error);
      return { isPremium: false, tier: 'free', status: 'error' };
    }
  }

  /**
   * Vérifier l'accès à une fonctionnalité spécifique
   */
  async checkAccess(feature: string): Promise<AccessCheck> {
    if (!this.token) {
      return {
        hasAccess: false,
        isPremium: false,
        tier: 'free',
        feature,
        reason: 'Authentification requise'
      };
    }

    try {
      const response = await fetch(`${this.apiUrl}/subscription/check-access`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature })
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur ${response.status}`);
      }

      const access = await response.json();
      console.log(`🔑 Accès ${feature}:`, access.hasAccess ? '✅' : '❌');

      return access;
    } catch (error) {
      console.error('❌ Erreur vérification accès:', error);
      return {
        hasAccess: false,
        isPremium: false,
        tier: 'free',
        feature,
        reason: 'Erreur de vérification'
      };
    }
  }

  // ===================================================================
  // GESTION DES PAIEMENTS
  // ===================================================================

  /**
   * Créer une session de paiement Stripe
   */
  async createCheckoutSession(planId: string, priceId: string): Promise<string> {
    if (!this.token) {
      throw new Error('Authentification requise pour effectuer un paiement');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ planId, priceId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erreur création session de paiement');
      }

      const data = await response.json();
      console.log('✅ Session de paiement créée');

      return data.sessionId;
    } catch (error) {
      console.error('❌ Erreur création session paiement:', error);
      throw error;
    }
  }

  /**
   * Vérifier un paiement après succès
   */
  async verifyPayment(sessionId: string): Promise<any> {
    if (!this.token) {
      throw new Error('Authentification requise');
    }

    try {
      const response = await fetch(`${this.apiUrl}/payments/verify-payment?sessionId=${sessionId}`, {
        headers: { 
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur vérification paiement');
      }

      const result = await response.json();
      console.log('✅ Paiement vérifié:', result.status);

      // Si paiement réussi, déclencher un événement
      if (result.status === 'completed') {
        window.dispatchEvent(new CustomEvent('subscriptionUpdated', { 
          detail: { tier: 'premium' }
        }));
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur vérification paiement:', error);
      throw error;
    }
  }

  // ===================================================================
  // GESTION DE LA PROGRESSION UTILISATEUR
  // ===================================================================

  /**
   * Sauvegarder la progression utilisateur
   */
  async saveUserProgress(languageCode: string, progressData: any, totalXP: number = 0, completedCategories: string[] = []): Promise<boolean> {
    if (!this.token) {
      console.warn('⚠️ Sauvegarde impossible sans authentification');
      return false;
    }

    try {
      const response = await fetch(`${this.apiUrl}/progress/save`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          languageCode,
          progressData,
          totalXP,
          completedCategories
        })
      });

      if (!response.ok) {
        throw new Error('Erreur sauvegarde progression');
      }

      const result = await response.json();
      console.log('✅ Progression sauvegardée');

      return result.success;
    } catch (error) {
      console.error('❌ Erreur sauvegarde progression:', error);
      return false;
    }
  }

  /**
   * Charger la progression utilisateur
   */
  async loadUserProgress(languageCode: string): Promise<any> {
    if (!this.token) {
      console.warn('⚠️ Chargement impossible sans authentification');
      return null;
    }

    try {
      const response = await fetch(`${this.apiUrl}/progress/${languageCode}`, {
        headers: { 
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📝 Aucune progression trouvée pour', languageCode);
          return null;
        }
        throw new Error('Erreur chargement progression');
      }

      const progress = await response.json();
      console.log('✅ Progression chargée pour', languageCode);

      return progress;
    } catch (error) {
      console.error('❌ Erreur chargement progression:', error);
      return null;
    }
  }

  // ===================================================================
  // GETTERS ET ÉTAT
  // ===================================================================

  /**
   * Obtenir le token JWT actuel
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  /**
   * Obtenir les headers d'authentification pour les requêtes API
   */
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  /**
   * Effectuer une requête API authentifiée
   */
  async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiUrl}${endpoint}`;
    
    const authHeaders = this.getAuthHeaders();
    const headers = {
      ...authHeaders,
      ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Si non autorisé, déconnecter automatiquement
    if (response.status === 401) {
      console.log('🔓 Session expirée, déconnexion automatique');
      this.logout();
    }

    return response;
  }

  /**
   * Déclencher une vérification d'authentification périodique
   */
  startPeriodicCheck(intervalMinutes: number = 30): void {
    setInterval(() => {
      if (this.token) {
        this.verifyStoredToken();
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Obtenir des informations de debug
   */
  getDebugInfo(): any {
    return {
      hasToken: !!this.token,
      hasUser: !!this.user,
      userEmail: this.user?.email,
      tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : null,
      apiUrl: this.apiUrl
    };
  }
}

// Export singleton
const secureAuthService = new SecureAuthService();
export default secureAuthService;
