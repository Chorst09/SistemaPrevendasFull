import { useEffect, useMemo } from 'react';
import { 
  checkContrastAccessibility, 
  warnLowContrast, 
  validateColorPalette,
  type ContrastResult 
} from '@/lib/utils/accessibility';

/**
 * Hook to check color contrast accessibility
 */
export function useContrastCheck(
  foregroundColor: string,
  backgroundColor: string,
  isLargeText: boolean = false,
  context?: string
): ContrastResult {
  const result = useMemo(() => {
    return checkContrastAccessibility(foregroundColor, backgroundColor, isLargeText);
  }, [foregroundColor, backgroundColor, isLargeText]);

  // Warn in development if contrast is not accessible
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !result.isAccessible) {
      warnLowContrast(foregroundColor, backgroundColor, context);
    }
  }, [foregroundColor, backgroundColor, context, result.isAccessible]);

  return result;
}

/**
 * Hook to validate the entire color palette on mount
 */
export function useColorPaletteValidation(): void {
  useEffect(() => {
    validateColorPalette();
  }, []);
}

/**
 * Hook to get accessibility status for multiple color combinations
 */
export function useBatchContrastCheck(
  combinations: Array<{
    foreground: string;
    background: string;
    isLargeText?: boolean;
    label?: string;
  }>
): Array<ContrastResult & { label?: string }> {
  return useMemo(() => {
    return combinations.map(({ foreground, background, isLargeText = false, label }) => ({
      ...checkContrastAccessibility(foreground, background, isLargeText),
      label
    }));
  }, [combinations]);
}

/**
 * Hook to get CSS custom properties with accessibility warnings
 */
export function useAccessibleColors() {
  // Validate palette on mount
  useColorPaletteValidation();

  return {
    // Primary colors
    primary: {
      900: 'hsl(var(--primary-900))',
      800: 'hsl(var(--primary-800))',
      700: 'hsl(var(--primary-700))',
      600: 'hsl(var(--primary-600))',
      500: 'hsl(var(--primary-500))',
    },
    // Accent colors
    accent: {
      orange: 'hsl(var(--accent-orange))',
      cyan: 'hsl(var(--accent-cyan))',
      teal: 'hsl(var(--accent-teal))',
    },
    // Semantic colors
    semantic: {
      success: 'hsl(var(--success))',
      warning: 'hsl(var(--warning))',
      error: 'hsl(var(--error))',
      info: 'hsl(var(--info))',
    }
  };
}