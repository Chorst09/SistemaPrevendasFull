// Analytics and Metrics Types for Service Desk Pricing System

export interface ServiceDeskAnalytics {
  systemMetrics: SystemMetrics;
  usageMetrics: UsageMetrics;
  performanceMetrics: PerformanceMetrics;
  userBehaviorMetrics: UserBehaviorMetrics;
  businessMetrics: BusinessMetrics;
  errorMetrics: ErrorMetrics;
}

// System Performance Metrics
export interface SystemMetrics {
  uptime: number; // in milliseconds
  memoryUsage: MemoryUsage;
  responseTime: ResponseTimeMetrics;
  throughput: ThroughputMetrics;
  availability: AvailabilityMetrics;
  lastUpdated: Date;
}

export interface MemoryUsage {
  used: number; // in bytes
  total: number; // in bytes
  percentage: number;
  peak: number; // peak usage in current session
  trend: MemoryTrendPoint[];
}

export interface MemoryTrendPoint {
  timestamp: Date;
  usage: number;
  percentage: number;
}

export interface ResponseTimeMetrics {
  average: number; // in milliseconds
  median: number;
  p95: number; // 95th percentile
  p99: number; // 99th percentile
  min: number;
  max: number;
  samples: ResponseTimeSample[];
}

export interface ResponseTimeSample {
  timestamp: Date;
  operation: string;
  duration: number;
  success: boolean;
}

export interface ThroughputMetrics {
  requestsPerSecond: number;
  calculationsPerSecond: number;
  dataOperationsPerSecond: number;
  peakThroughput: number;
  averageThroughput: number;
}

export interface AvailabilityMetrics {
  uptime: number; // percentage
  downtime: number; // in milliseconds
  incidents: IncidentRecord[];
  mtbf: number; // Mean Time Between Failures
  mttr: number; // Mean Time To Recovery
}

export interface IncidentRecord {
  id: string;
  timestamp: Date;
  type: IncidentType;
  severity: IncidentSeverity;
  duration: number;
  description: string;
  resolved: boolean;
  resolution?: string;
}

export enum IncidentType {
  SYSTEM_ERROR = 'system_error',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  DATA_CORRUPTION = 'data_corruption',
  CALCULATION_ERROR = 'calculation_error',
  UI_ERROR = 'ui_error',
  INTEGRATION_ERROR = 'integration_error'
}

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Usage Metrics
export interface UsageMetrics {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  tabUsage: TabUsageMetrics;
  featureUsage: FeatureUsageMetrics;
  templateUsage: TemplateUsageMetrics;
  exportUsage: ExportUsageMetrics;
  timeDistribution: TimeDistributionMetrics;
}

export interface TabUsageMetrics {
  [tabId: string]: {
    visits: number;
    timeSpent: number; // in milliseconds
    completionRate: number; // percentage
    errorRate: number; // percentage
    lastAccessed: Date;
  };
}

export interface FeatureUsageMetrics {
  calculations: CalculationUsageMetrics;
  validations: ValidationUsageMetrics;
  dataOperations: DataOperationMetrics;
  navigation: NavigationMetrics;
}

export interface CalculationUsageMetrics {
  totalCalculations: number;
  calculationsByType: Record<string, number>;
  averageCalculationTime: number;
  failedCalculations: number;
  cacheHitRate: number;
}

export interface ValidationUsageMetrics {
  totalValidations: number;
  validationsByType: Record<string, number>;
  averageValidationTime: number;
  failedValidations: number;
  warningsGenerated: number;
}

export interface DataOperationMetrics {
  saves: number;
  loads: number;
  exports: number;
  imports: number;
  backups: number;
  failures: number;
}

export interface NavigationMetrics {
  tabSwitches: number;
  backNavigations: number;
  forwardNavigations: number;
  directNavigations: number;
  validationBlocks: number;
}

export interface TemplateUsageMetrics {
  templatesApplied: number;
  templatesCreated: number;
  templatesShared: number;
  mostUsedTemplates: TemplateUsageRecord[];
  templateSuccessRate: number;
}

export interface TemplateUsageRecord {
  templateId: string;
  templateName: string;
  usageCount: number;
  successRate: number;
  averageRating: number;
  lastUsed: Date;
}

