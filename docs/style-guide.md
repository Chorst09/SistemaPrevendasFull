# Guia de Estilo - Pre-Sales Ally

## Introdução

Este guia de estilo fornece diretrizes práticas para desenvolvedores sobre como aplicar consistentemente o sistema de cores do Pre-Sales Ally. Inclui exemplos de código, padrões recomendados e melhores práticas.

## Princípios de Design

### 1. Consistência Visual
- Use sempre as variáveis CSS definidas no sistema
- Mantenha a hierarquia visual através das cores
- Aplique os mesmos padrões em componentes similares

### 2. Acessibilidade em Primeiro Lugar
- Garanta contraste mínimo de 4.5:1 para texto normal
- Use 3:1 para texto grande (18px+ ou 14px+ bold)
- Teste com ferramentas de acessibilidade

### 3. Performance
- Prefira CSS Custom Properties para temas dinâmicos
- Use classes utilitárias para padrões comuns
- Evite inline styles para cores

## Padrões de Componentes

### Botões

#### Botão Primário
```tsx
// ✅ Correto - Usando classes do sistema
<button className="bg-accent-orange hover:bg-accent-yellow text-white px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-accent-orange/25">
  Ação Principal
</button>

// ✅ Alternativa com classe utilitária
<button className="btn-primary-modern">
  Ação Principal
</button>
```

#### Botão Secundário
```tsx
// ✅ Correto
<button className="bg-secondary hover:bg-muted text-secondary-foreground border border-border px-4 py-2 rounded-lg transition-colors">
  Ação Secundária
</button>

// ✅ Alternativa com classe utilitária
<button className="btn-secondary-modern">
  Ação Secundária
</button>
```

#### Botão de Perigo
```tsx
// ✅ Correto
<button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors">
  Excluir
</button>
```

### Cards

#### Card Padrão
```tsx
// ✅ Correto - Card moderno com efeito de vidro
<div className="glass-effect rounded-xl p-6 hover:shadow-xl transition-all duration-300">
  <h3 className="text-foreground font-semibold mb-2">Título do Card</h3>
  <p className="text-muted-foreground">Conteúdo do card...</p>
</div>

// ✅ Alternativa simples
<div className="card-modern p-6">
  <h3 className="text-foreground font-semibold mb-2">Título do Card</h3>
  <p className="text-muted-foreground">Conteúdo do card...</p>
</div>
```

#### Card de Estatística
```tsx
// ✅ Card de receita
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

// ✅ Card de custos
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
// ✅ Correto
<input 
  type="text"
  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors"
  placeholder="Digite aqui..."
/>
```

#### Input com Estados de Validação
```tsx
// ✅ Estado de sucesso
<input 
  type="text"
  className="w-full px-3 py-2 bg-input border border-success rounded-lg text-foreground focus:border-success focus:ring-2 focus:ring-success/20"
/>

// ✅ Estado de erro
<input 
  type="text"
  className="w-full px-3 py-2 bg-input border border-destructive rounded-lg text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20"
/>
```

#### Select Customizado
```tsx
// ✅ Correto
<select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-colors">
  <option value="">Selecione uma opção</option>
  <option value="1">Opção 1</option>
  <option value="2">Opção 2</option>
</select>
```

### Navegação

#### Sidebar
```tsx
// ✅ Container da sidebar
<aside className="sidebar-bg w-64 h-screen p-4">
  {/* Logo */}
  <div className="mb-8">
    <h1 className="text-xl font-bold text-accent-cyan">Pre-Sales Ally</h1>
  </div>
  
  {/* Navegação */}
  <nav className="space-y-2">
    {/* Item ativo */}
    <a href="/dashboard" className="sidebar-nav-item-active flex items-center px-3 py-2 rounded-lg">
      <DashboardIcon className="w-5 h-5 mr-3" />
      Dashboard
    </a>
    
    {/* Item normal */}
    <a href="/quotes" className="sidebar-nav-item flex items-center px-3 py-2 rounded-lg hover:bg-primary-800/60 hover:text-white transition-colors">
      <QuoteIcon className="w-5 h-5 mr-3 sidebar-icon-primary hover:text-accent-cyan" />
      Cotações
    </a>
  </nav>
</aside>
```

