/**
 * @deprecated Use modular types from src/lib/types/index.ts instead
 * This file is maintained for backward compatibility
 */

// Re-export from modular types for backward compatibility
export type {
  VendedorResponsavel,
  Partner,
  Quote,
  Proposal,
  RO,
  Training
} from './types/base'

// Re-export RFP and bidding types
export type {
  RFP,
  PriceRecord,
  PriceRecordItem,
  BidFile,
  BidDocs
} from './types/rfp'

// Re-export edital types
export type {
  Edital,
  EditalFile,
  EditalAIAnalysis,
  EditalDocument,
  EditalProduct,
  EditalAnalysis,
  AnalysisType,
  AnalysisResult,
  ProductItem,
  SuggestedModel,
  DocumentRequirement
} from './types/edital'

// Re-export navigation types
export type { NavItem, NavSubItem } from './types/base'
