/**
 * Accessibility utilities for color contrast checking and validation
 * Based on WCAG 2.1 guidelines
 */

export interface ContrastResult {
  ratio: number;
  level: 'AAA' | 'AA' | 'A' | 'FAIL';
  isAccessible: boolean;
  recommendation?: string;
}

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): ColorRGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getRelativeLuminance(rgb: ColorRGB): number {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    throw new Error('Invalid color format. Please use hex colors (e.g., #FF0000)');
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}/**

 * Check if contrast ratio meets WCAG guidelines
 */
export function checkContrastAccessibility(
  foregroundColor: string, 
  backgroundColor: string, 
  isLargeText: boolean = false
): ContrastResult {
  const ratio = calculateContrastRatio(foregroundColor, backgroundColor);
  
  // WCAG 2.1 thresholds
  const normalTextAAA = 7;
  const normalTextAA = 4.5;
  const largeTextAAA = 4.5;
  const largeTextAA = 3;
  
  const requiredRatio = isLargeText ? largeTextAA : normalTextAA;
  const aaaRatio = isLargeText ? largeTextAAA : normalTextAAA;
  
  let level: ContrastResult['level'];
  let recommendation: string | undefined;
  
  if (ratio >= aaaRatio) {
    level = 'AAA';
  } else if (ratio >= requiredRatio) {
    level = 'AA';
  } else if (ratio >= 3) {
    level = 'A';
    recommendation = `Contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard. Consider using darker/lighter colors.`;
  } else {
    level = 'FAIL';
    recommendation = `Contrast ratio ${ratio.toFixed(2)} fails accessibility standards. Please choose colors with higher contrast.`;
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    level,
    isAccessible: ratio >= requiredRatio,
    recommendation
  };
}

/**
 * Batch check multiple color combinations
 */
export function batchCheckContrast(
  colorCombinations: Array<{
    foreground: string;
    background: string;
    isLargeText?: boolean;
    label?: string;
  }>
): Array<ContrastResult & { label?: string }> {
  return colorCombinations.map(({ foreground, background, isLargeText = false, label }) => ({
    ...checkContrastAccessibility(foreground, background, isLargeText),
    label
  }));
}

/**
 * Get color palette contrast report
 */
export function getColorPaletteReport(): Array<ContrastResult & { combination: string }> {
  // Define the color palette from the design system
  const colors = {
    'primary-900': '#1a2332',
    'primary-800': '#2a3441',
    'primary-700': '#3a4550',
    'primary-600': '#4a5660',
    'primary-500': '#5a6770',
    'accent-orange': '#FF6B35',
    'accent-cyan': '#00D4FF',
    'accent-teal': '#00B4A6',
    'white': '#FFFFFF',
    'black': '#000000'
  };
  
  const combinations = [
    // Text on dark backgrounds
    { fg: colors.white, bg: colors['primary-900'], combo: 'White text on Primary 900' },
    { fg: colors.white, bg: colors['primary-800'], combo: 'White text on Primary 800' },
    { fg: colors.white, bg: colors['primary-700'], combo: 'White text on Primary 700' },
    
    // Dark text on light backgrounds
    { fg: colors['primary-900'], bg: colors.white, combo: 'Primary 900 text on White' },
    { fg: colors['primary-800'], bg: colors.white, combo: 'Primary 800 text on White' },
    
    // Accent colors on dark backgrounds
    { fg: colors['accent-orange'], bg: colors['primary-900'], combo: 'Orange on Primary 900' },
    { fg: colors['accent-cyan'], bg: colors['primary-900'], combo: 'Cyan on Primary 900' },
    { fg: colors['accent-teal'], bg: colors['primary-900'], combo: 'Teal on Primary 900' },
    
    // Accent colors on light backgrounds
    { fg: colors['accent-orange'], bg: colors.white, combo: 'Orange on White' },
    { fg: colors['accent-cyan'], bg: colors.white, combo: 'Cyan on White' },
    { fg: colors['accent-teal'], bg: colors.white, combo: 'Teal on White' },
  ];
  
  return combinations.map(({ fg, bg, combo }) => ({
    ...checkContrastAccessibility(fg, bg),
    combination: combo
  }));
}

/**
 * Console warning for low contrast combinations
 */
export function warnLowContrast(
  foregroundColor: string, 
  backgroundColor: string, 
  context?: string
): void {
  const result = checkContrastAccessibility(foregroundColor, backgroundColor);
  
  if (!result.isAccessible) {
    const contextStr = context ? ` in ${context}` : '';
    console.warn(
      `⚠️ Accessibility Warning${contextStr}: Low contrast detected!\n` +
      `Foreground: ${foregroundColor}, Background: ${backgroundColor}\n` +
      `Contrast ratio: ${result.ratio} (${result.level})\n` +
      `${result.recommendation || 'Consider using colors with higher contrast.'}`
    );
  }
}

/**
 * Development helper to check all color combinations in the palette
 */
export function validateColorPalette(): void {
  if (process.env.NODE_ENV === 'development') {
    const report = getColorPaletteReport();
    const failedCombinations = report.filter(r => !r.isAccessible);
    
    if (failedCombinations.length > 0) {
      console.group('🎨 Color Palette Accessibility Report');
      console.warn(`Found ${failedCombinations.length} combinations that don't meet WCAG AA standards:`);
      
      failedCombinations.forEach(result => {
        console.warn(`❌ ${result.combination}: ${result.ratio} (${result.level})`);
      });
      
      console.groupEnd();
    } else {
      console.log('✅ All color combinations meet WCAG AA accessibility standards!');
    }
  }
}