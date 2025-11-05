import { 
  ServiceDeskData, 
  ServiceType,
  TaxRegime,
  ProjectStatus,
  CoverageType
} from '@/lib/types/service-desk-pricing';
import { MemoryManager, cleanupUnusedData, MemoryEfficientMap } from '@/lib/utils/memory-optimization';
import { prismaDataService } from './prisma-data-service';
import { prisma } from '@/lib/prisma';

export class ServiceDeskDataManager {
  private static readonly STORAGE_KEY = 'service-desk-pricing-data';
  private static readonly DB_NAME = 'ServiceDeskPricingDB';
  private static readonly DB_VERSION = 1;
  private static readonly STORE_NAME = 'projects';
  
  private db: IDBDatabase | null = null;
  private memoryManager: MemoryManager;
  private dataCache: MemoryEfficientMap<string, ServiceDeskData>;
  private autoSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.memoryManager = MemoryManager.getInstance();
    this.dataCache = new MemoryEfficientMap<string, ServiceDeskData>(50); // Cache up to 50 projects
    
    // Register cleanup task
    this.memoryManager.registerCleanupTask('data-manager', () => {
      this.cleanup();
    });
  }

  /**
   * Creates empty data structure for new projects
   */
  static createEmptyData(): ServiceDeskData {
    const now = new Date();
    
    return {
      project: {
        id: crypto.randomUUID(),
        name: '',
        client: {
          name: '',
          document: '',
          email: '',
          phone: '',
          address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil'
          },
          contactPerson: ''
        },
        contractPeriod: {
          startDate: now,
          endDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
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
      forecast: {
        id: crypto.randomUUID(),
        projectId: crypto.randomUUID(),
        scenarios: [],
        assumptions: {
          contractDuration: 24,
          inflationRate: 6.5,
          salaryAdjustment: 8.0,
          renewalProbability: 85,
          expansionProbability: 40,
          churnRate: 5,
          seasonalFactors: [
            { month: 1, factor: 0.9, description: 'Janeiro - Baixa demanda pós-feriados' },
            { month: 2, factor: 1.0, description: 'Fevereiro - Demanda normal' },
            { month: 3, factor: 1.1, description: 'Março - Aumento de demanda' },
            { month: 4, factor: 1.0, description: 'Abril - Demanda normal' },
            { month: 5, factor: 1.0, description: 'Maio - Demanda normal' },
            { month: 6, factor: 1.1, description: 'Junho - Meio do ano' },
            { month: 7, factor: 0.95, description: 'Julho - Férias escolares' },
            { month: 8, factor: 1.05, description: 'Agosto - Retorno das férias' },
            { month: 9, factor: 1.15, description: 'Setembro - Alta demanda' },
            { month: 10, factor: 1.2, description: 'Outubro - Pico de demanda' },
            { month: 11, factor: 1.25, description: 'Novembro - Black Friday' },
            { month: 12, factor: 0.8, description: 'Dezembro - Feriados' }
          ]
        },
        projections: [],
        riskAnalysis: {
          risks: [],
          mitigations: [],
          sensitivityAnalysis: [],
          monteCarloResults: undefined
        },
        dashboard: {
          kpis: [],
          charts: [],
          alerts: [],
          insights: [],
          lastUpdated: now
        },
        createdAt: now,
        updatedAt: now
      },
      team: [],
      jobPositions: [],
      schedules: [],
      taxes: {
        region: '',
        icms: 0,
        pis: 1.65,
        cofins: 7.6,
        iss: 5,
        ir: 15,
        csll: 9,
        customTaxes: [],
        taxRegime: TaxRegime.LUCRO_PRESUMIDO
      },
      variables: {
        inflation: {
          annualRate: 4.5,
          monthlyRate: 0.37,
          projectionPeriod: 12,
          source: 'IBGE',
          lastUpdate: now
        },
        salaryAdjustments: {
          annualAdjustment: 5,
          adjustmentDate: new Date(now.getFullYear(), 4, 1), // May 1st
          adjustmentType: 'inflation',
          minimumAdjustment: 3,
          maximumAdjustment: 10
        },
        marketFactors: [],
        scenarios: []
      },
      otherCosts: [],
      budget: {
        teamCosts: {
          salaries: 0,
          benefits: 0,
          total: 0,
          breakdown: []
        },
        infrastructureCosts: 0,
        otherCosts: 0,
        taxes: {
          federal: 0,
          state: 0,
          municipal: 0,
          total: 0,
          breakdown: []
        },
        totalCosts: 0,
        margin: {
          type: 'percentage',
          value: 20,
          minimumMargin: 10,
          targetMargin: 20,
          maximumMargin: 40
        },
        totalPrice: 0,
        monthlyBreakdown: []
      },
      analysis: {
        roi: {
          investment: 0,
          returns: [],
          roi: 0,
          irr: 0,
          npv: 0,
          period: 12
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
          ebitdaMargin: 0,
          contributionMargin: 0,
          marginTrend: []
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
   * Updates data for a specific tab
   */
  updateTabData(currentData: ServiceDeskData, tabId: string, tabData: any): ServiceDeskData {
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
   * Gets data for a specific tab
   */
  getTabData(data: ServiceDeskData, tabId: string): any {
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

  /**
   * Load data from localStorage as fallback
   */
  private async loadFromLocalStorage(projectId: string): Promise<ServiceDeskData> {
    try {
      const serializedData = localStorage.getItem(`${ServiceDeskDataManager.STORAGE_KEY}-${projectId}`);
      if (!serializedData) {
        throw new Error('No data found in localStorage');
      }
      
      return this.deserializeData(JSON.parse(serializedData));
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      throw new Error('Failed to load from localStorage');
    }
  }

  /**
   * Initialize IndexedDB connection
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    // Check if IndexedDB is available
    if (typeof indexedDB === 'undefined') {
      throw new Error('IndexedDB not available');
    }

    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(ServiceDeskDataManager.DB_NAME, ServiceDeskDataManager.DB_VERSION);
        
        request.onerror = () => {
          console.error('IndexedDB error:', request.error);
          reject(new Error('Failed to open IndexedDB'));
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
          try {
            const db = (event.target as IDBOpenDBRequest).result;
            
            if (!db.objectStoreNames.contains(ServiceDeskDataManager.STORE_NAME)) {
              const store = db.createObjectStore(ServiceDeskDataManager.STORE_NAME, { keyPath: 'id' });
              store.createIndex('lastModified', 'metadata.lastModified', { unique: false });
              store.createIndex('status', 'metadata.status', { unique: false });
            }
          } catch (error) {
            console.error('Error creating object store:', error);
            reject(error);
          }
        };
      } catch (error) {
        console.error('Error initializing IndexedDB:', error);
        reject(error);
      }
    });
  }

  /**
   * Persists data to Prisma with IndexedDB/localStorage fallback
   */
  async persistData(data: ServiceDeskData, userId?: string): Promise<void> {
    try {
      // Try Prisma first if we have userId
      if (userId && data.project.id) {
        try {
          await prismaDataService.updateProject(data.project.id, userId, data);
          console.log('Data saved to Prisma successfully');
        } catch (error) {
          console.warn('Failed to save to Prisma, falling back to local storage:', error);
        }
      }

      // Always save locally as backup
      await this.persistToIndexedDB(data);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      // Final fallback to localStorage
      await this.persistToLocalStorage(data);
    }
  }

  /**
   * Original persistData method for backward compatibility
   */
  async persistDataLocal(data: ServiceDeskData): Promise<void> {
    try {
      // Try IndexedDB first
      await this.persistToIndexedDB(data);
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      // Fallback to localStorage
      await this.persistToLocalStorage(data);
    }
  }

  /**
   * Persist data to IndexedDB
   */
  private async persistToIndexedDB(data: ServiceDeskData): Promise<void> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ServiceDeskDataManager.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(ServiceDeskDataManager.STORE_NAME);
      
      // Store the data with project ID as key
      const request = store.put({
        id: data.project.id,
        data: data,
        lastModified: data.metadata.lastModified
      });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Persist data to localStorage (fallback)
   */
  private async persistToLocalStorage(data: ServiceDeskData): Promise<void> {
    try {
      const serializedData = JSON.stringify(data, (key, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      
      localStorage.setItem(`${ServiceDeskDataManager.STORAGE_KEY}-${data.project.id}`, serializedData);
    } catch (error) {
      console.error('Error persisting data to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  /**
   * Loads data from Prisma with IndexedDB/localStorage fallback
   */
  async loadData(projectId?: string, userId?: string): Promise<ServiceDeskData> {
    try {
      // Check cache first to avoid unnecessary calls
      if (projectId && this.dataCache.has(projectId)) {
        return this.dataCache.get(projectId)!;
      }

      // Try Prisma first if we have both IDs
      if (projectId && userId) {
        try {
          const data = await prismaDataService.getProject(projectId, userId);
          this.dataCache.set(projectId, data);
          return data;
        } catch (error) {
          console.warn('Failed to load from Prisma, falling back to local storage:', error);
        }
      }

      // Fallback to IndexedDB
      if (projectId) {
        try {
          return await this.loadFromIndexedDB(projectId);
        } catch (error) {
          console.warn('Failed to load from IndexedDB, falling back to localStorage:', error);
          return projectId ? await this.loadFromLocalStorage(projectId) : ServiceDeskDataManager.createEmptyData();
        }
      } else {
        // Load most recent project or create empty
        try {
          return await this.loadMostRecentProject();
        } catch (error) {
          console.warn('Failed to load recent project, creating empty:', error);
          return ServiceDeskDataManager.createEmptyData();
        }
      }
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      // Final fallback to localStorage
      return projectId ? await this.loadFromLocalStorage(projectId) : ServiceDeskDataManager.createEmptyData();
    }
  }

  /**
   * Original loadData method for backward compatibility
   */
  async loadDataLocal(projectId?: string): Promise<ServiceDeskData> {
    try {
      // Try IndexedDB first
      if (projectId) {
        return await this.loadFromIndexedDB(projectId);
      } else {
        // Load most recent project
        return await this.loadMostRecentProject();
      }
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error);
      // Fallback to localStorage
      return projectId ? await this.loadFromLocalStorage(projectId) : ServiceDeskDataManager.createEmptyData();
    }
  }

  /**
   * Load data from IndexedDB
   */
  private async loadFromIndexedDB(projectId: string): Promise<ServiceDeskData> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ServiceDeskDataManager.STORE_NAME], 'readonly');
      const store = transaction.objectStore(ServiceDeskDataManager.STORE_NAME);
      const request = store.get(projectId);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(this.deserializeData(request.result.data));
        } else {
          resolve(ServiceDeskDataManager.createEmptyData());
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load most recent project from IndexedDB
   */
  private async loadMostRecentProject(): Promise<ServiceDeskData> {
    const db = await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ServiceDeskDataManager.STORE_NAME], 'readonly');
      const store = transaction.objectStore(ServiceDeskDataManager.STORE_NAME);
      const index = store.index('lastModified');
      const request = index.openCursor(null, 'prev'); // Most recent first
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          resolve(this.deserializeData(cursor.value.data));
        } else {
          resolve(ServiceDeskDataManager.createEmptyData());
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }



  /**
   * Deserialize data and handle Date objects
   */
  private deserializeData(data: any): ServiceDeskData {
    return JSON.parse(JSON.stringify(data), (key, value) => {
      // Handle Date objects
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  }

  /**
   * Exports data in specified format
   */
  async exportData(data: ServiceDeskData, format: 'json' | 'excel' | 'pdf'): Promise<Blob> {
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      
      case 'excel':
        // TODO: Implement Excel export
        throw new Error('Excel export not yet implemented');
      
      case 'pdf':
        // TODO: Implement PDF export
        throw new Error('PDF export not yet implemented');
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Validates data integrity
   */
  validateDataIntegrity(data: ServiceDeskData): boolean {
    try {
      // Basic validation checks
      if (!data.project?.id) return false;
      if (!data.metadata?.version) return false;
      
      // TODO: Add more comprehensive validation
      return true;
    } catch (error) {
      console.error('Data integrity validation failed:', error);
      return false;
    }
  }

  /**
   * Lists available backups
   */
  listBackups(): string[] {
    const backups: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${ServiceDeskDataManager.STORAGE_KEY}-backup-`)) {
        backups.push(key);
      }
    }
    return backups.sort().reverse(); // Most recent first
  }

  /**
   * Restores data from backup
   */
  async restoreFromBackup(backupKey: string): Promise<ServiceDeskData> {
    const serializedData = localStorage.getItem(backupKey);
    if (!serializedData) {
      throw new Error('Backup not found');
    }
    
    return JSON.parse(serializedData, (_, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  }

  /**
   * Lists all projects in IndexedDB
   */
  async listProjects(): Promise<Array<{ id: string; name: string; lastModified: Date; status: ProjectStatus }>> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskDataManager.STORE_NAME], 'readonly');
        const store = transaction.objectStore(ServiceDeskDataManager.STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const projects = request.result.map(item => ({
            id: item.data.project.id,
            name: item.data.project.name,
            lastModified: new Date(item.data.metadata.lastModified),
            status: item.data.metadata.status
          }));
          
          // Sort by last modified (most recent first)
          projects.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
          resolve(projects);
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error listing projects:', error);
      return [];
    }
  }

  /**
   * Deletes a project from storage
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      // Delete from IndexedDB
      const db = await this.initDB();
      
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction([ServiceDeskDataManager.STORE_NAME], 'readwrite');
        const store = transaction.objectStore(ServiceDeskDataManager.STORE_NAME);
        const request = store.delete(projectId);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB delete failed, trying localStorage:', error);
    }
    
    // Also try to delete from localStorage
    try {
      localStorage.removeItem(`${ServiceDeskDataManager.STORAGE_KEY}-${projectId}`);
    } catch (error) {
      console.error('Error deleting from localStorage:', error);
    }
  }

  /**
   * Synchronizes data between tabs using BroadcastChannel
   */
  private broadcastChannel: BroadcastChannel | null = null;
  private syncCallbacks: Array<(data: ServiceDeskData) => void> = [];

  /**
   * Broadcast data changes to other tabs
   */
  broadcastDataUpdate(data: ServiceDeskData): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'data-update',
        data: data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Subscribe to data synchronization updates
   */
  onDataSync(callback: (data: ServiceDeskData) => void): () => void {
    this.syncCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cancel pending auto-save
   */
  cancelAutoSave(): void {
    this.autoSaveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.autoSaveTimeouts.clear();
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave(data: ServiceDeskData, delay: number = 2000): void {
    const projectId = data.project.id;
    
    // Clear existing timeout
    const existingTimeout = this.autoSaveTimeouts.get(projectId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new auto-save
    const timeout = setTimeout(async () => {
      try {
        await this.persistData(data);
        this.broadcastDataUpdate(data);
        this.autoSaveTimeouts.delete(projectId);
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, delay);

    this.autoSaveTimeouts.set(projectId, timeout);
  }

  /**
   * Clean up cached data and optimize memory usage
   */
  cleanup(): void {
    // Clear auto-save timeouts
    this.autoSaveTimeouts.forEach(timeout => clearTimeout(timeout));
    this.autoSaveTimeouts.clear();

    // Clear data cache
    this.dataCache.clear();

    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }

    // Clear sync callbacks
    this.syncCallbacks = [];

    // Close database connection
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  /**
   * Optimize memory usage by cleaning up old cached data
   */
  optimizeMemoryUsage(): void {
    // Get current memory usage
    const memoryStats = this.getMemoryStats();
    
    // If cache is getting large, clean up old entries
    if (memoryStats.cacheSize > 30) {
      // Keep only the 20 most recently accessed items
      const keysToRemove: string[] = [];
      let count = 0;
      
      // The MemoryEfficientMap already handles LRU eviction,
      // but we can force additional cleanup if needed
      this.dataCache.clear();
      
      console.log('Memory optimization: Cleared data cache');
    }

    // Clean up old auto-save timeouts
    if (memoryStats.autoSaveCount > 10) {
      this.autoSaveTimeouts.forEach((timeout, projectId) => {
        clearTimeout(timeout);
      });
      this.autoSaveTimeouts.clear();
      console.log('Memory optimization: Cleared auto-save timeouts');
    }
  }

  /**
   * Get memory usage in bytes (approximate)
   */
  getApproximateMemoryUsage(): number {
    let totalSize = 0;
    
    // Estimate cache size
    this.dataCache.forEach((data) => {
      totalSize += JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    });
    
    return totalSize;
  }

  /**
   * Check if memory optimization is needed
   */
  shouldOptimizeMemory(): boolean {
    const memoryUsage = this.getApproximateMemoryUsage();
    const maxMemoryUsage = 50 * 1024 * 1024; // 50MB threshold
    
    return memoryUsage > maxMemoryUsage || this.dataCache.size > 50;
  }

  /**
   * Automatic memory optimization
   */
  autoOptimizeMemory(): void {
    if (this.shouldOptimizeMemory()) {
      this.optimizeMemoryUsage();
    }
  }

  /**
   * Get cached data if available
   */
  getCachedData(projectId: string): ServiceDeskData | undefined {
    return this.dataCache.get(projectId);
  }

  /**
   * Cache data for quick access
   */
  cacheData(data: ServiceDeskData): void {
    this.dataCache.set(data.project.id, data);
  }

  /**
   * Clean up unused data from object
   */
  cleanupData(data: ServiceDeskData, keepOnlyEssential: boolean = false): ServiceDeskData {
    if (!keepOnlyEssential) {
      return data;
    }

    // Keep only essential fields for memory optimization
    const essentialFields = [
      'project',
      'team',
      'schedules',
      'taxes',
      'variables',
      'otherCosts',
      'budget'
    ];

    return cleanupUnusedData(data, essentialFields);
  }

  /**
   * Create backup of current data
   */
  async createBackup(data: ServiceDeskData): Promise<string> {
    try {
      const backupKey = `${ServiceDeskDataManager.STORAGE_KEY}-backup-${Date.now()}`;
      const serializedData = JSON.stringify(data, (_, value) => {
        // Handle Date objects
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() };
        }
        return value;
      });
      
      // Store in localStorage as backup
      localStorage.setItem(backupKey, serializedData);
      
      // Keep only last 5 backups
      const backupKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${ServiceDeskDataManager.STORAGE_KEY}-backup-`))
        .sort()
        .reverse();
      
      // Remove old backups
      backupKeys.slice(5).forEach(key => {
        localStorage.removeItem(key);
      });
      
      return backupKey;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  /**
   * Initialize sync between tabs (for real-time collaboration)
   */
  initializeSync(): void {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('service-desk-sync');
      
      this.broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'data-update') {
          this.syncCallbacks.forEach(callback => {
            callback(event.data.data);
          });
        }
      });
    }

    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(ServiceDeskDataManager.STORAGE_KEY)) {
        // Notify about data changes from other tabs
        console.log('Data changed in another tab');
      }
    });
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    cacheSize: number;
    autoSaveCount: number;
    dbConnected: boolean;
  } {
    return {
      cacheSize: this.dataCache.size,
      autoSaveCount: this.autoSaveTimeouts.size,
      dbConnected: this.db !== null
    };
  }
}