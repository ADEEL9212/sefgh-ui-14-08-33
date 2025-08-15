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

// Type guards for runtime checking
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

// Default step configurations
export const DEFAULT_STEPS: Omit<ThoughtStep, 'startedAt' | 'endedAt'>[] = [
  { id: 'understand', label: 'Understanding request', status: 'pending' },
  { id: 'plan', label: 'Planning response', status: 'pending' },
  { id: 'retrieve', label: 'Gathering information', status: 'pending' },
  { id: 'compose', label: 'Composing answer', status: 'pending' },
  { id: 'finalize', label: 'Finalizing', status: 'pending' },
];

// Tool-specific step configurations
export const createToolStep = (toolName: string): Omit<ThoughtStep, 'startedAt' | 'endedAt'> => ({
  id: 'tool',
  label: `Using ${toolName}`,
  status: 'pending',
  toolName,
});