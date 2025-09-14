// ===================================================================
// services/secureAuthService.ts - VERSION CORRIGÉE POUR PRODUCTION
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
  // CORRECTION: Configuration d'URL plus robuste
  private apiUrl: string;
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Configuration de l'URL API avec fallbacks
    this.apiUrl = this.getApiUrl();
    
    console.log('🔐 SecureAuthService initialisé avec API:', this.apiUrl);
    
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

  // NOUVEAU: Méthode pour déterminer l'URL API
  private getApiUrl(): string {
    // En production (Vercel)
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      return 'https://jogolinga-backend-production.up.railway.app';
    }
    
    // Variables d'environnement
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    if (process.env.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    
    // Fallback pour développement
    return 'http://localhost:3001';
  }

  // ===================================================================
  // AUTHENTIFICATION GOOGLE SÉCURISÉE - VERSION CORRIGÉE
  // ===================================================================

  async authenticateWithGoogle(googleToken: string): Promise<UserWithToken> {
    try {
      console.log('🔐 Authentification avec Google via backend...');
      console.log('🔗 URL API utilisée:', this.apiUrl);
      
      // NOUVEAU: Test de connectivité avant authentification
      await this.testBackendConnectivity();
      
      const response = await fetch(`${this.apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ googleToken }),
        // NOUVEAU: Configuration pour CORS
        mode: 'cors',
        credentials: 'include'
      });

      console.log('📡 Réponse backend status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur backend:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || 'Erreur backend';
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
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

      // Retourner l'utilisateur avec le token inclus
      const userWithToken: UserWithToken = {
        ...data.user,
        jwtToken: data.token,
        token: data.token
      };

      return userWithToken;
    } catch (error) {
      console.error('❌ Erreur authentification:', error);
      this.logout();
      throw new Error(error instanceof Error ? error.message : 'Authentification échouée');
    }
  }

  // NOUVEAU: Test de connectivité backend
  private async testBackendConnectivity(): Promise<void> {
    try {
      console.log('🔍 Test de connectivité backend...');
      
      const healthEndpoints = [
        `${this.apiUrl}/health`,
        `${this.apiUrl}/api/health`,
        `${this.apiUrl}/`
      ];

      for (const endpoint of healthEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'GET',
            mode: 'cors',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            console.log('✅ Backend accessible via:', endpoint);
            return;
          }
        } catch (error) {
          console.log(`❌ Endpoint ${endpoint} non accessible:`, error);
        }
      }
      
      throw new Error('Backend inaccessible sur tous les endpoints testés');
    } catch (error) {
      console.error('❌ Test connectivité échoué:', error);
      throw new Error(`Backend non accessible (${this.apiUrl}). Vérifiez que le serveur est démarré.`);
    }
  }

  // ===================================================================
  // MÉTHODES EXISTANTES AVEC CORRECTIONS
  // ===================================================================

  async verifyStoredToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await fetch(`${this.apiUrl}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/json'
        },
        mode: 'cors'
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

      console.log('❌ Token invalide, nettoyage...');
      this.logout();
      return false;
    } catch (error) {
      console.error('❌ Erreur vérification token:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    console.log('🚪 Déconnexion...');
    
    this.token = null;
    this.user = null;
    localStorage.removeItem('secureToken');
    localStorage.removeItem('secureUser');
    
    // Nettoyer aussi l'ancien système si présent
    localStorage.removeItem('googleToken');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user_subscription');

    window.dispatchEvent(new CustomEvent('authStatusChanged', { 
      detail: { isAuthenticated: false, user: null }
    }));

    console.log('✅ Déconnexion terminée');
  }

  // ===================================================================
  // MÉTHODES DE REQUÊTE SÉCURISÉES
  // ===================================================================

  async authenticatedFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.apiUrl}${endpoint}`;
    
    const authHeaders = this.getAuthHeaders();
    const headers = {
      ...authHeaders,
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      credentials: 'include'
    });

    if (response.status === 401) {
      console.log('🔓 Session expirée, déconnexion automatique');
      this.logout();
    }

    return response;
  }

  // ===================================================================
  // GETTERS ET MÉTHODES UTILITAIRES
  // ===================================================================

  getToken(): string | null {
    return this.token;
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  getApiUrl(): string {
    return this.apiUrl;
  }

  getDebugInfo(): any {
    return {
      hasToken: !!this.token,
      hasUser: !!this.user,
      userEmail: this.user?.email,
      tokenPreview: this.token ? `${this.token.substring(0, 20)}...` : null,
      apiUrl: this.apiUrl,
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // ===================================================================
  // MÉTHODES POUR ABONNEMENTS ET PAIEMENTS (simplifiées)
  // ===================================================================

  async verifySubscription(): Promise<SubscriptionStatus> {
    if (!this.token) {
      return { isPremium: false, tier: 'free', status: 'unauthenticated' };
    }

    try {
      const response = await this.authenticatedFetch('/subscription/verify');

      if (!response.ok) {
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

  async saveUserProgress(languageCode: string, progressData: any, totalXP: number = 0, completedCategories: string[] = []): Promise<boolean> {
    if (!this.token) {
      console.warn('⚠️ Sauvegarde impossible sans authentification');
      return false;
    }

    try {
      const response = await this.authenticatedFetch('/api/progress/save', {
        method: 'POST',
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
}

// Export singleton
const secureAuthService = new SecureAuthService();
export default secureAuthService;
