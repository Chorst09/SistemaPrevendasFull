import { useEffect } from 'react';
import { serviceDeskMemoryManager } from './service-desk-memory-manager';

/**
 * Automatic data cleanup service for Service Desk system
 */
export class AutomaticDataCleanup {
  private static instance: AutomaticDataCleanup;
  private cleanupIntervals: Map<string, NodeJS.Timeout> = new Map();
  private dataAccessTracking: Map<string, number> = new Map();
  private cleanupCallbacks: Map<string, () => void> = new Map();
  private isRunning = false;
  
  // Cleanup thresholds
  private readonly UNUSED_DATA_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private readonly INACTIVE_DATA_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  private readonly MEMORY_THRESHOLD = 150 * 1024 * 1024; // 150MB
  private readonly CLEANUP_INTERVAL = 2 * 60 * 1000; // 2 minutes
  
  private constructor() {
    this.startAutomaticCleanup();
  }

  static getInstance(): AutomaticDataCleanup {
    if (!AutomaticDataCleanup.instance) {
      AutomaticDataCleanup.instance = new AutomaticDataCleanup();
    }
    return AutomaticDataCleanup.instance;
  }

  /**
   * Start automatic cleanup process
   */
  startAutomaticCleanup(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Main cleanup interval
    const mainCleanupInterval = setInterval(() => {
      this.performAutomaticCleanup();
    }, this.CLEANUP_INTERVAL);
    
    this.cleanupIntervals.set('main', mainCleanupInterval);
    
    // Memory monitoring interval
    const memoryMonitorInterval = setInterval(() => {
      this.monitorMemoryUsage();
    }, 30000); // Check every 30 seconds
    
    this.cleanupIntervals.set('memory-monitor', memoryMonitorInterval);
    
    console.log('Automatic data cleanup service started');
  }

  /**
   * Stop automatic cleanup process
   */
  stopAutomaticCleanup(): void {
    this.isRunning = false;
    
    this.cleanupIntervals.forEach((interval, key) => {
      clearInterval(interval);
    });
    
    this.cleanupIntervals.clear();
    console.log('Automatic data cleanup service stopped');
  }

  /**
   * Register data access for tracking
   */
  trackDataAccess(dataKey: string): void {
    this.dataAccessTracking.set(dataKey, Date.now());
  }

  /**
   * Register cleanup callback for specific data type
   */
  registerCleanupCallback(key: string, callback: () => void): void {
    this.cleanupCallbacks.set(key, callback);
  }

  /**
   * Unregister cleanup callback
   */
  unregisterCleanupCallback(key: string): void {
    this.cleanupCallbacks.delete(key);
  }

  /**
   * Perform automatic cleanup of unused data
   */
  private performAutomaticCleanup(): void {
    const now = Date.now();
    const memoryManager = serviceDeskMemoryManager;
    
    console.log('Performing automatic data cleanup...');
    
    // 1. Clean up unused tab data
    this.cleanupUnusedTabData(now);
    
    // 2. Clean up old calculations
    this.cleanupOldCalculations(now);
    
    // 3. Clean up inactive components
    this.cleanupInactiveComponents(now);
    
    // 4. Clean up large lists that haven't been accessed
    this.cleanupInactiveLists(now);
    
    // 5. Execute registered cleanup callbacks
    this.executeCleanupCallbacks();
    
    // 6. Force memory manager cleanup if needed
    const stats = memoryManager.getMemoryStats();
    if (stats.totalMemoryUsage > 100) {
      memoryManager.performMemoryCleanup();
    }
    
    // 7. Clean up old access tracking entries
    this.cleanupAccessTracking(now);
    
    console.log('Automatic data cleanup completed');
  }

