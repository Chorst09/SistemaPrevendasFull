'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Server, HardDrive, Network, Package, Shield, Database } from 'lucide-react';
import { NOCOperationalCosts, InfrastructureItem, SoftwareLicenseItem } from '@/lib/types/noc-pricing';
import { Badge } from '@/components/ui/badge';

interface CostsTabProps {
  data: NOCOperationalCosts;
  onChange: (data: NOCOperationalCosts) => void;
}

const INFRASTRUCTURE_TYPE_ICONS: Record<string, any> = {
  server: Server,
  storage: HardDrive,
  network: Network,
  other: Package
};

const INFRASTRUCTURE_TYPE_LABELS: Record<string, string> = {
  server: 'Servidor',
  storage: 'Storage',
  network: 'Rede',
  other: 'Outro'
};

const SOFTWARE_TYPE_ICONS: Record<string, any> = {
  monitoring: Server,
  integration: Network,
  security: Shield,
  backup: Database,
  other: Package
};

const SOFTWARE_TYPE_LABELS: Record<string, string> = {
  monitoring: 'Monitoramento',
  integration: 'Integração',
  security: 'Segurança',
  backup: 'Backup',
  other: 'Outro'
};

export function CostsTab({ data, onChange }: CostsTabProps) {
  const [editingInfra, setEditingInfra] = useState<InfrastructureItem | null>(null);
  const [editingSoftware, setEditingSoftware] = useState<SoftwareLicenseItem | null>(null);

  // Inicializar arrays se não existirem
  const infrastructureItems = data.infrastructureItems || [];
  const softwareLicenseItems = data.softwareLicenseItems || [];

  const handleChange = (field: keyof NOCOperationalCosts, value: number) => {
    onChange({ ...data, [field]: value });
  };

  // Infraestrutura
  const handleAddInfrastructure = () => {
    const newItem: InfrastructureItem = {
      id: `infra-${Date.now()}`,
      name: '',
      type: 'server',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      description: ''
    };
    setEditingInfra(newItem);
  };

  const handleSaveInfrastructure = () => {
    if (!editingInfra || !editingInfra.name) return;

    const updatedItem = {
      ...editingInfra,
      totalCost: editingInfra.quantity * editingInfra.unitCost
    };

    const updatedItems = infrastructureItems.find(i => i.id === updatedItem.id)
      ? infrastructureItems.map(i => i.id === updatedItem.id ? updatedItem : i)
      : [...infrastructureItems, updatedItem];

    updateInfrastructureTotals(updatedItems);
    setEditingInfra(null);
  };

  const handleDeleteInfrastructure = (id: string) => {
    const updatedItems = infrastructureItems.filter(i => i.id !== id);
    updateInfrastructureTotals(updatedItems);
  };

  const updateInfrastructureTotals = (items: InfrastructureItem[]) => {
    const serverCosts = items.filter(i => i.type === 'server').reduce((sum, i) => sum + i.totalCost, 0);
    const storageCosts = items.filter(i => i.type === 'storage').reduce((sum, i) => sum + i.totalCost, 0);
    const networkCosts = items.filter(i => i.type === 'network').reduce((sum, i) => sum + i.totalCost, 0);

    onChange({
      ...data,
      infrastructureItems: items,
      serverCosts,
      storageCosts,
      networkCosts
    });
  };

  // Software e Licenças
  const handleAddSoftware = () => {
    const newItem: SoftwareLicenseItem = {
      id: `soft-${Date.now()}`,
      name: '',
      type: 'monitoring',
      quantity: 1,
      unitCost: 0,
      totalCost: 0,
      vendor: '',
      licenseType: 'per-device',
      description: ''
    };
    setEditingSoftware(newItem);
  };

  const handleSaveSoftware = () => {
    if (!editingSoftware || !editingSoftware.name) return;

    const updatedItem = {
      ...editingSoftware,
      totalCost: editingSoftware.quantity * editingSoftware.unitCost
    };

    const updatedItems = softwareLicenseItems.find(i => i.id === updatedItem.id)
      ? softwareLicenseItems.map(i => i.id === updatedItem.id ? updatedItem : i)
      : [...softwareLicenseItems, updatedItem];

    updateSoftwareTotals(updatedItems);
    setEditingSoftware(null);
  };

  const handleDeleteSoftware = (id: string) => {
    const updatedItems = softwareLicenseItems.filter(i => i.id !== id);
    updateSoftwareTotals(updatedItems);
  };

  const updateSoftwareTotals = (items: SoftwareLicenseItem[]) => {
    const monitoringLicenses = items.filter(i => i.type === 'monitoring').reduce((sum, i) => sum + i.totalCost, 0);
    const integrationCosts = items.filter(i => i.type === 'integration').reduce((sum, i) => sum + i.totalCost, 0);

    onChange({
      ...data,
      softwareLicenseItems: items,
      monitoringLicenses,
      integrationCosts
    });
  };

  const totalInfrastructure = (data.serverCosts || 0) + (data.storageCosts || 0) + (data.networkCosts || 0);
  const totalSoftware = (data.monitoringLicenses || 0) + (data.integrationCosts || 0);
  const totalCosts = totalInfrastructure + totalSoftware + (data.facilityCosts || 0) + (data.utilitiesCosts || 0) + 
                     (data.trainingCosts || 0) + (data.certificationCosts || 0) + (data.contingencyCosts || 0);

  return (
    <div className="space-y-6">
      {/* Infraestrutura */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Infraestrutura</CardTitle>
            <Button onClick={handleAddInfrastructure} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {infrastructureItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum item de infraestrutura adicionado</p>
              <p className="text-sm">Clique em "Adicionar Item" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {infrastructureItems.map(item => {
                const Icon = INFRASTRUCTURE_TYPE_ICONS[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Icon className="h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant="outline">{INFRASTRUCTURE_TYPE_LABELS[item.type]}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.quantity} unidade(s) × R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = 
                          <span className="font-semibold text-blue-600 ml-1">
                            R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingInfra(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteInfrastructure(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Totais de Infraestrutura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Servidores</p>
              <p className="text-lg font-bold text-blue-600">
                R$ {(data.serverCosts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Storage</p>
              <p className="text-lg font-bold text-purple-600">
                R$ {(data.storageCosts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Rede</p>
              <p className="text-lg font-bold text-green-600">
                R$ {(data.networkCosts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Software e Licenças */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Software e Licenças</CardTitle>
            <Button onClick={handleAddSoftware} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Licença
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {softwareLicenseItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma licença adicionada</p>
              <p className="text-sm">Clique em "Adicionar Licença" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {softwareLicenseItems.map(item => {
                const Icon = SOFTWARE_TYPE_ICONS[item.type];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Icon className="h-6 w-6 text-green-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{item.name}</h4>
                          <Badge variant="outline">{SOFTWARE_TYPE_LABELS[item.type]}</Badge>
                          {item.vendor && <Badge variant="secondary">{item.vendor}</Badge>}
                        </div>
                        <p className="text-sm text-gray-500">
                          {item.quantity} licença(s) × R$ {item.unitCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = 
                          <span className="font-semibold text-green-600 ml-1">
                            R$ {item.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSoftware(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSoftware(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Totais de Software */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Licenças de Monitoramento</p>
              <p className="text-lg font-bold text-green-600">
                R$ {(data.monitoringLicenses || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Integrações</p>
              <p className="text-lg font-bold text-cyan-600">
                R$ {(data.integrationCosts || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilities */}
      <Card>
        <CardHeader>
          <CardTitle>Facilities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Espaço Físico (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.facilityCosts || 0}
                onChange={(e) => handleChange('facilityCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Energia e Refrigeração (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.utilitiesCosts || 0}
                onChange={(e) => handleChange('utilitiesCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treinamento e Desenvolvimento */}
      <Card>
        <CardHeader>
          <CardTitle>Treinamento e Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Treinamento (R$/ano)</Label>
              <Input
                type="number"
                min="0"
                value={data.trainingCosts || 0}
                onChange={(e) => handleChange('trainingCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Certificações (R$/ano)</Label>
              <Input
                type="number"
                min="0"
                value={data.certificationCosts || 0}
                onChange={(e) => handleChange('certificationCosts', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Contingência (R$/mês)</Label>
              <Input
                type="number"
                min="0"
                value={data.contingencyCosts || 0}
                onChange={(e) => handleChange('contingencyCosts', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Custos */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Infraestrutura</p>
                <p className="text-lg font-bold text-blue-600">
                  R$ {totalInfrastructure.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Software</p>
                <p className="text-lg font-bold text-green-600">
                  R$ {totalSoftware.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Facilities</p>
                <p className="text-lg font-bold text-purple-600">
                  R$ {((data.facilityCosts || 0) + (data.utilitiesCosts || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Outros</p>
                <p className="text-lg font-bold text-orange-600">
                  R$ {((data.trainingCosts || 0) + (data.certificationCosts || 0) + (data.contingencyCosts || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="text-center pt-4 border-t">
              <div className="text-sm text-gray-500 mb-2">Total de Custos Operacionais</div>
              <div className="text-4xl font-bold text-blue-600">
                R$ {totalCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-sm text-gray-500 mt-1">por mês</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição de Infraestrutura */}
      {editingInfra && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {infrastructureItems.find(i => i.id === editingInfra.id) ? 'Editar' : 'Adicionar'} Item de Infraestrutura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Item *</Label>
                  <Input
                    value={editingInfra.name}
                    onChange={(e) => setEditingInfra({ ...editingInfra, name: e.target.value })}
                    placeholder="Ex: Servidor Dell PowerEdge"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={editingInfra.type}
                    onValueChange={(value: any) => setEditingInfra({ ...editingInfra, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INFRASTRUCTURE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingInfra.quantity}
                    onChange={(e) => setEditingInfra({ ...editingInfra, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo Unitário (R$/mês) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingInfra.unitCost}
                    onChange={(e) => setEditingInfra({ ...editingInfra, unitCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={editingInfra.description || ''}
                    onChange={(e) => setEditingInfra({ ...editingInfra, description: e.target.value })}
                    placeholder="Detalhes adicionais sobre o item"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-900">Custo Total Mensal:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {(editingInfra.quantity * editingInfra.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingInfra(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveInfrastructure} disabled={!editingInfra.name}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Edição de Software */}
      {editingSoftware && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {softwareLicenseItems.find(i => i.id === editingSoftware.id) ? 'Editar' : 'Adicionar'} Licença de Software
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Licença *</Label>
                  <Input
                    value={editingSoftware.name}
                    onChange={(e) => setEditingSoftware({ ...editingSoftware, name: e.target.value })}
                    placeholder="Ex: Zabbix Enterprise"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={editingSoftware.type}
                    onValueChange={(value: any) => setEditingSoftware({ ...editingSoftware, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SOFTWARE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Fornecedor (opcional)</Label>
                  <Input
                    value={editingSoftware.vendor || ''}
                    onChange={(e) => setEditingSoftware({ ...editingSoftware, vendor: e.target.value })}
                    placeholder="Ex: Zabbix LLC"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Licença</Label>
                  <Select
                    value={editingSoftware.licenseType || 'per-device'}
                    onValueChange={(value: any) => setEditingSoftware({ ...editingSoftware, licenseType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-device">Por Dispositivo</SelectItem>
                      <SelectItem value="per-user">Por Usuário</SelectItem>
                      <SelectItem value="per-metric">Por Métrica</SelectItem>
                      <SelectItem value="flat-rate">Taxa Fixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingSoftware.quantity}
                    onChange={(e) => setEditingSoftware({ ...editingSoftware, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Custo Unitário (R$/mês) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editingSoftware.unitCost}
                    onChange={(e) => setEditingSoftware({ ...editingSoftware, unitCost: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição (opcional)</Label>
                  <Input
                    value={editingSoftware.description || ''}
                    onChange={(e) => setEditingSoftware({ ...editingSoftware, description: e.target.value })}
                    placeholder="Detalhes adicionais sobre a licença"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-900">Custo Total Mensal:</span>
                  <span className="text-2xl font-bold text-green-600">
                    R$ {(editingSoftware.quantity * editingSoftware.unitCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingSoftware(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveSoftware} disabled={!editingSoftware.name}>
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
