"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Server, Cpu, HardDrive, MemoryStick, Network,
  Calculator, Save, Download, RefreshCw, Search,
  TrendingUp, DollarSign, Clock, Zap, FileText,
  Brain, Plus, Trash2, Edit, Eye, ArrowLeft,
  Building, Settings, PieChart
} from 'lucide-react';
import { ProposalClientForm, ClientData } from './ProposalClientForm';
import { useQuotes } from '@/contexts/QuoteContext';
import { PricingProposal } from '@/hooks/use-quote-integration';

interface VMConfig {
  id: string;
  name: string;
  vcpu: number;
  ram: number;
  storageType: string;
  storageSize: number;
  networkCard: string;
  os: string;
  backupSize: number;
  additionalIP: boolean;
  additionalSnapshot: boolean;
  vpnSiteToSite: boolean;
  quantity: number;
}

interface NegotiationRound {
  id: string;
  roundNumber: number;
  date: string;
  description: string;
  discount: number;
  vms: VMConfig[];
  originalPrice: number;
  totalPrice: number;
  status: 'active' | 'accepted' | 'rejected';
}

interface Proposal {
  id: string;
  proposalNumber: string;
  name: string;
  clientName: string;
  date: string;
  vms: VMConfig[];
  totalPrice: number;
  negotiationRounds: NegotiationRound[];
  currentRound: number;
  // Novos campos para dados do cliente e gerente
  clientData?: {
    razaoSocial: string;
    nomeContato: string;
    telefoneCliente: string;
    emailCliente: string;
    nomeProjeto: string;
    nomeGerente: string;
    telefoneGerente: string;
    emailGerente: string;
  };
}

interface TaxConfig {
  pisCofins: number;
  iss: number;
  csllIr: number;
}

interface PricingConfig {
  vcpuPerCore: number;
  ramPerGB: number;
  storagePerGB: {
    'HDD SAS': number;
    'SSD SATA': number;
    'SSD NVMe': number;
  };
  networkPerGbps: number;
  osLicense: {
    'Linux': number;
    'Windows Server': number;
    'FreeBSD': number;
    'Custom': number;
  };
  backupPerGB: number;
  additionalIP: number;
  additionalSnapshot: number;
  vpnSiteToSite: number;
  // Novos campos de configuração
  taxes: {
    'Lucro Real': TaxConfig;
    'Lucro Presumido': TaxConfig;
    'Lucro Real Reduzido': TaxConfig;
    'Simples Nacional': TaxConfig;
  };
  markup: number;
  netMargin: number;
  commission: number;
  selectedTaxRegime: string;
  // Novos campos adicionais
  storageCosts: {
    'HDD SAS': number;
    'NVMe': number;
    'SSD Performance': number;
  };
  networkCosts: {
    '1 Gbps': number;
    '10 Gbps': number;
  };
  contractDiscounts: {
    '12': number;
    '24': number;
    '36': number;
    '48': number;
    '60': number;
  };
  setupFee: number;
  managementSupport: number;
}

