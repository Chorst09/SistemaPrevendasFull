'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

// Animation variants for different components
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const slideInFromRight: Variants = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

// Smooth tab transition component
interface TabTransitionProps {
  children: React.ReactNode;
  tabId: string;
  className?: string;
}

export function TabTransition({ children, tabId, className }: TabTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabId}
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Smooth form field animations
interface FormFieldAnimationProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FormFieldAnimation({ children, delay = 0, className }: FormFieldAnimationProps) {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{ delay, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Progress indicator animation
interface ProgressAnimationProps {
  progress: number;
  className?: string;
}

export function ProgressAnimation({ progress, className }: ProgressAnimationProps) {
  return (
    <motion.div
      className={cn("h-2 bg-primary rounded-full", className)}
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    />
  );
}

// Card hover animations
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
}

export function AnimatedCard({ children, className, hoverScale = 1.02 }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

// Button press animation
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedButton({ children, className, onClick, disabled }: AnimatedButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  );
}

// Loading spinner with smooth animation
export function LoadingSpinner({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={cn("border-2 border-gray-300 border-t-primary rounded-full", className)}
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Success checkmark animation
export function SuccessCheckmark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <motion.svg
      className={cn("text-green-500", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <motion.path
        d="M20 6L9 17l-5-5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
    </motion.svg>
  );
}

// Error X animation
export function ErrorX({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <motion.svg
      className={cn("text-red-500", className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <motion.path
        d="M18 6L6 18"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      />
      <motion.path
        d="M6 6l12 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      />
    </motion.svg>
  );
}

// Notification slide in animation
interface NotificationAnimationProps {
  children: React.ReactNode;
  isVisible: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function NotificationAnimation({ 
  children, 
  isVisible, 
  position = 'top-right' 
}: NotificationAnimationProps) {
  const getInitialPosition = () => {
    switch (position) {
      case 'top-right':
        return { x: 100, y: -100 };
      case 'top-left':
        return { x: -100, y: -100 };
      case 'bottom-right':
        return { x: 100, y: 100 };
      case 'bottom-left':
        return { x: -100, y: 100 };
      default:
        return { x: 100, y: -100 };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ ...getInitialPosition(), opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={{ ...getInitialPosition(), opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Smooth height animation for collapsible content
interface CollapsibleAnimationProps {
  children: React.ReactNode;
  isOpen: boolean;
  className?: string;
}

export function CollapsibleAnimation({ children, isOpen, className }: CollapsibleAnimationProps) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{ overflow: 'hidden' }}
    >
      {children}
    </motion.div>
  );
}