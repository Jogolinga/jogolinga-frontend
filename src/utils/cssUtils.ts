// Ajoutez cette fonction utilitaire dans un fichier utils/cssUtils.ts

/**
 * Utilitaires pour la gestion centralisée du CSS
 */

/**
 * Applique la classe de centrage global à un élément DOM
 * @param element L'élément DOM à centrer
 */
export const applyGlobalCentering = (element: HTMLElement | null) => {
    if (!element) return;
    
    // Ajouter la classe de centrage global
    element.classList.add('centered-component-container');
    
    // Supprimer les propriétés de style qui pourraient interférer
    element.style.removeProperty('margin-top');
    element.style.removeProperty('margin-bottom');
    element.style.removeProperty('transform');
    
    // Assurer que les marges latérales sont automatiques
    element.style.marginLeft = 'auto';
    element.style.marginRight = 'auto';
  };
  
  /**
   * Hook React pour appliquer le centrage global à un élément référencé
   * @param ref Référence React à l'élément à centrer
   * @param dependencies Dépendances pour déclencher le recentrage
   */
  export const useGlobalCentering = (
    ref: React.RefObject<HTMLElement>, 
    dependencies: any[] = []
  ): void => {
    React.useEffect(() => {
      // Appliquer immédiatement
      applyGlobalCentering(ref.current);
      
      // Petit délai pour s'assurer que les transitions sont terminées
      const timeoutId = setTimeout(() => {
        applyGlobalCentering(ref.current);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);
  };
  
  /**
   * Nettoie les styles problématiques du body et du root
   */
  export const cleanRootStyles = (): void => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflowX = 'hidden';
    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.margin = '0';
      rootElement.style.padding = '0';
      rootElement.style.width = '100%';
      rootElement.style.display = 'flex';
      rootElement.style.flexDirection = 'column';
      rootElement.style.alignItems = 'center';
    }
  };
  
  /**
   * Détecte si l'application est en mode mobile
   */
  export const isMobileView = (): boolean => {
    return window.innerWidth <= 768;
  };
  
  /**
   * Applique la classe mobile-view au body si nécessaire
   */
  export const applyMobileViewClass = (): void => {
    if (isMobileView()) {
      document.body.classList.add('mobile-view');
    } else {
      document.body.classList.remove('mobile-view');
    }
  };
  export {};