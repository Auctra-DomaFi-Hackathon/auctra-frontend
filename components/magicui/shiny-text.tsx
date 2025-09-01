'use client'

import React from 'react';
import { cn } from '@/lib/utils';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 3,
  className = ''
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        'relative inline-block',
        className
      )}
    >
      <span
        className={cn(
          'bg-gradient-to-r from-gray-600 via-white to-gray-600 bg-[length:400%_100%] bg-clip-text text-transparent bg-no-repeat',
          !disabled && 'animate-shiny-text'
        )}
        style={{
          animationDuration: !disabled ? animationDuration : undefined,
          backgroundPosition: '-400% 0',
        }}
      >
        {text}
      </span>
    </span>
  );
};

export default ShinyText;
