#!/bin/bash

# Stop Local Development Servers

echo "🛑 Stopping Local Development Servers..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Stopped backend (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend process not found${NC}"
    fi
    rm -f backend.pid
else
    echo -e "${YELLOW}⚠️  backend.pid not found${NC}"
fi

# Stop frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Stopped frontend (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend process not found${NC}"
    fi
    rm -f frontend.pid
else
    echo -e "${YELLOW}⚠️  frontend.pid not found${NC}"
fi

# Kill any remaining node processes on ports 9000 and 3000
lsof -ti:9000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Killed process on port 9000${NC}" || true
lsof -ti:3000 | xargs kill -9 2>/dev/null && echo -e "${GREEN}✅ Killed process on port 3000${NC}" || true

echo ""
echo -e "${GREEN}✅ All servers stopped${NC}"

