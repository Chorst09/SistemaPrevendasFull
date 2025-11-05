/**
 * CSS Performance Optimization Utilities
 * Provides tools for optimizing CSS custom properties and color system performance
 */

export interface CSSPerformanceMetrics {
  customPropertiesCount: number;
  selectorComplexity: number;
  animationCount: number;
  transitionCount: number;
  estimatedRenderTime: number;
}

export interface OptimizationSuggestion {
  type: 'warning' | 'error' | 'info';
  message: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

export class CSSPerformanceAnalyzer {
  private styleSheets: CSSStyleSheet[] = [];

  constructor() {
    this.collectStyleSheets();
  }

  private collectStyleSheets(): void {
    this.styleSheets = Array.from(document.styleSheets).filter(sheet => {
      try {
        // Test if we can access the sheet (same-origin policy)
        sheet.cssRules;
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Analyze CSS performance metrics
   */
  analyzePerformance(): CSSPerformanceMetrics {
    let customPropertiesCount = 0;
    let selectorComplexity = 0;
    let animationCount = 0;
    let transitionCount = 0;

    this.styleSheets.forEach(sheet => {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule instanceof CSSStyleRule) {
          // Count custom properties
          Array.from(rule.style).forEach(property => {
            if (property.startsWith('--')) {
              customPropertiesCount++;
            }
          });

          // Analyze selector complexity
          selectorComplexity += this.calculateSelectorComplexity(rule.selectorText);

          // Count animations and transitions
          if (rule.style.animation) animationCount++;
          if (rule.style.transition) transitionCount++;
        }
      });
    });

    const estimatedRenderTime = this.estimateRenderTime({
      customPropertiesCount,
      selectorComplexity,
      animationCount,
      transitionCount
    });

    return {
      customPropertiesCount,
      selectorComplexity,
      animationCount,
      transitionCount,
      estimatedRenderTime
    };
  }

  /**
   * Generate optimization suggestions based on analysis
   */
  generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const metrics = this.analyzePerformance();
    const suggestions: OptimizationSuggestion[] = [];

    // Custom properties analysis
    if (metrics.customPropertiesCount > 100) {
      suggestions.push({
        type: 'warning',
        message: `High number of CSS custom properties detected (${metrics.customPropertiesCount})`,
        impact: 'medium',
        suggestion: 'Consider consolidating similar properties or using CSS-in-JS for dynamic values'
      });
    }

    // Selector complexity analysis
    if (metrics.selectorComplexity > 500) {
      suggestions.push({
        type: 'error',
        message: 'High selector complexity detected',
        impact: 'high',
        suggestion: 'Simplify CSS selectors and avoid deep nesting'
      });
    }

    // Animation analysis
    if (metrics.animationCount > 20) {
      suggestions.push({
        type: 'warning',
        message: `Many animations detected (${metrics.animationCount})`,
        impact: 'medium',
        suggestion: 'Consider using will-change property and GPU acceleration'
      });
    }

    // Transition analysis
    if (metrics.transitionCount > 50) {
      suggestions.push({
        type: 'info',
        message: `Many transitions detected (${metrics.transitionCount})`,
        impact: 'low',
        suggestion: 'Ensure transitions are necessary and consider reducing duration for better UX'
      });
    }

    // Overall performance
    if (metrics.estimatedRenderTime > 16) { // 60fps threshold
      suggestions.push({
        type: 'error',
        message: 'Estimated render time exceeds 60fps threshold',
        impact: 'high',
        suggestion: 'Optimize CSS for better rendering performance'
      });
    }

    return suggestions;
  }

  /**
   * Calculate selector complexity score
   */
  private calculateSelectorComplexity(selector: string): number {
    let complexity = 0;
    
    // Base complexity
    complexity += 1;
    
    // ID selectors (fast)
    complexity += (selector.match(/#/g) || []).length * 0.5;
    
    // Class selectors (medium)
    complexity += (selector.match(/\./g) || []).length * 1;
    
    // Attribute selectors (slow)
    complexity += (selector.match(/\[/g) || []).length * 2;
    
    // Pseudo-selectors (variable)
    complexity += (selector.match(/:/g) || []).length * 1.5;
    
    // Universal selector (slow)
    complexity += (selector.match(/\*/g) || []).length * 3;
    
    // Descendant combinators (slow)
    complexity += (selector.match(/\s+/g) || []).length * 2;
    
    // Child combinators (medium)
    complexity += (selector.match(/>/g) || []).length * 1.5;
    
    return complexity;
  }

  /**
   * Estimate render time based on metrics
   */
  private estimateRenderTime(metrics: Partial<CSSPerformanceMetrics>): number {
    let renderTime = 0;
    
    // Base render time
    renderTime += 2;
    
    // Custom properties impact
    renderTime += (metrics.customPropertiesCount || 0) * 0.01;
    
    // Selector complexity impact
    renderTime += (metrics.selectorComplexity || 0) * 0.02;
    
    // Animation impact
    renderTime += (metrics.animationCount || 0) * 0.5;
    
    // Transition impact
    renderTime += (metrics.transitionCount || 0) * 0.1;
    
    return renderTime;
  }
}

/**
 * CSS Custom Properties Performance Optimizer
 */
export class CSSCustomPropertiesOptimizer {
  /**
   * Optimize CSS custom properties for better performance
   */
  static optimizeCustomProperties(cssText: string): string {
    // Remove duplicate custom properties
    const lines = cssText.split('\n');
    const seenProperties = new Set<string>();
    const optimizedLines: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('--')) {
        const propertyName = trimmed.split(':')[0].trim();
        
        if (!seenProperties.has(propertyName)) {
          seenProperties.add(propertyName);
          optimizedLines.push(line);
        }
      } else {
        optimizedLines.push(line);
      }
    });

    return optimizedLines.join('\n');
  }

