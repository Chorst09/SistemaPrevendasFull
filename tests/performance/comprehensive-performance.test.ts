import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ColorSystemBenchmarkSuite, formatBenchmarkResults, type ColorSystemBenchmark } from './benchmark-utils';

describe('Comprehensive Color System Performance Tests', () => {
  let benchmarkSuite: ColorSystemBenchmarkSuite;
  let benchmarkResults: ColorSystemBenchmark;

  beforeAll(async () => {
    benchmarkSuite = new ColorSystemBenchmarkSuite();
    
    // Inject CSS custom properties for testing
    const style = document.createElement('style');
    style.id = 'performance-test-styles';
    style.textContent = `
      :root {
        --primary-900: #1a2332;
        --primary-800: #2a3441;
        --primary-700: #3a4550;
        --primary-600: #4a5660;
        --primary-500: #5a6770;
        --primary-400: #6a7780;
        --primary-300: #7a8790;
        --primary-200: #8a97a0;
        --primary-100: #9aa7b0;
        --primary-50: #aab7c0;
        
        --accent-orange: #FF6B35;
        --accent-cyan: #00D4FF;
        --accent-teal: #00B4A6;
      }
      
      .dark {
        --primary-900: #0f1419;
        --primary-800: #1f2429;
        --primary-700: #2f3439;
        --primary-600: #3f4449;
        --primary-500: #4f5459;
      }
      
      .high-contrast {
        --primary-900: #000000;
        --primary-800: #111111;
        --primary-700: #222222;
        --primary-600: #333333;
        --primary-500: #444444;
      }
    `;
    document.head.appendChild(style);
    
    // Run the full benchmark suite
    benchmarkResults = await benchmarkSuite.runFullSuite();
  });

  afterAll(() => {
    // Cleanup test styles
    const style = document.getElementById('performance-test-styles');
    if (style) {
      document.head.removeChild(style);
    }
  });

  it('should have acceptable CSS Custom Properties performance', () => {
    const { cssCustomProperties } = benchmarkResults;
    
    // CSS Custom Properties should render quickly
    expect(cssCustomProperties.averageTime).toBeLessThan(100); // Less than 100ms average
    expect(cssCustomProperties.maxTime).toBeLessThan(200); // Max time should be reasonable
    expect(cssCustomProperties.standardDeviation).toBeLessThan(50); // Consistent performance
    
    console.log('CSS Custom Properties Performance:', {
      average: `${cssCustomProperties.averageTime.toFixed(2)}ms`,
      min: `${cssCustomProperties.minTime.toFixed(2)}ms`,
      max: `${cssCustomProperties.maxTime.toFixed(2)}ms`,
      stdDev: `${cssCustomProperties.standardDeviation.toFixed(2)}ms`
    });
  });

  it('should have smooth theme transition performance', () => {
    const { themeTransitions } = benchmarkResults;
    
    // Theme transitions should be smooth and fast
    expect(themeTransitions.averageTime).toBeLessThan(30); // Less than 30ms average
    expect(themeTransitions.maxTime).toBeLessThan(100); // Max time should be acceptable
    
    console.log('Theme Transition Performance:', {
      average: `${themeTransitions.averageTime.toFixed(2)}ms`,
      min: `${themeTransitions.minTime.toFixed(2)}ms`,
      max: `${themeTransitions.maxTime.toFixed(2)}ms`,
      stdDev: `${themeTransitions.standardDeviation.toFixed(2)}ms`
    });
  });

  it('should have efficient color animation performance', () => {
    const { colorAnimations } = benchmarkResults;
    
    // Color animations should be performant
    expect(colorAnimations.averageTime).toBeLessThan(50); // Less than 50ms average
    expect(colorAnimations.standardDeviation).toBeLessThan(20); // Consistent animation timing
    
    console.log('Color Animation Performance:', {
      average: `${colorAnimations.averageTime.toFixed(2)}ms`,
      min: `${colorAnimations.minTime.toFixed(2)}ms`,
      max: `${colorAnimations.maxTime.toFixed(2)}ms`,
      stdDev: `${colorAnimations.standardDeviation.toFixed(2)}ms`
    });
  });

  it('should not have memory leaks', () => {
    const { memoryUsage } = benchmarkResults;
    
    // Should not detect memory leaks
    expect(memoryUsage.leakDetected).toBe(false);
    
    if (memoryUsage.initial > 0) {
      const memoryIncrease = memoryUsage.final - memoryUsage.initial;
      const memoryIncreasePercent = (memoryIncrease / memoryUsage.initial) * 100;
      
      // Memory increase should be minimal (less than 10%)
      expect(memoryIncreasePercent).toBeLessThan(10);
      
      console.log('Memory Usage Analysis:', {
        initial: `${(memoryUsage.initial / 1024 / 1024).toFixed(2)}MB`,
        peak: `${(memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`,
        final: `${(memoryUsage.final / 1024 / 1024).toFixed(2)}MB`,
        increase: `${memoryIncreasePercent.toFixed(2)}%`
      });
    }
  });

  it('should meet overall performance benchmarks', () => {
    // Overall performance should meet quality standards
    const performanceScore = calculatePerformanceScore(benchmarkResults);
    
    expect(performanceScore).toBeGreaterThan(70); // Minimum acceptable score
    
    console.log('Overall Performance Score:', `${performanceScore}/100`);
    console.log('\n' + formatBenchmarkResults(benchmarkResults));
  });

  it('should optimize CSS loading and parsing', async () => {
    const startTime = performance.now();
    
    // Create a large CSS block with custom properties
    const style = document.createElement('style');
    style.textContent = generateLargeCSSWithCustomProperties(100);
    
    document.head.appendChild(style);
    
    // Force style recalculation
    document.body.offsetHeight;
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // CSS loading should be efficient even with many custom properties
    expect(loadTime).toBeLessThan(50); // Should load in less than 50ms
    
    // Cleanup
    document.head.removeChild(style);
    
    console.log('Large CSS Loading Performance:', `${loadTime.toFixed(2)}ms`);
  });

  it('should handle rapid theme changes efficiently', async () => {
    const iterations = 20;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Rapid theme change
      document.documentElement.classList.toggle('dark');
      document.documentElement.classList.toggle('high-contrast');
      
      // Force style recalculation
      document.body.offsetHeight;
      
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / iterations;
    const maxTime = Math.max(...times);
    
    // Rapid theme changes should remain performant
    expect(averageTime).toBeLessThan(20); // Average should be fast
    expect(maxTime).toBeLessThan(50); // Even worst case should be acceptable
    
    console.log('Rapid Theme Changes Performance:', {
      average: `${averageTime.toFixed(2)}ms`,
      max: `${maxTime.toFixed(2)}ms`,
      iterations
    });
    
    // Reset theme
    document.documentElement.classList.remove('dark', 'high-contrast');
  });
});

