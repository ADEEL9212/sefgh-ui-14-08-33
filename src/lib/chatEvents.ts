/**
 * Event types and data contracts for thinking/thought-process preview system
 * Privacy-safe: only structured status events, no chain-of-thought text
 */

export type ThoughtStepStatus = "pending" | "active" | "done" | "error";
export type ThoughtStepId = "understand" | "plan" | "retrieve" | "tool" | "compose" | "finalize";

export interface ThoughtStep {
  id: ThoughtStepId;
  label: string;              // e.g., "Planning response"
  status: ThoughtStepStatus;  // pending|active|done|error
  startedAt?: number;
  endedAt?: number;
  toolName?: string;          // optional: "web", "api", "code-run"
  note?: string;              // short, high-level note ONLY (no chain-of-thought)
}

export interface ChatThinkingState {
  visible: boolean;
  canCancel: boolean;
  steps: ThoughtStep[];
  activeStep?: ThoughtStepId;
}

export interface StreamChunk {
  id: string;                 // message id
  delta: string;              // streamed text
  done?: boolean;
  error?: string;
}

export interface ChatEvents {
  onCancel?: () => void;
  onRetry?: () => void;
}

// Type guards for type safety
export const isThoughtStep = (obj: any): obj is ThoughtStep => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.label === 'string' &&
    ['pending', 'active', 'done', 'error'].includes(obj.status);
};

export const isStreamChunk = (obj: any): obj is StreamChunk => {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.delta === 'string';
};

// Default thought steps with labels
export const getDefaultThoughtSteps = (): ThoughtStep[] => [
  {
    id: "understand",
    label: "Understanding request",
    status: "pending"
  },
  {
    id: "plan", 
    label: "Planning response",
    status: "pending"
  },
  {
    id: "retrieve",
    label: "Gathering information",
    status: "pending"
  },
  {
    id: "compose",
    label: "Composing answer",
    status: "pending"
  },
  {
    id: "finalize",
    label: "Finalizing response",
    status: "pending"
  }
];

// Helper to get step icon based on step id
export const getStepIcon = (stepId: ThoughtStepId, toolName?: string): string => {
  if (stepId === "tool" && toolName) {
    switch (toolName) {
      case "web":
      case "search":
        return "🔍";
      case "api":
      case "fetch":
        return "🌐";
      case "code-run":
      case "code":
        return "🧰";
      default:
        return "🔧";
    }
  }

  switch (stepId) {
    case "understand":
      return "👁️";
    case "plan":
      return "🧠";
    case "retrieve":
      return "📚";
    case "compose":
      return "✍️";
    case "finalize":
      return "✅";
    default:
      return "•";
  }
};

// Helper to format timing
export const formatDuration = (startTime?: number, endTime?: number): string => {
  if (!startTime || !endTime) return "";
  const duration = endTime - startTime;
  if (duration < 1000) return `${duration}ms`;
  return `${Math.round(duration / 100) / 10}s`;
};