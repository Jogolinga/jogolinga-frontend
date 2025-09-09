// Créez un fichier src/types/gapi.d.ts avec ce contenu
declare namespace gapi {
    namespace auth2 {
      function getAuthInstance(): {
        isSignedIn: {
          get(): boolean;
          listen(callback: (signedIn: boolean) => void): void;
        };
        currentUser: {
          get(): {
            getBasicProfile(): any;
            getAuthResponse(includeAuthorizationData?: boolean): {
              access_token: string;
              id_token: string;
              expires_at: number;
              expires_in: number;
              scope: string;
            };
            reloadAuthResponse(): Promise<any>;
          };
        };
        signIn(): Promise<any>;
        signOut(): Promise<any>;
      };
      function init(params: any): Promise<any>;
    }
    
    function load(apiName: string, callback: () => void): void;
    
    namespace client {
      function init(params: any): Promise<any>;
    }
  }
  
  interface Window {
    gapi: typeof gapi;
  }