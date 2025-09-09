// ===================================================================
// hooks/useSecureAuth.ts - HOOK D'AUTHENTIFICATION SÉCURISÉE
// ===================================================================
import { useState, useEffect, useCallback } from 'react';
import secureAuthService from '../services/secureAuthService';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: string;
  lastLogin?: string;
}

interface SubscriptionStatus {
  isPremium: boolean;
  tier: 'free' | 'premium';
  status: string;
  expiresAt?: string;
  billingPeriod?: string;
  planId?: string;
}

interface UseSecureAuthReturn {
  // État d'authentification
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  
  // État d'abonnement
  subscription: SubscriptionStatus | null;
  isLoadingSubscription: boolean;
  
  // Méthodes d'authentification
  login: (googleToken: string) => Promise<User>;
  logout: () => void;
  
  // Méthodes d'abonnement
  checkAccess: (feature: string) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  
  // Méthodes de progression
  saveProgress: (languageCode: string, progressData: any, totalXP?: number, completedCategories?: string[]) => Promise<boolean>;
  loadProgress: (languageCode: string) => Promise<any>;
  
  // Méthodes de paiement
  createCheckoutSession: (planId: string, priceId: string) => Promise<string>;
  verifyPayment: (sessionId: string) => Promise<any>;
  
  // Utilitaires
  getAuthHeaders: () => Record<string, string>;
  authenticatedFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

export const useSecureAuth = (): UseSecureAuthReturn => {
  // États
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(false);

  // Initialisation
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Vérifier si on a déjà un token valide
        if (secureAuthService.isAuthenticated()) {
          const currentUser = secureAuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
            
            // Charger le statut d'abonnement
            await loadSubscriptionStatus();
          }
        }
      } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Écouter les changements d'état d'authentification
    const handleAuthChange = (event: CustomEvent) => {
      const { isAuthenticated: authStatus, user: authUser } = event.detail;
      setIsAuthenticated(authStatus);
      setUser(authUser);
      
      if (!authStatus) {
        setSubscription(null);
      } else if (authUser) {
        loadSubscriptionStatus();
      }
    };

    // Écouter les changements d'abonnement
    const handleSubscriptionChange = (event: CustomEvent) => {
      console.log('📢 Changement d\'abonnement détecté');
      loadSubscriptionStatus();
    };

    window.addEventListener('authStatusChanged', handleAuthChange as EventListener);
    window.addEventListener('subscriptionUpdated', handleSubscriptionChange as EventListener);

    // Nettoyage
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthChange as EventListener);
      window.removeEventListener('subscriptionUpdated', handleSubscriptionChange as EventListener);
    };
  }, []);

  // Charger le statut d'abonnement
  const loadSubscriptionStatus = async () => {
    if (!isAuthenticated) return;

    setIsLoadingSubscription(true);
    try {
      const subscriptionStatus = await secureAuthService.verifySubscription();
      setSubscription(subscriptionStatus);
    } catch (error) {
      console.error('❌ Erreur chargement abonnement:', error);
      setSubscription({
        isPremium: false,
        tier: 'free',
        status: 'error'
      });
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  // ===================================================================
  // MÉTHODES D'AUTHENTIFICATION
  // ===================================================================

  const login = useCallback(async (googleToken: string): Promise<User> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await secureAuthService.authenticateWithGoogle(googleToken);
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      
      // Charger l'abonnement après connexion
      await loadSubscriptionStatus();
      
      return authenticatedUser;
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      setIsAuthenticated(false);
      setUser(null);
      setSubscription(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    secureAuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setSubscription(null);
  }, []);

  // ===================================================================
  // MÉTHODES D'ABONNEMENT
  // ===================================================================

  const checkAccess = useCallback(async (feature: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const accessResult = await secureAuthService.checkAccess(feature);
      return accessResult.hasAccess;
    } catch (error) {
      console.error('❌ Erreur vérification accès:', error);
      return false;
    }
  }, [isAuthenticated]);

  const refreshSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadSubscriptionStatus();
  }, [isAuthenticated]);

  // ===================================================================
  // MÉTHODES DE PAIEMENT
  // ===================================================================

  const createCheckoutSession = useCallback(async (planId: string, priceId: string): Promise<string> => {
    if (!isAuthenticated) {
      throw new Error('Authentification requise pour effectuer un paiement');
    }

    return await secureAuthService.createCheckoutSession(planId, priceId);
  }, [isAuthenticated]);

  const verifyPayment = useCallback(async (sessionId: string): Promise<any> => {
    if (!isAuthenticated) {
      throw new Error('Authentification requise');
    }

    const result = await secureAuthService.verifyPayment(sessionId);
    
    // Rafraîchir l'abonnement après paiement réussi
    if (result.status === 'completed') {
      await loadSubscriptionStatus();
    }
    
    return result;
  }, [isAuthenticated]);

  // ===================================================================
  // MÉTHODES DE PROGRESSION
  // ===================================================================

  const saveProgress = useCallback(async (
    languageCode: string, 
    progressData: any, 
    totalXP: number = 0, 
    completedCategories: string[] = []
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      console.warn('⚠️ Sauvegarde ignorée - utilisateur non authentifié');
      return false;
    }

    return await secureAuthService.saveUserProgress(
      languageCode, 
      progressData, 
      totalXP, 
      completedCategories
    );
  }, [isAuthenticated]);

  const loadProgress = useCallback(async (languageCode: string): Promise<any> => {
    if (!isAuthenticated) {
      console.warn('⚠️ Chargement ignoré - utilisateur non authentifié');
      return null;
    }

    return await secureAuthService.loadUserProgress(languageCode);
  }, [isAuthenticated]);

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  const getAuthHeaders = useCallback((): Record<string, string> => {
    return secureAuthService.getAuthHeaders();
  }, []);

  const authenticatedFetch = useCallback(async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    if (!isAuthenticated) {
      throw new Error('Authentification requise');
    }

    return await secureAuthService.authenticatedFetch(endpoint, options);
  }, [isAuthenticated]);

  return {
    // État d'authentification
    isAuthenticated,
    user,
    isLoading,
    
    // État d'abonnement
    subscription,
    isLoadingSubscription,
    
    // Méthodes d'authentification
    login,
    logout,
    
    // Méthodes d'abonnement
    checkAccess,
    refreshSubscription,
    
    // Méthodes de progression
    saveProgress,
    loadProgress,
    
    // Méthodes de paiement
    createCheckoutSession,
    verifyPayment,
    
    // Utilitaires
    getAuthHeaders,
    authenticatedFetch
  };
};

// Hook simplifié pour vérifier uniquement l'accès Premium
export const usePremiumAccess = () => {
  const { subscription, isLoadingSubscription, checkAccess } = useSecureAuth();
  
  return {
    isPremium: subscription?.isPremium || false,
    tier: subscription?.tier || 'free',
    isLoading: isLoadingSubscription,
    checkAccess,
    expiresAt: subscription?.expiresAt,
    billingPeriod: subscription?.billingPeriod
  };
};

// Hook pour les fonctionnalités spécifiques
export const useFeatureAccess = (feature: string) => {
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const { checkAccess, isAuthenticated } = useSecureAuth();

  useEffect(() => {
    const checkFeatureAccess = async () => {
      setIsChecking(true);
      try {
        const access = await checkAccess(feature);
        setHasAccess(access);
      } catch (error) {
        console.error(`❌ Erreur vérification accès ${feature}:`, error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isAuthenticated) {
      checkFeatureAccess();
    } else {
      setHasAccess(false);
      setIsChecking(false);
    }
  }, [feature, checkAccess, isAuthenticated]);

  return {
    hasAccess,
    isChecking
  };
};

export default useSecureAuth;