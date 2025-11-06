# 🚀 Guia Completo de Deploy - Service Desk Pricing

## 📋 **Visão Geral da Arquitetura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kubernetes    │    │     Docker      │    │   PostgreSQL    │
│    Cluster      │◄──►│   Containers    │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│     Redis       │◄─────────────┘
                        │     Cache       │
                        └─────────────────┘
```

### **Stack Tecnológico:**
- **Frontend:** Next.js 15 + React + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Containerização:** Docker + Docker Compose
- **Orquestração:** Kubernetes
- **Proxy:** Nginx (Load Balancer)

## 🛠️ **Pré-requisitos**

### **Desenvolvimento Local:**
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (opcional, pode usar Docker)
- Redis 7+ (opcional, pode usar Docker)

### **Produção:**
- Kubernetes Cluster (v1.24+)
- kubectl configurado
- Docker Registry (Docker Hub, AWS ECR, etc.)
- Domínio configurado (opcional)
- Certificado SSL (opcional)

## 🏗️ **Configuração Inicial**

### **1. Clone e Configuração**
```bash
# Clone o repositório
git clone <repository-url>
cd servicedesk-pricing

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com suas configurações
```

### **2. Configuração do Banco de Dados**
```bash
# Gere o cliente Prisma
npx prisma generate

# Execute migrações
npx prisma migrate dev --name init

# (Opcional) Seed do banco
npx prisma db seed
```

## 🐳 **Desenvolvimento Local com Docker**

### **Opção 1: Script Automatizado**
```bash
# Execute o script de desenvolvimento
./scripts/local-dev.sh
```

### **Opção 2: Manual**
```bash
# Inicie apenas os bancos de dados
docker-compose up -d postgres redis

# Execute migrações
npx prisma migrate dev

# Inicie a aplicação
npm run dev
```

### **Serviços Disponíveis:**
- **Aplicação:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/health
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Prisma Studio:** `npx prisma studio`

## 🚀 **Deploy em Produção**

### **1. Preparação da Imagem Docker**

```bash
# Build da imagem
docker build -t your-registry/servicedesk-pricing:v1.0.0 .

# Push para registry
docker push your-registry/servicedesk-pricing:v1.0.0
```

### **2. Configuração do Kubernetes**

#### **Atualizar Configurações:**
```bash
# Edite os arquivos de configuração
vim k8s/configmap.yaml    # Configurações da aplicação
vim k8s/secrets.yaml      # Secrets (use base64)
vim k8s/app.yaml         # Atualize a imagem Docker
vim k8s/ingress.yaml     # Configure seu domínio
```

#### **Criar Secrets (Recomendado):**
```bash
# Crie secrets via kubectl (mais seguro)
kubectl create secret generic servicedesk-secrets \
  --from-literal=DATABASE_URL="postgresql://user:pass@postgres-service:5432/servicedesk_pricing" \
  --from-literal=NEXTAUTH_SECRET="your-secret-key" \
  --from-literal=REDIS_URL="redis://:password@redis-service:6379" \
  --namespace=servicedesk-pricing
```

### **3. Deploy Automatizado**
```bash
# Execute o script de deploy
./scripts/deploy.sh v1.0.0
```

### **4. Deploy Manual**
```bash
# Crie namespace
kubectl apply -f k8s/namespace.yaml

# Aplique configurações
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy bancos de dados
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# Aguarde bancos ficarem prontos
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n servicedesk-pricing
kubectl wait --for=condition=available --timeout=300s deployment/redis -n servicedesk-pricing

# Deploy aplicação
kubectl apply -f k8s/app.yaml

# Configure ingress
kubectl apply -f k8s/ingress.yaml
```

## 📊 **Monitoramento e Verificação**

### **Verificar Status do Deploy:**
```bash
# Status dos pods
kubectl get pods -n servicedesk-pricing

# Status dos services
kubectl get services -n servicedesk-pricing

# Status do ingress
kubectl get ingress -n servicedesk-pricing

# Logs da aplicação
kubectl logs -f deployment/servicedesk-app -n servicedesk-pricing
```

### **Health Checks:**
```bash
# Health check interno
kubectl exec -it deployment/servicedesk-app -n servicedesk-pricing -- curl http://localhost:3000/api/health

# Health check externo (se ingress configurado)
curl https://your-domain.com/api/health
```

## 🔧 **Configurações Avançadas**

### **1. Scaling Horizontal**
```bash
# Scale manual
kubectl scale deployment servicedesk-app --replicas=5 -n servicedesk-pricing

# HPA já configurado no k8s/app.yaml
# Escala automática baseada em CPU/Memory
```

### **2. Backup do Banco de Dados**
```bash
# Backup manual
kubectl exec -it deployment/postgres -n servicedesk-pricing -- pg_dump -U postgres servicedesk_pricing > backup.sql

