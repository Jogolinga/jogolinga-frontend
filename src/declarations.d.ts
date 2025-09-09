declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.wav';
declare module '*.mp3';
declare module 'process';
declare module 'buffer';
declare module 'stream-browserify';
declare module 'vm-browserify';

declare module 'lucide-react' {
  import { ComponentType } from 'react';

  export interface LucideProps {
    size?: number | string;
    color?: string;
    fill?: string;
    className?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    onClick?: () => void;
  }

  export type LucideIcon = ComponentType<LucideProps>;

  // Déclaration de toutes les icônes utilisées
  export const ArrowLeft: LucideIcon;
  export const ArrowLeftCircle: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowRightCircle: LucideIcon;
  export const Book: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Circle: LucideIcon;
  export const CircleDot: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Home: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Moon: LucideIcon;
  export const RotateCw: LucideIcon;
  export const Settings: LucideIcon;
  export const Sun: LucideIcon;
  export const Volume: LucideIcon;
  export const Volume2: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const XSquare: LucideIcon;
}