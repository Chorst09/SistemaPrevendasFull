import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Badge } from '../../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Checkbox } from '../../ui/checkbox'
import { 
  FileText, 
  Search, 
  Edit, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  Building,
  DollarSign,
  History,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  CheckSquare,
  Square,
  MoreHorizontal,
  Briefcase
} from 'lucide-react'
import { proposalStorage } from '../../../lib/pdf/services/storage'
import { SavedProposal } from '../../../lib/pdf/types'
import { useToast } from '../../../hooks/use-toast'
import { 
  downloadPDF,
  openPDFInNewTab,
  generatePDFFileName
} from '../../../lib/pdf/utils/pdf-viewer'
import { ProposalVersionHistory } from '../viewers/ProposalVersionHistory'
import { GeneratedProposalService } from '@/lib/services/generated-proposal-service'
import { CommercialProposal } from '@/lib/types/commercial-proposal'

interface ProposalListManagerProps {
  onEditProposal: (proposalId: string) => void
  onViewProposal?: (proposalId: string) => void
  onCreateNew?: () => void
  onNavigateToQuotes?: () => void
}

export function ProposalListManager({
  onEditProposal,
  onViewProposal,
  onCreateNew,
  onNavigateToQuotes
}: ProposalListManagerProps) {
  const [proposals, setProposals] = useState<SavedProposal[]>([])
  const [filteredProposals, setFilteredProposals] = useState<SavedProposal[]>([])
  const [paginatedProposals, setPaginatedProposals] = useState<SavedProposal[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [statusFilter, setStatusFilter] = useState<'all' | 'recent' | 'updated'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedProposals, setSelectedProposals] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const { toast } = useToast()

  // Load proposals
  const loadProposals = useCallback(async () => {
    setIsLoading(true)
    try {
      const loadedProposals = await proposalStorage.list()
      setProposals(loadedProposals)
      setFilteredProposals(loadedProposals)
    } catch (error) {
      console.error('Failed to load proposals:', error)
      toast({
        title: "Erro ao Carregar",
        description: "Não foi possível carregar as propostas.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Apply all filters
  const applyFilters = useCallback(() => {
    let filtered = [...proposals]

    // Text search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(proposal => 
        proposal.clientName.toLowerCase().includes(searchTerm) ||
        proposal.projectName.toLowerCase().includes(searchTerm) ||
        proposal.clientData.companyName.toLowerCase().includes(searchTerm) ||
        proposal.clientData.contactName.toLowerCase().includes(searchTerm)
      )
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      filtered = filtered.filter(proposal => {
        const proposalDate = new Date(proposal.createdAt)
        
        switch (dateFilter) {
          case 'today':
            return proposalDate >= today
          case 'week':
            const weekAgo = new Date(today)
            weekAgo.setDate(weekAgo.getDate() - 7)
            return proposalDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today)
            monthAgo.setMonth(monthAgo.getMonth() - 1)
            return proposalDate >= monthAgo
          case 'custom':
            if (customDateRange.start && customDateRange.end) {
              const startDate = new Date(customDateRange.start)
              const endDate = new Date(customDateRange.end)
              endDate.setHours(23, 59, 59, 999) // Include the entire end date
              return proposalDate >= startDate && proposalDate <= endDate
            }
            return true
          default:
            return true
        }
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(proposal => {
        switch (statusFilter) {
          case 'recent':
            const threeDaysAgo = new Date()
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
            return proposal.createdAt >= threeDaysAgo
          case 'updated':
            return proposal.updatedAt.getTime() !== proposal.createdAt.getTime()
          default:
            return true
        }
      })
    }

    setFilteredProposals(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [proposals, searchQuery, dateFilter, customDateRange, statusFilter])

  // Search proposals (legacy method for compatibility)
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    // The actual filtering will be handled by applyFilters
  }, [])

  // Handle filter changes
  const handleDateFilterChange = useCallback((value: string) => {
    setDateFilter(value as any)
  }, [])

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value as any)
  }, [])

  const handleCustomDateChange = useCallback((field: 'start' | 'end', value: string) => {
    setCustomDateRange(prev => ({ ...prev, [field]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setDateFilter('all')
    setStatusFilter('all')
    setCustomDateRange({ start: '', end: '' })
  }, [])

  // Bulk actions
  const handleSelectProposal = useCallback((proposalId: string, checked: boolean) => {
    setSelectedProposals(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(proposalId)
      } else {
        newSet.delete(proposalId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedProposals(new Set(paginatedProposals.map(p => p.id)))
    } else {
      setSelectedProposals(new Set())
    }
  }, [paginatedProposals])

  const handleBulkDelete = useCallback(async () => {
    if (selectedProposals.size === 0) return

    const proposalNames = Array.from(selectedProposals)
      .map(id => paginatedProposals.find(p => p.id === id)?.projectName)
      .filter(Boolean)
      .slice(0, 3)
      .join(', ')

    const confirmMessage = selectedProposals.size === 1 
      ? `Tem certeza que deseja excluir a proposta "${proposalNames}"?`
      : `Tem certeza que deseja excluir ${selectedProposals.size} propostas? (${proposalNames}${selectedProposals.size > 3 ? '...' : ''})`

    if (!confirm(confirmMessage)) {
      return
    }

    let successCount = 0
    let errorCount = 0

    for (const proposalId of selectedProposals) {
      try {
        const success = await proposalStorage.delete(proposalId)
        if (success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (error) {
        console.error(`Failed to delete proposal ${proposalId}:`, error)
        errorCount++
      }
    }

    if (successCount > 0) {
      toast({
        title: "Propostas Excluídas",
        description: `${successCount} proposta(s) excluída(s) com sucesso.`,
      })
    }

    if (errorCount > 0) {
      toast({
        title: "Erro Parcial",
        description: `${errorCount} proposta(s) não puderam ser excluídas.`,
        variant: "destructive"
      })
    }

    setSelectedProposals(new Set())
    await loadProposals()
  }, [selectedProposals, paginatedProposals, toast, loadProposals])

  const handleBulkDownload = useCallback(async () => {
    if (selectedProposals.size === 0) return

    const selectedProposalData = paginatedProposals.filter(p => selectedProposals.has(p.id))
    
    for (const proposal of selectedProposalData) {
      try {
        const pdfUrl = URL.createObjectURL(proposal.pdfBlob)
        const fileName = generatePDFFileName(proposal.clientName, proposal.projectName)
        downloadPDF(pdfUrl, fileName)
        
        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
      } catch (error) {
        console.error(`Failed to download proposal ${proposal.id}:`, error)
      }
    }

    toast({
      title: "Downloads Iniciados",
      description: `${selectedProposals.size} arquivo(s) estão sendo baixados.`,
    })

    setSelectedProposals(new Set())
  }, [selectedProposals, paginatedProposals, toast])

  const isAllSelected = paginatedProposals.length > 0 && selectedProposals.size === paginatedProposals.length
  const isPartiallySelected = selectedProposals.size > 0 && selectedProposals.size < paginatedProposals.length

  // Pagination logic
  const updatePagination = useCallback(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedProposals(filteredProposals.slice(startIndex, endIndex))
  }, [filteredProposals, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [hasNextPage])

  const handlePrevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [hasPrevPage])

  // Delete proposal with enhanced confirmation
  const handleDelete = useCallback(async (proposalId: string, proposalName: string) => {
    const proposal = proposals.find(p => p.id === proposalId)
    const confirmMessage = proposal 
      ? `Tem certeza que deseja excluir a proposta "${proposalName}"?\n\nCliente: ${proposal.clientData.companyName}\nValor: R$ ${proposal.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\nEsta ação não pode ser desfeita.`
      : `Tem certeza que deseja excluir a proposta "${proposalName}"?`

    if (!confirm(confirmMessage)) {
      return
    }

    try {
      const success = await proposalStorage.delete(proposalId)
      if (success) {
        toast({
          title: "Proposta Excluída",
          description: `A proposta "${proposalName}" foi excluída com sucesso.`,
        })
        await loadProposals() // Reload the list
      } else {
        toast({
          title: "Erro",
          description: "A proposta não foi encontrada.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to delete proposal:', error)
      toast({
        title: "Erro ao Excluir",
        description: "Não foi possível excluir a proposta.",
        variant: "destructive"
      })
    }
  }, [toast, loadProposals, proposals])

  // Salvar no GeneratedProposalService
  const saveToGeneratedProposals = useCallback((proposal: SavedProposal) => {
    try {
      // Converter SavedProposal para CommercialProposal
      if (proposal.proposalData) {
        GeneratedProposalService.saveGeneratedProposal(proposal.proposalData as CommercialProposal);
        console.log('Proposta salva em GeneratedProposalService:', proposal.id);
      }
    } catch (error) {
      console.error('Erro ao salvar em GeneratedProposalService:', error);
    }
  }, []);

  // Download proposal
  const handleDownload = useCallback((proposal: SavedProposal) => {
    try {
      const pdfUrl = URL.createObjectURL(proposal.pdfBlob)
      const fileName = generatePDFFileName(proposal.clientName, proposal.projectName)
      downloadPDF(pdfUrl, fileName)
      
      // Salvar no GeneratedProposalService
      saveToGeneratedProposals(proposal);
      
      toast({
        title: "Download Iniciado",
        description: `O arquivo ${fileName} está sendo baixado.`,
      })
      
      // Clean up the URL
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    } catch (error) {
      console.error('Failed to download proposal:', error)
      toast({
        title: "Erro no Download",
        description: "Não foi possível fazer o download da proposta.",
        variant: "destructive"
      })
    }
  }, [toast, saveToGeneratedProposals])

  // View proposal
  const handleView = useCallback((proposal: SavedProposal) => {
    try {
      const pdfUrl = URL.createObjectURL(proposal.pdfBlob)
      const fileName = generatePDFFileName(proposal.clientName, proposal.projectName)
      openPDFInNewTab(pdfUrl, fileName)
      
      // Salvar no GeneratedProposalService
      saveToGeneratedProposals(proposal);
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000)
    } catch (error) {
      console.error('Failed to view proposal:', error)
      toast({
        title: "Erro",
        description: "Não foi possível visualizar a proposta.",
        variant: "destructive"
      })
    }
  }, [toast, saveToGeneratedProposals])

  // Show version history
  const handleShowVersionHistory = useCallback((proposalId: string) => {
    setSelectedProposalId(proposalId)
    setShowVersionHistory(true)
  }, [])

  // Load proposals on mount
  useEffect(() => {
    loadProposals()
  }, [loadProposals])

  // Apply filters when any filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [applyFilters])

  // Update pagination when filtered proposals change
  useEffect(() => {
    updatePagination()
  }, [updatePagination])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando propostas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Propostas Geradas</h2>
          <p className="text-muted-foreground">
            Propostas comerciais que foram geradas em PDF
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onNavigateToQuotes && (
            <Button onClick={onNavigateToQuotes} variant="outline" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Ver Orçamentos</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search bar */}
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, projeto ou empresa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            {(searchQuery || dateFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Limpar</span>
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Data de Criação</label>
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as datas</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Última semana</SelectItem>
                    <SelectItem value="month">Último mês</SelectItem>
                    <SelectItem value="custom">Período personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as propostas</SelectItem>
                    <SelectItem value="recent">Criadas recentemente</SelectItem>
                    <SelectItem value="updated">Atualizadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="space-y-2 md:col-span-1">
                  <label className="text-sm font-medium">Período Personalizado</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => handleCustomDateChange('start', e.target.value)}
                      className="text-sm"
                    />
                    <span className="text-muted-foreground">até</span>
                    <Input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => handleCustomDateChange('end', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active filters summary */}
          {(searchQuery || dateFilter !== 'all' || statusFilter !== 'all') && (
            <div className="flex items-center space-x-2 pt-2 border-t">
              <span className="text-sm text-muted-foreground">Filtros ativos:</span>
              {searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Busca: "{searchQuery}"
                </Badge>
              )}
              {dateFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Data: {dateFilter === 'today' ? 'Hoje' : 
                         dateFilter === 'week' ? 'Última semana' : 
                         dateFilter === 'month' ? 'Último mês' : 
                         dateFilter === 'custom' ? 'Personalizado' : dateFilter}
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statusFilter === 'recent' ? 'Recentes' : 'Atualizadas'}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta gerada'}
            </h3>
            {searchQuery ? (
              <p className="text-muted-foreground mb-4">
                Tente ajustar os termos de busca.
              </p>
            ) : (
              <div className="max-w-md mx-auto space-y-3">
                <p className="text-muted-foreground">
                  As propostas aparecem aqui automaticamente quando você gera o PDF de uma proposta comercial.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-left">
                  <p className="font-semibold text-blue-900 mb-2">Como gerar uma proposta:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Acesse o menu <strong>"Propostas"</strong></li>
                    <li>Crie ou edite uma proposta comercial</li>
                    <li>Clique em <strong>"Visualizar"</strong> ou <strong>"Download"</strong> para gerar o PDF</li>
                    <li>A proposta aparecerá automaticamente aqui</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Results summary and bulk actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredProposals.length)} de {filteredProposals.length} proposta(s)
              </span>
              {filteredProposals.length > itemsPerPage && (
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
              )}
            </div>

            {/* Bulk Actions */}
            {paginatedProposals.length > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    className="data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                    {...(isPartiallySelected && !isAllSelected ? { 'data-state': 'indeterminate' } : {})}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedProposals.size > 0 ? `${selectedProposals.size} selecionada(s)` : 'Selecionar todas'}
                  </span>
                </div>

                {selectedProposals.size > 0 && (
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleBulkDownload}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleBulkDelete}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Excluir</span>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Proposals grid */}
          <div className="grid gap-4">
            {paginatedProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={selectedProposals.has(proposal.id)}
                      onCheckedChange={(checked) => handleSelectProposal(proposal.id, checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-12 bg-red-500 rounded shadow-sm flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{proposal.projectName}</h3>
                        <p className="text-muted-foreground">{proposal.clientName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                          <p className="font-medium">{proposal.clientData.companyName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Valor Mensal</p>
                          <p className="font-medium text-green-600">
                            R$ {proposal.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Criado em</p>
                          <p className="font-medium">{proposal.createdAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {proposal.proposalData.equipments.length} equipamento(s)
                      </Badge>
                      {proposal.version && proposal.version > 1 && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          Versão {proposal.version}
                        </Badge>
                      )}
                      {proposal.updatedAt.getTime() !== proposal.createdAt.getTime() && (
                        <Badge variant="outline">
                          Atualizado em {proposal.updatedAt.toLocaleDateString('pt-BR')}
                        </Badge>
                      )}
                    </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleView(proposal)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(proposal)}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>Baixar</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => onEditProposal(proposal.id)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Editar</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShowVersionHistory(proposal.id)}
                      className="flex items-center space-x-1"
                    >
                      <History className="h-3 w-3" />
                      <span>Histórico</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(proposal.id, proposal.projectName)}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Excluir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>

          {/* Pagination Controls */}
          {filteredProposals.length > itemsPerPage && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </Button>

                  <div className="flex items-center space-x-2">
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(totalPages)}
                          className="w-8 h-8 p-0"
                        >
                          {totalPages}
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className="flex items-center space-x-1"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Version History Dialog */}
      {selectedProposalId && (
        <ProposalVersionHistory
          isOpen={showVersionHistory}
          onClose={() => {
            setShowVersionHistory(false)
            setSelectedProposalId(null)
          }}
          proposalId={selectedProposalId}
          currentProposal={proposals.find(p => p.id === selectedProposalId)}
        />
      )}
    </div>
  )
}

export default ProposalListManager