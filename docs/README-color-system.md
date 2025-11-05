# Documentação do Sistema de Cores - Pre-Sales Ally

## 📋 Visão Geral

Este diretório contém toda a documentação relacionada ao sistema de cores do Pre-Sales Ally. O sistema foi projetado para criar uma experiência visual moderna, profissional e acessível, utilizando tons de azul escuro como base, com acentos em laranja vibrante e ciano.

## 📚 Documentos Disponíveis

### 1. [Sistema de Cores](./color-system.md) 📖
**Documentação principal e completa**
- Paleta de cores detalhada com códigos HSL
- Explicação de cada cor e seu propósito
- Exemplos práticos de uso
- Guias de acessibilidade e contraste
- Integração com Tailwind CSS

### 2. [Guia do Desenvolvedor](./color-system-developer-guide.md) 🛠️
**Instruções práticas para implementação**
- Configuração inicial e setup
- Padrões de código recomendados
- Exemplos de componentes
- Troubleshooting e debugging
- Testes automatizados

### 3. [Referência Rápida](./color-usage-reference.md) ⚡
**Consulta rápida para desenvolvedores**
- Tabela de cores com códigos
- Guia de uso por contexto
- Combinações testadas
- Classes Tailwind disponíveis
- Checklist de implementação

### 4. [Guia de Estilo](./style-guide.md) 🎨
**Padrões visuais e de implementação**
- Princípios de design
- Padrões de componentes
- Exemplos de código
- Erros comuns e como evitar
- Recursos e ferramentas

## 🎯 Como Usar Esta Documentação

### Para Desenvolvedores Iniciantes
1. Comece com o [Sistema de Cores](./color-system.md) para entender a filosofia
2. Use a [Referência Rápida](./color-usage-reference.md) para consultas diárias
3. Consulte o [Guia do Desenvolvedor](./color-system-developer-guide.md) para implementação

### Para Desenvolvedores Experientes
1. Vá direto para a [Referência Rápida](./color-usage-reference.md)
2. Use o [Guia do Desenvolvedor](./color-system-developer-guide.md) para padrões avançados
3. Consulte o [Guia de Estilo](./style-guide.md) para melhores práticas

### Para Designers
1. Leia o [Sistema de Cores](./color-system.md) para entender as cores disponíveis
2. Use o [Guia de Estilo](./style-guide.md) para padrões visuais
3. Consulte a [Referência Rápida](./color-usage-reference.md) para especificações técnicas

## 🎨 Showcase Interativo

Acesse o showcase interativo do sistema de cores em:
```
http://localhost:3000/color-system
```

O showcase inclui:
- ✅ Visualização completa da paleta
- ✅ Exemplos de componentes
- ✅ Demonstrações de gráficos
- ✅ Formulários com estados
- ✅ Navegação e layout
- ✅ Guia de uso com código copiável

## 🚀 Início Rápido

### 1. Instalação
As cores já estão configuradas no projeto. Para usar:

```tsx
// Importar componentes base
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Usar classes Tailwind
<Button className="bg-accent-orange hover:bg-accent-orange/90">
  Ação Principal
</Button>
```

### 2. Cores Principais
```css
/* Cores mais usadas */
--primary-900: 220 45% 15%;    /* Background escuro */
--accent-cyan: 195 100% 50%;   /* Cor primária */
--accent-orange: 20 100% 60%;  /* Ações */
--accent-green: 150 80% 45%;   /* Sucesso */
--accent-yellow: 45 100% 60%;  /* Avisos */
```

### 3. Padrões Básicos
```tsx
// Botão primário
<button className="bg-accent-orange hover:bg-accent-orange/90 text-white px-4 py-2 rounded-lg">
  Ação Principal
</button>

// Card de estatística
<div className="bg-card border-l-4 border-chart-revenue rounded-lg p-6">
  <p className="text-muted-foreground text-sm">Receita</p>
  <p className="text-2xl font-bold text-chart-revenue">R$ 125.000</p>
</div>

// Badge de status
<span className="bg-accent-green/10 text-accent-green px-2 py-1 rounded-full text-xs">
  Aprovado
</span>
```

## 🎯 Paleta Principal

