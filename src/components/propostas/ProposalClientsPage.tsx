'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ProposalHeader, ProposalFooter } from './ProposalHeaderFooter';

interface ProposalClientsPageProps {
  onContinue: () => void;
  onBack: () => void;
}

interface ClientLogoProps {
  src: string;
  alt: string;
  fallbackText: string;
  fallbackColor?: string;
  bgColor?: string;
  fontSize?: string;
  italic?: boolean;
}

function ClientLogo({ 
  src, 
  alt, 
  fallbackText, 
  fallbackColor = 'text-gray-800', 
  bgColor = 'bg-white/90',
  fontSize = 'text-xl',
  italic = false
}: ClientLogoProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div className={`flex items-center justify-center h-12 ${bgColor} rounded-lg p-2 overflow-hidden`}>
      {!imageError ? (
        <Image
          src={src}
          alt={alt}
          width={150}
          height={60}
          className="object-contain max-h-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${fallbackColor} font-bold ${fontSize} ${italic ? 'italic' : ''}`}>
          {fallbackText}
        </div>
      )}
    </div>
  );
}

export function ProposalClientsPage({ onContinue, onBack }: ProposalClientsPageProps) {
  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Botão Voltar */}
        <Button
          onClick={onBack}
          variant="outline"
          className="mb-4 bg-slate-800/50 border-slate-600 text-white hover:bg-slate-700/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        {/* Página "Nossos Clientes" */}
        <div className="relative w-full aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-2xl">
          {/* Cabeçalho */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <ProposalHeader pageNumber={3} />
          </div>

          {/* Conteúdo com fundo azul */}
          <div className="absolute top-24 bottom-48 left-0 right-0 bg-[#0a1628] overflow-hidden">
          {/* Padrão de fundo com pontos conectados */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(100,200,255,0.3) 1px, transparent 0)',
              backgroundSize: '30px 30px'
            }}></div>
            {/* Linhas conectando pontos */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-clients" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="rgba(100,200,255,0.4)" />
                  <line x1="30" y1="30" x2="60" y2="30" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
                  <line x1="30" y1="30" x2="30" y2="60" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-clients)" />
            </svg>
          </div>

          {/* Formas geométricas decorativas no topo esquerdo */}
          <div className="absolute top-8 left-8 w-1/4 h-24">
            <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Forma geométrica superior esquerda */}
              <polygon 
                points="10,10 180,10 180,50 140,90 10,90" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                opacity="0.5"
              />
              <line x1="10" y1="10" x2="0" y2="30" stroke="white" strokeWidth="2" opacity="0.6" />
              <circle cx="0" cy="30" r="4" fill="white" opacity="0.8" />
              <line x1="100" y1="10" x2="130" y2="0" stroke="white" strokeWidth="2" opacity="0.6" />
              <circle cx="130" cy="0" r="4" fill="white" opacity="0.8" />
            </svg>
          </div>

          {/* Seção "Nossos Clientes" com título */}
          <div className="absolute top-8 left-12 right-12 z-10">
            {/* Título com forma geométrica */}
            <div className="relative mb-4">
              <div className="absolute -inset-2 border-2 border-white/40 rounded-lg" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}></div>
              <div className="relative bg-[#0a1628]/80 backdrop-blur-sm rounded-lg overflow-hidden">
                {/* Barra superior com título */}
                <div className="flex items-center">
                  <div className="flex-1 border-2 border-white/50 rounded-l-lg py-2 px-4">
                    <div className="w-12 h-1 bg-white/60 mb-1"></div>
                    <div className="w-2 h-2 rounded-full bg-white/80"></div>
                  </div>
                  <div className="bg-slate-700/80 px-6 py-2 border-2 border-white/50 border-l-0" style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)' }}>
                    <h1 className="text-xl font-bold text-white whitespace-nowrap">Nossos Clientes</h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto descritivo com borda geométrica */}
            <div className="relative mb-4">
              <div className="absolute -inset-2 border-2 border-white/30" style={{ clipPath: 'polygon(2% 0, 98% 0, 100% 5%, 100% 95%, 98% 100%, 2% 100%, 0 95%, 0 5%)' }}></div>
              <div className="relative bg-[#0a1628]/60 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-white text-sm leading-relaxed text-justify">
                  Acreditamos que o sucesso do nosso negócio está diretamente ligado ao sucesso dos nossos clientes. Por isso, investimos continuamente em infraestrutura, robustez, segurança, inovação e atendimento personalizado, garantindo que cada cliente (independentemente do porte ou segmento) tenha sempre a melhor experiência possível com nossos serviços.
                </p>
              </div>
              {/* Detalhes geométricos nos cantos */}
              <div className="absolute bottom-1 right-1 flex space-x-1">
                <div className="w-6 h-1 bg-white/40 transform skew-x-[-20deg]"></div>
                <div className="w-6 h-1 bg-white/40 transform skew-x-[-20deg]"></div>
                <div className="w-6 h-1 bg-white/40 transform skew-x-[-20deg]"></div>
              </div>
            </div>
          </div>

          {/* Seção de logos dos clientes */}
          <div className="absolute bottom-8 left-12 right-12 z-10">
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-slate-600/50">
              {/* Grid de logos */}
              <div className="grid grid-cols-3 gap-3">
                {/* Linha 1 */}
                <ClientLogo src="/images/clients/condor.png" alt="Condor" fallbackText="Condor" fallbackColor="text-blue-600" />
                <ClientLogo src="/images/clients/jakomel.png" alt="Jakomel" fallbackText="JAKOMEL" fallbackColor="text-red-600" bgColor="bg-yellow-400" />
                <ClientLogo src="/images/clients/assai.png" alt="Assaí" fallbackText="ASSAÍ" fallbackColor="text-red-600" />

                {/* Linha 2 */}
                <ClientLogo src="/images/clients/denso.png" alt="Denso" fallbackText="DENSO" fallbackColor="text-gray-800" />
                <ClientLogo src="/images/clients/luson.png" alt="Luson" fallbackText="Luson" fallbackColor="text-gray-800" fontSize="text-2xl" />
                <ClientLogo src="/images/clients/grupopa.png" alt="Grupo PA" fallbackText="grupo pa" fallbackColor="text-gray-800" />

                {/* Linha 3 */}
                <ClientLogo src="/images/clients/balaroti.png" alt="Balaroti" fallbackText="Balaroti" fallbackColor="text-blue-600" />
                <ClientLogo src="/images/clients/itambe.png" alt="Itambé" fallbackText="ITAMBÉ" fallbackColor="text-green-600" />
                <ClientLogo src="/images/clients/baggio.png" alt="Baggio" fallbackText="BAGGIO" fallbackColor="text-red-600" fontSize="text-lg" />

                {/* Linha 4 */}
                <ClientLogo src="/images/clients/ers.png" alt="ERS" fallbackText="ERS" fallbackColor="text-orange-600" />
                <ClientLogo src="/images/clients/pizzattolog.png" alt="Pizzattolog" fallbackText="PIZZATTOLOG" fallbackColor="text-gray-800" fontSize="text-lg" />
                <ClientLogo src="/images/clients/metrocard.png" alt="Metrocard" fallbackText="metrocard" fallbackColor="text-red-600" />

                {/* Linha 5 */}
                <ClientLogo src="/images/clients/gnissei.png" alt="Gnissei" fallbackText="Gnissei" fallbackColor="text-red-600" />
                <ClientLogo src="/images/clients/parana-clinicas.png" alt="Paraná Clínicas" fallbackText="Paraná Clínicas" fallbackColor="text-red-700" fontSize="text-lg" />
                <ClientLogo src="/images/clients/xv.png" alt="XV" fallbackText="XV" fallbackColor="text-blue-600" fontSize="text-2xl" />

                {/* Linha 6 */}
                <ClientLogo src="/images/clients/crystal.png" alt="Crystal" fallbackText="CRYSTAL" fallbackColor="text-gray-700" fontSize="text-lg" />
                <ClientLogo src="/images/clients/circulo-militar.png" alt="Círculo Militar" fallbackText="Círculo Militar" fallbackColor="text-blue-800" fontSize="text-lg" />
                <ClientLogo src="/images/clients/santa-monica.png" alt="Santa Mônica" fallbackText="Santa Mônica" fallbackColor="text-gray-800" fontSize="text-lg" italic />

                {/* Linha 7 */}
                <ClientLogo src="/images/clients/santa-cruz.png" alt="Santa Cruz" fallbackText="SANTA CRUZ" fallbackColor="text-red-600" />
                <ClientLogo src="/images/clients/cobasi.png" alt="Cobasi" fallbackText="Cobasi" fallbackColor="text-blue-700" />
                <ClientLogo src="/images/clients/lorene.png" alt="Lorene" fallbackText="Lorene" fallbackColor="text-green-600" />
              </div>
            </div>
          </div>

          {/* Formas geométricas decorativas no rodapé direito */}
          <div className="absolute bottom-4 right-8 w-1/4 h-16">
            <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
              <polygon 
                points="20,80 180,80 200,60 200,20 160,0 20,20" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                opacity="0.4"
              />
              <line x1="100" y1="80" x2="120" y2="60" stroke="white" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          </div>

          {/* Rodapé */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ProposalFooter pageNumber={3} />
          </div>
        </div>

        {/* Botão Continuar */}
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
        >
          Continuar para Próxima Seção
          <ArrowRight className="h-6 w-6 ml-3" />
        </Button>
      </div>
    </div>
  );
}
