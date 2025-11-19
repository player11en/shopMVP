# Debug Proxy 404 Issue

## The Problem
- Manual test from browser console works ✅
- Checkout page gets 404 when calling proxy ❌
- Route file exists and is correct ✅

## Possible Causes

### 1. Render Build Cache Issue
The route might not be included in the production build.

**Solution:**
1. Go to Render dashboard → Storefront service
2. Click "Clear build cache"
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for full rebuild

### 2. Next.js Route Not Built
The route file might not be getting compiled.

**Check:**
- Verify the route file is at: `storefront/app/api/medusa-proxy/route.ts`
- Check Render build logs for any errors about the route
- Look for "Route /api/medusa-proxy" in build output

### 3. Timing Issue
The route might be called before Next.js is ready.

**Test:**
```javascript
// In browser console on checkout page:
setTimeout(() => {
  fetch('/api/medusa-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: '/store/products',
      method: 'GET',
      headers: {}
    })
  })
  .then(r => r.json())
  .then(d => console.log('✅ Delayed test works:', d))
  .catch(e => console.error('❌ Delayed test failed:', e))
}, 2000);
```

### 4. Route Path Resolution
Relative path might not resolve correctly.

**Already fixed:** Updated to use absolute URL `${window.location.origin}/api/medusa-proxy`

## Diagnostic Steps

### Step 1: Verify Route Exists
```bash
# Check if route file exists
ls -la storefront/app/api/medusa-proxy/route.ts

# Check git has the file
git ls-files storefront/app/api/medusa-proxy/route.ts
```

### Step 2: Test Route Directly
```bash
# From your local machine
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{}}'
```

### Step 3: Check Render Build Logs
1. Go to Render dashboard
2. Click on storefront service
3. Go to "Logs" tab
4. Look for build errors or warnings about API routes

### Step 4: Verify Next.js Version
Check if Next.js 16.0.1 properly supports API routes in `app/` directory.

## Quick Fix: Force Rebuild

1. **Clear Build Cache:**
   - Render dashboard → Storefront service → Settings
   - Click "Clear build cache"
   
2. **Redeploy:**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete (check logs)

3. **Verify:**
   - Test: `https://storefront-tg3r.onrender.com/api/medusa-proxy` (should return usage info)
   - Test checkout page again

## Alternative: Temporary CORS Fix

While debugging, ensure backend CORS is configured:

1. **Backend Environment Variables:**
   ```
   STORE_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
   AUTH_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
   ```

2. **This allows direct backend calls to work** (fallback will succeed)

## Next Steps

1. Clear build cache and redeploy
2. Check build logs for route compilation
3. Test route directly with curl
4. If still 404, check Next.js version compatibility

