/**
 * API utilities for Flask backend integration
 * Handles search queries, chat interactions, and canvas operations
 */

export interface SearchParams {
  query: string;
  scope?: 'repositories' | 'code' | 'commits' | 'issues' | 'discussions' | 'topics' | 'wikis' | 'packages';
  filters?: {
    language?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    perPage?: number;
  };
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  url: string;
  author?: string;
  repository?: string;
  language?: string;
  stars?: number;
  forks?: number;
  createdAt?: string;
  updatedAt?: string;
  htmlUrl?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    searchResults?: SearchResult[];
    toolUsed?: string;
    scope?: string;
  };
}

export interface CanvasData {
  id: string;
  title: string;
  content: string;
  mode: 'markdown' | 'code' | 'text';
  lastModified: Date;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers: { ...defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          errorData.code,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or parsing error
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'NETWORK_ERROR',
        error
      );
    }
  }

  // Search API
  async search(params: SearchParams): Promise<{
    results: SearchResult[];
    total: number;
    page: number;
    hasMore: boolean;
  }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', params.query);
    
    if (params.scope) {
      searchParams.append('scope', params.scope);
    }
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request(`/search?${searchParams.toString()}`);
  }

  // Chat API
  async sendChatMessage(
    message: string,
    context?: {
      searchResults?: SearchResult[];
      toolUsed?: string;
      scope?: string;
    }
  ): Promise<{
    response: string;
    messageId: string;
    timestamp: string;
  }> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context,
      }),
    });
  }

  // Streaming chat API (for real-time responses)
  async streamChatMessage(
    message: string,
    context?: any,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullResponse: string) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;
          onChunk?.(chunk);
        }

        onComplete?.(fullResponse);
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Unknown streaming error'));
    }
  }

  // Canvas API
  async saveCanvas(canvas: CanvasData): Promise<{ success: boolean; id: string }> {
    return this.request('/canvas/save', {
      method: 'POST',
      body: JSON.stringify(canvas),
    });
  }

  async loadCanvas(id: string): Promise<CanvasData> {
    return this.request(`/canvas/${id}`);
  }

  async deleteCanvas(id: string): Promise<{ success: boolean }> {
    return this.request(`/canvas/${id}`, {
      method: 'DELETE',
    });
  }

  async listCanvases(): Promise<CanvasData[]> {
    return this.request('/canvas/list');
  }

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Utility functions for common operations
export const searchGitHub = async (
  query: string,
  scope?: SearchParams['scope'],
  filters?: SearchParams['filters']
): Promise<SearchResult[]> => {
  try {
    const response = await apiClient.search({
      query,
      scope,
      filters,
    });
    return response.results;
  } catch (error) {
    console.error('GitHub search failed:', error);
    // Return mock data for development
    return createMockSearchResults(query, scope);
  }
};

export const sendMessage = async (
  message: string,
  context?: any
): Promise<string> => {
  try {
    const response = await apiClient.sendChatMessage(message, context);
    return response.response;
  } catch (error) {
    console.error('Chat message failed:', error);
    // Return mock response for development
    return `I understand you're asking about "${message}". This is a mock response since the backend is not available. The search functionality would normally integrate with GitHub's API to provide real results.`;
  }
};

// Mock data for development/testing
const createMockSearchResults = (query: string, scope?: string): SearchResult[] => {
  const baseResults = [
    {
      id: '1',
      type: 'repository',
      title: `${query}-example`,
      description: `A sample repository related to ${query}`,
      url: 'https://github.com/example/repo',
      author: 'exampleuser',
      repository: 'example/repo',
      language: 'TypeScript',
      stars: 1234,
      forks: 56,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      htmlUrl: 'https://github.com/example/repo'
    },
    {
      id: '2',
      type: 'code',
      title: `${query} implementation`,
      description: `Code snippet showing ${query} usage`,
      url: 'https://github.com/example/repo/blob/main/src/index.ts',
      author: 'anotheruser',
      repository: 'example/repo',
      language: 'JavaScript',
      htmlUrl: 'https://github.com/example/repo/blob/main/src/index.ts'
    },
    {
      id: '3',
      type: 'issue',
      title: `How to use ${query}?`,
      description: `Discussion about ${query} implementation`,
      url: 'https://github.com/example/repo/issues/123',
      author: 'questioner',
      repository: 'example/repo',
      createdAt: '2024-01-10T15:45:00Z',
      htmlUrl: 'https://github.com/example/repo/issues/123'
    }
  ];

  // Filter based on scope if provided
  if (scope) {
    return baseResults.filter(result => result.type === scope.slice(0, -1)); // Remove 's' from scope
  }

  return baseResults;
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};