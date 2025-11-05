import React, { Component, ErrorInfo, ReactNode } from 'react'
import { PDFError, PDFErrorType } from '../../../lib/pdf/types'
import { AlertTriangle, RefreshCw, Download, FileX } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: (error: PDFError, retry: () => void) => ReactNode
  onError?: (error: PDFError, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: PDFError | null
  errorInfo: ErrorInfo | null
}

/**
 * Error Boundary specifically designed for PDF generation components
 * Provides fallback UI and recovery options for PDF-related errors
 */
export class PDFErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Convert generic error to PDFError
    const pdfError: PDFError = {
      type: PDFErrorType.GENERATION_FAILED,
      message: error.message || 'Erro desconhecido na geração do PDF',
      details: error
    }

    return {
      hasError: true,
      error: pdfError
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const pdfError: PDFError = {
      type: this.determinePDFErrorType(error),
      message: error.message || 'Erro desconhecido na geração do PDF',
      details: { error, errorInfo }
    }

    this.setState({
      error: pdfError,
      errorInfo
    })

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(pdfError, errorInfo)
    }

    // Log error for debugging
    console.error('PDF Error Boundary caught an error:', error, errorInfo)
  }

  /**
   * Determine the specific PDF error type based on the error
   */
  private determinePDFErrorType(error: Error): PDFErrorType {
    const errorMessage = error.message.toLowerCase()
    
    if (errorMessage.includes('storage') || errorMessage.includes('indexeddb')) {
      return PDFErrorType.STORAGE_FAILED
    }
    
    if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
      return PDFErrorType.INVALID_DATA
    }
    
    if (errorMessage.includes('browser') || errorMessage.includes('not supported')) {
      return PDFErrorType.BROWSER_NOT_SUPPORTED
    }
    
    return PDFErrorType.GENERATION_FAILED
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
  private getErrorMessage(error: PDFError): string {
    switch (error.type) {
      case PDFErrorType.GENERATION_FAILED:
        return 'Falha na geração do PDF. Verifique os dados e tente novamente.'
      case PDFErrorType.STORAGE_FAILED:
        return 'Erro ao salvar o PDF. Verifique o espaço disponível no navegador.'
      case PDFErrorType.INVALID_DATA:
        return 'Dados inválidos detectados. Verifique as informações inseridas.'
      case PDFErrorType.BROWSER_NOT_SUPPORTED:
        return 'Seu navegador não suporta esta funcionalidade. Atualize ou use outro navegador.'
      default:
        return error.message || 'Erro desconhecido na geração do PDF.'
    }
  }

  /**
   * Get recovery suggestions based on error type
   */
  private getRecoverySuggestions(error: PDFError): string[] {
    switch (error.type) {
      case PDFErrorType.GENERATION_FAILED:
        return [
          'Verifique se todos os campos obrigatórios estão preenchidos',
          'Tente reduzir a quantidade de equipamentos',
          'Recarregue a página e tente novamente'
        ]
      case PDFErrorType.STORAGE_FAILED:
        return [
          'Libere espaço no navegador limpando dados de sites',
          'Tente fazer download direto do PDF',
          'Use o modo privado/incógnito do navegador'
        ]
      case PDFErrorType.INVALID_DATA:
        return [
          'Verifique se todos os valores numéricos são válidos',
          'Confirme se os dados do cliente estão completos',
          'Remova caracteres especiais dos campos de texto'
        ]
      case PDFErrorType.BROWSER_NOT_SUPPORTED:
        return [
          'Atualize seu navegador para a versão mais recente',
          'Use Chrome, Firefox ou Safari',
          'Ative o JavaScript se estiver desabilitado'
        ]
      default:
        return ['Tente novamente em alguns instantes']
    }
  }

  /**
   * Get appropriate icon for error type
   */
  private getErrorIcon(error: PDFError) {
    switch (error.type) {
      case PDFErrorType.STORAGE_FAILED:
        return <Download className="h-8 w-8 text-orange-500" />
      case PDFErrorType.BROWSER_NOT_SUPPORTED:
        return <FileX className="h-8 w-8 text-red-500" />
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />
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

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-red-200 p-6">
            <div className="flex items-center justify-center mb-4">
              {icon}
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Erro na Geração do PDF
            </h2>
            
            <p className="text-gray-600 text-center mb-4">
              {errorMessage}
            </p>

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

export default PDFErrorBoundary