/**
 * ThinkingDemo page - Showcase the thinking/thought-process preview system
 */

import React from 'react';
import { ChatThinkingDemo } from '@/components/chat/ChatThinkingDemo';

export function ThinkingDemo() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Thinking System Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our privacy-safe thinking process visualization. 
            Watch as the AI breaks down complex tasks into discrete, 
            understandable steps without exposing internal reasoning chains.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg shadow-sm h-[600px]">
            <ChatThinkingDemo className="h-full" />
          </div>
        </div>
        
        {/* Feature highlights */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Privacy-Safe</h3>
            <p className="text-sm text-muted-foreground">
              Only shows high-level statuses and structured events. 
              No raw chain-of-thought or sensitive reasoning exposed.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Real-time Updates</h3>
            <p className="text-sm text-muted-foreground">
              Live progress indicators with smooth animations. 
              Watch each step unfold in real-time with visual feedback.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">♿</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Fully Accessible</h3>
            <p className="text-sm text-muted-foreground">
              Screen reader compatible, keyboard navigable, 
              and respects reduced motion preferences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}