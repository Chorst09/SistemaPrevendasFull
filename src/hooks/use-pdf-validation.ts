import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProposalData, ClientData } from '../lib/types/pdf/core'
import { 
  validateAdvanced, 
  applyAutoFixes, 
  ValidationReport 
} from '../lib/pdf/utils/advanced-validation'
import { checkBrowserSupport } from '../lib/pdf/utils/error-handling'

interface UsePDFValidationOptions {
  autoValidate?: boolean
  showBrowserWarnings?: boolean
}

interface UsePDFValidationReturn {
  // Validation state
  validationReport: ValidationReport | null
  isValidating: boolean
  browserCompatible: boolean
  browserIssues: string[]
  
  // Validation actions
  validate: () => void
  applyFixes: () => { proposalData: ProposalData; clientData: ClientData } | null
  clearValidation: () => void
  
  // Computed properties
  hasErrors: boolean
  hasWarnings: boolean
  hasInfos: boolean
  canProceed: boolean
  canAutoFix: boolean
  
  // Validation summary
  validationSummary: string
}

/**
 * Hook for managing PDF validation state and operations
 */
export function usePDFValidation(
  proposalData: ProposalData,
  clientData: ClientData,
  options: UsePDFValidationOptions = {}
): UsePDFValidationReturn {
  const { autoValidate = true, showBrowserWarnings = true } = options

  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [browserCompatible, setBrowserCompatible] = useState(true)
  const [browserIssues, setBrowserIssues] = useState<string[]>([])

  // Check browser compatibility on mount
  useEffect(() => {
    if (showBrowserWarnings) {
      const compatibility = checkBrowserSupport()
      setBrowserCompatible(compatibility.supported)
      setBrowserIssues(compatibility.issues)
    }
  }, [showBrowserWarnings])

  // Validate data
  const validate = useCallback(() => {
    setIsValidating(true)
    
    try {
      const report = validateAdvanced(proposalData, clientData)
      setValidationReport(report)
    } catch (error) {
      console.error('Validation failed:', error)
      setValidationReport({
        valid: false,
        errors: [{
          rule: 'validation_error',
          message: 'Erro interno na validação dos dados',
          severity: 'error',
          autoFixAvailable: false
        }],
        warnings: [],
        infos: [],
        canAutoFix: false
      })
    } finally {
      setIsValidating(false)
    }
  }, [proposalData, clientData])

  // Auto-validate when data changes
  useEffect(() => {
    if (autoValidate) {
      validate()
    }
  }, [validate, autoValidate])

  // Apply automatic fixes
  const applyFixes = useCallback(() => {
    if (!validationReport || !validationReport.canAutoFix) {
      return null
    }

    try {
      const result = applyAutoFixes(proposalData, clientData)
      
      // Re-validate with fixed data
      const newReport = validateAdvanced(result.proposalData, result.clientData)
      setValidationReport(newReport)
      
      return result
    } catch (error) {
      console.error('Failed to apply fixes:', error)
      return null
    }
  }, [validationReport, proposalData, clientData])

  // Clear validation state
  const clearValidation = useCallback(() => {
    setValidationReport(null)
    setIsValidating(false)
  }, [])

  // Computed properties
  const hasErrors = validationReport ? validationReport.errors.length > 0 : false
  const hasWarnings = validationReport ? validationReport.warnings.length > 0 : false
  const hasInfos = validationReport ? validationReport.infos.length > 0 : false
  const canProceed = browserCompatible && (validationReport ? validationReport.valid : true)
  const canAutoFix = validationReport ? validationReport.canAutoFix : false

  // Validation summary
  const validationSummary = useMemo(() => {
    if (!validationReport) {
      return 'Validação não executada'
    }

    if (validationReport.valid && !hasWarnings && !hasInfos) {
      return 'Todos os dados estão válidos'
    }

    const parts: string[] = []
    
    if (hasErrors) {
      parts.push(`${validationReport.errors.length} erro(s)`)
    }
    
    if (hasWarnings) {
      parts.push(`${validationReport.warnings.length} aviso(s)`)
    }
    
    if (hasInfos) {
      parts.push(`${validationReport.infos.length} sugestão(ões)`)
    }

    return parts.length > 0 ? `Encontrado(s): ${parts.join(', ')}` : 'Validação concluída'
  }, [validationReport, hasErrors, hasWarnings, hasInfos])

  return {
    // State
    validationReport,
    isValidating,
    browserCompatible,
    browserIssues,
    
    // Actions
    validate,
    applyFixes,
    clearValidation,
    
    // Computed
    hasErrors,
    hasWarnings,
    hasInfos,
    canProceed,
    canAutoFix,
    
    // Summary
    validationSummary
  }
}

export default usePDFValidation