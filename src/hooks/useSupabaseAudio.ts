// hooks/useSupabaseAudio.ts - Version corrigée pour éviter AbortError
import { useState, useCallback, useRef, useEffect } from 'react'
import SupabaseAudioService from '../services/supabaseAudioService'

export const useSupabaseAudio = (languageCode: string = 'wf') => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  
  // 🔧 REF pour éviter les appels multiples simultanés
  const playingRef = useRef<boolean>(false)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Nettoyage au démontage du composant
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const playWord = useCallback(async (word: string): Promise<boolean> => {
    // 🛑 Annuler toute lecture en cours PROPREMENT
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Créer un nouveau contrôleur d'abort pour cette lecture
    abortControllerRef.current = new AbortController()
    const currentController = abortControllerRef.current

    // 🛑 Arrêter l'audio précédent de manière sécurisée
    if (currentAudioRef.current && !currentAudioRef.current.paused) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      } catch (error) {
        // Ignorer les erreurs de pause
      }
      currentAudioRef.current = null
    }

    // 🔒 Empêcher les appels multiples simultanés
    if (playingRef.current) {
      console.warn(`⏸️ Lecture déjà en cours, ignore: "${word}"`)
      return false
    }

    playingRef.current = true
    setIsPlaying(true)
    setLoading(true)
    setLastError(null)
    
    try {
      // Vérifier si annulé avant de commencer
      if (currentController.signal.aborted) {
        return false
      }

      // 🧹 Nettoyage du mot
      let cleanWord = word
      
      if (cleanWord.startsWith('/audio/')) {
        cleanWord = cleanWord.replace('/audio/', '')
      }
      
      if (cleanWord.match(/^(Wf-|Bm-|Li-)/)) {
        cleanWord = cleanWord.substring(3)
      }
      
      console.log(`🎵 Tentative de lecture: "${cleanWord}" en ${languageCode}`)
      console.log(`📝 Mot original: "${word}" → Mot nettoyé: "${cleanWord}"`)

      // Vérifier si annulé avant la recherche
      if (currentController.signal.aborted) {
        return false
      }

      // 🔍 Recherche audio
      const audioUrl = await SupabaseAudioService.getWordAudioUrl(languageCode, cleanWord)
      
      // Vérifier si annulé après la recherche
      if (currentController.signal.aborted) {
        return false
      }
      
      if (!audioUrl) {
        console.warn(`❌ Aucun audio trouvé pour: "${cleanWord}" (${languageCode})`)
        setLastError(`Audio non disponible pour "${cleanWord}"`)
        playingRef.current = false
        setIsPlaying(false)
        setLoading(false)
        return false
      }

      // 🎵 Créer l'audio
      console.log(`✅ Audio trouvé, création lecteur...`)
      const audio = new Audio(audioUrl)
      
      // Vérifier si annulé avant de configurer l'audio
      if (currentController.signal.aborted) {
        return false
      }

      currentAudioRef.current = audio
      setCurrentAudio(audio)

      // 🎧 Gestionnaires d'événements avec gestion d'annulation
      audio.onended = () => {
        if (!currentController.signal.aborted) {
          console.log(`🔚 Lecture terminée: ${cleanWord}`)
          playingRef.current = false
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentAudioRef.current = null
        }
      }

      audio.onerror = (e) => {
        if (!currentController.signal.aborted) {
          console.error(`❌ Erreur lecture audio: ${cleanWord}`, e)
          setLastError(`Erreur de lecture pour "${cleanWord}"`)
          playingRef.current = false
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentAudioRef.current = null
        }
      }

      audio.onloadeddata = () => {
        if (!currentController.signal.aborted) {
          console.log(`📥 Audio chargé: ${cleanWord}`)
          setLoading(false)
        }
      }

      audio.oncanplay = () => {
        if (!currentController.signal.aborted) {
          console.log(`▶️ Audio prêt: ${cleanWord}`)
          setLoading(false)
        }
      }

      // 🚀 Démarrage de la lecture avec gestion d'abort
      try {
        // Vérifier une dernière fois avant play()
        if (currentController.signal.aborted) {
          return false
        }

        // ⏰ DÉLAI pour éviter les conflits
        await new Promise(resolve => setTimeout(resolve, 50))

        // Vérifier encore après le délai
        if (currentController.signal.aborted) {
          return false
        }

        await audio.play()
        
        if (!currentController.signal.aborted) {
          console.log(`🎵 Lecture démarrée: ${cleanWord}`)
          return true
        } else {
          return false
        }
        
      } catch (playError) {
        if (!currentController.signal.aborted) {
          const errorMessage = (playError as Error).message
          
          // 🔍 Gestion spécifique des erreurs courantes
          if (errorMessage.includes('AbortError') || errorMessage.includes('interrupted')) {
            console.log(`⏸️ Lecture interrompue (normal): ${cleanWord}`)
            // Ne pas traiter comme une erreur, c'est normal
          } else {
            console.error(`❌ Erreur démarrage lecture: ${cleanWord}`, playError)
            setLastError(`Impossible de lire "${cleanWord}"`)
          }
          
          playingRef.current = false
          setIsPlaying(false)
          setCurrentAudio(null)
          setLoading(false)
          currentAudioRef.current = null
        }
        return false
      }

    } catch (error) {
      if (!currentController.signal.aborted) {
        console.error(`💥 Erreur générale: ${word}`, error)
        setLastError(`Erreur technique pour "${word}"`)
        playingRef.current = false
        setIsPlaying(false)
        setCurrentAudio(null)
        setLoading(false)
        currentAudioRef.current = null
      }
      return false
    }
  }, [languageCode])

  const stopAudio = useCallback(() => {
    // Annuler toute lecture en cours
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause()
        currentAudioRef.current.currentTime = 0
      } catch (error) {
        // Ignorer les erreurs de pause
      }
      currentAudioRef.current = null
    }

    playingRef.current = false
    setIsPlaying(false)
    setCurrentAudio(null)
    setLoading(false)
    setLastError(null)
  }, [])

  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  // 🧪 Fonction de diagnostic
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

// 🌐 Hook global pour gérer l'état audio à travers toute l'app
let globalAudioInstance: HTMLAudioElement | null = null

export const useGlobalAudio = () => {
  const stopAllAudio = useCallback(() => {
    if (globalAudioInstance) {
      try {
        globalAudioInstance.pause()
        globalAudioInstance.currentTime = 0
      } catch (error) {
        // Ignorer
      }
      globalAudioInstance = null
    }
  }, [])

  return { stopAllAudio }
}
