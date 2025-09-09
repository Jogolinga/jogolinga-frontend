// src/services/RevisionDriveService.ts
import { 
    LanguageCode,
    RevisionWordInfo,
    SerializedUserProgress,
    SaveDataInput
  } from '../types/types';
  import { GoogleDriveService } from '../services/googleDriveService';
  
  /**
   * Service de sauvegarde des données de révision sur Google Drive
   */
  class RevisionDriveService {
    private googleDriveService: GoogleDriveService;
    private readonly FILE_PREFIX = 'revision';
  
    constructor(token: string) {
      this.googleDriveService = new GoogleDriveService(token);
    }
  
    /**
     * Vérifie si le token Google Drive est valide
     */
    public async validateToken(): Promise<boolean> {
      try {
        return await this.googleDriveService.validateToken();
      } catch (error) {
        console.error('Erreur lors de la validation du token Google Drive:', error);
        return false;
      }
    }
  
    /**
     * Sauvegarde les données de révision sur Google Drive
     */
    public async saveRevisionData(
      languageCode: LanguageCode,
      sessionHistory: RevisionWordInfo[],
      learnedWords: Set<string>
    ): Promise<boolean> {
      try {
        console.log(`Sauvegarde des données de révision pour ${languageCode}`);
        console.log(`Nombre de mots dans l'historique: ${sessionHistory.length}`);
        
        // Préparer les données au format accepté par GoogleDriveService
        const saveData: SaveDataInput = {
          // Champs obligatoires pour SaveDataInput
          progress: {
            learnedWords: Array.from(learnedWords),
            wordsToReview: [],
            wordProgress: {},
            recentlyLearnedWords: [],
            language: languageCode
          },
          completedCategories: [],
          
          // Métadonnées pour les données de révision
          _metadata: {
            type: 'revision',
            revisionData: {
              sessionHistory,
              learnedWords: Array.from(learnedWords)
            },
            timestamp: Date.now(),
            lastUpdated: new Date().toISOString()
          }
        };
        
        // Sauvegarder via le service Google Drive
        await this.googleDriveService.saveData(languageCode, saveData, this.FILE_PREFIX);
        console.log('Données de révision sauvegardées avec succès');
        return true;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données de révision:', error);
        return false;
      }
    }
  
    /**
     * Charge les données de révision depuis Google Drive
     */
    public async loadRevisionData(languageCode: LanguageCode): Promise<{
      sessionHistory: RevisionWordInfo[],
      learnedWords: string[]
    } | null> {
      try {
        console.log(`Chargement des données de révision pour ${languageCode}`);
        
        // Charger les données via le service Google Drive
        const data = await this.googleDriveService.loadData(languageCode, this.FILE_PREFIX);
        
        if (!data || !data._metadata?.revisionData) {
          console.log('Aucune donnée de révision trouvée');
          return null;
        }
        
        const revisionData = data._metadata.revisionData;
        
        return {
          sessionHistory: revisionData.sessionHistory || [],
          learnedWords: revisionData.learnedWords || []
        };
      } catch (error) {
        console.error('Erreur lors du chargement des données de révision:', error);
        return null;
      }
    }
  
    /**
     * Vérifie si le fichier de révision existe sur Google Drive
     */
    public async isFileExists(languageCode: LanguageCode): Promise<boolean> {
      try {
        return await this.googleDriveService.isFileExists(languageCode, this.FILE_PREFIX);
      } catch (error) {
        console.error('Erreur lors de la vérification du fichier:', error);
        return false;
      }
    }
  }
  
  export default RevisionDriveService;