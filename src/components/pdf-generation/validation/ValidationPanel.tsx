import React, { useState } from 'react'
import { AlertTriangle, CheckCircle, Info, AlertCircle, Wrench, X } from 'lucide-react'
import { ValidationReport, ValidationIssue } from '../../../lib/pdf/utils/advanced-validation'

interface ValidationPanelProps {
  report: ValidationReport
  onApplyFixes?: () => void
  onDismiss?: () => void
  className?: string
}

/**
 * Component to display validation results and offer fixes
 */
export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  report,
  onApplyFixes,
  onDismiss,
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getIssueIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'info':
        return 'border-blue-200 bg-blue-50'
    }
  }

  const renderIssueSection = (
    title: string,
    issues: ValidationIssue[],
    severity: 'error' | 'warning' | 'info',
    sectionKey: string
  ) => {
    if (issues.length === 0) return null

    const isExpanded = expandedSections.has(sectionKey)

    return (
      <div className={`border rounded-lg ${getSeverityColor(severity)}`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors"
        >
          <div className="flex items-center gap-2">
            {getIssueIcon(severity)}
            <span className="font-medium">
              {title} ({issues.length})
            </span>
          </div>
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-3 space-y-2">
            {issues.map((issue, index) => (
              <div key={index} className="bg-white bg-opacity-50 rounded p-3 text-sm">
                <div className="font-medium text-gray-900 mb-1">
                  {issue.message}
                </div>
                
                {issue.suggestedFix && (
                  <div className="text-gray-600 mb-2">
                    <strong>Sugestão:</strong> {issue.suggestedFix}
                  </div>
                )}

                {issue.autoFixAvailable && (
                  <div className="flex items-center gap-1 text-green-600 text-xs">
                    <Wrench className="h-3 w-3" />
                    Correção automática disponível
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (report.valid && report.warnings.length === 0 && report.infos.length === 0) {
    return (
      <div className={`border border-green-200 bg-green-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Validação concluída com sucesso</span>
        </div>
        <p className="text-green-600 text-sm mt-1">
          Todos os dados estão válidos e prontos para gerar o PDF.
        </p>
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 bg-white rounded-lg shadow-sm ${className}`}>
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {report.errors.length > 0 && getIssueIcon('error')}
            {report.warnings.length > 0 && getIssueIcon('warning')}
            {report.infos.length > 0 && getIssueIcon('info')}
          </div>
          <h3 className="font-medium text-gray-900">
            Validação dos Dados
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {report.canAutoFix && onApplyFixes && (
            <button
              onClick={onApplyFixes}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Wrench className="h-3 w-3" />
              Aplicar Correções
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Summary */}
        <div className="text-sm text-gray-600">
          {report.errors.length > 0 && (
            <span className="text-red-600 font-medium">
              {report.errors.length} erro(s)
            </span>
          )}
          {report.errors.length > 0 && (report.warnings.length > 0 || report.infos.length > 0) && ', '}
          
          {report.warnings.length > 0 && (
            <span className="text-yellow-600 font-medium">
              {report.warnings.length} aviso(s)
            </span>
          )}
          {report.warnings.length > 0 && report.infos.length > 0 && ', '}
          
          {report.infos.length > 0 && (
            <span className="text-blue-600 font-medium">
              {report.infos.length} sugestão(ões)
            </span>
          )}
        </div>

        {/* Issues sections */}
        <div className="space-y-2">
          {renderIssueSection('Erros', report.errors, 'error', 'errors')}
          {renderIssueSection('Avisos', report.warnings, 'warning', 'warnings')}
          {renderIssueSection('Sugestões', report.infos, 'info', 'infos')}
        </div>

        {/* Auto-fix notice */}
        {report.canAutoFix && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
            <div className="flex items-center gap-2 text-blue-700 font-medium mb-1">
              <Wrench className="h-4 w-4" />
              Correções Automáticas Disponíveis
            </div>
            <p className="text-blue-600">
              Alguns problemas podem ser corrigidos automaticamente. 
              Clique em "Aplicar Correções" para resolver os problemas que têm correção automática.
            </p>
          </div>
        )}

        {/* Blocking notice */}
        {!report.valid && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
            <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
              <AlertCircle className="h-4 w-4" />
              Ação Necessária
            </div>
            <p className="text-red-600">
              Existem erros que impedem a geração do PDF. 
              Corrija os problemas listados acima antes de continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ValidationPanel