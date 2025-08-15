import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { TokenCursor } from './TokenCursor';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';

interface StreamedMessageProps {
  content: string;
  isStreaming: boolean;
  className?: string;
  enableTypingAnimation?: boolean;
  onTypingComplete?: () => void;
}

export const StreamedMessage: React.FC<StreamedMessageProps> = ({
  content,
  isStreaming,
  className,
  enableTypingAnimation = true,
  onTypingComplete,
}) => {
  const { displayText, isTyping } = useTypingAnimation({
    text: content,
    speed: 2, // characters per interval
    interval: 16, // ~60fps
    onComplete: onTypingComplete,
  });

  // Use typing animation only if enabled and content is substantial
  const shouldUseTyping = enableTypingAnimation && content.length > 10;
  const finalText = shouldUseTyping ? displayText : content;
  const showCursor = isStreaming || (shouldUseTyping && isTyping);

  return (
    <div className={cn('flex gap-3 items-start', className)}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Message bubble */}
      <Card className="flex-1 max-w-[80%]">
        <CardContent className="p-3">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {/* Content with potential cursor */}
            <span className="whitespace-pre-wrap">
              {finalText}
              {showCursor && <TokenCursor />}
            </span>
            
            {/* Screen reader status */}
            <div 
              className="sr-only" 
              role="status" 
              aria-live="polite" 
              aria-atomic="false"
            >
              {isStreaming ? 'Receiving response...' : 'Response complete'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};