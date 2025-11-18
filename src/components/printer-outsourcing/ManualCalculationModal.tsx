'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Calculator, Printer, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Suprimento {
  id: string;
  tipo: 'Toner P&B' | 'Toner Ciano' | 'Toner Magenta' | 'Toner Amarelo' | 'Cilindro' | 'Fusor' | 'Kit Manutenção';
  descricao: string;
  rendimento: number; // páginas
  custo: number; // R$
}

interface ImpressoraManual {
  modelo: string;
  marca: string;
  tipo: 'Laser P&B' | 'Laser Colorida';
  velocidadePPM: number;
  custoAquisicao: number;
  vidaUtil: number; // páginas
  consumoEnergia: number; // kWh/mês
  custoManutencaoMensal: number;
  suprimentos: Suprimento[];
}

interface ManualCalculationModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export function ManualCalculationModal({ onClose, onSave }: ManualCalculationModalProps) {
  const [activeTab, setActiveTab] = useState('impressora');
  
  // Dados da impressora
  const [modelo, setModelo] = useState('');
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState<'Laser P&B' | 'Laser Colorida'>('Laser P&B');
  const [velocidadePPM, setVelocidadePPM] = useState(0);
  const [custoAquisicao, setCustoAquisicao] = useState(0);
  const [vidaUtil, setVidaUtil] = useState(100000);
  const [consumoEnergia, setConsumoEnergia] = useState(15);
  const [custoManutencao, setCustoManutencao] = useState(50);
  
  // Suprimentos
  const [suprimentos, setSuprimentos] = useState<Suprimento[]>([]);
  const [novoSuprimento, setNovoSuprimento] = useState<Partial<Suprimento>>({
    tipo: 'Toner P&B',
    descricao: '',
    rendimento: 0,
    custo: 0
  });

  // Volume para cálculo
  const [volumeMensal, setVolumeMensal] = useState(0);
  const [prazoContrato, setPrazoContrato] = useState(36);
  const [custoEnergiaKWh, setCustoEnergiaKWh] = useState(0.85);

  const adicionarSuprimento = () => {
    if (!novoSuprimento.descricao || !novoSuprimento.rendimento || !novoSuprimento.custo) {
      alert('Preencha todos os campos do suprimento');
      return;
    }

    const suprimento: Suprimento = {
      id: Date.now().toString(),
      tipo: novoSuprimento.tipo as any,
      descricao: novoSuprimento.descricao,
      rendimento: novoSuprimento.rendimento,
      custo: novoSuprimento.custo
    };

    setSuprimentos([...suprimentos, suprimento]);
    setNovoSuprimento({
      tipo: 'Toner P&B',
      descricao: '',
      rendimento: 0,
      custo: 0
    });
  };

  const removerSuprimento = (id: string) => {
    setSuprimentos(suprimentos.filter(s => s.id !== id));
  };