#### Header
```tsx
// ✅ Header principal
<header className="header-bg h-16 px-6 flex items-center justify-between">
  {/* Busca */}
  <div className="flex-1 max-w-md">
    <input 
      type="search"
      placeholder="Buscar..."
      className="header-search w-full px-4 py-2 rounded-lg text-foreground placeholder:text-muted-foreground"
    />
  </div>
  
  {/* Perfil */}
  <button className="header-profile-btn flex items-center px-3 py-2 rounded-lg">
    <Avatar className="w-8 h-8 mr-2" />
    <span className="text-foreground">João Silva</span>
  </button>
</header>
```

### Gráficos e Visualizações

#### Configuração de Cores para Charts
```tsx
// ✅ Configuração para Chart.js
const chartColors = {
  revenue: 'hsl(var(--chart-revenue))',
  cost: 'hsl(var(--chart-cost))',
  profit: 'hsl(var(--chart-profit))',
  tax: 'hsl(var(--chart-tax))',
  commission: 'hsl(var(--chart-commission))',
};

// ✅ Exemplo de gráfico de barras
const barChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Receita',
      data: [12000, 15000, 18000, 14000, 20000],
      backgroundColor: chartColors.revenue,
      borderColor: chartColors.revenue,
      borderWidth: 1,
    },
    {
      label: 'Custos',
      data: [8000, 9000, 11000, 9500, 12000],
      backgroundColor: chartColors.cost,
      borderColor: chartColors.cost,
      borderWidth: 1,
    },
  ],
};
```

#### Indicadores de Status
```tsx
// ✅ Status badges
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
  Aprovado
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning/10 text-warning">
  Pendente
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
  Rejeitado
</span>

<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
  Em Análise
</span>
```

## Padrões de Layout

### Grid de Dashboard
```tsx
// ✅ Layout de dashboard responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {/* Cards de estatísticas */}
  <div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6">
    <h3 className="text-sm font-medium text-muted-foreground">Receita Total</h3>
    <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
  </div>
  
  <div className="bg-card border-l-4 border-chart-cost rounded-lg p-6">
    <h3 className="text-sm font-medium text-muted-foreground">Custos</h3>
    <p className="text-2xl font-bold text-chart-cost">R$ 85.000</p>
  </div>
  
  <div className="bg-card border-l-4 border-chart-profit rounded-lg p-6">
    <h3 className="text-sm font-medium text-muted-foreground">Lucro</h3>
    <p className="text-2xl font-bold text-chart-profit">R$ 40.000</p>
  </div>
  
  <div className="bg-card border-l-4 border-chart-commission rounded-lg p-6">
    <h3 className="text-sm font-medium text-muted-foreground">Comissões</h3>
    <p className="text-2xl font-bold text-chart-commission">R$ 12.500</p>
  </div>
</div>
```

### Modal/Dialog
```tsx
// ✅ Modal com overlay
<div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
  <div className="glass-effect max-w-md w-full mx-4 rounded-xl p-6">
    <h2 className="text-xl font-semibold text-foreground mb-4">Confirmar Ação</h2>
    <p className="text-muted-foreground mb-6">
      Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
    </p>
    
    <div className="flex justify-end space-x-3">
      <button className="btn-secondary-modern">
        Cancelar
      </button>
      <button className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg transition-colors">
        Excluir
      </button>
    </div>
  </div>
</div>
```

## Temas e Acessibilidade

### Alternância de Tema
```tsx
// ✅ Hook para tema
const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'high-contrast' : 'dark';
    setTheme(newTheme);
    document.documentElement.className = newTheme;
  };
  
  return { theme, toggleTheme };
};

// ✅ Botão de alternância
<button 
  onClick={toggleTheme}
  className="p-2 rounded-lg bg-secondary hover:bg-muted transition-colors"
  aria-label="Alternar tema"
>
  {theme === 'dark' ? <SunIcon /> : theme === 'light' ? <MoonIcon /> : <ContrastIcon />}
</button>
```