  /**
   * Clean up unused tab data
   */
  private cleanupUnusedTabData(now: number): void {
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (key.startsWith('tab-') && now - lastAccess > this.UNUSED_DATA_THRESHOLD) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
      // The memory manager will handle the actual cleanup
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} unused tab data entries`);
    }
  }

  /**
   * Clean up old calculations
   */
  private cleanupOldCalculations(now: number): void {
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (key.startsWith('calc-') && now - lastAccess > this.UNUSED_DATA_THRESHOLD) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old calculation entries`);
    }
  }

  /**
   * Clean up inactive components
   */
  private cleanupInactiveComponents(now: number): void {
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (key.startsWith('component-') && now - lastAccess > this.INACTIVE_DATA_THRESHOLD) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} inactive component entries`);
    }
  }

  /**
   * Clean up inactive lists
   */
  private cleanupInactiveLists(now: number): void {
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (key.startsWith('list-') && now - lastAccess > this.INACTIVE_DATA_THRESHOLD) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
      const listId = key.replace('list-', '');
      serviceDeskMemoryManager.removeListOptimizer(listId);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} inactive list optimizers`);
    }
  }

  /**
   * Execute registered cleanup callbacks
   */
  private executeCleanupCallbacks(): void {
    let callbacksExecuted = 0;
    
    this.cleanupCallbacks.forEach((callback, key) => {
      try {
        callback();
        callbacksExecuted++;
      } catch (error) {
        console.warn(`Cleanup callback failed for ${key}:`, error);
      }
    });
    
    if (callbacksExecuted > 0) {
      console.log(`Executed ${callbacksExecuted} cleanup callbacks`);
    }
  }

  /**
   * Clean up old access tracking entries
   */
  private cleanupAccessTracking(now: number): void {
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (now - lastAccess > this.INACTIVE_DATA_THRESHOLD * 2) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
    });
    
    if (keysToRemove.length > 0) {
      console.log(`Cleaned up ${keysToRemove.length} old access tracking entries`);
    }
  }

  /**
   * Monitor memory usage and trigger cleanup if needed
   */
  private monitorMemoryUsage(): void {
    if (typeof window === 'undefined') return;

    try {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo && memoryInfo.usedJSHeapSize > this.MEMORY_THRESHOLD) {
        console.log(`Memory threshold exceeded (${Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)}MB), triggering immediate cleanup`);
        this.performImmediateCleanup();
      }
    } catch (error) {
      // Memory API not available
    }
  }

  /**
   * Perform immediate cleanup when memory threshold is exceeded
   */
  private performImmediateCleanup(): void {
    const memoryManager = serviceDeskMemoryManager;
    
    // Force cleanup of all caches
    memoryManager.performMemoryCleanup();
    
    // Execute all cleanup callbacks immediately
    this.executeCleanupCallbacks();
    
    // Clear old access tracking
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    this.dataAccessTracking.forEach((lastAccess, key) => {
      if (now - lastAccess > this.UNUSED_DATA_THRESHOLD) {
        keysToRemove.push(key);
      }
    });
    
    keysToRemove.forEach(key => {
      this.dataAccessTracking.delete(key);
    });
    
    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    console.log('Immediate cleanup completed');
  }

  /**
   * Get cleanup statistics
   */
  getCleanupStats(): {
    isRunning: boolean;
    trackedDataEntries: number;
    registeredCallbacks: number;
    activeIntervals: number;
    memoryThreshold: number;
    cleanupInterval: number;
  } {
    return {
      isRunning: this.isRunning,
      trackedDataEntries: this.dataAccessTracking.size,
      registeredCallbacks: this.cleanupCallbacks.size,
      activeIntervals: this.cleanupIntervals.size,
      memoryThreshold: Math.round(this.MEMORY_THRESHOLD / 1024 / 1024), // MB
      cleanupInterval: this.CLEANUP_INTERVAL / 1000 // seconds
    };
  }

  /**
   * Force immediate cleanup
   */
  forceCleanup(): void {
    this.performImmediateCleanup();
  }

  /**
   * Configure cleanup thresholds
   */
  configureThresholds(config: {
    unusedDataThreshold?: number;
    inactiveDataThreshold?: number;
    memoryThreshold?: number;
    cleanupInterval?: number;
  }): void {
    if (config.unusedDataThreshold) {
      (this as any).UNUSED_DATA_THRESHOLD = config.unusedDataThreshold;
    }
    if (config.inactiveDataThreshold) {
      (this as any).INACTIVE_DATA_THRESHOLD = config.inactiveDataThreshold;
    }
    if (config.memoryThreshold) {
      (this as any).MEMORY_THRESHOLD = config.memoryThreshold;
    }
    if (config.cleanupInterval) {
      (this as any).CLEANUP_INTERVAL = config.cleanupInterval;
      
      // Restart cleanup with new interval
      this.stopAutomaticCleanup();
      this.startAutomaticCleanup();
    }
  }

  /**
   * Destroy the cleanup service
   */
  destroy(): void {
    this.stopAutomaticCleanup();
    this.dataAccessTracking.clear();
    this.cleanupCallbacks.clear();
  }
}

