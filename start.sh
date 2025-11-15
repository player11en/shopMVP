#!/bin/bash

echo "🐳 Starting Medusa Store with Docker Compose..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your Stripe keys if needed."
    echo ""
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down

# Start services
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Access your applications:"
echo "   - Storefront:       http://localhost:3000"
echo "   - Backend API:      http://localhost:9000"
echo "   - Admin Dashboard:  http://localhost:9000/app"
echo ""
echo "📝 Useful commands:"
echo "   - View logs:        docker-compose logs -f"
echo "   - Stop services:    docker-compose down"
echo "   - Restart:          docker-compose restart"
echo ""
echo "🎯 First-time setup:"
echo "   1. Go to http://localhost:9000/app"
echo "   2. Create your admin account"
echo "   3. Add products with 3D models"
echo ""