function calculatePerformanceScore(results: ColorSystemBenchmark): number {
  let score = 100;
  
  // CSS Custom Properties score (30% weight)
  if (results.cssCustomProperties.averageTime > 20) score -= 15;
  else if (results.cssCustomProperties.averageTime > 10) score -= 5;
  
  // Theme transitions score (25% weight)
  if (results.themeTransitions.averageTime > 30) score -= 12;
  else if (results.themeTransitions.averageTime > 15) score -= 4;
  
  // Color animations score (25% weight)
  if (results.colorAnimations.averageTime > 50) score -= 12;
  else if (results.colorAnimations.averageTime > 25) score -= 4;
  
  // Memory management score (20% weight)
  if (results.memoryUsage.leakDetected) score -= 20;
  
  return Math.max(0, score);
}

function generateLargeCSSWithCustomProperties(count: number): string {
  let css = ':root {\n';
  
  // Generate many custom properties
  for (let i = 0; i < count; i++) {
    css += `  --test-color-${i}: hsl(${i * 3.6}, 70%, 50%);\n`;
  }
  
  css += '}\n\n';
  
  // Generate classes that use these properties
  for (let i = 0; i < count; i++) {
    css += `.test-class-${i} {\n`;
    css += `  background-color: var(--test-color-${i});\n`;
    css += `  border-color: var(--test-color-${(i + 1) % count});\n`;
    css += '}\n\n';
  }
  
  return css;
}