/**
 * @deprecated Este arquivo será removido. Use os tipos modularizados em @/lib/types/pdf
 */

// Re-exporta todos os tipos da nova estrutura modularizada
export * from '../../types/pdf'

// Mantém compatibilidade temporária
import type {
  ProposalData as NewProposalData,
  ClientData as NewClientData,
  EquipmentItem as NewEquipmentItem,
  CompanyInfo as NewCompanyInfo,
  SavedProposal as NewSavedProposal,
  ProposalVersion as NewProposalVersion
} from '../../types/pdf/core'

import type {
  PDFError as NewPDFError,
  PDFErrorType as NewPDFErrorType
} from '../../types/pdf/errors'

import type {
  PDFGeneratorProps as NewPDFGeneratorProps,
  ProposalManagerProps as NewProposalManagerProps,
  PDFTemplateProps as NewPDFTemplateProps
} from '../../types/pdf/components'

// Aliases para compatibilidade
export type ProposalData = NewProposalData
export type ClientData = NewClientData
export type EquipmentItem = NewEquipmentItem
export type CompanyInfo = NewCompanyInfo
export type SavedProposal = NewSavedProposal
export type ProposalVersion = NewProposalVersion
export type PDFError = NewPDFError
export type PDFErrorType = NewPDFErrorType
export type PDFGeneratorProps = NewPDFGeneratorProps
export type ProposalManagerProps = NewProposalManagerProps
export type PDFTemplateProps = NewPDFTemplateProps

// Re-exporta o enum para compatibilidade
export { PDFErrorType } from '../../types/pdf/enums'