# Sistema de Cadastro de Funcionários

## 📋 Visão Geral

O Sistema de Cadastro de Funcionários permite gerenciar um banco de dados centralizado de funcionários que podem ser reutilizados em múltiplos projetos de precificação.

## 🚀 Como Usar

### 1. Acessar o Cadastro

**Opção A - Pelo Cabeçalho Principal:**
- No cabeçalho do sistema, clique no botão **"Funcionários"** (ícone de usuários)

**Opção B - Pela Aba Equipe:**
- Vá para a aba **"Equipe"**
- Clique em **"Gerenciar Cadastro"**

### 2. Cadastrar Funcionários

1. Clique em **"Novo Funcionário"**
2. Preencha os dados obrigatórios:
   - **Nome completo**
   - **Cargo** (ex: Analista de Service Desk N1)
   - **CPF** (validação automática)
   - **Email** (validação automática)
   - **Salário mensal**
3. Preencha dados opcionais:
   - **Telefone**
   - **Departamento**
   - **Carga horária semanal** (padrão: 40h)
   - **Observações**
4. Defina se o funcionário está **ativo**
5. Clique em **"Salvar"**

### 3. Usar na Equipe do Projeto

Na **aba Equipe**, você tem duas opções:

**Selecionar do Cadastro:**
1. Clique em **"Selecionar do Cadastro"**
2. Use os filtros para encontrar o funcionário:
   - Busca por nome
   - Filtro por departamento
   - Filtro por status (ativo/inativo)
3. Clique em **"Selecionar Funcionário"** no card desejado
4. O funcionário será automaticamente adicionado à equipe com todos os dados preenchidos

**Adicionar Manualmente:**
- Use o botão **"Adicionar Membro"** para criar um novo membro sem usar o cadastro

## 📊 Funcionalidades

### Busca e Filtros
- **Busca por nome:** Digite no campo de busca
- **Filtro por departamento:** TI, Service Desk, Suporte, Infraestrutura
- **Filtro por status:** Ativo, Inativo, Todos

### Estatísticas
- Total de funcionários cadastrados
- Funcionários ativos vs inativos
- Distribuição por departamento
- Distribuição por cargo
- Salário médio

### Validações Automáticas
- **CPF:** Validação completa com dígitos verificadores
- **Email:** Validação de formato
- **Campos obrigatórios:** Nome, cargo, CPF, email, salário

### Gestão de Dados
- **Editar:** Clique em "Editar" no card do funcionário
- **Excluir:** Clique em "Excluir" (com confirmação)
- **Status:** Ative/desative funcionários sem excluí-los
- **Histórico:** Data de criação e última atualização

## 💡 Dicas de Uso

### Padronização de Cargos
Use cargos padronizados para facilitar a busca:
- Analista de Service Desk N1
- Analista de Service Desk N2
- Analista de Service Desk N3
- Coordenador de Service Desk
- Supervisor de Service Desk
- Gerente de Service Desk

### Organização por Departamentos
- **TI:** Equipe técnica geral
- **Service Desk:** Equipe específica de atendimento
- **Suporte:** Equipe de suporte técnico
- **Infraestrutura:** Equipe de infraestrutura

### Benefícios e Encargos
O sistema calcula automaticamente:
- Custo por hora baseado no salário e carga horária
- Aplicação dos benefícios padrão (FGTS, INSS, etc.)
- Integração com cálculos de custos do projeto

## 🔄 Integração com Projetos

### Reutilização de Dados
- Funcionários cadastrados podem ser usados em múltiplos projetos
- Dados são copiados para o projeto (não vinculados)
- Alterações no cadastro não afetam projetos existentes

### Sincronização
- Para atualizar dados de um funcionário em projetos existentes, é necessário:
  1. Remover o funcionário da equipe do projeto
  2. Adicionar novamente do cadastro atualizado

## 📱 Interface

### Cards de Funcionários
Cada funcionário é exibido em um card com:
- **Avatar:** Inicial do nome com cor baseada no status
- **Nome e cargo**
- **Departamento, email e salário**
- **Status:** Badge ativo/inativo
- **Ações:** Editar, excluir ou selecionar

### Modos de Visualização
- **Modo Gestão:** Permite editar, excluir e criar funcionários
- **Modo Seleção:** Permite apenas selecionar funcionários para a equipe

## 🔒 Armazenamento

Os dados são armazenados localmente no navegador usando:
- **LocalStorage:** Para persistência dos dados
- **Validação:** Verificação de integridade na inicialização
- **Backup:** Dados são mantidos mesmo após fechamento do navegador

## ⚠️ Limitações

- Dados são locais ao navegador (não sincronizam entre dispositivos)
- Não há controle de acesso ou permissões
- Exclusão de funcionários é permanente (sem lixeira)
- Não há histórico de alterações detalhado

## 🆘 Solução de Problemas

### Funcionário não aparece na busca
- Verifique os filtros aplicados
- Confirme se o funcionário está ativo
- Verifique se o nome está correto

### Erro ao salvar funcionário
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme se o CPF é válido
- Verifique se o email tem formato correto

### Dados perdidos
- Verifique se o LocalStorage do navegador não foi limpo
- Confirme se está usando o mesmo navegador e perfil
- Dados são específicos por domínio/URL