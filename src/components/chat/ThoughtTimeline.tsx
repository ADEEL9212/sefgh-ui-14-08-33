import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  XCircle, 
  Clock, 
  Search, 
  Globe, 
  Code, 
  Brain,
  MessageSquare,
  Lightbulb,
  PenTool
} from 'lucide-react';
import { ThoughtStep, ThoughtStepId } from '@/lib/chatEvents';
import { useReducedMotion } from '@/hooks/useTypingAnimation';
import { cn } from '@/lib/utils';

interface ThoughtTimelineProps {
  steps: ThoughtStep[];
  className?: string;
}

// Icon mapping for different step types
const getStepIcon = (id: ThoughtStepId, toolName?: string) => {
  if (toolName) {
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
  }

  switch (id) {
    case 'understand':
      return MessageSquare;
    case 'plan':
      return Lightbulb;
    case 'retrieve':
      return Search;
    case 'tool':
      return Code;
    case 'compose':
      return PenTool;
    case 'finalize':
      return CheckCircle;
    default:
      return Circle;
  }
};

// Status icon mapping
const getStatusIcon = (status: ThoughtStep['status']) => {
  switch (status) {
    case 'done':
      return CheckCircle;
    case 'error':
      return XCircle;
    case 'active':
      return Clock;
    case 'pending':
    default:
      return Circle;
  }
};

// Color classes for different statuses
const getStatusColors = (status: ThoughtStep['status']) => {
  switch (status) {
    case 'active':
      return {
        rail: 'bg-primary',
        icon: 'text-primary',
        text: 'text-foreground',
      };
    case 'done':
      return {
        rail: 'bg-green-500',
        icon: 'text-green-500',
        text: 'text-muted-foreground',
      };
    case 'error':
      return {
        rail: 'bg-destructive',
        icon: 'text-destructive',
        text: 'text-destructive',
      };
    case 'pending':
    default:
      return {
        rail: 'bg-muted',
        icon: 'text-muted-foreground',
        text: 'text-muted-foreground',
      };
  }
};

// Format duration
const formatDuration = (startedAt?: number, endedAt?: number): string => {
  if (!startedAt || !endedAt) return '';
  
  const duration = endedAt - startedAt;
  if (duration < 1000) {
    return `${duration}ms`;
  }
  return `${(duration / 1000).toFixed(1)}s`;
};

// Individual step component
const TimelineStep: React.FC<{ 
  step: ThoughtStep; 
  isLast: boolean; 
  index: number;
}> = ({ step, isLast, index }) => {
  const prefersReducedMotion = useReducedMotion();
  const colors = getStatusColors(step.status);
  const StepIcon = getStepIcon(step.id, step.toolName);
  const StatusIcon = getStatusIcon(step.status);
  const duration = formatDuration(step.startedAt, step.endedAt);

  const itemVariants = prefersReducedMotion ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 }
  };

  const iconVariants = prefersReducedMotion ? {} : {
    active: { scale: 1.1 },
    done: { scale: [1, 1.2, 1] }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="initial"
      animate="animate"
      transition={{ 
        duration: prefersReducedMotion ? 0.1 : 0.2, 
        delay: prefersReducedMotion ? 0 : index * 0.08 
      }}
      className="relative flex items-start gap-3"
    >
      {/* Rail line */}
      {!isLast && (
        <div 
          className={cn(
            'absolute left-4 top-8 w-0.5 h-8 transition-colors duration-200',
            colors.rail
          )}
        />
      )}

      {/* Icon */}
      <motion.div
        variants={iconVariants}
        animate={step.status === 'active' ? 'active' : step.status === 'done' ? 'done' : undefined}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn(
          'relative z-10 flex items-center justify-center w-8 h-8 rounded-full',
          'border-2 transition-colors duration-200',
          step.status === 'active' ? 'bg-primary/10 border-primary' :
          step.status === 'done' ? 'bg-green-50 dark:bg-green-950 border-green-500' :
          step.status === 'error' ? 'bg-destructive/10 border-destructive' :
          'bg-muted border-border'
        )}
      >
        {step.status === 'active' && !prefersReducedMotion ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <StepIcon className={cn('h-4 w-4', colors.icon)} />
          </motion.div>
        ) : (
          <StatusIcon className={cn('h-4 w-4', colors.icon)} />
        )}
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className={cn('text-sm font-medium', colors.text)}>
              {step.label}
              {step.toolName && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({step.toolName})
                </span>
              )}
            </h4>
            
            {step.note && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {step.note}
              </p>
            )}
          </div>
          
          {duration && (
            <span className="text-xs text-muted-foreground font-mono">
              {duration}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ThoughtTimeline: React.FC<ThoughtTimelineProps> = ({ 
  steps, 
  className 
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (steps.length === 0) {
    return (
      <div className={cn('text-center py-4', className)}>
        <p className="text-sm text-muted-foreground">
          No steps to display
        </p>
      </div>
    );
  }

  const containerVariants = prefersReducedMotion ? {} : {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={cn('space-y-0', className)}
      role="log"
      aria-label="Thought process timeline"
    >
      {steps.map((step, index) => (
        <TimelineStep
          key={`${step.id}-${index}`}
          step={step}
          isLast={index === steps.length - 1}
          index={index}
        />
      ))}
    </motion.div>
  );
};