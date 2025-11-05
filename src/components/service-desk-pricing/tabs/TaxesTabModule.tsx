'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Save, AlertTriangle, Info } from 'lucide-react';
import { TaxConfiguration, TabValidationStatus, CustomTax, TaxRegime } from '@/lib/types/service-desk-pricing';
import { ServiceDeskCalculationEngine } from '@/lib/services/service-desk-calculation-engine';
import { TaxTemplateService, TaxTemplate } from '@/lib/services/tax-template-service';

export interface TaxesTabModuleProps {
  data: TaxConfiguration;
  onUpdate: (data: TaxConfiguration) => void;
  onAutoSave?: (data: TaxConfiguration) => void;
  validation?: TabValidationStatus;
  isLoading?: boolean;
}

export function TaxesTabModule({ data, onUpdate, onAutoSave, validation, isLoading }: TaxesTabModuleProps) {
  const [calculationEngine] = useState(() => new ServiceDeskCalculationEngine());
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCustomTaxDialog, setShowCustomTaxDialog] = useState(false);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [templates, setTemplates] = useState<TaxTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<TaxTemplate[]>([]);
  const [templateFilter, setTemplateFilter] = useState<{ region: string; taxRegime: TaxRegime | 'all' | ''; category: string }>({ region: '', taxRegime: 'all', category: 'all' });
  const [newCustomTax, setNewCustomTax] = useState<Partial<CustomTax>>({
    name: '',
    rate: 0,
    calculationBase: 'revenue',
    description: ''
  });
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'mixed' as const
  });
  const [importData, setImportData] = useState('');
  const [taxCalculationPreview, setTaxCalculationPreview] = useState<any>(null);
  const [taxValidation, setTaxValidation] = useState<any>(null);
  const [regionalInfo, setRegionalInfo] = useState<any>(null);

  // Load templates on component mount
  useEffect(() => {
    const loadedTemplates = TaxTemplateService.getTemplates();
    setTemplates(loadedTemplates);
    setFilteredTemplates(loadedTemplates);
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (onAutoSave) {
      const timer = setTimeout(() => {
        onAutoSave(data);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, onAutoSave]);

  // Calculate tax preview and validation when data changes
  useEffect(() => {
    const previewRevenue = 100000; // R$ 100,000 for preview
    const result = calculationEngine.calculateTaxes(previewRevenue, data);
    setTaxCalculationPreview(result);

    const validationResult = TaxTemplateService.validateTaxConfiguration(data);
    setTaxValidation(validationResult);

    if (data.region) {
      const regionInfo = TaxTemplateService.getRegionalTaxInfo(data.region);
      setRegionalInfo(regionInfo);
    }
  }, [data, calculationEngine]);

  // Filter templates when filter changes
  useEffect(() => {
    const filterParams = {
      region: templateFilter.region || undefined,
      taxRegime: (templateFilter.taxRegime && templateFilter.taxRegime !== 'all') ? templateFilter.taxRegime : undefined,
      category: (templateFilter.category && templateFilter.category !== 'all') ? templateFilter.category : undefined
    };
    const filtered = TaxTemplateService.getTemplatesByFilter(filterParams);
    setFilteredTemplates(filtered);
  }, [templateFilter, templates]);

  const handleTaxRateChange = (taxType: keyof TaxConfiguration, value: string) => {
    const numericValue = parseFloat(value) || 0;
    onUpdate({
      ...data,
      [taxType]: numericValue
    });
  };

  const handleRegionChange = (region: string) => {
    onUpdate({
      ...data,
      region
    });
  };

  const handleTaxRegimeChange = (regime: TaxRegime) => {
    onUpdate({
      ...data,
      taxRegime: regime
    });
  };

  const handleApplyTemplate = (template: TaxTemplate) => {
    onUpdate({
      ...data,
      region: template.region,
      taxRegime: template.taxRegime,
      ...template.taxes,
      customTaxes: [...data.customTaxes, ...template.customTaxes]
    });
    setShowTemplateDialog(false);
  };

  const handleSaveAsTemplate = () => {
    if (newTemplate.name) {
      try {
        const template = TaxTemplateService.saveTemplate({
          name: newTemplate.name,
          region: data.region,
          taxRegime: data.taxRegime,
          taxes: {
            icms: data.icms,
            pis: data.pis,
            cofins: data.cofins,
            iss: data.iss,
            ir: data.ir,
            csll: data.csll
          },
          customTaxes: data.customTaxes,
          description: newTemplate.description,
          category: newTemplate.category
        });

        const updatedTemplates = TaxTemplateService.getTemplates();
        setTemplates(updatedTemplates);
        setFilteredTemplates(updatedTemplates);
        setShowSaveTemplateDialog(false);
        setNewTemplate({ name: '', description: '', category: 'mixed' });
      } catch (error) {
        console.error('Error saving template:', error);
      }
    }
  };

  const handleImportConfiguration = () => {
    try {
      const importedConfig = TaxTemplateService.importConfiguration(importData);
      onUpdate(importedConfig);
      setShowImportDialog(false);
      setImportData('');
    } catch (error) {
      console.error('Error importing configuration:', error);
    }
  };

  const handleExportConfiguration = () => {
    try {
      const exportData = TaxTemplateService.exportConfiguration(data);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-config-${data.region.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting configuration:', error);
    }
  };

  const handleAddCustomTax = () => {
    if (newCustomTax.name && newCustomTax.rate !== undefined) {
      const customTax: CustomTax = {
        name: newCustomTax.name,
        rate: newCustomTax.rate,
        calculationBase: newCustomTax.calculationBase || 'revenue',
        description: newCustomTax.description || ''
      };

      onUpdate({
        ...data,
        customTaxes: [...data.customTaxes, customTax]
      });

      setNewCustomTax({
        name: '',
        rate: 0,
        calculationBase: 'revenue',
        description: ''
      });
      setShowCustomTaxDialog(false);
    }
  };

  const handleRemoveCustomTax = (index: number) => {
    const updatedCustomTaxes = data.customTaxes.filter((_, i) => i !== index);
    onUpdate({
      ...data,
      customTaxes: updatedCustomTaxes
    });
  };

  const getTaxRegimeLabel = (regime: TaxRegime) => {
    switch (regime) {
      case TaxRegime.SIMPLES_NACIONAL:
        return 'Simples Nacional';
      case TaxRegime.LUCRO_PRESUMIDO:
        return 'Lucro Presumido';
      case TaxRegime.LUCRO_REAL:
        return 'Lucro Real';
      default:
        return 'Não definido';
    }
  };

  const getCalculationBaseLabel = (base: string) => {
    switch (base) {
      case 'revenue':
        return 'Receita';
      case 'profit':
        return 'Lucro';
      case 'fixed':
        return 'Valor Fixo';
      default:
        return base;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Configuração de Impostos</h2>
          <p className="text-muted-foreground">
            Configure os impostos aplicáveis ao projeto
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Templates de Impostos</DialogTitle>
              </DialogHeader>
              
              {/* Template filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Filtrar por Região</Label>
                  <Input
                    placeholder="Ex: São Paulo"
                    value={templateFilter.region}
                    onChange={(e) => setTemplateFilter({ ...templateFilter, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Regime Tributário</Label>
                  <Select 
                    value={templateFilter.taxRegime} 
                    onValueChange={(value) => setTemplateFilter({ ...templateFilter, taxRegime: value as TaxRegime | 'all' | '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value={TaxRegime.SIMPLES_NACIONAL}>Simples Nacional</SelectItem>
                      <SelectItem value={TaxRegime.LUCRO_PRESUMIDO}>Lucro Presumido</SelectItem>
                      <SelectItem value={TaxRegime.LUCRO_REAL}>Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={templateFilter.category} 
                    onValueChange={(value) => setTemplateFilter({ ...templateFilter, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="state">Estadual</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="mixed">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTemplates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => handleApplyTemplate(template)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{template.name}</h4>
                            {template.isDefault && <Badge variant="secondary">Padrão</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex gap-2 mb-2">
                            <Badge variant="secondary">{getTaxRegimeLabel(template.taxRegime)}</Badge>
                            <Badge variant="outline">{template.region}</Badge>
                            <Badge variant="outline" className="capitalize">{template.category}</Badge>
                          </div>
                          {template.customTaxes.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              +{template.customTaxes.length} imposto(s) customizado(s)
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm space-y-1">
                          <div>ISS: {template.taxes.iss}%</div>
                          <div>ICMS: {template.taxes.icms}%</div>
                          <div>PIS: {template.taxes.pis}%</div>
                          <div>COFINS: {template.taxes.cofins}%</div>
                          {(template.taxes.ir > 0 || template.taxes.csll > 0) && (
                            <>
                              <div>IR: {template.taxes.ir}%</div>
                              <div>CSLL: {template.taxes.csll}%</div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTemplates.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum template encontrado com os filtros aplicados
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSaveTemplateDialog} onOpenChange={setShowSaveTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar como Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="Ex: Minha Configuração SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Descrição do template"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newTemplate.category} 
                    onValueChange={(value) => setNewTemplate({ ...newTemplate, category: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="state">Estadual</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="mixed">Misto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSaveTemplateDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveAsTemplate}>
                    Salvar Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                Importar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Configuração</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dados JSON</Label>
                  <Textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Cole aqui os dados JSON da configuração"
                    rows={10}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportConfiguration}>
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExportConfiguration}>
            Exportar
          </Button>
        </div>
      </div>

      {/* Validation alerts */}
      {taxValidation && taxValidation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {taxValidation.errors.map((error: any, index: number) => (
                <div key={index}>{error.message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {taxValidation && taxValidation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {taxValidation.warnings.map((warning: any, index: number) => (
                <div key={index}>{warning.message}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validation && validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {validation.errors.map(error => error.message).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {validation && validation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {validation.warnings.map(warning => warning.message).join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Regional Information */}
      {regionalInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações Regionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Médias Regionais</h4>
                <div className="space-y-1 text-sm">
                  <div>ISS médio: {regionalInfo.averageISS}%</div>
                  <div>ICMS médio: {regionalInfo.averageICMS}%</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benefícios Comuns</h4>
                <div className="space-y-1 text-sm">
                  {regionalInfo.commonBenefits.map((benefit: string, index: number) => (
                    <div key={index}>• {benefit}</div>
                  ))}
                </div>
              </div>
            </div>
            {regionalInfo.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Recomendações</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {regionalInfo.recommendations.map((rec: string, index: number) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Impostos Básicos</TabsTrigger>
          <TabsTrigger value="custom">Impostos Customizados</TabsTrigger>
          <TabsTrigger value="preview">Prévia de Cálculo</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuração Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Região</Label>
                  <Input
                    id="region"
                    value={data.region}
                    onChange={(e) => handleRegionChange(e.target.value)}
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRegime">Regime Tributário</Label>
                  <Select value={data.taxRegime} onValueChange={handleTaxRegimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaxRegime.SIMPLES_NACIONAL}>Simples Nacional</SelectItem>
                      <SelectItem value={TaxRegime.LUCRO_PRESUMIDO}>Lucro Presumido</SelectItem>
                      <SelectItem value={TaxRegime.LUCRO_REAL}>Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Federal Taxes */}
          <Card>
            <CardHeader>
              <CardTitle>Impostos Federais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pis">PIS (%)</Label>
                  <Input
                    id="pis"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.pis}
                    onChange={(e) => handleTaxRateChange('pis', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cofins">COFINS (%)</Label>
                  <Input
                    id="cofins"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.cofins}
                    onChange={(e) => handleTaxRateChange('cofins', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ir">Imposto de Renda (%)</Label>
                  <Input
                    id="ir"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.ir}
                    onChange={(e) => handleTaxRateChange('ir', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="csll">CSLL (%)</Label>
                  <Input
                    id="csll"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.csll}
                    onChange={(e) => handleTaxRateChange('csll', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* State and Municipal Taxes */}
          <Card>
            <CardHeader>
              <CardTitle>Impostos Estaduais e Municipais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="icms">ICMS (%)</Label>
                  <Input
                    id="icms"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.icms}
                    onChange={(e) => handleTaxRateChange('icms', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iss">ISS (%)</Label>
                  <Input
                    id="iss"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={data.iss}
                    onChange={(e) => handleTaxRateChange('iss', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          {/* Custom Taxes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Impostos Customizados</CardTitle>
                <Dialog open={showCustomTaxDialog} onOpenChange={setShowCustomTaxDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Imposto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Imposto Customizado</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customTaxName">Nome do Imposto</Label>
                        <Input
                          id="customTaxName"
                          value={newCustomTax.name}
                          onChange={(e) => setNewCustomTax({ ...newCustomTax, name: e.target.value })}
                          placeholder="Ex: Taxa Municipal Específica"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customTaxRate">Taxa (%)</Label>
                        <Input
                          id="customTaxRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={newCustomTax.rate}
                          onChange={(e) => setNewCustomTax({ ...newCustomTax, rate: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customTaxBase">Base de Cálculo</Label>
                        <Select 
                          value={newCustomTax.calculationBase} 
                          onValueChange={(value) => setNewCustomTax({ ...newCustomTax, calculationBase: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="revenue">Receita</SelectItem>
                            <SelectItem value="profit">Lucro</SelectItem>
                            <SelectItem value="fixed">Valor Fixo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customTaxDescription">Descrição</Label>
                        <Textarea
                          id="customTaxDescription"
                          value={newCustomTax.description}
                          onChange={(e) => setNewCustomTax({ ...newCustomTax, description: e.target.value })}
                          placeholder="Descrição opcional do imposto"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCustomTaxDialog(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddCustomTax}>
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {data.customTaxes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum imposto customizado configurado
                </div>
              ) : (
                <div className="space-y-4">
                  {data.customTaxes.map((tax, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{tax.name}</h4>
                            <p className="text-sm text-muted-foreground">{tax.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">
                                {tax.calculationBase === 'fixed' ? `R$ ${tax.rate.toFixed(2)}` : `${tax.rate}%`}
                              </Badge>
                              <Badge variant="outline">
                                {getCalculationBaseLabel(tax.calculationBase)}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomTax(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Tax Calculation Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Prévia de Cálculo de Impostos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Baseado em uma receita de R$ 100.000,00
              </p>
            </CardHeader>
            <CardContent>
              {taxCalculationPreview && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Total de Impostos</Label>
                      <div className="text-2xl font-bold">
                        R$ {taxCalculationPreview.totalTaxes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Taxa Efetiva</Label>
                      <div className="text-2xl font-bold">
                        {taxCalculationPreview.effectiveRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Detalhamento por Imposto</h4>
                    {taxCalculationPreview.breakdown.map((tax: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                        <div>
                          <span className="font-medium">{tax.taxName}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({tax.rate}% sobre R$ {tax.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                          </span>
                        </div>
                        <span className="font-semibold">
                          R$ {tax.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {taxCalculationPreview.optimizationSuggestions.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h4 className="font-semibold">Sugestões de Otimização (Sistema)</h4>
                        {taxCalculationPreview.optimizationSuggestions.map((suggestion: string, index: number) => (
                          <Alert key={index}>
                            <Info className="h-4 w-4" />
                            <AlertDescription>{suggestion}</AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Additional optimization suggestions from template service */}
                  {(() => {
                    const additionalSuggestions = TaxTemplateService.getTaxOptimizationSuggestions(data);
                    return additionalSuggestions.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="font-semibold">Sugestões Avançadas de Otimização</h4>
                          {additionalSuggestions.map((suggestion: string, index: number) => (
                            <Alert key={index}>
                              <Info className="h-4 w-4" />
                              <AlertDescription>{suggestion}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}