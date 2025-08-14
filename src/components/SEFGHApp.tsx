import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppHeader } from './AppHeader';
import { NavigationPanel } from './NavigationPanel';
import { SearchPanel } from './SearchPanel';
import { ChatPanel } from './ChatPanel';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { HistoryPanel } from './panels/HistoryPanel';
import { LanguagePanel } from './panels/LanguagePanel';
import { ConsolePanel } from './panels/ConsolePanel';
import { ProxyPanel } from './panels/ProxyPanel';
import { AllPagesPanel } from './panels/AllPagesPanel';
import { CanvasPanel } from './CanvasPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
}

interface LogEntry {
  id: string;
  type: 'log' | 'error' | 'warn' | 'info';
  message: string;
  timestamp: Date;
}

interface ProxySettings {
  enabled: boolean;
  address: string;
  port: string;
  username: string;
  password: string;
  requiresAuth: boolean;
}

interface CanvasData {
  id: string;
  title: string;
  content: string;
  mode: 'markdown' | 'code' | 'text';
  lastModified: Date;
}

interface AppState {
  theme: 'light' | 'dark';
  isNavOpen: boolean;
  isSearchVisible: boolean;
  isCanvasOpen: boolean;
  activeView: string;
  selectedVersion: string;
  selectedLanguage: string;
  messages: Message[];
  chatSessions: ChatSession[];
  consoleLogs: LogEntry[];
  proxySettings: ProxySettings;
  isLoading: boolean;
  canCancelLoading: boolean;
  githubSearchQuery?: string;
  currentCanvas: CanvasData | null;
  hasUnsavedChanges: boolean;
}

const initialState: AppState = {
  theme: 'light',
  isNavOpen: false,
  isSearchVisible: false,
  isCanvasOpen: false,
  activeView: 'chat',
  selectedVersion: 'v3',
  selectedLanguage: 'en',
  messages: [],
  chatSessions: [],
  consoleLogs: [],
  proxySettings: {
    enabled: false,
    address: '',
    port: '',
    username: '',
    password: '',
    requiresAuth: false,
  },
  isLoading: false,
  canCancelLoading: false,
  githubSearchQuery: undefined,
  currentCanvas: null,
  hasUnsavedChanges: false,
};

