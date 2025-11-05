# Guia de Migração - Sistema de Cores

## Visão Geral

Este guia detalha o processo de migração suave do sistema de cores legado para o novo sistema moderno do Pre-Sales Ally. A migração foi projetada para ser gradual, permitindo rollback em caso de problemas e garantindo compatibilidade com código existente.

## Estratégia de Migração

### 1. Feature Flags

O sistema utiliza feature flags para controlar a ativação gradual das novas funcionalidades:

```typescript
// Configuração via variáveis de ambiente
NEXT_PUBLIC_NEW_COLOR_SYSTEM=true      // Ativa novo sistema de cores
NEXT_PUBLIC_HIGH_CONTRAST_MODE=true    // Habilita modo alto contraste
NEXT_PUBLIC_MODERN_COMPONENTS=true     // Ativa componentes modernos
NEXT_PUBLIC_GLASS_EFFECTS=true         // Habilita efeitos de vidro
NEXT_PUBLIC_CHART_COLORS=true          // Ativa nova paleta de gráficos
```

### 2. Camada de Compatibilidade

Uma camada de compatibilidade mapeia automaticamente cores legadas para o novo sistema:

```typescript
// Mapeamento automático
'bg-indigo-600' → 'bg-primary'
'text-violet-400' → 'text-accent-purple'
'#4F46E5' → 'hsl(var(--primary))'
```

### 3. Monitoramento em Tempo Real

O componente `ColorSystemMigration` monitora a compatibilidade e fornece feedback visual sobre problemas.

## Processo de Migração

### Fase 1: Preparação

1. **Backup do código atual**
   ```bash
   git checkout -b backup-before-color-migration
   git commit -am "Backup antes da migração de cores"
   ```

2. **Configurar variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # Edite as variáveis conforme necessário
   ```

3. **Instalar dependências**
   ```bash
   npm install
   ```

### Fase 2: Análise Automática

1. **Executar análise dry-run**
   ```bash
   npm run migrate:colors:dry-run
   ```

2. **Revisar relatório gerado**
   ```bash
   cat color-migration-report.json
   ```

3. **Identificar problemas críticos**
   - Cores não mapeadas
   - Conflitos de contraste
   - Componentes incompatíveis

### Fase 3: Migração Gradual

1. **Ativar feature flags uma por vez**
   ```bash
   # Começar apenas com o sistema de cores
   NEXT_PUBLIC_NEW_COLOR_SYSTEM=true
   NEXT_PUBLIC_MODERN_COMPONENTS=false
   NEXT_PUBLIC_GLASS_EFFECTS=false
   ```

2. **Testar funcionalidade básica**
   ```bash
   npm run dev
   # Navegar pela aplicação e verificar problemas
   ```

3. **Ativar próxima feature**
   ```bash
   NEXT_PUBLIC_MODERN_COMPONENTS=true
   ```

4. **Repetir até todas as features estarem ativas**

### Fase 4: Aplicação Automática

1. **Executar migração automática**
   ```bash
   npm run migrate:colors:verbose
   ```

2. **Revisar mudanças aplicadas**
   ```bash
   git diff
   ```

3. **Testar aplicação completa**
   ```bash
   npm run test
   npm run test:visual
   ```

### Fase 5: Validação

1. **Executar testes de acessibilidade**
   ```bash
   npm run test:a11y
   ```

2. **Verificar performance**
   ```bash
   npm run test:performance
   ```

3. **Testar em diferentes navegadores**
   ```bash
   npm run test:visual:cross-browser
   ```

## Rollback de Emergência

### Rollback Automático

Se o sistema detectar problemas críticos, o rollback pode ser acionado automaticamente:

```typescript
// Rollback via interface
<ColorSystemMigration />
// Clique no botão "Rollback" se aparecer
```

### Rollback Manual

1. **Via variáveis de ambiente**
   ```bash
   NEXT_PUBLIC_NEW_COLOR_SYSTEM=false
   NEXT_PUBLIC_MODERN_COMPONENTS=false
   NEXT_PUBLIC_GLASS_EFFECTS=false
   ```

2. **Via código**
   ```typescript
   import { rollbackFeature } from '@/lib/feature-flags';
   rollbackFeature('newColorSystem');
   ```

3. **Via Git**
   ```bash
   git checkout backup-before-color-migration
   ```

## Problemas Comuns e Soluções

### 1. Cores não Mapeadas

**Problema**: Cores customizadas não são migradas automaticamente.

**Solução**:
```typescript
// Adicionar ao mapeamento em legacy-colors.ts
export const legacyColorMap = {
  // ... mapeamentos existentes
  'custom-blue': 'hsl(var(--accent-cyan))',
  'custom-orange': 'hsl(var(--accent-orange))',
};
```

### 2. Contraste Insuficiente

**Problema**: Combinações de cores não atendem critérios de acessibilidade.

**Solução**:
```css
/* Ajustar cores no globals.css */
:root {
  --custom-color: 220 45% 25%; /* Ajustar luminosidade */
}
```

### 3. Componentes Quebrados

**Problema**: Componentes não funcionam com novo sistema.

**Solução**:
```typescript
// Usar wrapper de compatibilidade
import { MigrationWrapper } from '@/components/migration/ColorSystemMigration';

