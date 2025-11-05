'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { validateColorPalette } from '@/lib/utils/accessibility';

interface AccessibilityContextType {
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  announceToScreenReader: (message: string) => void;
  prefersReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');

  // Initialize accessibility settings
  useEffect(() => {
    // Validate color palette on mount
    validateColorPalette();

    // Check high contrast preference
    const savedHighContrast = localStorage.getItem('high-contrast-mode');
    const systemHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const shouldEnableHighContrast = savedHighContrast === 'true' || 
                                   (savedHighContrast === null && systemHighContrast);
    
    if (shouldEnableHighContrast) {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }

    // Check reduced motion preference
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(reducedMotionQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
      } else {
        document.documentElement.style.removeProperty('--animation-duration');
        document.documentElement.style.removeProperty('--transition-duration');
      }
    };

    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    // Check font size preference
    const savedFontSize = localStorage.getItem('font-size-preference') as 'normal' | 'large' | 'extra-large';
    if (savedFontSize) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }

    return () => {
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  const applyFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    const root = document.documentElement;
    root.classList.remove('font-size-normal', 'font-size-large', 'font-size-extra-large');
    root.classList.add(`font-size-${size}`);
    
    // Apply CSS custom properties for font scaling
    switch (size) {
      case 'large':
        root.style.setProperty('--font-scale', '1.125');
        break;
      case 'extra-large':
        root.style.setProperty('--font-scale', '1.25');
        break;
      default:
        root.style.setProperty('--font-scale', '1');
    }
  };

  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    
    localStorage.setItem('high-contrast-mode', newState.toString());
    
    if (newState) {
      document.documentElement.classList.add('high-contrast');
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.documentElement.classList.add('dark');
    }

    announceToScreenReader(
      newState ? 'High contrast mode enabled' : 'High contrast mode disabled'
    );
  };

  const handleSetFontSize = (size: 'normal' | 'large' | 'extra-large') => {
    setFontSize(size);
    localStorage.setItem('font-size-preference', size);
    applyFontSize(size);
    
    const sizeLabels = {
      normal: 'Normal',
      large: 'Large',
      'extra-large': 'Extra Large'
    };
    
    announceToScreenReader(`Font size changed to ${sizeLabels[size]}`);
  };

  const announceToScreenReader = (message: string) => {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only absolute -top-px -left-px w-px h-px overflow-hidden';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  };

  const value: AccessibilityContextType = {
    isHighContrast,
    toggleHighContrast,
    announceToScreenReader,
    prefersReducedMotion,
    fontSize,
    setFontSize: handleSetFontSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}