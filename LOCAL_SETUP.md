# Local Development Setup

## Quick Start

### 1. Start PostgreSQL
Make sure PostgreSQL is running locally:
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it (macOS with Homebrew):
brew services start postgresql@14
# or
brew services start postgresql@15
```

### 2. Update Backend .env
Edit `my-store/.env`:
```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/medusa_db
PORT=9000
NODE_ENV=development
```

### 3. Run Backend Setup
```bash
cd my-store

# Run migrations
npm run migrate

# Create admin user (optional, if you need one)
npm run create-admin

# Start backend in development mode
npm run dev
```

Backend will run at: `http://localhost:9000`

### 4. Update Frontend .env
Edit `storefront/.env.local`:
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_API_KEY=your_publishable_key_here
```

### 5. Start Frontend
```bash
cd storefront

# Start Next.js dev server
npm run dev
```

Frontend will run at: `http://localhost:3000`

## Architecture

**Frontend (Next.js)** → **Backend API (Medusa)** → **Database (PostgreSQL)**

- Frontend NEVER accesses database directly
- Frontend only makes HTTP requests to `http://localhost:9000`
- Backend handles all database operations

## Troubleshooting

### Database Connection Issues
```bash
# Check if database exists
psql -U your_user -d postgres -c "\l" | grep medusa_db

# Create database if it doesn't exist
createdb -U your_user medusa_db
```

### Port Already in Use
```bash
# Kill process on port 9000
lsof -ti:9000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

