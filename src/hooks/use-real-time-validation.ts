import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  ServiceDeskData, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  TabValidationStatus
} from '../lib/types/service-desk-pricing'
import { 
  ValidationRuleResult, 
  ValidationSuggestion,
  advancedValidationService 
} from '../lib/services/advanced-validation-service'
import { serviceDeskErrorHandler } from '../lib/services/service-desk-error-handler'
import { ServiceDeskErrorType } from '../lib/types/service-desk-errors'

export interface UseRealTimeValidationConfig {
  debounceMs?: number
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showSuggestions?: boolean
  autoFix?: boolean
  tabId?: string
}

export interface ValidationState {
  isValidating: boolean
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  fieldValidations: Map<string, ValidationRuleResult>
  tabValidations: Map<string, TabValidationStatus>
}

export interface UseRealTimeValidationReturn {
  validationState: ValidationState
  validateField: (field: string, value: any) => Promise<ValidationRuleResult>
  validateComplete: (data: ServiceDeskData) => Promise<ValidationResult>
  validateTab: (tabId: string, data: ServiceDeskData) => Promise<TabValidationStatus>
  clearValidation: (field?: string) => void
  getSuggestions: (data: ServiceDeskData) => ValidationSuggestion[]
  applyAutoFix: (field: string, value: any, data: ServiceDeskData) => any
  isFieldValid: (field: string) => boolean
  getFieldError: (field: string) => string | undefined
  getFieldSuggestion: (field: string) => string | undefined
}

/**
 * Hook for real-time validation with debouncing and auto-correction
 */
