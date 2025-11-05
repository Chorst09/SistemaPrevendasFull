import { test, expect } from '@playwright/test';

test.describe('Color System Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('should render main page with light theme correctly', async ({ page }) => {
    // Ensure light theme is active
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('high-contrast');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('main-page-light-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should render main page with dark theme correctly', async ({ page }) => {
    // Enable dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('high-contrast');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('main-page-dark-theme.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should render main page with high contrast mode correctly', async ({ page }) => {
    // Enable high contrast mode
    await page.evaluate(() => {
      document.documentElement.classList.add('high-contrast');
      document.documentElement.classList.add('dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('main-page-high-contrast.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should render navigation components correctly in light theme', async ({ page }) => {
    // Ensure light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('high-contrast');
    });
    
    await page.waitForTimeout(500);
    
    // Screenshot of navigation area
    const navigation = page.locator('nav, [role="navigation"], .sidebar, .header').first();
    if (await navigation.count() > 0) {
      await expect(navigation).toHaveScreenshot('navigation-light-theme.png', {
        animations: 'disabled'
      });
    }
  });

  test('should render navigation components correctly in dark theme', async ({ page }) => {
    // Enable dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('high-contrast');
    });
    
    await page.waitForTimeout(500);
    
    // Screenshot of navigation area
    const navigation = page.locator('nav, [role="navigation"], .sidebar, .header').first();
    if (await navigation.count() > 0) {
      await expect(navigation).toHaveScreenshot('navigation-dark-theme.png', {
        animations: 'disabled'
      });
    }
  });

  test('should render button components with correct colors', async ({ page }) => {
    // Test different button states and themes
    const themes = [
      { name: 'light', classes: [] },
      { name: 'dark', classes: ['dark'] },
      { name: 'high-contrast', classes: ['dark', 'high-contrast'] }
    ];

    for (const theme of themes) {
      // Apply theme
      await page.evaluate((themeClasses) => {
        document.documentElement.className = '';
        themeClasses.forEach(cls => document.documentElement.classList.add(cls));
      }, theme.classes);
      
      await page.waitForTimeout(500);
      
      // Find buttons and take screenshots
      const buttons = page.locator('button').first();
      if (await buttons.count() > 0) {
        await expect(buttons).toHaveScreenshot(`button-${theme.name}-theme.png`, {
          animations: 'disabled'
        });
      }
    }
  });

  test('should render form components with correct color states', async ({ page }) => {
    // Navigate to a page with forms if available
    const formElements = page.locator('input, select, textarea').first();
    
    if (await formElements.count() > 0) {
      const themes = ['light', 'dark', 'high-contrast'];
      
      for (const theme of themes) {
        // Apply theme
        await page.evaluate((themeName) => {
          document.documentElement.className = '';
          if (themeName === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (themeName === 'high-contrast') {
            document.documentElement.classList.add('dark', 'high-contrast');
          }
        }, theme);
        
        await page.waitForTimeout(500);
        
        // Test normal state
        await expect(formElements).toHaveScreenshot(`form-element-${theme}-normal.png`, {
          animations: 'disabled'
        });
        
        // Test focus state
        await formElements.focus();
        await expect(formElements).toHaveScreenshot(`form-element-${theme}-focus.png`, {
          animations: 'disabled'
        });
        
        await formElements.blur();
      }
    }
  });

  test('should render dashboard components with correct chart colors', async ({ page }) => {
    // Try to navigate to dashboard or find chart components
    const chartElements = page.locator('[data-testid*="chart"], .recharts-wrapper, canvas').first();
    
    if (await chartElements.count() > 0) {
      const themes = ['light', 'dark'];
      
      for (const theme of themes) {
        // Apply theme
        await page.evaluate((themeName) => {
          document.documentElement.className = '';
          if (themeName === 'dark') {
            document.documentElement.classList.add('dark');
          }
        }, theme);
        
        await page.waitForTimeout(1000); // Wait longer for charts to render
        
        await expect(chartElements).toHaveScreenshot(`chart-${theme}-theme.png`, {
          animations: 'disabled'
        });
      }
    }
  });

  test('should maintain color consistency across viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);
      
      // Test both light and dark themes
      const themes = ['light', 'dark'];
      
      for (const theme of themes) {
        await page.evaluate((themeName) => {
          document.documentElement.className = '';
          if (themeName === 'dark') {
            document.documentElement.classList.add('dark');
          }
        }, theme);
        
        await page.waitForTimeout(500);
        
        await expect(page).toHaveScreenshot(`${viewport.name}-${theme}-theme.png`, {
          fullPage: true,
          animations: 'disabled'
        });
      }
    }
  });
});