  const calcularCustoPorPagina = () => {
    if (volumeMensal === 0) return { total: 0, totalMono: 0, totalColor: 0, detalhes: {} };

    const isColorida = tipo === 'Laser Colorida';

    // 1. Custo de Suprimentos por página
    let custoSuprimentosMono = 0;
    let custoSuprimentosColor = 0;
    const detalhesSuprimentos: any = {};

    suprimentos.forEach(sup => {
      const custoPorPagina = sup.custo / sup.rendimento;
      
      // Separar custos mono e color
      if (sup.tipo === 'Toner P&B' || sup.tipo === 'Cilindro' || sup.tipo === 'Fusor' || sup.tipo === 'Kit Manutenção') {
        custoSuprimentosMono += custoPorPagina;
      } else {
        // Toners coloridos (Ciano, Magenta, Amarelo)
        custoSuprimentosColor += custoPorPagina;
      }
      
      detalhesSuprimentos[sup.tipo] = {
        custo: sup.custo,
        rendimento: sup.rendimento,
        custoPorPagina: custoPorPagina
      };
    });

    // 2. Custo de Depreciação por página
    const custoDepreciacaoPorPagina = custoAquisicao / vidaUtil;

    // 3. Custo de Energia por página
    const custoEnergiaMensal = consumoEnergia * custoEnergiaKWh;
    const custoEnergiaPorPagina = custoEnergiaMensal / volumeMensal;

    // 4. Custo de Manutenção por página
    const custoManutencaoPorPagina = custoManutencao / volumeMensal;

    // 5. Custos fixos (aplicados tanto em mono quanto color)
    const custosFixosPorPagina = custoDepreciacaoPorPagina + custoEnergiaPorPagina + custoManutencaoPorPagina;

    // 6. Custo Total por Página
    let custoTotalMono = 0;
    let custoTotalColor = 0;
    let custoTotalPorPagina = 0;

    if (isColorida) {
      // Para impressoras coloridas, calcular separadamente
      custoTotalMono = custoSuprimentosMono + custosFixosPorPagina;
      custoTotalColor = custoSuprimentosMono + custoSuprimentosColor + custosFixosPorPagina;
      custoTotalPorPagina = custoTotalColor; // Usar color como padrão para cálculos gerais
    } else {
      // Para impressoras P&B, apenas mono
      custoTotalMono = custoSuprimentosMono + custosFixosPorPagina;
      custoTotalPorPagina = custoTotalMono;
    }

    // 7. Custos Mensais e Anuais (usando custo médio ou color)
    const custoMensal = custoTotalPorPagina * volumeMensal;
    const custoAnual = custoMensal * 12;
    const custoTotalContrato = custoAnual * (prazoContrato / 12);

    return {
      total: custoTotalPorPagina,
      totalMono: custoTotalMono,
      totalColor: isColorida ? custoTotalColor : 0,
      isColorida,
      detalhes: {
        suprimentosMono: custoSuprimentosMono,
        suprimentosColor: custoSuprimentosColor,
        depreciacao: custoDepreciacaoPorPagina,
        energia: custoEnergiaPorPagina,
        manutencao: custoManutencaoPorPagina,
        detalhesSuprimentos
      },
      custoMensal,
      custoAnual,
      custoTotalContrato
    };
  };

  const handleSalvar = () => {
    if (!modelo || !marca || volumeMensal === 0 || suprimentos.length === 0) {
      alert('Preencha todos os campos obrigatórios: modelo, marca, volume mensal e pelo menos um suprimento');
      return;
    }

    const calculo = calcularCustoPorPagina();

    const dados = {
      impressora: {
        modelo,
        marca,
        tipo,
        velocidadePPM,
        custoAquisicao,
        vidaUtil,
        consumoEnergia,
        custoManutencaoMensal: custoManutencao
      },
      suprimentos,
      volumeMensal,
      prazoContrato,
      custoEnergiaKWh,
      calculo,
      isFromCatalog: false,
      isManualCalculation: true,
      // Incluir custos separados para impressoras coloridas
      custoPorPaginaMono: calculo.totalMono,
      custoPorPaginaColor: calculo.isColorida ? calculo.totalColor : 0,
      isColorida: calculo.isColorida
    };

    onSave(dados);
  };

  const calculo = calcularCustoPorPagina();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cálculo Manual Detalhado</DialogTitle>
          <DialogDescription>
            Adicione a impressora e todos os suprimentos para calcular o custo por página real
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="impressora">
              <Printer className="h-4 w-4 mr-2" />
              Impressora
            </TabsTrigger>
            <TabsTrigger value="suprimentos">
              <Package className="h-4 w-4 mr-2" />
              Suprimentos
            </TabsTrigger>
            <TabsTrigger value="volume">
              <Calculator className="h-4 w-4 mr-2" />
              Volume
            </TabsTrigger>
            <TabsTrigger value="resultado">
              Resultado
            </TabsTrigger>
          </TabsList>

