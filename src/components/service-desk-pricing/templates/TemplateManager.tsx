'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  Star, 
  Users, 
  Calendar, 
  Tag,
  Filter,
  Trash2,
  Edit,
  Copy,
  Eye,
  TrendingUp,
  Award,
  BookOpen
} from 'lucide-react';

import {
  ServiceDeskTemplate,
  TemplateCategory,
  TemplateType,
  TemplateComplexity,
  ServiceType,
  TemplateApplication,
  TemplateExport,
  TemplateImport
} from '@/lib/types/service-desk-templates';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';
import { ServiceDeskTemplateService } from '@/lib/services/service-desk-template-service';

export interface TemplateManagerProps {
  currentData?: ServiceDeskData;
  onApplyTemplate?: (application: TemplateApplication) => void;
  onCreateTemplate?: (template: ServiceDeskTemplate) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateManager({
  currentData,
  onApplyTemplate,
  onCreateTemplate,
  isOpen,
  onClose
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ServiceDeskTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ServiceDeskTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedType, setSelectedType] = useState<TemplateType | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<TemplateComplexity | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // Template creation state
  const [createTemplateData, setCreateTemplateData] = useState({
    name: '',
    description: '',
    category: TemplateCategory.COMPLETE_PROJECT,
    tags: '',
    isPublic: false
  });

  // Import/Export state
  const [exportData, setExportData] = useState<TemplateExport | null>(null);
  const [importData, setImportData] = useState<TemplateImport | null>(null);

  const templateService = useMemo(() => new ServiceDeskTemplateService(), []);

  // Load templates on mount
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  // Filter templates when search or filters change
  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, selectedCategory, selectedType, selectedComplexity]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedTemplates = await templateService.loadTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError('Erro ao carregar templates');
      console.error('Error loading templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    // Complexity filter
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(template => template.metadata.complexity === selectedComplexity);
    }

