/**
 * Tipos para componentes de PDF
 */

import { ProposalData, ClientData, CompanyInfo, PDFError } from './core'

// Props dos componentes PDF
export interface PDFGeneratorProps {
  proposalData: ProposalData
  clientData: ClientData
  onPDFGenerated: (pdfBlob: Blob, pdfUrl: string) => void
  onError: (error: PDFError) => void
}

export interface ProposalManagerProps {
  onViewProposal: (proposalId: string) => void
  onEditProposal: (proposalId: string) => void
  onDeleteProposal: (proposalId: string) => void
}

export interface PDFTemplateProps {
  clientData: ClientData
  proposalData: ProposalData
  companyInfo: CompanyInfo
}

// Props do gerenciador de PDF de proposta
export interface ProposalPDFManagerProps {
  isConfirmationOpen: boolean
  onCloseConfirmation: () => void
  onEditProposal: (proposalId?: string) => void
  proposalData: ProposalData
  clientData: ClientData
  pdfBlob: Blob
  pdfUrl: string
  proposalId?: string
  onDataUpdated?: (proposalData: ProposalData, clientData: ClientData) => void
}

// Props do visualizador de PDF
export interface PDFViewerProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string
  fileName: string
  onDownload: () => void
}

// Props da confirmação de proposta
export interface ProposalConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onViewPDF: () => void
  onDownloadPDF: () => void
  onEditProposal: () => void
  proposalData: ProposalData
  clientData: ClientData
  pdfUrl: string
}

// Props do painel de validação
export interface ValidationPanelProps {
  report: any // ValidationReport
  onApplyFixes?: () => void
  onDismiss?: () => void
  className?: string
}

// Props do verificador de compatibilidade do navegador
export interface BrowserCompatibilityCheckerProps {
  onCompatibilityChecked?: (compatible: boolean) => void
  showOnlyIfIncompatible?: boolean
  className?: string
}

// Props do boundary de erro de PDF
export interface PDFErrorBoundaryProps {
  children: React.ReactNode
  fallback?: (error: PDFError, retry: () => void) => React.ReactNode
  onError?: (error: PDFError, errorInfo: React.ErrorInfo) => void
}