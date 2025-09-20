import React from 'react';

interface MobileFooterProps {
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({ 
  onNavigateToPrivacy, 
  onNavigateToTerms 
}) => {
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

  return (
    <footer style={{
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      padding: '15px 20px 90px 20px', // Padding bottom pour éviter la navigation bottom
      textAlign: 'center',
      marginTop: 'auto',
      borderTop: '1px solid #374151',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Logo compact pour mobile */}
      <div style={{
        marginBottom: '12px'
      }}>
        <h4 style={{
          margin: '0 0 4px 0',
          color: '#f8fafc',
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
            color: '#60a5fa',
            fontSize: '13px',
            padding: '6px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Confidentialité
        </button>
        
        <span style={{ color: '#64748b', fontSize: '13px' }}>•</span>
        
        <button
          onClick={handleTermsClick}
          style={{
            background: 'none',
            border: 'none',
            color: '#60a5fa',
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
        color: '#64748b',
        lineHeight: '1.4'
      }}>
        <p style={{ margin: '0 0 4px 0' }}>
          <a 
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
          © {new Date().getFullYear()} JogoLinga
        </p>
      </div>
    </footer>
  );
};

export default MobileFooter;
