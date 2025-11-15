# Deploy Storefront to Render.com

## Step 1: Get API Key from Backend (IMPORTANT!)

1. Go to: `https://medusa-backend-e42r.onrender.com/app`
2. Login to admin dashboard (create account if first time)
3. Navigate to: **Settings** → **API Keys**
4. Click **"Create API Key"** (if you don't have one)
5. **Copy the Publishable Key** (starts with `pk_`)
6. Save it - you'll need it in Step 3

---

## Step 2: Create Storefront Service in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select repository: `player11en/shopMVP`

---

## Step 3: Configure Storefront Service

### Basic Settings:
- **Name**: `storefront`
- **Root Directory**: `storefront`
- **Environment**: `Node`
- **Region**: Same as backend (Oregon)
- **Branch**: `main`
- **Plan**: Free (or Starter for production)

### Build & Deploy:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start`

---

## Step 4: Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

```
NODE_ENV=production
```

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend-e42r.onrender.com
```

```
NEXT_PUBLIC_MEDUSA_API_KEY=pk_YOUR_PUBLISHABLE_KEY_FROM_STEP_1
```
⚠️ **Replace with the actual publishable key from Step 1**

---

## Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (5-10 minutes)
3. **Note your storefront URL** (e.g., `https://storefront-xyz.onrender.com`)

---

## Step 6: Update Backend CORS

After storefront is deployed:

1. Go to **Medusa Backend** service → **Environment**
2. Update these variables:
   - `STORE_CORS`: `https://YOUR-STOREFRONT-URL.onrender.com,http://localhost:3000`
   - `AUTH_CORS`: `https://YOUR-STOREFRONT-URL.onrender.com,http://localhost:3000`
3. Click **"Save Changes"**
4. Backend will auto-redeploy

---

## ✅ Done!

Your storefront should now be live and connected to your backend!

