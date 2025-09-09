import React, { useState } from 'react';

type LanguageCode = 'wf' | 'ba' | 'la' | 'ff' | 'co'| 'sw';

interface CountryFlagProps {
  languageCode: LanguageCode;
  size?: number;
  className?: string;
  variant?: 'flag-only' | 'flag-text' | 'text-only';
  showFullName?: boolean;
}

// Configuration avec vos illustrations culturelles
const FLAG_CONFIG: Record<LanguageCode, {
  name: string;
  country: string;
  code: string;
  description: string;
  imageUrl: string; // Chemin vers vos images
  fallbackEmoji: string; // Emoji de secours
  color: string;
}> = {
  'wf': {
    name: 'Wolof',
    country: 'Sénégal',
    code: 'WF',
    description: 'Langue du Sénégal et de la Gambie',
    imageUrl: '/images/Wolof.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '👩🏿‍🦱',
    color: '#D2691E'
  },
  'ba': {
    name: 'Bambara', 
    country: 'Mali',
    code: 'BA',
    description: 'Langue principale du Mali',
    imageUrl: '/images/Bambara.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '🏺',
    color: '#CD853F'
  },
  'la': {
    name: 'Lingala',
    country: 'RDC',
    code: 'LA',
    description: 'Langue du bassin du Congo',
    imageUrl: '/images/Lingala.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '💃🏿',
    color: '#B8860B'
  },
  'ff': {
    name: 'Peul',
    country: 'Afrique de l\'Ouest',
    code: 'FF',
    description: 'Langue des pasteurs nomades',
    imageUrl: '/images/Peul.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '🐄',
    color: '#A0522D'
  },
  'co': {
    name: 'Copte',
    country: 'Égypte',
    code: 'CO',
    description: 'Langue liturgique d\'Égypte',
    imageUrl: '/images/Copte.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '✝️',
    color: '#DAA520'
  }, 
   'sw': {
    name: 'Swahili',
    country: 'Tanzanie',
    code: 'SW',
    description: 'Langue de la Tanzanie',
    imageUrl: '/images/Swahili.png', // ⚠️ Remplacez par votre chemin
    fallbackEmoji: '',
    color: '#DAA520'
  }
};

const CountryFlag: React.FC<CountryFlagProps> = ({ 
  languageCode,
  size = 48,
  className = '',
  variant = 'flag-only',
  showFullName = false
}) => {
  const config = FLAG_CONFIG[languageCode];
  const [imageError, setImageError] = useState(false);
  
  if (!config) return null;

  // Style pour l'image
  const imageStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'cover',
    borderRadius: '8px',
  };

  // Composant image avec fallback automatique
  const ImageComponent = () => {
    if (imageError) {
      // Fallback avec emoji et couleur de la culture
      return (
        <div 
          className="flex items-center justify-center bg-gradient-to-br rounded-lg shadow-md"
          style={{ 
            width: `${size}px`, 
            height: `${size}px`,
            fontSize: `${size * 0.4}px`,
            background: `linear-gradient(135deg, ${config.color}dd, ${config.color}aa)`
          }}
        >
          {config.fallbackEmoji}
        </div>
      );
    }

    return (
      <img
        src={config.imageUrl}
        alt={`Illustration ${config.name}`}
        style={imageStyle}
        onError={() => setImageError(true)}
        className="shadow-md hover:shadow-lg transition-shadow"
        loading="lazy"
      />
    );
  };

  const baseClasses = "inline-flex items-center justify-center";

  switch (variant) {
    case 'flag-only':
      return (
        <div
          className={`${baseClasses} ${className}`}
          title={`${config.name} - ${config.description}`}
        >
          <ImageComponent />
        </div>
      );
      
    case 'text-only':
      return (
        <span 
          className={`${baseClasses} font-medium ${className}`}
          title={`${config.name} - ${config.description}`}
        >
          {showFullName ? config.name : config.code}
        </span>
      );
      
    case 'flag-text':
      return (
        <div className={`${baseClasses} gap-3 ${className}`}>
          <ImageComponent />
          <div className="text-left">
            <div className="font-medium">
              {showFullName ? config.name : config.code}
            </div>
            {showFullName && (
              <div className="text-sm opacity-75">
                {config.country}
              </div>
            )}
          </div>
        </div>
      );
      
    default:
      return null;
  }
};

export default CountryFlag;

/* 
INSTRUCTIONS D'INTÉGRATION :

1. 📁 Placez vos 5 images dans le dossier /public/images/ :
   - wolof-illustration.jpg (votre image avec la femme et le baobab)
   - bambara-illustration.jpg (votre image avec la femme et la mosquée)
   - lingala-illustration.jpg (votre image avec l'homme dansant)
   - peul-illustration.jpg (votre image avec l'homme et les vaches)
   - copte-illustration.jpg (votre image avec l'homme écrivant)

2. 🔄 Remplacez votre CountryFlag.tsx actuel par ce fichier

3. 💻 Exemples d'utilisation (garde la même API) :

   // Dans le dropdown desktop
   <CountryFlag languageCode="wf" size={48} variant="flag-text" showFullName={true} />

   // Dans la grille mobile  
   <CountryFlag languageCode="wf" size={40} variant="flag-only" />

   // Dans les boutons de menu
   <CountryFlag languageCode="wf" size={32} variant="flag-text" showFullName={false} />

4. 🎨 Les variantes disponibles :
   - variant="flag-only" : Juste l'illustration (défaut)
   - variant="flag-text" : Illustration + nom de la langue
   - variant="text-only" : Juste le texte

5. 📱 Tailles recommandées :
   - Mobile : 32-40px
   - Desktop : 48-64px
   - Hero : 80px+

6. 🔄 Fallback automatique :
   Si les images ne chargent pas, des emojis culturels colorés s'affichent automatiquement.

7. 🎯 Aucun changement dans votre code existant nécessaire !
   Le composant garde la même interface que votre CountryFlag actuel.
*/