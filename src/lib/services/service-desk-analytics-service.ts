import {
  ServiceDeskAnalytics,
  SystemMetrics,
  UsageMetrics,
  PerformanceMetrics,
  UserBehaviorMetrics,
  BusinessMetrics,
  ErrorMetrics,
  AnalyticsEvent,
  EventType,
  EventCategory,
  AnalyticsConfig,
  MemoryUsage,
  ResponseTimeMetrics,
  IncidentRecord,
  IncidentType,
  IncidentSeverity
} from '@/lib/types/service-desk-analytics';

export class ServiceDeskAnalyticsService {
  private static readonly STORAGE_KEY = 'service-desk-analytics';
  private static readonly DB_NAME = 'ServiceDeskAnalyticsDB';
  private static readonly DB_VERSION = 1;
  private static readonly EVENTS_STORE = 'events';
  private static readonly METRICS_STORE = 'metrics';
  
  private db: IDBDatabase | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private metricsCache: ServiceDeskAnalytics | null = null;
  private config: AnalyticsConfig;
  private sessionId: string;
  private startTime: number;
  private performanceObserver: PerformanceObserver | null = null;
  private memoryMonitorInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      enabled: true,
      samplingRate: 100, // Collect 100% of events by default
      retentionPeriod: 30, // Keep data for 30 days
      privacySettings: {
        anonymizeUsers: true,
        excludePersonalData: true,
        dataEncryption: false,
        consentRequired: false
      },
      alertThresholds: {
        performanceThreshold: 1000, // 1 second
        errorRateThreshold: 5, // 5%
        memoryUsageThreshold: 80, // 80%
        uptimeThreshold: 99 // 99%
      },
      reportingSchedule: {
        dailyReports: false,
        weeklyReports: true,
        monthlyReports: true,
        customSchedule: []
      },
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();

