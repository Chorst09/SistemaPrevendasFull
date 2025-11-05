import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Download, FileX, Settings, Calculator } from 'lucide-react'
import { ServiceDeskError, ServiceDeskErrorType } from '../../../lib/types/service-desk-errors'

interface Props {
  children: ReactNode
  fallback?: (error: ServiceDeskError, retry: () => void) => ReactNode
  onError?: (error: ServiceDeskError, errorInfo: ErrorInfo) => void
  tabId?: string
}

interface State {
  hasError: boolean
  error: ServiceDeskError | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary specifically designed for Service Desk Pricing System
 * Provides fallback UI and recovery options for service desk-related errors
 */
export class ServiceDeskErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Convert generic error to ServiceDeskError
    const serviceDeskError: ServiceDeskError = {
      type: ServiceDeskErrorType.CALCULATION_ERROR,
      message: error.message || 'Erro desconhecido no sistema de precificação',
      details: error,
      tabId: undefined,
      timestamp: new Date()
    }

    return {
      hasError: true,
      error: serviceDeskError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const serviceDeskError: ServiceDeskError = {
      type: this.determineServiceDeskErrorType(error),
      message: error.message || 'Erro desconhecido no sistema de precificação',
      details: { error, errorInfo },
      tabId: this.props.tabId,
      timestamp: new Date()
    }

    this.setState({
      error: serviceDeskError,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(serviceDeskError, errorInfo)
    }

    // Log error for debugging
    console.error('Service Desk Error Boundary caught an error:', error, errorInfo)
  }

  /**
   * Determine the specific service desk error type based on the error
   */
  private determineServiceDeskErrorType(error: Error): ServiceDeskErrorType {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes('calculation') || errorMessage.includes('math') || errorMessage.includes('number')) {
      return ServiceDeskErrorType.CALCULATION_ERROR
    }
    
    if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
      return ServiceDeskErrorType.VALIDATION_ERROR
    }
    
    if (errorMessage.includes('data') || errorMessage.includes('persistence') || errorMessage.includes('storage')) {
      return ServiceDeskErrorType.DATA_PERSISTENCE_ERROR
    }
    
    if (errorMessage.includes('navigation') || errorMessage.includes('tab') || errorMessage.includes('transition')) {
      return ServiceDeskErrorType.NAVIGATION_ERROR
    }
    
    if (errorMessage.includes('integration') || errorMessage.includes('pdf') || errorMessage.includes('export')) {
      return ServiceDeskErrorType.INTEGRATION_ERROR
    }
    
