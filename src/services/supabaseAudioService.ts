// services/supabaseAudioService.ts - Version simplifiée SANS recherche élargie
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

class SupabaseAudioService {
  private cache = new Map<string, string>()
  private readonly AUDIO_BUCKET = 'jogolinga-audio'
  private readonly SUPPORTED_FORMATS = ['wav', 'mp3', 'ogg']

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

  // 🎯 VERSION SIMPLIFIÉE : CORRESPONDANCE EXACTE UNIQUEMENT
  async getWordAudioUrl(languageCode: string, word: string): Promise<string | null> {
    try {
      console.log(`🔍 Recherche exacte: "${word}" (${languageCode})`)

      // Nettoyer le nom du fichier
      let cleanWord = word
      if (word.includes('/')) {
        const parts = word.split('/')
        cleanWord = parts[parts.length - 1]
      }
      cleanWord = cleanWord
        .replace(/\.(mp3|wav|ogg)$/i, '')
        .replace(/^(Wf-|Bm-|Li-)/, '')

      console.log(`🎯 Mot nettoyé: ${cleanWord}`)

      // 🔒 ÉTAPE 1 : Recherche exacte pour chaque format
      for (const format of this.SUPPORTED_FORMATS) {
        const exactPattern = `${cleanWord}.${format}`
        console.log(`🔍 Recherche format ${format.toUpperCase()}: ${exactPattern}`)

        const { data: audioFiles, error } = await supabase
          .from('audio_files')
          .select('*')
          .eq('language_code', languageCode)
          .ilike('file_path', `%/${exactPattern}`)
          .limit(5)

        if (error) {
          console.error(`❌ Erreur recherche ${format}:`, error)
          continue
        }

        if (audioFiles && audioFiles.length > 0) {
          console.log(`✅ Trouvé en ${format.toUpperCase()}: ${audioFiles[0].file_path}`)
          return await this.createAudioUrl(audioFiles[0].file_path)
        }
      }

      // 🔒 ÉTAPE 2 : Recherche avec préfixe langue (si pas trouvé en étape 1)
      const wordWithPrefix = `${languageCode}-${cleanWord}`
      console.log(`🔍 Recherche avec préfixe: ${wordWithPrefix}`)

      for (const format of this.SUPPORTED_FORMATS) {
        const prefixPattern = `${wordWithPrefix}.${format}`
        console.log(`🔍 Recherche préfixe ${format.toUpperCase()}: ${prefixPattern}`)

        const { data: audioFiles, error } = await supabase
          .from('audio_files')
          .select('*')
          .eq('language_code', languageCode)
          .ilike('file_path', `%/${prefixPattern}`)
          .limit(5)

        if (error) {
          console.error(`❌ Erreur recherche préfixe ${format}:`, error)
          continue
        }

        if (audioFiles && audioFiles.length > 0) {
          console.log(`✅ Trouvé avec préfixe en ${format.toUpperCase()}: ${audioFiles[0].file_path}`)
          return await this.createAudioUrl(audioFiles[0].file_path)
        }
      }

      // 🚫 PAS DE RECHERCHE ÉLARGIE - Retourner null si pas trouvé
      console.log(`❌ Aucun fichier trouvé pour: "${cleanWord}" (${languageCode})`)
      console.log(`🔍 Recherches effectuées:`)
      console.log(`   - ${cleanWord}.wav/mp3/ogg`)
      console.log(`   - ${wordWithPrefix}.wav/mp3/ogg`)
      console.log(`✋ ARRÊT: Pas de recherche élargie pour éviter les confusions`)
      
      return null

    } catch (error) {
      console.error('💥 Erreur service:', error)
      return null
    }
  }

  // Création d'URL optimisée
  private async createAudioUrl(filePath: string): Promise<string> {
    if (this.cache.has(filePath)) {
      console.log(`🚀 Cache hit: ${filePath}`)
      return this.cache.get(filePath)!
    }

    try {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(this.AUDIO_BUCKET)
        .createSignedUrl(filePath, 3600)

      if (!urlError && signedUrlData?.signedUrl) {
        console.log(`🔗 URL signée générée: ${filePath}`)
        this.cache.set(filePath, signedUrlData.signedUrl)
        return signedUrlData.signedUrl
      }

      console.log(`⚠️ Fallback URL publique: ${filePath}`)
      return this.getPublicUrl(filePath)
    } catch (error) {
      console.error('Erreur création URL:', error)
      return this.getPublicUrl(filePath)
    }
  }

  // Test de diagnostic
  async diagnosticSearch(languageCode: string, word: string): Promise<void> {
    console.log(`\n🔍 === DIAGNOSTIC pour "${word}" (${languageCode}) ===`)
    
    const cleanWord = word.replace(/^(Wf-|Bm-|Li-)/, '').replace(/\.(mp3|wav|ogg)$/i, '')
    const patterns = [
      `${cleanWord}.wav`,
      `${cleanWord}.mp3`, 
      `${cleanWord}.ogg`,
      `${languageCode}-${cleanWord}.wav`,
      `${languageCode}-${cleanWord}.mp3`,
      `${languageCode}-${cleanWord}.ogg`
    ]

    for (const pattern of patterns) {
      const { data, error } = await supabase
        .from('audio_files')
        .select('file_path')
        .eq('language_code', languageCode)
        .ilike('file_path', `%/${pattern}`)
        .limit(1)

      const status = error ? '❌ Erreur' : 
                    (data && data.length > 0) ? `✅ Trouvé: ${data[0].file_path}` : 
                    '❌ Non trouvé'
      
      console.log(`  ${pattern}: ${status}`)
    }
    console.log(`=== FIN DIAGNOSTIC ===\n`)
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
        .limit(5)

      console.log(`🔌 Test connexion:`)
      if (data) {
        data.forEach((f, i) => console.log(`  ${i+1}. ${f.file_path}`))
      }
      
      return !error && !!data
    } catch (error) {
      console.error('Test connexion échoué:', error)
      return false
    }
  }
}

export default new SupabaseAudioService()
