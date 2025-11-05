import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CSSPerformanceAnalyzer,
  CSSCustomPropertiesOptimizer,
  CSSPerformanceMonitor,
  validateColorSystemPerformance
} from '../css-performance';

describe('CSS Performance Utilities', () => {
  let testStyle: HTMLStyleElement;

  beforeEach(() => {
    // Create test stylesheet
    testStyle = document.createElement('style');
    testStyle.textContent = `
      :root {
        --primary-900: #1a2332;
        --primary-800: #2a3441;
        --primary-700: #3a4550;
        --accent-orange: #FF6B35;
        --accent-cyan: #00D4FF;
      }
      
      .test-class {
        background-color: var(--primary-900);
        transition: all 0.3s ease;
      }
      
      .complex-selector > .nested .deep[data-test="value"]:hover::before {
        color: var(--accent-orange);
        animation: fadeIn 0.5s ease-in-out;
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(testStyle);
  });

  afterEach(() => {
    if (testStyle && testStyle.parentNode) {
      document.head.removeChild(testStyle);
    }
  });

  describe('CSSPerformanceAnalyzer', () => {
    it('should analyze CSS performance metrics', () => {
      const analyzer = new CSSPerformanceAnalyzer();
      const metrics = analyzer.analyzePerformance();

      expect(metrics.customPropertiesCount).toBeGreaterThan(0);
      expect(metrics.selectorComplexity).toBeGreaterThan(0);
      expect(metrics.estimatedRenderTime).toBeGreaterThan(0);
    });

    it('should generate optimization suggestions for high complexity', () => {
      // Add more complex CSS to trigger suggestions
      const complexStyle = document.createElement('style');
      complexStyle.textContent = `
        ${Array.from({ length: 150 }, (_, i) => `--test-prop-${i}: #${i.toString(16).padStart(6, '0')};`).join('\n')}
        
        ${Array.from({ length: 30 }, (_, i) => `
          .animation-${i} {
            animation: spin-${i} 1s infinite;
          }
          @keyframes spin-${i} {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `).join('\n')}
      `;
      document.head.appendChild(complexStyle);

      const analyzer = new CSSPerformanceAnalyzer();
      const suggestions = analyzer.generateOptimizationSuggestions();

      expect(suggestions.length).toBeGreaterThan(0);
      
      // Check if any suggestion mentions performance issues
      const hasPerformanceSuggestion = suggestions.some(s => 
        s.message.includes('custom properties') || 
        s.message.includes('animations') || 
        s.message.includes('complexity')
      );
      expect(hasPerformanceSuggestion).toBe(true);

      document.head.removeChild(complexStyle);
    });

    it('should calculate selector complexity correctly', () => {
      const analyzer = new CSSPerformanceAnalyzer();
      const metrics = analyzer.analyzePerformance();

      // Should detect complex selectors
      expect(metrics.selectorComplexity).toBeGreaterThan(5);
    });
  });

  describe('CSSCustomPropertiesOptimizer', () => {
    it('should remove duplicate custom properties', () => {
      const cssWithDuplicates = `
        :root {
          --primary-color: #1a2332;
          --secondary-color: #2a3441;
          --primary-color: #1a2332; /* duplicate */
        }
      `;

      const optimized = CSSCustomPropertiesOptimizer.optimizeCustomProperties(cssWithDuplicates);
      
      // Should only have one instance of --primary-color
      const primaryMatches = optimized.match(/--primary-color/g);
      expect(primaryMatches).toHaveLength(1);
    });

    it('should group related properties', () => {
      const cssWithMixedProperties = `
        :root {
          --primary-900: #1a2332;
          --accent-orange: #FF6B35;
          --primary-800: #2a3441;
          --accent-cyan: #00D4FF;
        }
      `;

      const grouped = CSSCustomPropertiesOptimizer.groupRelatedProperties(cssWithMixedProperties);
      
      // Should contain group comments
      expect(grouped).toContain('/* primary colors */');
      expect(grouped).toContain('/* accent colors */');
    });
  });

  describe('CSSPerformanceMonitor', () => {
    it('should be a singleton', () => {
      const monitor1 = CSSPerformanceMonitor.getInstance();
      const monitor2 = CSSPerformanceMonitor.getInstance();
      
      expect(monitor1).toBe(monitor2);
    });

    it('should measure CSS operation performance', async () => {
      const monitor = CSSPerformanceMonitor.getInstance();
      
      const testOperation = async () => {
        // Simulate CSS operation
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'test-result';
      };

      const { result, duration } = await monitor.measureCSSOperation(
        testOperation,
        'test-css-operation'
      );

      expect(result).toBe('test-result');
      expect(duration).toBeGreaterThan(0);
    });

    it('should handle synchronous operations', async () => {
      const monitor = CSSPerformanceMonitor.getInstance();
      
      const syncOperation = () => {
        return 'sync-result';
      };

      const { result, duration } = await monitor.measureCSSOperation(
        syncOperation,
        'sync-operation'
      );

      expect(result).toBe('sync-result');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateColorSystemPerformance', () => {
    it('should only run in development environment', () => {
      const originalEnv = process.env.NODE_ENV;
      const consoleSpy = vi.spyOn(console, 'group').mockImplementation(() => {});

      // Test production environment
      vi.stubEnv('NODE_ENV', 'production');

      validateColorSystemPerformance();
      expect(consoleSpy).not.toHaveBeenCalled();

      // Test development environment
      vi.stubEnv('NODE_ENV', 'development');

      validateColorSystemPerformance();
      expect(consoleSpy).toHaveBeenCalled();

      // Restore
      vi.unstubAllEnvs();
      consoleSpy.mockRestore();
    });

    it('should log performance metrics in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

      validateColorSystemPerformance();

      expect(consoleGroupSpy).toHaveBeenCalledWith('🎨 Color System Performance Analysis');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleGroupEndSpy).toHaveBeenCalled();

      // Restore
      vi.unstubAllEnvs();
      consoleGroupSpy.mockRestore();
      consoleLogSpy.mockRestore();
      consoleGroupEndSpy.mockRestore();
    });
  });

  describe('Performance Thresholds', () => {
    it('should detect performance issues with many custom properties', () => {
      // Create stylesheet with many custom properties
      const heavyStyle = document.createElement('style');
      heavyStyle.textContent = `:root {
        ${Array.from({ length: 150 }, (_, i) => `--prop-${i}: #${i.toString(16).padStart(6, '0')};`).join('\n')}
      }`;
      document.head.appendChild(heavyStyle);

      const analyzer = new CSSPerformanceAnalyzer();
      const suggestions = analyzer.generateOptimizationSuggestions();

      expect(suggestions.some(s => s.type === 'warning' && s.message.includes('custom properties'))).toBe(true);

      document.head.removeChild(heavyStyle);
    });

    it('should detect high selector complexity', () => {
      const complexStyle = document.createElement('style');
      complexStyle.textContent = Array.from({ length: 50 }, (_, i) => `
        .complex-${i} > .nested-${i} .deep-${i}[data-test="${i}"]:hover::before {
          color: red;
        }
      `).join('\n');
      document.head.appendChild(complexStyle);

      const analyzer = new CSSPerformanceAnalyzer();
      const suggestions = analyzer.generateOptimizationSuggestions();

      expect(suggestions.some(s => s.type === 'error' && s.message.includes('complexity'))).toBe(true);

      document.head.removeChild(complexStyle);
    });
  });
});