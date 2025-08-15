import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatThinkingState, ChatEvents, ThoughtStep, getDefaultThoughtSteps } from '@/lib/chatEvents';

interface ChatContextValue extends ChatThinkingState, ChatEvents {
  updateThinkingState: (state: Partial<ChatThinkingState>) => void;
  updateStep: (stepId: string, updates: Partial<ThoughtStep>) => void;
  setActiveStep: (stepId?: string) => void;
  resetThinking: () => void;
  startThinking: () => void;
  stopThinking: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
  onCancel?: () => void;
  onRetry?: () => void;
}

/**
 * Event bus + context for chat events and cancel/retry functionality
 * Manages thinking state and thought process timeline
 */
export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  onCancel, 
  onRetry 
}) => {
  const [thinkingState, setThinkingState] = useState<ChatThinkingState>({
    visible: false,
    canCancel: false,
    steps: getDefaultThoughtSteps(),
    activeStep: undefined,
  });

  const updateThinkingState = useCallback((updates: Partial<ChatThinkingState>) => {
    setThinkingState(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<ThoughtStep>) => {
    setThinkingState(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, ...updates }
          : step
      )
    }));
  }, []);

  const setActiveStep = useCallback((stepId?: string) => {
    setThinkingState(prev => ({
      ...prev,
      activeStep: stepId as any,
      steps: prev.steps.map(step => ({
        ...step,
        status: step.id === stepId ? 'active' : 
                step.status === 'active' ? 'pending' : 
                step.status
      }))
    }));
  }, []);

  const resetThinking = useCallback(() => {
    setThinkingState({
      visible: false,
      canCancel: false,
      steps: getDefaultThoughtSteps(),
      activeStep: undefined,
    });
  }, []);

  const startThinking = useCallback(() => {
    setThinkingState(prev => ({
      ...prev,
      visible: true,
      canCancel: false, // Will be enabled after delay
      steps: getDefaultThoughtSteps(),
      activeStep: 'understand',
    }));

    // Enable cancel after 5 seconds (matching existing pattern)
    setTimeout(() => {
      setThinkingState(prev => ({ ...prev, canCancel: true }));
    }, 5000);
  }, []);

  const stopThinking = useCallback(() => {
    setThinkingState(prev => ({
      ...prev,
      visible: false,
      canCancel: false,
      activeStep: undefined,
    }));
  }, []);

  const contextValue: ChatContextValue = {
    ...thinkingState,
    onCancel,
    onRetry,
    updateThinkingState,
    updateStep,
    setActiveStep,
    resetThinking,
    startThinking,
    stopThinking,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};