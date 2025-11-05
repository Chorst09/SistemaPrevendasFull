'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Palette,
  Eye,
  Moon,
  Sun,
  Contrast
} from 'lucide-react';

/**
 * Componente de showcase do sistema de cores
 * Demonstra todos os padrões e componentes com as cores do sistema
 */
export function ColorSystemShowcase() {
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');

  const toggleTheme = () => {
    const themes: ('dark' | 'light' | 'high-contrast')[] = ['dark', 'light', 'high-contrast'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'high-contrast': return <Contrast className="w-4 h-4" />;
      default: return <Moon className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sistema de Cores - Pre-Sales Ally
            </h1>
            <p className="text-muted-foreground">
              Showcase completo do sistema de cores e componentes
            </p>
          </div>
          
          <Button
            onClick={toggleTheme}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {getThemeIcon()}
            Tema: {theme === 'high-contrast' ? 'Alto Contraste' : theme === 'light' ? 'Claro' : 'Escuro'}
          </Button>
        </div>

        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="colors">Paleta</TabsTrigger>
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="forms">Formulários</TabsTrigger>
            <TabsTrigger value="navigation">Navegação</TabsTrigger>
            <TabsTrigger value="usage">Guia de Uso</TabsTrigger>
          </TabsList>

          {/* Paleta de Cores */}
          <TabsContent value="colors" className="space-y-6">
            <ColorPalette />
          </TabsContent>

          {/* Componentes */}
          <TabsContent value="components" className="space-y-6">
            <ComponentShowcase />
          </TabsContent>

          {/* Gráficos */}
          <TabsContent value="charts" className="space-y-6">
            <ChartShowcase />
          </TabsContent>

          {/* Formulários */}
          <TabsContent value="forms" className="space-y-6">
            <FormShowcase />
          </TabsContent>

          {/* Navegação */}
          <TabsContent value="navigation" className="space-y-6">
            <NavigationShowcase />
          </TabsContent>

          {/* Guia de Uso */}
          <TabsContent value="usage" className="space-y-6">
            <UsageGuideShowcase />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente da Paleta de Cores
function ColorPalette() {
  const primaryColors = [
    { name: 'primary-50', value: 'hsl(var(--primary-50))', usage: 'Backgrounds muito claros' },
    { name: 'primary-100', value: 'hsl(var(--primary-100))', usage: 'Backgrounds claros' },
    { name: 'primary-200', value: 'hsl(var(--primary-200))', usage: 'Borders suaves' },
    { name: 'primary-300', value: 'hsl(var(--primary-300))', usage: 'Texto secundário' },
    { name: 'primary-400', value: 'hsl(var(--primary-400))', usage: 'Texto muted' },
    { name: 'primary-500', value: 'hsl(var(--primary-500))', usage: 'Elementos neutros' },
    { name: 'primary-600', value: 'hsl(var(--primary-600))', usage: 'Texto principal (claro)' },
    { name: 'primary-700', value: 'hsl(var(--primary-700))', usage: 'Borders escuras' },
    { name: 'primary-800', value: 'hsl(var(--primary-800))', usage: 'Cards escuros' },
    { name: 'primary-900', value: 'hsl(var(--primary-900))', usage: 'Background principal' },
  ];

  const accentColors = [
    { name: 'accent-cyan', value: 'hsl(var(--accent-cyan))', usage: 'Elementos informativos, links' },
    { name: 'accent-orange', value: 'hsl(var(--accent-orange))', usage: 'Botões de ação, CTAs' },
    { name: 'accent-yellow', value: 'hsl(var(--accent-yellow))', usage: 'Avisos, destaques' },
    { name: 'accent-green', value: 'hsl(var(--accent-green))', usage: 'Status positivo, sucesso' },
    { name: 'accent-purple', value: 'hsl(var(--accent-purple))', usage: 'Elementos especiais' },
  ];

  const chartColors = [
    { name: 'chart-revenue', value: 'hsl(var(--chart-revenue))', usage: 'Receita' },
    { name: 'chart-cost', value: 'hsl(var(--chart-cost))', usage: 'Custos' },
    { name: 'chart-profit', value: 'hsl(var(--chart-profit))', usage: 'Lucro' },
    { name: 'chart-tax', value: 'hsl(var(--chart-tax))', usage: 'Impostos' },
    { name: 'chart-commission', value: 'hsl(var(--chart-commission))', usage: 'Comissões' },
  ];

  return (
    <div className="space-y-8">
      {/* Cores Primárias */}
      <Card>
        <CardHeader>
          <CardTitle>Cores Primárias (Espectro Azul)</CardTitle>
          <CardDescription>
            Base visual da aplicação, do mais claro ao mais escuro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {primaryColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className="w-full h-20 rounded-lg border border-border"
                  style={{ backgroundColor: color.value }}
                />
                <div>
                  <p className="font-mono text-sm text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cores de Destaque */}
      <Card>
        <CardHeader>
          <CardTitle>Cores de Destaque</CardTitle>
          <CardDescription>
            Cores para criar hierarquia visual e chamar atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {accentColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className="w-full h-20 rounded-lg border border-border"
                  style={{ backgroundColor: color.value }}
                />
                <div>
                  <p className="font-mono text-sm text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cores para Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Cores para Gráficos</CardTitle>
          <CardDescription>
            Paleta específica para visualizações de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {chartColors.map((color) => (
              <div key={color.name} className="space-y-2">
                <div 
                  className="w-full h-20 rounded-lg border border-border"
                  style={{ backgroundColor: color.value }}
                />
                <div>
                  <p className="font-mono text-sm text-foreground">{color.name}</p>
                  <p className="text-xs text-muted-foreground">{color.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Showcase de Componentes
function ComponentShowcase() {
  return (
    <div className="space-y-8">
      {/* Botões */}
      <Card>
        <CardHeader>
          <CardTitle>Botões</CardTitle>
          <CardDescription>Diferentes variações de botões com o sistema de cores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button className="btn-primary-modern">Botão Primário</Button>
            <Button className="btn-secondary-modern">Botão Secundário</Button>
            <Button variant="destructive">Botão de Perigo</Button>
            <Button variant="outline">Botão Outline</Button>
            <Button variant="ghost">Botão Ghost</Button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button size="sm" className="btn-primary-modern">Pequeno</Button>
            <Button size="default" className="btn-primary-modern">Padrão</Button>
            <Button size="lg" className="btn-primary-modern">Grande</Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Cards de Estatísticas</CardTitle>
          <CardDescription>Cards com cores específicas para diferentes tipos de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Receita Total</p>
                  <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
                </div>
                <div className="p-3 bg-chart-revenue/10 rounded-full">
                  <TrendingUp className="w-6 h-6 text-chart-revenue" />
                </div>
              </div>
            </div>

            <div className="bg-card border-l-4 border-chart-cost rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Custos Totais</p>
                  <p className="text-2xl font-bold text-chart-cost">R$ 85.000</p>
                </div>
                <div className="p-3 bg-chart-cost/10 rounded-full">
                  <TrendingDown className="w-6 h-6 text-chart-cost" />
                </div>
              </div>
            </div>

            <div className="bg-card border-l-4 border-chart-profit rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Lucro</p>
                  <p className="text-2xl font-bold text-chart-profit">R$ 40.000</p>
                </div>
                <div className="p-3 bg-chart-profit/10 rounded-full">
                  <DollarSign className="w-6 h-6 text-chart-profit" />
                </div>
              </div>
            </div>

            <div className="bg-card border-l-4 border-chart-commission rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Comissões</p>
                  <p className="text-2xl font-bold text-chart-commission">R$ 12.500</p>
                </div>
                <div className="p-3 bg-chart-commission/10 rounded-full">
                  <Users className="w-6 h-6 text-chart-commission" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Badges de Status</CardTitle>
          <CardDescription>Indicadores visuais com cores semânticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-success/10 text-success hover:bg-success/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Aprovado
            </Badge>
            <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Pendente
            </Badge>
            <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">
              <AlertCircle className="w-3 h-3 mr-1" />
              Rejeitado
            </Badge>
            <Badge className="bg-info/10 text-info hover:bg-info/20">
              <Info className="w-3 h-3 mr-1" />
              Em Análise
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards com Efeitos */}
      <Card>
        <CardHeader>
          <CardTitle>Cards com Efeitos Especiais</CardTitle>
          <CardDescription>Cards com efeitos de vidro e gradientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all duration-300">
              <h3 className="text-foreground font-semibold mb-2">Card com Efeito de Vidro</h3>
              <p className="text-muted-foreground">Este card usa o efeito glass-effect com backdrop-filter.</p>
            </div>

            <div className="gradient-primary rounded-xl p-6 text-white hover-lift">
              <h3 className="font-semibold mb-2">Card com Gradiente Primário</h3>
              <p className="opacity-90">Gradiente entre primary e accent-cyan.</p>
            </div>

            <div className="gradient-accent rounded-xl p-6 text-white hover-lift">
              <h3 className="font-semibold mb-2">Card com Gradiente Accent</h3>
              <p className="opacity-90">Gradiente entre accent-orange e accent-yellow.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Showcase de Gráficos
function ChartShowcase() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Cores para Visualizações</CardTitle>
          <CardDescription>Demonstração das cores específicas para gráficos e dados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Simulação de gráfico de barras */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Gráfico de Barras - Receitas vs Custos</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-revenue))' }}></div>
                  <span className="text-sm text-foreground">Receita</span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: 'hsl(var(--chart-revenue))', 
                        width: '75%' 
                      }}
                    ></div>
                    <span className="absolute right-2 top-0 h-full flex items-center text-xs text-foreground">
                      R$ 125.000
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-cost))' }}></div>
                  <span className="text-sm text-foreground">Custos</span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: 'hsl(var(--chart-cost))', 
                        width: '60%' 
                      }}
                    ></div>
                    <span className="absolute right-2 top-0 h-full flex items-center text-xs text-foreground">
                      R$ 85.000
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-profit))' }}></div>
                  <span className="text-sm text-foreground">Lucro</span>
                  <div className="flex-1 bg-muted rounded-full h-6 relative">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        backgroundColor: 'hsl(var(--chart-profit))', 
                        width: '40%' 
                      }}
                    ></div>
                    <span className="absolute right-2 top-0 h-full flex items-center text-xs text-foreground">
                      R$ 40.000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulação de gráfico de pizza */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Distribuição de Custos</h4>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--chart-cost))"
                      strokeWidth="20"
                      strokeDasharray="75 25"
                      strokeDashoffset="0"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--chart-commission))"
                      strokeWidth="20"
                      strokeDasharray="15 85"
                      strokeDashoffset="-75"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--chart-tax))"
                      strokeWidth="20"
                      strokeDasharray="10 90"
                      strokeDashoffset="-90"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-cost))' }}></div>
                  <span className="text-sm text-foreground">Operacional (75%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-commission))' }}></div>
                  <span className="text-sm text-foreground">Comissões (15%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-tax))' }}></div>
                  <span className="text-sm text-foreground">Impostos (10%)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Showcase de Formulários
