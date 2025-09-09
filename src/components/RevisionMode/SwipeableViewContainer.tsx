import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './SwipeableViewContainer.css';

export type ViewMode = 'list' | 'calendar' | 'stats' | 'achievements';

interface SwipeableViewContainerProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  children: React.ReactNode;
  theme?: string;
}

const SwipeableViewContainer: React.FC<SwipeableViewContainerProps> = ({
  viewMode,
  setViewMode,
  children,
  theme = 'light'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Définir l'ordre des vues
  const viewModes: ViewMode[] = ['list', 'calendar', 'stats', 'achievements'];
  
  // Titres et icônes des vues
  const viewInfo = {
    list: { title: 'Liste', icon: '📋' },
    calendar: { title: 'Dates', icon: '📅' },
    stats: { title: 'Stats', icon: '📊' },
    achievements: { title: 'Succès', icon: '🏆' }
  };

  // Mettre à jour l'index quand viewMode change
  useEffect(() => {
    const index = viewModes.indexOf(viewMode);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [viewMode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Limiter le déplacement au début et à la fin
    if ((currentIndex === 0 && diff > 0) || 
        (currentIndex === viewModes.length - 1 && diff < 0)) {
      setDragOffset(diff / 3); // Résistance accrue aux extrémités
    } else {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!startX || !isDragging) return;
    
    const threshold = 80; // Seuil de déplacement pour changer de vue
    
    if (dragOffset > threshold && currentIndex > 0) {
      // Swipe vers la droite -> vue précédente
      navigateTo(currentIndex - 1);
    } else if (dragOffset < -threshold && currentIndex < viewModes.length - 1) {
      // Swipe vers la gauche -> vue suivante
      navigateTo(currentIndex + 1);
    }
    
    // Réinitialiser l'état
    setStartX(null);
    setIsDragging(false);
    setDragOffset(0);
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < viewModes.length) {
      setCurrentIndex(index);
      setViewMode(viewModes[index]);
    }
  };

  return (
    <div className={`swipeable-container ${theme}`}>
      {/* Indicateur de pagination et titre */}
      <div className="swipeable-header">
        <div className="swipeable-tabs">
          {viewModes.map((mode, index) => (
            <button
              key={mode}
              className={`swipeable-tab ${index === currentIndex ? 'active' : ''}`}
              onClick={() => navigateTo(index)}
            >
              <span className="tab-icon">{viewInfo[mode].icon}</span>
              <span className="tab-label">{viewInfo[mode].title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de contenu swipeable */}
      <div 
        ref={containerRef}
        className="swipeable-content-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div 
          className="swipeable-content"
          animate={{ 
            x: isDragging 
              ? -currentIndex * 100 + (dragOffset / containerRef.current?.clientWidth || 1) * 100
              : -currentIndex * 100 + '%'
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            duration: isDragging ? 0 : 0.3
          }}
        >
          {/* Chaque vue est un enfant direct du conteneur */}
          {React.Children.map(children, (child, index) => (
            <div className="swipeable-view">
              {child}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Boutons de navigation */}
      <div className="swipeable-navigation">
        <button 
          className="nav-button prev"
          onClick={() => navigateTo(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={20} />
        </button>

        <div className="pagination-dots">
          {viewModes.map((_, index) => (
            <div 
              key={index}
              className={`pagination-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => navigateTo(index)}
            />
          ))}
        </div>

        <button 
          className="nav-button next"
          onClick={() => navigateTo(currentIndex + 1)}
          disabled={currentIndex === viewModes.length - 1}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default SwipeableViewContainer;