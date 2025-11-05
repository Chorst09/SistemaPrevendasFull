// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

// Throttle utility for high-frequency events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Debounced calculation manager for service desk
export class DebouncedCalculationManager {
  private debouncedFunctions = new Map<string, (...args: any[]) => void>();
  private defaultDelay = 300; // 300ms default delay

  constructor(defaultDelay = 300) {
    this.defaultDelay = defaultDelay;
  }

  // Create or get debounced function
  getDebouncedFunction<T extends (...args: any[]) => any>(
    key: string,
    func: T,
    delay = this.defaultDelay
  ): (...args: Parameters<T>) => void {
    if (!this.debouncedFunctions.has(key)) {
      this.debouncedFunctions.set(key, debounce(func, delay));
    }
    return this.debouncedFunctions.get(key)!;
  }

  // Clear all debounced functions
  clear(): void {
    this.debouncedFunctions.clear();
  }

  // Clear specific debounced function
  clearFunction(key: string): void {
    this.debouncedFunctions.delete(key);
  }
}

// Global debounced calculation manager
export const debouncedCalculationManager = new DebouncedCalculationManager();

// Specific debounced functions for service desk calculations
export const createDebouncedCalculations = () => {
  return {
    // Team cost calculations
    calculateTeamCosts: debouncedCalculationManager.getDebouncedFunction(
      'team_costs',
      (teamData: any, callback: (result: any) => void) => {
        // Actual calculation logic would be called here
        callback(teamData);
      },
      500 // 500ms delay for complex team calculations
    ),

    // Tax calculations
    calculateTaxes: debouncedCalculationManager.getDebouncedFunction(
      'tax_calculations',
      (taxData: any, callback: (result: any) => void) => {
        callback(taxData);
      },
      300
    ),

    // Budget calculations
    calculateBudget: debouncedCalculationManager.getDebouncedFunction(
      'budget_calculations',
      (budgetData: any, callback: (result: any) => void) => {
        callback(budgetData);
      },
      400 // Slightly longer delay for budget calculations
    ),

    // ROI analysis
    calculateROI: debouncedCalculationManager.getDebouncedFunction(
      'roi_analysis',
      (roiData: any, callback: (result: any) => void) => {
        callback(roiData);
      },
      600 // Longer delay for complex ROI calculations
    ),

    // Variable impact calculations
    calculateVariableImpact: debouncedCalculationManager.getDebouncedFunction(
      'variable_impact',
      (variableData: any, callback: (result: any) => void) => {
        callback(variableData);
      },
      400
    ),

    // Scenario comparisons
    calculateScenarios: debouncedCalculationManager.getDebouncedFunction(
      'scenario_calculations',
      (scenarioData: any, callback: (result: any) => void) => {
        callback(scenarioData);
      },
      700 // Longest delay for complex scenario analysis
    ),
  };
};

// React hook for debounced calculations
export const useDebouncedCalculations = () => {
  return createDebouncedCalculations();
};

// Utility for debouncing form inputs
export const createDebouncedInput = <T>(
  setValue: (value: T) => void,
  delay = 300
) => {
  return debounce(setValue, delay);
};

// Batch update utility for multiple calculations
export class BatchCalculationManager {
  private pendingUpdates = new Set<string>();
  private batchDelay = 100;
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(batchDelay = 100) {
    this.batchDelay = batchDelay;
  }

  // Add calculation to batch
  addToBatch(calculationType: string, callback: () => void): void {
    this.pendingUpdates.add(calculationType);

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.executeBatch(callback);
    }, this.batchDelay);
  }

  // Execute all pending calculations
  private executeBatch(callback: () => void): void {
    if (this.pendingUpdates.size > 0) {
      callback();
      this.pendingUpdates.clear();
    }
    this.batchTimeout = null;
  }

  // Clear pending batch
  clearBatch(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.pendingUpdates.clear();
  }
}

// Global batch calculation manager
export const batchCalculationManager = new BatchCalculationManager();