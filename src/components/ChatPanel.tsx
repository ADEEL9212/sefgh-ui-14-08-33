import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ExpandablePromptInput } from '@/components/ExpandablePromptInput';
import { ToolsDropdown } from '@/components/ToolsDropdown';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Send, 
  Copy, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  User, 
  Bot,
  Loader2,
  Plus,
  Paperclip,
  HardDrive,
  Code,
  Mic,
  Settings,
  Github,
  ImageIcon,
  Lightbulb,
  Globe,
  PaintBucket,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Filter,
  X,
  Search,
  MoreHorizontal
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const ChatPanel = ({
  messages,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onRegenerateResponse,
  onToggleGithubSearch,
  onOpenCanvas,
  onCancelMessage,
  isLoading,
  canCancelLoading = false,
  inputRef,
}: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachMenu && !(event.target as Element).closest('.attach-menu-container')) {
        setShowAttachMenu(false);
      }
      if (showToolsMenu && !(event.target as Element).closest('.tools-menu-container')) {
        setShowToolsMenu(false);
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAttachMenu, showToolsMenu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleEdit = (messageId: string, content: string) => {
    setEditingMessage(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = (messageId: string) => {
    if (editContent.trim()) {
      onEditMessage(messageId, editContent.trim());
      setEditingMessage(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
      duration: 2000,
    });
  };


  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log('Selected files:', Array.from(files).map(file => file.name));
      toast({
        title: "Files selected",
        description: `${files.length} file(s) selected: ${Array.from(files).map(f => f.name).join(', ')}`,
        duration: 3000,
      });
    }
  };

  const getMessageWidth = (content: string, type: 'user' | 'assistant') => {
    const length = content.length;
    const hasCodeBlock = content.includes('```') || content.includes('`');
    const isList = content.includes('\n-') || content.includes('\n*') || content.includes('\n1.');
    const lineCount = content.split('\n').length;
    
    // Code blocks and lists need more space but still constrained
    if (hasCodeBlock || isList) {
      return 'max-w-[75%] sm:max-w-[80%]';
    }
    
    // Very dynamic sizing based on content length and structure
    if (length < 30) {
      return 'max-w-[40%] sm:max-w-[45%] min-w-fit';
    } else if (length < 80) {
      return 'max-w-[50%] sm:max-w-[55%]';
    } else if (length < 150) {
      return 'max-w-[60%] sm:max-w-[65%]';
    } else if (length < 300) {
      return 'max-w-[70%] sm:max-w-[75%]';
    } else {
      return 'max-w-[75%] sm:max-w-[80%]';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice search is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: "Failed to recognize speech. Please try again.",
        duration: 3000,
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Welcome to SEFGH-AI</h3>
            <p className="text-muted-foreground">
              Start a conversation by typing a message below. I can help you search GitHub repositories and answer questions.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble flex gap-3 group ${
              message.type === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
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

            <Card className={`
              flex-1 transition-all duration-200 ${getMessageWidth(message.content, message.type)}
              ${message.type === 'user' ? 'bg-brand text-brand-foreground' : ''}
            `}>
              <CardContent className="p-3">
                {editingMessage === message.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] bg-gray-100 dark:bg-gray-800"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(message.id)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        Save & Submit
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleCancelEdit}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 py-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    <div className={`flex items-center mt-3 pt-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-between'
                    }`}>
                      {message.type === 'assistant' && (
                        <span className="text-xs opacity-70">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      )}
                      {message.type === 'user' && (
                        <span className="text-xs opacity-70 mr-2">
                          {formatTimestamp(message.timestamp)}
                        </span>
                      )}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(message.content)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {message.type === 'user' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(message.id, message.content)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        )}
                        {message.type === 'assistant' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onRegenerateResponse(message.id)}
                            className="h-7 w-7 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteMessage(message.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <Card className="flex-1 max-w-[80%]">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">AI is thinking...</span>
                  </div>
                  {canCancelLoading && onCancelMessage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onCancelMessage}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      title="Cancel request"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {/* Input area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="relative">
          {/* Tools panel - shows when tools button is clicked */}
          {showToolsMenu && (
            <div className="tools-menu-container relative">
              <div className="mb-3 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl p-4 border border-gray-700" 
                   style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div className="space-y-1">
                  {/* Add photos & files */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      handleFileUpload();
                      setShowToolsMenu(false);
                    }}
                  >
                    <Paperclip className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">Add photos & files</span>
                  </div>
                  
                  {/* Separator */}
                  <div className="h-px bg-gray-600 my-2"></div>
                  
                  {/* Study and Learn */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      console.log('Study and Learn tool launched');
                      setShowToolsMenu(false);
                    }}
                  >
                    <BookOpen className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">Study and learn</span>
                  </div>
                  
                  {/* Think Longer */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      console.log('Think Longer tool launched');
                      setShowToolsMenu(false);
                    }}
                  >
                    <Lightbulb className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">Think longer</span>
                  </div>
                  
                  {/* Deep Research */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      console.log('Deep Research tool launched');
                      setShowToolsMenu(false);
                    }}
                  >
                    <Search className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">Deep research</span>
                  </div>
                  
                  {/* Separator */}
                  <div className="h-px bg-gray-600 my-2"></div>
                  
                  {/* GitHub search */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      onToggleGithubSearch?.();
                      setShowToolsMenu(false);
                    }}
                  >
                    <Github className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">GitHub search</span>
                  </div>
                  
                  {/* Gitee search */}
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                    onClick={() => {
                      console.log('Gitee search tool launched');
                      setShowToolsMenu(false);
                    }}
                  >
                    <Code className="h-5 w-5 text-gray-300" />
                    <span className="text-sm font-medium text-gray-200">Gitee search</span>
                  </div>
                  
                  {/* Separator */}
                  <div className="h-px bg-gray-600 my-2"></div>
                  
                  {/* More menu */}
                  <div 
                    className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150 relative"
                    onMouseEnter={() => setShowMoreMenu(true)}
                    onMouseLeave={() => setShowMoreMenu(false)}
                  >
                    <div className="flex items-center gap-3">
                      <MoreHorizontal className="h-5 w-5 text-gray-300" />
                      <span className="text-sm font-medium text-gray-200">More</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    
                    {/* Secondary dropdown panel */}
                    {showMoreMenu && (
                      <div className="absolute left-full top-0 ml-2 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl p-4 w-48 z-50"
                           style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                        <div className="space-y-1">
                          {/* Web Search */}
                          <div 
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                            onClick={() => {
                              console.log('Web Search tool launched');
                              setShowToolsMenu(false);
                              setShowMoreMenu(false);
                            }}
                          >
                            <Globe className="h-5 w-5 text-gray-300" />
                            <span className="text-sm font-medium text-gray-200">Web search</span>
                          </div>
                          
                          {/* Canvas */}
                          <div 
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer transition-all duration-150"
                            onClick={() => {
                              onOpenCanvas?.();
                              setShowToolsMenu(false);
                              setShowMoreMenu(false);
                            }}
                          >
                            <PaintBucket className="h-5 w-5 text-gray-300" />
                            <span className="text-sm font-medium text-gray-200">Canvas</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search input container */}
          <div className="bg-card border-2 border-border focus-within:border-ring rounded-xl px-4 py-3 flex items-center gap-3 transition-colors">
            {/* File Upload Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFileUpload}
                  className="h-6 w-6 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload files or photos</TooltipContent>
            </Tooltip>
            
            {/* Tools toggle button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className={`flex items-center gap-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg px-2 py-1 text-sm transition-colors ${
                showToolsMenu ? 'bg-slate-700 text-white' : ''
              }`}
            >
              <Filter className="h-4 w-4" />
              + Tools
            </Button>

            {/* Input field */}
            <ExpandablePromptInput
              ref={inputRef}
              value={input}
              onChange={setInput}
              placeholder="Ask anything"
              className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Voice input button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 rounded-full ${
                      isListening 
                        ? 'text-blue-400 animate-pulse' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                    } transition-colors`}
                    onClick={handleVoiceSearch}
                    disabled={isListening}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isListening ? 'Listening...' : 'Voice input'}</p>
                </TooltipContent>
              </Tooltip>

              {/* Send button - only visible when there's text */}
              {input.trim() && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="h-6 w-6 rounded-full bg-blue-600 text-white hover:bg-blue-500 p-0 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};