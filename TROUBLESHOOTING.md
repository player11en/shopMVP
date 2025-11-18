# Troubleshooting Guide

## Current Status

✅ **CORS Settings:** Already configured correctly
✅ **Storefront:** Live at https://storefront-tg3r.onrender.com/
✅ **Backend:** Live at https://medusa-backend-e42r.onrender.com/

## Issues & Solutions

### 1. Proxy Route 404 Error

**Symptom:** `POST /api/medusa-proxy 404 (Not Found)`

**Cause:** The proxy route hasn't been deployed yet, or Next.js needs to rebuild.

**Solution:**
- Wait for Render to finish rebuilding the storefront (check Render dashboard)
- The route should be available after deployment completes
- If still 404 after deployment, check Render build logs for errors

**Workaround:** The code automatically falls back to direct backend calls when proxy returns 404. Since CORS is set, direct calls should work.

### 2. Products Not Loading

**Symptom:** "No products available yet" on homepage

**Possible Causes:**
1. **Backend not returning products** - Check if products exist in admin panel
2. **API key missing/invalid** - Verify `NEXT_PUBLIC_MEDUSA_API_KEY` is set in storefront environment
3. **Backend needs restart** - After setting CORS, backend should restart automatically

**Check:**
1. Go to https://medusa-backend-e42r.onrender.com/app
2. Check if products exist in Products section
3. Verify API key is created and set in storefront environment variables

### 3. CORS Still Blocking (Even After Setting)

**If CORS is set but still getting errors:**

1. **Verify exact URL match:**
   - Backend CORS must include: `https://storefront-tg3r.onrender.com`
   - No trailing slashes
   - No spaces after commas

2. **Backend restart required:**
   - After changing CORS, backend must restart
   - Check Render logs to confirm restart completed

3. **Test CORS directly:**
   ```bash
   curl -H "Origin: https://storefront-tg3r.onrender.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://medusa-backend-e42r.onrender.com/store/products
   ```

## Testing Steps

### 1. Test Backend Directly
```bash
curl https://medusa-backend-e42r.onrender.com/store/products \
  -H "x-publishable-api-key: YOUR_API_KEY"
```

### 2. Test Proxy Route (After Deployment)
```bash
curl -X POST https://storefront-tg3r.onrender.com/api/medusa-proxy \
  -H "Content-Type: application/json" \
  -d '{"path":"/store/products","method":"GET","headers":{},"body":null}'
```

### 3. Check Browser Console
- Open https://storefront-tg3r.onrender.com/
- Press F12 → Console tab
- Look for errors related to:
  - CORS
  - Network requests
  - API calls

## Environment Variables Checklist

### Storefront (Render)
- ✅ `NEXT_PUBLIC_MEDUSA_BACKEND_URL` = `https://medusa-backend-e42r.onrender.com`
- ✅ `NEXT_PUBLIC_MEDUSA_API_KEY` = Your publishable API key

### Backend (Render)
- ✅ `STORE_CORS` = `https://storefront-tg3r.onrender.com,http://localhost:3000`
- ✅ `AUTH_CORS` = `https://storefront-tg3r.onrender.com,http://localhost:3000`
- ✅ `ADMIN_CORS` = `https://medusa-backend-e42r.onrender.com,http://localhost:7001`

## Next Steps

1. **Wait for deployment** - Check Render dashboard for storefront build status
2. **Verify products exist** - Check backend admin panel
3. **Test after deployment** - Refresh storefront and check console
4. **If still issues** - Check Render logs for both services

