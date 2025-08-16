/**
 * ChatThinkingDemo - Comprehensive demonstration of the thinking system
 * Shows how all components work together in a realistic chat flow
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ChatProvider, useChat } from '@/providers/ChatProvider';
import { ThinkingBar, ThinkingBarRef } from './ThinkingBar';
import { ThoughtTimeline, useThoughtTimeline } from './ThoughtTimeline';
import { SkeletonMessage } from './SkeletonMessage';
import { StreamedMessage } from './StreamedMessage';
import { useSimulatedStream } from '@/hooks/useStreamSSE';
import { ToolEventType } from '@/lib/chatEvents';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isComplete?: boolean;
}

interface ChatThinkingDemoProps {
  className?: string;
}

// Demo component wrapped with ChatProvider
export function ChatThinkingDemo({ className = '' }: ChatThinkingDemoProps) {
  return (
    <ChatProvider
      onCancel={() => console.log('Stream cancelled')}
      onRetry={() => console.log('Retry requested')}
    >
      <ChatDemoInner className={className} />
    </ChatProvider>
  );
}

function ChatDemoInner({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const { isVisible: timelineVisible, toggle: toggleTimeline } = useThoughtTimeline();
  const thinkingBarRef = useRef<ThinkingBarRef>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const simulatedStream = useSimulatedStream({
    onChunk: (chunk) => {
      appendChunk(chunk);
    },
    onComplete: () => {
      finishStreaming();
      completeStep('finalize');
      
      // Hide thinking bar after a delay
      setTimeout(() => {
        setThinkingVisible(false);
        resetThinking();
      }, 600);
    }
  });
  
  // Scroll to bottom when new messages are added
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming.content]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Reset previous state
    resetThinking();
    resetStreaming();
    
    // Start thinking process
    setThinkingVisible(true);
    setCanCancel(true);
    
    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      isComplete: false
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // Simulate the thinking process
    await simulateThinkingProcess(assistantMessageId);
  };
  
  const simulateThinkingProcess = async (messageId: string) => {
    try {
      // Step 1: Understanding (500ms)
      startStep('understand', 'Understanding your request...');
      await delay(500);
      completeStep('understand');
      
      // Step 2: Planning (800ms)
      startStep('plan', 'Planning my response...');
      await delay(800);
      completeStep('plan');
      
      // Add tool event example
      thinkingBarRef.current?.addToolChip('search');
      
      // Step 3: Searching (1200ms)
      startStep('retrieve', 'Searching knowledge base...', { toolName: 'web' });
      await delay(600);
      thinkingBarRef.current?.addToolChip('fetch');
      await delay(600);
      completeStep('retrieve');
      
      // Step 4: Composing - start streaming
      startStep('compose', 'Composing answer...');
      startStreaming(messageId);
      
      // Update message to show it's streaming
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isStreaming: true, isComplete: false }
          : msg
      ));
      
      // Simulate streaming response
      const response = "I understand you'd like to see how the thinking process works! This demonstration shows how I break down complex tasks into discrete steps: understanding your request, planning my approach, retrieving relevant information, and composing a thoughtful response. Each step is tracked and displayed in a privacy-safe manner, showing only high-level progress without exposing internal reasoning chains.";
      
      // Start the simulated stream
      simulatedStream.startStream(response, messageId, 30); // 30ms per chunk
      
      // Complete compose step after streaming starts
      await delay(200);
      completeStep('compose');
      
      // Start finalize step
      startStep('finalize', 'Finalizing response...');
      
    } catch (error) {
      console.error('Simulation error:', error);
      setIsLoading(false);
      setThinkingVisible(false);
    }
  };
  
  // Update message completion state when streaming finishes
  React.useEffect(() => {
    if (streaming.done && !streaming.isStreaming && streaming.messageId) {
      setMessages(prev => prev.map(msg => 
        msg.id === streaming.messageId 
          ? { 
              ...msg, 
              content: streaming.content,
              isStreaming: false, 
              isComplete: true 
            }
          : msg
      ));
      setIsLoading(false);
    }
  }, [streaming.done, streaming.isStreaming, streaming.messageId, streaming.content]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };
  
  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-xl font-semibold">Thinking System Demo</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Send a message to see the privacy-safe thinking process in action
        </p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Try the Thinking System</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ask me anything to see the step-by-step thinking process, complete with 
              animated progress indicators and privacy-safe status updates.
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={message.id}>
            {/* Show thinking bar before assistant messages when thinking */}
            {message.type === 'assistant' && index === messages.length - 1 && thinking.visible && (
              <div className="mb-4">
                <ThinkingBar ref={thinkingBarRef} />
                {timelineVisible && (
                  <div className="mt-3 ml-4">
                    <ThoughtTimeline visible={timelineVisible} />
                  </div>
                )}
              </div>
            )}
            
            {/* Show skeleton or streamed message */}
            {message.type === 'assistant' && message.isStreaming && !message.content ? (
              <SkeletonMessage type="assistant" />
            ) : message.type === 'assistant' && (message.isStreaming || streaming.content) ? (
              <StreamedMessage
                type="assistant"
                content={streaming.messageId === message.id ? streaming.content : message.content}
                isStreaming={message.isStreaming}
                isComplete={message.isComplete}
              />
            ) : (
              <RegularMessage message={message} />
            )}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything to see the thinking process..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="px-3"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Timeline toggle */}
        <div className="mt-2 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTimeline}
            className="text-xs"
          >
            {timelineVisible ? 'Hide' : 'Show'} Timeline
          </Button>
          
          <div className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}

// Regular message component for completed messages
function RegularMessage({ message }: { message: Message }) {
  return (
    <motion.div
      className={`flex gap-3 group ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${message.type === 'user' ? 'bg-brand' : 'bg-muted'}
      `}>
        {message.type === 'user' ? (
          <User className="h-4 w-4 text-brand-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Message content */}
      <Card className={`
        flex-1 transition-all duration-200 max-w-3xl
        ${message.type === 'user' ? 'bg-brand text-brand-foreground' : ''}
      `}>
        <CardContent className="p-3">
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Utility function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}