    return ServiceDeskErrorType.SYSTEM_ERROR
  }

  /**
   * Retry the operation by resetting the error state
   */
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(error: ServiceDeskError): string {
    switch (error.type) {
      case ServiceDeskErrorType.CALCULATION_ERROR:
        return 'Erro nos cálculos de precificação. Verifique os dados inseridos e tente novamente.'
      case ServiceDeskErrorType.VALIDATION_ERROR:
        return 'Dados inválidos detectados. Verifique os campos obrigatórios e valores inseridos.'
      case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
        return 'Erro ao salvar os dados. Verifique sua conexão e tente novamente.'
      case ServiceDeskErrorType.NAVIGATION_ERROR:
        return 'Erro na navegação entre abas. Alguns dados podem não ter sido salvos.'
      case ServiceDeskErrorType.INTEGRATION_ERROR:
        return 'Erro na integração com outros sistemas. Algumas funcionalidades podem estar limitadas.'
      case ServiceDeskErrorType.SYSTEM_ERROR:
        return 'Erro interno do sistema. Nossa equipe foi notificada.'
      default:
        return error.message || 'Erro desconhecido no sistema de precificação.'
    }
  }

  /**
   * Get recovery suggestions based on error type
   */
  private getRecoverySuggestions(error: ServiceDeskError): string[] {
    switch (error.type) {
      case ServiceDeskErrorType.CALCULATION_ERROR:
        return [
          'Verifique se todos os valores numéricos são válidos',
          'Confirme se os salários e custos estão preenchidos corretamente',
          'Tente recalcular os valores manualmente',
          'Remova equipamentos ou membros da equipe temporariamente'
        ]
      case ServiceDeskErrorType.VALIDATION_ERROR:
        return [
          'Preencha todos os campos obrigatórios marcados com *',
          'Verifique se as datas estão no formato correto',
          'Confirme se os valores percentuais estão entre 0 e 100',
          'Remova caracteres especiais dos campos de texto'
        ]
      case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
        return [
          'Verifique sua conexão com a internet',
          'Libere espaço no navegador limpando dados de sites',
          'Tente usar o modo privado/incógnito do navegador',
          'Exporte os dados como backup antes de continuar'
        ]
      case ServiceDeskErrorType.NAVIGATION_ERROR:
        return [
          'Salve os dados da aba atual antes de navegar',
          'Recarregue a página e tente novamente',
          'Verifique se todos os campos obrigatórios estão preenchidos',
          'Use os botões de navegação do sistema ao invés do navegador'
        ]
      case ServiceDeskErrorType.INTEGRATION_ERROR:
        return [
          'Verifique se o sistema PDF está funcionando',
          'Tente exportar os dados em formato alternativo',
          'Aguarde alguns minutos e tente novamente',
          'Entre em contato com o suporte se o problema persistir'
        ]
      case ServiceDeskErrorType.SYSTEM_ERROR:
        return [
          'Recarregue a página e tente novamente',
          'Limpe o cache do navegador',
          'Tente usar outro navegador',
          'Entre em contato com o suporte técnico'
        ]
      default:
        return ['Tente novamente em alguns instantes']
    }
  }

  /**
   * Get appropriate icon for error type
   */
  private getErrorIcon(error: ServiceDeskError) {
    switch (error.type) {
      case ServiceDeskErrorType.CALCULATION_ERROR:
        return <Calculator className="h-8 w-8 text-orange-500" />
      case ServiceDeskErrorType.VALIDATION_ERROR:
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />
      case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
        return <Download className="h-8 w-8 text-blue-500" />
      case ServiceDeskErrorType.NAVIGATION_ERROR:
        return <Settings className="h-8 w-8 text-purple-500" />
      case ServiceDeskErrorType.INTEGRATION_ERROR:
        return <FileX className="h-8 w-8 text-red-500" />
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />
    }
  }

  /**
   * Get error severity level
   */
  private getErrorSeverity(error: ServiceDeskError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case ServiceDeskErrorType.VALIDATION_ERROR:
        return 'low'
      case ServiceDeskErrorType.CALCULATION_ERROR:
      case ServiceDeskErrorType.NAVIGATION_ERROR:
        return 'medium'
      case ServiceDeskErrorType.DATA_PERSISTENCE_ERROR:
      case ServiceDeskErrorType.INTEGRATION_ERROR:
        return 'high'
      case ServiceDeskErrorType.SYSTEM_ERROR:
        return 'critical'
      default:
        return 'medium'
    }
  }

  /**
   * Get severity-based styling
   */
  private getSeverityStyles(severity: 'low' | 'medium' | 'high' | 'critical') {
    switch (severity) {
      case 'low':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800'
        }
      case 'medium':
        return {
          border: 'border-orange-200',
          bg: 'bg-orange-50',
          text: 'text-orange-800'
        }
      case 'high':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          text: 'text-red-800'
        }
      case 'critical':
        return {
          border: 'border-red-300',
          bg: 'bg-red-100',
          text: 'text-red-900'
        }
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          text: 'text-gray-800'
        }
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry)
      }

      // Default fallback UI
      const error = this.state.error
      const errorMessage = this.getErrorMessage(error)
      const suggestions = this.getRecoverySuggestions(error)
      const icon = this.getErrorIcon(error)
      const severity = this.getErrorSeverity(error)
      const styles = this.getSeverityStyles(severity)

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className={`max-w-lg w-full bg-white rounded-lg shadow-lg border ${styles.border} p-6`}>
            <div className="flex items-center justify-center mb-4">
              {icon}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Erro no Sistema de Precificação
            </h2>

            {error.tabId && (
              <p className="text-sm text-gray-500 text-center mb-2">
                Aba: {error.tabId}
              </p>
            )}
            
            <p className="text-gray-600 text-center mb-4">
              {errorMessage}
            </p>

            <div className={`p-3 rounded-md ${styles.bg} mb-4`}>
              <p className={`text-sm font-medium ${styles.text}`}>
                Severidade: {severity === 'low' ? 'Baixa' : severity === 'medium' ? 'Média' : severity === 'high' ? 'Alta' : 'Crítica'}
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Sugestões para resolver:
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Recarregar Página
              </button>
            </div>

            {/* Show technical details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-gray-50 rounded border">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                  Detalhes Técnicos
                </summary>
                <div className="mt-2 text-xs text-gray-600">
                  <p><strong>Tipo:</strong> {error.type}</p>
                  <p><strong>Mensagem:</strong> {error.message}</p>
                  <p><strong>Timestamp:</strong> {error.timestamp.toLocaleString('pt-BR')}</p>
                  {error.tabId && <p><strong>Aba:</strong> {error.tabId}</p>}
                  {error.details && (
                    <pre className="mt-2 whitespace-pre-wrap break-all">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ServiceDeskErrorBoundary