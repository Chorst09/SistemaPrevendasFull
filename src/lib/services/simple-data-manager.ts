import { ServiceDeskData, ProjectStatus, ServiceType, TaxRegime, CoverageType } from '@/lib/types/service-desk-pricing';

/**
 * Simplified data manager that works only with localStorage
 * Avoids IndexedDB and Prisma issues in browser
 */
export class SimpleDataManager {
  private static readonly STORAGE_KEY = 'service-desk-pricing-data';
  private static readonly PROJECTS_KEY = 'service-desk-projects-list';

  /**
   * Creates empty data structure for new projects
   */
  static createEmptyData(): ServiceDeskData {
    const now = new Date();
    const projectId = crypto.randomUUID();
    
    return {
      project: {
        id: projectId,
        name: '',
        client: {
          name: '',
          document: '',
          email: '',
          phone: '',
          contactPerson: '',
          address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil'
          }
        },
        contractPeriod: {
          startDate: now,
          endDate: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
          durationMonths: 12,
          renewalOptions: []
        },
        description: '',
        currency: 'BRL',
        location: '',
        serviceType: ServiceType.STANDARD,
        additionalServices: {
          needsSoftware: false,
          needs0800: false,
          needsDirectCall: false,
          needsInfrastructure: false
        },
        generalInfo: {
          userQuantity: 100,
          monthlyCalls: 150
        },
        dimensioning: {
          incidentsPerUser: 1.5,
          tmaMinutes: 10,
          occupancyRate: 80,
          n1Distribution: 80,
          n1Capacity: 100,
          n2Capacity: 75,
          n1SixHourShift: false,
          coverageType: CoverageType.BUSINESS_HOURS,
          suggestedN1: 2,
          suggestedN2: 1
        },
        createdAt: now,
        updatedAt: now
      },
      team: [],
      jobPositions: [],
      schedules: [],
      taxes: {
        region: 'SP',
        icms: 18,
        pis: 1.65,
        cofins: 7.6,
        iss: 5,
        ir: 15,
        csll: 9,
        customTaxes: [],
        taxRegime: TaxRegime.SIMPLES_NACIONAL
      },
      variables: {
        inflation: 6.5,
        salaryAdjustment: 8.0,
        marketGrowth: 5.0,
        competitionFactor: 1.0,
        economicScenario: 'stable',
        customVariables: []
      },
      otherCosts: [],
      budget: {
        totalCost: 0,
        totalRevenue: 0,
        margin: 0,
        breakdown: {
          personnel: 0,
          infrastructure: 0,
          software: 0,
          taxes: 0,
          other: 0
        }
      },
      forecast: {
        id: crypto.randomUUID(),
        projectId: projectId,
        scenarios: [],
        assumptions: {
          contractDuration: 24,
          inflationRate: 6.5,
          salaryAdjustment: 8.0,
          renewalProbability: 85,
          expansionProbability: 40,
          churnRate: 5,
          seasonalFactors: []
        },
        projections: [],
        riskAnalysis: {
          riskFactors: [],
          overallRisk: 'medium',
          mitigation: []
        },
        dashboard: {
          kpis: [],
          charts: [],
          insights: []
        },
        createdAt: now,
        updatedAt: now
      },
      analysis: {
        roi: {
          investment: 0,
          returns: [],
          roi: 0,
          irr: 0,
          npv: 0,
          period: 0
        },
        payback: {
          simplePayback: 0,
          discountedPayback: 0,
          breakEvenPoint: 0,
          cashFlowAnalysis: []
        },
        margins: {
          grossMargin: 0,
          netMargin: 0,
          operationalMargin: 0,
          ebitda: 0
        },
        riskAnalysis: {
          riskFactors: [],
          overallRisk: 'medium',
          mitigation: []
        },
        sensitivityAnalysis: {
          variable: 'salary',
          baseValue: 0,
          variations: [],
          impacts: [],
          elasticity: 0,
          variables: [],
          scenarios: []
        },
        charts: []
      },
      negotiations: [],
      finalAnalysis: {
        kpis: [],
        summary: {
          projectValue: 0,
          expectedProfit: 0,
          riskLevel: 'medium',
          recommendedAction: 'review',
          keyHighlights: [],
          concerns: []
        },
        recommendations: [],
        benchmarks: [],
        approvals: []
      },
      reports: [],
      metadata: {
        version: '1.0.0',
        lastModified: now,
        modifiedBy: 'system',
        status: ProjectStatus.DRAFT,
        tags: [],
        notes: '',
        attachments: []
      }
    };
  }

  /**
   * Load data from localStorage
   */
  static async loadData(projectId?: string): Promise<ServiceDeskData> {
    try {
      let data: ServiceDeskData;
      
      if (projectId) {
        // Load specific project
        const serializedData = localStorage.getItem(`${this.STORAGE_KEY}-${projectId}`);
        if (serializedData) {
          data = JSON.parse(serializedData, (key, value) => {
            // Handle Date objects
            if (value && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
              return new Date(value);
            }
            return value;
          });
        } else {
          data = this.createEmptyData();
        }
      } else {
        // Load most recent or create new
        data = this.createEmptyData();
      }
      
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      return this.createEmptyData();
    }
  }

  /**
   * Save data to localStorage
   */
  static async saveData(data: ServiceDeskData): Promise<void> {
    try {
      // Update metadata
      data.metadata.lastModified = new Date();
      
      // Save to localStorage
      const serializedData = JSON.stringify(data, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return value.toISOString();
        }
        return value;
      });
      
      localStorage.setItem(`${this.STORAGE_KEY}-${data.project.id}`, serializedData);
      
      // Update projects list
      this.updateProjectsList(data.project);
      
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Failed to save data');
    }
  }

  /**
   * Update projects list in localStorage
   */
  private static updateProjectsList(project: any): void {
    try {
      const existingProjects = JSON.parse(localStorage.getItem(this.PROJECTS_KEY) || '[]');
      const projectIndex = existingProjects.findIndex((p: any) => p.id === project.id);
      
      const projectSummary = {
        id: project.id,
        name: project.name || 'Projeto sem nome',
        client: project.client?.name || 'Cliente não informado',
        lastModified: new Date().toISOString(),
        status: project.status || 'DRAFT'
      };
      
      if (projectIndex >= 0) {
        existingProjects[projectIndex] = projectSummary;
      } else {
        existingProjects.push(projectSummary);
      }
      
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(existingProjects));
    } catch (error) {
      console.error('Error updating projects list:', error);
    }
  }

  /**
   * Get projects list
   */
  static getProjectsList(): any[] {
    try {
      return JSON.parse(localStorage.getItem(this.PROJECTS_KEY) || '[]');
    } catch (error) {
      console.error('Error getting projects list:', error);
      return [];
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId: string): Promise<void> {
    try {
      // Remove from localStorage
      localStorage.removeItem(`${this.STORAGE_KEY}-${projectId}`);
      
      // Update projects list
      const existingProjects = this.getProjectsList();
      const filteredProjects = existingProjects.filter(p => p.id !== projectId);
      localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(filteredProjects));
      
    } catch (error) {
      console.error('Error deleting project:', error);
      throw new Error('Failed to delete project');
    }
  }

  /**
   * Update tab data
   */
  static updateTabData(currentData: ServiceDeskData, tabId: string, tabData: any): ServiceDeskData {
    const updatedData = { ...currentData };
    updatedData.metadata.lastModified = new Date();

    switch (tabId) {
      case 'data':
        updatedData.project = { ...updatedData.project, ...tabData };
        break;
      case 'team':
        updatedData.team = tabData;
        break;
      case 'scale':
        updatedData.schedules = tabData;
        break;
      case 'taxes':
        updatedData.taxes = { ...updatedData.taxes, ...tabData };
        break;
      case 'variables':
        updatedData.variables = { ...updatedData.variables, ...tabData };
        break;
      case 'other-costs':
        updatedData.otherCosts = tabData;
        break;
      case 'budget':
        updatedData.budget = { ...updatedData.budget, ...tabData };
        break;
      case 'result':
        updatedData.analysis = { ...updatedData.analysis, ...tabData };
        break;
      case 'negotiation':
        updatedData.negotiations = tabData;
        break;
      case 'final-analysis':
        updatedData.finalAnalysis = { ...updatedData.finalAnalysis, ...tabData };
        break;
      case 'forecast':
        updatedData.forecast = { ...updatedData.forecast, ...tabData };
        break;
      case 'reports':
        updatedData.reports = tabData;
        break;
      default:
        console.warn(`Unknown tab ID: ${tabId}`);
    }

    return updatedData;
  }

  /**
   * Get tab data
   */
  static getTabData(data: ServiceDeskData, tabId: string): any {
    switch (tabId) {
      case 'data':
        return data.project || {};
      case 'team':
        return data.team || [];
      case 'scale':
        return data.schedules || [];
      case 'taxes':
        return data.taxes || {};
      case 'variables':
        return data.variables || {};
      case 'other-costs':
        return data.otherCosts || [];
      case 'budget':
        return data.budget || {};
      case 'result':
        return data.analysis || {};
      case 'negotiation':
        return data.negotiations || [];
      case 'final-analysis':
        return data.finalAnalysis || {};
      case 'forecast':
        return data.forecast || {};
      case 'reports':
        return data.reports || [];
      default:
        console.warn(`Unknown tab ID: ${tabId}`);
        return null;
    }
  }
}