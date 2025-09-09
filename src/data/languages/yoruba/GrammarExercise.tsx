import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface GrammarExerciseProps {
  onBackToCategories: () => void;
  onExerciseComplete: () => void;
}

interface GrammarQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const grammarQuestions: GrammarQuestion[] = [
  {
    question: "Complétez la phrase : 'Maa ___ dem.' (Je vais partir)",
    options: ["ngi", "nga", "naa"],
    correctAnswer: "ngi"
  },
  // Ajoutez d'autres questions de grammaire ici
];

const GrammarExercise: React.FC<GrammarExerciseProps> = ({ onBackToCategories, onExerciseComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (selectedAnswer: string) => {
    if (selectedAnswer === grammarQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < grammarQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartExercise = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
  };

  useEffect(() => {
    if (showResult) {
      onExerciseComplete();
    }
  }, [showResult, onExerciseComplete]);

  return (
    <motion.div 
      className="grammar-exercise"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <h2>Exercice de Grammaire Wolof</h2>
      {!showResult ? (
        <>
          <p>{grammarQuestions[currentQuestion].question}</p>
          <div className="options">
            {grammarQuestions[currentQuestion].options.map((option, index) => (
              <button key={index} onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="result">
          <p>Exercice terminé !</p>
          <p>Score : {score} / {grammarQuestions.length}</p>
          <button onClick={restartExercise}>Recommencer</button>
          <button onClick={onBackToCategories}>Retour au menu</button>
        </div>
      )}
    </motion.div>
  );
};

export default GrammarExercise;