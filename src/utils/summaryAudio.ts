// utils/summaryAudio.ts
import { useCallback, useState, useEffect } from 'react';
import { useAudio } from '../hooks/hooks'; // Utilise votre hook existant

// Configuration des sons de résumé
const SUMMARY_AUDIO_CONFIG = {
  // Son unique pour toutes les célébrations
  celebration: {
    url: '/ambiance/bell-notification.mp3',
    volume: 0.6,
    description: 'Célébration de fin de session'
  },
  
  // Sons alternatifs (optionnels pour le futur)
  success: {
    url: '/audio/success.mp3',
    volume: 0.7,
    description: 'Son de succès'
  },
  
  levelUp: {
    url: '/audio/level-up.mp3',
    volume: 0.8,
    description: 'Montée de niveau'
  }
} as const;

type AudioType = keyof typeof SUMMARY_AUDIO_CONFIG;

/**
 * Fonction simple pour jouer le son de célébration
 */
export const playSummaryAudio = async (audioType: AudioType = 'celebration'): Promise<void> => {
  try {
    // Vérifier si l'utilisateur a activé les sons
    const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
    if (!audioEnabled) {
      console.log('🔇 Audio désactivé par l\'utilisateur');
      return;
    }
    
    const config = SUMMARY_AUDIO_CONFIG[audioType];
    if (!config) {
      console.warn(`⚠️ Configuration audio non trouvée pour: ${audioType}`);
      return;
    }
    
    console.log(`🎵 Lecture audio de résumé: ${audioType} (${config.description})`);
    
    // Créer et configurer l'audio
    const audio = new Audio(config.url);
    audio.volume = config.volume;
    
    // Tenter de jouer l'audio
    await audio.play();
    console.log(`✅ Audio joué avec succès: ${audioType}`);
    
    // Nettoyer l'objet audio une fois terminé
    audio.onended = () => {
      audio.remove();
    };
    
  } catch (error) {
    // Gérer silencieusement les erreurs (autoplay bloqué, fichier manquant, etc.)
    console.log(`📵 Audio non joué (${audioType}):`, error instanceof Error ? error.message : 'Erreur inconnue');
  }
};

/**
 * Version alternative utilisant votre hook useAudio existant
 */
export const playSummaryAudioWithHook = (playAudio: (src: string) => Promise<void>) => {
  return async (audioType: AudioType = 'celebration'): Promise<void> => {
    try {
      // Vérifier si l'utilisateur a activé les sons
      const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
      if (!audioEnabled) {
        console.log('🔇 Audio désactivé par l\'utilisateur');
        return;
      }
      
      const config = SUMMARY_AUDIO_CONFIG[audioType];
      if (!config) {
        console.warn(`⚠️ Configuration audio non trouvée pour: ${audioType}`);
        return;
      }
      
      console.log(`🎵 Lecture audio de résumé: ${audioType} (${config.description})`);
      
      // Utiliser votre hook existant
      await playAudio(config.url);
      console.log(`✅ Audio joué avec succès: ${audioType}`);
      
    } catch (error) {
      console.log(`📵 Audio non joué (${audioType}):`, error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };
};

/**
 * Hook React pour gérer les sons de résumé
 * Utilise votre hook useAudio existant
 */
export const useSummaryAudio = () => {
  const playAudio = useAudio(); // Votre hook existant
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('audioEnabled') !== 'false';
  });
  
  // Fonction principale pour jouer les sons de résumé
  const playSummarySound = useCallback(async (audioType: AudioType = 'celebration') => {
    if (!isEnabled) {
      console.log('🔇 Audio désactivé par l\'utilisateur');
      return;
    }
    
    const config = SUMMARY_AUDIO_CONFIG[audioType];
    if (!config) {
      console.warn(`⚠️ Configuration audio non trouvée pour: ${audioType}`);
      return;
    }
    
    try {
      console.log(`🎵 Lecture audio de résumé: ${audioType} (${config.description})`);
      
      // Utiliser votre hook useAudio existant
      await playAudio(config.url);
      console.log(`✅ Audio joué avec succès: ${audioType}`);
      
    } catch (error) {
      console.log(`📵 Audio non joué (${audioType}):`, error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }, [playAudio, isEnabled]);
  
  // Fonction spécifique pour les résumés de session
  const playSessionCelebration = useCallback(async () => {
    await playSummarySound('celebration');
  }, [playSummarySound]);
  
  // Fonction pour les montées de niveau (future extension)
  const playLevelUpSound = useCallback(async () => {
    await playSummarySound('levelUp');
  }, [playSummarySound]);
  
  // Fonction pour activer/désactiver les sons
  const toggleAudio = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    localStorage.setItem('audioEnabled', enabled.toString());
    console.log(`🔊 Audio ${enabled ? 'activé' : 'désactivé'}`);
  }, []);
  
  // Synchroniser l'état avec localStorage au changement
  useEffect(() => {
    const handleStorageChange = () => {
      const newState = localStorage.getItem('audioEnabled') !== 'false';
      setIsEnabled(newState);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  return {
    // Fonction principale (renommée pour éviter les conflits)
    playSummaryAudio: playSessionCelebration,
    
    // Fonctions spécialisées
    playSummarySound,
    playSessionCelebration,
    playLevelUpSound,
    
    // Contrôles
    toggleAudio,
    isEnabled,
    
    // Utilitaires
    audioConfig: SUMMARY_AUDIO_CONFIG
  };
};

/**
 * Hook simplifié pour un usage basique
 */
export const useSimpleSummaryAudio = () => {
  const playAudio = useAudio();
  
  const playSound = useCallback(async () => {
    const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
    if (!audioEnabled) return;
    
    try {
      await playAudio('/ambiance/bell-notification');
      console.log('🎵 Son de célébration joué');
    } catch (error) {
      console.log('📵 Son de célébration non joué:', error);
    }
  }, [playAudio]);
  
  const toggleAudio = useCallback((enabled: boolean) => {
    localStorage.setItem('audioEnabled', enabled.toString());
  }, []);
  
  const isEnabled = localStorage.getItem('audioEnabled') !== 'false';
  
  return { playSound, toggleAudio, isEnabled };
};

/**
 * Fonction utilitaire pour précharger les audios (optionnel)
 */
export const preloadSummaryAudios = async (): Promise<void> => {
  try {
    const audioEnabled = localStorage.getItem('audioEnabled') !== 'false';
    if (!audioEnabled) return;
    
    console.log('🔄 Préchargement des audios de résumé...');
    
    const preloadPromises = Object.entries(SUMMARY_AUDIO_CONFIG).map(async ([key, config]) => {
      try {
        const audio = new Audio(config.url);
        audio.preload = 'auto';
        audio.volume = config.volume;
        
        return new Promise<void>((resolve) => {
          audio.oncanplaythrough = () => {
            console.log(`✅ Audio préchargé: ${key}`);
            resolve();
          };
          audio.onerror = () => {
            console.log(`⚠️ Impossible de précharger: ${key}`);
            resolve(); // Ne pas bloquer le processus
          };
          audio.load();
        });
      } catch (error) {
        console.log(`⚠️ Erreur préchargement ${key}:`, error);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.log('✅ Préchargement des audios terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du préchargement des audios:', error);
  }
};

// Export par défaut du hook principal
export default useSummaryAudio;