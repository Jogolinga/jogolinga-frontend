import React from 'react';
import { motion } from 'framer-motion';
import { Award } from './common/EmojiIcons';

interface PremiumButtonProps {
  onClick: () => void;
  withPulse?: boolean;
  text?: string;
}

const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  onClick, 
  withPulse = true,
  text = "Passer à Premium"
}) => {
  return (
    <motion.button
      className={`floating-premium-button ${withPulse ? 'with-pulse' : ''}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Award size={20} className="premium-button-icon" />
      <span>{text}</span>
    </motion.button>
  );
};

export default PremiumButton;