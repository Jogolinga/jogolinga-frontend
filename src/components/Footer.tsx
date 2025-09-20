// src/components/Footer.tsx - Version avec thème
import React from 'react';
import { useTheme } from './ThemeContext';

interface FooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

const Footer: React.FC<FooterProps> = ({ 
  onNavigateToPrivacy, 
  onNavigateToTerms 
}) => {
  const { theme } = useTheme();

  const handlePrivacyClick = () => {
    if (onNavigateToPrivacy) {
      onNavigateToPrivacy();
    } else {
      window.location.href = '/privacy';
    }
  };

  const handleTermsClick = () => {
    if (onNavigateToTerms) {
      onNavigateToTerms();
    } else {
      window.location.href = '/terms';
    }
  };

  // Styles basés sur le thème
  const footerStyles = {
    backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
    color: theme === 'dark' ? '#e2e8f0' : '#334155',
    borderTop: `1px solid ${theme === 'dark' ? '#374151' : '#e2e8f0'}`
  };

  const titleColor = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const subtitleColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const linkColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  const linkHoverColor = theme === 'dark' ? '#93c5fd' : '#1d4ed8';
  const contactColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <footer style={{
      ...footerStyles,
      padding: '20px 0',
      textAlign: 'center',
      marginTop: 'auto',
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
            color: titleColor,
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            JogoLinga
          </h3>
          <p style={{
            margin: '0',
            color: subtitleColor,
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
              color: linkColor,
              textDecoration: 'none',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = linkHoverColor;
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = linkColor;
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
              color: linkColor,
              textDecoration: 'none',
              fontSize: '14px',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = linkHoverColor;
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = linkColor;
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Conditions d'utilisation
          </button>
        </div>

        {/* Contact et copyright */}
        <div style={{
          fontSize: '12px',
          color: contactColor,
          lineHeight: '1.5'
        }}>
          <p style={{ margin: '0 0 4px 0' }}>
            Contact : <a 
              href="mailto:ceddoshop@gmail.com" 
              style={{
                color: linkColor,
                textDecoration: 'none'
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = linkHoverColor;
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.color = linkColor;
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
