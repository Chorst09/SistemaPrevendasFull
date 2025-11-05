# Sistema de Cores - Pre-Sales Ally

## Visão Geral

O sistema de cores do Pre-Sales Ally foi projetado para criar uma experiência visual moderna, profissional e acessível. Baseado em tons de azul escuro como cor primária, com acentos em laranja vibrante e ciano, o sistema oferece suporte completo para modo claro, escuro e alto contraste.

## Paleta de Cores Principal

### Cores Primárias (Espectro Azul)

As cores primárias formam a base visual da aplicação, criando uma atmosfera profissional e confiável:

```css
/* Tons de azul escuro - do mais claro ao mais escuro */
--primary-50: 220 25% 95%;   /* #F1F3F6 - Backgrounds muito claros */
--primary-100: 220 25% 90%;  /* #E3E7ED - Backgrounds claros */
--primary-200: 220 25% 80%;  /* #C7CFD9 - Borders suaves */
--primary-300: 220 25% 70%;  /* #ABB7C5 - Text secundário */
--primary-400: 220 25% 60%;  /* #8F9FB1 - Text muted */
--primary-500: 220 25% 50%;  /* #73879D - Elementos neutros */
--primary-600: 220 30% 40%;  /* #5A6F89 - Text principal (modo claro) */
--primary-700: 220 35% 30%;  /* #435775 - Borders escuras */
--primary-800: 220 40% 20%;  /* #2D3F61 - Cards escuros */
--primary-900: 220 45% 15%;  /* #1A2332 - Background principal (modo escuro) */
```

**Uso recomendado:**
- `primary-900`: Background principal da sidebar e elementos de navegação
- `primary-800`: Background de cards e containers principais
- `primary-700`: Borders e divisores
- `primary-600`: Texto secundário
- `primary-300`: Texto em elementos escuros (boa legibilidade)

### Cores de Destaque (Accent Colors)

As cores de destaque são usadas para criar hierarquia visual e chamar atenção para elementos importantes:

```css
--accent-cyan: 195 100% 50%;     /* #00D4FF - Elementos informativos */
--accent-orange: 20 100% 60%;    /* #FF6B35 - Botões de ação */
--accent-yellow: 45 100% 60%;    /* #FFB800 - Avisos e destaques */
--accent-green: 150 80% 45%;     /* #00B366 - Status positivo */
--accent-purple: 270 70% 60%;    /* #8B5CF6 - Elementos especiais */
```

**Uso recomendado:**
- `accent-cyan`: Links, elementos informativos, cor primária do sistema
- `accent-orange`: Botões primários, CTAs, elementos de ação
- `accent-yellow`: Avisos, notificações, dados neutros
- `accent-green`: Status de sucesso, dados positivos, confirmações
- `accent-purple`: Elementos especiais, dados únicos

## Cores Semânticas

### Estados do Sistema

```css
--success: var(--accent-green);    /* #00B366 - Sucesso */
--warning: var(--accent-yellow);   /* #FFB800 - Aviso */
--error: 0 84% 60%;               /* #FF4757 - Erro */
--info: var(--accent-cyan);       /* #00D4FF - Informação */
```

### Cores para Gráficos e Visualizações

O sistema inclui uma paleta específica para gráficos que mantém consistência visual:

```css
/* Cores gerais para gráficos */
--chart-1: 195 100% 50%;  /* #00D4FF - Ciano (dados primários) */
--chart-2: 20 100% 60%;   /* #FF6B35 - Laranja (dados secundários) */
--chart-3: 150 80% 45%;   /* #00B366 - Verde (dados positivos) */
--chart-4: 45 100% 60%;   /* #FFB800 - Amarelo (dados neutros) */
--chart-5: 270 70% 60%;   /* #8B5CF6 - Roxo (dados especiais) */

/* Cores específicas por tipo de dado */
--chart-revenue: var(--chart-1);    /* Receita - Ciano */
--chart-cost: var(--chart-2);       /* Custos - Laranja */
--chart-profit: var(--chart-3);     /* Lucro - Verde */
--chart-tax: var(--error);          /* Impostos - Vermelho */
--chart-commission: var(--chart-4); /* Comissões - Amarelo */
```

## Modos de Tema

### Modo Escuro (Padrão)

O modo escuro é o tema principal da aplicação, otimizado para uso prolongado:

```css
.dark {
  --background: 220 45% 15%;      /* #1A2332 - Fundo principal */
  --foreground: 220 15% 95%;      /* #F1F3F6 - Texto principal */
  --card: 220 40% 18%;            /* #2D3F61 - Cards */
  --primary: 195 100% 50%;        /* #00D4FF - Cor primária */
  --accent: 20 100% 60%;          /* #FF6B35 - Cor de destaque */
}
```

