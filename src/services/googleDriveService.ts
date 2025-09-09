import { 
  LanguageCode, 
  SerializedUserProgress,
} from '../types/types';

interface DriveResponse {
  progress: SerializedUserProgress;
  completedCategories: string[];
  totalXP?: number; // ✅ NOUVEAU : XP synchronisé
  [key: string]: any; // Pour d'autres propriétés éventuelles
}

interface SaveDataInput {
  progress: SerializedUserProgress;
  completedCategories: string[];
  totalXP?: number; // ✅ NOUVEAU : XP synchronisé
  [key: string]: any; // Pour d'autres propriétés éventuelles
}

interface DriveFile {
  id: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export class GoogleDriveService {
  private readonly FOLDER_NAME = 'LangApp';
  private readonly BASE_URL = 'https://www.googleapis.com/drive/v3';
  private isSaving = false;
  
  constructor(private credential: string) {
    if (!credential) {
      throw new Error('No credentials provided for Google Drive service');
    }
    console.log('GoogleDriveService initialized with credential', credential.substring(0, 10) + '...');
  }

  /**
   * Valide le token d'accès en effectuant un appel simple à l'API Google Drive
   */
  public async validateToken(): Promise<boolean> {
    try {
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/about?fields=user`,
        { method: 'GET' }
      );
      
      const data = await response.json();
      console.log("Token validé avec succès, utilisateur:", data.user?.displayName || "Inconnu");
      return true;
    } catch (error) {
      console.error("Le token n'est pas valide:", error);
      return false;
    }
  }

  /**
   * Effectue une requête avec authentification à l'API Google Drive
   */
  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Vérification du token
      if (!this.credential || typeof this.credential !== 'string' || this.credential.trim() === '') {
        throw new Error('Token Google invalide ou manquant');
      }
      
      // Création des headers avec typage correct
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${this.credential}`
      };
      
      // Définition explicite du Content-Type pour les requêtes PATCH et POST
      if (options.method === 'PATCH' || options.method === 'POST') {
        if (options.headers && typeof options.headers === 'object') {
          // Récupérer le Content-Type existant s'il existe
          const existingHeaders = options.headers as Record<string, string>;
          if (existingHeaders['Content-Type']) {
            headers['Content-Type'] = existingHeaders['Content-Type'];
          } else {
            headers['Content-Type'] = 'application/json';
          }
        } else {
          headers['Content-Type'] = 'application/json';
        }
      }
      
      // Ajout des autres headers si présents
      if (options.headers && typeof options.headers === 'object') {
        Object.entries(options.headers as Record<string, string>).forEach(([key, value]) => {
          if (key !== 'Authorization') { // Éviter de remplacer le token d'autorisation
            headers[key] = value;
          }
        });
      }
      
      // Ajout du cache buster
      const cacheBuster = Date.now();
      const finalUrl = !url.includes('_=') ? 
        (url.includes('?') ? `${url}&_=${cacheBuster}` : `${url}?_=${cacheBuster}`) : 
        url;
      
      // Log détaillé pour le débogage
      console.log(`Fetching URL: ${finalUrl}, Method: ${options.method || 'GET'}`);
      console.log("Headers:", JSON.stringify(headers, null, 2));
      
      // Délai de 500ms pour éviter les problèmes de rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(finalUrl, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = 'Could not extract error text';
        }
        
        console.error(`API Error ${response.status}: ${errorText}`);
        
        // Si c'est une erreur d'authentification, fournir plus de détails
        if (response.status === 401 || response.status === 403) {
          console.error('Erreur d\'authentification Google Drive. Token:', this.credential.substring(0, 10) + '...');
          console.error('URL en échec:', finalUrl);
          console.error('Méthode:', options.method || 'GET');
        }
        
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error details:', error);
      throw error;
    }
  }

  /**
   * Trouve ou crée le dossier principal de l'application
   */
  private async findOrCreateAppFolder(): Promise<string> {
    try {
      console.log(`Recherche du dossier ${this.FOLDER_NAME}`);
      
      // Recherche du dossier existant
      const query = encodeURIComponent(`name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files?q=${query}&fields=files(id,name)`
      );
      
      const data = await response.json();
      console.log(`Résultat de la recherche:`, data);
      
      if (data.files && data.files.length > 0) {
        console.log(`Dossier trouvé: ${data.files[0].name} (ID: ${data.files[0].id})`);
        return data.files[0].id;
      }
      
      console.log(`Dossier non trouvé, création en cours...`);
      
      // Création d'un nouveau dossier
      const createResponse = await this.fetchWithAuth(
        `${this.BASE_URL}/files`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder'
          })
        }
      );
      
      const folder = await createResponse.json();
      console.log(`Dossier créé: ${folder.name || this.FOLDER_NAME} (ID: ${folder.id})`);
      return folder.id;
    } catch (error) {
      console.error('Error in findOrCreateAppFolder:', error);
      console.error('Détails:', JSON.stringify(error, null, 2));
      throw new Error(`Failed to find or create app folder: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Trouve ou crée un sous-dossier dans un dossier parent
   */
  async findOrCreateFolder(folderName: string, parentId: string): Promise<string> {
    try {
      console.log(`Recherche du dossier ${folderName}`);
      const query = encodeURIComponent(`name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files?q=${query}&fields=files(id,name)`
      );
      
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        console.log(`Dossier trouvé: ${data.files[0].name} (ID: ${data.files[0].id})`);
        return data.files[0].id;
      }
      
      console.log(`Dossier non trouvé, création en cours...`);
      
      // Création d'un nouveau dossier
      const createResponse = await this.fetchWithAuth(
        `${this.BASE_URL}/files`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
          })
        }
      );
      
      const folder = await createResponse.json();
      console.log(`Dossier créé: ${folder.name} (ID: ${folder.id})`);
      return folder.id;
    } catch (error) {
      console.error('Error in findOrCreateFolder:', error);
      throw new Error(`Failed to find or create folder: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Recherche un fichier dans un dossier
   */
  private async findFile(folderId: string, fileName: string): Promise<string | null> {
    try {
      console.log(`Recherche du fichier ${fileName} dans le dossier ${folderId}`);
      const query = encodeURIComponent(`name='${fileName}' and '${folderId}' in parents and trashed=false`);
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files?q=${query}&fields=files(id,name)`
      );
      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        console.log(`Fichier ${fileName} trouvé avec l'ID: ${data.files[0].id}`);
        return data.files[0].id;
      }
      
      console.log(`Aucun fichier trouvé avec le nom ${fileName}`);
      return null;
    } catch (error) {
      console.error('Error finding file:', error);
      throw new Error(`Failed to find file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Crée un fichier avec le contenu stocké dans la description
   */
  async createFileWithDescription(fileName: string, folderId: string, fileContent: string): Promise<string> {
    console.log(`Création du fichier ${fileName} avec description`);
    
    try {
      const createResponse = await this.fetchWithAuth(
        `${this.BASE_URL}/files`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: fileName,
            parents: [folderId],
            mimeType: 'application/json',
            description: fileContent
          })
        }
      );
      
      const fileData = await createResponse.json();
      const fileId = fileData.id;
      console.log(`Fichier créé avec ID: ${fileId}`);
      
      // Rendre le fichier accessible par lien
      await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );
      
      return fileId;
    } catch (error) {
      console.error("Erreur lors de la création du fichier:", error);
      throw new Error(`Failed to create file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Met à jour la description d'un fichier existant
   */
  async updateFileDescription(fileId: string, description: string): Promise<void> {
    console.log(`Mise à jour de la description du fichier (ID: ${fileId})`);
    
    try {
      await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: description
          })
        }
      );
      
      console.log("Description mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la description:", error);
      throw new Error(`Failed to update file description: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Liste les fichiers dans un dossier
   */
  async listFilesInFolder(folderId: string): Promise<{id: string, name: string, modifiedTime?: string}[]> {
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc`
      );
      
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error("Erreur lors du listage des fichiers:", error);
      return [];
    }
  }

  /**
   * ✅ SAUVEGARDE AVEC XP SYNCHRONISÉ
   * Sauvegarde les données utilisateur sur Google Drive avec historique et XP
   */
 async saveData(languageCode: LanguageCode, data: SaveDataInput, exerciseType: string = 'data'): Promise<void> {
  // Éviter les sauvegardes multiples simultanées
  if (this.isSaving) {
    console.log("Une sauvegarde est déjà en cours, celle-ci sera ignorée");
    return;
  }
  
  this.isSaving = true;
  const currentTimestamp = Date.now();
  console.log(`Début sauvegarde pour ${languageCode} - Timestamp: ${currentTimestamp}`);
  
  try {
    console.log("Étape 1: Recherche ou création du dossier d'application");
    const folderId = await this.findOrCreateAppFolder();
    console.log(`Dossier obtenu avec ID: ${folderId}`);
    
    // Nom du fichier principal uniquement
    const fileName = `${languageCode}-${exerciseType}.json`;
    console.log(`Étape 2: Préparation du fichier ${fileName}`);
    
    // ✅ Récupérer l'XP actuel si pas fourni dans data
    let currentXP = data.totalXP;
    if (currentXP === undefined) {
      currentXP = parseInt(localStorage.getItem(`${languageCode}-totalXP`) || '0');
      console.log(`XP récupéré depuis localStorage: ${currentXP}`);
    } else {
      console.log(`XP fourni dans les données: ${currentXP}`);
    }
    
    // Ajout d'un timestamp pour la sauvegarde avec XP
    const saveData = {
      ...data,
      totalXP: currentXP,
      _lastSaved: currentTimestamp,
      _saveSource: "Application"
    };
    
    // Formater le contenu JSON
    const fileContent = JSON.stringify(saveData);
    
    console.log(`Contenu du fichier préparé (${fileContent.length} caractères)`);
    console.log(`✅ XP inclus dans la sauvegarde: ${currentXP}`);
    
    console.log("Étape 3: Vérification si le fichier existe déjà");
    const existingFileId = await this.findFile(folderId, fileName);
    console.log(`Résultat: ${existingFileId ? `Existant (ID: ${existingFileId})` : 'Fichier non trouvé'}`);

    // Étape 4: Créer ou mettre à jour le fichier principal
    console.log(`Création/mise à jour du fichier ${fileName}`);
    if (existingFileId) {
      // Mettre à jour le fichier existant
      await this.updateFileDescription(existingFileId, fileContent);
      console.log(`✅ Fichier mis à jour (ID: ${existingFileId}) avec XP: ${currentXP}`);
    } else {
      // Créer un nouveau fichier
      const fileId = await this.createFileWithDescription(fileName, folderId, fileContent);
      console.log(`✅ Nouveau fichier créé (ID: ${fileId}) avec XP: ${currentXP}`);
    }
    
    console.log(`✅ Sauvegarde terminée avec succès pour ${languageCode}`);
    return;
    
  } catch (error) {
    console.error("❌ Erreur lors de la sauvegarde:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    } else {
      console.error("Erreur non standard:", String(error));
    }
    throw new Error(`Failed to save data to Google Drive: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Libérer le verrou
    this.isSaving = false;
    console.log(`Fin de la sauvegarde pour ${languageCode} - Timestamp: ${Date.now()}`);
  }
}

  /**
   * ✅ CHARGEMENT AVEC RESTAURATION XP
   * Charge les données utilisateur depuis Google Drive avec restauration de l'XP
   */
  async loadData(languageCode: LanguageCode, exerciseType: string = 'data'): Promise<DriveResponse | null> {
    console.log(`Chargement des données pour ${languageCode}`);
    try {
      console.log("Recherche du dossier d'application");
      const folderId = await this.findOrCreateAppFolder();
      console.log(`Dossier trouvé avec ID: ${folderId}`);
      
      const fileName = `${languageCode}-${exerciseType}.json`;
      console.log(`Recherche du fichier ${fileName}`);
      const fileId = await this.findFile(folderId, fileName);
  
      if (!fileId) {
        console.log(`Aucun fichier de données trouvé pour ${languageCode}`);
        return null;
      }
  
      console.log(`Chargement des données depuis le fichier ${fileName} (ID: ${fileId})`);
      
      // Charger la description du fichier qui contient nos données
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}?fields=description`
      );
      
      try {
        const fileData = await response.json();
        
        if (!fileData.description) {
          console.log("Le fichier existe mais pas de données dans la description");
          return null;
        }
        
        // Parser les données JSON depuis la description
        const data = JSON.parse(fileData.description);
        
        // ✅ NOUVEAU : Restaurer l'XP si présent dans les données
        if (data.totalXP !== undefined) {
          const currentLocalXP = parseInt(localStorage.getItem(`${languageCode}-totalXP`) || '0');
          
          // Utiliser l'XP le plus élevé entre local et Drive (éviter les régressions)
          const finalXP = Math.max(currentLocalXP, data.totalXP);
          
          localStorage.setItem(`${languageCode}-totalXP`, finalXP.toString());
          console.log(`✅ XP restauré depuis Google Drive: ${data.totalXP} -> Final: ${finalXP}`);
          
          // Mettre à jour data avec le XP final pour cohérence
          data.totalXP = finalXP;
          
          // Déclencher un événement pour notifier les composants de la restauration XP
          window.dispatchEvent(new CustomEvent('xpUpdated', { 
            detail: { 
              newTotal: finalXP, 
              gained: 0,
              source: 'google_drive_restore'
            } 
          }));
        } else {
          console.log("Aucun XP trouvé dans les données Google Drive");
        }
        
        console.log(`Données chargées avec succès pour ${languageCode}`);
        console.log("Extrait des données:", JSON.stringify(data).substring(0, 200) + '...');
        return data;
      } catch (error) {
        console.error("Erreur lors du parsing JSON du fichier:", error);
        return null;
      }
    } catch (error) {
      console.error('Error loading data from Google Drive:', error);
      throw new Error(`Failed to load data from Google Drive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Supprime un fichier de Google Drive
   */
  async deleteFile(languageCode: LanguageCode, exerciseType: string = 'data'): Promise<void> {
    console.log(`Suppression du fichier pour ${languageCode}`);
    try {
      const folderId = await this.findOrCreateAppFolder();
      const fileName = `${languageCode}-${exerciseType}.json`;
      const fileId = await this.findFile(folderId, fileName);

      if (fileId) {
        console.log(`Suppression du fichier ${fileName} (ID: ${fileId})`);
        await this.fetchWithAuth(
          `${this.BASE_URL}/files/${fileId}`,
          { method: 'DELETE' }
        );
        console.log(`Fichier ${fileName} supprimé avec succès`);
      } else {
        console.log(`Aucun fichier ${fileName} à supprimer`);
      }
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      throw new Error(`Failed to delete file from Google Drive: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Vérifie si un fichier existe pour une langue donnée
   */
  async isFileExists(languageCode: LanguageCode, exerciseType: string = 'data'): Promise<boolean> {
    try {
      const folderId = await this.findOrCreateAppFolder();
      const fileName = `${languageCode}-${exerciseType}.json`;
      const fileId = await this.findFile(folderId, fileName);
      return !!fileId;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  /**
   * Liste tous les fichiers dans le dossier principal
   */
  async listFiles(): Promise<DriveFile[]> {
    console.log("Listage des fichiers dans le dossier LangApp");
    try {
      const folderId = await this.findOrCreateAppFolder();
      console.log(`Dossier LangApp trouvé avec ID: ${folderId}`);
      
      const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files?q=${query}&fields=files(id,name,mimeType,webViewLink,modifiedTime)`
      );
      
      const data = await response.json();
      console.log("Fichiers trouvés dans le dossier LangApp:", data.files);
      return data.files || [];
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }

  /**
   * Obtient un lien vers un fichier
   */
  async getFileLink(languageCode: LanguageCode, exerciseType: string = 'data'): Promise<string | null> {
    console.log(`Récupération du lien vers le fichier ${languageCode}-data.json`);
    try {
      const folderId = await this.findOrCreateAppFolder();
      const fileName = `${languageCode}-${exerciseType}.json`;
      const fileId = await this.findFile(folderId, fileName);
      
      if (!fileId) {
        console.log("Fichier non trouvé, impossible d'obtenir un lien");
        return null;
      }
      
      // Récupérer le lien web du fichier
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}?fields=webViewLink`
      );
      
      const data = await response.json();
      console.log(`Lien du fichier obtenu: ${data.webViewLink}`);
      return data.webViewLink;
    } catch (error) {
      console.error("Error getting file link:", error);
      return null;
    }
  }

  /**
   * Rend un fichier public
   */
  async makeFilePublic(languageCode: LanguageCode, exerciseType: string = 'data'): Promise<string | null> {
    console.log(`Tentative de rendre public le fichier ${languageCode}-data.json`);
    try {
      const folderId = await this.findOrCreateAppFolder();
      const fileName = `${languageCode}-${exerciseType}.json`;
      const fileId = await this.findFile(folderId, fileName);
      
      if (!fileId) return null;
      
      // Modifier les permissions pour rendre le fichier accessible par lien
      await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
          })
        }
      );
      
      // Récupérer le lien web du fichier
      const response = await this.fetchWithAuth(
        `${this.BASE_URL}/files/${fileId}?fields=webViewLink`
      );
      
      const data = await response.json();
      console.log(`Fichier rendu public, lien: ${data.webViewLink}`);
      return data.webViewLink;
    } catch (error) {
      console.error("Error making file public:", error);
      return null;
    }
  }

  /**
   * Nettoie les anciens fichiers d'historique
   */
  async cleanupOldHistoryFiles(folderId: string, keepCount: number): Promise<void> {
    try {
      console.log(`Nettoyage des anciens fichiers d'historique, conservation des ${keepCount} plus récents`);
      const files = await this.listFilesInFolder(folderId);
      
      if (files.length <= keepCount) {
        console.log("Pas assez de fichiers pour nécessiter un nettoyage");
        return;
      }
      
      const filesToDelete = files.slice(keepCount);
      console.log(`${filesToDelete.length} fichiers à supprimer`);
      
      for (const file of filesToDelete) {
        await this.fetchWithAuth(
          `${this.BASE_URL}/files/${file.id}`,
          { method: 'DELETE' }
        );
        console.log(`Fichier supprimé: ${file.name} (ID: ${file.id})`);
      }
      
      console.log("Nettoyage terminé");
    } catch (error) {
      console.error("Erreur lors du nettoyage des fichiers d'historique:", error);
    }
  }

  /**
   * Récupère l'historique des sauvegardes pour une langue
   */
  async getHistoryFiles(languageCode: LanguageCode): Promise<{id: string, name: string, date: string}[]> {
    try {
      const folderId = await this.findOrCreateAppFolder();
      const langFolderName = `${languageCode}-history`;
      const langFolderId = await this.findOrCreateFolder(langFolderName, folderId);
      
      const files = await this.listFilesInFolder(langFolderId);
      
      return files.map(file => {
        // Extraire la date du nom de fichier (format: lang-YYYY-MM-DD-timestamp.json)
        const nameParts = file.name.split('-');
        let date = "Date inconnue";
        
        if (nameParts.length >= 3) {
          date = `${nameParts[1]}-${nameParts[2]}-${nameParts[3].split('.')[0]}`;
        }
        
        return {
          id: file.id,
          name: file.name,
          date: date
        };
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      return [];
    }
  }
}