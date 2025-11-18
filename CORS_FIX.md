# CORS Configuration Fix for Render.com

## Issue
The backend is blocking requests from the storefront due to CORS configuration. The error shows:
```
Access to fetch at 'https://medusa-backend-e42r.onrender.com/...' from origin 'https://storefront-tg3r.onrender.com' has been blocked by CORS policy
```

## Solution

You need to update the `STORE_CORS` and `AUTH_CORS` environment variables in your Render.com backend service to include your storefront URL.

### Steps:

1. Go to your Render.com dashboard: https://dashboard.render.com
2. Click on your `medusa-backend` service
3. Go to the "Environment" tab
4. Find `STORE_CORS` and update it to:
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```
   **Important:** Make sure there are NO spaces after commas, and the URL matches exactly.

5. Find `AUTH_CORS` and update it to:
   ```
   https://storefront-tg3r.onrender.com,http://localhost:3000
   ```

6. Also check `ADMIN_CORS` - it should be:
   ```
   https://medusa-backend-e42r.onrender.com,http://localhost:7001
   ```

7. Click "Save Changes"
8. The service will automatically restart (takes 1-2 minutes)

### Current URLs:
- Backend: `https://medusa-backend-e42r.onrender.com`
- Storefront: `https://storefront-tg3r.onrender.com`

### Why This Happens:
Medusa backend requires explicit CORS configuration. The `STORE_CORS` variable tells the backend which origins are allowed to make requests. Without your storefront URL in this list, the browser blocks all requests due to CORS policy.

### After Fixing:
Once you update the CORS settings and the backend restarts, refresh your storefront page. The CORS errors should be gone and payment sessions should work.

### Alternative: Using Proxy Route
The storefront also has a proxy route at `/api/medusa-proxy` that can bypass CORS issues, but it's better to fix CORS at the source (backend) for production.

