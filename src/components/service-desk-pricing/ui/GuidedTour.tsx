'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Tour step interface
export interface TourStep {
  id: string;
  title: string;
  content: React.ReactNode;
  target?: string; // CSS selector for the element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'focus' | 'none';
  actionTarget?: string; // CSS selector for action element
  waitForElement?: string; // Wait for element to appear
  beforeStep?: () => Promise<void> | void;
  afterStep?: () => Promise<void> | void;
  skippable?: boolean;
  category?: 'basic' | 'advanced' | 'tips';
  estimatedTime?: number; // in seconds
}

// Tour configuration
export interface TourConfig {
  id: string;
  title: string;
  description: string;
  steps: TourStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  showMinimap?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number, step: TourStep) => void;
}

// Guided tour component
interface GuidedTourProps {
  config: TourConfig;
  isActive: boolean;
  onClose: () => void;
  className?: string;
}

export function GuidedTour({ config, isActive, onClose, className }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(config.autoStart ?? false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isWaitingForElement, setIsWaitingForElement] = useState(false);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentStep = config.steps[currentStepIndex];
  const isLastStep = currentStepIndex === config.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Calculate progress
  const progress = ((currentStepIndex + 1) / config.steps.length) * 100;
  const totalEstimatedTime = config.steps.reduce((acc, step) => acc + (step.estimatedTime || 30), 0);
  const completedTime = config.steps.slice(0, currentStepIndex + 1).reduce((acc, step) => acc + (step.estimatedTime || 30), 0);

  // Highlight target element
  const highlightElement = useCallback((selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      setHighlightedElement(element);
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      let x = rect.left + scrollLeft + rect.width / 2;
      let y = rect.top + scrollTop;
      
      // Adjust position based on step position preference
      switch (currentStep?.position) {
        case 'bottom':
          y = rect.bottom + scrollTop + 10;
          break;
        case 'top':
          y = rect.top + scrollTop - 10;
          break;
        case 'left':
          x = rect.left + scrollLeft - 10;
          y = rect.top + scrollTop + rect.height / 2;
          break;
        case 'right':
          x = rect.right + scrollLeft + 10;
          y = rect.top + scrollTop + rect.height / 2;
          break;
        case 'center':
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
          break;
      }
      
      setTooltipPosition({ x, y });
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }, [currentStep]);

  // Wait for element to appear
  const waitForElement = useCallback(async (selector: string): Promise<Element | null> => {
    return new Promise((resolve) => {
      const checkElement = () => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else {
          setTimeout(checkElement, 100);
        }
      };
      checkElement();
    });
  }, []);

  // Execute step
  const executeStep = useCallback(async (step: TourStep) => {
    try {
      setIsWaitingForElement(true);
      
      // Execute before step action
      if (step.beforeStep) {
        await step.beforeStep();
      }
      
      // Wait for element if specified
      if (step.waitForElement) {
        await waitForElement(step.waitForElement);
      }
      
      // Highlight target element
      if (step.target) {
        highlightElement(step.target);
      }
      
      // Execute action if specified
      if (step.action && step.actionTarget) {
        const actionElement = document.querySelector(step.actionTarget);
        if (actionElement) {
          switch (step.action) {
            case 'click':
              (actionElement as HTMLElement).click();
              break;
            case 'hover':
              actionElement.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
              break;
            case 'focus':
              (actionElement as HTMLElement).focus();
              break;
          }
        }
      }
      
      // Execute after step action
      if (step.afterStep) {
        await step.afterStep();
      }
      
      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, step.id]));
      
      // Notify step change
      config.onStepChange?.(currentStepIndex, step);
      
    } catch (error) {
      console.error('Error executing tour step:', error);
    } finally {
      setIsWaitingForElement(false);
    }
  }, [currentStepIndex, config, highlightElement, waitForElement]);

  // Navigate to step
  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < config.steps.length) {
      setCurrentStepIndex(stepIndex);
      const step = config.steps[stepIndex];
      await executeStep(step);
    }
  }, [config.steps, executeStep]);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (!isLastStep) {
      goToStep(currentStepIndex + 1);
    } else {
      completeTour();
    }
  }, [currentStepIndex, isLastStep, goToStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, isFirstStep, goToStep]);

  const completeTour = useCallback(() => {
    setIsPlaying(false);
    config.onComplete?.();
    onClose();
  }, [config, onClose]);

  const skipTour = useCallback(() => {
    setIsPlaying(false);
    config.onSkip?.();
    onClose();
  }, [config, onClose]);

  const restartTour = useCallback(() => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setIsPlaying(true);
    goToStep(0);
  }, [goToStep]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep?.estimatedTime) {
      intervalRef.current = setTimeout(() => {
        nextStep();
      }, currentStep.estimatedTime * 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, nextStep]);

  // Initialize tour
  useEffect(() => {
    if (isActive && config.steps.length > 0) {
      goToStep(0);
    }
  }, [isActive, config.steps, goToStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  if (!isActive) return null;

  return (
    <div className={cn("fixed inset-0 z-50", className)}>
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black bg-opacity-50"
        style={{
          background: highlightedElement 
            ? `radial-gradient(circle at ${tooltipPosition.x}px ${tooltipPosition.y}px, transparent 100px, rgba(0,0,0,0.5) 100px)`
            : 'rgba(0,0,0,0.5)'
        }}
      />
      
      {/* Highlighted element outline */}
      {highlightedElement && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute border-2 border-blue-400 rounded-md pointer-events-none"
          style={{
            left: highlightedElement.getBoundingClientRect().left - 2,
            top: highlightedElement.getBoundingClientRect().top - 2,
            width: highlightedElement.getBoundingClientRect().width + 4,
            height: highlightedElement.getBoundingClientRect().height + 4,
          }}
        />
      )}
      
      {/* Tour tooltip */}
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute z-10"
        style={{
          left: tooltipPosition.x - 200, // Adjust based on tooltip width
          top: tooltipPosition.y + 20,
          maxWidth: 400
        }}
      >
        <Card className="shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {currentStepIndex + 1} de {config.steps.length}
                </Badge>
                {currentStep?.category && (
                  <Badge 
                    variant={currentStep.category === 'basic' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {currentStep.category === 'basic' ? 'Básico' : 
                     currentStep.category === 'advanced' ? 'Avançado' : 'Dica'}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X size={16} />
              </Button>
            </div>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Lightbulb size={20} className="text-yellow-500" />
              <span>{currentStep?.title}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Progress bar */}
            {config.showProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{Math.round(completedTime / 60)} min</span>
                  <span>{Math.round(totalEstimatedTime / 60)} min total</span>
                </div>
              </div>
            )}
            
            {/* Step content */}
            <div className="prose prose-sm max-w-none">
              {currentStep?.content}
            </div>
            
            {/* Waiting indicator */}
            {isWaitingForElement && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full"
                />
                <span>Aguardando elemento...</span>
              </div>
            )}
            
            {/* Navigation controls */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isWaitingForElement}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  <span className="ml-1">{isPlaying ? 'Pausar' : 'Reproduzir'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restartTour}
                  disabled={isWaitingForElement}
                >
                  <RotateCcw size={16} />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                {config.allowSkip && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    disabled={isWaitingForElement}
                  >
                    Pular tour
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousStep}
                  disabled={isFirstStep || isWaitingForElement}
                >
                  <ChevronLeft size={16} />
                  <span className="ml-1">Anterior</span>
                </Button>
                
                <Button
                  onClick={nextStep}
                  size="sm"
                  disabled={isWaitingForElement}
                  className="flex items-center space-x-1"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Concluir</span>
                    </>
                  ) : (
                    <>
                      <span>Próximo</span>
                      <ChevronRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Mini-map */}
      {config.showMinimap && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs"
        >
          <h4 className="text-sm font-medium mb-2">{config.title}</h4>
          <div className="space-y-1">
            {config.steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex items-center space-x-2 text-xs p-1 rounded cursor-pointer",
                  index === currentStepIndex ? "bg-blue-100 text-blue-800" :
                  completedSteps.has(step.id) ? "bg-green-100 text-green-800" :
                  "text-gray-600 hover:bg-gray-100"
                )}
                onClick={() => goToStep(index)}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  index === currentStepIndex ? "bg-blue-500" :
                  completedSteps.has(step.id) ? "bg-green-500" :
                  "bg-gray-300"
                )} />
                <span className="truncate">{step.title}</span>
                {index === currentStepIndex && <ArrowRight size={12} />}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Tour step builder helper
