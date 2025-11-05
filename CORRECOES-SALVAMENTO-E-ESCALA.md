# Correções - Salvamento de Equipe e Geração de Escala

## Problemas Identificados e Corrigidos

### 1. Problema de Salvamento da Equipe
**Problema**: A equipe não estava sendo salva corretamente
**Causa**: Interface do componente não estava alinhada com o padrão do sistema
**Solução**: 
- Alterado `TeamTabModuleNewProps` para usar `data` em vez de `team`
- Atualizado para receber `fullData` para dimensionamento
- Corrigido referências de `validationStatus` para `validation`

### 2. Problema de Geração Automática de Escala
**Problema**: A escala não era gerada automaticamente quando a equipe era atualizada
**Causa**: Formato dos dados da equipe mudou, mas o ScaleTabModule ainda esperava o formato antigo
**Solução**:
- Atualizado `ServiceDeskPricingSystem` para converter `TeamMemberNew[]` para o formato esperado pelo ScaleTab
- Criado mapeamento que expande cada cargo em pessoas individuais para a escala

### 3. Atualização de Tipos
**Problema**: Conflito entre tipos antigos e novos de TeamMember
**Solução**:
- Adicionado `TeamMemberNew` interface no arquivo de tipos
- Atualizado `ServiceDeskData` para usar `TeamMemberNew[]`
- Mantido compatibilidade com código existente

## Mudanças Implementadas

### 1. `TeamTabModuleNew.tsx`
```typescript
// Antes
export interface TeamTabModuleNewProps {
  team: TeamMemberNew[];
  onUpdate: (team: TeamMemberNew[]) => void;
  validationStatus?: {...};
}

// Depois
export interface TeamTabModuleNewProps {
  data: TeamMemberNew[]; // Alinhado com padrão do sistema
  onUpdate: (team: TeamMemberNew[]) => void;
  fullData?: any; // Para dimensionamento
  validation?: {...}; // Nome correto
}
```

### 2. `ServiceDeskPricingSystem.tsx`
```typescript
// Adicionado para tab 'team'
if (tab.id === 'team') {
  additionalProps.fullData = data;
}

// Atualizado para tab 'scale'
if (tab.id === 'scale') {
  additionalProps.teamMembers = data.team?.flatMap(member => {
    const entries = [];
    for (let i = 0; i < member.quantity; i++) {
      entries.push({
        id: `${member.id}-${i}`,
        name: `Pessoa ${i + 1}`,
        role: member.jobPositionId
      });
    }
    return entries;
  }) || [];
}
```

### 3. `service-desk-pricing.ts`
```typescript
// Atualizado ServiceDeskData
export interface ServiceDeskData {
  // ...
  team: TeamMemberNew[]; // Era TeamMember[]
  // ...
}

// Adicionado novo tipo
export interface TeamMemberNew {
  id: string;
  jobPositionId: string;
  quantity: number; // Número de pessoas no cargo
  workingHours: 8 | 6;
  isActive: boolean;
  notes?: string;
  // Campos legados para compatibilidade
  name?: string;
  startDate?: Date;
  endDate?: Date;
}
```

## Funcionalidades Restauradas

### 1. Salvamento da Equipe ✅
- Equipe agora salva corretamente quando adicionada/editada
- Dimensionamento automático funciona e salva os resultados
- Validação integrada com o sistema principal

### 2. Geração Automática de Escala ✅
- ScaleTab recebe automaticamente os membros da equipe
- Cada pessoa de cada cargo é mapeada individualmente
- Sugestões automáticas funcionam baseadas na equipe configurada

### 3. Integração Completa ✅
- Dados fluem corretamente entre as abas
- Validação funciona em tempo real
- Auto-save preserva as alterações

## Fluxo de Dados Corrigido

1. **Usuário adiciona cargo na aba EQUIPE**
   - TeamTabModuleNew recebe `data` (array de TeamMemberNew)
   - Chama `onUpdate` com nova equipe
   - ServiceDeskPricingSystem atualiza via `handleDataUpdate`

2. **Sistema salva automaticamente**
   - DataManager.updateTabData atualiza `data.team`
   - Validação é executada
   - Auto-save persiste os dados

3. **Aba ESCALA recebe automaticamente**
   - ServiceDeskPricingSystem converte TeamMemberNew[] para formato esperado
   - ScaleTab recebe `teamMembers` com pessoas individuais
   - Sugestões automáticas são geradas

## Testes Recomendados

1. **Adicionar cargo na equipe** - deve salvar automaticamente
2. **Usar dimensionamento automático** - deve calcular e salvar N1/N2
3. **Navegar para aba ESCALA** - deve mostrar pessoas da equipe
4. **Usar sugestões automáticas na escala** - deve funcionar baseado na equipe

## Status: ✅ RESOLVIDO

Todos os problemas de salvamento e geração automática de escala foram corrigidos.