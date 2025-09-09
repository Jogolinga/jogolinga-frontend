// src/components/SwipeNavigationManager.tsx
import React, { useRef, useEffect, useState } from 'react';
import { AppMode } from '../types/types';
import { ArrowLeft } from 'lucide-react';
import './SwipeNavigationManager.css';

interface SwipeNavigationManagerProps {
  children: React.ReactNode;
  mode: AppMode;
  selectedCategory: string | null;
  setShowExitConfirmation: (show: boolean) => void;
  onNavigateBack: () => void;
}

const SwipeNavigationManager: React.FC<SwipeNavigationManagerProps> = ({
  children,
  mode,
  selectedCategory,
  setShowExitConfirmation,
  onNavigateBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [swipeProgress, setSwipeProgress] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);
  
  // Paramètres pour une meilleure sensibilité
  const thresholdDistance = 60; // Seuil réduit pour déclencher l'action
  const maxVerticalDeviation = 60; // Déviation verticale tolérée
  const edgeDetectionWidth = 100; // Zone de détection élargie depuis le bord gauche

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        
        // Détecter si le toucher commence près du bord
        if (startX.current < edgeDetectionWidth) {
          container.classList.add('swipe-detecting');
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX.current;
      const deltaY = Math.abs(currentY - startY.current);
      
      // Si le swipe est horizontal et commence près du bord
      if (deltaX > 10 && deltaY < maxVerticalDeviation && startX.current < edgeDetectionWidth) {
        // Empêcher le scroll de page
        e.preventDefault();
        
        // Calculer la progression du swipe
        const progress = Math.min(1, deltaX / thresholdDistance);
        setSwipeProgress(progress);
        
        // Indiquer que le swipe est en cours
        if (deltaX > 20) {
          setIsSwiping(true);
          container.classList.add('swiping');
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (startX.current === null || startY.current === null) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX.current;
      const deltaY = Math.abs(endY - startY.current);

      // Vérifier si le swipe est suffisant pour déclencher l'action
      if (deltaX > thresholdDistance && deltaY < maxVerticalDeviation && startX.current < edgeDetectionWidth) {
        handleContextualBack();
      }

      // Réinitialiser tout
      container.classList.remove('swiping', 'swipe-detecting');
      setIsSwiping(false);
      setSwipeProgress(0);
      startX.current = null;
      startY.current = null;
    };

    const handleContextualBack = () => {
      // Navigation contextuelle selon le mode actuel
      if (mode === 'learn' && selectedCategory) {
        const summaryScreen = document.querySelector('.learn-mode-summary-title');
        if (summaryScreen) {
          // En mode résumé, navigation directe
          onNavigateBack();
        } else {
          // En mode apprentissage, demander confirmation
          setShowExitConfirmation(true);
        }
      } 
      else if (mode === 'sentenceConstruction') {
        // Vérifier si session active en construction de phrases
        const isActiveSession = 
          document.querySelector('.modern-construction-area') !== null || 
          document.querySelector('.modern-preview-container') !== null;
        
        if (isActiveSession) {
          setShowExitConfirmation(true);
        } else {
          onNavigateBack();
        }
      }
      else {
        // Pour les autres modes, navigation standard
        onNavigateBack();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mode, selectedCategory, onNavigateBack, setShowExitConfirmation]);

  // Ajouter aussi un bouton flottant en bas pour les cas où le swipe est moins pratique
  const showFloatingButton = mode !== 'menu';

  return (
    <div ref={containerRef} className="swipe-navigation-container">
      {children}
      
      {/* Indicateur de swipe amélioré */}
      {isSwiping && (
        <div className="swipe-indicator-overlay">
          <div className="swipe-indicator">
            <div className="swipe-arrow">←</div>
            <div className="swipe-message">Retour</div>
            <div className="swipe-progress-track">
              <div 
                className="swipe-progress-fill" 
                style={{ width: `${swipeProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
      
      
      
    </div>
  );
};

export default SwipeNavigationManager;