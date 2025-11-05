# Guia do Desenvolvedor - Sistema de Cores

## Introdução

Este guia fornece instruções práticas e detalhadas para desenvolvedores sobre como implementar e usar corretamente o sistema de cores do Pre-Sales Ally. Inclui exemplos de código, padrões recomendados, troubleshooting e melhores práticas.

## Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Uso das Cores](#uso-das-cores)
3. [Padrões de Implementação](#padrões-de-implementação)
4. [Componentes Específicos](#componentes-específicos)
5. [Temas e Acessibilidade](#temas-e-acessibilidade)
6. [Troubleshooting](#troubleshooting)
7. [Checklist de Desenvolvimento](#checklist-de-desenvolvimento)

## Configuração Inicial

### Importação das Variáveis CSS

As cores estão definidas no arquivo `src/app/globals.css` como CSS Custom Properties:

```css
:root {
  /* Cores Primárias */
  --primary-50: 220 25% 95%;
  --primary-100: 220 25% 90%;
  --primary-200: 220 25% 80%;
  --primary-300: 220 25% 70%;
  --primary-400: 220 25% 60%;
  --primary-500: 220 25% 50%;
  --primary-600: 220 30% 40%;
  --primary-700: 220 35% 30%;
  --primary-800: 220 40% 20%;
  --primary-900: 220 45% 15%;

  /* Cores de Destaque */
  --accent-cyan: 195 100% 50%;
  --accent-orange: 20 100% 60%;
  --accent-yellow: 45 100% 60%;
  --accent-green: 150 80% 45%;
  --accent-purple: 270 70% 60%;

  /* Cores para Gráficos */
  --chart-revenue: var(--accent-cyan);
  --chart-cost: var(--accent-orange);
  --chart-profit: var(--accent-green);
  --chart-tax: 0 84% 60%;
  --chart-commission: var(--accent-yellow);
}
```

### Integração com Tailwind CSS

As cores estão configuradas no `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          // ... outras escalas
          900: 'hsl(var(--primary-900))',
        },
        accent: {
          cyan: 'hsl(var(--accent-cyan))',
          orange: 'hsl(var(--accent-orange))',
          yellow: 'hsl(var(--accent-yellow))',
          green: 'hsl(var(--accent-green))',
          purple: 'hsl(var(--accent-purple))',
        },
        chart: {
          revenue: 'hsl(var(--chart-revenue))',
          cost: 'hsl(var(--chart-cost))',
          profit: 'hsl(var(--chart-profit))',
          tax: 'hsl(var(--chart-tax))',
          commission: 'hsl(var(--chart-commission))',
        }
      }
    }
  }
}
```

## Uso das Cores

### Hierarquia de Cores

#### 1. Cores Primárias (Escala de Azul)

**Quando usar cada tom:**

```tsx
// primary-50, primary-100: Backgrounds muito claros (modo claro)
<div className="bg-primary-50 text-primary-900">
  Conteúdo em background claro
</div>

// primary-200, primary-300: Borders suaves, texto secundário
<div className="border border-primary-200">
  <p className="text-primary-300">Texto secundário</p>
</div>

// primary-400, primary-500: Elementos neutros, texto muted
<p className="text-primary-400">Texto com menos destaque</p>

// primary-600: Texto principal em modo claro
<h1 className="text-primary-600">Título principal (modo claro)</h1>

// primary-700: Borders escuras, divisores
<hr className="border-primary-700" />

// primary-800: Cards e containers escuros
<div className="bg-primary-800 text-white">
  Card escuro
</div>

// primary-900: Background principal (sidebar, modo escuro)
<aside className="bg-primary-900 text-primary-300">
  Sidebar principal
</aside>
```

#### 2. Cores de Destaque

**accent-cyan (Cor primária do sistema):**
```tsx
// Use para: Links, elementos informativos, cor primária
<a href="#" className="text-accent-cyan hover:text-accent-cyan/80">
  Link principal
</a>

<button className="bg-accent-cyan text-white hover:bg-accent-cyan/90">
  Botão informativo
</button>

// Indicadores ativos
<div className="border-l-4 border-accent-cyan bg-accent-cyan/10">
  Item ativo
</div>
```

**accent-orange (Cor de ação):**
```tsx
// Use para: Botões primários, CTAs, elementos de ação
<button className="bg-accent-orange text-white hover:bg-accent-orange/90">
  Ação Principal
</button>

// Alertas de ação necessária
<div className="bg-accent-orange/10 border border-accent-orange text-accent-orange">
  Ação necessária
</div>
```

**accent-yellow (Avisos):**
```tsx
// Use para: Avisos, notificações, dados neutros
<div className="bg-accent-yellow/10 border border-accent-yellow text-accent-yellow">
  <AlertTriangle className="w-4 h-4" />
  Aviso importante
</div>
```

**accent-green (Sucesso):**
```tsx
// Use para: Status positivo, confirmações, dados de sucesso
<div className="bg-accent-green/10 border border-accent-green text-accent-green">
  <CheckCircle className="w-4 h-4" />
  Operação bem-sucedida
</div>
```

**accent-purple (Elementos especiais):**
```tsx
// Use para: Elementos únicos, dados especiais, features premium
<div className="bg-accent-purple/10 border border-accent-purple text-accent-purple">
  Feature especial
</div>
```

#### 3. Cores para Gráficos

```tsx
// Receita (chart-revenue = accent-cyan)
<div className="text-chart-revenue bg-chart-revenue/10">
  Receita: R$ 125.000
</div>

// Custos (chart-cost = accent-orange)  
<div className="text-chart-cost bg-chart-cost/10">
  Custos: R$ 85.000
</div>

// Lucro (chart-profit = accent-green)
<div className="text-chart-profit bg-chart-profit/10">
  Lucro: R$ 40.000
</div>

// Impostos (chart-tax = vermelho)
<div className="text-chart-tax bg-chart-tax/10">
  Impostos: R$ 15.000
</div>

// Comissões (chart-commission = accent-yellow)
<div className="text-chart-commission bg-chart-commission/10">
  Comissões: R$ 12.500
</div>
```

## Padrões de Implementação

### Botões

#### Botão Primário (Ação Principal)
```tsx
// Padrão recomendado
<button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-orange/20">
  Ação Principal
</button>

// Com classe utilitária (se disponível)
<button className="btn-primary-modern">
  Ação Principal
</button>
```

#### Botão Secundário (Informativo)
```tsx
<button className="bg-accent-cyan hover:bg-accent-cyan/90 text-white px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-accent-cyan/20">
  Ação Secundária
</button>
```

#### Botão de Perigo
```tsx
<button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-destructive/20">
  Excluir
</button>
```

#### Botão Outline
```tsx
<button className="border border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-white px-4 py-2 rounded-lg transition-colors">
  Botão Outline
</button>
```

### Cards e Containers

#### Card Padrão
```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  <h3 className="text-foreground font-semibold mb-2">Título</h3>
  <p className="text-muted-foreground">Conteúdo do card</p>
</div>
```

#### Card com Efeito de Vidro
```tsx
<div className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all duration-300">
  <h3 className="text-foreground font-semibold mb-2">Card Moderno</h3>
  <p className="text-muted-foreground">Com efeito de vidro</p>
</div>
```

#### Card de Estatística
```tsx
// Card de receita
<div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Receita Total</p>
      <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
    </div>
    <div className="p-3 bg-chart-revenue/10 rounded-full">
      <TrendingUpIcon className="w-6 h-6 text-chart-revenue" />
    </div>
  </div>
</div>

// Card de custos
<div className="bg-card border-l-4 border-chart-cost rounded-lg p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Custos Totais</p>
      <p className="text-2xl font-bold text-chart-cost">R$ 85.000</p>
    </div>
    <div className="p-3 bg-chart-cost/10 rounded-full">
      <TrendingDownIcon className="w-6 h-6 text-chart-cost" />
    </div>
  </div>
</div>
```

### Formulários

#### Input Padrão
```tsx
<input 
  type="text"
  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
  placeholder="Digite aqui..."
/>
```

#### Estados de Validação
```tsx
// Sucesso
<input 
  className="w-full px-3 py-2 bg-input border border-accent-green rounded-lg text-foreground focus:border-accent-green focus:ring-2 focus:ring-accent-green/20"
/>

// Erro
<input 
  className="w-full px-3 py-2 bg-input border border-destructive rounded-lg text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20"
/>

// Aviso
<input 
  className="w-full px-3 py-2 bg-input border border-accent-yellow rounded-lg text-foreground focus:border-accent-yellow focus:ring-2 focus:ring-accent-yellow/20"
/>
```

### Navegação

#### Sidebar
```tsx
<aside className="bg-primary-900 w-64 h-screen p-4">
  {/* Logo */}
  <div className="mb-8">
    <h1 className="text-xl font-bold text-accent-cyan">Pre-Sales Ally</h1>
  </div>
  
  {/* Navegação */}
  <nav className="space-y-2">
    {/* Item ativo */}
    <a 
      href="/dashboard" 
      className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-orange/10 text-accent-cyan border-r-3 border-accent-cyan"
    >
      <DashboardIcon className="w-5 h-5 mr-3 text-accent-cyan" />
      Dashboard
    </a>
    
    {/* Item normal */}
    <a 
      href="/quotes" 
      className="flex items-center px-3 py-2 rounded-lg text-primary-300 hover:bg-primary-800/60 hover:text-white transition-colors"
    >
      <QuoteIcon className="w-5 h-5 mr-3 text-primary-400 hover:text-accent-cyan transition-colors" />
      Cotações
    </a>
  </nav>
</aside>
```

#### Header
```tsx
<header className="bg-gradient-to-r from-primary-800 to-primary-700 h-16 px-6 flex items-center justify-between">
  {/* Busca */}
  <div className="flex-1 max-w-md">
    <input 
      type="search"
      placeholder="Buscar..."
      className="w-full px-4 py-2 bg-primary-700/50 border border-primary-600 rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20"
    />
  </div>
  
  {/* Perfil */}
  <button className="flex items-center px-3 py-2 rounded-lg hover:bg-primary-700/50 transition-colors">
    <div className="w-8 h-8 bg-accent-cyan rounded-full flex items-center justify-center mr-2">
      <span className="text-xs font-semibold text-primary-900">JS</span>
    </div>
    <span className="text-foreground">João Silva</span>
  </button>
</header>
```

### Badges e Status

#### Badges de Status
```tsx
// Sucesso
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20">
  <CheckCircle className="w-3 h-3 mr-1" />
  Aprovado
</span>

// Aviso
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
  <AlertTriangle className="w-3 h-3 mr-1" />
  Pendente
</span>

// Erro
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
  <AlertCircle className="w-3 h-3 mr-1" />
  Rejeitado
</span>

// Informação
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
  <Info className="w-3 h-3 mr-1" />
  Em Análise
</span>
```

## Componentes Específicos

### Gráficos com Chart.js/Recharts

#### Configuração de Cores
```typescript
// Para Chart.js
const chartColors = {
  revenue: 'hsl(var(--chart-revenue))',
  cost: 'hsl(var(--chart-cost))',
  profit: 'hsl(var(--chart-profit))',
  tax: 'hsl(var(--chart-tax))',
  commission: 'hsl(var(--chart-commission))',
};

// Para Recharts
const CHART_COLORS = {
  revenue: '#00D4FF',
  cost: '#FF6B35', 
  profit: '#00B366',
  tax: '#FF4757',
  commission: '#FFB800',
};
```

#### Exemplo de Gráfico de Barras
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', revenue: 12000, cost: 8000 },
  { month: 'Feb', revenue: 15000, cost: 9000 },
  // ... mais dados
];

<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
    <YAxis stroke="hsl(var(--muted-foreground))" />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        color: 'hsl(var(--foreground))'
      }}
    />
    <Bar dataKey="revenue" fill="hsl(var(--chart-revenue))" />
    <Bar dataKey="cost" fill="hsl(var(--chart-cost))" />
  </BarChart>
</ResponsiveContainer>
```

### Modais e Dialogs

```tsx
<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
  <div className="glass-effect max-w-md w-full mx-4 rounded-xl p-6 border border-border">
    <h2 className="text-xl font-semibold text-foreground mb-4">Confirmar Ação</h2>
    <p className="text-muted-foreground mb-6">
      Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
    </p>
    
    <div className="flex justify-end space-x-3">
      <button className="px-4 py-2 border border-border text-foreground hover:bg-muted rounded-lg transition-colors">
        Cancelar
      </button>
      <button className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors">
        Excluir
      </button>
    </div>
  </div>
</div>
```

## Temas e Acessibilidade

### Suporte a Múltiplos Temas

#### Hook para Gerenciamento de Tema
```tsx
import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    }
  }, []);

  const toggleTheme = () => {
    const themes: Theme[] = ['dark', 'light', 'high-contrast'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    document.documentElement.className = nextTheme;
    localStorage.setItem('theme', nextTheme);
  };

  return { theme, toggleTheme };
};
```

#### Componente de Alternância de Tema
```tsx
import { Moon, Sun, Contrast } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'high-contrast': return <Contrast className="w-4 h-4" />;
      default: return <Moon className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Claro';
      case 'high-contrast': return 'Alto Contraste';
      default: return 'Escuro';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
      aria-label={`Alternar tema. Tema atual: ${getThemeLabel()}`}
    >
      {getThemeIcon()}
      <span className="text-sm">{getThemeLabel()}</span>
    </button>
  );
}
```

### Verificação de Contraste

#### Função para Calcular Contraste
```typescript
// Função utilitária para calcular contraste WCAG
export function calculateContrast(color1: string, color2: string): number {
  // Converte HSL para RGB
  const hslToRgb = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  };

  // Calcula luminância relativa
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // Parse das cores HSL
  const parseHSL = (hsl: string) => {
    const match = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (!match) return [0, 0, 0];
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
  };

  const [h1, s1, l1] = parseHSL(color1);
  const [h2, s2, l2] = parseHSL(color2);

  const [r1, g1, b1] = hslToRgb(h1, s1, l1);
  const [r2, g2, b2] = hslToRgb(h2, s2, l2);

  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

