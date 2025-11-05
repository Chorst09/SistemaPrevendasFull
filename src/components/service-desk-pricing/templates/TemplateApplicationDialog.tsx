'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  ArrowRight,
  Users,
  DollarSign,
  Calendar,
  Settings
} from 'lucide-react';

import {
  TemplateApplication,
  TemplateConflict,
  ConflictResolution,
  ServiceDeskTemplate
} from '@/lib/types/service-desk-templates';
import { ServiceDeskData } from '@/lib/types/service-desk-pricing';

export interface TemplateApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (application: TemplateApplication, resolutions: Record<string, ConflictResolution>) => void;
  onCancel: () => void;
  template: ServiceDeskTemplate | null;
  application: TemplateApplication | null;
}

export function TemplateApplicationDialog({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  template,
  application
}: TemplateApplicationDialogProps) {
  const [conflictResolutions, setConflictResolutions] = useState<Record<string, ConflictResolution>>({});
  const [activeTab, setActiveTab] = useState('overview');

  if (!template || !application) {
    return null;
  }

  const handleConflictResolution = (conflictField: string, resolution: ConflictResolution) => {
    setConflictResolutions(prev => ({
      ...prev,
      [conflictField]: resolution
    }));
  };

  const handleConfirm = () => {
    onConfirm(application, conflictResolutions);
    onClose();
  };

  const getConflictIcon = (resolution: ConflictResolution) => {
    switch (resolution) {
      case ConflictResolution.USE_TEMPLATE:
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case ConflictResolution.KEEP_EXISTING:
        return <XCircle className="h-4 w-4 text-red-600" />;
      case ConflictResolution.MERGE:
        return <ArrowRight className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getResolutionDescription = (resolution: ConflictResolution) => {
    switch (resolution) {
      case ConflictResolution.USE_TEMPLATE:
        return 'Usar valor do template';
      case ConflictResolution.KEEP_EXISTING:
        return 'Manter valor existente';
      case ConflictResolution.MERGE:
        return 'Combinar valores';
      default:
        return 'Perguntar ao usuário';
    }
  };

  const hasUnresolvedConflicts = application.conflicts.some(
    conflict => !conflictResolutions[conflict.field]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Aplicar Template: {template.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="conflicts">
                Conflitos {application.conflicts.length > 0 && `(${application.conflicts.length})`}
              </TabsTrigger>
              <TabsTrigger value="changes">Alterações</TabsTrigger>
              <TabsTrigger value="preview">Prévia</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1 overflow-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo da Aplicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Template</h4>
                      <div className="space-y-2">
                        <p className="text-sm"><strong>Nome:</strong> {template.name}</p>
                        <p className="text-sm"><strong>Categoria:</strong> {template.category}</p>
                        <p className="text-sm"><strong>Complexidade:</strong> {template.metadata.complexity}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Impacto</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">
                            Equipe: {template.metadata.teamSize.optimal} pessoas
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            Contrato: {template.metadata.contractDuration.optimalMonths} meses
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">
                            Tipos de serviço: {template.metadata.serviceTypes.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {application.warnings.length > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Avisos:</p>
                          {application.warnings.map((warning, index) => (
                            <p key={index} className="text-sm">• {warning}</p>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conflicts Tab */}
            <TabsContent value="conflicts" className="flex-1 overflow-auto space-y-4">
              {application.conflicts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">Nenhum conflito encontrado</p>
                    <p className="text-sm text-gray-600">
                      O template pode ser aplicado sem problemas.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Foram encontrados {application.conflicts.length} conflitos que precisam ser resolvidos antes de aplicar o template.
                    </AlertDescription>
                  </Alert>

                  {application.conflicts.map((conflict, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Conflito em: {conflict.field}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm mb-2">Valor Existente</h5>
                            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
                              {JSON.stringify(conflict.existingValue, null, 2)}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm mb-2">Valor do Template</h5>
                            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                              {JSON.stringify(conflict.templateValue, null, 2)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Resolução</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Button
                              variant={conflictResolutions[conflict.field] === ConflictResolution.USE_TEMPLATE ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleConflictResolution(conflict.field, ConflictResolution.USE_TEMPLATE)}
                              className="justify-start"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Usar Template
                            </Button>
                            <Button
                              variant={conflictResolutions[conflict.field] === ConflictResolution.KEEP_EXISTING ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleConflictResolution(conflict.field, ConflictResolution.KEEP_EXISTING)}
                              className="justify-start"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Manter Existente
                            </Button>
                            <Button
                              variant={conflictResolutions[conflict.field] === ConflictResolution.MERGE ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleConflictResolution(conflict.field, ConflictResolution.MERGE)}
                              className="justify-start"
                              disabled={true} // TODO: Implement merge logic
                            >
                              <ArrowRight className="h-4 w-4 mr-2" />
                              Combinar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Changes Tab */}
            <TabsContent value="changes" className="flex-1 overflow-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alterações que serão aplicadas</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.customizations.length === 0 ? (
                    <p className="text-sm text-gray-600">
                      Nenhuma customização será aplicada.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {application.customizations.map((customization, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h5 className="font-medium text-sm">{customization.field}</h5>
                          <p className="text-xs text-gray-600 mb-2">{customization.reason}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">De:</span>
                              <div className="bg-red-50 p-2 rounded mt-1">
                                {JSON.stringify(customization.originalValue)}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Para:</span>
                              <div className="bg-green-50 p-2 rounded mt-1">
                                {JSON.stringify(customization.customValue)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="flex-1 overflow-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Prévia do Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Esta é uma prévia das principais alterações que serão aplicadas aos seus dados.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-4 space-y-4">
                    {/* Project Changes */}
                    {template.data.projectTemplate && (
                      <div>
                        <h5 className="font-medium mb-2">Configurações do Projeto</h5>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          <p><strong>Tipo de Serviço:</strong> {template.data.projectTemplate.serviceType}</p>
                          <p><strong>Moeda:</strong> {template.data.projectTemplate.defaultCurrency}</p>
                          <p><strong>Duração do Contrato:</strong> {template.data.projectTemplate.defaultContractDuration} meses</p>
                        </div>
                      </div>
                    )}

                    {/* Team Changes */}
                    {template.data.teamTemplate && template.data.teamTemplate.roles && (
                      <div>
                        <h5 className="font-medium mb-2">Equipe ({template.data.teamTemplate.roles.length} cargos)</h5>
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                          {template.data.teamTemplate.roles.slice(0, 3).map((role: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>{role.role}</span>
                              <span>R$ {role.baseSalaryRange?.average?.toLocaleString('pt-BR')}</span>
                            </div>
                          ))}
                          {template.data.teamTemplate.roles.length > 3 && (
                            <p className="text-gray-600">
                              +{template.data.teamTemplate.roles.length - 3} cargos adicionais
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Costs Changes */}
                    {template.data.costsTemplate && template.data.costsTemplate.commonCosts && (
                      <div>
                        <h5 className="font-medium mb-2">Custos Adicionais ({template.data.costsTemplate.commonCosts.length} itens)</h5>
                        <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                          {template.data.costsTemplate.commonCosts.slice(0, 3).map((cost: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span>{cost.name}</span>
                              <span>R$ {cost.estimatedValue?.toLocaleString('pt-BR')}</span>
                            </div>
                          ))}
                          {template.data.costsTemplate.commonCosts.length > 3 && (
                            <p className="text-gray-600">
                              +{template.data.costsTemplate.commonCosts.length - 3} custos adicionais
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center space-x-2">
            {application.conflicts.length > 0 && (
              <>
                {getConflictIcon(ConflictResolution.ASK_USER)}
                <span className="text-sm text-gray-600">
                  {hasUnresolvedConflicts 
                    ? `${application.conflicts.length - Object.keys(conflictResolutions).length} conflitos não resolvidos`
                    : 'Todos os conflitos resolvidos'
                  }
                </span>
              </>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={hasUnresolvedConflicts}
            >
              Aplicar Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}