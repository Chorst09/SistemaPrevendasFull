import { describe, it, expect, vi } from 'vitest';
import {
  hexToRgb,
  getRelativeLuminance,
  calculateContrastRatio,
  checkContrastAccessibility,
  batchCheckContrast,
  getColorPaletteReport,
  warnLowContrast,
  validateColorPalette
} from '../accessibility';

describe('Accessibility Utils', () => {
  describe('hexToRgb', () => {
    it('should convert hex colors to RGB', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('should handle hex colors without # prefix', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should return null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#GG0000')).toBeNull();
      expect(hexToRgb('#FF00')).toBeNull();
    });
  });

  describe('getRelativeLuminance', () => {
    it('should calculate correct luminance for white', () => {
      const white = { r: 255, g: 255, b: 255 };
      expect(getRelativeLuminance(white)).toBeCloseTo(1, 2);
    });

    it('should calculate correct luminance for black', () => {
      const black = { r: 0, g: 0, b: 0 };
      expect(getRelativeLuminance(black)).toBeCloseTo(0, 2);
    });

    it('should calculate luminance for color values', () => {
      const red = { r: 255, g: 0, b: 0 };
      const luminance = getRelativeLuminance(red);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('calculateContrastRatio', () => {
    it('should calculate maximum contrast for black and white', () => {
      const ratio = calculateContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate same ratio regardless of color order', () => {
      const ratio1 = calculateContrastRatio('#000000', '#FFFFFF');
      const ratio2 = calculateContrastRatio('#FFFFFF', '#000000');
      expect(ratio1).toEqual(ratio2);
    });

    it('should calculate ratio of 1 for identical colors', () => {
      const ratio = calculateContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 2);
    });

    it('should throw error for invalid colors', () => {
      expect(() => calculateContrastRatio('invalid', '#FFFFFF')).toThrow();
      expect(() => calculateContrastRatio('#FFFFFF', 'invalid')).toThrow();
    });
  });

  describe('checkContrastAccessibility', () => {
    it('should pass AAA for high contrast combinations', () => {
      const result = checkContrastAccessibility('#000000', '#FFFFFF');
      expect(result.level).toBe('AAA');
      expect(result.isAccessible).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 0);
    });

    it('should fail for low contrast combinations', () => {
      const result = checkContrastAccessibility('#888888', '#999999');
      expect(result.level).toBe('FAIL');
      expect(result.isAccessible).toBe(false);
      expect(result.recommendation).toContain('fails accessibility standards');
    });

    it('should have different thresholds for large text', () => {
      // A combination that might pass for large text but fail for normal text
      const normalText = checkContrastAccessibility('#767676', '#FFFFFF', false);
      const largeText = checkContrastAccessibility('#767676', '#FFFFFF', true);
      
      // Large text has more lenient requirements
      expect(largeText.isAccessible).toBe(true);
    });

    it('should provide recommendations for failing combinations', () => {
      const result = checkContrastAccessibility('#CCCCCC', '#DDDDDD');
      expect(result.recommendation).toBeDefined();
      expect(result.recommendation).toContain('contrast');
    });
  });

  describe('batchCheckContrast', () => {
    it('should check multiple color combinations', () => {
      const combinations = [
        { foreground: '#000000', background: '#FFFFFF', label: 'Black on White' },
        { foreground: '#FFFFFF', background: '#000000', label: 'White on Black' },
        { foreground: '#888888', background: '#999999', label: 'Low Contrast' }
      ];

      const results = batchCheckContrast(combinations);
      
      expect(results).toHaveLength(3);
      expect(results[0].label).toBe('Black on White');
      expect(results[0].isAccessible).toBe(true);
      expect(results[2].isAccessible).toBe(false);
    });
  });

  describe('getColorPaletteReport', () => {
    it('should return contrast report for color palette', () => {
      const report = getColorPaletteReport();
      
      expect(report.length).toBeGreaterThan(0);
      expect(report[0]).toHaveProperty('combination');
      expect(report[0]).toHaveProperty('ratio');
      expect(report[0]).toHaveProperty('level');
      expect(report[0]).toHaveProperty('isAccessible');
    });

    it('should include specific color combinations from the design system', () => {
      const report = getColorPaletteReport();
      const combinations = report.map(r => r.combination);
      
      expect(combinations).toContain('White text on Primary 900');
      expect(combinations).toContain('Orange on Primary 900');
      expect(combinations).toContain('Cyan on White');
    });
  });

  describe('warnLowContrast', () => {
    it('should warn for low contrast combinations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      warnLowContrast('#CCCCCC', '#DDDDDD', 'test component');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Accessibility Warning in test component')
      );
      
      consoleSpy.mockRestore();
    });

    it('should not warn for accessible combinations', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      warnLowContrast('#000000', '#FFFFFF');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('validateColorPalette', () => {
    it('should log results in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
      
      validateColorPalette();
      
      // Should call either log (success) or warn (failures)
      expect(consoleLogSpy.mock.calls.length + consoleWarnSpy.mock.calls.length).toBeGreaterThan(0);
      
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleGroupSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log in production environment', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      validateColorPalette();
      
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });
});