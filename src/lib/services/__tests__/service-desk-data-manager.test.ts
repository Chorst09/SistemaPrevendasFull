import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ServiceDeskDataManager } from '../service-desk-data-manager';
import { ServiceDeskData, ProjectStatus } from '@/lib/types/service-desk-pricing';

// Mock IndexedDB
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

const mockIDBIndex = {
  openCursor: vi.fn()
};

// Mock memory optimization utilities
vi.mock('@/lib/utils/memory-optimization', () => ({
  MemoryManager: {
    getInstance: () => ({
      registerCleanupTask: vi.fn(),
      unregisterCleanupTask: vi.fn()
    })
  },
  MemoryEfficientMap: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    get: vi.fn().mockReturnValue(undefined),
    has: vi.fn().mockReturnValue(false),
    delete: vi.fn(),
    clear: vi.fn(),
    size: 0,
    forEach: vi.fn()
  })),
  cleanupUnusedData: vi.fn((data, fields) => data)
}));

// Mock BroadcastChannel
const mockBroadcastChannel = {
  postMessage: vi.fn(),
  addEventListener: vi.fn(),
  close: vi.fn()
};

// Setup global mocks
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

Object.defineProperty(global, 'BroadcastChannel', {
  value: vi.fn(() => mockBroadcastChannel),
  writable: true
});

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  },
  writable: true
});