export function useRealTimeValidation(
  data: ServiceDeskData,
  config: UseRealTimeValidationConfig = {}
): UseRealTimeValidationReturn {
  const {
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true,
    showSuggestions = true,
    autoFix = false,
    tabId
  } = config

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: [],
    fieldValidations: new Map(),
    tabValidations: new Map()
  })

  const debounceTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const validationCache = useRef<Map<string, { value: any; result: ValidationRuleResult }>>(new Map())

  /**
   * Validate a specific field with debouncing
   */
  const validateField = useCallback(async (
    field: string, 
    value: any
  ): Promise<ValidationRuleResult> => {
    // Clear existing timer for this field
    const existingTimer = debounceTimers.current.get(field)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Check cache first
    const cached = validationCache.current.get(field)
    if (cached && cached.value === value) {
      return cached.result
    }

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        try {
          setValidationState(prev => ({ ...prev, isValidating: true }))

          const result = advancedValidationService.validateField(field, value, data, tabId)
          
          // Cache the result
          validationCache.current.set(field, { value, result })

          // Update field validation state
          setValidationState(prev => {
            const newFieldValidations = new Map(prev.fieldValidations)
            newFieldValidations.set(field, result)

            return {
              ...prev,
              fieldValidations: newFieldValidations,
              isValidating: false
            }
          })

          resolve(result)
        } catch (error) {
          const errorResult: ValidationRuleResult = {
            isValid: false,
            message: 'Erro durante validação',
            suggestion: 'Tente novamente'
          }

          setValidationState(prev => {
            const newFieldValidations = new Map(prev.fieldValidations)
            newFieldValidations.set(field, errorResult)

            return {
              ...prev,
              fieldValidations: newFieldValidations,
              isValidating: false
            }
          })

          // Log validation error
          serviceDeskErrorHandler.createError(
            ServiceDeskErrorType.VALIDATION_ERROR,
            `Erro na validação do campo ${field}`,
            { field, tabId, timestamp: new Date() },
            error
          )

          resolve(errorResult)
        }
      }, debounceMs)

      debounceTimers.current.set(field, timer)
    })
  }, [data, tabId, debounceMs])

  /**
   * Validate complete data
   */
  const validateComplete = useCallback(async (
    dataToValidate: ServiceDeskData
  ): Promise<ValidationResult> => {
    try {
      setValidationState(prev => ({ ...prev, isValidating: true }))

      const result = advancedValidationService.validateComplete(dataToValidate)

      setValidationState(prev => ({
        ...prev,
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
        isValidating: false
      }))

      return result
    } catch (error) {
      const errorResult: ValidationResult = {
        isValid: false,
        errors: [{
          field: 'system',
          message: 'Erro durante validação completa',
          code: 'VALIDATION_SYSTEM_ERROR'
        }],
        warnings: []
      }

      setValidationState(prev => ({
        ...prev,
        isValid: false,
        errors: errorResult.errors,
        warnings: errorResult.warnings,
        isValidating: false
      }))

      // Log validation error
      serviceDeskErrorHandler.createError(
        ServiceDeskErrorType.VALIDATION_ERROR,
        'Erro na validação completa dos dados',
        { tabId, timestamp: new Date() },
        error
      )

      return errorResult
    }
  }, [tabId])

  /**
   * Validate specific tab
   */
  const validateTab = useCallback(async (
    targetTabId: string,
    dataToValidate: ServiceDeskData
  ): Promise<TabValidationStatus> => {
    try {
      setValidationState(prev => ({ ...prev, isValidating: true }))

      const result = advancedValidationService.validateTabCompletion(targetTabId, dataToValidate)

      setValidationState(prev => {
        const newTabValidations = new Map(prev.tabValidations)
        newTabValidations.set(targetTabId, result)

        return {
          ...prev,
          tabValidations: newTabValidations,
          isValidating: false
        }
      })

      return result
    } catch (error) {
      const errorResult: TabValidationStatus = {
        tabId: targetTabId,
        isValid: false,
        errors: [{
          field: 'tab',
          message: 'Erro durante validação da aba',
          code: 'TAB_VALIDATION_ERROR'
        }],
        warnings: [],
        completionPercentage: 0
      }

      setValidationState(prev => {
        const newTabValidations = new Map(prev.tabValidations)
        newTabValidations.set(targetTabId, errorResult)

        return {
          ...prev,
          tabValidations: newTabValidations,
          isValidating: false
        }
      })

      // Log validation error
      serviceDeskErrorHandler.createError(
        ServiceDeskErrorType.VALIDATION_ERROR,
        `Erro na validação da aba ${targetTabId}`,
        { tabId: targetTabId, timestamp: new Date() },
        error
      )

      return errorResult
    }
  }, [])

  /**
   * Clear validation for specific field or all fields
   */
  const clearValidation = useCallback((field?: string) => {
    if (field) {
      // Clear specific field
      const timer = debounceTimers.current.get(field)
      if (timer) {
        clearTimeout(timer)
        debounceTimers.current.delete(field)
      }
      
      validationCache.current.delete(field)

      setValidationState(prev => {
        const newFieldValidations = new Map(prev.fieldValidations)
        newFieldValidations.delete(field)

        return {
          ...prev,
          fieldValidations: newFieldValidations
        }
      })
    } else {
      // Clear all validations
      debounceTimers.current.forEach(timer => clearTimeout(timer))
      debounceTimers.current.clear()
      validationCache.current.clear()

      setValidationState({
        isValidating: false,
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        fieldValidations: new Map(),
        tabValidations: new Map()
      })
    }
  }, [])

  /**
   * Get suggestions for improving data quality
   */
  const getSuggestions = useCallback((dataToAnalyze: ServiceDeskData): ValidationSuggestion[] => {
    if (!showSuggestions) return []

    try {
      const suggestions = advancedValidationService.getSuggestions(dataToAnalyze, tabId)
      
      setValidationState(prev => ({
        ...prev,
        suggestions
      }))

      return suggestions
    } catch (error) {
      // Log error but don't fail
      serviceDeskErrorHandler.createError(
        ServiceDeskErrorType.VALIDATION_ERROR,
        'Erro ao obter sugestões de validação',
        { tabId, timestamp: new Date() },
        error
      )

      return []
    }
  }, [showSuggestions, tabId])

  /**
   * Apply auto-fix for a field
   */
  const applyAutoFix = useCallback((
    field: string, 
    value: any, 
    dataToFix: ServiceDeskData
  ): any => {
    if (!autoFix) return value

    try {
      const result = advancedValidationService.validateField(field, value, dataToFix, tabId)
      
      if (!result.isValid && result.autoFixAvailable && result.fixedValue !== undefined) {
        // Update validation state with fixed value
        const fixedResult: ValidationRuleResult = {
          isValid: true,
          message: 'Valor corrigido automaticamente',
          suggestion: result.suggestion
        }

        setValidationState(prev => {
          const newFieldValidations = new Map(prev.fieldValidations)
          newFieldValidations.set(field, fixedResult)

          return {
            ...prev,
            fieldValidations: newFieldValidations
          }
        })

        return result.fixedValue
      }

      return value
    } catch (error) {
      // Log error but return original value
      serviceDeskErrorHandler.createError(
        ServiceDeskErrorType.VALIDATION_ERROR,
        `Erro ao aplicar correção automática para ${field}`,
        { field, tabId, timestamp: new Date() },
        error
      )

      return value
    }
  }, [autoFix, tabId])

  /**
   * Check if specific field is valid
   */
  const isFieldValid = useCallback((field: string): boolean => {
    const fieldValidation = validationState.fieldValidations.get(field)
    return fieldValidation?.isValid ?? true
  }, [validationState.fieldValidations])

  /**
   * Get error message for specific field
   */
  const getFieldError = useCallback((field: string): string | undefined => {
    const fieldValidation = validationState.fieldValidations.get(field)
    return fieldValidation?.isValid === false ? fieldValidation.message : undefined
  }, [validationState.fieldValidations])

  /**
   * Get suggestion for specific field
   */
  const getFieldSuggestion = useCallback((field: string): string | undefined => {
    const fieldValidation = validationState.fieldValidations.get(field)
    return fieldValidation?.suggestion
  }, [validationState.fieldValidations])

  /**
   * Auto-validate on data changes
   */
  useEffect(() => {
    if (validateOnChange && data) {
      // Debounced complete validation
      const timer = setTimeout(() => {
        validateComplete(data)
      }, debounceMs * 2) // Use longer debounce for complete validation

      return () => clearTimeout(timer)
    }
  }, [data, validateOnChange, validateComplete, debounceMs])

  /**
   * Update suggestions when data changes
   */
  useEffect(() => {
    if (showSuggestions && data) {
      const timer = setTimeout(() => {
        getSuggestions(data)
      }, debounceMs * 3) // Even longer debounce for suggestions

      return () => clearTimeout(timer)
    }
  }, [data, showSuggestions, getSuggestions, debounceMs])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      debounceTimers.current.forEach(timer => clearTimeout(timer))
      debounceTimers.current.clear()
    }
  }, [])

  return {
    validationState,
    validateField,
    validateComplete,
    validateTab,
    clearValidation,
    getSuggestions,
    applyAutoFix,
    isFieldValid,
    getFieldError,
    getFieldSuggestion
  }
}

