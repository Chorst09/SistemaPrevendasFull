'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Users, Lightbulb } from 'lucide-react';
import { NOCTeamMember, NOCCoverage, NOCServiceLevel } from '@/lib/types/noc-pricing';
import { Badge } from '@/components/ui/badge';
import { NOCCalculationEngine } from '@/lib/services/noc-calculation-engine';

interface TeamTabProps {
  team: NOCTeamMember[];
  teamSize: number;
  coverage: NOCCoverage;
  serviceLevel: NOCServiceLevel;
  deviceCount: number;
  onChange: (data: { team: NOCTeamMember[]; teamSize: number }) => void;
}

const ROLE_LABELS = {
  'analyst-l1': 'Analista L1',
  'analyst-l2': 'Analista L2',
  'analyst-l3': 'Analista L3',
  'engineer': 'Engenheiro',
  'coordinator': 'Coordenador',
  'manager': 'Gerente'
};

const SHIFT_LABELS = {
  'morning': 'Manhã',
  'afternoon': 'Tarde',
  'night': 'Noite',
  'rotating': 'Rotativo'
};

export function TeamTab({ team, teamSize, coverage, serviceLevel, deviceCount, onChange }: TeamTabProps) {
  const [editingMember, setEditingMember] = useState<NOCTeamMember | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);

  const handleAddMember = () => {
    const newMember: NOCTeamMember = {
      id: `member-${Date.now()}`,
      role: 'analyst-l1',
      name: '',
      monthlySalary: 5000,
      benefits: 1500,
      shift: 'morning',
      coverage: coverage,
      certifications: [],
      experienceYears: 0
    };
    setEditingMember(newMember);
  };

  const handleSaveMember = () => {
    if (!editingMember) return;

    const updatedTeam = team.find(m => m.id === editingMember.id)
      ? team.map(m => m.id === editingMember.id ? editingMember : m)
      : [...team, editingMember];

    onChange({
      team: updatedTeam,
      teamSize: updatedTeam.length
    });
    setEditingMember(null);
  };

  const handleDeleteMember = (id: string) => {
    const updatedTeam = team.filter(m => m.id !== id);
    onChange({
      team: updatedTeam,
      teamSize: updatedTeam.length
    });
  };

  const getRecommendedTeam = () => {
    return NOCCalculationEngine.calculateRecommendedTeamSize(deviceCount, coverage, serviceLevel);
  };

  const recommended = getRecommendedTeam();

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'analyst-l1': return 'default';
      case 'analyst-l2': return 'secondary';
      case 'analyst-l3': return 'outline';
      case 'engineer': return 'destructive';
      case 'coordinator': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo e Recomendação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tamanho da Equipe Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{teamSize}</p>
            <p className="text-sm text-gray-500 mt-1">membros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Equipe Recomendada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{recommended.total}</p>
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-1"
              onClick={() => setShowRecommendation(!showRecommendation)}
            >
              Ver detalhes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recomendação Detalhada */}
      {showRecommendation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Lightbulb className="h-5 w-5" />
              <span>Dimensionamento Recomendado</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{recommended.l1Analysts}</div>
                <div className="text-sm text-blue-700">Analistas L1</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{recommended.l2Analysts}</div>
                <div className="text-sm text-blue-700">Analistas L2</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{recommended.l3Analysts}</div>
                <div className="text-sm text-blue-700">Analistas L3</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{recommended.engineers}</div>
                <div className="text-sm text-blue-700">Engenheiros</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{recommended.coordinators}</div>
                <div className="text-sm text-blue-700">Coordenadores</div>
              </div>
            </div>
            <p className="text-sm text-blue-800 mt-4">
              Baseado em: {deviceCount} dispositivos, cobertura {coverage}, nível {serviceLevel}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Membros da Equipe</CardTitle>
            <Button onClick={handleAddMember} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum membro adicionado</p>
              <p className="text-sm">Clique em "Adicionar Membro" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{member.name}</h4>
                        <Badge variant={getRoleColor(member.role) as any}>
                          {ROLE_LABELS[member.role]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {SHIFT_LABELS[member.shift]} • R$ {member.monthlySalary.toLocaleString()} + R$ {member.benefits.toLocaleString()} benefícios
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingMember(member)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      {editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {team.find(m => m.id === editingMember.id) ? 'Editar' : 'Adicionar'} Membro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cargo *</Label>
                  <Select
                    value={editingMember.role}
                    onValueChange={(value: any) => setEditingMember({ ...editingMember, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Salário Mensal (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingMember.monthlySalary}
                    onChange={(e) => setEditingMember({ ...editingMember, monthlySalary: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Benefícios (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingMember.benefits}
                    onChange={(e) => setEditingMember({ ...editingMember, benefits: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Turno *</Label>
                  <Select
                    value={editingMember.shift}
                    onValueChange={(value: any) => setEditingMember({ ...editingMember, shift: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SHIFT_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Anos de Experiência</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingMember.experienceYears}
                    onChange={(e) => setEditingMember({ ...editingMember, experienceYears: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingMember(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveMember} disabled={!editingMember.name}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
