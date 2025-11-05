import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PrismaDataService } from '../prisma-data-service';
import { prisma } from '@/lib/prisma';
import { ServiceDeskDataManager } from '../service-desk-data-manager';

describe('PrismaDataService', () => {
  let service: PrismaDataService;
  let testUserId: string;
  let testProjectId: string;

  beforeAll(async () => {
    service = new PrismaDataService();
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testProjectId) {
      await prisma.project.deleteMany({
        where: { userId: testUserId },
      });
    }
    
    await prisma.user.delete({
      where: { id: testUserId },
    });
    
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any existing test projects
    await prisma.project.deleteMany({
      where: { userId: testUserId },
    });
  });

  describe('createProject', () => {
    it('should create a new project with basic data', async () => {
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Test Project';
      testData.project.description = 'Test Description';

      const result = await service.createProject(testUserId, testData);
      testProjectId = result.project.id;

      expect(result.project.name).toBe('Test Project');
      expect(result.project.description).toBe('Test Description');
      expect(result.project.id).toBeDefined();
    });

    it('should create project with client information', async () => {
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Test Project with Client';
      testData.project.client = {
        name: 'Test Client',
        document: '12.345.678/0001-90',
        email: 'client@test.com',
        phone: '(11) 99999-9999',
        contactPerson: 'John Doe',
        address: {
          street: 'Test Street',
          number: '123',
          complement: 'Apt 1',
          neighborhood: 'Test Neighborhood',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345-678',
          country: 'Brasil'
        }
      };

      const result = await service.createProject(testUserId, testData);
      testProjectId = result.project.id;

      expect(result.project.client?.name).toBe('Test Client');
      expect(result.project.client?.document).toBe('12.345.678/0001-90');
      expect(result.project.client?.address?.city).toBe('Test City');
    });
  });

  describe('getProject', () => {
    it('should retrieve an existing project', async () => {
      // First create a project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Retrievable Project';
      
      const created = await service.createProject(testUserId, testData);
      testProjectId = created.project.id;

      // Then retrieve it
      const retrieved = await service.getProject(testProjectId, testUserId);

      expect(retrieved.project.name).toBe('Retrievable Project');
      expect(retrieved.project.id).toBe(testProjectId);
    });

    it('should throw error for non-existent project', async () => {
      await expect(
        service.getProject('non-existent-id', testUserId)
      ).rejects.toThrow('Failed to fetch project');
    });

    it('should throw error for project belonging to different user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          name: 'Other User',
          role: 'USER',
        },
      });

      // Create project for other user
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Other User Project';
      
      const created = await service.createProject(otherUser.id, testData);

      // Try to access with different user
      await expect(
        service.getProject(created.project.id, testUserId)
      ).rejects.toThrow('Failed to fetch project');

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('updateProject', () => {
    it('should update project data', async () => {
      // Create project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Original Name';
      
      const created = await service.createProject(testUserId, testData);
      testProjectId = created.project.id;

      // Update project
      const updatedData = { ...created };
      updatedData.project.name = 'Updated Name';
      updatedData.project.description = 'Updated Description';

      const updated = await service.updateProject(testProjectId, testUserId, updatedData);

      expect(updated.project.name).toBe('Updated Name');
      expect(updated.project.description).toBe('Updated Description');
    });
  });

  describe('deleteProject', () => {
    it('should delete a project', async () => {
      // Create project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Project to Delete';
      
      const created = await service.createProject(testUserId, testData);
      const projectToDelete = created.project.id;

      // Delete project
      const result = await service.deleteProject(projectToDelete, testUserId);
      expect(result.success).toBe(true);

      // Verify it's deleted
      await expect(
        service.getProject(projectToDelete, testUserId)
      ).rejects.toThrow('Failed to fetch project');
    });
  });

  describe('listProjects', () => {
    it('should list user projects with pagination', async () => {
      // Create multiple projects
      const projects = await Promise.all([
        service.createProject(testUserId, {
          ...ServiceDeskDataManager.createEmptyData(),
          project: { ...ServiceDeskDataManager.createEmptyData().project, name: 'Project 1' }
        }),
        service.createProject(testUserId, {
          ...ServiceDeskDataManager.createEmptyData(),
          project: { ...ServiceDeskDataManager.createEmptyData().project, name: 'Project 2' }
        }),
        service.createProject(testUserId, {
          ...ServiceDeskDataManager.createEmptyData(),
          project: { ...ServiceDeskDataManager.createEmptyData().project, name: 'Project 3' }
        }),
      ]);

      const result = await service.listProjects(testUserId, 1, 2);

      expect(result.projects).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.pages).toBe(2);
      expect(result.pagination.page).toBe(1);

      // Cleanup
      await Promise.all(
        projects.map(p => service.deleteProject(p.project.id, testUserId))
      );
    });

    it('should return empty list for user with no projects', async () => {
      const result = await service.listProjects(testUserId);

      expect(result.projects).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('team management', () => {
    beforeEach(async () => {
      // Create a test project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Team Test Project';
      
      const created = await service.createProject(testUserId, testData);
      testProjectId = created.project.id;
    });

    it('should add team member', async () => {
      const memberData = {
        name: 'John Doe',
        role: 'Analista N1',
        level: 'Júnior',
        baseSalary: 3500,
        workingHours: 40,
        benefits: {
          valeTransporte: 200,
          valeAlimentacao: 500,
        },
      };

      const member = await service.addTeamMember(testProjectId, memberData);

      expect(member.name).toBe('John Doe');
      expect(member.role).toBe('Analista N1');
      expect(member.baseSalary).toBe(3500);
    });

    it('should update team member', async () => {
      // Add member first
      const memberData = {
        name: 'Jane Doe',
        role: 'Analista N2',
        baseSalary: 4500,
      };

      const member = await service.addTeamMember(testProjectId, memberData);

      // Update member
      const updatedData = {
        name: 'Jane Smith',
        role: 'Coordenador',
        baseSalary: 6000,
      };

      const updated = await service.updateTeamMember(member.id, updatedData);

      expect(updated.name).toBe('Jane Smith');
      expect(updated.role).toBe('Coordenador');
      expect(updated.baseSalary).toBe(6000);
    });

    it('should remove team member', async () => {
      // Add member first
      const memberData = {
        name: 'Temp Member',
        role: 'Analista N1',
        baseSalary: 3000,
      };

      const member = await service.addTeamMember(testProjectId, memberData);

      // Remove member
      const result = await service.removeTeamMember(member.id);
      expect(result.success).toBe(true);
    });
  });

  describe('forecast management', () => {
    beforeEach(async () => {
      // Create a test project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Forecast Test Project';
      
      const created = await service.createProject(testUserId, testData);
      testProjectId = created.project.id;
    });

    it('should save forecast data', async () => {
      const forecastData = {
        assumptions: {
          contractDuration: 24,
          inflationRate: 6.5,
          salaryAdjustment: 8.0,
        },
        scenarios: [
          {
            name: 'Test Scenario',
            description: 'Test scenario description',
            type: 'REALISTIC',
            probability: 50,
            assumptions: {
              revenueGrowth: 12,
              costInflation: 8,
            },
            isBaseline: true,
            color: '#3b82f6',
          },
        ],
      };

      const result = await service.saveForecast(testProjectId, forecastData);

      expect(result.projectId).toBe(testProjectId);
      expect(result.assumptions).toEqual(forecastData.assumptions);
    });
  });

  describe('budget management', () => {
    beforeEach(async () => {
      // Create a test project
      const testData = ServiceDeskDataManager.createEmptyData();
      testData.project.name = 'Budget Test Project';
      
      const created = await service.createProject(testUserId, testData);
      testProjectId = created.project.id;
    });

    it('should save budget data', async () => {
      const budgetData = {
        teamCosts: { total: 15000 },
        infrastructureCosts: 5000,
        otherCosts: 2000,
        taxes: { total: 4400 },
        totalCosts: 26400,
        margin: { type: 'percentage', value: 25 },
        totalPrice: 33000,
        monthlyBreakdown: [],
      };

      const result = await service.saveBudget(testProjectId, budgetData);

      expect(result.projectId).toBe(testProjectId);
      expect(result.teamCosts).toBe(15000);
      expect(result.totalPrice).toBe(33000);
    });
  });

  describe('analytics', () => {
    it('should get project analytics', async () => {
      // Create a few test projects
      await Promise.all([
        service.createProject(testUserId, {
          ...ServiceDeskDataManager.createEmptyData(),
          project: { ...ServiceDeskDataManager.createEmptyData().project, name: 'Analytics Project 1' }
        }),
        service.createProject(testUserId, {
          ...ServiceDeskDataManager.createEmptyData(),
          project: { ...ServiceDeskDataManager.createEmptyData().project, name: 'Analytics Project 2' }
        }),
      ]);

      const analytics = await service.getProjectAnalytics(testUserId, '30d');

      expect(analytics.totalProjects).toBeGreaterThanOrEqual(2);
      expect(analytics.timeframe).toBe('30d');
      expect(analytics.projectsByStatus).toBeDefined();
    });
  });
});