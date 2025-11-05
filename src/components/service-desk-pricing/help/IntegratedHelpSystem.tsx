'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Video, 
  FileText,
  ExternalLink,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Help content interface
export interface HelpContent {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  tips: string[];
  commonIssues?: Array<{
    issue: string;
    solution: string;
  }>;
  relatedLinks?: Array<{
    title: string;
    url: string;
    type: 'internal' | 'external';
  }>;
  videoUrl?: string;
  estimatedTime?: number;
}

// Help content for each tab
const tabHelpContent: Record<string, HelpContent> = {
  'data': {
    id: 'data-help',
    title: 'Configuração de Dados do Projeto',
    description: 'Configure as informações básicas que serão usadas em todo o sistema.',
    estimatedTime: 3,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Campos Principais</h4>
          <ul className="space-y-2 text-sm">
            <li><strong>Nome do Projeto:</strong> Use um nome descritivo e único</li>
            <li><strong>Cliente:</strong> Nome completo da empresa cliente</li>
            <li><strong>Período:</strong> Data de início e fim do contrato</li>
            <li><strong>Tipo de Serviço:</strong> Categoria do service desk</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md">
          <h5 className="font-medium text-blue-800 mb-1">💡 Dica Importante</h5>
          <p className="text-sm text-blue-700">
            O período do contrato afeta todos os cálculos. Certifique-se de definir 
            as datas corretas antes de prosseguir.
          </p>
        </div>
      </div>
    ),
    tips: [
      'Use nomes descritivos para facilitar identificação posterior',
      'Verifique se as datas do contrato estão corretas',
      'A localização pode afetar cálculos de impostos',
      'Salve frequentemente - o sistema faz backup automático'
    ],
    commonIssues: [
      {
        issue: 'Não consigo salvar os dados',
        solution: 'Verifique se todos os campos obrigatórios (*) estão preenchidos'
      },
      {
        issue: 'Data inválida',
        solution: 'Use o formato DD/MM/AAAA ou selecione no calendário'
      }
    ]
  },
  
  'team': {
    id: 'team-help',
    title: 'Gestão da Equipe',
    description: 'Configure os membros da equipe, cargos, salários e benefícios.',
    estimatedTime: 5,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Adicionando Membros</h4>
          <ol className="space-y-1 text-sm">
            <li>1. Clique em "Adicionar Membro"</li>
            <li>2. Preencha nome e cargo</li>
            <li>3. Defina salário base mensal</li>
            <li>4. Configure benefícios</li>
            <li>5. Defina carga horária</li>
          </ol>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Cargos Típicos</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Analista N1:</strong> R$ 2.500 - 3.500</li>
            <li><strong>Analista N2:</strong> R$ 3.500 - 5.000</li>
            <li><strong>Analista N3:</strong> R$ 5.000 - 7.000</li>
            <li><strong>Coordenador:</strong> R$ 6.000 - 8.000</li>
          </ul>
        </div>
      </div>
    ),
    tips: [
      'Inclua todos os encargos sociais no cálculo',
      'Considere benefícios como vale transporte e alimentação',
      'Use templates para cargos padronizados',
      'Verifique se a carga horária está correta'
    ],
    commonIssues: [
      {
        issue: 'Custo por hora muito alto',
        solution: 'Verifique se incluiu encargos em duplicidade'
      },
      {
        issue: 'Não consigo adicionar membro',
        solution: 'Preencha todos os campos obrigatórios primeiro'
      }
    ]
  },
  
  'scale': {
    id: 'scale-help',
    title: 'Configuração de Escalas',
    description: 'Defina horários de atendimento e distribuição da equipe.',
    estimatedTime: 4,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Tipos de Cobertura</h4>
          <ul className="space-y-2 text-sm">
            <li><strong>8x5:</strong> 8 horas por dia, 5 dias por semana</li>
            <li><strong>12x5:</strong> 12 horas por dia, 5 dias por semana</li>
            <li><strong>24x7:</strong> 24 horas por dia, 7 dias por semana</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-md">
          <h5 className="font-medium text-yellow-800 mb-1">⚠️ Atenção</h5>
          <p className="text-sm text-yellow-700">
            Certifique-se de que há cobertura suficiente para todos os horários 
            de atendimento definidos no contrato.
          </p>
        </div>
      </div>
    ),
    tips: [
      'Considere feriados e férias no planejamento',
      'Adicione folga para cobrir ausências',
      'Horários noturnos têm adicional de custo',
      'Valide cobertura mínima por turno'
    ],
    commonIssues: [
      {
        issue: 'Cobertura insuficiente',
        solution: 'Adicione mais profissionais ou ajuste horários'
      },
      {
        issue: 'Custo muito alto',
        solution: 'Revise se há sobreposição desnecessária de turnos'
      }
    ]
  },
  
  'taxes': {
    id: 'taxes-help',
    title: 'Configuração de Impostos',
    description: 'Configure impostos e tributos aplicáveis ao projeto.',
    estimatedTime: 3,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Impostos Principais</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>ISS:</strong> 2% a 5% (varia por município)</li>
            <li><strong>PIS:</strong> 0,65% ou 1,65%</li>
            <li><strong>COFINS:</strong> 3% ou 7,6%</li>
            <li><strong>IR:</strong> 1,2% a 4,8%</li>
            <li><strong>CSLL:</strong> 1,08% a 2,88%</li>
          </ul>
        </div>
        
        <div className="bg-red-50 p-3 rounded-md">
          <h5 className="font-medium text-red-800 mb-1">🚨 Importante</h5>
          <p className="text-sm text-red-700">
            Consulte sempre um contador para confirmar as alíquotas 
            específicas da sua região e regime tributário.
          </p>
        </div>
      </div>
    ),
    tips: [
      'Use templates por região para facilitar',
      'Confirme regime tributário da empresa',
      'Considere benefícios fiscais aplicáveis',
      'Mantenha documentação atualizada'
    ],
    commonIssues: [
      {
        issue: 'Alíquota incorreta',
        solution: 'Consulte a prefeitura local para ISS correto'
      },
      {
        issue: 'Cálculo não confere',
        solution: 'Verifique se está usando o regime tributário correto'
      }
    ]
  },
  
  'budget': {
    id: 'budget-help',
    title: 'Orçamento Consolidado',
    description: 'Visualize e ajuste o orçamento final do projeto.',
    estimatedTime: 4,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Componentes do Orçamento</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Custos de Pessoal:</strong> Salários + encargos</li>
            <li><strong>Custos Operacionais:</strong> Infraestrutura, licenças</li>
            <li><strong>Impostos:</strong> Tributos aplicáveis</li>
            <li><strong>Margem:</strong> Lucro desejado</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Margens Típicas</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Conservadora:</strong> 15% - 20%</li>
            <li><strong>Moderada:</strong> 20% - 30%</li>
            <li><strong>Agressiva:</strong> 30% - 40%</li>
          </ul>
        </div>
      </div>
    ),
    tips: [
      'Compare com projetos similares anteriores',
      'Considere riscos na definição da margem',
      'Valide se o preço final é competitivo',
      'Documente premissas utilizadas'
    ]
  },
  
  'forecast': {
    id: 'forecast-help',
    title: 'Forecast e Projeções',
    description: 'Sistema avançado de projeções financeiras e análise de cenários.',
    estimatedTime: 8,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Dashboard Executivo</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Receita Total Projetada:</strong> Soma das receitas previstas</li>
            <li><strong>Margem Média:</strong> Percentual médio de lucro (meta: {'>'} 20%)</li>
            <li><strong>ROI Projetado:</strong> Retorno sobre investimento esperado</li>
            <li><strong>Payback Period:</strong> Tempo para recuperar investimento</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Cenários de Análise</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded text-center">
              <div className="font-medium text-green-800">Otimista</div>
              <div className="text-green-600">20% crescimento</div>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <div className="font-medium text-blue-800">Realista</div>
              <div className="text-blue-600">12% crescimento</div>
            </div>
            <div className="bg-red-50 p-2 rounded text-center">
              <div className="font-medium text-red-800">Pessimista</div>
              <div className="text-red-600">5% crescimento</div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Gestão de Riscos</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>Matriz de Riscos:</strong> Probabilidade vs Impacto</li>
            <li><strong>Análise de Sensibilidade:</strong> Impacto de variações</li>
            <li><strong>Alertas Automáticos:</strong> Monitoramento contínuo</li>
          </ul>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-md">
          <h5 className="font-medium text-purple-800 mb-1">💡 Insights Automáticos</h5>
          <p className="text-sm text-purple-700">
            O sistema gera recomendações estratégicas baseadas nos dados, 
            como oportunidades de expansão e otimização de custos.
          </p>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-md">
          <h5 className="font-medium text-orange-800 mb-1">⚠️ Alertas de Risco</h5>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Margem crítica: {'<'} 15%</li>
            <li>• Crescimento de custos: {'>'} 30%</li>
            <li>• Dependência de cliente: {'>'} 80%</li>
          </ul>
        </div>
      </div>
    ),
    tips: [
      'Compare sempre múltiplos cenários para análise de risco',
      'Revise premissas mensalmente com dados reais do negócio',
      'Configure alertas automáticos para monitoramento contínuo',
      'Use insights para criar planos de ação específicos',
      'Documente justificativas para todos os ajustes de cenários',
      'Monitore elasticidade das variáveis para ajustar estratégias'
    ],
    commonIssues: [
      {
        issue: 'Projeções muito otimistas',
        solution: 'Use dados históricos para calibrar premissas e seja conservador'
      },
      {
        issue: 'Muitos alertas de risco',
        solution: 'Revise thresholds e ajuste conforme perfil de risco do negócio'
      },
      {
        issue: 'Cenários não fazem sentido',
        solution: 'Valide premissas com stakeholders e dados de mercado'
      }
    ],
    relatedLinks: [
      {
        title: 'Documentação Completa do Forecast',
        url: '/docs/forecast-system',
        type: 'internal'
      },
      {
        title: 'Melhores Práticas de Projeção Financeira',
        url: '/docs/best-practices',
        type: 'internal'
      }
    ]
  },
  
  'result': {
    id: 'result-help',
    title: 'Análise de Resultados',
    description: 'Analise a viabilidade financeira e rentabilidade do projeto.',
    estimatedTime: 6,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Indicadores Principais</h4>
          <ul className="space-y-1 text-sm">
            <li><strong>ROI:</strong> Retorno sobre investimento</li>
            <li><strong>Payback:</strong> Tempo para recuperar investimento</li>
            <li><strong>Margem Bruta:</strong> Receita - custos diretos</li>
            <li><strong>Margem Líquida:</strong> Lucro após todos os custos</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md">
          <h5 className="font-medium text-green-800 mb-1">✅ Projeto Viável</h5>
          <p className="text-sm text-green-700">
            ROI maior que 15% e Payback menor que 24 meses geralmente indicam 
            um projeto financeiramente atrativo.
          </p>
        </div>
      </div>
    ),
    tips: [
      'Analise diferentes cenários (otimista, realista, pessimista)',
      'Compare com benchmarks do mercado',
      'Considere riscos na análise',
      'Documente premissas para futuras revisões'
    ]
  }
};