    if (this.config.enabled) {
      this.initialize();
    }
  }

  /**
   * Initialize analytics service
   */
  private async initialize(): Promise<void> {
    try {
      await this.initDB();
      this.startPerformanceMonitoring();
      this.startMemoryMonitoring();
      this.setupEventListeners();
      
      // Track session start
      this.trackEvent({
        type: EventType.SYSTEM_EVENT,
        category: EventCategory.SYSTEM_PERFORMANCE,
        action: 'session_start',
        properties: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to initialize analytics service:', error);
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(ServiceDeskAnalyticsService.DB_NAME, ServiceDeskAnalyticsService.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Events store
        if (!db.objectStoreNames.contains(ServiceDeskAnalyticsService.EVENTS_STORE)) {
          const eventsStore = db.createObjectStore(ServiceDeskAnalyticsService.EVENTS_STORE, { keyPath: 'id' });
          eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
          eventsStore.createIndex('type', 'type', { unique: false });
          eventsStore.createIndex('category', 'category', { unique: false });
          eventsStore.createIndex('sessionId', 'sessionId', { unique: false });
        }
        
        // Metrics store
        if (!db.objectStoreNames.contains(ServiceDeskAnalyticsService.METRICS_STORE)) {
          const metricsStore = db.createObjectStore(ServiceDeskAnalyticsService.METRICS_STORE, { keyPath: 'date' });
        }
      };
    });
  }  /**
 
  * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track analytics event
   */
  trackEvent(eventData: Partial<AnalyticsEvent>): void {
    if (!this.config.enabled) return;

    // Apply sampling rate
    if (Math.random() * 100 > this.config.samplingRate) return;

    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      sessionId: this.sessionId,
      ...eventData
    } as AnalyticsEvent;

    // Add to queue
    this.eventQueue.push(event);

    // Flush queue if it gets too large
    if (this.eventQueue.length >= 100) {
      this.flushEvents();
    }
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, label?: string, value?: number, properties?: Record<string, any>): void {
    this.trackEvent({
      type: EventType.USER_ACTION,
      category: EventCategory.USER_INTERACTION,
      action,
      label,
      value,
      properties
    });
  }

  /**
   * Track navigation event
   */
  trackNavigation(fromTab: string, toTab: string, duration?: number): void {
    this.trackEvent({
      type: EventType.USER_ACTION,
      category: EventCategory.NAVIGATION,
      action: 'tab_change',
      label: `${fromTab}_to_${toTab}`,
      value: duration,
      properties: {
        fromTab,
        toTab,
        duration
      }
    });
  }

  /**
   * Track calculation event
   */
  trackCalculation(calculationType: string, duration: number, success: boolean, properties?: Record<string, any>): void {
    this.trackEvent({
      type: EventType.SYSTEM_EVENT,
      category: EventCategory.CALCULATION,
      action: success ? 'calculation_success' : 'calculation_error',
      label: calculationType,
      value: duration,
      properties: {
        calculationType,
        duration,
        success,
        ...properties
      }
    });
  }

  /**
   * Track validation event
   */
  trackValidation(validationType: string, result: boolean, errors?: number, warnings?: number): void {
    this.trackEvent({
      type: EventType.SYSTEM_EVENT,
      category: EventCategory.VALIDATION,
      action: result ? 'validation_success' : 'validation_failure',
      label: validationType,
      properties: {
        validationType,
        result,
        errors: errors || 0,
        warnings: warnings || 0
      }
    });
  }

  /**
   * Track error event
   */
  trackError(error: Error | null, context?: string, severity?: IncidentSeverity): void {
    const safeError = error || new Error('Unknown error');
    this.trackEvent({
      type: EventType.ERROR_EVENT,
      category: EventCategory.ERROR,
      action: 'error_occurred',
      label: safeError.name,
      properties: {
        errorName: safeError.name,
        errorMessage: safeError.message,
        errorStack: safeError.stack,
        context,
        severity: severity || IncidentSeverity.MEDIUM
      }
    });
  }

  /**
   * Track performance event
   */
  trackPerformance(operation: string, duration: number, success: boolean): void {
    this.trackEvent({
      type: EventType.PERFORMANCE_EVENT,
      category: EventCategory.SYSTEM_PERFORMANCE,
      action: 'performance_measurement',
      label: operation,
      value: duration,
      properties: {
        operation,
        duration,
        success
      }
    });
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
            this.trackPerformance(entry.name, entry.duration, true);
          }
        });
      });

      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    this.memoryMonitorInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage: MemoryUsage = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
          peak: memory.usedJSHeapSize, // Simplified - would need tracking for real peak
          trend: [] // Would be populated from historical data
        };

        this.trackEvent({
          type: EventType.SYSTEM_EVENT,
          category: EventCategory.SYSTEM_PERFORMANCE,
          action: 'memory_usage',
          value: memoryUsage.percentage,
          properties: { memoryUsage }
        });

        // Check for memory threshold alerts
        if (memoryUsage.percentage > this.config.alertThresholds.memoryUsageThreshold) {
          this.trackEvent({
            type: EventType.SYSTEM_EVENT,
            category: EventCategory.SYSTEM_PERFORMANCE,
            action: 'memory_threshold_exceeded',
            value: memoryUsage.percentage,
            properties: { 
              threshold: this.config.alertThresholds.memoryUsageThreshold,
              current: memoryUsage.percentage
            }
          });
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent({
        type: EventType.USER_ACTION,
        category: EventCategory.USER_INTERACTION,
        action: document.hidden ? 'page_hidden' : 'page_visible'
      });
    });

    // Track unload events
    window.addEventListener('beforeunload', () => {
      this.trackEvent({
        type: EventType.SYSTEM_EVENT,
        category: EventCategory.SYSTEM_PERFORMANCE,
        action: 'session_end',
        value: Date.now() - this.startTime,
        properties: {
          sessionDuration: Date.now() - this.startTime
        }
      });
      this.flushEvents();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error, 'global_error_handler', IncidentSeverity.HIGH);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), 'unhandled_promise_rejection', IncidentSeverity.MEDIUM);
    });
  }

  /**
   * Flush events to storage
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const db = await this.initDB();
      const transaction = db.transaction([ServiceDeskAnalyticsService.EVENTS_STORE], 'readwrite');
      const store = transaction.objectStore(ServiceDeskAnalyticsService.EVENTS_STORE);

      const events = [...this.eventQueue];
      this.eventQueue = [];

      for (const event of events) {
        store.add(event);
      }

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to flush events:', error);
      // Re-add events to queue if flush failed
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<ServiceDeskAnalytics> {
    try {
      const events = await this.getEvents(startDate, endDate);
      return this.processEventsToMetrics(events);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get events from storage
   */
  private async getEvents(startDate?: Date, endDate?: Date): Promise<AnalyticsEvent[]> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ServiceDeskAnalyticsService.EVENTS_STORE], 'readonly');
      const store = transaction.objectStore(ServiceDeskAnalyticsService.EVENTS_STORE);
      const index = store.index('timestamp');
      
      let range: IDBKeyRange | undefined;
      if (startDate && endDate) {
        range = IDBKeyRange.bound(startDate, endDate);
      } else if (startDate) {
        range = IDBKeyRange.lowerBound(startDate);
      } else if (endDate) {
        range = IDBKeyRange.upperBound(endDate);
      }

      const request = range ? index.getAll(range) : store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Process events into metrics
   */
  private processEventsToMetrics(events: AnalyticsEvent[]): ServiceDeskAnalytics {
    const systemMetrics = this.calculateSystemMetrics(events);
    const usageMetrics = this.calculateUsageMetrics(events);
    const performanceMetrics = this.calculatePerformanceMetrics(events);
    const userBehaviorMetrics = this.calculateUserBehaviorMetrics(events);
    const businessMetrics = this.calculateBusinessMetrics(events);
    const errorMetrics = this.calculateErrorMetrics(events);

    return {
      systemMetrics,
      usageMetrics,
      performanceMetrics,
      userBehaviorMetrics,
      businessMetrics,
      errorMetrics
    };
  }

  /**
   * Calculate system metrics
   */
  private calculateSystemMetrics(events: AnalyticsEvent[]): SystemMetrics {
    const performanceEvents = events.filter(e => e.category === EventCategory.SYSTEM_PERFORMANCE);
    const sessionEvents = events.filter(e => e.action === 'session_start' || e.action === 'session_end');
    
    const uptime = Date.now() - this.startTime;
    const memoryEvents = performanceEvents.filter(e => e.action === 'memory_usage');
    const responseTimeEvents = performanceEvents.filter(e => e.action === 'performance_measurement');

    return {
      uptime,
      memoryUsage: this.calculateMemoryUsage(memoryEvents),
      responseTime: this.calculateResponseTimeMetrics(responseTimeEvents),
      throughput: this.calculateThroughputMetrics(events),
      availability: this.calculateAvailabilityMetrics(events),
      lastUpdated: new Date()
    };
  }

  /**
   * Calculate memory usage metrics
   */
  private calculateMemoryUsage(memoryEvents: AnalyticsEvent[]): MemoryUsage {
    if (memoryEvents.length === 0) {
      return {
        used: 0,
        total: 0,
        percentage: 0,
        peak: 0,
        trend: []
      };
    }

    const latestEvent = memoryEvents[memoryEvents.length - 1];
    const memoryData = latestEvent.properties?.memoryUsage;

    return memoryData || {
      used: 0,
      total: 0,
      percentage: 0,
      peak: 0,
      trend: []
    };
  }

  /**
   * Calculate response time metrics
   */
  private calculateResponseTimeMetrics(responseTimeEvents: AnalyticsEvent[]): ResponseTimeMetrics {
    if (responseTimeEvents.length === 0) {
      return {
        average: 0,
        median: 0,
        p95: 0,
        p99: 0,
        min: 0,
        max: 0,
        samples: []
      };
    }

    const durations = responseTimeEvents.map(e => e.value || 0).sort((a, b) => a - b);
    const samples = responseTimeEvents.map(e => ({
      timestamp: e.timestamp,
      operation: e.label || 'unknown',
      duration: e.value || 0,
      success: e.properties?.success || false
    }));

    return {
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      median: durations[Math.floor(durations.length / 2)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
      min: durations[0],
      max: durations[durations.length - 1],
      samples
    };
  }

  /**
   * Calculate other metrics (simplified implementations)
   */
  private calculateThroughputMetrics(events: AnalyticsEvent[]): any {
    const timeWindow = 1000; // 1 second
    const currentTime = Date.now();
    const recentEvents = events.filter(e => 
      currentTime - e.timestamp.getTime() < timeWindow
    );

    return {
      requestsPerSecond: recentEvents.length,
      calculationsPerSecond: recentEvents.filter(e => e.category === EventCategory.CALCULATION).length,
      dataOperationsPerSecond: recentEvents.filter(e => e.category === EventCategory.DATA_OPERATION).length,
      peakThroughput: recentEvents.length, // Simplified
      averageThroughput: recentEvents.length // Simplified
    };
  }

  private calculateAvailabilityMetrics(events: AnalyticsEvent[]): any {
    const errorEvents = events.filter(e => e.type === EventType.ERROR_EVENT);
    const totalEvents = events.length;
    const errorRate = totalEvents > 0 ? (errorEvents.length / totalEvents) * 100 : 0;

    return {
      uptime: Math.max(0, 100 - errorRate),
      downtime: 0, // Would need more sophisticated tracking
      incidents: [], // Would need incident tracking
      mtbf: 0, // Mean Time Between Failures
      mttr: 0  // Mean Time To Recovery
    };
  }

  private calculateUsageMetrics(events: AnalyticsEvent[]): UsageMetrics {
    const sessions = new Set(events.map(e => e.sessionId));
    const navigationEvents = events.filter(e => e.category === EventCategory.NAVIGATION);
    
    return {
      activeUsers: 1, // Simplified - would need user tracking
      totalSessions: sessions.size,
      averageSessionDuration: this.calculateAverageSessionDuration(events),
      tabUsage: this.calculateTabUsage(navigationEvents),
      featureUsage: this.calculateFeatureUsage(events),
      templateUsage: this.calculateTemplateUsage(events),
      exportUsage: this.calculateExportUsage(events),
      timeDistribution: this.calculateTimeDistribution(events)
    };
  }

  private calculateAverageSessionDuration(events: AnalyticsEvent[]): number {
    const sessionStarts = events.filter(e => e.action === 'session_start');
    const sessionEnds = events.filter(e => e.action === 'session_end');
    
    if (sessionEnds.length === 0) {
      return Date.now() - this.startTime; // Current session duration
    }

    const durations = sessionEnds.map(e => e.value || 0);
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }

  private calculateTabUsage(navigationEvents: AnalyticsEvent[]): any {
    const tabUsage: any = {};
    
    navigationEvents.forEach(event => {
      const toTab = event.properties?.toTab;
      if (toTab) {
        if (!tabUsage[toTab]) {
          tabUsage[toTab] = {
            visits: 0,
            timeSpent: 0,
            completionRate: 0,
            errorRate: 0,
            lastAccessed: event.timestamp
          };
        }
        tabUsage[toTab].visits++;
        tabUsage[toTab].timeSpent += event.value || 0;
        tabUsage[toTab].lastAccessed = event.timestamp;
      }
    });

    return tabUsage;
  }

  private calculateFeatureUsage(events: AnalyticsEvent[]): any {
    return {
      calculations: this.calculateCalculationUsage(events),
      validations: this.calculateValidationUsage(events),
      dataOperations: this.calculateDataOperationUsage(events),
      navigation: this.calculateNavigationUsage(events)
    };
  }

  private calculateCalculationUsage(events: AnalyticsEvent[]): any {
    const calculationEvents = events.filter(e => e.category === EventCategory.CALCULATION);
    const successful = calculationEvents.filter(e => e.properties?.success);
    const failed = calculationEvents.filter(e => !e.properties?.success);

    return {
      totalCalculations: calculationEvents.length,
      calculationsByType: this.groupByLabel(calculationEvents),
      averageCalculationTime: this.calculateAverageValue(calculationEvents),
      failedCalculations: failed.length,
      cacheHitRate: 0 // Would need cache tracking
    };
  }

  private calculateValidationUsage(events: AnalyticsEvent[]): any {
    const validationEvents = events.filter(e => e.category === EventCategory.VALIDATION);
    const successful = validationEvents.filter(e => e.properties?.result);
    const failed = validationEvents.filter(e => !e.properties?.result);

    return {
      totalValidations: validationEvents.length,
      validationsByType: this.groupByLabel(validationEvents),
      averageValidationTime: this.calculateAverageValue(validationEvents),
      failedValidations: failed.length,
      warningsGenerated: validationEvents.reduce((sum, e) => sum + (e.properties?.warnings || 0), 0)
    };
  }

  private calculateDataOperationUsage(events: AnalyticsEvent[]): any {
    const dataEvents = events.filter(e => e.category === EventCategory.DATA_OPERATION);
    
    return {
      saves: dataEvents.filter(e => e.action.includes('save')).length,
      loads: dataEvents.filter(e => e.action.includes('load')).length,
      exports: dataEvents.filter(e => e.action.includes('export')).length,
      imports: dataEvents.filter(e => e.action.includes('import')).length,
      backups: dataEvents.filter(e => e.action.includes('backup')).length,
      failures: dataEvents.filter(e => e.action.includes('error')).length
    };
  }

  private calculateNavigationUsage(events: AnalyticsEvent[]): any {
    const navigationEvents = events.filter(e => e.category === EventCategory.NAVIGATION);
    
    return {
      tabSwitches: navigationEvents.filter(e => e.action === 'tab_change').length,
      backNavigations: navigationEvents.filter(e => e.action === 'back').length,
      forwardNavigations: navigationEvents.filter(e => e.action === 'forward').length,
      directNavigations: navigationEvents.filter(e => e.action === 'direct').length,
      validationBlocks: navigationEvents.filter(e => e.action === 'validation_block').length
    };
  }

  private calculateTemplateUsage(events: AnalyticsEvent[]): any {
    const templateEvents = events.filter(e => e.category === EventCategory.TEMPLATE_OPERATION);
    
    return {
      templatesApplied: templateEvents.filter(e => e.action === 'template_applied').length,
      templatesCreated: templateEvents.filter(e => e.action === 'template_created').length,
      templatesShared: templateEvents.filter(e => e.action === 'template_shared').length,
      mostUsedTemplates: [], // Would need template tracking
      templateSuccessRate: 0 // Would need success tracking
    };
  }

  private calculateExportUsage(events: AnalyticsEvent[]): any {
    const exportEvents = events.filter(e => e.category === EventCategory.EXPORT_OPERATION);
    
    return {
      totalExports: exportEvents.length,
      exportsByFormat: this.groupByProperty(exportEvents, 'format'),
      exportsByType: this.groupByProperty(exportEvents, 'type'),
      averageExportTime: this.calculateAverageValue(exportEvents),
      failedExports: exportEvents.filter(e => e.action.includes('error')).length
    };
  }

  private calculateTimeDistribution(events: AnalyticsEvent[]): any {
    const hourlyUsage: Record<number, number> = {};
    const dailyUsage: Record<string, number> = {};

    events.forEach(event => {
      const hour = event.timestamp.getHours();
      const day = event.timestamp.toDateString();

      hourlyUsage[hour] = (hourlyUsage[hour] || 0) + 1;
      dailyUsage[day] = (dailyUsage[day] || 0) + 1;
    });

    return {
      hourlyUsage,
      dailyUsage,
      weeklyUsage: {}, // Would need week calculation
      monthlyUsage: {} // Would need month calculation
    };
  }

  // Simplified implementations for other metric calculations
  private calculatePerformanceMetrics(events: AnalyticsEvent[]): PerformanceMetrics {
    return {
      renderingMetrics: { averageRenderTime: 0, slowRenders: 0, totalRenders: 0, componentMetrics: [] },
      calculationMetrics: { averageCalculationTime: 0, slowCalculations: 0, totalCalculations: 0, calculationsByComplexity: {} },
      dataMetrics: { averageLoadTime: 0, averageSaveTime: 0, cacheHitRate: 0, cacheMissRate: 0, dataSize: { averageProjectSize: 0, largestProject: 0, totalDataSize: 0, compressionRatio: 0 } },
      networkMetrics: { averageLatency: 0, requestCount: 0, failedRequests: 0, bandwidth: { upload: 0, download: 0, peak: 0, average: 0 } },
      resourceMetrics: { cpuUsage: 0, memoryUsage: 0, diskUsage: 0, networkUsage: 0, batteryImpact: { cpuImpact: 0, networkImpact: 0, displayImpact: 0, totalImpact: 0 } }
    };
  }

  private calculateUserBehaviorMetrics(events: AnalyticsEvent[]): UserBehaviorMetrics {
    return {
      sessionMetrics: { averageSessionDuration: 0, sessionsPerUser: 0, bounceRate: 0, returnRate: 0, sessionDepth: { averageTabsVisited: 0, averageActionsPerSession: 0, completionRate: 0, abandonmentPoints: [] } },
      interactionMetrics: { clickMetrics: { totalClicks: 0, clicksByElement: {}, clickHeatmap: [], averageClicksPerSession: 0 }, inputMetrics: { totalInputs: 0, inputsByField: {}, averageInputTime: 0, correctionRate: 0 }, navigationMetrics: { tabSwitchPatterns: [], backButtonUsage: 0, breadcrumbUsage: 0, shortcutUsage: {} }, helpUsage: { tooltipViews: 0, helpDocumentViews: 0, searchQueries: [], supportRequests: 0 } },
      workflowMetrics: { commonWorkflows: [], workflowEfficiency: { averageTimeToComplete: 0, stepsToCompletion: 0, reworkRate: 0, automationRate: 0 }, bottlenecks: [], optimizationOpportunities: [] },
      errorPatterns: { commonErrors: [], errorFrequency: {}, errorResolution: { averageResolutionTime: 0, selfResolutionRate: 0, supportResolutionRate: 0, unresolved: 0 }, userErrorBehavior: { retryAttempts: 0, helpSeeking: 0, abandonment: 0, workarounds: 0 } },
      learningMetrics: { learningCurve: [], expertiseProgression: [], knowledgeRetention: { returnUserPerformance: 0, skillDecay: { decayRate: 0, retentionPeriod: 0, refreshTrainingNeeded: 0 }, knowledgeTransfer: { documentationUsage: 0, peerLearning: 0, formalTraining: 0, selfDiscovery: 0 } }, trainingEffectiveness: { completionRate: 0, knowledgeRetention: 0, performanceImprovement: 0, userSatisfaction: 0 } }
    };
  }

  private calculateBusinessMetrics(events: AnalyticsEvent[]): BusinessMetrics {
    return {
      productivityMetrics: { projectsCompleted: 0, averageProjectDuration: 0, timeToValue: 0, automationSavings: { timesSaved: 0, costSavings: 0, errorReduction: 0, processImprovement: 0 }, efficiencyGains: { beforeAfterComparison: { timeBefore: 0, timeAfter: 0, improvement: 0, confidenceLevel: 0 }, benchmarkComparison: { industryBenchmark: 0, ourPerformance: 0, percentile: 0, gapAnalysis: { performanceGap: 0, improvementPotential: 0, actionItems: [] } }, trendAnalysis: [] } },
      qualityMetrics: { accuracyMetrics: { calculationAccuracy: 0, dataAccuracy: 0, predictionAccuracy: 0, errorRate: 0 }, consistencyMetrics: { crossTabConsistency: 0, temporalConsistency: 0, userConsistency: 0, systemConsistency: 0 }, completenessMetrics: { dataCompleteness: 0, workflowCompleteness: 0, documentationCompleteness: 0 }, validationMetrics: { validationCoverage: 0, validationAccuracy: 0, falsePositives: 0, falseNegatives: 0 } },
      costMetrics: { developmentCosts: { initialDevelopment: 0, featureAdditions: 0, bugFixes: 0, refactoring: 0 }, operationalCosts: { infrastructure: 0, support: 0, training: 0, licensing: 0 }, maintenanceCosts: { preventiveMaintenance: 0, correctiveMaintenance: 0, updates: 0, monitoring: 0 }, totalCostOfOwnership: { totalCost: 0, costPerUser: 0, costPerProject: 0, costTrend: [] } },
      valueMetrics: { businessValue: { revenueImpact: 0, costSavings: 0, timeToMarket: 0, marketShare: 0 }, userValue: { userSatisfaction: 0, taskCompletion: 0, userRetention: 0, recommendationScore: 0 }, strategicValue: { competitiveAdvantage: 0, innovationIndex: 0, scalabilityIndex: 0, futureReadiness: 0 }, roi: { roi: 0, paybackPeriod: 0, npv: 0, irr: 0 } },
      competitiveMetrics: { marketPosition: { marketShare: 0, ranking: 0, brandRecognition: 0, customerLoyalty: 0 }, featureComparison: { featureParity: 0, uniqueFeatures: 0, featureQuality: 0, innovationRate: 0 }, performanceComparison: { speedComparison: 0, reliabilityComparison: 0, usabilityComparison: 0, overallComparison: 0 }, userPreference: { preferenceScore: 0, switchingRate: 0, churnRate: 0, satisfactionGap: 0 } }
    };
  }

  private calculateErrorMetrics(events: AnalyticsEvent[]): ErrorMetrics {
    const errorEvents = events.filter(e => e.type === EventType.ERROR_EVENT);
    
    return {
      errorFrequency: {
        totalErrors: errorEvents.length,
        errorsByType: this.groupByProperty(errorEvents, 'errorName'),
        errorsByComponent: this.groupByProperty(errorEvents, 'context'),
        errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0,
        errorTrend: []
      },
      errorSeverity: {
        criticalErrors: errorEvents.filter(e => e.properties?.severity === IncidentSeverity.CRITICAL).length,
        highSeverityErrors: errorEvents.filter(e => e.properties?.severity === IncidentSeverity.HIGH).length,
        mediumSeverityErrors: errorEvents.filter(e => e.properties?.severity === IncidentSeverity.MEDIUM).length,
        lowSeverityErrors: errorEvents.filter(e => e.properties?.severity === IncidentSeverity.LOW).length,
        severityDistribution: this.groupBySeverity(errorEvents)
      },
      errorResolution: {
        averageResolutionTime: 0,
        selfResolutionRate: 0,
        supportResolutionRate: 0,
        unresolved: errorEvents.length
      },
      errorPrevention: {
        preventedErrors: 0,
        validationEffectiveness: 0,
        earlyDetection: 0,
        proactiveResolution: 0
      }
    };
  }

  // Helper methods
  private groupByLabel(events: AnalyticsEvent[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    events.forEach(event => {
      const label = event.label || 'unknown';
      grouped[label] = (grouped[label] || 0) + 1;
    });
    return grouped;
  }

  private groupByProperty(events: AnalyticsEvent[], property: string): Record<string, number> {
    const grouped: Record<string, number> = {};
    events.forEach(event => {
      const value = event.properties?.[property] || 'unknown';
      grouped[value] = (grouped[value] || 0) + 1;
    });
    return grouped;
  }

  private groupBySeverity(events: AnalyticsEvent[]): Record<IncidentSeverity, number> {
    const grouped: Record<IncidentSeverity, number> = {
      [IncidentSeverity.LOW]: 0,
      [IncidentSeverity.MEDIUM]: 0,
      [IncidentSeverity.HIGH]: 0,
      [IncidentSeverity.CRITICAL]: 0
    };
    
    events.forEach(event => {
      const severity = event.properties?.severity || IncidentSeverity.MEDIUM;
      if (severity in grouped) {
        grouped[severity as IncidentSeverity]++;
      }
    });
    
    return grouped;
  }

  private calculateAverageValue(events: AnalyticsEvent[]): number {
    const values = events.map(e => e.value || 0).filter(v => v > 0);
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  }

  private getEmptyAnalytics(): ServiceDeskAnalytics {
    return {
      systemMetrics: {
        uptime: 0,
        memoryUsage: { used: 0, total: 0, percentage: 0, peak: 0, trend: [] },
        responseTime: { average: 0, median: 0, p95: 0, p99: 0, min: 0, max: 0, samples: [] },
        throughput: { requestsPerSecond: 0, calculationsPerSecond: 0, dataOperationsPerSecond: 0, peakThroughput: 0, averageThroughput: 0 },
        availability: { uptime: 0, downtime: 0, incidents: [], mtbf: 0, mttr: 0 },
        lastUpdated: new Date()
      },
      usageMetrics: {
        activeUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        tabUsage: {},
        featureUsage: { calculations: { totalCalculations: 0, calculationsByType: {}, averageCalculationTime: 0, failedCalculations: 0, cacheHitRate: 0 }, validations: { totalValidations: 0, validationsByType: {}, averageValidationTime: 0, failedValidations: 0, warningsGenerated: 0 }, dataOperations: { saves: 0, loads: 0, exports: 0, imports: 0, backups: 0, failures: 0 }, navigation: { tabSwitches: 0, backNavigations: 0, forwardNavigations: 0, directNavigations: 0, validationBlocks: 0 } },
        templateUsage: { templatesApplied: 0, templatesCreated: 0, templatesShared: 0, mostUsedTemplates: [], templateSuccessRate: 0 },
        exportUsage: { totalExports: 0, exportsByFormat: {}, exportsByType: {}, averageExportTime: 0, failedExports: 0 },
        timeDistribution: { hourlyUsage: {}, dailyUsage: {}, weeklyUsage: {}, monthlyUsage: {} }
      },
      performanceMetrics: this.calculatePerformanceMetrics([]),
      userBehaviorMetrics: this.calculateUserBehaviorMetrics([]),
      businessMetrics: this.calculateBusinessMetrics([]),
      errorMetrics: this.calculateErrorMetrics([])
    };
  }

  /**
   * Get performance alerts
   */
  async getPerformanceAlerts(): Promise<any[]> {
    const analytics = await this.getAnalytics();
    const alerts: any[] = [];

    // Memory usage alert
    if (analytics.systemMetrics.memoryUsage.percentage > this.config.alertThresholds.memoryUsageThreshold) {
      alerts.push({
        type: 'memory_usage',
        severity: 'warning',
        message: `Memory usage is ${analytics.systemMetrics.memoryUsage.percentage.toFixed(1)}% (threshold: ${this.config.alertThresholds.memoryUsageThreshold}%)`,
        value: analytics.systemMetrics.memoryUsage.percentage,
        threshold: this.config.alertThresholds.memoryUsageThreshold
      });
    }

    // Response time alert
    if (analytics.systemMetrics.responseTime.average > this.config.alertThresholds.performanceThreshold) {
      alerts.push({
        type: 'response_time',
        severity: 'warning',
        message: `Average response time is ${analytics.systemMetrics.responseTime.average.toFixed(0)}ms (threshold: ${this.config.alertThresholds.performanceThreshold}ms)`,
        value: analytics.systemMetrics.responseTime.average,
        threshold: this.config.alertThresholds.performanceThreshold
      });
    }

    // Error rate alert
    if (analytics.errorMetrics.errorFrequency.errorRate > this.config.alertThresholds.errorRateThreshold) {
      alerts.push({
        type: 'error_rate',
        severity: 'error',
        message: `Error rate is ${analytics.errorMetrics.errorFrequency.errorRate.toFixed(1)}% (threshold: ${this.config.alertThresholds.errorRateThreshold}%)`,
        value: analytics.errorMetrics.errorFrequency.errorRate,
        threshold: this.config.alertThresholds.errorRateThreshold
      });
    }

    return alerts;
  }

  /**
   * Generate analytics report
   */
  async generateReport(startDate?: Date, endDate?: Date): Promise<any> {
    const analytics = await this.getAnalytics(startDate, endDate);
    const alerts = await this.getPerformanceAlerts();

    return {
      generatedAt: new Date(),
      period: {
        startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
        endDate: endDate || new Date()
      },
      analytics,
      alerts,
      summary: {
        totalEvents: (await this.getEvents(startDate, endDate)).length,
        uptime: analytics.systemMetrics.uptime,
        averageResponseTime: analytics.systemMetrics.responseTime.average,
        errorRate: analytics.errorMetrics.errorFrequency.errorRate,
        memoryUsage: analytics.systemMetrics.memoryUsage.percentage
      }
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    // Flush remaining events
    this.flushEvents();

    // Stop monitoring
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }

    // Close database
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}