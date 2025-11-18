#!/bin/bash

# Start Local Development Servers
# This script starts both backend and frontend for local testing

echo "🚀 Starting Local Development Environment..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! pg_isready > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting it...${NC}"
    brew services start postgresql@14 2>/dev/null || brew services start postgresql@15 2>/dev/null
    sleep 2
fi

if pg_isready > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}⚠️  Could not verify PostgreSQL. Continuing anyway...${NC}"
fi

echo ""

# Start Backend
echo -e "${BLUE}Starting Medusa Backend...${NC}"
cd "$(dirname "$0")/my-store"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Please create it first.${NC}"
    exit 1
fi

# Set NODE_ENV to development for local
export NODE_ENV=development

# Run migrations first
echo -e "${BLUE}Running database migrations...${NC}"
npm run migrate 2>&1 | grep -v "redisUrl not found" | grep -v "Pg connection" || true

# Start backend in background
echo -e "${GREEN}✅ Starting backend server on http://localhost:9000${NC}"
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../backend.pid

# Wait a bit for backend to start
sleep 5

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may have failed to start. Check backend.log${NC}"
fi

echo ""

# Start Frontend
echo -e "${BLUE}Starting Next.js Frontend...${NC}"
cd "$(dirname "$0")/storefront"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating it...${NC}"
    cat > .env.local << EOF
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_API_KEY=pk_4c2de4f8b6923e0566e9e7ccfd5d1c282db97ade5b2d360fd8930f0bcc22ed2d
EOF
fi

# Start frontend
echo -e "${GREEN}✅ Starting frontend server on http://localhost:3000${NC}"
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../frontend.pid

# Wait a bit for frontend to start
sleep 3

if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may have failed to start. Check frontend.log${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Local Development Environment Ready!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Backend:  ${BLUE}http://localhost:9000${NC}"
echo -e "Admin:    ${BLUE}http://localhost:9000/app${NC}"
echo -e "Frontend: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "Logs:"
echo -e "  Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "  Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo ""
echo -e "To stop servers:"
echo -e "  ${YELLOW}./STOP_LOCAL.sh${NC} or kill the PIDs in backend.pid and frontend.pid"
echo ""