// Integrated help system component
interface IntegratedHelpSystemProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenDocumentation?: () => void;
}

export function IntegratedHelpSystem({ 
  activeTab, 
  isOpen, 
  onClose, 
  onOpenDocumentation 
}: IntegratedHelpSystemProps) {
  const [currentSection, setCurrentSection] = useState<'overview' | 'tips' | 'issues'>('overview');
  const helpContent = tabHelpContent[activeTab];

  if (!isOpen || !helpContent) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-xl z-40 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <HelpCircle className="text-blue-500" size={20} />
              <h3 className="font-medium text-blue-900">Ajuda</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          
          <h4 className="text-lg font-semibold text-gray-900 mb-1">
            {helpContent.title}
          </h4>
          <p className="text-sm text-gray-600">
            {helpContent.description}
          </p>
          
          {helpContent.estimatedTime && (
            <div className="flex items-center space-x-1 mt-2">
              <Info size={14} className="text-blue-500" />
              <span className="text-xs text-blue-600">
                Tempo estimado: {helpContent.estimatedTime} minutos
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b">
          <Tabs value={currentSection} onValueChange={(value) => setCurrentSection(value as any)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview" className="text-xs">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs">
                Dicas
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-xs">
                Problemas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentSection === 'overview' && (
                <div className="space-y-4">
                  {helpContent.content}
                </div>
              )}

              {currentSection === 'tips' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="text-yellow-500" size={18} />
                    <h4 className="font-medium">Dicas Úteis</h4>
                  </div>
                  {helpContent.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-md">
                      <CheckCircle className="text-yellow-600 mt-0.5" size={16} />
                      <p className="text-sm text-yellow-800">{tip}</p>
                    </div>
                  ))}
                </div>
              )}

              {currentSection === 'issues' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="text-red-500" size={18} />
                    <h4 className="font-medium">Problemas Comuns</h4>
                  </div>
                  {helpContent.commonIssues?.map((item, index) => (
                    <Card key={index} className="border-red-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-red-800 flex items-center space-x-2">
                          <AlertCircle size={14} />
                          <span>{item.issue}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-700">{item.solution}</p>
                      </CardContent>
                    </Card>
                  )) || (
                    <p className="text-sm text-gray-500 italic">
                      Nenhum problema comum reportado para esta seção.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onOpenDocumentation}
          >
            <BookOpen size={16} className="mr-2" />
            Abrir Documentação Completa
          </Button>
          
          {helpContent.videoUrl && (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.open(helpContent.videoUrl, '_blank')}
            >
              <Video size={16} className="mr-2" />
              Assistir Vídeo Tutorial
            </Button>
          )}
          
          <div className="text-xs text-gray-500 text-center pt-2">
            Precisa de mais ajuda? Entre em contato com o suporte.
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Quick help button component
interface QuickHelpButtonProps {
  activeTab: string;
  onOpenHelp: () => void;
  className?: string;
}

export function QuickHelpButton({ activeTab, onOpenHelp, className }: QuickHelpButtonProps) {
  const helpContent = tabHelpContent[activeTab];
  
  if (!helpContent) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onOpenHelp}
      className={cn("flex items-center space-x-2", className)}
    >
      <HelpCircle size={16} />
      <span>Ajuda</span>
    </Button>
  );
}

// Help indicator for form fields
interface FieldHelpIndicatorProps {
  content: string;
  type?: 'info' | 'warning' | 'error';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function FieldHelpIndicator({ 
  content, 
  type = 'info', 
  position = 'top' 
}: FieldHelpIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={14} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {getIcon()}
      </button>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "absolute z-50 px-3 py-2 text-xs bg-gray-900 text-white rounded-md shadow-lg max-w-xs",
              position === 'top' && "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
              position === 'bottom' && "top-full left-1/2 transform -translate-x-1/2 mt-2",
              position === 'left' && "right-full top-1/2 transform -translate-y-1/2 mr-2",
              position === 'right' && "left-full top-1/2 transform -translate-y-1/2 ml-2"
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}