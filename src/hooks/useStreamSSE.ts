import { useState, useCallback, useRef } from 'react';
import { StreamChunk } from '@/lib/chatEvents';

export interface UseStreamSSEOptions {
  endpoint: string;
  payload?: Record<string, any>;
  onChunk?: (chunk: StreamChunk) => void;
  onError?: (error: string) => void;
  onComplete?: () => void;
}

export interface UseStreamSSEReturn {
  isStreaming: boolean;
  error: string | null;
  appendChunk: (chunk: StreamChunk) => void;
  startStream: () => Promise<void>;
  cancel: () => void;
  done: boolean;
}

export const useStreamSSE = (options: UseStreamSSEOptions): UseStreamSSEReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const appendChunk = useCallback((chunk: StreamChunk) => {
    if (options.onChunk) {
      options.onChunk(chunk);
    }
    
    if (chunk.done) {
      setDone(true);
      setIsStreaming(false);
      if (options.onComplete) {
        options.onComplete();
      }
    }
    
    if (chunk.error) {
      setError(chunk.error);
      setIsStreaming(false);
      if (options.onError) {
        options.onError(chunk.error);
      }
    }
  }, [options]);

  const startStream = useCallback(async () => {
    try {
      setIsStreaming(true);
      setError(null);
      setDone(false);
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.payload || {}),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      try {
        while (true) {
          const { done: readerDone, value } = await reader.read();
          
          if (readerDone) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonData = line.slice(6);
                if (jsonData === '[DONE]') {
                  setDone(true);
                  setIsStreaming(false);
                  if (options.onComplete) {
                    options.onComplete();
                  }
                  return;
                }
                
                const parsedChunk = JSON.parse(jsonData) as StreamChunk;
                appendChunk(parsedChunk);
              } catch (parseError) {
                console.warn('Failed to parse SSE chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Cancelled by user, don't treat as error
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown streaming error';
      setError(errorMessage);
      setIsStreaming(false);
      
      if (options.onError) {
        options.onError(errorMessage);
      }
    }
  }, [options, appendChunk]);

  return {
    isStreaming,
    error,
    appendChunk,
    startStream,
    cancel,
    done,
  };
};