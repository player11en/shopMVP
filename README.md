# 🛍️ Medusa E-Commerce Store MVP

A modern e-commerce platform built with Medusa.js v2 and Next.js, featuring 3D product viewers, multiple payment providers, and support for both digital and physical products.

## ✨ Features

- 🎨 **3D Product Viewer** - Interactive 3D models using Three.js
- 📹 **Video Support** - Product demo videos
- 💳 **Multiple Payment Providers** - Stripe, PayPal, and Bank Transfer
- 📦 **Digital & Physical Products** - Support for both product types
- 🎯 **Modern UI/UX** - Clean, responsive design
- 🚀 **Easy Deployment** - Docker support and Render.com ready

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
./start.sh
```

This will start:
- PostgreSQL database
- Redis cache
- Medusa backend (port 9000)
- Next.js storefront (port 3000)

### Option 2: Local Development

**Backend:**
```bash
cd my-store
npm install
npm run dev
```

**Storefront:**
```bash
cd storefront
npm install
npm run dev
```

## 📁 Project Structure

```
shopMVP/
├── my-store/              # Medusa backend
│   ├── src/
│   │   ├── api/          # Custom API routes
│   │   └── providers/    # Payment providers (Stripe, PayPal, Bank Transfer)
│   └── medusa-config.ts  # Medusa configuration
├── storefront/            # Next.js storefront
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   └── lib/              # API helpers
├── docker-compose.yml    # Docker orchestration
├── render.yaml           # Render.com deployment config
└── start.sh              # Quick start script
```

## 🌐 Deployment

### Render.com (Recommended)

See **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** for detailed instructions.

Quick steps:
1. Deploy Medusa backend service
2. Get API key from admin dashboard
3. Deploy Next.js storefront with API key
4. Update CORS settings

### Docker

See **[DOCKER_SETUP.md](DOCKER_SETUP.md)** for Docker deployment guide.

## ⚙️ Configuration

### Environment Variables

**Backend** (`my-store/.env`):
```bash
DATABASE_URL=postgres://...
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:7001
STRIPE_API_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

**Storefront** (`storefront/.env.local`):
```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_API_KEY=pk_...
```

### Payment Setup

1. Get API keys from Stripe/PayPal
2. Add to backend `.env` file
3. In Admin Dashboard → Settings → Regions → Enable payment providers
4. See **[my-store/PAYMENT_SETUP.md](my-store/PAYMENT_SETUP.md)** for details

## 🎨 Product Features

### 3D Models
- Place GLB files in `my-store/static/models/`
- Add metadata: `model_3d_url: /models/your-model.glb`

### Videos
- Place videos in `my-store/static/videos/`
- Add metadata: `video_url: /videos/your-video.mp4`

### Digital Products
- Set metadata: `type: digital`
- Add download link in metadata

## 📚 Documentation

- **[RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)** - Deploy to Render.com
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Docker deployment guide
- **[my-store/PAYMENT_SETUP.md](my-store/PAYMENT_SETUP.md)** - Payment provider configuration

## 🛠️ Tech Stack

- **Backend**: Medusa.js v2, Node.js, PostgreSQL
- **Frontend**: Next.js 16, React 19, TypeScript
- **3D**: Three.js, React Three Fiber
- **Payments**: Stripe, PayPal
- **Styling**: Tailwind CSS

## 📄 License

MIT

## 🙏 Acknowledgments

Built with:
- [Medusa.js](https://medusajs.com/)
- [Next.js](https://nextjs.org/)
- [Three.js](https://threejs.org/)
- [Stripe](https://stripe.com/)
