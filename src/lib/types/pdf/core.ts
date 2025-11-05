/**
 * Tipos principais do sistema de PDF
 */

import { BaseEntity } from '../base'

// Dados da proposta para PDF
export interface ProposalData {
  equipments: EquipmentItem[]
  totalMonthly: number
  totalAnnual: number
  contractPeriod: number
  generatedAt: Date
}

// Dados do cliente para PDF
export interface ClientData {
  companyName: string
  contactName: string
  email: string
  phone: string
  projectName: string
  managerName: string
  managerEmail: string
  managerPhone: string
}

// Item de equipamento
export interface EquipmentItem extends BaseEntity {
  id: string
  model: string
  brand: string
  type: string
  monthlyVolume: number
  monthlyCost: number
  specifications?: Record<string, any>
}

// Informações da empresa
export interface CompanyInfo {
  name: string
  logo: string
  address: string
  phone: string
  email: string
  website: string
}

// Proposta salva no sistema
export interface SavedProposal extends BaseEntity {
  id: string
  clientName: string
  projectName: string
  totalValue: number
  createdAt: Date
  updatedAt: Date
  pdfBlob: Blob
  proposalData: ProposalData
  clientData: ClientData
  version: number
  parentId?: string // Para controle de versão
  versionHistory?: ProposalVersion[]
}

// Versão da proposta
export interface ProposalVersion {
  version: number
  createdAt: Date
  changes: string[] // Descrição das mudanças
  pdfBlob: Blob
  proposalData: ProposalData
  clientData: ClientData
}

// Resultado da geração de PDF
export interface PDFGenerationResult {
  blob: Blob
  url: string
  size: number
  generatedAt: Date
}

// Dados simples para PDF
export interface SimplePDFData {
  clientName: string
  projectName: string
  totalMonthly: number
  totalAnnual: number
  equipments: Array<{
    model: string
    brand: string
    type: string
    monthlyVolume: number
    monthlyCost: number
  }>
}