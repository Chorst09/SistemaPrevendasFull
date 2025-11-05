import { ServiceDeskData } from '../types/service-desk-pricing';

// Cache key generator for calculations
export const generateCacheKey = (data: any, operation: string): string => {
  const dataHash = JSON.stringify(data);
  return `${operation}_${btoa(dataHash).slice(0, 16)}`;
};

// Cache entry interface
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Calculation cache class
export class CalculationCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum cache entries
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  constructor(maxSize = 100, defaultTTL = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  // Get cached value
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  // Set cached value
  set<T>(key: string, value: T, ttl = this.defaultTTL): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });
  }

  // Clear cache
  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Global calculation cache instance
export const calculationCache = new CalculationCache();

// Cache decorator for calculation methods
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cacheKey = generateCacheKey(args, `${target.constructor.name}.${propertyName}`);
      
      // Try to get from cache first
      const cachedResult = calculationCache.get(cacheKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Calculate and cache result
      const result = method.apply(this, args);
      calculationCache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Specific cache utilities for service desk calculations
export class ServiceDeskCalculationCache {
  private static instance: ServiceDeskCalculationCache;
  private cache: CalculationCache;

  private constructor() {
    this.cache = new CalculationCache(200, 10 * 60 * 1000); // 10 minutes TTL
  }

  static getInstance(): ServiceDeskCalculationCache {
    if (!ServiceDeskCalculationCache.instance) {
      ServiceDeskCalculationCache.instance = new ServiceDeskCalculationCache();
    }
    return ServiceDeskCalculationCache.instance;
  }

  // Cache team cost calculations
  cacheTeamCosts(teamData: any, result: any): void {
    const key = generateCacheKey(teamData, 'team_costs');
    this.cache.set(key, result);
  }

  getTeamCosts(teamData: any): any | null {
    const key = generateCacheKey(teamData, 'team_costs');
    return this.cache.get(key);
  }

  // Cache tax calculations
  cacheTaxCalculations(taxData: any, result: any): void {
    const key = generateCacheKey(taxData, 'tax_calculations');
    this.cache.set(key, result);
  }

  getTaxCalculations(taxData: any): any | null {
    const key = generateCacheKey(taxData, 'tax_calculations');
    return this.cache.get(key);
  }

  // Cache budget calculations
  cacheBudgetCalculations(budgetData: any, result: any): void {
    const key = generateCacheKey(budgetData, 'budget_calculations');
    this.cache.set(key, result);
  }

  getBudgetCalculations(budgetData: any): any | null {
    const key = generateCacheKey(budgetData, 'budget_calculations');
    return this.cache.get(key);
  }

  // Cache ROI analysis
  cacheROIAnalysis(roiData: any, result: any): void {
    const key = generateCacheKey(roiData, 'roi_analysis');
    this.cache.set(key, result);
  }

  getROIAnalysis(roiData: any): any | null {
    const key = generateCacheKey(roiData, 'roi_analysis');
    return this.cache.get(key);
  }

  // Clear all service desk caches
  clearAll(): void {
    this.cache.clear();
  }

  // Invalidate cache when data changes
  invalidateRelatedCaches(changedTab: string): void {
    const relatedCaches: Record<string, string[]> = {
      team: ['team_costs', 'budget_calculations'],
      taxes: ['tax_calculations', 'budget_calculations'],
      variables: ['budget_calculations', 'roi_analysis'],
      otherCosts: ['budget_calculations'],
      budget: ['budget_calculations', 'roi_analysis'],
    };

    const cachesToInvalidate = relatedCaches[changedTab] || [];
    
    for (const [key] of this.cache.cache.entries()) {
      for (const cacheType of cachesToInvalidate) {
        if (key.includes(cacheType)) {
          this.cache.cache.delete(key);
        }
      }
    }
  }
}