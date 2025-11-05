/**
 * Constantes centralizadas do sistema
 * Contém valores padrão, configurações e constantes utilizadas no projeto
 */

import { BaseCosts, OutsourcingConfig } from '../types/outsourcing'
import { PDFCacheConfig } from '../types/pdf/cache'

// Re-exporta constantes específicas de PDF
export * from './pdf'
export * as PDFConstants from './pdf'

// Re-exporta constantes específicas de Service Desk
export * from './service-desk'
export * as ServiceDeskConstants from './service-desk'

// Configurações de outsourcing de impressão
export const OUTSOURCING_CONFIG: OutsourcingConfig = {
  baseCosts: {
    'Preto e Branco': 0.08,
    'Colorida': 0.35,
    'A3 Preto e Branco': 0.12,
    'A3 Colorida': 0.50
  },
  defaultContractPeriod: 36,
  defaultMargin: 0.20, // 20%
  maxEquipmentsPerProposal: 100,
  autoSaveInterval: 30000, // 30 segundos
  pdfTemplate: 'professional',
  companyInfo: {
    name: 'Sua Empresa',
    address: 'Endereço da Empresa',
    phone: '(11) 9999-9999',
    email: 'contato@empresa.com',
    website: 'www.empresa.com'
  }
}

// Configurações de cache de PDF
export const PDF_CACHE_CONFIG: PDFCacheConfig = {
  enableCache: true,
  cacheExpiration: 30 * 60 * 1000, // 30 minutos
  maxCacheSize: 50,
  compressionLevel: 6,
  imageQuality: 0.8
}

// Períodos de contrato disponíveis
export const CONTRACT_PERIODS = [
  { value: 12, label: '12 meses' },
  { value: 24, label: '24 meses' },
  { value: 36, label: '36 meses' },
  { value: 48, label: '48 meses' },
  { value: 60, label: '60 meses' }
]

// Tipos de impressão disponíveis
export const PRINT_TYPES = [
  'Preto e Branco',
  'Colorida',
  'A3 Preto e Branco',
  'A3 Colorida'
]

// Configurações de validação
export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  cnpj: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  cpf: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  minPasswordLength: 8,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png']
}

// Configurações de paginação
export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50, 100],
  maxPageSize: 100
}

// Configurações de data
export const DATE_CONFIG = {
  defaultFormat: 'dd/MM/yyyy',
  apiFormat: 'yyyy-MM-dd',
  displayFormat: 'dd/MM/yyyy HH:mm',
  timezone: 'America/Sao_Paulo',
  locale: 'pt-BR'
}

// Configurações de moeda
export const CURRENCY_CONFIG = {
  currency: 'BRL',
  locale: 'pt-BR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}

// Configurações de notificação
export const NOTIFICATION_CONFIG = {
  defaultDuration: 5000, // 5 segundos
  errorDuration: 8000, // 8 segundos
  maxNotifications: 5,
  position: 'top-right' as const
}

// Configurações de tema
export const THEME_CONFIG = {
  defaultTheme: 'light',
  storageKey: 'theme-preference',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#059669',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
}

// Configurações de localStorage
export const STORAGE_KEYS = {
  proposals: 'proposals',
  editingProposal: 'editingOutsourcingProposal',
  userPreferences: 'userPreferences',
  theme: 'theme-preference',
  cache: 'app-cache',
  session: 'user-session'
}

// Configurações de API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000 // 1 segundo
}

// Configurações de upload
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
  maxFiles: 5,
  chunkSize: 1024 * 1024 // 1MB chunks
}

// Mensagens padrão do sistema
export const MESSAGES = {
  success: {
    proposalGenerated: 'Proposta gerada com sucesso!',
    proposalSaved: 'Proposta salva com sucesso!',
    proposalDeleted: 'Proposta excluída com sucesso!',
    dataUpdated: 'Dados atualizados com sucesso!'
  },
  error: {
    proposalGenerationFailed: 'Falha na geração da proposta',
    invalidData: 'Dados inválidos fornecidos',
    networkError: 'Erro de conexão. Tente novamente.',
    unknownError: 'Erro desconhecido. Contate o suporte.'
  },
  warning: {
    unsavedChanges: 'Você tem alterações não salvas',
    largeFile: 'Arquivo muito grande. Máximo permitido: 10MB',
    oldBrowser: 'Seu navegador pode não suportar todas as funcionalidades'
  },
  info: {
    loading: 'Carregando...',
    processing: 'Processando...',
    saving: 'Salvando...',
    generating: 'Gerando PDF...'
  }
}

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  debounceDelay: 300, // 300ms
  throttleDelay: 100, // 100ms
  lazyLoadThreshold: 100, // pixels
  virtualScrollItemHeight: 50, // pixels
  maxRenderItems: 1000
}

// Configurações de segurança
export const SECURITY_CONFIG = {
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
  passwordMinLength: 8,
  requireSpecialChars: true
}

// URLs e endpoints
export const ENDPOINTS = {
  auth: '/auth',
  proposals: '/proposals',
  partners: '/partners',
  quotes: '/quotes',
  rfp: '/rfp',
  editais: '/editais',
  upload: '/upload',
  reports: '/reports'
}

// Configurações de relatórios
export const REPORT_CONFIG = {
  defaultPeriod: 30, // dias
  maxPeriod: 365, // dias
  formats: ['pdf', 'excel', 'csv'],
  charts: {
    defaultType: 'line',
    colors: ['#2563eb', '#059669', '#f59e0b', '#ef4444', '#8b5cf6']
  }
}

export default {
  OUTSOURCING_CONFIG,
  PDF_CACHE_CONFIG,
  CONTRACT_PERIODS,
  PRINT_TYPES,
  VALIDATION_RULES,
  PAGINATION_CONFIG,
  DATE_CONFIG,
  CURRENCY_CONFIG,
  NOTIFICATION_CONFIG,
  THEME_CONFIG,
  STORAGE_KEYS,
  API_CONFIG,
  UPLOAD_CONFIG,
  MESSAGES,
  PERFORMANCE_CONFIG,
  SECURITY_CONFIG,
  ENDPOINTS,
  REPORT_CONFIG
}