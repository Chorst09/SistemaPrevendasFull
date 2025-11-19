'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';

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
  const [isEditing, setIsEditing] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview da Capa */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-0">
              {/* Capa da Proposta */}
              <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-blue-900 via-slate-800 to-blue-950">
                {/* Padrão de fundo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                  }}></div>
                </div>

                {/* Formas geométricas decorativas */}
                <div className="absolute top-0 right-0 w-2/3 h-2/3">
                  <svg viewBox="0 0 400 400" className="w-full h-full opacity-20">
                    <polygon points="200,50 350,150 350,350 50,350 50,150" fill="none" stroke="white" strokeWidth="2"/>
                    <polygon points="220,80 320,160 320,320 120,320 120,160" fill="none" stroke="white" strokeWidth="1.5"/>
                  </svg>
                </div>

                {/* Logo */}
                <div className="absolute top-8 left-0 right-0 flex justify-center">
                  <div className="bg-slate-800/80 backdrop-blur-sm px-8 py-4 rounded-b-3xl border-2 border-white/20">
                    <div className="text-3xl font-bold text-white tracking-wider">
                      double
                    </div>
                    <div className="text-xs text-gray-300 text-center">ti + telecom</div>
                  </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="absolute inset-0 flex flex-col justify-center px-12">
                  <h1 className="text-5xl font-bold text-cyan-300 mb-2">
                    Proposta
                  </h1>
                  <h2 className="text-5xl font-bold text-white mb-12">
                    Comercial
                  </h2>

                  <div className="space-y-4 mb-12">
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Nome do Cliente</div>
                      <div className="text-xl font-semibold text-white">
                        {clientName || 'Nome do Cliente'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-300 mb-1">Data</div>
                      <div className="text-lg text-white">
                        {formatDate(date)}
                      </div>
                    </div>
                  </div>

                  {/* Lista de Serviços */}
                  <div className="border-t border-b border-white/30 py-4 space-y-2">
                    {selectedServices.map((service, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-cyan-400" />
                        <span className="text-white font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rodapé */}
                <div className="absolute bottom-8 left-12 right-12">
                  <div className="flex items-center justify-between">
                    <div className="bg-white p-2 rounded">
                      <div className="w-16 h-16 bg-black"></div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold mb-1">Visite Nosso Site</div>
                      <div className="text-gray-300 text-sm">www.doubletelecom.com.br</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Edição */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-white">Dados da Capa</h3>
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
                  >
                    {isEditing ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Concluir
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nome do Cliente *</Label>
                    <Input
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Digite o nome do cliente"
                      className="bg-slate-900/50 border-slate-600 text-white"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Data *</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-slate-900/50 border-slate-600 text-white"
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipos de Serviço *</Label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                      {AVAILABLE_SERVICES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={selectedServices.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                            disabled={!isEditing}
                            className="border-slate-500"
                          />
                          <label
                            htmlFor={service}
                            className="text-sm text-gray-300 cursor-pointer"
                          >
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>
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
