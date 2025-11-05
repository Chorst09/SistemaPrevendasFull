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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { safeFormatDate } from '@/lib/utils/date-utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Table, Code, Calendar, Settings } from 'lucide-react';
import { ServiceDeskData, ExportCustomization } from '@/lib/types/service-desk-pricing';
import { ReportExportService, ExportTemplate } from '@/lib/services/report-export-service';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ServiceDeskData;
}

export function ExportDialog({ open, onOpenChange, data }: ExportDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [customization, setCustomization] = useState<ExportCustomization>({
    includeCharts: true,
    includeDetails: true,
    language: 'pt',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  const { toast } = useToast();

  const exportService = ReportExportService.getInstance();

  useEffect(() => {
    if (open) {
      setTemplates(exportService.getTemplates());
    }
  }, [open]);

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <Table className="h-4 w-4" />;
      case 'json':
        return <Code className="h-4 w-4" />;
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
      case 'csv':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'Erro',
        description: 'Selecione um template para exportação',
        variant: 'destructive'
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await exportService.exportData(data, selectedTemplate, customization);
      const template = templates.find(t => t.id === selectedTemplate);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const extension = template?.format === 'excel' ? 'xlsx' : template?.format || 'txt';
      const filename = `${data.project.name || 'relatorio'}-${template?.name.toLowerCase().replace(/\s+/g, '-')}.${extension}`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso!'
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Erro na Exportação',
        description: 'Ocorreu um erro ao exportar o relatório. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Escolha um template e configure as opções de exportação para gerar seu relatório.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="template">Template de Exportação</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(template.format)}
                        <span>{template.name}</span>
                        <Badge className={getFormatColor(template.format)}>
                          {template.format.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getFormatIcon(selectedTemplateData.format)}
                    {selectedTemplateData.name}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedTemplateData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Seções Incluídas:</Label>
                    <div className="space-y-1">
                      {selectedTemplateData.sections.map((section) => (
                        <div key={section.id} className="flex items-center gap-2 text-xs">
                          <Checkbox 
                            checked={section.required || customization.includeDetails}
                            disabled={section.required}
                            className="h-3 w-3"
                          />
                          <span className={section.required ? 'font-medium' : ''}>
                            {section.name}
                          </span>
                          {section.required && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Customization Options */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Opções de Customização</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-charts"
                    checked={customization.includeCharts}
                    onCheckedChange={(checked) =>
                      setCustomization(prev => ({ ...prev, includeCharts: !!checked }))
                    }
                  />
                  <Label htmlFor="include-charts" className="text-sm">
                    Incluir gráficos e visualizações
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-details"
                    checked={customization.includeDetails}
                    onCheckedChange={(checked) =>
                      setCustomization(prev => ({ ...prev, includeDetails: !!checked }))
                    }
                  />
                  <Label htmlFor="include-details" className="text-sm">
                    Incluir seções opcionais detalhadas
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="language" className="text-sm">Idioma</Label>
                <Select
                  value={customization.language}
                  onValueChange={(value: 'pt' | 'en' | 'es') =>
                    setCustomization(prev => ({ ...prev, language: value }))
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="currency" className="text-sm">Moeda</Label>
                <Select
                  value={customization.currency}
                  onValueChange={(value) =>
                    setCustomization(prev => ({ ...prev, currency: value }))
                  }
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="date-format" className="text-sm">Formato de Data</Label>
              <Select
                value={customization.dateFormat}
                onValueChange={(value) =>
                  setCustomization(prev => ({ ...prev, dateFormat: value }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Agendamento Automático</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowScheduling(!showScheduling)}
                className="h-8"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {showScheduling ? 'Ocultar' : 'Configurar'}
              </Button>
            </div>

            {showScheduling && (
              <Card className="border-dashed">
                <CardContent className="pt-4">
                  <div className="text-sm text-muted-foreground text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Agendamento automático será implementado na próxima versão.</p>
                    <p className="text-xs mt-1">
                      Permitirá gerar relatórios automaticamente em intervalos definidos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Projeto: {data.project.name || 'Sem nome'} • 
            Última modificação: {safeFormatDate(data.metadata.lastModified)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={!selectedTemplate || isExporting}
              className="min-w-[100px]"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}