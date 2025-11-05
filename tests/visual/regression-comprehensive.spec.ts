import { test, expect, Browser, BrowserContext, Page } from '@playwright/test';
import { VisualTestHelper, THEMES, VIEWPORTS } from './utils/visual-comparison';

/**
 * Comprehensive Visual Regression Tests
 * 
 * This test suite implements automated screenshot testing for the color system
 * across different themes and browsers as specified in task 9.1:
 * - Automated screenshots of components
 * - Visual comparison between themes  
 * - Cross-browser validation
 */

test.describe('Visual Regression - Color System Components', () => {
  let visualHelper: VisualTestHelper;

  test.beforeEach(async ({ page }) => {
    visualHelper = new VisualTestHelper(page);
    await page.goto('/');
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

  test('should capture baseline screenshots of core UI components', async ({ page }) => {
    const coreComponentsHTML = `
      <div class="min-h-screen bg-background p-8 space-y-12">
        <div class="max-w-6xl mx-auto">
          <h1 class="text-4xl font-bold text-foreground mb-8">Core UI Components - Color System Test</h1>
          
          <!-- Color Palette Display -->
          <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-foreground">Color Palette</h2>
            
            <!-- Primary Colors -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-foreground">Primary Colors</h3>
              <div class="grid grid-cols-5 gap-4">
                <div class="text-center">
                  <div class="w-24 h-24 bg-primary-900 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Primary 900</div>
                  <div class="text-xs text-muted-foreground">#1a2332</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-primary-800 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Primary 800</div>
                  <div class="text-xs text-muted-foreground">#2a3441</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-primary-700 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Primary 700</div>
                  <div class="text-xs text-muted-foreground">#3a4550</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-primary-600 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Primary 600</div>
                  <div class="text-xs text-muted-foreground">#4a5660</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-primary-500 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Primary 500</div>
                  <div class="text-xs text-muted-foreground">#5a6770</div>
                </div>
              </div>
            </div>

            <!-- Accent Colors -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-foreground">Accent Colors</h3>
              <div class="grid grid-cols-3 gap-6">
                <div class="text-center">
                  <div class="w-24 h-24 bg-orange-500 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Orange</div>
                  <div class="text-xs text-muted-foreground">#FF6B35</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-cyan-500 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Cyan</div>
                  <div class="text-xs text-muted-foreground">#00D4FF</div>
                </div>
                <div class="text-center">
                  <div class="w-24 h-24 bg-teal-500 rounded-lg shadow-md mb-3 border border-border"></div>
                  <div class="text-sm font-medium text-foreground">Teal</div>
                  <div class="text-xs text-muted-foreground">#00B4A6</div>
                </div>
              </div>
            </div>
          </section>

          <!-- Interactive Components -->
          <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-foreground">Interactive Components</h2>
            
            <!-- Buttons -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-foreground">Buttons</h3>
              <div class="flex flex-wrap gap-4">
                <button class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors">
                  Primary Action
                </button>
                <button class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors">
                  Secondary Action
                </button>
                <button class="bg-primary-700 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors">
                  Tertiary Action
                </button>
                <button class="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900 px-6 py-3 rounded-lg font-medium transition-colors">
                  Outline Button
                </button>
                <button class="text-primary-600 hover:text-primary-700 px-6 py-3 rounded-lg font-medium transition-colors">
                  Text Button
                </button>
                <button class="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed" disabled>
                  Disabled Button
                </button>
              </div>
            </div>

            <!-- Form Elements -->
            <div class="space-y-4">
              <h3 class="text-lg font-medium text-foreground">Form Elements</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div class="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Normal input field" 
                    class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                  />
                  <input 
                    type="text" 
                    value="Focused input" 
                    class="w-full px-4 py-3 border-2 border-cyan-500 bg-background text-foreground rounded-lg ring-2 ring-cyan-200 dark:ring-cyan-800"
                  />
                  <input 
                    type="text" 
                    value="Error state" 
                    class="w-full px-4 py-3 border-2 border-red-500 bg-background text-foreground rounded-lg ring-2 ring-red-200 dark:ring-red-800"
                  />
                  <input 
                    type="text" 
                    value="Success state" 
                    class="w-full px-4 py-3 border-2 border-green-500 bg-background text-foreground rounded-lg ring-2 ring-green-200 dark:ring-green-800"
                  />
                </div>
                <div class="space-y-4">
                  <select class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                  </select>
                  <textarea 
                    placeholder="Textarea placeholder" 
                    rows="4"
                    class="w-full px-4 py-3 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </section>

          <!-- Cards and Containers -->
          <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-foreground">Cards and Containers</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-card-foreground mb-3">Standard Card</h3>
                <p class="text-muted-foreground mb-4">This is a standard card with default styling and proper contrast ratios for accessibility.</p>
                <button class="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Action
                </button>
              </div>
              
              <div class="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-xl p-6 shadow-lg">
                <h3 class="text-lg font-semibold mb-3">Gradient Card</h3>
                <p class="text-primary-100 mb-4">This card uses the primary gradient background with proper text contrast.</p>
                <button class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Action
                </button>
              </div>
              
              <div class="bg-card border-2 border-cyan-500 rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-card-foreground mb-3">Highlighted Card</h3>
                <p class="text-muted-foreground mb-4">This card has a cyan border to indicate selection or importance.</p>
                <button class="bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Action
                </button>
              </div>
            </div>
          </section>

          <!-- Status Indicators -->
          <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-foreground">Status Indicators</h2>
            <div class="space-y-4">
              <div class="flex flex-wrap gap-4">
                <div class="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  Success Status
                </div>
                <div class="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Warning Status
                </div>
                <div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800">
                  <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                  Error Status
                </div>
                <div class="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 px-4 py-2 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  <div class="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Info Status
                </div>
              </div>
            </div>
          </section>

          <!-- Navigation Elements -->
          <section class="space-y-6">
            <h2 class="text-2xl font-semibold text-foreground">Navigation Elements</h2>
            <div class="space-y-4">
              <nav class="bg-primary-900 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold">Navigation Menu</h3>
                  <button class="text-primary-300 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                  </button>
                </div>
                <ul class="flex flex-wrap gap-6">
                  <li><a href="#" class="text-primary-200 hover:text-cyan-300 transition-colors font-medium">Home</a></li>
                  <li><a href="#" class="text-primary-200 hover:text-cyan-300 transition-colors font-medium">Dashboard</a></li>
                  <li><a href="#" class="text-orange-400 hover:text-orange-300 transition-colors font-medium">Active Page</a></li>
                  <li><a href="#" class="text-primary-200 hover:text-cyan-300 transition-colors font-medium">Analytics</a></li>
                  <li><a href="#" class="text-primary-200 hover:text-cyan-300 transition-colors font-medium">Settings</a></li>
                </ul>
              </nav>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(coreComponentsHTML, 'core-components-test');
    
    // Capture screenshots across all themes
    await visualHelper.compareAcrossThemes(
      '#core-components-test',
      THEMES,
      'core-ui-components',
      { fullPage: true }
    );

    await visualHelper.cleanupTestComponents('core-components-test');
  });

  test('should validate theme consistency across component states', async ({ page }) => {
    const stateTestHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-4xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">Component State Validation</h1>
          
          <!-- Button States -->
          <section class="space-y-4">
            <h2 class="text-xl font-semibold text-foreground">Button States</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button class="bg-orange-500 text-white px-4 py-3 rounded-lg font-medium">Normal</button>
              <button class="bg-orange-600 text-white px-4 py-3 rounded-lg font-medium">Hover</button>
              <button class="bg-orange-500 text-white px-4 py-3 rounded-lg font-medium ring-2 ring-orange-300 dark:ring-orange-700">Focus</button>
              <button class="bg-orange-300 text-orange-100 px-4 py-3 rounded-lg font-medium cursor-not-allowed" disabled>Disabled</button>
            </div>
          </section>

          <!-- Input States -->
          <section class="space-y-4">
            <h2 class="text-xl font-semibold text-foreground">Input States</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Normal state" class="px-4 py-3 border border-input bg-background text-foreground rounded-lg" />
              <input type="text" value="Focused state" class="px-4 py-3 border-2 border-cyan-500 bg-background text-foreground rounded-lg ring-2 ring-cyan-200 dark:ring-cyan-800" />
              <input type="text" value="Error state" class="px-4 py-3 border-2 border-red-500 bg-background text-foreground rounded-lg ring-2 ring-red-200 dark:ring-red-800" />
              <input type="text" value="Success state" class="px-4 py-3 border-2 border-green-500 bg-background text-foreground rounded-lg ring-2 ring-green-200 dark:ring-green-800" />
            </div>
          </section>

          <!-- Card States -->
          <section class="space-y-4">
            <h2 class="text-xl font-semibold text-foreground">Card States</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-card border border-border rounded-lg p-4">
                <h3 class="font-semibold text-card-foreground">Normal Card</h3>
                <p class="text-muted-foreground text-sm">Standard card styling</p>
              </div>
              <div class="bg-card border-2 border-cyan-500 rounded-lg p-4 shadow-md">
                <h3 class="font-semibold text-card-foreground">Selected Card</h3>
                <p class="text-muted-foreground text-sm">Card with selection state</p>
              </div>
              <div class="bg-card border border-border rounded-lg p-4 opacity-50">
                <h3 class="font-semibold text-card-foreground">Disabled Card</h3>
                <p class="text-muted-foreground text-sm">Card in disabled state</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(stateTestHTML, 'state-validation-test');
    
    // Test each theme
    for (const theme of THEMES) {
      await visualHelper.applyTheme(theme);
      
      await expect(page.locator('#state-validation-test')).toHaveScreenshot(
        `component-states-${theme.name}.png`,
        { 
          fullPage: true,
          animations: 'disabled',
          threshold: 0.2
        }
      );
    }

    await visualHelper.cleanupTestComponents('state-validation-test');
  });

  test('should validate chart color consistency', async ({ page }) => {
    const chartTestHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-6xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">Chart Color System</h1>
          
          <!-- Chart Color Palette -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Chart Color Palette</h2>
            <div class="grid grid-cols-6 gap-4">
              <div class="text-center">
                <div class="w-20 h-20 bg-cyan-500 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 1</span>
                <div class="text-xs text-muted-foreground">#00D4FF</div>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-orange-500 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 2</span>
                <div class="text-xs text-muted-foreground">#FF6B35</div>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-teal-500 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 3</span>
                <div class="text-xs text-muted-foreground">#00B4A6</div>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-purple-500 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 4</span>
                <div class="text-xs text-muted-foreground">#8B5CF6</div>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-primary-600 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 5</span>
                <div class="text-xs text-muted-foreground">#4A5660</div>
              </div>
              <div class="text-center">
                <div class="w-20 h-20 bg-pink-500 rounded-lg shadow-sm mb-2"></div>
                <span class="text-sm font-medium text-foreground">Chart 6</span>
                <div class="text-xs text-muted-foreground">#EC4899</div>
              </div>
            </div>
          </section>

          <!-- Mock Chart Visualizations -->
          <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">Chart Visualizations</h2>
            
            <!-- Bar Chart Mock -->
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="text-lg font-semibold text-card-foreground mb-4">Sample Bar Chart</h3>
              <div class="flex items-end justify-center space-x-3 h-40">
                <div class="bg-cyan-500 w-12 h-32 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">85</div>
                <div class="bg-orange-500 w-12 h-24 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">65</div>
                <div class="bg-teal-500 w-12 h-36 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">92</div>
                <div class="bg-purple-500 w-12 h-20 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">58</div>
                <div class="bg-primary-600 w-12 h-28 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">72</div>
                <div class="bg-pink-500 w-12 h-16 rounded-t-lg flex items-end justify-center text-white text-sm font-medium pb-2">45</div>
              </div>
              <div class="flex justify-center space-x-3 mt-2 text-sm text-muted-foreground">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
              </div>
            </div>

            <!-- Pie Chart Mock -->
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="text-lg font-semibold text-card-foreground mb-4">Sample Pie Chart Legend</h3>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-cyan-500 rounded"></div>
                  <span class="text-sm text-foreground">Category A (35%)</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-orange-500 rounded"></div>
                  <span class="text-sm text-foreground">Category B (25%)</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-teal-500 rounded"></div>
                  <span class="text-sm text-foreground">Category C (20%)</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-purple-500 rounded"></div>
                  <span class="text-sm text-foreground">Category D (15%)</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-4 h-4 bg-primary-600 rounded"></div>
                  <span class="text-sm text-foreground">Category E (5%)</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(chartTestHTML, 'chart-colors-test');
    
    await visualHelper.compareAcrossThemes(
      '#chart-colors-test',
      THEMES,
      'chart-color-system',
      { fullPage: true }
    );

    await visualHelper.cleanupTestComponents('chart-colors-test');
  });

  test('should validate responsive design consistency', async ({ page }) => {
    // Test responsive behavior across different viewports
    const responsiveHTML = `
      <div class="min-h-screen bg-background p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          <h1 class="text-2xl md:text-4xl font-bold text-foreground mb-6 md:mb-8">Responsive Design Test</h1>
          
          <!-- Responsive Grid -->
          <section class="space-y-6">
            <h2 class="text-lg md:text-xl font-semibold text-foreground">Responsive Components</h2>
            
            <!-- Button Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button class="bg-orange-500 text-white px-4 py-3 rounded-lg font-medium w-full">Primary</button>
              <button class="bg-cyan-500 text-white px-4 py-3 rounded-lg font-medium w-full">Secondary</button>
              <button class="bg-primary-700 text-white px-4 py-3 rounded-lg font-medium w-full">Tertiary</button>
              <button class="border-2 border-primary-600 text-primary-600 px-4 py-3 rounded-lg font-medium w-full">Outline</button>
            </div>

            <!-- Card Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div class="bg-card border border-border rounded-xl p-6">
                <h3 class="text-lg font-semibold text-card-foreground mb-3">Card 1</h3>
                <p class="text-muted-foreground">Responsive card content that adapts to different screen sizes.</p>
              </div>
              <div class="bg-gradient-to-br from-primary-900 to-primary-800 text-white rounded-xl p-6">
                <h3 class="text-lg font-semibold mb-3">Card 2</h3>
                <p class="text-primary-100">Gradient card with responsive layout.</p>
              </div>
              <div class="bg-card border-2 border-cyan-500 rounded-xl p-6 md:col-span-2 xl:col-span-1">
                <h3 class="text-lg font-semibold text-card-foreground mb-3">Card 3</h3>
                <p class="text-muted-foreground">Highlighted card with responsive spanning.</p>
              </div>
            </div>

            <!-- Form Layout -->
            <div class="bg-card border border-border rounded-xl p-6">
              <h3 class="text-lg font-semibold text-card-foreground mb-4">Responsive Form</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" class="px-4 py-3 border border-input bg-background text-foreground rounded-lg w-full" />
                <input type="text" placeholder="Last Name" class="px-4 py-3 border border-input bg-background text-foreground rounded-lg w-full" />
                <input type="email" placeholder="Email" class="px-4 py-3 border border-input bg-background text-foreground rounded-lg w-full md:col-span-2" />
                <textarea placeholder="Message" rows="4" class="px-4 py-3 border border-input bg-background text-foreground rounded-lg w-full md:col-span-2 resize-none"></textarea>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(responsiveHTML, 'responsive-test');
    
    // Test across different viewports and themes
    await visualHelper.testResponsiveDesign(
      VIEWPORTS,
      [THEMES[0], THEMES[1]], // Light and dark themes
      'responsive-color-consistency'
    );

    await visualHelper.cleanupTestComponents('responsive-test');
  });
});

test.describe('Cross-Browser Visual Validation', () => {
  // This test group will run on all configured browsers in playwright.config.ts
  
  test('should render colors consistently across browsers', async ({ page, browserName }) => {
    const visualHelper = new VisualTestHelper(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Disable animations
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

    const crossBrowserHTML = `
      <div class="min-h-screen bg-background p-8">
        <div class="max-w-4xl mx-auto space-y-8">
          <h1 class="text-3xl font-bold text-foreground">Cross-Browser Color Test - ${browserName}</h1>
          
          <!-- Critical Color Elements -->
          <section class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-orange-500 text-white p-4 rounded-lg text-center font-medium">Orange</div>
              <div class="bg-cyan-500 text-white p-4 rounded-lg text-center font-medium">Cyan</div>
              <div class="bg-primary-900 text-white p-4 rounded-lg text-center font-medium">Primary</div>
              <div class="bg-teal-500 text-white p-4 rounded-lg text-center font-medium">Teal</div>
            </div>
            
            <!-- Gradient Test -->
            <div class="bg-gradient-to-r from-cyan-500 to-orange-500 text-white p-6 rounded-xl text-center">
              <h2 class="text-xl font-semibold">Gradient Rendering Test</h2>
              <p>This gradient should render consistently across all browsers</p>
            </div>
            
            <!-- Shadow and Border Test -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-card border border-border rounded-xl p-6 shadow-lg">
                <h3 class="font-semibold text-card-foreground">Shadow Test</h3>
                <p class="text-muted-foreground">Testing shadow rendering</p>
              </div>
              <div class="bg-card border-2 border-cyan-500 rounded-xl p-6">
                <h3 class="font-semibold text-card-foreground">Border Test</h3>
                <p class="text-muted-foreground">Testing border rendering</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    await visualHelper.injectTestComponents(crossBrowserHTML, 'cross-browser-test');
    
    // Test both light and dark themes for this browser
    for (const theme of [THEMES[0], THEMES[1]]) {
      await visualHelper.applyTheme(theme);
      
      await expect(page.locator('#cross-browser-test')).toHaveScreenshot(
        `cross-browser-${browserName}-${theme.name}.png`,
        { 
          fullPage: true,
          animations: 'disabled',
          threshold: 0.3 // Slightly higher threshold for cross-browser differences
        }
      );
    }

    await visualHelper.cleanupTestComponents('cross-browser-test');
  });
});