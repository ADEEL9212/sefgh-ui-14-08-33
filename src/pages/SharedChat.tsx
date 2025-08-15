import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MessageSquare, User, Bot, ArrowLeft, Share2, Copy } from 'lucide-react';
import { ChatService, type ShareableChatData } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';

const SharedChat = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [chatData, setChatData] = useState<ShareableChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!shareId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const loadSharedChat = () => {
      try {
        const data = ChatService.getSharedChat(shareId);
        if (data) {
          setChatData(data);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Failed to load shared chat:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadSharedChat();
  }, [shareId]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy share link",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const goHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading shared conversation...</p>
        </div>
      </div>
    );
  }

  if (notFound || !chatData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Chat Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This shared conversation could not be found or may have been removed.
            </p>
            <Button onClick={goHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to SEFGH-AI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={goHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                SEFGH-AI
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{chatData.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(chatData.timestamp)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {chatData.messages.length} messages
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Shared publicly
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {chatData.messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-4 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground ml-12'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">
                    {message.type === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
              </div>

              {message.type === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This conversation was shared from SEFGH-AI
          </p>
          <Button onClick={goHome}>
            Start Your Own Conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedChat;