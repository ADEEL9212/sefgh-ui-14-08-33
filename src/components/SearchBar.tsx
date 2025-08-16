import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchAnimations } from './animations';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  onFocus,
  onBlur,
  placeholder = "Search GitHub or Ask anything...",
  className = "",
  disabled = false,
  isLoading = false
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasValue(value.length > 0);
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSubmit(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative ${className}`}
      variants={searchAnimations.container}
      initial="initial"
      animate={isFocused ? "focused" : "blur"}
    >
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`
            relative flex items-center
            bg-card border-2 border-border
            rounded-xl px-4 py-3
            transition-colors duration-200
            ${isFocused ? 'border-ring shadow-lg' : 'hover:border-muted-foreground/50'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
          variants={searchAnimations.input}
        >
          {/* Search Icon */}
          <motion.div
            className="flex items-center mr-3"
            animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          >
            <Search className={`h-5 w-5 ${isFocused ? 'text-ring' : 'text-muted-foreground'} transition-colors`} />
          </motion.div>

          {/* Input Field */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              className="border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder=""
            />
            
            {/* Animated Placeholder */}
            <AnimatePresence>
              {!hasValue && (
                <motion.div
                  className="absolute inset-0 flex items-center pointer-events-none"
                  variants={searchAnimations.placeholder}
                  initial="initial"
                  animate={isFocused ? "focused" : "initial"}
                  exit="initial"
                >
                  <span className="text-sm text-muted-foreground">
                    {placeholder}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-3">
            {/* Clear Button */}
            <AnimatePresence>
              {hasValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    disabled={disabled}
                    className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GitHub Indicator */}
            <motion.div
              className="flex items-center gap-1 text-xs text-muted-foreground"
              animate={isFocused ? { opacity: 1 } : { opacity: 0.7 }}
            >
              <Github className="h-3 w-3" />
              <span className="hidden sm:inline">GitHub</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Submit button (hidden, for form submission) */}
        <button type="submit" className="sr-only" disabled={disabled}>
          Search
        </button>
      </form>

      {/* Focus Ring Enhancement */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            className="absolute inset-0 -z-10 rounded-xl bg-ring/10"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Search Suggestions (placeholder for future enhancement) */}
      <AnimatePresence>
        {isFocused && hasValue && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3">
              <div className="text-xs text-muted-foreground mb-2">Recent searches</div>
              <div className="text-sm text-muted-foreground">
                Start typing to see suggestions...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Hook for search bar focus management
export const useSearchBarFocus = () => {
  const searchRef = useRef<HTMLInputElement>(null);

  const focusSearch = () => {
    searchRef.current?.focus();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        focusSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { searchRef, focusSearch };
};