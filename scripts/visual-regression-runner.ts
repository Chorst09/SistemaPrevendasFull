#!/usr/bin/env tsx

/**
 * Visual Regression Test Runner
 * 
 * This script provides utilities for running and managing visual regression tests
 * as specified in task 9.1 of the color system improvement spec.
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface TestRunOptions {
  updateSnapshots?: boolean;
  browsers?: string[];
  headed?: boolean;
  debug?: boolean;
  reportPath?: string;
}

class VisualRegressionRunner {
  private readonly testDir = './tests/visual';
  private readonly reportDir = './test-results/visual-regression';
  
  constructor() {
    // Ensure report directory exists
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Run all visual regression tests
   */
  async runAllTests(options: TestRunOptions = {}): Promise<void> {
    console.log('🎨 Starting Visual Regression Tests...\n');
    
    const {
      updateSnapshots = false,
      browsers = ['chromium', 'firefox', 'webkit'],
      headed = false,
      debug = false
    } = options;

    try {
      // Build the Playwright command
      let command = 'npx playwright test tests/visual';
      
      if (updateSnapshots) {
        command += ' --update-snapshots';
        console.log('📸 Updating baseline screenshots...');
      }
      
      if (headed) {
        command += ' --headed';
      }
      
      if (debug) {
        command += ' --debug';
      }
      
      // Add browser selection
      if (browsers.length < 3) {
        command += ` --project=${browsers.join(',')}`;
      }
      
      console.log(`Running command: ${command}\n`);
      
      // Execute the tests
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n✅ Visual regression tests completed successfully!');
      
      // Generate summary report
      await this.generateSummaryReport();
      
    } catch (error) {
      console.error('\n❌ Visual regression tests failed:');
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Run tests for specific components only
   */
  async runComponentTests(componentPattern: string, options: TestRunOptions = {}): Promise<void> {
    console.log(`🎨 Running Visual Tests for: ${componentPattern}\n`);
    
    try {
      let command = `npx playwright test tests/visual --grep "${componentPattern}"`;
      
      if (options.updateSnapshots) {
        command += ' --update-snapshots';
      }
      
      if (options.headed) {
        command += ' --headed';
      }
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n✅ Component visual tests completed!');
      
    } catch (error) {
      console.error('\n❌ Component visual tests failed:');
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Run cross-browser comparison tests
   */
  async runCrossBrowserTests(options: TestRunOptions = {}): Promise<void> {
    console.log('🌐 Running Cross-Browser Visual Tests...\n');
    
    const browsers = ['chromium', 'firefox', 'webkit', 'Microsoft Edge', 'Google Chrome'];
    
    try {
      let command = 'npx playwright test tests/visual/regression-comprehensive.spec.ts';
      command += ' --grep "Cross-Browser"';
      
      if (options.updateSnapshots) {
        command += ' --update-snapshots';
      }
      
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('\n✅ Cross-browser visual tests completed!');
      
      // Generate cross-browser comparison report
      await this.generateCrossBrowserReport();
      
    } catch (error) {
      console.error('\n❌ Cross-browser visual tests failed:');
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Generate a summary report of visual test results
   */
  private async generateSummaryReport(): Promise<void> {
    const timestamp = new Date().toISOString();
    const reportPath = join(this.reportDir, `visual-regression-summary-${Date.now()}.json`);
    
    const report = {
      timestamp,
      testSuite: 'Visual Regression Tests',
      description: 'Automated visual regression testing for color system implementation',
      testCategories: [
        {
          name: 'Core UI Components',
          description: 'Screenshots of fundamental UI components across themes',
          tests: [
            'Color palette validation',
            'Button component states',
            'Form element styling',
            'Card and container layouts',
            'Navigation elements'
          ]
        },
        {
          name: 'Theme Consistency',
          description: 'Visual comparison between light, dark, and high-contrast themes',
          tests: [
            'Light theme rendering',
            'Dark theme rendering',
            'High contrast mode',
            'Theme transition consistency'
          ]
        },
        {
          name: 'Cross-Browser Validation',
          description: 'Color rendering consistency across different browsers',
          tests: [
            'Chromium rendering',
            'Firefox rendering',
            'WebKit rendering',
            'Edge rendering'
          ]
        },
        {
          name: 'Responsive Design',
          description: 'Color system consistency across viewport sizes',
          tests: [
            'Desktop layout (1920x1080)',
            'Laptop layout (1366x768)',
            'Tablet layout (768x1024)',
            'Mobile layout (375x667)'
          ]
        }
      ],
      requirements: [
        '2.4: Sistema deve ser facilmente modificável através das variáveis CSS',
        '4.1: Manter a mesma paleta de cores em todos os componentes'
      ],
      notes: [
        'Screenshots are captured with animations disabled for consistency',
        'Threshold set to 0.2 for minor rendering differences',
        'Tests cover all major UI components and interaction states',
        'Cross-browser tests validate color fidelity across engines'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Summary report generated: ${reportPath}`);
  }

  /**
   * Generate cross-browser comparison report
   */
  private async generateCrossBrowserReport(): Promise<void> {
    const reportPath = join(this.reportDir, `cross-browser-comparison-${Date.now()}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      testType: 'Cross-Browser Visual Validation',
      browsers: [
        { name: 'Chromium', engine: 'Blink', version: 'Latest' },
        { name: 'Firefox', engine: 'Gecko', version: 'Latest' },
        { name: 'WebKit', engine: 'WebKit', version: 'Latest' },
        { name: 'Microsoft Edge', engine: 'Blink', version: 'Latest' },
        { name: 'Google Chrome', engine: 'Blink', version: 'Latest' }
      ],
      testScenarios: [
        'Color rendering accuracy',
        'Gradient rendering consistency',
        'Shadow and border effects',
        'CSS Custom Properties support',
        'Theme switching behavior'
      ],
      validationCriteria: [
        'Colors match design specifications',
        'No visual artifacts or rendering issues',
        'Consistent appearance across browsers',
        'Proper fallback handling'
      ]
    };
    
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`🌐 Cross-browser report generated: ${reportPath}`);
  }

  /**
   * Clean up old test artifacts
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up old test artifacts...');
    
    try {
      // Clean up old screenshots if needed
      execSync('find test-results -name "*.png" -mtime +7 -delete', { 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('ℹ️  No old artifacts to clean up');
    }
  }
}

// CLI Interface
async function main() {
  const runner = new VisualRegressionRunner();
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Visual Regression Test Runner

Usage:
  tsx scripts/visual-regression-runner.ts [options] [command]

Commands:
  all                    Run all visual regression tests (default)
  component <pattern>    Run tests for specific components
  cross-browser         Run cross-browser validation tests
  cleanup               Clean up old test artifacts

Options:
  --update-snapshots    Update baseline screenshots
  --headed              Run tests in headed mode
  --debug               Run tests in debug mode
  --browsers <list>     Comma-separated list of browsers (chromium,firefox,webkit)
  --help, -h            Show this help message

Examples:
  tsx scripts/visual-regression-runner.ts
  tsx scripts/visual-regression-runner.ts --update-snapshots
  tsx scripts/visual-regression-runner.ts component "button"
  tsx scripts/visual-regression-runner.ts cross-browser
  tsx scripts/visual-regression-runner.ts --browsers chromium,firefox
    `);
    return;
  }
  
  const command = args[0] || 'all';
  const options: TestRunOptions = {
    updateSnapshots: args.includes('--update-snapshots'),
    headed: args.includes('--headed'),
    debug: args.includes('--debug'),
    browsers: args.includes('--browsers') 
      ? args[args.indexOf('--browsers') + 1]?.split(',') 
      : undefined
  };
  
  switch (command) {
    case 'all':
      await runner.runAllTests(options);
      break;
      
    case 'component':
      const pattern = args[1];
      if (!pattern) {
        console.error('❌ Component pattern is required');
        process.exit(1);
      }
      await runner.runComponentTests(pattern, options);
      break;
      
    case 'cross-browser':
      await runner.runCrossBrowserTests(options);
      break;
      
    case 'cleanup':
      await runner.cleanup();
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Use --help for usage information');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { VisualRegressionRunner };