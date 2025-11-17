'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { MonitoringConfig, MonitoringTool } from '@/lib/types/noc-pricing';
import { Badge } from '@/components/ui/badge';

interface MonitoringTabProps {
  data: MonitoringConfig;
  onChange: (data: MonitoringConfig) => void;
}

const MONITORING_TOOLS: { value: MonitoringTool; label: string; type: 'open-source' | 'commercial' | 'saas' }[] = [
  { value: 'zabbix', label: 'Zabbix', type: 'open-source' },
  { value: 'nagios', label: 'Nagios', type: 'open-source' },
  { value: 'prometheus', label: 'Prometheus', type: 'open-source' },
  { value: 'grafana', label: 'Grafana', type: 'open-source' },
  { value: 'prtg', label: 'PRTG Network Monitor', type: 'commercial' },
  { value: 'solarwinds', label: 'SolarWinds', type: 'commercial' },
  { value: 'datadog', label: 'Datadog', type: 'saas' },
  { value: 'new-relic', label: 'New Relic', type: 'saas' },
  { value: 'dynatrace', label: 'Dynatrace', type: 'saas' },
  { value: 'splunk', label: 'Splunk', type: 'saas' },
  { value: 'elastic', label: 'Elastic Stack', type: 'saas' },
  { value: 'custom', label: 'Customizado', type: 'commercial' }
];

const ALERT_CHANNELS = [
  { value: 'email', label: 'E-mail' },
  { value: 'sms', label: 'SMS' },
  { value: 'slack', label: 'Slack' },
  { value: 'teams', label: 'Microsoft Teams' },
  { value: 'webhook', label: 'Webhook' }
];

export function MonitoringTab({ data, onChange }: MonitoringTabProps) {
  const handleToolToggle = (tool: MonitoringTool) => {
    const tools = data.tools.includes(tool)
      ? data.tools.filter(t => t !== tool)
      : [...data.tools, tool];
    onChange({ ...data, tools });
  };

  const handleChannelToggle = (channel: any) => {
    const channels = data.alertChannels.includes(channel)
      ? data.alertChannels.filter(c => c !== channel)
      : [...data.alertChannels, channel];
    onChange({ ...data, alertChannels: channels });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas de Monitoramento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MONITORING_TOOLS.map(tool => (
              <div
                key={tool.value}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  data.tools.includes(tool.value)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToolToggle(tool.value)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={data.tools.includes(tool.value)}
                        onCheckedChange={() => handleToolToggle(tool.value)}
                      />
                      <span className="font-medium">{tool.label}</span>
                    </div>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {tool.type === 'open-source' ? 'Open Source' :
                       tool.type === 'commercial' ? 'Comercial' : 'SaaS'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-900 mb-2">Ferramentas Selecionadas</h4>
            <p className="text-sm text-blue-800">
              {data.tools.length === 0 ? 'Nenhuma ferramenta selecionada' :
               `${data.tools.length} ferramenta(s): ${data.tools.map(t => 
                 MONITORING_TOOLS.find(mt => mt.value === t)?.label
               ).join(', ')}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurações de Alertas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Canais de Alerta</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALERT_CHANNELS.map(channel => (
                <div
                  key={channel.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    data.alertChannels.includes(channel.value as any)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle(channel.value)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={data.alertChannels.includes(channel.value as any)}
                      onCheckedChange={() => handleChannelToggle(channel.value)}
                    />
                    <span className="text-sm font-medium">{channel.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dashboards e Relatórios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dashboards Personalizados</Label>
              <Input
                type="number"
                min="0"
                value={data.customDashboards}
                onChange={(e) => onChange({ ...data, customDashboards: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Número de dashboards customizados</p>
            </div>

            <div className="space-y-2">
              <Label>Relatórios Customizados</Label>
              <Input
                type="number"
                min="0"
                value={data.customReports}
                onChange={(e) => onChange({ ...data, customReports: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500">Número de relatórios personalizados</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={data.reportingEnabled}
              onCheckedChange={(checked) => onChange({ ...data, reportingEnabled: checked as boolean })}
            />
            <Label>Habilitar sistema de relatórios automáticos</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automação e IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nível de Automação</Label>
            <Select
              value={data.automationLevel}
              onValueChange={(value: any) => onChange({ ...data, automationLevel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex flex-col">
                    <span className="font-medium">Nenhuma</span>
                    <span className="text-xs text-gray-500">Apenas alertas manuais</span>
                  </div>
                </SelectItem>
                <SelectItem value="basic">
                  <div className="flex flex-col">
                    <span className="font-medium">Básica</span>
                    <span className="text-xs text-gray-500">Respostas automáticas simples</span>
                  </div>
                </SelectItem>
                <SelectItem value="advanced">
                  <div className="flex flex-col">
                    <span className="font-medium">Avançada</span>
                    <span className="text-xs text-gray-500">Automação de processos complexos</span>
                  </div>
                </SelectItem>
                <SelectItem value="full">
                  <div className="flex flex-col">
                    <span className="font-medium">Completa</span>
                    <span className="text-xs text-gray-500">Auto-remediação e orquestração</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={data.aiEnabled}
              onCheckedChange={(checked) => onChange({ ...data, aiEnabled: checked as boolean })}
            />
            <div className="flex-1">
              <Label>Habilitar IA para Predição de Falhas</Label>
              <p className="text-xs text-gray-500">
                Machine Learning para análise preditiva e detecção de anomalias
              </p>
            </div>
          </div>

          {data.aiEnabled && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Recursos de IA Inclusos</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Predição de falhas antes que ocorram</li>
                <li>• Detecção de anomalias em tempo real</li>
                <li>• Análise de tendências e padrões</li>
                <li>• Recomendações automáticas de otimização</li>
                <li>• Correlação inteligente de eventos</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
