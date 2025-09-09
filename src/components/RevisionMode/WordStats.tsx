import React from 'react';
import { WordData, WordProgress } from '../../types/types';
import './WordStats.css';

interface WordStatsProps {
  word: string;
  category: string;
  wordData: WordData;
  getWordProgress: (word: string, category?: string) => WordProgress;
}

const WordStats: React.FC<WordStatsProps> = ({ 
  word, 
  category, 
  wordData, 
  getWordProgress 
}) => {
  const progress = getWordProgress(word, category);

  const getNextReviewTime = (nextReview: number) => {
    if (!nextReview) return "Pas encore programmé";
    const now = Date.now();
    if (nextReview <= now) return "Disponible maintenant";
    
    const diff = nextReview - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
    return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
  };

  const getMasteryLevel = (progress: WordProgress) => {
    const ratio = progress.correct / (progress.tested || 1);
    if (ratio >= 0.8) return "Excellent";
    if (ratio >= 0.6) return "Bon";
    if (ratio >= 0.4) return "Moyen";
    return "À revoir";
  };

  return (
    <div className="word-stats-card">
      <div className="word-stats-header">
        <span className="word-original">{word}</span>
        <span className="word-translation">{wordData.translation}</span>
      </div>
      <div className="word-stats-content">
        <div className="stats-row">
          <span>Niveau de maîtrise:</span>
          <span className={`mastery-level ${getMasteryLevel(progress).toLowerCase()}`}>
            {getMasteryLevel(progress)}
          </span>
        </div>
        <div className="stats-row">
          <span>Nombre de révisions:</span>
          <span>{progress.tested || 0}</span>
        </div>
        <div className="stats-row">
          <span>Taux de réussite:</span>
          <span>{Math.round((progress.correct / (progress.tested || 1)) * 100)}%</span>
        </div>
        <div className="stats-row">
          <span>Prochaine révision:</span>
          <span>{getNextReviewTime(progress.nextReview)}</span>
        </div>
      </div>
    </div>
  );
};

export default WordStats;
