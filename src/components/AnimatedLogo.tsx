
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/80 to-primary/30 blur-md animate-pulse-soft" />
      <div className="absolute inset-0 rounded-full bg-white/80 backdrop-blur-sm" />
      <div className="relative z-10 flex items-center justify-center">
        <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M12 2C7.58 2 4 5.58 4 10C4 14.5 9.5 21 12 21C14.5 21 20 14.5 20 10C20 5.58 16.42 2 12 2ZM12 11.5C11.1716 11.5 10.5 10.8284 10.5 10C10.5 9.17157 11.1716 8.5 12 8.5C12.8284 8.5 13.5 9.17157 13.5 10C13.5 10.8284 12.8284 11.5 12 11.5Z" 
            fill="currentColor" 
            className="text-primary"
          />
        </svg>
      </div>
    </div>
  );
};

export default AnimatedLogo;
