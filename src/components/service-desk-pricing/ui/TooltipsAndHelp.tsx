'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Info, AlertCircle, CheckCircle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Tooltip component with rich content support
interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  maxWidth?: number;
  showArrow?: boolean;
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  trigger = 'hover',
  maxWidth = 300,
  showArrow = true,
  className 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  // Calculate optimal position based on viewport
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let optimalPosition = position;

      // Check if tooltip would overflow and adjust position
      if (position === 'top' && triggerRect.top - tooltipRect.height < 0) {
        optimalPosition = 'bottom';
      } else if (position === 'bottom' && triggerRect.bottom + tooltipRect.height > viewport.height) {
        optimalPosition = 'top';
      } else if (position === 'left' && triggerRect.left - tooltipRect.width < 0) {
        optimalPosition = 'right';
      } else if (position === 'right' && triggerRect.right + tooltipRect.width > viewport.width) {
        optimalPosition = 'left';
      }

      setActualPosition(optimalPosition);
    }
  }, [isVisible, position]);

  const getTooltipPosition = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    if (!showArrow) return '';
    
    switch (actualPosition) {
      case 'top':
        return 'after:absolute after:top-full after:left-1/2 after:transform after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900';
      case 'bottom':
        return 'after:absolute after:bottom-full after:left-1/2 after:transform after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-gray-900';
      case 'left':
        return 'after:absolute after:left-full after:top-1/2 after:transform after:-translate-y-1/2 after:border-4 after:border-transparent after:border-l-gray-900';
      case 'right':
        return 'after:absolute after:right-full after:top-1/2 after:transform after:-translate-y-1/2 after:border-4 after:border-transparent after:border-r-gray-900';
      default:
        return '';
    }
  };

  const triggerProps = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip
  } : {
    onClick: () => setIsVisible(!isVisible)
  };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div {...triggerProps}>
        {children}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg',
              getTooltipPosition(),
              getArrowClasses(),
              className
            )}
            style={{ maxWidth }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Help icon with tooltip
interface HelpIconProps {
  content: React.ReactNode;
  size?: number;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpIcon({ content, size = 16, className, position = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <HelpCircle 
        size={size} 
        className={cn("text-gray-400 hover:text-gray-600 cursor-help", className)} 
      />
    </Tooltip>
  );
}

// Info icon with tooltip
export function InfoIcon({ content, size = 16, className, position = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <Info 
        size={size} 
        className={cn("text-blue-400 hover:text-blue-600 cursor-help", className)} 
      />
    </Tooltip>
  );
}

// Warning icon with tooltip
export function WarningIcon({ content, size = 16, className, position = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <AlertCircle 
        size={size} 
        className={cn("text-yellow-400 hover:text-yellow-600 cursor-help", className)} 
      />
    </Tooltip>
  );
}

// Success icon with tooltip
export function SuccessIcon({ content, size = 16, className, position = 'top' }: HelpIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <CheckCircle 
        size={size} 
        className={cn("text-green-400 hover:text-green-600 cursor-help", className)} 
      />
    </Tooltip>
  );
}

// Contextual help panel
interface ContextualHelpProps {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'right' | 'left';
  width?: number;
}

export function ContextualHelp({ 
  title, 
  content, 
  isOpen, 
  onClose, 
  position = 'right',
  width = 400 
}: ContextualHelpProps) {
  const slideDirection = position === 'right' ? { x: '100%' } : { x: '-100%' };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={onClose}
          />
          
          {/* Help Panel */}
          <motion.div
            initial={slideDirection}
            animate={{ x: 0 }}
            exit={slideDirection}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "fixed top-0 bottom-0 bg-white shadow-xl z-50 overflow-y-auto",
              position === 'right' ? 'right-0' : 'left-0'
            )}
            style={{ width }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X size={16} />
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                {content}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Field help component with inline help text
interface FieldHelpProps {
  label: string;
  help?: string;
  tooltip?: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldHelp({ 
  label, 
  help, 
  tooltip, 
  required, 
  children, 
  className 
}: FieldHelpProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {tooltip && <HelpIcon content={tooltip} />}
      </div>
      {children}
      {help && (
        <p className="text-xs text-gray-500">{help}</p>
      )}
    </div>
  );
}

// Quick help card for sections
interface QuickHelpCardProps {
  title: string;
  description: string;
  tips?: string[];
  links?: Array<{ label: string; url: string }>;
  className?: string;
}

export function QuickHelpCard({ 
  title, 
  description, 
  tips, 
  links, 
  className 
}: QuickHelpCardProps) {
  return (
    <Card className={cn("bg-blue-50 border-blue-200", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-blue-800 flex items-center space-x-2">
          <Info size={16} />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <p className="text-sm text-blue-700">{description}</p>
        
        {tips && tips.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-blue-800 mb-2">Dicas:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {links && links.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-blue-800 mb-2">Links úteis:</h4>
            <div className="space-y-1">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>{link.label}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Progress help indicator
interface ProgressHelpProps {
  currentStep: number;
  totalSteps: number;
  stepDescriptions: string[];
  className?: string;
}

export function ProgressHelp({ 
  currentStep, 
  totalSteps, 
  stepDescriptions, 
  className 
}: ProgressHelpProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Progresso</span>
        <span className="text-gray-800 font-medium">
          {currentStep} de {totalSteps}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-blue-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {stepDescriptions[currentStep - 1] && (
        <p className="text-xs text-gray-600">
          {stepDescriptions[currentStep - 1]}
        </p>
      )}
    </div>
  );
}

// Validation help component
interface ValidationHelpProps {
  errors: string[];
  warnings: string[];
  suggestions: string[];
  className?: string;
}

export function ValidationHelp({ 
  errors, 
  warnings, 
  suggestions, 
  className 
}: ValidationHelpProps) {
  if (errors.length === 0 && warnings.length === 0 && suggestions.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>Erros que precisam ser corrigidos:</span>
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-yellow-800 mb-2 flex items-center space-x-2">
            <AlertCircle size={16} />
            <span>Avisos:</span>
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center space-x-2">
            <Info size={16} />
            <span>Sugestões:</span>
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}