// Função para verificar se o contraste é adequado
export function isContrastAdequate(
  color1: string, 
  color2: string, 
  level: 'AA' | 'AAA' = 'AA',
  size: 'normal' | 'large' = 'normal'
): boolean {
  const contrast = calculateContrast(color1, color2);
  
  if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7;
  } else {
    return size === 'large' ? contrast >= 3 : contrast >= 4.5;
  }
}
```

#### Componente de Verificação de Contraste
```tsx
export function ContrastChecker({ 
  foreground, 
  background, 
  children 
}: { 
  foreground: string; 
  background: string; 
  children: React.ReactNode; 
}) {
  const contrast = calculateContrast(foreground, background);
  const isAdequate = isContrastAdequate(foreground, background);

  return (
    <div className="relative">
      {children}
      {!isAdequate && (
        <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
          Contraste: {contrast.toFixed(1)}:1
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Problemas Comuns

#### 1. Cores não aparecem corretamente
```tsx
// ❌ Problema: Usar cores hardcoded
<div style={{ backgroundColor: '#1A2332' }}>

// ✅ Solução: Usar variáveis CSS
<div className="bg-primary-900">

// ❌ Problema: Sintaxe incorreta da variável CSS
<div style={{ backgroundColor: 'var(--primary-900)' }}>

// ✅ Solução: Usar função hsl()
<div style={{ backgroundColor: 'hsl(var(--primary-900))' }}>
```

#### 2. Contraste insuficiente
```tsx
// ❌ Problema: Combinação com baixo contraste
<p className="text-primary-500 bg-primary-600">Texto difícil de ler</p>

// ✅ Solução: Usar combinações testadas
<p className="text-primary-300 bg-primary-900">Texto legível</p>
```

#### 3. Inconsistência entre temas
```tsx
// ❌ Problema: Cores específicas para um tema
<div className="bg-white text-black">

// ✅ Solução: Usar variáveis semânticas
<div className="bg-background text-foreground">
```

#### 4. Performance com CSS Custom Properties
```tsx
// ❌ Problema: Muitas variáveis inline
<div style={{ 
  backgroundColor: 'hsl(var(--primary-900))',
  borderColor: 'hsl(var(--primary-700))',
  color: 'hsl(var(--primary-300))'
}}>

// ✅ Solução: Usar classes Tailwind
<div className="bg-primary-900 border-primary-700 text-primary-300">
```

### Debugging

#### Verificar Variáveis CSS no DevTools
```javascript
// No console do navegador
getComputedStyle(document.documentElement).getPropertyValue('--primary-900')

// Listar todas as variáveis CSS
Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.type === 1)
  .flatMap(rule => Array.from(rule.style))
  .filter(prop => prop.startsWith('--'))
```

#### Testar Contraste Programaticamente
```javascript
// Função para testar contraste no console
function testContrast(color1, color2) {
  const contrast = calculateContrast(color1, color2);
  console.log(`Contraste: ${contrast.toFixed(2)}:1`);
  console.log(`WCAG AA: ${contrast >= 4.5 ? '✅' : '❌'}`);
  console.log(`WCAG AAA: ${contrast >= 7 ? '✅' : '❌'}`);
}

// Exemplo de uso
testContrast('220 45% 15%', '195 100% 50%');
```

## Checklist de Desenvolvimento

### Antes de Implementar
- [ ] Verificar se a cor existe no sistema de cores
- [ ] Confirmar o propósito da cor (primária, destaque, gráfico)
- [ ] Calcular contraste com cores adjacentes
- [ ] Considerar todos os temas (escuro, claro, alto contraste)
- [ ] Verificar acessibilidade para daltonismo

### Durante o Desenvolvimento
- [ ] Usar classes Tailwind quando disponível
- [ ] Implementar estados hover/focus apropriados
- [ ] Adicionar transições suaves (transition-colors)
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Documentar componentes customizados

### Após Implementação
- [ ] Executar testes de regressão visual
- [ ] Validar com ferramentas de acessibilidade (axe, WAVE)
- [ ] Testar com leitores de tela
- [ ] Verificar performance (Lighthouse)
- [ ] Coletar feedback de usuários
- [ ] Atualizar documentação se necessário

### Testes Automatizados

#### Teste de Contraste
```typescript
// tests/accessibility/contrast.test.ts
import { calculateContrast, isContrastAdequate } from '@/lib/utils/accessibility';

describe('Color Contrast', () => {
  test('primary colors have adequate contrast', () => {
    expect(isContrastAdequate('220 45% 15%', '220 25% 70%')).toBe(true);
    expect(isContrastAdequate('195 100% 50%', '220 45% 15%')).toBe(true);
  });

  test('accent colors have adequate contrast on dark backgrounds', () => {
    expect(isContrastAdequate('20 100% 60%', '220 45% 15%')).toBe(true);
    expect(isContrastAdequate('195 100% 50%', '220 45% 15%')).toBe(true);
  });
});
```

#### Teste Visual
```typescript
// tests/visual/colors.spec.ts
import { test, expect } from '@playwright/test';

test('color system consistency', async ({ page }) => {
  await page.goto('/color-system');
  
  // Testar tema escuro
  await expect(page).toHaveScreenshot('color-system-dark.png');
  
  // Alternar para tema claro
  await page.click('[data-testid="theme-toggle"]');
  await expect(page).toHaveScreenshot('color-system-light.png');
  
  // Alternar para alto contraste
  await page.click('[data-testid="theme-toggle"]');
  await expect(page).toHaveScreenshot('color-system-high-contrast.png');
});
```

## Recursos Adicionais

### Ferramentas Recomendadas

#### Extensões VS Code
- **Tailwind CSS IntelliSense**: Autocomplete para classes Tailwind
- **Color Highlight**: Visualiza cores diretamente no código
- **axe Accessibility Linter**: Verifica problemas de acessibilidade
- **CSS Peek**: Navega para definições CSS

#### Ferramentas Online
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Coolors.co**: Gerador e explorador de paletas
- **Accessible Colors**: https://accessible-colors.com/
- **Color Oracle**: Simulador de daltonismo

#### Comandos CLI Úteis
```bash
# Verificar uso de cores no projeto
grep -r "bg-\|text-\|border-" src/ --include="*.tsx" --include="*.jsx"

# Encontrar cores hardcoded
grep -r "#[0-9a-fA-F]\{6\}" src/ --include="*.tsx" --include="*.jsx"

# Executar testes de acessibilidade
npm run test:a11y

# Executar testes visuais
npm run test:visual

# Gerar relatório de performance
npm run test:performance
```

### Links Úteis

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Color Theory for Developers](https://www.smashingmagazine.com/2010/01/color-theory-for-designers-part-1-the-meaning-of-color/)

---

**Versão**: 1.0  
**Última atualização**: Dezembro 2024  
**Responsável**: Equipe de Design System  
**Próxima revisão**: Março 2025