import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  score: number;
}

const ScoreDisplay: React.FC<Props> = ({ score }) => {
  if (score === 0) return null;

  return (
    <motion.div
      className="score-display"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Score: {score}
    </motion.div>
  );
};

export default ScoreDisplay;