export interface ExportUsageMetrics {
  totalExports: number;
  exportsByFormat: Record<string, number>;
  exportsByType: Record<string, number>;
  averageExportTime: number;
  failedExports: number;
}

export interface TimeDistributionMetrics {
  hourlyUsage: Record<number, number>; // hour -> usage count
  dailyUsage: Record<string, number>; // day -> usage count
  weeklyUsage: Record<number, number>; // week -> usage count
  monthlyUsage: Record<string, number>; // month -> usage count
}

// Performance Metrics
export interface PerformanceMetrics {
  renderingMetrics: RenderingMetrics;
  calculationMetrics: CalculationPerformanceMetrics;
  dataMetrics: DataPerformanceMetrics;
  networkMetrics: NetworkMetrics;
  resourceMetrics: ResourceMetrics;
}

export interface RenderingMetrics {
  averageRenderTime: number;
  slowRenders: number; // renders > 16ms
  totalRenders: number;
  componentMetrics: ComponentPerformanceMetrics[];
}

export interface ComponentPerformanceMetrics {
  componentName: string;
  averageRenderTime: number;
  renderCount: number;
  slowRenders: number;
  memoryUsage: number;
}

export interface CalculationPerformanceMetrics {
  averageCalculationTime: number;
  slowCalculations: number;
  totalCalculations: number;
  calculationsByComplexity: Record<string, CalculationComplexityMetrics>;
}

export interface CalculationComplexityMetrics {
  count: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
  errorRate: number;
}

export interface DataPerformanceMetrics {
  averageLoadTime: number;
  averageSaveTime: number;
  cacheHitRate: number;
  cacheMissRate: number;
  dataSize: DataSizeMetrics;
}

export interface DataSizeMetrics {
  averageProjectSize: number;
  largestProject: number;
  totalDataSize: number;
  compressionRatio: number;
}

export interface NetworkMetrics {
  averageLatency: number;
  requestCount: number;
  failedRequests: number;
  bandwidth: BandwidthMetrics;
}

export interface BandwidthMetrics {
  upload: number; // bytes per second
  download: number; // bytes per second
  peak: number;
  average: number;
}

export interface ResourceMetrics {
  cpuUsage: number; // percentage
  memoryUsage: number; // bytes
  diskUsage: number; // bytes
  networkUsage: number; // bytes
  batteryImpact: BatteryImpactMetrics;
}

export interface BatteryImpactMetrics {
  cpuImpact: number; // percentage
  networkImpact: number; // percentage
  displayImpact: number; // percentage
  totalImpact: number; // percentage
}

// User Behavior Metrics
export interface UserBehaviorMetrics {
  sessionMetrics: SessionMetrics;
  interactionMetrics: InteractionMetrics;
  workflowMetrics: WorkflowMetrics;
  errorPatterns: ErrorPatternMetrics;
  learningMetrics: LearningMetrics;
}

export interface SessionMetrics {
  averageSessionDuration: number;
  sessionsPerUser: number;
  bounceRate: number; // percentage of single-tab sessions
  returnRate: number; // percentage of returning users
  sessionDepth: SessionDepthMetrics;
}

export interface SessionDepthMetrics {
  averageTabsVisited: number;
  averageActionsPerSession: number;
  completionRate: number; // percentage of sessions that complete a project
  abandonmentPoints: AbandonmentPoint[];
}

export interface AbandonmentPoint {
  tabId: string;
  abandonmentRate: number;
  commonReasons: string[];
}

export interface InteractionMetrics {
  clickMetrics: ClickMetrics;
  inputMetrics: InputMetrics;
  navigationMetrics: NavigationInteractionMetrics;
  helpUsage: HelpUsageMetrics;
}

export interface ClickMetrics {
  totalClicks: number;
  clicksByElement: Record<string, number>;
  clickHeatmap: ClickHeatmapPoint[];
  averageClicksPerSession: number;
}

export interface ClickHeatmapPoint {
  x: number;
  y: number;
  count: number;
  element: string;
}

export interface InputMetrics {
  totalInputs: number;
  inputsByField: Record<string, InputFieldMetrics>;
  averageInputTime: number;
  correctionRate: number; // percentage of inputs that are corrected
}

