// src/components/Footer.tsx - Version corrigée
import React from 'react';

interface FooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  onNavigateToPrivacy, 
  onNavigateToTerms 
}) => {
  const handlePrivacyClick = () => {
    if (onNavigateToPrivacy) {
      onNavigateToPrivacy();
    } else {
      // Fallback: naviguer directement
      window.location.href = '/privacy';
    }
  };

  const handleTermsClick = () => {
    if (onNavigateToTerms) {
      onNavigateToTerms();
    } else {
      // Fallback: naviguer directement
      window.location.href = '/terms';
    }
  };

  return (
    <footer style={{
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '20px 0',
      textAlign: 'center',
      marginTop: 'auto',
      borderTop: '1px solid #374151',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Logo et nom de l'application */}
        <div style={{
          marginBottom: '16px'
        }}>
          <h3 style={{
            margin: '0 0 8px 0',
            color: '#f8fafc',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            JogoLinga
          </h3>
          <p style={{
            margin: '0',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Plateforme d'apprentissage de langues africaines
          </p>
        </div>

        {/* Liens légaux */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handlePrivacyClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = '#93c5fd';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = '#60a5fa';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Politique de confidentialité
          </button>
          
          <button
            onClick={handleTermsClick}
            style={{
              background: 'none',
              border: 'none',
              color: '#60a5fa',
              textDecoration: 'none',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = '#93c5fd';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = '#60a5fa';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Conditions d'utilisation
          </button>
        </div>

        {/* Contact et copyright */}
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 4px 0' }}>
            Contact : <a 
              href="mailto:ceddoshop@gmail.com" 
              style={{
                color: '#60a5fa',
                textDecoration: 'none'
              }}
            >
              ceddoshop@gmail.com
            </a>
          </p>
          <p style={{ margin: '0' }}>
            © {new Date().getFullYear()} JogoLinga. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
