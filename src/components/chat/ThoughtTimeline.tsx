import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ThoughtStep, getStepIcon, formatDuration } from '@/lib/chatEvents';

interface ThoughtTimelineProps {
  steps: ThoughtStep[];
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Toggleable panel showing high-level timeline of thinking steps
 * Privacy-safe: only structured status events, no chain-of-thought
 */
export const ThoughtTimeline: React.FC<ThoughtTimelineProps> = ({
  steps,
  isOpen,
  onToggle,
  className
}) => {
  return (
    <Card className={cn("border-t-0 rounded-t-none", className)}>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-3 h-auto font-normal"
          >
            <span className="text-sm text-muted-foreground">What I'm doing</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-3">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
                    step.status === 'active' && "bg-accent/50 animate-pulse motion-reduce:animate-none",
                    step.status === 'done' && "opacity-75",
                    step.status === 'error' && "bg-destructive/10"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    step.status === 'pending' && "bg-muted text-muted-foreground",
                    step.status === 'active' && "bg-primary text-primary-foreground",
                    step.status === 'done' && "bg-green-500 text-white",
                    step.status === 'error' && "bg-destructive text-destructive-foreground"
                  )}>
                    {step.status === 'done' ? '✓' : getStepIcon(step.id, step.toolName)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        step.status === 'active' && "text-primary",
                        step.status === 'error' && "text-destructive"
                      )}>
                        {step.label}
                      </span>
                      
                      {step.toolName && (
                        <span className="text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">
                          {step.toolName}
                        </span>
                      )}
                    </div>
                    
                    {step.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.note}
                      </p>
                    )}
                  </div>

                  {/* Timing */}
                  {(step.startedAt || step.endedAt) && (
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {formatDuration(step.startedAt, step.endedAt) || 
                       (step.startedAt && '...')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};