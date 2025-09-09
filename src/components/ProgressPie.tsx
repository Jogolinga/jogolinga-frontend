import React from 'react';

interface ProgressPieProps {
  progress: number;
  size?: number;
}

const ProgressPie: React.FC<ProgressPieProps> = ({ progress = 0, size = 40 }) => {
  // Validation de la progression pour éviter les NaN
  const validProgress = isNaN(progress) || progress < 0 ? 0 : 
                       progress > 1 ? 1 : progress;
  
  // Calculate the circle parameters
  const center = size / 2;
  const radius = (size / 2) * 0.8;
  const circumference = 2 * Math.PI * radius;
  
  // Convertir strokeDashoffset en chaîne pour éviter l'avertissement NaN
  const strokeDashoffset = String(circumference - (validProgress * circumference));
  
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#E5E7EB"
            strokeWidth={4}
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#3B82F6"
            strokeWidth={4}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-in-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
          {Math.round(validProgress * 100)}%
        </div>
      </div>
    </div>
  );
};

export default ProgressPie;