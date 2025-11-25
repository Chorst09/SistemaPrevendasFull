'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { ProposalHeader, ProposalFooter } from './ProposalHeaderFooter';

interface ProposalAboutPageProps {
  onContinue: () => void;
  onBack: () => void;
}

export function ProposalAboutPage({ onContinue, onBack }: ProposalAboutPageProps) {
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

        {/* Página "Quem Somos" */}
        <div className="relative w-full aspect-[3/4] bg-white rounded-lg overflow-hidden shadow-2xl">
          {/* Cabeçalho */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <ProposalHeader pageNumber={2} />
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
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <circle cx="30" cy="30" r="2" fill="rgba(100,200,255,0.4)" />
                  <line x1="30" y1="30" x2="60" y2="30" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
                  <line x1="30" y1="30" x2="30" y2="60" stroke="rgba(100,200,255,0.2)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Formas geométricas decorativas no topo */}
          <div className="absolute top-0 right-0 w-2/3 h-32">
            <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Linha principal */}
              <line x1="0" y1="50" x2="200" y2="50" stroke="white" strokeWidth="2" opacity="0.6" />
              <circle cx="200" cy="50" r="4" fill="white" opacity="0.8" />
              <line x1="200" y1="50" x2="380" y2="20" stroke="white" strokeWidth="2" opacity="0.6" />
              <circle cx="380" cy="20" r="4" fill="white" opacity="0.8" />
              
              {/* Forma geométrica superior */}
              <polygon 
                points="200,20 380,20 380,80 340,80" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Seção "Quem Somos" */}
          <div className="absolute top-8 left-12 right-12 z-10">
            {/* Título com forma geométrica */}
            <div className="relative inline-block mb-6">
              <div className="absolute -inset-2 border-2 border-white/40 transform -skew-x-12"></div>
              <h1 className="relative text-3xl font-bold text-white px-6 py-2 bg-[#0a1628]/80">
                Quem Somos
              </h1>
            </div>

            {/* Texto descritivo com borda */}
            <div className="relative mb-6">
              <div className="absolute -inset-3 border-2 border-white/30 rounded-lg"></div>
              <div className="relative bg-[#0a1628]/60 backdrop-blur-sm p-4 rounded-lg">
                <p className="text-white text-base leading-relaxed text-justify">
                  Com três décadas de história no mercado, a Double TI + Telecom se destaca pela experiência consolidada de sua equipe e pela confiança conquistada junto aos clientes. Nossa jornada é guiada pela tradição que nos conecta às nossas raízes e pela inovação, que nos impulsionam a evoluir continuamente, sempre mirando um futuro promissor e cheio de oportunidades. Somos uma parceira estratégica, capaz de entregar soluções completas que colaboram com o sucesso de nossos clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Seção com imagem e estatísticas */}
          <div className="absolute bottom-8 left-12 right-12 z-10">
            <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-slate-600/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Imagem da equipe */}
                <div className="relative w-full h-64 rounded-xl overflow-hidden border-4 border-slate-700/50">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                    alt="Equipe Double TI + Telecom"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  {/* +30 Anos */}
                  <div className="relative">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -inset-1 border-2 border-white/30 rounded-lg transform skew-x-6"></div>
                        <div className="relative bg-[#0a1628] px-4 py-2 rounded-lg">
                          <div className="text-3xl font-bold text-white">+30</div>
                          <div className="text-lg font-semibold text-white">Anos</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <svg width="100%" height="4" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="2" x2="100%" y2="2" stroke="white" strokeWidth="2" opacity="0.4" />
                          <circle cx="10" cy="2" r="3" fill="white" opacity="0.6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* +500 Clientes */}
                  <div className="relative">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -inset-1 border-2 border-white/30 rounded-lg transform skew-x-6"></div>
                        <div className="relative bg-[#0a1628] px-4 py-2 rounded-lg">
                          <div className="text-3xl font-bold text-white">+500</div>
                          <div className="text-lg font-semibold text-white">Clientes</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <svg width="100%" height="4" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="2" x2="100%" y2="2" stroke="white" strokeWidth="2" opacity="0.4" />
                          <circle cx="10" cy="2" r="3" fill="white" opacity="0.6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* +5000 Projetos */}
                  <div className="relative">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="absolute -inset-1 border-2 border-white/30 rounded-lg transform skew-x-6"></div>
                        <div className="relative bg-[#0a1628] px-4 py-2 rounded-lg">
                          <div className="text-3xl font-bold text-white">+5000</div>
                          <div className="text-lg font-semibold text-white">Projetos</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <svg width="100%" height="4" xmlns="http://www.w3.org/2000/svg">
                          <line x1="0" y1="2" x2="100%" y2="2" stroke="white" strokeWidth="2" opacity="0.4" />
                          <circle cx="10" cy="2" r="3" fill="white" opacity="0.6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formas geométricas decorativas no rodapé */}
          <div className="absolute bottom-0 left-0 w-1/3 h-24">
            <svg viewBox="0 0 200 100" className="w-full h-full" preserveAspectRatio="none">
              <polygon 
                points="0,100 0,80 120,80 140,60 140,100" 
                fill="none" 
                stroke="white" 
                strokeWidth="2"
                opacity="0.4"
              />
              <line x1="20" y1="90" x2="100" y2="90" stroke="white" strokeWidth="1" opacity="0.3" />
            </svg>
          </div>
          </div>

          {/* Rodapé */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <ProposalFooter pageNumber={2} />
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
