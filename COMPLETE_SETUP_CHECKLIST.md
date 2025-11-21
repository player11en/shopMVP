# Complete Setup Checklist - Payment Methods Not Working

## 🔍 Current Status
- ✅ Proxy route works with curl
- ❌ Checkout page gets 404 on proxy route
- ❌ Payment methods not working

## 🚨 Critical Issue: Render Deployment

The proxy route works with curl but not from the checkout page. This means:
1. **The route IS deployed** (curl works)
2. **But the latest code might not be deployed** (checkout uses old code)

## ✅ Step-by-Step Fix

### Step 1: Verify Route File Exists
```bash
# Should show the route file
ls -la storefront/app/api/medusa-proxy/route.ts
```

### Step 2: Force Render to Rebuild
1. Go to Render dashboard: https://dashboard.render.com
2. Click on **storefront** service
3. Go to **Settings** tab
4. Scroll down to **Build & Deploy**
5. Click **Clear build cache**
6. Go back to **Manual Deploy** tab
7. Click **Deploy latest commit**
8. **Wait for build to complete** (check logs)

### Step 3: Verify Build Includes Route
Check Render build logs for:
```
Route (app)                              Size     First Load JS
└ ○ /api/medusa-proxy                    ...      ...
```

If you don't see this, the route isn't being built.

### Step 4: Test After Deployment
After deployment completes:
```bash
# Test 1: GET request (should return usage info)
curl https://storefront-tg3r.onrender.com/api/medusa-proxy

# Test 2: POST request (should return products)
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{}}'
```

### Step 5: Test Checkout Page
1. Go to: https://storefront-tg3r.onrender.com/checkout?cart_id=YOUR_CART_ID
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for:
   - ✅ No "Proxy route not available (404)" messages
   - ✅ Payment sessions should be created successfully

## 🔧 Backend Configuration Check

### Verify Payment Providers are Enabled

1. **Go to Medusa Admin:**
   - URL: `https://medusa-backend-e42r.onrender.com/app`
   - Login with admin credentials

2. **Enable Payment Providers in Region:**
   - Go to: **Settings** → **Regions**
   - Click on your region (e.g., "Europe")
   - Scroll to **Payment Providers** section
   - Enable:
     - ✅ Stripe (if you have Stripe keys)
     - ✅ Bank Transfer (for testing)
     - ✅ PayPal (if configured)
   - Click **Save**

3. **Verify API Key has Sales Channel:**
   - Go to: **Settings** → **API Keys**
   - Find your publishable API key (the one in `NEXT_PUBLIC_MEDUSA_API_KEY`)
   - Make sure it has a **Sales Channel** assigned
   - If not, click **Edit** → Select a sales channel → **Save**

### Verify Environment Variables on Render

**Backend Service (`medusa-backend`):**
- ✅ `STORE_CORS` = `https://storefront-tg3r.onrender.com,http://localhost:3000`
- ✅ `AUTH_CORS` = `https://storefront-tg3r.onrender.com,http://localhost:3000`
- ✅ `STRIPE_API_KEY` = Your Stripe secret key (starts with `sk_`)
- ✅ `STRIPE_WEBHOOK_SECRET` = Your Stripe webhook secret (if using webhooks)

**Storefront Service (`storefront`):**
- ✅ `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = `https://medusa-backend-e42r.onrender.com`
- ✅ `NEXT_PUBLIC_MEDUSA_API_KEY` = Your publishable API key (starts with `pk_`)
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)

## 🐛 Debugging Steps

### If Proxy Still Returns 404 After Redeploy

1. **Check Render Build Logs:**
   - Look for errors about the route file
   - Check if TypeScript compilation succeeded
   - Verify the route is listed in build output

2. **Check Browser Console:**
   - Open DevTools → Network tab
   - Filter by "medusa-proxy"
   - Click on the failed request
   - Check:
     - Request URL (should be absolute: `https://storefront-tg3r.onrender.com/api/medusa-proxy`)
     - Request Method (should be POST)
     - Response Status (404?)

3. **Test Route Directly in Browser:**
   ```javascript
   // In browser console on checkout page:
   fetch('https://storefront-tg3r.onrender.com/api/medusa-proxy', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       path: '/store/products',
       method: 'GET',
       headers: {}
     })
   })
   .then(r => r.json())
   .then(d => console.log('✅ Works:', d))
   .catch(e => console.error('❌ Failed:', e))
   ```

### If Payment Providers Don't Show Up

1. **Check Region Configuration:**
   - Admin → Settings → Regions → Your Region
   - Payment Providers section should list available providers
   - Make sure at least one is enabled

2. **Check Cart Region:**
   - The cart must be in a region that has payment providers enabled
   - Check cart data: `cart.region_id` should match your configured region

3. **Check API Key Sales Channel:**
   - The API key must be linked to the same sales channel as your products
   - Admin → Settings → API Keys → Edit your key → Check Sales Channels

## 📋 Quick Verification Commands

```bash
# 1. Verify route file exists
ls -la storefront/app/api/medusa-proxy/route.ts

# 2. Test route locally (if running dev server)
curl http://localhost:3000/api/medusa-proxy

# 3. Test route on production
curl https://storefront-tg3r.onrender.com/api/medusa-proxy

# 4. Test with POST
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{}}'
```

## 🎯 Expected Behavior After Fix

1. ✅ Checkout page loads without errors
2. ✅ Payment providers appear in dropdown
3. ✅ Payment sessions are created successfully
4. ✅ Stripe form shows when Stripe is selected
5. ✅ Payment can be completed
6. ✅ Order is created successfully

## ⚠️ Common Issues

### Issue: "No payment providers available"
**Solution:** Enable payment providers in Admin → Settings → Regions

### Issue: "Publishable key needs to have a sales channel configured"
**Solution:** Run `cd my-store && npm run link-storefront-api-key`

### Issue: CORS errors
**Solution:** Update `STORE_CORS` and `AUTH_CORS` in backend environment variables

### Issue: Proxy 404
**Solution:** Clear build cache and redeploy storefront service

