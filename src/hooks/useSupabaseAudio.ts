import { useState, useCallback } from 'react'
import SupabaseAudioService from '../services/supabaseAudioService'

export const useSupabaseAudio = (languageCode: string = 'wf') => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [loading, setLoading] = useState(false)

  const playWord = useCallback(async (word: string): Promise<boolean> => {
    if (isPlaying && currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
    }

    setLoading(true)
    
    try {
      // Nettoyer le mot d'éventuels préfixes obsolètes
      let cleanWord = word
      
      // Supprimer les anciens préfixes de chemin
      if (cleanWord.startsWith('/audio/')) {
        cleanWord = cleanWord.replace('/audio/', '')
      }
      
      // Supprimer les préfixes de langue redondants si ils existent déjà
      cleanWord = cleanWord
        .replace(/^(wolof|bambara|lingala)\//, '')
        .replace(/^(Wf-|Bm-|Li-)/, '')
      
      console.log(`🎵 Tentative de lecture: "${cleanWord}" en ${languageCode}`)
      console.log(`🔍 Language code utilisé: ${languageCode}`)

      const audioUrl = await SupabaseAudioService.getWordAudioUrl(languageCode, cleanWord)
      
      if (!audioUrl) {
        console.warn(`Aucun audio trouvé pour: ${cleanWord} (${languageCode})`)
        setLoading(false)
        return false
      }

      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      setIsPlaying(true)

      // Gestionnaires d'événements
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentAudio(null)
      }

      audio.onerror = (e) => {
        console.error(`Erreur lecture audio: ${cleanWord}`, e)
        setIsPlaying(false)
        setCurrentAudio(null)
        setLoading(false)
      }

      audio.onloadeddata = () => {
        setLoading(false)
      }

      audio.oncanplay = () => {
        setLoading(false)
      }

      // Tentative de lecture
      await audio.play()
      console.log(`✅ Audio joué avec succès: ${cleanWord}`)
      return true

    } catch (error) {
      console.error('Erreur playWord:', error)
      setIsPlaying(false)
      setLoading(false)
      return false
    }
  }, [languageCode, isPlaying, currentAudio])

  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setIsPlaying(false)
    }
  }, [currentAudio])

  const preloadCategory = useCallback(async (category: string) => {
    return await SupabaseAudioService.preloadCategoryAudios(languageCode, category)
  }, [languageCode])

  // Test de connexion disponible via le hook
  const testConnection = useCallback(async () => {
    return await SupabaseAudioService.testConnection()
  }, [])

  return {
    playWord,
    stopAudio,
    preloadCategory,
    testConnection,
    isPlaying,
    loading,
    // Compatibilité avec l'ancien hook
    playAudio: playWord
  }
}