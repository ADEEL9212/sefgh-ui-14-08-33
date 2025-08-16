import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Send, User, Bot, Loader2, Plus, Menu, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThinkingAnimation } from '@/components/ThinkingAnimation';
import { SearchBar } from '@/components/SearchBar';
import { ToolsPanel, useToolsPanel } from '@/components/ToolsPanel';
import { CanvasPanel } from '@/components/CanvasPanel';
import { useCanvas } from '@/hooks/useCanvas';
import { searchGitHub, sendMessage, SearchResult } from '@/utils/api';
import { chatAnimations, uiAnimations, layoutAnimations } from '@/components/animations';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchResults?: SearchResult[];
  toolUsed?: string;
  scope?: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEditMessage?: (id: string, newContent: string) => void;
  onDeleteMessage?: (id: string) => void;
  onRegenerateResponse?: (id: string) => void;
  onToggleGithubSearch?: () => void;
  onOpenCanvas?: () => void;
  onCancelMessage?: () => void;
  isLoading: boolean;
  canCancelLoading?: boolean;
  inputRef?: React.RefObject<HTMLTextAreaElement>;
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
  searchResults?: SearchResult[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, searchResults }) => {
  const isUser = message.type === 'user';
  
  return (
    <motion.div
      variants={chatAnimations.message}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        {/* Message Content */}
        <div className={`
          rounded-2xl px-4 py-3 max-w-full
          ${isUser 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted text-muted-foreground'
          }
        `}>
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </div>
          
          {/* Search Results */}
          {searchResults && searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs opacity-70 font-medium">Search Results:</div>
              {searchResults.slice(0, 3).map((result) => (
                <motion.div
                  key={result.id}
                  className="bg-background/50 rounded-lg p-3 text-foreground"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs opacity-70 mt-1">{result.description}</div>
                  {result.repository && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {result.repository} • {result.language}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-2 opacity-50 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
  canCancelLoading = false,
  inputRef: externalInputRef
}) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [currentScope, setCurrentScope] = useState<string>();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = externalInputRef || chatInputRef;
  
  // Custom hooks
  const { toast } = useToast();
  const toolsPanel = useToolsPanel();
  const canvas = useCanvas();
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle search submission
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchGitHub(query, currentScope as any);
      setSearchResults(results);
      
      // Create a message with search results
      const searchMessage = `Search results for "${query}"${currentScope ? ` in ${currentScope}` : ''}`;
      onSendMessage(searchMessage);
      
      toast({
        title: "Search completed",
        description: `Found ${results.length} results for "${query}"`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Could not perform search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  }, [currentScope, onSendMessage, toast]);

  // Handle tool selection
  const handleToolSelect = useCallback((tool: any) => {
    if (tool.scope) {
      setCurrentScope(tool.scope);
      toast({
        title: `Tool selected: ${tool.label}`,
        description: `Search scope set to ${tool.scope}`,
      });
    }
  }, [toast]);

  // Handle chat message submission
  const handleChatSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const message = chatInput.trim();
    setChatInput('');
    
    // Send message with current context
    onSendMessage(message);
  }, [chatInput, isLoading, onSendMessage]);

  // Handle file upload
  const handleFileUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,.pdf,.txt,.md,.json';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        toast({
          title: "Files selected",
          description: `${files.length} file(s) ready to upload`,
        });
        // Handle file upload logic here
      }
    };
    input.click();
  }, [toast]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Search Bar */}
      <motion.header 
        className="flex-shrink-0 p-4 border-b border-border bg-card/50 backdrop-blur-sm"
        variants={layoutAnimations.fadeInUp}
        initial="initial"
        animate="animate"
      >
        <div className="max-w-4xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search GitHub or Ask anything..."
            isLoading={isSearching}
            className="w-full"
          />
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Messages */}
        <motion.div 
          className="flex-1 flex flex-col"
          variants={layoutAnimations.fadeInUp}
          initial="initial"
          animate="animate"
        >
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4">
            <div className="max-w-4xl mx-auto py-4 space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <motion.div 
                  className="text-center py-12"
                  variants={layoutAnimations.fadeInUp}
                  initial="initial"
                  animate="animate"
                >
                  <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to SEFGH-AI</h3>
                  <p className="text-muted-foreground">
                    Start a conversation by typing a message below. I can help you search GitHub repositories and answer questions.
                  </p>
                </motion.div>
              )}

              <AnimatePresence mode="popLayout">
                {messages.map((message) => (
                  <MessageBubble 
                    key={message.id} 
                    message={message}
                    searchResults={message.searchResults}
                  />
                ))}
              </AnimatePresence>
              
              {/* Typing Indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    variants={chatAnimations.typingIndicator}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ThinkingAnimation visible={isLoading} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Chat Input */}
          <motion.div 
            className="flex-shrink-0 p-4 border-t border-border bg-card/50 backdrop-blur-sm"
            variants={layoutAnimations.fadeInUp}
            initial="initial"
            animate="animate"
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleChatSubmit}>
                <div className="relative flex items-end gap-3 bg-background border border-border rounded-xl p-3">
                  {/* Tools Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={toolsPanel.toggleTools}
                          className={`h-8 w-8 p-0 ${toolsPanel.isOpen ? 'bg-accent' : ''}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Open tools</TooltipContent>
                  </Tooltip>

                  {/* Text Input */}
                  <Textarea
                    ref={inputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Message SEFGH-AI..."
                    className="flex-1 min-h-[20px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit(e);
                      }
                    }}
                    disabled={isLoading}
                  />

                  {/* Send Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!chatInput.trim() || isLoading}
                          className="h-8 w-8 p-0"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>Send message</TooltipContent>
                  </Tooltip>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>

        {/* Tools Panel */}
        <ToolsPanel
          isOpen={toolsPanel.isOpen}
          onClose={toolsPanel.closeTools}
          onToolSelect={handleToolSelect}
          selectedTool={toolsPanel.selectedTool}
          onCanvasOpen={canvas.openCanvas}
          className="lg:relative lg:right-0"
        />
      </div>

      {/* Canvas Overlay */}
      <AnimatePresence>
        {canvas.isOpen && canvas.canvas && (
          <motion.div
            className="fixed inset-0 z-50 bg-background"
            variants={layoutAnimations.slideUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CanvasPanel
              isOpen={canvas.isOpen}
              canvas={canvas.canvas}
              hasUnsavedChanges={canvas.hasUnsavedChanges}
              onClose={canvas.closeCanvas}
              onSave={canvas.saveCanvas}
              onContentChange={canvas.updateContent}
              onTitleChange={canvas.updateTitle}
              onModeChange={canvas.updateMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};