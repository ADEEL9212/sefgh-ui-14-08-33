/**
 * ThinkingAnimation - Shows a "Thinking..." preview with bouncing dots and typing animation
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface ThinkingAnimationProps {
  className?: string;
}

export function ThinkingAnimation({ className = '' }: ThinkingAnimationProps) {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Generating Answer...';

  // Typing animation effect
  useEffect(() => {
    if (typedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, typedText.length + 1));
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [typedText, fullText]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          {/* Thinking text with bouncing dots */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-foreground">Thinking</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  className="w-2 h-2 bg-primary rounded-full shadow-lg shadow-primary/30"
                  animate={{
                    y: [0, -8, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: [0.4, 0, 0.6, 1],
                  }}
                  style={{
                    boxShadow: '0 0 10px hsla(var(--primary), 0.5)',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Typing animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            {typedText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1"
            >
              |
            </motion.span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}