const VMCalculator: React.FC = () => {
  const { createQuoteFromProposal } = useQuotes();
  
  const [currentVM, setCurrentVM] = useState<VMConfig>({
    id: '',
    name: '',
    vcpu: 2,
    ram: 4,
    storageType: 'HDD SAS',
    storageSize: 100,
    networkCard: '1 Gbps',
    os: 'Linux',
    backupSize: 0,
    additionalIP: false,
    additionalSnapshot: false,
    vpnSiteToSite: false,
    quantity: 1
  });

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [currentProposal, setCurrentProposal] = useState<Proposal>({
    id: '',
    proposalNumber: '',
    name: '',
    clientName: '',
    date: new Date().toISOString(),
    vms: [],
    totalPrice: 0,
    negotiationRounds: [],
    currentRound: 0
  });

  const [activeTab, setActiveTab] = useState<'config' | 'summary' | 'negotiations' | 'settings' | 'search'>('config');
  const [searchTerm, setSearchTerm] = useState('');
  const [proposalSearchTerm, setProposalSearchTerm] = useState('');
  const [netMarginValue, setNetMarginValue] = useState<string>('N/A');
  const [isRealMargin, setIsRealMargin] = useState<boolean>(false);
  const [roundDescription, setRoundDescription] = useState('');
  const [roundDiscount, setRoundDiscount] = useState<number>(0);
  const [showClientForm, setShowClientForm] = useState(false);
  const [pendingProposalData, setPendingProposalData] = useState<any>(null);

  // Configurações de preços expandidas
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>({
    vcpuPerCore: 50,
    ramPerGB: 30,
    storagePerGB: {
      'HDD SAS': 0.3,
      'SSD SATA': 0.8,
      'SSD NVMe': 1.2
    },
    networkPerGbps: 20,
    osLicense: {
      'Linux': 0,
      'Windows Server': 200,
      'FreeBSD': 0,
      'Custom': 100
    },
    backupPerGB: 0.1,
    additionalIP: 50,
    additionalSnapshot: 25,
    vpnSiteToSite: 150,
    taxes: {
      'Lucro Real': { pisCofins: 10.00, iss: 5.00, csllIr: 0 },
      'Lucro Presumido': { pisCofins: 10.00, iss: 5.00, csllIr: 0 },
      'Lucro Real Reduzido': { pisCofins: 10.00, iss: 5.00, csllIr: 0 },
      'Simples Nacional': { pisCofins: 10.00, iss: 5.00, csllIr: 0 }
    },
    markup: 65.5,
    netMargin: 0,
    commission: 3.60,
    selectedTaxRegime: 'Lucro Real',
    // Novos campos adicionais
    storageCosts: {
      'HDD SAS': 0.2,
      'NVMe': 0.45,
      'SSD Performance': 0.35
    },
    networkCosts: {
      '1 Gbps': 0,
      '10 Gbps': 100
    },
    contractDiscounts: {
      '12': 0,
      '24': 2,
      '36': 5,
      '48': 7,
      '60': 10
    },
    setupFee: 0,
    managementSupport: 250
  });

  const storageOptions = [
    { value: 'HDD SAS', label: 'HDD SAS' },
    { value: 'SSD SATA', label: 'SSD SATA' },
    { value: 'SSD NVMe', label: 'SSD NVMe' }
  ];

  const networkOptions = [
    { value: '1 Gbps', label: '1 Gbps' },
    { value: '10 Gbps', label: '10 Gbps' },
    { value: '25 Gbps', label: '25 Gbps' }
  ];

  const osOptions = [
    { value: 'Linux', label: 'Linux (Gratuito)' },
    { value: 'Windows Server', label: 'Windows Server' },
    { value: 'FreeBSD', label: 'FreeBSD' },
    { value: 'Custom', label: 'Custom OS' }
  ];

  const taxRegimeOptions = [
    { value: 'Lucro Real', label: 'Lucro Real' },
    { value: 'Lucro Presumido', label: 'Lucro Presumido' },
    { value: 'Lucro Real Reduzido', label: 'Lucro Real Reduzido' },
    { value: 'Simples Nacional', label: 'Simples Nacional' }
  ];

  // Função para gerar número da proposta automaticamente
  const generateProposalNumber = (): string => {
    const currentYear = new Date().getFullYear();
    const existingProposalsThisYear = proposals.filter(p =>
      p.proposalNumber.endsWith(`/${currentYear}`)
    );
    const nextNumber = existingProposalsThisYear.length + 1;
    return `${nextNumber.toString().padStart(4, '0')}/${currentYear}`;
  };

  const calculateTotalTaxes = (regime: string): number => {
    const taxes = pricingConfig.taxes[regime as keyof typeof pricingConfig.taxes];
    return taxes.pisCofins + taxes.iss + taxes.csllIr;
  };

  const calculateNetMargin = (markup: number): number => {
    if (markup <= 0) return 0;

    // Validação para evitar valores muito altos
    if (markup > 1000) {
      console.warn('Markup muito alto:', markup, '%. Limitando cálculo.');
      return 0;
    }

    // Obter impostos e comissões do regime selecionado
    const selectedRegime = pricingConfig.selectedTaxRegime;
    const taxes = pricingConfig.taxes[selectedRegime as keyof typeof pricingConfig.taxes];
    const totalTaxes = taxes.pisCofins + taxes.iss + taxes.csllIr;
    const commission = pricingConfig.commission;

    // Cálculo da Margem Líquida Real considerando impostos e comissões:
    // 1. Preço de Venda = Custo × (1 + Markup/100)
    // 2. Impostos = Preço de Venda × (Impostos/100)
    // 3. Comissões = Preço de Venda × (Comissões/100)
    // 4. Margem Líquida = (Preço de Venda - Custo - Impostos - Comissões) / Preço de Venda × 100

    // Simulando com custo base = 100 para calcular a margem percentual
    const baseCost = 100;
    const salePrice = baseCost * (1 + markup / 100);
    const taxAmount = salePrice * (totalTaxes / 100);
    const commissionAmount = salePrice * (commission / 100);
    const netProfit = salePrice - baseCost - taxAmount - commissionAmount;
    const netMargin = (netProfit / salePrice) * 100;

    console.log('=== CÁLCULO DA MARGEM LÍQUIDA REAL ===');
    console.log('Markup inserido:', markup + '%');
    console.log('Impostos totais:', totalTaxes + '%');
    console.log('Comissões:', commission + '%');
    console.log('---');
    console.log('Custo base (simulado):', baseCost);
    console.log('Preço de venda:', salePrice.toFixed(2));
    console.log('Valor dos impostos:', taxAmount.toFixed(2));
    console.log('Valor das comissões:', commissionAmount.toFixed(2));
    console.log('Lucro líquido:', netProfit.toFixed(2));
    console.log('Margem Líquida Real:', netMargin.toFixed(2) + '%');
    console.log('=====================================');

    // Limitar resultado a valores razoáveis
    return Math.min(Math.max(0, netMargin), 99.99);
  };

  // Função para atualizar a margem líquida quando o markup mudar
  const handleMarkupChange = (value: number) => {
    console.log('Markup alterado para:', value);

    // Validar e limitar o valor do markup
    const validatedValue = Math.min(Math.max(0, value), 999.99);

    if (value !== validatedValue) {
      console.warn('Valor de markup ajustado de', value, 'para', validatedValue);
    }

    setPricingConfig(prev => ({
      ...prev,
      markup: validatedValue
    }));

    // Calcular e atualizar a margem líquida imediatamente
    if (validatedValue > 0) {
      const calculatedMargin = calculateNetMargin(validatedValue);
      setNetMarginValue(`${calculatedMargin.toFixed(2)}%`);
      console.log('Margem líquida atualizada para:', calculatedMargin.toFixed(2) + '%');
    } else {
      setNetMarginValue('N/A');
    }
  };

  const calculateVMPrice = (vm: VMConfig): number => {
    const basePrice =
      (vm.vcpu * pricingConfig.vcpuPerCore) +
      (vm.ram * pricingConfig.ramPerGB) +
      (vm.storageSize * pricingConfig.storagePerGB[vm.storageType as keyof typeof pricingConfig.storagePerGB]) +
      (parseInt(vm.networkCard) * pricingConfig.networkPerGbps);

    const osPrice = pricingConfig.osLicense[vm.os as keyof typeof pricingConfig.osLicense] || 0;
    const backupPrice = vm.backupSize * pricingConfig.backupPerGB;
    const additionalIPPrice = vm.additionalIP ? pricingConfig.additionalIP : 0;
    const snapshotPrice = vm.additionalSnapshot ? pricingConfig.additionalSnapshot : 0;
    const vpnPrice = vm.vpnSiteToSite ? pricingConfig.vpnSiteToSite : 0;

    const subtotal = basePrice + osPrice + backupPrice + additionalIPPrice + snapshotPrice + vpnPrice;

    // Aplicar markup
    const markupPrice = subtotal * (pricingConfig.markup / 100);

    // Aplicar impostos sobre o valor com markup
    const totalTaxes = calculateTotalTaxes(pricingConfig.selectedTaxRegime);
    const priceWithMarkup = subtotal + markupPrice;
    const taxPrice = priceWithMarkup * (totalTaxes / 100);

    return priceWithMarkup + taxPrice;
  };

  // Função para calcular a margem líquida real de uma proposta específica
  const calculateRealNetMargin = (): number => {
    if (currentProposal.vms.length === 0) return 0;

    // Calcular custo base total
    let totalBaseCost = 0;
    currentProposal.vms.forEach(vm => {
      const basePrice =
        (vm.vcpu * pricingConfig.vcpuPerCore) +
        (vm.ram * pricingConfig.ramPerGB) +
        (vm.storageSize * pricingConfig.storagePerGB[vm.storageType as keyof typeof pricingConfig.storagePerGB]) +
        (parseInt(vm.networkCard) * pricingConfig.networkPerGbps);

      const osPrice = pricingConfig.osLicense[vm.os as keyof typeof pricingConfig.osLicense] || 0;
      const backupPrice = vm.backupSize * pricingConfig.backupPerGB;
      const additionalIPPrice = vm.additionalIP ? pricingConfig.additionalIP : 0;
      const snapshotPrice = vm.additionalSnapshot ? pricingConfig.additionalSnapshot : 0;
      const vpnPrice = vm.vpnSiteToSite ? pricingConfig.vpnSiteToSite : 0;

      totalBaseCost += (basePrice + osPrice + backupPrice + additionalIPPrice + snapshotPrice + vpnPrice) * vm.quantity;
    });

    // Calcular preço de venda total
    const totalSalePrice = calculateTotalPrice;

    // Calcular impostos e comissões
    const totalTaxes = calculateTotalTaxes(pricingConfig.selectedTaxRegime);
    const taxAmount = totalSalePrice * (totalTaxes / 100);
    const commissionAmount = totalSalePrice * (pricingConfig.commission / 100);

    // Calcular margem líquida real
    const netProfit = totalSalePrice - totalBaseCost - taxAmount - commissionAmount;
    const realNetMargin = (netProfit / totalSalePrice) * 100;

    return Math.max(0, realNetMargin);
  };

  const calculateTotalPrice = useMemo(() => {
    return currentProposal.vms.reduce((total, vm) => {
      return total + (calculateVMPrice(vm) * vm.quantity);
    }, 0);
  }, [currentProposal.vms, pricingConfig]);

  const addVMToProposal = () => {
    if (!currentVM.name) return;

    const newVM: VMConfig = {
      ...currentVM,
      id: `vm-${Date.now()}`
    };

    setCurrentProposal(prev => ({
      ...prev,
      vms: [...prev.vms, newVM]
    }));

    // Reset form
    setCurrentVM({
      id: '',
      name: '',
      vcpu: 2,
      ram: 4,
      storageType: 'HDD SAS',
      storageSize: 100,
      networkCard: '1 Gbps',
      os: 'Linux',
      backupSize: 0,
      additionalIP: false,
      additionalSnapshot: false,
      vpnSiteToSite: false,
      quantity: 1
    });
  };

  const removeVMFromProposal = (vmId: string) => {
    setCurrentProposal(prev => ({
      ...prev,
      vms: prev.vms.filter(vm => vm.id !== vmId)
    }));
  };

  const saveProposal = () => {
    console.log('Tentando salvar proposta:', currentProposal);
    console.log('VMs na proposta:', currentProposal.vms.length);

    if (currentProposal.vms.length === 0) {
      console.log('Erro: Nenhuma VM na proposta');
      alert('Por favor, adicione pelo menos uma VM à proposta');
      return;
    }

    // Preparar dados da proposta para salvar após o preenchimento do formulário
    const proposalData = {
      ...currentProposal,
      id: currentProposal.id || `proposal-${Date.now()}`,
      proposalNumber: currentProposal.proposalNumber || generateProposalNumber(),
      totalPrice: calculateTotalPrice
    };

    setPendingProposalData(proposalData);
    setShowClientForm(true);
  };

  const handleClientFormSubmit = (clientData: ClientData) => {
    if (!pendingProposalData) return;

    const proposal: Proposal = {
      ...pendingProposalData,
      name: clientData.nomeProjeto,
      clientName: clientData.razaoSocial,
      clientData: clientData
    };

    console.log('Proposta a ser salva com dados do cliente:', proposal);

    // Criar proposta de precificação para integração com orçamentos
    const pricingProposal: PricingProposal = {
      id: proposal.id,
      proposalNumber: proposal.proposalNumber,
      name: proposal.name,
      clientName: proposal.clientName,
      date: proposal.date,
      totalPrice: proposal.totalPrice,
      module: 'VM',
      clientData: proposal.clientData,
      technicalSpecs: {
        vms: proposal.vms,
        totalVMs: proposal.vms.length,
        totalPrice: proposal.totalPrice
      }
    };

    // Criar orçamento automaticamente
    try {
      const quote = createQuoteFromProposal(pricingProposal);
      console.log('Orçamento criado automaticamente:', quote);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }

    setProposals(prev => {
      const existingIndex = prev.findIndex(p => p.id === proposal.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = proposal;
        console.log('Proposta atualizada:', updated);
        return updated;
      }
      const newProposals = [...prev, proposal];
      console.log('Nova proposta adicionada:', newProposals);
      return newProposals;
    });

    // Reset form
    setCurrentProposal({
      id: '',
      proposalNumber: '',
      name: '',
      clientName: '',
      date: new Date().toISOString(),
      vms: [],
      totalPrice: 0,
      negotiationRounds: [],
      currentRound: 0
    });
    
    setShowClientForm(false);
    setPendingProposalData(null);
    setActiveTab('summary');

    console.log('Proposta salva com sucesso!');
    alert('Proposta criada com sucesso e enviada para Orçamentos!');
  };

  const handleClientFormCancel = () => {
    setShowClientForm(false);
    setPendingProposalData(null);
  };

  const loadProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setActiveTab('summary');
  };

  // Função para criar nova rodada de negociação
  const createNegotiationRound = (proposal: Proposal, description: string, discount: number = 0) => {
    if (!description.trim()) {
      alert('Por favor, insira uma descrição para a rodada');
      return;
    }

    if (discount < 0 || discount > 100) {
      alert('O desconto deve estar entre 0% e 100%');
      return;
    }

    const originalPrice = proposal.totalPrice || calculateTotalPrice;
    const discountedPrice = originalPrice * (1 - discount / 100);

    const newRound: NegotiationRound = {
      id: `round-${Date.now()}`,
      roundNumber: proposal.negotiationRounds.length + 1,
      date: new Date().toISOString(),
      description: description.trim(),
      discount,
      vms: [...proposal.vms],
      originalPrice,
      totalPrice: discountedPrice,
      status: 'active'
    };

    const updatedProposal: Proposal = {
      ...proposal,
      negotiationRounds: [...proposal.negotiationRounds, newRound],
      currentRound: newRound.roundNumber
    };

    setCurrentProposal(updatedProposal);

    // Atualizar na lista de propostas
    setProposals(prev => prev.map(p =>
      p.id === proposal.id ? updatedProposal : p
    ));

    // Limpar campos
    setRoundDescription('');
    setRoundDiscount(0);

    console.log('Nova rodada criada:', newRound);
    alert('Rodada de negociação criada com sucesso!');

    return updatedProposal;
  };

  const filteredProposals = proposals.filter(proposal =>
    proposal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.proposalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Componente DREAnalysis
  const DREAnalysis: React.FC<{
    proposal: Proposal;
    pricingConfig: PricingConfig;
    applyDiscount: boolean;
  }> = ({ proposal, pricingConfig, applyDiscount }) => {
    // Cálculos financeiros
    const calculateDRE = () => {
      const totalPrice = calculateTotalPrice;
      const contractMonths = 12; // Período do contrato

      // Receita Bruta Total (sem desconto)
      const grossRevenueWithoutDiscount = totalPrice * contractMonths;

      // Desconto contratual (usando desconto de 12 meses como exemplo)
      const discountPercentage = pricingConfig.contractDiscounts['12'];
      const totalDiscount = grossRevenueWithoutDiscount * (discountPercentage / 100);

      // Receita Bruta Total com desconto
      const grossRevenueWithDiscount = grossRevenueWithoutDiscount - totalDiscount;

      // Impostos sobre receita
      const totalTaxes = calculateTotalTaxes(pricingConfig.selectedTaxRegime);
      const taxesOnRevenue = grossRevenueWithDiscount * (totalTaxes / 100);

      // Receita Líquida
      const netRevenue = grossRevenueWithDiscount - taxesOnRevenue;

      // Custo Total dos Serviços (CMV)
      const totalCost = proposal.vms.reduce((total, vm) => {
        const basePrice =
          (vm.vcpu * pricingConfig.vcpuPerCore) +
          (vm.ram * pricingConfig.ramPerGB) +
          (vm.storageSize * pricingConfig.storagePerGB[vm.storageType as keyof typeof pricingConfig.storagePerGB]) +
          (parseInt(vm.networkCard) * pricingConfig.networkPerGbps);

        const osPrice = pricingConfig.osLicense[vm.os as keyof typeof pricingConfig.osLicense] || 0;
        const backupPrice = vm.backupSize * pricingConfig.backupPerGB;
        const additionalIPPrice = vm.additionalIP ? pricingConfig.additionalIP : 0;
        const snapshotPrice = vm.additionalSnapshot ? pricingConfig.additionalSnapshot : 0;
        const vpnPrice = vm.vpnSiteToSite ? pricingConfig.vpnSiteToSite : 0;

        return total + (basePrice + osPrice + backupPrice + additionalIPPrice + snapshotPrice + vpnPrice) * vm.quantity;
      }, 0) * contractMonths;

      // Comissões
      const commissions = grossRevenueWithDiscount * (pricingConfig.commission / 100);

      // Lucro Bruto
      const grossProfit = netRevenue - totalCost - commissions;

      // Impostos sobre lucro (CSLL/IRPJ)
      const taxesOnProfit = 0; // Por enquanto zero, pode ser configurado depois

      // Lucro Líquido
      const netProfit = grossProfit - taxesOnProfit;

      // Margem de Lucro Líquida
      const netProfitMargin = grossRevenueWithDiscount > 0 ? (netProfit / grossRevenueWithDiscount) * 100 : 0;

      return {
        grossRevenueWithoutDiscount,
        totalDiscount,
        grossRevenueWithDiscount,
        taxesOnRevenue,
        netRevenue,
        totalCost,
        commissions,
        grossProfit,
        taxesOnProfit,
        netProfit,
        netProfitMargin
      };
    };

    const dre = calculateDRE();

    // Dados para o gráfico de pizza usando cores específicas para tipos de dados
    const pieChartData = [
      { label: 'Custo', value: dre.totalCost, percentage: ((dre.totalCost / dre.grossRevenueWithDiscount) * 100), color: 'hsl(var(--chart-cost))', bgColor: 'bg-chart-cost' },
      { label: 'Comissões', value: dre.commissions, percentage: ((dre.commissions / dre.grossRevenueWithDiscount) * 100), color: 'hsl(var(--chart-commission))', bgColor: 'bg-chart-commission' },
      { label: 'Impostos', value: dre.taxesOnRevenue, percentage: ((dre.taxesOnRevenue / dre.grossRevenueWithDiscount) * 100), color: 'hsl(var(--chart-tax))', bgColor: 'bg-chart-tax' },
      { label: 'Lucro', value: dre.netProfit, percentage: ((dre.netProfit / dre.grossRevenueWithDiscount) * 100), color: 'hsl(var(--chart-profit))', bgColor: 'bg-chart-profit' }
    ];

    return (
      <div className="space-y-4">
        {/* Breakdown Financeiro */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>(=) Receita Bruta Total {applyDiscount ? '(sem desconto)' : ''}</span>
            <span>R$ {dre.grossRevenueWithoutDiscount.toFixed(2)}</span>
          </div>

          {applyDiscount && (
            <>
              <div className="flex justify-between">
                <span>(-) Desconto Contratual Total</span>
                <span>- R$ {dre.totalDiscount.toFixed(2)} ({pricingConfig.contractDiscounts['12']}%)</span>
              </div>
              <div className="flex justify-between">
                <span>(=) Receita Bruta Total com Desconto</span>
                <span>R$ {dre.grossRevenueWithDiscount.toFixed(2)}</span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span>(-) Impostos sobre Receita (PIS/COFINS/ISS)</span>
            <span>(R$ {dre.taxesOnRevenue.toFixed(2)})</span>
          </div>

          <div className="flex justify-between">
            <span>(=) Receita Líquida</span>
            <span>R$ {dre.netRevenue.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>(-) Custo Total dos Serviços (CMV)</span>
            <span>(R$ {dre.totalCost.toFixed(2)})</span>
          </div>

          <div className="flex justify-between">
            <span>(-) Comissões</span>
            <span>(R$ {dre.commissions.toFixed(2)})</span>
          </div>

          <div className="flex justify-between bg-slate-700 p-2 rounded">
            <span>(=) Lucro Bruto</span>
            <span>R$ {dre.grossProfit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>(-) Impostos sobre Lucro (CSLL/IRPJ)</span>
            <span>(R$ {dre.taxesOnProfit.toFixed(2)})</span>
          </div>

          <div className="flex justify-between bg-slate-700 p-2 rounded">
            <span>(=) Lucro Líquido</span>
            <span className="text-lg font-bold">R$ {dre.netProfit.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Margem de Lucro Líquida</span>
            <span>{dre.netProfitMargin.toFixed(2)}%</span>
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="mt-6">
          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {pieChartData.map((item, index) => {
                  const previousItems = pieChartData.slice(0, index);
                  const previousTotal = previousItems.reduce((sum, prev) => sum + prev.percentage, 0);
                  const startAngle = (previousTotal / 100) * 360;
                  const endAngle = ((previousTotal + item.percentage) / 100) * 360;

                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                  const largeArcFlag = item.percentage > 50 ? 1 : 0;

                  return (
                    <path
                      key={item.label}
                      d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {pieChartData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // useEffect para calcular a margem líquida automaticamente
  useEffect(() => {
    if (pricingConfig.markup > 0) {
      // Se há VMs configuradas, usar margem líquida real, senão usar estimativa
      let calculatedMargin;
      if (currentProposal.vms.length > 0) {
        calculatedMargin = calculateRealNetMargin();
        setIsRealMargin(true);
        console.log('Usando margem líquida REAL baseada nas VMs configuradas');
      } else {
        calculatedMargin = calculateNetMargin(pricingConfig.markup);
        setIsRealMargin(false);
        console.log('Usando margem líquida ESTIMADA baseada no markup');
      }

      setNetMarginValue(`${calculatedMargin.toFixed(2)}%`);
      console.log('Margem líquida sincronizada via useEffect:', calculatedMargin.toFixed(2) + '%');
    } else {
      setNetMarginValue('N/A');
      setIsRealMargin(false);
    }
  }, [pricingConfig.markup, pricingConfig.selectedTaxRegime, pricingConfig.commission, currentProposal.vms]);

  // useEffect para inicializar a margem líquida quando o componente carregar
  useEffect(() => {
    // Inicializar a margem líquida com o valor padrão
    if (pricingConfig.markup > 0 && pricingConfig.markup <= 999.99) {
      const calculatedMargin = calculateNetMargin(pricingConfig.markup);
      setNetMarginValue(`${calculatedMargin.toFixed(2)}%`);
      console.log('Margem líquida inicializada:', calculatedMargin.toFixed(2) + '%');
    } else if (pricingConfig.markup > 999.99) {
      setNetMarginValue('Valor inválido');
      console.warn('Markup muito alto para cálculo:', pricingConfig.markup);
    }
  }, [pricingConfig.markup]); // Recalcula quando o markup muda

  return (
    <div
      className="min-h-screen bg-gray-50 relative"
      style={{
        backgroundImage: 'url(https://img.freepik.com/premium-photo/corridor-data-center-server-room-server-room-internet-communication-networks-ai-generativex9_28914-4589.jpg?w=1380)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

      {/* Conteúdo */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-slate-900/95 backdrop-blur-sm shadow-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">Precificação Máquinas Virtuais</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar por número, cliente ou nome da proposta"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-800/95 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('config')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'config'
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
              >
                Calculadora
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'summary'
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
              >
                Análise DRE
              </button>
              <button
                onClick={() => setActiveTab('negotiations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'negotiations'
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
              >
                Negociações
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'settings'
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
              >
                Configurações
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'search'
                  ? 'border-white text-white'
                  : 'border-transparent text-slate-300 hover:text-white hover:border-slate-400'
                  }`}
              >
                Buscar Proposta
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'config' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Configurar VM */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Configurar Máquina Virtual</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Brain className="h-4 w-4 mr-2" />
                          Sugestão IA
                        </Button>
                        <Button onClick={addVMToProposal} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar à Proposta
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Nome da VM */}
                    <div>
                      <Label>Nome da VM</Label>
                      <Input
                        value={currentVM.name}
                        onChange={(e) => setCurrentVM(prev => ({
                          ...prev,
                          name: e.target.value
                        }))}
                        placeholder="Ex: Web Server 01"
                      />
                    </div>

                    {/* vCPU e RAM */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>vCPU Cores</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentVM.vcpu}
                          onChange={(e) => setCurrentVM(prev => ({
                            ...prev,
                            vcpu: Number(e.target.value)
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Memória RAM (GB)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={currentVM.ram}
                          onChange={(e) => setCurrentVM(prev => ({
                            ...prev,
                            ram: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>

                    {/* Storage */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Armazenamento</Label>
                        <Select
                          value={currentVM.storageType}
                          onValueChange={(value) => setCurrentVM(prev => ({
                            ...prev,
                            storageType: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {storageOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Armazenamento {currentVM.storageType} (GB)</Label>
                        <Input
                          type="number"
                          min="10"
                          value={currentVM.storageSize}
                          onChange={(e) => setCurrentVM(prev => ({
                            ...prev,
                            storageSize: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>

                    {/* Network e OS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Placa de Rede</Label>
                        <Select
                          value={currentVM.networkCard}
                          onValueChange={(value) => setCurrentVM(prev => ({
                            ...prev,
                            networkCard: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {networkOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Sistema Operacional</Label>
                        <Select
                          value={currentVM.os}
                          onValueChange={(value) => setCurrentVM(prev => ({
                            ...prev,
                            os: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {osOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Serviços Adicionais */}
                    <div>
                      <Label className="text-lg font-semibold">Serviços Adicionais</Label>
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Backup em Bloco: {currentVM.backupSize} GB</Label>
                            <Input
                              type="number"
                              min="0"
                              value={currentVM.backupSize}
                              onChange={(e) => setCurrentVM(prev => ({
                                ...prev,
                                backupSize: Number(e.target.value)
                              }))}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="additionalIP"
                              checked={currentVM.additionalIP}
                              onChange={(e) => setCurrentVM(prev => ({
                                ...prev,
                                additionalIP: e.target.checked
                              }))}
                              className="rounded"
                            />
                            <Label htmlFor="additionalIP">IP Adicional</Label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="additionalSnapshot"
                              checked={currentVM.additionalSnapshot}
                              onChange={(e) => setCurrentVM(prev => ({
                                ...prev,
                                additionalSnapshot: e.target.checked
                              }))}
                              className="rounded"
                            />
                            <Label htmlFor="additionalSnapshot">Snapshot Adicional</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="vpnSiteToSite"
                              checked={currentVM.vpnSiteToSite}
                              onChange={(e) => setCurrentVM(prev => ({
                                ...prev,
                                vpnSiteToSite: e.target.checked
                              }))}
                              className="rounded"
                            />
                            <Label htmlFor="vpnSiteToSite">VPN Site-to-Site</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div>
                      <Label>Quantidade</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentVM.quantity}
                        onChange={(e) => setCurrentVM(prev => ({
                          ...prev,
                          quantity: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resumo da Proposta */}
              <div className="lg:col-span-1">
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Resumo da Proposta</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('negotiations')}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Negociar Proposta
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                        <div className="text-sm text-slate-300 mb-2">Número da Proposta</div>
                        <div className="text-lg font-bold text-white">
                          {currentProposal.proposalNumber || generateProposalNumber()}
                        </div>
                      </div>

                      {currentProposal.vms.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold">VMs Configuradas:</h4>
                          {currentProposal.vms.map((vm) => (
                            <div key={vm.id} className="border border-slate-600 rounded-lg p-3 bg-slate-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{vm.name}</h5>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeVMFromProposal(vm.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm text-slate-300 space-y-1">
                                <div>{vm.vcpu} vCPU, {vm.ram}GB RAM</div>
                                <div>{vm.storageSize}GB {vm.storageType}</div>
                                <div>{vm.networkCard}, {vm.os}</div>
                                <div className="font-medium text-slate-200">
                                  R$ {calculateVMPrice(vm).toFixed(2)}/mês
                                </div>
                              </div>
                            </div>
                          ))}

                          <Separator />

                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">
                              R$ {calculateTotalPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-300">Total Mensal</div>
                          </div>

                          <Button onClick={saveProposal} className="w-full">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Proposta
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center text-slate-300 py-8">
                          <Server className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                          <p>Nenhuma VM configurada</p>
                          <p className="text-sm">Adicione VMs para ver o resumo</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Análise DRE da Proposta */}
              {currentProposal.vms.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Análise DRE Sem Desconto */}
                  <Card className="bg-slate-800 text-white border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Análise DRE da Proposta
                      </CardTitle>
                      <p className="text-sm text-slate-300">(Sem Desconto)</p>
                      <p className="text-xs text-slate-400">
                        Demonstrativo de Resultados para o período total do contrato (12 meses), sem aplicação de desconto contratual.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DREAnalysis
                        proposal={currentProposal}
                        pricingConfig={pricingConfig}
                        applyDiscount={false}
                      />
                    </CardContent>
                  </Card>

                  {/* Análise DRE Com Desconto */}
                  <Card className="bg-slate-800 text-white border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Análise DRE da Proposta
                      </CardTitle>
                      <p className="text-sm text-slate-300">(Com Desconto)</p>
                      <p className="text-xs text-slate-400">
                        Demonstrativo de Resultados para o período total do contrato (12 meses), com desconto contratual aplicado.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <DREAnalysis
                        proposal={currentProposal}
                        pricingConfig={pricingConfig}
                        applyDiscount={true}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Propostas Salvas */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Propostas Salvas</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredProposals.length > 0 ? (
                    <div className="space-y-4">
                      {filteredProposals.map((proposal) => (
                        <div key={proposal.id} className="border border-blue-500 rounded-lg p-4 hover:bg-blue-700/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-white">
                                {proposal.proposalNumber} - {proposal.name}
                              </h3>
                              <p className="text-sm text-white">
                                Cliente: {proposal.clientName}
                              </p>
                              {proposal.clientData && (
                                <p className="text-xs text-slate-300">
                                  Contato: {proposal.clientData.nomeContato} | Gerente: {proposal.clientData.nomeGerente}
                                </p>
                              )}
                              <p className="text-xs text-slate-300">
                                {new Date(proposal.date).toLocaleDateString('pt-BR')} - {proposal.vms.length} VMs
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="text-lg font-bold text-white">
                                  R$ {proposal.totalPrice.toFixed(2)}
                                </div>
                                <div className="text-sm text-white">Total Mensal</div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentProposal(proposal);
                                    setActiveTab('negotiations');
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Negociar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => loadProposal(proposal)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Exportar
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-white py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-white" />
                      <p>Nenhuma proposta encontrada</p>
                      <p className="text-sm">Crie uma nova proposta para começar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'negotiations' && (
            <div className="space-y-6">
              {/* Header das Negociações */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Rodadas de Negociação</h1>
                  <p className="text-white mt-2">
                    Gerencie diferentes versões da proposta com descontos e alterações para negociação.
                  </p>
                </div>
              </div>

              {/* Proposta Selecionada */}
              {currentProposal.id && (
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {currentProposal.proposalNumber} - {currentProposal.name}
                      </span>
                      <div className="text-sm text-slate-300">
                        Cliente: {currentProposal.clientName}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Proposta Original */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Proposta Original</h3>
                        <div className="bg-slate-700 p-4 rounded-lg">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>VMs Configuradas:</span>
                              <span>{currentProposal.vms.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Valor Total:</span>
                              <span className="font-bold">R$ {currentProposal.totalPrice.toFixed(2)}/mês</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status:</span>
                              <span className="text-blue-300">Original</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Nova Rodada */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">Nova Rodada de Negociação</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Descrição da Rodada
                            </label>
                            <Input
                              placeholder="Ex: Desconto para fechamento rápido"
                              value={roundDescription}
                              onChange={(e) => setRoundDescription(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Desconto (%)
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              min="0"
                              max="50"
                              value={roundDiscount}
                              onChange={(e) => setRoundDiscount(Number(e.target.value))}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>

                          {/* Preview do Valor com Desconto */}
                          {roundDiscount > 0 && (
                            <div className="bg-slate-700 p-3 rounded-lg">
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Valor Original:</span>
                                  <span>R$ {(currentProposal.totalPrice || calculateTotalPrice).toFixed(2)}/mês</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Desconto ({roundDiscount}%):</span>
                                  <span className="text-red-300">- R$ {((currentProposal.totalPrice || calculateTotalPrice) * roundDiscount / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold border-t border-slate-600 pt-1">
                                  <span>Valor Final:</span>
                                  <span className="text-green-300">R$ {((currentProposal.totalPrice || calculateTotalPrice) * (1 - roundDiscount / 100)).toFixed(2)}/mês</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              if (!currentProposal.id) {
                                alert('Selecione uma proposta primeiro');
                                return;
                              }
                              createNegotiationRound(currentProposal, roundDescription, roundDiscount);
                            }}
                            disabled={!currentProposal.id}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Nova Rodada
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Rodadas */}
              {currentProposal.negotiationRounds && currentProposal.negotiationRounds.length > 0 && (
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardHeader>
                    <CardTitle>Histórico de Negociações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentProposal.negotiationRounds.map((round) => (
                        <div key={round.id} className="border border-slate-600 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-white">
                                Rodada {round.roundNumber}
                              </h4>
                              <p className="text-sm text-slate-300">{round.description}</p>
                            </div>
                            <div className="text-right">
                              {round.discount > 0 ? (
                                <div>
                                  <div className="text-sm text-slate-400 line-through">
                                    R$ {round.originalPrice.toFixed(2)}/mês
                                  </div>
                                  <div className="text-lg font-bold text-green-300">
                                    R$ {round.totalPrice.toFixed(2)}/mês
                                  </div>
                                  <div className="text-sm text-slate-300">
                                    {round.discount}% desconto
                                  </div>
                                </div>
                              ) : (
                                <div className="text-lg font-bold text-white">
                                  R$ {round.totalPrice.toFixed(2)}/mês
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-slate-400">
                              {new Date(round.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${round.status === 'active' ? 'bg-blue-600' :
                                round.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                                }`}>
                                {round.status === 'active' ? 'Ativa' :
                                  round.status === 'accepted' ? 'Aceita' : 'Rejeitada'}
                              </span>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver Detalhes
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Instruções */}
              {!currentProposal.id && (
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardContent className="py-8">
                    <div className="text-center text-slate-300">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">Selecione uma Proposta</h3>
                      <p className="text-sm">
                        Para criar rodadas de negociação, primeiro selecione uma proposta na aba "Buscar Proposta" ou crie uma nova na aba "Calculadora".
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Header da Configuração */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Editar Preços Base</h1>
                  <p className="text-white mt-2">
                    Altere os custos base, impostos e margens. As propostas existentes não são afetadas, mas as novas usarão esses valores.
                  </p>
                </div>
                <Button variant="outline" onClick={() => setActiveTab('config')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>

              {/* Tributos */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Tributos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de Regime Tributário */}
                  <div>
                    <Label className="text-sm font-medium">Regime Tributário</Label>
                    <div className="flex gap-2 mt-2">
                      {taxRegimeOptions.map((regime) => (
                        <Button
                          key={regime.value}
                          variant={pricingConfig.selectedTaxRegime === regime.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPricingConfig(prev => ({
                            ...prev,
                            selectedTaxRegime: regime.value
                          }))}
                        >
                          {regime.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Campos de Impostos */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>PIS/COFINS (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99.99"
                        step="0.01"
                        value={pricingConfig.taxes[pricingConfig.selectedTaxRegime as keyof typeof pricingConfig.taxes].pisCofins}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          taxes: {
                            ...prev.taxes,
                            [prev.selectedTaxRegime]: {
                              ...prev.taxes[prev.selectedTaxRegime as keyof typeof prev.taxes],
                              pisCofins: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>ISS (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99.99"
                        step="0.01"
                        value={pricingConfig.taxes[pricingConfig.selectedTaxRegime as keyof typeof pricingConfig.taxes].iss}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          taxes: {
                            ...prev.taxes,
                            [prev.selectedTaxRegime]: {
                              ...prev.taxes[prev.selectedTaxRegime as keyof typeof prev.taxes],
                              iss: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                    <div>
                      <Label>CSLL/IR (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99.99"
                        step="0.01"
                        value={pricingConfig.taxes[pricingConfig.selectedTaxRegime as keyof typeof pricingConfig.taxes].csllIr}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          taxes: {
                            ...prev.taxes,
                            [prev.selectedTaxRegime]: {
                              ...prev.taxes[prev.selectedTaxRegime as keyof typeof prev.taxes],
                              csllIr: Number(e.target.value)
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>

                  {/* Total de Impostos */}
                  <div className="bg-blue-700/20 p-4 rounded-lg border border-blue-500">
                    <p className="text-sm font-medium text-white">
                      Total de Impostos do Regime Selecionado: {calculateTotalTaxes(pricingConfig.selectedTaxRegime).toFixed(2)}%
                    </p>
                    <p className="text-xs text-white mt-1">
                      Edite os impostos de cada regime tributário. Os valores são percentuais e aceitam até 2 casas decimais.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Markup e Margem Líquida */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Markup e Margem Líquida</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>% Markup sobre o Custo (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="999.99"
                        step="0.01"
                        value={pricingConfig.markup}
                        onChange={(e) => handleMarkupChange(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>
                        % Margem Líquida {isRealMargin ? 'Real' : 'Estimada'} (%)
                        {isRealMargin && <span className="text-green-400 ml-2">✓ Baseada nas VMs</span>}
                      </Label>
                      <Input
                        type="text"
                        value={netMarginValue}
                        disabled
                        className="text-gray-900 bg-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comissões */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Comissões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>% Percentual sobre a Receita Bruta</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        min="0"
                        max="99.99"
                        step="0.01"
                        value={pricingConfig.commission}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          commission: Number(e.target.value)
                        }))}
                      />
                      <span className="text-white">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recursos Base (Custos) */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Recursos Base (Custos)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">vCPU Windows (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.vcpuPerCore}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            vcpuPerCore: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">vCPU Linux (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.vcpuPerCore * 0.6}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            vcpuPerCore: Number(e.target.value) / 0.6
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">RAM (por GB)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.ramPerGB}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            ramPerGB: Number(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Armazenamento (Custos) */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Armazenamento (Custos)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">HDD SAS</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.storageCosts['HDD SAS']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            storageCosts: {
                              ...prev.storageCosts,
                              'HDD SAS': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">NVMe</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.storageCosts['NVMe']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            storageCosts: {
                              ...prev.storageCosts,
                              'NVMe': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">SSD Performance</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.storageCosts['SSD Performance']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            storageCosts: {
                              ...prev.storageCosts,
                              'SSD Performance': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Placa de Rede (Custos) */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Placa de Rede (Custos)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">1 Gbps</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.networkCosts['1 Gbps']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            networkCosts: {
                              ...prev.networkCosts,
                              '1 Gbps': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">10 Gbps</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.networkCosts['10 Gbps']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            networkCosts: {
                              ...prev.networkCosts,
                              '10 Gbps': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sistema Operacional */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Sistema Operacional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Windows Server (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.osLicense['Windows Server']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            osLicense: {
                              ...prev.osLicense,
                              'Windows Server': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Linux (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.osLicense['Linux']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            osLicense: {
                              ...prev.osLicense,
                              'Linux': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">FreeBSD (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.osLicense['FreeBSD']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            osLicense: {
                              ...prev.osLicense,
                              'FreeBSD': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4">Custom OS (por core)</h4>
                      <div>
                        <Label>Custo Mensal</Label>
                        <Input
                          type="number"
                          min="0"
                          max="9999.99"
                          step="0.01"
                          value={pricingConfig.osLicense['Custom']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            osLicense: {
                              ...prev.osLicense,
                              'Custom': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prazos Contratuais e Descontos */}
              <Card>
                <CardHeader>
                  <CardTitle>Prazos Contratuais e Descontos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">12 Meses</h4>
                      <div>
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.contractDiscounts['12']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            contractDiscounts: {
                              ...prev.contractDiscounts,
                              '12': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">24 Meses</h4>
                      <div>
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.contractDiscounts['24']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            contractDiscounts: {
                              ...prev.contractDiscounts,
                              '24': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">36 Meses</h4>
                      <div>
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.contractDiscounts['36']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            contractDiscounts: {
                              ...prev.contractDiscounts,
                              '36': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">48 Meses</h4>
                      <div>
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.contractDiscounts['48']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            contractDiscounts: {
                              ...prev.contractDiscounts,
                              '48': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-4 text-white">60 Meses</h4>
                      <div>
                        <Label>Desconto (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="99.99"
                          step="0.01"
                          value={pricingConfig.contractDiscounts['60']}
                          onChange={(e) => setPricingConfig(prev => ({
                            ...prev,
                            contractDiscounts: {
                              ...prev.contractDiscounts,
                              '60': Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Taxa de Setup */}
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Setup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4 text-white">Taxa de Setup Geral</h4>
                    <div>
                      <Label>Valor Base</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99999.99"
                        step="0.01"
                        value={pricingConfig.setupFee}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          setupFee: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestão e Suporte */}
              <Card>
                <CardHeader>
                  <CardTitle>Gestão e Suporte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-4 text-white">Serviço Mensal de Gestão e Suporte</h4>
                    <div>
                      <Label>Valor Mensal</Label>
                      <Input
                        type="number"
                        min="0"
                        max="99999.99"
                        step="0.01"
                        value={pricingConfig.managementSupport}
                        onChange={(e) => setPricingConfig(prev => ({
                          ...prev,
                          managementSupport: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botão Salvar Configurações */}
              <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <div className="space-y-6">
              {/* Header da Busca */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Buscar Proposta</h1>
                  <p className="text-white mt-2">
                    Busque uma proposta existente por número, nome do cliente ou descrição para editar.
                  </p>
                </div>
              </div>

              {/* Campo de Busca */}
              <Card className="bg-slate-800 text-white border-slate-700">
                <CardHeader>
                  <CardTitle>Buscar Proposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Digite o número da proposta, nome do cliente ou descrição..."
                      value={proposalSearchTerm}
                      onChange={(e) => setProposalSearchTerm(e.target.value)}
                      className="pl-10 text-white bg-slate-700 border-slate-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resultados da Busca */}
              {proposalSearchTerm && (
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardHeader>
                    <CardTitle>Resultados da Busca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {proposals.filter(proposal =>
                      proposal.name.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
                      proposal.clientName.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
                      proposal.proposalNumber.toLowerCase().includes(proposalSearchTerm.toLowerCase())
                    ).length > 0 ? (
                      <div className="space-y-3">
                        {proposals.filter(proposal =>
                          proposal.name.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
                          proposal.clientName.toLowerCase().includes(proposalSearchTerm.toLowerCase()) ||
                          proposal.proposalNumber.toLowerCase().includes(proposalSearchTerm.toLowerCase())
                        ).map((proposal) => (
                          <div key={proposal.id} className="border border-slate-600 rounded-lg p-4 hover:bg-slate-700/50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-white">
                                  {proposal.proposalNumber} - {proposal.name}
                                </h3>
                                <p className="text-sm text-white">
                                  Cliente: {proposal.clientName}
                                </p>
                                <p className="text-xs text-slate-300">
                                  {new Date(proposal.date).toLocaleDateString('pt-BR')} - {proposal.vms.length} VMs
                                </p>
                                <p className="text-sm text-white font-medium mt-1">
                                  Total: R$ {proposal.totalPrice.toFixed(2)}/mês
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setCurrentProposal(proposal);
                                    setActiveTab('negotiations');
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Negociar
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setCurrentProposal(proposal);
                                    setActiveTab('summary');
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Visualizar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                        <p>Nenhuma proposta encontrada</p>
                        <p className="text-sm">Tente buscar por outro termo</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Instruções */}
              {!proposalSearchTerm && (
                <Card className="bg-slate-800 text-white border-slate-700">
                  <CardContent className="py-8">
                    <div className="text-center text-slate-300">
                      <Search className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-semibold mb-2">Como buscar uma proposta</h3>
                      <div className="space-y-2 text-sm">
                        <p>• Digite o <strong>número da proposta</strong> (ex: 0001/2025)</p>
                        <p>• Digite o <strong>nome do cliente</strong></p>
                        <p>• Digite parte da <strong>descrição da proposta</strong></p>
                      </div>
                      <p className="mt-4 text-xs">
                        Após encontrar a proposta, clique em "Editar" para modificá-la ou "Visualizar" para ver os detalhes.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}


        </div>

        {/* Footer */}
        <div className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="text-center text-sm text-white">
              Calculadora de Preços IaaS © 2025. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Dados do Cliente */}
      <ProposalClientForm
        isOpen={showClientForm}
        onClose={handleClientFormCancel}
        onSubmit={handleClientFormSubmit}
        initialData={pendingProposalData?.clientData}
      />
    </div>
  );
};

export default VMCalculator; 