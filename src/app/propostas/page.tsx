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
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UnifiedProposalService, UnifiedProposal } from '@/lib/services/unified-proposal-service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PropostasPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<UnifiedProposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | 'commercial' | 'noc'>('ALL');
  const [showNOCSelector, setShowNOCSelector] = useState(false);
  const [selectedNOCId, setSelectedNOCId] = useState<string>('');

  useEffect(() => {
    loadProposals();
    // Migrar propostas antigas na primeira vez
    UnifiedProposalService.migrateOldProposals();
  }, []);

  const loadProposals = () => {
    const allProposals = UnifiedProposalService.getAllProposals();
    setProposals(allProposals);
  };

  const handleCreateNew = () => {
    // Verificar se existem propostas NOC
    const nocProposals = UnifiedProposalService.getNOCProposalsForSelection();
    
    if (nocProposals.length > 0) {
      // Mostrar seletor de proposta NOC
      setShowNOCSelector(true);
    } else {
      // Criar proposta comercial sem vincular NOC
      createCommercialProposal();
    }
  };

  const createCommercialProposal = (nocProposalId?: string) => {
    const newProposal = CommercialProposalService.createEmptyProposal();
    
    // Se tiver proposta NOC vinculada, preencher dados
    if (nocProposalId) {
      const nocProposal = UnifiedProposalService.getProposalById(nocProposalId);
      if (nocProposal && nocProposal.nocData) {
        // Preencher dados da proposta comercial com dados do NOC
        newProposal.cover.clientName = nocProposal.client;
        newProposal.title = `Proposta Comercial - ${nocProposal.title}`;
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
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || proposal.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesType = filterType === 'ALL' || proposal.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const nocProposalsForSelection = UnifiedProposalService.getNOCProposalsForSelection();

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
                    <SelectItem value="">Nenhuma (criar sem vincular)</SelectItem>
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
                  onClick={() => createCommercialProposal(selectedNOCId || undefined)}
                  className="flex-1"
                >
                  Criar Proposta
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lista de Propostas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas propostas comerciais e NOC
          </p>
        </div>
        <Button onClick={handleCreateNew} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nova Proposta Comercial
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
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
            <div className="flex gap-2">
              <Button
                variant={filterType === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterType('ALL')}
              >
                Todas
              </Button>
              <Button
                variant={filterType === 'commercial' ? 'default' : 'outline'}
                onClick={() => setFilterType('commercial')}
              >
                Comerciais
              </Button>
              <Button
                variant={filterType === 'noc' ? 'default' : 'outline'}
                onClick={() => setFilterType('noc')}
              >
                NOC
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('ALL')}
              >
                Todos Status
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.DRAFT ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.DRAFT)}
              >
                Rascunhos
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.SENT ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.SENT)}
              >
                Enviadas
              </Button>
              <Button
                variant={filterStatus === ProposalStatus.APPROVED ? 'default' : 'outline'}
                onClick={() => setFilterStatus(ProposalStatus.APPROVED)}
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
