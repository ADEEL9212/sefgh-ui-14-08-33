/**
 * Framer Motion animation configurations for the Chat Application
 * Modern, smooth transitions and micro-interactions
 */

import { Variants } from 'framer-motion';

// Canvas Panel Animations
export const canvasAnimations = {
  // Canvas overlay expand/collapse
  overlay: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  // Canvas elements (notes, shapes)
  element: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: { duration: 0.15 }
    },
    drag: {
      scale: 1.05,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 1000
    }
  }
};

// Search Bar Animations
export const searchAnimations = {
  container: {
    initial: { width: '100%' },
    focused: { 
      width: '115%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    blur: {
      width: '100%',
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  input: {
    initial: { backgroundColor: 'transparent' },
    focused: {
      backgroundColor: 'rgba(243, 244, 246, 0.5)',
      transition: { duration: 0.2 }
    },
    blur: {
      backgroundColor: 'transparent',
      transition: { duration: 0.2 }
    }
  },

  placeholder: {
    initial: { y: 0, opacity: 0.7 },
    focused: {
      y: -4,
      opacity: 0.5,
      transition: { duration: 0.2 }
    }
  }
};

// Tools Panel Animations
export const toolsAnimations = {
  panel: {
    initial: { x: '100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  tool: {
    initial: { opacity: 0, x: 20 },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.05,
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }),
    hover: {
      scale: 1.05,
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    selected: {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: 'rgb(59, 130, 246)',
      transition: { duration: 0.2 }
    }
  },

  toolIcon: {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 }
    },
    selected: {
      scale: 1.1,
      color: 'rgb(59, 130, 246)',
      transition: { duration: 0.2 }
    }
  }
};

// Chat Message Animations
export const chatAnimations = {
  message: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  typingIndicator: {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  typingDots: {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }
};

// Button and UI Element Animations
export const uiAnimations = {
  button: {
    initial: { scale: 1 },
    hover: {
      scale: 1.02,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  },

  iconButton: {
    initial: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.9,
      transition: { duration: 0.1 }
    },
    loading: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  },

  ripple: {
    initial: { scale: 0, opacity: 1 },
    animate: {
      scale: 4,
      opacity: 0,
      transition: {
        duration: 0.6,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  tooltip: {
    initial: { opacity: 0, scale: 0.8, y: 5 },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.15,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 5,
      transition: {
        duration: 0.1,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  }
};

// Layout Animations
export const layoutAnimations = {
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  slideInLeft: {
    initial: { x: '-100%', opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  },

  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }
};

// Scroll animations
export const scrollAnimations = {
  smoothScroll: {
    behavior: 'smooth',
    block: 'end'
  }
};

// Easing functions
export const easings = {
  easeOutCubic: [0.4, 0.0, 0.2, 1],
  easeInOutCubic: [0.4, 0.0, 0.6, 1],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  spring: {
    type: 'spring',
    damping: 20,
    stiffness: 300
  }
};

// Duration constants
export const durations = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8
};