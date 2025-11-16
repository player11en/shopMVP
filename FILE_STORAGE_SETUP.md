# File Storage Setup for Medusa

## Problem
- Image uploads show as placeholders
- Files are not persisted on Render (ephemeral filesystem)
- Need cloud storage for production

## Solutions

### Option 1: Use External URLs (Quick Fix - No Setup Needed)

**Works now without any changes!**

Just use direct URLs when adding product images:
```
https://playereleven.de/projekte/images/05_Zina_Charakter_Front_Alpha.webp
```

In Medusa Admin:
1. Create/Edit Product
2. Images section
3. Use "Add from URL" or paste URL directly
4. Save

**Pros:**
- ✅ Works immediately
- ✅ No configuration needed
- ✅ No extra costs

**Cons:**
- ❌ Must host images elsewhere
- ❌ No upload from admin

---

### Option 2: Cloudinary (Free Tier - Easiest Cloud Option)

**Free tier includes:**
- 25GB storage
- 25GB bandwidth/month
- Image transformations

**Setup:**

1. **Install Cloudinary module:**
```bash
cd my-store
npm install @medusajs/file-cloudinary
```

2. **Sign up for Cloudinary:**
- Go to: https://cloudinary.com/users/register_free
- Get: Cloud Name, API Key, API Secret

3. **Update `medusa-config.ts`:**
```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

export default defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          // ... existing payment providers ...
        ],
      },
    },
    {
      resolve: "@medusajs/file-cloudinary",
      options: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      },
    },
  ],
})
```

4. **Add environment variables to Render:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

5. **Redeploy**

Now uploads will work in admin!

---

### Option 3: AWS S3 (More Control, Requires AWS Account)

**Setup:**

1. **Install S3 module:**
```bash
cd my-store
npm install @medusajs/file-s3
```

2. **Create S3 bucket and IAM user in AWS**

3. **Update `medusa-config.ts`:**
```typescript
{
  resolve: "@medusajs/file-s3",
  options: {
    s3_url: process.env.S3_URL,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    access_key_id: process.env.S3_ACCESS_KEY_ID,
    secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
  },
}
```

4. **Add environment variables to Render**

---

## Image Security: Preventing Free Downloads

### Reality Check
**If an image is visible on the web, it can be downloaded.** Period.

However, you can make it harder:

### 1. **Signed URLs (Recommended)**

Use temporary, expiring URLs:

**With Cloudinary:**
```typescript
// Generate signed URL with expiration
const signedUrl = cloudinary.url('image.jpg', {
  sign_url: true,
  type: 'authenticated',
  expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
})
```

**With S3:**
```typescript
// Pre-signed URL with expiration
const url = s3.getSignedUrl('getObject', {
  Bucket: 'my-bucket',
  Key: 'image.jpg',
  Expires: 3600 // 1 hour
})
```

### 2. **Watermarks**

Add watermarks to preview images, sell unwatermarked versions.

**Cloudinary automatic watermarking:**
```typescript
const url = cloudinary.url('image.jpg', {
  overlay: 'watermark',
  gravity: 'center',
  opacity: 30
})
```

### 3. **Token-Based Access**

Check if user has purchased before serving image:

```typescript
// Custom middleware
app.get('/secure-image/:productId', async (req, res) => {
  const userId = req.user.id
  const productId = req.params.productId
  
  // Check if user owns this product
  const hasPurchased = await checkPurchase(userId, productId)
  
  if (!hasPurchased) {
    return res.status(403).json({ error: 'Not purchased' })
  }
  
  // Serve image or redirect to signed URL
  const signedUrl = generateSignedUrl(productId)
  res.redirect(signedUrl)
})
```

### 4. **DRM (Digital Rights Management)**

For serious protection:
- Use DRM services like Widevine, FairPlay
- Encrypted streams
- **Very complex and expensive**

### 5. **Practical Approach for Your Store**

**For previews:**
- Use regular URLs (like your character image)
- Add watermarks
- Lower resolution

**For purchased content:**
- Store full-res files on S3/Cloudinary
- Generate signed URLs after purchase
- Expire URLs after download or time limit
- Track downloads per user

---

## Recommended Setup for You

**Phase 1 (Now):**
1. Use external URLs for images
2. Host on your domain: `playereleven.de`
3. Focus on getting the store working

**Phase 2 (Before Launch):**
1. Set up Cloudinary (free tier)
2. Configure automatic watermarks for previews
3. Store full-res files separately
4. Generate signed URLs after purchase

**Phase 3 (Growth):**
1. Implement download tracking
2. Add purchase verification
3. Consider paid Cloudinary/S3 tier
4. Implement proper DRM if needed

---

## Quick Start: Using Your Existing Images

Your image works perfectly now:
```
https://playereleven.de/projekte/images/05_Zina_Charakter_Front_Alpha.webp
```

**To use it:**
1. Go to Medusa Admin → Products
2. Create/Edit product
3. Images section → Add URL
4. Paste: `https://playereleven.de/projekte/images/05_Zina_Charakter_Front_Alpha.webp`
5. Save

Done! No file service setup needed.

---

## Summary

| Method | Setup Time | Cost | Security | Best For |
|--------|-----------|------|----------|----------|
| External URLs | 0 mins | Free | Low | Testing, MVP |
| Cloudinary | 30 mins | Free tier | Medium | Production |
| AWS S3 | 1-2 hours | Pay per use | High | Enterprise |
| Signed URLs | Varies | Depends | High | Paid content |

**Recommendation:** Start with external URLs, add Cloudinary before launch.

