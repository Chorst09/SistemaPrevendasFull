# Sistema de Service Desk

Sistema completo de precificação de Service Desk baseado na mesma arquitetura do módulo de Outsourcing de Impressão.

## 📁 Estrutura do Módulo

```
src/components/service-desk/
├── ServiceDeskModule.tsx                 # Módulo principal com navegação
├── ServiceDeskCalculatorModule.tsx       # Calculadora de propostas
├── ServiceDeskManagementModule.tsx       # Gestão de serviços
├── SLAManagementModule.tsx              # Gestão de SLAs
├── ServiceDeskPricingModule.tsx         # Precificação de serviços
├── ServiceDeskReportsModule.tsx         # Relatórios e métricas
└── README.md                           # Esta documentação
```

## 🎯 Funcionalidades Principais

### 1. **Calculadora de Service Desk**
- Interface com abas para organizar o processo
- Dados do cliente e projeto
- Seleção de serviços do catálogo ou personalizados
- Configuração de SLAs e níveis de serviço
- Cálculo automático de custos e métricas
- Geração de propostas em PDF

### 2. **Gestão de Serviços**
- Catálogo de serviços pré-configurados
- CRUD completo de serviços
- Níveis de serviço (Básico, Padrão, Premium, Empresarial)
- Configuração de custos e limites de usuários
- Funcionalidades incluídas por nível

### 3. **Gestão de SLA**
- Configuração de tempos de resposta e resolução
- SLAs por prioridade e categoria
- Suporte a horário comercial ou 24x7
- Templates de SLA pré-definidos
- Métricas de compliance

### 4. **Precificação Avançada**
- Custo por usuário/mês
- Custos de setup inicial
- Horas incluídas e custos adicionais
- Cálculo automático de métricas
- Simulação de receita

### 5. **Relatórios e Analytics**
- Dashboard com métricas principais
- Análise por período (7, 30, 90, 365 dias)
- Top clientes e serviços
- Tendências mensais
- Métricas de SLA

## 🏗️ Arquitetura

### Tipos e Interfaces
Localizados em `src/lib/types/service-desk.ts`:
- `ServiceDeskService` - Definição de serviços
- `ServiceDeskSLA` - Configuração de SLAs
- `ServiceDeskProposal` - Propostas geradas
- `ServiceDeskClientData` - Dados do cliente
- Enums para prioridades, categorias e níveis

### Constantes
Localizadas em `src/lib/constants/service-desk.ts`:
- Custos base por nível de serviço
- Templates de SLA padrão
- Métricas padrão por nível
- Configurações de validação
- Mensagens do sistema

### Armazenamento
- **LocalStorage**: Propostas e configurações
- **Estado Local**: Serviços e SLAs (dados de exemplo)
- **Futuro**: Integração com API/banco de dados

## 🎨 Interface do Usuário

### Design System
- Baseado no mesmo design do módulo de impressão
- Cards com hover effects e gradientes
- Cores específicas por nível de serviço
- Ícones consistentes (Lucide React)
- Layout responsivo

### Navegação
- Página inicial com overview das funcionalidades
- Navegação por módulos (home, calculator, services, sla, reports)
- Breadcrumbs e botões de voltar
- Estados de loading e feedback

## 📊 Níveis de Serviço

### Básico (R$ 25/usuário/mês)
- Suporte 8x5 (horário comercial)
- Email e telefone
- SLA básico
- 2h incluídas por usuário/mês
- Até 2 tickets por usuário/mês

### Padrão (R$ 45/usuário/mês)
- Suporte 12x5 (horário estendido)
- Email, telefone e chat
- SLA padrão
- 3h incluídas por usuário/mês
- Até 4 tickets por usuário/mês
- Acesso remoto

### Premium (R$ 75/usuário/mês)
- Suporte 24x5 (24h dias úteis)
- Todos os canais de comunicação
- SLA premium
- 4h incluídas por usuário/mês
- Tickets ilimitados
- Acesso remoto + suporte on-site

