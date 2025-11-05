# Visual Regression Testing for Color System

This directory contains comprehensive visual regression tests for the color system implementation as specified in task 9.1 of the color system improvement spec.

## Overview

The visual regression testing suite validates:
- ✅ Automated screenshots of UI components
- ✅ Visual comparison between themes (light, dark, high-contrast)
- ✅ Cross-browser rendering validation
- ✅ Responsive design consistency
- ✅ Domain-specific component validation

## Test Structure

### Core Test Files

- **`color-system.spec.ts`** - Basic color system validation tests
- **`components.spec.ts`** - Individual component visual tests
- **`comprehensive-visual.spec.ts`** - Advanced visual testing scenarios
- **`regression-comprehensive.spec.ts`** - Complete regression test suite
- **`domain-components.spec.ts`** - Domain-specific component tests (Edital Analysis, IT Pricing)

### Utility Files

- **`utils/visual-comparison.ts`** - Helper classes and utilities for visual testing
- **`../scripts/visual-regression-runner.ts`** - CLI runner for visual tests

## Requirements Coverage

This test suite addresses the following requirements from the color system spec:

### Requirement 2.4
> "Sistema deve ser facilmente modificável através das variáveis CSS"
- Tests validate that CSS custom properties render consistently
- Cross-browser tests ensure variable support works across engines

### Requirement 4.1
> "Manter a mesma paleta de cores em todos os componentes"
- Component screenshots verify consistent color application
- Theme comparison tests validate color consistency across modes

## Test Categories

### 1. Core UI Components
Tests fundamental UI elements with the new color palette:
- Color palette swatches
- Button components (all states)
- Form elements (input, select, textarea)
- Cards and containers
- Navigation elements
- Status indicators

### 2. Theme Consistency
Validates visual consistency across themes:
- Light theme rendering
- Dark theme rendering
- High contrast mode
- Theme transition states

### 3. Cross-Browser Validation
Ensures color fidelity across browser engines:
- Chromium (Chrome, Edge)
- Firefox (Gecko)
- WebKit (Safari)
- Mobile browsers

### 4. Responsive Design
Tests color consistency across viewport sizes:
- Desktop (1920x1080)
- Laptop (1366x768)
- Tablet (768x1024)
- Mobile (375x667)

### 5. Domain Components
Validates domain-specific components:
- Edital Analysis module
- IT Pricing module
- Dashboard components
- Chart color systems

## Running Tests

### Basic Commands

```bash
# Run all visual tests
npm run test:visual

# Run with UI mode for debugging
npm run test:visual:ui

# Update baseline screenshots
npm run test:visual:update

# View test report
npm run test:visual:report
```

### Advanced Commands (using the regression runner)

```bash
# Run comprehensive regression tests
npm run test:visual:regression

# Update baseline screenshots for regression tests
npm run test:visual:regression:update

# Run cross-browser validation only
npm run test:visual:cross-browser

# Run specific component tests
tsx scripts/visual-regression-runner.ts component "button"

# Run tests on specific browsers
tsx scripts/visual-regression-runner.ts --browsers chromium,firefox
```

### CLI Options

The visual regression runner supports these options:

- `--update-snapshots` - Update baseline screenshots
- `--headed` - Run tests in headed mode (visible browser)
- `--debug` - Run tests in debug mode
- `--browsers <list>` - Specify browsers (comma-separated)

## Test Configuration

### Playwright Configuration

Tests are configured in `playwright.config.ts` with:
- Multiple browser projects (Chromium, Firefox, WebKit, Edge, Chrome)
- Mobile device testing (Pixel 5, iPhone 12)
- Automatic dev server startup
- HTML reporting

### Screenshot Settings

All tests use consistent screenshot settings:
- Animations disabled for consistency
- Threshold: 0.2 (allows minor rendering differences)
- Full page screenshots where appropriate
- Consistent viewport sizes

## Understanding Test Results

### Screenshot Comparison

Tests generate three types of images:
- **Actual** - Current screenshot
- **Expected** - Baseline screenshot
- **Diff** - Visual difference highlighting

### Failure Analysis

When tests fail:
1. Check the diff image to see what changed
2. Verify if the change is intentional (design update)
3. Update baselines if the change is correct
4. Fix implementation if the change is a bug

### Cross-Browser Differences

Minor differences between browsers are expected:
- Font rendering variations
- Subpixel differences
- Shadow rendering differences

The threshold is set to accommodate these while catching real issues.

## Maintenance

### Updating Baselines

When the color system is intentionally updated:

```bash
# Update all baselines
npm run test:visual:regression:update

# Update specific test baselines
npx playwright test tests/visual/color-system.spec.ts --update-snapshots
```

### Adding New Tests

1. Create test components using the `VisualTestHelper`
2. Use `injectTestComponents()` to add HTML
3. Use `compareAcrossThemes()` for theme testing
4. Clean up with `cleanupTestComponents()`

Example:
```typescript
const html = `<div class="bg-primary-900 text-white p-4">Test Component</div>`;
await visualHelper.injectTestComponents(html, 'test-id');
await visualHelper.compareAcrossThemes('#test-id', THEMES, 'test-name');
await visualHelper.cleanupTestComponents('test-id');
```

## Continuous Integration

These tests are designed to run in CI environments:
- Headless execution by default
- Retry logic for flaky tests
- Artifact collection for failed tests
- HTML reports for easy review

## Troubleshooting

### Common Issues

1. **Font rendering differences**
   - Solution: Use web fonts consistently
   - Increase threshold if needed

2. **Animation interference**
   - Solution: Animations are disabled in tests
   - Check for CSS transitions not covered

3. **Timing issues**
   - Solution: Tests include proper wait conditions
   - Add `waitForTimeout()` if needed

4. **Color accuracy**
   - Solution: Use exact hex values in tests
   - Verify CSS custom properties are loaded

### Debug Mode

Run tests in debug mode to step through:
```bash
tsx scripts/visual-regression-runner.ts --debug
```

This opens the browser and pauses at each step for inspection.

## Reporting

### Automated Reports

The regression runner generates:
- Summary reports with test coverage
- Cross-browser comparison reports
- Timestamp and metadata tracking

### Manual Review

Use the Playwright HTML reporter:
```bash
npm run test:visual:report
```

This provides an interactive interface to review all test results and screenshots.

## Integration with Color System Spec

This testing suite directly supports the color system improvement specification:

- **Task 9.1**: ✅ Implemented comprehensive visual regression tests
- **Requirements 2.4 & 4.1**: ✅ Validated through automated testing
- **Cross-browser support**: ✅ Tested across all major browsers
- **Theme consistency**: ✅ Validated across light, dark, and high-contrast modes

The tests provide confidence that color system changes maintain visual consistency and meet accessibility requirements across all supported platforms and browsers.