### Modo Alto Contraste
```tsx
// ✅ Componente com suporte a alto contraste
<div className="bg-card border border-border rounded-lg p-4 high-contrast:border-2 high-contrast:border-foreground">
  <h3 className="text-foreground font-semibold">Título</h3>
  <p className="text-muted-foreground high-contrast:text-foreground">Descrição</p>
  
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded high-contrast:border-2 high-contrast:border-foreground">
    Ação
  </button>
</div>
```

## Erros Comuns e Como Evitar

### ❌ Não Faça

```tsx
// ❌ Cores hardcoded
<div style={{ backgroundColor: '#1A2332', color: '#00D4FF' }}>
  Conteúdo
</div>

// ❌ Contraste insuficiente
<p className="text-primary-500 bg-primary-600">Texto difícil de ler</p>

// ❌ Misturar sistemas de cores
<button className="bg-blue-500 text-orange-400">
  Botão inconsistente
</button>

// ❌ Não considerar modo escuro/claro
<div className="bg-white text-black">
  Quebra no modo escuro
</div>
```

### ✅ Faça

```tsx
// ✅ Use variáveis CSS
<div className="bg-primary-900 text-accent-cyan">
  Conteúdo
</div>

// ✅ Garanta contraste adequado
<p className="text-foreground bg-card">Texto legível</p>

// ✅ Use o sistema de cores consistente
<button className="bg-accent-orange hover:bg-accent-yellow text-white">
  Botão consistente
</button>

// ✅ Considere todos os temas
<div className="bg-background text-foreground">
  Funciona em todos os temas
</div>
```

## Checklist de Desenvolvimento

### Antes de Implementar
- [ ] Verifique se a cor existe no sistema
- [ ] Confirme o contraste adequado
- [ ] Teste em modo claro e escuro
- [ ] Considere usuários com daltonismo
- [ ] Valide com ferramentas de acessibilidade

### Durante o Desenvolvimento
- [ ] Use classes Tailwind quando possível
- [ ] Implemente estados hover/focus
- [ ] Adicione transições suaves
- [ ] Teste responsividade
- [ ] Documente componentes customizados

### Após Implementação
- [ ] Execute testes de regressão visual
- [ ] Valide com leitores de tela
- [ ] Teste performance
- [ ] Colete feedback de usuários
- [ ] Atualize documentação se necessário

## Recursos e Ferramentas

### Extensões VS Code Recomendadas
- **Tailwind CSS IntelliSense**: Autocomplete para classes
- **Color Highlight**: Visualiza cores no código
- **axe Accessibility Linter**: Verifica acessibilidade

### Ferramentas Online
- **WebAIM Contrast Checker**: Verifica contraste de cores
- **Coolors.co**: Gerador de paletas
- **Accessible Colors**: Sugere cores acessíveis

### Comandos Úteis
```bash
# Verificar uso de cores no projeto
grep -r "bg-\|text-\|border-" src/ --include="*.tsx" --include="*.jsx"

# Executar testes de acessibilidade
npm run test:a11y

# Visualizar showcase do sistema de cores
npm run dev
# Navegar para: http://localhost:3000/color-system
```

## Documentação Relacionada

### 📚 Documentação Completa do Sistema de Cores
- **[Sistema de Cores](./color-system.md)** - Documentação principal e completa
- **[Guia do Desenvolvedor](./color-system-developer-guide.md)** - Instruções práticas detalhadas
- **[Referência Rápida](./color-usage-reference.md)** - Consulta rápida para desenvolvedores
- **[README do Sistema de Cores](./README-color-system.md)** - Visão geral e navegação

### 🎨 Showcase Interativo
Acesse `/color-system` na aplicação para ver:
- Paleta completa de cores
- Exemplos de componentes
- Demonstrações de gráficos
- Guia de uso com código copiável
- Verificação de contraste em tempo real

### 🔗 Links Úteis
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

**Versão**: 1.1  
**Última atualização**: Dezembro 2024  
**Responsável**: Equipe de Desenvolvimento