### Empresarial (R$ 120/usuário/mês)
- Suporte 24x7 (24h todos os dias)
- Todos os canais + WhatsApp
- SLA empresarial
- 6h incluídas por usuário/mês
- Tickets ilimitados
- Suporte on-site prioritário
- Gerente de conta dedicado

## 🔧 SLAs Padrão

### Por Prioridade
- **Crítica**: 5-15min resposta, 2-4h resolução
- **Alta**: 15-30min resposta, 4-8h resolução
- **Média**: 30-60min resposta, 8-24h resolução
- **Baixa**: 1-2h resposta, 24-72h resolução

### Por Categoria
- Hardware, Software, Rede, Segurança
- Acesso, Email, Impressora, Telefone
- Outros (geral)

## 📈 Métricas Calculadas

### Automáticas
- Tickets estimados por usuário/mês
- Tempo médio de resolução
- Custo por ticket
- Receita mensal projetada
- Horas adicionais estimadas

### Relatórios
- Taxa de conversão de propostas
- Valor total e médio por período
- Distribuição por nível de serviço
- Top clientes por valor
- Tendência mensal

## 🚀 Como Usar

### 1. Configuração Inicial
1. Acesse o módulo Service Desk
2. Configure os serviços no catálogo
3. Defina os SLAs necessários
4. Ajuste as configurações padrão

### 2. Criando uma Proposta
1. Clique em "Iniciar Cálculo"
2. Preencha os dados do cliente
3. Adicione serviços do catálogo ou personalizados
4. Configure o período do contrato
5. Revise o resumo e gere a proposta

### 3. Gestão Contínua
1. Monitore relatórios e métricas
2. Ajuste preços conforme necessário
3. Atualize SLAs baseado na performance
4. Analise tendências e oportunidades

## 🔄 Integração com Sistema Principal

### Navegação
- Integrado no menu "Calculadoras"
- Mesmo padrão de navegação dos outros módulos
- Compartilha componentes UI base

### Propostas
- Salvas no mesmo sistema de propostas
- Compatível com o gerenciador de propostas
- Exportação para PDF (futuro)

### Dados
- Tipos centralizados em `src/lib/types/`
- Constantes em `src/lib/constants/`
- Validações padronizadas

## 🛠️ Desenvolvimento

### Tecnologias
- **React 18** com TypeScript
- **Next.js 14** (App Router)
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Radix UI** para componentes base

### Padrões
- Componentes funcionais com hooks
- TypeScript strict mode
- Props interfaces bem definidas
- Tratamento de erros consistente
- Validação de dados

### Testes (Futuro)
- Testes unitários com Jest
- Testes de integração com Testing Library
- Testes E2E com Playwright
- Cobertura de código

## 📋 Roadmap

### Versão Atual (v1.0)
- ✅ Módulo principal completo
- ✅ Calculadora funcional
- ✅ Gestão de serviços e SLAs
- ✅ Relatórios básicos
- ✅ Integração com sistema principal

### Próximas Versões
- 🔄 Geração de PDF das propostas
- 🔄 Integração com API backend
- 🔄 Autenticação e permissões
- 🔄 Notificações e alertas
- 🔄 Exportação de relatórios
- 🔄 Dashboard avançado
- 🔄 Integração com CRM
- 🔄 Mobile responsivo

## 🤝 Contribuição

Para contribuir com o desenvolvimento:

1. Siga os padrões de código existentes
2. Mantenha a consistência com outros módulos
3. Documente novas funcionalidades
4. Teste thoroughly antes de commit
5. Use TypeScript strict mode

## 📞 Suporte

Para dúvidas ou problemas:
- Consulte esta documentação
- Verifique os tipos em `src/lib/types/service-desk.ts`
- Analise os exemplos nos outros módulos
- Abra uma issue no repositório