/**
 * Enhanced ChatPanel with integrated thinking system
 * Shows real-time AI thinking process directly in the chat
 */

import React, { useRef, useState } from 'react';
import { ChatProvider, useChat } from '@/providers/ChatProvider';
import { ChatPanel } from './ChatPanel';
import { useSimulatedStream } from '@/hooks/useStreamSSE';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEditMessage: (id: string, newContent: string) => void;
  onDeleteMessage: (id: string) => void;
  onRegenerateResponse: (id: string) => void;
  onToggleGithubSearch?: () => void;
  onOpenCanvas?: () => void;
  onCancelMessage?: () => void;
  isLoading: boolean;
  canCancelLoading?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

export function ChatPanelWithThinking(props: ChatPanelProps) {
  const [showThinking, setShowThinking] = useState(() => {
    return localStorage.getItem('sefgh-show-thinking') !== 'false'; // Default to true
  });

  // Save preference to localStorage
  React.useEffect(() => {
    localStorage.setItem('sefgh-show-thinking', showThinking.toString());
  }, [showThinking]);

  return (
    <ChatProvider
      onCancel={() => {
        props.onCancelMessage?.();
        console.log('Thinking process cancelled');
      }}
      onRetry={() => {
        console.log('Retry requested');
      }}
    >
      <div className="flex flex-col h-full relative">
        {/* Thinking toggle button - only show if there are messages */}
        {props.messages.length > 0 && (
          <div className="border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {props.messages.length} message{props.messages.length !== 1 ? 's' : ''} in conversation
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThinking(!showThinking)}
                className="gap-2"
              >
                {showThinking ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showThinking ? 'Hide' : 'Show'} thinking
              </Button>
            </div>
          </div>
        )}

        <ChatPanelWithThinkingInner 
          {...props} 
          showThinking={showThinking}
        />
      </div>
    </ChatProvider>
  );
}

function ChatPanelWithThinkingInner(props: ChatPanelProps & { showThinking: boolean }) {
  const [enhancedMessages, setEnhancedMessages] = useState(props.messages);
  const [currentStreamingId, setCurrentStreamingId] = useState<string | null>(null);
  
  const {
    thinking,
    streaming,
    setThinkingVisible,
    setCanCancel,
    startStep,
    completeStep,
    startStreaming,
    appendChunk,
    finishStreaming,
    resetThinking,
    resetStreaming
  } = useChat();
  
  const simulatedStream = useSimulatedStream({
    onChunk: (chunk) => {
      appendChunk(chunk);
      // Update the message content in real-time
      setEnhancedMessages(prev => prev.map(msg => 
        msg.id === currentStreamingId 
          ? { ...msg, content: streaming.content }
          : msg
      ));
    },
    onComplete: () => {
      finishStreaming();
      completeStep('finalize');
      
      // Hide thinking bar after completion
      setTimeout(() => {
        setThinkingVisible(false);
        resetThinking();
        setCurrentStreamingId(null);
      }, 600);
    }
  });
  
  // Enhanced message sending with thinking process
  const handleSendMessage = async (message: string) => {
    // Call original handler
    props.onSendMessage(message);
    
    // Only show thinking if enabled
    if (!props.showThinking) return;
    
    // Start thinking process for the expected assistant response
    setTimeout(async () => {
      const assistantMessageId = `assistant-${Date.now()}`;
      setCurrentStreamingId(assistantMessageId);
      
      // Reset previous state
      resetThinking();
      resetStreaming();
      
      // Start thinking process
      setThinkingVisible(true);
      setCanCancel(true);
      
      // Simulate thinking steps
      await simulateThinkingProcess(assistantMessageId);
    }, 100);
  };
  
  const simulateThinkingProcess = async (messageId: string) => {
    try {
      // Step 1: Understanding
      startStep('understand', 'Understanding your request...');
      await delay(400);
      completeStep('understand');
      
      // Step 2: Planning
      startStep('plan', 'Planning response...');
      await delay(600);
      completeStep('plan');
      
      // Step 3: Searching
      startStep('retrieve', 'Searching knowledge...', { toolName: 'github' });
      await delay(800);
      completeStep('retrieve');
      
      // Step 4: Composing - start streaming
      startStep('compose', 'Composing answer...');
      startStreaming(messageId);
      
      // Start simulated response
      const response = "I'm processing your request and will provide a comprehensive response. This demonstrates the real-time thinking system integrated directly into the chat interface.";
      
      simulatedStream.startStream(response, messageId, 40);
      
      // Complete compose step
      await delay(200);
      completeStep('compose');
      
      // Start finalize step
      startStep('finalize', 'Finalizing response...');
      
    } catch (error) {
      console.error('Thinking simulation error:', error);
    }
  };
  
  // Sync props.messages with enhanced messages
  React.useEffect(() => {
    setEnhancedMessages(props.messages);
  }, [props.messages]);
  
  return (
    <div className="flex-1 flex flex-col">
      {/* Pass to ChatPanel */}
      <ChatPanel 
        {...props}
        messages={enhancedMessages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}

// Utility function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}