import { useCallback, useRef, useState } from 'react';
import type { StreamChunk } from '@/lib/chatEvents';

export interface UseStreamSSEOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export interface UseStreamSSEReturn {
  startStream: (url: string, options?: RequestInit) => Promise<void>;
  stopStream: () => void;
  isStreaming: boolean;
  error: Error | null;
}

/**
 * Generic SSE/Fetch streaming hook with AbortController
 * Handles both Server-Sent Events and streaming fetch responses
 */
export const useStreamSSE = (options: UseStreamSSEOptions = {}): UseStreamSSEReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const startStream = useCallback(async (url: string, requestOptions: RequestInit = {}) => {
    // Clean up any existing stream
    stopStream();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: abortController.signal,
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...requestOptions.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          
          try {
            // Handle SSE format: "data: {...}"
            let jsonData = trimmedLine;
            if (trimmedLine.startsWith('data: ')) {
              jsonData = trimmedLine.slice(6);
            }
            
            // Skip SSE control messages
            if (jsonData === '[DONE]' || jsonData === 'data: [DONE]') {
              continue;
            }
            
            const chunk = JSON.parse(jsonData) as StreamChunk;
            options.onChunk?.(chunk);
          } catch (parseError) {
            console.warn('Failed to parse streaming chunk:', trimmedLine, parseError);
            // Continue processing other chunks
          }
        }
      }

      options.onComplete?.();
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was cancelled, this is expected
        return;
      }
      
      const error = err instanceof Error ? err : new Error('Unknown streaming error');
      setError(error);
      options.onError?.(error);
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options, stopStream]);

  return {
    startStream,
    stopStream,
    isStreaming,
    error,
  };
};