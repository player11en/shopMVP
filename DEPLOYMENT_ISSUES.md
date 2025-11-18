# Deployment Issues & Solutions

## Current Issues

### 1. Proxy Route 404 Error
**Error:** `POST https://storefront-tg3r.onrender.com/api/medusa-proxy 404 (Not Found)`

**Cause:** The Next.js API route might not be deployed yet, or Next.js needs to rebuild.

**Solution:**
- The route exists at `storefront/app/api/medusa-proxy/route.ts`
- After pushing to GitHub, Render should automatically rebuild
- Wait for the storefront service to finish deploying
- The route should be available at: `https://storefront-tg3r.onrender.com/api/medusa-proxy`

**Verify:** After deployment, test the route:
```bash
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{},"body":null}'
```

### 2. CORS Error (Backend)
**Error:** `Access to fetch at 'https://medusa-backend-e42r.onrender.com/...' from origin 'https://storefront-tg3r.onrender.com' has been blocked by CORS policy`

**Cause:** Backend `STORE_CORS` environment variable doesn't include the storefront URL.

**Solution:** Update Render.com backend environment variables:

1. Go to: https://dashboard.render.com
2. Click on `medusa-backend` service
3. Go to "Environment" tab
4. Update `STORE_CORS`:
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```
5. Update `AUTH_CORS`:
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```
6. Save and wait for restart (1-2 minutes)

### 3. Fallback Behavior
The code falls back to direct fetch when proxy returns 404, which then hits CORS. Once both are fixed:
- Proxy route works → No CORS issues
- Backend CORS fixed → Direct fetch also works

## How It Works

### Proxy Route (Preferred)
1. Frontend calls `/api/medusa-proxy` (same origin, no CORS)
2. Proxy forwards request to backend
3. Proxy adds CORS headers to response
4. Frontend receives response

### Direct Fetch (Fallback)
1. Frontend calls backend directly
2. Backend must have CORS headers
3. Requires `STORE_CORS` to include storefront URL

## Testing After Fix

1. **Test Proxy Route:**
   ```javascript
   fetch('/api/medusa-proxy', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       path: '/store/products',
       method: 'GET',
       headers: {},
       body: null
     })
   })
   ```

2. **Test Direct Backend:**
   ```javascript
   fetch('https://medusa-backend-e42r.onrender.com/store/products', {
     headers: {
       'x-publishable-api-key': 'YOUR_API_KEY'
     }
   })
   ```

## Expected Behavior After Fix

✅ Proxy route returns 200 (not 404)
✅ CORS errors disappear
✅ Payment sessions work
✅ Cart operations work
✅ All API calls succeed

## If Issues Persist

1. Check Render deployment logs for build errors
2. Verify environment variables are set correctly
3. Check browser console for specific error messages
4. Test backend CORS directly with curl:
   ```bash
   curl -H "Origin: https://storefront-tg3r.onrender.com" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://medusa-backend-e42r.onrender.com/store/carts/...
   ```

