import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, X, Search, Globe, Code, Brain } from 'lucide-react';
import { useChat } from '@/providers/ChatProvider';
import { useReducedMotion } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';
import { ThoughtTimeline } from './ThoughtTimeline';

interface ThinkingBarProps {
  className?: string;
  onToggleTimeline?: (expanded: boolean) => void;
}

// Tool icon mapping
const getToolIcon = (toolName?: string) => {
  switch (toolName) {
    case 'web':
    case 'search':
      return Search;
    case 'api':
    case 'fetch':
      return Globe;
    case 'code':
    case 'code-run':
      return Code;
    default:
      return Brain;
  }
};

// Inline chip component for tool events
const ToolChip: React.FC<{ toolName: string; className?: string }> = ({ toolName, className }) => {
  const Icon = getToolIcon(toolName);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs',
        'bg-accent/10 text-accent border border-accent/20',
        className
      )}
    >
      <Icon className="h-3 w-3" />
      <span className="capitalize">{toolName}</span>
    </motion.div>
  );
};

// Animated three-dot loader
const DotLoader: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className="text-muted-foreground">...</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 h-1 bg-foreground rounded-full"
          animate={{ 
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1, 0.8] 
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export const ThinkingBar: React.FC<ThinkingBarProps> = ({ 
  className, 
  onToggleTimeline 
}) => {
  const { thinking, cancel } = useChat();
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!thinking.visible) {
    return null;
  }

  const activeStep = thinking.steps.find(step => step.status === 'active');
  const statusText = activeStep?.label || 'Thinking...';
  const activeToolSteps = thinking.steps.filter(step => 
    step.status === 'active' && step.toolName
  );

  const handleToggleTimeline = () => {
    const newExpanded = !isTimelineExpanded;
    setIsTimelineExpanded(newExpanded);
    onToggleTimeline?.(newExpanded);
  };

  const handleCancel = () => {
    cancel();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggleTimeline();
    }
  };

  const containerVariants = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: "easeOut" }}
        className={cn(
          'relative bg-card text-card-foreground border border-border rounded-xl shadow-sm',
          'before:absolute before:inset-x-0 before:top-0 before:h-0.5',
          'before:bg-gradient-to-r before:from-primary/60 before:via-accent/40 before:to-transparent',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={`Status: ${statusText}`}
      >
        {/* Main thinking bar */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Toggle button for timeline */}
              <button
                onClick={handleToggleTimeline}
                onKeyDown={handleKeyDown}
                className={cn(
                  'flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-primary rounded'
                )}
                aria-expanded={isTimelineExpanded}
                aria-controls="thought-timeline"
                tabIndex={0}
              >
                {isTimelineExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span>What I'm doing</span>
              </button>

              {/* Status text and loader */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm text-foreground truncate">
                  {statusText}
                </span>
                <DotLoader />
              </div>

              {/* Tool chips */}
              <div className="flex items-center gap-2">
                <AnimatePresence mode="wait">
                  {activeToolSteps.map((step) => (
                    <ToolChip 
                      key={`${step.id}-${step.toolName}`}
                      toolName={step.toolName!}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Cancel button */}
            {thinking.canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className={cn(
                  'h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive',
                  'focus-visible:ring-2 focus-visible:ring-destructive'
                )}
                aria-label="Stop generation"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapsible timeline */}
        <AnimatePresence>
          {isTimelineExpanded && (
            <motion.div
              id="thought-timeline"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: prefersReducedMotion ? 0.1 : 0.3, ease: "easeInOut" }}
              className="border-t border-border/50"
            >
              <div className="p-3">
                <ThoughtTimeline steps={thinking.steps} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};