export interface BenchmarkResult {
  name: string;
  duration: number;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  standardDeviation: number;
}

export interface ColorSystemBenchmark {
  cssCustomProperties: BenchmarkResult;
  themeTransitions: BenchmarkResult;
  colorAnimations: BenchmarkResult;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    leakDetected: boolean;
  };
}

export class PerformanceBenchmark {
  private results: number[] = [];

  async run(
    testFunction: () => Promise<void> | void,
    iterations: number = 100,
    warmupIterations: number = 10
  ): Promise<BenchmarkResult> {
    // Warmup runs
    for (let i = 0; i < warmupIterations; i++) {
      await testFunction();
    }

    // Clear previous results
    this.results = [];

    // Actual benchmark runs
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await testFunction();
      const endTime = performance.now();
      this.results.push(endTime - startTime);
    }

    return this.calculateStatistics(iterations);
  }

  private calculateStatistics(iterations: number): BenchmarkResult {
    const totalTime = this.results.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...this.results);
    const maxTime = Math.max(...this.results);
    
    // Calculate standard deviation
    const variance = this.results.reduce((sum, time) => {
      return sum + Math.pow(time - averageTime, 2);
    }, 0) / iterations;
    const standardDeviation = Math.sqrt(variance);

    return {
      name: 'Benchmark',
      duration: totalTime,
      iterations,
      averageTime,
      minTime,
      maxTime,
      standardDeviation
    };
  }
}

export class ColorSystemBenchmarkSuite {
  private benchmark = new PerformanceBenchmark();
  private testContainer: HTMLElement | null = null;

  async runFullSuite(): Promise<ColorSystemBenchmark> {
    const initialMemory = this.getMemoryUsage();
    let peakMemory = initialMemory;

    // CSS Custom Properties benchmark
    const cssCustomProperties = await this.benchmarkCSSCustomProperties();
    peakMemory = Math.max(peakMemory, this.getMemoryUsage());

    // Theme transitions benchmark
    const themeTransitions = await this.benchmarkThemeTransitions();
    peakMemory = Math.max(peakMemory, this.getMemoryUsage());

    // Color animations benchmark
    const colorAnimations = await this.benchmarkColorAnimations();
    peakMemory = Math.max(peakMemory, this.getMemoryUsage());

    const finalMemory = this.getMemoryUsage();
    const leakDetected = finalMemory > initialMemory * 1.1; // 10% increase threshold

    return {
      cssCustomProperties,
      themeTransitions,
      colorAnimations,
      memoryUsage: {
        initial: initialMemory,
        peak: peakMemory,
        final: finalMemory,
        leakDetected
      }
    };
  }

  private async benchmarkCSSCustomProperties(): Promise<BenchmarkResult> {
    return await this.benchmark.run(async () => {
      this.createTestContainer();
      
      // Create elements with CSS custom properties
      for (let i = 0; i < 20; i++) {
        const element = document.createElement('div');
        element.style.cssText = `
          background-color: var(--primary-${500 + (i % 5) * 100});
          color: var(--primary-100);
          border: 1px solid var(--primary-700);
          padding: 8px;
          margin: 2px;
        `;
        this.testContainer!.appendChild(element);
      }
      
      // Force style calculation
      this.testContainer!.offsetHeight;
      
      this.cleanupTestContainer();
    }, 50, 5);
  }

  private async benchmarkThemeTransitions(): Promise<BenchmarkResult> {
    this.createTestContainer();
    
    // Create elements that will be affected by theme change
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.className = 'theme-test-element';
      element.style.cssText = `
        background-color: var(--primary-800);
        color: var(--primary-100);
        transition: all 0.2s ease;
        padding: 16px;
        margin: 4px;
      `;
      this.testContainer!.appendChild(element);
    }

    const result = await this.benchmark.run(() => {
      // Toggle theme
      document.documentElement.classList.toggle('dark');
      
      // Force style recalculation
      this.testContainer!.offsetHeight;
    }, 30, 3);

