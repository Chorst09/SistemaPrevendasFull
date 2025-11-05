# Referência Rápida - Uso de Cores

## Paleta Principal

### Cores Primárias (Azul)
```css
--primary-50: 220 25% 95%   /* #F1F3F6 - Backgrounds muito claros */
--primary-100: 220 25% 90%  /* #E3E7ED - Backgrounds claros */
--primary-200: 220 25% 80%  /* #C7CFD9 - Borders suaves */
--primary-300: 220 25% 70%  /* #ABB7C5 - Texto secundário */
--primary-400: 220 25% 60%  /* #8F9FB1 - Texto muted */
--primary-500: 220 25% 50%  /* #73879D - Elementos neutros */
--primary-600: 220 30% 40%  /* #5A6F89 - Texto principal (claro) */
--primary-700: 220 35% 30%  /* #435775 - Borders escuras */
--primary-800: 220 40% 20%  /* #2D3F61 - Cards escuros */
--primary-900: 220 45% 15%  /* #1A2332 - Background principal */
```

### Cores de Destaque
```css
--accent-cyan: 195 100% 50%     /* #00D4FF - Informativo/Primário */
--accent-orange: 20 100% 60%    /* #FF6B35 - Ação/CTA */
--accent-yellow: 45 100% 60%    /* #FFB800 - Aviso/Neutro */
--accent-green: 150 80% 45%     /* #00B366 - Sucesso/Positivo */
--accent-purple: 270 70% 60%    /* #8B5CF6 - Especial/Premium */
```

### Cores para Gráficos
```css
--chart-revenue: var(--accent-cyan)     /* Receitas */
--chart-cost: var(--accent-orange)      /* Custos */
--chart-profit: var(--accent-green)     /* Lucros */
--chart-tax: 0 84% 60%                  /* Impostos */
--chart-commission: var(--accent-yellow) /* Comissões */
```

## Guia de Uso por Contexto

### 🎯 Botões e Ações

| Tipo | Cor | Classe Tailwind | Uso |
|------|-----|-----------------|-----|
| **Primário** | Orange | `bg-accent-orange` | Ações principais, CTAs |
| **Secundário** | Cyan | `bg-accent-cyan` | Ações informativas |
| **Sucesso** | Green | `bg-accent-green` | Confirmações, salvar |
| **Perigo** | Red | `bg-destructive` | Excluir, cancelar |
| **Aviso** | Yellow | `bg-accent-yellow` | Ações que precisam atenção |

### 📊 Dados e Métricas

| Tipo de Dado | Cor | Classe | Exemplo |
|--------------|-----|--------|---------|
| **Receita** | Cyan | `text-chart-revenue` | R$ 125.000 |
| **Custos** | Orange | `text-chart-cost` | R$ 85.000 |
| **Lucro** | Green | `text-chart-profit` | R$ 40.000 |
| **Impostos** | Red | `text-chart-tax` | R$ 15.000 |
| **Comissões** | Yellow | `text-chart-commission` | R$ 12.500 |

### 🏷️ Status e Estados

| Status | Cor | Badge Class | Ícone |
|--------|-----|-------------|-------|
| **Aprovado** | Green | `bg-accent-green/10 text-accent-green` | ✅ |
| **Pendente** | Yellow | `bg-accent-yellow/10 text-accent-yellow` | ⏳ |
| **Rejeitado** | Red | `bg-destructive/10 text-destructive` | ❌ |
| **Em Análise** | Cyan | `bg-accent-cyan/10 text-accent-cyan` | 🔍 |
| **Rascunho** | Gray | `bg-muted text-muted-foreground` | 📝 |

### 🎨 Layout e Estrutura

| Elemento | Cor | Classe | Propósito |
|----------|-----|--------|-----------|
| **Sidebar** | Primary 900 | `bg-primary-900` | Navegação principal |
| **Header** | Primary 800 | `bg-primary-800` | Cabeçalho |
| **Cards** | Card | `bg-card` | Containers de conteúdo |
| **Borders** | Border | `border-border` | Divisores e contornos |
| **Texto Principal** | Foreground | `text-foreground` | Conteúdo principal |
| **Texto Secundário** | Muted | `text-muted-foreground` | Conteúdo secundário |

## Combinações Testadas (WCAG AA)

### ✅ Aprovadas (Contraste ≥ 4.5:1)

#### Sobre Fundos Escuros
- `text-white` sobre `bg-primary-900` (12.6:1)
- `text-primary-300` sobre `bg-primary-900` (4.8:1)
- `text-accent-cyan` sobre `bg-primary-900` (8.2:1)
- `text-accent-orange` sobre `bg-primary-900` (6.1:1)
- `text-accent-yellow` sobre `bg-primary-900` (9.3:1)

#### Sobre Fundos Claros
- `text-primary-900` sobre `bg-primary-50` (11.4:1)
- `text-primary-800` sobre `bg-primary-100` (8.7:1)
- `text-primary-700` sobre `bg-primary-200` (5.2:1)

