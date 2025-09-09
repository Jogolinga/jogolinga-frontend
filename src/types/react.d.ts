import { ComponentType, ReactNode, ReactElement, CSSProperties } from 'react';

declare global {
  namespace React {
    interface FC<P = {}> {
      (props: P & { children?: ReactNode }): ReactElement | null;
      defaultProps?: Partial<P>;
      displayName?: string;
    }

    interface SVGProps<T = SVGElement> extends SVGAttributes<T> {
      className?: string;
      size?: number | string;
      color?: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number | string;
      style?: CSSProperties;
      onClick?: () => void;
    }
    
    interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      className?: string;
      color?: string;
      height?: number | string;
      id?: string;
      lang?: string;
      max?: number | string;
      media?: string;
      method?: string;
      min?: number | string;
      name?: string;
      style?: CSSProperties;
      target?: string;
      type?: string;
      width?: number | string;
      role?: string;
      tabIndex?: number;
      crossOrigin?: "anonymous" | "use-credentials" | "";
      xmlns?: string;
      viewBox?: string;
    }

    interface DOMAttributes<T> {
      children?: ReactNode;
      onClick?: (event: MouseEvent<T>) => void;
      onMouseEnter?: (event: MouseEvent<T>) => void;
      onMouseLeave?: (event: MouseEvent<T>) => void;
      onKeyPress?: (event: KeyboardEvent<T>) => void;
      onKeyDown?: (event: KeyboardEvent<T>) => void;
      onKeyUp?: (event: KeyboardEvent<T>) => void;
    }

    interface AriaAttributes {
      'aria-label'?: string;
      'aria-hidden'?: boolean | 'true' | 'false';
      'aria-disabled'?: boolean | 'true' | 'false';
      role?: string;
    }
    
    interface TouchEvent<T = Element> extends SyntheticEvent<T> {
      touches: TouchList;
      changedTouches: TouchList;
    }
    
    interface FormEvent<T = Element> extends SyntheticEvent<T> {}
    interface ChangeEvent<T = Element> extends SyntheticEvent<T> {}
    interface MouseEvent<T = Element, E = NativeMouseEvent> extends SyntheticEvent<T, E> {
      buttons: number;
      clientX: number;
      clientY: number;
      pageX: number;
      pageY: number;
      screenX: number;
      screenY: number;
    }
    interface KeyboardEvent<T = Element> extends SyntheticEvent<T> {
      key: string;
      code: string;
      location: number;
      altKey: boolean;
      ctrlKey: boolean;
      metaKey: boolean;
      shiftKey: boolean;
      repeat: boolean;
    }
  }
}

interface SyntheticEvent<T = Element, E = Event> {
  bubbles: boolean;
  cancelable: boolean;
  currentTarget: T;
  defaultPrevented: boolean;
  eventPhase: number;
  isTrusted: boolean;
  nativeEvent: E;
  preventDefault(): void;
  stopPropagation(): void;
  target: EventTarget & T;
  timeStamp: number;
  type: string;
}

interface NativeMouseEvent {
  button: number;
  buttons: number;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
}

declare module 'lucide-react' {
  import { SVGProps } from 'react';
  
  export interface LucideProps extends SVGProps<SVGElement> {
    size?: number | string;
    color?: string;
    fill?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
    className?: string;
    onClick?: () => void;
  }

  export type LucideIcon = React.FC<LucideProps>;
}

export {};