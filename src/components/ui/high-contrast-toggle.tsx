'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from './button';
import { useContrastCheck } from '@/hooks/use-accessibility';

export function HighContrastToggle() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  // Check current contrast for the toggle button itself
  const contrastResult = useContrastCheck(
    isHighContrast ? '#000000' : '#FFFFFF',
    isHighContrast ? '#FFFF00' : '#1a2332',
    false,
    'High Contrast Toggle Button'
  );

  useEffect(() => {
    // Check if high contrast mode is already enabled
    const savedPreference = localStorage.getItem('high-contrast-mode');
    const systemPreference = window.matchMedia('(prefers-contrast: high)').matches;
    
    const shouldEnable = savedPreference === 'true' || 
                        (savedPreference === null && systemPreference);
    
    if (shouldEnable) {
      setIsHighContrast(true);
      document.documentElement.classList.add('high-contrast');
    }
  }, []);

  useEffect(() => {
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem('high-contrast-mode') === null) {
        setIsHighContrast(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('high-contrast');
        } else {
          document.documentElement.classList.remove('high-contrast');
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    const newState = !isHighContrast;
    setIsHighContrast(newState);
    
    // Save preference
    localStorage.setItem('high-contrast-mode', newState.toString());
    
    // Apply to document
    if (newState) {
      document.documentElement.classList.add('high-contrast');
      // Remove other theme classes to avoid conflicts
      document.documentElement.classList.remove('light', 'dark');
    } else {
      document.documentElement.classList.remove('high-contrast');
      // Restore default theme (dark in this case)
      document.documentElement.classList.add('dark');
    }

    // Announce change to screen readers
    const announcement = newState 
      ? 'High contrast mode enabled' 
      : 'High contrast mode disabled';
    
    // Create temporary announcement element
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = announcement;
    document.body.appendChild(announcer);
    
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  };

  return (
    <Button
      variant={isHighContrast ? "default" : "outline"}
      size="sm"
      onClick={toggleHighContrast}
      className={`
        relative transition-all duration-200
        ${isHighContrast ? 'bg-yellow-500 text-black border-2 border-black' : ''}
        hover:scale-105 focus:scale-105
      `}
      aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
      title={`Current contrast ratio: ${contrastResult.ratio} (${contrastResult.level})`}
    >
      {isHighContrast ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">
        {isHighContrast ? 'High Contrast' : 'Normal'}
      </span>
      
      {/* Accessibility indicator */}
      <span className="sr-only">
        High contrast mode is currently {isHighContrast ? 'enabled' : 'disabled'}.
        Contrast ratio: {contrastResult.ratio} ({contrastResult.level}).
        {!contrastResult.isAccessible && ' Warning: Current contrast may not meet accessibility standards.'}
      </span>
    </Button>
  );
}