export interface InputFieldMetrics {
  fieldName: string;
  inputCount: number;
  averageInputTime: number;
  errorRate: number;
  correctionRate: number;
  validationFailures: number;
}

export interface NavigationInteractionMetrics {
  tabSwitchPatterns: TabSwitchPattern[];
  backButtonUsage: number;
  breadcrumbUsage: number;
  shortcutUsage: Record<string, number>;
}

export interface TabSwitchPattern {
  fromTab: string;
  toTab: string;
  frequency: number;
  averageTime: number;
}

export interface HelpUsageMetrics {
  tooltipViews: number;
  helpDocumentViews: number;
  searchQueries: string[];
  supportRequests: number;
}

export interface WorkflowMetrics {
  commonWorkflows: WorkflowPattern[];
  workflowEfficiency: WorkflowEfficiencyMetrics;
  bottlenecks: WorkflowBottleneck[];
  optimizationOpportunities: OptimizationOpportunity[];
}

export interface WorkflowPattern {
  id: string;
  name: string;
  steps: string[];
  frequency: number;
  averageDuration: number;
  successRate: number;
}

export interface WorkflowEfficiencyMetrics {
  averageTimeToComplete: number;
  stepsToCompletion: number;
  reworkRate: number; // percentage of workflows that require rework
  automationRate: number; // percentage of automated steps
}

export interface WorkflowBottleneck {
  step: string;
  averageWaitTime: number;
  frequency: number;
  impact: BottleneckImpact;
}

