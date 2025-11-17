/**
 * NOC (Network Operations Center) Pricing System Types
 * Sistema de precificação para Centro de Operações de Rede
 */

// Tipos de monitoramento
export type MonitoringType = 
  | 'infrastructure' // Infraestrutura (servidores, storage)
  | 'network' // Rede (switches, routers, firewalls)
  | 'application' // Aplicações e serviços
  | 'security' // Segurança (SIEM, IDS/IPS)
  | 'cloud' // Cloud (AWS, Azure, GCP)
  | 'database' // Bancos de dados
  | 'endpoint' // Endpoints (desktops, laptops);

// Níveis de serviço NOC
export type NOCServiceLevel = 
  | 'basic' // Monitoramento básico
  | 'standard' // Monitoramento padrão
  | 'advanced' // Monitoramento avançado
  | 'premium'; // Monitoramento premium com IA

// Horários de atendimento
export type NOCCoverage = 
  | '8x5' // 8 horas por dia, 5 dias por semana
  | '12x5' // 12 horas por dia, 5 dias por semana
  | '12x6' // 12 horas por dia, 6 dias por semana
  | '24x5' // 24 horas por dia, 5 dias por semana
  | '24x7'; // 24 horas por dia, 7 dias por semana

// Ferramentas de monitoramento
export type MonitoringTool = 
  | 'zabbix'
  | 'nagios'
  | 'prtg'
  | 'datadog'
  | 'new-relic'
  | 'dynatrace'
  | 'prometheus'
  | 'grafana'
  | 'splunk'
  | 'elastic'
  | 'solarwinds'
  | 'custom';

// SLA (Service Level Agreement)
export interface NOCSLAConfig {
  availability: number; // % de disponibilidade (ex: 99.9%)
  responseTime: number; // Tempo de resposta em minutos
  resolutionTime: number; // Tempo de resolução em horas
  criticalIncidentResponse: number; // Resposta para incidentes críticos (minutos)
  reportingFrequency: 'daily' | 'weekly' | 'monthly';
  escalationLevels: number; // Níveis de escalação
}

// Dispositivo monitorado
export interface MonitoredDevice {
  id: string;
  name: string;
  type: MonitoringType;
  quantity: number;
  metricsCount: number; // Número de métricas por dispositivo
  checkInterval: number; // Intervalo de verificação em minutos
  alertThreshold: number; // Limite para alertas
  criticality: 'low' | 'medium' | 'high' | 'critical';
  estimatedAlerts: number; // Alertas estimados por mês
}

// Configuração de monitoramento
export interface MonitoringConfig {
  tools: MonitoringTool[];
  customDashboards: number;
  alertChannels: ('email' | 'sms' | 'slack' | 'teams' | 'webhook')[];
  automationLevel: 'none' | 'basic' | 'advanced' | 'full';
  aiEnabled: boolean; // IA para predição de falhas
  reportingEnabled: boolean;
  customReports: number;
}

// Equipe NOC
export interface NOCTeamMember {
  id: string;
  role: 'analyst-l1' | 'analyst-l2' | 'analyst-l3' | 'engineer' | 'coordinator' | 'manager';
  name: string;
  monthlySalary: number;
  benefits: number;
  shift: 'morning' | 'afternoon' | 'night' | 'rotating';
  coverage: NOCCoverage;
  certifications: string[]; // Ex: CCNA, ITIL, etc.
  experienceYears: number;
}

// Custos operacionais NOC
export interface NOCOperationalCosts {
  // Infraestrutura
  serverCosts: number; // Servidores de monitoramento
  storageCosts: number; // Storage para logs e métricas
  networkCosts: number; // Conectividade e redundância
  
  // Software e licenças
  monitoringLicenses: number; // Licenças de ferramentas
  integrationCosts: number; // Integrações com sistemas
  
  // Facilities
  facilityCosts: number; // Espaço físico do NOC
  utilitiesCosts: number; // Energia, refrigeração
  
  // Outros
  trainingCosts: number; // Treinamento da equipe
  certificationCosts: number; // Certificações
  contingencyCosts: number; // Contingência
}

// Dados do projeto NOC
export interface NOCProjectData {
  projectName: string;
  clientName: string;
  startDate: string;
  contractDuration: number; // Meses
  serviceLevel: NOCServiceLevel;
  coverage: NOCCoverage;
  currency: 'BRL' | 'USD' | 'EUR';
  location: string;
}

// Dados completos do sistema NOC
export interface NOCPricingData {
  // Dados básicos
  project: NOCProjectData;
  
  // Dispositivos e monitoramento
  devices: MonitoredDevice[];
  totalDevices: number;
  totalMetrics: number;
  estimatedAlertsPerMonth: number;
  
  // Configuração
  monitoring: MonitoringConfig;
  sla: NOCSLAConfig;
  
  // Equipe
  team: NOCTeamMember[];
  teamSize: number;
  
  // Custos
  operationalCosts: NOCOperationalCosts;
  
  // Impostos e variáveis
  taxes: {
    federalTax: number;
    stateTax: number;
    municipalTax: number;
    socialCharges: number;
  };
  
  variables: {
    inflationRate: number;
    dollarRate: number;
    profitMargin: number;
    riskMargin: number;
  };
  
  // Cálculos
  calculations?: NOCCalculations;
}

// Cálculos do NOC
export interface NOCCalculations {
  // Custos mensais
  monthlyTeamCost: number;
  monthlyOperationalCost: number;
  monthlyInfrastructureCost: number;
  monthlyLicenseCost: number;
  monthlyTotalCost: number;
  
  // Custos por dispositivo
  costPerDevice: number;
  costPerMetric: number;
  costPerAlert: number;
  
  // Custos anuais
  annualTotalCost: number;
  
  // Preço final
  priceWithMargin: number;
  priceWithTaxes: number;
  finalMonthlyPrice: number;
  finalAnnualPrice: number;
  
  // Métricas
  roi: number;
  paybackMonths: number;
  profitability: number;
  
  // Comparação de mercado
  marketAverage: number;
  competitiveness: 'low' | 'competitive' | 'high';
}

// Validação de abas
export interface NOCTabValidationStatus {
  isValid: boolean;
  isComplete: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Template NOC
export interface NOCTemplate {
  id: string;
  name: string;
  description: string;
  category: 'small-business' | 'medium-business' | 'enterprise' | 'custom';
  serviceLevel: NOCServiceLevel;
  coverage: NOCCoverage;
  data: Partial<NOCPricingData>;
  createdAt: string;
  updatedAt: string;
}

// Benchmark de mercado
export interface NOCMarketBenchmark {
  serviceLevel: NOCServiceLevel;
  coverage: NOCCoverage;
  averagePricePerDevice: number;
  averagePricePerMetric: number;
  marketRange: {
    min: number;
    max: number;
    average: number;
  };
  region: string;
}

// Relatório NOC
export interface NOCReport {
  id: string;
  projectName: string;
  generatedAt: string;
  data: NOCPricingData;
  calculations: NOCCalculations;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
}
