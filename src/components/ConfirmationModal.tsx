// ConfirmationModal.tsx - Version avec injection directe dans le DOM
import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  title?: string;
  position?: 'center' | 'top';
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  message,
  title = "Confirmation requise",
  position = 'center',
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmButtonStyle = 'primary'
}) => {
  const modalIdRef = React.useRef<string>(`modal-${Date.now()}`);

  React.useEffect(() => {
    if (isOpen) {
      console.log('🚀 MODAL DIRECT - Création du modal dans le DOM');
      
      // Supprimer les anciens modals
      const existingModals = document.querySelectorAll('[data-modal-type="confirmation"]');
      existingModals.forEach(modal => modal.remove());

      // Créer le HTML du modal
      const modalHTML = `
        <div 
          id="${modalIdRef.current}"
          data-modal-type="confirmation"
          style="
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: rgba(0, 0, 0, 0.8) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            pointer-events: all !important;
            visibility: visible !important;
            opacity: 1 !important;
          "
        >
          <div 
            style="
              background-color: #ffffff !important;
              color: #1e293b !important;
              border-radius: 16px !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
              padding: 24px !important;
              width: 90% !important;
              max-width: 400px !important;
              max-height: 80vh !important;
              overflow: auto !important;
              position: relative !important;
              box-sizing: border-box !important;
              z-index: 2147483647 !important;
            "
            onclick="event.stopPropagation()"
          >
            <!-- Titre -->
            <div style="
              display: flex !important;
              align-items: center !important;
              gap: 12px !important;
              font-size: 18px !important;
              font-weight: bold !important;
              margin-bottom: 16px !important;
              color: ${confirmButtonStyle === 'danger' ? '#dc2626' : '#1e293b'} !important;
              line-height: 1.3 !important;
            ">
              <span style="font-size: 24px !important;">
                ${confirmButtonStyle === 'danger' ? '⚠️' : 'ℹ️'}
              </span>
              ${title}
            </div>
            
            <!-- Message -->
            <div style="
              font-size: 16px !important;
              line-height: 1.5 !important;
              margin-bottom: 24px !important;
              color: #374151 !important;
            ">
              ${message}
            </div>
            
            <!-- Boutons -->
            <div style="
              display: flex !important;
              gap: 12px !important;
              justify-content: flex-end !important;
              flex-direction: ${window.innerWidth < 768 ? 'column-reverse' : 'row'} !important;
            ">
              <button
                id="${modalIdRef.current}-cancel"
                style="
                  background-color: #f3f4f6 !important;
                  color: #374151 !important;
                  border: 1px solid #d1d5db !important;
                  border-radius: 12px !important;
                  padding: 14px 24px !important;
                  font-size: 16px !important;
                  font-weight: 500 !important;
                  cursor: pointer !important;
                  min-width: ${window.innerWidth < 768 ? '100%' : '120px'} !important;
                  min-height: 48px !important;
                  outline: none !important;
                "
              >
                ${cancelText}
              </button>
              <button
                id="${modalIdRef.current}-confirm"
                style="
                  background-color: ${confirmButtonStyle === 'danger' ? '#dc2626' : '#3b82f6'} !important;
                  color: white !important;
                  border: none !important;
                  border-radius: 12px !important;
                  padding: 14px 24px !important;
                  font-size: 16px !important;
                  font-weight: 600 !important;
                  cursor: pointer !important;
                  min-width: ${window.innerWidth < 768 ? '100%' : '120px'} !important;
                  min-height: 48px !important;
                  outline: none !important;
                "
              >
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      `;

      // Injecter dans le DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);

      // Ajouter les event listeners
      const modalElement = document.getElementById(modalIdRef.current);
      const cancelButton = document.getElementById(`${modalIdRef.current}-cancel`);
      const confirmButton = document.getElementById(`${modalIdRef.current}-confirm`);

      const handleOverlayClick = (e: Event) => {
        if (e.target === modalElement) {
          console.log('🖱️ MODAL DIRECT - Clic sur overlay');
          onCancel();
        }
      };

      const handleCancelClick = () => {
        console.log('🚀 MODAL DIRECT - Cancel clicked');
        onCancel();
      };

      const handleConfirmClick = () => {
        console.log('🚀 MODAL DIRECT - Confirm clicked');
        onConfirm();
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onCancel();
        }
      };

      modalElement?.addEventListener('click', handleOverlayClick);
      cancelButton?.addEventListener('click', handleCancelClick);
      confirmButton?.addEventListener('click', handleConfirmClick);
      document.addEventListener('keydown', handleEscape);

      // Bloquer le scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = '0';

      console.log('✅ MODAL DIRECT - Modal injecté dans le DOM');
      console.log('📍 MODAL DIRECT - Element trouvé:', !!modalElement);

      return () => {
        console.log('🗑️ MODAL DIRECT - Nettoyage');
        
        // Retirer les event listeners
        modalElement?.removeEventListener('click', handleOverlayClick);
        cancelButton?.removeEventListener('click', handleCancelClick);
        confirmButton?.removeEventListener('click', handleConfirmClick);
        document.removeEventListener('keydown', handleEscape);
        
        // Supprimer l'élément
        modalElement?.remove();
        
        // Restaurer le scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.top = '';
      };
    }
  }, [isOpen, onCancel, onConfirm, message, title, confirmText, cancelText, confirmButtonStyle]);

  // Ce composant ne rend rien via React, tout est géré via le DOM direct
  return null;
};

export default ConfirmationModal;