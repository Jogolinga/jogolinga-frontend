// hooks/useSupabaseAudio.ts - Version simplifiée avec gestion propre des null
import { useState, useCallback } from 'react'
import SupabaseAudioService from '../services/supabaseAudioService'

export const useSupabaseAudio = (languageCode: string = 'wf') => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  const playWord = useCallback(async (word: string): Promise<boolean> => {
    // Arrêter l'audio en cours
    if (isPlaying && currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
      setCurrentAudio(null)
    }

    setLoading(true)
    setLastError(null)
    
    try {
      // 🧹 Nettoyage minimal du mot (garder l'intégralité)
      let cleanWord = word
      
      // Supprimer seulement les anciens préfixes de chemin obsolètes
      if (cleanWord.startsWith('/audio/')) {
        cleanWord = cleanWord.replace('/audio/', '')
      }
      
      // Supprimer SEULEMENT les préfixes de langue en début (Wf-, Bm-, Li-)
      if (cleanWord.match(/^(Wf-|Bm-|Li-)/)) {
        cleanWord = cleanWord.substring(3)
      }
      
      console.log(`🎵 Tentative de lecture: "${cleanWord}" en ${languageCode}`)
      console.log(`📝 Mot original: "${word}" → Mot nettoyé: "${cleanWord}"`)

      // 🔍 Recherche EXACTE uniquement
      const audioUrl = await SupabaseAudioService.getWordAudioUrl(languageCode, cleanWord)
      
      if (!audioUrl) {
        // 🚫 PAS D'AUDIO TROUVÉ - Gestion propre
        console.warn(`❌ Aucun audio trouvé pour: "${cleanWord}" (${languageCode})`)
        setLastError(`Audio non disponible pour "${cleanWord}"`)
        setLoading(false)
        
        // Optionnel : diagnostic en mode développement
        if (process.env.NODE_ENV === 'development') {
          await SupabaseAudioService.diagnosticSearch(languageCode, cleanWord)
        }
        
        return false
      }

      // 🎵 AUDIO TROUVÉ - Lecture
      console.log(`✅ Audio trouvé, création lecteur...`)
      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      setIsPlaying(true)

      // 🎧 Gestionnaires d'événements
      audio.onended = () => {
        console.log(`🔚 Lecture terminée: ${cleanWord}`)
        setIsPlaying(false)
        setCurrentAudio(null)
        setLoading(false)
      }

      audio.onerror = (e) => {
        console.error(`❌ Erreur lecture audio: ${cleanWord}`, e)
        setLastError(`Erreur de lecture pour "${cleanWord}"`)
        setIsPlaying(false)
        setCurrentAudio(null)
        setLoading(false)
      }

      audio.onloadeddata = () => {
        console.log(`📥 Audio chargé: ${cleanWord}`)
        setLoading(false)
      }

      audio.oncanplay = () => {
        console.log(`▶️ Audio prêt: ${cleanWord}`)
        setLoading(false)
      }

      // 🚀 Démarrage de la lecture
      try {
        await audio.play()
        console.log(`🎵 Lecture démarrée: ${cleanWord}`)
        return true
      } catch (playError) {
        console.error(`❌ Erreur démarrage lecture: ${cleanWord}`, playError)
        setLastError(`Impossible de lire "${cleanWord}"`)
        setIsPlaying(false)
        setCurrentAudio(null)
        setLoading(false)
        return false
      }

    } catch (error) {
      console.error(`💥 Erreur générale: ${word}`, error)
      setLastError(`Erreur technique pour "${word}"`)
      setIsPlaying(false)
      setCurrentAudio(null)
      setLoading(false)
      return false
    }
  }, [isPlaying, currentAudio, languageCode])

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setIsPlaying(false)
      setCurrentAudio(null)
    }
    setLoading(false)
    setLastError(null)
  }, [currentAudio])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  // 🧪 Fonction de diagnostic (utile pour le développement)
  const diagnoseWord = useCallback(async (word: string) => {
    if (process.env.NODE_ENV === 'development') {
      const cleanWord = word.replace(/^(Wf-|Bm-|Li-)/, '').replace(/\.(mp3|wav|ogg)$/i, '')
      await SupabaseAudioService.diagnosticSearch(languageCode, cleanWord)
    }
  }, [languageCode])

  return { 
    playWord, 
    stopAudio,
    clearError,
    diagnoseWord,
    isPlaying, 
    loading,
    lastError
  }
}

// Hook utilitaire pour les composants qui ont besoin d'info sur l'état audio
export const useAudioState = () => {
  const [globalAudioState, setGlobalAudioState] = useState({
    currentlyPlaying: null as string | null,
    isAnyPlaying: false
  })

  return {
    ...globalAudioState,
    setCurrentlyPlaying: (word: string | null) => {
      setGlobalAudioState({
        currentlyPlaying: word,
        isAnyPlaying: !!word
      })
    }
  }
}
