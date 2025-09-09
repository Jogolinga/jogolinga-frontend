// src/components/common/EmojiIcons.tsx
import React from 'react';

interface EmojiIconProps {
  type: string;
  size?: number;
  className?: string;
}

const EmojiIcon: React.FC<EmojiIconProps> = ({ type, size = 24, className = '' }) => {
  const getEmoji = () => {
    switch (type) {
      case 'barChart': return '📊'; // à la place de BarChart2
      case 'zap': return '⚡'; // à la place de Zap
      case 'lock': return '🔒'; // à la place de Lock
      case 'award': return '🏆'; // à la place de Award
      case 'clock': return '⏰'; // à la place de Clock
      case 'shield': return '🛡️'; // à la place de ShieldCheck
      case 'creditCard': return '💳'; // à la place de CreditCard
      case 'logOut': return '🚪'; // à la place de LogOut
      case 'shieldCheck': return '✅🛡️'; // à la place de ShieldCheck
      case 'chevronLeft': return '◀️'; // à la place de ChevronLeft
      default: return '📌';
    }
  };

  return (
    <span 
      className={`emoji-icon ${className}`} 
      style={{ 
        fontSize: `${size}px`, 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: 1
      }}
      role="img"
      aria-label={type}
    >
      {getEmoji()}
    </span>
  );
};

// Exportez des icônes spécifiques pour faciliter leur utilisation
export const BarChart = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="barChart" {...props} />;
export const Zap = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="zap" {...props} />;
export const Lock = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="lock" {...props} />;
export const Award = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="award" {...props} />;
export const Clock = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="clock" {...props} />;
export const ShieldCheck = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="shieldCheck" {...props} />;
export const CreditCard = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="creditCard" {...props} />;
export const LogOut = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="logOut" {...props} />;
export const ChevronLeft = (props: Omit<EmojiIconProps, 'type'>) => <EmojiIcon type="chevronLeft" {...props} />;

export default EmojiIcon;