# 🔧 Environment Variable Fixes for Render

## ❌ Issues Found:

1. **Backend** has frontend-only variables that should be removed
2. **Backend** `STRIPE_API_KEY` is using publishable key instead of secret key
3. **Backend** has quotes around `BANK_NAME` and `BANK_TRANSFER_INSTRUCTIONS` (remove them)
4. **Frontend** `NEXT_PUBLIC_MEDUSA_API_KEY` is still a placeholder

---

## ✅ CORRECTED BACKEND ENVIRONMENT VARIABLES

**Remove these from backend:**
- ❌ `NEXT_PUBLIC_MEDUSA_API_KEY` (frontend-only)
- ❌ `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (frontend-only)

**Fix these in backend:**
- ❌ `STRIPE_API_KEY=pk_test_...` → ✅ `STRIPE_API_KEY=sk_test_YOUR_SECRET_KEY_HERE`
- ❌ `BANK_NAME="Your Bank Name"` → ✅ `BANK_NAME=Your Bank Name` (remove quotes)
- ❌ `BANK_TRANSFER_INSTRUCTIONS="Please..."` → ✅ `BANK_TRANSFER_INSTRUCTIONS=Please transfer the amount to our bank account. Order will be confirmed once payment is received.` (remove quotes)

**Corrected Backend Variables:**
```
ADMIN_CORS=https://medusa-backend-e42r.onrender.com,http://localhost:7001
AUTH_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
BANK_ACCOUNT_NUMBER=1234567890
BANK_IBAN=GB82WEST12345698765432
BANK_NAME=Your Bank Name
BANK_ROUTING_NUMBER=
BANK_SWIFT=
BANK_TRANSFER_INSTRUCTIONS=Please transfer the amount to our bank account. Order will be confirmed once payment is received.
COOKIE_SECRET=c33404b1968dd0bbf166f6f1e2881f87e030de666dad8399cafcd5a62c1c6494
DATABASE_URL=postgresql://medusa_ot4b_user:UwuxR860WK14rtcgDaWvpLArHKOfYjjs@dpg-d4bv8uq4d50c73cr9u1g-a/medusa_ot4b
JWT_SECRET=cb22a8189a9070e8cbd7a3cefa225c6bbd0e2c1a022f9f1b61aa873a8f49f814
NODE_ENV=production
PAYPAL_CLIENT_ID=AVKmSGeR5AYbaI2xvrZDnwAs9wAuX4AlwiI256kAN1euYxxxD_IY8XOzNmcxAjSQhIeJvyCtPD6M1RlG
PAYPAL_CLIENT_SECRET=EAa-UUswdno9WDb7u8ujpDRUeGb26vNlf5SDLk_0qlIyDKNHN5GeUtStAfCCzwxWKrqDTnAuIRFmeKYp
PAYPAL_ENVIRONMENT=sandbox
PORT=9000
STORE_CORS=https://storefront-tg3r.onrender.com,http://localhost:3000
STRIPE_API_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

## ✅ CORRECTED FRONTEND ENVIRONMENT VARIABLES

**Fix this in frontend:**
- ❌ `NEXT_PUBLIC_MEDUSA_API_KEY=<paste-publishable-key-from-step-1>` 
- ✅ `NEXT_PUBLIC_MEDUSA_API_KEY=pk_test_51STTegDuJ75CtIxvA2jhYWF27jjCCiEknxjEjQzBdo27hkNc9nfUnd854Bcce3I129jk2cO0jgACZYilMsFBugXT00dAwZE618`

**Corrected Frontend Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://medusa-backend-e42r.onrender.com
NEXT_PUBLIC_MEDUSA_API_KEY=pk_test_51STTegDuJ75CtIxvA2jhYWF27jjCCiEknxjEjQzBdo27hkNc9nfUnd854Bcce3I129jk2cO0jgACZYilMsFBugXT00dAwZE618
```

---

## 🔑 How to Get Stripe Secret Key

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Find **"Secret key"** (starts with `sk_test_...`)
3. Click **"Reveal test key"** or **"Create secret key"**
4. Copy the secret key (NOT the publishable key)
5. Replace `STRIPE_API_KEY=sk_test_YOUR_STRIPE_SECRET_KEY_HERE` in backend

---

## 📝 Steps to Fix on Render

### Backend Service:
1. Go to **medusa-backend** service → **Environment**
2. **Delete** these variables:
   - `NEXT_PUBLIC_MEDUSA_API_KEY`
   - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
3. **Update** these variables (remove quotes, fix Stripe key):
   - `BANK_NAME` → `Your Bank Name` (no quotes)
   - `BANK_TRANSFER_INSTRUCTIONS` → `Please transfer the amount to our bank account. Order will be confirmed once payment is received.` (no quotes)
   - `STRIPE_API_KEY` → `sk_test_YOUR_ACTUAL_SECRET_KEY` (get from Stripe dashboard)
4. Click **"Save Changes"**

### Frontend Service:
1. Go to **storefront** service → **Environment**
2. **Update** `NEXT_PUBLIC_MEDUSA_API_KEY`:
   - Change from: `<paste-publishable-key-from-step-1>`
   - Change to: `pk_test_51STTegDuJ75CtIxvA2jhYWF27jjCCiEknxjEjQzBdo27hkNc9nfUnd854Bcce3I129jk2cO0jgACZYilMsFBugXT00dAwZE618`
3. Click **"Save Changes"**

---

## ⚠️ Important Notes

- **Stripe Secret Key** (`sk_test_...`) is different from **Publishable Key** (`pk_test_...`)
- Secret keys should NEVER be in frontend code
- Publishable keys are safe for frontend
- After fixing, both services will auto-redeploy

