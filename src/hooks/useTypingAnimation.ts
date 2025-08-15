import { useEffect, useState, useCallback, useRef } from 'react';

export interface UseTypingAnimationOptions {
  speed?: number; // characters per second, default 30
  respectReducedMotion?: boolean; // default true
}

export interface UseTypingAnimationReturn {
  displayText: string;
  isTyping: boolean;
  setTargetText: (text: string) => void;
  appendText: (text: string) => void;
  reset: () => void;
}

/**
 * Typewriter effect hook that respects prefers-reduced-motion
 * Provides smooth streaming text animation capped at ~60fps
 */
export const useTypingAnimation = (
  options: UseTypingAnimationOptions = {}
): UseTypingAnimationReturn => {
  const { speed = 30, respectReducedMotion = true } = options;
  
  const [displayText, setDisplayText] = useState('');
  const [targetText, setTargetTextState] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  // Check for reduced motion preference
  const prefersReducedMotion = respectReducedMotion && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastUpdateRef.current;
    
    // Cap at 60fps (16.67ms per frame)
    if (deltaTime < 16.67) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    lastUpdateRef.current = now;
    
    setDisplayText(current => {
      if (current === targetText) {
        setIsTyping(false);
        return current;
      }
      
      if (prefersReducedMotion) {
        // Skip animation if reduced motion is preferred
        setIsTyping(false);
        return targetText;
      }
      
      // Calculate how many characters to add based on speed and time delta
      const charactersToAdd = Math.max(1, Math.floor(speed * deltaTime / 1000));
      const nextLength = Math.min(current.length + charactersToAdd, targetText.length);
      
      const nextText = targetText.substring(0, nextLength);
      
      if (nextText === targetText) {
        setIsTyping(false);
      }
      
      return nextText;
    });
    
    if (displayText !== targetText) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [targetText, speed, prefersReducedMotion, displayText]);

  const setTargetText = useCallback((text: string) => {
    setTargetTextState(text);
    if (text !== displayText) {
      setIsTyping(true);
      lastUpdateRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [displayText, animate]);

  const appendText = useCallback((text: string) => {
    setTargetTextState(current => current + text);
  }, []);

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setDisplayText('');
    setTargetTextState('');
    setIsTyping(false);
  }, []);

  // Start animation when target text changes
  useEffect(() => {
    if (targetText !== displayText && !isTyping) {
      setIsTyping(true);
      lastUpdateRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [targetText, displayText, isTyping, animate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    displayText,
    isTyping,
    setTargetText,
    appendText,
    reset,
  };
};