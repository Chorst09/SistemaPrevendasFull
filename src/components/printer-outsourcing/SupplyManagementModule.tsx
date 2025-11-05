"use client"

import { useState } from "react"
import { Package, Plus, Edit, Trash2, Save, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Printer, Suprimento } from "./types"

interface SupplyManagementModuleProps {
  printers: Printer[]
  suprimentos: Suprimento[]
  onUpdateSuprimentos: (suprimentos: Suprimento[]) => void
}

export function SupplyManagementModule({ printers, suprimentos, onUpdateSuprimentos }: SupplyManagementModuleProps) {
  const [editingSupply, setEditingSupply] = useState<Suprimento | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPrinter, setSelectedPrinter] = useState<string>('all')

  const [formData, setFormData] = useState<Partial<Suprimento>>({
    printerId: '',
    tipo: 'Toner P&B',
    descricao: '',
    rendimentoPaginas: 0,
    custoUnitario: 0,
    estoqueMinimo: 0,
    estoqueAtual: 0,
    fornecedor: '',
    codigoOriginal: '',
    compativel: false
  })

  const handleSave = () => {
    if (!formData.printerId || !formData.descricao) return

    const newSupply: Suprimento = {
      id: editingSupply?.id || Date.now().toString(),
      printerId: formData.printerId!,
      tipo: formData.tipo!,
      descricao: formData.descricao!,
      rendimentoPaginas: formData.rendimentoPaginas || 0,
      custoUnitario: formData.custoUnitario || 0,
      estoqueMinimo: formData.estoqueMinimo || 0,
      estoqueAtual: formData.estoqueAtual || 0,
      fornecedor: formData.fornecedor || '',
      codigoOriginal: formData.codigoOriginal || '',
      compativel: formData.compativel ?? false
    }

    let updatedSupplies
    if (editingSupply) {
      updatedSupplies = suprimentos.map(s => s.id === editingSupply.id ? newSupply : s)
    } else {
      updatedSupplies = [...suprimentos, newSupply]
    }

    onUpdateSuprimentos(updatedSupplies)
    handleCancel()
  }

  const handleCancel = () => {
    setEditingSupply(null)
    setShowAddForm(false)
    setFormData({
      printerId: '',
      tipo: 'Toner P&B',
      descricao: '',
      rendimentoPaginas: 0,
      custoUnitario: 0,
      estoqueMinimo: 0,
      estoqueAtual: 0,
      fornecedor: '',
      codigoOriginal: '',
      compativel: false
    })
  }

  const handleEdit = (supply: Suprimento) => {
    setEditingSupply(supply)
    setFormData(supply)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este suprimento?')) {
      onUpdateSuprimentos(suprimentos.filter(s => s.id !== id))
    }
  }

  const getPrinterName = (printerId: string) => {
    const printer = printers.find(p => p.id === printerId)
    return printer ? `${printer.marca} ${printer.modelo}` : 'Impressora não encontrada'
  }

  const getSuppliesByPrinter = () => {
    if (!selectedPrinter || selectedPrinter === "all") return suprimentos
    return suprimentos.filter(s => s.printerId === selectedPrinter)
  }

  const getLowStockSupplies = () => {
    return suprimentos.filter(s => s.estoqueAtual <= s.estoqueMinimo)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão de Suprimentos</h2>
        <div className="flex gap-2">
          <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por impressora" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as impressoras</SelectItem>
              {printers.map(printer => (
                <SelectItem key={printer.id} value={printer.id}>
                  {printer.marca} {printer.modelo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Suprimento
          </Button>
        </div>
      </div>

      {/* Alertas de Estoque Baixo */}
      {getLowStockSupplies().length > 0 && (
        <Card className="border-orange-400 bg-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Estoque Baixo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockSupplies().map(supply => (
                <div key={supply.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <div>
                    <span className="font-medium">{supply.descricao}</span>
                    <span className="text-sm text-gray-500 ml-2">({getPrinterName(supply.printerId)})</span>
                  </div>
                  <Badge variant="destructive">
                    Estoque: {supply.estoqueAtual} (Mín: {supply.estoqueMinimo})
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Adição/Edição */}
      {showAddForm && (
        <Card className="border-slate-600 bg-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-white">{editingSupply ? 'Editar Suprimento' : 'Novo Suprimento'}</span>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Impressora</Label>
                <Select value={formData.printerId} onValueChange={(value) => setFormData({...formData, printerId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a impressora" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.filter(p => p.ativo).map(printer => (
                      <SelectItem key={printer.id} value={printer.id}>
                        {printer.marca} {printer.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Tipo de Suprimento</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toner P&B">Toner P&B</SelectItem>
                    <SelectItem value="Toner Ciano">Toner Ciano</SelectItem>
                    <SelectItem value="Toner Magenta">Toner Magenta</SelectItem>
                    <SelectItem value="Toner Amarelo">Toner Amarelo</SelectItem>
                    <SelectItem value="Toner Preto">Toner Preto</SelectItem>
                    <SelectItem value="Fotoconductor">Fotoconductor</SelectItem>
                    <SelectItem value="Kit Manutenção">Kit Manutenção</SelectItem>
                    <SelectItem value="Papel">Papel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Descrição</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                  placeholder="Ex: Toner HP CF410A Preto"
                />
              </div>
              <div>
                <Label className="text-white">Rendimento (páginas)</Label>
                <Input
                  type="number"
                  value={formData.rendimentoPaginas || ''}
                  onChange={(e) => setFormData({...formData, rendimentoPaginas: Number(e.target.value)})}
                  placeholder="Páginas que o suprimento rende"
                />
              </div>
              <div>
                <Label className="text-white">Custo Unitário (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.custoUnitario || ''}
                  onChange={(e) => setFormData({...formData, custoUnitario: Number(e.target.value)})}
                  placeholder="Preço de compra"
                />
              </div>
              <div>
                <Label className="text-white">Estoque Mínimo</Label>
                <Input
                  type="number"
                  value={formData.estoqueMinimo || ''}
                  onChange={(e) => setFormData({...formData, estoqueMinimo: Number(e.target.value)})}
                  placeholder="Quantidade mínima em estoque"
                />
              </div>
              <div>
                <Label className="text-white">Estoque Atual</Label>
                <Input
                  type="number"
                  value={formData.estoqueAtual || ''}
                  onChange={(e) => setFormData({...formData, estoqueAtual: Number(e.target.value)})}
                  placeholder="Quantidade atual em estoque"
                />
              </div>
              <div>
                <Label className="text-white">Fornecedor</Label>
                <Input
                  value={formData.fornecedor || ''}
                  onChange={(e) => setFormData({...formData, fornecedor: e.target.value})}
                  placeholder="Nome do fornecedor"
                />
              </div>
              <div>
                <Label className="text-white">Código Original</Label>
                <Input
                  value={formData.codigoOriginal || ''}
                  onChange={(e) => setFormData({...formData, codigoOriginal: e.target.value})}
                  placeholder="Código do fabricante"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4">
              <Switch
                checked={formData.compativel ?? false}
                onCheckedChange={(checked) => setFormData({...formData, compativel: checked})}
              />
              <Label className="text-white">Suprimento Compatível (não original)</Label>
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

      {/* Lista de Suprimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {getSuppliesByPrinter().map((supply) => (
          <Card key={supply.id} className={`${supply.estoqueAtual <= supply.estoqueMinimo ? 'border-orange-200' : 'border-gray-200'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{supply.descricao}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{supply.tipo}</Badge>
                    {supply.compativel && <Badge variant="secondary">Compatível</Badge>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(supply)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(supply.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Impressora:</span>
                  <span className="text-xs">{getPrinterName(supply.printerId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rendimento:</span>
                  <span>{supply.rendimentoPaginas.toLocaleString()} páginas</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Unitário:</span>
                  <span>R$ {supply.custoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo por Página:</span>
                  <span>R$ {(supply.custoUnitario / supply.rendimentoPaginas).toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estoque:</span>
                  <span className={supply.estoqueAtual <= supply.estoqueMinimo ? 'text-orange-600 font-bold' : ''}>
                    {supply.estoqueAtual} / {supply.estoqueMinimo} mín
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fornecedor:</span>
                  <span className="text-xs">{supply.fornecedor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getSuppliesByPrinter().length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {selectedPrinter ? 'Nenhum suprimento cadastrado para esta impressora' : 'Nenhum suprimento cadastrado'}
            </p>
            <Button onClick={() => setShowAddForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Suprimento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}