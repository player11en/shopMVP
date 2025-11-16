# Fix Admin Login "Invalid Key" Error

## Problem
- API authentication works (`/auth/admin/emailpass` returns a valid token)
- Admin dashboard UI at `/app` shows "Invalid key" error
- Issue is likely CORS/cookie configuration

## Solution

### Update Environment Variables in Render Dashboard

Go to your `medusa-backend` service → Environment tab and update:

```bash
# Current (WRONG):
ADMIN_CORS=https://medusa-backend-e42r.onrender.com,http://localhost:7001

# Updated (CORRECT):
ADMIN_CORS=https://medusa-backend-e42r.onrender.com
```

The admin dashboard is served from the same domain (`/app` path), so it only needs to allow requests from its own origin.

### Alternative: Disable Admin CORS (since it's same-origin)

```bash
ADMIN_CORS=true
```

This allows all origins for the admin (less secure, but fine for testing).

### After updating:

1. Save the environment variable in Render dashboard
2. Redeploy the backend (it will auto-deploy)
3. Wait for deployment to complete
4. Clear your browser cache/cookies
5. Try logging in again with:
   - Email: `ghannadan.zina@gmail.com`
   - Password: `Admin123!`

## Verification

Your auth is working correctly - tested via curl:
```bash
✅ /auth/user/emailpass - works (returns token)
✅ /auth/admin/emailpass - works (returns token with actor_type: admin)
```

The issue is purely in the frontend admin dashboard cookie/session handling.

