import { TeamMember, BenefitPackage } from '@/lib/types/service-desk-pricing';

export interface EmployeeProfile extends Omit<TeamMember, 'id'> {
  id: string;
  cpf: string;
  email: string;
  phone: string;
  hireDate: Date;
  department: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  notes: string;
}

export interface EmployeeSearchFilters {
  name?: string;
  role?: string;
  department?: string;
  isActive?: boolean;
  tags?: string[];
}

export class EmployeeRegistryService {
  private static instance: EmployeeRegistryService;
  private employees: Map<string, EmployeeProfile> = new Map();
  private readonly STORAGE_KEY = 'employee-registry';

  static getInstance(): EmployeeRegistryService {
    if (!EmployeeRegistryService.instance) {
      EmployeeRegistryService.instance = new EmployeeRegistryService();
    }
    return EmployeeRegistryService.instance;
  }

  constructor() {
    this.loadFromStorage();
  }

  // CRUD Operations
  async createEmployee(employeeData: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmployeeProfile> {
    const employee: EmployeeProfile = {
      ...employeeData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.employees.set(employee.id, employee);
    await this.saveToStorage();
    return employee;
  }

  async updateEmployee(id: string, updates: Partial<EmployeeProfile>): Promise<EmployeeProfile | null> {
    const employee = this.employees.get(id);
    if (!employee) return null;

    const updatedEmployee: EmployeeProfile = {
      ...employee,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    this.employees.set(id, updatedEmployee);
    await this.saveToStorage();
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const deleted = this.employees.delete(id);
    if (deleted) {
      await this.saveToStorage();
    }
    return deleted;
  }

  getEmployee(id: string): EmployeeProfile | null {
    return this.employees.get(id) || null;
  }

  getAllEmployees(): EmployeeProfile[] {
    return Array.from(this.employees.values());
  }

  getActiveEmployees(): EmployeeProfile[] {
    return this.getAllEmployees().filter(emp => emp.isActive);
  }

  // Search and Filter
  searchEmployees(filters: EmployeeSearchFilters): EmployeeProfile[] {
    let results = this.getAllEmployees();

    if (filters.name) {
      const searchTerm = filters.name.toLowerCase();
      results = results.filter(emp => 
        emp.name.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.role) {
      results = results.filter(emp => 
        emp.role.toLowerCase().includes(filters.role!.toLowerCase())
      );
    }

    if (filters.department) {
      results = results.filter(emp => 
        emp.department.toLowerCase().includes(filters.department!.toLowerCase())
      );
    }

    if (filters.isActive !== undefined) {
      results = results.filter(emp => emp.isActive === filters.isActive);
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(emp => 
        filters.tags!.some(tag => emp.tags.includes(tag))
      );
    }

    return results;
  }

  // Convert to TeamMember for use in projects
  convertToTeamMember(employee: EmployeeProfile): TeamMember {
    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      salary: employee.salary,
      benefits: employee.benefits,
      workload: employee.workload,
      costPerHour: employee.costPerHour
    };
  }

  // Bulk operations
  async importEmployees(employees: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<EmployeeProfile[]> {
    const imported: EmployeeProfile[] = [];
    
    for (const empData of employees) {
      const employee = await this.createEmployee(empData);
      imported.push(employee);
    }
    
    return imported;
  }

  exportEmployees(): EmployeeProfile[] {
    return this.getAllEmployees();
  }

  // Statistics
  getStatistics() {
    const all = this.getAllEmployees();
    const active = all.filter(emp => emp.isActive);
    
    const byDepartment = all.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRole = all.reduce((acc, emp) => {
      acc[emp.role] = (acc[emp.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: all.length,
      active: active.length,
      inactive: all.length - active.length,
      byDepartment,
      byRole,
      averageSalary: all.reduce((sum, emp) => sum + emp.salary, 0) / all.length || 0
    };
  }

  // Storage
  private async saveToStorage(): Promise<void> {
    try {
      const data = Array.from(this.employees.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving employees to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const entries: [string, EmployeeProfile][] = JSON.parse(data);
        this.employees = new Map(entries.map(([id, emp]) => [
          id,
          {
            ...emp,
            hireDate: new Date(emp.hireDate),
            createdAt: new Date(emp.createdAt),
            updatedAt: new Date(emp.updatedAt)
          }
        ]));
      }
    } catch (error) {
      console.error('Error loading employees from storage:', error);
      this.employees = new Map();
    }
  }

  // Validation
  validateEmployee(employee: Partial<EmployeeProfile>): string[] {
    const errors: string[] = [];

    if (!employee.name?.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!employee.role?.trim()) {
      errors.push('Cargo é obrigatório');
    }

    if (!employee.cpf?.trim()) {
      errors.push('CPF é obrigatório');
    } else if (!this.isValidCPF(employee.cpf)) {
      errors.push('CPF inválido');
    }

    if (!employee.email?.trim()) {
      errors.push('Email é obrigatório');
    } else if (!this.isValidEmail(employee.email)) {
      errors.push('Email inválido');
    }

    if (typeof employee.salary !== 'number' || employee.salary <= 0) {
      errors.push('Salário deve ser um valor positivo');
    }

    return errors;
  }

  private isValidCPF(cpf: string): boolean {
    // Remove non-digits
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // All same digits
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit1 = 11 - (sum % 11);
    if (digit1 > 9) digit1 = 0;
    
    if (parseInt(cpf[9]) !== digit1) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    let digit2 = 11 - (sum % 11);
    if (digit2 > 9) digit2 = 0;
    
    return parseInt(cpf[10]) === digit2;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}