# 🚀 Render.com Setup Guide - Quick Fix for CORS and Payments

## 🔴 Step 1: Update and Deploy (1 minute)

The `render.yaml` file has been updated with correct CORS URLs. Deploy it:

```bash
git add render.yaml
git commit -m "fix: update CORS configuration for production URLs"
git push origin main
```

This will trigger automatic deployment on Render.com.

---

## 🔴 Step 2: Set Required Environment Variables (5 minutes)

### Backend Service: `medusa-backend`

Go to: [Render Dashboard](https://dashboard.render.com/) → `medusa-backend` → **Environment**

**Add/Update these variables:**

#### Database (CRITICAL - Without this, backend won't start):
```
DATABASE_URL
```
Value: Your PostgreSQL connection string from Render
- If you don't have a database yet:
  1. Go to Render Dashboard → New → PostgreSQL
  2. Create database
  3. Copy the "Internal Database URL"
  4. Paste it as `DATABASE_URL` value

#### API Keys (Required for payments):
```
STRIPE_API_KEY
```
Value: Get from https://dashboard.stripe.com/test/apikeys
- Login to Stripe Dashboard
- Go to "Developers" → "API keys"
- Copy "Secret key" (starts with `sk_test_...`)
- **Important:** This is the SECRET key, not the publishable key

```
STRIPE_WEBHOOK_SECRET
```
Value: (Optional for now, can add later)
- Leave empty or set to `whsec_placeholder` for now
- You'll configure webhooks after basic setup works

```
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
```
Values: Get from https://developer.paypal.com/dashboard/applications
- Login to PayPal Developer Dashboard
- Go to "Apps & Credentials"
- Select "Sandbox" environment
- Copy "Client ID" and "Secret"
- **Or leave empty if you don't want PayPal (bank transfer and Stripe will still work)**

#### Admin User (For automatic admin creation):
```
MEDUSA_ADMIN_EMAIL=admin@yourstore.com
MEDUSA_ADMIN_PASSWORD=SecurePassword123!
```
Change these to your preferred admin credentials.

#### CORS (Already set by render.yaml, verify they're correct):
```
STORE_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
ADMIN_CORS=https://medusa-backend-e42r.onrender.com,http://localhost:7001
AUTH_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
```

After adding variables, click **"Save Changes"** - backend will automatically redeploy.

---

### Storefront Service: `storefront`

Go to: [Render Dashboard](https://dashboard.render.com/) → `storefront` → **Environment**

**Add these variables:**

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend-e42r.onrender.com
```

```
NEXT_PUBLIC_MEDUSA_API_KEY
```
Value: You'll get this from Medusa Admin (see Step 3)
- For now, leave it empty and deploy
- You'll update it after Step 3

After adding, click **"Save Changes"** - storefront will automatically redeploy.

---

## 🟡 Step 3: Get API Key from Medusa Admin (3 minutes)

**Wait for backend to finish deploying** (check Render dashboard).

Then:

1. Go to: https://medusa-backend-e42r.onrender.com/app
2. Login with credentials:
   - Email: `admin@yourstore.com` (or what you set in Step 2)
   - Password: `SecurePassword123!` (or what you set in Step 2)
3. Navigate to: **Settings** → **API Key Management** → **Publishable API Keys**
4. You should see a key that starts with `pk_...`
   - If no key exists, click "Create API Key"
   - Give it a name like "Storefront Key"
5. **Copy the key** (starts with `pk_...`)
6. Go back to Render Dashboard → `storefront` service → Environment
7. Update `NEXT_PUBLIC_MEDUSA_API_KEY` with the copied key
8. Click "Save Changes"

---

## 🟡 Step 4: Configure Payment Providers in Admin (2 minutes)

Still in Medusa Admin (https://medusa-backend-e42r.onrender.com/app):

1. Go to: **Settings** → **Regions**
2. Click on your region (probably "Europe" or "United States")
3. Scroll to **Payment Providers** section
4. Click **"Add Payment Provider"**
5. Select available providers:
   - ✅ **stripe** - For credit card payments
   - ✅ **bank_transfer** - For manual bank transfer payments (works without setup)
   - ✅ **paypal** - For PayPal payments (if you set credentials in Step 2)
6. Click **Save**

**Note:** If you don't see these providers in the dropdown:
- Make sure backend has finished deploying
- Check backend logs in Render dashboard for errors
- The providers are defined in `medusa-config.ts` and should load automatically

---

## ✅ Step 5: Test Everything (5 minutes)

### Test 1: Can you access the storefront?
1. Go to: https://storefront-tg3r.onrender.com
2. Expected: Homepage loads with products

### Test 2: Can you add items to cart?
1. Click on a product
2. Click "Add to Cart"
3. Expected: Success message, cart icon updates

### Test 3: Can you view cart?
1. Click cart icon or go to `/cart`
2. Expected: Cart page shows your items, no CORS errors in console (F12)

### Test 4: Can you proceed to checkout?
1. Click "Proceed to Checkout"
2. Expected: Checkout page loads, no CORS errors
3. Fill in the form (email, name, address)
4. Expected: You see payment method options (Stripe, Bank Transfer, PayPal)

### Test 5: Can you complete a test payment?
**Using Stripe (recommended for testing):**
1. Select "Stripe" payment method
2. Enter test card details:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
3. Click "Pay Now"
4. Expected: Redirects to order confirmation page

**Or using Bank Transfer:**
1. Select "Bank Transfer" payment method
2. Click "Continue to Payment"
3. Expected: Shows bank details and creates order

---

## 🐛 Troubleshooting

### Issue: "No cart found" or CORS errors persist
**Solution:** 
1. Clear browser cache and cookies
2. Check browser console (F12) for specific error messages
3. Verify CORS environment variables in backend service match exactly:
   - `STORE_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000`
4. Restart backend service manually in Render dashboard

### Issue: "No payment providers configured"
**Solution:**
1. Verify in Medusa Admin: Settings → Regions → [Your Region] → Payment Providers
2. Make sure you added `stripe`, `bank_transfer`, or `paypal`
3. If providers are added but still not showing, restart backend service

### Issue: Stripe payment fails with "Invalid API key"
**Solution:**
1. Verify you set `STRIPE_API_KEY` in backend environment (not storefront)
2. Make sure it's the SECRET key (starts with `sk_test_...` or `sk_live_...`)
3. Not the publishable key (starts with `pk_test_...`)
4. Restart backend service after adding the key

### Issue: Can't login to admin panel
**Solution:**
1. Check backend logs in Render dashboard
2. Verify `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD` are set
3. The admin user is created automatically on backend startup
4. Wait 30 seconds after backend deployment for initialization
5. Try: https://medusa-backend-e42r.onrender.com/app

### Issue: Database connection error
**Solution:**
1. Make sure you created a PostgreSQL database in Render
2. Copy the "Internal Database URL" (not external)
3. Set it as `DATABASE_URL` in backend environment variables
4. Format should be: `postgresql://user:password@host:5432/database`

---

## 📊 Checklist

Use this checklist to track your progress:

### Backend Setup
- [ ] Updated `render.yaml` with correct CORS URLs
- [ ] Committed and pushed changes
- [ ] Created PostgreSQL database on Render
- [ ] Set `DATABASE_URL` environment variable
- [ ] Set `STRIPE_API_KEY` environment variable (optional: `STRIPE_WEBHOOK_SECRET`)
- [ ] Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` (optional)
- [ ] Set `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD`
- [ ] Verified `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` are correct
- [ ] Backend deployed successfully (check Render logs)

### Storefront Setup
- [ ] Set `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
- [ ] Got API key from Medusa Admin
- [ ] Set `NEXT_PUBLIC_MEDUSA_API_KEY`
- [ ] Storefront deployed successfully

### Admin Configuration
- [ ] Logged into Medusa Admin
- [ ] Navigated to Settings → Regions → [Your Region]
- [ ] Added payment providers (stripe, bank_transfer, paypal)
- [ ] Saved region configuration

### Testing
- [ ] Storefront homepage loads
- [ ] Can add products to cart
- [ ] Can view cart (no CORS errors)
- [ ] Can proceed to checkout (no CORS errors)
- [ ] Can see payment method options
- [ ] Can complete a test payment

---

## 🎯 Expected Timeline

- **Step 1 (Git push):** 2 minutes
- **Step 2 (Environment variables):** 5-10 minutes
- **Step 3 (API key):** 3 minutes (after backend finishes deploying)
- **Step 4 (Payment providers):** 2 minutes
- **Step 5 (Testing):** 5 minutes

**Total:** ~20-25 minutes including deployment wait times

---

## 🆘 Need Help?

1. **Check browser console (F12)** - Most errors show detailed messages there
2. **Check Render logs** - Backend errors show in Render dashboard under "Logs"
3. **Review the detailed analysis** - See `CORS_AND_PAYMENT_ANALYSIS.md` for technical details

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Storefront loads without errors
2. ✅ Can add items to cart
3. ✅ No CORS errors in browser console (F12)
4. ✅ Checkout page shows payment method options
5. ✅ Can complete test payment and see order confirmation

**Once all these work, your store is fully functional!** 🎉

