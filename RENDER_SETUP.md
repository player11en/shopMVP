# 🚀 Render.com Deployment Guide

## Prerequisites

1. GitHub repository pushed (✅ Done: `https://github.com/player11en/shopMVP`)
2. Render.com account (sign up at https://render.com)
3. Stripe account (for payment processing)
4. PayPal account (optional, for PayPal payments)

---

## Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `medusa-db`
   - **Database**: `medusa` (or leave default)
   - **User**: (auto-generated)
   - **Plan**: Free (or Starter for production)
4. Click **"Create Database"**
5. **IMPORTANT - Copy the Internal Database URL:**
   - In your PostgreSQL service dashboard, go to **"Info"** tab
   - Find **"Internal Database URL"** (NOT External Database URL)
   - It looks like: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/medusa_xxxx`
   - **Copy this entire URL** - you'll paste it as `DATABASE_URL` in Step 2
   - ⚠️ **Use Internal URL** - External URL won't work for services on Render

---

## Step 2: Deploy Medusa Backend

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account and select repository: `player11en/shopMVP`
3. Configure the service:

   **Basic Settings:**
   - **Name**: `medusa-backend`
   - **Root Directory**: `my-store`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Plan**: Free (or Starter for production)

   **Build & Deploy:**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Set Environment Variables** (click "Advanced" → "Add Environment Variable"):

   **Required Variables:**
   
   ```
   NODE_ENV=production
   ```
   
   ```
   DATABASE_URL=postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/medusa_xxxx
   ```
   ⚠️ **Paste the Internal Database URL from Step 1** (starts with `postgresql://`)
   
   ```
   STORE_CORS=https://storefront.onrender.com,http://localhost:3000
   ```
   ⚠️ **Update `storefront.onrender.com`** with your actual storefront URL after Step 4
   
   ```
   ADMIN_CORS=https://medusa-backend.onrender.com,http://localhost:7001
   ```
   ⚠️ **Update `medusa-backend.onrender.com`** with your actual backend URL
   
   ```
   AUTH_CORS=https://storefront.onrender.com,http://localhost:3000
   ```
   ⚠️ **Update `storefront.onrender.com`** with your actual storefront URL after Step 4
   
   ```
   JWT_SECRET=<generate-random-string-32-chars>
   ```
   Generate with: `openssl rand -hex 32` (or use any 32+ character random string)
   
   ```
   COOKIE_SECRET=<generate-random-string-32-chars>
   ```
   Generate with: `openssl rand -hex 32` (or use any 32+ character random string)
   
   ```
   STRIPE_API_KEY=sk_test_xxxxxxxxxxxxx
   ```
   Get from: https://dashboard.stripe.com/test/apikeys (Secret key, starts with `sk_test_`)
   
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```
   Get from: Stripe Dashboard → Webhooks → Your endpoint → Signing secret (starts with `whsec_`)
   ⚠️ **Set this AFTER configuring webhook in Step 6**
   
   ```
   BANK_NAME=Your Bank Name
   ```
   Optional: Your bank name for bank transfer payments
   
   ```
   PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
   ```
   Optional: Get from PayPal Developer Dashboard
   
   ```
   PAYPAL_CLIENT_SECRET=xxxxxxxxxxxxx
   ```
   Optional: Get from PayPal Developer Dashboard
   
   ```
   PAYPAL_ENVIRONMENT=sandbox
   ```
   Use `sandbox` for testing, `live` for production

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Note the URL**: `https://medusa-backend.onrender.com`

---

## Step 3: Get API Key from Medusa Admin

1. Once backend is deployed, go to: `https://medusa-backend.onrender.com/app`
2. Create your admin account (first-time setup)
3. Go to **Settings** → **API Keys**
4. Click **"Create API Key"**
5. Copy the **Publishable Key** (starts with `pk_`)
6. **Save this** - you'll need it in Step 4

---

## Step 4: Deploy Next.js Storefront

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository: `player11en/shopMVP`
3. Configure the service:

   **Basic Settings:**
   - **Name**: `storefront`
   - **Root Directory**: `storefront`
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Plan**: Free (or Starter for production)

   **Build & Deploy:**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Set Environment Variables**:

   ```
   NODE_ENV=production
   ```
   
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend.onrender.com
   ```
   ⚠️ **Replace `medusa-backend.onrender.com`** with your actual backend URL from Step 2
   Example: `https://medusa-backend-abc123.onrender.com`
   
   ```
   NEXT_PUBLIC_MEDUSA_API_KEY=pk_xxxxxxxxxxxxx
   ```
   ⚠️ **Paste the Publishable Key from Step 3** (starts with `pk_`)
   Get it from: Medusa Admin → Settings → API Keys → Copy Publishable Key

5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes)
7. **Note the URL**: `https://storefront.onrender.com`

