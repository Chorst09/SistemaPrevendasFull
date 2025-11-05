// Core Data Structures for Service Desk Pricing System

export interface ServiceDeskData {
  project: ProjectData;
  team: TeamMemberNew[];
  jobPositions?: JobPosition[];
  schedules: WorkSchedule[];
  taxes: TaxConfiguration;
  variables: MarketVariables;
  otherCosts: AdditionalCost[];
  budget: ConsolidatedBudget;
  forecast: ForecastData;
  analysis: ProfitabilityAnalysis;
  negotiations: NegotiationScenario[];
  finalAnalysis: ExecutiveDashboard;
  reports?: any[];
  metadata: ProjectMetadata;
}

// Job Positions and Salaries
export interface JobPosition {
  id: string;
  name: string;
  level?: string;
  salary8h: number;
  salary6h?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Project Data (Tab 1: Dados)
export interface ProjectData {
  id: string;
  name: string;
  client: ClientInfo;
  contractPeriod: ContractPeriod;
  description: string;
  currency: string;
  location: string;
  serviceType: ServiceType;
  additionalServices?: AdditionalServices;
  generalInfo?: GeneralInfo;
  dimensioning?: DimensioningConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdditionalServices {
  needsSoftware: boolean;
  needs0800: boolean;
  needsDirectCall: boolean;
  needsInfrastructure: boolean;
}

export interface GeneralInfo {
  userQuantity: number;
  monthlyCalls: number;
}

export interface DimensioningConfig {
  incidentsPerUser: number;
  tmaMinutes: number;
  occupancyRate: number;
  n1Distribution: number;
  n1Capacity: number;
  n2Capacity: number;
  n1SixHourShift: boolean;
  coverageType: CoverageType;
  suggestedN1?: number;
  suggestedN2?: number;
}

export enum CoverageType {
  BUSINESS_HOURS = '8x5', // 8 horas por dia, 5 dias por semana
  EXTENDED_HOURS = '12x5', // 12 horas por dia, 5 dias por semana
  FULL_TIME = '24x7' // 24 horas por dia, 7 dias por semana
}

// Forecast Data Structures
export interface ForecastData {
  id: string;
  projectId: string;
  scenarios: ForecastScenario[];
  assumptions: ForecastAssumptions;
  projections: ForecastProjection[];
  riskAnalysis: ForecastRiskAnalysis;
  dashboard: ForecastDashboard;
  createdAt: Date;
  updatedAt: Date;
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  probability: number; // 0-100%
  assumptions: ScenarioAssumptions;
  projections: MonthlyProjection[];
  isBaseline: boolean;
  color: string;
}

export enum ScenarioType {
  OPTIMISTIC = 'optimistic',
  REALISTIC = 'realistic', 
  PESSIMISTIC = 'pessimistic',
  CUSTOM = 'custom'
}

export interface ScenarioAssumptions {
  revenueGrowth: number; // % per year
  costInflation: number; // % per year
  teamGrowth: number; // % per year
  efficiencyGains: number; // % per year
  marketFactors: MarketFactor[];
  customAdjustments: CustomAdjustment[];
}

export interface CustomAdjustment {
  id: string;
  name: string;
  category: 'revenue' | 'cost' | 'team' | 'efficiency';
  type: 'percentage' | 'fixed' | 'formula';
  value: number;
  startMonth: number;
  endMonth?: number;
  description: string;
}

export interface ForecastAssumptions {
  contractDuration: number; // months
  inflationRate: number; // % per year
  salaryAdjustment: number; // % per year
  renewalProbability: number; // % 
  expansionProbability: number; // %
  churnRate: number; // % per year
  seasonalFactors: SeasonalFactor[];
}

export interface SeasonalFactor {
  month: number; // 1-12
  factor: number; // multiplier (1.0 = normal)
  description: string;
}

export interface MonthlyProjection {
  month: number;
  year: number;
  revenue: number;
  costs: CostBreakdown;
  profit: number;
  margin: number;
  teamSize: number;
  ticketVolume: number;
  kpis: MonthlyKPIs;
}

export interface CostBreakdown {
  personnel: number;
  infrastructure: number;
  operations: number;
  taxes: number;
  other: number;
  total: number;
}

export interface MonthlyKPIs {
  customerSatisfaction: number;
  slaCompliance: number;
  firstCallResolution: number;
  averageResolutionTime: number;
  costPerTicket: number;
  revenuePerEmployee: number;
}

export interface ForecastProjection {
  scenarioId: string;
  timeframe: ProjectionTimeframe;
  summary: ProjectionSummary;
  monthlyData: MonthlyProjection[];
  yearlyData: YearlyProjection[];
}

export enum ProjectionTimeframe {
  SHORT_TERM = '12_months',
  MEDIUM_TERM = '24_months', 
  LONG_TERM = '36_months',
  CUSTOM = 'custom'
}

export interface ProjectionSummary {
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  averageMargin: number;
  roi: number;
  paybackPeriod: number;
  breakEvenMonth: number;
}

export interface YearlyProjection {
  year: number;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  growth: number;
  teamSize: number;
}

export interface ForecastRiskAnalysis {
  risks: ForecastRisk[];
  mitigations: RiskMitigation[];
  sensitivityAnalysis: SensitivityAnalysis[];
  monteCarloResults?: MonteCarloResults;
}

export interface ForecastRisk {
  id: string;
  name: string;
  category: RiskCategory;
  probability: number; // 0-100%
  impact: number; // 0-100%
  severity: RiskSeverity;
  description: string;
  potentialLoss: number;
  timeframe: string;
}

export enum RiskCategory {
  MARKET = 'market',
  OPERATIONAL = 'operational',
  FINANCIAL = 'financial',
  TECHNICAL = 'technical',
  REGULATORY = 'regulatory',
  COMPETITIVE = 'competitive'
}

export enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface SensitivityAnalysis {
  variable: string;
  baseValue: number;
  variations: number[]; // percentage changes
  impacts: number[]; // impact on profit
  elasticity: number;
}

export interface MonteCarloResults {
  iterations: number;
  confidence: number; // 95%, 99%, etc.
  profitRange: {
    min: number;
    max: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  riskMetrics: {
    probabilityOfLoss: number;
    valueAtRisk: number;
    expectedShortfall: number;
  };
}

export interface ForecastDashboard {
  kpis: DashboardKPI[];
  charts: DashboardChart[];
  alerts: DashboardAlert[];
  insights: DashboardInsight[];
  lastUpdated: Date;
}

export interface DashboardKPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage change
  target?: number;
  status: 'good' | 'warning' | 'critical';
  description: string;
}

export interface DashboardChart {
  id: string;
  type: ChartType;
  title: string;
  data: ChartData[];
  config: ChartConfig;
}

export enum ChartType {
  LINE = 'line',
  BAR = 'bar',
  AREA = 'area',
  PIE = 'pie',
  SCATTER = 'scatter',
  WATERFALL = 'waterfall',
  HEATMAP = 'heatmap'
}

export interface ChartData {
  x: string | number;
  y: number;
  series?: string;
  color?: string;
  metadata?: any;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  series?: string[];
  colors?: string[];
  showLegend: boolean;
  showGrid: boolean;
  animations: boolean;
}

export interface DashboardAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  threshold: number;
  currentValue: number;
  trend: 'improving' | 'worsening' | 'stable';
  actionRequired: boolean;
  createdAt: Date;
}

export enum AlertType {
  PERFORMANCE = 'performance',
  BUDGET = 'budget',
  RISK = 'risk',
  OPPORTUNITY = 'opportunity',
  COMPLIANCE = 'compliance'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface DashboardInsight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: number; // financial impact
  confidence: number; // 0-100%
  recommendation: string;
  priority: InsightPriority;
  category: string;
}

export enum InsightType {
  COST_OPTIMIZATION = 'cost_optimization',
  REVENUE_OPPORTUNITY = 'revenue_opportunity',
  RISK_MITIGATION = 'risk_mitigation',
  EFFICIENCY_IMPROVEMENT = 'efficiency_improvement',
  MARKET_TREND = 'market_trend'
}

export enum InsightPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface ClientInfo {
  name: string;
  document: string; // CNPJ/CPF
  email: string;
  phone: string;
  address: Address;
  contactPerson: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ContractPeriod {
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  renewalOptions: RenewalOption[];
}

export interface RenewalOption {
  periodMonths: number;
  adjustmentType: 'fixed' | 'inflation' | 'negotiated';
  adjustmentValue?: number;
}

export enum ServiceType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom'
}

// Team Data (Tab 2: Equipe)
export interface TeamMember {
  id: string;
  name: string;
  jobPositionId: string;
  workingHours: 8 | 6; // 8 or 6 hours
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  notes?: string;
  // Legacy fields for backward compatibility
  role?: string;
  salary?: number;
  benefits?: BenefitPackage;
  workload?: number; // horas por semana
  costPerHour?: number;
  skills?: string[];
  certifications?: string[];
}

// New Team Member structure for position-based teams
export interface TeamMemberNew {
  id: string;
  jobPositionId: string;
  quantity: number; // Number of people in this position
  workingHours: 8 | 6; // 8 or 6 hours
  isActive: boolean;
  notes?: string;
  // Legacy fields for backward compatibility
  name?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface BenefitPackage {
  healthInsurance: number;
  mealVoucher: number;
  transportVoucher: number;
  lifeInsurance: number;
  vacation: number;
  thirteenthSalary: number;
  fgts: number; // 8%
  inss: number;
  otherBenefits: CustomBenefit[];
}

export interface CustomBenefit {
  name: string;
  value: number;
  type: 'fixed' | 'percentage';
}

// Schedule Data (Tab 3: Escala)
export interface WorkSchedule {
  id: string;
  name: string;
  shifts: Shift[];
  coverage: CoverageRequirement;
  specialRates: SpecialRateConfig[];
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  teamMembers: string[]; // TeamMember IDs
  isSpecialShift: boolean;
  multiplier: number; // Cost multiplier for special shifts
}

export interface CoverageRequirement {
  minimumStaff: number;
  preferredStaff: number;
  skillRequirements: SkillRequirement[];
  availabilityHours: AvailabilityWindow[];
}

export interface SkillRequirement {
  skill: string;
  minimumLevel: number;
  required: boolean;
}

export interface AvailabilityWindow {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SpecialRateConfig {
  name: string;
  condition: string; // e.g., "weekend", "holiday", "night"
  multiplier: number;
  applicableShifts: string[];
}

// Tax Configuration (Tab 4: Impostos)
export interface TaxConfiguration {
  region: string;
  icms: number;
  pis: number;
  cofins: number;
  iss: number;
  ir: number;
  csll: number;
  customTaxes: CustomTax[];
  taxRegime: TaxRegime;
}

export interface CustomTax {
  name: string;
  rate: number;
  calculationBase: 'revenue' | 'profit' | 'fixed';
  description: string;
}

export enum TaxRegime {
  SIMPLES_NACIONAL = 'simples_nacional',
  LUCRO_PRESUMIDO = 'lucro_presumido',
  LUCRO_REAL = 'lucro_real'
}

// Market Variables (Tab 5: Variáveis)
export interface MarketVariables {
  inflation: InflationConfig;
  salaryAdjustments: SalaryAdjustmentConfig;
  marketFactors: MarketFactor[];
  scenarios: ScenarioConfig[];
}

export interface InflationConfig {
  annualRate: number;
  monthlyRate: number;
  projectionPeriod: number; // months
  source: string;
  lastUpdate: Date;
}

export interface SalaryAdjustmentConfig {
  annualAdjustment: number;
  adjustmentDate: Date;
  adjustmentType: 'inflation' | 'productivity' | 'market' | 'negotiated';
  minimumAdjustment: number;
  maximumAdjustment: number;
}

export interface MarketFactor {
  name: string;
  impact: number; // percentage
  description: string;
  category: 'economic' | 'technological' | 'regulatory' | 'competitive';
  probability: number; // 0-1
}

export interface ScenarioConfig {
  name: string;
  description: string;
  probability: number;
  adjustments: ScenarioAdjustment[];
}

export interface ScenarioAdjustment {
  category: 'salary' | 'costs' | 'revenue' | 'taxes';
  adjustment: number; // percentage
  reason: string;
}

// Additional Costs (Tab 6: Outros Custos)
export interface AdditionalCost {
  id: string;
  name: string;
  category: CostCategory;
  value: number;
  type: CostType;
  frequency: CostFrequency;
  startDate: Date;
  endDate?: Date;
  description: string;
  allocation: CostAllocation;
}

export enum CostCategory {
  INFRASTRUCTURE = 'infrastructure',
  LICENSES = 'licenses',
  TRAINING = 'training',
  EQUIPMENT = 'equipment',
  FACILITIES = 'facilities',
  UTILITIES = 'utilities',
  INSURANCE = 'insurance',
  LEGAL = 'legal',
  MARKETING = 'marketing',
  OTHER = 'other'
}

export enum CostType {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  SEMI_VARIABLE = 'semi_variable',
  EVENTUAL = 'eventual'
}

export enum CostFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  ANNUAL = 'annual',
  ONE_TIME = 'one_time'
}

export interface CostAllocation {
  method: 'equal' | 'proportional' | 'custom';
  periods: number[];
  percentages?: number[];
}

// Consolidated Budget (Tab 7: Orçamento)
export interface ConsolidatedBudget {
  teamCosts: TeamCostSummary;
  infrastructureCosts: number;
  otherCosts: number;
  taxes: TaxSummary;
  totalCosts: number;
  margin: MarginConfiguration;
  totalPrice: number;
  monthlyBreakdown: MonthlyBudget[];
}

export interface TeamCostSummary {
  salaries: number;
  benefits: number;
  total: number;
  breakdown: TeamCostBreakdown[];
}

export interface TeamCostBreakdown {
  memberId: string;
  memberName: string;
  role: string;
  monthlyCost: number;
  annualCost: number;
}

export interface TaxSummary {
  federal: number;
  state: number;
  municipal: number;
  total: number;
  breakdown: TaxBreakdown[];
}

export interface TaxBreakdown {
  taxName: string;
  rate: number;
  base: number;
  amount: number;
}

export interface MarginConfiguration {
  type: 'percentage' | 'fixed';
  value: number;
  minimumMargin: number;
  targetMargin: number;
  maximumMargin: number;
}

export interface MonthlyBudget {
  month: number;
  year: number;
  teamCosts: number;
  otherCosts: number;
  taxes: number;
  totalCosts: number;
  revenue: number;
  profit: number;
  margin: number;
}

// Profitability Analysis (Tab 8: Resultado)
export interface ProfitabilityAnalysis {
  roi: ROIAnalysis;
  payback: PaybackAnalysis;
  margins: MarginAnalysis;
  riskAnalysis: RiskAnalysis;
  sensitivityAnalysis: SensitivityAnalysis;
  charts: ChartConfiguration[];
}

export interface ROIAnalysis {
  investment: number;
  returns: number[];
  roi: number;
  irr: number; // Internal Rate of Return
  npv: number; // Net Present Value
  period: number;
}

export interface PaybackAnalysis {
  simplePayback: number; // months
  discountedPayback: number; // months
  breakEvenPoint: number; // months
  cashFlowAnalysis: CashFlowPeriod[];
}

export interface CashFlowPeriod {
  period: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

export interface MarginAnalysis {
  grossMargin: number;
  netMargin: number;
  ebitdaMargin: number;
  contributionMargin: number;
  marginTrend: MarginTrendPoint[];
}

export interface MarginTrendPoint {
  period: number;
  grossMargin: number;
  netMargin: number;
}

export interface RiskAnalysis {
  riskFactors: RiskFactor[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  mitigation: RiskMitigation[];
}

export interface RiskFactor {
  name: string;
  probability: number;
  impact: number;
  category: 'financial' | 'operational' | 'market' | 'regulatory';
  description: string;
}

export interface RiskMitigation {
  riskFactor: string;
  strategy: string;
  cost: number;
  effectiveness: number;
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[];
  scenarios: SensitivityScenario[];
}

export interface SensitivityVariable {
  name: string;
  baseValue: number;
  variations: number[]; // percentage variations
  impacts: number[]; // impact on profit
}

export interface SensitivityScenario {
  name: string;
  changes: VariableChange[];
  resultingProfit: number;
  profitChange: number;
}

export interface VariableChange {
  variable: string;
  change: number; // percentage
}

export interface ChartConfiguration {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  data: any[];
  xAxis: string;
  yAxis: string;
  series: ChartSeries[];
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

// Negotiation Scenarios (Tab 9: Negociação)
export interface NegotiationScenario {
  id: string;
  name: string;
  description: string;
  baseScenario: boolean;
  adjustments: NegotiationAdjustment[];
  results: NegotiationResult;
  createdAt: Date;
  version: number;
}

export interface NegotiationAdjustment {
  category: 'price' | 'terms' | 'scope' | 'timeline';
  field: string;
  originalValue: any;
  adjustedValue: any;
  impact: number; // percentage impact on profit
  reason: string;
}

export interface NegotiationResult {
  totalPrice: number;
  totalCost: number;
  profit: number;
  margin: number;
  roi: number;
  payback: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ScenarioComparison {
  scenarios: string[]; // scenario IDs
  metrics: ComparisonMetric[];
  recommendation: string;
}

export interface ComparisonMetric {
  name: string;
  values: number[];
  unit: string;
  higherIsBetter: boolean;
}

// Executive Dashboard (Tab 10: Análise Final)
export interface ExecutiveDashboard {
  kpis: KPI[];
  summary: ExecutiveSummary;
  recommendations: Recommendation[];
  benchmarks: MarketBenchmark[];
  approvals: ApprovalStatus[];
}

export interface KPI {
  name: string;
  value: number;
  unit: string;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  description: string;
}

export interface ExecutiveSummary {
  projectValue: number;
  expectedProfit: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendedAction: 'approve' | 'negotiate' | 'reject' | 'review';
  keyHighlights: string[];
  concerns: string[];
}

export interface Recommendation {
  type: 'cost_optimization' | 'pricing_adjustment' | 'risk_mitigation' | 'scope_change';
  title: string;
  description: string;
  impact: number; // financial impact
  effort: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface MarketBenchmark {
  metric: string;
  ourValue: number;
  marketAverage: number;
  marketBest: number;
  position: 'below' | 'average' | 'above' | 'best';
  source: string;
}

export interface ApprovalStatus {
  level: string; // e.g., "Technical", "Financial", "Executive"
  status: 'pending' | 'approved' | 'rejected' | 'conditional';
  approver: string;
  date?: Date;
  comments?: string;
  conditions?: string[];
}

// Validation and Error Handling
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface TabValidationStatus {
  tabId: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completionPercentage: number;
}

// Project Metadata
export interface ProjectMetadata {
  version: string;
  lastModified: Date;
  modifiedBy: string;
  status: ProjectStatus;
  tags: string[];
  notes: string;
  attachments: Attachment[];
}

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

// Calculation Results
export interface TeamCostCalculation {
  totalMonthlyCost: number;
  totalAnnualCost: number;
  costPerHour: number;
  breakdown: TeamMemberCostCalculation[];
}

export interface TeamMemberCostCalculation {
  memberId: string;
  baseSalary: number;
  benefits: number;
  totalCost: number;
  hourlyRate: number;
  annualCost: number;
}

export interface CoverageAnalysis {
  totalHours: number;
  coveredHours: number;
  coveragePercentage: number;
  gaps: CoverageGap[];
  recommendations: string[];
}

export interface CoverageGap {
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedSolution: string;
}

export interface TaxCalculationResult {
  totalTaxes: number;
  effectiveRate: number;
  breakdown: TaxBreakdown[];
  optimizationSuggestions: string[];
}

// Export Options
export interface ExportOption {
  format: 'pdf' | 'excel' | 'json' | 'csv';
  template: string;
  sections: string[];
  customization: ExportCustomization;
}

export interface ExportCustomization {
  includeCharts: boolean;
  includeDetails: boolean;
  language: 'pt' | 'en' | 'es';
  currency: string;
  dateFormat: string;
}