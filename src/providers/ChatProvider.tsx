import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { 
  ChatThinkingState, 
  ThoughtStep, 
  ThoughtStepId, 
  StreamChunk, 
  ChatEvents,
  DEFAULT_STEPS 
} from '@/lib/chatEvents';

interface StreamingState {
  messageId: string | null;
  content: string;
  isStreaming: boolean;
  error: string | null;
}

interface ChatContextValue {
  // Thinking state
  thinking: ChatThinkingState;
  setThinking: (state: Partial<ChatThinkingState>) => void;
  startStep: (id: ThoughtStepId, label?: string, meta?: { toolName?: string; note?: string }) => void;
  completeStep: (id: ThoughtStepId) => void;
  failStep: (id: ThoughtStepId, note?: string) => void;
  setVisible: (visible: boolean) => void;
  
  // Streaming state
  streaming: {
    state: StreamingState;
    start: (messageId: string) => void;
    append: (chunk: StreamChunk) => void;
    finish: () => void;
    error: (error: string) => void;
    reset: () => void;
  };
  
  // Event handlers
  cancel: () => void;
  events: ChatEvents;
  setEvents: (events: Partial<ChatEvents>) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ 
  children, 
  onCancel, 
  onRetry 
}) => {
  const [thinking, setThinkingState] = useState<ChatThinkingState>({
    visible: false,
    canCancel: false,
    steps: [],
    activeStep: undefined,
  });

  const [streamingState, setStreamingState] = useState<StreamingState>({
    messageId: null,
    content: '',
    isStreaming: false,
    error: null,
  });

  const [events, setEventsState] = useState<ChatEvents>({
    onCancel,
    onRetry,
  });

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setThinking = useCallback((newState: Partial<ChatThinkingState>) => {
    setThinkingState(prev => ({ ...prev, ...newState }));
  }, []);

  const setEvents = useCallback((newEvents: Partial<ChatEvents>) => {
    setEventsState(prev => ({ ...prev, ...newEvents }));
  }, []);

  const startStep = useCallback((
    id: ThoughtStepId, 
    label?: string, 
    meta?: { toolName?: string; note?: string }
  ) => {
    const now = Date.now();
    
    setThinkingState(prev => {
      const steps = [...prev.steps];
      const existingIndex = steps.findIndex(step => step.id === id);
      
      const stepData: ThoughtStep = {
        id,
        label: label || DEFAULT_STEPS.find(s => s.id === id)?.label || `Step: ${id}`,
        status: 'active',
        startedAt: now,
        toolName: meta?.toolName,
        note: meta?.note,
      };
      
      if (existingIndex >= 0) {
        steps[existingIndex] = stepData;
      } else {
        steps.push(stepData);
      }
      
      return {
        ...prev,
        steps,
        activeStep: id,
      };
    });
  }, []);

  const completeStep = useCallback((id: ThoughtStepId) => {
    const now = Date.now();
    
    setThinkingState(prev => {
      const steps = prev.steps.map(step => 
        step.id === id 
          ? { ...step, status: 'done' as const, endedAt: now }
          : step
      );
      
      return {
        ...prev,
        steps,
        activeStep: prev.activeStep === id ? undefined : prev.activeStep,
      };
    });
  }, []);

  const failStep = useCallback((id: ThoughtStepId, note?: string) => {
    const now = Date.now();
    
    setThinkingState(prev => {
      const steps = prev.steps.map(step => 
        step.id === id 
          ? { ...step, status: 'error' as const, endedAt: now, note }
          : step
      );
      
      return {
        ...prev,
        steps,
        activeStep: prev.activeStep === id ? undefined : prev.activeStep,
      };
    });
  }, []);

  const setVisible = useCallback((visible: boolean) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    if (!visible) {
      // Delay hiding to allow for smooth transitions
      hideTimeoutRef.current = setTimeout(() => {
        setThinkingState(prev => ({ ...prev, visible: false }));
      }, 600);
    } else {
      setThinkingState(prev => ({ ...prev, visible: true }));
    }
  }, []);

  const cancel = useCallback(() => {
    if (events.onCancel) {
      events.onCancel();
    }
    
    // Reset thinking state
    setThinkingState({
      visible: false,
      canCancel: false,
      steps: [],
      activeStep: undefined,
    });
    
    // Reset streaming state
    setStreamingState({
      messageId: null,
      content: '',
      isStreaming: false,
      error: null,
    });
  }, [events.onCancel]);

  const streaming = {
    state: streamingState,
    
    start: useCallback((messageId: string) => {
      setStreamingState({
        messageId,
        content: '',
        isStreaming: true,
        error: null,
      });
    }, []),
    
    append: useCallback((chunk: StreamChunk) => {
      setStreamingState(prev => ({
        ...prev,
        content: prev.content + chunk.delta,
        isStreaming: !chunk.done,
        error: chunk.error || null,
      }));
    }, []),
    
    finish: useCallback(() => {
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
      }));
    }, []),
    
    error: useCallback((error: string) => {
      setStreamingState(prev => ({
        ...prev,
        isStreaming: false,
        error,
      }));
    }, []),
    
    reset: useCallback(() => {
      setStreamingState({
        messageId: null,
        content: '',
        isStreaming: false,
        error: null,
      });
    }, []),
  };

  const contextValue: ChatContextValue = {
    thinking,
    setThinking,
    startStep,
    completeStep,
    failStep,
    setVisible,
    streaming,
    cancel,
    events,
    setEvents,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};