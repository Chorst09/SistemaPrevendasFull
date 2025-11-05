import React, { useState } from 'react'
import { jsPDF } from '../../../lib/pdf/utils/imports'
import { 
  ProposalData, 
  ClientData,
  CompanyInfo 
} from '../../../lib/types/pdf/core'
import { 
  PDFError, 
  PDFErrorType
} from '../../../lib/types/pdf/errors'
import { 
  PDFGeneratorProps
} from '../../../lib/types/pdf/components'
import ProposalTemplate from '../templates/ProposalTemplate'
import { pdfErrorHandler, validatePDFData, checkBrowserSupport } from '../../../lib/pdf/utils/error-handling'
import { pdfCache, PDFSizeOptimizer } from '../../../lib/pdf/utils/performance-cache'

/**
 * PDFGenerator Component
 * Handles the generation of professional PDF proposals using jsPDF
 */
export class PDFGenerator {
  private doc: any
  private companyInfo: CompanyInfo

  constructor() {
    this.doc = null
    this.companyInfo = {
      name: 'Sua Empresa',
      logo: '',
      address: 'Endereço da Empresa',
      phone: '(11) 9999-9999',
      email: 'contato@empresa.com',
      website: 'www.empresa.com'
    }
  }

  /**
   * Main method to generate PDF from proposal and client data
   */
  async generatePDF(proposalData: ProposalData, clientData: ClientData): Promise<{ blob: Blob; url: string }> {
    // Generate cache key for this proposal
    const cacheKey = pdfCache.generateProposalKey(proposalData, clientData)
    
    // Check cache first
    const cachedResult = pdfCache.get<{ blob: Blob; url: string }>(cacheKey)
    if (cachedResult) {
      return cachedResult
    }

    // Check browser compatibility first
    const browserCheck = checkBrowserSupport()
    if (!browserCheck.supported) {
      throw pdfErrorHandler.createError(
        PDFErrorType.BROWSER_NOT_SUPPORTED,
        'Navegador não suporta geração de PDF',
        { issues: browserCheck.issues }
      )
    }

    // Validate input data
    const validation = validatePDFData(proposalData, clientData)
    if (!validation.valid) {
      throw pdfErrorHandler.createError(
        PDFErrorType.INVALID_DATA,
        'Dados inválidos para geração do PDF',
        { errors: validation.errors }
      )
    }

    // Check PDF size limits
    const sizeCheck = pdfErrorHandler.checkPDFSizeLimits(proposalData.equipments.length)
    if (!sizeCheck.withinLimits) {
      console.warn('PDF Size Warning:', sizeCheck.warnings)
    }

    try {
      // Initialize jsPDF document with optimized settings
      const optimizedSettings = PDFSizeOptimizer.getOptimizedSettings()
      this.doc = new jsPDF({
        orientation: optimizedSettings.orientation as any,
        unit: 'mm',
        format: optimizedSettings.format,
        compress: optimizedSettings.compress,
        precision: optimizedSettings.precision,
        userUnit: optimizedSettings.userUnit,
        hotfixes: optimizedSettings.hotfixes
      })

      // Check for cached template
      const templateKey = 'proposal-template-v1'
      let templateCache = pdfCache.getTemplate(templateKey)
      
      if (!templateCache) {
        // Create and cache template data
        templateCache = {
          colorPalette: {
            primary: [37, 99, 235],
            secondary: [100, 116, 139],
            accent: [5, 150, 105],
            text: [31, 41, 55],
            lightGray: [248, 250, 252]
          },
          fontMetrics: PDFSizeOptimizer.optimizeTextSettings()
        }
        pdfCache.setTemplate(templateKey, templateCache)
      }

      // Use professional template to render PDF content
      const template = new ProposalTemplate(this.doc)
      template.render(proposalData, clientData, this.companyInfo)

      // Generate blob and URL with optimization
      const pdfBlob = this.doc.output('blob')
      
      // Check if blob was created successfully
      if (!pdfBlob || pdfBlob.size === 0) {
        throw pdfErrorHandler.createError(
          PDFErrorType.GENERATION_FAILED,
          'PDF gerado está vazio ou corrompido'
        )
      }

      const pdfUrl = URL.createObjectURL(pdfBlob)
      const result = { blob: pdfBlob, url: pdfUrl }

      // Cache the result for future use (5 minutes cache)
      pdfCache.set(cacheKey, result, 5 * 60 * 1000)

      return result
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('memory') || errorMessage.includes('quota')) {
          throw pdfErrorHandler.createError(
            PDFErrorType.STORAGE_FAILED,
            'Memória insuficiente para gerar o PDF',
            error
          )
        }
        
        if (errorMessage.includes('canvas') || errorMessage.includes('render')) {
          throw pdfErrorHandler.createError(
            PDFErrorType.GENERATION_FAILED,
            'Erro na renderização do PDF',
            error
          )
        }
      }

