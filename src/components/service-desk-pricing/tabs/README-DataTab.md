# Aba Dados - Service Desk Pricing System

## Visão Geral

A aba "Dados" foi completamente reformulada para seguir o design e funcionalidades do site de referência [precificaservicedesk.netlify.app](https://precificaservicedesk.netlify.app/).

## Novas Funcionalidades Implementadas

### 1. Dados do Projeto
- **Informações do Projeto e Cliente**
  - Nome do Projeto (padrão: "Novo Projeto de Service Desk")
  - Tipo do Projeto (Balcão de atendimento, Service Desk Avançado, etc.)
  - Razão Social do Cliente
  - Contato do Cliente

- **Serviços Adicionais**
  - Precisa de um software de Service Desk? (checkbox)
  - Necessita um nº 0800? (checkbox)
  - Precisa de uma linha telefônica Directcall? (checkbox)
  - Fornecedor de infraestrutura NR17? (checkbox)

### 2. Informações Gerais
- **Quantidade de Usuários** (padrão: 100)
- **Volume de Chamados/Mês** (padrão: 150, com ícone de bloqueio)

### 3. Dimensionamento Automático (Erlang C Simplificado)
- **Configurações de Dimensionamento:**
  - Incidentes por Usuário/Mês (padrão: 1.5)
  - TMA - Tempo Médio de Atendimento em minutos (padrão: 10)
  - Taxa de Ocupação % (padrão: 80%)
  - Distribuição N1 % (padrão: 80%)
  - Capacidade N1 (chamados/mês/8h) (padrão: 100, com referência 80-120)
  - Capacidade N2 (chamados/mês/8h) (padrão: 75, com referência 60-90)
  - Checkbox: "Analista N1 fará turno de 6 horas?"

- **Resultados Calculados:**
  - Cards com fundo escuro mostrando "Atendentes Sugeridos N1" e "N2"
  - Botão "Aplicar Dimensionamento" com estilo cyan

## Estrutura de Dados

### Novos Tipos TypeScript

```typescript
export interface AdditionalServices {
  needsSoftware: boolean;
  needs0800: boolean;
  needsDirectCall: boolean;
  needsInfrastructure: boolean;
}

export interface GeneralInfo {
  userQuantity: number;
  monthlyCalls: number;
}

export interface DimensioningConfig {
  incidentsPerUser: number;
  tmaMinutes: number;
  occupancyRate: number;
  n1Distribution: number;
  n1Capacity: number;
  n2Capacity: number;
  n1SixHourShift: boolean;
  suggestedN1?: number;
  suggestedN2?: number;
}
```

### Atualização do ProjectData

```typescript
export interface ProjectData {
  // ... propriedades existentes
  additionalServices?: AdditionalServices;
  generalInfo?: GeneralInfo;
  dimensioning?: DimensioningConfig;
}
```

## Cálculos Implementados

### Dimensionamento Automático

O sistema calcula automaticamente o número de atendentes sugeridos baseado na fórmula:

**N1 Sugeridos:**
```
(Usuários × Incidentes/Usuário × Distribuição N1%) / Capacidade N1
```

**N2 Sugeridos:**
```
(Usuários × Incidentes/Usuário × (100% - Distribuição N1%)) / Capacidade N2
```

## Estilos e Design

### CSS Modules
- Arquivo: `DataTabModule.module.css`
- Cards com gradiente escuro (`darkCard`)
- Títulos com cor cyan (`cyanTitle`)
- Cards de resultado com estilo específico (`resultCard`)
- Botão de aplicar com gradiente cyan (`applyButton`)
- Inputs com ícones de bloqueio (`inputWithIcon`, `lockIcon`)
- Checkboxes customizados (`customCheckbox`)

### Responsividade
- Layout em grid que se adapta para mobile
- Cards de resultado empilham verticalmente em telas pequenas
- Inputs e controles se ajustam automaticamente

## Funcionalidades Técnicas

### Auto-save
- Debounce de 2 segundos para salvar automaticamente
- Indicador visual de "Salvando..." quando há mudanças

### Validação
- Integração com o sistema de validação existente
- Alertas para campos obrigatórios
- Warnings para campos opcionais

### Performance
- Lazy loading dos componentes
- Cálculos otimizados com memoização
- Cache de resultados de dimensionamento

## Como Usar

```tsx
import { DataTabModule } from './tabs/DataTabModule';

<DataTabModule
  data={projectData}
  onUpdate={handleDataUpdate}
  validation={validationStatus}
  isLoading={false}
  onAutoSave={handleAutoSave}
/>
```

## Integração com Sistema Existente

A implementação mantém total compatibilidade com:
- Sistema de validação existente
- Navegação entre abas
- Persistência de dados
- Sistema de templates
- Exportação de dados
- Integração com PDF

## Próximos Passos

1. **Testes**: Implementar testes unitários para as novas funcionalidades
2. **Validação**: Adicionar validações específicas para os novos campos
3. **Templates**: Criar templates pré-configurados com os novos dados
4. **Documentação**: Expandir a documentação de usuário
5. **Otimização**: Melhorar performance dos cálculos de dimensionamento