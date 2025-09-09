import React from 'react';
import { motion } from 'framer-motion';

const CelebrationAnimation: React.FC = () => {
  return (
    <motion.div
      className="celebration-animation"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <span role="img" aria-label="celebration">🎉</span>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Félicitations !
      </motion.p>
    </motion.div>
  );
};

export default CelebrationAnimation;