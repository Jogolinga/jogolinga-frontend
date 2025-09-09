import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { AppMode } from '../types/types';

interface MascotProps {
  onClick?: () => void;
  onHelp?: () => void;
  currentCategory: AppMode;
}

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const MascotContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.3));
  }
`;

const MascotImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const SpeechBubble = styled.div<{ $show: boolean }>`
  position: absolute;
  left: 100%;
  top: 0;
  background-color: white;
  border: 2px solid #333;
  border-radius: 10px;
  padding: 10px;
  max-width: 200px;
  opacity: ${props => props.$show ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  z-index: 999;
  margin-left: 10px;

  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 20px;
    border-right: 10px solid #333;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }

  &::after {
    content: '';
    position: absolute;
    left: -7px;
    top: 22px;
    border-right: 8px solid white;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
  }
`;

const HelpModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;

const mascotTips: Record<AppMode, string[]> = {
  menu: [
    "Bienvenue dans l'app d'apprentissage du wolof !",
    "Cliquez sur 'apprendre' pour commencer votre apprentissage.",
    "N'oubliez pas de pratiquer chaque jour !",
    "Explorez les différents modes d'apprentissage !"
  ],
  learn: [
    "Prenez votre temps pour mémoriser chaque mot.",
    "Écoutez attentivement la prononciation.",
    "Essayez de créer des phrases avec les nouveaux mots.",
    "La répétition est la clé de l'apprentissage !",
    "N'hésitez pas à revenir sur les mots difficiles."
  ],
  review: [
    "La révision est la clé de l'apprentissage !",
    "N'hésitez pas à revoir les mots plusieurs fois.",
    "Utilisez les mots dans des contextes différents.",
    "Essayez de vous rappeler des mots sans les voir.",
    "Félicitations pour votre engagement dans la révision !"
  ],
  quiz: [
    "Prenez votre temps pour réfléchir avant de répondre.",
    "Apprenez de vos erreurs, c'est une opportunité de progresser !",
    "Concentrez-vous sur votre progression, pas sur le score.",
    "Chaque quiz vous rapproche de la maîtrise du wolof !"
  ],
  sentenceConstruction: [
    "Essayez de comprendre la structure de la phrase.",
    "Pratiquez ces phrases dans des conversations réelles.",
    "Chaque phrase construite renforce votre compréhension.",
    "N'hésitez pas à expérimenter avec différentes structures !"
  ],
  sentenceGap: [
    "C'est un excellent exercice pour comprendre l'usage des mots !",
    "Essayez de deviner le mot avant de voir les options.",
    "Cet exercice améliore votre intuition linguistique !"
  ],
  grammar: [
    "La grammaire est le squelette de la langue !",
    "Observez attentivement les structures grammaticales.",
    "Pratiquez régulièrement pour intégrer les règles naturellement.",
    "N'ayez pas peur de faire des erreurs, c'est ainsi qu'on apprend !"
  ],
  exercise: [
    "Ces exercices vous aideront à solidifier vos connaissances.",
    "Essayez différents types d'exercices pour progresser.",
    "La pratique régulière est la clé de la réussite !",
    "Alternez entre les différents niveaux de difficulté."
  ],

  progression: [
    "Visualisez votre parcours d'apprentissage !",
    "Découvrez vos points forts et ceux à améliorer.",
    "Les statistiques vous aident à mieux comprendre votre apprentissage.",
    "Félicitations pour vos progrès jusqu'ici !"
  ]

};

const helpContent: Record<AppMode, string> = {
  menu: "Bienvenue dans le menu principal ! Ici, vous pouvez choisir différents modes d'apprentissage du wolof.",
  learn: "Dans le mode d'apprentissage, vous découvrirez de nouveaux mots et expressions en wolof. Prenez votre temps pour les mémoriser.",
  review: "Le mode révision vous permet de revoir les mots que vous avez déjà appris. C'est essentiel pour renforcer votre mémoire !",
  quiz: "Testez vos connaissances avec des quiz ! N'hésitez pas à les refaire pour améliorer votre score.",
  sentenceConstruction: "Construisez des phrases en wolof pour pratiquer la structure de la langue.",
  sentenceGap: "Complétez les phrases avec les mots manquants pour améliorer votre compréhension du contexte.",
  grammar: "Apprenez les règles grammaticales du wolof pour parler correctement.",
  exercise: "Mode exercices : pratique variée avec différents types d'exercices adaptés à votre niveau.",
 progression: "Le mode statistiques vous permet de suivre votre progression, visualiser vos accomplissements et identifier les domaines à améliorer."

};

const Mascot: React.FC<MascotProps> = ({ 
  onClick, 
  onHelp, 
  currentCategory
}) => {
  const [tip, setTip] = useState<string>('');
  const [showTip, setShowTip] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const getRandomTip = useCallback(() => {
    const categoryTips = mascotTips[currentCategory] || mascotTips.menu;
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
  }, [currentCategory]);

  const displayNewTip = useCallback(() => {
    setTip(getRandomTip());
    setShowTip(true);
    setTimeout(() => setShowTip(false), 5000);
  }, [getRandomTip]);

  useEffect(() => {
    displayNewTip();
    const interval = setInterval(displayNewTip, 15000);
    return () => clearInterval(interval);
  }, [displayNewTip]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    displayNewTip();
  };

  const handleHelp = () => {
    if (onHelp) {
      onHelp();
    }
    setShowHelp(true);
  };

  return (
    <>
      <MascotContainer onClick={handleClick}>
        <MascotImage 
          src="/Mascotte/mascotte5.png" 
          alt="Mascotte"
        />
        <SpeechBubble $show={showTip}>
          {tip}
        </SpeechBubble>
      </MascotContainer>

      {showHelp && (
        <HelpModal>
          <CloseButton onClick={() => setShowHelp(false)}>&times;</CloseButton>
          <h2>Aide pour : {currentCategory}</h2>
          <p>{helpContent[currentCategory]}</p>
        </HelpModal>
      )}
    </>
  );
};

export default Mascot;