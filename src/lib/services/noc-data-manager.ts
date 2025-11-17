/**
 * NOC Data Manager
 * Gerenciamento de dados do sistema de precificação NOC
 */

import { NOCPricingData, NOCProjectData, MonitoredDevice, NOCTeamMember, NOCOperationalCosts, NOCSLAConfig, MonitoringConfig } from '@/lib/types/noc-pricing';

export class NOCDataManager {
  private static readonly STORAGE_KEY = 'noc-pricing-data';
  private static readonly BACKUP_KEY = 'noc-pricing-backup';
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 segundos
  
  private autoSaveTimer: NodeJS.Timeout | null = null;

  /**
   * Cria estrutura de dados vazia
   */
  static createEmptyData(): NOCPricingData {
    return {
      project: {
        projectName: '',
        clientName: '',
        startDate: new Date().toISOString().split('T')[0],
        contractDuration: 12,
        serviceLevel: 'standard',
        coverage: '24x7',
        currency: 'BRL',
        location: 'Brasil'
      },
      devices: [],
      totalDevices: 0,
      totalMetrics: 0,
      estimatedAlertsPerMonth: 0,
      monitoring: {
        tools: ['zabbix'],
        customDashboards: 5,
        alertChannels: ['email', 'slack'],
        automationLevel: 'basic',
        aiEnabled: false,
        reportingEnabled: true,
        customReports: 3
      },
      sla: {
        availability: 99.9,
        responseTime: 15,
        resolutionTime: 4,
        criticalIncidentResponse: 5,
        reportingFrequency: 'monthly',
        escalationLevels: 3
      },
      team: [],
      teamSize: 0,
      operationalCosts: {
        serverCosts: 0,
        storageCosts: 0,
        networkCosts: 0,
        monitoringLicenses: 0,
        integrationCosts: 0,
        facilityCosts: 0,
        utilitiesCosts: 0,
        trainingCosts: 0,
        certificationCosts: 0,
        contingencyCosts: 0
      },
      taxes: {
        federalTax: 0,
        stateTax: 0,
        municipalTax: 0,
        socialCharges: 0
      },
      variables: {
        inflationRate: 0,
        dollarRate: 0,
        profitMargin: 20,
        riskMargin: 10
      }
    };
  }

  /**
   * Carrega dados do localStorage
   */
  async loadData(): Promise<NOCPricingData> {
    if (typeof window === 'undefined') {
      return NOCDataManager.createEmptyData();
    }

    try {
      const stored = localStorage.getItem(NOCDataManager.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return this.migrateData(data);
      }
    } catch (error) {
      console.error('Error loading NOC data:', error);
    }

    return NOCDataManager.createEmptyData();
  }

  /**
   * Salva dados no localStorage
   */
  async persistData(data: NOCPricingData): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(NOCDataManager.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting NOC data:', error);
      throw error;
    }
  }

  /**
   * Cria backup dos dados
   */
  async createBackup(data: NOCPricingData): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const backup = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(NOCDataManager.BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  /**
   * Restaura backup
   */
  async restoreBackup(): Promise<NOCPricingData | null> {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(NOCDataManager.BACKUP_KEY);
      if (stored) {
        const backup = JSON.parse(stored);
        return backup.data;
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
    }

    return null;
  }

  /**
   * Migra dados de versões antigas
   */
  private migrateData(data: any): NOCPricingData {
    const empty = NOCDataManager.createEmptyData();
    
    return {
      ...empty,
      ...data,
      project: { ...empty.project, ...data.project },
      monitoring: { ...empty.monitoring, ...data.monitoring },
      sla: { ...empty.sla, ...data.sla },
      operationalCosts: { ...empty.operationalCosts, ...data.operationalCosts },
      taxes: { ...empty.taxes, ...data.taxes },
      variables: { ...empty.variables, ...data.variables }
    };
  }

  /**
   * Atualiza dados de uma aba específica
   */
  updateTabData(data: NOCPricingData, tabId: string, tabData: any): NOCPricingData {
    const updated = { ...data };

    switch (tabId) {
      case 'project':
        updated.project = tabData;
        break;
      case 'devices':
        updated.devices = tabData.devices || [];
        updated.totalDevices = tabData.totalDevices || 0;
        updated.totalMetrics = tabData.totalMetrics || 0;
        updated.estimatedAlertsPerMonth = tabData.estimatedAlertsPerMonth || 0;
        break;
      case 'monitoring':
        updated.monitoring = tabData;
        break;
      case 'sla':
        updated.sla = tabData;
        break;
      case 'team':
        updated.team = tabData.team || [];
        updated.teamSize = tabData.teamSize || 0;
        break;
      case 'costs':
        updated.operationalCosts = tabData;
        break;
      case 'taxes':
        updated.taxes = tabData;
        break;
      case 'variables':
        updated.variables = tabData;
        break;
      default:
        console.warn(`Unknown tab: ${tabId}`);
    }

    return updated;
  }

  /**
   * Obtém dados de uma aba específica
   */
  getTabData(data: NOCPricingData, tabId: string): any {
    switch (tabId) {
      case 'project':
        return data.project;
      case 'devices':
        return {
          devices: data.devices,
          totalDevices: data.totalDevices,
          totalMetrics: data.totalMetrics,
          estimatedAlertsPerMonth: data.estimatedAlertsPerMonth
        };
      case 'monitoring':
        return data.monitoring;
      case 'sla':
        return data.sla;
      case 'team':
        return {
          team: data.team,
          teamSize: data.teamSize
        };
      case 'costs':
        return data.operationalCosts;
      case 'taxes':
        return data.taxes;
      case 'variables':
        return data.variables;
      case 'calculations':
        return data.calculations;
      default:
        return null;
    }
  }

  /**
   * Inicializa auto-save
   */
  initializeSync(): void {
    if (typeof window === 'undefined') return;

    // Limpa timer anterior se existir
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  }

  /**
   * Agenda auto-save
   */
  scheduleAutoSave(data: NOCPricingData): void {
    if (typeof window === 'undefined') return;

    // Debounce: salva após 2 segundos de inatividade
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(() => {
      this.persistData(data);
    }, 2000);
  }

  /**
   * Limpa recursos
   */
  cleanup(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Exporta dados para JSON
   */
  exportToJSON(data: NOCPricingData): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importa dados de JSON
   */
  importFromJSON(json: string): NOCPricingData {
    try {
      const data = JSON.parse(json);
      return this.migrateData(data);
    } catch (error) {
      console.error('Error importing JSON:', error);
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Valida integridade dos dados
   */
  validateData(data: NOCPricingData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valida projeto
    if (!data.project.projectName) {
      errors.push('Nome do projeto é obrigatório');
    }
    if (!data.project.clientName) {
      errors.push('Nome do cliente é obrigatório');
    }

    // Valida dispositivos
    if (data.devices.length === 0) {
      errors.push('Adicione pelo menos um dispositivo para monitorar');
    }

    // Valida equipe
    if (data.team.length === 0) {
      errors.push('Adicione pelo menos um membro à equipe');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
