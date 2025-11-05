import { Page, expect } from '@playwright/test';

export interface ThemeConfig {
  name: string;
  classes: string[];
}

export interface VisualTestOptions {
  fullPage?: boolean;
  animations?: 'disabled' | 'allow';
  threshold?: number;
  maxDiffPixels?: number;
}

export class VisualTestHelper {
  constructor(private page: Page) {}

  /**
   * Apply a theme to the page
   */
  async applyTheme(theme: ThemeConfig): Promise<void> {
    await this.page.evaluate((themeClasses) => {
      document.documentElement.className = '';
      themeClasses.forEach(cls => document.documentElement.classList.add(cls));
    }, theme.classes);
    
    // Wait for theme to apply
    await this.page.waitForTimeout(300);
  }

  /**
   * Take screenshots of an element across multiple themes
   */
  async compareAcrossThemes(
    selector: string,
    themes: ThemeConfig[],
    baseScreenshotName: string,
    options: VisualTestOptions = {}
  ): Promise<void> {
    const element = this.page.locator(selector);
    
    for (const theme of themes) {
      await this.applyTheme(theme);
      
      const screenshotName = `${baseScreenshotName}-${theme.name}.png`;
      
      await expect(element).toHaveScreenshot(screenshotName, {
        animations: options.animations || 'disabled',
        threshold: options.threshold || 0.2,
        maxDiffPixels: options.maxDiffPixels || 100
      });
    }
  }

  /**
   * Take full page screenshots across multiple themes
   */
  async comparePageAcrossThemes(
    themes: ThemeConfig[],
    baseScreenshotName: string,
    options: VisualTestOptions = {}
  ): Promise<void> {
    for (const theme of themes) {
      await this.applyTheme(theme);
      
      const screenshotName = `${baseScreenshotName}-${theme.name}.png`;
      
      await expect(this.page).toHaveScreenshot(screenshotName, {
        fullPage: options.fullPage !== false,
        animations: options.animations || 'disabled',
        threshold: options.threshold || 0.2,
        maxDiffPixels: options.maxDiffPixels || 100
      });
    }
  }

  /**
   * Test interactive states (hover, focus, etc.)
   */
  async testInteractiveStates(
    selector: string,
    states: Array<{
      name: string;
      action: (element: any) => Promise<void>;
    }>,
    theme: ThemeConfig,
    baseScreenshotName: string
  ): Promise<void> {
    await this.applyTheme(theme);
    
    const element = this.page.locator(selector);
    
    for (const state of states) {
      await state.action(element);
      
      const screenshotName = `${baseScreenshotName}-${state.name}-${theme.name}.png`;
      
      await expect(element).toHaveScreenshot(screenshotName, {
        animations: 'disabled'
      });
    }
  }

  /**
   * Test responsive behavior across viewports
   */
  async testResponsiveDesign(
    viewports: Array<{ width: number; height: number; name: string }>,
    themes: ThemeConfig[],
    baseScreenshotName: string
  ): Promise<void> {
    for (const viewport of viewports) {
      await this.page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await this.page.waitForTimeout(500);
      
      for (const theme of themes) {
        await this.applyTheme(theme);
        
        const screenshotName = `${baseScreenshotName}-${viewport.name}-${theme.name}.png`;
        
        await expect(this.page).toHaveScreenshot(screenshotName, {
          fullPage: true,
          animations: 'disabled'
        });
      }
    }
  }

  /**
   * Inject test components for isolated testing
   */
  async injectTestComponents(html: string, containerId: string = 'test-container'): Promise<void> {
    await this.page.evaluate(({ html, containerId }) => {
      // Remove existing test container
      const existing = document.getElementById(containerId);
      if (existing) {
        existing.remove();
      }

      // Create new test container
      const testContainer = document.createElement('div');
      testContainer.id = containerId;
      testContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--background);
        z-index: 9999;
        padding: 20px;
        overflow: auto;
      `;
      
      testContainer.innerHTML = html;
      document.body.appendChild(testContainer);
    }, { html, containerId });

    await this.page.waitForTimeout(300);
  }

  /**
   * Clean up test components
   */
  async cleanupTestComponents(containerId: string = 'test-container'): Promise<void> {
    await this.page.evaluate((containerId) => {
      const container = document.getElementById(containerId);
      if (container) {
        container.remove();
      }
    }, containerId);
  }
}

// Predefined theme configurations
export const THEMES: ThemeConfig[] = [
  { name: 'light', classes: [] },
  { name: 'dark', classes: ['dark'] },
  { name: 'high-contrast', classes: ['dark', 'high-contrast'] }
];

// Predefined viewport configurations
export const VIEWPORTS = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 1366, height: 768, name: 'laptop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' }
];

// Common interactive states
export const INTERACTIVE_STATES = [
  {
    name: 'normal',
    action: async (element: any) => {
      await element.blur();
    }
  },
  {
    name: 'hover',
    action: async (element: any) => {
      await element.hover();
    }
  },
  {
    name: 'focus',
    action: async (element: any) => {
      await element.focus();
    }
  }
];
/**

 * Enhanced visual testing utilities for comprehensive regression testing
 */
export class AdvancedVisualTester extends VisualTestHelper {
  /**
   * Batch screenshot capture for multiple elements
   */
  async captureComponentScreenshots(
    selectors: string[],
    themes: ThemeConfig[],
    baseScreenshotName: string
  ): Promise<void> {
    for (const theme of themes) {
      await this.applyTheme(theme);
      
      for (let i = 0; i < selectors.length; i++) {
        const element = this.page.locator(selectors[i]);
        const screenshotName = `${baseScreenshotName}-component-${i + 1}-${theme.name}.png`;
        
        if (await element.count() > 0) {
          await expect(element).toHaveScreenshot(screenshotName, {
            animations: 'disabled',
            threshold: 0.2
          });
        }
      }
    }
  }

  /**
   * Test color contrast validation through screenshots
   */
  async validateColorContrast(
    testElements: Array<{ selector: string; description: string }>,
    themes: ThemeConfig[]
  ): Promise<void> {
    for (const theme of themes) {
      await this.applyTheme(theme);
      
      for (const testElement of testElements) {
        const element = this.page.locator(testElement.selector);
        
        if (await element.count() > 0) {
          const screenshotName = `contrast-validation-${testElement.description}-${theme.name}.png`;
          
          await expect(element).toHaveScreenshot(screenshotName, {
            animations: 'disabled',
            threshold: 0.1 // Stricter threshold for contrast validation
          });
        }
      }
    }
  }

  /**
   * Test print-specific color rendering
   */
  async testPrintColors(selector: string, baseScreenshotName: string): Promise<void> {
    // Apply print media query
    await this.page.emulateMedia({ media: 'print' });
    
    const element = this.page.locator(selector);
    
    await expect(element).toHaveScreenshot(`${baseScreenshotName}-print.png`, {
      animations: 'disabled'
    });
    
    // Reset to screen media
    await this.page.emulateMedia({ media: 'screen' });
  }

  /**
   * Generate visual diff report between themes
   */
  async generateThemeComparisonReport(
    selector: string,
    themes: ThemeConfig[],
    reportName: string
  ): Promise<void> {
    const screenshots: { [key: string]: string } = {};
    
    for (const theme of themes) {
      await this.applyTheme(theme);
      const screenshotName = `${reportName}-${theme.name}.png`;
      
      const element = this.page.locator(selector);
      await expect(element).toHaveScreenshot(screenshotName, {
        animations: 'disabled'
      });
      
      screenshots[theme.name] = screenshotName;
    }
    
    // Log comparison info for manual review
    console.log(`Theme comparison screenshots generated for ${reportName}:`, screenshots);
  }
}