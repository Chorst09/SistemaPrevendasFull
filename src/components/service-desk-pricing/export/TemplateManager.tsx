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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Table, 
  Code, 
  Copy,
  Settings,
  Save
} from 'lucide-react';
import { ReportExportService, ExportTemplate, ExportSection } from '@/lib/services/report-export-service';
import { useToast } from '@/hooks/use-toast';

interface TemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TemplateFormData {
  name: string;
  description: string;
  format: 'pdf' | 'excel' | 'json' | 'csv';
  sections: ExportSection[];
  customizable: boolean;
}

const defaultSections: ExportSection[] = [
  { id: 'project-info', name: 'Informações do Projeto', required: true, dataPath: 'project' },
  { id: 'team-costs', name: 'Custos da Equipe', required: false, dataPath: 'team' },
  { id: 'schedules', name: 'Escalas de Trabalho', required: false, dataPath: 'schedules' },
  { id: 'taxes', name: 'Impostos', required: false, dataPath: 'taxes' },
  { id: 'variables', name: 'Variáveis de Mercado', required: false, dataPath: 'variables' },
  { id: 'other-costs', name: 'Outros Custos', required: false, dataPath: 'otherCosts' },
  { id: 'budget', name: 'Orçamento', required: false, dataPath: 'budget' },
  { id: 'analysis', name: 'Análise de Rentabilidade', required: false, dataPath: 'analysis' },
  { id: 'negotiations', name: 'Cenários de Negociação', required: false, dataPath: 'negotiations' },
  { id: 'final-analysis', name: 'Análise Final', required: false, dataPath: 'finalAnalysis' }
];