### Modo Claro

Alternativa para usuários que preferem interfaces claras:

```css
.light {
  --background: 220 25% 98%;      /* #F8F9FB - Fundo claro */
  --foreground: 220 45% 15%;      /* #1A2332 - Texto escuro */
  --card: 220 25% 95%;            /* #F1F3F6 - Cards claros */
  --primary: 195 100% 45%;        /* #0099CC - Ciano mais escuro */
  --accent: 20 100% 55%;          /* #E55A2B - Laranja mais escuro */
}
```

### Modo Alto Contraste

Para máxima acessibilidade (WCAG AAA):

```css
.high-contrast {
  --background: 0 0% 0%;          /* #000000 - Preto puro */
  --foreground: 0 0% 100%;        /* #FFFFFF - Branco puro */
  --primary: 60 100% 50%;         /* #FFFF00 - Amarelo brilhante */
  --accent: 120 100% 50%;         /* #00FF00 - Verde brilhante */
}
```

## Classes Utilitárias

### Efeitos Visuais

```css
/* Efeito de vidro moderno */
.glass-effect {
  background: hsl(var(--card) / 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid hsl(var(--border) / 0.5);
  box-shadow: 0 8px 32px hsl(var(--primary) / 0.1);
}

/* Gradientes */
.gradient-primary {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-cyan)));
}

.gradient-accent {
  background: linear-gradient(135deg, hsl(var(--accent-orange)), hsl(var(--accent-yellow)));
}

/* Efeitos de brilho tecnológico */
.tech-glow {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2);
}

.tech-glow-orange {
  box-shadow: 0 0 20px hsl(var(--accent-orange) / 0.4), 0 0 40px hsl(var(--accent-orange) / 0.2);
}
```

### Componentes Específicos

```css
/* Botões modernos */
.btn-primary-modern {
  background: linear-gradient(135deg, hsl(var(--accent-orange)), hsl(var(--accent-yellow) / 0.9));
  color: hsl(var(--accent-foreground));
  transition: all 0.3s ease;
}

.btn-primary-modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px hsl(var(--accent-orange) / 0.4);
}

/* Cards modernos */
.card-modern {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 4px 20px hsl(var(--primary) / 0.1);
}
```

## Guia de Uso

### Hierarquia Visual

1. **Cor Primária (Ciano)**: Use para elementos mais importantes, links principais, indicadores de status ativo
2. **Cor de Destaque (Laranja)**: Use para botões de ação, CTAs, elementos que requerem interação
3. **Cores Primárias (Azul)**: Use para estrutura, backgrounds, texto, elementos de suporte
4. **Cores Semânticas**: Use apenas para seus propósitos específicos (sucesso, erro, aviso, info)

### Contraste e Acessibilidade

#### Combinações Recomendadas

**Texto sobre fundos escuros:**
- Texto branco (`--foreground`) sobre `primary-900` ✅ (Contraste: 12.6:1)
- Texto `primary-300` sobre `primary-900` ✅ (Contraste: 4.8:1)
- Texto `accent-cyan` sobre `primary-900` ✅ (Contraste: 8.2:1)

**Texto sobre fundos claros:**
- Texto `primary-900` sobre `primary-50` ✅ (Contraste: 11.4:1)
- Texto `primary-600` sobre `primary-100` ✅ (Contraste: 4.9:1)

#### Combinações a Evitar

- Texto `accent-orange` sobre `accent-yellow` ❌ (Contraste insuficiente)
- Texto `primary-500` sobre `primary-600` ❌ (Contraste insuficiente)

### Aplicação em Componentes

#### Navegação e Layout
```css
/* Sidebar */
.sidebar {
  background: hsl(var(--primary-900));
  color: hsl(var(--primary-300));
}

.sidebar-item:hover {
  background: hsl(var(--primary-800) / 0.6);
  color: white;
}

.sidebar-item.active {
  background: linear-gradient(135deg, hsl(var(--accent-cyan) / 0.2), hsl(var(--accent-orange) / 0.1));
  color: hsl(var(--accent-cyan));
  border-right: 3px solid hsl(var(--accent-cyan));
}

/* Header */
.header {
  background: linear-gradient(135deg, hsl(var(--primary-800)), hsl(var(--primary-700)));
}
```