### Cores Primárias (Azul)
- **primary-900** (#1A2332) - Background principal, sidebar
- **primary-800** (#2D3F61) - Cards escuros, header
- **primary-700** (#435775) - Borders escuras
- **primary-300** (#ABB7C5) - Texto secundário
- **primary-100** (#E3E7ED) - Backgrounds claros

### Cores de Destaque
- **accent-cyan** (#00D4FF) - Cor primária, links, informações
- **accent-orange** (#FF6B35) - Botões de ação, CTAs
- **accent-green** (#00B366) - Sucesso, dados positivos
- **accent-yellow** (#FFB800) - Avisos, notificações
- **accent-purple** (#8B5CF6) - Elementos especiais

### Cores para Gráficos
- **chart-revenue** (cyan) - Receitas, vendas
- **chart-cost** (orange) - Custos, despesas
- **chart-profit** (green) - Lucros, margens
- **chart-tax** (red) - Impostos, taxas
- **chart-commission** (yellow) - Comissões

## ✅ Checklist de Implementação

### Antes de Usar
- [ ] Verificar se a cor existe no sistema
- [ ] Confirmar o propósito semântico
- [ ] Calcular contraste adequado (≥4.5:1)
- [ ] Testar em todos os temas

### Durante Implementação
- [ ] Usar classes Tailwind quando possível
- [ ] Implementar estados hover/focus
- [ ] Adicionar transições suaves
- [ ] Testar responsividade

### Após Implementação
- [ ] Executar testes de acessibilidade
- [ ] Validar em diferentes navegadores
- [ ] Testar com usuários reais
- [ ] Executar testes visuais

## 🛠️ Ferramentas Recomendadas

### Extensões VS Code
- **Tailwind CSS IntelliSense** - Autocomplete para classes
- **Color Highlight** - Visualiza cores no código
- **axe Accessibility Linter** - Verifica acessibilidade

### Ferramentas Online
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors.co](https://coolors.co/) - Gerador de paletas
- [Accessible Colors](https://accessible-colors.com/)

### Comandos CLI
```bash
# Verificar uso de cores
grep -r "bg-\|text-\|border-" src/ --include="*.tsx"

# Executar testes
npm run test:a11y
npm run test:visual
npm run test:performance
```

## 🔧 Troubleshooting

### Problemas Comuns

#### Cores não aparecem
```tsx
// ❌ Problema
<div style={{ backgroundColor: '#1A2332' }}>

// ✅ Solução
<div className="bg-primary-900">
```

#### Contraste insuficiente
```tsx
// ❌ Problema
<p className="text-primary-500 bg-primary-600">

// ✅ Solução
<p className="text-primary-300 bg-primary-900">
```

#### Inconsistência entre temas
```tsx
// ❌ Problema
<div className="bg-white text-black">

// ✅ Solução
<div className="bg-background text-foreground">
```

## 📞 Suporte

### Dúvidas sobre Implementação
- Consulte o [Guia do Desenvolvedor](./color-system-developer-guide.md)
- Verifique os exemplos no [Showcase](/color-system)
- Use a [Referência Rápida](./color-usage-reference.md)

### Problemas de Acessibilidade
- Consulte a seção de contraste no [Sistema de Cores](./color-system.md)
- Use ferramentas de verificação automática
- Teste com usuários reais

### Novos Padrões
- Documente no [Guia de Estilo](./style-guide.md)
- Adicione exemplos ao showcase
- Atualize a [Referência Rápida](./color-usage-reference.md)

## 📈 Roadmap

### Próximas Melhorias
- [ ] Modo de alto contraste aprimorado
- [ ] Mais variações de cores para gráficos
- [ ] Temas personalizáveis por usuário
- [ ] Integração com ferramentas de design
- [ ] Documentação em outros idiomas

### Versões
- **v1.0** (Atual) - Sistema base implementado
- **v1.1** (Planejado) - Melhorias de acessibilidade
- **v2.0** (Futuro) - Temas personalizáveis

---

**Mantido por**: Equipe de Design System  
**Última atualização**: Dezembro 2024  
**Próxima revisão**: Março 2025

## 📄 Licença

Esta documentação é parte do projeto Pre-Sales Ally e segue a mesma licença do projeto principal.