    setFilteredTemplates(filtered);
  };

  const handleApplyTemplate = async (template: ServiceDeskTemplate) => {
    if (!currentData) {
      setError('Dados atuais não disponíveis para aplicar template');
      return;
    }

    try {
      setIsLoading(true);
      const application = await templateService.applyTemplate(template.id, currentData);
      onApplyTemplate?.(application);
      onClose();
    } catch (err) {
      setError('Erro ao aplicar template');
      console.error('Error applying template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!currentData) {
      setError('Dados atuais não disponíveis para criar template');
      return;
    }

    try {
      setIsLoading(true);
      const template = await templateService.createTemplateFromData(currentData, {
        name: createTemplateData.name,
        description: createTemplateData.description,
        category: createTemplateData.category,
        tags: createTemplateData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        isPublic: createTemplateData.isPublic
      });
      
      onCreateTemplate?.(template);
      setTemplates(prev => [...prev, template]);
      
      // Reset form
      setCreateTemplateData({
        name: '',
        description: '',
        category: TemplateCategory.COMPLETE_PROJECT,
        tags: '',
        isPublic: false
      });
      
      setActiveTab('browse');
    } catch (err) {
      setError('Erro ao criar template');
      console.error('Error creating template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) {
      return;
    }

    try {
      setIsLoading(true);
      await templateService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      setError('Erro ao excluir template');
      console.error('Error deleting template:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportTemplates = async (templateIds: string[]) => {
    try {
      setIsLoading(true);
      const exportData = await templateService.exportTemplates(templateIds);
      setExportData(exportData);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `service-desk-templates-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao exportar templates');
      console.error('Error exporting templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportTemplates = async (file: File) => {
    try {
      setIsLoading(true);
      const text = await file.text();
      const exportData: TemplateExport = JSON.parse(text);
      const importResult = await templateService.importTemplates(exportData);
      setImportData(importResult);
      
      // Reload templates
      await loadTemplates();
    } catch (err) {
      setError('Erro ao importar templates');
      console.error('Error importing templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getComplexityColor = (complexity: TemplateComplexity) => {
    switch (complexity) {
      case TemplateComplexity.BASIC: return 'bg-green-100 text-green-800';
      case TemplateComplexity.INTERMEDIATE: return 'bg-yellow-100 text-yellow-800';
      case TemplateComplexity.ADVANCED: return 'bg-orange-100 text-orange-800';
      case TemplateComplexity.EXPERT: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: TemplateType) => {
    switch (type) {
      case TemplateType.PRESET: return <Award className="h-4 w-4" />;
      case TemplateType.USER_TEMPLATE: return <Users className="h-4 w-4" />;
      case TemplateType.ORGANIZATION_TEMPLATE: return <BookOpen className="h-4 w-4" />;
      case TemplateType.INDUSTRY_TEMPLATE: return <TrendingUp className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Gerenciador de Templates</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="browse">Navegar</TabsTrigger>
              <TabsTrigger value="create">Criar</TabsTrigger>
              <TabsTrigger value="import-export">Importar/Exportar</TabsTrigger>
              <TabsTrigger value="analytics">Análises</TabsTrigger>
            </TabsList>

            {/* Browse Templates Tab */}
            <TabsContent value="browse" className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full flex flex-col">
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      <SelectItem value={TemplateCategory.COMPLETE_PROJECT}>Projeto Completo</SelectItem>
                      <SelectItem value={TemplateCategory.TEAM_CONFIGURATION}>Configuração de Equipe</SelectItem>
                      <SelectItem value={TemplateCategory.TAX_CONFIGURATION}>Configuração de Impostos</SelectItem>
                      <SelectItem value={TemplateCategory.COST_STRUCTURE}>Estrutura de Custos</SelectItem>
                      <SelectItem value={TemplateCategory.MARKET_VARIABLES}>Variáveis de Mercado</SelectItem>
                      <SelectItem value={TemplateCategory.INDUSTRY_SPECIFIC}>Específico da Indústria</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os tipos</SelectItem>
                      <SelectItem value={TemplateType.PRESET}>Preset</SelectItem>
                      <SelectItem value={TemplateType.USER_TEMPLATE}>Template do Usuário</SelectItem>
                      <SelectItem value={TemplateType.ORGANIZATION_TEMPLATE}>Template da Organização</SelectItem>
                      <SelectItem value={TemplateType.INDUSTRY_TEMPLATE}>Template da Indústria</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedComplexity} onValueChange={(value) => setSelectedComplexity(value as any)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Complexidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as complexidades</SelectItem>
                      <SelectItem value={TemplateComplexity.BASIC}>Básico</SelectItem>
                      <SelectItem value={TemplateComplexity.INTERMEDIATE}>Intermediário</SelectItem>
                      <SelectItem value={TemplateComplexity.ADVANCED}>Avançado</SelectItem>
                      <SelectItem value={TemplateComplexity.EXPERT}>Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Templates Grid */}
                <div className="flex-1 overflow-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p>Carregando templates...</p>
                      </div>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum template encontrado</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTemplates.map((template) => (
                        <Card key={template.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(template.type)}
                                <CardTitle className="text-sm font-medium truncate">
                                  {template.name}
                                </CardTitle>
                              </div>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApplyTemplate(template)}
                                  disabled={!currentData}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {template.type === TemplateType.USER_TEMPLATE && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {template.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-1">
                              <Badge className={getComplexityColor(template.metadata.complexity)}>
                                {template.metadata.complexity}
                              </Badge>
                              {template.metadata.serviceTypes.map(serviceType => (
                                <Badge key={serviceType} variant="outline">
                                  {serviceType}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {template.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.tags.length - 3}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3" />
                                <span>{template.metadata.teamSize.optimal} pessoas</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{template.metadata.contractDuration.optimalMonths}m</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{template.usageCount}</span>
                              </div>
                            </div>

                            <Button
                              className="w-full"
                              onClick={() => handleApplyTemplate(template)}
                              disabled={!currentData || isLoading}
                            >
                              Aplicar Template
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Create Template Tab */}
            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={createTemplateData.name}
                        onChange={(e) => setCreateTemplateData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Service Desk Básico"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="template-category">Categoria</Label>
                      <Select
                        value={createTemplateData.category}
                        onValueChange={(value) => setCreateTemplateData(prev => ({ ...prev, category: value as TemplateCategory }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TemplateCategory.COMPLETE_PROJECT}>Projeto Completo</SelectItem>
                          <SelectItem value={TemplateCategory.TEAM_CONFIGURATION}>Configuração de Equipe</SelectItem>
                          <SelectItem value={TemplateCategory.TAX_CONFIGURATION}>Configuração de Impostos</SelectItem>
                          <SelectItem value={TemplateCategory.COST_STRUCTURE}>Estrutura de Custos</SelectItem>
                          <SelectItem value={TemplateCategory.MARKET_VARIABLES}>Variáveis de Mercado</SelectItem>
                          <SelectItem value={TemplateCategory.INDUSTRY_SPECIFIC}>Específico da Indústria</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-description">Descrição</Label>
                    <Textarea
                      id="template-description"
                      value={createTemplateData.description}
                      onChange={(e) => setCreateTemplateData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva o propósito e aplicação deste template..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="template-tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="template-tags"
                      value={createTemplateData.tags}
                      onChange={(e) => setCreateTemplateData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Ex: básico, suporte, ti, pequena empresa"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="template-public"
                      checked={createTemplateData.isPublic}
                      onChange={(e) => setCreateTemplateData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    />
                    <Label htmlFor="template-public">Tornar template público</Label>
                  </div>

                  <Button
                    onClick={handleCreateTemplate}
                    disabled={!currentData || !createTemplateData.name || isLoading}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Template
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Import/Export Tab */}
            <TabsContent value="import-export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-5 w-5" />
                      <span>Exportar Templates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Exporte seus templates para backup ou compartilhamento.
                    </p>
                    <Button
                      onClick={() => handleExportTemplates(templates.map(t => t.id))}
                      disabled={templates.length === 0 || isLoading}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Todos os Templates
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-5 w-5" />
                      <span>Importar Templates</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Importe templates de um arquivo JSON.
                    </p>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImportTemplates(file);
                        }
                      }}
                      disabled={isLoading}
                    />
                  </CardContent>
                </Card>
              </div>

              {importData && (
                <Alert>
                  <AlertDescription>
                    Importação concluída! {importData.source.templates.length} templates processados.
                    {importData.conflicts.length > 0 && (
                      <span> {importData.conflicts.length} conflitos encontrados.</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Total de Templates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{templates.length}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Templates Públicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {templates.filter(t => t.isPublic).length}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Mais Usado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      {templates.length > 0 ? (
                        templates.reduce((prev, current) => 
                          prev.usageCount > current.usageCount ? prev : current
                        ).name
                      ) : (
                        'N/A'
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Templates por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.values(TemplateCategory).map(category => {
                      const count = templates.filter(t => t.category === category).length;
                      return (
                        <div key={category} className="flex justify-between items-center">
                          <span className="text-sm">{category}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}