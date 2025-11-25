'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommercialProposal, ProposalStatus } from '@/lib/types/commercial-proposal';
import { CommercialProposalService } from '@/lib/services/commercial-proposal-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Copy, 
  Download,
  Eye,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedProposalService, UnifiedProposal } from '@/lib/services/unified-proposal-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProposalCoverPage } from '@/components/propostas/ProposalCoverPage';
import { ProposalAboutPage } from '@/components/propostas/ProposalAboutPage';
import { ProposalClientsPage } from '@/components/propostas/ProposalClientsPage';
import { ProposalContentPage } from '@/components/propostas/ProposalContentPage';

export default function PropostasPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<UnifiedProposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'ALL'>('ALL');
  const [showCoverPage, setShowCoverPage] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(false);
  const [showClientsPage, setShowClientsPage] = useState(false);
  const [showContentPage, setShowContentPage] = useState(false);
  const [coverData, setCoverData] = useState<{ clientName: string; date: string; services: string[]; datacenterImage?: string } | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'commercial' | 'noc'>('ALL');
  const [showNOCSelector, setShowNOCSelector] = useState(false);
  const [selectedNOCId, setSelectedNOCId] = useState<string>('');

  useEffect(() => {
    console.log('PropostasPage - useEffect - Carregando propostas...');
    loadProposals();
    // Migrar propostas antigas na primeira vez
    UnifiedProposalService.migrateOldProposals();
  }, []);

  const loadProposals = () => {
    console.log('PropostasPage.loadProposals - Iniciando...');
    const allProposals = UnifiedProposalService.getAllProposals();
    console.log('PropostasPage.loadProposals - Propostas carregadas:', allProposals.length);
    console.log('PropostasPage.loadProposals - Propostas:', allProposals);
    
    // Verificar estrutura de cada proposta
    allProposals.forEach((p, index) => {
      console.log(`Proposta ${index + 1}:`, {
        id: p.id,
        type: p.type,
        title: p.title,
        client: p.client,
        status: p.status,
        hasNocData: !!p.nocData,
        hasCommercialData: !!p.commercialData
      });
    });
    
    setProposals(allProposals);
    console.log('PropostasPage.loadProposals - State atualizado com', allProposals.length, 'propostas');
  };

  const handleCreateNew = () => {
    // Mostrar página de capa primeiro
    setShowCoverPage(true);
  };

  const handleCoverPageContinue = (data: { clientName: string; date: string; services: string[]; datacenterImage?: string }) => {
    // Salvar dados da capa e ir para página "Quem Somos"
    setCoverData(data);
    setShowCoverPage(false);
    setShowAboutPage(true);
  };

  const handleAboutPageContinue = () => {
    // Após a página "Quem Somos", ir para página "Nossos Clientes"
    setShowAboutPage(false);
    setShowClientsPage(true);
  };

  const handleClientsPageContinue = () => {
    // Após a página "Nossos Clientes", ir para página de conteúdo (exemplo)
    setShowClientsPage(false);
    setShowContentPage(true);
  };

  const handleContentPageContinue = () => {
    // Após a página de conteúdo, verificar se existem propostas NOC
    const nocProposals = UnifiedProposalService.getNOCProposalsForSelection();
    
    setShowContentPage(false);
    
    if (nocProposals.length > 0) {
      // Mostrar seletor de proposta NOC
      setShowNOCSelector(true);
    } else {
      // Criar proposta comercial sem vincular NOC
      createCommercialProposal(undefined, coverData || undefined);
    }
  };

  const createCommercialProposal = (nocProposalId?: string, coverData?: { clientName: string; date: string; services: string[] }) => {
    const newProposal = CommercialProposalService.createEmptyProposal();
    
    // Preencher dados da capa se fornecidos
    if (coverData) {
      newProposal.cover.clientName = coverData.clientName;
      newProposal.cover.proposalDate = new Date(coverData.date);
      newProposal.title = `Proposta Comercial - ${coverData.clientName}`;
      newProposal.client = {
        ...newProposal.client,
        name: coverData.clientName
      };
      // Adicionar serviços como tags ou no sumário executivo
      if (coverData.services.length > 0) {
        newProposal.executiveSummary = {
          ...newProposal.executiveSummary,
          solution: `Fornecimento de serviços de ${coverData.services.join(', ')}.`
        };
      }
    }
    
    // Se tiver proposta NOC vinculada, preencher dados
    if (nocProposalId) {
      const nocProposal = UnifiedProposalService.getProposalById(nocProposalId);
      if (nocProposal && nocProposal.nocData) {
        const nocData = nocProposal.nocData.data;
        const calculations = nocProposal.nocData.calculations;
        
        // Preencher dados básicos
        newProposal.cover.clientName = nocProposal.client;
        newProposal.title = `Proposta Comercial - ${nocProposal.title}`;
        
        // Preencher cliente
        newProposal.client = {
          name: nocProposal.client,
          document: '',
          email: '',
          phone: '',
          address: {
            street: nocData?.project?.location || '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'Brasil'
          },
          contactPerson: '',
          contactEmail: '',
          contactPhone: ''
        };
        
        // Preencher investimento com valores calculados do NOC
        if (calculations) {
          // Função para arredondar valores para 2 casas decimais
          const roundValue = (value: number) => Math.round(value * 100) / 100;
          
          newProposal.investment = {
            plans: [
              {
                id: 'plan-monthly',
                name: 'Plano Mensal NOC',
                value: roundValue(calculations.finalMonthlyPrice || 0),
                recurrence: 'monthly',
                description: `Serviço de NOC ${nocData?.project?.coverage || '24x7'} com ${nocData?.totalDevices || 0} dispositivos monitorados`
              },
              {
                id: 'plan-annual',
                name: 'Plano Anual NOC',
                value: roundValue(calculations.finalAnnualPrice || 0),
                recurrence: 'annual',
                description: `Contrato anual com desconto - ${nocData?.project?.contractDuration || 12} meses`
              }
            ],
            setupFee: roundValue(calculations.monthlyInfrastructureCost || 0),
            paymentConditions: 'Pagamento mensal via boleto ou transferência bancária',
            contractTerms: `Contrato de ${nocData?.project?.contractDuration || 12} meses com SLA de ${nocData?.sla?.availability || 99.9}% de disponibilidade`
          };
          
          // Preencher sumário executivo com informações do NOC
          newProposal.executiveSummary = {
            problem: `Necessidade de monitoramento ${nocData?.project?.coverage || '24x7'} de ${nocData?.totalDevices || 0} dispositivos com SLA de ${nocData?.sla?.availability || 99.9}% de disponibilidade.`,
            solution: `Implementação de NOC (Network Operations Center) com nível de serviço ${nocData?.project?.serviceLevel || 'standard'}, utilizando ${nocData?.monitoring?.tools?.join(', ') || 'ferramentas de monitoramento'} e equipe especializada de ${nocData?.teamSize || 0} profissionais.`,
            mainBenefit: `Garantia de ${nocData?.sla?.availability || 99.9}% de disponibilidade, tempo de resposta de ${nocData?.sla?.responseTime || 15} minutos e resolução em até ${nocData?.sla?.resolutionTime || 4} horas.`
          };
        }
      }
    }
    
    CommercialProposalService.saveProposal(newProposal);
    UnifiedProposalService.saveCommercialProposal(newProposal, nocProposalId);
    
    setShowNOCSelector(false);
    setSelectedNOCId('');
    router.push(`/propostas/${newProposal.id}`);
  };

  const handleEdit = (proposal: UnifiedProposal) => {
    if (proposal.type === 'commercial') {
      router.push(`/propostas/${proposal.id}`);
    } else {
      // Para propostas NOC, poderia abrir o sistema NOC
      alert('Edição de propostas NOC será implementada em breve');
    }
  };

  const handleView = (proposal: UnifiedProposal) => {
    if (proposal.type === 'commercial' && proposal.commercialData) {
      const { ProposalPDFGenerator } = require('@/lib/services/proposal-pdf-generator');
      const generator = new ProposalPDFGenerator();
      generator.openPDFInNewTab(proposal.commercialData);
    } else if (proposal.type === 'noc') {
      alert('Visualização de propostas NOC será implementada em breve');
    }
  };

  const handleDuplicate = async (proposal: UnifiedProposal) => {
    try {
      if (proposal.type === 'commercial' && proposal.commercialData) {
        const duplicate = await CommercialProposalService.duplicateProposal(proposal.id);
        await UnifiedProposalService.saveCommercialProposal(duplicate, proposal.linkedNOCProposalId);
        loadProposals();
        router.push(`/propostas/${duplicate.id}`);
      }
    } catch (error) {
      console.error('Error duplicating proposal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      await UnifiedProposalService.deleteProposal(id);
      // Também deletar do serviço antigo se for comercial
      const proposal = UnifiedProposalService.getProposalById(id);
      if (proposal?.type === 'commercial') {
        await CommercialProposalService.deleteProposal(id);
      }
      loadProposals();
    }
  };

  const handleExport = (proposal: UnifiedProposal) => {
    const json = JSON.stringify(proposal, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposta-${proposal.type}-${proposal.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearOldData = () => {
    if (confirm('Isso irá remover todas as propostas antigas. Deseja continuar?')) {
      CommercialProposalService.clearOldData();
      loadProposals();
      alert('Dados antigos removidos com sucesso!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      'draft': { variant: 'secondary', label: 'Rascunho' },
      'sent': { variant: 'default', label: 'Enviada' },
      'approved': { variant: 'default', label: 'Aprovada' },
      'rejected': { variant: 'destructive', label: 'Rejeitada' },
      [ProposalStatus.DRAFT]: { variant: 'secondary', label: 'Rascunho' },
      [ProposalStatus.PENDING_REVIEW]: { variant: 'default', label: 'Em Revisão' },
      [ProposalStatus.SENT]: { variant: 'default', label: 'Enviada' },
      [ProposalStatus.APPROVED]: { variant: 'default', label: 'Aprovada' },
      [ProposalStatus.REJECTED]: { variant: 'destructive', label: 'Rejeitada' },
      [ProposalStatus.EXPIRED]: { variant: 'secondary', label: 'Expirada' }
    };

    const config = statusMap[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredProposals = proposals.filter(proposal => {
    // Garantir que title e client existem
    const title = proposal.title || '';
    const client = proposal.client || '';
    const status = proposal.status || 'draft';
    
    const matchesSearch = 
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'ALL' || proposal.type === filterType;

    const passes = matchesSearch && matchesStatus && matchesType;
    
    if (!passes) {
      console.log('Proposta filtrada (não passou):', {
        id: proposal.id,
        title,
        client,
        status,
        type: proposal.type,
        matchesSearch,
        matchesStatus,
        matchesType
      });
    }

    return passes;
  });

  const nocProposalsForSelection = UnifiedProposalService.getNOCProposalsForSelection();

  console.log('PropostasPage - Render:', {
    totalProposals: proposals.length,
    filteredProposals: filteredProposals.length,
    searchTerm,
    filterStatus,
    filterType
  });

  // Se estiver mostrando a página de capa, renderizar apenas ela
  if (showCoverPage) {
    return (
      <ProposalCoverPage
        onContinue={handleCoverPageContinue}
        onBack={() => setShowCoverPage(false)}
      />
    );
  }

  // Se estiver mostrando a página "Quem Somos", renderizar apenas ela
  if (showAboutPage) {
    return (
      <ProposalAboutPage
        onContinue={handleAboutPageContinue}
        onBack={() => {
          setShowAboutPage(false);
          setShowCoverPage(true);
        }}
      />
    );
  }

  // Se estiver mostrando a página "Nossos Clientes", renderizar apenas ela
  if (showClientsPage) {
    return (
      <ProposalClientsPage
        onContinue={handleClientsPageContinue}
        onBack={() => {
          setShowClientsPage(false);
          setShowAboutPage(true);
        }}
      />
    );
  }

  // Se estiver mostrando a página de conteúdo (página 4+), renderizar apenas ela
  if (showContentPage) {
    return (
      <ProposalContentPage
        pageNumber={4}
        title="Sumário Executivo"
        content={
          <div className="space-y-6">
            <p>
              Esta é uma página de exemplo com o layout padrão (cabeçalho e rodapé).
            </p>
            <p>
              Você pode adicionar qualquer conteúdo aqui: texto, imagens, tabelas, gráficos, etc.
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-cyan-500">
              <h3 className="font-bold text-lg mb-2">Exemplo de Destaque</h3>
              <p>Conteúdo importante em destaque.</p>
            </div>
          </div>
        }
        onContinue={handleContentPageContinue}
        onBack={() => {
          setShowContentPage(false);
          setShowClientsPage(true);
        }}
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Modal de Seleção de Proposta NOC */}
      {showNOCSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Vincular Proposta NOC?</CardTitle>
              <CardDescription>
                Você tem propostas NOC salvas. Deseja vincular uma delas a esta proposta comercial?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecione uma Proposta NOC (opcional)</Label>
                <Select value={selectedNOCId} onValueChange={setSelectedNOCId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Nenhuma (criar sem vincular)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma (criar sem vincular)</SelectItem>
                    {nocProposalsForSelection.map(noc => (
                      <SelectItem key={noc.id} value={noc.id}>
                        {noc.title} - {noc.client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Ao vincular, os dados do cliente serão preenchidos automaticamente
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNOCSelector(false);
                    setSelectedNOCId('');
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => createCommercialProposal(selectedNOCId && selectedNOCId !== 'none' ? selectedNOCId : undefined)}
                  className="flex-1"
                >
                  Criar Proposta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          {/* Debug Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('=== DEBUG PROPOSTAS ===');
              const stored = localStorage.getItem('unified-proposals');
              console.log('LocalStorage unified-proposals:', stored);
              if (stored) {
                const parsed = JSON.parse(stored);
                console.log('Total propostas:', parsed.length);
                console.log('Propostas NOC:', parsed.filter((p: any) => p.type === 'noc').length);
                console.log('Propostas Comerciais:', parsed.filter((p: any) => p.type === 'commercial').length);
                console.table(parsed.map((p: any) => ({ id: p.id, type: p.type, title: p.title, client: p.client })));
              }
              loadProposals();
            }}
          >
            🔍 Debug
          </Button>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Lista de Propostas</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas propostas comerciais e NOC ({proposals.length} total)
            </p>
          </div>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Nova Proposta Comercial
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Linha 1: Busca */}
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('ALL');
                  setFilterType('ALL');
                  console.log('Filtros limpos');
                }}
              >
                🗑️ Limpar Filtros
              </Button>
            </div>

            {/* Linha 2: Filtros de Tipo */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">Tipo:</span>
              <Button
                variant={filterType === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterType('ALL')}
                size="sm"
              >
                Todas
              </Button>
              <Button
                variant={filterType === 'commercial' ? 'default' : 'outline'}
                onClick={() => setFilterType('commercial')}
                size="sm"
              >
                Comerciais
              </Button>
              <Button
                variant={filterType === 'noc' ? 'default' : 'outline'}
                onClick={() => setFilterType('noc')}
                size="sm"
              >
                NOC
              </Button>
            </div>

            {/* Linha 3: Filtros de Status */}
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium text-gray-600 mr-2">Status:</span>
              <Button
                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('ALL')}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.DRAFT ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.DRAFT)}
                size="sm"
              >
                Rascunhos
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.SENT ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.SENT)}
                size="sm"
              >
                Enviadas
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.APPROVED ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.APPROVED)}
                size="sm"
              >
                Aprovadas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Propostas */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma proposta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== 'ALL'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando sua primeira proposta comercial'}
            </p>
            {!searchTerm && filterStatus === 'ALL' && (
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeira Proposta
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <Badge variant={proposal.type === 'noc' ? 'secondary' : 'default'}>
                      {proposal.type === 'noc' ? 'NOC' : 'Comercial'}
                    </Badge>
                  </div>
                  {getStatusBadge(proposal.status)}
                </div>
                <CardDescription>
                  <div className="space-y-1">
                    {proposal.type === 'commercial' && proposal.commercialData && (
                      <div className="font-mono text-sm">{proposal.commercialData.proposalNumber}</div>
                    )}
                    <div className="text-sm">{proposal.client || 'Cliente não informado'}</div>
                    <div className="text-xs text-muted-foreground">
                      Criada em {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    {proposal.linkedNOCProposalId && (
                      <div className="text-xs text-blue-600">
                        Vinculada a proposta NOC
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleView(proposal)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(proposal)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  {proposal.type === 'commercial' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(proposal)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Duplicar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(proposal)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(proposal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
