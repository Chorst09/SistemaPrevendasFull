'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Activity, Download, Save } from 'lucide-react';
import { NOCPricingData, NOCTabValidationStatus } from '@/lib/types/noc-pricing';
import { NOCDataManager } from '@/lib/services/noc-data-manager';
import { NOCValidationEngine } from '@/lib/services/noc-validation-engine';
import { NOCCalculationEngine } from '@/lib/services/noc-calculation-engine';

// Tabs do sistema NOC
const NOC_TABS = [
  { id: 'project', label: 'Projeto', description: 'Dados básicos do projeto NOC' },
  { id: 'devices', label: 'Dispositivos', description: 'Dispositivos e infraestrutura monitorada' },
  { id: 'monitoring', label: 'Monitoramento', description: 'Configuração de ferramentas e alertas' },
  { id: 'sla', label: 'SLA', description: 'Acordo de nível de serviço' },
  { id: 'team', label: 'Equipe', description: 'Equipe NOC e turnos' },
  { id: 'costs', label: 'Custos', description: 'Custos operacionais' },
  { id: 'taxes', label: 'Impostos', description: 'Impostos e encargos' },
  { id: 'variables', label: 'Variáveis', description: 'Margens e variáveis econômicas' },
  { id: 'calculations', label: 'Cálculos', description: 'Resultados e análises' },
  { id: 'report', label: 'Relatório', description: 'Relatório final' }
];

export function NOCPricingSystem() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<NOCPricingData>(NOCDataManager.createEmptyData());
  const [validationStatus, setValidationStatus] = useState<Record<string, NOCTabValidationStatus>>({});
  const [activeTab, setActiveTab] = useState('project');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dataManager = useMemo(() => new NOCDataManager(), []);
  const validationEngine = useMemo(() => new NOCValidationEngine(), []);

  // Previne erros de SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const loadedData = await dataManager.loadData();
        setData(loadedData);

        // Valida todas as abas
        const validations: Record<string, NOCTabValidationStatus> = {};
        NOC_TABS.forEach(tab => {
          const tabData = dataManager.getTabData(loadedData, tab.id);
          validations[tab.id] = validationEngine.validateTabData(tab.id, tabData);
        });
        setValidationStatus(validations);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isMounted) {
      loadData();
    }
  }, [isMounted, dataManager, validationEngine]);

  // Atualiza dados de uma aba
  const handleDataUpdate = useCallback(async (tabId: string, tabData: any) => {
    try {
      setIsLoading(true);

      // Atualiza dados
      const updatedData = dataManager.updateTabData(data, tabId, tabData);
      
      // Recalcula se necessário
      if (tabId !== 'calculations' && tabId !== 'report') {
        updatedData.calculations = NOCCalculationEngine.calculateAll(updatedData);
      }
      
      setData(updatedData);

      // Valida
      const validation = validationEngine.validateTabData(tabId, tabData);
      setValidationStatus(prev => ({
        ...prev,
        [tabId]: validation
      }));

      // Persiste
      await dataManager.persistData(updatedData);
    } catch (error) {
      console.error('Error updating data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [data, dataManager, validationEngine]);

  // Salva manualmente
  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      await dataManager.persistData(data);
      await dataManager.createBackup(data);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, dataManager]);

  // Exporta dados
  const handleExport = useCallback(() => {
    const json = dataManager.exportToJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noc-pricing-${data.project.projectName || 'projeto'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, dataManager]);

  // Obtém status da aba
  const getTabStatus = (tabId: string) => {
    const status = validationStatus[tabId];
    if (!status) return 'default';
    if (status.errors.length > 0) return 'error';
    if (status.warnings.length > 0) return 'warning';
    if (status.isComplete) return 'success';
    return 'default';
  };

  // Obtém cor do badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      case 'success': return 'default';
      default: return 'outline';
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold">Sistema de Precificação NOC</h1>
                <p className="text-sm text-gray-500 font-normal">
                  Network Operations Center - Monitoramento e Gestão de Infraestrutura
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Salvar</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-2 h-auto">
              {NOC_TABS.map(tab => {
                const status = getTabStatus(tab.id);
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center space-y-1 p-2"
                  >
                    <span className="text-xs">{tab.label}</span>
                    <Badge variant={getStatusColor(status)} className="text-xs">
                      {status === 'success' ? '✓' : status === 'error' ? '✗' : '○'}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Conteúdo das abas será implementado nos próximos componentes */}
            <div className="mt-6">
              <TabsContent value="project">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Dados do Projeto</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="devices">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Dispositivos Monitorados</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="monitoring">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Configuração de Monitoramento</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="sla">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">SLA - Acordo de Nível de Serviço</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="team">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Equipe NOC</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="costs">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Custos Operacionais</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="taxes">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Impostos e Encargos</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="variables">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Variáveis Econômicas</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>

              <TabsContent value="calculations">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Cálculos e Resultados</h3>
                  {data.calculations ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Custo Mensal Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {data.project.currency} {data.calculations.monthlyTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Preço Final Mensal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold text-green-600">
                            {data.project.currency} {data.calculations.finalMonthlyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Custo por Dispositivo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {data.project.currency} {data.calculations.costPerDevice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Rentabilidade</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {data.calculations.profitability.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">ROI</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">
                            {data.calculations.roi.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Competitividade</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Badge variant={
                            data.calculations.competitiveness === 'competitive' ? 'default' :
                            data.calculations.competitiveness === 'low' ? 'secondary' : 'destructive'
                          }>
                            {data.calculations.competitiveness === 'competitive' ? 'Competitivo' :
                             data.calculations.competitiveness === 'low' ? 'Abaixo do Mercado' : 'Acima do Mercado'}
                          </Badge>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <p className="text-gray-500">Preencha os dados para ver os cálculos</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="report">
                <div className="p-6 border rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Relatório Final</h3>
                  <p className="text-gray-500">Componente em desenvolvimento...</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
