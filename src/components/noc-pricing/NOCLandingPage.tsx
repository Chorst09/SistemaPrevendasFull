'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, FileText, TrendingUp, Shield, Clock, Users } from 'lucide-react';

interface NOCLandingPageProps {
  onNewProposal: () => void;
  onAdminPanel: () => void;
}

export function NOCLandingPage({ onNewProposal, onAdminPanel }: NOCLandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-blue-500/20 rounded-full backdrop-blur-sm border border-blue-400/30">
              <Server className="h-16 w-16 text-blue-400" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Potencialize Seu Negócio
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              com Precificação Inteligente
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Nossa solução inovadora de precificação NOC foi projetada para profissionais de TI que
            exigem precisão e flexibilidade. Personalize sua estratégia de preços sem esforço e
            eleve o potencial do seu negócio.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Precificação Inteligente</h3>
              <p className="text-gray-400 text-sm">
                Algoritmos avançados para calcular preços competitivos e lucrativos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-lg">
                  <Shield className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">SLA Personalizável</h3>
              <p className="text-gray-400 text-sm">
                Configure níveis de serviço adaptados às necessidades do cliente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cobertura 24x7</h3>
              <p className="text-gray-400 text-sm">
                Suporte para diferentes modelos de atendimento e escalas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button
            onClick={onNewProposal}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-6 text-lg font-semibold rounded-xl shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all transform hover:scale-105"
          >
            <FileText className="h-6 w-6 mr-3" />
            Nova Proposta
          </Button>

          <Button
            onClick={onAdminPanel}
            size="lg"
            variant="outline"
            className="border-2 border-slate-600 bg-slate-800/50 hover:bg-slate-700/50 text-white px-12 py-6 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all"
          >
            <Users className="h-6 w-6 mr-3" />
            Painel Administrativo
          </Button>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Dispositivos Monitorados', value: '1000+' },
            { label: 'Métricas Coletadas', value: '50K+' },
            { label: 'Uptime Garantido', value: '99.9%' },
            { label: 'Clientes Satisfeitos', value: '200+' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
