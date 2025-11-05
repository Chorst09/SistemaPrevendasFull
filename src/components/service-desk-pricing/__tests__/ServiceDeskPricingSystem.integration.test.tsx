import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServiceDeskData, ProjectStatus } from '@/lib/types/service-desk-pricing';

// Mock the service classes
vi.mock('@/lib/services/service-desk-calculation-engine', () => ({
  ServiceDeskCalculationEngine: vi.fn().mockImplementation(() => ({
    calculateTeamCosts: vi.fn().mockReturnValue({
      totalMonthlyCost: 15000,
      totalAnnualCost: 180000,
      costPerHour: 75,
      breakdown: []
    }),
    calculateTaxes: vi.fn().mockReturnValue({
      totalTaxes: 25000,
      effectiveRate: 25,
      breakdown: [],
      optimizationSuggestions: []
    }),
    calculateMargins: vi.fn().mockReturnValue({
      totalPrice: 125000,
      grossMargin: 20,
      netMargin: 15,
      markup: 25
    }),
    calculateROI: vi.fn().mockReturnValue({
      investment: 100000,
      returns: [30000, 35000, 40000],
      roi: 5,
      irr: 12,
      npv: 15000,
      period: 3
    }),
    calculateConsolidatedBudget: vi.fn().mockReturnValue({
      teamCosts: { salaries: 50000, benefits: 20000, total: 70000, breakdown: [] },
      infrastructureCosts: 10000,
      otherCosts: 5000,
      taxes: { federal: 15000, state: 8000, municipal: 3000, total: 26000, breakdown: [] },
      totalCosts: 85000,
      margin: { type: 'percentage', value: 20, minimumMargin: 10, targetMargin: 20, maximumMargin: 30 },
      totalPrice: 106250,
      monthlyBreakdown: []
    })
  }))
}));

vi.mock('@/lib/services/service-desk-validation-engine', () => ({
  ServiceDeskValidationEngine: vi.fn().mockImplementation(() => ({
    validateTabData: vi.fn().mockReturnValue({
      tabId: 'data',
      isValid: true,
      errors: [],
      warnings: [],
      completionPercentage: 100
    }),
    validateTransition: vi.fn().mockReturnValue({
      isValid: true,
      errors: [],
      warnings: []
    })
  }))
}));