export class TourStepBuilder {
  private step: Partial<TourStep> = {};

  static create(id: string): TourStepBuilder {
    const builder = new TourStepBuilder();
    builder.step.id = id;
    return builder;
  }

  title(title: string): TourStepBuilder {
    this.step.title = title;
    return this;
  }

  content(content: React.ReactNode): TourStepBuilder {
    this.step.content = content;
    return this;
  }

  target(selector: string): TourStepBuilder {
    this.step.target = selector;
    return this;
  }

  position(position: 'top' | 'bottom' | 'left' | 'right' | 'center'): TourStepBuilder {
    this.step.position = position;
    return this;
  }

  action(action: 'click' | 'hover' | 'focus' | 'none', target?: string): TourStepBuilder {
    this.step.action = action;
    this.step.actionTarget = target;
    return this;
  }

  waitFor(selector: string): TourStepBuilder {
    this.step.waitForElement = selector;
    return this;
  }

  beforeStep(callback: () => Promise<void> | void): TourStepBuilder {
    this.step.beforeStep = callback;
    return this;
  }

  afterStep(callback: () => Promise<void> | void): TourStepBuilder {
    this.step.afterStep = callback;
    return this;
  }

  category(category: 'basic' | 'advanced' | 'tips'): TourStepBuilder {
    this.step.category = category;
    return this;
  }

  estimatedTime(seconds: number): TourStepBuilder {
    this.step.estimatedTime = seconds;
    return this;
  }

  skippable(skippable: boolean = true): TourStepBuilder {
    this.step.skippable = skippable;
    return this;
  }

  build(): TourStep {
    if (!this.step.id || !this.step.title || !this.step.content) {
      throw new Error('Tour step must have id, title, and content');
    }
    return this.step as TourStep;
  }
}