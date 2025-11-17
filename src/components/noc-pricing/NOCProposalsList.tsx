'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NOCProposalService, NOCProposal } from '@/lib/services/noc-proposal-service';
import { FileText, Trash2, Download, Eye, Calendar, Users, Server, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NOCProposalsList() {
  const [proposals, setProposals] = useState<NOCProposal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = () => {
    const allProposals = NOCProposalService.getAllProposals();
    setProposals(allProposals);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    try {
      await NOCProposalService.deleteProposal(id);
      loadProposals();
      toast({
        title: 'Proposta Excluída',
        description: 'A proposta foi excluída com sucesso.',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a proposta.',
        variant: 'destructive'
      });
    }
  };

  const handleExport = (proposal: NOCProposal) => {
    const json = NOCProposalService.exportToJSON(proposal);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proposta-noc-${proposal.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'outline';
      case 'sent': return 'secondary';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'sent': return 'Enviada';
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      default: return status;
    }
  };

  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma Proposta NOC</h3>
          <p className="text-gray-500 text-center">
            As propostas NOC salvas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Propostas NOC</h2>
        <Badge variant="outline">{proposals.length} proposta(s)</Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {proposals.map(proposal => {
          const summary = NOCProposalService.getProposalSummary(proposal);
          
          return (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span>{proposal.title}</span>
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{proposal.client}</p>
                  </div>
                  <Badge variant={getStatusColor(proposal.status)}>
                    {getStatusLabel(proposal.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Dispositivos</div>
                      <div className="font-semibold">{summary.totalDevices}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Equipe</div>
                      <div className="font-semibold">{summary.teamSize}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Mensal</div>
                      <div className="font-semibold">
                        R$ {summary.monthlyPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-xs text-gray-500">Criada em</div>
                      <div className="font-semibold">
                        {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant="outline">{summary.serviceLevel}</Badge>
                  <Badge variant="outline">{summary.coverage}</Badge>
                </div>

                {proposal.description && (
                  <p className="text-sm text-gray-600 mb-4">{proposal.description}</p>
                )}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport(proposal)}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(proposal.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
