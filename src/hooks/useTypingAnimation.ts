import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseTypingAnimationOptions {
  text: string;
  speed?: number; // characters per interval
  interval?: number; // milliseconds between updates
  onComplete?: () => void;
}

export interface UseTypingAnimationReturn {
  displayText: string;
  isTyping: boolean;
  reset: () => void;
  skipToEnd: () => void;
}

// Custom hook to check for reduced motion preference
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

export const useTypingAnimation = (options: UseTypingAnimationOptions): UseTypingAnimationReturn => {
  const { text, speed = 2, interval = 16, onComplete } = options; // ~60fps
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  const reset = useCallback(() => {
    setDisplayText('');
    setIsTyping(false);
    currentIndexRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const skipToEnd = useCallback(() => {
    setDisplayText(text);
    setIsTyping(false);
    currentIndexRef.current = text.length;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (onComplete) {
      onComplete();
    }
  }, [text, onComplete]);

  useEffect(() => {
    // If reduced motion is preferred, show text immediately
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsTyping(false);
      if (onComplete) {
        onComplete();
      }
      return;
    }

    // Reset animation when text changes
    reset();

    if (!text) {
      return;
    }

    setIsTyping(true);
    currentIndexRef.current = 0;

    intervalRef.current = setInterval(() => {
      const currentIndex = currentIndexRef.current;
      
      if (currentIndex >= text.length) {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (onComplete) {
          onComplete();
        }
        return;
      }

      // Add characters based on speed setting
      const endIndex = Math.min(currentIndex + speed, text.length);
      setDisplayText(text.slice(0, endIndex));
      currentIndexRef.current = endIndex;
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speed, interval, onComplete, prefersReducedMotion, reset]);

  return {
    displayText,
    isTyping,
    reset,
    skipToEnd,
  };
};