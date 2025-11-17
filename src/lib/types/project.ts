/**
 * Project Types
 * Tipos para o sistema de geração e gestão de projetos
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Vinculação
  proposalId?: string; // Proposta vinculada
  clientId?: string;
  
  // Datas
  createdAt: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  estimatedDuration?: number; // em dias
  
  // Equipe
  team: ProjectTeamMember[];
  projectManager?: string;
  
  // Escopo
  scope: ProjectScope;
  
  // Cronograma
  timeline: ProjectTimeline;
  
  // Orçamento
  budget: ProjectBudget;
  
  // Riscos
  risks: ProjectRisk[];
  
  // Entregas
  deliverables: ProjectDeliverable[];
  
  // Progresso
  progress: ProjectProgress;
  
  // Documentos
  documents: ProjectDocument[];
  
  // Notas e comentários
  notes: string;
  tags: string[];
}

export enum ProjectType {
  NOC = 'NOC',
  SERVICE_DESK = 'SERVICE_DESK',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  CLOUD_MIGRATION = 'CLOUD_MIGRATION',
  SECURITY = 'SECURITY',
  CUSTOM = 'CUSTOM'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProjectPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ProjectTeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  allocation: number; // % de alocação
  startDate?: string;
  endDate?: string;
}

export interface ProjectScope {
  objectives: string[];
  deliverables: string[];
  outOfScope: string[];
  assumptions: string[];
  constraints: string[];
}

export interface ProjectTimeline {
  phases: ProjectPhase[];
  milestones: ProjectMilestone[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  tasks: ProjectTask[];
  dependencies: string[]; // IDs de fases dependentes
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  assignedTo?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: ProjectPriority;
  estimatedHours: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
  completedDate?: string;
  dependencies: string[]; // IDs de tasks dependentes
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'achieved' | 'missed';
  deliverables: string[];
}

export interface ProjectBudget {
  totalBudget: number;
  spentBudget: number;
  remainingBudget: number;
  currency: string;
  
  breakdown: BudgetItem[];
  
  // Controle de custos
  costVariance: number; // Variação de custo
  costPerformanceIndex: number; // CPI
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  plannedCost: number;
  actualCost: number;
  variance: number;
}

export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'financial' | 'resource' | 'schedule' | 'external';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  riskScore: number; // probability * impact
  status: 'identified' | 'analyzing' | 'mitigating' | 'closed';
  mitigationPlan?: string;
  owner?: string;
  identifiedDate: string;
  lastReviewDate?: string;
}

export interface ProjectDeliverable {
  id: string;
  name: string;
  description: string;
  type: 'document' | 'software' | 'hardware' | 'service' | 'other';
  status: 'pending' | 'in-progress' | 'review' | 'approved' | 'delivered';
  dueDate: string;
  deliveredDate?: string;
  assignedTo?: string;
  acceptanceCriteria: string[];
}

export interface ProjectProgress {
  overallProgress: number; // 0-100%
  phasesCompleted: number;
  tasksCompleted: number;
  totalTasks: number;
  milestonesAchieved: number;
  totalMilestones: number;
  
  // Métricas de desempenho
  scheduleVariance: number; // Variação de prazo
  schedulePerformanceIndex: number; // SPI
  
  // Status de saúde
  healthStatus: 'green' | 'yellow' | 'red';
  healthIndicators: {
    schedule: 'on-track' | 'at-risk' | 'delayed';
    budget: 'on-track' | 'at-risk' | 'over-budget';
    scope: 'on-track' | 'at-risk' | 'scope-creep';
    quality: 'on-track' | 'at-risk' | 'issues';
  };
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'charter' | 'plan' | 'report' | 'specification' | 'other';
  url?: string;
  uploadedDate: string;
  uploadedBy: string;
  version: string;
  size?: number;
}

// Template de projeto
export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  defaultDuration: number;
  phases: Omit<ProjectPhase, 'id' | 'startDate' | 'endDate' | 'status'>[];
  defaultRisks: Omit<ProjectRisk, 'id' | 'identifiedDate' | 'status'>[];
  defaultDeliverables: Omit<ProjectDeliverable, 'id' | 'status' | 'dueDate'>[];
  createdAt: string;
  updatedAt: string;
}

// Geração de projeto a partir de proposta
export interface ProjectGenerationConfig {
  proposalId: string;
  projectName?: string;
  startDate?: string;
  useProposalTimeline: boolean;
  useProposalBudget: boolean;
  useProposalScope: boolean;
  assignTeamMembers: boolean;
  generateRisks: boolean;
  generateTasks: boolean;
}
