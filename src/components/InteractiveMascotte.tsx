import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled, { keyframes } from 'styled-components';
import { AppMode, LanguageCode } from '../types/types';
import { useTheme } from './ThemeContext';

interface MascotProps {
  onClick?: () => void;
  onHelp?: () => void;
  currentCategory: AppMode;
  streak?: number;
  lastAnswerCorrect?: boolean | null;
  languageCode?: LanguageCode;
  userName?: any;
}

// Animation de rebondissement pour la mascotte
const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

// Messages d'encouragement avec placeholders pour le nom d'utilisateur
const encouragementMessages = {
  correct: [
    "Bravo {name} ! 👍",
    "Super {name} !",
    "Tu progresses bien {name} !",
    "Continue comme ça {name} !",
    "Excellent {name} !"
  ],
  streak: [
    "Quelle série {name} ! 🔥",
    "{name}, tu es en forme aujourd'hui !",
    "Incroyable {name} !",
    "Fantastique {name} !"
  ],
  wrong: [
    "Pas grave {name}, continue ! 💪",
    "{name}, essaie encore !",
    "{name}, tu vas y arriver !",
    "Chaque erreur t'aide à apprendre {name} !"
  ],
  comeback: [
    "Belle reprise {name} ! 🚀",
    "Voilà {name}, c'est mieux !",
    "{name}, tu rebondis bien !"
  ]
};

// Définir un type pour les clés de salutation pour éviter les erreurs TS
type GreetingKey = 'hello' | 'welcome' | 'goodJob' | 'continue';

// Salutations spécifiques à la langue avec types corrects
const languageGreetings: Record<LanguageCode, Record<GreetingKey, string>> = {
  'wf': {
    hello: "Salamalekoum {name} !",
    welcome: "Dalal ak jamm {name} !",
    goodJob: "Rafetna {name} !",
    continue: "Kontine {name} !",
  },
  'ba': {
    hello: "I ni cé {name} !",
    welcome: "Bisimila {name} !",
    goodJob: "I ye baara kè {name} !",
    continue: "Taa {name} !",
  },
  'la': {
    hello: "Mbote {name} !",
    welcome: "Boyei malamu {name} !",
    goodJob: "Malamu mingi {name} !",
    continue: "Bokoba {name} !",
  },
  'ff': {
    hello: "Jam waali {name} !",
    welcome: "A jaraama {name} !",
    goodJob: "Ko moƴƴi {name} !",
    continue: "Jokku {name} !",
  },
  'co': {
    hello: "Shahri {name} !",
    welcome: "Kalos irthes {name} !",
    goodJob: "Mēt anok {name} !",
    continue: "Sok {name} !",
  },
   'sw': {
    hello: "Shahri {name} !",
    welcome: "Kalos irthes {name} !",
    goodJob: "Mēt anok {name} !",
    continue: "Sok {name} !",
  }
};

// Noms des langues pour l'affichage
const languageNames: Record<LanguageCode, string> = {
  'wf': 'wolof',
  'ba': 'bambara',
  'la': 'lingala',
  'ff': 'peul',
  'co': 'copte',
  'sw': 'swahili'

};

// Messages explicatifs par type de jeu
const categoryExplanations: Record<AppMode, string[]> = {
  menu: [
    "Choisis une activité pour apprendre !",
    "Que veux-tu faire aujourd'hui {name} ?",
    "Sélectionne un mode de jeu pour commencer {name}."
  ],
  learn: [
    "Apprends de nouveaux mots et mémorise-les {name}.",
    "Découvre du vocabulaire utile en {language}.",
    "Enrichis ton vocabulaire {name} !"
  ],
  review: [
    "Révise les mots que tu as déjà appris {name}.",
    "La révision aide à mémoriser sur le long terme.",
    "Vérifie ce dont tu te souviens en {language} !"
  ],
  quiz: [
    "Teste tes connaissances en t'amusant {name} !",
    "Mets ton vocabulaire {language} à l'épreuve.",
    "Réponds aux questions pour gagner des points {name}."
  ],
  sentenceConstruction: [
    "Construis des phrases complètes en {language}.",
    "Mets les mots dans le bon ordre {name}.",
    "Apprends à former des phrases correctes en {language}."
  ],
  sentenceGap: [
    "Complète les phrases avec le bon mot {name}.",
    "Trouve le mot manquant dans chaque phrase en {language}.",
    "Entraîne-toi à comprendre les phrases complètes {name}."
  ],
  grammar: [
    "Apprends les règles de grammaire essentielles du {language}.",
    "Comprends comment la langue {language} fonctionne {name}.",
    "Maîtrise la structure de la langue {name}."
  ],
  exercise: [
    "Entraîne-toi avec différents types d'exercices {name}.",
    "Pratique tes compétences en {language}.",
    "Consolide ton apprentissage par la pratique {name}."
  ],
  progression: [
    "Consulte tes statistiques d'apprentissage {name} !",
    "Visualise ta progression et tes succès en {language}.",
    "Analyse ton parcours et tes accomplissements {name}."
  ]
};

const MascotContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }

  &:hover {
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.3));
  }

  @media (max-width: 768px) {
    top: 70px;
    left: auto;
    right: 15px;
    transform: translateX(0);
    scale: 0.8;
  }
`;

const SpeechBubbleWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: row-reverse;
  }
`;

interface SpeechBubbleProps {
  $isDarkTheme: boolean;
}

const SpeechBubble = styled(motion.div)<SpeechBubbleProps>`
  position: relative;
  background-color: ${props => props.$isDarkTheme ? '#1e293b' : 'white'};
  color: ${props => props.$isDarkTheme ? '#f8fafc' : '#333'};
  border: 2px solid ${props => props.$isDarkTheme ? '#475569' : '#333'};
  border-radius: 10px;
  padding: 10px 15px;
  max-width: 220px;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  line-height: 1.4;
  margin: 0 10px;

  // Style desktop par défaut
  &::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 20px;
    border-right: 10px solid ${props => props.$isDarkTheme ? '#475569' : '#333'};
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
  }

  &::after {
    content: '';
    position: absolute;
    left: -7px;
    top: 22px;
    border-right: 8px solid ${props => props.$isDarkTheme ? '#1e293b' : 'white'};
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
  }

  // Modification de la bulle pour la version mobile
  @media (max-width: 768px) {
    &::before, &::after {
      left: auto;
      right: -10px;
      border-right: none;
      border-left: 10px solid ${props => props.$isDarkTheme ? '#475569' : '#333'};
      top: 20px;
    }

    &::after {
      right: -7px;
      border-left: 8px solid ${props => props.$isDarkTheme ? '#1e293b' : 'white'};
      border-right: none;
    }
  }
`;

const MascotImage = styled(motion.img)`
  width: 80px;
  height: 80px;
  object-fit: contain;
  animation: ${bounce} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }
`;

