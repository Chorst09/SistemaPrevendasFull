import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, Lightbulb, Zap } from 'lucide-react'
import { ValidationRuleResult, ValidationSuggestion } from '../../../lib/services/advanced-validation-service'
import { ValidationError, ValidationWarning } from '../../../lib/types/service-desk-pricing'

interface ValidationFeedbackProps {
  field?: string
  validation?: ValidationRuleResult
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
  suggestions?: ValidationSuggestion[]
  showSuggestions?: boolean
  onAutoFix?: () => void
  className?: string
}

/**
 * Component for displaying real-time validation feedback
 */
export function ValidationFeedback({
  field,
  validation,
  errors = [],
  warnings = [],
  suggestions = [],
  showSuggestions = true,
  onAutoFix,
  className = ''
}: ValidationFeedbackProps) {
  // Filter errors and warnings for this field if specified
  const fieldErrors = field ? errors.filter(error => error.field === field) : errors
  const fieldWarnings = field ? warnings.filter(warning => warning.field === field) : warnings
  const fieldSuggestions = field ? suggestions.filter(suggestion => suggestion.field === field) : suggestions

  // Determine overall status
  const hasErrors = validation ? !validation.isValid : fieldErrors.length > 0
  const hasWarnings = fieldWarnings.length > 0
  const hasSuggestions = showSuggestions && fieldSuggestions.length > 0

  if (!hasErrors && !hasWarnings && !hasSuggestions && (!validation || validation.isValid)) {
    return null
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Field-specific validation result */}
      {validation && !validation.isValid && (
        <ValidationMessage
          type="error"
          message={validation.message || 'Valor inválido'}
          suggestion={validation.suggestion}
          autoFixAvailable={validation.autoFixAvailable}
          onAutoFix={onAutoFix}
        />
      )}

      {/* Field errors */}
      {fieldErrors.map((error, index) => (
        <ValidationMessage
          key={`error-${index}`}
          type="error"
          message={error.message}
          code={error.code}
        />
      ))}

      {/* Field warnings */}
      {fieldWarnings.map((warning, index) => (
        <ValidationMessage
          key={`warning-${index}`}
          type="warning"
          message={warning.message}
          code={warning.code}
        />
      ))}

      {/* Field suggestions */}
      {showSuggestions && fieldSuggestions.map((suggestion, index) => (
        <ValidationMessage
          key={`suggestion-${index}`}
          type="suggestion"
          message={suggestion.message}
          priority={suggestion.priority}
          action={suggestion.action}
        />
      ))}

      {/* General validation suggestion */}
      {validation && validation.isValid && validation.suggestion && (
        <ValidationMessage
          type="info"
          message={validation.suggestion}
        />
      )}
    </div>
  )
}

interface ValidationMessageProps {
  type: 'error' | 'warning' | 'suggestion' | 'info' | 'success'
  message: string
  code?: string
  suggestion?: string
  priority?: 'low' | 'medium' | 'high'
  autoFixAvailable?: boolean
  onAutoFix?: () => void
  action?: () => void
}

function ValidationMessage({
  type,
  message,
  code,
  suggestion,
  priority,
  autoFixAvailable,
  onAutoFix,
  action
}: ValidationMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          text: 'text-red-700',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        }
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          text: 'text-yellow-700',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        }
      case 'suggestion':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          text: 'text-blue-700',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        }
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          text: 'text-green-700',
          button: 'bg-green-100 hover:bg-green-200 text-green-800'
        }
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          text: 'text-gray-700',
          button: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }
    }
  }

  const getPriorityBadge = () => {
    if (!priority || type !== 'suggestion') return null

    const priorityStyles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-600',
      high: 'bg-red-100 text-red-600'
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityStyles[priority]}`}>
        {priority === 'low' && 'Baixa'}
        {priority === 'medium' && 'Média'}
        {priority === 'high' && 'Alta'}
      </span>
    )
  }

  const styles = getStyles()

  return (
    <div className={`flex items-start gap-2 p-3 rounded-md border ${styles.container}`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>
          {getPriorityBadge()}
        </div>

        {code && (
          <p className="text-xs text-gray-500 mb-1">
            Código: {code}
          </p>
        )}

        {suggestion && (
          <p className={`text-sm ${styles.text} opacity-80`}>
            {suggestion}
          </p>
        )}

        {(autoFixAvailable || action) && (
          <div className="flex gap-2 mt-2">
            {autoFixAvailable && onAutoFix && (
              <button
                onClick={onAutoFix}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${styles.button}`}
              >
                <Zap className="h-3 w-3" />
                Corrigir Automaticamente
              </button>
            )}

            {action && (
              <button
                onClick={action}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${styles.button}`}
              >
                Aplicar Sugestão
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface ValidationSummaryProps {
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: ValidationSuggestion[]
  isValidating?: boolean
  className?: string
}

/**
 * Component for displaying validation summary
 */
export function ValidationSummary({
  errors,
  warnings,
  suggestions,
  isValidating = false,
  className = ''
}: ValidationSummaryProps) {
  const totalIssues = errors.length + warnings.length
  const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length

  if (totalIssues === 0 && highPrioritySuggestions === 0 && !isValidating) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium text-green-800">
          Todos os dados estão válidos
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {isValidating && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm font-medium text-blue-800">
            Validando dados...
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-red-800">
              {errors.length} erro{errors.length > 1 ? 's' : ''} encontrado{errors.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.slice(0, 3).map((error, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-red-500 mt-1">•</span>
                <span>{error.message}</span>
              </li>
            ))}
            {errors.length > 3 && (
              <li className="text-red-600 font-medium">
                ... e mais {errors.length - 3} erro{errors.length - 3 > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-800">
              {warnings.length} aviso{warnings.length > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.slice(0, 2).map((warning, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{warning.message}</span>
              </li>
            ))}
            {warnings.length > 2 && (
              <li className="text-yellow-600 font-medium">
                ... e mais {warnings.length - 2} aviso{warnings.length - 2 > 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      )}

      {highPrioritySuggestions > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800">
              {highPrioritySuggestions} sugestão{highPrioritySuggestions > 1 ? 'ões' : ''} importante{highPrioritySuggestions > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            {suggestions
              .filter(s => s.priority === 'high')
              .slice(0, 2)
              .map((suggestion, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{suggestion.message}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ValidationFeedback