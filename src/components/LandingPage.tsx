import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeContext';
import GoogleAuth from './GoogleAuth';
import './LandingPage.css';

interface LandingPageProps {
  onLogin: (response: any) => void;
  onContinueAsGuest: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onContinueAsGuest }) => {
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Animation de montage du composant
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoginSuccess = (response: any) => {
    setIsLoading(true);
    
    // Appeler le gestionnaire fourni par le parent
    onLogin(response);
    
    // Ajouter un délai pour simuler le chargement et ensuite passer à l'application principale
    setTimeout(() => {
      setIsLoading(false);
      // Ici, on passe à l'application principale
      onContinueAsGuest(); // Réutilisation de la même fonction pour continuer
    }, 1000);
  };

  // Variants d'animation pour Framer Motion avec thème ocre
  const containerVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const logoVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      rotate: -10
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100
      }
    }
  };

  const buttonVariants = {
    initial: { 
      opacity: 0, 
      y: 10 
    },
    animate: { 
      opacity: 1, 
      y: 0 
    },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98 
    }
  };

  const featureVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className={`landing-page ${theme}`}>
      <div className="landing-container">
        <motion.div 
          className="landing-content"
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
        >
          {/* Logo et titre avec animations */}
          <motion.div 
            className="logo-container"
            variants={itemVariants}
          >
            <motion.img 
              src="/assets/logo.jpg" 
              alt="JogoLinga Logo" 
              className="landing-logo"
              variants={logoVariants}
              whileHover={{ 
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.3 }
              }}
            />
            <motion.h1 
              className="app-title"
              variants={itemVariants}
            >
              JogoLinga
            </motion.h1>
          </motion.div>
          
          {/* Description avec animation */}
          <motion.p 
            className="app-description"
            variants={itemVariants}
          >
            Apprenez des langues africaines de manière interactive et ludique. 
            Progressez à votre rythme avec des exercices variés.
          </motion.p>
          
          {/* Conteneur d'authentification avec animations */}
          <motion.div 
            className="authentication-container"
            variants={itemVariants}
          >
            <div className="auth-option">
              <motion.h3
                variants={itemVariants}
              >
                Se connecter avec
              </motion.h3>
              <div className="auth-buttons">
                <motion.div 
                  className="landing-google-btn"
                  variants={buttonVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <GoogleAuth 
                    onLogin={handleLoginSuccess} 
                    onLogout={() => {}} 
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Séparateur avec animation */}
            <motion.div 
              className="auth-separator"
              variants={itemVariants}
            >
              <span>ou</span>
            </motion.div>
            
            {/* Bouton invité avec animations améliorées */}
            <motion.button 
              className="guest-button"
              onClick={onContinueAsGuest}
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
            >
              Continuer sans compte
            </motion.button>
          </motion.div>
          
          {/* Fonctionnalités de l'app avec animations échelonnées */}
          <motion.div 
            className="app-features"
            variants={itemVariants}
          >
            {[
              { icon: "📚", text: "Vocabulaire interactif" },
              { icon: "🔄", text: "Révision intelligente" },
              { icon: "🎮", text: "Apprentissage ludique" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="feature"
                custom={index}
                variants={featureVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="feature-icon"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  {feature.icon}
                </motion.div>
                <span>{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Overlay de chargement avec animations */}
      {isLoading && (
        <motion.div 
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Chargement de votre espace...
          </motion.p>
        </motion.div>
      )}
      
      {/* Bouton de thème avec animations */}
      <motion.div 
        className="theme-toggle" 
        onClick={toggleTheme}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        whileHover={{ 
          scale: 1.1,
          rotate: 15,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          key={theme} // Re-render l'icône quand le thème change
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default LandingPage;