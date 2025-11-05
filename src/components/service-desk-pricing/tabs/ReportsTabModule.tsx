'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Plus, 
  BarChart3, 
  Settings,
  History,
  Layout,
  Share2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { ReportGenerator, ReportConfig } from '../reports/ReportGenerator';
import { ReportsList } from '../reports/ReportsList';
import { useReportGeneration } from '@/hooks/use-report-generation';

export interface ReportsTabModuleProps {
  data: ServiceDeskData;
  onUpdate: (data: ServiceDeskData) => void;
  isLoading?: boolean;
  validationStatus?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completionPercentage: number;
  };
}

export function ReportsTabModule({ 
  data, 
  onUpdate, 
  isLoading = false,
  validationStatus 
}: ReportsTabModuleProps) {
  const [activeTab, setActiveTab] = useState('generator');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastGeneratedReport, setLastGeneratedReport] = useState<string | null>(null);

  const {
    generateReport,
    saveTemplate,
    isGenerating,
    error,
    clearError,
    reports,
    templates
  } = useReportGeneration();

  const handleGenerateReport = useCallback(async (config: ReportConfig) => {
    try {
      const report = await generateReport(config, data);
      setLastGeneratedReport(report.config.name);
      setShowSuccessMessage(true);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      // Switch to reports list to show the new report
      setActiveTab('reports');
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  }, [generateReport, data]);

  const handleSaveTemplate = useCallback(async (config: ReportConfig) => {
    try {
      await saveTemplate(config);
      // Show success notification
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  }, [saveTemplate]);

  const handleViewReport = useCallback((reportId: string) => {
    // In a real implementation, this would open a report viewer
    console.log('View report:', reportId);
  }, []);

  const handleShareReport = useCallback((reportId: string) => {
    // In a real implementation, this would open a sharing dialog
    console.log('Share report:', reportId);
  }, []);

  // Check if data is sufficient for report generation
  const canGenerateReports = React.useMemo(() => {
    return data.project.name && 
           data.project.client?.name && 
           data.team && 
           Array.isArray(data.team) &&
           data.team.length > 0;
  }, [data]);

  const recentReports = React.useMemo(() => {
    return reports
      .filter(r => r.status === 'completed')
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      .slice(0, 3);
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Sistema de Relatórios</span>
                  {validationStatus && (
                    <Badge variant={validationStatus.isValid ? 'default' : 'secondary'}>
                      {validationStatus.completionPercentage}% completo
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Gere relatórios personalizados e profissionais do seu projeto
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <BarChart3 className="h-3 w-3" />
                <span>{reports.length} relatórios</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Layout className="h-3 w-3" />
                <span>{templates.length} templates</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Success Message */}
      {showSuccessMessage && lastGeneratedReport && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Relatório "{lastGeneratedReport}" gerado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
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

      {/* Data Validation Warning */}
      {!canGenerateReports && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Para gerar relatórios completos, certifique-se de que o projeto tenha:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Nome do projeto preenchido</li>
              <li>Informações do cliente</li>
              <li>Pelo menos um membro na equipe</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      {recentReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Relatórios Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{report.config.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.config.type} • {report.config.format.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewReport(report.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Gerar Relatório</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Meus Relatórios</span>
            {reports.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {reports.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Templates</span>
            {templates.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {templates.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <ReportGenerator
            data={data}
            onGenerate={handleGenerateReport}
            onSaveTemplate={handleSaveTemplate}
            savedTemplates={templates.map(t => ({
              ...t,
              description: t.description || '',
              type: t.type as 'executive' | 'detailed' | 'financial' | 'operational' | 'custom',
              format: t.format as 'pdf' | 'excel' | 'word' | 'html',
              template: 'default',
              sections: t.sections.map(s => ({
                ...s,
                type: s.type as 'summary' | 'chart' | 'table' | 'text' | 'kpi' | 'forecast',
                config: {},
                order: 1
              }))
            }))}
            isGenerating={isGenerating}
          />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsList
            onViewReport={handleViewReport}
            onShareReport={handleShareReport}
          />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <TemplatesManager
            templates={templates}
            onUseTemplate={(template: any) => {
              // Switch to generator tab and load template
              setActiveTab('generator');
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Templates Manager component
function TemplatesManager({ templates, onUseTemplate }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates Salvos</h3>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Layout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template salvo</h3>
            <p className="text-muted-foreground mb-4">
              Crie templates personalizados para reutilizar configurações de relatórios
            </p>
            <Button variant="outline" onClick={() => onUseTemplate(null)}>
              Criar Primeiro Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((template: any) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                    {template.description && (
                      <p className="text-muted-foreground mb-3">{template.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{template.type}</span>
                      <span>{template.format.toUpperCase()}</span>
                      <span>{template.sections?.filter((s: any) => s.enabled).length || 0} seções</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUseTemplate(template)}
                    >
                      Usar Template
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}