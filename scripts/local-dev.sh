#!/bin/bash

# Service Desk Pricing - Local Development Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Service Desk Pricing - Local Development${NC}"

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose is not installed or not in PATH${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please update .env file with your configuration${NC}"
fi

# Start services
echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
docker-compose up -d postgres redis

# Wait for databases
echo -e "${YELLOW}⏳ Waiting for databases to be ready...${NC}"
sleep 10

# Run Prisma migrations
echo -e "${YELLOW}🔄 Running database migrations...${NC}"
npx prisma migrate dev --name init

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    npx prisma db seed
fi

# Start the application
echo -e "${YELLOW}🚀 Starting Next.js application...${NC}"
npm run dev &

# Wait a bit for the app to start
sleep 5

echo -e "${GREEN}✅ Development environment is ready!${NC}"
echo -e "${GREEN}🌐 Application: http://localhost:3000${NC}"
echo -e "${GREEN}📊 Health Check: http://localhost:3000/api/health${NC}"
echo -e "${GREEN}🐘 PostgreSQL: localhost:5432${NC}"
echo -e "${GREEN}🔴 Redis: localhost:6379${NC}"

# Show useful commands
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "  View logs: ${YELLOW}docker-compose logs -f${NC}"
echo -e "  Stop services: ${YELLOW}docker-compose down${NC}"
echo -e "  Reset database: ${YELLOW}npx prisma migrate reset${NC}"
echo -e "  Prisma Studio: ${YELLOW}npx prisma studio${NC}"

# Keep script running
wait