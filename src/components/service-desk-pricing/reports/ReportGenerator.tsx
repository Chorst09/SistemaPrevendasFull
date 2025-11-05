'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar, 
  BarChart3, 
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  Share2
} from 'lucide-react';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'detailed' | 'financial' | 'operational' | 'custom';
  format: 'pdf' | 'excel' | 'word' | 'html';
  sections: ReportSection[];
  template: string;
  scheduling?: ReportSchedule;
  recipients?: string[];
  branding?: ReportBranding;
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'kpi' | 'forecast';
  enabled: boolean;
  config: Record<string, any>;
  order: number;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  timezone: string;
}

export interface ReportBranding {
  logo?: string;
  companyName: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  footer?: string;
}

export interface ReportGeneratorProps {
  data: ServiceDeskData;
  onGenerate: (config: ReportConfig) => Promise<void>;
  onSaveTemplate: (config: ReportConfig) => Promise<void>;
  savedTemplates?: ReportConfig[];
  isGenerating?: boolean;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  {
    id: 'executive-summary',
    name: 'Resumo Executivo',
    type: 'summary',
    enabled: true,
    config: { includeKPIs: true, includeRecommendations: true },
    order: 1
  },
  {
    id: 'project-overview',
    name: 'Visão Geral do Projeto',
    type: 'text',
    enabled: true,
    config: { includeTimeline: true, includeScope: true },
    order: 2
  },
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    type: 'kpi',
    enabled: true,
    config: { showCharts: true, includeBreakdown: true },
    order: 3
  },
  {
    id: 'team-composition',
    name: 'Composição da Equipe',
    type: 'chart',
    enabled: true,
    config: { chartType: 'pie', showCosts: true },
    order: 4
  },
  {
    id: 'cost-breakdown',
    name: 'Detalhamento de Custos',
    type: 'table',
    enabled: true,
    config: { groupBy: 'category', showPercentages: true },
    order: 5
  },
  {
    id: 'forecast-projections',
    name: 'Projeções de Forecast',
    type: 'forecast',
    enabled: false,
    config: { timeframe: '12months', scenarios: ['baseline', 'optimistic'] },
    order: 6
  }
];

const REPORT_TEMPLATES: Partial<ReportConfig>[] = [
  {
    name: 'Relatório Executivo',
    description: 'Relatório resumido para apresentação à diretoria',
    type: 'executive',
    format: 'pdf',
    sections: DEFAULT_SECTIONS.filter(s => ['executive-summary', 'financial-summary', 'forecast-projections'].includes(s.id))
  },
  {
    name: 'Relatório Detalhado',
    description: 'Relatório completo com todos os detalhes do projeto',
    type: 'detailed',
    format: 'pdf',
    sections: DEFAULT_SECTIONS
  },
  {
    name: 'Análise Financeira',
    description: 'Foco em aspectos financeiros e de custos',
    type: 'financial',
    format: 'excel',
    sections: DEFAULT_SECTIONS.filter(s => ['financial-summary', 'cost-breakdown', 'forecast-projections'].includes(s.id))
  },
  {
    name: 'Relatório Operacional',
    description: 'Detalhes operacionais e de equipe',
    type: 'operational',
    format: 'pdf',
    sections: DEFAULT_SECTIONS.filter(s => ['project-overview', 'team-composition', 'cost-breakdown'].includes(s.id))
  }
];