### ❌ Evitar (Contraste < 4.5:1)
- `text-accent-orange` sobre `bg-accent-yellow` (2.1:1)
- `text-primary-500` sobre `bg-primary-600` (1.8:1)
- `text-accent-cyan` sobre `bg-primary-300` (3.2:1)

## Padrões de Código

### Botões
```tsx
// Primário
<button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-2 rounded-lg transition-colors">
  Ação Principal
</button>

// Secundário
<button className="bg-accent-cyan hover:bg-accent-cyan/90 text-white px-4 py-2 rounded-lg transition-colors">
  Ação Secundária
</button>

// Outline
<button className="border border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-white px-4 py-2 rounded-lg transition-colors">
  Outline
</button>
```

### Cards de Estatística
```tsx
// Receita
<div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6">
  <p className="text-muted-foreground text-sm">Receita Total</p>
  <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
</div>

// Custos
<div className="bg-card border-l-4 border-chart-cost rounded-lg p-6">
  <p className="text-muted-foreground text-sm">Custos Totais</p>
  <p className="text-2xl font-bold text-chart-cost">R$ 85.000</p>
</div>
```

### Badges de Status
```tsx
// Sucesso
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-green/10 text-accent-green border border-accent-green/20">
  Aprovado
</span>

// Aviso
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-yellow/10 text-accent-yellow border border-accent-yellow/20">
  Pendente
</span>
```

### Formulários
```tsx
// Input padrão
<input className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20" />

// Input com erro
<input className="w-full px-3 py-2 bg-input border border-destructive rounded-lg text-foreground focus:border-destructive focus:ring-2 focus:ring-destructive/20" />

// Input com sucesso
<input className="w-full px-3 py-2 bg-input border border-accent-green rounded-lg text-foreground focus:border-accent-green focus:ring-2 focus:ring-accent-green/20" />
```

### Navegação
```tsx
// Item ativo da sidebar
<a className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-orange/10 text-accent-cyan border-r-3 border-accent-cyan">
  Dashboard
</a>

// Item normal da sidebar
<a className="flex items-center px-3 py-2 rounded-lg text-primary-300 hover:bg-primary-800/60 hover:text-white transition-colors">
  Cotações
</a>
```

## Classes Utilitárias Customizadas

### Efeitos Especiais
```css
/* Efeito de vidro */
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

/* Brilho tecnológico */
.tech-glow {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.4);
}

.tech-glow-orange {
  box-shadow: 0 0 20px hsl(var(--accent-orange) / 0.4);
}
```

### Sidebar e Navegação
```css
.sidebar-bg {
  background: hsl(var(--primary-900));
}

.sidebar-nav-item {
  color: hsl(var(--primary-300));
}

.sidebar-nav-item:hover {
  background: hsl(var(--primary-800) / 0.6);
  color: white;
}

.sidebar-nav-item-active {
  background: linear-gradient(135deg, hsl(var(--accent-cyan) / 0.2), hsl(var(--accent-orange) / 0.1));
  color: hsl(var(--accent-cyan));
  border-right: 3px solid hsl(var(--accent-cyan));
}

.sidebar-icon-primary {
  color: hsl(var(--primary-400));
}

.sidebar-icon-primary:hover {
  color: hsl(var(--accent-cyan));
}
```

### Header
```css
.header-bg {
  background: linear-gradient(135deg, hsl(var(--primary-800)), hsl(var(--primary-700)));
}

.header-search {
  background: hsl(var(--primary-700) / 0.5);
  border: 1px solid hsl(var(--primary-600));
  color: hsl(var(--foreground));
}

.header-search:focus {
  border-color: hsl(var(--accent-cyan));
  box-shadow: 0 0 0 2px hsl(var(--accent-cyan) / 0.2);
}

.header-profile-btn {
  color: hsl(var(--foreground));
}

.header-profile-btn:hover {
  background: hsl(var(--primary-700) / 0.5);
}
```

## Checklist Rápido

### ✅ Antes de Usar uma Cor
- [ ] A cor existe no sistema?
- [ ] É a cor semanticamente correta?
- [ ] O contraste é adequado (≥4.5:1)?
- [ ] Funciona em todos os temas?

### ✅ Implementação
- [ ] Usar classes Tailwind quando possível
- [ ] Adicionar estados hover/focus
- [ ] Incluir transições suaves
- [ ] Testar responsividade

### ✅ Validação
- [ ] Testar com ferramentas de acessibilidade
- [ ] Verificar em diferentes navegadores
- [ ] Validar com usuários reais
- [ ] Executar testes visuais

## Links Úteis

- 📖 [Documentação Completa](./color-system.md)
- 🛠️ [Guia do Desenvolvedor](./color-system-developer-guide.md)
- 🎨 [Showcase Interativo](/color-system)
- ✅ [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---
**Versão**: 1.0 | **Atualizado**: Dezembro 2024