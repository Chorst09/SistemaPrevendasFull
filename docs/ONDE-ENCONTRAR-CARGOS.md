# 🏢 Onde Encontrar o Sistema de Cargos e Salários

## 📍 **Localização do Sistema**

O novo sistema de **Cargos e Salários** foi implementado e está disponível em várias partes do sistema Service Desk Pricing:

### **1. 🌐 Acesso via Navegador**

#### **Opção 1: Através da Página de Projetos**
1. Acesse: `http://localhost:3004/projects`
2. Clique em qualquer projeto existente ou crie um novo
3. Na tela do projeto, vá para a aba **"Equipe"**
4. Dentro da aba Equipe, você verá 3 sub-abas:
   - **Equipe** - Gerenciar membros da equipe
   - **Cargos** - **← AQUI ESTÃO OS CARGOS E SALÁRIOS**
   - **Custos** - Análise de custos da equipe

#### **Opção 2: Através do Menu Principal**
1. Acesse: `http://localhost:3004`
2. No menu lateral, clique em **"Projetos"**
3. Clique em **"Acessar Projetos"**
4. Siga os passos da Opção 1

### **2. 🎯 Funcionalidades Disponíveis**

#### **Na Aba "Cargos":**
- ✅ **Visualizar todos os cargos** cadastrados
- ✅ **Criar novos cargos** com salários personalizados
- ✅ **Editar cargos existentes**
- ✅ **Excluir cargos** (com proteção para cargos em uso)
- ✅ **Ver estatísticas** (total, menor/maior salário, média)

#### **Na Aba "Equipe":**
- ✅ **Adicionar membros** selecionando cargos do dropdown
- ✅ **Escolher carga horária** (6h ou 8h)
- ✅ **Cálculo automático** do salário baseado no cargo
- ✅ **Editar/remover membros** da equipe

#### **Na Aba "Custos":**
- ✅ **Resumo financeiro** da equipe
- ✅ **Custos por cargo** detalhados
- ✅ **Projeções anuais** automáticas

### **3. 📊 Cargos Pré-Cadastrados**

O sistema já vem com os seguintes cargos cadastrados:

| Cargo | Nível | Salário 8h | Salário 6h |
|-------|-------|------------|------------|
| **Analista de Service Desk N1** | N1 | R$ 1.780,00 | R$ 1.580,00 |
| **Analista de Service Desk N2** | N2 | R$ 2.880,00 | - |
| **Analista de Service Desk N3** | N3 | R$ 7.380,00 | - |
| **Líder Técnico** | Liderança | R$ 5.200,00 | - |
| **Coordenador** | Gestão | R$ 9.800,00 | - |

### **4. 🔧 Como Usar**

#### **Para Adicionar um Membro à Equipe:**
1. Vá para **Projetos** → **Seu Projeto** → **Aba Equipe**
2. Clique em **"Adicionar Membro"**
3. Preencha o nome do colaborador
4. Selecione o **cargo** no dropdown
5. Escolha a **carga horária** (6h ou 8h)
6. O **salário será calculado automaticamente**
7. Clique em **"Salvar"**

#### **Para Gerenciar Cargos:**
1. Vá para **Projetos** → **Seu Projeto** → **Aba Equipe** → **Sub-aba Cargos**
2. Para **criar novo cargo**: Clique em **"Novo Cargo"**
3. Para **editar cargo**: Clique no ícone de edição
4. Para **excluir cargo**: Clique no ícone de lixeira (só funciona se não estiver em uso)

### **5. 🎨 Interface Visual**

#### **Badges Coloridos por Nível:**
- 🔵 **N1** - Azul
- 🟢 **N2** - Verde  
- 🟣 **N3** - Roxo
- 🟠 **Liderança** - Laranja
- 🔴 **Gestão** - Vermelho

#### **Indicadores Visuais:**
- 💰 **Salários** formatados em Real (R$)
- ⏰ **Carga horária** com badges (6h/8h)
- 📊 **Estatísticas** em tempo real
- ✅ **Status** dos cargos (ativo/inativo)

### **6. 🔄 Migração do Sistema Antigo**

#### **O que mudou:**
- ❌ **Antes:** Cadastro manual de cada funcionário com salário individual
- ✅ **Agora:** Seleção de cargos predefinidos com salários padronizados

#### **Compatibilidade:**
- ✅ **Dados antigos** são preservados para compatibilidade
- ✅ **Novos projetos** usam automaticamente o sistema de cargos
- ✅ **Projetos existentes** podem ser migrados gradualmente

### **7. 🚀 Próximos Passos**

#### **Para Começar a Usar:**
1. **Acesse** `http://localhost:3004/projects`
2. **Crie** um novo projeto ou abra um existente
3. **Vá** para a aba **"Equipe"**
4. **Explore** as sub-abas: Equipe, Cargos e Custos
5. **Adicione** membros usando os cargos predefinidos

#### **Para Personalizar:**
1. **Acesse** a sub-aba **"Cargos"**
2. **Crie** novos cargos específicos para sua empresa
3. **Ajuste** os salários conforme sua realidade
4. **Use** os novos cargos ao adicionar membros

### **8. 📱 Responsividade**

O sistema funciona perfeitamente em:
- 💻 **Desktop** - Experiência completa
- 📱 **Mobile** - Interface adaptada
- 📟 **Tablet** - Layout otimizado

### **9. ⚡ Performance**

- 🚀 **Carregamento rápido** com lazy loading
- 💾 **Cache inteligente** para melhor performance
- 🔄 **Atualizações em tempo real**
- 📊 **Cálculos automáticos** instantâneos

### **10. 🆘 Suporte**

Se você não conseguir encontrar o sistema:

1. **Verifique** se está na URL correta: `http://localhost:3004/projects`
2. **Certifique-se** de que o servidor está rodando
3. **Limpe** o cache do navegador (Ctrl+F5)
4. **Verifique** se há erros no console do navegador

---

## 🎉 **Resumo Rápido**

**Para acessar os Cargos e Salários:**
```
http://localhost:3004/projects
↓
Clique em um projeto
↓
Aba "Equipe"
↓
Sub-aba "Cargos" ← AQUI!
```

**Para usar na prática:**
```
Aba "Equipe" → "Adicionar Membro"
↓
Selecione o cargo no dropdown
↓
Salário calculado automaticamente!
```

O sistema está **100% funcional** e pronto para uso! 🚀