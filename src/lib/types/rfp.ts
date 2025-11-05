/**
 * Tipos relacionados a RFP (Request for Proposal) e RFI (Request for Information)
 */

import { 
  RFPType, 
  RFPStatus, 
  PriceRecordType, 
  PriceRecordStatus,
  FileType 
} from './enums'
import { BaseEntity, ID } from './base'

// RFP/RFI
export interface RFP extends BaseEntity {
  id: string
  title: string
  client: string
  type: RFPType
  description: string
  status: RFPStatus
  publishDate: string
  deadlineDate: string
  submissionDate?: string
  value?: number
  accountManager: string
  category: string
  requirements: string
  attachments?: string[]
  notes?: string
}

// Ata de Registro de Preços
export interface PriceRecord extends BaseEntity {
  id: string
  title: string
  client: string
  type: PriceRecordType
  description: string
  status: PriceRecordStatus
  publishDate: string
  validityDate: string
  renewalDate?: string
  totalValue: number
  accountManager: string
  category: string
  items: PriceRecordItem[]
  participants: string[]
  attachments?: string[]
  notes?: string
}

export interface PriceRecordItem extends BaseEntity {
  id: string
  description: string
  unit: string
  quantity: number
  unitPrice: number
  totalPrice: number
  supplier: string
  brand?: string
  model?: string
}

// Arquivos de licitação
export interface BidFile {
  id: number
  name: string
}

export interface BidDocs {
  company: BidFile[]
  proofs: BidFile[]
  certifications: BidFile[]
}

// Types are exported individually above