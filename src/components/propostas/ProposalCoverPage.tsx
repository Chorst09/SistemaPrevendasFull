'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, Check, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ProposalCoverPageProps {
  clientName?: string;
  date?: string;
  services?: string[];
  datacenterImage?: string;
  onContinue: (data: { clientName: string; date: string; services: string[]; datacenterImage?: string }) => void;
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

// Mapeamento de imagens para cada serviço (Unsplash)
const SERVICE_IMAGES: Record<string, string> = {
  'Datacenter': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
  'Firewall': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
  'Cloud Computing': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
  'Backup': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
  'Segurança': 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=600&fit=crop',
  'Rede': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=600&fit=crop',
  'Servidores': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
  'Storage': 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800&h=600&fit=crop',
  'Virtualização': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop',
  'Monitoramento': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  'NOC': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
  'Service Desk': 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop'
};

export function ProposalCoverPage({ 
  clientName: initialClientName = '', 
  date: initialDate = new Date().toISOString().split('T')[0],
  services: initialServices = ['Datacenter', 'Firewall'],
  datacenterImage: initialDatacenterImage,
  onContinue,
  onBack 
}: ProposalCoverPageProps) {
  const [clientName, setClientName] = useState(initialClientName);
  const [date, setDate] = useState(initialDate);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialServices);
  const [datacenterImage, setDatacenterImage] = useState<string | undefined>(initialDatacenterImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => {
      const isRemoving = prev.includes(service);
      const newServices = isRemoving 
        ? prev.filter(s => s !== service)
        : [...prev, service];
      
      // Se estiver adicionando um serviço e não houver imagem, definir automaticamente
      if (!isRemoving && !datacenterImage && SERVICE_IMAGES[service]) {
        setDatacenterImage(SERVICE_IMAGES[service]);
      }
      
      return newServices;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDatacenterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setDatacenterImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    onContinue({ clientName, date, services: selectedServices, datacenterImage });
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

              {/* Logo Double no topo */}
              <div className="absolute top-8 left-0 right-0 flex justify-center z-10">
                <div className="bg-[#1a2942] px-8 py-4 rounded-b-3xl border-2 border-white/30 shadow-xl">
                  {/* Logo SVG da Double */}
                  <svg width="280" height="80" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
                    {/* Símbolo Double (dois losangos entrelaçados) */}
                    <g transform="translate(20, 30)">
                      {/* Losango esquerdo - mais escuro */}
                      <path d="M 0,30 L 25,10 L 50,30 L 25,50 Z" fill="#4a5f7f" stroke="#4a5f7f" strokeWidth="2"/>
                      {/* Losango direito - mais claro (cyan) */}
                      <path d="M 25,30 L 50,10 L 75,30 L 50,50 Z" fill="#6ba3c0" stroke="#6ba3c0" strokeWidth="2"/>
                      {/* Detalhe de entrelaçamento */}
                      <circle cx="37.5" cy="30" r="5" fill="#0a1628"/>
                    </g>
                    
                    {/* Texto "double" */}
                    <text x="110" y="70" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="300" fill="#7a8fa8">
                      double
                    </text>
                    
                    {/* Texto "ti + telecom" */}
                    <text x="280" y="85" fontFamily="Arial, sans-serif" fontSize="16" fill="#6a7a8a">
                      ti + telecom
                    </text>
                  </svg>
                </div>
              </div>

              {/* Conteúdo Principal - Lado Esquerdo */}
              <div className="absolute top-64 left-12 right-1/2 z-10 pr-8">
                <h1 className="text-6xl font-bold text-[#5eb3d6] mb-2 leading-tight">
                  Proposta
                </h1>
                <h2 className="text-6xl font-bold text-white mb-16 leading-tight">
                  Comercial
                </h2>

                <div className="space-y-6 mb-12">
                  {/* Nome do Cliente - apenas o valor */}
                  <div>
                    <div className="text-2xl text-white font-bold">
                      {clientName || 'Nome do Cliente'}
                    </div>
                  </div>
                  {/* Data */}
                  <div>
                    <div className="text-lg text-white">
                      Data {formatDate(date)}
                    </div>
                  </div>
                </div>

                {/* Lista de Serviços - ajustada para caber melhor */}
                <div className="border-t border-b border-white/40 py-4 space-y-2">
                  {selectedServices.slice(0, 4).map((service, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-[#5eb3d6] flex-shrink-0" />
                      <span className="text-white font-semibold text-base truncate">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Imagem do Datacenter - Lado Direito com Quadro */}
              <div className="absolute top-[32%] right-2 w-5/12 h-[48%]">
                {/* Quadro/Moldura branca ao redor da imagem */}
                <div className="relative w-full h-full">
                  {/* Formas geométricas decorativas */}
                  <div className="absolute -inset-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                      <polygon 
                        points="5,5 95,10 95,90 10,95 5,85" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="0.5"
                        opacity="0.6"
                      />
                      <polygon 
                        points="8,8 92,12 92,88 12,92 8,83" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="0.3"
                        opacity="0.4"
                      />
                    </svg>
                  </div>
                  
                  {/* Quadro principal com borda branca */}
                  <div className="relative w-full h-full border-4 border-white/80 rounded-lg overflow-hidden shadow-2xl bg-[#1a2942]">
                    {datacenterImage ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={datacenterImage}
                          alt="Serviço"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                        <div className="text-center text-white/60">
                          <div className="text-6xl mb-4">🖥️</div>
                          <div className="text-sm">Datacenter</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rodapé Centralizado */}
              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center z-10 space-y-2">
                <div className="text-white font-bold text-xl">Visite Nosso Site</div>
                <div className="text-gray-300 text-lg">www.doubletelecom.com.br</div>
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
                    <Label className="text-gray-300">Imagem do Serviço</Label>
                    <div className="space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="datacenter-image"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 bg-slate-900/50 border-slate-600 text-white hover:bg-slate-800/50"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {datacenterImage ? 'Trocar Imagem' : 'Upload Imagem'}
                        </Button>
                        {datacenterImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {datacenterImage && (
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-slate-600">
                          <Image
                            src={datacenterImage}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Tipos de Serviço * (selecione até 4)</Label>
                    <div className="grid grid-cols-1 gap-2 p-4 bg-slate-900/50 rounded-lg border border-slate-600 max-h-64 overflow-y-auto">
                      {AVAILABLE_SERVICES.map((service) => (
                        <div key={service} className="flex items-center space-x-2 group">
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
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setDatacenterImage(SERVICE_IMAGES[service])}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 px-2 text-cyan-400 hover:text-cyan-300"
                            title="Usar imagem deste serviço"
                          >
                            🖼️
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedServices.length} serviço(s) selecionado(s) • Clique no ícone 🖼️ para usar a imagem do serviço
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
