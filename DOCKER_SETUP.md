# Docker Setup Guide

This guide explains how to run the entire Medusa store using Docker Compose.

## 🐳 What's Included

The Docker setup includes:
- **PostgreSQL** (database)
- **Redis** (caching and job queue)
- **Medusa Backend** (API on port 9000)
- **Next.js Storefront** (frontend on port 3000)

## 📋 Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Ensure Docker is running

## 🚀 Quick Start (Local Development)

### 1. Copy Environment Variables

```bash
cp .env.docker .env
```

Edit `.env` and add your Stripe keys if needed.

### 2. Start All Services

```bash
docker-compose up -d
```

This will:
- Pull required images (postgres, redis)
- Build the backend and frontend
- Start all services in the background

### 3. Check Status

```bash
docker-compose ps
```

You should see:
- `medusa-postgres` (running)
- `medusa-redis` (running)
- `medusa-backend` (running)
- `medusa-storefront` (running)

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just storefront
docker-compose logs -f storefront
```

### 5. Access the Applications

- **Storefront**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **Admin Dashboard**: http://localhost:9000/app

## 🛠️ Useful Commands

### Stop all services
```bash
docker-compose down
```

### Stop and remove all data (fresh start)
```bash
docker-compose down -v
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Run migrations manually
```bash
docker-compose exec backend npm run db:migrate
```

### Seed the database
```bash
docker-compose exec backend npm run seed
```

### Access backend shell
```bash
docker-compose exec backend sh
```

### Access PostgreSQL
```bash
docker-compose exec postgres psql -U medusa -d medusa_db
```

## 🌐 Deploying to VPS (Oracle Cloud, DigitalOcean, etc.)

### Option 1: Docker Compose on VPS (Recommended for Free Tier)

1. **SSH into your VPS**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Install Docker and Docker Compose**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo apt install docker-compose-plugin -y
   ```

3. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/yourrepo.git
   cd yourrepo
   ```

4. **Configure environment variables**
   ```bash
   cp .env.docker .env
   nano .env  # Edit with your production keys
   ```

5. **Update docker-compose.yml for production**
   ```bash
   # Change STORE_CORS to your domain:
   STORE_CORS: https://yourstore.com,https://www.yourstore.com
   
   # Change NEXT_PUBLIC_MEDUSA_BACKEND_URL:
   NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://api.yourstore.com
   ```

6. **Start services**
   ```bash
   docker-compose up -d
   ```

7. **Set up reverse proxy (Nginx)**
   
   Create `/etc/nginx/sites-available/medusa`:
   ```nginx
   # Backend API
   server {
       listen 80;
       server_name api.yourstore.com;
       
       location / {
           proxy_pass http://localhost:9000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   
   # Storefront
   server {
       listen 80;
       server_name yourstore.com www.yourstore.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   Enable and restart:
   ```bash
   sudo ln -s /etc/nginx/sites-available/medusa /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d yourstore.com -d www.yourstore.com -d api.yourstore.com
   ```

### Option 2: Oracle Cloud Free Tier Specific Setup

Oracle Cloud Free Tier gives you:
- 2 AMD-based Compute VMs (1/8 OCPU, 1GB RAM each)
- OR 1 ARM-based Compute VM (4 OCPUs, 24GB RAM) - **RECOMMENDED**

**Recommended Setup for ARM Instance:**

1. **Create ARM instance** (Ampere A1)
   - Choose Ubuntu 22.04 ARM
   - Use all 4 OCPUs and 24GB RAM (free tier allows this!)

2. **Open ports in Oracle Cloud Console**
   - Go to Networking → Virtual Cloud Networks → Security Lists
   - Add Ingress Rules:
     - Port 80 (HTTP)
     - Port 443 (HTTPS)
     - Port 3000 (optional, for direct access)
     - Port 9000 (optional, for direct access)

3. **Open ports in Ubuntu firewall**
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw allow 3000
   sudo ufw allow 9000
   sudo ufw enable
   ```

4. **Follow steps from "Option 1" above**

## 📊 Resource Usage

Expected resource usage:
- **PostgreSQL**: ~50-100MB RAM
- **Redis**: ~10-20MB RAM
- **Backend**: ~200-400MB RAM
- **Storefront**: ~150-300MB RAM
- **Total**: ~500MB-1GB RAM

This fits comfortably in:
- Oracle Cloud ARM instance (24GB RAM)
- DigitalOcean $6/month droplet (1GB RAM)

## 🔧 Troubleshooting

### Services won't start
```bash
docker-compose logs backend
docker-compose logs storefront
```

### Database connection errors
```bash
# Check if postgres is running
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres
```

### Port already in use
```bash
# Find what's using the port
lsof -i :9000
lsof -i :3000

# Stop the process or change ports in docker-compose.yml
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

## 🎯 Production Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` and `COOKIE_SECRET` to strong random values
- [ ] Update `STORE_CORS` to your actual domain
- [ ] Update `NEXT_PUBLIC_MEDUSA_BACKEND_URL` to your API domain
- [ ] Use production Stripe keys (not test keys)
- [ ] Set up SSL certificates
- [ ] Set up automated backups for PostgreSQL
- [ ] Configure monitoring (Uptime Robot, etc.)
- [ ] Test the entire checkout flow
- [ ] Set up log rotation

## 💾 Backup & Restore

### Backup PostgreSQL
```bash
docker-compose exec postgres pg_dump -U medusa medusa_db > backup.sql
```

### Restore PostgreSQL
```bash
docker-compose exec -T postgres psql -U medusa medusa_db < backup.sql
```

## 📝 Notes

- Data persists in Docker volumes even after `docker-compose down`
- Use `docker-compose down -v` to delete all data and start fresh
- For production, consider using managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
- The ARM instance on Oracle Cloud Free Tier is powerful enough to handle thousands of daily visitors

