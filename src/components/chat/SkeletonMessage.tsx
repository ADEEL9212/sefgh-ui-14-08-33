import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkeletonMessageProps {
  className?: string;
}

export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({ className }) => {
  return (
    <div className={cn('flex gap-3 items-start', className)}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Message bubble with skeleton content */}
      <Card className="flex-1 max-w-[80%]">
        <CardContent className="p-3">
          <div className="space-y-2" role="status" aria-label="Loading response">
            {/* First line - full width */}
            <div className="h-4 bg-muted rounded animate-pulse" />
            
            {/* Second line - 80% width */}
            <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
            
            {/* Third line - 60% width */}
            <div className="h-4 bg-muted rounded animate-pulse w-3/5" />
            
            {/* Fourth line - 40% width (optional, for longer content) */}
            <div className="h-4 bg-muted rounded animate-pulse w-2/5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};