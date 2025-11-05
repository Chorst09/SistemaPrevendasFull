/**
 * Enums centralizados do sistema
 * Contém todas as enumerações utilizadas no projeto
 */

// Status gerais do sistema
export enum GeneralStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo'
}

// Tipos de parceiros
export enum PartnerType {
  DISTRIBUTOR = 'Distribuidor',
  SUPPLIER = 'Fornecedor'
}

// Status de orçamentos
export enum QuoteStatus {
  PENDING = 'Pendente',
  SENT = 'Enviado',
  APPROVED = 'Aprovado',
  REJECTED = 'Rejeitado',
  WAITING_DISTRIBUTOR = 'Aguardando Distribuidor'
}

// Status de propostas
export enum ProposalStatus {
  DRAFT = 'Rascunho',
  SENT = 'Enviada',
  UNDER_REVIEW = 'Em Análise',
  APPROVED = 'Aprovada',
  REJECTED = 'Rejeitada'
}

// Status de RO (Registro de Ocorrência)
export enum ROStatus {
  APPROVED = 'Aprovado',
  DENIED = 'Negado',
  EXPIRED = 'Expirado'
}

// Tipos de treinamento
export enum TrainingType {
  COMMERCIAL = 'Comercial',
  TECHNICAL = 'Técnico'
}

// Tipos de RFP
export enum RFPType {
  RFP = 'RFP',
  RFI = 'RFI'
}

// Status de RFP
export enum RFPStatus {
  OPEN = 'Aberto',
  UNDER_REVIEW = 'Em Análise',
  RESPONDED = 'Respondido',
  CLOSED = 'Fechado',
  EXPIRED = 'Vencido'
}

// Tipos de ata de registro de preços
export enum PriceRecordType {
  PRICE_RECORD = 'Ata de Registro de Preços',
  ELECTRONIC_AUCTION = 'Pregão Eletrônico',
  COMPETITION = 'Concorrência'
}

// Status de ata de registro de preços
export enum PriceRecordStatus {
  ACTIVE = 'Ativo',
  SUSPENDED = 'Suspenso',
  EXPIRED = 'Vencido',
  CANCELLED = 'Cancelado',
  RENEWED = 'Renovado'
}

// Status de editais
export enum EditalStatus {
  OPEN = 'Aberto',
  UNDER_REVIEW = 'Em Análise',
  CLOSED = 'Fechado',
  EXPIRED = 'Vencido',
  CANCELLED = 'Cancelado'
}

// Tipos de documentos de edital
export enum EditalDocumentType {
  MANDATORY = 'Obrigatório',
  OPTIONAL = 'Opcional',
  COMPLEMENTARY = 'Complementar'
}

// Status de documentos de edital
export enum EditalDocumentStatus {
  PENDING = 'Pendente',
  IN_PREPARATION = 'Em Preparação',
  READY = 'Pronto',
  SENT = 'Enviado'
}

// Status de produtos de edital
export enum EditalProductStatus {
  AVAILABLE = 'Disponível',
  UNDER_QUOTATION = 'Em Cotação',
  UNAVAILABLE = 'Indisponível'
}

// Tipos de arquivo
export enum FileType {
  PDF = 'pdf',
  DOC = 'doc',
  DOCX = 'docx',
  XLS = 'xls',
  XLSX = 'xlsx',
  OTHER = 'other'
}

// Níveis de risco
export enum RiskLevel {
  LOW = 'Baixo',
  MEDIUM = 'Médio',
  HIGH = 'Alto'
}

// Histórico de pagamento
export enum PaymentHistory {
  EXCELLENT = 'Excelente',
  GOOD = 'Bom',
  REGULAR = 'Regular',
  BAD = 'Ruim'
}

// Tipos de órgão público
export enum PublicBodyType {
  FEDERAL = 'Federal',
  STATE = 'Estadual',
  MUNICIPAL = 'Municipal',
  AUTARCHY = 'Autarquia',
  PUBLIC_COMPANY = 'Empresa Pública'
}

// Recomendações de análise
export enum AnalysisRecommendation {
  PARTICIPATE = 'Participar',
  DO_NOT_PARTICIPATE = 'Não Participar',
  EVALUATE_MORE = 'Avaliar Mais'
}

// Prioridades de produto
export enum ProductPriority {
  CRITICAL = 'Crítico',
  IMPORTANT = 'Importante',
  DESIRABLE = 'Desejável'
}

// Níveis de conformidade
export enum ComplianceLevel {
  TOTAL = 'Total',
  PARTIAL = 'Parcial',
  NOT_COMPLIANT = 'Não Atende'
}

// Disponibilidade de produto
export enum ProductAvailability {
  AVAILABLE = 'Disponível',
  ON_CONSULTATION = 'Sob Consulta',
  DISCONTINUED = 'Descontinuado'
}

// Tipos de módulo de precificação (mantido aqui por ser usado globalmente)
export enum PricingModule {
  IT_PRICING = 'IT Pricing',
  PRINTER_OUTSOURCING = 'Printer Outsourcing',
  SERVICE_DESK = 'Service Desk'
}

// Status de equipamento de impressão
export enum PrinterStatus {
  ACTIVE = 'Ativo',
  INACTIVE = 'Inativo',
  MAINTENANCE = 'Manutenção'
}

// Tipos de impressora
export enum PrinterType {
  LASER_BW = 'Laser Preto e Branco',
  LASER_COLOR = 'Laser Colorida',
  INKJET_BW = 'Jato de Tinta Preto e Branco',
  INKJET_COLOR = 'Jato de Tinta Colorida',
  MULTIFUNCTION_BW = 'Multifuncional Preto e Branco',
  MULTIFUNCTION_COLOR = 'Multifuncional Colorida',
  PLOTTER = 'Plotter',
  SCANNER = 'Scanner'
}

// Tipos de contrato de outsourcing
export enum OutsourcingContractType {
  MONTHLY = 'Mensal',
  QUARTERLY = 'Trimestral',
  SEMIANNUAL = 'Semestral',
  ANNUAL = 'Anual'
}

export default {
  GeneralStatus,
  PartnerType,
  QuoteStatus,
  ProposalStatus,
  ROStatus,
  TrainingType,
  RFPType,
  RFPStatus,
  PriceRecordType,
  PriceRecordStatus,
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
  ProductAvailability,
  PricingModule,
  PrinterStatus,
  PrinterType,
  OutsourcingContractType
}