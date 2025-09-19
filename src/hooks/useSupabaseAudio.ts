// hooks/useSupabaseAudio.ts - Version complète avec gestion des erreurs TypeScript
import { useState, useCallback, useRef, useEffect } from 'react'
import SupabaseAudioService from '../services/supabaseAudioService'

// ✅ Fonction utilitaire pour vérifier les AbortError
function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}

export const useSupabaseAudio = (languageCode: string = 'wf') => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  
  // 🔧 REF pour éviter les re-créations multiples
  const currentWordRef = useRef<string | null>(null)
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null)
  const playingPromiseRef = useRef<Promise<void> | null>(null)

  // 🧹 Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (audioInstanceRef.current) {
        try {
          audioInstanceRef.current.pause()
          audioInstanceRef.current.currentTime = 0
        } catch (e) {
          console.warn('Erreur lors du nettoyage audio:', e)
        }
        audioInstanceRef.current = null
      }
      if (playingPromiseRef.current) {
        playingPromiseRef.current = null
      }
      currentWordRef.current = null
    }
  }, [])

  const playWord = useCallback(async (word: string): Promise<boolean> => {
    // 🚫 GUARD: Éviter de jouer le même mot plusieurs fois
    if (currentWordRef.current === word && isPlaying) {
      console.log(`⚠️ Mot "${word}" déjà en cours de lecture - ignoré`)
      return true
    }

    // 🛑 Arrêter proprement l'audio précédent
    if (audioInstanceRef.current) {
      try {
        audioInstanceRef.current.pause()
        audioInstanceRef.current.currentTime = 0
      } catch (e) {
        console.warn('Erreur lors de l\'arrêt de l\'audio précédent:', e)
      }
      audioInstanceRef.current = null
    }

    // 🚫 Annuler la promesse de lecture précédente si elle existe
    if (playingPromiseRef.current) {
      playingPromiseRef.current = null
    }

    setLoading(true)
    setLastError(null)
    setIsPlaying(false)
    currentWordRef.current = word
    
    try {
      // 🧹 Nettoyage minimal du mot
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

      // 🔍 Recherche audio
      const audioUrl = await SupabaseAudioService.getWordAudioUrl(languageCode, cleanWord)
      
      if (!audioUrl) {
        console.warn(`❌ Aucun audio trouvé pour: "${cleanWord}" (${languageCode})`)
        setLastError(`Audio non disponible pour "${cleanWord}"`)
        setLoading(false)
        currentWordRef.current = null
        
        // Optionnel : diagnostic en mode développement
        if (process.env.NODE_ENV === 'development') {
          await SupabaseAudioService.diagnosticSearch(languageCode, cleanWord)
        }
        
        return false
      }

      // 🎵 Création de l'instance audio
      console.log(`✅ Audio trouvé, création lecteur...`)
      const audio = new Audio(audioUrl)
      audioInstanceRef.current = audio
      setCurrentAudio(audio)

      // 🎧 Configuration des gestionnaires AVANT le play()
      const setupEventListeners = () => {
        if (!audio) return

        audio.onended = () => {
          console.log(`🔚 Lecture terminée: ${cleanWord}`)
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentWordRef.current = null
          audioInstanceRef.current = null
        }

        audio.onerror = (e) => {
          console.error(`❌ Erreur lecture audio: ${cleanWord}`, e)
          setLastError(`Erreur de lecture pour "${cleanWord}"`)
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentWordRef.current = null
          audioInstanceRef.current = null
        }

        audio.onloadeddata = () => {
          console.log(`📥 Audio chargé: ${cleanWord}`)
        }

        audio.oncanplay = () => {
          console.log(`▶️ Audio prêt: ${cleanWord}`)
          setLoading(false)
        }
      }

      setupEventListeners()

      // 🚀 Tentative de lecture avec gestion des promesses
      const playPromise = audio.play()
      playingPromiseRef.current = playPromise

      if (playPromise !== undefined) {
        try {
          await playPromise
          console.log(`🎵 Lecture démarrée: ${cleanWord}`)
          setIsPlaying(true)
          return true
        } catch (playError) {
          // ✅ Gestion sécurisée des erreurs TypeScript
          if (isAbortError(playError)) {
            console.log(`⏹️ Lecture interrompue pour: ${cleanWord} (normal si changement rapide)`)
          } else {
            console.error(`❌ Erreur démarrage lecture: ${cleanWord}`, playError)
            setLastError(`Impossible de lire "${cleanWord}"`)
          }
          
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentWordRef.current = null
          audioInstanceRef.current = null
          return false
        }
      }

      return true

    } catch (error) {
      console.error(`💥 Erreur générale: ${word}`, error)
      setLastError(`Erreur technique pour "${word}"`)
      setIsPlaying(false)
      setCurrentAudio(null)
      setLoading(false)
      currentWordRef.current = null
      audioInstanceRef.current = null
      return false
    }
  }, [languageCode]) // ⚠️ Retirer isPlaying et currentAudio des dépendances pour éviter les boucles

  const stopAudio = useCallback(() => {
    if (audioInstanceRef.current) {
      try {
        audioInstanceRef.current.pause()
        audioInstanceRef.current.currentTime = 0
      } catch (e) {
        console.warn('Erreur lors de l\'arrêt:', e)
      }
      audioInstanceRef.current = null
    }
    
    setIsPlaying(false)
    setCurrentAudio(null)
    setLoading(false)
    setLastError(null)
    currentWordRef.current = null
    playingPromiseRef.current = null
  }, [])

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

// Hook utilitaire pour les composants qui ont besoin d'info sur l'état audio global
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