#### Formulários
```css
/* Input padrão */
.input {
  background: hsl(var(--input));
  border: 1px solid hsl(var(--border));
  color: hsl(var(--foreground));
}

.input:focus {
  border-color: hsl(var(--accent-cyan));
  box-shadow: 0 0 0 3px hsl(var(--accent-cyan) / 0.2);
}

/* Estados de validação */
.input.success {
  border-color: hsl(var(--success));
}

.input.error {
  border-color: hsl(var(--error));
}
```

#### Gráficos e Dashboards
```css
/* Cards de estatísticas */
.stat-card {
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

.stat-card.revenue {
  border-left: 4px solid hsl(var(--chart-revenue));
}

.stat-card.cost {
  border-left: 4px solid hsl(var(--chart-cost));
}

.stat-card.profit {
  border-left: 4px solid hsl(var(--chart-profit));
}
```

## Implementação Técnica

### CSS Custom Properties

O sistema utiliza CSS Custom Properties para máxima flexibilidade:

```css
:root {
  /* Definição das cores base */
  --primary-900: 220 45% 15%;
  --accent-cyan: 195 100% 50%;
  /* ... outras cores */
}

/* Uso nas classes */
.my-component {
  background: hsl(var(--primary-900));
  color: hsl(var(--accent-cyan));
}
```

### Integração com Tailwind CSS

As cores estão totalmente integradas ao Tailwind:

```html
<!-- Classes Tailwind disponíveis -->
<div class="bg-primary-900 text-accent-cyan">
  <button class="bg-accent-orange hover:bg-accent-yellow">
    Botão de Ação
  </button>
</div>

<!-- Classes de gráfico -->
<div class="text-chart-1 bg-chart-revenue/20">
  Receita: R$ 10.000
</div>
```

### TypeScript Support

Para projetos TypeScript, as cores podem ser tipadas:

```typescript
type ColorScale = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type AccentColor = 'cyan' | 'orange' | 'yellow' | 'green' | 'purple';
type ChartColor = 1 | 2 | 3 | 4 | 5 | 6;

interface ColorSystem {
  primary: Record<ColorScale, string>;
  accent: Record<AccentColor, string>;
  chart: Record<ChartColor, string>;
}
```

## Testes e Validação

### Verificação de Contraste

Use ferramentas como WebAIM Contrast Checker ou implemente verificação automática:

```javascript
// Função para calcular contraste
function getContrastRatio(color1, color2) {
  // Implementação do cálculo WCAG
  // Retorna valor entre 1 e 21
}

// Verificação automática
const contrastRatio = getContrastRatio('#00D4FF', '#1A2332');
console.log(contrastRatio >= 4.5 ? 'Aprovado' : 'Reprovado');
```

### Testes Visuais

Implemente testes de regressão visual para garantir consistência:

```javascript
// Exemplo com Playwright
test('color system consistency', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard-colors.png');
});
```

## Migração e Compatibilidade

### Fallbacks para Navegadores Antigos

```css
/* Fallback para navegadores sem suporte a CSS Custom Properties */
.my-component {
  background: #1A2332; /* Fallback estático */
  background: hsl(var(--primary-900)); /* Valor dinâmico */
}
```

### Feature Flags

Para migração gradual, use feature flags:

```javascript
const useNewColorSystem = process.env.NEXT_PUBLIC_NEW_COLORS === 'true';

const colorClass = useNewColorSystem 
  ? 'bg-primary-900 text-accent-cyan' 
  : 'bg-indigo-900 text-blue-400';
```

## Exemplos Práticos de Uso

### Componentes de Dashboard

#### Cards de Métricas Financeiras
```tsx
// Card de Receita - Usar chart-revenue (ciano)
<div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Receita Total</p>
      <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
      <p className="text-xs text-chart-revenue/70">+12% vs mês anterior</p>
    </div>
    <div className="p-3 bg-chart-revenue/10 rounded-full">
      <TrendingUpIcon className="w-6 h-6 text-chart-revenue" />
    </div>
  </div>
</div>

// Card de Custos - Usar chart-cost (laranja)
<div className="bg-card border-l-4 border-chart-cost rounded-lg p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Custos Operacionais</p>
      <p className="text-2xl font-bold text-chart-cost">R$ 85.000</p>
      <p className="text-xs text-chart-cost/70">+5% vs mês anterior</p>
    </div>
    <div className="p-3 bg-chart-cost/10 rounded-full">
      <TrendingDownIcon className="w-6 h-6 text-chart-cost" />
    </div>
  </div>
</div>

// Card de Lucro - Usar chart-profit (verde)
<div className="bg-card border-l-4 border-chart-profit rounded-lg p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-muted-foreground text-sm">Lucro Líquido</p>
      <p className="text-2xl font-bold text-chart-profit">R$ 40.000</p>
      <p className="text-xs text-chart-profit/70">+18% vs mês anterior</p>
    </div>
    <div className="p-3 bg-chart-profit/10 rounded-full">
      <DollarSignIcon className="w-6 h-6 text-chart-profit" />
    </div>
  </div>
</div>
```

