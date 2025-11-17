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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NOCProposalsList } from '@/components/noc-pricing/NOCProposalsList';

export default function PropostasPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<CommercialProposal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = () => {
    const allProposals = CommercialProposalService.getAllProposals();
    setProposals(allProposals);
  };

  const handleCreateNew = () => {
    const newProposal = CommercialProposalService.createEmptyProposal();
    CommercialProposalService.saveProposal(newProposal);
    router.push(`/propostas/${newProposal.id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/propostas/${id}`);
  };

  const handleView = (id: string) => {
    const proposal = CommercialProposalService.getProposalById(id);
    if (proposal) {
      const { ProposalPDFGenerator } = require('@/lib/services/proposal-pdf-generator');
      const generator = new ProposalPDFGenerator();
      generator.openPDFInNewTab(proposal);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const duplicate = await CommercialProposalService.duplicateProposal(id);
      loadProposals();
      router.push(`/propostas/${duplicate.id}`);
    } catch (error) {
      console.error('Error duplicating proposal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta proposta?')) {
      await CommercialProposalService.deleteProposal(id);
      loadProposals();
    }
  };

  const handleExport = (proposal: CommercialProposal) => {
    const json = CommercialProposalService.exportToJSON(proposal);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposta-${proposal.proposalNumber}.json`;
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

  const getStatusBadge = (status: ProposalStatus) => {
    const variants: Record<ProposalStatus, { variant: any; label: string }> = {
      [ProposalStatus.DRAFT]: { variant: 'secondary', label: 'Rascunho' },
      [ProposalStatus.PENDING_REVIEW]: { variant: 'default', label: 'Em Revisão' },
      [ProposalStatus.SENT]: { variant: 'default', label: 'Enviada' },
      [ProposalStatus.APPROVED]: { variant: 'default', label: 'Aprovada' },
      [ProposalStatus.REJECTED]: { variant: 'destructive', label: 'Rejeitada' },
      [ProposalStatus.EXPIRED]: { variant: 'secondary', label: 'Expirada' }
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = 
      proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposal.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || proposal.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-8 px-4">
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

      {/* Abas */}
      <Tabs defaultValue="comercial" className="space-y-6">
        <TabsList>
          <TabsTrigger value="comercial">Propostas Comerciais</TabsTrigger>
          <TabsTrigger value="noc">Propostas NOC</TabsTrigger>
        </TabsList>

        <TabsContent value="comercial" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título, número ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('ALL')}
                  >
                    Todas
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
                  <CardTitle className="text-lg">{proposal.title}</CardTitle>
                  {getStatusBadge(proposal.status)}
                </div>
                <CardDescription>
                  <div className="space-y-1">
                    <div className="font-mono text-sm">{proposal.proposalNumber}</div>
                    <div className="text-sm">{proposal.client.name || 'Cliente não informado'}</div>
                    <div className="text-xs text-muted-foreground">
                      Criada em {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleView(proposal.id)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(proposal.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(proposal.id)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicar
                  </Button>
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
        </TabsContent>

        <TabsContent value="noc">
          <NOCProposalsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
