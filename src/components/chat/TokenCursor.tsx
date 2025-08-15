import React from 'react';
import { cn } from '@/lib/utils';

interface TokenCursorProps {
  className?: string;
  visible?: boolean;
}

/**
 * Soft blinking cursor for streaming text
 * Respects prefers-reduced-motion
 */
export const TokenCursor: React.FC<TokenCursorProps> = ({ 
  className,
  visible = true 
}) => {
  if (!visible) return null;

  return (
    <span 
      className={cn(
        "inline-block w-0.5 h-4 bg-current ml-0.5",
        "animate-pulse motion-reduce:animate-none",
        "opacity-75",
        className
      )}
      aria-hidden="true"
    />
  );
};