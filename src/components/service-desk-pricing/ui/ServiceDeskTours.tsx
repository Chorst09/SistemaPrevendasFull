'use client';

import React from 'react';
import { TourConfig, TourStepBuilder } from './GuidedTour';
import { Calculator, Users, Clock, Receipt, TrendingUp, DollarSign, BarChart3, Handshake, FileText, CheckCircle } from 'lucide-react';

// Basic tour for new users
export const basicServiceDeskTour: TourConfig = {
  id: 'basic-service-desk-tour',
  title: 'Introdução ao Sistema de Precificação',
  description: 'Aprenda os conceitos básicos e navegue pelas principais funcionalidades do sistema.',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  showMinimap: true,
  steps: [
    TourStepBuilder
      .create('welcome')
      .title('Bem-vindo ao Sistema de Precificação Service Desk!')
      .content(
        <div className="space-y-3">
          <p>Este sistema permite criar orçamentos detalhados para serviços de service desk.</p>
          <p>Vamos fazer um tour pelas 10 abas principais que compõem o sistema.</p>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Você pode pausar, pular ou reiniciar este tour a qualquer momento.
            </p>
          </div>
        </div>
      )
      .position('center')
      .category('basic')
      .estimatedTime(15)
      .build(),

    TourStepBuilder
      .create('navigation-overview')
      .title('Navegação por Abas')
      .content(
        <div className="space-y-3">
          <p>O sistema é organizado em 10 abas sequenciais:</p>
          <ul className="text-sm space-y-1">
            <li>• <strong>Dados:</strong> Informações básicas do projeto</li>
            <li>• <strong>Equipe:</strong> Definição da equipe e custos</li>
            <li>• <strong>Escala:</strong> Horários de atendimento</li>
            <li>• <strong>Impostos:</strong> Configuração tributária</li>
            <li>• <strong>Variáveis:</strong> Fatores econômicos</li>
          </ul>
          <p className="text-sm text-gray-600">E mais 5 abas para análise e finalização...</p>
        </div>
      )
      .target('[data-tour="tab-navigation"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(20)
      .build(),

    TourStepBuilder
      .create('data-tab')
      .title('Aba 1: Dados do Projeto')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <Calculator size={20} />
            <span className="font-medium">Configuração Inicial</span>
          </div>
          <p>Aqui você define as informações básicas:</p>
          <ul className="text-sm space-y-1">
            <li>• Nome do projeto e cliente</li>
            <li>• Período do contrato</li>
            <li>• Tipo de serviço</li>
            <li>• Localização e moeda</li>
          </ul>
        </div>
      )
      .target('[data-tour="data-tab"]')
      .action('click', '[data-tour="data-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(25)
      .build(),

    TourStepBuilder
      .create('team-tab')
      .title('Aba 2: Equipe')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-600">
            <Users size={20} />
            <span className="font-medium">Gestão de Recursos Humanos</span>
          </div>
          <p>Configure sua equipe de service desk:</p>
          <ul className="text-sm space-y-1">
            <li>• Adicione membros da equipe</li>
            <li>• Defina cargos e salários</li>
            <li>• Configure benefícios</li>
            <li>• Calcule custos automaticamente</li>
          </ul>
        </div>
      )
      .target('[data-tour="team-tab"]')
      .action('click', '[data-tour="team-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(30)
      .build(),

    TourStepBuilder
      .create('scale-tab')
      .title('Aba 3: Escala de Trabalho')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-purple-600">
            <Clock size={20} />
            <span className="font-medium">Horários de Atendimento</span>
          </div>
          <p>Defina os horários de funcionamento:</p>
          <ul className="text-sm space-y-1">
            <li>• Configure turnos de trabalho</li>
            <li>• Defina cobertura 24x7 se necessário</li>
            <li>• Calcule custos por turno</li>
            <li>• Valide cobertura mínima</li>
          </ul>
        </div>
      )
      .target('[data-tour="scale-tab"]')
      .action('click', '[data-tour="scale-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(25)
      .build(),

    TourStepBuilder
      .create('budget-tab')
      .title('Aba 7: Orçamento Consolidado')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-orange-600">
            <DollarSign size={20} />
            <span className="font-medium">Visão Consolidada</span>
          </div>
          <p>Visualize todos os custos consolidados:</p>
          <ul className="text-sm space-y-1">
            <li>• Resumo de todos os custos</li>
            <li>• Ajuste de margens</li>
            <li>• Comparação com projetos anteriores</li>
            <li>• Recálculos automáticos</li>
          </ul>
        </div>
      )
      .target('[data-tour="budget-tab"]')
      .action('click', '[data-tour="budget-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(30)
      .build(),

    TourStepBuilder
      .create('result-tab')
      .title('Aba 8: Análise de Resultados')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <BarChart3 size={20} />
            <span className="font-medium">Análise Financeira</span>
          </div>
          <p>Analise a viabilidade do projeto:</p>
          <ul className="text-sm space-y-1">
            <li>• Cálculos de ROI e payback</li>
            <li>• Gráficos de distribuição</li>
            <li>• Análise de rentabilidade</li>
            <li>• Exportação de relatórios</li>
          </ul>
        </div>
      )
      .target('[data-tour="result-tab"]')
      .action('click', '[data-tour="result-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(35)
      .build(),

    TourStepBuilder
      .create('final-analysis')
      .title('Aba 10: Análise Final')
      .content(
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600">
            <CheckCircle size={20} />
            <span className="font-medium">Dashboard Executivo</span>
          </div>
          <p>Finalize com uma visão executiva:</p>
          <ul className="text-sm space-y-1">
            <li>• KPIs principais</li>
            <li>• Análise de riscos</li>
            <li>• Comparação com benchmarks</li>
            <li>• Geração de proposta final</li>
          </ul>
        </div>
      )
      .target('[data-tour="final-analysis-tab"]')
      .action('click', '[data-tour="final-analysis-tab"]')
      .position('bottom')
      .category('basic')
      .estimatedTime(30)
      .build(),

    TourStepBuilder
      .create('completion')
      .title('Parabéns! Tour Concluído')
      .content(
        <div className="space-y-3">
          <div className="text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <p className="font-medium">Você completou o tour básico!</p>
          </div>
          <p>Agora você conhece as principais funcionalidades do sistema.</p>
          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Próximos passos:</strong> Comece criando um novo projeto na aba "Dados" ou explore os tours avançados.
            </p>
          </div>
        </div>
      )
      .position('center')
      .category('basic')
      .estimatedTime(10)
      .build()
  ]
};

// Advanced features tour
export const advancedFeaturesTour: TourConfig = {
  id: 'advanced-features-tour',
  title: 'Funcionalidades Avançadas',
  description: 'Explore recursos avançados como templates, analytics e exportação.',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  showMinimap: true,
  steps: [
    TourStepBuilder
      .create('templates-intro')
      .title('Sistema de Templates')
      .content(
        <div className="space-y-3">
          <p>O sistema oferece templates para acelerar seu trabalho:</p>
          <ul className="text-sm space-y-1">
            <li>• Salve configurações como templates</li>
            <li>• Aplique templates em novos projetos</li>
            <li>• Gerencie biblioteca de templates</li>
            <li>• Resolva conflitos automaticamente</li>
          </ul>
        </div>
      )
      .target('[data-tour="templates-button"]')
      .position('bottom')
      .category('advanced')
      .estimatedTime(25)
      .build(),

    TourStepBuilder
      .create('analytics-intro')
      .title('Dashboard de Analytics')
      .content(
        <div className="space-y-3">
          <p>Monitore o desempenho do sistema:</p>
          <ul className="text-sm space-y-1">
            <li>• Métricas de uso</li>
            <li>• Performance de cálculos</li>
            <li>• Histórico de projetos</li>
            <li>• Insights de otimização</li>
          </ul>
        </div>
      )
      .target('[data-tour="analytics-button"]')
      .position('bottom')
      .category('advanced')
      .estimatedTime(30)
      .build(),

    TourStepBuilder
      .create('export-intro')
      .title('Sistema de Exportação')
      .content(
        <div className="space-y-3">
          <p>Exporte seus dados em múltiplos formatos:</p>
          <ul className="text-sm space-y-1">
            <li>• PDF com propostas detalhadas</li>
            <li>• Excel para análise</li>
            <li>• JSON para integração</li>
            <li>• Relatórios agendados</li>
          </ul>
        </div>
      )
      .target('[data-tour="export-button"]')
      .position('bottom')
      .category('advanced')
      .estimatedTime(25)
      .build()
  ]
};

// Quick tips tour
export const quickTipsTour: TourConfig = {
  id: 'quick-tips-tour',
  title: 'Dicas Rápidas',
  description: 'Dicas e truques para usar o sistema de forma mais eficiente.',
  autoStart: false,
  showProgress: true,
  allowSkip: true,
  showMinimap: false,
  steps: [
    TourStepBuilder
      .create('keyboard-shortcuts')
      .title('Atalhos de Teclado')
      .content(
        <div className="space-y-3">
          <p>Use atalhos para navegar mais rapidamente:</p>
          <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + →</kbd> Próxima aba</div>
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + ←</kbd> Aba anterior</div>
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + S</kbd> Salvar</div>
            <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl + E</kbd> Exportar</div>
          </div>
        </div>
      )
      .position('center')
      .category('tips')
      .estimatedTime(15)
      .build(),

    TourStepBuilder
      .create('auto-save')
      .title('Salvamento Automático')
      .content(
        <div className="space-y-3">
          <p>O sistema salva automaticamente suas alterações:</p>
          <ul className="text-sm space-y-1">
            <li>• Salvamento a cada 30 segundos</li>
            <li>• Backup automático a cada 10 minutos</li>
            <li>• Sincronização entre abas</li>
            <li>• Recuperação em caso de erro</li>
          </ul>
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              Você nunca perderá seu trabalho!
            </p>
          </div>
        </div>
      )
      .position('center')
      .category('tips')
      .estimatedTime(20)
      .build(),

    TourStepBuilder
      .create('validation-system')
      .title('Sistema de Validação')
      .content(
        <div className="space-y-3">
          <p>O sistema valida seus dados em tempo real:</p>
          <ul className="text-sm space-y-1">
            <li>• Indicadores visuais de erro</li>
            <li>• Sugestões de correção</li>
            <li>• Validação antes de navegar</li>
            <li>• Alertas de campos obrigatórios</li>
          </ul>
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800">
              Fique atento aos indicadores coloridos nas abas!
            </p>
          </div>
        </div>
      )
      .position('center')
      .category('tips')
      .estimatedTime(25)
      .build()
  ]
};

// Tour manager component
interface ServiceDeskToursProps {
  activeTour: string | null;
  onCloseTour: () => void;
  onTourComplete?: (tourId: string) => void;
  onTourSkip?: (tourId: string) => void;
}

export function ServiceDeskTours({ 
  activeTour, 
  onCloseTour, 
  onTourComplete,
  onTourSkip 
}: ServiceDeskToursProps) {
  const tours = {
    'basic': basicServiceDeskTour,
    'advanced': advancedFeaturesTour,
    'tips': quickTipsTour
  };

  const currentTour = activeTour ? tours[activeTour as keyof typeof tours] : null;

  if (!currentTour) return null;

  return (
    <div>
      {/* Tour component would be rendered here */}
      {/* This is handled by the parent component */}
    </div>
  );
}

// Tour launcher component
interface TourLauncherProps {
  onStartTour: (tourId: string) => void;
  className?: string;
}

export function TourLauncher({ onStartTour, className }: TourLauncherProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-blue-700">Tours Disponíveis</h3>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Calculator className="text-blue-500" size={20} />
              <h4 className="font-medium text-blue-700">Tour Básico</h4>
            </div>
            <p className="text-sm text-blue-700">
              Aprenda os conceitos fundamentais e navegue pelas principais funcionalidades.
            </p>
            <div className="text-xs text-blue-600">
              ⏱️ ~4 minutos • 8 passos
            </div>
            <button
              onClick={() => onStartTour('basic')}
              className="w-full bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
            >
              Iniciar Tour Básico
            </button>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="text-purple-500" size={20} />
              <h4 className="font-medium text-blue-700">Funcionalidades Avançadas</h4>
            </div>
            <p className="text-sm text-blue-700">
              Explore templates, analytics e recursos de exportação.
            </p>
            <div className="text-xs text-blue-600">
              ⏱️ ~2 minutos • 3 passos
            </div>
            <button
              onClick={() => onStartTour('advanced')}
              className="w-full bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
            >
              Explorar Avançado
            </button>
          </div>
          
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={20} />
              <h4 className="font-medium text-blue-700">Dicas Rápidas</h4>
            </div>
            <p className="text-sm text-blue-700">
              Dicas e truques para usar o sistema de forma mais eficiente.
            </p>
            <div className="text-xs text-blue-600">
              ⏱️ ~1 minuto • 3 passos
            </div>
            <button
              onClick={() => onStartTour('tips')}
              className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
            >
              Ver Dicas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}