export function ReportGenerator({ 
  data, 
  onGenerate, 
  onSaveTemplate, 
  savedTemplates = [], 
  isGenerating = false 
}: ReportGeneratorProps) {
  const [currentConfig, setCurrentConfig] = useState<ReportConfig>({
    id: crypto.randomUUID(),
    name: 'Novo Relatório',
    description: '',
    type: 'custom',
    format: 'pdf',
    sections: [...DEFAULT_SECTIONS],
    template: 'default',
    branding: {
      companyName: data.project.client?.name || 'Cliente',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#0ea5e9'
      }
    }
  });

  const [activeTab, setActiveTab] = useState('config');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSectionToggle = useCallback((sectionId: string, enabled: boolean) => {
    setCurrentConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, enabled } : section
      )
    }));
  }, []);

  const handleSectionConfigUpdate = useCallback((sectionId: string, config: Record<string, any>) => {
    setCurrentConfig(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, config: { ...section.config, ...config } } : section
      )
    }));
  }, []);

  const handleTemplateSelect = useCallback((template: Partial<ReportConfig>) => {
    setCurrentConfig(prev => ({
      ...prev,
      ...template,
      id: crypto.randomUUID(),
      sections: template.sections ? [...template.sections] : prev.sections
    }));
  }, []);

  const handleGenerate = useCallback(async () => {
    try {
      await onGenerate(currentConfig);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  }, [currentConfig, onGenerate]);

  const handleSaveAsTemplate = useCallback(async () => {
    try {
      await onSaveTemplate(currentConfig);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, [currentConfig, onSaveTemplate]);

  const enabledSections = useMemo(() => 
    currentConfig.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order),
    [currentConfig.sections]
  );

  const estimatedPages = useMemo(() => {
    let pages = 1; // Cover page
    enabledSections.forEach(section => {
      switch (section.type) {
        case 'summary':
          pages += 1;
          break;
        case 'chart':
          pages += 0.5;
          break;
        case 'table':
          pages += 1;
          break;
        case 'text':
          pages += 0.5;
          break;
        case 'kpi':
          pages += 0.5;
          break;
        case 'forecast':
          pages += 2;
          break;
      }
    });
    return Math.ceil(pages);
  }, [enabledSections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerador de Relatórios</h2>
          <p className="text-muted-foreground">
            Configure e gere relatórios personalizados do seu projeto
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{previewMode ? 'Editar' : 'Visualizar'}</span>
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || enabledSections.length === 0}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{isGenerating ? 'Gerando...' : 'Gerar Relatório'}</span>
          </Button>
        </div>
      </div>

      {previewMode ? (
        <ReportPreview config={currentConfig} data={data} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="sections">Seções</TabsTrigger>
            <TabsTrigger value="branding">Identidade</TabsTrigger>
            <TabsTrigger value="schedule">Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Configuração Básica</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="report-name">Nome do Relatório</Label>
                    <Input
                      id="report-name"
                      value={currentConfig.name}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Digite o nome do relatório"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="report-description">Descrição</Label>
                    <Textarea
                      id="report-description"
                      value={currentConfig.description}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o propósito do relatório"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Tipo</Label>
                      <Select
                        value={currentConfig.type}
                        onValueChange={(value: any) => setCurrentConfig(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="executive">Executivo</SelectItem>
                          <SelectItem value="detailed">Detalhado</SelectItem>
                          <SelectItem value="financial">Financeiro</SelectItem>
                          <SelectItem value="operational">Operacional</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="report-format">Formato</Label>
                      <Select
                        value={currentConfig.format}
                        onValueChange={(value: any) => setCurrentConfig(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="word">Word</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Templates Predefinidos</Label>
                    <div className="grid gap-2">
                      {REPORT_TEMPLATES.map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-start h-auto p-3"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="text-left">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {savedTemplates.length > 0 && (
                    <div className="space-y-2">
                      <Label>Templates Salvos</Label>
                      <div className="grid gap-2">
                        {savedTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant="outline"
                            className="justify-start h-auto p-3"
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <div className="text-left">
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {template.description}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleSaveAsTemplate}
                    className="w-full"
                  >
                    Salvar como Template
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Report Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Relatório</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{enabledSections.length}</div>
                    <div className="text-sm text-muted-foreground">Seções</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{estimatedPages}</div>
                    <div className="text-sm text-muted-foreground">Páginas Est.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentConfig.format.toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">Formato</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{currentConfig.type}</div>
                    <div className="text-sm text-muted-foreground">Tipo</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <ReportSectionsConfig
              sections={currentConfig.sections}
              onSectionToggle={handleSectionToggle}
              onSectionConfigUpdate={handleSectionConfigUpdate}
            />
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <ReportBrandingConfig
              branding={currentConfig.branding}
              onUpdate={(branding) => setCurrentConfig(prev => ({ ...prev, branding }))}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <ReportScheduleConfig
              schedule={currentConfig.scheduling}
              onUpdate={(scheduling) => setCurrentConfig(prev => ({ ...prev, scheduling }))}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Sub-components would be implemented here
function ReportSectionsConfig({ sections, onSectionToggle, onSectionConfigUpdate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Configuração de Seções</h3>
      {sections.map((section: ReportSection) => (
        <Card key={section.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={section.enabled}
                  onCheckedChange={(checked) => onSectionToggle(section.id, checked)}
                />
                <div>
                  <h4 className="font-medium">{section.name}</h4>
                  <p className="text-sm text-muted-foreground">Tipo: {section.type}</p>
                </div>
              </div>
              <Badge variant={section.enabled ? 'default' : 'secondary'}>
                {section.enabled ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
          </CardHeader>
          {section.enabled && (
            <CardContent className="pt-0">
              {/* Section-specific configuration would go here */}
              <div className="text-sm text-muted-foreground">
                Configurações específicas para {section.type}
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}

function ReportBrandingConfig({ branding, onUpdate }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidade Visual</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Nome da Empresa</Label>
          <Input
            value={branding?.companyName || ''}
            onChange={(e) => onUpdate({ ...branding, companyName: e.target.value })}
            placeholder="Nome da empresa"
          />
        </div>
        {/* More branding options would go here */}
      </CardContent>
    </Card>
  );
}

function ReportScheduleConfig({ schedule, onUpdate }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamento Automático</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={schedule?.enabled || false}
            onCheckedChange={(checked) => onUpdate({ ...schedule, enabled: checked })}
          />
          <Label>Ativar agendamento automático</Label>
        </div>
        {/* More scheduling options would go here */}
      </CardContent>
    </Card>
  );
}

function ReportPreview({ config, data }: { config: ReportConfig; data: ServiceDeskData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização do Relatório</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold">{config.name}</h1>
            <p className="text-muted-foreground">{config.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Projeto: {data.project.name} | Cliente: {data.project.client?.name}
            </p>
          </div>
          
          {config.sections
            .filter(s => s.enabled)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold">{section.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Tipo: {section.type} | Configuração: {JSON.stringify(section.config)}
                </p>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}