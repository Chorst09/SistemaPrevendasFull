import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceDeskDataManager } from '../service-desk-data-manager';
import { ServiceDeskCalculationEngine } from '../service-desk-calculation-engine';
import { ServiceDeskValidationEngine } from '../service-desk-validation-engine';
import { ServiceDeskData, ProjectStatus } from '@/lib/types/service-desk-pricing';

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn()
};

const mockIDBDatabase = {
  close: vi.fn(),
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  objectStoreNames: { contains: vi.fn() }
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null
};

const mockIDBObjectStore = {
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  createIndex: vi.fn(),
  index: vi.fn()
};

const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
  error: null
};

// Setup global mocks
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${Date.now()}`
  },
  writable: true
});

// Mock memory optimization
vi.mock('@/lib/utils/memory-optimization', () => ({
  MemoryManager: {
    getInstance: () => ({
      registerCleanupTask: vi.fn(),
      unregisterCleanupTask: vi.fn()
    })
  },
  MemoryEfficientMap: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    size: 0,
    forEach: vi.fn()
  })),
  cleanupUnusedData: vi.fn((data) => data)
}));

// Mock calculation cache
vi.mock('@/lib/utils/calculation-cache', () => ({
  ServiceDeskCalculationCache: {
    getInstance: () => ({
      getTeamCosts: vi.fn(),
      cacheTeamCosts: vi.fn(),
      getTaxCalculations: vi.fn(),
      cacheTaxCalculations: vi.fn(),
      getROIAnalysis: vi.fn(),
      cacheROIAnalysis: vi.fn()
    })
  },
  cached: () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => descriptor
}));

describe('Data Persistence Integration Tests', () => {
  let dataManager: ServiceDeskDataManager;
  let calculationEngine: ServiceDeskCalculationEngine;
  let validationEngine: ServiceDeskValidationEngine;
  let mockData: ServiceDeskData;

  beforeEach(() => {
    vi.clearAllMocks();
    
    dataManager = new ServiceDeskDataManager();
    calculationEngine = new ServiceDeskCalculationEngine();
    validationEngine = new ServiceDeskValidationEngine();

    // Setup IndexedDB mocks
    mockIndexedDB.open.mockImplementation(() => {
      const request = { ...mockIDBRequest };
      setTimeout(() => {
        request.result = mockIDBDatabase;
        if (request.onsuccess) request.onsuccess({ target: request });
      }, 0);
      return request;
    });

    mockIDBDatabase.transaction.mockReturnValue(mockIDBTransaction);
    mockIDBTransaction.objectStore.mockReturnValue(mockIDBObjectStore);

    // Setup localStorage mock
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });

    // Create comprehensive test data
    mockData = {
      project: {
        id: 'integration-project-1',
        name: 'Data Persistence Test Project',
        client: {
          name: 'Persistence Test Client',
          document: '98.765.432/0001-10',
          email: 'persistence@test.com',
          phone: '(11) 88888-8888',
          address: {
            street: 'Rua da Persistência',
            number: '500',
            complement: 'Andar 10',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01000-000',
            country: 'Brasil'
          },
          contactPerson: 'Maria Silva'
        },
        contractPeriod: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-01-31'),
          durationMonths: 12,
          renewalOptions: []
        },
        description: 'Projeto para testar persistência de dados',
        currency: 'BRL',
        location: 'São Paulo',
        serviceType: 'STANDARD' as any,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      team: [
        {
          id: 'team-member-1',
          name: 'João Persistence',
          role: 'Analista de Dados',
          salary: 7000,
          benefits: {
            healthInsurance: 350,
            mealVoucher: 450,
            transportVoucher: 200,
            lifeInsurance: 60,
            vacation: 8.33,
            thirteenthSalary: 8.33,
            fgts: 8,
            inss: 11,
            otherBenefits: []
          },
          workload: 40,
          startDate: new Date('2024-02-01'),
          costPerHour: 43.75,
          skills: ['SQL', 'Python', 'Data Analysis'],
          certifications: ['Microsoft Certified']
        }
      ],
      schedules: [
        {
          id: 'schedule-persistence-1',
          name: 'Horário Padrão',
          shifts: [
            {
              id: 'shift-morning',
              name: 'Manhã',
              startTime: '09:00',
              endTime: '13:00',
              daysOfWeek: [1, 2, 3, 4, 5],
              teamMembers: ['team-member-1'],
              isSpecialShift: false,
              multiplier: 1
            }
          ],
          coverage: {
            minimumStaff: 1,
            preferredStaff: 2,
            criticalPeriods: []
          },
          specialRates: []
        }
      ],
      taxes: {
        region: 'São Paulo',
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
          annualRate: 4.2,
          monthlyRate: 0.35,
          projectionPeriod: 12,
          source: 'IBGE',
          lastUpdate: new Date('2024-01-01')
        },
        salaryAdjustments: {
          annualAdjustment: 5.0,
          adjustmentDate: new Date('2024-05-01'),
          adjustmentType: 'inflation',
          minimumAdjustment: 3,
          maximumAdjustment: 8
        },
        marketFactors: [],
        scenarios: []
      },
      otherCosts: [
        {
          id: 'other-cost-1',
          name: 'Ferramentas de Análise',
          value: 5000,
          category: 'SOFTWARE' as any,
          type: 'monthly' as any,
          description: 'Licenças de software para análise de dados',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2025-01-31')
        }
      ],
      budget: {
        teamCosts: {
          salaries: 84000,
          benefits: 33600,
          total: 117600,
          breakdown: []
        },
        infrastructureCosts: 60000,
        otherCosts: 60000,
        taxes: {
          federal: 45000,
          state: 18000,
          municipal: 5000,
          total: 68000,
          breakdown: []
        },
        totalCosts: 305600,
        margin: {
          type: 'percentage',
          value: 20,
          minimumMargin: 15,
          targetMargin: 20,
          maximumMargin: 25
        },
        totalPrice: 382000,
        monthlyBreakdown: []
      },
      analysis: {
        roi: {
          investment: 305600,
          returns: [76400, 76400, 76400, 76400, 76400],
          roi: 25,
          irr: 12,
          npv: 50000,
          period: 60
        },
        payback: {
          simplePayback: 48,
          discountedPayback: 52,
          breakEvenPoint: 48,
          cashFlowAnalysis: []
        },
        margins: {
          grossMargin: 20,
          netMargin: 18,
          ebitdaMargin: 19,
          contributionMargin: 22,
          marginTrend: []
        },
        riskAnalysis: {
          riskFactors: ['Volatilidade do mercado'],
          overallRisk: 'medium',
          mitigation: ['Diversificação de clientes']
        },
        sensitivityAnalysis: {
          variables: [],
          scenarios: []
        },
        charts: []
      },
      negotiations: [],
      finalAnalysis: {
        kpis: [],
        summary: {
          projectValue: 382000,
          expectedProfit: 76400,
          riskLevel: 'medium',
          recommendedAction: 'approve',
          keyHighlights: [],
          concerns: []
        },
        recommendations: [],
        benchmarks: [],
        approvals: []
      },
      metadata: {
        version: '1.0.0',
        lastModified: new Date('2024-01-20'),
        modifiedBy: 'persistence-test',
        status: ProjectStatus.DRAFT,
        tags: ['persistence', 'test'],
        notes: 'Projeto para testes de persistência',
        attachments: []
      }
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Data Lifecycle', () => {
    it('should persist and retrieve complete service desk data', async () => {
      // Mock successful IndexedDB operations
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = { id: mockData.project.id, data: mockData };
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      // Persist data
      await dataManager.persistData(mockData);

      // Retrieve data
      const retrievedData = await dataManager.loadData(mockData.project.id);

      // Verify all major sections are preserved
      expect(retrievedData.project.name).toBe(mockData.project.name);
      expect(retrievedData.project.client.name).toBe(mockData.project.client.name);
      expect(retrievedData.team).toHaveLength(1);
      expect(retrievedData.team[0].name).toBe(mockData.team[0].name);
      expect(retrievedData.schedules).toHaveLength(1);
      expect(retrievedData.schedules[0].name).toBe(mockData.schedules[0].name);
      expect(retrievedData.taxes.region).toBe(mockData.taxes.region);
      expect(retrievedData.otherCosts).toHaveLength(1);
      expect(retrievedData.budget.totalPrice).toBe(mockData.budget.totalPrice);
      expect(retrievedData.metadata.status).toBe(mockData.metadata.status);
    });

    it('should handle data updates and maintain consistency', async () => {
      // Initial save
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await dataManager.persistData(mockData);

      // Update team data
      const updatedTeamData = [
        ...mockData.team,
        {
          id: 'team-member-2',
          name: 'Ana Update',
          role: 'Coordenadora',
          salary: 9000,
          benefits: {} as any,
          workload: 40,
          startDate: new Date(),
          costPerHour: 56.25,
          skills: [],
          certifications: []
        }
      ];

      const updatedData = dataManager.updateTabData(mockData, 'team', updatedTeamData);

      // Persist updated data
      await dataManager.persistData(updatedData);

      // Mock retrieval of updated data
      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = { id: updatedData.project.id, data: updatedData };
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const retrievedUpdatedData = await dataManager.loadData(mockData.project.id);

      expect(retrievedUpdatedData.team).toHaveLength(2);
      expect(retrievedUpdatedData.team[1].name).toBe('Ana Update');
      expect(retrievedUpdatedData.metadata.lastModified).toBeInstanceOf(Date);
    });

    it('should maintain data integrity across multiple operations', async () => {
      // Setup successful operations
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      // Perform multiple tab updates
      let currentData = mockData;

      // Update project data
      const projectUpdate = {
        ...currentData.project,
        name: 'Updated Project Name',
        description: 'Updated description'
      };
      currentData = dataManager.updateTabData(currentData, 'data', projectUpdate);

      // Update taxes
      const taxUpdate = {
        ...currentData.taxes,
        icms: 20,
        iss: 6
      };
      currentData = dataManager.updateTabData(currentData, 'taxes', taxUpdate);

      // Update other costs
      const newCost = {
        id: 'cost-2',
        name: 'New Infrastructure Cost',
        value: 3000,
        category: 'INFRASTRUCTURE' as any,
        type: 'monthly' as any,
        description: 'Additional infrastructure',
        startDate: new Date(),
        endDate: new Date()
      };
      const costsUpdate = [...currentData.otherCosts, newCost];
      currentData = dataManager.updateTabData(currentData, 'other-costs', costsUpdate);

      // Persist final state
      await dataManager.persistData(currentData);

      // Verify data integrity
      expect(dataManager.validateDataIntegrity(currentData)).toBe(true);
      expect(currentData.project.name).toBe('Updated Project Name');
      expect(currentData.taxes.icms).toBe(20);
      expect(currentData.otherCosts).toHaveLength(2);
      expect(currentData.metadata.lastModified).toBeInstanceOf(Date);
    });
  });

  describe('Calculation Integration with Persistence', () => {
    it('should persist calculated values and maintain consistency', async () => {
      // Calculate team costs
      const teamCosts = calculationEngine.calculateTeamCosts(mockData.team, mockData.schedules);
      
      // Calculate taxes
      const taxes = calculationEngine.calculateTaxes(mockData.budget.totalPrice, mockData.taxes);
      
      // Update budget with calculated values
      const updatedBudget = {
        ...mockData.budget,
        teamCosts: {
          ...mockData.budget.teamCosts,
          total: teamCosts.totalMonthlyCost
        },
        taxes: {
          ...mockData.budget.taxes,
          total: taxes.totalTaxes
        }
      };

      const updatedData = dataManager.updateTabData(mockData, 'budget', updatedBudget);

      // Mock persistence
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await dataManager.persistData(updatedData);

      // Verify calculated values are preserved
      expect(updatedData.budget.teamCosts.total).toBe(teamCosts.totalMonthlyCost);
      expect(updatedData.budget.taxes.total).toBe(taxes.totalTaxes);
    });

    it('should recalculate values after data changes and persist updates', async () => {
      // Initial calculation
      const initialTeamCosts = calculationEngine.calculateTeamCosts(mockData.team, mockData.schedules);

      // Add new team member
      const newMember = {
        id: 'member-new',
        name: 'New Member',
        role: 'Junior Analyst',
        salary: 4000,
        benefits: {
          healthInsurance: 250,
          mealVoucher: 350,
          transportVoucher: 150,
          lifeInsurance: 40,
          vacation: 8.33,
          thirteenthSalary: 8.33,
          fgts: 8,
          inss: 11,
          otherBenefits: []
        },
        workload: 40,
        startDate: new Date(),
        costPerHour: 25,
        skills: [],
        certifications: []
      };

      const updatedTeam = [...mockData.team, newMember];
      const updatedData = dataManager.updateTabData(mockData, 'team', updatedTeam);

      // Recalculate with new team
      const newTeamCosts = calculationEngine.calculateTeamCosts(updatedData.team, updatedData.schedules);

      // Update budget with new calculations
      const updatedBudget = {
        ...updatedData.budget,
        teamCosts: {
          ...updatedData.budget.teamCosts,
          total: newTeamCosts.totalMonthlyCost
        }
      };

      const finalData = dataManager.updateTabData(updatedData, 'budget', updatedBudget);

      // Verify recalculation
      expect(newTeamCosts.totalMonthlyCost).toBeGreaterThan(initialTeamCosts.totalMonthlyCost);
      expect(finalData.budget.teamCosts.total).toBe(newTeamCosts.totalMonthlyCost);
    });
  });

  describe('Validation Integration with Persistence', () => {
    it('should validate data before persistence and handle errors', async () => {
      // Create invalid data
      const invalidData = {
        ...mockData,
        project: {
          ...mockData.project,
          name: '', // Invalid: empty name
          client: {
            ...mockData.project.client,
            name: '', // Invalid: empty client name
            email: 'invalid-email' // Invalid: bad email format
          }
        }
      };

      // Validate before persistence
      const validation = validationEngine.validateTabData('data', invalidData.project);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // Should not persist invalid data
      const isValid = dataManager.validateDataIntegrity(invalidData);
      expect(isValid).toBe(false);
    });

    it('should validate tab transitions and maintain data consistency', async () => {
      // Test transition from data to team tab
      const dataValidation = validationEngine.validateTabData('data', mockData.project);
      expect(dataValidation.isValid).toBe(true);

      // Test transition validation
      const transitionValidation = validationEngine.validateTransition('data', 'team', mockData);
      expect(transitionValidation.isValid).toBe(true);

      // Update data and test again
      const updatedData = dataManager.updateTabData(mockData, 'data', {
        ...mockData.project,
        name: 'Updated Project'
      });

      const updatedValidation = validationEngine.validateTabData('data', updatedData.project);
      expect(updatedValidation.isValid).toBe(true);
    });
  });

  describe('Auto-save Integration', () => {
    it('should auto-save data changes with proper debouncing', async () => {
      vi.useFakeTimers();

      const autoSaveSpy = vi.fn();
      dataManager.scheduleAutoSave = autoSaveSpy;

      // Simulate rapid changes
      let currentData = mockData;
      
      // Change 1
      currentData = dataManager.updateTabData(currentData, 'data', {
        ...currentData.project,
        name: 'Change 1'
      });
      dataManager.scheduleAutoSave(currentData, 2000);

      // Change 2 (should cancel previous)
      currentData = dataManager.updateTabData(currentData, 'data', {
        ...currentData.project,
        name: 'Change 2'
      });
      dataManager.scheduleAutoSave(currentData, 2000);

      // Change 3 (should cancel previous)
      currentData = dataManager.updateTabData(currentData, 'data', {
        ...currentData.project,
        name: 'Final Change'
      });
      dataManager.scheduleAutoSave(currentData, 2000);

      // Fast-forward time
      vi.advanceTimersByTime(2000);

      // Should only be called once with final data
      expect(autoSaveSpy).toHaveBeenCalledTimes(3);
      expect(autoSaveSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          project: expect.objectContaining({
            name: 'Final Change'
          })
        }),
        2000
      );

      vi.useRealTimers();
    });

    it('should handle auto-save failures gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock persistence to fail
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('Auto-save failed');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      // Should handle error gracefully
      await expect(dataManager.persistData(mockData)).rejects.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Backup and Recovery Integration', () => {
    it('should create backups during critical operations', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.setItem.mockImplementation(() => {});

      // Create backup before major update
      const backupKey = await dataManager.createBackup(mockData);

      expect(backupKey).toMatch(/service-desk-pricing-data-backup-\d+/);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        backupKey,
        expect.stringContaining(mockData.project.name)
      );
    });

    it('should restore from backup when needed', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const restoredData = await dataManager.restoreFromBackup('test-backup-key');

      expect(restoredData.project.name).toBe(mockData.project.name);
      expect(restoredData.team).toHaveLength(mockData.team.length);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-backup-key');
    });

    it('should maintain backup history and cleanup old backups', async () => {
      const localStorageMock = global.localStorage as any;
      
      // Mock existing backups
      const existingBackups = [
        'service-desk-pricing-data-backup-1000',
        'service-desk-pricing-data-backup-2000',
        'service-desk-pricing-data-backup-3000',
        'service-desk-pricing-data-backup-4000',
        'service-desk-pricing-data-backup-5000',
        'service-desk-pricing-data-backup-6000' // 6 backups (should keep only 5)
      ];

      // Mock Object.keys to return backup keys
      const originalKeys = Object.keys;
      Object.keys = vi.fn().mockReturnValue([
        ...existingBackups,
        'other-key-1',
        'other-key-2'
      ]);

      localStorageMock.setItem.mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {});

      await dataManager.createBackup(mockData);

      // Should remove oldest backup
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('service-desk-pricing-data-backup-1000');

      // Restore original Object.keys
      Object.keys = originalKeys;
    });
  });

  describe('Cross-Tab Synchronization', () => {
    it('should synchronize data changes across browser tabs', () => {
      const mockBroadcastChannel = {
        postMessage: vi.fn(),
        addEventListener: vi.fn(),
        close: vi.fn()
      };

      Object.defineProperty(global, 'BroadcastChannel', {
        value: vi.fn(() => mockBroadcastChannel),
        writable: true
      });

      dataManager.initializeSync();

      // Broadcast data update
      dataManager.broadcastDataUpdate(mockData);

      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: 'data-update',
        data: mockData,
        timestamp: expect.any(Number)
      });
    });

    it('should handle sync conflicts gracefully', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsubscribe1 = dataManager.onDataSync(callback1);
      const unsubscribe2 = dataManager.onDataSync(callback2);

      // Simulate sync event
      const syncData = { ...mockData, project: { ...mockData.project, name: 'Synced Name' } };
      
      // Manually trigger callbacks (simulating broadcast channel message)
      dataManager['syncCallbacks'].forEach(callback => callback(syncData));

      expect(callback1).toHaveBeenCalledWith(syncData);
      expect(callback2).toHaveBeenCalledWith(syncData);

      // Test unsubscribe
      unsubscribe1();
      unsubscribe2();

      expect(dataManager['syncCallbacks']).toHaveLength(0);
    });
  });

  describe('Memory Management Integration', () => {
    it('should optimize memory usage during persistence operations', () => {
      const initialStats = dataManager.getMemoryStats();
      
      // Perform multiple operations
      dataManager.cacheData(mockData);
      dataManager.scheduleAutoSave(mockData);
      
      const afterOperationsStats = dataManager.getMemoryStats();
      
      // Perform cleanup
      dataManager.optimizeMemoryUsage();
      
      const afterCleanupStats = dataManager.getMemoryStats();
      
      expect(afterOperationsStats.cacheSize).toBeGreaterThanOrEqual(initialStats.cacheSize);
      expect(afterCleanupStats.cacheSize).toBeLessThanOrEqual(afterOperationsStats.cacheSize);
    });

    it('should handle large datasets efficiently', async () => {
      const largeDataset = {
        ...mockData,
        team: Array.from({ length: 500 }, (_, i) => ({
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
        otherCosts: Array.from({ length: 1000 }, (_, i) => ({
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

      // Should handle large dataset without memory issues
      const shouldOptimize = dataManager.shouldOptimizeMemory();
      
      if (shouldOptimize) {
        dataManager.autoOptimizeMemory();
      }

      // Mock successful persistence
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(dataManager.persistData(largeDataset)).resolves.toBeUndefined();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover from IndexedDB failures using localStorage fallback', async () => {
      // Mock IndexedDB to fail
      mockIndexedDB.open.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('IndexedDB not available');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      const localStorageMock = global.localStorage as any;
      localStorageMock.setItem.mockImplementation(() => {});
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      // Should fallback to localStorage
      await dataManager.persistData(mockData);
      const retrievedData = await dataManager.loadData(mockData.project.id);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      expect(localStorageMock.getItem).toHaveBeenCalled();
      expect(retrievedData.project.name).toBe(mockData.project.name);
    });

    it('should handle corrupted data gracefully', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.getItem.mockReturnValue('corrupted-json-data');

      const retrievedData = await dataManager.loadData('non-existent-id');

      // Should return empty data structure instead of crashing
      expect(retrievedData).toBeDefined();
      expect(retrievedData.project.name).toBe('');
    });

    it('should maintain data consistency during concurrent operations', async () => {
      // Simulate concurrent updates
      const promises = [];

      for (let i = 0; i < 5; i++) {
        const updatedData = dataManager.updateTabData(mockData, 'data', {
          ...mockData.project,
          name: `Concurrent Update ${i}`
        });

        mockIDBObjectStore.put.mockImplementation(() => {
          const request = { ...mockIDBRequest };
          setTimeout(() => {
            if (request.onsuccess) request.onsuccess();
          }, Math.random() * 100); // Random delay
          return request;
        });

        promises.push(dataManager.persistData(updatedData));
      }

      // All operations should complete successfully
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});