<MigrationWrapper fallbackComponent={<LegacyComponent />}>
  <ModernComponent />
</MigrationWrapper>
```

### 4. Performance Degradada

**Problema**: CSS Custom Properties causam lentidão.

**Solução**:
```css
/* Adicionar fallbacks estáticos */
.my-component {
  background: #1A2332; /* Fallback */
  background: hsl(var(--primary-900)); /* Moderno */
}
```

## Validação de Compatibilidade

### Checklist de Pré-Migração

- [ ] Backup do código atual criado
- [ ] Variáveis de ambiente configuradas
- [ ] Análise dry-run executada sem erros críticos
- [ ] Testes existentes passando
- [ ] Navegadores alvo identificados

### Checklist de Pós-Migração

- [ ] Todas as páginas carregam sem erros
- [ ] Contraste de cores atende WCAG 2.1 AA
- [ ] Componentes funcionam em todos os temas
- [ ] Performance mantida ou melhorada
- [ ] Testes visuais passando
- [ ] Documentação atualizada

## Monitoramento Contínuo

### Métricas a Acompanhar

1. **Tempo de carregamento**
   - CSS parsing time
   - Paint time
   - Layout shift

2. **Acessibilidade**
   - Contraste de cores
   - Navegação por teclado
   - Compatibilidade com leitores de tela

3. **Compatibilidade**
   - Suporte a navegadores
   - Renderização consistente
   - Fallbacks funcionando

### Ferramentas de Monitoramento

```bash
# Lighthouse CI para performance
npm install -g @lhci/cli
lhci autorun

# axe-core para acessibilidade
npm run test:a11y

# Visual regression testing
npm run test:visual:regression
```

## Suporte e Troubleshooting

### Logs de Debug

```typescript
// Habilitar logs detalhados
localStorage.setItem('debug-color-system', 'true');

// Verificar feature flags ativas
console.log(getFeatureUsageStats());

// Validar compatibilidade
console.log(validateCompatibility());
```

### Contatos de Suporte

- **Equipe de Design System**: design-system@company.com
- **Equipe de Frontend**: frontend@company.com
- **Documentação**: [Link para documentação interna]

### Recursos Adicionais

- [Sistema de Cores - Documentação Completa](./color-system.md)
- [Guia de Estilo para Desenvolvedores](./style-guide.md)
- [Testes de Acessibilidade](./accessibility-testing.md)
- [Performance Guidelines](./performance.md)

---

**Versão**: 1.0  
**Última atualização**: Dezembro 2024  
**Responsável**: Equipe de Design System