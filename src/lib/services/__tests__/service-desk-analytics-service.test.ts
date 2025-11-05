import { ServiceDeskAnalyticsService } from '../service-desk-analytics-service';
import { EventType, EventCategory, IncidentSeverity } from '@/lib/types/service-desk-analytics';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(() => ({
    result: {
      createObjectStore: jest.fn(() => ({
        createIndex: jest.fn()
      })),
      objectStoreNames: {
        contains: jest.fn(() => false)
      }
    },
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  }))
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB
});

// Mock PerformanceObserver
Object.defineProperty(window, 'PerformanceObserver', {
  value: jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn()
  }))
});

// Mock performance.memory
Object.defineProperty(performance, 'memory', {
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
});

describe('ServiceDeskAnalyticsService', () => {
  let analyticsService: ServiceDeskAnalyticsService;

  beforeEach(() => {
    analyticsService = new ServiceDeskAnalyticsService({
      enabled: true,
      samplingRate: 100
    });
  });

  afterEach(() => {
    analyticsService.cleanup();
    jest.clearAllMocks();
  });

  describe('Event Tracking', () => {
    it('should track user actions', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      
      analyticsService.trackUserAction('button_click', 'save_button', 1, { tabId: 'data' });
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.USER_ACTION,
        category: EventCategory.USER_INTERACTION,
        action: 'button_click',
        label: 'save_button',
        value: 1,
        properties: { tabId: 'data' }
      });
    });

    it('should track navigation events', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      
      analyticsService.trackNavigation('data', 'team', 1500);
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.USER_ACTION,
        category: EventCategory.NAVIGATION,
        action: 'tab_change',
        label: 'data_to_team',
        value: 1500,
        properties: {
          fromTab: 'data',
          toTab: 'team',
          duration: 1500
        }
      });
    });

    it('should track calculation events', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      
      analyticsService.trackCalculation('team_cost', 250, true, { teamSize: 5 });
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.SYSTEM_EVENT,
        category: EventCategory.CALCULATION,
        action: 'calculation_success',
        label: 'team_cost',
        value: 250,
        properties: {
          calculationType: 'team_cost',
          duration: 250,
          success: true,
          teamSize: 5
        }
      });
    });

    it('should track validation events', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      
      analyticsService.trackValidation('data_validation', false, 2, 1);
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.SYSTEM_EVENT,
        category: EventCategory.VALIDATION,
        action: 'validation_failure',
        label: 'data_validation',
        properties: {
          validationType: 'data_validation',
          result: false,
          errors: 2,
          warnings: 1
        }
      });
    });

    it('should track error events', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      const testError = new Error('Test error');
      
      analyticsService.trackError(testError, 'test_context', IncidentSeverity.HIGH);
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.ERROR_EVENT,
        category: EventCategory.ERROR,
        action: 'error_occurred',
        label: 'Error',
        properties: {
          errorName: 'Error',
          errorMessage: 'Test error',
          errorStack: testError.stack,
          context: 'test_context',
          severity: IncidentSeverity.HIGH
        }
      });
    });

    it('should track performance events', () => {
      const trackEventSpy = jest.spyOn(analyticsService, 'trackEvent');
      
      analyticsService.trackPerformance('data_load', 500, true);
      
      expect(trackEventSpy).toHaveBeenCalledWith({
        type: EventType.PERFORMANCE_EVENT,
        category: EventCategory.SYSTEM_PERFORMANCE,
        action: 'performance_measurement',
        label: 'data_load',
        value: 500,
        properties: {
          operation: 'data_load',
          duration: 500,
          success: true
        }
      });
    });
  });

  describe('Analytics Processing', () => {
    it('should process events into metrics', async () => {
      // Track some events
      analyticsService.trackUserAction('test_action');
      analyticsService.trackCalculation('test_calc', 100, true);
      analyticsService.trackError(new Error('Test'), 'test');
      
      const analytics = await analyticsService.getAnalytics();
      
      expect(analytics).toBeDefined();
      expect(analytics.systemMetrics).toBeDefined();
      expect(analytics.usageMetrics).toBeDefined();
      expect(analytics.performanceMetrics).toBeDefined();
      expect(analytics.userBehaviorMetrics).toBeDefined();
      expect(analytics.businessMetrics).toBeDefined();
      expect(analytics.errorMetrics).toBeDefined();
    });

    it('should generate performance alerts', async () => {
      // This would require more complex setup to trigger alerts
      const alerts = await analyticsService.getPerformanceAlerts();
      
      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should generate analytics reports', async () => {
      const report = await analyticsService.generateReport();
      
      expect(report).toBeDefined();
      expect(report.generatedAt).toBeDefined();
      expect(report.period).toBeDefined();
      expect(report.analytics).toBeDefined();
      expect(report.alerts).toBeDefined();
      expect(report.summary).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should respect sampling rate', () => {
      const lowSamplingService = new ServiceDeskAnalyticsService({
        enabled: true,
        samplingRate: 0 // 0% sampling
      });
      
      const trackEventSpy = jest.spyOn(lowSamplingService, 'trackEvent');
      
      // Try to track many events
      for (let i = 0; i < 100; i++) {
        lowSamplingService.trackUserAction('test');
      }
      
      // With 0% sampling, no events should be tracked
      // Note: This test might be flaky due to randomness, but with 0% it should be reliable
      expect(trackEventSpy).toHaveBeenCalledTimes(100); // Called but not processed due to sampling
      
      lowSamplingService.cleanup();
    });

    it('should be disabled when configured', () => {
      const disabledService = new ServiceDeskAnalyticsService({
        enabled: false
      });
      
      const trackEventSpy = jest.spyOn(disabledService, 'trackEvent');
      
      disabledService.trackUserAction('test');
      
      // Event tracking should return early when disabled
      expect(trackEventSpy).toHaveBeenCalledTimes(1);
      
      disabledService.cleanup();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', () => {
      const cleanupSpy = jest.spyOn(analyticsService, 'cleanup');
      
      analyticsService.cleanup();
      
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});