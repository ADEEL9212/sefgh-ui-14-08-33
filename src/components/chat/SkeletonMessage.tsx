import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkeletonMessageProps {
  className?: string;
}

/**
 * Skeleton message bubble shown before content arrives
 * Shows avatar, name, and 2-4 shimmering lines
 */
export const SkeletonMessage: React.FC<SkeletonMessageProps> = ({ className }) => {
  return (
    <div className={cn("flex gap-3", className)}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Bot className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Message skeleton */}
      <Card className="flex-1 max-w-[80%]">
        <CardContent className="p-3">
          <div className="space-y-2">
            {/* Shimmering lines */}
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-5/6" />
            <div className="skeleton h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};