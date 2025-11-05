'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Filter,
  Download,
  Upload,
  UserCheck,
  UserX,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { EmployeeRegistryService, EmployeeProfile, EmployeeSearchFilters } from '@/lib/services/employee-registry-service';
import { BenefitPackage } from '@/lib/types/service-desk-pricing';

interface EmployeeRegistryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee?: (employee: EmployeeProfile) => void;
  selectionMode?: boolean;
}

const defaultBenefits: BenefitPackage = {
  healthInsurance: 300,
  mealVoucher: 400,
  transportVoucher: 200,
  lifeInsurance: 50,
  vacation: 8.33,
  thirteenthSalary: 8.33,
  fgts: 8,
  inss: 11,
  otherBenefits: []
};

export function EmployeeRegistryManager({ 
  isOpen, 
  onClose, 
  onSelectEmployee,
  selectionMode = false 
}: EmployeeRegistryManagerProps) {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EmployeeSearchFilters>({});
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  const employeeService = EmployeeRegistryService.getInstance();

  // Load employees
  const loadEmployees = useCallback(() => {
    const allEmployees = employeeService.getAllEmployees();
    setEmployees(allEmployees);
    setStatistics(employeeService.getStatistics());
  }, [employeeService]);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, loadEmployees]);

  // Filter employees
  useEffect(() => {
    let filtered = employees;

    if (searchTerm) {
      filtered = employeeService.searchEmployees({ 
        ...filters, 
        name: searchTerm 
      });
    } else {
      filtered = employeeService.searchEmployees(filters);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchTerm, filters, employeeService]);

  const handleAddEmployee = async (employeeData: Omit<EmployeeProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      await employeeService.createEmployee(employeeData);
      loadEmployees();
      setShowAddDialog(false);
    } catch (error) {
      console.error('Error adding employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmployee = async (id: string, updates: Partial<EmployeeProfile>) => {
    setIsLoading(true);
    try {
      await employeeService.updateEmployee(id, updates);
      loadEmployees();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error updating employee:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este funcionário?')) {
      setIsLoading(true);
      try {
        await employeeService.deleteEmployee(id);
        loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectEmployee = (employee: EmployeeProfile) => {
    if (selectionMode && onSelectEmployee) {
      onSelectEmployee(employee);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Users className="text-blue-500" size={24} />
            <div>
              <h2 className="text-xl font-semibold">
                {selectionMode ? 'Selecionar Funcionário' : 'Cadastro de Funcionários'}
              </h2>
              <p className="text-sm text-gray-600">
                {selectionMode 
                  ? 'Escolha um funcionário para adicionar à equipe'
                  : 'Gerencie o cadastro de funcionários da empresa'
                }
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="list" className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4">
              <TabsTrigger value="list">Lista de Funcionários</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="flex-1 overflow-hidden px-6 pb-6">
              {/* Search and Filters */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <Input
                    placeholder="Buscar funcionários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={filters.department || 'all'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, department: value === 'all' ? undefined : value }))
                }>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Service Desk">Service Desk</SelectItem>
                    <SelectItem value="Suporte">Suporte</SelectItem>
                    <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.isActive?.toString() || 'all'} onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, isActive: value === 'all' ? undefined : value === 'true' }))
                }>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="true">Ativo</SelectItem>
                    <SelectItem value="false">Inativo</SelectItem>
                  </SelectContent>
                </Select>

                {!selectionMode && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus size={16} className="mr-2" />
                    Novo Funcionário
                  </Button>
                )}
              </div>

              {/* Employee List */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onEdit={!selectionMode ? () => setEditingEmployee(employee) : undefined}
                      onDelete={!selectionMode ? () => handleDeleteEmployee(employee.id) : undefined}
                      onSelect={selectionMode ? () => handleSelectEmployee(employee) : undefined}
                      selectionMode={selectionMode}
                    />
                  ))}
                </div>

                {filteredEmployees.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum funcionário encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || Object.keys(filters).length > 0
                        ? 'Tente ajustar os filtros de busca'
                        : 'Comece adicionando o primeiro funcionário'
                      }
                    </p>
                    {!selectionMode && (
                      <Button onClick={() => setShowAddDialog(true)}>
                        <Plus size={16} className="mr-2" />
                        Adicionar Funcionário
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="stats" className="flex-1 overflow-y-auto px-6 pb-6">
              {statistics && <StatisticsView statistics={statistics} />}
            </TabsContent>
          </Tabs>
        </div>

        {/* Add/Edit Employee Dialog */}
        <EmployeeFormDialog
          isOpen={showAddDialog || !!editingEmployee}
          onClose={() => {
            setShowAddDialog(false);
            setEditingEmployee(null);
          }}
          employee={editingEmployee}
          onSave={editingEmployee 
            ? (data) => handleEditEmployee(editingEmployee.id, data)
            : handleAddEmployee
          }
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}

// Employee Card Component
interface EmployeeCardProps {
  employee: EmployeeProfile;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  selectionMode?: boolean;
}

function EmployeeCard({ employee, onEdit, onDelete, onSelect, selectionMode }: EmployeeCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200",
      selectionMode ? "cursor-pointer hover:shadow-md hover:border-blue-300" : ""
    )} onClick={selectionMode ? onSelect : undefined}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-white font-medium",
              employee.isActive ? "bg-green-500" : "bg-gray-400"
            )}>
              {employee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium">{employee.name}</h3>
              <p className="text-sm text-gray-600">{employee.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {employee.isActive ? (
              <Badge variant="default" className="text-xs">Ativo</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Inativo</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Building size={14} />
            <span>{employee.department}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Mail size={14} />
            <span>{employee.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DollarSign size={14} />
            <span>R$ {employee.salary.toLocaleString('pt-BR')}</span>
          </div>
        </div>

        {!selectionMode && (
          <div className="flex items-center space-x-2 mt-4">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit size={14} className="mr-1" />
              Editar
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 size={14} className="mr-1" />
              Excluir
            </Button>
          </div>
        )}

        {selectionMode && (
          <div className="mt-4">
            <Button className="w-full" size="sm">
              Selecionar Funcionário
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Statistics View Component
function StatisticsView({ statistics }: { statistics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Salário Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {statistics.averageSalary.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Por Departamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statistics.byDepartment).map(([dept, count]) => (
                <div key={dept} className="flex justify-between items-center">
                  <span>{dept}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por Cargo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(statistics.byRole).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span>{role}</span>
                  <Badge variant="outline">{count as number}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Employee Form Dialog Component
interface EmployeeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: EmployeeProfile | null;
  onSave: (data: any) => void;
  isLoading: boolean;
}

function EmployeeFormDialog({ isOpen, onClose, employee, onSave, isLoading }: EmployeeFormDialogProps) {
  const [formData, setFormData] = useState<Partial<EmployeeProfile>>({
    name: '',
    role: '',
    cpf: '',
    email: '',
    phone: '',
    department: '',
    salary: 0,
    benefits: defaultBenefits,
    workload: 40,
    isActive: true,
    tags: [],
    notes: ''
  });
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        name: '',
        role: '',
        cpf: '',
        email: '',
        phone: '',
        department: '',
        salary: 0,
        benefits: defaultBenefits,
        workload: 40,
        isActive: true,
        tags: [],
        notes: ''
      });
    }
    setErrors([]);
  }, [employee, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const employeeService = EmployeeRegistryService.getInstance();
    const validationErrors = employeeService.validateEmployee(formData);
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="role">Cargo *</Label>
              <Input
                id="role"
                value={formData.role || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ex: Analista de Service Desk N1"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@empresa.com"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="department">Departamento</Label>
              <Select value={formData.department || ''} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, department: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TI">TI</SelectItem>
                  <SelectItem value="Service Desk">Service Desk</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                  <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="salary">Salário Mensal *</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="workload">Carga Horária Semanal</Label>
              <Input
                id="workload"
                type="number"
                value={formData.workload || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, workload: Number(e.target.value) }))}
                placeholder="40"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label>Funcionário ativo</Label>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}