export function TemplateManager({ open, onOpenChange }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ExportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    format: 'pdf',
    sections: [],
    customizable: true
  });
  const { toast } = useToast();

  const exportService = ReportExportService.getInstance();

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open]);

  const loadTemplates = () => {
    setTemplates(exportService.getTemplates());
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <Table className="h-4 w-4" />;
      case 'json':
        return <Code className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      format: 'pdf',
      sections: defaultSections.map(s => ({ ...s, required: false })),
      customizable: true
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleEdit = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setFormData({
      name: template.name,
      description: template.description,
      format: template.format,
      sections: [...template.sections],
      customizable: template.customizable
    });
    setSelectedTemplate(templateId);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleDuplicate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    setFormData({
      name: `${template.name} (Cópia)`,
      description: template.description,
      format: template.format,
      sections: [...template.sections],
      customizable: true
    });
    setIsCreating(true);
    setIsEditing(false);
  };

  const handleDelete = (templateId: string) => {
    if (templateId.startsWith('custom-')) {
      exportService.deleteTemplate(templateId);
      loadTemplates();
      toast({
        title: 'Sucesso',
        description: 'Template removido com sucesso!'
      });
    } else {
      toast({
        title: 'Erro',
        description: 'Templates padrão não podem ser removidos.',
        variant: 'destructive'
      });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do template é obrigatório.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.sections.length === 0) {
      toast({
        title: 'Erro',
        description: 'Selecione pelo menos uma seção.',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isCreating) {
        exportService.createCustomTemplate(formData);
        toast({
          title: 'Sucesso',
          description: 'Template criado com sucesso!'
        });
      } else if (isEditing) {
        exportService.updateTemplate(selectedTemplate, formData);
        toast({
          title: 'Sucesso',
          description: 'Template atualizado com sucesso!'
        });
      }

      loadTemplates();
      setIsCreating(false);
      setIsEditing(false);
      setSelectedTemplate('');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar template. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedTemplate('');
    setFormData({
      name: '',
      description: '',
      format: 'pdf',
      sections: [],
      customizable: true
    });
  };

  const updateSection = (index: number, updates: Partial<ExportSection>) => {
    const newSections = [...formData.sections];
    newSections[index] = { ...newSections[index], ...updates };
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const toggleSection = (sectionId: string, enabled: boolean) => {
    if (enabled) {
      const defaultSection = defaultSections.find(s => s.id === sectionId);
      if (defaultSection) {
        setFormData(prev => ({
          ...prev,
          sections: [...prev.sections, { ...defaultSection, required: false }]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      }));
    }
  };

  const isFormMode = isCreating || isEditing;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gerenciar Templates de Exportação
          </DialogTitle>
          <DialogDescription>
            {isFormMode 
              ? (isCreating ? 'Criar novo template de exportação' : 'Editar template de exportação')
              : 'Gerencie seus templates de exportação personalizados'
            }
          </DialogDescription>
        </DialogHeader>

        {!isFormMode ? (
          // Template List View
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {templates.length} templates disponíveis
              </div>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getFormatIcon(template.format)}
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge className={getFormatColor(template.format)}>
                          {template.format.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicate(template.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {template.id.startsWith('custom-') && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(template.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground">
                      {template.sections.length} seções • 
                      {template.customizable ? 'Customizável' : 'Fixo'}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.sections.slice(0, 3).map((section) => (
                        <Badge key={section.id} variant="outline" className="text-xs px-1 py-0">
                          {section.name}
                        </Badge>
                      ))}
                      {template.sections.length > 3 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{template.sections.length - 3} mais
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Template Form View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Nome do Template</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Relatório Executivo Personalizado"
                />
              </div>

              <div>
                <Label htmlFor="template-description">Descrição</Label>
                <Textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o propósito e conteúdo deste template..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="template-format">Formato de Exportação</Label>
                <Select
                  value={formData.format}
                  onValueChange={(value: 'pdf' | 'excel' | 'json' | 'csv') =>
                    setFormData(prev => ({ ...prev, format: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        Excel
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        JSON
                      </div>
                    </SelectItem>
                    <SelectItem value="csv">
                      <div className="flex items-center gap-2">
                        <Table className="h-4 w-4" />
                        CSV
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="customizable"
                  checked={formData.customizable}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, customizable: !!checked }))
                  }
                />
                <Label htmlFor="customizable" className="text-sm">
                  Permitir customização pelo usuário
                </Label>
              </div>
            </div>

            {/* Sections Configuration */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Seções do Relatório</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecione as seções que serão incluídas neste template
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {defaultSections.map((section) => {
                  const isIncluded = formData.sections.some(s => s.id === section.id);
                  const includedSection = formData.sections.find(s => s.id === section.id);

                  return (
                    <Card key={section.id} className={`p-3 ${isIncluded ? 'border-primary' : ''}`}>
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          checked={isIncluded}
                          onCheckedChange={(checked) => toggleSection(section.id, !!checked)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium cursor-pointer">
                              {section.name}
                            </Label>
                            {isIncluded && includedSection && (
                              <Checkbox
                                checked={includedSection.required}
                                onCheckedChange={(checked) => {
                                  const index = formData.sections.findIndex(s => s.id === section.id);
                                  if (index >= 0) {
                                    updateSection(index, { required: !!checked });
                                  }
                                }}
                                className="h-3 w-3"
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Dados: {section.dataPath || 'Todos os dados'}
                          </p>
                          {isIncluded && includedSection && (
                            <div className="mt-2 flex items-center gap-2 text-xs">
                              <span className={includedSection.required ? 'text-orange-600' : 'text-green-600'}>
                                {includedSection.required ? 'Obrigatório' : 'Opcional'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <div className="text-xs text-muted-foreground">
                {formData.sections.length} seções selecionadas
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {isFormMode ? (
              isCreating ? 'Criando novo template' : 'Editando template'
            ) : (
              `${templates.filter(t => t.id.startsWith('custom-')).length} templates personalizados`
            )}
          </div>
          <div className="flex gap-2">
            {isFormMode ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Criar Template' : 'Salvar Alterações'}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}