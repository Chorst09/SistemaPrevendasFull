import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { ValidationFeedback } from './ValidationFeedback'
import { useFieldValidation } from '../../../hooks/use-real-time-validation'
import { ServiceDeskData } from '../../../lib/types/service-desk-pricing'
import { CheckCircle, AlertCircle, Loader2, Zap } from 'lucide-react'

interface ValidatedInputProps {
  field: string
  label: string
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  data: ServiceDeskData
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'password'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showSuggestions?: boolean
  autoFix?: boolean
  debounceMs?: number
  tabId?: string
}

/**
 * Input component with real-time validation and auto-correction
 */
export function ValidatedInput({
  field,
  label,
  value,
  onChange,
  onBlur,
  data,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  validateOnChange = true,
  validateOnBlur = true,
  showSuggestions = true,
  autoFix = false,
  debounceMs = 300,
  tabId
}: ValidatedInputProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [hasBeenTouched, setHasBeenTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const {
    isValid,
    isValidating,
    error,
    suggestion,
    validate,
    autoFix: applyAutoFix
  } = useFieldValidation(field, internalValue, data, {
    validateOnChange,
    validateOnBlur,
    showSuggestions,
    autoFix,
    debounceMs,
    tabId
  })

  // Sync internal value with prop value
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = useCallback((newValue: any) => {
    setInternalValue(newValue)
    setHasBeenTouched(true)
    
    // Apply auto-fix if enabled
    if (autoFix) {
      const fixedValue = applyAutoFix()
      if (fixedValue !== newValue) {
        setInternalValue(fixedValue)
        onChange(fixedValue)
        return
      }
    }
    
    onChange(newValue)
  }, [onChange, autoFix, applyAutoFix])

  const handleBlur = useCallback(() => {
    setHasBeenTouched(true)
    if (validateOnBlur) {
      validate(internalValue)
    }
    onBlur?.()
  }, [validateOnBlur, validate, internalValue, onBlur])

  const handleAutoFix = useCallback(() => {
    const fixedValue = applyAutoFix()
    if (fixedValue !== internalValue) {
      setInternalValue(fixedValue)
      onChange(fixedValue)
    }
  }, [applyAutoFix, internalValue, onChange])

  const getValidationStatus = () => {
    if (!hasBeenTouched) return 'neutral'
    if (isValidating) return 'validating'
    if (error) return 'error'
    if (isValid) return 'valid'
    return 'neutral'
  }

  const getValidationIcon = () => {
    const status = getValidationStatus()
    
    switch (status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getInputStyles = () => {
    const status = getValidationStatus()
    const baseStyles = 'transition-colors duration-200'
    
    switch (status) {
      case 'valid':
        return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500`
      case 'error':
        return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500`
      case 'validating':
        return `${baseStyles} border-blue-300 focus:border-blue-500 focus:ring-blue-500`
      default:
        return baseStyles
    }
  }

  const inputProps = {
    ref: inputRef,
    value: internalValue || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = type === 'number' ? 
        (e.target.value === '' ? '' : Number(e.target.value)) : 
        e.target.value
      handleChange(newValue)
    },
    onBlur: handleBlur,
    placeholder,
    disabled: disabled || isValidating,
    className: `${getInputStyles()} ${className}`,
    'aria-invalid': error ? 'true' : 'false',
    'aria-describedby': error ? `${field}-error` : undefined
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex items-center gap-2">
          {getValidationIcon()}
          
          {autoFix && error && (
            <button
              type="button"
              onClick={handleAutoFix}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              title="Corrigir automaticamente"
            >
              <Zap className="h-3 w-3" />
              Auto-corrigir
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {type === 'textarea' ? (
          <Textarea
            id={field}
            {...inputProps}
            rows={4}
          />
        ) : (
          <Input
            id={field}
            type={type}
            {...inputProps}
          />
        )}
      </div>

      {/* Validation feedback */}
      {hasBeenTouched && (
        <ValidationFeedback
          field={field}
          validation={{
            isValid,
            message: error,
            suggestion,
            autoFixAvailable: autoFix && !!error
          }}
          onAutoFix={autoFix ? handleAutoFix : undefined}
          showSuggestions={showSuggestions}
        />
      )}
    </div>
  )
}

interface ValidatedSelectProps {
  field: string
  label: string
  value: any
  onChange: (value: any) => void
  onBlur?: () => void
  data: ServiceDeskData
  options: Array<{ value: any; label: string; disabled?: boolean }>
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  showSuggestions?: boolean
  tabId?: string
}

/**
 * Select component with validation
 */
export function ValidatedSelect({
  field,
  label,
  value,
  onChange,
  onBlur,
  data,
  options,
  placeholder = 'Selecione uma opção',
  required = false,
  disabled = false,
  className = '',
  validateOnChange = true,
  validateOnBlur = true,
  showSuggestions = true,
  tabId
}: ValidatedSelectProps) {
  const [hasBeenTouched, setHasBeenTouched] = useState(false)

  const {
    isValid,
    isValidating,
    error,
    suggestion,
    validate
  } = useFieldValidation(field, value, data, {
    validateOnChange,
    validateOnBlur,
    showSuggestions,
    tabId
  })

  const handleChange = useCallback((newValue: any) => {
    setHasBeenTouched(true)
    onChange(newValue)
  }, [onChange])

  const handleBlur = useCallback(() => {
    setHasBeenTouched(true)
    if (validateOnBlur) {
      validate(value)
    }
    onBlur?.()
  }, [validateOnBlur, validate, value, onBlur])

  const getValidationStatus = () => {
    if (!hasBeenTouched) return 'neutral'
    if (isValidating) return 'validating'
    if (error) return 'error'
    if (isValid) return 'valid'
    return 'neutral'
  }

  const getValidationIcon = () => {
    const status = getValidationStatus()
    
    switch (status) {
      case 'validating':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getSelectStyles = () => {
    const status = getValidationStatus()
    const baseStyles = 'transition-colors duration-200'
    
    switch (status) {
      case 'valid':
        return `${baseStyles} border-green-300 focus:border-green-500 focus:ring-green-500`
      case 'error':
        return `${baseStyles} border-red-300 focus:border-red-500 focus:ring-red-500`
      case 'validating':
        return `${baseStyles} border-blue-300 focus:border-blue-500 focus:ring-blue-500`
      default:
        return baseStyles
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="flex items-center gap-2">
          {getValidationIcon()}
        </div>
      </div>

      <select
        id={field}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={disabled || isValidating}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 ${getSelectStyles()} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${field}-error` : undefined}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {/* Validation feedback */}
      {hasBeenTouched && (
        <ValidationFeedback
          field={field}
          validation={{
            isValid,
            message: error,
            suggestion
          }}
          showSuggestions={showSuggestions}
        />
      )}
    </div>
  )
}

interface ValidatedCheckboxProps {
  field: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  onBlur?: () => void
  data: ServiceDeskData
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  validateOnChange?: boolean
  validateOnBlur?: boolean
  tabId?: string
}

/**
 * Checkbox component with validation
 */
export function ValidatedCheckbox({
  field,
  label,
  checked,
  onChange,
  onBlur,
  data,
  description,
  required = false,
  disabled = false,
  className = '',
  validateOnChange = true,
  validateOnBlur = true,
  tabId
}: ValidatedCheckboxProps) {
  const [hasBeenTouched, setHasBeenTouched] = useState(false)

  const {
    isValid,
    isValidating,
    error,
    validate
  } = useFieldValidation(field, checked, data, {
    validateOnChange,
    validateOnBlur,
    tabId
  })

  const handleChange = useCallback((newChecked: boolean) => {
    setHasBeenTouched(true)
    onChange(newChecked)
  }, [onChange])

  const handleBlur = useCallback(() => {
    setHasBeenTouched(true)
    if (validateOnBlur) {
      validate(checked)
    }
    onBlur?.()
  }, [validateOnBlur, validate, checked, onBlur])

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5">
          <input
            id={field}
            type="checkbox"
            checked={checked}
            onChange={(e) => handleChange(e.target.checked)}
            onBlur={handleBlur}
            disabled={disabled || isValidating}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${field}-error` : undefined}
          />
        </div>
        
        <div className="flex-1">
          <Label htmlFor={field} className="text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          
          {description && (
            <p className="text-sm text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>

        {isValidating && (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin mt-0.5" />
        )}
      </div>

      {/* Validation feedback */}
      {hasBeenTouched && error && (
        <ValidationFeedback
          field={field}
          validation={{
            isValid,
            message: error
          }}
        />
      )}
    </div>
  )
}

export default ValidatedInput