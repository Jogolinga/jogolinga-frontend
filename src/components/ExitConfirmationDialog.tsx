// ConfirmationModal.tsx - Version complète et finale
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Gérer la fermeture avec Escape
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll en arrière-plan
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  // Gérer le clic sur l'overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Styles responsifs
  const getModalStyles = () => {
    const baseStyles = {
      backgroundColor: '#ffffff',
      color: '#1e293b',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '24px',
      width: '100%',
      maxWidth: '450px',
      maxHeight: '80vh',
      overflow: 'auto',
      margin: '16px',
    };

    // Ajustements pour mobile
    if (window.innerWidth <= 768) {
      return {
        ...baseStyles,
        maxWidth: '90vw',
        margin: '16px',
        padding: '20px'
      };
    }

    return baseStyles;
  };

  const getOverlayStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: position === 'center' ? 'center' : 'flex-start',
      paddingTop: position === 'top' ? '80px' : '0'
    };

    return baseStyles;
  };

  const getButtonStyles = (type: 'cancel' | 'confirm') => {
    const baseStyles = {
      border: 'none',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '500' as const,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '100px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
      textDecoration: 'none'
    };

    if (type === 'cancel') {
      return {
        ...baseStyles,
        backgroundColor: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db'
      };
    } else {
      return {
        ...baseStyles,
        backgroundColor: confirmButtonStyle === 'danger' ? '#dc2626' : '#3b82f6',
        color: 'white'
      };
    }
  };

  const handleCancelHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    if (isHover) {
      e.currentTarget.style.backgroundColor = '#e5e7eb';
    } else {
      e.currentTarget.style.backgroundColor = '#f3f4f6';
    }
  };

  const handleConfirmHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    if (confirmButtonStyle === 'danger') {
      e.currentTarget.style.backgroundColor = isHover ? '#b91c1c' : '#dc2626';
    } else {
      e.currentTarget.style.backgroundColor = isHover ? '#2563eb' : '#3b82f6';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={getOverlayStyles()}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div 
            style={getModalStyles()}
            onClick={(e) => e.stopPropagation()}
            initial={{ 
              opacity: 0, 
              scale: 0.9, 
              y: position === 'top' ? -50 : 0 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9, 
              y: position === 'top' ? -30 : 20 
            }}
            transition={{ 
              duration: 0.3, 
              type: "spring", 
              damping: 25, 
              stiffness: 300 
            }}
          >
            {/* Titre avec icône */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: confirmButtonStyle === 'danger' ? '#dc2626' : '#1e293b'
            }}>
              <span style={{ fontSize: '20px' }}>
                {confirmButtonStyle === 'danger' ? '⚠️' : 'ℹ️'}
              </span>
              {title}
            </div>
            
            {/* Message */}
            <div style={{
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '24px',
              color: '#374151'
            }}>
              {message}
            </div>
            
            {/* Boutons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={onCancel}
                style={getButtonStyles('cancel')}
                onMouseEnter={(e) => handleCancelHover(e, true)}
                onMouseLeave={(e) => handleCancelHover(e, false)}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                style={getButtonStyles('confirm')}
                onMouseEnter={(e) => handleConfirmHover(e, true)}
                onMouseLeave={(e) => handleConfirmHover(e, false)}
                onFocus={(e) => {
                  const color = confirmButtonStyle === 'danger' ? 'rgba(220, 38, 38, 0.5)' : 'rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${color}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;