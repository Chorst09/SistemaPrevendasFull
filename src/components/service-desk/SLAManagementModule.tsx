"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  ServiceDeskSLA, 
  ServiceDeskTicketPriority, 
  ServiceDeskTicketCategory 
} from "@/lib/types/service-desk"
import { 
  SERVICE_DESK_TICKET_PRIORITIES, 
  SERVICE_DESK_TICKET_CATEGORIES 
} from "@/lib/constants/service-desk"

interface SLAManagementModuleProps {
  slas: ServiceDeskSLA[]
  onUpdateSlas: (slas: ServiceDeskSLA[]) => void
}

export function SLAManagementModule({ slas, onUpdateSlas }: SLAManagementModuleProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingSLA, setEditingSLA] = useState<ServiceDeskSLA | null>(null)
  const [formData, setFormData] = useState<Partial<ServiceDeskSLA>>({
    name: "",
    priority: ServiceDeskTicketPriority.MEDIUM,
    category: ServiceDeskTicketCategory.OTHER,
    responseTime: 60,
    resolutionTime: 24,
    escalationTime: 8,
    businessHoursOnly: true,
    description: "",
    active: true
  })

  const filteredSLAs = slas.filter(sla =>
    sla.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sla.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sla.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority: ServiceDeskTicketPriority) => {
    const priorityConfig = SERVICE_DESK_TICKET_PRIORITIES.find(p => p.value === priority)
    return priorityConfig?.color || 'gray'
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  const formatResolutionTime = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  const handleCreateSLA = () => {
    const newSLA: ServiceDeskSLA = {
      id: Date.now().toString(),
      ...formData as Omit<ServiceDeskSLA, 'id' | 'createdAt' | 'updatedAt'>,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    onUpdateSlas([...slas, newSLA])
    setIsCreateDialogOpen(false)
    resetForm()
  }

  const handleUpdateSLA = () => {
    if (!editingSLA) return
    
    const updatedSLA: ServiceDeskSLA = {
      ...editingSLA,
      ...formData,
      updatedAt: new Date()
    }
    
    const updatedSLAs = slas.map(sla => 
      sla.id === editingSLA.id ? updatedSLA : sla
    )
    
    onUpdateSlas(updatedSLAs)
    setEditingSLA(null)
    resetForm()
  }

  const handleDeleteSLA = (slaId: string) => {
    const updatedSLAs = slas.filter(sla => sla.id !== slaId)
    onUpdateSlas(updatedSLAs)
  }

  const toggleSLAStatus = (slaId: string) => {
    const updatedSLAs = slas.map(sla =>
      sla.id === slaId
        ? { ...sla, active: !sla.active, updatedAt: new Date() }
        : sla
    )
    onUpdateSlas(updatedSLAs)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      priority: ServiceDeskTicketPriority.MEDIUM,
      category: ServiceDeskTicketCategory.OTHER,
      responseTime: 60,
      resolutionTime: 24,
      escalationTime: 8,
      businessHoursOnly: true,
      description: "",
      active: true
    })
  }

  const openEditDialog = (sla: ServiceDeskSLA) => {
    setEditingSLA(sla)
    setFormData({
      name: sla.name,
      priority: sla.priority,
      category: sla.category,
      responseTime: sla.responseTime,
      resolutionTime: sla.resolutionTime,
      escalationTime: sla.escalationTime,
      businessHoursOnly: sla.businessHoursOnly,
      description: sla.description,
      active: sla.active
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de SLA</h1>
          <p className="text-muted-foreground">
            Configure os acordos de nível de serviço para diferentes tipos de tickets
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo SLA
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de SLAs</p>
                <p className="text-2xl font-bold">{slas.length}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLAs Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {slas.filter(s => s.active).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold">
                  {slas.length > 0 
                    ? formatTime(Math.round(slas.reduce((sum, s) => sum + s.responseTime, 0) / slas.length))
                    : '0min'
                  }
                </p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SLAs Críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {slas.filter(s => s.priority === ServiceDeskTicketPriority.CRITICAL).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar SLAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de SLAs */}
      <Card>
        <CardHeader>
          <CardTitle>SLAs Configurados</CardTitle>
          <CardDescription>
            {filteredSLAs.length} de {slas.length} SLAs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSLAs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tempo Resposta</TableHead>
                  <TableHead>Tempo Resolução</TableHead>
                  <TableHead>Horário Comercial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSLAs.map((sla) => (
                  <TableRow key={sla.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sla.name}</div>
                        {sla.description && (
                          <div className="text-sm text-muted-foreground">
                            {sla.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={`border-${getPriorityColor(sla.priority)}-200 text-${getPriorityColor(sla.priority)}-800 bg-${getPriorityColor(sla.priority)}-50`}
                      >
                        {sla.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {SERVICE_DESK_TICKET_CATEGORIES.find(c => c.value === sla.category)?.label || sla.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatTime(sla.responseTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatResolutionTime(sla.resolutionTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sla.businessHoursOnly ? "secondary" : "default"}>
                        {sla.businessHoursOnly ? "Sim" : "24x7"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sla.active ? "default" : "secondary"}>
                        {sla.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(sla)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSLAStatus(sla.id)}
                        >
                          {sla.active ? "Desativar" : "Ativar"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSLA(sla.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum SLA encontrado" : "Nenhum SLA configurado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro SLA"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro SLA
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para Criar/Editar SLA */}
      <Dialog 
        open={isCreateDialogOpen || !!editingSLA} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false)
            setEditingSLA(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSLA ? "Editar SLA" : "Criar Novo SLA"}
            </DialogTitle>
            <DialogDescription>
              Configure os tempos de resposta e resolução para este SLA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do SLA *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Crítico - Hardware"
                />
              </div>
              <div className="space-y-2">
                <Label>Prioridade *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as ServiceDeskTicketPriority }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_DESK_TICKET_PRIORITIES.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ServiceDeskTicketCategory }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_DESK_TICKET_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.icon} {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responseTime">Tempo de Resposta (minutos) *</Label>
                <Input
                  id="responseTime"
                  type="number"
                  value={formData.responseTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resolutionTime">Tempo de Resolução (horas) *</Label>
                <Input
                  id="resolutionTime"
                  type="number"
                  value={formData.resolutionTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="escalationTime">Tempo de Escalação (horas) *</Label>
                <Input
                  id="escalationTime"
                  type="number"
                  value={formData.escalationTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, escalationTime: parseInt(e.target.value) || 0 }))}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do SLA"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="businessHoursOnly"
                checked={formData.businessHoursOnly}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, businessHoursOnly: checked }))}
              />
              <Label htmlFor="businessHoursOnly">Apenas horário comercial</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">SLA ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsCreateDialogOpen(false)
                setEditingSLA(null)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editingSLA ? handleUpdateSLA : handleCreateSLA}
              disabled={!formData.name || !formData.responseTime || !formData.resolutionTime}
            >
              {editingSLA ? "Atualizar" : "Criar"} SLA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}