#### Indicadores de Status de Propostas
```tsx
// Status Aprovado - Verde
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-chart-profit/10 text-chart-profit border border-chart-profit/20">
  <CheckCircleIcon className="w-4 h-4 mr-1" />
  Proposta Aprovada
</span>

// Status Pendente - Amarelo
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
  <ClockIcon className="w-4 h-4 mr-1" />
  Aguardando Análise
</span>

// Status Rejeitado - Vermelho
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
  <XCircleIcon className="w-4 h-4 mr-1" />
  Proposta Rejeitada
</span>

// Status Em Negociação - Ciano
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20">
  <MessageCircleIcon className="w-4 h-4 mr-1" />
  Em Negociação
</span>
```

### Formulários de Cotação

#### Estados de Validação
```tsx
// Campo válido - Verde sutil
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">Valor da Proposta</label>
  <input 
    type="number"
    className="w-full px-3 py-2 bg-input border border-chart-profit rounded-lg text-foreground focus:border-chart-profit focus:ring-2 focus:ring-chart-profit/20"
    placeholder="R$ 0,00"
  />
  <p className="text-xs text-chart-profit flex items-center">
    <CheckIcon className="w-3 h-3 mr-1" />
    Valor válido
  </p>
</div>

// Campo com erro - Vermelho
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">Email do Cliente</label>
  <input 
    type="email"
    className="w-full px-3 py-2 bg-input border border-destructive rounded-lg text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20"
    placeholder="cliente@empresa.com"
  />
  <p className="text-xs text-destructive flex items-center">
    <AlertCircleIcon className="w-3 h-3 mr-1" />
    Email inválido
  </p>
</div>

// Campo com aviso - Amarelo
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">Prazo de Entrega</label>
  <input 
    type="date"
    className="w-full px-3 py-2 bg-input border border-accent-yellow rounded-lg text-foreground focus:border-accent-yellow focus:ring-2 focus:ring-accent-yellow/20"
  />
  <p className="text-xs text-accent-yellow flex items-center">
    <AlertTriangleIcon className="w-3 h-3 mr-1" />
    Prazo muito apertado
  </p>
</div>
```

### Navegação e Layout

#### Sidebar com Estados Ativos
```tsx
<nav className="space-y-1">
  {/* Item ativo - Gradiente ciano/laranja */}
  <a 
    href="/dashboard" 
    className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-orange/10 text-accent-cyan border-r-3 border-accent-cyan"
  >
    <BarChart3Icon className="w-5 h-5 mr-3 text-accent-cyan" />
    Dashboard
  </a>
  
  {/* Item com notificação - Laranja */}
  <a 
    href="/quotes" 
    className="flex items-center px-3 py-2 rounded-lg text-primary-300 hover:bg-primary-800/60 hover:text-white transition-colors relative"
  >
    <FileTextIcon className="w-5 h-5 mr-3 text-primary-400" />
    Cotações
    <span className="absolute right-2 top-2 w-2 h-2 bg-accent-orange rounded-full"></span>
  </a>
  
  {/* Item normal */}
  <a 
    href="/partners" 
    className="flex items-center px-3 py-2 rounded-lg text-primary-300 hover:bg-primary-800/60 hover:text-white transition-colors"
  >
    <UsersIcon className="w-5 h-5 mr-3 text-primary-400" />
    Parceiros
  </a>
</nav>
```

### Gráficos e Visualizações