---

## Step 5: Update CORS Settings

1. Go back to **Medusa Backend** service → **Environment**
2. Update `STORE_CORS` to:
   ```
   STORE_CORS=https://storefront.onrender.com,http://localhost:3000
   ```
3. Click **"Save Changes"**
4. Backend will auto-redeploy

---

## Step 6: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://medusa-backend.onrender.com/hooks/stripe`
4. **Events to send**: Select all events (or at minimum: `payment_intent.succeeded`, `payment_intent.payment_failed`)
5. Copy the **Webhook signing secret** (starts with `whsec_`)
6. Update `STRIPE_WEBHOOK_SECRET` in Medusa Backend environment variables
7. Redeploy backend

---

## Step 7: Set Up Region & Payment Providers

1. Go to `https://medusa-backend.onrender.com/app`
2. Navigate to **Settings** → **Regions**
3. Edit your region (or create one)
4. Add payment providers:
   - ✅ Stripe
   - ✅ PayPal (if configured)
   - ✅ Bank Transfer
5. Save changes

---

## ✅ Verification Checklist

- [ ] Backend is accessible: `https://medusa-backend.onrender.com`
- [ ] Admin dashboard works: `https://medusa-backend.onrender.com/app`
- [ ] Storefront is accessible: `https://storefront.onrender.com`
- [ ] Can view products on storefront
- [ ] Can add items to cart
- [ ] Payment providers show in checkout
- [ ] Stripe webhook is configured

---

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard (click on service → "Logs" tab)
- Verify `DATABASE_URL` is correct:
  - ✅ Must use **Internal Database URL** (starts with `postgresql://`)
  - ❌ NOT External Database URL
  - Format: `postgresql://user:password@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
- Ensure all required environment variables are set
- Check if database is running (PostgreSQL service status)

### CORS errors
- Verify `STORE_CORS` includes your storefront URL
- Check that URLs match exactly (including `https://`)

### API key errors
- Verify `NEXT_PUBLIC_MEDUSA_API_KEY` is set in storefront
- Make sure you copied the **Publishable Key** (starts with `pk_`)

### Database connection errors
- ✅ Use the **Internal Database URL** (not External)
  - Internal URL: `postgresql://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname`
  - External URL: `postgres://user:pass@dpg-xxxxx-a.oregon-postgres.render.com/dbname` (won't work)
- Ensure database is running in Render dashboard (check PostgreSQL service status)
- Verify database name matches in URL
- Check if database user has correct permissions

### Build failures
- Check Node.js version (should be 18+)
- Review build logs for specific errors
- Ensure all dependencies are in `package.json`

---

## 📝 Notes

- **Free Tier**: Services spin down after 15 minutes of inactivity. First request may be slow.
- **Upgrade**: Consider Starter plan ($7/month) for production to avoid spin-downs
- **Custom Domain**: Add your domain in Render dashboard → Settings → Custom Domains
- **SSL**: Automatically provided by Render

---

## 🎉 You're Done!

Your store should now be live at:
- **Storefront**: `https://storefront.onrender.com`
- **Admin**: `https://medusa-backend.onrender.com/app`

