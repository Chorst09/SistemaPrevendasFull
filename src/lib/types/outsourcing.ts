/**
 * Tipos relacionados ao outsourcing de impressão
 */

import { 
  PrinterStatus, 
  PrinterType, 
  OutsourcingContractType,
  GeneralStatus 
} from './enums'
import { BaseEntity, ID } from './base'

// Impressora
export interface Printer extends BaseEntity {
  id: string
  modelo: string
  marca: string
  tipo: PrinterType
  velocidadePPM: number
  resolucao: string
  conectividade: string[]
  funcoes: string[]
  capacidadePapel: number
  cicloMensal: number
  consumoEnergia: number
  dimensoes: {
    largura: number
    altura: number
    profundidade: number
  }
  peso: number
  garantia: number
  preco: number
  fornecedor: string
  dataAtualizacao: string
  ativo: boolean
  observacoes?: string
  especificacoesTecnicas?: Record<string, any>
  precificacao?: PrinterPricing
}

// Precificação de impressora
export interface PrinterPricing {
  custoAquisicao: number
  custoManutencao: number
  custoSuprimentos: number
  margemLucro: number
  periodosLocacao: Record<number, PricingPeriod>
  calculadoEm: string
  validoAte: string
}

// Período de precificação
export interface PricingPeriod {
  meses: number
  valorMensal: number
  valorTotal: number
  roi: number
  observacoes?: string
}

// Suprimento
export interface Suprimento extends BaseEntity {
  id: string
  nome: string
  tipo: 'Toner' | 'Cartucho' | 'Papel' | 'Peças'
  marca: string
  modelo: string
  compatibilidade: string[]
  rendimento: number
  preco: number
  fornecedor: string
  estoque: number
  estoqueMinimo: number
  dataValidade?: string
  ativo: boolean
  observacoes?: string
}

// Item de impressora no cálculo
export interface PrinterItem extends BaseEntity {
  id: string
  printerId?: string // ID da impressora cadastrada
  modelo?: string
  marca?: string
  tipo: string
  volumeMensal: number
  custoPorPagina: number
  custoMensal: number
  custoAnual: number
  prazoContrato: number // em meses
  valorMensalLocacao?: number
  isFromCatalog: boolean // indica se veio do catálogo
  specifications?: Record<string, any>
}

// Dados do cliente para outsourcing
export interface OutsourcingClientData {
  razaoSocial: string
  nomeContato: string
  telefoneCliente: string
  emailCliente: string
  nomeProjeto: string
  nomeGerente: string
  telefoneGerente: string
  emailGerente: string
}

// Proposta de outsourcing
export interface OutsourcingProposal extends BaseEntity {
  id: string
  clientData: OutsourcingClientData
  printerItems: PrinterItem[]
  totals: {
    volumeTotal: number
    custoMensal: number
    custoAnual: number
  }
  contractType: OutsourcingContractType
  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Rejeitada'
  createdAt: Date
  updatedAt: Date
  validUntil: Date
  pdfBlob?: Blob
  pdfUrl?: string
  notes?: string
}

// Configuração de custos base
export interface BaseCosts {
  'Preto e Branco': number
  'Colorida': number
  'A3 Preto e Branco': number
  'A3 Colorida': number
}

// Relatório de outsourcing
export interface OutsourcingReport {
  period: {
    start: Date
    end: Date
  }
  totalProposals: number
  approvedProposals: number
  totalValue: number
  averageValue: number
  topClients: Array<{
    name: string
    value: number
    proposals: number
  }>
  equipmentStats: Array<{
    type: string
    count: number
    totalValue: number
  }>
  monthlyTrend: Array<{
    month: string
    proposals: number
    value: number
  }>
}

// Configurações do módulo de outsourcing
export interface OutsourcingConfig {
  baseCosts: BaseCosts
  defaultContractPeriod: number
  defaultMargin: number
  maxEquipmentsPerProposal: number
  autoSaveInterval: number
  pdfTemplate: string
  companyInfo: {
    name: string
    logo?: string
    address: string
    phone: string
    email: string
    website: string
  }
}

// Validação de proposta de outsourcing
export interface OutsourcingValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  clientDataValid: boolean
  equipmentsValid: boolean
  totalsValid: boolean
}

// Filtros para propostas de outsourcing
export interface OutsourcingFilter {
  status?: string
  clientName?: string
  dateFrom?: string
  dateTo?: string
  minValue?: number
  maxValue?: number
  equipmentType?: string
}

// Estatísticas de outsourcing
export interface OutsourcingStats {
  totalProposals: number
  totalValue: number
  averageValue: number
  conversionRate: number
  topEquipmentTypes: Array<{
    type: string
    count: number
    percentage: number
  }>
  monthlyGrowth: number
}

// Types are exported individually above