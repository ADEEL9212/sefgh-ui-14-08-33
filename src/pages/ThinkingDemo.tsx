/**
 * ThinkingDemo - Dedicated page showcasing the AI thinking process simulation
 * Features enhanced chat UI with prominent thought process visualization
 */

import React, { useState, useRef, useCallback } from 'react';
import { ChatProvider } from '@/providers/ChatProvider';
import { EnhancedChatPanel } from '@/components/EnhancedChatPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Settings, 
  Download, 
  RotateCcw, 
  Zap,
  Eye,
  EyeOff,
  Gauge,
  Palette
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface ThinkingSettings {
  showThoughtProcess: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'light' | 'dark' | 'auto';
  autoExpand: boolean;
}

const ThinkingDemo = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [canCancelLoading, setCanCancelLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ThinkingSettings>({
    showThoughtProcess: true,
    animationSpeed: 'normal',
    theme: 'auto',
    autoExpand: true,
  });
  const [showWelcomeDemo, setShowWelcomeDemo] = useState(true);
  
  const { toast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const loadDemoConversation = useCallback(() => {
    const demoMessages: Message[] = [
      {
        id: 'demo-user-1',
        type: 'user',
        content: 'Can you explain how neural networks work?',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      },
      {
        id: 'demo-assistant-1',
        type: 'assistant',
        content: 'Neural networks are computational models inspired by the human brain. They consist of interconnected nodes (neurons) organized in layers. Here\'s how they work:\n\n**Basic Structure:**\n- Input layer: Receives data\n- Hidden layers: Process information\n- Output layer: Produces results\n\n**Learning Process:**\n1. Forward propagation: Data flows through the network\n2. Loss calculation: Compare output to expected result\n3. Backpropagation: Adjust weights to minimize error\n4. Repeat until the network learns patterns\n\n**Key Components:**\n- Weights: Determine connection strength\n- Activation functions: Add non-linearity\n- Bias: Helps with learning flexibility\n\nThis thinking process involved understanding your question, retrieving knowledge about neural networks, structuring the explanation logically, and presenting it in an accessible way.',
        timestamp: new Date(Date.now() - 280000), // 4 minutes 40 seconds ago
      }
    ];
    setMessages(demoMessages);
    setShowWelcomeDemo(false);
    toast({
      title: "Demo conversation loaded",
      description: "This shows how the thinking process works with a real example.",
      duration: 3000,
    });
  }, [toast]);

  // Load demo conversation on first visit
  React.useEffect(() => {
    if (showWelcomeDemo && messages.length === 0) {
      const timer = setTimeout(() => {
        loadDemoConversation();
      }, 2000); // Load demo after 2 seconds
      return () => clearTimeout(timer);
    }
  }, [showWelcomeDemo, messages.length, loadDemoConversation]);

  // Simulated message sending with thinking process
  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCanCancelLoading(false);

    // Enable cancellation after 3 seconds
    const cancelTimeout = setTimeout(() => {
      setCanCancelLoading(true);
    }, 3000);

    try {
      // Simulate thinking and response generation
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: `I've analyzed your request: "${content}"\n\nAfter carefully considering the context and thinking through the response, here's my thoughtful answer. This demonstrates the thinking process simulation where you can see each step of my reasoning process before I provide the final response.\n\nThe thought process includes understanding your request, planning the response, searching relevant knowledge, and composing a coherent answer.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      clearTimeout(cancelTimeout);
      setIsLoading(false);
      setCanCancelLoading(false);
    }
  }, []);

  const handleEditMessage = useCallback((id: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, content: newContent } : msg
    ));
  }, []);

  const handleDeleteMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const handleRegenerateResponse = useCallback((id: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && messages[userMessageIndex].type === 'user') {
      const updatedMessages = messages.slice(0, messageIndex);
      setMessages(updatedMessages);
      handleSendMessage(messages[userMessageIndex].content);
    }
  }, [messages, handleSendMessage]);

  const handleCancelMessage = useCallback(() => {
    setIsLoading(false);
    setCanCancelLoading(false);
    toast({
      title: "Request cancelled",
      description: "The thinking process has been stopped.",
      duration: 2000,
    });
  }, [toast]);

  const clearChat = useCallback(() => {
    setMessages([]);
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
      duration: 2000,
    });
  }, [toast]);

  const exportChat = useCallback(() => {
    const chatData = {
      messages,
      settings,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thinking-demo-chat-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat exported",
      description: "Chat data has been downloaded as JSON.",
      duration: 2000,
    });
  }, [messages, settings, toast]);

  const getSpeedMultiplier = () => {
    switch (settings.animationSpeed) {
      case 'slow': return 2;
      case 'fast': return 0.5;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">SEFGH Chat – Thought Process Mode</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Demo Environment
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDemoConversation}
              disabled={messages.length > 0}
            >
              <Brain className="h-4 w-4 mr-2" />
              Load Demo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={messages.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="flex-shrink-0 border-b border-border bg-muted/30 p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Thinking Process Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Show/Hide Thought Process */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {settings.showThoughtProcess ? (
                      <Eye className="h-4 w-4 text-primary" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <label className="text-sm font-medium">Show Thought Process</label>
                  </div>
                  <Switch
                    checked={settings.showThoughtProcess}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, showThoughtProcess: checked }))
                    }
                  />
                </div>

                {/* Animation Speed */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Animation Speed</label>
                  </div>
                  <select
                    value={settings.animationSpeed}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        animationSpeed: e.target.value as 'slow' | 'normal' | 'fast'
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                {/* Theme */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Theme</label>
                  </div>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        theme: e.target.value as 'light' | 'dark' | 'auto'
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                {/* Auto Expand */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Auto Expand Thoughts</label>
                  </div>
                  <Switch
                    checked={settings.autoExpand}
                    onCheckedChange={(checked) =>
                      setSettings(prev => ({ ...prev, autoExpand: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatProvider>
          <EnhancedChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onRegenerateResponse={handleRegenerateResponse}
            onCancelMessage={handleCancelMessage}
            isLoading={isLoading}
            canCancelLoading={canCancelLoading}
            inputRef={inputRef}
            enableThinking={settings.showThoughtProcess}
          />
        </ChatProvider>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-border bg-muted/30 p-2">
        <div className="flex items-center justify-center text-xs text-muted-foreground">
          <Brain className="h-3 w-3 mr-1" />
          Thinking Demo • Privacy-safe thought process simulation
          <Badge variant="outline" className="ml-2 text-xs">
            Speed: {settings.animationSpeed}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ThinkingDemo;