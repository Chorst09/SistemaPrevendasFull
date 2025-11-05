#!/bin/bash

# Service Desk Pricing - Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="servicedesk-pricing"
APP_NAME="servicedesk-pricing"
REGISTRY="your-registry.com" # Replace with your registry
IMAGE_TAG=${1:-latest}

echo -e "${BLUE}🚀 Starting deployment of Service Desk Pricing${NC}"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    exit 1
fi

# Build and push Docker image
echo -e "${YELLOW}📦 Building Docker image...${NC}"
docker build -t ${REGISTRY}/${APP_NAME}:${IMAGE_TAG} .

echo -e "${YELLOW}📤 Pushing Docker image to registry...${NC}"
docker push ${REGISTRY}/${APP_NAME}:${IMAGE_TAG}

# Create namespace if it doesn't exist
echo -e "${YELLOW}🏗️  Creating namespace...${NC}"
kubectl apply -f k8s/namespace.yaml

# Apply ConfigMaps and Secrets
echo -e "${YELLOW}⚙️  Applying configuration...${NC}"
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy PostgreSQL
echo -e "${YELLOW}🐘 Deploying PostgreSQL...${NC}"
kubectl apply -f k8s/postgres.yaml

# Deploy Redis
echo -e "${YELLOW}🔴 Deploying Redis...${NC}"
kubectl apply -f k8s/redis.yaml

# Wait for databases to be ready
echo -e "${YELLOW}⏳ Waiting for databases to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/postgres -n ${NAMESPACE}
kubectl wait --for=condition=available --timeout=300s deployment/redis -n ${NAMESPACE}

# Update app deployment with new image
echo -e "${YELLOW}📝 Updating app deployment...${NC}"
sed "s|your-registry/servicedesk-pricing:latest|${REGISTRY}/${APP_NAME}:${IMAGE_TAG}|g" k8s/app.yaml | kubectl apply -f -

# Apply Ingress
echo -e "${YELLOW}🌐 Applying Ingress...${NC}"
kubectl apply -f k8s/ingress.yaml

# Wait for app deployment
echo -e "${YELLOW}⏳ Waiting for app deployment...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/servicedesk-app -n ${NAMESPACE}

# Check deployment status
echo -e "${YELLOW}🔍 Checking deployment status...${NC}"
kubectl get pods -n ${NAMESPACE}
kubectl get services -n ${NAMESPACE}
kubectl get ingress -n ${NAMESPACE}

# Get application URL
APP_URL=$(kubectl get ingress servicedesk-ingress -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}' 2>/dev/null || echo "localhost")

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Application URL: https://${APP_URL}${NC}"
echo -e "${GREEN}📊 Health Check: https://${APP_URL}/api/health${NC}"

# Show useful commands
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs: ${YELLOW}kubectl logs -f deployment/servicedesk-app -n ${NAMESPACE}${NC}"
echo -e "  Scale app: ${YELLOW}kubectl scale deployment servicedesk-app --replicas=5 -n ${NAMESPACE}${NC}"
echo -e "  Port forward: ${YELLOW}kubectl port-forward service/servicedesk-app-service 3000:80 -n ${NAMESPACE}${NC}"
echo -e "  Delete deployment: ${YELLOW}kubectl delete namespace ${NAMESPACE}${NC}"