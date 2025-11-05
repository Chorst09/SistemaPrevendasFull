#!/usr/bin/env tsx

import { ColorSystemBenchmarkSuite, formatBenchmarkResults } from '../tests/performance/benchmark-utils';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PerformanceReport {
  timestamp: string;
  environment: {
    userAgent: string;
    platform: string;
    memory: number;
  };
  results: any;
  recommendations: string[];
}

async function runPerformanceBenchmark() {
  console.log('🚀 Starting Color System Performance Benchmark...\n');

  // Setup environment
  const suite = new ColorSystemBenchmarkSuite();
  
  // Inject test CSS
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --primary-900: #1a2332;
      --primary-800: #2a3441;
      --primary-700: #3a4550;
      --primary-600: #4a5660;
      --primary-500: #5a6770;
      --accent-orange: #FF6B35;
      --accent-cyan: #00D4FF;
      --accent-teal: #00B4A6;
    }
    
    .dark {
      --primary-900: #0f1419;
      --primary-800: #1f2429;
      --primary-700: #2f3439;
    }
  `;
  document.head.appendChild(style);

  try {
    // Run benchmark suite
    const results = await suite.runFullSuite();
    
    // Generate recommendations
    const recommendations = generateRecommendations(results);
    
    // Create performance report
    const report: PerformanceReport = {
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js Environment',
        platform: typeof navigator !== 'undefined' ? navigator.platform : process.platform,
        memory: typeof (performance as any).memory !== 'undefined' 
          ? (performance as any).memory.usedJSHeapSize 
          : 0
      },
      results,
      recommendations
    };

    // Output results to console
    console.log(formatBenchmarkResults(results));
    console.log('\n📊 Performance Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });

    // Save report to file
    savePerformanceReport(report);
    
    // Check if performance meets standards
    const performanceScore = calculateOverallScore(results);
    console.log(`\n🎯 Overall Performance Score: ${performanceScore}/100`);
    
    if (performanceScore >= 80) {
      console.log('✅ Excellent performance! Color system is well optimized.');
    } else if (performanceScore >= 60) {
      console.log('⚠️  Good performance, but there\'s room for improvement.');
    } else {
      console.log('❌ Performance needs optimization. Please review recommendations.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    document.head.removeChild(style);
  }
}

function generateRecommendations(results: any): string[] {
  const recommendations: string[] = [];

  // CSS Custom Properties recommendations
  if (results.cssCustomProperties.averageTime > 15) {
    recommendations.push(
      'Consider reducing the number of CSS custom properties or optimizing their usage patterns'
    );
  }

  if (results.cssCustomProperties.standardDeviation > 8) {
    recommendations.push(
      'CSS custom properties performance is inconsistent. Review complex selectors or nested properties'
    );
  }

  // Theme transition recommendations
  if (results.themeTransitions.averageTime > 25) {
    recommendations.push(
      'Theme transitions are slower than optimal. Consider using CSS transforms instead of property changes'
    );
  }

  // Color animation recommendations
  if (results.colorAnimations.averageTime > 40) {
    recommendations.push(
      'Color animations could be optimized. Consider using CSS transforms or will-change property'
    );
  }

  // Memory recommendations
  if (results.memoryUsage.leakDetected) {
    recommendations.push(
      'Memory leak detected. Review event listeners and DOM element cleanup in theme switching'
    );
  }

  const memoryIncrease = results.memoryUsage.final - results.memoryUsage.initial;
  if (memoryIncrease > 1024 * 1024) { // 1MB
    recommendations.push(
      'High memory usage detected. Consider lazy loading of theme assets or cleanup of unused styles'
    );
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Performance is excellent! Consider documenting current optimization strategies');
  } else {
    recommendations.push('Run performance tests regularly to catch regressions early');
    recommendations.push('Consider implementing performance budgets in CI/CD pipeline');
  }

  return recommendations;
}

function calculateOverallScore(results: any): number {
  let score = 100;

  // CSS Custom Properties (30% weight)
  const cssScore = Math.max(0, 100 - (results.cssCustomProperties.averageTime * 2));
  score = score * 0.7 + cssScore * 0.3;

  // Theme Transitions (25% weight)
  const themeScore = Math.max(0, 100 - (results.themeTransitions.averageTime * 1.5));
  score = score * 0.75 + themeScore * 0.25;

  // Color Animations (25% weight)
  const animationScore = Math.max(0, 100 - (results.colorAnimations.averageTime * 1));
  score = score * 0.75 + animationScore * 0.25;

  // Memory Management (20% weight)
  const memoryScore = results.memoryUsage.leakDetected ? 0 : 100;
  score = score * 0.8 + memoryScore * 0.2;

  return Math.round(score);
}

function savePerformanceReport(report: PerformanceReport): void {
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = join(process.cwd(), 'reports', 'performance');
    mkdirSync(reportsDir, { recursive: true });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `color-system-performance-${timestamp}.json`;
    const filepath = join(reportsDir, filename);

    // Save detailed JSON report
    writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    // Save human-readable summary
    const summaryFilename = `color-system-performance-${timestamp}.txt`;
    const summaryFilepath = join(reportsDir, summaryFilename);
    const summary = generateTextSummary(report);
    writeFileSync(summaryFilepath, summary);

    console.log(`\n📄 Performance report saved to: ${filepath}`);
    console.log(`📄 Summary report saved to: ${summaryFilepath}`);

  } catch (error) {
    console.warn('⚠️  Could not save performance report:', error);
  }
}

function generateTextSummary(report: PerformanceReport): string {
  const { results, recommendations } = report;
  
  return `
Color System Performance Report
==============================
Generated: ${report.timestamp}
Environment: ${report.environment.userAgent}
Platform: ${report.environment.platform}

Performance Metrics:
-------------------
CSS Custom Properties:
  - Average Time: ${results.cssCustomProperties.averageTime.toFixed(2)}ms
  - Min/Max: ${results.cssCustomProperties.minTime.toFixed(2)}ms / ${results.cssCustomProperties.maxTime.toFixed(2)}ms
  - Standard Deviation: ${results.cssCustomProperties.standardDeviation.toFixed(2)}ms

Theme Transitions:
  - Average Time: ${results.themeTransitions.averageTime.toFixed(2)}ms
  - Min/Max: ${results.themeTransitions.minTime.toFixed(2)}ms / ${results.themeTransitions.maxTime.toFixed(2)}ms
  - Standard Deviation: ${results.themeTransitions.standardDeviation.toFixed(2)}ms

Color Animations:
  - Average Time: ${results.colorAnimations.averageTime.toFixed(2)}ms
  - Min/Max: ${results.colorAnimations.minTime.toFixed(2)}ms / ${results.colorAnimations.maxTime.toFixed(2)}ms
  - Standard Deviation: ${results.colorAnimations.standardDeviation.toFixed(2)}ms

Memory Usage:
  - Initial: ${(results.memoryUsage.initial / 1024 / 1024).toFixed(2)}MB
  - Peak: ${(results.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB
  - Final: ${(results.memoryUsage.final / 1024 / 1024).toFixed(2)}MB
  - Memory Leak: ${results.memoryUsage.leakDetected ? 'Detected' : 'None'}

Recommendations:
---------------
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Overall Score: ${calculateOverallScore(results)}/100
`;
}

// Run benchmark if this script is executed directly
if (typeof window !== 'undefined') {
  runPerformanceBenchmark().catch(console.error);
} else {
  console.log('Performance benchmark script loaded. Run in browser environment.');
}

export { runPerformanceBenchmark };