import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExpandablePromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  className?: string;
  maxHeight?: number;
  minHeight?: number;
}

export const ExpandablePromptInput = React.forwardRef<
  HTMLTextAreaElement,
  ExpandablePromptInputProps
>(({ 
  value, 
  onChange, 
  placeholder = "Send a message...", 
  disabled = false,
  onKeyDown,
  className,
  maxHeight,
  minHeight = 20,
  ...props 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();
  
  // Set responsive max heights
  const defaultMaxHeight = isMobile ? 150 : 300;
  const finalMaxHeight = maxHeight || defaultMaxHeight;

  // Auto-resize function
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight
    textarea.style.height = `${minHeight}px`;
    
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, finalMaxHeight);
    
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = scrollHeight > finalMaxHeight ? 'auto' : 'hidden';
  }, [minHeight, finalMaxHeight]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  // Handle blur
  const handleBlur = () => {
    setIsFocused(false);
    // Only collapse if there's no content
    if (!value.trim()) {
      setIsExpanded(false);
    }
  };

  // Toggle expand/collapse
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      textareaRef.current?.focus();
    }
  };

  // Adjust height when value or expanded state changes
  useEffect(() => {
    adjustHeight();
  }, [value, isExpanded, adjustHeight]);

  // Check if content overflows in collapsed state
  const hasOverflow = value.length > 50 && !isExpanded;

  // Combine refs
  const combinedRef = useCallback((node: HTMLTextAreaElement) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  return (
    <div className="relative flex-1">
      <textarea
        ref={combinedRef}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          // Base styles
          "w-full resize-none bg-transparent border-none focus:ring-0 focus:outline-none text-sm leading-normal py-1 px-0",
          // Transition for smooth height changes
          "transition-all duration-200 ease-out",
          // Text styles using design system
          "text-foreground placeholder:text-muted-foreground",
          // Collapsed state styles
          !isExpanded && !isFocused && hasOverflow && "overflow-hidden whitespace-nowrap text-ellipsis",
          // Expanded state styles
          (isExpanded || isFocused) && "overflow-y-auto",
          className
        )}
        style={{
          minHeight: `${minHeight}px`,
          height: isExpanded || isFocused || value ? 'auto' : `${minHeight}px`,
        }}
        {...props}
      />
      
      {/* Expand/Collapse button */}
      {(hasOverflow || isExpanded) && (
        <button
          type="button"
          onClick={toggleExpand}
          className={cn(
            "absolute right-0 top-1/2 -translate-y-1/2 p-1 rounded-md",
            "text-muted-foreground hover:text-foreground hover:bg-muted",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          )}
          aria-label={isExpanded ? "Collapse input" : "Expand input"}
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 transition-transform duration-200" />
          ) : (
            <ChevronDown className="h-3 w-3 transition-transform duration-200" />
          )}
        </button>
      )}
    </div>
  );
});

ExpandablePromptInput.displayName = "ExpandablePromptInput";