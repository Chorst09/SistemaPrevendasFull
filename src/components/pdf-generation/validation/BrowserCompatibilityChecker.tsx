import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, X, RefreshCw } from 'lucide-react'
import { checkBrowserSupport } from '../../../lib/pdf/utils/error-handling'

interface BrowserCompatibilityCheckerProps {
  onCompatibilityChecked?: (compatible: boolean) => void
  showOnlyIfIncompatible?: boolean
  className?: string
}

/**
 * Component that checks browser compatibility for PDF generation
 * and displays warnings or errors if the browser is not supported
 */
export const BrowserCompatibilityChecker: React.FC<BrowserCompatibilityCheckerProps> = ({
  onCompatibilityChecked,
  showOnlyIfIncompatible = false,
  className = ''
}) => {
  const [compatibilityResult, setCompatibilityResult] = useState<{
    supported: boolean
    issues: string[]
  } | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  const checkCompatibility = async () => {
    setIsChecking(true)
    
    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const result = checkBrowserSupport()
    setCompatibilityResult(result)
    
    if (onCompatibilityChecked) {
      onCompatibilityChecked(result.supported)
    }
    
    setIsChecking(false)
  }

  useEffect(() => {
    checkCompatibility()
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  const handleRecheck = () => {
    checkCompatibility()
  }

  // Don't render if dismissed
  if (!isVisible) return null

  // Don't render if checking
  if (isChecking) {
    return (
      <div className={`border border-blue-200 bg-blue-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-2 text-blue-700">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="font-medium">Verificando compatibilidade do navegador...</span>
        </div>
      </div>
    )
  }

  // Don't render if no result yet
  if (!compatibilityResult) return null

  // Don't render if compatible and showOnlyIfIncompatible is true
  if (compatibilityResult.supported && showOnlyIfIncompatible) return null

  const isSupported = compatibilityResult.supported
  const issues = compatibilityResult.issues

  return (
    <div className={`border rounded-lg p-4 ${
      isSupported 
        ? 'border-green-200 bg-green-50' 
        : 'border-red-200 bg-red-50'
    } ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            {isSupported ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`font-medium ${
              isSupported ? 'text-green-800' : 'text-red-800'
            }`}>
              {isSupported 
                ? 'Navegador Compatível' 
                : 'Problemas de Compatibilidade Detectados'
              }
            </h3>
            
            <p className={`text-sm mt-1 ${
              isSupported ? 'text-green-700' : 'text-red-700'
            }`}>
              {isSupported 
                ? 'Seu navegador suporta todas as funcionalidades necessárias para gerar PDFs.'
                : 'Seu navegador pode não suportar algumas funcionalidades necessárias.'
              }
            </p>

            {!isSupported && issues.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Problemas encontrados:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isSupported && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">
                  Recomendações:
                </h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                    Atualize seu navegador para a versão mais recente
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                    Use Chrome 80+, Firefox 75+, ou Safari 13+
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                    Certifique-se de que o JavaScript está habilitado
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2 flex-shrink-0">•</span>
                    Tente usar o modo normal (não privado/incógnito)
                  </li>
                </ul>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleRecheck}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Verificar Novamente
              </button>
              
              {!isSupported && (
                <a
                  href="https://www.google.com/chrome/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Baixar Chrome
                </a>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default BrowserCompatibilityChecker