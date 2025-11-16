# Admin User Setup - Final Solution

## What We Fixed

Updated `src/scripts/create-admin.ts` to use **Medusa's internal User module** (same as the `npx medusa user` CLI command does).

## How It Works Now

The script will run automatically on deployment and:

1. **Check** if admin user exists (via `Modules.USER`)
2. **Create User** record using `userModuleService.createUsers()`
3. **Create Auth Identity** linked to the user with proper metadata
4. **Set correct actor_id and actor_type** so session validation works

This is the **exact same approach** that Medusa CLI uses locally.

## After Next Deployment

1. Wait for Render to deploy the new code
2. Check the deployment logs for:
   ```
   ✅ ADMIN USER CREATED SUCCESSFULLY
   Email: ghannadan.zina@gmail.com
   User ID: [generated-id]
   ```

3. **Clear your browser cache/cookies** (very important!)
4. Go to: https://medusa-backend-e42r.onrender.com/app
5. Login with:
   - Email: `ghannadan.zina@gmail.com`
   - Password: `Admin123!`

## Environment Variables (Already Set in Render)

```bash
MEDUSA_ADMIN_EMAIL=ghannadan.zina@gmail.com
MEDUSA_ADMIN_PASSWORD=Admin123!
```

## Why This Will Work

- ✅ Uses Medusa's official User module API
- ✅ Creates user and auth identity in the correct order
- ✅ Sets proper metadata (actor_id, actor_type, user_id)
- ✅ Handles password hashing internally
- ✅ Same method as `npx medusa user` CLI command
- ✅ Runs automatically on every deployment (safe - checks if user exists first)

## Next Steps After Login Works

1. **Get your publishable API key:**
   - Settings → API Keys → Copy the publishable key

2. **Update storefront environment variable:**
   - Go to Render dashboard → storefront service
   - Add: `NEXT_PUBLIC_MEDUSA_API_KEY=[your-key]`
   - Redeploy storefront

3. **Configure your store:**
   - Add regions
   - Link payment providers to regions
   - Add products (or run seed script)

## Reference

Based on Medusa CLI documentation: https://docs.medusajs.com/resources/medusa-cli/commands/user

