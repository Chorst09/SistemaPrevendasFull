// Template System Types for Service Desk Pricing System

import { 
  ServiceDeskData, 
  TeamMember, 
  TaxConfiguration, 
  MarketVariables, 
  AdditionalCost,
  ServiceType,
  TaxRegime
} from './service-desk-pricing';

// Template Base Types
export interface ServiceDeskTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  type: TemplateType;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  rating: number;
  metadata: TemplateMetadata;
  data: TemplateData;
}

export enum TemplateCategory {
  COMPLETE_PROJECT = 'complete_project',
  TEAM_CONFIGURATION = 'team_configuration',
  TAX_CONFIGURATION = 'tax_configuration',
  COST_STRUCTURE = 'cost_structure',
  MARKET_VARIABLES = 'market_variables',
  INDUSTRY_SPECIFIC = 'industry_specific'
}

export enum TemplateType {
  PRESET = 'preset',           // Pre-configured templates
  USER_TEMPLATE = 'user_template', // User-created templates
  ORGANIZATION_TEMPLATE = 'organization_template', // Organization-wide templates
  INDUSTRY_TEMPLATE = 'industry_template' // Industry-specific templates
}

export interface TemplateMetadata {
  industry: string[];
  serviceTypes: ServiceType[];
  teamSize: TeamSizeRange;
  contractDuration: ContractDurationRange;
  complexity: TemplateComplexity;
  region: string[];
  applicableRegions: string[];
  prerequisites: string[];
  warnings: string[];
  recommendations: string[];
}

export interface TeamSizeRange {
  min: number;
  max: number;
  optimal: number;
}

export interface ContractDurationRange {
  minMonths: number;
  maxMonths: number;
  optimalMonths: number;
}

