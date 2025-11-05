'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users, 
  DollarSign,
  Clock,
  Briefcase,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useJobPositions } from '@/hooks/use-job-positions';

export interface JobPosition {
  id: string;
  name: string;
  level?: string;
  salary8h: number;
  salary6h?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobPositionsManagerProps {
  onPositionSelect?: (position: JobPosition) => void;
  selectedPositionId?: string;
  readOnly?: boolean;
}

const DEFAULT_POSITIONS: Omit<JobPosition, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Analista de Service Desk N1',
    level: 'N1',
    salary8h: 1780.00,
    salary6h: 1580.00,
    description: 'Analista responsável pelo primeiro nível de atendimento',
    isActive: true
  },
  {
    name: 'Analista de Service Desk N2',
    level: 'N2',
    salary8h: 2880.00,
    salary6h: undefined,
    description: 'Analista responsável pelo segundo nível de atendimento',
    isActive: true
  },
  {
    name: 'Analista de Service Desk N3',
    level: 'N3',
    salary8h: 7380.00,
    salary6h: undefined,
    description: 'Analista responsável pelo terceiro nível de atendimento',
    isActive: true
  },
  {
    name: 'Líder Técnico',
    level: 'Liderança',
    salary8h: 5200.00,
    salary6h: undefined,
    description: 'Líder técnico responsável pela coordenação da equipe técnica',
    isActive: true
  },
  {
    name: 'Coordenador',
    level: 'Gestão',
    salary8h: 9800.00,
    salary6h: undefined,
    description: 'Coordenador responsável pela gestão geral do projeto',
    isActive: true
  }
];

export function JobPositionsManager({ 
  onPositionSelect, 
  selectedPositionId, 
  readOnly = false 
}: JobPositionsManagerProps) {
  const {
    jobPositions: positions,
    isLoading,
    error,
    createJobPosition,
    updateJobPosition,
    deleteJobPosition,
    clearError
  } = useJobPositions();
  
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    salary8h: '',
    salary6h: '',
    description: ''
  });

  const handleEdit = (position: JobPosition) => {
    setEditingPosition(position);
    setFormData({
      name: position.name,
      level: position.level || '',
      salary8h: position.salary8h.toString(),
      salary6h: position.salary6h?.toString() || '',
      description: position.description || ''
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingPosition(null);
    setFormData({
      name: '',
      level: '',
      salary8h: '',
      salary6h: '',
      description: ''
    });
    setIsCreating(true);
  };

  const handleSave = async () => {
    try {
      const positionData = {
        name: formData.name,
        level: formData.level || undefined,
        salary8h: parseFloat(formData.salary8h),
        salary6h: formData.salary6h ? parseFloat(formData.salary6h) : undefined,
        description: formData.description || undefined
      };

      if (isCreating) {
        await createJobPosition(positionData);
      } else if (editingPosition) {
        await updateJobPosition(editingPosition.id, positionData);
      }

      // Reset form
      setEditingPosition(null);
      setIsCreating(false);
      setFormData({
        name: '',
        level: '',
        salary8h: '',
        salary6h: '',
        description: ''
      });
    } catch (err) {
      console.error('Error saving position:', err);
    }
  };

  const handleDelete = async (positionId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) {
      return;
    }

    try {
      await deleteJobPosition(positionId);
    } catch (err) {
      console.error('Error deleting position:', err);
    }
  };

  const handleCancel = () => {
    setEditingPosition(null);
    setIsCreating(false);
    setFormData({
      name: '',
      level: '',
      salary8h: '',
      salary6h: '',
      description: ''
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getLevelColor = (level?: string) => {
    switch (level) {
      case 'N1':
        return 'bg-blue-100 text-blue-800';
      case 'N2':
        return 'bg-green-100 text-green-800';
      case 'N3':
        return 'bg-purple-100 text-purple-800';
      case 'Liderança':
        return 'bg-orange-100 text-orange-800';
      case 'Gestão':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando cargos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span>Cargos e Salários</span>
          </h2>
          <p className="text-muted-foreground">
            Gerencie os cargos disponíveis e seus respectivos salários
          </p>
        </div>
        {!readOnly && (
          <Button onClick={handleCreate} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Novo Cargo</span>
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Fechar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingPosition) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Novo Cargo' : 'Editar Cargo'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cargo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Analista de Service Desk N1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Nível</Label>
                <Input
                  id="level"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: e.target.value }))}
                  placeholder="Ex: N1, N2, Liderança"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary8h">Salário 8 horas *</Label>
                <Input
                  id="salary8h"
                  type="number"
                  step="0.01"
                  value={formData.salary8h}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary8h: e.target.value }))}
                  placeholder="1780.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary6h">Salário 6 horas</Label>
                <Input
                  id="salary6h"
                  type="number"
                  step="0.01"
                  value={formData.salary6h}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary6h: e.target.value }))}
                  placeholder="1580.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição das responsabilidades do cargo"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Salvar</span>
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center space-x-2">
                <X className="h-4 w-4" />
                <span>Cancelar</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Positions List */}
      <div className="grid gap-4">
        {positions.map((position) => (
          <Card 
            key={position.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedPositionId === position.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onPositionSelect?.(position)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-lg">{position.name}</h3>
                    {position.level && (
                      <Badge className={getLevelColor(position.level)}>
                        {position.level}
                      </Badge>
                    )}
                  </div>
                  
                  {position.description && (
                    <p className="text-muted-foreground mb-3">{position.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">8h:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(position.salary8h)}
                      </span>
                    </div>
                    {position.salary6h && (
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">6h:</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(position.salary6h)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {!readOnly && (
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(position);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(position.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {positions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cargo cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre os cargos disponíveis para sua equipe
            </p>
            {!readOnly && (
              <Button onClick={handleCreate}>
                Cadastrar Primeiro Cargo
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Resumo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{positions.length}</div>
                <div className="text-sm text-muted-foreground">Total de Cargos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(Math.min(...positions.map(p => p.salary8h)))}
                </div>
                <div className="text-sm text-muted-foreground">Menor Salário</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(Math.max(...positions.map(p => p.salary8h)))}
                </div>
                <div className="text-sm text-muted-foreground">Maior Salário</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatCurrency(positions.reduce((sum, p) => sum + p.salary8h, 0) / positions.length)}
                </div>
                <div className="text-sm text-muted-foreground">Salário Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}