          {/* Aba Impressora */}
          <TabsContent value="impressora" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Dados da Impressora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Modelo *</Label>
                    <Input
                      value={modelo}
                      onChange={(e) => setModelo(e.target.value)}
                      placeholder="Ex: LaserJet Pro M404n"
                    />
                  </div>
                  <div>
                    <Label>Marca *</Label>
                    <Input
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      placeholder="Ex: HP"
                    />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laser P&B">Laser P&B</SelectItem>
                        <SelectItem value="Laser Colorida">Laser Colorida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Velocidade (PPM)</Label>
                    <Input
                      type="number"
                      value={velocidadePPM || ''}
                      onChange={(e) => setVelocidadePPM(Number(e.target.value))}
                      placeholder="Ex: 38"
                    />
                  </div>
                  <div>
                    <Label>Custo de Aquisição (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={custoAquisicao || ''}
                      onChange={(e) => setCustoAquisicao(Number(e.target.value))}
                      placeholder="Ex: 1200.00"
                    />
                  </div>
                  <div>
                    <Label>Vida Útil (páginas)</Label>
                    <Input
                      type="number"
                      value={vidaUtil || ''}
                      onChange={(e) => setVidaUtil(Number(e.target.value))}
                      placeholder="Ex: 100000"
                    />
                  </div>
                  <div>
                    <Label>Consumo de Energia (kWh/mês)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={consumoEnergia || ''}
                      onChange={(e) => setConsumoEnergia(Number(e.target.value))}
                      placeholder="Ex: 15"
                    />
                  </div>
                  <div>
                    <Label>Custo de Manutenção Mensal (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={custoManutencao || ''}
                      onChange={(e) => setCustoManutencao(Number(e.target.value))}
                      placeholder="Ex: 50.00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Suprimentos */}
          <TabsContent value="suprimentos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Adicionar Suprimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Tipo</Label>
                    <Select 
                      value={novoSuprimento.tipo} 
                      onValueChange={(v: any) => setNovoSuprimento({...novoSuprimento, tipo: v})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Toner P&B">Toner P&B</SelectItem>
                        <SelectItem value="Toner Ciano">Toner Ciano</SelectItem>
                        <SelectItem value="Toner Magenta">Toner Magenta</SelectItem>
                        <SelectItem value="Toner Amarelo">Toner Amarelo</SelectItem>
                        <SelectItem value="Cilindro">Cilindro (Fotoconductor)</SelectItem>
                        <SelectItem value="Fusor">Fusor</SelectItem>
                        <SelectItem value="Kit Manutenção">Kit Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={novoSuprimento.descricao}
                      onChange={(e) => setNovoSuprimento({...novoSuprimento, descricao: e.target.value})}
                      placeholder="Ex: HP CF410A"
                    />
                  </div>
                  <div>
                    <Label>Rendimento (páginas)</Label>
                    <Input
                      type="number"
                      value={novoSuprimento.rendimento || ''}
                      onChange={(e) => setNovoSuprimento({...novoSuprimento, rendimento: Number(e.target.value)})}
                      placeholder="Ex: 2300"
                    />
                  </div>
                  <div>
                    <Label>Custo (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={novoSuprimento.custo || ''}
                      onChange={(e) => setNovoSuprimento({...novoSuprimento, custo: Number(e.target.value)})}
                      placeholder="Ex: 180.00"
                    />
                  </div>
                </div>
                <Button onClick={adicionarSuprimento} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Suprimento
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Suprimentos */}
            {suprimentos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Suprimentos Adicionados ({suprimentos.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suprimentos.map((sup) => (
                      <div key={sup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{sup.tipo}</Badge>
                            <span className="font-medium">{sup.descricao}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Rendimento: {sup.rendimento.toLocaleString()} páginas | 
                            Custo: R$ {sup.custo.toFixed(2)} | 
                            Custo/página: R$ {(sup.custo / sup.rendimento).toFixed(4)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerSuprimento(sup.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Volume */}
          <TabsContent value="volume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Parâmetros de Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Volume Mensal (páginas) *</Label>
                    <Input
                      type="number"
                      value={volumeMensal || ''}
                      onChange={(e) => setVolumeMensal(Number(e.target.value))}
                      placeholder="Ex: 5000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Volume estimado de impressão por mês
                    </p>
                  </div>
                  <div>
                    <Label>Prazo do Contrato (meses)</Label>
                    <Select value={prazoContrato.toString()} onValueChange={(v) => setPrazoContrato(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 meses</SelectItem>
                        <SelectItem value="24">24 meses</SelectItem>
                        <SelectItem value="36">36 meses</SelectItem>
                        <SelectItem value="48">48 meses</SelectItem>
                        <SelectItem value="60">60 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Custo Energia (R$/kWh)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={custoEnergiaKWh || ''}
                      onChange={(e) => setCustoEnergiaKWh(Number(e.target.value))}
                      placeholder="Ex: 0.85"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Resultado */}
          <TabsContent value="resultado" className="space-y-4">
            {volumeMensal > 0 && suprimentos.length > 0 ? (
              <>
                {calculo.isColorida ? (
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-blue-900">Custo Monocromático</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            R$ {calculo.totalMono.toFixed(4)}
                          </div>
                          <p className="text-sm text-blue-700 mt-2">por página P&B</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-green-900">Custo Colorido</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            R$ {calculo.totalColor.toFixed(4)}
                          </div>
                          <p className="text-sm text-green-700 mt-2">por página Color</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-900">Custo por Página Calculado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-600">
                          R$ {calculo.total.toFixed(4)}
                        </div>
                        <p className="text-sm text-green-700 mt-2">por página P&B</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Detalhamento do Custo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {calculo.isColorida ? (
                        <>
                          <div className="flex justify-between p-2 bg-blue-50 rounded">
                            <span className="text-blue-900">Suprimentos Mono (P&B)</span>
                            <span className="font-bold text-blue-600">
                              R$ {calculo.detalhes.suprimentosMono?.toFixed(4) || '0.0000'}
                            </span>
                          </div>
                          <div className="flex justify-between p-2 bg-cyan-50 rounded">
                            <span className="text-cyan-900">Suprimentos Color (CMY)</span>
                            <span className="font-bold text-cyan-600">
                              R$ {calculo.detalhes.suprimentosColor?.toFixed(4) || '0.0000'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between p-2 bg-blue-50 rounded">
                          <span className="text-blue-900">Suprimentos</span>
                          <span className="font-bold text-blue-600">
                            R$ {calculo.detalhes.suprimentosMono?.toFixed(4) || '0.0000'}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between p-2 bg-purple-50 rounded">
                        <span className="text-purple-900">Depreciação</span>
                        <span className="font-bold text-purple-600">
                          R$ {calculo.detalhes.depreciacao?.toFixed(4) || '0.0000'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-yellow-900">Energia</span>
                        <span className="font-bold text-yellow-600">
                          R$ {calculo.detalhes.energia?.toFixed(4) || '0.0000'}
                        </span>
                      </div>
                      <div className="flex justify-between p-2 bg-orange-50 rounded">
                        <span className="text-orange-900">Manutenção</span>
                        <span className="font-bold text-orange-600">
                          R$ {calculo.detalhes.manutencao?.toFixed(4) || '0.0000'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Custos Totais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Custo Mensal</p>
                        <p className="text-xl font-bold text-gray-900">
                          R$ {calculo.custoMensal?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Custo Anual</p>
                        <p className="text-xl font-bold text-gray-900">
                          R$ {calculo.custoAnual?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Custo Total ({prazoContrato} meses)</p>
                        <p className="text-xl font-bold text-gray-900">
                          R$ {calculo.custoTotalContrato?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Preencha os dados da impressora, adicione suprimentos e defina o volume mensal para ver o resultado
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSalvar}
            disabled={!modelo || !marca || volumeMensal === 0 || suprimentos.length === 0}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Adicionar ao Cálculo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
