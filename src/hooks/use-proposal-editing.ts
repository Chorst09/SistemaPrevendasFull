import { useState, useCallback } from 'react'
import { proposalStorage } from '../lib/pdf/services/storage'
import { SavedProposal, ClientData as PDFClientData, ProposalData } from '../lib/pdf/types'
import { ClientData } from '../components/calculators/ProposalClientForm'
import { useToast } from './use-toast'

interface PrinterItem {
  id: string
  printerId?: string
  modelo?: string
  marca?: string
  tipo: string
  volumeMensal: number
  custoPorPagina: number
  custoMensal: number
  custoAnual: number
  prazoContrato: number
  valorMensalLocacao?: number
  isFromCatalog: boolean
}

interface EditingState {
  isEditing: boolean
  proposalId: string | null
  originalProposal: SavedProposal | null
  printerItems: PrinterItem[]
  clientData: ClientData | null
}

export function useProposalEditing() {
  const [editingState, setEditingState] = useState<EditingState>({
    isEditing: false,
    proposalId: null,
    originalProposal: null,
    printerItems: [],
    clientData: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Convert PDF client data to form client data
  const convertPDFClientDataToForm = useCallback((pdfClientData: PDFClientData): ClientData => {
    return {
      razaoSocial: pdfClientData.companyName,
      nomeContato: pdfClientData.contactName,
      telefoneCliente: pdfClientData.phone,
      emailCliente: pdfClientData.email,
      nomeProjeto: pdfClientData.projectName,
      nomeGerente: pdfClientData.managerName,
      telefoneGerente: pdfClientData.managerPhone,
      emailGerente: pdfClientData.managerEmail
    }
  }, [])

  // Convert proposal data to printer items
  const convertProposalDataToPrinterItems = useCallback((proposalData: ProposalData): PrinterItem[] => {
    return proposalData.equipments.map((equipment, index) => {
      const specs = equipment.specifications || {}
      
      return {
        id: equipment.id || `item-${index}`,
        printerId: specs.printerId,
        modelo: equipment.model,
        marca: equipment.brand,
        tipo: equipment.type,
        volumeMensal: equipment.monthlyVolume,
        custoPorPagina: equipment.monthlyCost / equipment.monthlyVolume,
        custoMensal: equipment.monthlyCost,
        custoAnual: specs.custoAnual || equipment.monthlyCost * (specs.prazoContrato || 12),
        prazoContrato: specs.prazoContrato || 12,
        valorMensalLocacao: specs.valorMensalLocacao,
        isFromCatalog: specs.isFromCatalog || false
      }
    })
  }, [])

  // Load proposal for editing
  const loadProposalForEditing = useCallback(async (proposalId: string) => {
    if (!proposalId) {
      toast({
        title: "Erro",
        description: "ID da proposta não fornecido.",
        variant: "destructive"
      })
      return false
    }

    setIsLoading(true)
    
    try {
      const proposal = await proposalStorage.load(proposalId)
      
      if (!proposal) {
        toast({
          title: "Proposta não encontrada",
          description: "A proposta solicitada não foi encontrada no sistema.",
          variant: "destructive"
        })
        return false
      }

      // Convert data for editing
      const formClientData = convertPDFClientDataToForm(proposal.clientData)
      const printerItems = convertProposalDataToPrinterItems(proposal.proposalData)

      setEditingState({
        isEditing: true,
        proposalId,
        originalProposal: proposal,
        printerItems,
        clientData: formClientData
      })

      toast({
        title: "Proposta Carregada",
        description: "Os dados da proposta foram carregados para edição.",
      })

      return true
    } catch (error) {
      console.error('Failed to load proposal for editing:', error)
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar a proposta para edição.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [convertPDFClientDataToForm, convertProposalDataToPrinterItems, toast])

  // Start editing a proposal
  const startEditing = useCallback(async (proposalId: string) => {
    return await loadProposalForEditing(proposalId)
  }, [loadProposalForEditing])

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingState({
      isEditing: false,
      proposalId: null,
      originalProposal: null,
      printerItems: [],
      clientData: null
    })
  }, [])

  // Update proposal with new data (this will create a new version)
  const updateProposal = useCallback(async (
    newProposalData: ProposalData,
    newClientData: PDFClientData,
    pdfBlob: Blob
  ) => {
    if (!editingState.isEditing || !editingState.proposalId || !editingState.originalProposal) {
      throw new Error('No proposal is currently being edited')
    }

    setIsLoading(true)

    try {
      // Compare versions to generate change description
      const changes = proposalStorage.compareVersions(
        editingState.originalProposal.proposalData,
        newProposalData
      )

      // Create updated proposal
      const updatedProposal: SavedProposal = {
        ...editingState.originalProposal,
        clientName: newClientData.companyName,
        projectName: newClientData.projectName,
        totalValue: newProposalData.totalMonthly,
        updatedAt: new Date(),
        pdfBlob,
        proposalData: newProposalData,
        clientData: newClientData
      }

      // Save the updated proposal with change tracking
      const proposalId = await proposalStorage.saveWithChanges(updatedProposal, changes)

      toast({
        title: "Proposta Atualizada",
        description: `A proposta foi atualizada com sucesso. Versão ${updatedProposal.version || 'nova'} criada.`,
      })

      // Clear editing state
      cancelEditing()

      return proposalId
    } catch (error) {
      console.error('Failed to update proposal:', error)
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível atualizar a proposta.",
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [editingState, toast, cancelEditing])

  // Check if currently editing
  const isCurrentlyEditing = useCallback(() => {
    return editingState.isEditing
  }, [editingState.isEditing])

  // Get current editing data
  const getEditingData = useCallback(() => {
    if (!editingState.isEditing) {
      return null
    }

    return {
      proposalId: editingState.proposalId,
      originalProposal: editingState.originalProposal,
      printerItems: editingState.printerItems,
      clientData: editingState.clientData
    }
  }, [editingState])

  return {
    // State
    isEditing: editingState.isEditing,
    isLoading,
    editingData: getEditingData(),
    
    // Actions
    startEditing,
    cancelEditing,
    updateProposal,
    isCurrentlyEditing,
    
    // Data
    printerItems: editingState.printerItems,
    clientData: editingState.clientData,
    proposalId: editingState.proposalId,
    originalProposal: editingState.originalProposal
  }
}