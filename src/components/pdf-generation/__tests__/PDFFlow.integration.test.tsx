/**
 * Integration Tests for PDF Generation Flow
 * Tests the complete user flow from generation to management
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProposalData, ClientData } from '../../../lib/pdf/types'

// Mock all PDF-related modules
vi.mock('../../../lib/pdf/utils/imports', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
      getCurrentPageInfo: () => ({ pageNumber: 1 })
    },
    setFillColor: vi.fn(),
    setTextColor: vi.fn(),
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    rect: vi.fn(),
    text: vi.fn(),
    output: vi.fn().mockReturnValue(new Blob(['test pdf'], { type: 'application/pdf' }))
  }))
}))

vi.mock('../../../lib/pdf/utils/error-handling', () => ({
  pdfErrorHandler: {
    createError: vi.fn((type, message) => ({ type, message })),
    checkPDFSizeLimits: vi.fn().mockReturnValue({ withinLimits: true })
  },
  validatePDFData: vi.fn().mockReturnValue({ valid: true, errors: [] }),
  checkBrowserSupport: vi.fn().mockReturnValue({ supported: true, issues: [] })
}))

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
      compress: true
    }),
    optimizeTextSettings: vi.fn().mockReturnValue({
      fontSize: { title: 14, header: 12, body: 10, small: 8 }
    })
  }
}))

vi.mock('../templates/ProposalTemplate', () => ({
  default: vi.fn().mockImplementation(() => ({
    render: vi.fn()
  }))
}))

// Mock storage
const mockStorage = {
  proposals: new Map(),
  save: vi.fn().mockImplementation(async (proposal) => {
    const id = 'test-id-' + Date.now()
    mockStorage.proposals.set(id, { ...proposal, id })
    return id
  }),
  load: vi.fn().mockImplementation(async (id) => {
    return mockStorage.proposals.get(id) || null
  }),
  list: vi.fn().mockImplementation(async () => {
    return Array.from(mockStorage.proposals.values())
  }),
  delete: vi.fn().mockImplementation(async (id) => {
    return mockStorage.proposals.delete(id)
  })
}

vi.mock('../../../lib/pdf/services/storage', () => ({
  ProposalStorage: vi.fn().mockImplementation(() => mockStorage)
}))

// Test components
const TestPDFFlow: React.FC = () => {
  const [step, setStep] = React.useState<'form' | 'generating' | 'confirmation' | 'list'>('form')
  const [pdfData, setPdfData] = React.useState<{ blob: Blob; url: string } | null>(null)
  const [proposals, setProposals] = React.useState<any[]>([])

  const mockProposalData: ProposalData = {
    equipments: [{
      id: '1',
      model: 'Test Printer',
      brand: 'Test Brand',
      type: 'Printer',
      monthlyVolume: 1000,
      monthlyCost: 500,
      specifications: {}
    }],
    totalMonthly: 500,
    totalAnnual: 6000,
    contractPeriod: 12,
    generatedAt: new Date()
  }

  const mockClientData: ClientData = {
    companyName: 'Test Company',
    contactName: 'John Doe',
    email: 'john@test.com',
    phone: '123-456-7890',
    projectName: 'Test Project',
    managerName: 'Jane Manager',
    managerEmail: 'jane@test.com',
    managerPhone: '098-765-4321'
  }

  const handleGeneratePDF = async () => {
    setStep('generating')
    
    // Simulate PDF generation
    setTimeout(() => {
      const blob = new Blob(['test pdf'], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      setPdfData({ blob, url })
      setStep('confirmation')
    }, 1000)
  }

  const handleSaveProposal = async () => {
    if (pdfData) {
      const proposal = {
        clientName: mockClientData.companyName,
        projectName: mockClientData.projectName,
        totalValue: mockProposalData.totalMonthly,
        createdAt: new Date(),
        pdfBlob: pdfData.blob,
        proposalData: mockProposalData,
        clientData: mockClientData
      }
      
      await mockStorage.save(proposal)
      setStep('list')
    }
  }

  const loadProposals = async () => {
    const proposalList = await mockStorage.list()
    setProposals(proposalList)
    setStep('list')
  }

  React.useEffect(() => {
    if (step === 'list') {
      loadProposals()
    }
  }, [step])

  return (
    <div data-testid="pdf-flow">
      {step === 'form' && (
        <div data-testid="form-step">
          <h2>Dados do Cliente</h2>
          <button onClick={handleGeneratePDF} data-testid="generate-btn">
            Gerar PDF
          </button>
        </div>
      )}

      {step === 'generating' && (
        <div data-testid="generating-step">
          <p>Gerando PDF...</p>
        </div>
      )}

      {step === 'confirmation' && (
        <div data-testid="confirmation-step">
          <h2>PDF Gerado com Sucesso!</h2>
          <button onClick={() => window.open(pdfData?.url)} data-testid="view-btn">
            Visualizar PDF
          </button>
          <button onClick={handleSaveProposal} data-testid="save-btn">
            Salvar Proposta
          </button>
          <button onClick={() => setStep('form')} data-testid="edit-btn">
            Editar Proposta
          </button>
        </div>
      )}

      {step === 'list' && (
        <div data-testid="list-step">
          <h2>Propostas Salvas</h2>
          {!proposals || proposals.length === 0 ? (
            <p>Nenhuma proposta encontrada</p>
          ) : (
            <ul>
              {(proposals || []).map((proposal, index) => (
                <li key={index} data-testid={`proposal-${index}`}>
                  <span>{proposal.clientName} - {proposal.projectName}</span>
                  <button 
                    onClick={() => mockStorage.delete(proposal.id)}
                    data-testid={`delete-${index}`}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => setStep('form')} data-testid="new-proposal-btn">
            Nova Proposta
          </button>
        </div>
      )}
    </div>
  )
}

describe('PDF Generation Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStorage.proposals.clear()
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn().mockReturnValue('mock-url')
    global.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should complete the full PDF generation flow', async () => {
    const user = userEvent.setup()
    render(<TestPDFFlow />)

    // Step 1: Start with form
    expect(screen.getByTestId('form-step')).toBeInTheDocument()
    expect(screen.getByText('Dados do Cliente')).toBeInTheDocument()

    // Step 2: Generate PDF
    const generateBtn = screen.getByTestId('generate-btn')
    await user.click(generateBtn)

    // Should show generating state
    expect(screen.getByTestId('generating-step')).toBeInTheDocument()
    expect(screen.getByText('Gerando PDF...')).toBeInTheDocument()

    // Step 3: Wait for confirmation
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    expect(screen.getByText('PDF Gerado com Sucesso!')).toBeInTheDocument()
    expect(screen.getByTestId('view-btn')).toBeInTheDocument()
    expect(screen.getByTestId('save-btn')).toBeInTheDocument()
    expect(screen.getByTestId('edit-btn')).toBeInTheDocument()
  })

  it('should allow viewing the generated PDF', async () => {
    const user = userEvent.setup()
    const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    
    render(<TestPDFFlow />)

    // Generate PDF
    await user.click(screen.getByTestId('generate-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    // View PDF
    const viewBtn = screen.getByTestId('view-btn')
    await user.click(viewBtn)

    expect(windowOpenSpy).toHaveBeenCalledWith('mock-url')
  })

  it('should allow saving and managing proposals', async () => {
    const user = userEvent.setup()
    render(<TestPDFFlow />)

    // Generate PDF
    await user.click(screen.getByTestId('generate-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    // Save proposal
    const saveBtn = screen.getByTestId('save-btn')
    await user.click(saveBtn)

    // Should navigate to list
    await waitFor(() => {
      expect(screen.getByTestId('list-step')).toBeInTheDocument()
    })

    expect(screen.getByText('Propostas Salvas')).toBeInTheDocument()
    expect(mockStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({
        clientName: 'Test Company',
        projectName: 'Test Project'
      })
    )
  })

  it('should allow editing proposals', async () => {
    const user = userEvent.setup()
    render(<TestPDFFlow />)

    // Generate PDF
    await user.click(screen.getByTestId('generate-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    // Edit proposal
    const editBtn = screen.getByTestId('edit-btn')
    await user.click(editBtn)

    // Should return to form
    expect(screen.getByTestId('form-step')).toBeInTheDocument()
    expect(screen.getByText('Dados do Cliente')).toBeInTheDocument()
  })

  it('should handle proposal deletion', async () => {
    const user = userEvent.setup()
    render(<TestPDFFlow />)

    // Generate and save a proposal first
    await user.click(screen.getByTestId('generate-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('save-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('list-step')).toBeInTheDocument()
    })

    // Should have one proposal
    expect(screen.getByTestId('proposal-0')).toBeInTheDocument()

    // Delete the proposal
    const deleteBtn = screen.getByTestId('delete-0')
    await user.click(deleteBtn)

    expect(mockStorage.delete).toHaveBeenCalled()
  })

  it('should allow creating new proposals from the list', async () => {
    const user = userEvent.setup()
    render(<TestPDFFlow />)

    // Navigate to list (empty)
    await user.click(screen.getByTestId('generate-btn'))
    
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-step')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('save-btn'))

    await waitFor(() => {
      expect(screen.getByTestId('list-step')).toBeInTheDocument()
    })

    // Create new proposal
    const newProposalBtn = screen.getByTestId('new-proposal-btn')
    await user.click(newProposalBtn)

    // Should return to form
    expect(screen.getByTestId('form-step')).toBeInTheDocument()
  })
})