# Sistema de Turnos e Escalas Automáticas

## Visão Geral

Este documento descreve as funcionalidades implementadas para cálculo de turnos de 6 horas e criação automática de escalas baseadas no tipo de cobertura selecionado.

## Funcionalidades Implementadas

### 1. Turno de 6 Horas para N1

#### Configuração
- **Checkbox:** "Analista N1 fará turno de 6 horas?"
- **Impacto:** Reduz a capacidade mensal do N1 para 75% da capacidade de 8 horas

#### Cálculo Ajustado
```typescript
// Capacidade padrão N1: 100 chamados/mês (8h)
// Capacidade ajustada N1: 75 chamados/mês (6h)
const adjustedCapacity = n1SixHourShift ? n1Capacity * 0.75 : n1Capacity;
```

#### Exemplo Prático
- **8 horas:** 100 chamados/mês por agente
- **6 horas:** 75 chamados/mês por agente
- **Resultado:** Mais agentes N1 necessários para o mesmo volume

### 2. Tipos de Cobertura

#### 8x5 - Horário Comercial
- **Período:** Segunda a Sexta, 8h às 17h
- **Turnos:** 1 turno por nível
- **Características:**
  - N1: 8h ou 6h (conforme seleção)
  - N2: 8h fixo
  - Sem adicionais

#### 12x5 - Horário Estendido
- **Período:** Segunda a Sexta, 7h às 19h
- **Turnos:** 2 turnos para N1, 1 para N2
- **Características:**
  - N1 Manhã: 7h-13h (6h) ou 7h-15h (8h)
  - N1 Tarde: 13h-19h (6h) ou 11h-19h (8h)
  - N2: 7h-19h (12h)

#### 24x7 - Tempo Integral
- **Período:** Todos os dias, 24 horas
- **Turnos:** 4 turnos de 6h cada
- **Características:**
  - Turno 1: 00h-06h (Madrugada) - Adicional 30%
  - Turno 2: 06h-12h (Manhã) - Normal
  - Turno 3: 12h-18h (Tarde) - Normal
  - Turno 4: 18h-00h (Noite) - Adicional 20%

### 3. Criação Automática de Escalas

#### Processo Automatizado
1. **Cálculo de Dimensionamento:** Baseado em Erlang C
2. **Seleção de Cobertura:** 8x5, 12x5 ou 24x7
3. **Configuração de Turno:** 6h ou 8h para N1
4. **Geração de Escalas:** Automática ao clicar "Dimensionar Equipe"

#### Estrutura das Escalas Geradas

```typescript
interface GeneratedSchedule {
  id: string;
  name: string;
  shifts: Shift[];
  coverage: CoverageRequirement;
  specialRates: SpecialRateConfig[];
}
```

## Exemplos de Escalas Geradas

### Exemplo 1: 8x5 com N1 de 6 horas
**Configuração:**
- 100 usuários, 1.5 incidentes/usuário
- N1: 6 horas, N2: 8 horas
- Resultado: 2 N1, 1 N2

**Escala Gerada:**
```
Horário Comercial
├── N1 - Manhã (6h): 08:00-14:00 (2 agentes)
└── N2 - Comercial (8h): 08:00-17:00 (1 agente)
```

### Exemplo 2: 12x5 com N1 de 8 horas
**Configuração:**
- 300 usuários, 1.8 incidentes/usuário
- N1: 8 horas, N2: 8 horas
- Resultado: 5 N1, 2 N2

**Escala Gerada:**
```
Horário Estendido
├── N1 - Manhã (8h): 07:00-15:00 (3 agentes)
├── N1 - Tarde (8h): 11:00-19:00 (2 agentes)
└── N2 - Estendido (12h): 07:00-19:00 (2 agentes)
```

### Exemplo 3: 24x7
**Configuração:**
- 1000 usuários, 2.5 incidentes/usuário
- Resultado: 22 N1, 5 N2 = 27 agentes total
- Distribuição: 7 agentes por turno

**Escala Gerada:**
```
Cobertura 24x7
├── Turno 1 - Madrugada (00h-06h): 7 agentes (+30%)
├── Turno 2 - Manhã (06h-12h): 7 agentes
├── Turno 3 - Tarde (12h-18h): 7 agentes
└── Turno 4 - Noite (18h-00h): 6 agentes (+20%)
```

## Adicionais e Multiplicadores

### Turnos Especiais
- **Madrugada (00h-06h):** +30% (multiplicador 1.3)
- **Noite (18h-00h):** +20% (multiplicador 1.2)
- **Fim de Semana:** +10% (multiplicador 1.1)

### Aplicação dos Adicionais
```typescript
specialRates: [
  {
    name: 'Adicional Noturno',
    condition: 'night',
    multiplier: 1.2,
    applicableShifts: ['shift1', 'shift4']
  },
  {
    name: 'Adicional Fim de Semana',
    condition: 'weekend',
    multiplier: 1.1,
    applicableShifts: ['all']
  }
]
```

## Integração com Sistema

### Fluxo de Dados
1. **Aba Dados:** Configuração e dimensionamento
2. **Aba Equipe:** Criação automática de membros baseada nas escalas
3. **Aba Escala:** Visualização e ajuste das escalas geradas
4. **Aba Impostos:** Cálculo considerando adicionais

### Persistência
- Escalas são salvas automaticamente no `ServiceDeskData`
- Integração com `ServiceDeskDataManager`
- Sincronização entre abas

### Validação
- Cobertura mínima garantida
- Distribuição adequada de agentes
- Validação de horários e sobreposições

## Benefícios do Sistema

### 1. Automação Completa
- Elimina cálculos manuais
- Reduz erros de dimensionamento
- Acelera processo de precificação

### 2. Flexibilidade
- Suporte a diferentes tipos de cobertura
- Adaptação a turnos de 6h ou 8h
- Configuração personalizada

### 3. Precisão
- Baseado em teoria Erlang C
- Considera fatores reais (ocupação, TMA)
- Inclui margens de segurança

### 4. Transparência
- Mostra cálculos detalhados
- Exibe distribuição de chamados
- Feedback visual completo

## Próximas Melhorias

### 1. Otimização de Escalas
- Algoritmo de otimização para minimizar custos
- Balanceamento automático de carga
- Consideração de preferências de horários

### 2. Análise de Cenários
- Simulação de diferentes configurações
- Análise de impacto de mudanças
- Comparação de custos entre opções

### 3. Integração Avançada
- Importação de dados históricos
- Previsão de demanda sazonal
- Ajuste automático baseado em métricas

### 4. Relatórios Especializados
- Relatório de dimensionamento detalhado
- Análise de cobertura por horário
- Projeção de custos por turno