function FormShowcase() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Elementos de Formulário</CardTitle>
          <CardDescription>Inputs, selects e outros elementos com o sistema de cores</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Input Padrão</label>
                <Input 
                  placeholder="Digite aqui..."
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Input com Sucesso</label>
                <Input 
                  placeholder="Validação bem-sucedida"
                  className="border-success focus:border-success focus:ring-success/20"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Input com Erro</label>
                <Input 
                  placeholder="Campo obrigatório"
                  className="border-destructive focus:border-destructive focus:ring-destructive/20"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Select</label>
                <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors">
                  <option value="">Selecione uma opção</option>
                  <option value="1">Opção 1</option>
                  <option value="2">Opção 2</option>
                  <option value="3">Opção 3</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Textarea</label>
                <textarea 
                  placeholder="Digite sua mensagem..."
                  rows={4}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <Button variant="outline">Cancelar</Button>
            <Button className="btn-primary-modern">Salvar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Showcase de Navegação
function NavigationShowcase() {
  const [activeItem, setActiveItem] = useState('dashboard');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'quotes', label: 'Cotações', icon: ShoppingCart },
    { id: 'partners', label: 'Parceiros', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: TrendingDown },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Navegação Sidebar</CardTitle>
          <CardDescription>Exemplo de sidebar com o sistema de cores aplicado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-primary-900 rounded-lg p-4 w-64">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-accent-cyan">Pre-Sales Ally</h2>
            </div>
            
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item.id)}
                    className={`
                      w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'sidebar-nav-item-active' 
                        : 'sidebar-nav-item text-primary-300 hover:bg-primary-800/60 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-accent-cyan' : 'sidebar-icon-primary hover:text-accent-cyan'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Header de Navegação</CardTitle>
          <CardDescription>Exemplo de header com busca e perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="header-bg rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-md">
                <Input 
                  type="search"
                  placeholder="Buscar..."
                  className="header-search"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Button size="sm" variant="ghost" className="text-foreground hover:text-accent-cyan">
                  <Eye className="w-4 h-4" />
                </Button>
                
                <div className="header-profile-btn flex items-center px-3 py-2 rounded-lg">
                  <div className="w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold text-primary-900">JS</span>
                  </div>
                  <span className="text-foreground text-sm">João Silva</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Guia de Uso
function UsageGuideShowcase() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = [
    {
      id: 'primary-button',
      title: 'Botão Primário (Ação)',
      description: 'Use accent-orange para ações principais e CTAs',
      code: `<button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-orange/20">
  Ação Principal
</button>`,
      preview: (
        <button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-orange/20">
          Ação Principal
        </button>
      )
    },
    {
      id: 'info-button',
      title: 'Botão Informativo',
      description: 'Use accent-cyan para ações informativas e links',
      code: `<button className="bg-accent-cyan hover:bg-accent-cyan/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-cyan/20">
  Ver Detalhes
</button>`,
      preview: (
        <button className="bg-accent-cyan hover:bg-accent-cyan/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-cyan/20">
          Ver Detalhes
        </button>
      )
    },
    {
      id: 'revenue-card',
      title: 'Card de Receita',
      description: 'Use chart-revenue (ciano) para dados de receita',
      code: `<div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Receita Total</p>
      <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
    </div>
    <div className="p-3 bg-chart-revenue/10 rounded-full">
      <TrendingUpIcon className="w-6 h-6 text-chart-revenue" />
    </div>
  </div>
</div>`,
      preview: (
        <div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
            </div>
            <div className="p-3 bg-chart-revenue/10 rounded-full">
              <TrendingUp className="w-6 h-6 text-chart-revenue" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'success-badge',
      title: 'Badge de Sucesso',
      description: 'Use accent-green para status positivos',
      code: `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20">
  <CheckCircle className="w-3 h-3 mr-1" />
  Aprovado
</span>`,
      preview: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprovado
        </span>
      )
    },
    {
      id: 'warning-badge',
      title: 'Badge de Aviso',
      description: 'Use accent-yellow para avisos e notificações',
      code: `<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
  <AlertTriangle className="w-3 h-3 mr-1" />
  Pendente
</span>`,
      preview: (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Pendente
        </span>
      )
    },
    {
      id: 'input-focus',
      title: 'Input com Foco',
      description: 'Use accent-cyan para estados de foco em formulários',
      code: `<input 
  type="text"
  placeholder="Digite aqui..."
  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
/>`,
      preview: (
        <input 
          type="text"
          placeholder="Digite aqui..."
          className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
        />
      )
    }
  ];

  const contrastExamples = [
    {
      background: 'bg-primary-900',
      backgroundLabel: 'primary-900',
      textOptions: [
        { class: 'text-white', label: 'white', contrast: '12.6:1', status: 'excellent' },
        { class: 'text-primary-300', label: 'primary-300', contrast: '4.8:1', status: 'good' },
        { class: 'text-accent-cyan', label: 'accent-cyan', contrast: '8.2:1', status: 'excellent' },
        { class: 'text-accent-orange', label: 'accent-orange', contrast: '6.1:1', status: 'excellent' },
      ]
    },
    {
      background: 'bg-primary-100',
      backgroundLabel: 'primary-100',
      textOptions: [
        { class: 'text-primary-900', label: 'primary-900', contrast: '11.4:1', status: 'excellent' },
        { class: 'text-primary-800', label: 'primary-800', contrast: '8.7:1', status: 'excellent' },
        { class: 'text-primary-700', label: 'primary-700', contrast: '5.2:1', status: 'good' },
        { class: 'text-primary-600', label: 'primary-600', contrast: '3.8:1', status: 'poor' },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Exemplos de Código */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Código</CardTitle>
          <CardDescription>
            Padrões recomendados com código copiável
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {codeExamples.map((example) => (
            <div key={example.id} className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-1">{example.title}</h4>
                <p className="text-sm text-muted-foreground">{example.description}</p>
              </div>
              
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <div className="mb-4">
                  <span className="text-xs text-muted-foreground mb-2 block">Preview:</span>
                  <div className="flex items-center justify-center p-4 bg-background rounded border border-border">
                    {example.preview}
                  </div>
                </div>
                
                <div className="relative">
                  <span className="text-xs text-muted-foreground mb-2 block">Código:</span>
                  <pre className="bg-primary-900 text-primary-300 p-4 rounded text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(example.code, example.id)}
                    className="absolute top-6 right-2 p-2 bg-primary-800 hover:bg-primary-700 rounded text-primary-300 hover:text-white transition-colors"
                    title="Copiar código"
                  >
                    {copiedCode === example.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Palette className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabela de Contraste */}
      <Card>
        <CardHeader>
          <CardTitle>Verificação de Contraste</CardTitle>
          <CardDescription>
            Combinações testadas e aprovadas para acessibilidade WCAG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {contrastExamples.map((example, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-semibold text-foreground">
                  Texto sobre fundo {example.backgroundLabel}
                </h4>
                <div className={`${example.background} rounded-lg p-6 space-y-3`}>
                  {example.textOptions.map((textOption, textIndex) => (
                    <div key={textIndex} className="flex items-center justify-between">
                      <span className={`${textOption.class} font-medium`}>
                        Exemplo de texto com {textOption.label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/70">
                          {textOption.contrast}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          textOption.status === 'excellent' 
                            ? 'bg-accent-green/20 text-accent-green' 
                            : textOption.status === 'good'
                            ? 'bg-accent-yellow/20 text-accent-yellow'
                            : 'bg-destructive/20 text-destructive'
                        }`}>
                          {textOption.status === 'excellent' ? 'AAA' : textOption.status === 'good' ? 'AA' : 'Falha'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guia de Decisão */}
      <Card>
        <CardHeader>
          <CardTitle>Guia de Decisão Rápida</CardTitle>
          <CardDescription>
            Quando usar cada cor do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Cores de Ação</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--accent-orange))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Orange</p>
                    <p className="text-xs text-muted-foreground">Botões primários, CTAs, ações urgentes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--accent-cyan))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cyan</p>
                    <p className="text-xs text-muted-foreground">Links, informações, ações secundárias</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--accent-green))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Green</p>
                    <p className="text-xs text-muted-foreground">Confirmações, sucesso, dados positivos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Cores de Dados</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-revenue))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Revenue</p>
                    <p className="text-xs text-muted-foreground">Receitas, vendas, entrada de dinheiro</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-cost))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Cost</p>
                    <p className="text-xs text-muted-foreground">Custos, despesas, saída de dinheiro</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-profit))' }}></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Profit</p>
                    <p className="text-xs text-muted-foreground">Lucros, margens, resultados positivos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Links para Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação Completa</CardTitle>
          <CardDescription>
            Links para guias detalhados e recursos adicionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/docs/color-system.md" 
              className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h5 className="font-medium text-foreground mb-2">Sistema de Cores</h5>
              <p className="text-sm text-muted-foreground">Documentação completa do sistema</p>
            </a>
            <a 
              href="/docs/color-system-developer-guide.md" 
              className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h5 className="font-medium text-foreground mb-2">Guia do Desenvolvedor</h5>
              <p className="text-sm text-muted-foreground">Instruções práticas e exemplos</p>
            </a>
            <a 
              href="/docs/color-usage-reference.md" 
              className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <h5 className="font-medium text-foreground mb-2">Referência Rápida</h5>
              <p className="text-sm text-muted-foreground">Guia de consulta rápida</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ColorSystemShowcase;