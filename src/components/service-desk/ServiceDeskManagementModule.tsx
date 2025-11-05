"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, Eye, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ServiceDeskService } from "@/lib/types/service-desk"
import { SERVICE_DESK_SERVICE_LEVELS } from "@/lib/constants/service-desk"

interface ServiceDeskManagementModuleProps {
  services: ServiceDeskService[]
  onUpdateServices: (services: ServiceDeskService[]) => void
  onPriceService: (service: ServiceDeskService) => void
  onCreateNewService: () => void
}

export function ServiceDeskManagementModule({
  services,
  onUpdateServices,
  onPriceService,
  onCreateNewService
}: ServiceDeskManagementModuleProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState<ServiceDeskService | null>(null)

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.serviceLevel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getServiceLevelColor = (level: string) => {
    switch (level) {
      case 'Básico': return 'bg-green-100 text-green-800'
      case 'Padrão': return 'bg-blue-100 text-blue-800'
      case 'Premium': return 'bg-purple-100 text-purple-800'
      case 'Empresarial': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleServiceStatus = (serviceId: string) => {
    const updatedServices = services.map(service =>
      service.id === serviceId
        ? { ...service, active: !service.active, updatedAt: new Date() }
        : service
    )
    onUpdateServices(updatedServices)
  }

  const deleteService = (serviceId: string) => {
    const updatedServices = services.filter(service => service.id !== serviceId)
    onUpdateServices(updatedServices)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços de Service Desk disponíveis
          </p>
        </div>
        <Button onClick={onCreateNewService}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Serviços</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Serviços Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {services.filter(s => s.active).length}
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
                <p className="text-sm font-medium text-muted-foreground">Custo Médio</p>
                <p className="text-2xl font-bold">
                  R$ {services.length > 0 
                    ? (services.reduce((sum, s) => sum + s.baseCost, 0) / services.length).toFixed(2)
                    : '0.00'
                  }
                </p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nível Mais Comum</p>
                <p className="text-2xl font-bold">
                  {services.length > 0 
                    ? Object.entries(
                        services.reduce((acc, s) => {
                          acc[s.serviceLevel] = (acc[s.serviceLevel] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
                    : 'N/A'
                  }
                </p>
              </div>
              <div className="text-2xl">📊</div>
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
                placeholder="Buscar serviços..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Cadastrados</CardTitle>
          <CardDescription>
            {filteredServices.length} de {services.length} serviços
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Custo Base</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {service.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getServiceLevelColor(service.serviceLevel)}>
                        {service.serviceLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {service.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        R$ {service.baseCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        por usuário/mês
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Min: {service.minimumUsers}</div>
                        {service.maximumUsers && (
                          <div>Max: {service.maximumUsers}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedService(service)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{service.name}</DialogTitle>
                              <DialogDescription>
                                Detalhes do serviço de Service Desk
                              </DialogDescription>
                            </DialogHeader>
                            {selectedService && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Nível de Serviço</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedService.serviceLevel}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Categoria</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedService.category}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Custo Base</label>
                                    <p className="text-sm text-muted-foreground">
                                      R$ {selectedService.baseCost.toFixed(2)} por usuário/mês
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Custo de Setup</label>
                                    <p className="text-sm text-muted-foreground">
                                      R$ {selectedService.setupCost.toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Horas Incluídas</label>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedService.includedHours}h por usuário/mês
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Custo Hora Adicional</label>
                                    <p className="text-sm text-muted-foreground">
                                      R$ {selectedService.additionalHourCost.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium">Funcionalidades</label>
                                  <div className="mt-2 space-y-1">
                                    {selectedService.features.map((feature, index) => (
                                      <div key={index} className="flex items-center space-x-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">{feature}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPriceService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceStatus(service.id)}
                        >
                          {service.active ? "Desativar" : "Ativar"}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteService(service.id)}
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
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "Nenhum serviço encontrado" : "Nenhum serviço cadastrado"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Tente ajustar os filtros de busca"
                  : "Comece criando seu primeiro serviço de Service Desk"
                }
              </p>
              {!searchTerm && (
                <Button onClick={onCreateNewService}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}