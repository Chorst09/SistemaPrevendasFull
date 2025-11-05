/**
 * Constantes relacionadas ao Service Desk
 */

import type { 
  ServiceDeskBaseCosts, 
  ServiceDeskConfig, 
  ServiceDeskSLATemplate,
  ServiceDeskServiceLevel,
  ServiceDeskTicketPriority,
  ServiceDeskTicketCategory,
  ServiceDeskContractType
} from '@/lib/types/service-desk'

// Custos base por nível de serviço (por usuário/mês)
export const DEFAULT_SERVICE_DESK_BASE_COSTS: ServiceDeskBaseCosts = {
  'Básico': 25.00,
  'Padrão': 45.00,
  'Premium': 75.00,
  'Empresarial': 120.00
}

// Configuração padrão do Service Desk
export const DEFAULT_SERVICE_DESK_CONFIG: ServiceDeskConfig = {
  baseCosts: DEFAULT_SERVICE_DESK_BASE_COSTS,
  defaultContractPeriod: 12,
  defaultServiceLevel: 'Padrão' as ServiceDeskServiceLevel,
  defaultMargin: 0.25, // 25%
  maxUsersPerProposal: 5000,
  autoSaveInterval: 30000, // 30 segundos
  pdfTemplate: 'professional',
  businessHours: {
    start: '08:00',
    end: '18:00',
    timezone: 'America/Sao_Paulo'
  },
  companyInfo: {
    name: 'Sua Empresa',
    address: 'Endereço da Empresa',
    phone: '(11) 9999-9999',
    email: 'contato@empresa.com',
    website: 'www.empresa.com'
  }
}

// Templates de SLA padrão
export const DEFAULT_SLA_TEMPLATES: ServiceDeskSLATemplate[] = [
  {
    name: 'SLA Básico',
    description: 'SLA padrão para nível básico de atendimento',
    slas: [
      {
        name: 'Crítico - Hardware',
        priority: 'Crítica' as ServiceDeskTicketPriority,
        category: 'Hardware' as ServiceDeskTicketCategory,
        responseTime: 15, // 15 minutos
        resolutionTime: 4, // 4 horas
        escalationTime: 2, // 2 horas
        businessHoursOnly: false,
        active: true
      }
    ]
  }
]

// Períodos de contrato disponíveis
export const SERVICE_DESK_CONTRACT_PERIODS = [
  { value: 6, label: '6 meses' },
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' },
  { value: 36, label: '36 meses' },
  { value: 48, label: '48 meses' }
]

// Níveis de serviço disponíveis
export const SERVICE_DESK_SERVICE_LEVELS = [
  {
    value: 'Básico' as ServiceDeskServiceLevel,
    label: 'Básico',
    description: 'Suporte básico durante horário comercial',
    features: [
      'Suporte 8x5 (horário comercial)',
      'Email e telefone',
      'SLA básico',
      'Até 2 tickets por usuário/mês'
    ]
  },
  {
    value: 'Padrão' as ServiceDeskServiceLevel,
    label: 'Padrão',
    description: 'Suporte padrão com disponibilidade estendida',
    features: [
      'Suporte 12x5 (horário estendido)',
      'Email, telefone e chat',
      'SLA padrão',
      'Até 4 tickets por usuário/mês',
      'Acesso remoto'
    ]
  },
  {
    value: 'Premium' as ServiceDeskServiceLevel,
    label: 'Premium',
    description: 'Suporte premium com alta disponibilidade',
    features: [
      'Suporte 24x5 (24h dias úteis)',
      'Todos os canais de comunicação',
      'SLA premium',
      'Tickets ilimitados',
      'Acesso remoto',
      'Suporte on-site'
    ]
  },
  {
    value: 'Empresarial' as ServiceDeskServiceLevel,
    label: 'Empresarial',
    description: 'Suporte empresarial 24x7',
    features: [
      'Suporte 24x7 (24h todos os dias)',
      'Todos os canais + WhatsApp',
      'SLA empresarial',
      'Tickets ilimitados',
      'Acesso remoto',
      'Suporte on-site prioritário',
      'Gerente de conta dedicado'
    ]
  }
]

// Categorias de tickets
export const SERVICE_DESK_TICKET_CATEGORIES = [
  {
    value: 'Hardware' as ServiceDeskTicketCategory,
    label: 'Hardware',
    icon: '🖥️',
    description: 'Problemas com equipamentos físicos'
  },
  {
    value: 'Software' as ServiceDeskTicketCategory,
    label: 'Software',
    icon: '💻',
    description: 'Problemas com aplicativos e sistemas'
  },
  {
    value: 'Rede' as ServiceDeskTicketCategory,
    label: 'Rede',
    icon: '🌐',
    description: 'Problemas de conectividade e rede'
  },
  {
    value: 'Outros' as ServiceDeskTicketCategory,
    label: 'Outros',
    icon: '❓',
    description: 'Outros tipos de solicitações'
  }
]

// Prioridades de tickets
export const SERVICE_DESK_TICKET_PRIORITIES = [
  {
    value: 'Baixa' as ServiceDeskTicketPriority,
    label: 'Baixa',
    color: 'green',
    description: 'Não impacta operações críticas'
  },
  {
    value: 'Média' as ServiceDeskTicketPriority,
    label: 'Média',
    color: 'yellow',
    description: 'Impacto moderado nas operações'
  },
  {
    value: 'Alta' as ServiceDeskTicketPriority,
    label: 'Alta',
    color: 'orange',
    description: 'Impacto significativo nas operações'
  },
  {
    value: 'Crítica' as ServiceDeskTicketPriority,
    label: 'Crítica',
    color: 'red',
    description: 'Impacto crítico, operações paradas'
  }
]

// Métricas padrão por nível de serviço
export const DEFAULT_SERVICE_DESK_METRICS = {
  'Básico': {
    averageTicketsPerUser: 2,
    averageResolutionTime: 24,
    firstCallResolution: 0.6,
    customerSatisfaction: 0.75,
    slaCompliance: 0.85,
    includedHoursPerUser: 2,
    additionalHourCost: 80
  },
  'Padrão': {
    averageTicketsPerUser: 3,
    averageResolutionTime: 16,
    firstCallResolution: 0.7,
    customerSatisfaction: 0.85,
    slaCompliance: 0.9,
    includedHoursPerUser: 3,
    additionalHourCost: 90
  },
  'Premium': {
    averageTicketsPerUser: 4,
    averageResolutionTime: 8,
    firstCallResolution: 0.8,
    customerSatisfaction: 0.9,
    slaCompliance: 0.95,
    includedHoursPerUser: 4,
    additionalHourCost: 100
  },
  'Empresarial': {
    averageTicketsPerUser: 5,
    averageResolutionTime: 4,
    firstCallResolution: 0.85,
    customerSatisfaction: 0.95,
    slaCompliance: 0.98,
    includedHoursPerUser: 6,
    additionalHourCost: 120
  }
}

// Exportação padrão com todas as constantes
export default {
  DEFAULT_SERVICE_DESK_BASE_COSTS,
  DEFAULT_SERVICE_DESK_CONFIG,
  DEFAULT_SLA_TEMPLATES,
  SERVICE_DESK_CONTRACT_PERIODS,
  SERVICE_DESK_SERVICE_LEVELS,
  SERVICE_DESK_TICKET_CATEGORIES,
  SERVICE_DESK_TICKET_PRIORITIES,
  DEFAULT_SERVICE_DESK_METRICS
}