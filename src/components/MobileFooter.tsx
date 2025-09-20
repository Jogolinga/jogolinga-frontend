// src/components/MobileFooter.tsx - Version avec thème
import React from 'react';
import { useTheme } from './ThemeContext';

interface MobileFooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ 
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
  const linkColor = theme === 'dark' ? '#60a5fa' : '#3b82f6';
  const separatorColor = theme === 'dark' ? '#64748b' : '#94a3b8';
  const contactColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  return (
    <footer style={{
      ...footerStyles,
      padding: '15px 20px 90px 20px', // Padding bottom pour éviter la navigation bottom
      textAlign: 'center',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Logo compact pour mobile */}
      <div style={{
        marginBottom: '12px'
      }}>
        <h4 style={{
          margin: '0 0 4px 0',
          color: titleColor,
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          JogoLinga
        </h4>
      </div>

      {/* Liens légaux en version compacte */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handlePrivacyClick}
          style={{
            background: 'none',
            border: 'none',
            color: linkColor,
            fontSize: '13px',
            padding: '6px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Confidentialité
        </button>
        
        <span style={{ 
          color: separatorColor, 
          fontSize: '13px' 
        }}>
          •
        </span>
        
        <button
          onClick={handleTermsClick}
          style={{
            background: 'none',
            border: 'none',
            color: linkColor,
            fontSize: '13px',
            padding: '6px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Conditions
        </button>
      </div>

      {/* Contact compact */}
      <div style={{
        fontSize: '11px',
        color: contactColor,
        lineHeight: '1.4'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          <a 
            href="mailto:ceddoshop@gmail.com" 
            style={{
              color: linkColor,
              textDecoration: 'none'
            }}
          >
            ceddoshop@gmail.com
          </a>
        </p>
        <p style={{ margin: '0' }}>
          © {new Date().getFullYear()} JogoLinga
        </p>
      </div>
    </footer>
  );
};

export default MobileFooter;
