# Geração Automática de Escala - Implementado

## Funcionalidade Implementada

Quando a equipe é dimensionada automaticamente, o sistema agora também gera uma escala básica de trabalho baseada no tipo de cobertura configurado.

## Como Funciona

### 1. Integração com Dimensionamento
- Após calcular N1 e N2, o sistema chama `generateBasicSchedule()`
- A escala é gerada baseada nos parâmetros de cobertura da aba DADOS
- Os membros da equipe são automaticamente distribuídos nos turnos

### 2. Tipos de Cobertura Suportados

#### 8x5 (Horário Comercial)
```typescript
// Segunda a Sexta, 8h às 18h
{
  name: 'Horário Comercial',
  shifts: [{
    name: 'Turno Comercial',
    startTime: '08:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Segunda a Sexta
    teamMembers: [...] // Todos os membros
  }]
}
```

#### 12x5 (Horário Estendido)
```typescript
// Segunda a Sexta, 6h às 18h com 2 turnos
{
  name: 'Horário Estendido',
  shifts: [
    {
      name: 'Turno Manhã',
      startTime: '06:00',
      endTime: '14:00',
      teamMembers: [...] // Metade do N1
    },
    {
      name: 'Turno Tarde',
      startTime: '10:00',
      endTime: '18:00',
      teamMembers: [...] // Outra metade N1 + N2
    }
  ]
}
```

#### 24x7 (Atendimento Contínuo)
```typescript
// 3 turnos, 7 dias por semana
{
  name: 'Atendimento 24x7',
  shifts: [
    {
      name: 'Turno Manhã (6h-14h)',
      startTime: '06:00',
      endTime: '14:00',
      multiplier: 1.0
    },
    {
      name: 'Turno Tarde (14h-22h)',
      startTime: '14:00',
      endTime: '22:00',
      multiplier: 1.2
    },
    {
      name: 'Turno Noite (22h-6h)',
      startTime: '22:00',
      endTime: '06:00',
      multiplier: 1.5,
      isSpecialShift: true
    }
  ]
}
```

### 3. Distribuição de Membros

#### Algoritmo de Distribuição
- **8x5**: Todos os membros no mesmo turno
- **12x5**: N1 dividido entre manhã e tarde, N2 concentrado na tarde
- **24x7**: Membros divididos igualmente entre os 3 turnos

#### Identificação de Membros
```typescript
// Cada pessoa recebe um ID único
teamMembers: teamMembers.flatMap(member => {
  const entries = [];
  for (let i = 0; i < member.quantity; i++) {
    entries.push(`${member.id}-${i}`);
  }
  return entries;
})
```

## Implementação Técnica

### 1. Interface Atualizada
```typescript
export interface TeamTabModuleNewProps {
  data: TeamMemberNew[];
  onUpdate: (team: TeamMemberNew[]) => void;
  fullData?: any;
  onUpdateSchedule?: (schedules: any[]) => void; // NOVO
  isLoading?: boolean;
  validation?: {...};
}
```

### 2. Callback de Atualização
```typescript
// No ServiceDeskPricingSystem
if (tab.id === 'team') {
  additionalProps.fullData = data;
  additionalProps.onUpdateSchedule = (schedules: any[]) => {
    handleDataUpdate('scale', schedules);
  };
}
```

### 3. Função de Geração
```typescript
const generateBasicSchedule = useCallback((teamMembers, fullData) => {
  const coverageType = fullData.project.dimensioning.coverageType;
  const schedules = [];

  // Lógica de geração baseada no tipo de cobertura
  switch (coverageType) {
    case 'BUSINESS_HOURS':
    case '8x5':
      // Gerar escala 8x5
      break;
    case 'EXTENDED_HOURS':
    case '12x5':
      // Gerar escala 12x5
      break;
    case 'FULL_TIME':
    case '24x7':
      // Gerar escala 24x7
      break;
  }

  // Atualizar sistema
  if (onUpdateSchedule) {
    onUpdateSchedule(schedules);
  }
}, [jobPositions, onUpdateSchedule]);
```

## Fluxo Completo

1. **Usuário clica "Dimensionar Equipe"**
2. **Sistema calcula N1 e N2** baseado em Erlang C
3. **Cria cargos na equipe** com quantidades calculadas
4. **Gera escala automaticamente** baseada na cobertura
5. **Atualiza aba ESCALA** com a nova escala
6. **Mostra confirmação** com resumo do dimensionamento

## Benefícios

### ✅ Automação Completa
- Dimensionamento + Escala em um clique
- Configuração baseada nos parâmetros do projeto
- Distribuição inteligente de membros

### ✅ Flexibilidade
- Suporte a diferentes tipos de cobertura
- Multiplicadores automáticos para turnos especiais
- Preservação de cargos existentes (N3, Líder, etc.)

### ✅ Integração
- Dados fluem automaticamente entre abas
- Escala aparece imediatamente na aba ESCALA
- Validação automática do sistema

## Exemplo de Uso

1. **Configurar Dados**
   - 100 usuários
   - 1.5 chamados/usuário/mês
   - Cobertura 24x7
   - 80% distribuição N1

2. **Dimensionar Equipe**
   - Clica "Dimensionar Equipe"
   - Sistema calcula: N1=3, N2=2

3. **Resultado Automático**
   - Equipe criada com 3 N1 + 2 N2
   - Escala 24x7 gerada com 3 turnos
   - Membros distribuídos automaticamente

## Status: ✅ IMPLEMENTADO

A geração automática de escala está funcionando completamente integrada com o dimensionamento da equipe.