    this.cleanupTestContainer();
    return result;
  }

  private async benchmarkColorAnimations(): Promise<BenchmarkResult> {
    this.createTestContainer();
    
    const animatedElement = document.createElement('div');
    animatedElement.style.cssText = `
      width: 100px;
      height: 100px;
      background-color: var(--primary-500);
      transition: background-color 0.1s ease;
    `;
    this.testContainer!.appendChild(animatedElement);

    const result = await this.benchmark.run(async () => {
      // Trigger color change
      animatedElement.style.backgroundColor = 'var(--accent-orange)';
      
      // Wait for animation frame
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Reset color
      animatedElement.style.backgroundColor = 'var(--primary-500)';
      
      // Wait for animation frame
      await new Promise(resolve => requestAnimationFrame(resolve));
    }, 20, 2);

    this.cleanupTestContainer();
    return result;
  }

  private createTestContainer(): void {
    this.testContainer = document.createElement('div');
    this.testContainer.id = 'benchmark-container';
    this.testContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 500px;
      height: 400px;
      visibility: hidden;
    `;
    document.body.appendChild(this.testContainer);
  }

  private cleanupTestContainer(): void {
    if (this.testContainer && this.testContainer.parentNode) {
      this.testContainer.parentNode.removeChild(this.testContainer);
      this.testContainer = null;
    }
  }

  private getMemoryUsage(): number {
    if (typeof (performance as any).memory !== 'undefined') {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
}

export function formatBenchmarkResults(results: ColorSystemBenchmark): string {
  const formatTime = (ms: number) => `${ms.toFixed(2)}ms`;
  const formatMemory = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

  return `
Color System Performance Benchmark Results
==========================================

CSS Custom Properties:
  Average Time: ${formatTime(results.cssCustomProperties.averageTime)}
  Min Time: ${formatTime(results.cssCustomProperties.minTime)}
  Max Time: ${formatTime(results.cssCustomProperties.maxTime)}
  Standard Deviation: ${formatTime(results.cssCustomProperties.standardDeviation)}
  Total Iterations: ${results.cssCustomProperties.iterations}

Theme Transitions:
  Average Time: ${formatTime(results.themeTransitions.averageTime)}
  Min Time: ${formatTime(results.themeTransitions.minTime)}
  Max Time: ${formatTime(results.themeTransitions.maxTime)}
  Standard Deviation: ${formatTime(results.themeTransitions.standardDeviation)}
  Total Iterations: ${results.themeTransitions.iterations}

Color Animations:
  Average Time: ${formatTime(results.colorAnimations.averageTime)}
  Min Time: ${formatTime(results.colorAnimations.minTime)}
  Max Time: ${formatTime(results.colorAnimations.maxTime)}
  Standard Deviation: ${formatTime(results.colorAnimations.standardDeviation)}
  Total Iterations: ${results.colorAnimations.iterations}

Memory Usage:
  Initial: ${formatMemory(results.memoryUsage.initial)}
  Peak: ${formatMemory(results.memoryUsage.peak)}
  Final: ${formatMemory(results.memoryUsage.final)}
  Memory Leak Detected: ${results.memoryUsage.leakDetected ? 'Yes' : 'No'}

Performance Assessment:
  CSS Custom Properties: ${results.cssCustomProperties.averageTime < 5 ? 'Excellent' : results.cssCustomProperties.averageTime < 10 ? 'Good' : 'Needs Optimization'}
  Theme Transitions: ${results.themeTransitions.averageTime < 10 ? 'Excellent' : results.themeTransitions.averageTime < 20 ? 'Good' : 'Needs Optimization'}
  Color Animations: ${results.colorAnimations.averageTime < 20 ? 'Excellent' : results.colorAnimations.averageTime < 50 ? 'Good' : 'Needs Optimization'}
  Memory Management: ${!results.memoryUsage.leakDetected ? 'Excellent' : 'Memory Leak Detected'}
`;
}

export async function runColorSystemBenchmark(): Promise<void> {
  console.log('Starting Color System Performance Benchmark...');
  
  const suite = new ColorSystemBenchmarkSuite();
  const results = await suite.runFullSuite();
  
  console.log(formatBenchmarkResults(results));
  
  // Performance assertions for CI/CD
  if (results.cssCustomProperties.averageTime > 20) {
    console.warn('⚠️  CSS Custom Properties performance is below expected threshold');
  }
  
  if (results.themeTransitions.averageTime > 30) {
    console.warn('⚠️  Theme transition performance is below expected threshold');
  }
  
  if (results.colorAnimations.averageTime > 100) {
    console.warn('⚠️  Color animation performance is below expected threshold');
  }
  
  if (results.memoryUsage.leakDetected) {
    console.error('❌ Memory leak detected in color system');
  }
  
  console.log('✅ Color System Performance Benchmark completed');
}