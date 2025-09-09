import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

class SupabaseAudioService {
  private cache = new Map<string, string>()
  private readonly AUDIO_BUCKET = 'jogolinga-audio'
  private readonly SUPPORTED_FORMATS = ['wav', 'ogg', 'mp3']

  getPublicUrl(filePath: string): string {
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath)!
    }

    const { data } = supabase.storage
      .from(this.AUDIO_BUCKET)
      .getPublicUrl(filePath)

    this.cache.set(filePath, data.publicUrl)
    return data.publicUrl
  }

  // Recherche multi-format pour .wav, .mp3 et .ogg
  async getWordAudioUrl(languageCode: string, word: string): Promise<string | null> {
    try {
      console.log(`🔍 Recherche: "${word}" (${languageCode})`)

      // Nettoyer le nom du fichier
      let cleanWord = word
      if (word.includes('/')) {
        const parts = word.split('/')
        cleanWord = parts[parts.length - 1]
      }
      cleanWord = cleanWord.replace(/\.(mp3|wav|ogg)$/i, '')

      console.log(`🎯 Mot nettoyé: ${cleanWord}`)

      // 1. Recherche exacte pour chaque format supporté
      for (const format of this.SUPPORTED_FORMATS) {
        const exactPattern = `${cleanWord}.${format}`
        console.log(`🔍 Recherche format ${format.toUpperCase()}: ${exactPattern}`)

        const { data: audioFiles } = await supabase
          .from('audio_files')
          .select('*')
          .eq('language_code', languageCode)
          .ilike('file_path', `%/${exactPattern}`)
          .limit(5)

        if (audioFiles && audioFiles.length > 0) {
          console.log(`✅ Trouvé en ${format.toUpperCase()}: ${audioFiles.length} fichier(s)`)
          
          const selectedFile = audioFiles[0]
          console.log(`🎵 Fichier sélectionné: ${selectedFile.file_path}`)
          
          return await this.createAudioUrl(selectedFile.file_path)
        }
      }

      // 2. Recherche fallback sans extension spécifique
      console.log(`🔄 Fallback: recherche générale`)
      const { data: fallbackFiles } = await supabase
        .from('audio_files')
        .select('*')
        .eq('language_code', languageCode)
        .ilike('file_path', `%/${cleanWord}.%`)
        .limit(10)

      if (fallbackFiles && fallbackFiles.length > 0) {
        console.log(`📊 Fallback trouvé: ${fallbackFiles.length} fichier(s)`)
        
        // Trier par priorité de format (wav > mp3 > ogg)
        const sortedFiles = fallbackFiles.sort((a, b) => {
          const aExt = a.file_path.split('.').pop()?.toLowerCase() || ''
          const bExt = b.file_path.split('.').pop()?.toLowerCase() || ''
          
          const formatPriority = { wav: 3, ogg: 2, mp3: 1 }
          const aPriority = formatPriority[aExt as keyof typeof formatPriority] || 0
          const bPriority = formatPriority[bExt as keyof typeof formatPriority] || 0
          
          if (aPriority !== bPriority) {
            return bPriority - aPriority // Plus haute priorité en premier
          }
          
          // Si même format, prendre le chemin le plus court
          return a.file_path.length - b.file_path.length
        })

        const selectedFile = sortedFiles[0]
        console.log(`🎵 Fichier sélectionné (fallback): ${selectedFile.file_path}`)
        
        return await this.createAudioUrl(selectedFile.file_path)
      }

      // 3. Recherche très large (contient le nom)
      console.log(`🔄 Fallback élargi: recherche contenant "${cleanWord}"`)
      const { data: wideFiles } = await supabase
        .from('audio_files')
        .select('*')
        .eq('language_code', languageCode)
        .ilike('file_path', `%${cleanWord}%`)
        .limit(10)

      if (wideFiles && wideFiles.length > 0) {
        console.log(`📊 Recherche élargie: ${wideFiles.length} fichier(s)`)
        wideFiles.forEach((file, index) => {
          console.log(`  ${index + 1}. ${file.file_path}`)
        })

        // Même logique de tri
        const sortedWideFiles = wideFiles.sort((a, b) => {
          const aFileName = a.file_path.split('/').pop()?.replace(/\.[^.]+$/, '') || ''
          const bFileName = b.file_path.split('/').pop()?.replace(/\.[^.]+$/, '') || ''
          
          // Priorité aux correspondances exactes du nom
          const aExact = aFileName === cleanWord
          const bExact = bFileName === cleanWord
          
          if (aExact && !bExact) return -1
          if (!aExact && bExact) return 1
          
          // Puis par format
          const aExt = a.file_path.split('.').pop()?.toLowerCase() || ''
          const bExt = b.file_path.split('.').pop()?.toLowerCase() || ''
          
          const formatPriority = { wav: 3, mp3: 2, ogg: 1 }
          const aPriority = formatPriority[aExt as keyof typeof formatPriority] || 0
          const bPriority = formatPriority[bExt as keyof typeof formatPriority] || 0
          
          return bPriority - aPriority
        })

        const selectedFile = sortedWideFiles[0]
        console.log(`🎵 Fichier sélectionné (élargi): ${selectedFile.file_path}`)
        
        return await this.createAudioUrl(selectedFile.file_path)
      }

      console.log(`❌ Aucun fichier trouvé pour: "${word}"`)
      return null

    } catch (error) {
      console.error('💥 Erreur service:', error)
      return null
    }
  }

  // Méthode utilitaire pour créer l'URL audio
  private async createAudioUrl(filePath: string): Promise<string> {
    try {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .createSignedUrl(filePath, 3600)

      if (!urlError && signedUrlData?.signedUrl) {
        console.log(`🔗 URL signée générée`)
        return signedUrlData.signedUrl
      }

      console.log(`⚠️ Fallback vers URL publique`)
      return this.getPublicUrl(filePath)
    } catch (error) {
      console.error('Erreur création URL:', error)
      return this.getPublicUrl(filePath)
    }
  }

  async preloadCategoryAudios(languageCode: string, category: string): Promise<number> {
    console.log(`📄 Préchargement: ${languageCode}/${category}`)
    return 0
  }

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('audio_files')
        .select('file_path')
        .eq('language_code', 'wf')
        .limit(10)

      console.log(`🔌 Test connexion - Échantillon:`)
      data?.forEach((f, i) => console.log(`  ${i+1}. ${f.file_path}`))
      
      return !error
    } catch (error) {
      console.error('Test connexion échoué:', error)
      return false
    }
  }
}

export default new SupabaseAudioService()