import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ThoughtTimeline } from './ThoughtTimeline';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/providers/ChatProvider';

interface ThinkingBarProps {
  className?: string;
  status?: string;
  showInlineChips?: boolean;
}

/**
 * Compact thinking indicator bar with optional thought process preview
 * Shows animated dots, progress pulse, status text, and stop button
 */
export const ThinkingBar: React.FC<ThinkingBarProps> = ({
  className,
  status,
  showInlineChips = false
}) => {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const { visible, canCancel, steps, activeStep, onCancel } = useChatContext();

  if (!visible) return null;

  // Get current status from active step or use provided status
  const currentStatus = status || 
    (activeStep && steps.find(s => s.id === activeStep)?.label) || 
    "Thinking...";

  // Get active step for chip display
  const activeStepData = activeStep ? steps.find(s => s.id === activeStep) : null;

  return (
    <div className={cn("w-full", className)}>
      {/* Main thinking bar */}
      <Card className="border-b-0 rounded-b-none">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated dots */}
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse motion-reduce:animate-none" 
                     style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse motion-reduce:animate-none" 
                     style={{ animationDelay: '200ms' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse motion-reduce:animate-none" 
                     style={{ animationDelay: '400ms' }} />
              </div>

              {/* Status text */}
              <span className="text-sm font-medium text-primary">
                {currentStatus}
              </span>

              {/* Inline chips */}
              {showInlineChips && activeStepData && (
                <div className="flex gap-2">
                  {activeStepData.toolName && (
                    <div className="bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full animate-slide-in-left motion-reduce:animate-none">
                      {getChipIcon(activeStepData.toolName)} {activeStepData.toolName}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stop button */}
            {canCancel && onCancel && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onCancel}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                title="Stop generation"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Progress pulse bar */}
          <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full w-1/3 animate-pulse motion-reduce:animate-none" />
          </div>
        </CardContent>
      </Card>

      {/* Thought timeline */}
      <ThoughtTimeline
        steps={steps}
        isOpen={isTimelineOpen}
        onToggle={() => setIsTimelineOpen(!isTimelineOpen)}
      />
    </div>
  );
};

// Helper function for chip icons
const getChipIcon = (toolName: string): string => {
  switch (toolName) {
    case 'web':
    case 'search':
      return '🔎';
    case 'api':
    case 'fetch':
      return '🌐';
    case 'code-run':
    case 'code':
      return '🧰';
    case 'plan':
      return '🧠';
    default:
      return '🔧';
  }
};