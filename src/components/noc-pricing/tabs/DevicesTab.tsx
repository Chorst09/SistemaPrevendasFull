'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Server, Network, Database, Cloud, Shield, Monitor } from 'lucide-react';
import { MonitoredDevice, MonitoringType } from '@/lib/types/noc-pricing';
import { Badge } from '@/components/ui/badge';

interface DevicesTabProps {
  devices: MonitoredDevice[];
  totalDevices: number;
  totalMetrics: number;
  estimatedAlertsPerMonth: number;
  onChange: (data: {
    devices: MonitoredDevice[];
    totalDevices: number;
    totalMetrics: number;
    estimatedAlertsPerMonth: number;
  }) => void;
}

const DEVICE_TYPE_ICONS: Record<MonitoringType, any> = {
  infrastructure: Server,
  network: Network,
  application: Monitor,
  security: Shield,
  cloud: Cloud,
  database: Database,
  endpoint: Monitor
};

const DEVICE_TYPE_LABELS: Record<MonitoringType, string> = {
  infrastructure: 'Infraestrutura',
  network: 'Rede',
  application: 'Aplicação',
  security: 'Segurança',
  cloud: 'Cloud',
  database: 'Banco de Dados',
  endpoint: 'Endpoint'
};

export function DevicesTab({
  devices,
  totalDevices,
  totalMetrics,
  estimatedAlertsPerMonth,
  onChange
}: DevicesTabProps) {
  const [editingDevice, setEditingDevice] = useState<MonitoredDevice | null>(null);

  const handleAddDevice = () => {
    const newDevice: MonitoredDevice = {
      id: `device-${Date.now()}`,
      name: '',
      type: 'infrastructure',
      quantity: 1,
      metricsCount: 10,
      checkInterval: 5,
      alertThreshold: 80,
      criticality: 'medium',
      estimatedAlerts: 10
    };
    setEditingDevice(newDevice);
  };

  const handleSaveDevice = () => {
    if (!editingDevice) return;

    const updatedDevices = devices.find(d => d.id === editingDevice.id)
      ? devices.map(d => d.id === editingDevice.id ? editingDevice : d)
      : [...devices, editingDevice];

    updateTotals(updatedDevices);
    setEditingDevice(null);
  };

  const handleDeleteDevice = (id: string) => {
    const updatedDevices = devices.filter(d => d.id !== id);
    updateTotals(updatedDevices);
  };

  const updateTotals = (updatedDevices: MonitoredDevice[]) => {
    const newTotalDevices = updatedDevices.reduce((sum, d) => sum + d.quantity, 0);
    const newTotalMetrics = updatedDevices.reduce((sum, d) => sum + (d.quantity * d.metricsCount), 0);
    const newEstimatedAlerts = updatedDevices.reduce((sum, d) => sum + d.estimatedAlerts, 0);

    onChange({
      devices: updatedDevices,
      totalDevices: newTotalDevices,
      totalMetrics: newTotalMetrics,
      estimatedAlertsPerMonth: newEstimatedAlerts
    });
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'default';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDevices}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMetrics}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alertas Estimados/Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{estimatedAlertsPerMonth}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de dispositivos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dispositivos Monitorados</CardTitle>
            <Button onClick={handleAddDevice} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Dispositivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo adicionado</p>
              <p className="text-sm">Clique em "Adicionar Dispositivo" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {devices.map(device => {
                const Icon = DEVICE_TYPE_ICONS[device.type];
                return (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <Icon className="h-8 w-8 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{device.name}</h4>
                          <Badge variant={getCriticalityColor(device.criticality)}>
                            {device.criticality}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {DEVICE_TYPE_LABELS[device.type]} • {device.quantity} unidades • {device.metricsCount} métricas/unidade
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDevice(device)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      {editingDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {devices.find(d => d.id === editingDevice.id) ? 'Editar' : 'Adicionar'} Dispositivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Dispositivo *</Label>
                  <Input
                    value={editingDevice.name}
                    onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                    placeholder="Ex: Servidores Web"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select
                    value={editingDevice.type}
                    onValueChange={(value: MonitoringType) => setEditingDevice({ ...editingDevice, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => (
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
                    value={editingDevice.quantity}
                    onChange={(e) => setEditingDevice({ ...editingDevice, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Métricas por Dispositivo *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingDevice.metricsCount}
                    onChange={(e) => setEditingDevice({ ...editingDevice, metricsCount: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Intervalo de Verificação (min) *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingDevice.checkInterval}
                    onChange={(e) => setEditingDevice({ ...editingDevice, checkInterval: parseInt(e.target.value) || 5 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Threshold de Alerta (%) *</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editingDevice.alertThreshold}
                    onChange={(e) => setEditingDevice({ ...editingDevice, alertThreshold: parseInt(e.target.value) || 80 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Criticidade *</Label>
                  <Select
                    value={editingDevice.criticality}
                    onValueChange={(value: any) => setEditingDevice({ ...editingDevice, criticality: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="critical">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alertas Estimados/Mês *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editingDevice.estimatedAlerts}
                    onChange={(e) => setEditingDevice({ ...editingDevice, estimatedAlerts: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingDevice(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveDevice} disabled={!editingDevice.name}>
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
