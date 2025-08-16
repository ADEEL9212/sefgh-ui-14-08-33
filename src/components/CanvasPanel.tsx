import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Download, FileText, Code, Type, ArrowLeft, Upload, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { canvasAnimations, uiAnimations } from '@/components/animations';

interface CanvasData {
  id: string;
  title: string;
  content: string;
  mode: 'markdown' | 'code' | 'text';
  lastModified: Date;
}

interface CanvasPanelProps {
  isOpen: boolean;
  canvas: CanvasData | null;
  hasUnsavedChanges: boolean;
  onClose: () => void;
  onSave: (canvas: CanvasData) => void;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onModeChange: (mode: 'markdown' | 'code' | 'text') => void;
}

export const CanvasPanel: React.FC<CanvasPanelProps> = ({
  isOpen,
  canvas,
  hasUnsavedChanges,
  onClose,
  onSave,
  onContentChange,
  onTitleChange,
  onModeChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (canvas) {
      setTempTitle(canvas.title);
    }
  }, [canvas]);

  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
      
      if (e.key === 'Escape' && !e.ctrlKey && !e.metaKey) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canvas]);

  const handleSave = async () => {
    if (!canvas) return;
    
    try {
      await onSave({
        ...canvas,
        lastModified: new Date(),
      });
      
      toast({
        title: "Canvas saved",
        description: "Your document has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!canvas) return;

    const exportFormats = [
      { format: 'txt', label: 'Text' },
      { format: 'md', label: 'Markdown' },
      { format: 'json', label: 'JSON' }
    ];

    // For now, export as markdown
    const blob = new Blob([canvas.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${canvas.title}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Canvas exported",
      description: "Your document has been downloaded",
    });
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const shouldClose = confirm("You have unsaved changes. Are you sure you want to close?");
      if (!shouldClose) return;
    }
    onClose();
  };

  const handleTitleEdit = () => {
    setIsEditing(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleSave = () => {
    if (tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(canvas?.title || '');
    setIsEditing(false);
  };

  const modes = [
    { id: 'markdown', label: 'Markdown', icon: FileText },
    { id: 'code', label: 'Code', icon: Code },
    { id: 'text', label: 'Text', icon: Type }
  ];

  if (!canvas) return null;

  return (
    <motion.div
      className="h-full flex flex-col bg-background"
      variants={canvasAnimations.overlay}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <motion.div 
        className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur-sm"
        variants={uiAnimations.button}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between p-4">
          {/* Left: Back button and title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Back to chat</TooltipContent>
            </Tooltip>

            {/* Title */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={titleInputRef}
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTitleSave();
                      if (e.key === 'Escape') handleTitleCancel();
                    }}
                    onBlur={handleTitleSave}
                    className="h-8 text-sm font-medium"
                  />
                </div>
              ) : (
                <motion.button
                  onClick={handleTitleEdit}
                  className="text-left font-medium truncate hover:text-primary transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {canvas.title}
                </motion.button>
              )}
            </div>

            {/* Unsaved indicator */}
            <AnimatePresence>
              {hasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="outline" className="text-xs">
                    Unsaved
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center: Mode toggles */}
          <div className="flex items-center gap-1 mx-4">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = canvas.mode === mode.id;
              
              return (
                <Tooltip key={mode.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={uiAnimations.iconButton}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={() => onModeChange(mode.id as 'markdown' | 'code' | 'text')}
                        className="h-7 w-7 p-0"
                        title={`${mode.label} mode`}
                      >
                        <Icon className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>{mode.label} mode</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                  <Button variant="ghost" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
                    <Save className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Save (Ctrl+S)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                  <Button variant="ghost" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Export</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div variants={uiAnimations.iconButton} whileHover="hover" whileTap="tap">
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>Close (Esc)</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.div>

      {/* Editor */}
      <motion.div 
        className="flex-1 overflow-hidden"
        variants={canvasAnimations.element}
        initial="initial"
        animate="animate"
      >
        <Card className="h-full rounded-none border-0">
          <CardContent className="h-full p-0">
            <textarea
              ref={editorRef}
              value={canvas.content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder={`Start writing your ${canvas.mode} document...`}
              className="w-full h-full p-6 bg-transparent border-0 outline-none resize-none font-mono text-sm leading-relaxed"
              style={{
                fontFamily: canvas.mode === 'code' 
                  ? 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' 
                  : 'inherit'
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer with stats */}
      <motion.div 
        className="flex-shrink-0 border-t border-border bg-card/50 backdrop-blur-sm px-4 py-2"
        variants={uiAnimations.button}
        initial="initial"
        animate="animate"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {canvas.content.split(' ').filter(word => word.length > 0).length} words
            </span>
            <span>
              {canvas.content.length} characters
            </span>
            <span>
              {canvas.content.split('\n').length} lines
            </span>
          </div>
          <div>
            Last modified: {canvas.lastModified.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