# Restore
kubectl exec -i deployment/postgres -n servicedesk-pricing -- psql -U postgres servicedesk_pricing < backup.sql
```

### **3. Configuração de SSL/TLS**
```yaml
# No k8s/ingress.yaml, configure cert-manager
metadata:
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: servicedesk-tls
```

### **4. Configuração de Recursos**
```yaml
# No k8s/app.yaml, ajuste recursos conforme necessário
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

## 🔒 **Segurança**

### **1. Secrets Management**
- Use Kubernetes Secrets para dados sensíveis
- Considere usar HashiCorp Vault ou AWS Secrets Manager
- Nunca commite secrets no código

### **2. Network Policies**
```yaml
# Exemplo de Network Policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: servicedesk-network-policy
  namespace: servicedesk-pricing
spec:
  podSelector:
    matchLabels:
      app: servicedesk-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
  - to:
    - podSelector:
        matchLabels:
          app: redis
```

### **3. RBAC**
```yaml
# Exemplo de RBAC
apiVersion: v1
kind: ServiceAccount
metadata:
  name: servicedesk-sa
  namespace: servicedesk-pricing
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: servicedesk-role
  namespace: servicedesk-pricing
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list"]
```

## 📈 **Performance e Otimização**

### **1. Cache Strategy**
- Redis para cache de sessões
- Next.js cache para páginas estáticas
- CDN para assets estáticos

### **2. Database Optimization**
```sql
-- Índices recomendados
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_team_members_project_id ON team_members(project_id);
CREATE INDEX idx_forecast_projections_forecast_scenario ON forecast_projections(forecast_id, scenario_id);
```

### **3. Monitoring**
```yaml
# Prometheus monitoring (opcional)
apiVersion: v1
kind: Service
metadata:
  name: servicedesk-metrics
  namespace: servicedesk-pricing
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "3000"
    prometheus.io/path: "/api/metrics"
spec:
  selector:
    app: servicedesk-app
  ports:
  - port: 3000
```

## 🚨 **Troubleshooting**

### **Problemas Comuns:**

#### **1. Pod não inicia**
```bash
# Verificar logs
kubectl describe pod <pod-name> -n servicedesk-pricing
kubectl logs <pod-name> -n servicedesk-pricing

# Verificar recursos
kubectl top pods -n servicedesk-pricing
```

#### **2. Banco de dados não conecta**
```bash
# Testar conectividade
kubectl exec -it deployment/servicedesk-app -n servicedesk-pricing -- nc -zv postgres-service 5432

# Verificar secrets
kubectl get secret servicedesk-secrets -n servicedesk-pricing -o yaml
```

#### **3. Aplicação lenta**
```bash
# Verificar métricas
kubectl top pods -n servicedesk-pricing
kubectl top nodes

# Verificar HPA
kubectl get hpa -n servicedesk-pricing
```

### **Comandos Úteis:**
```bash
# Port forward para debug local
kubectl port-forward service/servicedesk-app-service 3000:80 -n servicedesk-pricing

# Executar shell no container
kubectl exec -it deployment/servicedesk-app -n servicedesk-pricing -- /bin/sh

# Verificar configuração
kubectl get configmap servicedesk-config -n servicedesk-pricing -o yaml

# Restart deployment
kubectl rollout restart deployment/servicedesk-app -n servicedesk-pricing
```

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Example:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Build and Push
      run: |
        docker build -t ${{ secrets.REGISTRY }}/servicedesk-pricing:${{ github.sha }} .
        docker push ${{ secrets.REGISTRY }}/servicedesk-pricing:${{ github.sha }}
    - name: Deploy to K8s
      run: |
        ./scripts/deploy.sh ${{ github.sha }}
```

## 📚 **Recursos Adicionais**

### **Documentação:**
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### **Monitoramento:**
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Jaeger para tracing
- Sentry para error tracking

### **Backup e Disaster Recovery:**
- Velero para backup do Kubernetes
- pg_dump para backup do PostgreSQL
- Redis persistence configurado

---

## ✅ **Checklist de Deploy**

### **Pré-Deploy:**
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets criados no Kubernetes
- [ ] Imagem Docker buildada e pushed
- [ ] Domínio configurado (se aplicável)
- [ ] Certificados SSL configurados (se aplicável)

### **Deploy:**
- [ ] Namespace criado
- [ ] ConfigMaps aplicados
- [ ] Secrets aplicados
- [ ] PostgreSQL deployado e funcionando
- [ ] Redis deployado e funcionando
- [ ] Migrações executadas
- [ ] Aplicação deployada
- [ ] Ingress configurado

### **Pós-Deploy:**
- [ ] Health checks passando
- [ ] Logs sem erros críticos
- [ ] Aplicação acessível via URL
- [ ] Banco de dados populado
- [ ] Cache funcionando
- [ ] Monitoramento configurado
- [ ] Backup configurado

**🎉 Parabéns! Sua aplicação Service Desk Pricing está rodando em produção!**