#### Configuração para Recharts
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
  { month: 'Jan', revenue: 125000, cost: 85000, profit: 40000 },
  { month: 'Feb', revenue: 142000, cost: 92000, profit: 50000 },
  { month: 'Mar', revenue: 138000, cost: 88000, profit: 50000 },
  // ... mais dados
];

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={salesData}>
    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
    <XAxis 
      dataKey="month" 
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
    />
    <YAxis 
      stroke="hsl(var(--muted-foreground))"
      fontSize={12}
      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
    />
    <Tooltip 
      contentStyle={{
        backgroundColor: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: '8px',
        color: 'hsl(var(--foreground))',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
      formatter={(value, name) => [
        `R$ ${Number(value).toLocaleString('pt-BR')}`,
        name === 'revenue' ? 'Receita' : name === 'cost' ? 'Custos' : 'Lucro'
      ]}
    />
    <Line 
      type="monotone" 
      dataKey="revenue" 
      stroke="hsl(var(--chart-revenue))" 
      strokeWidth={3}
      dot={{ fill: 'hsl(var(--chart-revenue))', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6, stroke: 'hsl(var(--chart-revenue))', strokeWidth: 2 }}
    />
    <Line 
      type="monotone" 
      dataKey="cost" 
      stroke="hsl(var(--chart-cost))" 
      strokeWidth={3}
      dot={{ fill: 'hsl(var(--chart-cost))', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6, stroke: 'hsl(var(--chart-cost))', strokeWidth: 2 }}
    />
    <Line 
      type="monotone" 
      dataKey="profit" 
      stroke="hsl(var(--chart-profit))" 
      strokeWidth={3}
      dot={{ fill: 'hsl(var(--chart-profit))', strokeWidth: 2, r: 4 }}
      activeDot={{ r: 6, stroke: 'hsl(var(--chart-profit))', strokeWidth: 2 }}
    />
  </LineChart>
</ResponsiveContainer>
```

## Referência Rápida de Uso

### Quando Usar Cada Cor

| Cor | Uso Principal | Exemplos | Evitar |
|-----|---------------|----------|--------|
| `accent-cyan` | Elementos informativos, links, cor primária | Links, botões informativos, dados primários | Botões de ação crítica |
| `accent-orange` | Botões de ação, CTAs, elementos urgentes | Botões "Salvar", "Enviar", alertas de ação | Dados financeiros negativos |
| `accent-yellow` | Avisos, notificações, dados neutros | Alertas de aviso, comissões | Erros críticos |
| `accent-green` | Sucesso, confirmações, dados positivos | Status aprovado, lucros, crescimento | Avisos ou erros |
| `accent-purple` | Elementos especiais, features premium | Funcionalidades avançadas, dados únicos | Uso excessivo |
| `chart-revenue` | Receitas, vendas, entrada de dinheiro | Gráficos de receita, vendas | Custos ou perdas |
| `chart-cost` | Custos, despesas, saída de dinheiro | Gráficos de custos, despesas | Receitas ou lucros |
| `chart-profit` | Lucros, ganhos, resultados positivos | Margem de lucro, ROI | Custos ou perdas |
| `chart-tax` | Impostos, taxas, deduções | Impostos, multas, taxas | Receitas ou lucros |
| `chart-commission` | Comissões, bonificações | Comissões de vendas, bônus | Custos fixos |

### Combinações de Cores Testadas

#### Texto sobre Fundos Escuros (Contraste ≥ 4.5:1)
- ✅ `text-white` sobre `bg-primary-900`
- ✅ `text-primary-300` sobre `bg-primary-900`
- ✅ `text-accent-cyan` sobre `bg-primary-900`
- ✅ `text-accent-orange` sobre `bg-primary-900`
- ✅ `text-accent-yellow` sobre `bg-primary-900`

#### Texto sobre Fundos Claros (Contraste ≥ 4.5:1)
- ✅ `text-primary-900` sobre `bg-primary-50`
- ✅ `text-primary-800` sobre `bg-primary-100`
- ✅ `text-primary-700` sobre `bg-primary-200`

#### Combinações para Evitar (Contraste < 4.5:1)
- ❌ `text-accent-orange` sobre `bg-accent-yellow`
- ❌ `text-primary-500` sobre `bg-primary-600`
- ❌ `text-accent-cyan` sobre `bg-primary-300`

## Recursos Adicionais

### Ferramentas Recomendadas

- **Contrast Checker**: WebAIM Contrast Checker
- **Color Palette Generator**: Coolors.co
- **Accessibility Testing**: axe-core
- **Visual Testing**: Chromatic, Percy
- **Color Blindness Simulator**: Color Oracle

### Documentação Relacionada

- [Guia do Desenvolvedor - Sistema de Cores](./color-system-developer-guide.md)
- [Guia de Estilo](./style-guide.md)
- [Guia de Acessibilidade](./accessibility.md)
- [Componentes UI](./components.md)
- [Testes Visuais](./visual-testing.md)

### Comandos Úteis

```bash
# Verificar uso de cores no projeto
grep -r "bg-\|text-\|border-" src/ --include="*.tsx"

# Executar testes de acessibilidade
npm run test:a11y

# Executar testes visuais
npm run test:visual

# Visualizar showcase do sistema de cores
npm run dev
# Navegar para: http://localhost:3000/color-system
```

---

**Versão**: 1.1  
**Última atualização**: Dezembro 2024  
**Responsável**: Equipe de Design System