"use client"

import { useState } from "react"
import { FileText, Eye, Edit, Trash2, Plus, User, Building, Calendar, DollarSign, ShoppingCart, Wrench, Download, Printer, FileCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProposalStore } from "@/lib/stores/proposal-store"
import { EditProposalModal } from "./EditProposalModal"
import { ProposalPreview } from "./ProposalPreview"
import type { ProposalData } from "@/lib/types/proposals"

interface ProposalsManagementProps {
  onBack?: () => void
}

export function ProposalsManagement({ onBack }: ProposalsManagementProps = {}) {
  const { proposals, updateProposalStatus, generateProposalPDF } = useProposalStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProposal, setSelectedProposal] = useState<ProposalData | null>(null)
  const [editingProposal, setEditingProposal] = useState<ProposalData | null>(null)
  const [previewProposal, setPreviewProposal] = useState<ProposalData | null>(null)

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || proposal.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: ProposalData['status']) => {
    const statusConfig = {
      draft: { label: "Rascunho", variant: "secondary" as const },
      active: { label: "Ativa", variant: "default" as const },
      completed: { label: "Concluída", variant: "outline" as const },
      cancelled: { label: "Cancelada", variant: "destructive" as const }
    }
    
    return statusConfig[status] || statusConfig.draft
  }

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'sales': return <ShoppingCart className="h-4 w-4" />
      case 'rental': return <Calendar className="h-4 w-4" />
      case 'services': return <Wrench className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'sales': return 'text-teal-600'
      case 'rental': return 'text-purple-600'
      case 'services': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getTotalValue = (proposal: ProposalData) => {
    return proposal.budgets.reduce((total, budget) => total + budget.totalValue, 0)
  }

  if (selectedProposal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedProposal(null)}>
            Voltar à Lista
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingProposal(selectedProposal)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Proposta
            </Button>
            <Button
              variant="outline"
              onClick={() => setPreviewProposal(selectedProposal)}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Prévia PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => generateProposalPDF(selectedProposal.id, 'save')}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => generateProposalPDF(selectedProposal.id, 'print')}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir PDF
            </Button>
            <Select 
              value={selectedProposal.status} 
              onValueChange={(value) => updateProposalStatus(selectedProposal.id, value as ProposalData['status'])}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Detalhes da Proposta */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{selectedProposal.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="font-medium">{selectedProposal.clientCompany}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{selectedProposal.clientEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{selectedProposal.clientPhone}</p>
              </div>
              {selectedProposal.clientCNPJ && (
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{selectedProposal.clientCNPJ}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Projeto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Dados do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome do Projeto</p>
                <p className="font-medium">{selectedProposal.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">{selectedProposal.projectType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{selectedProposal.projectDescription}</p>
              </div>
              {selectedProposal.deliveryDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Prazo de Entrega</p>
                  <p className="font-medium">{new Date(selectedProposal.deliveryDate).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Estimado</p>
                <p className="font-medium">R$ {selectedProposal.estimatedBudget}</p>
              </div>
            </CardContent>
          </Card>

          {/* Gerente de Contas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Gerente de Contas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{selectedProposal.managerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="font-medium">{selectedProposal.managerEmail}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{selectedProposal.managerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium">{selectedProposal.managerDepartment}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orçamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Orçamentos ({selectedProposal.budgets.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProposal.budgets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento adicionado ainda</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedProposal.budgets.map((budget) => (
                  <Card key={budget.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={getModuleColor(budget.module)}>
                            {getModuleIcon(budget.module)}
                          </div>
                          <h4 className="font-medium capitalize">{budget.module === 'sales' ? 'Vendas' : budget.module === 'rental' ? 'Locação' : 'Serviços'}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {budget.items.length} {budget.items.length === 1 ? 'item' : 'itens'}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {budget.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              <p className="text-sm text-muted-foreground">
                                Qtd: {item.quantity} × {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-medium">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Total Geral */}
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total Geral da Proposta</p>
                    <p className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotalValue(selectedProposal))}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com botão voltar */}
      {onBack && (
        <div className="p-6 border-b">
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      )}

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestão de Propostas</h2>
            <p className="text-muted-foreground">Visualize e gerencie todas as propostas do sistema</p>
          </div>
        </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Input
          placeholder="Buscar por cliente, projeto ou empresa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Propostas */}
      <div className="grid gap-4">
        {filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma proposta encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {proposals.length === 0 
                  ? "Ainda não há propostas criadas no sistema"
                  : "Nenhuma proposta corresponde aos filtros aplicados"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{proposal.projectName}</h3>
                      <Badge {...getStatusBadge(proposal.status)}>
                        {getStatusBadge(proposal.status).label}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">{proposal.clientName}</p>
                        <p>{proposal.clientCompany}</p>
                      </div>
                      <div>
                        <p>Criada em: {new Date(proposal.createdAt).toLocaleDateString('pt-BR')}</p>
                        <p>Orçamentos: {proposal.budgets.length}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotalValue(proposal))}
                        </p>
                        <p>Gerente: {proposal.managerName}</p>
                      </div>
                    </div>

                    {/* Módulos utilizados */}
                    {proposal.budgets.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {[...new Set(proposal.budgets.map(b => b.module))].map(module => (
                          <Badge key={module} variant="outline" className="text-xs">
                            <span className={getModuleColor(module)}>
                              {getModuleIcon(module)}
                            </span>
                            <span className="ml-1 capitalize">
                              {module === 'sales' ? 'Vendas' : module === 'rental' ? 'Locação' : 'Serviços'}
                            </span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProposal(proposal)}
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewProposal(proposal)}
                      title="Prévia PDF"
                    >
                      <FileCheck className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateProposalPDF(proposal.id, 'save')}
                      title="Baixar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateProposalPDF(proposal.id, 'print')}
                      title="Imprimir PDF"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Edição */}
      {editingProposal && (
        <EditProposalModal
          proposal={editingProposal}
          isOpen={!!editingProposal}
          onClose={() => setEditingProposal(null)}
        />
      )}

      {/* Modal de Prévia */}
      {previewProposal && (
        <ProposalPreview
          proposal={previewProposal}
          isOpen={!!previewProposal}
          onClose={() => setPreviewProposal(null)}
        />
      )}
      </div>
    </div>
  )
}