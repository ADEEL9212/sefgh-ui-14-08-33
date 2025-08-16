/**
 * ThinkingBar - Compact indicator bar with animated dots, status text, and stop button
 * Appears while the model is generating and shows high-level progress
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Globe, Brain, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/providers/ChatProvider';
import { TOOL_EVENTS, ToolEventType } from '@/lib/chatEvents';

interface ToolChip {
  id: string;
  type: ToolEventType;
  visible: boolean;
}

interface ThinkingBarProps {
  className?: string;
}

export const ThinkingBar = React.forwardRef<ThinkingBarRef, ThinkingBarProps>(
  ({ className = '' }, ref) => {
    const { thinking, cancel } = useChat();
    const [toolChips, setToolChips] = useState<ToolChip[]>([]);
    const [showTimeline, setShowTimeline] = useState(false);
    
    // Check for reduced motion preference
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!thinking.visible) {
      return null;
    }
    
    // Get current status text
    const activeStep = thinking.steps.find(step => step.status === 'active');
    const statusText = activeStep?.label || 'Thinking...';
    
    // Handle stop button click
    const handleStop = () => {
      cancel();
    };
    
    // Handle tool events (called from parent when tool events occur)
    const addToolChip = React.useCallback((type: ToolEventType) => {
      const chipId = `${type}-${Date.now()}`;
      setToolChips(prev => [...prev, { id: chipId, type, visible: true }]);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setToolChips(prev => 
          prev.map(chip => 
            chip.id === chipId ? { ...chip, visible: false } : chip
          )
        );
      }, 3000);
      
      // Remove from array after animation
      setTimeout(() => {
        setToolChips(prev => prev.filter(chip => chip.id !== chipId));
      }, 3500);
    }, []);
    
    // Expose addToolChip to parent components
    React.useImperativeHandle(ref, () => ({
      addToolChip
    }));
  
  const animations = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  } : {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -4 },
    transition: { duration: 0.2, ease: "easeOut" }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className={`
          relative bg-card text-card-foreground border border-border rounded-xl shadow-sm px-3 py-2 
          before:absolute before:inset-x-0 before:top-0 before:h-0.5 
          before:bg-gradient-to-r before:from-primary/60 before:via-accent/40 before:to-transparent
          ${className}
        `}
        {...animations}
        role="status"
        aria-live="polite"
        aria-label="AI thinking progress"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left side: Status and dots */}
          <div className="flex items-center gap-3 flex-1">
            {/* Status text */}
            <span className="text-sm font-medium text-card-foreground">
              {statusText}
            </span>
            
            {/* Animated dots */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                  animate={prefersReducedMotion ? {} : {
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={prefersReducedMotion ? {} : {
                    duration: 1.4,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </div>
            
            {/* Tool chips */}
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {toolChips.map((chip) => (
                  <ToolChipComponent 
                    key={chip.id} 
                    type={chip.type} 
                    visible={chip.visible}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Right side: Toggle and Stop button */}
          <div className="flex items-center gap-2">
            {/* Timeline toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-xs h-6 px-2 text-muted-foreground hover:text-card-foreground"
              aria-expanded={showTimeline}
              aria-controls="thought-timeline"
            >
              What I'm doing
            </Button>
            
            {/* Stop button */}
            {thinking.canCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStop}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Stop generation"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Timeline panel (will be rendered by ThoughtTimeline component) */}
        {showTimeline && (
          <div id="thought-timeline" className="mt-3">
            {/* ThoughtTimeline will be rendered here by parent */}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
});

// Tool chip component
function ToolChipComponent({ 
  type, 
  visible 
}: { 
  type: ToolEventType; 
  visible: boolean; 
}) {
  const toolEvent = TOOL_EVENTS[type];
  const prefersReducedMotion = 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Search': return Search;
      case 'Globe': return Globe;
      case 'Brain': return Brain;
      case 'Code': return Code;
      default: return Search;
    }
  };
  
  const IconComponent = getIcon(toolEvent.icon);
  
  const animations = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: visible ? 1 : 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  } : {
    initial: { opacity: 0, scale: 0.8, x: -10 },
    animate: { 
      opacity: visible ? 1 : 0, 
      scale: visible ? 1 : 0.8, 
      x: visible ? 0 : -10 
    },
    exit: { opacity: 0, scale: 0.8, x: -10 },
    transition: { duration: 0.2, ease: "easeOut" }
  };
  
  return (
    <motion.div
      className="flex items-center gap-1.5 px-2 py-1 bg-accent/10 text-accent rounded-md text-xs"
      {...animations}
    >
      <IconComponent className="h-3 w-3" />
      <span>{toolEvent.label}</span>
    </motion.div>
  );
}

// Export ref type for parent components
export interface ThinkingBarRef {
  addToolChip: (type: ToolEventType) => void;
}