      throw pdfErrorHandler.createError(
        PDFErrorType.GENERATION_FAILED,
        'Falha na geração do PDF',
        error
      )
    }
  }



  /**
   * Create standardized error object (deprecated - use pdfErrorHandler)
   */
  private createError(type: PDFErrorType, message: string, details?: any): PDFError {
    return pdfErrorHandler.createError(type, message, details)
  }

  /**
   * Set company information for the PDF
   */
  setCompanyInfo(companyInfo: Partial<CompanyInfo>): void {
    this.companyInfo = { ...this.companyInfo, ...companyInfo }
  }
}

/**
 * React component wrapper for PDFGenerator
 */
export const PDFGeneratorComponent: React.FC<PDFGeneratorProps> = ({
  proposalData,
  clientData,
  onPDFGenerated,
  onError
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const maxRetries = 2

  const generationSteps = [
    'Validando dados',
    'Inicializando PDF',
    'Renderizando template',
    'Otimizando arquivo',
    'Finalizando'
  ]

  const handleGenerate = async (isRetry = false) => {
    setIsGenerating(true)
    setProgress(0)
    
    try {
      // Step 1: Pre-flight checks
      setCurrentStep(generationSteps[0])
      setProgress(20)
      
      const browserCheck = checkBrowserSupport()
      if (!browserCheck.supported) {
        throw pdfErrorHandler.createError(
          PDFErrorType.BROWSER_NOT_SUPPORTED,
          'Seu navegador não suporta esta funcionalidade',
          { issues: browserCheck.issues }
        )
      }

      const validation = validatePDFData(proposalData, clientData)
      if (!validation.valid) {
        throw pdfErrorHandler.createError(
          PDFErrorType.INVALID_DATA,
          'Por favor, corrija os dados antes de gerar o PDF',
          { errors: validation.errors }
        )
      }

      // Step 2: Initialize generator
      setCurrentStep(generationSteps[1])
      setProgress(40)
      
      const generator = new PDFGenerator()
      
      // Step 3: Generate PDF
      setCurrentStep(generationSteps[2])
      setProgress(60)
      
      const { blob, url } = await generator.generatePDF(proposalData, clientData)
      
      // Step 4: Optimize
      setCurrentStep(generationSteps[3])
      setProgress(80)
      
      // Small delay to show optimization step
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Step 5: Finalize
      setCurrentStep(generationSteps[4])
      setProgress(100)
      
      // Reset retry count on success
      setRetryCount(0)
      
      // Small delay before completing
      await new Promise(resolve => setTimeout(resolve, 200))
      
      onPDFGenerated(blob, url)
    } catch (error) {
      const pdfError = error as PDFError
      
      // Attempt automatic retry for certain error types
      if (!isRetry && retryCount < maxRetries && pdfError.type === PDFErrorType.GENERATION_FAILED) {
        console.log(`Tentativa automática ${retryCount + 1}/${maxRetries}`)
        setRetryCount(prev => prev + 1)
        
        // Wait a bit before retrying
        setTimeout(() => {
          handleGenerate(true)
        }, 1000)
        return
      }
      
      onError(pdfError)
    } finally {
      setIsGenerating(false)
      setCurrentStep('')
      setProgress(0)
    }
  }

  const handleRetry = () => {
    setRetryCount(0)
    handleGenerate()
  }

  if (isGenerating) {
    // Import the loading component dynamically to avoid circular imports
    const PDFGenerationLoading = React.lazy(() => 
      import('../ui/LoadingAnimations').then(module => ({ 
        default: module.PDFGenerationLoading 
      }))
    )

    return (
      <div className="pdf-generator">
        <React.Suspense fallback={
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <PDFGenerationLoading 
            currentStep={currentStep}
            steps={generationSteps}
            progress={progress}
          />
        </React.Suspense>
        
        {retryCount > 0 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-yellow-600">
              Tentativa {retryCount}/{maxRetries} - Tentando novamente automaticamente...
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="pdf-generator">
      <button 
        onClick={() => handleGenerate()}
        disabled={isGenerating}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 transform hover:scale-105 active:scale-95 font-medium shadow-lg"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar PDF
        </span>
      </button>
    </div>
  )
}

export default PDFGenerator