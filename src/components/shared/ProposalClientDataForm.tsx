'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Briefcase, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export interface ProposalClientData {
  // Dados do Cliente
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  companyName: string;
  cnpj: string;
  address: string;
  
  // Dados do Projeto
  projectName: string;
  projectType: string;
  projectDescription: string;
  deliveryDate: string;
  estimatedBudget: string;
  
  // Gerente de Contas
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  department: string;
}

interface ProposalClientDataFormProps {
  onSubmit: (data: ProposalClientData) => void;
  onBack: () => void;
  moduleType: 'noc' | 'service-desk' | 'printer';
  initialData?: Partial<ProposalClientData>;
}

const PROJECT_TYPES: Record<string, string[]> = {
  'noc': ['Monitoramento 24x7', 'NOC Gerenciado', 'Infraestrutura Crítica', 'Cloud Monitoring'],
  'service-desk': ['Service Desk N1', 'Service Desk N1/N2', 'Service Desk Completo', 'Suporte Técnico'],
  'printer': ['Outsourcing Completo', 'Locação de Equipamentos', 'Gestão de Impressão', 'Print as a Service']
};

export function ProposalClientDataForm({ onSubmit, onBack, moduleType, initialData }: ProposalClientDataFormProps) {
  const [formData, setFormData] = useState<ProposalClientData>({
    clientName: initialData?.clientName || '',
    clientEmail: initialData?.clientEmail || '',
    clientPhone: initialData?.clientPhone || '',
    companyName: initialData?.companyName || '',
    cnpj: initialData?.cnpj || '',
    address: initialData?.address || '',
    projectName: initialData?.projectName || '',
    projectType: initialData?.projectType || '',
    projectDescription: initialData?.projectDescription || '',
    deliveryDate: initialData?.deliveryDate || '',
    estimatedBudget: initialData?.estimatedBudget || '',
    managerName: initialData?.managerName || '',
    managerEmail: initialData?.managerEmail || '',
    managerPhone: initialData?.managerPhone || '',
    department: initialData?.department || ''
  });

  const handleChange = (field: keyof ProposalClientData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.clientName || !formData.companyName || !formData.projectName) {
      alert('Por favor, preencha os campos obrigatórios: Nome do Cliente, Empresa e Nome do Projeto');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Dados da Proposta</h1>
          <p className="text-gray-300">Preencha as informações para criar uma nova proposta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Dados do Cliente */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <User className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg">Dados do Cliente</div>
                    <div className="text-xs text-gray-400 font-normal">Informações do cliente para a proposta</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nome do Cliente *</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="CARLOS HORST"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Telefone *</Label>
                  <Input
                    value={formData.clientPhone}
                    onChange={(e) => handleChange('clientPhone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Empresa *</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Nome da empresa"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => handleChange('cnpj', e.target.value)}
                    placeholder="00.000.000/0000-00"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Endereço</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="Endereço completo da empresa"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dados do Projeto */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Briefcase className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg">Dados do Projeto</div>
                    <div className="text-xs text-gray-400 font-normal">Informações sobre o projeto a ser desenvolvido</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nome do Projeto *</Label>
                  <Input
                    value={formData.projectName}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    placeholder="CARLOS HORST"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Tipo de Projeto *</Label>
                  <Select value={formData.projectType} onValueChange={(value) => handleChange('projectType', value)}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPES[moduleType].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Descrição do Projeto *</Label>
                  <Textarea
                    value={formData.projectDescription}
                    onChange={(e) => handleChange('projectDescription', e.target.value)}
                    placeholder="Descreva detalhadamente o projeto"
                    className="bg-slate-900/50 border-slate-600 text-white min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Prazo de Entrega</Label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Orçamento Estimado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedBudget}
                    onChange={(e) => handleChange('estimatedBudget', e.target.value)}
                    placeholder="0,00"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gerente de Contas */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-lg">Gerente de Contas</div>
                    <div className="text-xs text-gray-400 font-normal">Responsável pela conta do cliente</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Nome do Gerente *</Label>
                  <Input
                    value={formData.managerName}
                    onChange={(e) => handleChange('managerName', e.target.value)}
                    placeholder="Nome completo do gerente"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">E-mail do Gerente *</Label>
                  <Input
                    type="email"
                    value={formData.managerEmail}
                    onChange={(e) => handleChange('managerEmail', e.target.value)}
                    placeholder="gerente@empresa.com"
                    className="bg-slate-900/50 border-slate-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Telefone do Gerente</Label>
                  <Input
                    value={formData.managerPhone}
                    onChange={(e) => handleChange('managerPhone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Departamento</Label>
                  <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                    <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="operacoes">Operações</SelectItem>
                      <SelectItem value="projetos">Projetos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão de Continuar */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
            >
              Continuar para Precificação
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
