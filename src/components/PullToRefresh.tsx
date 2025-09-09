import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => void;
  children: ReactNode;
  pullDistance?: number;
  refreshThreshold?: number;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDistance = 100,
  refreshThreshold = 80
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Ne pas activer le pull to refresh si nous ne sommes pas au sommet de la page
    if (window.scrollY > 5) return;

    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Si on tire vers le bas
    if (diff > 0) {
      // Calculer un pourcentage de progression avec un effet de résistance
      const progress = Math.min(diff / pullDistance, 1);
      setPullProgress(progress);
      
      // Empêcher le comportement par défaut si on tire suffisamment
      if (diff > 10) {
        e.preventDefault();
      }
    } else {
      // Si on tire vers le haut, annuler
      setIsPulling(false);
      setPullProgress(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;

    if (pullProgress >= refreshThreshold / pullDistance) {
      // Déclencher le rafraîchissement
      setIsRefreshing(true);
      onRefresh();
      
      // Réinitialiser après un délai pour afficher l'animation
      setTimeout(() => {
        setIsRefreshing(false);
        setPullProgress(0);
        setIsPulling(false);
      }, 1000);
    } else {
      // Annuler le pull
      setPullProgress(0);
      setIsPulling(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative', height: '100%', overflow: 'visible' }}
    >
      {/* Indicateur de pull to refresh */}
      {(isPulling || isRefreshing) && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: `${pullProgress * pullDistance}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            transition: isRefreshing ? 'height 0.3s ease' : 'none',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {isRefreshing ? (
            <div className="refreshing-indicator">
              <div className="spinner"></div>
              <span>Rafraîchissement...</span>
            </div>
          ) : (
            <div className="pull-indicator" style={{ opacity: pullProgress }}>
              <span>Tirez pour revenir au menu {Math.round(pullProgress * 100)}%</span>
            </div>
          )}
        </div>
      )}

      {/* Contenu principal */}
      <div>{children}</div>

      <style>
        {`
        .refreshing-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 14px;
          color: #3b82f6;
        }
        
        .pull-indicator {
          font-size: 14px;
          color: #3b82f6;
        }
        
        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s linear infinite;
          margin-bottom: 8px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        `}
      </style>
    </div>
  );
};

export default PullToRefresh;