  /**
   * Group related custom properties for better caching
   */
  static groupRelatedProperties(cssText: string): string {
    const lines = cssText.split('\n');
    const groups: { [key: string]: string[] } = {};
    const otherLines: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('--')) {
        const propertyName = trimmed.split(':')[0].trim();
        const prefix = propertyName.split('-')[2] || 'misc'; // Get property group
        
        if (!groups[prefix]) {
          groups[prefix] = [];
        }
        groups[prefix].push(line);
      } else {
        otherLines.push(line);
      }
    });

    // Reconstruct CSS with grouped properties
    const result: string[] = [];
    
    // Add non-property lines first
    otherLines.forEach(line => {
      if (!line.trim().startsWith('--')) {
        result.push(line);
      }
    });

    // Add grouped properties
    Object.keys(groups).sort().forEach(group => {
      result.push(`  /* ${group} colors */`);
      groups[group].forEach(line => result.push(line));
      result.push('');
    });

    return result.join('\n');
  }
}

/**
 * Performance monitoring utilities
 */
export class CSSPerformanceMonitor {
  private static instance: CSSPerformanceMonitor;
  private observers: PerformanceObserver[] = [];
  private metrics: PerformanceEntry[] = [];

  static getInstance(): CSSPerformanceMonitor {
    if (!CSSPerformanceMonitor.instance) {
      CSSPerformanceMonitor.instance = new CSSPerformanceMonitor();
    }
    return CSSPerformanceMonitor.instance;
  }

  /**
   * Start monitoring CSS performance
   */
  startMonitoring(): void {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }

    // Monitor paint events
    const paintObserver = new PerformanceObserver((list) => {
      this.metrics.push(...list.getEntries());
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(paintObserver);

    // Monitor layout shifts
    const layoutObserver = new PerformanceObserver((list) => {
      this.metrics.push(...list.getEntries());
    });
    layoutObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(layoutObserver);
  }

  /**
   * Stop monitoring and return collected metrics
   */
  stopMonitoring(): PerformanceEntry[] {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    const collectedMetrics = [...this.metrics];
    this.metrics = [];
    
    return collectedMetrics;
  }

  /**
   * Measure CSS operation performance
   */
  async measureCSSOperation<T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const startMark = `${operationName}-start`;
    const endMark = `${operationName}-end`;
    const measureName = `${operationName}-duration`;

    performance.mark(startMark);
    const result = await operation();
    performance.mark(endMark);
    
    performance.measure(measureName, startMark, endMark);
    
    const measure = performance.getEntriesByName(measureName)[0] as PerformanceMeasure;
    
    return {
      result,
      duration: measure.duration
    };
  }
}

/**
 * Validate color system performance in development
 */
export function validateColorSystemPerformance(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const analyzer = new CSSPerformanceAnalyzer();
  const metrics = analyzer.analyzePerformance();
  const suggestions = analyzer.generateOptimizationSuggestions();

  console.group('🎨 Color System Performance Analysis');
  
  console.log('📊 Metrics:', {
    'Custom Properties': metrics.customPropertiesCount,
    'Selector Complexity': metrics.selectorComplexity,
    'Animations': metrics.animationCount,
    'Transitions': metrics.transitionCount,
    'Estimated Render Time': `${metrics.estimatedRenderTime.toFixed(2)}ms`
  });

  if (suggestions.length > 0) {
    console.group('💡 Optimization Suggestions');
    suggestions.forEach(suggestion => {
      const icon = suggestion.type === 'error' ? '❌' : suggestion.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`${icon} [${suggestion.impact.toUpperCase()}] ${suggestion.message}`);
      console.log(`   💡 ${suggestion.suggestion}`);
    });
    console.groupEnd();
  } else {
    console.log('✅ No performance issues detected');
  }

  console.groupEnd();
}