import { ServiceDeskValidationEngine } from '../service-desk-validation-engine';

describe('Team Validation', () => {
  let validationEngine: ServiceDeskValidationEngine;

  beforeEach(() => {
    validationEngine = new ServiceDeskValidationEngine();
  });

  describe('New TeamMemberNew Structure', () => {
    it('should validate team with correct new structure', () => {
      const team = [
        {
          id: 'member-1',
          jobPositionId: 'pos-1',
          quantity: 2,
          workingHours: 8,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require jobPositionId', () => {
      const team = [
        {
          id: 'member-1',
          jobPositionId: '',
          quantity: 2,
          workingHours: 8,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team[0].jobPositionId',
          message: 'Cargo do membro 1 é obrigatório'
        })
      );
    });

    it('should require quantity greater than 0', () => {
      const team = [
        {
          id: 'member-1',
          jobPositionId: 'pos-1',
          quantity: 0,
          workingHours: 8,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team[0].quantity',
          message: 'Quantidade de pessoas do cargo 1 deve ser maior que zero'
        })
      );
    });

    it('should require valid working hours (6 or 8)', () => {
      const team = [
        {
          id: 'member-1',
          jobPositionId: 'pos-1',
          quantity: 2,
          workingHours: 10, // Invalid
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team[0].workingHours',
          message: 'Carga horária do cargo 1 deve ser 6 ou 8 horas'
        })
      );
    });
  });

  describe('Legacy TeamMember Structure (Compatibility)', () => {
    it('should validate legacy structure with name and role', () => {
      const team = [
        {
          id: 'member-1',
          name: 'João Silva',
          role: 'Analista N1',
          salary: 2000,
          workload: 40,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should require name in legacy structure', () => {
      const team = [
        {
          id: 'member-1',
          name: '',
          role: 'Analista N1',
          salary: 2000,
          workload: 40,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team[0].name',
          message: 'Nome do membro 1 é obrigatório'
        })
      );
    });

    it('should require role in legacy structure', () => {
      const team = [
        {
          id: 'member-1',
          name: 'João Silva',
          role: '',
          salary: 2000,
          workload: 40,
          isActive: true
        }
      ];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team[0].role',
          message: 'Cargo do membro 1 é obrigatório'
        })
      );
    });
  });

  describe('Empty Team', () => {
    it('should require at least one team member', () => {
      const team: any[] = [];

      const result = validationEngine.validateTeamConfiguration(team);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'team',
          message: 'Pelo menos um membro da equipe deve ser configurado'
        })
      );
    });
  });
});