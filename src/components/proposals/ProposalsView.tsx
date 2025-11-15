"use client";

import React, { useState } from 'react';
import { Edit, Trash2, PlusCircle, FileDown, User, Calendar, DollarSign, FileText, Briefcase, Printer } from 'lucide-react';
import type { Proposal, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import ProposalForm from './ProposalForm';
import CommercialProposalView from '../commercial-proposal/CommercialProposalView';

interface ProposalsViewProps {
  proposals: Proposal[];
  partners: Partner[];
  onSave: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
}

const ProposalsView: React.FC<ProposalsViewProps> = ({ proposals, partners, onSave, onDelete }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProposalTypeDialog, setShowProposalTypeDialog] = useState(false);
  const [showCommercialProposal, setShowCommercialProposal] = useState(false);
  const [localProposals, setLocalProposals] = useState<Proposal[]>([]);

  // Carrega propostas do localStorage
  React.useEffect(() => {
    const savedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
    setLocalProposals(savedProposals);
  }, []);

  // Combina propostas do sistema com as do localStorage
  const allProposals = [...proposals, ...localProposals];

  const handleGoToCommercialProposals = () => {
    window.location.href = '/propostas';
  };

  const filteredProposals = allProposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.accountManager.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Rascunho': return 'bg-gray-100 text-gray-800';
      case 'Enviada': return 'bg-blue-100 text-blue-800';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800';
      case 'Aprovada': return 'bg-green-100 text-green-800';
      case 'Rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleEdit = (proposal: Proposal) => {
    // Se for uma proposta de outsourcing, redireciona para a calculadora
    if (proposal.distributorId === 'outsourcing' && proposal.technicalSpecs) {
      const shouldRedirect = confirm(
        `Esta é uma proposta de Outsourcing de Impressão.\n\n` +
        `Deseja editar na Calculadora de Outsourcing?\n\n` +
        `✓ Manterá todos os equipamentos e dados\n` +
        `✓ Permitirá modificar valores e gerar novo PDF`
      )
      
      if (shouldRedirect) {
        // Salva os dados da proposta para edição
        localStorage.setItem('editingOutsourcingProposal', JSON.stringify({
          proposalId: proposal.id,
          clientData: {
            razaoSocial: proposal.client,
            nomeProjeto: proposal.title.split(' - ')[0] || 'Projeto',
            nomeContato: 'Contato',
            emailCliente: 'contato@cliente.com',
            telefoneCliente: '(11) 99999-9999',
            nomeGerente: proposal.accountManager,
            emailGerente: 'gerente@empresa.com',
            telefoneGerente: '(11) 88888-8888'
          },
          technicalSpecs: JSON.parse(proposal.technicalSpecs)
        }))
        
        // Redireciona para a calculadora (isso precisa ser implementado no componente pai)
        alert('Redirecionando para a Calculadora de Outsourcing...\n\nVá para: Precificação → Outsourcing de Impressão → Iniciar Cálculo')
        return
      }
    }
    
    // Para outras propostas, usa o fluxo normal
    setEditingProposal(proposal);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setShowProposalTypeDialog(true);
  };

  const handleProposalTypeSelect = (type: 'commercial' | 'technical') => {
    setShowProposalTypeDialog(false);
    if (type === 'commercial') {
      setShowCommercialProposal(true);
    } else {
      setEditingProposal(null);
      setIsFormOpen(true);
    }
  };

  const handleSave = (proposal: Proposal) => {
    onSave(proposal);
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingProposal(null);
  };

  const handleCommercialProposalClose = () => {
    setShowCommercialProposal(false);
  };

  const getDistributorName = (distributorId: number | string) => {
    if (distributorId === 'outsourcing') {
      return 'Outsourcing de Impressão';
    }
    const distributor = partners.find(p => p.id.toString() === distributorId.toString());
    return distributor?.name || 'N/A';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Propostas</h1>
          <p className="text-muted-foreground">
            Gerencie suas propostas comerciais
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGoToCommercialProposals} variant="default">
            <FileText className="h-4 w-4 mr-2" />
            Propostas Comerciais
          </Button>
          <Button onClick={handleCreate} variant="outline">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Proposta Técnica
          </Button>
        </div>
      </div>

      {/* Banner Propostas Comerciais */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Sistema de Propostas Comerciais Completo
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Crie propostas profissionais com 10 seções estruturadas: Capa, Sumário Executivo, Desafio, Solução, Escopo, Cronograma, Investimento, Diferenciais, Próximos Passos e Preview em PDF.
                </p>
              </div>
            </div>
            <Button onClick={handleGoToCommercialProposals} size="lg" className="shrink-0">
              Acessar Sistema
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Propostas</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proposals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(proposals.reduce((sum, p) => sum + p.value, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'Aprovada').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Análise</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proposals.filter(p => p.status === 'Em Análise').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro de Busca */}
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar propostas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabela de Propostas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Gerente de Conta</TableHead>
                <TableHead>Distribuidor</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {proposal.title}
                      {proposal.distributorId === 'outsourcing' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Printer className="h-3 w-3 mr-1" />
                          Outsourcing
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{proposal.client}</TableCell>
                  <TableCell>{proposal.accountManager}</TableCell>
                  <TableCell>{getDistributorName(proposal.distributorId)}</TableCell>
                  <TableCell>{formatCurrency(proposal.value)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(proposal.date)}</TableCell>
                  <TableCell>{formatDate(proposal.expiryDate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Botão para visualizar PDF (apenas para propostas de outsourcing) */}
                      {proposal.proposalFile && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Abre o PDF em nova aba
                            const newWindow = window.open()
                            if (newWindow) {
                              newWindow.document.write(`
                                <html>
                                  <head><title>Proposta - ${proposal.client}</title></head>
                                  <body style="margin:0;">
                                    <embed src="${proposal.proposalFile}" type="application/pdf" width="100%" height="100%" />
                                  </body>
                                </html>
                              `)
                            }
                          }}
                          title="Visualizar PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(proposal)}
                        title="Editar Proposta"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Se for proposta do localStorage, remove de lá também
                          if (proposal.distributorId === 'outsourcing') {
                            const savedProposals = JSON.parse(localStorage.getItem('proposals') || '[]')
                            const updatedProposals = savedProposals.filter((p: any) => p.id !== proposal.id)
                            localStorage.setItem('proposals', JSON.stringify(updatedProposals))
                            setLocalProposals(updatedProposals)
                          }
                          onDelete(proposal.id)
                        }}
                        title="Excluir Proposta"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProposals.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma proposta encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Seleção do Tipo de Proposta */}
      <Dialog open={showProposalTypeDialog} onOpenChange={setShowProposalTypeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o Tipo de Proposta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={() => handleProposalTypeSelect('commercial')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <FileText className="h-8 w-8" />
              <span className="font-semibold">Proposta Comercial</span>
              <span className="text-sm text-muted-foreground">Layout personalizado com design profissional</span>
            </Button>
            <Button 
              onClick={() => handleProposalTypeSelect('technical')}
              className="w-full h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <Briefcase className="h-8 w-8" />
              <span className="font-semibold">Proposta Técnica</span>
              <span className="text-sm text-muted-foreground">Formulário detalhado com especificações técnicas</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Comercial */}
      <Dialog open={showCommercialProposal} onOpenChange={setShowCommercialProposal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposta Comercial</DialogTitle>
          </DialogHeader>
          <CommercialProposalView partners={partners} />
        </DialogContent>
      </Dialog>

      {/* Diálogo da Proposta Técnica */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal ? 'Editar Proposta' : 'Nova Proposta Técnica'}
            </DialogTitle>
          </DialogHeader>
          <ProposalForm
            proposal={editingProposal}
            partners={partners}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalsView; 