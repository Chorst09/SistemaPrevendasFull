/**
 * Tipos para Proposta Comercial
 */

export interface CommercialProposal {
  id: string;
  title: string;
  proposalNumber: string;
  version: string;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
  validUntil: Date;

  // 1. Informações de Capa
  cover: CoverInfo;

  // 2. Tom de Voz
  toneOfVoice: ToneOfVoice;

  // 3. Sumário Executivo
  executiveSummary: ExecutiveSummary;

  // 4. Entendimento do Desafio
  challengeUnderstanding: ChallengeUnderstanding;

  // 5. Solução Proposta
  proposedSolution: ProposedSolution;

  // 6. Escopo Detalhado
  detailedScope: DetailedScope;

  // 7. Cronograma
  timeline: ProposalTimeline;

  // 8. Investimento
  investment: Investment;

  // 9. Diferenciais
  differentials: Differentials;

  // 10. Próximos Passos
  nextSteps: NextSteps;

  // Dados do Cliente
  client: ClientInfo;

  // Dados da Empresa
  company: CompanyInfo;

  // Itens da Proposta
  items: ProposalItem[];

  // Anexos
  attachments: ProposalAttachment[];

  // Aprovações
  approvals: ProposalApproval[];
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  SENT = 'SENT',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

export interface ClientInfo {
  name: string;
  document: string; // CNPJ/CPF
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export interface CompanyInfo {
  name: string;
  document: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface ProjectScope {
  title: string;
  description: string;
  objectives: string[];
  deliverables: string[];
  timeline: {
    startDate: Date;
    endDate: Date;
    milestones: Milestone[];
  };
  assumptions: string[];
  exclusions: string[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  deliverables: string[];
}

export interface ProposalItem {
  id: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  total: number;
  notes?: string;
}

export interface ProposalPricing {
  subtotal: number;
  discount: number;
  discountPercentage: number;
  taxes: {
    name: string;
    rate: number;
    amount: number;
  }[];
  totalTaxes: number;
  total: number;
  currency: string;
  paymentTerms: PaymentTerm[];
}

export interface PaymentTerm {
  id: string;
  description: string;
  percentage: number;
  amount: number;
  dueDate?: Date;
  condition?: string;
}

export interface ProposalTerms {
  paymentConditions: string;
  deliveryTerms: string;
  warranty: string;
  support: string;
  cancellationPolicy: string;
  confidentiality: string;
  intellectualProperty: string;
  liabilities: string;
  disputeResolution: string;
  additionalTerms: string[];
}

export interface ProposalAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface ProposalApproval {
  id: string;
  approverName: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedAt?: Date;
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  template: Partial<CommercialProposal>;
  createdAt: Date;
  updatedAt: Date;
}

// Novos tipos para estrutura completa da proposta

export interface CoverInfo {
  clientName: string;
  clientContact: string;
  ourCompany: string;
  ourContact: string;
  proposalDate: Date;
  validityDays: number;
  proposalTitle: string;
}

export type ToneOfVoice = 
  | 'formal-corporativo'
  | 'consultivo-especialista'
  | 'moderno-parceiro'
  | 'direto-tecnico'
  | 'entusiasta-criativo';

export interface ExecutiveSummary {
  problem: string; // A dor do cliente
  solution: string; // Nossa resposta
  mainBenefit: string; // O ganho esperado
}

export interface ChallengeUnderstanding {
  currentContext: string[]; // Contexto atual do cliente (tópicos)
  businessObjectives: string[]; // Objetivos de negócio
}

export interface ProposedSolution {
  methodology: string; // Metodologia/Abordagem
  phases: ProjectPhase[]; // Fases do projeto
}

export interface ProjectPhase {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  duration?: string;
}

export interface DetailedScope {
  includedServices: string[]; // Serviços incluídos
  excludedServices: string[]; // Serviços NÃO incluídos
}

export interface ProposalTimeline {
  totalDuration: string; // Duração total estimada
  milestones: TimelineMilestone[]; // Marcos principais
}

export interface TimelineMilestone {
  id: string;
  period: string; // Ex: "Semana 1-2"
  description: string;
  startDate?: string; // Data de início
  endDate?: string; // Data de término
  durationDays?: number; // Duração em dias
  dependencies?: string[]; // IDs de marcos dependentes
}

export interface Investment {
  plans: InvestmentPlan[];
  setupFee?: number;
  paymentConditions: string;
  contractTerms: string;
}

export interface InvestmentPlan {
  id: string;
  name: string; // Ex: "Plano Completo"
  value: number;
  recurrence: 'monthly' | 'quarterly' | 'annual' | 'one-time';
  description?: string;
}

export interface Differentials {
  whoWeAre: string; // Quem somos
  keyDifferentials: string[]; // 2-3 pontos fortes
  socialProof: SocialProofItem[]; // Estudos de caso ou depoimentos
}

export interface SocialProofItem {
  id: string;
  type: 'case-study' | 'testimonial';
  company?: string;
  description: string;
  author?: string;
  authorRole?: string;
}

export interface NextSteps {
  callToAction: string; // O que fazer para aprovar
  contactInfo: string; // Informações de contato
}
