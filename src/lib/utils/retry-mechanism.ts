import { ServiceDeskError, ServiceDeskErrorType, ServiceDeskErrorContext } from '../types/service-desk-errors'
import { serviceDeskErrorHandler } from '../services/service-desk-error-handler'

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: ServiceDeskErrorType[]
  onRetry?: (attempt: number, error: Error) => void
  onSuccess?: (attempt: number) => void
  onFailure?: (finalError: Error, attempts: number) => void
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    ServiceDeskErrorType.CALCULATION_ERROR,
    ServiceDeskErrorType.DATA_PERSISTENCE_ERROR,
    ServiceDeskErrorType.SYNC_ERROR,
    ServiceDeskErrorType.NETWORK_ERROR,
    ServiceDeskErrorType.INTEGRATION_ERROR
  ]
}

/**
 * Retry mechanism with exponential backoff for service desk operations
 */
export class RetryMechanism {
  private config: RetryConfig

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * Execute operation with retry logic
   */
  async execute<T>(
    operation: () => Promise<T>,
    context: ServiceDeskErrorContext,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        const result = await operation()
        
        // Success callback
        if (this.config.onSuccess && attempt > 1) {
          this.config.onSuccess(attempt)
        }
        
        // Log recovery if there were previous failures
        if (lastError && attempt > 1) {
          serviceDeskErrorHandler.createError(
            ServiceDeskErrorType.SYSTEM_ERROR,
            `${operationName} recuperado após ${attempt} tentativas`,
            context,
            { previousError: lastError, attempt }
          )
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        
        // Check if error is retryable
        if (!this.isRetryableError(error as Error)) {
          // Non-retryable error, fail immediately
          if (this.config.onFailure) {
            this.config.onFailure(error as Error, attempt)
          }
          throw error
        }
        
        // If this was the last attempt, fail
        if (attempt === this.config.maxAttempts) {
          if (this.config.onFailure) {
            this.config.onFailure(error as Error, attempt)
          }
          
          // Create comprehensive error
          const finalError = serviceDeskErrorHandler.createError(
            this.getErrorType(error as Error),
            `${operationName} falhou após ${attempt} tentativas: ${(error as Error).message}`,
            context,
            { 
              originalError: error, 
              attempts: attempt,
              operationName
            }
          )
          
          throw finalError
        }
        
        // Retry callback
        if (this.config.onRetry) {
          this.config.onRetry(attempt, error as Error)
        }
        
        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt)
        
        // Log retry attempt
        serviceDeskErrorHandler.createError(
          this.getErrorType(error as Error),
          `${operationName} falhou (tentativa ${attempt}/${this.config.maxAttempts}), tentando novamente em ${delay}ms`,
          context,
          { error, attempt, delay }
        )
        
        // Wait before retry
        await this.sleep(delay)
      }
    }
    
    // This should never be reached, but TypeScript requires it
    throw new Error('Unexpected end of retry loop')
  }

  /**
   * Execute operation with circuit breaker pattern
   */
  async executeWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    context: ServiceDeskErrorContext,
    operationName: string = 'operation',
    circuitBreakerConfig: {
      failureThreshold: number
      resetTimeout: number
      monitoringPeriod: number
    } = {
      failureThreshold: 5,
      resetTimeout: 60000,
      monitoringPeriod: 300000
    }
  ): Promise<T> {
    const circuitKey = `circuit_${operationName}`
    const now = Date.now()
    
    // Get circuit state from storage
    const circuitState = this.getCircuitState(circuitKey)
    
    // Check if circuit is open
    if (circuitState.state === 'open') {
      if (now - circuitState.lastFailure < circuitBreakerConfig.resetTimeout) {
        throw serviceDeskErrorHandler.createError(
          ServiceDeskErrorType.SYSTEM_ERROR,
          `Operação ${operationName} temporariamente indisponível (circuit breaker aberto)`,
          context,
          { circuitState, resetTimeout: circuitBreakerConfig.resetTimeout }
        )
      } else {
        // Try to reset circuit to half-open
        circuitState.state = 'half-open'
        this.saveCircuitState(circuitKey, circuitState)
      }
    }
    
    try {
      const result = await this.execute(operation, context, operationName)
      
      // Success - reset circuit if it was half-open
      if (circuitState.state === 'half-open') {
        circuitState.state = 'closed'
        circuitState.failures = 0
        this.saveCircuitState(circuitKey, circuitState)
      }
      
      return result
    } catch (error) {
      // Failure - update circuit state
      circuitState.failures++
      circuitState.lastFailure = now
      
      if (circuitState.failures >= circuitBreakerConfig.failureThreshold) {
        circuitState.state = 'open'
      }
      
      this.saveCircuitState(circuitKey, circuitState)
      throw error
    }
  }

  /**
   * Batch retry for multiple operations
   */
  async executeBatch<T>(
    operations: Array<{
      operation: () => Promise<T>
      name: string
      context: ServiceDeskErrorContext
    }>,
    options: {
      failFast?: boolean
      maxConcurrency?: number
    } = {}
  ): Promise<Array<{ success: boolean; result?: T; error?: ServiceDeskError }>> {
    const { failFast = false, maxConcurrency = 3 } = options
    const results: Array<{ success: boolean; result?: T; error?: ServiceDeskError }> = []
    
    // Process operations in batches to control concurrency
    for (let i = 0; i < operations.length; i += maxConcurrency) {
      const batch = operations.slice(i, i + maxConcurrency)
      
      const batchPromises = batch.map(async ({ operation, name, context }) => {
        try {
          const result = await this.execute(operation, context, name)
          return { success: true, result }
        } catch (error) {
          const serviceDeskError = error as ServiceDeskError
          
          if (failFast) {
            throw serviceDeskError
          }
          
          return { success: false, error: serviceDeskError }
        }
      })
      
      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        if (failFast) {
          throw error
        }
      }
    }
    
    return results
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Check if it's a ServiceDeskError with retryable type
    if (error instanceof Error && 'type' in error) {
      const serviceDeskError = error as ServiceDeskError
      return this.config.retryableErrors.includes(serviceDeskError.type)
    }
    
    // Check common error patterns
    const message = error.message.toLowerCase()
    
    // Network errors
    if (message.includes('network') || message.includes('timeout') || message.includes('connection')) {
      return true
    }
    
    // Temporary errors
    if (message.includes('temporary') || message.includes('busy') || message.includes('unavailable')) {
      return true
    }
    
    // Rate limiting
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return true
    }
    
    // Default to non-retryable for unknown errors
    return false
  }

  /**
   * Get error type from generic error
   */
  private getErrorType(error: Error): ServiceDeskErrorType {
    if (error instanceof Error && 'type' in error) {
      return (error as ServiceDeskError).type
    }
    
    const message = error.message.toLowerCase()
    
    if (message.includes('calculation') || message.includes('math')) {
      return ServiceDeskErrorType.CALCULATION_ERROR
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ServiceDeskErrorType.VALIDATION_ERROR
    }
    
    if (message.includes('storage') || message.includes('persistence')) {
      return ServiceDeskErrorType.DATA_PERSISTENCE_ERROR
    }
    
    if (message.includes('network') || message.includes('connection')) {
      return ServiceDeskErrorType.NETWORK_ERROR
    }
    
    return ServiceDeskErrorType.SYSTEM_ERROR
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1)
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelay)
    
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * cappedDelay
    
    return Math.floor(cappedDelay + jitter)
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Circuit breaker state management
   */
  private getCircuitState(key: string): {
    state: 'closed' | 'open' | 'half-open'
    failures: number
    lastFailure: number
  } {
    try {
      const stored = localStorage.getItem(`circuit_${key}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      // Ignore storage errors
    }
    
    return {
      state: 'closed',
      failures: 0,
      lastFailure: 0
    }
  }

  private saveCircuitState(key: string, state: any): void {
    try {
      localStorage.setItem(`circuit_${key}`, JSON.stringify(state))
    } catch (error) {
      // Ignore storage errors
    }
  }
}

/**
 * Utility functions for common retry patterns
 */

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  context: ServiceDeskErrorContext,
  config?: Partial<RetryConfig>
): Promise<T> {
  const retry = new RetryMechanism(config)
  return retry.execute(operation, context)
}

/**
 * Retry calculation operations
 */
export async function retryCalculation<T>(
  calculation: () => Promise<T>,
  context: ServiceDeskErrorContext,
  operationName: string = 'calculation'
): Promise<T> {
  const retry = new RetryMechanism({
    maxAttempts: 3,
    baseDelay: 500,
    retryableErrors: [
      ServiceDeskErrorType.CALCULATION_ERROR,
      ServiceDeskErrorType.INVALID_CALCULATION_INPUT
    ]
  })
  
  return retry.execute(calculation, context, operationName)
}

/**
 * Retry data persistence operations
 */
export async function retryDataPersistence<T>(
  persistenceOperation: () => Promise<T>,
  context: ServiceDeskErrorContext,
  operationName: string = 'data persistence'
): Promise<T> {
  const retry = new RetryMechanism({
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 5000,
    retryableErrors: [
      ServiceDeskErrorType.DATA_PERSISTENCE_ERROR,
      ServiceDeskErrorType.STORAGE_QUOTA_EXCEEDED,
      ServiceDeskErrorType.SYNC_ERROR
    ]
  })
  
  return retry.execute(persistenceOperation, context, operationName)
}

/**
 * Retry integration operations
 */
export async function retryIntegration<T>(
  integrationOperation: () => Promise<T>,
  context: ServiceDeskErrorContext,
  operationName: string = 'integration'
): Promise<T> {
  const retry = new RetryMechanism({
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    retryableErrors: [
      ServiceDeskErrorType.INTEGRATION_ERROR,
      ServiceDeskErrorType.NETWORK_ERROR,
      ServiceDeskErrorType.PDF_GENERATION_FAILED,
      ServiceDeskErrorType.EXPORT_FAILED
    ]
  })
  
  return retry.executeWithCircuitBreaker(integrationOperation, context, operationName)
}