/**
 * React hook for automatic data cleanup
 */
export const useAutomaticDataCleanup = (
  dataKey: string,
  cleanupCallback?: () => void
) => {
  const cleanupService = AutomaticDataCleanup.getInstance();

  // Track data access
  const trackAccess = () => {
    cleanupService.trackDataAccess(dataKey);
  };

  // Register cleanup callback
  useEffect(() => {
    if (cleanupCallback) {
      cleanupService.registerCleanupCallback(dataKey, cleanupCallback);
    }

    return () => {
      if (cleanupCallback) {
        cleanupService.unregisterCleanupCallback(dataKey);
      }
    };
  }, [dataKey, cleanupCallback, cleanupService]);

  return {
    trackAccess,
    forceCleanup: () => cleanupService.forceCleanup(),
    getStats: () => cleanupService.getCleanupStats()
  };
};

/**
 * Service Desk specific cleanup utilities
 */
export class ServiceDeskDataCleanup {
  /**
   * Clean up team member data that hasn't been accessed recently
   */
  static cleanupTeamData(teamData: any[], accessThreshold: number = 5 * 60 * 1000): any[] {
    const now = Date.now();
    return teamData.filter(member => {
      const lastAccess = member.lastAccessed || 0;
      return now - lastAccess <= accessThreshold;
    });
  }

  /**
   * Clean up calculation cache entries
   */
  static cleanupCalculationCache(cache: Map<string, any>, accessThreshold: number = 5 * 60 * 1000): void {
    const now = Date.now();
    const keysToRemove: string[] = [];

    cache.forEach((value, key) => {
      if (value.lastAccessed && now - value.lastAccessed > accessThreshold) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => cache.delete(key));
  }

  /**
   * Clean up large arrays by removing unused items
   */
  static cleanupLargeArray<T extends { id: string; lastAccessed?: number }>(
    items: T[],
    maxItems: number = 1000,
    accessThreshold: number = 10 * 60 * 1000
  ): T[] {
    if (items.length <= maxItems) return items;

    const now = Date.now();
    
    // First, remove items that haven't been accessed recently
    let filtered = items.filter(item => {
      const lastAccess = item.lastAccessed || 0;
      return now - lastAccess <= accessThreshold;
    });

    // If still too many items, keep only the most recently accessed
    if (filtered.length > maxItems) {
      filtered = filtered
        .sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0))
        .slice(0, maxItems);
    }

    return filtered;
  }

  /**
   * Optimize object for memory efficiency
   */
  static optimizeObjectForMemory<T extends Record<string, any>>(
    obj: T,
    keepFields: (keyof T)[] = []
  ): Partial<T> {
    if (keepFields.length === 0) return obj;

    const optimized: Partial<T> = {};
    keepFields.forEach(field => {
      if (field in obj) {
        optimized[field] = obj[field];
      }
    });

    return optimized;
  }

  /**
   * Create memory-efficient summary of large datasets
   */
  static createDataSummary<T extends Record<string, any>>(
    items: T[],
    summaryFields: (keyof T)[] = []
  ): {
    totalItems: number;
    summary: Record<string, any>;
    sampleItems: T[];
  } {
    const totalItems = items.length;
    const sampleSize = Math.min(10, totalItems);
    const sampleItems = items.slice(0, sampleSize);

    const summary: Record<string, any> = {};
    
    if (summaryFields.length > 0) {
      summaryFields.forEach(field => {
        const values = items.map(item => item[field]).filter(val => val != null);
        
        if (values.length > 0) {
          if (typeof values[0] === 'number') {
            summary[`${String(field)}_sum`] = values.reduce((sum, val) => sum + val, 0);
            summary[`${String(field)}_avg`] = summary[`${String(field)}_sum`] / values.length;
            summary[`${String(field)}_min`] = Math.min(...values);
            summary[`${String(field)}_max`] = Math.max(...values);
          } else {
            summary[`${String(field)}_count`] = values.length;
            summary[`${String(field)}_unique`] = new Set(values).size;
          }
        }
      });
    }

    return {
      totalItems,
      summary,
      sampleItems
    };
  }
}

// Export singleton instance
export const automaticDataCleanup = AutomaticDataCleanup.getInstance();

// Auto-start cleanup service
if (typeof window !== 'undefined') {
  automaticDataCleanup.startAutomaticCleanup();
}