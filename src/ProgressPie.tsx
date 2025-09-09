import React from 'react';

interface ProgressPieProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
}

const ProgressPie: React.FC<ProgressPieProps> = ({ 
  progress = 0, 
  size = 40, 
  strokeWidth = 4 
}) => {
  // Gérer le cas où progress est NaN ou undefined
  const rawProgress = typeof progress === 'number' && !isNaN(progress) ? progress : 0;
  
  // Normaliser la progression entre 0 et 1
  const normalizedProgress = Math.min(Math.max(rawProgress, 0), 1);
  
  // Calculer les dimensions
  const safeSize = Math.max(strokeWidth * 2, size); // Éviter les tailles trop petites
  const radius = (safeSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculer le décalage du trait (strokeDashoffset)
  const strokeDashoffset = circumference - normalizedProgress * circumference;

  // S'assurer que le strokeDashoffset est un nombre valide
  const safeStrokeDashoffset = isNaN(strokeDashoffset) ? circumference : strokeDashoffset;

  // Calculer une taille de police proportionnelle mais avec une limite minimale
  const fontSize = Math.max(safeSize / 4, 8);

  return (
    <svg
      width={safeSize}
      height={safeSize}
      viewBox={`0 0 ${safeSize} ${safeSize}`}
      style={{ transform: 'rotate(-90deg)' }}
      role="progressbar"
      aria-valuenow={Math.round(normalizedProgress * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Cercle de fond */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth={strokeWidth}
      />
      {/* Cercle de progression */}
      <circle
        cx={safeSize / 2}
        cy={safeSize / 2}
        r={radius}
        fill="none"
        stroke="#4caf50"
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={safeStrokeDashoffset}
        strokeLinecap="round"
      />
      {/* Texte de pourcentage */}
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        fill="#333"
        fontSize={fontSize}
        style={{ 
          transform: 'rotate(90deg)', 
          transformOrigin: 'center',
          userSelect: 'none'
        }}
      >
        {`${Math.round(normalizedProgress * 100)}%`}
      </text>
    </svg>
  );
};

export default React.memo(ProgressPie);