vi.mock('@/lib/services/service-desk-data-manager', () => ({
  ServiceDeskDataManager: vi.fn().mockImplementation(() => ({
    updateTabData: vi.fn((currentData, tabId, tabData) => ({
      ...currentData,
      [tabId === 'data' ? 'project' : tabId]: tabData,
      metadata: { ...currentData.metadata, lastModified: new Date() }
    })),
    getTabData: vi.fn((data, tabId) => {
      switch (tabId) {
        case 'data': return data.project;
        case 'team': return data.team;
        case 'scale': return data.schedules;
        default: return {};
      }
    }),
    persistData: vi.fn().mockResolvedValue(undefined),
    loadData: vi.fn().mockResolvedValue({
      project: {
        id: 'test-project',
        name: 'Test Project',
        client: { name: 'Test Client', document: '123', email: 'test@test.com', phone: '', address: {}, contactPerson: '' },
        contractPeriod: { startDate: new Date(), endDate: new Date(), durationMonths: 12, renewalOptions: [] },
        description: 'Test description',
        currency: 'BRL',
        location: 'SP',
        serviceType: 'STANDARD',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      team: [],
      schedules: [],
      taxes: {},
      variables: {},
      otherCosts: [],
      budget: {},
      analysis: {},
      negotiations: [],
      finalAnalysis: {},
      metadata: { status: ProjectStatus.DRAFT, lastModified: new Date(), version: '1.0.0' }
    }),
    scheduleAutoSave: vi.fn(),
    cancelAutoSave: vi.fn(),
    cleanup: vi.fn()
  }))
}));

// Mock PDF integration
vi.mock('@/lib/services/service-desk-pdf-integration', () => ({
  ServiceDeskPDFIntegration: vi.fn().mockImplementation(() => ({
    generateProposal: vi.fn().mockResolvedValue({
      success: true,
      pdfUrl: 'blob:test-pdf-url',
      metadata: { pages: 5, size: 1024 }
    }),
    mapServiceDeskDataToProposal: vi.fn().mockReturnValue({
      projectName: 'Test Project',
      clientName: 'Test Client',
      totalPrice: 125000
    })
  }))
}));

// Mock memory manager
vi.mock('@/lib/services/service-desk-memory-manager', () => ({
  ServiceDeskMemoryManager: {
    getInstance: vi.fn().mockReturnValue({
      optimizeServiceDeskData: vi.fn(data => data),
      performMemoryCleanup: vi.fn(),
      getMemoryStats: vi.fn().mockReturnValue({
        tabDataCache: 5,
        calculationCache: 10,
        componentCache: 3
      })
    })
  }
}));

describe('Service Desk Services Integration Tests', () => {
  let mockData: ServiceDeskData;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockData = {
      project: {
        id: 'test-project',
        name: 'Integration Test Project',
        client: {
          name: 'Integration Test Client',
          document: '12.345.678/0001-90',
          email: 'client@test.com',
          phone: '(11) 99999-9999',
          address: {
            street: 'Test Street',
            number: '123',
            complement: '',
            neighborhood: 'Test Neighborhood',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567',
            country: 'Brasil'
          },
          contactPerson: 'John Doe'
        },
        contractPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          durationMonths: 12,
          renewalOptions: []
        },
        description: 'Integration test project',
        currency: 'BRL',
        location: 'São Paulo',
        serviceType: 'STANDARD' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      team: [{
        id: 'member-1',
        name: 'Test Member',
        role: 'Senior Analyst',
        salary: 8000,
        benefits: {
          healthInsurance: 300,
          mealVoucher: 500,
          transportVoucher: 200,
          lifeInsurance: 50,
          vacation: 8.33,
          thirteenthSalary: 8.33,
          fgts: 8,
          inss: 11,
          otherBenefits: []
        },
        workload: 40,
        startDate: new Date(),
        costPerHour: 0,
        skills: [],
        certifications: []
      }],
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
        taxRegime: 'LUCRO_PRESUMIDO' as any
      },
      variables: {
        inflation: {
          annualRate: 4.5,
          monthlyRate: 0.37,
          projectionPeriod: 12,
          source: 'IBGE',
          lastUpdate: new Date()
        },
        salaryAdjustments: {
          annualAdjustment: 5,
          adjustmentDate: new Date(),
          adjustmentType: 'inflation',
          minimumAdjustment: 3,
          maximumAdjustment: 10
        },
        marketFactors: [],
        scenarios: []
      },
      otherCosts: [],
      budget: {
        teamCosts: { salaries: 50000, benefits: 20000, total: 70000, breakdown: [] },
        infrastructureCosts: 10000,
        otherCosts: 5000,
        taxes: { federal: 15000, state: 8000, municipal: 3000, total: 26000, breakdown: [] },
        totalCosts: 85000,
        margin: { type: 'percentage', value: 20, minimumMargin: 10, targetMargin: 20, maximumMargin: 30 },
        totalPrice: 106250,
        monthlyBreakdown: []
      },
      analysis: {
        roi: { investment: 0, returns: [], roi: 0, irr: 0, npv: 0, period: 12 },
        payback: { simplePayback: 0, discountedPayback: 0, breakEvenPoint: 0, cashFlowAnalysis: [] },
        margins: { grossMargin: 0, netMargin: 0, ebitdaMargin: 0, contributionMargin: 0, marginTrend: [] },
        riskAnalysis: { riskFactors: [], overallRisk: 'medium', mitigation: [] },
        sensitivityAnalysis: { variables: [], scenarios: [] },
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
      metadata: {
        version: '1.0.0',
        lastModified: new Date(),
        modifiedBy: 'test-user',
        status: ProjectStatus.DRAFT,
        tags: [],
        notes: '',
        attachments: []
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Services Integration Flow', () => {
    it('should integrate calculation, validation, and data management services', async () => {
      const { ServiceDeskCalculationEngine } = require('@/lib/services/service-desk-calculation-engine');
      const { ServiceDeskValidationEngine } = require('@/lib/services/service-desk-validation-engine');
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');

      const calculationEngine = new ServiceDeskCalculationEngine();
      const validationEngine = new ServiceDeskValidationEngine();
      const dataManager = new ServiceDeskDataManager();

      // Test data flow: validate -> calculate -> persist
      const validation = validationEngine.validateTabData('data', mockData.project);
      expect(validation.isValid).toBe(true);

      const teamCosts = calculationEngine.calculateTeamCosts(mockData.team, mockData.schedules);
      expect(teamCosts.totalMonthlyCost).toBeGreaterThan(0);

      const updatedData = dataManager.updateTabData(mockData, 'budget', {
        ...mockData.budget,
        teamCosts: { ...mockData.budget.teamCosts, total: teamCosts.totalMonthlyCost }
      });

      expect(updatedData.budget.teamCosts.total).toBe(teamCosts.totalMonthlyCost);
    });

    it('should handle validation failures in service integration', () => {
      const { ServiceDeskValidationEngine } = require('@/lib/services/service-desk-validation-engine');
      const validationEngine = new ServiceDeskValidationEngine();

      const invalidData = {
        ...mockData.project,
        name: '', // Invalid
        client: { ...mockData.project.client, name: '' } // Invalid
      };

      const validation = validationEngine.validateTabData('data', invalidData);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across service operations', async () => {
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');
      const { ServiceDeskCalculationEngine } = require('@/lib/services/service-desk-calculation-engine');

      const dataManager = new ServiceDeskDataManager();
      const calculationEngine = new ServiceDeskCalculationEngine();

      // Update team data
      const newTeamMember = {
        id: 'new-member',
        name: 'New Team Member',
        role: 'Analyst',
        salary: 6000,
        benefits: {} as any,
        workload: 40,
        startDate: new Date(),
        costPerHour: 37.5,
        skills: [],
        certifications: []
      };

      const updatedTeam = [...mockData.team, newTeamMember];
      let currentData = dataManager.updateTabData(mockData, 'team', updatedTeam);

      // Recalculate costs with new team
      const newTeamCosts = calculationEngine.calculateTeamCosts(currentData.team, currentData.schedules);
      
      // Update budget with new calculations
      currentData = dataManager.updateTabData(currentData, 'budget', {
        ...currentData.budget,
        teamCosts: { ...currentData.budget.teamCosts, total: newTeamCosts.totalMonthlyCost }
      });

      expect(currentData.team).toHaveLength(2);
      expect(currentData.budget.teamCosts.total).toBe(newTeamCosts.totalMonthlyCost);
      expect(currentData.metadata.lastModified).toBeInstanceOf(Date);
    });

    it('should handle cascading calculations correctly', () => {
      const { ServiceDeskCalculationEngine } = require('@/lib/services/service-desk-calculation-engine');
      const calculationEngine = new ServiceDeskCalculationEngine();

      // Calculate team costs
      const teamCosts = calculationEngine.calculateTeamCosts(mockData.team, mockData.schedules);
      
      // Calculate taxes based on total price
      const taxes = calculationEngine.calculateTaxes(mockData.budget.totalPrice, mockData.taxes);
      
      // Calculate margins
      const margins = calculationEngine.calculateMargins(teamCosts.totalMonthlyCost, mockData.budget.margin);

      expect(teamCosts.totalMonthlyCost).toBeGreaterThan(0);
      expect(taxes.totalTaxes).toBeGreaterThan(0);
      expect(margins.totalPrice).toBeGreaterThan(teamCosts.totalMonthlyCost);
    });
  });

  describe('Auto-save Integration', () => {
    it('should integrate auto-save functionality with data manager', async () => {
      vi.useFakeTimers();
      
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');
      const dataManager = new ServiceDeskDataManager();
      
      const scheduleAutoSaveSpy = vi.spyOn(dataManager, 'scheduleAutoSave');
      
      // Simulate data change and auto-save scheduling
      const updatedData = dataManager.updateTabData(mockData, 'data', {
        ...mockData.project,
        name: 'Auto-save Test Project'
      });
      
      dataManager.scheduleAutoSave(updatedData, 2000);
      
      expect(scheduleAutoSaveSpy).toHaveBeenCalledWith(updatedData, 2000);
      
      vi.useRealTimers();
    });

    it('should handle auto-save errors in service integration', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');
      const dataManager = new ServiceDeskDataManager();
      
      // Mock persistence to fail
      vi.spyOn(dataManager, 'persistData').mockRejectedValue(new Error('Save failed'));
      
      // Should handle error gracefully
      await expect(dataManager.persistData(mockData)).rejects.toThrow('Save failed');
      
      consoleSpy.mockRestore();
    });
  });

  describe('PDF Integration', () => {
    it('should integrate PDF generation with service desk data', async () => {
      const { ServiceDeskPDFIntegration } = require('@/lib/services/service-desk-pdf-integration');
      const pdfIntegration = new ServiceDeskPDFIntegration();

      const result = await pdfIntegration.generateProposal(mockData, 'standard');

      expect(result.success).toBe(true);
      expect(result.pdfBlob).toBeInstanceOf(Blob);
      expect(result.metadata).toHaveProperty('pages');
    });

    it('should handle PDF generation errors in service integration', async () => {
      const mockPDFIntegration = vi.mocked(require('@/lib/services/service-desk-pdf-integration').ServiceDeskPDFIntegration);
      mockPDFIntegration.mockImplementation(() => ({
        generateProposal: vi.fn().mockRejectedValue(new Error('PDF generation failed')),
        mapServiceDeskDataToProposal: vi.fn()
      }));

      const pdfIntegration = new mockPDFIntegration();
      
      await expect(pdfIntegration.generateProposal(mockData, 'standard'))
        .rejects.toThrow('PDF generation failed');
    });
  });

  describe('Memory Management Integration', () => {
    it('should integrate memory optimization with data operations', () => {
      const { ServiceDeskMemoryManager } = require('@/lib/services/service-desk-memory-manager');
      const memoryManager = ServiceDeskMemoryManager.getInstance();

      const optimizedData = memoryManager.optimizeServiceDeskData(mockData);
      expect(optimizedData).toBeDefined();

      const stats = memoryManager.getMemoryStats();
      expect(stats).toHaveProperty('tabDataCache');
      expect(stats).toHaveProperty('calculationCache');
    });

    it('should handle cleanup in service integration', () => {
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');
      const dataManager = new ServiceDeskDataManager();

      // Should not throw during cleanup
      expect(() => dataManager.cleanup()).not.toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle calculation engine errors gracefully', () => {
      const mockCalculationEngine = vi.mocked(require('@/lib/services/service-desk-calculation-engine').ServiceDeskCalculationEngine);
      mockCalculationEngine.mockImplementation(() => ({
        calculateTeamCosts: vi.fn().mockImplementation(() => {
          throw new Error('Calculation failed');
        }),
        calculateTaxes: vi.fn(),
        calculateMargins: vi.fn(),
        calculateROI: vi.fn(),
        calculateConsolidatedBudget: vi.fn()
      }));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const engine = new mockCalculationEngine();
      
      expect(() => engine.calculateTeamCosts(mockData.team, mockData.schedules))
        .toThrow('Calculation failed');

      consoleSpy.mockRestore();
    });

    it('should handle data loading errors in service integration', async () => {
      const { ServiceDeskDataManager } = require('@/lib/services/service-desk-data-manager');
      const dataManager = new ServiceDeskDataManager();
      
      // Mock loadData to fail
      vi.spyOn(dataManager, 'loadData').mockRejectedValue(new Error('Failed to load data'));

      await expect(dataManager.loadData('non-existent-id'))
        .rejects.toThrow('Failed to load data');
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently in service integration', () => {
      const largeDataset = {
        ...mockData,
        team: Array.from({ length: 100 }, (_, i) => ({
          id: `member-${i}`,
          name: `Member ${i}`,
          role: 'Analyst',
          salary: 5000,
          benefits: {} as any,
          workload: 40,
          startDate: new Date(),
          costPerHour: 0,
          skills: [],
          certifications: []
        })),
        otherCosts: Array.from({ length: 50 }, (_, i) => ({
          id: `cost-${i}`,
          name: `Cost ${i}`,
          value: 1000,
          category: 'INFRASTRUCTURE' as any,
          type: 'fixed' as any,
          description: '',
          startDate: new Date(),
          endDate: new Date()
        }))
      };

      const { ServiceDeskCalculationEngine } = require('@/lib/services/service-desk-calculation-engine');
      const { ServiceDeskValidationEngine } = require('@/lib/services/service-desk-validation-engine');
      
      const calculationEngine = new ServiceDeskCalculationEngine();
      const validationEngine = new ServiceDeskValidationEngine();

      // Should handle large datasets without performance issues
      const startTime = Date.now();
      
      const teamCosts = calculationEngine.calculateTeamCosts(largeDataset.team, largeDataset.schedules);
      const validation = validationEngine.validateTabData('team', largeDataset.team);
      
      const endTime = Date.now();
      
      expect(teamCosts).toBeDefined();
      expect(validation).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });
});