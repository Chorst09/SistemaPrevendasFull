/**
 * Unit Tests for PDFGenerator
 * Tests core PDF generation functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PDFGenerator, PDFGeneratorComponent } from '../generators/PDFGenerator'
import { ProposalData, ClientData, PDFErrorType } from '../../../lib/pdf/types'

// Mock jsPDF
vi.mock('../../../lib/pdf/utils/imports', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297
      },
      getCurrentPageInfo: () => ({ pageNumber: 1 })
    },
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setDrawColor: vi.fn(),
    setLineWidth: vi.fn(),
    rect: vi.fn(),
    text: vi.fn(),
    line: vi.fn(),
    addPage: vi.fn(),
    splitTextToSize: vi.fn().mockReturnValue(['test']),
    output: vi.fn().mockReturnValue(new Blob(['test'], { type: 'application/pdf' }))
  }))
}))

// Mock error handling
vi.mock('../../../lib/pdf/utils/error-handling', () => ({
  pdfErrorHandler: {
    createError: vi.fn((type, message, details) => ({ type, message, details })),
    checkPDFSizeLimits: vi.fn().mockReturnValue({ withinLimits: true, warnings: [] })
  },
  validatePDFData: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  checkBrowserSupport: vi.fn().mockReturnValue({ supported: true, issues: [] })
}))

// Mock performance cache
vi.mock('../../../lib/pdf/utils/performance-cache', () => ({
  pdfCache: {
    generateProposalKey: vi.fn().mockReturnValue('test-key'),
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    getTemplate: vi.fn().mockReturnValue(null),
    setTemplate: vi.fn()
  },
  PDFSizeOptimizer: {
    getOptimizedSettings: vi.fn().mockReturnValue({
      orientation: 'portrait',
      format: 'a4',
      compress: true,
      precision: 2,
      userUnit: 1.0,
      hotfixes: ['px_scaling']
    }),
    optimizeTextSettings: vi.fn().mockReturnValue({
      fontSize: { title: 14, header: 12, body: 10, small: 8 },
      lineHeight: 1.2,
      maxLineLength: 80
    })
  }
}))

// Mock ProposalTemplate
vi.mock('../templates/ProposalTemplate', () => ({
  default: vi.fn().mockImplementation(() => ({
    render: vi.fn()
  }))
}))

describe('PDFGenerator', () => {
  let mockProposalData: ProposalData
  let mockClientData: ClientData

  beforeEach(() => {
    mockProposalData = {
      equipments: [
        {
          id: '1',
          model: 'Test Model',
          brand: 'Test Brand',
          type: 'Printer',
          monthlyVolume: 1000,
          monthlyCost: 500,
          specifications: { color: 'Yes', duplex: 'Yes' }
        }
      ],
      totalMonthly: 500,
      totalAnnual: 6000,
      contractPeriod: 12,
      generatedAt: new Date('2024-01-01')
    }

    mockClientData = {
      companyName: 'Test Company',
      contactName: 'John Doe',
      email: 'john@test.com',
      phone: '123-456-7890',
      projectName: 'Test Project',
      managerName: 'Jane Manager',
      managerEmail: 'jane@test.com',
      managerPhone: '098-765-4321'
    }

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('PDFGenerator Class', () => {
    it('should create a PDFGenerator instance', () => {
      const generator = new PDFGenerator()
      expect(generator).toBeInstanceOf(PDFGenerator)
    })

    it('should generate PDF successfully with valid data', async () => {
      const generator = new PDFGenerator()
      const result = await generator.generatePDF(mockProposalData, mockClientData)

      expect(result).toHaveProperty('blob')
      expect(result).toHaveProperty('url')
      expect(result.blob).toBeInstanceOf(Blob)
      expect(typeof result.url).toBe('string')
    })

    it('should use cached result when available', async () => {
      const { pdfCache } = await import('../../../lib/pdf/utils/performance-cache')
      const cachedResult = { 
        blob: new Blob(['cached'], { type: 'application/pdf' }), 
        url: 'cached-url' 
      }
      
      vi.mocked(pdfCache.get).mockReturnValue(cachedResult)

      const generator = new PDFGenerator()
      const result = await generator.generatePDF(mockProposalData, mockClientData)

      expect(result).toBe(cachedResult)
      expect(pdfCache.get).toHaveBeenCalledWith('test-key')
    })

    it('should set company info correctly', () => {
      const generator = new PDFGenerator()
      const companyInfo = {
        name: 'New Company',
        email: 'new@company.com'
      }

      generator.setCompanyInfo(companyInfo)
      // Since companyInfo is private, we can't directly test it
      // but we can verify the method doesn't throw
      expect(() => generator.setCompanyInfo(companyInfo)).not.toThrow()
    })

    it('should handle browser compatibility errors', async () => {
      const { checkBrowserSupport } = await import('../../../lib/pdf/utils/error-handling')
      vi.mocked(checkBrowserSupport).mockReturnValue({
        supported: false,
        issues: ['Canvas not supported']
      })

      const generator = new PDFGenerator()
      
      await expect(generator.generatePDF(mockProposalData, mockClientData))
        .rejects.toMatchObject({
          type: PDFErrorType.BROWSER_NOT_SUPPORTED
        })
    })

    it('should handle invalid data errors', async () => {
      const { validatePDFData } = await import('../../../lib/pdf/utils/error-handling')
      vi.mocked(validatePDFData).mockReturnValue({
        valid: false,
        errors: ['Missing client name']
      })

      const generator = new PDFGenerator()
      
      await expect(generator.generatePDF(mockProposalData, mockClientData))
        .rejects.toMatchObject({
          type: PDFErrorType.INVALID_DATA
        })
    })
  })

  describe('PDFGeneratorComponent', () => {
    const mockOnPDFGenerated = vi.fn()
    const mockOnError = vi.fn()

    beforeEach(() => {
      mockOnPDFGenerated.mockClear()
      mockOnError.mockClear()
    })

    it('should render generate button', () => {
      render(
        <PDFGeneratorComponent
          proposalData={mockProposalData}
          clientData={mockClientData}
          onPDFGenerated={mockOnPDFGenerated}
          onError={mockOnError}
        />
      )

      expect(screen.getByText('Gerar PDF')).toBeInTheDocument()
    })

    it('should show loading state when generating', async () => {
      render(
        <PDFGeneratorComponent
          proposalData={mockProposalData}
          clientData={mockClientData}
          onPDFGenerated={mockOnPDFGenerated}
          onError={mockOnError}
        />
      )

      const button = screen.getByText('Gerar PDF')
      fireEvent.click(button)

      // Should show loading component
      await waitFor(() => {
        expect(screen.getByText('Validando dados')).toBeInTheDocument()
      })
    })

    it('should call onPDFGenerated on successful generation', async () => {
      render(
        <PDFGeneratorComponent
          proposalData={mockProposalData}
          clientData={mockClientData}
          onPDFGenerated={mockOnPDFGenerated}
          onError={mockOnError}
        />
      )

      const button = screen.getByText('Gerar PDF')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnPDFGenerated).toHaveBeenCalledWith(
          expect.any(Blob),
          expect.any(String)
        )
      })
    })

    it('should call onError on generation failure', async () => {
      const { validatePDFData } = await import('../../../lib/pdf/utils/error-handling')
      vi.mocked(validatePDFData).mockReturnValue({
        valid: false,
        errors: ['Test error']
      })

      render(
        <PDFGeneratorComponent
          proposalData={mockProposalData}
          clientData={mockClientData}
          onPDFGenerated={mockOnPDFGenerated}
          onError={mockOnError}
        />
      )

      const button = screen.getByText('Gerar PDF')
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.objectContaining({
            type: PDFErrorType.INVALID_DATA
          })
        )
      })
    })

    it('should handle retry logic for failed generations', async () => {
      let callCount = 0
      const { validatePDFData } = await import('../../../lib/pdf/utils/error-handling')
      
      vi.mocked(validatePDFData).mockImplementation(() => {
        callCount++
        if (callCount <= 2) {
          return { valid: false, errors: ['Temporary error'] }
        }
        return { valid: true, errors: [] }
      })

      render(
        <PDFGeneratorComponent
          proposalData={mockProposalData}
          clientData={mockClientData}
          onPDFGenerated={mockOnPDFGenerated}
          onError={mockOnError}
        />
      )

      const button = screen.getByText('Gerar PDF')
      fireEvent.click(button)

      // Should eventually succeed after retries
      await waitFor(() => {
        expect(mockOnPDFGenerated).toHaveBeenCalled()
      }, { timeout: 5000 })
    })
  })
})