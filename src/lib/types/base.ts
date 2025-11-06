/**
 * Tipos base do sistema
 * Contém interfaces e tipos fundamentais utilizados em todo o projeto
 */

import {
  PartnerType,
  GeneralStatus,
  QuoteStatus,
  ProposalStatus,
  ROStatus,
  TrainingType
} from './enums'

// Tipos básicos
export type ID = string | number

export interface BaseEntity {
  id: ID
  createdAt?: Date
  updatedAt?: Date
}

export interface TimestampedEntity extends BaseEntity {
  createdAt: Date
  updatedAt: Date
}

// Informações de contato
export interface ContactInfo {
  name: string
  phone: string
  email: string
}

export interface VendedorResponsavel extends ContactInfo {
  id: string
  fornecedor: string
  vendedor: string
}

// Parceiros (Distribuidores e Fornecedores)
export interface Partner extends BaseEntity {
  id: number
  name: string
  type: PartnerType
  mainContact?: string
  contact: string
  phone: string
  status: GeneralStatus
  site?: string
  siteEcommerce?: string
  products?: string
  sitePartner?: string
  siteRO?: string
  templateRO?: string
  procedimentoRO?: string
  login?: string
  password?: string
  loginEcommerce?: string
  passwordEcommerce?: string
  vendedoresResponsaveis?: VendedorResponsavel[]
}

// Orçamentos
export interface Quote extends BaseEntity {
  id: string
  client: string
  projectName: string
  accountManager?: string
  status: QuoteStatus
  total: number
  date: string
  distributorId: ID
  quotationFile?: string
  pricingFile?: string
}

// Propostas
export interface Proposal extends BaseEntity {
  id: string
  title: string
  client: string
  description: string
  status: ProposalStatus
  value: number
  date: string
  expiryDate: string
  accountManager: string
  distributorId: ID
  proposalFile?: string
  technicalSpecs?: string
  commercialTerms?: string
}

// RO (Registro de Ocorrência)
export interface RO extends BaseEntity {
  id: number
  supplierId: ID
  roNumber: string
  openDate: string
  expiryDate: string
  clientName: string
  product: string
  value: number
  status: ROStatus
  accountManager: string
}

// Treinamentos
export interface Training extends BaseEntity {
  id: number
  supplierId: ID
  trainingName: string
  type: TrainingType
  participantName: string
  expiryDate: string
}

// Navegação
export interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  subItems?: NavSubItem[]
}

export interface NavSubItem {
  id: string
  label: string
  icon: React.ReactNode
  openInNewTab?: boolean
  url?: string
}

// Arquivos
export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  url?: string
}

// Resposta de API genérica
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Paginação
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: PaginationInfo
}

// Filtros genéricos
export interface BaseFilter {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Configurações do sistema
export interface SystemConfig {
  companyName: string
  companyLogo?: string
  primaryColor: string
  secondaryColor: string
  timezone: string
  currency: string
  dateFormat: string
  language: string
}

// Types are exported individually above