/**
 * Hook for field-level validation with auto-correction
 */
export function useFieldValidation(
  field: string,
  value: any,
  data: ServiceDeskData,
  config: UseRealTimeValidationConfig = {}
) {
  const {
    validateField,
    applyAutoFix,
    isFieldValid,
    getFieldError,
    getFieldSuggestion,
    validationState
  } = useRealTimeValidation(data, config)

  const [fieldState, setFieldState] = useState({
    isValidating: false,
    isValid: true,
    error: undefined as string | undefined,
    suggestion: undefined as string | undefined
  })

  /**
   * Validate this specific field
   */
  const validate = useCallback(async (newValue?: any) => {
    const valueToValidate = newValue !== undefined ? newValue : value
    
    setFieldState(prev => ({ ...prev, isValidating: true }))
    
    try {
      await validateField(field, valueToValidate)
      
      setFieldState({
        isValidating: false,
        isValid: isFieldValid(field),
        error: getFieldError(field),
        suggestion: getFieldSuggestion(field)
      })
    } catch (error) {
      setFieldState({
        isValidating: false,
        isValid: false,
        error: 'Erro durante validação',
        suggestion: 'Tente novamente'
      })
    }
  }, [field, value, validateField, isFieldValid, getFieldError, getFieldSuggestion])

  /**
   * Apply auto-fix for this field
   */
  const autoFix = useCallback(() => {
    return applyAutoFix(field, value, data)
  }, [field, value, data, applyAutoFix])

  /**
   * Validate on value changes
   */
  useEffect(() => {
    if (config.validateOnChange !== false) {
      validate()
    }
  }, [value, validate, config.validateOnChange])

  return {
    ...fieldState,
    validate,
    autoFix,
    isValidating: fieldState.isValidating || validationState.isValidating
  }
}

/**
 * Hook for tab-level validation
 */
export function useTabValidation(
  tabId: string,
  data: ServiceDeskData,
  config: UseRealTimeValidationConfig = {}
) {
  const { validateTab, validationState } = useRealTimeValidation(data, { ...config, tabId })

  const [tabState, setTabState] = useState<TabValidationStatus>({
    tabId,
    isValid: true,
    errors: [],
    warnings: [],
    completionPercentage: 0
  })

  /**
   * Validate this tab
   */
  const validate = useCallback(async () => {
    try {
      const result = await validateTab(tabId, data)
      setTabState(result)
      return result
    } catch (error) {
      const errorResult: TabValidationStatus = {
        tabId,
        isValid: false,
        errors: [{
          field: 'tab',
          message: 'Erro durante validação da aba',
          code: 'TAB_VALIDATION_ERROR'
        }],
        warnings: [],
        completionPercentage: 0
      }
      setTabState(errorResult)
      return errorResult
    }
  }, [tabId, data, validateTab])

  /**
   * Get tab validation from global state
   */
  useEffect(() => {
    const tabValidation = validationState.tabValidations.get(tabId)
    if (tabValidation) {
      setTabState(tabValidation)
    }
  }, [tabId, validationState.tabValidations])

  /**
   * Auto-validate on data changes
   */
  useEffect(() => {
    if (config.validateOnChange !== false) {
      const timer = setTimeout(() => {
        validate()
      }, config.debounceMs || 300)

      return () => clearTimeout(timer)
    }
  }, [data, validate, config.validateOnChange, config.debounceMs])

  return {
    ...tabState,
    validate,
    isValidating: validationState.isValidating
  }
}