export const SEFGHApp = () => {
  const [state, setState] = useState<AppState>(initialState);
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const currentAbortControllerRef = useRef<AbortController | null>(null);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sefgh-app-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          ...parsed,
          // Parse dates
          messages: parsed.messages?.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })) || [],
          chatSessions: parsed.chatSessions?.map((session: any) => ({
            ...session,
            timestamp: new Date(session.timestamp),
            messages: session.messages?.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })) || [],
          })) || [],
          consoleLogs: parsed.consoleLogs?.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp),
          })) || [],
        }));
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('sefgh-theme') || 'light';
    setState(prev => ({ ...prev, theme: savedTheme as 'light' | 'dark' }));
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sefgh-app-state', JSON.stringify(state));
    localStorage.setItem('sefgh-theme', state.theme);
  }, [state]);

  // Override console functions to capture logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info,
    };

    const createLogCapture = (type: LogEntry['type'], originalFn: Function) => {
      return (...args: any[]) => {
        originalFn.apply(console, args);
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        
        const logEntry: LogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          type,
          message,
          timestamp: new Date(),
        };

        setState(prev => ({
          ...prev,
          consoleLogs: [logEntry, ...prev.consoleLogs].slice(0, 100), // Keep last 100 logs
        }));
      };
    };

    console.log = createLogCapture('log', originalConsole.log);
    console.error = createLogCapture('error', originalConsole.error);
    console.warn = createLogCapture('warn', originalConsole.warn);
    console.info = createLogCapture('info', originalConsole.info);

    return () => {
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;
    };
  }, []);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    updateState({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    
    toast({
      title: `Switched to ${newTheme} mode`,
      duration: 2000,
    });
  }, [state.theme, updateState, toast]);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    updateState({ 
      messages: [...state.messages, userMessage],
      isLoading: true,
      canCancelLoading: false,
    });

    // Create abort controller for timeout and cancellation
    const abortController = new AbortController();
    currentAbortControllerRef.current = abortController;
    
    // Enable cancellation after 5 seconds
    const cancelTimeoutId = setTimeout(() => {
      updateState(prev => ({ ...prev, canCancelLoading: true }));
    }, 5000);
    
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 20000); // 20 second timeout

    try {
      const response = await fetch('https://api.sefgh.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
        signal: abortController.signal,
      });

      // Clear timeouts if request completes
      clearTimeout(timeoutId);
      clearTimeout(cancelTimeoutId);
      currentAbortControllerRef.current = null;

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract message and query from API response
      let messageContent = '';
      let shouldOpenGithubSearch = false;
      let githubQuery = '';

      if (data && typeof data === 'object') {
        // Type 1: Has both message and query
        if (data.message && data.query) {
          messageContent = data.message;
          shouldOpenGithubSearch = true;
          githubQuery = data.query;
        }
        // Type 2: Has only message
        else if (data.message) {
          messageContent = data.message;
        }
        // Fallback: stringify the whole response
        else {
          messageContent = JSON.stringify(data, null, 2);
        }
      } else {
        messageContent = String(data);
      }
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: messageContent,
        timestamp: new Date(),
      };

      updateState({ 
        messages: [...state.messages, userMessage, assistantMessage],
        isLoading: false,
        canCancelLoading: false,
        // If there's a query, open the GitHub search panel
        ...(shouldOpenGithubSearch && { 
          isSearchVisible: true,
          githubSearchQuery: githubQuery
        })
      });

    } catch (error) {
      // Clear timeouts if error occurs
      clearTimeout(timeoutId);
      clearTimeout(cancelTimeoutId);
      currentAbortControllerRef.current = null;
      
      console.error('API Error:', error);
      
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again later.';
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The AI service may be busy. Please try again.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to the AI service. Please check your internet connection and try again.';
        }
      }
      
      const errorResponseMessage: Message = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: errorMessage,
        timestamp: new Date(),
      };

      updateState({ 
        messages: [...state.messages, userMessage, errorResponseMessage],
        isLoading: false,
        canCancelLoading: false,
      });
    }
  }, [state.messages, updateState]);

  const cancelMessage = useCallback(() => {
    if (currentAbortControllerRef.current) {
      currentAbortControllerRef.current.abort();
      currentAbortControllerRef.current = null;
    }
    
    updateState({ 
      isLoading: false,
      canCancelLoading: false,
    });
    
    toast({
      title: "Request cancelled",
      description: "The AI request has been cancelled.",
      duration: 2000,
    });
  }, [updateState, toast]);

  const editMessage = useCallback((messageId: string, newContent: string) => {
    const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after the edited message and update the edited message
    const updatedMessages = state.messages.slice(0, messageIndex + 1);
    updatedMessages[messageIndex].content = newContent;

    updateState({ messages: updatedMessages });

    // If it's a user message, resend it
    if (updatedMessages[messageIndex].type === 'user') {
      sendMessage(newContent);
    }
  }, [state.messages, updateState, sendMessage]);

  const deleteMessage = useCallback((messageId: string) => {
    const updatedMessages = state.messages.filter(msg => msg.id !== messageId);
    updateState({ messages: updatedMessages });
  }, [state.messages, updateState]);

  const regenerateResponse = useCallback((messageId: string) => {
    const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Find the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex >= 0 && state.messages[userMessageIndex].type === 'user') {
      // Remove the assistant message and regenerate
      const updatedMessages = state.messages.slice(0, messageIndex);
      updateState({ messages: updatedMessages });
      sendMessage(state.messages[userMessageIndex].content);
    }
  }, [state.messages, updateState, sendMessage]);

  const setActiveView = useCallback((view: string) => {
    updateState({ activeView: view });
  }, [updateState]);

  const focusSearchInput = useCallback(() => {
    updateState({ isSearchVisible: true });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  }, [updateState]);

  const focusChatInput = useCallback(() => {
    setActiveView('chat');
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  }, [setActiveView]);

  const handleNewChat = useCallback(() => {
    updateState({ messages: [], activeView: 'chat' });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 100);
  }, [updateState]);

  // Canvas handlers
  const openCanvas = useCallback(() => {
    if (!state.currentCanvas) {
      const newCanvas: CanvasData = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Untitled Document',
        content: '',
        mode: 'markdown',
        lastModified: new Date(),
      };
      updateState({ 
        currentCanvas: newCanvas,
        isCanvasOpen: true,
        hasUnsavedChanges: false 
      });
    } else {
      updateState({ isCanvasOpen: true });
    }
  }, [state.currentCanvas, updateState]);

  const closeCanvas = useCallback(() => {
    updateState({ isCanvasOpen: false });
  }, [updateState]);

  const saveCanvas = useCallback((canvas: CanvasData) => {
    updateState({ 
      currentCanvas: canvas,
      hasUnsavedChanges: false 
    });
    
    // Save to localStorage
    const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
    const existingIndex = savedCanvases.findIndex((c: CanvasData) => c.id === canvas.id);
    
    if (existingIndex >= 0) {
      savedCanvases[existingIndex] = canvas;
    } else {
      savedCanvases.push(canvas);
    }
    
    localStorage.setItem('sefgh-canvases', JSON.stringify(savedCanvases));
  }, [updateState]);

  const updateCanvasContent = useCallback((content: string) => {
    if (state.currentCanvas) {
      updateState({ 
        currentCanvas: { ...state.currentCanvas, content },
        hasUnsavedChanges: true 
      });
    }
  }, [state.currentCanvas, updateState]);

  const updateCanvasTitle = useCallback((title: string) => {
    if (state.currentCanvas) {
      updateState({ 
        currentCanvas: { ...state.currentCanvas, title },
        hasUnsavedChanges: true 
      });
    }
  }, [state.currentCanvas, updateState]);

  const updateCanvasMode = useCallback((mode: 'markdown' | 'code' | 'text') => {
    if (state.currentCanvas) {
      updateState({ 
        currentCanvas: { ...state.currentCanvas, mode },
        hasUnsavedChanges: true 
      });
    }
  }, [state.currentCanvas, updateState]);

  const renderActivePanel = () => {
    switch (state.activeView) {
      case 'chat':
        return (
          <ChatPanel
            messages={state.messages}
            onSendMessage={sendMessage}
            onEditMessage={editMessage}
            onDeleteMessage={deleteMessage}
            onRegenerateResponse={regenerateResponse}
            onToggleGithubSearch={() => updateState({ isSearchVisible: !state.isSearchVisible })}
            onOpenCanvas={openCanvas}
            onCancelMessage={cancelMessage}
            isLoading={state.isLoading}
            canCancelLoading={state.canCancelLoading}
            inputRef={chatInputRef}
          />
        );
      case 'history':
        return (
          <HistoryPanel
            sessions={state.chatSessions}
            onLoadSession={(sessionId) => {
              const session = state.chatSessions.find(s => s.id === sessionId);
              if (session) {
                updateState({ 
                  messages: session.messages,
                  activeView: 'chat',
                });
              }
            }}
            onDeleteSession={(sessionId) => {
              const updatedSessions = state.chatSessions.filter(s => s.id !== sessionId);
              updateState({ chatSessions: updatedSessions });
            }}
          />
        );
      case 'language':
        return (
          <LanguagePanel
            selectedLanguage={state.selectedLanguage}
            onLanguageChange={(language) => {
              updateState({ selectedLanguage: language });
              toast({
                title: "Language Changed",
                description: `Interface language changed to ${language.toUpperCase()}`,
                duration: 2000,
              });
            }}
          />
        );
      case 'console':
        return (
          <ConsolePanel
            logs={state.consoleLogs}
            onClearLogs={() => updateState({ consoleLogs: [] })}
          />
        );
      case 'proxy':
        return (
          <ProxyPanel
            settings={state.proxySettings}
            onSettingsChange={(settings) => updateState({ proxySettings: settings })}
          />
        );
      case 'all-pages':
        return <AllPagesPanel onNavigate={setActiveView} />;
      case 'docs':
      case 'playground':
      case 'settings':
        return (
          <Card className="m-6">
            <CardHeader>
              <CardTitle className="capitalize">{state.activeView}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This section is under development. Check back soon for updates!
              </p>
            </CardContent>
          </Card>
        );
      default:
        return <AllPagesPanel onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <AppHeader
        theme={state.theme}
        selectedVersion={state.selectedVersion}
        onThemeToggle={toggleTheme}
        onNavToggle={() => updateState({ isNavOpen: !state.isNavOpen })}
        onSearchToggle={() => updateState({ isSearchVisible: !state.isSearchVisible })}
        onVersionChange={(version) => {
          updateState({ selectedVersion: version });
          toast({
            title: `Switched to ${version.toUpperCase()}`,
            description: "AI model version updated",
            duration: 2000,
          });
        }}
      />

      <main className="flex-1 flex pt-14 overflow-hidden">
        <NavigationPanel
          isOpen={state.isNavOpen}
          activeView={state.activeView}
          theme={state.theme}
          onViewChange={setActiveView}
          onThemeToggle={toggleTheme}
          onClose={() => updateState({ isNavOpen: false })}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {renderActivePanel()}
          </div>

          <SearchPanel
            isVisible={state.isSearchVisible}
            onClose={() => updateState({ isSearchVisible: false, githubSearchQuery: undefined })}
            inputRef={searchInputRef}
            autoSearchQuery={state.githubSearchQuery}
            onQueryProcessed={() => updateState({ githubSearchQuery: undefined })}
          />

          <CanvasPanel
            isOpen={state.isCanvasOpen}
            canvas={state.currentCanvas}
            hasUnsavedChanges={state.hasUnsavedChanges}
            onClose={closeCanvas}
            onSave={saveCanvas}
            onContentChange={updateCanvasContent}
            onTitleChange={updateCanvasTitle}
            onModeChange={updateCanvasMode}
          />
        </div>
      </main>

      <KeyboardShortcuts
        onFocusSearchInput={focusSearchInput}
        onFocusChatInput={focusChatInput}
        onToggleNav={() => updateState({ isNavOpen: !state.isNavOpen })}
        onToggleSearch={() => updateState({ isSearchVisible: !state.isSearchVisible })}
        onNewChat={handleNewChat}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
};