const InteractiveMascot: React.FC<MascotProps> = ({ 
  onClick, 
  onHelp, 
  currentCategory,
  streak = 0,
  lastAnswerCorrect,
  languageCode = 'wf', // Langue par défaut: wolof
  userName  // Pas de valeur par défaut
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark';
  
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const previousCategory = useRef<AppMode | null>(null);
  const lastActivity = useRef<number>(Date.now());
  const wasCorrect = useRef<boolean | null>(null);
  const greetingShown = useRef<boolean>(false);
  
  // Compteur pour limiter l'utilisation du nom
  const useNameCounter = useRef(0);
  const MAX_NAME_USES = 3; // Nombre maximal d'utilisations du nom par session
  
  // Fonction pour extraire le prénom (given_name) en priorité
  const extractUserName = useCallback(() => {
    if (!userName) return '';
    
    // Si userName est une chaîne simple, l'utiliser directement
    if (typeof userName === 'string') return userName;
    
    // Si userName est un objet, extraire le prénom en priorité
    if (typeof userName === 'object') {
      const user: any = userName;
      
      // Privilégier given_name (prénom) plutôt que name (nom complet)
      return user.given_name || 
             user.firstName || 
             user.name || 
             user.displayName || 
             (user.email && user.email.split('@')[0]) ||
             '';
    }
    
    return '';
  }, [userName]);

  // Fonction pour remplacer les placeholders dans les messages avec limitation du nom
  const formatMessage = useCallback((msg: string) => {
    const langCode = languageCode as LanguageCode;
    const languageName = languageNames[langCode] || 'wolof';
    
    // Récupérer le nom de l'utilisateur
    const name = extractUserName();
    
    // Décider si on inclut le nom
    let includeName = false;
    if (name) {
      if (useNameCounter.current < MAX_NAME_USES) {
        // Utiliser le nom pour les premières interactions
        includeName = true;
        useNameCounter.current++;
      } else {
        // Après MAX_NAME_USES fois, n'utiliser le nom que de temps en temps (20% de chance)
        includeName = Math.random() < 0.2;
      }
    }
    
    return msg
      .replace(/\{name\}/g, includeName ? ` ${name}` : '')
      .replace(/\{language\}/g, languageName);
  }, [languageCode, extractUserName]);

  // Fonction pour obtenir une salutation dans la langue avec moins d'utilisation du nom
  const getLanguageGreeting = useCallback(() => {
    const langCode = languageCode as LanguageCode;
    const greetings = languageGreetings[langCode] || languageGreetings['wf'];
    
    // Utiliser Object.values pour éviter les problèmes de typage
    const greetingValues = Object.values(greetings);
    const randomGreeting = greetingValues[Math.floor(Math.random() * greetingValues.length)];
    
    // Pour les salutations, utiliser le nom avec une probabilité encore plus faible (25%)
    // car ce sont des messages qui apparaissent souvent
    const name = extractUserName();
    const formattedGreeting = randomGreeting.replace(
      /\{name\}/g, 
      (name && Math.random() < 0.25) ? ` ${name}` : ''
    );
    
    return formattedGreeting;
  }, [languageCode, extractUserName]);

  // Fonction pour obtenir le message approprié
  const getMessage = useCallback(() => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity.current;
    const hasChangedGame = previousCategory.current !== null && previousCategory.current !== currentCategory;
    
    // Mise à jour de l'heure de la dernière activité
    lastActivity.current = now;
    
    // Si c'est la première fois qu'on affiche un message ou qu'on change de catégorie
    if (!greetingShown.current || hasChangedGame) {
      greetingShown.current = true;
      
      // 30% de chances d'afficher une salutation dans la langue
      if (Math.random() < 0.3) {
        return getLanguageGreeting();
      }
      
      // Sinon, expliquer la catégorie actuelle
      const explanations = categoryExplanations[currentCategory] || [];
      if (explanations.length > 0) {
        return formatMessage(explanations[Math.floor(Math.random() * explanations.length)]);
      }
    }
    
    // Si c'est une réponse incorrecte
    if (lastAnswerCorrect === false) {
      wasCorrect.current = false;
      return formatMessage(encouragementMessages.wrong[Math.floor(Math.random() * encouragementMessages.wrong.length)]);
    }
    
    // Si c'est une réponse correcte après une incorrecte
    if (lastAnswerCorrect === true && wasCorrect.current === false) {
      wasCorrect.current = true;
      return formatMessage(encouragementMessages.comeback[Math.floor(Math.random() * encouragementMessages.comeback.length)]);
    }
    
    // Si on a un streak élevé
    if (streak >= 5) {
      return formatMessage(encouragementMessages.streak[Math.floor(Math.random() * encouragementMessages.streak.length)]);
    } 
    
    // Si c'est simplement une réponse correcte
    if (lastAnswerCorrect === true) {
      return formatMessage(encouragementMessages.correct[Math.floor(Math.random() * encouragementMessages.correct.length)]);
    }
    
    // Sinon, explication de la catégorie actuelle
    const explanations = categoryExplanations[currentCategory] || [];
    if (explanations.length > 0) {
      return formatMessage(explanations[Math.floor(Math.random() * explanations.length)]);
    }
    
    return '';
  }, [streak, lastAnswerCorrect, currentCategory, formatMessage, getLanguageGreeting]);

  // Affiche un message quand la catégorie change et réinitialise parfois le compteur de nom
  useEffect(() => {
    if (previousCategory.current !== currentCategory) {
      // Réinitialiser occasionnellement le compteur lors d'un changement de catégorie
      // permettant à la mascotte d'utiliser le nom à nouveau après un certain temps
      if (Math.random() < 0.3) {
        useNameCounter.current = 0;
      }
      
      const newMessage = getMessage();
      if (newMessage) {
        setMessage(newMessage);
        setShowMessage(true);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 4000);
      }
      
      previousCategory.current = currentCategory;
    }
  }, [currentCategory, getMessage]);

  // Réagit aux changements de streak et aux réponses
  useEffect(() => {
    if (lastAnswerCorrect !== null) {
      const newMessage = getMessage();
      if (newMessage) {
        setMessage(newMessage);
        setShowMessage(true);
        
        // Durée d'affichage adaptée
        const displayTime = (streak >= 5 || lastAnswerCorrect === false) ? 3500 : 3000;
        
        const timer = setTimeout(() => {
          setShowMessage(false);
        }, displayTime);

        return () => clearTimeout(timer);
      }
    }
  }, [streak, lastAnswerCorrect, getMessage]);

  // Affiche occasionnellement un conseil aléatoire
  useEffect(() => {
    if (!showMessage && currentCategory !== 'menu') {
      // 15% de chance d'afficher un conseil toutes les 25 secondes
      const interval = setInterval(() => {
        if (!showMessage && Math.random() < 0.15) {
          const newMessage = getMessage();
          if (newMessage) {
            setMessage(newMessage);
            setShowMessage(true);
            
            setTimeout(() => {
              setShowMessage(false);
            }, 3500);
          }
        }
      }, 25000);
      
      return () => clearInterval(interval);
    }
  }, [showMessage, currentCategory, getMessage]);

  // Afficher un message de bienvenue lorsque l'utilisateur se connecte
  // en utilisant délibérément le prénom
  useEffect(() => {
    const name = extractUserName();
    if (name) {
      // Ici on utilise délibérément le prénom pour l'accueil
      const welcomeMessage = `Ravi de te revoir ${name} !`;
      setMessage(welcomeMessage);
      setShowMessage(true);
      
      // Mais on incrémente quand même le compteur
      useNameCounter.current++;
      
      setTimeout(() => {
        setShowMessage(false);
      }, 3500);
    }
  }, [userName, extractUserName]);

  // Animation quand un message apparaît
  const getAnimation = () => {
    return {
      scale: showMessage ? [1, 1.1, 1] : 1,
    };
  };

  return (
    <MascotContainer onClick={onClick}>
      <SpeechBubbleWrapper>
        <MascotImage
          src="/Mascotte/mascotte5.png"
          alt="Mascotte"
          animate={getAnimation()}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        />
        
        <AnimatePresence>
          {showMessage && (
            <SpeechBubble
              $isDarkTheme={isDarkTheme}
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </SpeechBubble>
          )}
        </AnimatePresence>
      </SpeechBubbleWrapper>
    </MascotContainer>
  );
};

export default InteractiveMascot;