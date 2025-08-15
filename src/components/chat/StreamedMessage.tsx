import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { TokenCursor } from './TokenCursor';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';

interface StreamedMessageProps {
  content: string;
  isComplete: boolean;
  className?: string;
  showCursor?: boolean;
}

/**
 * Message component with smooth typewriter effect for streaming content
 * Replaces skeleton with text as tokens arrive
 */
export const StreamedMessage: React.FC<StreamedMessageProps> = ({
  content,
  isComplete,
  className,
  showCursor = true
}) => {
  const { displayText, isTyping, setTargetText } = useTypingAnimation({
    speed: 50, // characters per second
    respectReducedMotion: true
  });

  // Update target text when content changes
  useEffect(() => {
    setTargetText(content);
  }, [content, setTargetText]);

  return (
    <div className={cn("flex gap-3", className)}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Message content */}
      <Card className="flex-1 max-w-[80%]">
        <CardContent className="p-3">
          <div className="whitespace-pre-wrap break-words">
            {displayText}
            <TokenCursor 
              visible={showCursor && (isTyping || !isComplete)} 
              className="text-muted-foreground" 
            />
          </div>
          
          {isComplete && (
            <div className="flex items-center mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};