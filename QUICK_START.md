# Quick Start - Local Development

## One Command Start

```bash
./START_LOCAL.sh
```

This will:
1. Check PostgreSQL is running
2. Run database migrations
3. Start backend on http://localhost:9000
4. Start frontend on http://localhost:3000

## One Command Stop

```bash
./STOP_LOCAL.sh
```

## Manual Start (if scripts don't work)

### Terminal 1 - Backend
```bash
cd my-store
npm run dev
```

### Terminal 2 - Frontend
```bash
cd storefront
npm run dev
```

## URLs

- **Backend API:** http://localhost:9000
- **Admin Panel:** http://localhost:9000/app
- **Storefront:** http://localhost:3000

## Check Logs

```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 9000
lsof -ti:9000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection error
Make sure PostgreSQL is running:
```bash
pg_isready
# If not running:
brew services start postgresql@14
```

### CORS errors
Make sure `my-store/.env` has:
```
STORE_CORS=http://localhost:3000,http://localhost:7001
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:3000,http://localhost:7001
```

