import { Variants, Transition } from 'framer-motion';

// Common Easing Arrays
export const easings = {
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  smooth: [0.16, 1, 0.3, 1] as const,
  bounce: [0.68, -0.55, 0.265, 1.55] as const,
};

// Smooth Spring Transition Preset
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

// Fade In / Out
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
};

// Fade Up (Default for Cards & Section Items)
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: 10, transition: { duration: 0.2 } },
};

// Scale In / Out (For Modals, Badges, Tooltips)
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springTransition,
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

// Slide Over (For Drawers & Sidebars)
export const slideRight: Variants = {
  hidden: { x: '100%' },
  visible: {
    x: 0,
    transition: springTransition,
  },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeInOut' } },
};

// Slide Up (For Mobile Bottom Sheets)
export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: springTransition,
  },
  exit: { y: '100%', transition: { duration: 0.25, ease: 'easeInOut' } },
};

// Staggered Parent Container
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Interactive Hover & Tap Motion Variants
export const buttonMotion = {
  hover: { scale: 1.02, transition: { duration: 0.15 } },
  tap: { scale: 0.96, transition: { duration: 0.1 } },
};

export const cardHoverMotion = {
  rest: { y: 0, shadow: 'none' },
  hover: {
    y: -6,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
};

// Pulse Animation Variant for Badges & Indicators
export const pulseGlow: Variants = {
  animate: {
    scale: [1, 1.08, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
