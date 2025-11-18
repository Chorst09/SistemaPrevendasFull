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
  const [showModalidadeSelection, setShowModalidadeSelection] = useState(true);
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
  
  // Modalidade de locação
  const [modalidadeLocacao, setModalidadeLocacao] = useState<'franquia' | 'por-pagina'>('por-pagina');
  const [valorLocacaoImpressora, setValorLocacaoImpressora] = useState(0);
  const [franquiaMensal, setFranquiaMensal] = useState(0);
  const [valorFranquia, setValorFranquia] = useState(0);

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
    if (volumeMensal === 0) return { 
      total: 0, 
      totalMono: 0, 
      totalColor: 0, 
      detalhes: {},
      custoMensal: 0,
      custoAnual: 0,
      custoTotalContrato: 0
    };

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

    // 6. Custo Total por Página (APENAS SUPRIMENTOS para modalidade por página)
    let custoTotalMono = 0;
    let custoTotalColor = 0;
    let custoTotalPorPagina = 0;

    if (modalidadeLocacao === 'por-pagina') {
      // Modalidade por página: custo por página = apenas suprimentos
      if (isColorida) {
        custoTotalMono = custoSuprimentosMono;
        custoTotalColor = custoSuprimentosMono + custoSuprimentosColor;
        custoTotalPorPagina = custoTotalColor;
      } else {
        custoTotalMono = custoSuprimentosMono;
        custoTotalPorPagina = custoTotalMono;
      }
    } else {
      // Modalidade franquia: custo por página = suprimentos + custos fixos
      if (isColorida) {
        custoTotalMono = custoSuprimentosMono + custosFixosPorPagina;
        custoTotalColor = custoSuprimentosMono + custoSuprimentosColor + custosFixosPorPagina;
        custoTotalPorPagina = custoTotalColor;
      } else {
        custoTotalMono = custoSuprimentosMono + custosFixosPorPagina;
        custoTotalPorPagina = custoTotalMono;
      }
    }

    // 7. Custos Mensais e Anuais
    let custoMensal = 0;
    let custoAnual = 0;
    let custoTotalContrato = 0;

    if (modalidadeLocacao === 'franquia') {
      // Franquia: valor fixo mensal
      custoMensal = valorFranquia;
      custoAnual = custoMensal * 12;
      custoTotalContrato = custoAnual * (prazoContrato / 12);
    } else {
      // Por página: locação da impressora + custo por página
      const custoPaginasMensal = custoTotalPorPagina * volumeMensal;
      custoMensal = valorLocacaoImpressora + custoPaginasMensal;
      custoAnual = custoMensal * 12;
      custoTotalContrato = custoAnual * (prazoContrato / 12);
    }

    return {
      total: custoTotalPorPagina,
      totalMono: custoTotalMono,
      totalColor: isColorida ? custoTotalColor : 0,
      isColorida,
      modalidade: modalidadeLocacao,
      valorLocacaoImpressora,
      franquiaMensal,
      valorFranquia,
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

    if (modalidadeLocacao === 'franquia' && valorFranquia === 0) {
      alert('Preencha o valor da franquia mensal');
      return;
    }

    if (modalidadeLocacao === 'por-pagina' && valorLocacaoImpressora === 0) {
      alert('Preencha o valor da locação da impressora');
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
      isColorida: calculo.isColorida,
      // Modalidade de locação
      modalidadeLocacao,
      valorLocacaoImpressora,
      franquiaMensal,
      valorFranquia
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
            {showModalidadeSelection 
              ? 'Selecione a modalidade de locação para começar'
              : 'Adicione a impressora e todos os suprimentos para calcular o custo por página real'
            }
          </DialogDescription>
        </DialogHeader>

        {showModalidadeSelection ? (
          /* Tela de Seleção de Modalidade */
          <div className="space-y-6 py-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Escolha a Modalidade de Locação</h3>
              <p className="text-sm text-gray-600">
                Selecione como deseja calcular o custo da impressora
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Modalidade Franquia */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
                onClick={() => {
                  setModalidadeLocacao('franquia');
                  setShowModalidadeSelection(false);
                }}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-blue-900">Franquia Mensal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Valor fixo mensal incluindo impressora e franquia de páginas
                  </p>
                  <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900">Inclui:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>✓ Locação do equipamento</li>
                      <li>✓ Franquia de páginas mensais</li>
                      <li>✓ Valor fixo e previsível</li>
                      <li>✓ Ideal para volumes constantes</li>
                    </ul>
                  </div>
                  <div className="text-center pt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Recomendado para volumes estáveis
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Modalidade Por Página */}
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
                onClick={() => {
                  setModalidadeLocacao('por-pagina');
                  setShowModalidadeSelection(false);
                }}
              >
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-green-900">Por Página Impressa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 text-center">
                    Locação da impressora + custo por página impressa
                  </p>
                  <div className="bg-green-50 p-3 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-green-900">Inclui:</h4>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>✓ Locação do equipamento (valor fixo)</li>
                      <li>✓ Custo por página impressa</li>
                      <li>✓ Custos mono e color separados</li>
                      <li>✓ Ideal para volumes variáveis</li>
                    </ul>
                  </div>
                  <div className="text-center pt-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Recomendado para volumes variáveis
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          /* Formulário Principal */
          <>

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
                <CardTitle className="text-sm">Modalidade de Locação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      modalidadeLocacao === 'franquia'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setModalidadeLocacao('franquia')}
                  >
                    <h4 className="font-semibold mb-2">Franquia Mensal</h4>
                    <p className="text-sm text-gray-600">
                      Valor fixo mensal incluindo impressora e franquia de páginas
                    </p>
                  </div>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      modalidadeLocacao === 'por-pagina'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setModalidadeLocacao('por-pagina')}
                  >
                    <h4 className="font-semibold mb-2">Por Página Impressa</h4>
                    <p className="text-sm text-gray-600">
                      Locação da impressora + custo por página impressa
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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

                {modalidadeLocacao === 'franquia' ? (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <Label>Franquia Mensal (páginas)</Label>
                      <Input
                        type="number"
                        value={franquiaMensal || ''}
                        onChange={(e) => setFranquiaMensal(Number(e.target.value))}
                        placeholder="Ex: 5000"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Quantidade de páginas incluídas na franquia
                      </p>
                    </div>
                    <div>
                      <Label>Valor da Franquia (R$/mês) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={valorFranquia || ''}
                        onChange={(e) => setValorFranquia(Number(e.target.value))}
                        placeholder="Ex: 500.00"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Valor fixo mensal da franquia
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <Label>Valor Locação da Impressora (R$/mês) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={valorLocacaoImpressora || ''}
                      onChange={(e) => setValorLocacaoImpressora(Number(e.target.value))}
                      placeholder="Ex: 150.00"
                      className="mt-2"
                    />
                    <p className="text-xs text-green-600 mt-1">
                      Valor mensal da locação do equipamento (sem páginas)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Resultado */}
          <TabsContent value="resultado" className="space-y-4">
            {volumeMensal > 0 && suprimentos.length > 0 ? (
              <>
                {/* Modalidade de Locação */}
                <Card className={modalidadeLocacao === 'franquia' ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'}>
                  <CardHeader>
                    <CardTitle className={modalidadeLocacao === 'franquia' ? 'text-blue-900' : 'text-green-900'}>
                      Modalidade: {modalidadeLocacao === 'franquia' ? 'Franquia Mensal' : 'Por Página Impressa'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {modalidadeLocacao === 'franquia' ? (
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">
                          R$ {valorFranquia.toFixed(2)}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          Valor fixo mensal (inclui {franquiaMensal.toLocaleString()} páginas)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-center p-3 bg-white rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            R$ {valorLocacaoImpressora.toFixed(2)}
                          </div>
                          <p className="text-sm text-green-700 mt-1">Locação da Impressora/mês</p>
                        </div>
                        {calculo.isColorida ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center p-3 bg-white rounded-lg">
                              <div className="text-xl font-bold text-blue-600">
                                R$ {calculo.totalMono.toFixed(4)}
                              </div>
                              <p className="text-xs text-blue-700 mt-1">por página Mono</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg">
                              <div className="text-xl font-bold text-green-600">
                                R$ {calculo.totalColor.toFixed(4)}
                              </div>
                              <p className="text-xs text-green-700 mt-1">por página Color</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center p-3 bg-white rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                              R$ {calculo.totalMono.toFixed(4)}
                            </div>
                            <p className="text-sm text-blue-700 mt-1">por página P&B</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Custos por Página (sempre mostrar para referência) */}
                {calculo.isColorida && (
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-blue-900">Custo Suprimentos Mono</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            R$ {calculo.totalMono.toFixed(4)}
                          </div>
                          <p className="text-xs text-blue-700 mt-1">por página P&B</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-green-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-900">Custo Suprimentos Color</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            R$ {calculo.totalColor.toFixed(4)}
                          </div>
                          <p className="text-xs text-green-700 mt-1">por página Color</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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

        <div className="flex justify-between space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              setShowModalidadeSelection(true);
            }}
          >
            ← Voltar
          </Button>
          <Button 
            onClick={handleSalvar}
            disabled={!modelo || !marca || volumeMensal === 0 || suprimentos.length === 0}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Adicionar ao Cálculo
          </Button>
        </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
