import { test, expect } from '@playwright/test';
import { VisualTestHelper, THEMES, VIEWPORTS, INTERACTIVE_STATES } from './utils/visual-comparison';

test.describe('Comprehensive Visual Regression Tests', () => {
  let visualHelper: VisualTestHelper;

  test.beforeEach(async ({ page }) => {
    visualHelper = new VisualTestHelper(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain visual consistency across all themes', async ({ page }) => {
    // Test main application layout
    await visualHelper.comparePageAcrossThemes(
      THEMES,
      'main-application',
      { fullPage: true }
    );
  });

  test('should render color palette components consistently', async ({ page }) => {
    const colorPaletteHTML = `
      <div class="p-8 space-y-8">
        <h1 class="text-3xl font-bold text-foreground mb-8">Color System Validation</h1>
        
        <!-- Primary Colors -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Primary Colors</h2>
          <div class="grid grid-cols-5 gap-4">
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-900 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Primary 900</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-800 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Primary 800</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-700 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Primary 700</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-600 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Primary 600</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-primary-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Primary 500</span>
            </div>
          </div>
        </section>

        <!-- Accent Colors -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Accent Colors</h2>
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="w-20 h-20 bg-orange-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Orange</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-cyan-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Cyan</span>
            </div>
            <div class="text-center">
              <div class="w-20 h-20 bg-teal-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-sm text-muted-foreground">Teal</span>
            </div>
          </div>
        </section>

        <!-- Interactive Elements -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Interactive Elements</h2>
          <div class="space-y-4">
            <div class="flex gap-4 flex-wrap">
              <button class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Primary Action
              </button>
              <button class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Secondary Action
              </button>
              <button class="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 px-6 py-3 rounded-lg font-medium transition-colors">
                Outline Button
              </button>
            </div>
          </div>
        </section>

        <!-- Form Elements -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Form Elements</h2>
          <div class="max-w-md space-y-4">
            <input 
              type="text" 
              placeholder="Enter text..." 
              class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
            />
            <select class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option>Select an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
            <textarea 
              placeholder="Enter description..." 
              rows="3"
              class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none transition-colors"
            ></textarea>
          </div>
        </section>

        <!-- Status Indicators -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Status Indicators</h2>
          <div class="flex gap-4 flex-wrap">
            <div class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              Success
            </div>
            <div class="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg">
              <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
              Warning
            </div>
            <div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg">
              <div class="w-2 h-2 bg-red-500 rounded-full"></div>
              Error
            </div>
            <div class="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-lg">
              <div class="w-2 h-2 bg-cyan-500 rounded-full"></div>
              Info
            </div>
          </div>
        </section>

        <!-- Cards and Containers -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Cards and Containers</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 class="text-lg font-semibold text-card-foreground mb-2">Standard Card</h3>
              <p class="text-muted-foreground">This is a standard card with default styling and proper contrast ratios.</p>
            </div>
            <div class="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-xl p-6 shadow-lg">
              <h3 class="text-lg font-semibold mb-2">Gradient Card</h3>
              <p class="text-primary-100">This card uses the primary gradient background with proper text contrast.</p>
            </div>
          </div>
        </section>
      </div>
    `;

    await visualHelper.injectTestComponents(colorPaletteHTML, 'color-palette-test');
    
    await visualHelper.compareAcrossThemes(
      '#color-palette-test',
      THEMES,
      'color-palette-comprehensive'
    );

    await visualHelper.cleanupTestComponents('color-palette-test');
  });

  test('should handle interactive states correctly across themes', async ({ page }) => {
    const interactiveHTML = `
      <div class="p-8 space-y-8">
        <h1 class="text-2xl font-bold text-foreground">Interactive States Test</h1>
        
        <div class="space-y-6">
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Button States</h2>
            <div class="flex gap-4">
              <button id="test-button-primary" class="bg-orange-500 hover:bg-orange-600 focus:ring-2 focus:ring-orange-300 text-white px-6 py-3 rounded-lg font-medium transition-all">
                Primary Button
              </button>
              <button id="test-button-secondary" class="bg-cyan-500 hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300 text-white px-6 py-3 rounded-lg font-medium transition-all">
                Secondary Button
              </button>
            </div>
          </div>
          
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-foreground">Input States</h2>
            <div class="max-w-md space-y-3">
              <input 
                id="test-input" 
                type="text" 
                placeholder="Test input field" 
                class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(interactiveHTML, 'interactive-test');

    // Test button interactions across themes
    for (const theme of THEMES) {
      await visualHelper.testInteractiveStates(
        '#test-button-primary',
        INTERACTIVE_STATES,
        theme,
        'button-primary-states'
      );

      await visualHelper.testInteractiveStates(
        '#test-input',
        INTERACTIVE_STATES,
        theme,
        'input-states'
      );
    }

    await visualHelper.cleanupTestComponents('interactive-test');
  });

  test('should maintain consistency across different viewport sizes', async ({ page }) => {
    // Test responsive behavior
    await visualHelper.testResponsiveDesign(
      VIEWPORTS,
      [THEMES[0], THEMES[1]], // Test light and dark themes
      'responsive-layout'
    );
  });

  test('should render chart colors correctly', async ({ page }) => {
    const chartColorsHTML = `
      <div class="p-8 space-y-8">
        <h1 class="text-2xl font-bold text-foreground">Chart Color System</h1>
        
        <!-- Chart Color Palette -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Chart Colors</h2>
          <div class="grid grid-cols-6 gap-4">
            <div class="text-center">
              <div class="w-16 h-16 bg-cyan-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 1</span>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-orange-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 2</span>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-teal-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 3</span>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 4</span>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-primary-600 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 5</span>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-pink-500 rounded-lg mb-2 shadow-sm"></div>
              <span class="text-xs text-muted-foreground">Chart 6</span>
            </div>
          </div>
        </section>

        <!-- Mock Chart Visualization -->
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-foreground">Chart Visualization Example</h2>
          <div class="bg-card border border-border rounded-xl p-6">
            <div class="flex items-end justify-center space-x-2 h-32">
              <div class="bg-cyan-500 w-8 h-20 rounded-t"></div>
              <div class="bg-orange-500 w-8 h-16 rounded-t"></div>
              <div class="bg-teal-500 w-8 h-24 rounded-t"></div>
              <div class="bg-purple-500 w-8 h-12 rounded-t"></div>
              <div class="bg-primary-600 w-8 h-18 rounded-t"></div>
              <div class="bg-pink-500 w-8 h-14 rounded-t"></div>
            </div>
            <div class="mt-4 text-center text-sm text-muted-foreground">
              Sample Chart Data Visualization
            </div>
          </div>
        </section>
      </div>
    `;

    await visualHelper.injectTestComponents(chartColorsHTML, 'chart-colors-test');
    
    await visualHelper.compareAcrossThemes(
      '#chart-colors-test',
      THEMES,
      'chart-colors-system'
    );

    await visualHelper.cleanupTestComponents('chart-colors-test');
  });

  test('should validate print-optimized colors', async ({ page }) => {
    // Test print styles by applying print media query
    await page.emulateMedia({ media: 'print' });
    
    const printTestHTML = `
      <div class="p-8 space-y-6">
        <h1 class="text-2xl font-bold">Print Color Test</h1>
        
        <div class="space-y-4">
          <div class="bg-card border border-border p-4 rounded">
            <h2 class="font-semibold mb-2">Standard Content</h2>
            <p class="text-muted-foreground">This content should be optimized for printing with proper contrast.</p>
          </div>
          
          <div class="bg-primary-900 text-white p-4 rounded">
            <h2 class="font-semibold mb-2">Dark Background Content</h2>
            <p>This should be readable when printed.</p>
          </div>
          
          <div class="flex gap-4">
            <button class="bg-orange-500 text-white px-4 py-2 rounded">Action Button</button>
            <button class="border border-primary-600 text-primary-600 px-4 py-2 rounded">Outline Button</button>
          </div>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(printTestHTML, 'print-test');
    
    await expect(page.locator('#print-test')).toHaveScreenshot('print-optimized-colors.png', {
      animations: 'disabled'
    });

    await visualHelper.cleanupTestComponents('print-test');
    
    // Reset media emulation
    await page.emulateMedia({ media: 'screen' });
  });
});