export enum BottleneckImpact {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface OptimizationOpportunity {
  type: OptimizationType;
  description: string;
  potentialImpact: number; // percentage improvement
  implementationEffort: ImplementationEffort;
  priority: OptimizationPriority;
}

export enum OptimizationType {
  UI_IMPROVEMENT = 'ui_improvement',
  WORKFLOW_OPTIMIZATION = 'workflow_optimization',
  PERFORMANCE_ENHANCEMENT = 'performance_enhancement',
  AUTOMATION = 'automation',
  VALIDATION_IMPROVEMENT = 'validation_improvement'
}

export enum ImplementationEffort {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high'
}

export enum OptimizationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorPatternMetrics {
  commonErrors: ErrorPattern[];
  errorFrequency: Record<string, number>;
  errorResolution: ErrorResolutionMetrics;
  userErrorBehavior: UserErrorBehavior;
}

export interface ErrorPattern {
  errorType: string;
  frequency: number;
  contexts: string[];
  userActions: string[];
  resolutionMethods: string[];
}

export interface ErrorResolutionMetrics {
  averageResolutionTime: number;
  selfResolutionRate: number; // percentage resolved by user
  supportResolutionRate: number; // percentage requiring support
  unresolved: number;
}

export interface UserErrorBehavior {
  retryAttempts: number;
  helpSeeking: number;
  abandonment: number;
  workarounds: number;
}

export interface LearningMetrics {
  learningCurve: LearningCurvePoint[];
  expertiseProgression: ExpertiseLevel[];
  knowledgeRetention: KnowledgeRetentionMetrics;
  trainingEffectiveness: TrainingEffectivenessMetrics;
}

export interface LearningCurvePoint {
  sessionNumber: number;
  efficiency: number; // tasks completed per hour
  errorRate: number;
  helpUsage: number;
}

export interface ExpertiseLevel {
  level: UserExpertiseLevel;
  userCount: number;
  averageEfficiency: number;
  featureUsage: Record<string, number>;
}

export enum UserExpertiseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface KnowledgeRetentionMetrics {
  returnUserPerformance: number;
  skillDecay: SkillDecayMetrics;
  knowledgeTransfer: KnowledgeTransferMetrics;
}

export interface SkillDecayMetrics {
  decayRate: number; // percentage per day
  retentionPeriod: number; // days
  refreshTrainingNeeded: number; // percentage of users
}

export interface KnowledgeTransferMetrics {
  documentationUsage: number;
  peerLearning: number;
  formalTraining: number;
  selfDiscovery: number;
}

export interface TrainingEffectivenessMetrics {
  completionRate: number;
  knowledgeRetention: number;
  performanceImprovement: number;
  userSatisfaction: number;
}

// Business Metrics
export interface BusinessMetrics {
  productivityMetrics: ProductivityMetrics;
  qualityMetrics: QualityMetrics;
  costMetrics: CostMetrics;
  valueMetrics: ValueMetrics;
  competitiveMetrics: CompetitiveMetrics;
}

export interface ProductivityMetrics {
  projectsCompleted: number;
  averageProjectDuration: number;
  timeToValue: number; // time from start to first valuable output
  automationSavings: AutomationSavingsMetrics;
  efficiencyGains: EfficiencyGainMetrics;
}

export interface AutomationSavingsMetrics {
  timesSaved: number; // in hours
  costSavings: number; // in currency
  errorReduction: number; // percentage
  processImprovement: number; // percentage
}

export interface EfficiencyGainMetrics {
  beforeAfterComparison: BeforeAfterMetrics;
  benchmarkComparison: BenchmarkComparisonMetrics;
  trendAnalysis: EfficiencyTrendPoint[];
}

export interface BeforeAfterMetrics {
  timeBefore: number;
  timeAfter: number;
  improvement: number; // percentage
  confidenceLevel: number; // statistical confidence
}

export interface BenchmarkComparisonMetrics {
  industryBenchmark: number;
  ourPerformance: number;
  percentile: number; // where we rank
  gapAnalysis: GapAnalysisMetrics;
}

export interface GapAnalysisMetrics {
  performanceGap: number;
  improvementPotential: number;
  actionItems: ActionItem[];
}

export interface ActionItem {
  description: string;
  impact: number; // expected improvement percentage
  effort: ImplementationEffort;
  timeline: number; // days to implement
}

export interface EfficiencyTrendPoint {
  date: Date;
  efficiency: number;
  factors: string[]; // factors affecting efficiency
}

export interface QualityMetrics {
  accuracyMetrics: AccuracyMetrics;
  consistencyMetrics: ConsistencyMetrics;
  completenessMetrics: CompletenessMetrics;
  validationMetrics: QualityValidationMetrics;
}

export interface AccuracyMetrics {
  calculationAccuracy: number; // percentage
  dataAccuracy: number; // percentage
  predictionAccuracy: number; // percentage
  errorRate: number; // percentage
}

export interface ConsistencyMetrics {
  crossTabConsistency: number; // percentage
  temporalConsistency: number; // consistency over time
  userConsistency: number; // consistency across users
  systemConsistency: number; // consistency across system components
}

export interface CompletenessMetrics {
  dataCompleteness: number; // percentage of required fields filled
  workflowCompleteness: number; // percentage of workflows completed
  documentationCompleteness: number; // percentage of documented features
}

export interface QualityValidationMetrics {
  validationCoverage: number; // percentage of data validated
  validationAccuracy: number; // percentage of correct validations
  falsePositives: number; // incorrect error flags
  falseNegatives: number; // missed errors
}

export interface CostMetrics {
  developmentCosts: DevelopmentCostMetrics;
  operationalCosts: OperationalCostMetrics;
  maintenanceCosts: MaintenanceCostMetrics;
  totalCostOfOwnership: TCOMetrics;
}

export interface DevelopmentCostMetrics {
  initialDevelopment: number;
  featureAdditions: number;
  bugFixes: number;
  refactoring: number;
}

export interface OperationalCostMetrics {
  infrastructure: number;
  support: number;
  training: number;
  licensing: number;
}

export interface MaintenanceCostMetrics {
  preventiveMaintenance: number;
  correctiveMaintenance: number;
  updates: number;
  monitoring: number;
}

export interface TCOMetrics {
  totalCost: number;
  costPerUser: number;
  costPerProject: number;
  costTrend: CostTrendPoint[];
}

export interface CostTrendPoint {
  date: Date;
  cost: number;
  category: string;
}

export interface ValueMetrics {
  businessValue: BusinessValueMetrics;
  userValue: UserValueMetrics;
  strategicValue: StrategicValueMetrics;
  roi: ROIMetrics;
}

export interface BusinessValueMetrics {
  revenueImpact: number;
  costSavings: number;
  timeToMarket: number; // improvement in days
  marketShare: number; // percentage
}

export interface UserValueMetrics {
  userSatisfaction: number; // score out of 10
  taskCompletion: number; // percentage
  userRetention: number; // percentage
  recommendationScore: number; // NPS-like score
}

export interface StrategicValueMetrics {
  competitiveAdvantage: number; // score
  innovationIndex: number; // score
  scalabilityIndex: number; // score
  futureReadiness: number; // score
}

export interface ROIMetrics {
  roi: number; // percentage
  paybackPeriod: number; // months
  npv: number; // net present value
  irr: number; // internal rate of return
}

export interface CompetitiveMetrics {
  marketPosition: MarketPositionMetrics;
  featureComparison: FeatureComparisonMetrics;
  performanceComparison: PerformanceComparisonMetrics;
  userPreference: UserPreferenceMetrics;
}

export interface MarketPositionMetrics {
  marketShare: number; // percentage
  ranking: number;
  brandRecognition: number; // percentage
  customerLoyalty: number; // percentage
}

export interface FeatureComparisonMetrics {
  featureParity: number; // percentage
  uniqueFeatures: number;
  featureQuality: number; // score
  innovationRate: number; // features per month
}

export interface PerformanceComparisonMetrics {
  speedComparison: number; // relative performance
  reliabilityComparison: number; // relative reliability
  usabilityComparison: number; // relative usability
  overallComparison: number; // overall score
}

export interface UserPreferenceMetrics {
  preferenceScore: number; // percentage who prefer our solution
  switchingRate: number; // percentage switching to us
  churnRate: number; // percentage switching away
  satisfactionGap: number; // satisfaction difference vs competitors
}

// Error Metrics
export interface ErrorMetrics {
  errorFrequency: ErrorFrequencyMetrics;
  errorSeverity: ErrorSeverityMetrics;
  errorResolution: ErrorResolutionMetrics;
  errorPrevention: ErrorPreventionMetrics;
}

export interface ErrorFrequencyMetrics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByComponent: Record<string, number>;
  errorRate: number; // errors per operation
  errorTrend: ErrorTrendPoint[];
}

