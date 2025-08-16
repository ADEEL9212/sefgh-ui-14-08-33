import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  GitBranch, 
  GitCommit, 
  Bug, 
  MessageSquare, 
  Hash, 
  BookOpen, 
  Package, 
  Search,
  Filter,
  X,
  Github,
  Globe,
  PaintBucket,
  Lightbulb,
  Paperclip,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toolsAnimations } from './animations';

interface Tool {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'github' | 'ai' | 'canvas' | 'media';
  scope?: string;
  shortcut?: string;
}

interface ToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToolSelect: (tool: Tool) => void;
  selectedTool?: string;
  onCanvasOpen?: () => void;
  className?: string;
}

const tools: Tool[] = [
  // GitHub Tools
  {
    id: 'repositories',
    label: 'Repositories',
    icon: GitBranch,
    description: 'Search GitHub repositories',
    category: 'github',
    scope: 'repositories'
  },
  {
    id: 'code',
    label: 'Code Search',
    icon: Code2,
    description: 'Search code across repositories',
    category: 'github',
    scope: 'code'
  },
  {
    id: 'commits',
    label: 'Commits',
    icon: GitCommit,
    description: 'Find specific commits',
    category: 'github',
    scope: 'commits'
  },
  {
    id: 'issues',
    label: 'Issues & PRs',
    icon: Bug,
    description: 'Search issues and pull requests',
    category: 'github',
    scope: 'issues'
  },
  {
    id: 'discussions',
    label: 'Discussions',
    icon: MessageSquare,
    description: 'Browse GitHub discussions',
    category: 'github',
    scope: 'discussions'
  },
  {
    id: 'topics',
    label: 'Topics',
    icon: Hash,
    description: 'Explore repository topics',
    category: 'github',
    scope: 'topics'
  },
  {
    id: 'wikis',
    label: 'Wikis',
    icon: BookOpen,
    description: 'Search project wikis',
    category: 'github',
    scope: 'wikis'
  },
  {
    id: 'packages',
    label: 'Packages',
    icon: Package,
    description: 'Find published packages',
    category: 'github',
    scope: 'packages'
  },

  // AI Tools
  {
    id: 'web-search',
    label: 'Web Search',
    icon: Globe,
    description: 'Search the web with AI assistance',
    category: 'ai',
    shortcut: 'Ctrl+W'
  },
  {
    id: 'think-longer',
    label: 'Think Longer',
    icon: Lightbulb,
    description: 'Deep analysis and reasoning',
    category: 'ai',
    shortcut: 'Ctrl+T'
  },

  // Canvas Tools
  {
    id: 'canvas',
    label: 'Canvas',
    icon: PaintBucket,
    description: 'Visual brainstorming workspace',
    category: 'canvas',
    shortcut: 'Ctrl+B'
  },

  // Media Tools
  {
    id: 'files',
    label: 'Add Files',
    icon: Paperclip,
    description: 'Upload photos and documents',
    category: 'media'
  },
  {
    id: 'voice',
    label: 'Voice Input',
    icon: Mic,
    description: 'Voice to text input',
    category: 'media'
  }
];

const categoryLabels = {
  github: 'GitHub Tools',
  ai: 'AI Features',
  canvas: 'Canvas',
  media: 'Media'
};

const categoryColors = {
  github: 'bg-purple-500/10 text-purple-600 border-purple-200',
  ai: 'bg-blue-500/10 text-blue-600 border-blue-200',
  canvas: 'bg-green-500/10 text-green-600 border-green-200',
  media: 'bg-orange-500/10 text-orange-600 border-orange-200'
};

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  isOpen,
  onClose,
  onToolSelect,
  selectedTool,
  onCanvasOpen,
  className = ""
}) => {
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  const handleToolClick = (tool: Tool) => {
    if (tool.id === 'canvas') {
      onCanvasOpen?.();
    } else {
      onToolSelect(tool);
    }
    
    // Don't close panel for GitHub search tools - let user select multiple
    if (tool.category !== 'github') {
      onClose();
    }
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={`
              fixed lg:absolute right-0 top-0 lg:top-full
              w-80 max-w-[90vw] h-screen lg:h-auto max-h-[80vh]
              bg-card border border-border rounded-none lg:rounded-xl
              shadow-2xl z-50 overflow-hidden
              ${className}
            `}
            variants={toolsAnimations.panel}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">Tools & Features</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-4 space-y-6">
              {Object.entries(groupedTools).map(([category, categoryTools]) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${categoryColors[category as keyof typeof categoryColors]}`}
                    >
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </Badge>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Tools Grid */}
                  <motion.div 
                    className="grid grid-cols-1 gap-2"
                    variants={toolsAnimations.panel}
                  >
                    {categoryTools.map((tool, index) => {
                      const Icon = tool.icon;
                      const isSelected = selectedTool === tool.id;
                      const isHovered = hoveredTool === tool.id;

                      return (
                        <motion.button
                          key={tool.id}
                          custom={index}
                          variants={toolsAnimations.tool}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => handleToolClick(tool)}
                          onMouseEnter={() => setHoveredTool(tool.id)}
                          onMouseLeave={() => setHoveredTool(null)}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg text-left
                            border border-transparent transition-all duration-200
                            hover:bg-muted/50 hover:border-border
                            ${isSelected ? 'bg-ring/10 border-ring' : ''}
                            ${isHovered ? 'shadow-md' : ''}
                          `}
                        >
                          <motion.div
                            variants={toolsAnimations.toolIcon}
                            animate={isSelected ? "selected" : "initial"}
                            className="flex-shrink-0"
                          >
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-ring' : 'text-muted-foreground'}`} />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${isSelected ? 'text-ring' : 'text-foreground'}`}>
                              {tool.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {tool.description}
                            </div>
                          </div>

                          {tool.shortcut && (
                            <Badge variant="outline" className="text-xs opacity-60">
                              {tool.shortcut}
                            </Badge>
                          )}
                        </motion.button>
                      );
                    })}
                  </motion.div>

                  {category !== 'media' && <Separator className="mt-4" />}
                </motion.div>
              ))}

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-4 border-t border-border"
              >
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <Github className="h-3 w-3" />
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleToolClick(tools.find(t => t.id === 'repositories')!)}
                  >
                    Search Repos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleToolClick(tools.find(t => t.id === 'code')!)}
                  >
                    Find Code
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Hook for tools panel management
export const useToolsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string>();

  const openTools = () => setIsOpen(true);
  const closeTools = () => setIsOpen(false);
  const toggleTools = () => setIsOpen(!isOpen);

  const selectTool = (tool: Tool) => {
    setSelectedTool(tool.id);
  };

  const clearSelection = () => setSelectedTool(undefined);

  return {
    isOpen,
    selectedTool,
    openTools,
    closeTools,
    toggleTools,
    selectTool,
    clearSelection
  };
};