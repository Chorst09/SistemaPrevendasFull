"use client"

import { useState } from "react"
import { Printer, Plus, Edit, Trash2, Save, X, Settings, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Printer as PrinterType } from "./types"

interface PrinterManagementModuleProps {
  printers: PrinterType[]
  onUpdatePrinters: (printers: PrinterType[]) => void
  onPricePrinter?: (printer: PrinterType) => void
  onCreateNewPrinter?: () => void
}

export function PrinterManagementModule({ printers, onUpdatePrinters, onPricePrinter, onCreateNewPrinter }: PrinterManagementModuleProps) {
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const [formData, setFormData] = useState<Partial<PrinterType>>({
    modelo: '',
    marca: '',
    tipo: 'Laser P&B',
    velocidadePPM: 0,
    custoAquisicao: 0,
    custoMensalLocacao: 0,
    vidaUtilPaginas: 0,
    consumoEnergia: 0,
    custoManutencaoMensal: 0,
    ativo: true
  })

  const handleSave = () => {
    if (!formData.modelo || !formData.marca) return

    const newPrinter: PrinterType = {
      id: editingPrinter?.id || Date.now().toString(),
      modelo: formData.modelo!,
      marca: formData.marca!,
      tipo: formData.tipo!,
      velocidadePPM: formData.velocidadePPM || 0,
      custoAquisicao: formData.custoAquisicao || 0,
      custoMensalLocacao: formData.custoMensalLocacao || 0,
      vidaUtilPaginas: formData.vidaUtilPaginas || 0,
      consumoEnergia: formData.consumoEnergia || 0,
      custoManutencaoMensal: formData.custoManutencaoMensal || 0,
      ativo: formData.ativo ?? true
    }

    let updatedPrinters
    if (editingPrinter) {
      updatedPrinters = printers.map(p => p.id === editingPrinter.id ? newPrinter : p)
    } else {
      updatedPrinters = [...printers, newPrinter]
    }

    onUpdatePrinters(updatedPrinters)
    handleCancel()
  }

  const handleCancel = () => {
    setEditingPrinter(null)
    setShowAddForm(false)
    setFormData({
      modelo: '',
      marca: '',
      tipo: 'Laser P&B',
      velocidadePPM: 0,
      custoAquisicao: 0,
      custoMensalLocacao: 0,
      vidaUtilPaginas: 0,
      consumoEnergia: 0,
      custoManutencaoMensal: 0,
      ativo: true
    })
  }

  const handleEdit = (printer: PrinterType) => {
    setEditingPrinter(printer)
    setFormData(printer)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta impressora?')) {
      onUpdatePrinters(printers.filter(p => p.id !== id))
    }
  }

  const handleToggleActive = (id: string) => {
    const updatedPrinters = printers.map(p => 
      p.id === id ? { ...p, ativo: !p.ativo } : p
    )
    onUpdatePrinters(updatedPrinters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Impressoras</h2>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-2" />
            Cadastro Rápido
          </Button>
          <Button onClick={() => onCreateNewPrinter?.()} className="bg-blue-600 hover:bg-blue-700">
            <DollarSign className="h-4 w-4 mr-2" />
            Nova Impressora
          </Button>
        </div>
      </div>

      {/* Formulário de Adição/Edição */}
      {showAddForm && (
        <Card className="border-slate-600 bg-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-white">{editingPrinter ? 'Editar Impressora' : 'Nova Impressora'}</span>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Marca</Label>
                <Input
                  value={formData.marca || ''}
                  onChange={(e) => setFormData({...formData, marca: e.target.value})}
                  placeholder="Ex: HP, Canon, Xerox"
                />
              </div>
              <div>
                <Label className="text-white">Modelo</Label>
                <Input
                  value={formData.modelo || ''}
                  onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                  placeholder="Ex: LaserJet Pro M404n"
                />
              </div>
              <div>
                <Label className="text-white">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Laser P&B">Laser P&B</SelectItem>
                    <SelectItem value="Laser Colorida">Laser Colorida</SelectItem>
                    <SelectItem value="Jato de Tinta">Jato de Tinta</SelectItem>
                    <SelectItem value="Multifuncional P&B">Multifuncional P&B</SelectItem>
                    <SelectItem value="Multifuncional Colorida">Multifuncional Colorida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Velocidade (PPM)</Label>
                <Input
                  type="number"
                  value={formData.velocidadePPM || ''}
                  onChange={(e) => setFormData({...formData, velocidadePPM: Number(e.target.value)})}
                  placeholder="Páginas por minuto"
                />
              </div>
              <div>
                <Label className="text-white">Custo de Aquisição (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custoAquisicao || ''}
                  onChange={(e) => setFormData({...formData, custoAquisicao: Number(e.target.value)})}
                  placeholder="Valor de compra"
                />
              </div>
              <div>
                <Label className="text-white">Custo Mensal Locação (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custoMensalLocacao || ''}
                  onChange={(e) => setFormData({...formData, custoMensalLocacao: Number(e.target.value)})}
                  placeholder="Valor mensal de locação"
                />
              </div>
              <div>
                <Label className="text-white">Vida Útil (páginas)</Label>
                <Input
                  type="number"
                  value={formData.vidaUtilPaginas || ''}
                  onChange={(e) => setFormData({...formData, vidaUtilPaginas: Number(e.target.value)})}
                  placeholder="Total de páginas na vida útil"
                />
              </div>
              <div>
                <Label className="text-white">Consumo Energia (kWh/mês)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.consumoEnergia || ''}
                  onChange={(e) => setFormData({...formData, consumoEnergia: Number(e.target.value)})}
                  placeholder="Consumo mensal de energia"
                />
              </div>
              <div>
                <Label className="text-white">Custo Manutenção Mensal (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custoManutencaoMensal || ''}
                  onChange={(e) => setFormData({...formData, custoManutencaoMensal: Number(e.target.value)})}
                  placeholder="Custo mensal de manutenção"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                checked={formData.ativo ?? true}
                onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
              />
              <Label className="text-white">Impressora Ativa</Label>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Impressoras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {printers.map((printer) => (
          <Card key={printer.id} className={`${printer.ativo ? 'border-green-200' : 'border-gray-300 opacity-60'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{printer.marca} {printer.modelo}</CardTitle>
                  <Badge variant={printer.ativo ? "default" : "secondary"} className="mt-1">
                    {printer.tipo}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(printer)} title="Editar">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onPricePrinter?.(printer)} className="text-blue-600" title="Precificar">
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(printer.id)} className="text-red-600" title="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Velocidade:</span>
                  <span>{printer.velocidadePPM} PPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Aquisição:</span>
                  <span>R$ {printer.custoAquisicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Locação Mensal:</span>
                  <span>R$ {printer.custoMensalLocacao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vida Útil:</span>
                  <span>{printer.vidaUtilPaginas.toLocaleString()} páginas</span>
                </div>
                <div className="flex justify-between">
                  <span>Manutenção:</span>
                  <span>R$ {printer.custoManutencaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                </div>
                {printer.precificacao && (
                  <>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-green-600 font-medium">Preço Venda:</span>
                      <span className="text-green-600 font-bold">
                        R$ {printer.precificacao.precoVendaSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {printer.precificacao.periodosLocacao && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Locação 12m:</span>
                          <span className="text-blue-600">
                            R$ {printer.precificacao.periodosLocacao[12]?.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}/mês
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Locação 36m:</span>
                          <span className="text-blue-600">
                            R$ {printer.precificacao.periodosLocacao[36]?.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}/mês
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs">Status:</span>
                  <Switch
                    checked={printer.ativo}
                    onCheckedChange={() => handleToggleActive(printer.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {printers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Printer className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nenhuma impressora cadastrada</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setShowAddForm(true)} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Cadastro Rápido
              </Button>
              <Button onClick={() => onCreateNewPrinter?.()} className="mt-4">
                <DollarSign className="h-4 w-4 mr-2" />
                Nova Impressora
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}