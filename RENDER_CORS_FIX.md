# Fix CORS and Proxy 404 on Render.com

## ✅ What We Fixed

1. **Simplified proxy route** - Updated `storefront/app/api/medusa-proxy/route.ts` to use a more reliable implementation
2. **Route is in correct location** - Confirmed at `storefront/app/api/medusa-proxy/route.ts`

## 🔧 What You Need to Do on Render.com

### Step 1: Update Backend CORS Environment Variables

Go to your **medusa-backend** service on Render.com:

1. Navigate to **Environment** tab
2. Update these environment variables:

   **STORE_CORS:**
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```
   ⚠️ **Important:** No spaces after commas, exact URL match

   **AUTH_CORS:**
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```

   **ADMIN_CORS:**
   ```
   https://medusa-backend-e42r.onrender.com,http://localhost:7001
   ```

3. Click **Save Changes**
4. Wait for backend to restart (1-2 minutes)

### Step 2: Verify Storefront is Web Service (Not Static)

1. Go to your **storefront** service on Render.com
2. Check the service type - it should be **Web Service** (not Static Site)
3. Verify these settings:
   - **Root Directory:** `storefront`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Environment:** Node

### Step 3: Verify Environment Variables on Storefront

In your **storefront** service, ensure:

- **NEXT_PUBLIC_MEDUSA_BACKEND_URL:** `https://medusa-backend-e42r.onrender.com`
- **NEXT_PUBLIC_MEDUSA_API_KEY:** Your publishable API key (get from Medusa admin)

### Step 4: Redeploy Storefront

After updating the proxy route code:

1. Push to GitHub (already done ✅)
2. Render should auto-deploy, or manually trigger a deploy
3. Wait for build to complete

### Step 5: Test the Proxy Route

After deployment, test:

```bash
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{}}'
```

**Expected results:**
- ✅ **200 OK** with product data = Proxy works!
- ❌ **404** = Route not found (check service type and root directory)
- ❌ **405** = Route exists but wrong method (shouldn't happen)

### Step 6: Test Checkout

1. Go to your storefront: `https://storefront-tg3r.onrender.com`
2. Add item to cart
3. Go to checkout
4. Check browser console - should **NOT** see:
   - ❌ `Proxy route not available (404)`
   - ❌ CORS errors

## 🎯 Summary

**Current Status:**
- ✅ Proxy route code is fixed and simplified
- ✅ Route file is in correct location
- ⚠️ Need to update CORS env vars on Render backend
- ⚠️ Need to verify storefront is Web Service (not Static)

**After fixes:**
- Proxy route will work (no more 404)
- Payment sessions will work (no CORS blocking)
- Checkout will complete successfully

## 📝 Quick Checklist

- [ ] Update `STORE_CORS` in backend service
- [ ] Update `AUTH_CORS` in backend service  
- [ ] Verify storefront is **Web Service** (not Static)
- [ ] Verify storefront root directory is `storefront`
- [ ] Redeploy storefront (or wait for auto-deploy)
- [ ] Test `/api/medusa-proxy` endpoint
- [ ] Test checkout flow

