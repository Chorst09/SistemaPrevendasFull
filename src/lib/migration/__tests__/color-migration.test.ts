/**
 * Testes para o sistema de migração de cores
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { migrationManager, type MigrationConfig } from '../color-migration';
import { calculateContrast, isWCAGCompliant, validateCustomCSS } from '../migration-utils';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock do window
const windowMock = {
  localStorage: localStorageMock,
  CSS: {
    supports: vi.fn(),
  },
  navigator: {
    userAgent: 'test-user-agent',
  },
  dispatchEvent: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

Object.defineProperty(global, 'window', {
  value: windowMock,
  writable: true,
});

describe('Color Migration System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    windowMock.CSS.supports.mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Migration Manager', () => {
    it('should initialize with default configuration', () => {
      const config = migrationManager.getConfig();
      expect(config.fallbackMode).toBe('hybrid');
      expect(config.validationLevel).toBe('moderate');
      expect(config.rolloutPercentage).toBe(0);
    });

    it('should start migration with custom configuration', async () => {
      const customConfig: Partial<MigrationConfig> = {
        enabledFeatures: {
          newColorSystem: true,
          modernComponents: true,
        },
        rolloutPercentage: 50,
        fallbackMode: 'modern',
      };

      // Mock successful migration
      vi.spyOn(migrationManager as any, 'prepareMigration').mockResolvedValue(undefined);
      vi.spyOn(migrationManager as any, 'executeRollout').mockResolvedValue(undefined);
      vi.spyOn(migrationManager as any, 'validateMigration').mockResolvedValue(undefined);
      vi.spyOn(migrationManager as any, 'completeMigration').mockResolvedValue(undefined);

      await migrationManager.startMigration(customConfig);

      const status = migrationManager.getStatus();
      expect(status.currentPhase).toBe('completion');
      expect(status.progress).toBe(100);
    });

    it('should handle migration errors gracefully', async () => {
      const customConfig: Partial<MigrationConfig> = {
        enabledFeatures: { newColorSystem: true },
      };

      // Mock error during preparation
      vi.spyOn(migrationManager as any, 'prepareMigration').mockRejectedValue(new Error('Test error'));
      vi.spyOn(migrationManager as any, 'rollbackMigration').mockResolvedValue(undefined);

      await migrationManager.startMigration(customConfig);

      const status = migrationManager.getStatus();
      expect(status.errors.length).toBeGreaterThan(0);
      expect(status.errors[0]).toContain('Test error');
    });

    it('should validate browser support correctly', () => {
      // Test with full support
      windowMock.CSS.supports.mockReturnValue(true);
      
      const validation = (migrationManager as any).validateBrowserSupport();
      expect(validation.isSupported).toBe(true);
      expect(validation.missingFeatures).toHaveLength(0);

      // Test with missing features
      windowMock.CSS.supports.mockImplementation((property: string, value: string) => {
        return !(property === 'backdrop-filter' && value === 'blur(10px)');
      });

      const validationWithMissing = (migrationManager as any).validateBrowserSupport();
      expect(validationWithMissing.isSupported).toBe(false);
      expect(validationWithMissing.missingFeatures).toContain('backdrop-filter');
    });

    it('should determine user rollout correctly', () => {
      const shouldEnable = (migrationManager as any).shouldEnableForCurrentUser(50, []);
      expect(typeof shouldEnable).toBe('boolean');

      // Test with user groups
      localStorageMock.getItem.mockReturnValue('beta-testers');
      const shouldEnableForGroup = (migrationManager as any).shouldEnableForCurrentUser(10, ['beta-testers']);
      expect(shouldEnableForGroup).toBe(true);
    });
  });

  describe('Migration Utils', () => {
    describe('calculateContrast', () => {
      it('should calculate contrast ratio correctly', () => {
        const contrast = calculateContrast('#000000', '#FFFFFF');
        expect(contrast).toBeCloseTo(21, 0); // Perfect contrast

        const lowContrast = calculateContrast('#888888', '#999999');
        expect(lowContrast).toBeLessThan(4.5);
      });

      it('should handle invalid colors gracefully', () => {
        const contrast = calculateContrast('invalid', '#FFFFFF');
        expect(contrast).toBe(0);
      });
    });

    describe('isWCAGCompliant', () => {
      it('should validate WCAG AA compliance correctly', () => {
        // High contrast - should pass
        expect(isWCAGCompliant('#000000', '#FFFFFF', 'AA', 'normal')).toBe(true);
        
        // Low contrast - should fail
        expect(isWCAGCompliant('#888888', '#999999', 'AA', 'normal')).toBe(false);
        
        // Large text has lower requirements
        expect(isWCAGCompliant('#666666', '#FFFFFF', 'AA', 'large')).toBe(true);
      });

      it('should validate WCAG AAA compliance correctly', () => {
        // High contrast - should pass AAA
        expect(isWCAGCompliant('#000000', '#FFFFFF', 'AAA', 'normal')).toBe(true);
        
        // Medium contrast - might pass AA but fail AAA
        expect(isWCAGCompliant('#555555', '#FFFFFF', 'AAA', 'normal')).toBe(false);
      });
    });

    describe('validateCustomCSS', () => {
      it('should detect hardcoded colors', () => {
        const css = `
          .test {
            color: #FF0000;
            background: #00FF00;
          }
        `;

        const result = validateCustomCSS(css);
        expect(result.issues.length).toBeGreaterThan(0);
        expect(result.issues.some(issue => issue.message.includes('#FF0000'))).toBe(true);
      });

      it('should detect !important usage', () => {
        const css = `
          .test {
            color: red !important;
          }
        `;

        const result = validateCustomCSS(css);
        expect(result.issues.some(issue => issue.message.includes('!important'))).toBe(true);
      });

      it('should detect obsolete properties', () => {
        const css = `
          .test {
            filter: alpha(opacity=50);
          }
        `;

        const result = validateCustomCSS(css);
        expect(result.issues.some(issue => issue.severity === 'error')).toBe(true);
      });

      it('should pass valid CSS', () => {
        const css = `
          .test {
            color: hsl(var(--primary));
            background: hsl(var(--background));
          }
        `;

        const result = validateCustomCSS(css);
        expect(result.isValid).toBe(true);
        expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
      });
    });
  });

  describe('Component Validation', () => {
    it('should validate component compatibility', async () => {
      const validation = await (migrationManager as any).validateComponent('Button');
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('recommendations');
      expect(validation).toHaveProperty('compatibilityScore');
      expect(validation.compatibilityScore).toBeGreaterThanOrEqual(0);
      expect(validation.compatibilityScore).toBeLessThanOrEqual(100);
    });

    it('should cache validation results', async () => {
      const spy = vi.spyOn(migrationManager as any, 'checkForLegacyColors');
      
      // First call
      await (migrationManager as any).validateComponent('TestComponent');
      expect(spy).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await (migrationManager as any).validateComponent('TestComponent');
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Generation', () => {
    it('should generate legacy CSS correctly', () => {
      const css = (migrationManager as any).generateLegacyCSS();
      expect(css).toContain(':root');
      expect(css).toContain('--primary');
    });

    it('should generate hybrid CSS correctly', () => {
      const css = (migrationManager as any).generateHybridCSS();
      expect(css).toContain(':root');
      expect(css).toContain('.legacy-component');
    });

    it('should generate modern CSS correctly', () => {
      const css = (migrationManager as any).generateModernCSS();
      expect(css).toContain(':root');
      expect(css).toContain('--accent-orange');
      expect(css).toContain('--accent-cyan');
    });
  });

  describe('Performance Monitoring', () => {
    it('should track migration metrics', () => {
      const { MigrationPerformanceMonitor } = require('@/lib/migration/migration-utils');
      const monitor = new MigrationPerformanceMonitor();
      
      monitor.startMigration();
      monitor.recordComponent();
      monitor.recordWarning();
      monitor.recordError();
      monitor.endMigration();

      const metrics = monitor.getMetrics();
      expect(metrics.componentsAffected).toBe(1);
      expect(metrics.warningsFound).toBe(1);
      expect(metrics.errorsFound).toBe(1);
      expect(metrics.duration).toBeGreaterThan(0);
    });

    it('should generate migration report', () => {
      const { MigrationPerformanceMonitor } = require('@/lib/migration/migration-utils');
      const monitor = new MigrationPerformanceMonitor();
      
      monitor.startMigration();
      monitor.recordComponent();
      monitor.endMigration();

      const report = monitor.generateReport();
      expect(report).toContain('Relatório de Migração');
      expect(report).toContain('Componentes Afetados: 1');
    });
  });

  describe('Error Handling', () => {
    it('should handle rollback correctly', async () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        featureFlags: { newColorSystem: false },
        timestamp: Date.now(),
      }));

      await migrationManager.rollbackMigration();

      expect(windowMock.dispatchEvent).not.toHaveBeenCalled(); // No event if no backup
      
      const status = migrationManager.getStatus();
      expect(status.isActive).toBe(false);
    });

    it('should validate configuration before migration', async () => {
      const invalidConfig: Partial<MigrationConfig> = {
        rolloutPercentage: 150, // Invalid percentage
        validationLevel: 'invalid' as any,
      };

      // Should handle invalid config gracefully
      await expect(migrationManager.startMigration(invalidConfig)).resolves.not.toThrow();
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full migration cycle', async () => {
    const config: Partial<MigrationConfig> = {
      enabledFeatures: {
        newColorSystem: true,
        modernComponents: true,
      },
      rolloutPercentage: 100,
      fallbackMode: 'modern',
      validationLevel: 'moderate',
    };

    // Mock all internal methods to succeed
    vi.spyOn(migrationManager as any, 'prepareMigration').mockResolvedValue(undefined);
    vi.spyOn(migrationManager as any, 'executeRollout').mockResolvedValue(undefined);
    vi.spyOn(migrationManager as any, 'validateMigration').mockResolvedValue(undefined);
    vi.spyOn(migrationManager as any, 'completeMigration').mockResolvedValue(undefined);

    await migrationManager.startMigration(config);

    const finalStatus = migrationManager.getStatus();
    expect(finalStatus.currentPhase).toBe('completion');
    expect(finalStatus.progress).toBe(100);
    expect(finalStatus.isActive).toBe(false);
  });

  it('should handle partial migration and recovery', async () => {
    const config: Partial<MigrationConfig> = {
      enabledFeatures: { newColorSystem: true },
      rolloutPercentage: 50,
    };

    // Mock failure during rollout
    vi.spyOn(migrationManager as any, 'prepareMigration').mockResolvedValue(undefined);
    vi.spyOn(migrationManager as any, 'executeRollout').mockRejectedValue(new Error('Rollout failed'));
    vi.spyOn(migrationManager as any, 'rollbackMigration').mockResolvedValue(undefined);

    await migrationManager.startMigration(config);

    const status = migrationManager.getStatus();
    expect(status.errors.length).toBeGreaterThan(0);
    expect(status.isActive).toBe(false);
  });
});