import { useState, useCallback, useEffect } from 'react';
import { CanvasData, apiClient } from '@/utils/api';

export interface UseCanvasReturn {
  canvas: CanvasData | null;
  isOpen: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Canvas management
  openCanvas: (canvas?: CanvasData) => void;
  closeCanvas: () => void;
  createNewCanvas: () => void;
  
  // Content management
  updateContent: (content: string) => void;
  updateTitle: (title: string) => void;
  updateMode: (mode: 'markdown' | 'code' | 'text') => void;
  
  // Persistence
  saveCanvas: () => Promise<void>;
  loadCanvas: (id: string) => Promise<void>;
  deleteCanvas: (id: string) => Promise<void>;
  
  // Utility
  exportCanvas: (format: 'txt' | 'md' | 'json') => void;
  clearError: () => void;
}

export const useCanvas = (): UseCanvasReturn => {
  const [canvas, setCanvas] = useState<CanvasData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate unique ID for new canvas
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Load canvas from localStorage on mount
  useEffect(() => {
    const savedCanvas = localStorage.getItem('sefgh-current-canvas');
    if (savedCanvas) {
      try {
        const parsed = JSON.parse(savedCanvas);
        setCanvas({
          ...parsed,
          lastModified: new Date(parsed.lastModified)
        });
      } catch (err) {
        console.error('Failed to load saved canvas:', err);
      }
    }
  }, []);

  // Save to localStorage when canvas changes
  useEffect(() => {
    if (canvas) {
      localStorage.setItem('sefgh-current-canvas', JSON.stringify(canvas));
    }
  }, [canvas]);

  const openCanvas = useCallback((existingCanvas?: CanvasData) => {
    if (existingCanvas) {
      setCanvas(existingCanvas);
      setHasUnsavedChanges(false);
    } else if (!canvas) {
      // Create new canvas if none exists
      createNewCanvas();
    }
    setIsOpen(true);
    setError(null);
  }, [canvas]);

  const closeCanvas = useCallback(() => {
    setIsOpen(false);
  }, []);

  const createNewCanvas = useCallback(() => {
    const newCanvas: CanvasData = {
      id: generateId(),
      title: 'Untitled Document',
      content: '',
      mode: 'markdown',
      lastModified: new Date(),
    };
    setCanvas(newCanvas);
    setHasUnsavedChanges(false);
    setError(null);
  }, []);

  const updateContent = useCallback((content: string) => {
    if (canvas) {
      setCanvas({
        ...canvas,
        content,
        lastModified: new Date(),
      });
      setHasUnsavedChanges(true);
    }
  }, [canvas]);

  const updateTitle = useCallback((title: string) => {
    if (canvas) {
      setCanvas({
        ...canvas,
        title,
        lastModified: new Date(),
      });
      setHasUnsavedChanges(true);
    }
  }, [canvas]);

  const updateMode = useCallback((mode: 'markdown' | 'code' | 'text') => {
    if (canvas) {
      setCanvas({
        ...canvas,
        mode,
        lastModified: new Date(),
      });
      setHasUnsavedChanges(true);
    }
  }, [canvas]);

  const saveCanvas = useCallback(async () => {
    if (!canvas) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to save to backend
      await apiClient.saveCanvas(canvas);
      
      // Save to localStorage as backup
      const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
      const existingIndex = savedCanvases.findIndex((c: CanvasData) => c.id === canvas.id);
      
      if (existingIndex >= 0) {
        savedCanvases[existingIndex] = canvas;
      } else {
        savedCanvases.push(canvas);
      }
      
      localStorage.setItem('sefgh-canvases', JSON.stringify(savedCanvases));
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save canvas:', err);
      // Still save to localStorage as fallback
      const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
      const existingIndex = savedCanvases.findIndex((c: CanvasData) => c.id === canvas.id);
      
      if (existingIndex >= 0) {
        savedCanvases[existingIndex] = canvas;
      } else {
        savedCanvases.push(canvas);
      }
      
      localStorage.setItem('sefgh-canvases', JSON.stringify(savedCanvases));
      setHasUnsavedChanges(false);
      
      setError('Canvas saved locally. Remote backup failed.');
    } finally {
      setIsLoading(false);
    }
  }, [canvas]);

  const loadCanvas = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to load from backend first
      const loadedCanvas = await apiClient.loadCanvas(id);
      setCanvas({
        ...loadedCanvas,
        lastModified: new Date(loadedCanvas.lastModified)
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to load canvas from backend:', err);
      
      // Fallback to localStorage
      const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
      const foundCanvas = savedCanvases.find((c: CanvasData) => c.id === id);
      
      if (foundCanvas) {
        setCanvas({
          ...foundCanvas,
          lastModified: new Date(foundCanvas.lastModified)
        });
        setHasUnsavedChanges(false);
      } else {
        setError('Canvas not found');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCanvas = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to delete from backend
      await apiClient.deleteCanvas(id);
      
      // Delete from localStorage
      const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
      const filteredCanvases = savedCanvases.filter((c: CanvasData) => c.id !== id);
      localStorage.setItem('sefgh-canvases', JSON.stringify(filteredCanvases));
      
      // Clear current canvas if it's the one being deleted
      if (canvas?.id === id) {
        setCanvas(null);
        setIsOpen(false);
        setHasUnsavedChanges(false);
      }
    } catch (err) {
      console.error('Failed to delete canvas:', err);
      
      // Still delete from localStorage
      const savedCanvases = JSON.parse(localStorage.getItem('sefgh-canvases') || '[]');
      const filteredCanvases = savedCanvases.filter((c: CanvasData) => c.id !== id);
      localStorage.setItem('sefgh-canvases', JSON.stringify(filteredCanvases));
      
      if (canvas?.id === id) {
        setCanvas(null);
        setIsOpen(false);
        setHasUnsavedChanges(false);
      }
      
      setError('Canvas deleted locally. Remote deletion failed.');
    } finally {
      setIsLoading(false);
    }
  }, [canvas]);

  const exportCanvas = useCallback((format: 'txt' | 'md' | 'json') => {
    if (!canvas) return;

    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'txt':
        content = canvas.content;
        mimeType = 'text/plain';
        filename = `${canvas.title}.txt`;
        break;
      case 'md':
        content = canvas.content;
        mimeType = 'text/markdown';
        filename = `${canvas.title}.md`;
        break;
      case 'json':
        content = JSON.stringify(canvas, null, 2);
        mimeType = 'application/json';
        filename = `${canvas.title}.json`;
        break;
      default:
        return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }, [canvas]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    canvas,
    isOpen,
    hasUnsavedChanges,
    isLoading,
    error,
    
    openCanvas,
    closeCanvas,
    createNewCanvas,
    
    updateContent,
    updateTitle,
    updateMode,
    
    saveCanvas,
    loadCanvas,
    deleteCanvas,
    
    exportCanvas,
    clearError,
  };
};