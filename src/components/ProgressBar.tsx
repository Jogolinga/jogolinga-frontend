import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number;
  height?: number;
  showPercentage?: boolean;
  color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  height = 8, 
  showPercentage = true,
  color = '#60a5fa'
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(normalizedProgress * 100);
  
  return (
    <div className="level-progress-container">
      <div className="level-progress-stats">
        <div 
          className="level-progress-bar"
          style={{ height: `${height}px` }}
        >
          <div
            className="level-progress-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        {showPercentage && (
          <span className="level-progress-percentage">{percentage}%</span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;