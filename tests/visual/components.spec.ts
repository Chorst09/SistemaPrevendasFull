import { test, expect } from '@playwright/test';

test.describe('Component Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test page with isolated components
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should render UI components with correct color palette', async ({ page }) => {
    // Inject test components into the page
    await page.evaluate(() => {
      // Create a test container
      const testContainer = document.createElement('div');
      testContainer.id = 'visual-test-container';
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

      // Create test components HTML
      testContainer.innerHTML = `
        <div class="space-y-6">
          <h1 class="text-2xl font-bold text-foreground">Color System Test Components</h1>
          
          <!-- Button Components -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Buttons</h2>
            <div class="flex gap-4 flex-wrap">
              <button class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded">Primary Button</button>
              <button class="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded">Secondary Button</button>
              <button class="bg-primary-700 hover:bg-primary-600 text-white px-4 py-2 rounded">Tertiary Button</button>
              <button class="border border-primary-600 text-primary-600 hover:bg-primary-50 px-4 py-2 rounded">Outline Button</button>
            </div>
          </div>

          <!-- Card Components -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Cards</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-card border border-border rounded-lg p-4 shadow-sm">
                <h3 class="font-semibold text-card-foreground">Default Card</h3>
                <p class="text-muted-foreground">This is a default card with standard colors.</p>
              </div>
              <div class="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-lg p-4 shadow-sm">
                <h3 class="font-semibold">Primary Gradient Card</h3>
                <p class="text-primary-100">This card uses the primary gradient.</p>
              </div>
            </div>
          </div>

          <!-- Form Components -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Form Elements</h2>
            <div class="space-y-3 max-w-md">
              <input type="text" placeholder="Normal input" class="w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500" />
              <input type="text" placeholder="Success state" class="w-full px-3 py-2 border border-green-500 bg-background text-foreground rounded focus:ring-2 focus:ring-green-500" />
              <input type="text" placeholder="Error state" class="w-full px-3 py-2 border border-red-500 bg-background text-foreground rounded focus:ring-2 focus:ring-red-500" />
              <select class="w-full px-3 py-2 border border-input bg-background text-foreground rounded focus:ring-2 focus:ring-cyan-500">
                <option>Select option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </div>
          </div>

          <!-- Status Indicators -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Status Indicators</h2>
            <div class="flex gap-4 flex-wrap">
              <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Success</span>
              <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">Warning</span>
              <span class="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Error</span>
              <span class="bg-cyan-100 text-cyan-800 px-2 py-1 rounded text-sm">Info</span>
            </div>
          </div>

          <!-- Navigation Elements -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Navigation</h2>
            <nav class="bg-primary-900 text-white p-4 rounded">
              <ul class="flex gap-6">
                <li><a href="#" class="hover:text-cyan-300 transition-colors">Home</a></li>
                <li><a href="#" class="hover:text-cyan-300 transition-colors">Dashboard</a></li>
                <li><a href="#" class="text-orange-400 hover:text-orange-300 transition-colors">Active Page</a></li>
                <li><a href="#" class="hover:text-cyan-300 transition-colors">Settings</a></li>
              </ul>
            </nav>
          </div>
        </div>
      `;

      document.body.appendChild(testContainer);
    });

    // Wait for styles to apply
    await page.waitForTimeout(500);

    // Test light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark', 'high-contrast');
    });
    await page.waitForTimeout(300);
    
    await expect(page.locator('#visual-test-container')).toHaveScreenshot('components-light-theme.png', {
      animations: 'disabled'
    });

    // Test dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('high-contrast');
    });
    await page.waitForTimeout(300);
    
    await expect(page.locator('#visual-test-container')).toHaveScreenshot('components-dark-theme.png', {
      animations: 'disabled'
    });

    // Test high contrast mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark', 'high-contrast');
    });
    await page.waitForTimeout(300);
    
    await expect(page.locator('#visual-test-container')).toHaveScreenshot('components-high-contrast.png', {
      animations: 'disabled'
    });
  });

  test('should render interactive states correctly', async ({ page }) => {
    // Create interactive test components
    await page.evaluate(() => {
      const testContainer = document.createElement('div');
      testContainer.id = 'interactive-test-container';
      testContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--background);
        z-index: 9999;
        padding: 20px;
      `;

      testContainer.innerHTML = `
        <div class="space-y-6">
          <h1 class="text-2xl font-bold text-foreground">Interactive States</h1>
          
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Button States</h2>
            <div class="grid grid-cols-2 gap-4">
              <button id="normal-btn" class="bg-orange-500 text-white px-4 py-2 rounded">Normal</button>
              <button id="hover-btn" class="bg-orange-600 text-white px-4 py-2 rounded">Hover</button>
              <button id="focus-btn" class="bg-orange-500 text-white px-4 py-2 rounded ring-2 ring-orange-300">Focus</button>
              <button id="disabled-btn" class="bg-gray-400 text-gray-200 px-4 py-2 rounded cursor-not-allowed" disabled>Disabled</button>
            </div>
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Form States</h2>
            <div class="space-y-3 max-w-md">
              <input id="normal-input" type="text" value="Normal input" class="w-full px-3 py-2 border border-input bg-background text-foreground rounded" />
              <input id="focus-input" type="text" value="Focused input" class="w-full px-3 py-2 border border-cyan-500 bg-background text-foreground rounded ring-2 ring-cyan-200" />
              <input id="error-input" type="text" value="Error input" class="w-full px-3 py-2 border border-red-500 bg-background text-foreground rounded ring-2 ring-red-200" />
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(testContainer);
    });

    await page.waitForTimeout(500);

    // Test different themes for interactive states
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      await page.evaluate((themeName) => {
        document.documentElement.className = '';
        if (themeName === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }, theme);
      
      await page.waitForTimeout(300);
      
      await expect(page.locator('#interactive-test-container')).toHaveScreenshot(`interactive-states-${theme}.png`, {
        animations: 'disabled'
      });
    }
  });

  test('should render chart color palette correctly', async ({ page }) => {
    // Create chart color test
    await page.evaluate(() => {
      const testContainer = document.createElement('div');
      testContainer.id = 'chart-colors-container';
      testContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: var(--background);
        z-index: 9999;
        padding: 20px;
      `;

      testContainer.innerHTML = `
        <div class="space-y-6">
          <h1 class="text-2xl font-bold text-foreground">Chart Color Palette</h1>
          
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Primary Chart Colors</h2>
            <div class="grid grid-cols-5 gap-4">
              <div class="text-center">
                <div class="w-16 h-16 bg-cyan-500 rounded mb-2 mx-auto"></div>
                <span class="text-sm text-muted-foreground">Cyan</span>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-orange-500 rounded mb-2 mx-auto"></div>
                <span class="text-sm text-muted-foreground">Orange</span>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-teal-500 rounded mb-2 mx-auto"></div>
                <span class="text-sm text-muted-foreground">Teal</span>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-purple-500 rounded mb-2 mx-auto"></div>
                <span class="text-sm text-muted-foreground">Purple</span>
              </div>
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-600 rounded mb-2 mx-auto"></div>
                <span class="text-sm text-muted-foreground">Primary</span>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Gradient Examples</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="h-24 bg-gradient-to-r from-cyan-500 to-orange-500 rounded flex items-center justify-center text-white font-semibold">
                Cyan to Orange
              </div>
              <div class="h-24 bg-gradient-to-r from-primary-900 to-primary-700 rounded flex items-center justify-center text-white font-semibold">
                Primary Gradient
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(testContainer);
    });

    await page.waitForTimeout(500);

    // Test both themes
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      await page.evaluate((themeName) => {
        document.documentElement.className = '';
        if (themeName === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }, theme);
      
      await page.waitForTimeout(300);
      
      await expect(page.locator('#chart-colors-container')).toHaveScreenshot(`chart-colors-${theme}.png`, {
        animations: 'disabled'
      });
    }
  });
});