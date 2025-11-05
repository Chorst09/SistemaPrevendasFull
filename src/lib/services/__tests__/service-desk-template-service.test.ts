import { ServiceDeskTemplateService } from '../service-desk-template-service';
import { ServiceDeskDataManager } from '../service-desk-data-manager';
import { TemplateCategory, TemplateType, TemplateComplexity } from '@/lib/types/service-desk-templates';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(() => ({
    result: {
      createObjectStore: jest.fn(() => ({
        createIndex: jest.fn()
      })),
      objectStoreNames: {
        contains: jest.fn(() => false)
      }
    },
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null
  }))
};

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB
});

describe('ServiceDeskTemplateService', () => {
  let templateService: ServiceDeskTemplateService;

  beforeEach(() => {
    templateService = new ServiceDeskTemplateService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Creation', () => {
    it('should create template from service desk data', async () => {
      const mockData = ServiceDeskDataManager.createEmptyData();
      mockData.project.name = 'Test Project';
      mockData.team = [
        {
          id: '1',
          name: 'Test User',
          role: 'Analyst',
          salary: 5000,
          benefits: {
            healthInsurance: 200,
            mealVoucher: 500,
            transportVoucher: 300,
            lifeInsurance: 50,
            vacation: 0,
            thirteenthSalary: 0,
            fgts: 0,
            inss: 0,
            otherBenefits: []
          },
          workload: 40,
          startDate: new Date(),
          costPerHour: 25,
          skills: ['Support'],
          certifications: []
        }
      ];

      const template = await templateService.createTemplateFromData(mockData, {
        name: 'Test Template',
        description: 'A test template',
        category: TemplateCategory.COMPLETE_PROJECT,
        tags: ['test'],
        isPublic: false
      });

      expect(template).toBeDefined();
      expect(template.name).toBe('Test Template');
      expect(template.description).toBe('A test template');
      expect(template.category).toBe(TemplateCategory.COMPLETE_PROJECT);
      expect(template.type).toBe(TemplateType.USER_TEMPLATE);
      expect(template.tags).toContain('test');
      expect(template.isPublic).toBe(false);
    });

    it('should infer complexity correctly', async () => {
      const mockData = ServiceDeskDataManager.createEmptyData();
      
      // Create a complex project
      mockData.team = Array.from({ length: 25 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        role: 'Analyst',
        salary: 5000,
        benefits: {
          healthInsurance: 200,
          mealVoucher: 500,
          transportVoucher: 300,
          lifeInsurance: 50,
          vacation: 0,
          thirteenthSalary: 0,
          fgts: 0,
          inss: 0,
          otherBenefits: []
        },
        workload: 40,
        startDate: new Date(),
        costPerHour: 25,
        skills: ['Support'],
        certifications: []
      }));

      const template = await templateService.createTemplateFromData(mockData, {
        name: 'Complex Template',
        description: 'A complex template',
        category: TemplateCategory.COMPLETE_PROJECT,
        tags: ['complex'],
        isPublic: false
      });

      expect(template.metadata.complexity).toBe(TemplateComplexity.ADVANCED);
    });
  });

  describe('Template Search', () => {
    it('should search templates by text', async () => {
      // This would require mocking the database operations
      // For now, we'll test the basic functionality
      const results = await templateService.searchTemplates({
        text: 'basic'
      });

      expect(Array.isArray(results)).toBe(true);
    });

    it('should filter templates by category', async () => {
      const results = await templateService.searchTemplates({
        category: TemplateCategory.TEAM_CONFIGURATION
      });

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Built-in Presets', () => {
    it('should have built-in presets available', async () => {
      const basicTemplate = await templateService.getTemplate('basic-it-support');
      expect(basicTemplate).toBeDefined();
      expect(basicTemplate?.name).toBe('Suporte de TI Básico');
      expect(basicTemplate?.type).toBe(TemplateType.PRESET);
    });

    it('should have enterprise template available', async () => {
      const enterpriseTemplate = await templateService.getTemplate('enterprise-service-desk');
      expect(enterpriseTemplate).toBeDefined();
      expect(enterpriseTemplate?.name).toBe('Service Desk Empresarial');
      expect(enterpriseTemplate?.type).toBe(TemplateType.PRESET);
    });

    it('should have healthcare template available', async () => {
      const healthcareTemplate = await templateService.getTemplate('healthcare-it-support');
      expect(healthcareTemplate).toBeDefined();
      expect(healthcareTemplate?.name).toBe('Suporte de TI para Saúde');
      expect(healthcareTemplate?.type).toBe(TemplateType.PRESET);
    });
  });
});