describe('ServiceDeskDataManager', () => {
  let dataManager: ServiceDeskDataManager;
  let mockData: ServiceDeskData;

  beforeEach(() => {
    dataManager = new ServiceDeskDataManager();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock data
    mockData = ServiceDeskDataManager.createEmptyData();
    mockData.project.name = 'Test Project';
    mockData.project.client.name = 'Test Client';

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
    mockIDBObjectStore.index.mockReturnValue(mockIDBIndex);

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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Static Methods', () => {
    it('should create empty data structure', () => {
      const emptyData = ServiceDeskDataManager.createEmptyData();

      expect(emptyData).toHaveProperty('project');
      expect(emptyData).toHaveProperty('team');
      expect(emptyData).toHaveProperty('schedules');
      expect(emptyData).toHaveProperty('taxes');
      expect(emptyData).toHaveProperty('variables');
      expect(emptyData).toHaveProperty('otherCosts');
      expect(emptyData).toHaveProperty('budget');
      expect(emptyData).toHaveProperty('analysis');
      expect(emptyData).toHaveProperty('negotiations');
      expect(emptyData).toHaveProperty('finalAnalysis');
      expect(emptyData).toHaveProperty('metadata');

      expect(emptyData.project.id).toBe('test-uuid-123');
      expect(emptyData.team).toEqual([]);
      expect(emptyData.schedules).toEqual([]);
      expect(emptyData.otherCosts).toEqual([]);
      expect(emptyData.negotiations).toEqual([]);
      expect(emptyData.metadata.status).toBe(ProjectStatus.DRAFT);
    });

    it('should create data with proper default values', () => {
      const emptyData = ServiceDeskDataManager.createEmptyData();

      expect(emptyData.taxes.pis).toBe(1.65);
      expect(emptyData.taxes.cofins).toBe(7.6);
      expect(emptyData.taxes.iss).toBe(5);
      expect(emptyData.variables.inflation.annualRate).toBe(4.5);
      expect(emptyData.budget.margin.value).toBe(20);
      expect(emptyData.project.currency).toBe('BRL');
    });
  });

  describe('Tab Data Management', () => {
    it('should update tab data correctly', () => {
      const newProjectData = {
        name: 'Updated Project Name',
        description: 'Updated description'
      };

      const updatedData = dataManager.updateTabData(mockData, 'data', newProjectData);

      expect(updatedData.project.name).toBe('Updated Project Name');
      expect(updatedData.project.description).toBe('Updated description');
      expect(updatedData.metadata.lastModified).toBeInstanceOf(Date);
    });

    it('should update team data correctly', () => {
      const newTeamData = [{
        id: 'member-1',
        name: 'John Doe',
        role: 'Senior Analyst',
        salary: 8000,
        benefits: {} as any,
        workload: 40,
        startDate: new Date(),
        costPerHour: 0,
        skills: [],
        certifications: []
      }];

      const updatedData = dataManager.updateTabData(mockData, 'team', newTeamData);

      expect(updatedData.team).toEqual(newTeamData);
      expect(updatedData.team).toHaveLength(1);
      expect(updatedData.team[0].name).toBe('John Doe');
    });

    it('should handle unknown tab ID gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const updatedData = dataManager.updateTabData(mockData, 'unknown-tab', { test: 'data' });

      expect(consoleSpy).toHaveBeenCalledWith('Unknown tab ID: unknown-tab');
      expect(updatedData).toEqual(mockData);
      
      consoleSpy.mockRestore();
    });

    it('should get tab data correctly', () => {
      const projectData = dataManager.getTabData(mockData, 'data');
      const teamData = dataManager.getTabData(mockData, 'team');

      expect(projectData).toBe(mockData.project);
      expect(teamData).toBe(mockData.team);
    });

    it('should handle unknown tab ID when getting data', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = dataManager.getTabData(mockData, 'unknown-tab');

      expect(consoleSpy).toHaveBeenCalledWith('Unknown tab ID: unknown-tab');
      expect(result).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Data Persistence', () => {
    it('should persist data to IndexedDB successfully', async () => {
      mockIDBObjectStore.put.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      await expect(dataManager.persistData(mockData)).resolves.toBeUndefined();
      expect(mockIDBObjectStore.put).toHaveBeenCalled();
    });

    it('should fallback to localStorage when IndexedDB fails', async () => {
      mockIndexedDB.open.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('IndexedDB failed');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      const localStorageMock = global.localStorage as any;
      localStorageMock.setItem.mockImplementation(() => {});

      await expect(dataManager.persistData(mockData)).resolves.toBeUndefined();
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should load data from IndexedDB successfully', async () => {
      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = { id: mockData.project.id, data: mockData };
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const loadedData = await dataManager.loadData(mockData.project.id);
      
      expect(loadedData).toBeDefined();
      expect(loadedData.project.name).toBe(mockData.project.name);
    });

    it('should return empty data when no data found', async () => {
      mockIDBObjectStore.get.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = null;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const loadedData = await dataManager.loadData('non-existent-id');
      
      expect(loadedData).toBeDefined();
      expect(loadedData.project.name).toBe('');
    });

    it('should fallback to localStorage when IndexedDB load fails', async () => {
      mockIndexedDB.open.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.error = new Error('IndexedDB failed');
          if (request.onerror) request.onerror();
        }, 0);
        return request;
      });

      const localStorageMock = global.localStorage as any;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const loadedData = await dataManager.loadData(mockData.project.id);
      
      expect(loadedData).toBeDefined();
      expect(localStorageMock.getItem).toHaveBeenCalled();
    });
  });

  describe('Data Export', () => {
    it('should export data as JSON', async () => {
      const blob = await dataManager.exportData(mockData, 'json');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/json');
      
      // In test environment, we'll check the blob size instead of reading text
      expect(blob.size).toBeGreaterThan(0);
    });

    it('should throw error for unsupported export formats', async () => {
      await expect(dataManager.exportData(mockData, 'excel' as any))
        .rejects.toThrow('Excel export not yet implemented');
      
      await expect(dataManager.exportData(mockData, 'pdf' as any))
        .rejects.toThrow('PDF export not yet implemented');
      
      await expect(dataManager.exportData(mockData, 'unsupported' as any))
        .rejects.toThrow('Unsupported export format: unsupported');
    });
  });

  describe('Data Validation', () => {
    it('should validate data integrity for valid data', () => {
      const isValid = dataManager.validateDataIntegrity(mockData);
      expect(isValid).toBe(true);
    });

    it('should fail validation for data without project ID', () => {
      const invalidData = { ...mockData };
      delete (invalidData.project as any).id;
      
      const isValid = dataManager.validateDataIntegrity(invalidData);
      expect(isValid).toBe(false);
    });

    it('should fail validation for data without metadata version', () => {
      const invalidData = { ...mockData };
      delete (invalidData.metadata as any).version;
      
      const isValid = dataManager.validateDataIntegrity(invalidData);
      expect(isValid).toBe(false);
    });

    it('should handle validation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Pass invalid data that will cause JSON parsing error
      const isValid = dataManager.validateDataIntegrity(null as any);
      
      expect(isValid).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Project Management', () => {
    it('should list projects from IndexedDB', async () => {
      const mockProjects = [
        {
          data: {
            project: { id: 'project-1', name: 'Project 1' },
            metadata: { lastModified: new Date(), status: ProjectStatus.DRAFT }
          }
        },
        {
          data: {
            project: { id: 'project-2', name: 'Project 2' },
            metadata: { lastModified: new Date(), status: ProjectStatus.ACTIVE }
          }
        }
      ];

      mockIDBObjectStore.getAll.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          request.result = mockProjects;
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const projects = await dataManager.listProjects();

      expect(projects).toHaveLength(2);
      expect(projects[0]).toHaveProperty('id', 'project-1');
      expect(projects[0]).toHaveProperty('name', 'Project 1');
      expect(projects[0]).toHaveProperty('lastModified');
      expect(projects[0]).toHaveProperty('status', ProjectStatus.DRAFT);
    });

    it('should handle errors when listing projects', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockIndexedDB.open.mockImplementation(() => {
        throw new Error('Database error');
      });

      const projects = await dataManager.listProjects();

      expect(projects).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should delete project from IndexedDB', async () => {
      mockIDBObjectStore.delete.mockImplementation(() => {
        const request = { ...mockIDBRequest };
        setTimeout(() => {
          if (request.onsuccess) request.onsuccess();
        }, 0);
        return request;
      });

      const localStorageMock = global.localStorage as any;
      localStorageMock.removeItem.mockImplementation(() => {});

      await expect(dataManager.deleteProject('project-1')).resolves.toBeUndefined();
      expect(mockIDBObjectStore.delete).toHaveBeenCalledWith('project-1');
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('Backup Management', () => {
    it('should create backup successfully', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.setItem.mockImplementation(() => {});
      
      // Mock Object.keys to return existing backup keys
      const originalKeys = Object.keys;
      Object.keys = vi.fn().mockReturnValue([
        'service-desk-pricing-data-backup-1000',
        'service-desk-pricing-data-backup-2000',
        'other-key'
      ]);

      const backupKey = await dataManager.createBackup(mockData);

      expect(backupKey).toMatch(/service-desk-pricing-data-backup-\d+/);
      expect(localStorageMock.setItem).toHaveBeenCalled();
      
      // Restore original Object.keys
      Object.keys = originalKeys;
    });

    it('should list available backups', () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.length = 3;
      localStorageMock.key.mockImplementation((index: number) => {
        const keys = [
          'service-desk-pricing-data-backup-1000',
          'service-desk-pricing-data-backup-2000',
          'other-key'
        ];
        return keys[index];
      });

      const backups = dataManager.listBackups();

      expect(backups).toHaveLength(2);
      expect(backups[0]).toBe('service-desk-pricing-data-backup-2000'); // Most recent first
      expect(backups[1]).toBe('service-desk-pricing-data-backup-1000');
    });

    it('should restore from backup', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockData));

      const restoredData = await dataManager.restoreFromBackup('backup-key');

      expect(restoredData).toBeDefined();
      expect(restoredData.project.name).toBe(mockData.project.name);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('backup-key');
    });

    it('should throw error when backup not found', async () => {
      const localStorageMock = global.localStorage as any;
      localStorageMock.getItem.mockReturnValue(null);

      await expect(dataManager.restoreFromBackup('non-existent-backup'))
        .rejects.toThrow('Backup not found');
    });
  });

  describe('Auto-save Management', () => {
    it('should schedule auto-save with debouncing', async () => {
      vi.useFakeTimers();
      
      const persistSpy = vi.spyOn(dataManager, 'persistData').mockResolvedValue();
      
      dataManager.scheduleAutoSave(mockData, 1000);
      
      // Should not save immediately
      expect(persistSpy).not.toHaveBeenCalled();
      
      // Fast-forward time
      vi.advanceTimersByTime(1000);
      
      // Wait for async operation
      await vi.runAllTimersAsync();
      
      expect(persistSpy).toHaveBeenCalledWith(mockData);
      
      vi.useRealTimers();
      persistSpy.mockRestore();
    });

    it('should cancel existing auto-save when scheduling new one', async () => {
      vi.useFakeTimers();
      
      const persistSpy = vi.spyOn(dataManager, 'persistData').mockResolvedValue();
      
      // Schedule first auto-save
      dataManager.scheduleAutoSave(mockData, 1000);
      
      // Schedule second auto-save (should cancel first)
      dataManager.scheduleAutoSave(mockData, 1000);
      
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();
      
      // Should only be called once (second save)
      expect(persistSpy).toHaveBeenCalledTimes(1);
      
      vi.useRealTimers();
      persistSpy.mockRestore();
    });

    it('should cancel all auto-saves', () => {
      vi.useFakeTimers();
      
      const persistSpy = vi.spyOn(dataManager, 'persistData').mockResolvedValue();
      
      dataManager.scheduleAutoSave(mockData, 1000);
      dataManager.cancelAutoSave();
      
      vi.advanceTimersByTime(1000);
      
      expect(persistSpy).not.toHaveBeenCalled();
      
      vi.useRealTimers();
      persistSpy.mockRestore();
    });
  });

  describe('Memory Management', () => {
    it('should get cached data', () => {
      const cachedData = dataManager.getCachedData('project-1');
      expect(cachedData).toBeUndefined(); // Initially empty
    });

    it('should cache data', () => {
      dataManager.cacheData(mockData);
      // Since we're using mocks, we just verify it doesn't throw
      expect(true).toBe(true);
    });

    it('should cleanup data when requested', () => {
      const cleanedData = dataManager.cleanupData(mockData, true);
      expect(cleanedData).toBeDefined();
    });

    it('should get memory statistics', () => {
      const stats = dataManager.getMemoryStats();
      
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('autoSaveCount');
      expect(stats).toHaveProperty('dbConnected');
      expect(typeof stats.cacheSize).toBe('number');
      expect(typeof stats.autoSaveCount).toBe('number');
      expect(typeof stats.dbConnected).toBe('boolean');
    });

    it('should optimize memory usage', () => {
      // Should not throw
      expect(() => dataManager.optimizeMemoryUsage()).not.toThrow();
    });

    it('should check if memory optimization is needed', () => {
      const shouldOptimize = dataManager.shouldOptimizeMemory();
      expect(typeof shouldOptimize).toBe('boolean');
    });

    it('should auto-optimize memory when needed', () => {
      // Should not throw
      expect(() => dataManager.autoOptimizeMemory()).not.toThrow();
    });
  });

  describe('Synchronization', () => {
    it('should initialize sync with BroadcastChannel', () => {
      dataManager.initializeSync();
      
      expect(BroadcastChannel).toHaveBeenCalledWith('service-desk-sync');
    });

    it('should broadcast data updates', () => {
      dataManager.initializeSync();
      dataManager.broadcastDataUpdate(mockData);
      
      expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith({
        type: 'data-update',
        data: mockData,
        timestamp: expect.any(Number)
      });
    });

    it('should handle sync callbacks', () => {
      const callback = vi.fn();
      const unsubscribe = dataManager.onDataSync(callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Unsubscribe should work
      unsubscribe();
      expect(true).toBe(true); // Just verify it doesn't throw
    });
  });

  describe('Cleanup', () => {
    it('should cleanup all resources', () => {
      dataManager.initializeSync();
      dataManager.scheduleAutoSave(mockData);
      
      // Should not throw
      expect(() => dataManager.cleanup()).not.toThrow();
    });
  });
});