export interface ErrorTrendPoint {
  date: Date;
  errorCount: number;
  errorRate: number;
  severity: IncidentSeverity;
}

export interface ErrorSeverityMetrics {
  criticalErrors: number;
  highSeverityErrors: number;
  mediumSeverityErrors: number;
  lowSeverityErrors: number;
  severityDistribution: Record<IncidentSeverity, number>;
}

export interface ErrorPreventionMetrics {
  preventedErrors: number;
  validationEffectiveness: number; // percentage
  earlyDetection: number; // percentage caught early
  proactiveResolution: number; // percentage resolved proactively
}

// Analytics Configuration
export interface AnalyticsConfig {
  enabled: boolean;
  samplingRate: number; // percentage of events to collect
  retentionPeriod: number; // days to keep data
  privacySettings: PrivacySettings;
  alertThresholds: AlertThresholds;
  reportingSchedule: ReportingSchedule;
}

export interface PrivacySettings {
  anonymizeUsers: boolean;
  excludePersonalData: boolean;
  dataEncryption: boolean;
  consentRequired: boolean;
}

export interface AlertThresholds {
  performanceThreshold: number; // milliseconds
  errorRateThreshold: number; // percentage
  memoryUsageThreshold: number; // percentage
  uptimeThreshold: number; // percentage
}

export interface ReportingSchedule {
  dailyReports: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  customSchedule: CustomReportSchedule[];
}

export interface CustomReportSchedule {
  name: string;
  frequency: ReportFrequency;
  recipients: string[];
  metrics: string[];
}

export enum ReportFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly'
}

// Analytics Events
export interface AnalyticsEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  properties: Record<string, any>;
  userId?: string;
  sessionId: string;
}

export enum EventType {
  USER_ACTION = 'user_action',
  SYSTEM_EVENT = 'system_event',
  PERFORMANCE_EVENT = 'performance_event',
  ERROR_EVENT = 'error_event',
  BUSINESS_EVENT = 'business_event'
}

export enum EventCategory {
  NAVIGATION = 'navigation',
  CALCULATION = 'calculation',
  VALIDATION = 'validation',
  DATA_OPERATION = 'data_operation',
  TEMPLATE_OPERATION = 'template_operation',
  EXPORT_OPERATION = 'export_operation',
  USER_INTERACTION = 'user_interaction',
  SYSTEM_PERFORMANCE = 'system_performance',
  ERROR = 'error'
}