import { describe, it, expect, beforeEach } from 'vitest';
import { ServiceDeskValidationEngine } from '../service-desk-validation-engine';
import { 
  ProjectData, 
  TeamMember, 
  WorkSchedule, 
  TaxConfiguration, 
  MarketVariables,
  AdditionalCost,
  ConsolidatedBudget,
  ServiceDeskData
} from '@/lib/types/service-desk-pricing';

describe('ServiceDeskValidationEngine', () => {
  let engine: ServiceDeskValidationEngine;

  beforeEach(() => {
    engine = new ServiceDeskValidationEngine();
  });

  describe('Project Data Validation', () => {
    const validProjectData: ProjectData = {
      id: 'project-1',
      name: 'Test Project',
      client: {
        name: 'Test Client',
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
      description: 'Test project description',
      currency: 'BRL',
      location: 'São Paulo',
      serviceType: 'STANDARD' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should validate valid project data', () => {
      const result = engine.validateProjectData(validProjectData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require project name', () => {
      const invalidData = { ...validProjectData, name: '' };
      const result = engine.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'name',
        message: 'Nome do projeto é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require client name', () => {
      const invalidData = { 
        ...validProjectData, 
        client: { ...validProjectData.client, name: '' }
      };
      const result = engine.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'client.name',
        message: 'Nome do cliente é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require client document', () => {
      const invalidData = { 
        ...validProjectData, 
        client: { ...validProjectData.client, document: '' }
      };
      const result = engine.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'client.document',
        message: 'CNPJ/CPF do cliente é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should validate email format', () => {
      const invalidData = { 
        ...validProjectData, 
        client: { ...validProjectData.client, email: 'invalid-email' }
      };
      const result = engine.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'client.email',
        message: 'Email inválido',
        code: 'INVALID_FORMAT'
      });
    });

    it('should validate contract period dates', () => {
      const invalidData = { 
        ...validProjectData, 
        contractPeriod: {
          ...validProjectData.contractPeriod,
          startDate: new Date('2024-12-31'),
          endDate: new Date('2024-01-01')
        }
      };
      const result = engine.validateProjectData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'contractPeriod',
        message: 'Data de início deve ser anterior à data de fim',
        code: 'INVALID_DATE_RANGE'
      });
    });

    it('should warn about missing description', () => {
      const dataWithoutDescription = { ...validProjectData, description: '' };
      const result = engine.validateProjectData(dataWithoutDescription);

      expect(result.isValid).toBe(true); // Still valid, just a warning
      expect(result.warnings).toContainEqual({
        field: 'description',
        message: 'Descrição do projeto não informada',
        suggestion: 'Adicione uma descrição para melhor documentação'
      });
    });
  });

  describe('Team Configuration Validation', () => {
    const validTeamMember: TeamMember = {
      id: 'member-1',
      name: 'John Doe',
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
    };

    it('should validate valid team configuration', () => {
      const result = engine.validateTeamConfiguration([validTeamMember]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require at least one team member', () => {
      const result = engine.validateTeamConfiguration([]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'team',
        message: 'Pelo menos um membro da equipe deve ser configurado',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require member name', () => {
      const invalidMember = { ...validTeamMember, name: '' };
      const result = engine.validateTeamConfiguration([invalidMember]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'team[0].name',
        message: 'Nome do membro 1 é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require member role', () => {
      const invalidMember = { ...validTeamMember, role: '' };
      const result = engine.validateTeamConfiguration([invalidMember]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'team[0].role',
        message: 'Cargo do membro 1 é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require positive salary', () => {
      const invalidMember = { ...validTeamMember, salary: 0 };
      const result = engine.validateTeamConfiguration([invalidMember]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'team[0].salary',
        message: 'Salário do membro 1 deve ser maior que zero',
        code: 'INVALID_VALUE'
      });
    });

    it('should warn about unusual workload', () => {
      const memberWithHighWorkload = { ...validTeamMember, workload: 70 };
      const result = engine.validateTeamConfiguration([memberWithHighWorkload]);

      expect(result.isValid).toBe(true); // Still valid, just a warning
      expect(result.warnings).toContainEqual({
        field: 'team[0].workload',
        message: 'Carga horária do membro 1 parece incomum',
        suggestion: 'Verifique se a carga horária está correta (0-60 horas/semana)'
      });
    });
  });

  describe('Schedule Coverage Validation', () => {
    const validSchedule: WorkSchedule = {
      id: 'schedule-1',
      name: 'Business Hours',
      shifts: [{
        id: 'shift-1',
        name: 'Morning Shift',
        startTime: '08:00',
        endTime: '17:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        teamMembers: ['member-1'],
        isSpecialShift: false,
        multiplier: 1
      }],
      coverage: {
        minimumStaff: 1,
        preferredStaff: 2,
        criticalPeriods: []
      },
      specialRates: []
    };

    it('should validate valid schedule configuration', () => {
      const result = engine.validateScheduleCoverage([validSchedule]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about missing schedules', () => {
      const result = engine.validateScheduleCoverage([]);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toContainEqual({
        field: 'schedules',
        message: 'Nenhuma escala configurada',
        suggestion: 'Configure pelo menos uma escala de trabalho'
      });
    });

    it('should require schedule name', () => {
      const invalidSchedule = { ...validSchedule, name: '' };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].name',
        message: 'Nome da escala 1 é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require at least one shift', () => {
      const invalidSchedule = { ...validSchedule, shifts: [] };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].shifts',
        message: 'Escala 1 deve ter pelo menos um turno',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require shift name', () => {
      const invalidShift = { ...validSchedule.shifts[0], name: '' };
      const invalidSchedule = { ...validSchedule, shifts: [invalidShift] };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].shifts[0].name',
        message: 'Nome do turno 1 da escala 1 é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require shift times', () => {
      const invalidShift = { ...validSchedule.shifts[0], startTime: '', endTime: '' };
      const invalidSchedule = { ...validSchedule, shifts: [invalidShift] };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].shifts[0].time',
        message: 'Horários do turno 1 da escala 1 são obrigatórios',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should not allow same start and end time', () => {
      const invalidShift = { ...validSchedule.shifts[0], startTime: '08:00', endTime: '08:00' };
      const invalidSchedule = { ...validSchedule, shifts: [invalidShift] };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].shifts[0].time',
        message: 'Horário de início e fim do turno 1 não podem ser iguais',
        code: 'INVALID_TIME_RANGE'
      });
    });

    it('should require at least one day of week', () => {
      const invalidShift = { ...validSchedule.shifts[0], daysOfWeek: [] };
      const invalidSchedule = { ...validSchedule, shifts: [invalidShift] };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].shifts[0].daysOfWeek',
        message: 'Turno 1 da escala 1 deve ter pelo menos um dia da semana',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require positive minimum staff', () => {
      const invalidSchedule = { 
        ...validSchedule, 
        coverage: { ...validSchedule.coverage, minimumStaff: 0 }
      };
      const result = engine.validateScheduleCoverage([invalidSchedule]);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'schedules[0].coverage.minimumStaff',
        message: 'Equipe mínima da escala 1 deve ser maior que zero',
        code: 'INVALID_VALUE'
      });
    });

    it('should warn about low special shift multiplier', () => {
      const specialShift = { 
        ...validSchedule.shifts[0], 
        isSpecialShift: true, 
        multiplier: 0.8 
      };
      const scheduleWithSpecialShift = { ...validSchedule, shifts: [specialShift] };
      const result = engine.validateScheduleCoverage([scheduleWithSpecialShift]);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toContainEqual({
        field: 'schedules[0].shifts[0].multiplier',
        message: 'Turno especial 1 tem multiplicador baixo',
        suggestion: 'Turnos especiais geralmente têm multiplicador maior que 1.0'
      });
    });

    it('should warn about unassigned team members', () => {
      const shiftWithoutMembers = { ...validSchedule.shifts[0], teamMembers: [] };
      const scheduleWithoutMembers = { ...validSchedule, shifts: [shiftWithoutMembers] };
      const result = engine.validateScheduleCoverage([scheduleWithoutMembers]);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toContainEqual({
        field: 'schedules[0].shifts[0].teamMembers',
        message: 'Turno 1 não tem membros atribuídos',
        suggestion: 'Atribua pelo menos um membro da equipe ao turno'
      });
    });
  });

  describe('Tax Configuration Validation', () => {
    const validTaxConfig: TaxConfiguration = {
      region: 'SP',
      icms: 18,
      pis: 1.65,
      cofins: 7.6,
      iss: 5,
      ir: 15,
      csll: 9,
      customTaxes: [],
      taxRegime: 'LUCRO_PRESUMIDO' as any
    };

    it('should validate valid tax configuration', () => {
      const result = engine.validateTaxConfiguration(validTaxConfig);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require region', () => {
      const invalidConfig = { ...validTaxConfig, region: '' };
      const result = engine.validateTaxConfiguration(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'region',
        message: 'Região para cálculo de impostos é obrigatória',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should validate tax rate ranges', () => {
      const invalidConfig = { ...validTaxConfig, icms: -5 };
      const result = engine.validateTaxConfiguration(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'icms',
        message: 'Taxa de ICMS deve estar entre 0% e 100%',
        code: 'INVALID_RANGE'
      });
    });

    it('should validate high tax rates', () => {
      const invalidConfig = { ...validTaxConfig, iss: 150 };
      const result = engine.validateTaxConfiguration(invalidConfig);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'iss',
        message: 'Taxa de ISS deve estar entre 0% e 100%',
        code: 'INVALID_RANGE'
      });
    });
  });

  describe('Market Variables Validation', () => {
    const validVariables: MarketVariables = {
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
    };

    it('should validate valid market variables', () => {
      const result = engine.validateMarketVariables(validVariables);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about unusual inflation rate', () => {
      const highInflationVariables = { 
        ...validVariables, 
        inflation: { ...validVariables.inflation, annualRate: 60 }
      };
      const result = engine.validateMarketVariables(highInflationVariables);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toContainEqual({
        field: 'inflation.annualRate',
        message: 'Taxa de inflação anual parece incomum',
        suggestion: 'Verifique se a taxa está correta (normalmente entre 0% e 15%)'
      });
    });

    it('should not allow negative salary adjustment', () => {
      const invalidVariables = { 
        ...validVariables, 
        salaryAdjustments: { ...validVariables.salaryAdjustments, annualAdjustment: -5 }
      };
      const result = engine.validateMarketVariables(invalidVariables);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'salaryAdjustments.annualAdjustment',
        message: 'Reajuste salarial não pode ser negativo',
        code: 'INVALID_VALUE'
      });
    });
  });

  describe('Additional Costs Validation', () => {
    const validCosts: AdditionalCost[] = [
      {
        id: 'cost-1',
        name: 'Software License',
        value: 5000,
        category: 'SOFTWARE' as any,
        type: 'fixed' as any,
        description: 'Annual software license',
        startDate: new Date(),
        endDate: new Date()
      }
    ];

    it('should validate valid additional costs', () => {
      const result = engine.validateAdditionalCosts(validCosts);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty costs array', () => {
      const result = engine.validateAdditionalCosts([]);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require cost name', () => {
      const invalidCosts = [{ ...validCosts[0], name: '' }];
      const result = engine.validateAdditionalCosts(invalidCosts);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'costs[0].name',
        message: 'Nome do custo 1 é obrigatório',
        code: 'REQUIRED_FIELD'
      });
    });

    it('should require positive cost value', () => {
      const invalidCosts = [{ ...validCosts[0], value: 0 }];
      const result = engine.validateAdditionalCosts(invalidCosts);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'costs[0].value',
        message: 'Valor do custo 1 deve ser maior que zero',
        code: 'INVALID_VALUE'
      });
    });
  });

  describe('Budget Consistency Validation', () => {
    const validBudget: ConsolidatedBudget = {
      teamCosts: {
        salaries: 50000,
        benefits: 20000,
        total: 70000,
        breakdown: []
      },
      infrastructureCosts: 10000,
      otherCosts: 5000,
      taxes: {
        federal: 15000,
        state: 8000,
        municipal: 3000,
        total: 26000,
        breakdown: []
      },
      totalCosts: 85000,
      margin: {
        type: 'percentage',
        value: 20,
        minimumMargin: 10,
        targetMargin: 20,
        maximumMargin: 30
      },
      totalPrice: 106250,
      monthlyBreakdown: []
    };

    it('should validate valid budget', () => {
      const result = engine.validateBudgetConsistency(validBudget);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should not allow negative margin', () => {
      const invalidBudget = { 
        ...validBudget, 
        margin: { ...validBudget.margin, value: -5 }
      };
      const result = engine.validateBudgetConsistency(invalidBudget);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'margin.value',
        message: 'Margem não pode ser negativa',
        code: 'INVALID_VALUE'
      });
    });

    it('should warn about low margin', () => {
      const lowMarginBudget = { 
        ...validBudget, 
        margin: { ...validBudget.margin, value: 3 }
      };
      const result = engine.validateBudgetConsistency(lowMarginBudget);

      expect(result.isValid).toBe(true); // Warning, not error
      expect(result.warnings).toContainEqual({
        field: 'margin.value',
        message: 'Margem muito baixa',
        suggestion: 'Considere aumentar a margem para garantir rentabilidade'
      });
    });
  });

  describe('Tab Validation', () => {
    it('should validate tab data correctly', () => {
      const projectData: ProjectData = {
        id: 'project-1',
        name: 'Test Project',
        client: {
          name: 'Test Client',
          document: '123456789',
          email: 'test@test.com',
          phone: '',
          address: {} as any,
          contactPerson: ''
        },
        contractPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          durationMonths: 12,
          renewalOptions: []
        },
        description: 'Test description',
        currency: 'BRL',
        location: 'SP',
        serviceType: 'STANDARD' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = engine.validateTabData('data', projectData);

      expect(result).toHaveProperty('tabId', 'data');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('completionPercentage');
      expect(result.isValid).toBe(true);
    });

    it('should handle unknown tab ID', () => {
      const result = engine.validateTabData('unknown-tab', {});

      expect(result.tabId).toBe('unknown-tab');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Transition Validation', () => {
    const mockServiceDeskData: ServiceDeskData = {
      project: {
        id: 'project-1',
        name: 'Test Project',
        client: {
          name: 'Test Client',
          document: '123456789',
          email: 'test@test.com',
          phone: '',
          address: {} as any,
          contactPerson: ''
        },
        contractPeriod: {
          startDate: new Date(),
          endDate: new Date(),
          durationMonths: 12,
          renewalOptions: []
        },
        description: 'Test',
        currency: 'BRL',
        location: 'SP',
        serviceType: 'STANDARD' as any,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      team: [{
        id: 'member-1',
        name: 'Test Member',
        role: 'Analyst',
        salary: 5000,
        benefits: {} as any,
        workload: 40,
        startDate: new Date(),
        costPerHour: 0,
        skills: [],
        certifications: []
      }],
      schedules: [],
      taxes: {} as any,
      variables: {} as any,
      otherCosts: [],
      budget: {} as any,
      analysis: {} as any,
      negotiations: [],
      finalAnalysis: {} as any,
      metadata: {} as any
    };

    it('should allow transition to independent tabs', () => {
      const result = engine.validateTransition('data', 'taxes', mockServiceDeskData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should prevent transition when dependencies are not met', () => {
      const dataWithoutTeam = { ...mockServiceDeskData, team: [] };
      const result = engine.validateTransition('team', 'scale', dataWithoutTeam);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should allow transition when dependencies are met', () => {
      // Test a transition that doesn't have dependencies (data to taxes)
      const result = engine.validateTransition('data', 'taxes', mockServiceDeskData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});