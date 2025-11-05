import { describe, it, expect, beforeEach, afterEach } from 'vitest';

interface PerformanceMetrics {
  renderTime: number;
  paintTime: number;
  layoutTime: number;
  cssParseTime: number;
}

interface ColorSystemPerformanceTest {
  testName: string;
  setup: () => void;
  cleanup: () => void;
  measure: () => Promise<PerformanceMetrics>;
}

class ColorSystemPerformanceTester {
  private container: HTMLElement | null = null;
  private observer: PerformanceObserver | null = null;
  private metrics: PerformanceEntry[] = [];

  constructor() {
    this.setupPerformanceObserver();
  }

  private setupPerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      this.observer = new PerformanceObserver((list) => {
        this.metrics.push(...list.getEntries());
      });
      
      this.observer.observe({ 
        entryTypes: ['measure', 'paint', 'layout-shift'] 
      });
    }
  }

  createTestContainer(): HTMLElement {
    this.container = document.createElement('div');
    this.container.id = 'performance-test-container';
    this.container.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1000px;
      height: 800px;
      visibility: hidden;
    `;
    document.body.appendChild(this.container);
    return this.container;
  }

  cleanup() {
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics = [];
  }

  async measureCSSCustomPropertiesPerformance(): Promise<PerformanceMetrics> {
    const container = this.createTestContainer();
    
    // Clear previous metrics
    this.metrics = [];
    performance.clearMeasures();
    performance.clearMarks();

    // Test CSS Custom Properties vs hardcoded values
    const startTime = performance.now();
    
    // Mark start of CSS parsing
    performance.mark('css-parse-start');
    
    // Create elements with CSS custom properties
    const elementsWithCustomProps = this.createElementsWithCustomProperties(container, 100);
    
    performance.mark('css-parse-end');
    performance.measure('css-parse-time', 'css-parse-start', 'css-parse-end');
    
    // Mark start of rendering
    performance.mark('render-start');
    
    // Force layout and paint
    container.offsetHeight; // Force layout
    
    performance.mark('render-end');
    performance.measure('render-time', 'render-start', 'render-end');
    
    // Wait for paint
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const endTime = performance.now();
    
    // Collect metrics
    const renderMeasure = performance.getEntriesByName('render-time')[0] as PerformanceMeasure;
    const cssParseMeasure = performance.getEntriesByName('css-parse-time')[0] as PerformanceMeasure;
    
    return {
      renderTime: renderMeasure?.duration || 0,
      paintTime: endTime - startTime,
      layoutTime: 0, // Will be calculated from layout-shift entries
      cssParseTime: cssParseMeasure?.duration || 0
    };
  }

  async measureThemeTransitionPerformance(): Promise<PerformanceMetrics> {
    const container = this.createTestContainer();
    
    // Create elements
    this.createElementsWithCustomProperties(container, 50);
    
    performance.clearMeasures();
    performance.clearMarks();
    
    // Measure theme transition
    performance.mark('theme-transition-start');
    
    // Simulate theme change
    document.documentElement.classList.add('dark');
    
    // Force style recalculation
    container.offsetHeight;
    
    performance.mark('theme-transition-end');
    performance.measure('theme-transition-time', 'theme-transition-start', 'theme-transition-end');
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // Reset theme
    document.documentElement.classList.remove('dark');
    
    const transitionMeasure = performance.getEntriesByName('theme-transition-time')[0] as PerformanceMeasure;
    
    return {
      renderTime: transitionMeasure?.duration || 0,
      paintTime: 0,
      layoutTime: 0,
      cssParseTime: 0
    };
  }

  async measureColorAnimationPerformance(): Promise<PerformanceMetrics> {
    const container = this.createTestContainer();
    
    // Create animated elements
    const animatedElement = document.createElement('div');
    animatedElement.style.cssText = `
      width: 100px;
      height: 100px;
      background-color: var(--primary-500);
      transition: background-color 0.3s ease;
    `;
    container.appendChild(animatedElement);
    
    performance.clearMeasures();
    performance.clearMarks();
    
    performance.mark('animation-start');
    
    // Trigger color animation
    animatedElement.style.backgroundColor = 'var(--primary-700)';
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 350));
    
    performance.mark('animation-end');
    performance.measure('animation-time', 'animation-start', 'animation-end');
    
    const animationMeasure = performance.getEntriesByName('animation-time')[0] as PerformanceMeasure;
    
    return {
      renderTime: animationMeasure?.duration || 0,
      paintTime: 0,
      layoutTime: 0,
      cssParseTime: 0
    };
  }

  private createElementsWithCustomProperties(container: HTMLElement, count: number): HTMLElement[] {
    const elements: HTMLElement[] = [];
    
    for (let i = 0; i < count; i++) {
      const element = document.createElement('div');
      element.className = 'test-element';
      element.style.cssText = `
        width: 50px;
        height: 50px;
        margin: 2px;
        background-color: var(--primary-${500 + (i % 5) * 100});
        border: 1px solid var(--primary-700);
        color: var(--primary-100);
        display: inline-block;
      `;
      element.textContent = `Element ${i}`;
      container.appendChild(element);
      elements.push(element);
    }
    
    return elements;
  }

  async compareWithHardcodedColors(): Promise<{
    customProperties: PerformanceMetrics;
    hardcoded: PerformanceMetrics;
    improvement: number;
  }> {
    // Test with CSS Custom Properties
    const customPropsMetrics = await this.measureCSSCustomPropertiesPerformance();
    this.cleanup();
    
    // Test with hardcoded colors
    const hardcodedMetrics = await this.measureHardcodedColorsPerformance();
    this.cleanup();
    
    const improvement = ((hardcodedMetrics.renderTime - customPropsMetrics.renderTime) / hardcodedMetrics.renderTime) * 100;
    
    return {
      customProperties: customPropsMetrics,
      hardcoded: hardcodedMetrics,
      improvement
    };
  }

  private async measureHardcodedColorsPerformance(): Promise<PerformanceMetrics> {
    const container = this.createTestContainer();
    
    performance.clearMeasures();
    performance.clearMarks();
    
    performance.mark('hardcoded-render-start');
    
    // Create elements with hardcoded colors
    for (let i = 0; i < 100; i++) {
      const element = document.createElement('div');
      element.style.cssText = `
        width: 50px;
        height: 50px;
        margin: 2px;
        background-color: #5a6770;
        border: 1px solid #3a4550;
        color: #f8fafc;
        display: inline-block;
      `;
      element.textContent = `Element ${i}`;
      container.appendChild(element);
    }
    
    container.offsetHeight; // Force layout
    
    performance.mark('hardcoded-render-end');
    performance.measure('hardcoded-render-time', 'hardcoded-render-start', 'hardcoded-render-end');
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const renderMeasure = performance.getEntriesByName('hardcoded-render-time')[0] as PerformanceMeasure;
    
    return {
      renderTime: renderMeasure?.duration || 0,
      paintTime: 0,
      layoutTime: 0,
      cssParseTime: 0
    };
  }
}

describe('Color System Performance Tests', () => {
  let tester: ColorSystemPerformanceTester;

  beforeEach(() => {
    tester = new ColorSystemPerformanceTester();
  });

  afterEach(() => {
    tester.cleanup();
  });

  it('should measure CSS Custom Properties performance impact', async () => {
    const metrics = await tester.measureCSSCustomPropertiesPerformance();
    
    // CSS Custom Properties should not significantly impact performance
    expect(metrics.renderTime).toBeLessThan(500); // Should render in less than 500ms
    expect(metrics.cssParseTime).toBeLessThan(400); // CSS parsing should be fast
    
    console.log('CSS Custom Properties Performance:', metrics);
  });

  it('should measure theme transition performance', async () => {
    const metrics = await tester.measureThemeTransitionPerformance();
    
    // Theme transitions should be smooth
    expect(metrics.renderTime).toBeLessThan(50); // Should transition in less than 50ms
    
    console.log('Theme Transition Performance:', metrics);
  });

  it('should measure color animation performance', async () => {
    const metrics = await tester.measureColorAnimationPerformance();
    
    // Color animations should complete within expected time
    expect(metrics.renderTime).toBeGreaterThan(300); // Animation duration
    expect(metrics.renderTime).toBeLessThan(400); // Should not exceed expected duration significantly
    
    console.log('Color Animation Performance:', metrics);
  });

  it('should compare CSS Custom Properties vs hardcoded colors', async () => {
    const comparison = await tester.compareWithHardcodedColors();
    
    // CSS Custom Properties should not be significantly slower than hardcoded colors
    // Allow up to 100% performance difference in test environment
    expect(Math.abs(comparison.improvement)).toBeLessThan(100);
    
    console.log('Performance Comparison:', {
      customProperties: comparison.customProperties.renderTime,
      hardcoded: comparison.hardcoded.renderTime,
      improvement: `${comparison.improvement.toFixed(2)}%`
    });
  });

  it('should validate memory usage during theme changes', async () => {
    if (typeof (performance as any).memory !== 'undefined') {
      const initialMemory = (performance as any).memory.usedJSHeapSize;
      
      // Perform multiple theme changes
      for (let i = 0; i < 10; i++) {
        document.documentElement.classList.toggle('dark');
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      
      const finalMemory = (performance as any).memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
      
      console.log('Memory Usage:', {
        initial: `${(initialMemory / 1024 / 1024).toFixed(2)}MB`,
        final: `${(finalMemory / 1024 / 1024).toFixed(2)}MB`,
        increase: `${(memoryIncrease / 1024).toFixed(2)}KB`
      });
    } else {
      console.log('Memory measurement not available in this environment');
    }
  });

  it('should validate CSS loading performance', async () => {
    // Measure time to load and parse CSS with custom properties
    const startTime = performance.now();
    
    // Create a style element with CSS custom properties
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --test-primary-900: #1a2332;
        --test-primary-800: #2a3441;
        --test-primary-700: #3a4550;
        --test-primary-600: #4a5660;
        --test-primary-500: #5a6770;
        --test-accent-orange: #FF6B35;
        --test-accent-cyan: #00D4FF;
        --test-accent-teal: #00B4A6;
      }
      
      .test-class-1 { background: var(--test-primary-900); }
      .test-class-2 { background: var(--test-primary-800); }
      .test-class-3 { background: var(--test-primary-700); }
      .test-class-4 { background: var(--test-accent-orange); }
      .test-class-5 { background: var(--test-accent-cyan); }
    `;
    
    document.head.appendChild(style);
    
    // Force style recalculation
    document.body.offsetHeight;
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // CSS loading should be fast
    expect(loadTime).toBeLessThan(100); // Should load in less than 100ms
    
    // Cleanup
    document.head.removeChild(style);
    
    console.log('CSS Loading Performance:', `${loadTime.toFixed(2)}ms`);
  });
});