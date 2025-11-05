/**
 * Tipos relacionados à geração de PDF e propostas
 * @deprecated Use os tipos modularizados em ./pdf/ em vez deste arquivo
 */

// Re-exporta todos os tipos da nova estrutura modularizada
export * from './pdf'

// Mantém compatibilidade com imports antigos
import { PricingModule } from './enums'
import { BaseEntity } from './base'

// Compatibilidade com imports antigos - todos os tipos agora estão na estrutura modularizada
// Use import { ... } from '@/lib/types/pdf' em vez de '@/lib/types/pdf.ts'

// Default export para compatibilidade
export default {
  // Todos os tipos estão disponíveis através das re-exportações acima
}