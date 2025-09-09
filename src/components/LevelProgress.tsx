import React from 'react';
import ProgressPie from './ProgressPie';

interface LevelProgressProps {
  learnedWordsCount: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ learnedWordsCount }) => {
  // Système de niveaux : chaque niveau nécessite 10 mots de plus que le précédent
  const calculateLevel = (words: number) => {
    // Formule pour calculer le niveau actuel basé sur le nombre de mots
    // Niveau 1: 0-10 mots
    // Niveau 2: 11-30 mots
    // Niveau 3: 31-60 mots, etc.
    const level = Math.floor(Math.sqrt(words / 5)) + 1;
    
    // Calcul des mots requis pour ce niveau
    const wordsForCurrentLevel = Math.pow(level - 1, 2) * 5;
    const wordsForNextLevel = Math.pow(level, 2) * 5;
    
    // Calcul de la progression vers le prochain niveau
    const progressToNextLevel = (words - wordsForCurrentLevel) / 
      (wordsForNextLevel - wordsForCurrentLevel);

    return {
      level,
      progress: progressToNextLevel,
      wordsForNextLevel,
      remainingWords: wordsForNextLevel - words
    };
  };

  const levelInfo = calculateLevel(learnedWordsCount);

  // Badges pour chaque niveau
  const badges = {
    1: "🌱", // Débutant
    2: "🌿", // Apprenti
    3: "🌲", // Intermédiaire
    4: "🌳", // Avancé
    5: "🌺", // Expert
    6: "👑"  // Maître
  };

  const badge = badges[Math.min(levelInfo.level, 6) as keyof typeof badges];

  return (
    <div className="flex items-center space-x-4 bg-white rounded-lg p-3 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-1">{badge}</div>
        <div className="text-xl font-bold text-blue-600">
          Niveau {levelInfo.level}
        </div>
      </div>
      
      <div className="h-14 w-14">
        <ProgressPie 
          progress={levelInfo.progress} 
          size={56}
        />
      </div>
      
      <div className="flex flex-col">
        <div className="text-sm text-gray-600">
          {learnedWordsCount} mots appris
        </div>
        <div className="text-xs text-gray-500">
          {levelInfo.remainingWords} mots avant niveau {levelInfo.level + 1}
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;

export {}; 