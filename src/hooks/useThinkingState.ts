/**
 * useThinkingState - Hook to manage thinking animation state
 */

import { useState, useCallback } from 'react';

export function useThinkingState() {
  const [isThinking, setIsThinking] = useState(false);

  const startThinking = useCallback(() => {
    setIsThinking(true);
  }, []);

  const stopThinking = useCallback(() => {
    setIsThinking(false);
  }, []);

  return {
    isThinking,
    startThinking,
    stopThinking,
  };
}