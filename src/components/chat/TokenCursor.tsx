import React from 'react';
import { useReducedMotion } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';

interface TokenCursorProps {
  className?: string;
}

export const TokenCursor: React.FC<TokenCursorProps> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn(
        'inline-block w-0.5 h-4 bg-foreground ml-0.5',
        !prefersReducedMotion && 'animate-pulse',
        className
      )}
      style={{
        animation: prefersReducedMotion 
          ? 'none' 
          : 'token-cursor 1.2s ease-in-out infinite',
      }}
      aria-hidden="true"
    />
  );
};