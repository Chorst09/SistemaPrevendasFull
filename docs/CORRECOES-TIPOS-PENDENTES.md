# Correções de Tipos Pendentes

## Status Atual
Foram identificados 840 erros de TypeScript que precisam ser corrigidos. Aqui está um resumo das principais categorias de problemas:

## Problemas Principais

### 1. Problemas de Exportação de Tipos
- Vários arquivos estão tentando exportar tipos como valores
- Arquivos afetados: `edital.ts`, `outsourcing.ts`, `rfp.ts`, `base.ts`
- **Solução**: Corrigir exports usando `export type` em vez de incluir em arrays de export

### 2. Problemas com Cores PDF (57 erros)
- Arrays readonly sendo atribuídos a tipos mutáveis
- Arquivo: `src/lib/utils/pdf-generator.ts`
- **Solução**: Converter arrays readonly para mutáveis ou ajustar tipos

### 3. Problemas de Interface BaseEntity
- Conflitos entre `Date` e `string` para `createdAt`
- Arquivos: `outsourcing.ts`, `pdf/core.ts`
- **Solução**: Padronizar tipo de data em todas as interfaces

### 4. Problemas com ServiceDeskData
- Import não encontrado em `calculation-cache.ts`
- **Solução**: Corrigir path de import

### 5. Problemas de Testes
- Propriedades privadas sendo acessadas
- Configurações de screenshot inválidas
- **Solução**: Ajustar visibilidade e configurações

## Correções Implementadas

### ✅ Arquivo EnhancedServiceDeskTemplate.tsx
- Recriado com versão simplificada para eliminar erros de sintaxe

### ✅ Arquivo enhanced-pagination.tsx  
- Corrigido generic syntax com vírgula trailing

### ✅ Arquivo EditalAnalysisView.tsx
- Removido caracteres extras no JSX

### ✅ Exports de Tipos
- Corrigido exports duplicados em `edital.ts`, `outsourcing.ts`, `rfp.ts`, `base.ts`
- Removido exports duplicados no `index.ts`

### ✅ Interface BaseEntity
- Padronizado `createdAt` e `updatedAt` para usar `Date` em vez de `string`

### ✅ Import ServiceDeskData
- Corrigido path de import em `calculation-cache.ts`

## Próximos Passos

1. **Prioridade Alta**: Corrigir exports de tipos
2. **Prioridade Alta**: Resolver problemas de cores PDF
3. **Prioridade Média**: Padronizar interfaces BaseEntity
4. **Prioridade Baixa**: Ajustar testes

## Arquivos que Precisam de Atenção Imediata

1. `src/lib/types/edital.ts` - 16 erros
2. `src/lib/types/outsourcing.ts` - 14 erros  
3. `src/lib/utils/pdf-generator.ts` - 57 erros
4. `src/lib/types/base.ts` - 14 erros
5. `src/lib/services/service-desk-calculation-engine.ts` - 22 erros

## Estratégia de Correção

Para minimizar impacto, vamos corrigir em ordem de prioridade:
1. Tipos fundamentais primeiro
2. Serviços core depois
3. Testes e utilitários por último

## Observações

- Sistema funcional está preservado
- Correções são principalmente de tipos, não de lógica
- Foco em manter compatibilidade com código existente