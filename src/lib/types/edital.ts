/**
 * Tipos relacionados a editais e análise de licitações
 */

import { 
  EditalStatus,
  EditalDocumentType,
  EditalDocumentStatus,
  EditalProductStatus,
  FileType,
  RiskLevel,
  PaymentHistory,
  PublicBodyType,
  AnalysisRecommendation,
  ProductPriority,
  ComplianceLevel,
  ProductAvailability
} from './enums'
import { BaseEntity, FileInfo } from './base'

// Arquivo de edital com análise de IA
export interface EditalFile extends FileInfo {
  type: FileType
  aiAnalysis?: EditalAIAnalysis
}

// Análise de IA para arquivos de edital
export interface EditalAIAnalysis extends BaseEntity {
  id: string
  fileId: string
  analysisDate: string
  summary: string
  keyPoints: string[]
  requirements: string[]
  deadlines: string[]
  values: string[]
  risks: string[]
  opportunities: string[]
  recommendations: string[]
  confidence: number // 0-100
  processingTime: number // in seconds
}

// Edital principal
export interface Edital extends BaseEntity {
  id: string
  title: string
  publicationNumber: string
  publishingBody: string
  publishDate: string
  openingDate: string
  submissionDeadline: string
  estimatedValue: number
  category: string
  status: EditalStatus
  description: string
  requirements: string
  documents: EditalDocument[]
  products: EditalProduct[]
  analysis?: EditalAnalysis
  files?: EditalFile[]
  attachments?: string[]
  notes?: string
}

// Documento de edital
export interface EditalDocument extends BaseEntity {
  id: string
  name: string
  type: EditalDocumentType
  description: string
  deadline?: string
  status: EditalDocumentStatus
  notes?: string
}

// Produto de edital
export interface EditalProduct extends BaseEntity {
  id: string
  description: string
  quantity: number
  unit: string
  estimatedUnitPrice: number
  totalEstimatedPrice: number
  specifications: string
  brand?: string
  model?: string
  supplier?: string
  status: EditalProductStatus
}

// Análise completa de edital
export interface EditalAnalysis extends BaseEntity {
  id: string
  editalId: string
  analysisDate: string
  analyst: string
  documentAnalysis: DocumentAnalysis
  productAnalysis: ProductAnalysis
  timelineAnalysis: TimelineAnalysis
  publishingBodyAnalysis: PublishingBodyAnalysis
  overallAssessment: OverallAssessment
}

export interface DocumentAnalysis {
  totalDocuments: number
  readyDocuments: number
  pendingDocuments: number
  criticalDocuments: string[]
  notes: string
}

export interface ProductAnalysis {
  totalProducts: number
  availableProducts: number
  unavailableProducts: number
  totalEstimatedValue: number
  competitiveAdvantage: string
  notes: string
}

export interface TimelineAnalysis {
  daysUntilOpening: number
  daysUntilDeadline: number
  isUrgent: boolean
  timelineRisk: RiskLevel
  notes: string
}

export interface PublishingBodyAnalysis {
  bodyType: PublicBodyType
  previousExperience: string
  paymentHistory: PaymentHistory
  notes: string
}

export interface OverallAssessment {
  score: number // 0-100
  recommendation: AnalysisRecommendation
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  finalNotes: string
}

// Tipos para o analisador de editais
export interface AnalysisType {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

export interface AnalysisResult extends BaseEntity {
  id: string
  fileName: string
  analysisType: string
  analysisDate: string
  summary: string
  keyPoints: string[]
  requirements: string[]
  deadlines: string[]
  values: string[]
  risks: string[]
  opportunities: string[]
  recommendations: string[]
  confidence: number
  processingTime: number
  products?: ProductItem[]
}

export interface ProductItem {
  item: string
  description: string
  quantity: number
  unit: string
  estimatedValue: number
  specifications: string[]
  category?: string
  priority?: ProductPriority
  complianceLevel?: ComplianceLevel
  riskLevel?: RiskLevel
  technicalJustification?: string
  marketAnalysis?: string
  alternativeOptions?: string[]
  suggestedModels?: SuggestedModel[]
}

export interface SuggestedModel {
  brand: string
  model: string
  partNumber?: string
  estimatedPrice: number
  availability: ProductAvailability
  complianceScore: number
  advantages: string[]
  disadvantages?: string[]
  distributors?: string[]
}

export interface DocumentRequirement {
  type: string
  description: string
  mandatory: boolean
  deadline?: string
  notes?: string
}

// Types are exported individually above