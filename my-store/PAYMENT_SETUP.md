# 💳 Payment Provider Setup Guide

## Current Directory
**You are here:** `/Users/zinaghannadan/Documents/Repo/Testing Stuff/storetest/my-store`

---

## 🎯 Supported Payment Providers

Medusa supports multiple payment providers. The most popular ones are:

### 1. **Stripe** (Recommended)
- Most popular payment provider
- Supports credit cards, Apple Pay, Google Pay
- Easy to set up
- **Plugin:** `@medusajs/payment-stripe`

### 2. **PayPal**
- Popular for international customers
- Supports PayPal accounts and credit cards
- **Plugin:** `@medusajs/payment-paypal`

### 3. **Manual Payment**
- For testing/development
- No real payment processing
- Already included by default (`pp_system_default`)

### 4. **Other Providers**
- Adyen
- Klarna
- Custom payment providers

---

## 🚀 Quick Setup: Stripe (Recommended)

### Step 1: Install Stripe Plugin

```bash
cd my-store
npm install @medusajs/payment-stripe
```

### Step 2: Get Stripe API Keys

1. **Sign up for Stripe:** https://stripe.com
2. **Get your API keys:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your **Publishable key** (starts with `pk_test_...`)
   - Copy your **Secret key** (starts with `sk_test_...`)

### Step 3: Add Stripe Keys to `.env`

Add these to your `.env` file:

```bash
STRIPE_API_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

**Note:** For local testing, you can skip the webhook secret initially.

### Step 4: Configure Stripe in Medusa Config

Edit `medusa-config.ts`:

```typescript
import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { StripePlugin } from '@medusajs/payment-stripe'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
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
  plugins: [
    StripePlugin({
      apiKey: process.env.STRIPE_API_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    }),
  ],
})
```

### Step 5: Add Stripe to Region

1. **Go to Admin Dashboard:** `http://localhost:9000/app`
2. **Go to:** Settings → Regions
3. **Edit your region** (e.g., "Europe" or "US")
4. **Add Payment Provider:** Select "Stripe"
5. **Save**

### Step 6: Restart Backend

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## 🚀 Quick Setup: PayPal

### Step 1: Install PayPal Plugin

```bash
npm install @medusajs/payment-paypal
```

### Step 2: Get PayPal Credentials

1. **Sign up for PayPal Developer:** https://developer.paypal.com
2. **Create an app** in the dashboard
3. **Get your credentials:**
   - Client ID
   - Client Secret

### Step 3: Add to `.env`

```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENVIRONMENT=sandbox  # or 'live' for production
```

### Step 4: Configure in `medusa-config.ts`

```typescript
import { PayPalPlugin } from '@medusajs/payment-paypal'

module.exports = defineConfig({
  // ... other config
  plugins: [
    PayPalPlugin({
      clientId: process.env.PAYPAL_CLIENT_ID!,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
      environment: process.env.PAYPAL_ENVIRONMENT || 'sandbox',
    }),
  ],
})
```

---

## 🧪 Testing Payments Locally

### Using Stripe Test Mode

1. **Use test API keys** (start with `pk_test_` and `sk_test_`)
2. **Use test card numbers:**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Any future expiry date
   - Any 3-digit CVC

### Using Manual Payment (No Real Payment)

The default `pp_system_default` provider allows you to test checkout without real payments. Perfect for development!

---

## 📝 How Payments Work in Medusa

1. **Create Payment Session** - Customer selects payment method
2. **Authorize Payment** - Payment provider processes payment
3. **Complete Order** - Order is created after successful payment

---

## 🔗 API Endpoints for Payments

### Create Payment Session
```
POST /store/carts/{id}/payment-sessions
```

### Select Payment Session
```
POST /store/carts/{id}/payment-session
Body: { provider_id: "stripe" }
```

### Complete Cart (Create Order)
```
POST /store/carts/{id}/complete
```

---

## 📚 Resources

- **Stripe Docs:** https://docs.medusajs.com/resources/commerce-modules/payment/stripe
- **PayPal Docs:** https://docs.medusajs.com/resources/commerce-modules/payment/paypal
- **Medusa Payment Docs:** https://docs.medusajs.com/resources/commerce-modules/payment

---

## ✅ Next Steps

1. ✅ Install payment provider plugin
2. ✅ Add API keys to `.env`
3. ✅ Update `medusa-config.ts`
4. ✅ Add provider to region in admin
5. ✅ Restart backend
6. ✅ Update checkout page to use payment sessions


