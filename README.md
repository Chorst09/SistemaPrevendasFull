# Sistema de Prevendas Completo

Sistema completo de prevendas com módulos integrados para Service Desk, análise de editais, geração de PDFs e muito mais.

## 🚀 Funcionalidades Principais

### Service Desk Pricing System
- ✅ **Dimensionamento Automático** com cálculo Erlang C
- ✅ **Geração Automática de Escala** de trabalho
- ✅ **Interface Renovada** com validação em tempo real
- ✅ **Gestão de Cargos e Salários** integrada
- ✅ **Sistema de Relatórios** avançado
- ✅ **Dashboard Executivo** com KPIs

### Módulos Integrados
- 📊 **Análise de Editais** com IA
- 📄 **Geração de PDFs** profissionais
- 🖨️ **Calculadora de Outsourcing** de impressão
- 💰 **Sistema de Cotações** e propostas
- 👥 **Gestão de Parceiros** e vendedores
- 📈 **Forecasting** e análise de tendências

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco de Dados**: PostgreSQL
- **Containerização**: Docker, Kubernetes
- **Testes**: Vitest, Playwright
- **Deploy**: Vercel, Docker

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/Chorst09/SistemaPrevendasFull.git
cd SistemaPrevendasFull

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute as migrações do banco
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🐳 Docker

```bash
# Build e execute com Docker Compose
docker-compose up --build

# Ou use os scripts fornecidos
./scripts/local-dev.sh
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## 📋 Funcionalidades Detalhadas

### Sistema Service Desk
- **Dimensionamento Automático**: Cálculo preciso de equipe usando Erlang C
- **Geração de Escala**: Criação automática de escalas de trabalho
- **Validação em Tempo Real**: Verificação instantânea de dados
- **Gestão de Cargos**: Sistema completo de posições e salários
- **Relatórios Avançados**: Geração de relatórios personalizados

### Análise de Editais
- **Processamento com IA**: Análise automática de documentos
- **Extração de Dados**: Identificação de requisitos e prazos
- **Recomendações**: Sugestões baseadas em análise de viabilidade

### Geração de PDFs
- **Templates Profissionais**: Modelos personalizáveis
- **Integração Completa**: Dados do sistema automaticamente incluídos
- **Validação de Conteúdo**: Verificação antes da geração

## 🔧 Configuração

### Variáveis de Ambiente
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

### Banco de Dados
O sistema usa PostgreSQL com Prisma ORM. Execute as migrações:
```bash
npx prisma migrate dev
npx prisma db seed
```

## 📊 Monitoramento

- **Health Check**: `/api/health`
- **Métricas**: Integração com ferramentas de monitoramento
- **Logs**: Sistema de logging estruturado

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes visuais
npm run test:visual
```

## 📚 Documentação

- [Guia de Deploy](./DEPLOYMENT-GUIDE.md)
- [Sistema Completo](./SISTEMA-COMPLETO.md)
- [Correções Implementadas](./CORRECOES-FINALIZADAS.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Carlos Horst**
- GitHub: [@Chorst09](https://github.com/Chorst09)
- LinkedIn: [Carlos Horst](https://linkedin.com/in/carloshorst)

## 🎯 Status do Projeto

✅ **Sistema Funcional** - Todas as funcionalidades principais implementadas
✅ **Correções de Tipos** - 782 erros TypeScript corrigidos
✅ **Interface Renovada** - UX/UI otimizada
✅ **Testes Implementados** - Cobertura de testes abrangente
✅ **Deploy Ready** - Pronto para produção

---

**Última atualização**: Novembro 2024