import { memo, ReactNode, CSSProperties } from 'react';

interface LightMotionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  animate?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';
  duration?: number;
  delay?: number;
}

const LightMotion = memo(({ 
  children, 
  className = '', 
  style = {},
  animate = 'fadeIn',
  duration = 300,
  delay = 0 
}: LightMotionProps) => {
  const animationClasses = {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down', 
    slideLeft: 'animate-slide-left',
    slideRight: 'animate-slide-right',
    scaleIn: 'animate-scale-in'
  };

  const animationStyle: CSSProperties = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationFillMode: 'both',
    ...style
  };

  return (
    <div 
      className={`${animationClasses[animate]} ${className}`}
      style={animationStyle}
    >
      {children}
    </div>
  );
});

LightMotion.displayName = 'LightMotion';

export default LightMotion;