export enum TemplateComplexity {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Template Data Structure
export interface TemplateData {
  projectTemplate?: ProjectTemplate;
  teamTemplate?: TeamTemplate;
  taxTemplate?: TaxTemplate;
  variablesTemplate?: VariablesTemplate;
  costsTemplate?: CostsTemplate;
  budgetTemplate?: BudgetTemplate;
  analysisTemplate?: AnalysisTemplate;
}

// Specific Template Types
export interface ProjectTemplate {
  serviceType: ServiceType;
  defaultCurrency: string;
  defaultContractDuration: number;
  defaultRenewalOptions: any[];
  industryDefaults: Record<string, any>;
}

export interface TeamTemplate {
  roles: TeamRoleTemplate[];
  defaultBenefits: any;
  scalingRules: TeamScalingRule[];
  skillRequirements: SkillRequirement[];
}

export interface TeamRoleTemplate {
  role: string;
  description: string;
  baseSalaryRange: SalaryRange;
  requiredSkills: string[];
  optionalSkills: string[];
  workloadPercentage: number;
  isEssential: boolean;
  scalingFactor: number;
}

export interface SalaryRange {
  min: number;
  max: number;
  average: number;
  currency: string;
  region: string;
  lastUpdated: Date;
}

export interface TeamScalingRule {
  condition: string;
  action: 'add_role' | 'increase_workload' | 'adjust_salary';
  parameters: Record<string, any>;
}

export interface SkillRequirement {
  skill: string;
  level: number;
  isRequired: boolean;
  alternatives: string[];
}

export interface TaxTemplate {
  region: string;
  taxRegime: TaxRegime;
  defaultRates: TaxConfiguration;
  regionalVariations: Record<string, Partial<TaxConfiguration>>;
  optimizationTips: string[];
}

export interface VariablesTemplate {
  region: string;
  industry: string;
  defaultInflation: any;
  defaultSalaryAdjustments: any;
  commonMarketFactors: any[];
  scenarioTemplates: any[];
}

export interface CostsTemplate {
  industry: string;
  serviceType: ServiceType;
  commonCosts: CostTemplate[];
  scalingRules: CostScalingRule[];
}

export interface CostTemplate {
  name: string;
  category: string;
  estimatedValue: number;
  scalingFactor: number;
  frequency: string;
  isOptional: boolean;
  dependencies: string[];
}

export interface CostScalingRule {
  condition: string;
  multiplier: number;
  description: string;
}

export interface BudgetTemplate {
  defaultMargins: any;
  marginRules: MarginRule[];
  pricingStrategies: PricingStrategy[];
}

export interface MarginRule {
  condition: string;
  recommendedMargin: number;
  minMargin: number;
  maxMargin: number;
  reasoning: string;
}

export interface PricingStrategy {
  name: string;
  description: string;
  applicableScenarios: string[];
  marginAdjustments: Record<string, number>;
}

export interface AnalysisTemplate {
  industry: string;
  benchmarks: BenchmarkTemplate[];
  riskFactors: RiskFactorTemplate[];
  kpiTemplates: KPITemplate[];
}

export interface BenchmarkTemplate {
  metric: string;
  industryAverage: number;
  topQuartile: number;
  source: string;
  lastUpdated: Date;
}

export interface RiskFactorTemplate {
  name: string;
  category: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface KPITemplate {
  name: string;
  formula: string;
  target: number;
  unit: string;
  category: string;
}

// Template Application and Customization
export interface TemplateApplication {
  templateId: string;
  targetData: ServiceDeskData;
  customizations: TemplateCustomization[];
  conflicts: TemplateConflict[];
  warnings: string[];
}

export interface TemplateCustomization {
  field: string;
  originalValue: any;
  customValue: any;
  reason: string;
}

export interface TemplateConflict {
  field: string;
  templateValue: any;
  existingValue: any;
  resolution: ConflictResolution;
}

export enum ConflictResolution {
  USE_TEMPLATE = 'use_template',
  KEEP_EXISTING = 'keep_existing',
  MERGE = 'merge',
  ASK_USER = 'ask_user'
}

// Template Library and Management
export interface TemplateLibrary {
  templates: ServiceDeskTemplate[];
  categories: TemplateCategory[];
  filters: TemplateFilter[];
  searchIndex: TemplateSearchIndex;
}

export interface TemplateFilter {
  field: string;
  values: string[];
  type: 'single' | 'multiple' | 'range';
}

export interface TemplateSearchIndex {
  byName: Map<string, string[]>;
  byTag: Map<string, string[]>;
  byIndustry: Map<string, string[]>;
  byCategory: Map<TemplateCategory, string[]>;
}

// Template Import/Export
export interface TemplateExport {
  version: string;
  exportedAt: Date;
  templates: ServiceDeskTemplate[];
  metadata: ExportMetadata;
}

export interface ExportMetadata {
  source: string;
  exportedBy: string;
  includeUsageData: boolean;
  includePrivateTemplates: boolean;
}

export interface TemplateImport {
  source: TemplateExport;
  conflicts: ImportConflict[];
  options: ImportOptions;
}

export interface ImportConflict {
  templateId: string;
  templateName: string;
  conflictType: 'duplicate_id' | 'duplicate_name' | 'version_conflict';
  resolution: ImportResolution;
}

export enum ImportResolution {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
  CREATE_NEW = 'create_new',
  MERGE = 'merge'
}

export interface ImportOptions {
  overwriteExisting: boolean;
  createBackup: boolean;
  validateTemplates: boolean;
  importPrivateTemplates: boolean;
}

// Template Validation
export interface TemplateValidation {
  isValid: boolean;
  errors: TemplateValidationError[];
  warnings: TemplateValidationWarning[];
  score: number;
}

export interface TemplateValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface TemplateValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

// Preset Definitions
export interface PresetDefinition {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry: string;
  serviceType: ServiceType;
  teamSize: number;
  contractMonths: number;
  complexity: TemplateComplexity;
  data: Partial<ServiceDeskData>;
}

// Built-in Presets
export const BUILTIN_PRESETS: PresetDefinition[] = [
  {
    id: 'basic-it-support',
    name: 'Suporte de TI Básico',
    description: 'Template para serviços básicos de suporte de TI com equipe pequena',
    category: TemplateCategory.COMPLETE_PROJECT,
    industry: 'Tecnologia',
    serviceType: ServiceType.BASIC,
    teamSize: 5,
    contractMonths: 12,
    complexity: TemplateComplexity.BASIC,
    data: {
      // Will be populated with actual preset data
    }
  },
  {
    id: 'enterprise-service-desk',
    name: 'Service Desk Empresarial',
    description: 'Template completo para service desk empresarial com múltiplos níveis',
    category: TemplateCategory.COMPLETE_PROJECT,
    industry: 'Corporativo',
    serviceType: ServiceType.ENTERPRISE,
    teamSize: 25,
    contractMonths: 24,
    complexity: TemplateComplexity.ADVANCED,
    data: {
      // Will be populated with actual preset data
    }
  },
  {
    id: 'healthcare-it-support',
    name: 'Suporte de TI para Saúde',
    description: 'Template especializado para suporte de TI em ambiente hospitalar',
    category: TemplateCategory.INDUSTRY_SPECIFIC,
    industry: 'Saúde',
    serviceType: ServiceType.PREMIUM,
    teamSize: 15,
    contractMonths: 36,
    complexity: TemplateComplexity.INTERMEDIATE,
    data: {
      // Will be populated with actual preset data
    }
  }
];

// Template Usage Analytics
export interface TemplateUsageAnalytics {
  templateId: string;
  usageCount: number;
  lastUsed: Date;
  averageRating: number;
  successRate: number;
  commonCustomizations: TemplateCustomization[];
  userFeedback: TemplateFeedback[];
}

export interface TemplateFeedback {
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: boolean;
}