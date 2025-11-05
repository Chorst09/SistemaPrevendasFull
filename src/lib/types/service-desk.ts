/**
 * Tipos relacionados ao Service Desk
 */

// Enums específicos do Service Desk
export enum ServiceDeskTicketPriority {
  LOW = 'Baixa',
  MEDIUM = 'Média',
  HIGH = 'Alta',
  CRITICAL = 'Crítica'
}

export enum ServiceDeskTicketCategory {
  HARDWARE = 'Hardware',
  SOFTWARE = 'Software',
  NETWORK = 'Rede',
  SECURITY = 'Segurança',
  ACCESS = 'Acesso',
  EMAIL = 'Email',
  PRINTER = 'Impressora',
  PHONE = 'Telefone',
  OTHER = 'Outros'
}

export enum ServiceDeskSLAType {
  RESPONSE = 'Resposta',
  RESOLUTION = 'Resolução',
  ESCALATION = 'Escalação'
}

export enum ServiceDeskServiceLevel {
  BASIC = 'Básico',
  STANDARD = 'Padrão',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Empresarial'
}

export enum ServiceDeskContractType {
  MONTHLY = 'Mensal',
  QUARTERLY = 'Trimestral',
  SEMIANNUAL = 'Semestral',
  ANNUAL = 'Anual',
  BIENNIAL = 'Bienal'
}

// Configuração de SLA
export interface ServiceDeskSLA {
  id: string
  name: string
  priority: ServiceDeskTicketPriority
  category: ServiceDeskTicketCategory
  responseTime: number
  resolutionTime: number
  escalationTime: number
  businessHoursOnly: boolean
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Serviço do Service Desk
export interface ServiceDeskService {
  id: string
  name: string
  description: string
  category: ServiceDeskTicketCategory
  serviceLevel: ServiceDeskServiceLevel
  baseCost: number
  setupCost: number
  minimumUsers: number
  maximumUsers?: number
  includedHours: number
  additionalHourCost: number
  slaIds: string[]
  features: string[]
  active: boolean
  createdAt: Date
  updatedAt: Date
}

// Item de serviço no cálculo
export interface ServiceDeskItem {
  id: string
  serviceId?: string
  serviceName: string
  category: ServiceDeskTicketCategory
  serviceLevel: ServiceDeskServiceLevel
  userCount: number
  monthlyTickets: number
  averageResolutionTime: number
  costPerUser: number
  setupCost: number
  monthlyCost: number
  annualCost: number
  contractPeriod: number
  includedHours: number
  additionalHours: number
  additionalHoursCost: number
  isFromCatalog: boolean
  specifications?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// Dados do cliente para Service Desk
export interface ServiceDeskClientData {
  companyName: string
  contactName: string
  email: string
  phone: string
  projectName: string
  managerName: string
  managerEmail: string
  managerPhone: string
  employeeCount: number
  currentITSupport?: string
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  criticalSystems: string[]
}

// Proposta de Service Desk
export interface ServiceDeskProposal {
  id: string
  clientData: ServiceDeskClientData
  serviceItems: ServiceDeskItem[]
  totals: {
    totalUsers: number
    totalSetupCost: number
    monthlyCost: number
    annualCost: number
    totalIncludedHours: number
    estimatedAdditionalHours: number
    additionalHoursCost: number
  }
  contractType: ServiceDeskContractType
  serviceLevel: ServiceDeskServiceLevel
  slaConfiguration: ServiceDeskSLA[]
  status: 'Rascunho' | 'Enviada' | 'Aprovada' | 'Rejeitada'
  createdAt: Date
  updatedAt: Date
  validUntil: Date
  pdfBlob?: Blob
  pdfUrl?: string
  notes?: string
  version: number
  // Enhanced sections for executive proposals
  serviceDeskData?: any // ServiceDeskData from pricing system
  executiveDashboard?: any // ExecutiveDashboard from pricing system
  enhancedSections?: {
    teamComposition: any
    scheduleAnalysis: any
    financialBreakdown: any
    riskAssessment: any
    recommendations: any[]
    benchmarkAnalysis: any
    approvalWorkflow: any
  }
}

// Configuração de custos base do Service Desk
export interface ServiceDeskBaseCosts {
  'Básico': number
  'Padrão': number
  'Premium': number
  'Empresarial': number
}

// Métricas de Service Desk
export interface ServiceDeskMetrics {
  averageTicketsPerUser: number
  averageResolutionTime: number
  firstCallResolution: number
  customerSatisfaction: number
  slaCompliance: number
  costPerTicket: number
  costPerUser: number
}

// Relatório de Service Desk
export interface ServiceDeskReport {
  period: {
    start: Date
    end: Date
  }
  totalProposals: number
  approvedProposals: number
  totalValue: number
  averageValue: number
  totalUsers: number
  topClients: Array<{
    name: string
    value: number
    users: number
    proposals: number
  }>
  serviceStats: Array<{
    serviceLevel: string
    count: number
    totalValue: number
    averageUsers: number
  }>
  monthlyTrend: Array<{
    month: string
    proposals: number
    value: number
    users: number
  }>
  metrics: ServiceDeskMetrics
}

// Configurações do módulo de Service Desk
export interface ServiceDeskConfig {
  baseCosts: ServiceDeskBaseCosts
  defaultContractPeriod: number
  defaultServiceLevel: ServiceDeskServiceLevel
  defaultMargin: number
  maxUsersPerProposal: number
  autoSaveInterval: number
  pdfTemplate: string
  businessHours: {
    start: string
    end: string
    timezone: string
  }
  companyInfo: {
    name: string
    logo?: string
    address: string
    phone: string
    email: string
    website: string
  }
}

// Validação de proposta de Service Desk
export interface ServiceDeskValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  clientDataValid: boolean
  servicesValid: boolean
  totalsValid: boolean
  slaValid: boolean
}

// Filtros para propostas de Service Desk
export interface ServiceDeskFilter {
  status?: string
  clientName?: string
  dateFrom?: string
  dateTo?: string
  minValue?: number
  maxValue?: number
  serviceLevel?: ServiceDeskServiceLevel
  minUsers?: number
  maxUsers?: number
}

// Estatísticas de Service Desk
export interface ServiceDeskStats {
  totalProposals: number
  totalValue: number
  averageValue: number
  totalUsers: number
  averageUsers: number
  conversionRate: number
  topServiceLevels: Array<{
    level: string
    count: number
    percentage: number
  }>
  monthlyGrowth: number
  metrics: ServiceDeskMetrics
}

// Template de SLA
export interface ServiceDeskSLATemplate {
  name: string
  description: string
  slas: Omit<ServiceDeskSLA, 'id' | 'createdAt' | 'updatedAt'>[]
}

// Configuração de escalação
export interface ServiceDeskEscalation {
  id: string
  name: string
  priority: ServiceDeskTicketPriority
  category: ServiceDeskTicketCategory
  escalationLevels: Array<{
    level: number
    timeMinutes: number
    assignTo: string
    notifyEmails: string[]
  }>
  active: boolean
}

// Análise de capacidade
export interface ServiceDeskCapacityAnalysis {
  currentUsers: number
  projectedTickets: number
  requiredAgents: number
  estimatedCosts: {
    monthly: number
    annual: number
  }
  recommendations: string[]
  riskFactors: string[]
}