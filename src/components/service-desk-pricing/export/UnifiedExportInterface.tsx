'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { safeFormatDate } from '@/lib/utils/date-utils';
import { 
  Download, 
  FileText, 
  Table, 
  Code, 
  Archive,
  History,
  TrendingUp,
  Lightbulb,
  Settings,
  Calendar,
  BarChart3
} from 'lucide-react';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { 
  EnhancedExportIntegration, 
  UnifiedExportOptions,
  ExportResult,
  ExportHistory 
} from '@/lib/services/enhanced-export-integration';
import { ExportDialog } from './ExportDialog';
import { TemplateManager } from './TemplateManager';
import { ScheduledReportsManager } from './ScheduledReportsManager';
import { useToast } from '@/hooks/use-toast';

interface UnifiedExportInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ServiceDeskData;
}

export function UnifiedExportInterface({ open, onOpenChange, data }: UnifiedExportInterfaceProps) {
  const [activeTab, setActiveTab] = useState('export');
  const [exportHistory, setExportHistory] = useState<ExportHistory[]>([]);
  const [exportStats, setExportStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showScheduledReports, setShowScheduledReports] = useState(false);
  const { toast } = useToast();

  const exportService = EnhancedExportIntegration.getInstance();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = () => {
    setExportHistory(exportService.getExportHistory(data.project.id));
    setExportStats(exportService.getExportStatistics());
    setRecommendations(exportService.getExportRecommendations(data));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <Table className="h-4 w-4" />;
      case 'json':
        return <Code className="h-4 w-4" />;
      case 'zip':
        return <Archive className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'excel':
        return 'bg-green-100 text-green-800';
      case 'json':
        return 'bg-blue-100 text-blue-800';
      case 'zip':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleQuickExport = async (templateId: string) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const options: UnifiedExportOptions = {
        templateId,
        includeCharts: true,
        includeDetails: true,
        language: 'pt',
        currency: 'BRL',
        dateFormat: 'dd/MM/yyyy',
        includeMetadata: true
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result: ExportResult = await exportService.exportData(data, options);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      // Create download link
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Sucesso',
        description: `${result.filename} exportado com sucesso!`
      });

      loadData(); // Refresh data
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na Exportação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleBatchExport = async () => {
    const recommendedTemplates = recommendations
      .filter(r => r.priority === 'high')
      .map(r => r.templateId);

    if (recommendedTemplates.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum template recomendado para exportação em lote.',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const results = await exportService.batchExport(data, recommendedTemplates);
      
      // Download all files
      results.forEach(result => {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      toast({
        title: 'Sucesso',
        description: `${results.length} arquivos exportados com sucesso!`
      });

      loadData();
    } catch (error) {
      console.error('Batch export error:', error);
      toast({
        title: 'Erro na Exportação em Lote',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const templates = exportService.getAvailableTemplates();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Central de Exportação
            </DialogTitle>
            <DialogDescription>
              Gerencie todas as exportações e relatórios do projeto {data.project.name}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Estatísticas
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Recomendações
              </TabsTrigger>
            </TabsList>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Ações Rápidas</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplateManager(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Templates
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowScheduledReports(true)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Agendamentos
                      </Button>
                    </div>
                  </div>

                  {isExporting && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Exportando...</span>
                            <span>{exportProgress}%</span>
                          </div>
                          <Progress value={exportProgress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.slice(0, 4).map((template) => (
                      <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(template.format)}
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                            </div>
                            <Badge className={getFormatColor(template.format)}>
                              {template.format.toUpperCase()}
                            </Badge>
                          </div>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {template.estimatedSize} • {template.sections.length} seções
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleQuickExport(template.id)}
                              disabled={isExporting}
                              className="h-7"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowExportDialog(true)}
                      disabled={isExporting}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportação Personalizada
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBatchExport}
                      disabled={isExporting || recommendations.filter(r => r.priority === 'high').length === 0}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Exportação em Lote
                    </Button>
                  </div>
                </div>

                {/* Project Summary */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Resumo do Projeto</h3>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nome:</span>
                          <span className="font-medium">{data.project.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cliente:</span>
                          <span className="font-medium">{data.project.client.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(data.budget.totalPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Equipe:</span>
                          <span className="font-medium">{data.team.length} membros</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant="outline">{data.metadata.status}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Templates Disponíveis</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {templates.map((template) => (
                          <div key={template.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {getFormatIcon(template.format)}
                              <span>{template.name}</span>
                            </div>
                            <Badge className={getFormatColor(template.format)} variant="outline">
                              {template.format}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Histórico de Exportações</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportService.cleanupExportUrls()}
                >
                  Limpar Cache
                </Button>
              </div>

              {exportHistory.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma exportação ainda</h3>
                      <p className="text-sm">
                        As exportações realizadas aparecerão aqui para fácil acesso.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {exportHistory.map((history) => (
                    <Card key={history.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFormatIcon(history.format)}
                            <div>
                              <div className="font-medium text-sm">{history.filename}</div>
                              <div className="text-xs text-muted-foreground">
                                {history.exportedAt.toLocaleString()} • {formatFileSize(history.size)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getFormatColor(history.format)}>
                              {history.format.toUpperCase()}
                            </Badge>
                            <div className="text-xs text-muted-foreground">
                              {history.downloadCount} downloads
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <h3 className="text-lg font-medium">Estatísticas de Exportação</h3>
              
              {exportStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{exportStats.totalExports}</div>
                      <div className="text-xs text-muted-foreground">Total de Exportações</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{formatFileSize(exportStats.totalSize)}</div>
                      <div className="text-xs text-muted-foreground">Tamanho Total</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{exportStats.mostUsedFormat.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">Formato Mais Usado</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold">{formatFileSize(exportStats.averageSize)}</div>
                      <div className="text-xs text-muted-foreground">Tamanho Médio</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-4">
              <h3 className="text-lg font-medium">Recomendações de Exportação</h3>
              
              {recommendations.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Nenhuma recomendação</h3>
                      <p className="text-sm">
                        Complete mais dados do projeto para receber recomendações personalizadas.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => {
                    const template = templates.find(t => t.id === rec.templateId);
                    return (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="h-5 w-5 mt-0.5 text-yellow-500" />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    {template?.name || rec.templateId}
                                  </span>
                                  <Badge className={getPriorityColor(rec.priority)}>
                                    {rec.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{rec.reason}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleQuickExport(rec.templateId)}
                              disabled={isExporting}
                              className="h-7"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Projeto: {data.project.name} • 
              Última modificação: {safeFormatDate(data.metadata.lastModified)}
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-dialogs */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        data={data}
      />

      <TemplateManager
        open={showTemplateManager}
        onOpenChange={setShowTemplateManager}
      />

      <ScheduledReportsManager
        open={showScheduledReports}
        onOpenChange={setShowScheduledReports}
      />
    </>
  );
}