'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectGeneratorService } from '@/lib/services/project-generator-service';
import { UnifiedProposalService, UnifiedProposal } from '@/lib/services/unified-proposal-service';
import { ProjectGenerationConfig } from '@/lib/types/project';
import { Project } from '@/lib/types/project';
import { X, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectGeneratorModalProps {
  onClose: () => void;
  onGenerate: (project: Project) => void;
}

export function ProjectGeneratorModal({ onClose, onGenerate }: ProjectGeneratorModalProps) {
  const [proposals, setProposals] = useState<UnifiedProposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [config, setConfig] = useState({
    useProposalTimeline: true,
    useProposalBudget: true,
    useProposalScope: true,
    assignTeamMembers: true,
    generateRisks: true,
    generateTasks: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = () => {
    console.log('ProjectGeneratorModal - Carregando propostas...');
    const allProposals = UnifiedProposalService.getAllProposals();
    console.log('ProjectGeneratorModal - Total de propostas:', allProposals.length);
    console.log('ProjectGeneratorModal - Propostas:', allProposals);
    
    // Filtrar apenas propostas aprovadas ou enviadas
    const validProposals = allProposals.filter(p => 
      p.status === 'approved' || p.status === 'sent' || p.status === 'draft'
    );
    console.log('ProjectGeneratorModal - Propostas válidas:', validProposals.length);
    console.log('ProjectGeneratorModal - Propostas válidas:', validProposals);
    
    setProposals(validProposals);
  };

  const handleProposalChange = (proposalId: string) => {
    setSelectedProposalId(proposalId);
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal && !projectName) {
      setProjectName(`Projeto - ${proposal.title}`);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProposalId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma proposta para gerar o projeto',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generationConfig: ProjectGenerationConfig = {
        proposalId: selectedProposalId,
        projectName: projectName || undefined,
        startDate: startDate || undefined,
        ...config
      };

      const project = await ProjectGeneratorService.generateFromProposal(generationConfig);

      toast({
        title: 'Projeto Gerado!',
        description: `O projeto "${project.name}" foi criado com sucesso.`,
        variant: 'default'
      });

      onGenerate(project);
    } catch (error) {
      console.error('Erro ao gerar projeto:', error);
      toast({
        title: 'Erro ao Gerar Projeto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProposal = proposals.find(p => p.id === selectedProposalId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Gerar Projeto</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Crie um projeto automaticamente a partir de uma proposta aprovada
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Debug Info */}
          <div className="bg-gray-100 p-3 rounded text-xs">
            <p><strong>Debug:</strong> {proposals.length} propostas carregadas</p>
            <p><strong>Storage Key:</strong> unified-proposals</p>
          </div>

          {/* Seleção de Proposta */}
          <div className="space-y-2">
            <Label>Proposta Base *</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecione uma proposta da lista de Propostas para gerar o projeto
            </p>
            <Select value={selectedProposalId} onValueChange={handleProposalChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma proposta da lista" />
              </SelectTrigger>
              <SelectContent>
                {proposals.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhuma proposta disponível
                  </SelectItem>
                ) : (
                  proposals.map(proposal => (
                    <SelectItem key={proposal.id} value={proposal.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{proposal.title}</span>
                        <span className="text-xs text-gray-500">
                          {proposal.client} • {proposal.type === 'noc' ? 'NOC' : 'Comercial'}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {proposals.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-red-600">
                  Nenhuma proposta disponível. Acesse o menu "Propostas" para criar uma proposta primeiro.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Tentar migrar propostas antigas
                    UnifiedProposalService.migrateOldProposals().then(() => {
                      loadProposals();
                    });
                  }}
                  className="w-full"
                >
                  Tentar Migrar Propostas Antigas
                </Button>
              </div>
            )}
          </div>

          {/* Preview da Proposta Selecionada */}
          {selectedProposal && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Proposta Selecionada</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Cliente:</strong> {selectedProposal.client}</p>
                <p><strong>Tipo:</strong> {selectedProposal.type === 'noc' ? 'NOC' : 'Comercial'}</p>
                {selectedProposal.type === 'noc' && selectedProposal.nocData && (
                  <>
                    <p><strong>Dispositivos:</strong> {selectedProposal.nocData.data.totalDevices}</p>
                    <p><strong>Cobertura:</strong> {selectedProposal.nocData.data.project.coverage}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Configurações do Projeto */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Projeto *</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Implementação NOC - Cliente XYZ"
              />
            </div>

            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>

          {/* Opções de Geração */}
          <div className="space-y-3">
            <Label className="text-base">Opções de Geração</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.useProposalTimeline}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, useProposalTimeline: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label className="font-normal">Usar cronograma da proposta</Label>
                  <p className="text-xs text-gray-500">
                    Importar fases e milestones da proposta
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.useProposalBudget}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, useProposalBudget: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label className="font-normal">Usar orçamento da proposta</Label>
                  <p className="text-xs text-gray-500">
                    Importar valores e breakdown de custos
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.useProposalScope}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, useProposalScope: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label className="font-normal">Usar escopo da proposta</Label>
                  <p className="text-xs text-gray-500">
                    Importar objetivos, entregas e restrições
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.generateRisks}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, generateRisks: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label className="font-normal">Gerar riscos automaticamente</Label>
                  <p className="text-xs text-gray-500">
                    Identificar riscos comuns do tipo de projeto
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.generateTasks}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, generateTasks: checked as boolean })
                  }
                />
                <div className="flex-1">
                  <Label className="font-normal">Gerar tarefas automaticamente</Label>
                  <p className="text-xs text-gray-500">
                    Criar tarefas padrão para cada fase
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              className="flex-1"
              disabled={!selectedProposalId || !projectName || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Projeto
                </>
              )}
            </Button>
          </div>
          
          {/* Debug - Condições do botão */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>Proposta selecionada: {selectedProposalId ? '✓' : '✗'}</p>
            <p>Nome do projeto: {projectName ? '✓' : '✗'}</p>
            <p>Botão habilitado: {(!selectedProposalId || !projectName || isGenerating) ? '✗' : '✓'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
