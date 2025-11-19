'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Check } from 'lucide-react';

interface ProposalCoverPageProps {
  clientName?: string;
  date?: string;
  services?: string[];
  onContinue: (data: { clientName: string; date: string; services: string[] }) => void;
  onBack?: () => void;
}

const AVAILABLE_SERVICES = [
  'Datacenter',
  'Firewall',
  'Cloud Computing',
  'Backup',
  'Segurança',
  'Rede',
  'Servidores',
  'Storage',
  'Virtualização',
  'Monitoramento',
  'NOC',
  'Service Desk'
];

export function ProposalCoverPage({ 
  clientName: initialClientName = '', 
  date: initialDate = new Date().toISOString().split('T')[0],
  services: initialServices = ['Datacenter', 'Firewall'],
  onContinue,
  onBack 
}: ProposalCoverPageProps) {
  const [clientName, setClientName] = useState(initialClientName);
  const [date, setDate] = useState(initialDate);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialServices);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleContinue = () => {
    if (!clientName.trim()) {
      alert('Por favor, preencha o nome do cliente');
      return;
    }
    if (selectedServices.length === 0) {
      alert('Por favor, selecione pelo menos um tipo de serviço');
      return;
    }
    onContinue({ clientName, date, services: selectedServices });
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="max-w-7xl w-full">
        {/* Botão Voltar */}
        {onBack && (
          <Button
            onClick={onBack}
            variant="outline"
            className="mb-4 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
          >
            ← Voltar
          </Button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Preview da Capa - Ocupa 3 colunas */}
          <div className="lg:col-span-3">
            <div className="relative w-full aspect-[3/4] bg-[#0a1628] rounded-lg overflow-hidden shadow-2xl">
              {/* Padrão de fundo com pontos */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(100,200,255,0.3) 1px, transparent 0)',
                  backgroundSize: '30px 30px'
                }}></div>
              </div>

              {/* Formas geométricas brancas - Topo */}
              <div className="absolute top-0 left-0 right-0 h-64">
                <svg viewBox="0 0 800 300" className="w-full h-full" preserveAspectRatio="xMidYMin slice">
                  {/* Forma principal do topo */}
                  <polygon 
                    points="0,0 800,0 800,150 550,250 250,250 0,150" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="3"
                    opacity="0.8"
                  />
                  <polygon 
                    points="50,20 750,20 750,140 530,230 270,230 50,140" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    opacity="0.5"
                  />
                </svg>
              </div>

              {/* Logo no topo */}
              <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
                <div className="bg-[#1a2942] px-12 py-6 rounded-b-3xl border-2 border-white/30 shadow-xl">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl font-bold text-gray-400">◇◇</div>
                    <div>
                      <div className="text-3xl font-bold text-gray-400 tracking-wider">double</div>
                      <div className="text-xs text-gray-500 text-right">ti + telecom</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo Principal - Lado Esquerdo */}
              <div className="absolute top-64 left-12 right-1/2 z-10">
                <h1 className="text-6xl font-bold text-[#5eb3d6] mb-2 leading-tight">
                  Proposta
                </h1>
                <h2 className="text-6xl font-bold text-white mb-16 leading-tight">
                  Comercial
                </h2>

                <div className="space-y-6 mb-12">
                  <div>
                    <div className="text-lg text-white font-semibold mb-2">Nome do Cliente</div>
                    <div className="text-xl text-white">
                      {clientName || 'Nome do Cliente'}
                    </div>
                  </div>
                  <div>
                    <div className="text-lg text-white font-semibold mb-2">Data</div>
                    <div className="text-xl text-white">
                      {formatDate(date)}
                    </div>
                  </div>
                </div>

                {/* Lista de Serviços */}
                <div className="border-t border-b border-white/40 py-6 space-y-3">
                  {selectedServices.slice(0, 4).map((service, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Check className="h-6 w-6 text-[#5eb3d6]" />
                      <span className="text-white font-semibold text-lg">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagem do Datacenter - Lado Direito */}
              <div className="absolute top-1/3 right-0 bottom-32 w-1/2">
                <div className="relative h-full">
                  {/* Formas geométricas ao redor da imagem */}
                  <svg viewBox="0 0 400 600" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <polygon 
                      points="50,50 350,100 350,500 100,550 50,450" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="3"
                      opacity="0.6"
                    />
                    <polygon 
                      points="80,80 320,120 320,480 120,520 80,430" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  </svg>
                  
                  {/* Placeholder para imagem do datacenter */}
                  <div className="absolute inset-0 m-12 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-lg flex items-center justify-center border-2 border-white/20">
                    <div className="text-center text-white/60">
                      <div className="text-6xl mb-4">🖥️</div>
                      <div className="text-sm">Datacenter</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rodapé */}
              <div className="absolute bottom-8 left-12 right-12 flex items-center justify-between z-10">
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-20 h-20 bg-black flex items-center justify-center text-white text-xs">
                    QR Code
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-xl mb-1">Visite Nosso Site</div>
                  <div className="text-gray-300 text-lg">www.doubletelecom.com.br</div>
                </div>
              </div>

              {/* Formas geométricas - Rodapé */}
              <div className="absolute bottom-0 left-0 right-0 h-48">
                <svg viewBox="0 0 800 200" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
                  <polygon 
                    points="0,200 250,100 550,100 800,200" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="3"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Formulário de Edição - Ocupa 2 colunas */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white">Dados da Capa</h3>
                  <p className="text-gray-400 text-sm mt-1">Preencha as informações para a proposta</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Cliente *</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Digite o nome do cliente"
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Data *</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipos de Serviço * (selecione até 4)</Label>
                    <div className="grid grid-cols-1 gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {AVAILABLE_SERVICES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                            className="border-slate-500"
                          />
                          <label
                            htmlFor={service}
                            className="text-sm text-gray-300 cursor-pointer flex-1"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedServices.length} serviço(s) selecionado(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Continuar */}
            <Button
              onClick={handleContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
            >
              Continuar para Detalhes da Proposta
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
