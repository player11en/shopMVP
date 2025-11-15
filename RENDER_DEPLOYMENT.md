# Deploying to Render.com

## Quick Setup

### 1. Deploy Medusa Backend

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `medusa-backend`
   - **Root Directory**: `my-store`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

5. Set Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgres-url>
   STORE_CORS=https://your-storefront.onrender.com,http://localhost:3000
   ADMIN_CORS=https://your-admin.onrender.com,http://localhost:7001
   AUTH_CORS=https://your-storefront.onrender.com,http://localhost:3000
   JWT_SECRET=<generate-random-string>
   COOKIE_SECRET=<generate-random-string>
   STRIPE_API_KEY=<your-stripe-key>
   STRIPE_WEBHOOK_SECRET=<your-stripe-webhook-secret>
   BANK_NAME=Your Bank Name
   PAYPAL_CLIENT_ID=<your-paypal-client-id>
   PAYPAL_CLIENT_SECRET=<your-paypal-secret>
   PAYPAL_ENVIRONMENT=sandbox
   ```

6. Click "Create Web Service"

### 2. Deploy Next.js Storefront

1. Click "New +" → "Web Service"
2. Connect the same GitHub repository
3. Configure:
   - **Name**: `storefront`
   - **Root Directory**: `storefront`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. Set Environment Variables:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend.onrender.com
   NEXT_PUBLIC_MEDUSA_API_KEY=<get-from-medusa-admin>
   ```

5. **Important**: After Medusa backend is deployed:
   - Go to `https://medusa-backend.onrender.com/app`
   - Login to admin
   - Go to Settings → API Keys
   - Copy the Publishable Key
   - Update `NEXT_PUBLIC_MEDUSA_API_KEY` in storefront service

6. Click "Create Web Service"

### 3. Update CORS Settings

After both services are deployed, update the backend CORS:

1. Go to Medusa Backend service → Environment
2. Update `STORE_CORS` to include your storefront URL:
   ```
   STORE_CORS=https://storefront.onrender.com,http://localhost:3000
   ```
3. Redeploy the backend

### 4. Database Setup

For production, use Render's PostgreSQL:

1. Click "New +" → "PostgreSQL"
2. Create database
3. Copy the Internal Database URL
4. Set as `DATABASE_URL` in Medusa backend
5. Run migrations: Connect to backend shell and run `npm run build` (migrations run automatically)

## Notes

- **CORS**: The proxy route in Next.js handles CORS for client-side requests
- **API Key**: Must be set after backend is deployed and admin is accessible
- **Webhooks**: Update Stripe webhook URL to `https://medusa-backend.onrender.com/hooks/stripe`
- **Free Tier**: Render free tier spins down after inactivity. Consider upgrading for production

## Troubleshooting

- **404 on proxy route**: Ensure Next.js build completed successfully
- **CORS errors**: Check that `STORE_CORS` includes your storefront URL
- **API key errors**: Verify `NEXT_PUBLIC_MEDUSA_API_KEY` is set correctly
- **Database errors**: Ensure migrations ran (check backend logs)

