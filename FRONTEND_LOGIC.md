# Frontend Logic Documentation

## Overview
This document describes the complete frontend logic for handling free products and paid product checkout flows.

---

## Product Page Logic (`/products/[handle]`)

### Product Detection
1. **Price Detection:**
   - Checks `variant.calculated_price.calculated_amount` (Medusa v2 standard)
   - Fallback: `variant.prices[]` array
   - Price is considered **FREE** if `price === 0` AND price data exists

2. **Digital Product Detection:**
   - Checks `product.metadata.product_type === 'digital'` OR `product.metadata.is_digital === 'true'`
   - Metadata is read from `product.metadata` object

### Button Display Logic

Based on **Price** and **Digital Status**, the product page shows different buttons:

| Price | Digital | Button Shown | Action |
|-------|---------|--------------|--------|
| **FREE (€0)** | ✅ Digital | `FreeDownloadButton` | Direct download, no cart/checkout |
| **PAID (€2+)** | ✅ Digital | `BuyNowButton` | Creates cart → Goes to checkout |
| **PAID (€2+)** | ❌ Physical | `AddToCartButton` | Adds to cart (can add multiple) |
| **FREE (€0)** | ❌ Physical | Info message | "Free product - Add to cart to claim" |

### Code Location
- **File:** `storefront/app/products/[handle]/page.tsx`
- **Lines:** 219-321 (variant mapping logic)

---

## Free Product Flow (FREE + DIGITAL)

### 1. Product Page (`FreeDownloadButton`)
- **Component:** `storefront/components/FreeDownloadButton.tsx`
- **Shows when:** `isFree === true` AND `isDigital === true`
- **Behavior:**
  - ✅ Shows "Download Free" button
  - ✅ No cart creation
  - ✅ No checkout required
  - ✅ Direct file download
  - ✅ No email/account needed

### 2. Download URL Detection
The component looks for download URLs in this order:
1. `metadata.model_3d_url` (preferred)
2. `metadata['3d_model']` (Admin UI key)
3. `metadata.download_url` / `metadata.download_link`
4. Description pattern: `MODEL_3D:/path/to/file.glb`
5. Handle fallback: If handle contains "3d", uses `/models/Untitled.glb`

### 3. Download Action
- Creates temporary `<a>` element
- Sets `href` to download URL
- Triggers click to start download
- Shows success message

**Code Location:**
- `storefront/components/FreeDownloadButton.tsx` (lines 176-201)

---

## Paid Product Flow (PAID + DIGITAL)

### 1. Product Page (`BuyNowButton`)
- **Component:** `storefront/components/BuyNowButton.tsx`
- **Shows when:** `isFree === false` AND `isDigital === true`
- **Behavior:**
  - ✅ Creates new cart
  - ✅ Adds variant to cart (quantity: 1)
  - ✅ Saves cart ID to localStorage
  - ✅ Redirects to `/checkout?cart_id={cartId}`

**Code Location:**
- `storefront/components/BuyNowButton.tsx` (lines 12-44)

### 2. Checkout Page (`/checkout`)
- **File:** `storefront/app/checkout/page.tsx`
- **Flow:**

#### Step 1: Load Cart
- Fetches cart with `expand=items.variant.product` to get metadata
- Detects if cart is free: `cart.total === 0`
- Detects if all items are digital: Checks `item.variant.product.metadata.product_type === 'digital'`

#### Step 2: Form Display
- **Digital Products:** Only shows:
  - Email (required)
  - First Name (required)
  - Last Name (required)
  - Country (required)
  - ❌ NO shipping address fields

- **Physical Products:** Shows all fields including shipping address

#### Step 3: Payment Provider Selection
- **Free Cart:** Skips payment, shows "Complete Free Order" button
- **Paid Cart:** Shows payment provider options (Stripe, PayPal, Bank Transfer, etc.)

#### Step 4: Form Submission (`handleSubmit`)
1. Validates required fields
2. Updates cart with customer info
3. **If FREE:** Completes order directly (no payment)
4. **If PAID:**
   - Creates payment session
   - Selects payment provider
   - **Stripe:** Shows card form
   - **Other providers:** Completes order directly

#### Step 5: Complete Order (`handleCompleteOrder`)
- Calls `completeCart(cartId)` API
- Stores order in localStorage
- Clears cart from localStorage
- Redirects to `/order-confirmation?order_id={orderId}`

**Code Location:**
- `storefront/app/checkout/page.tsx`
  - Lines 298-323: Digital detection logic
  - Lines 326-416: Payment setup
  - Lines 419-442: Order completion
  - Lines 444-473: Form submission

---

## Paid Physical Product Flow (PAID + PHYSICAL)

### 1. Product Page (`AddToCartButton`)
- **Component:** `storefront/components/AddToCartButton.tsx`
- **Shows when:** `isFree === false` AND `isDigital === false`
- **Behavior:**
  - ✅ Gets existing cart from localStorage OR creates new cart
  - ✅ Adds variant to cart
  - ✅ Shows "Added to cart!" message
  - ✅ Stays on product page (can add more items)

### 2. Cart Page (`/cart`)
- **File:** `storefront/app/cart/page.tsx`
- **Features:**
  - Shows all cart items
  - Quantity adjustment (+/-)
  - Remove items
  - "Proceed to Checkout" button

### 3. Checkout Page
- Same as paid digital, but:
  - ✅ Requires shipping address
  - ✅ Shows shipping address fields

---

## API Functions (`lib/medusa.ts`)

### Key Functions

1. **`fetchProduct(handle)`**
   - Fetches product with variants and metadata
   - Used on product page

2. **`createCart()`**
   - Creates new cart
   - Returns cart with `cart.id`
   - Used by `BuyNowButton` and `AddToCartButton`

3. **`addToCart(cartId, variantId, quantity)`**
   - Adds item to cart
   - Used by both buttons

4. **`getCart(cartId)`**
   - Fetches cart with `expand=items.variant.product`
   - Includes product metadata for digital detection
   - Used on checkout and cart pages

5. **`updateCart(cartId, data)`**
   - Updates cart with customer info
   - Used on checkout page

6. **`completeCart(cartId)`**
   - Completes order
   - Returns order data
   - Used on checkout page

**Code Location:**
- `storefront/lib/medusa.ts`

---

## Order Confirmation (`/order-confirmation`)

### Digital Product Downloads
- Checks if order items are digital: `item.variant?.product?.metadata?.product_type === 'digital'`
- Shows download button for each digital item
- Download URL from same sources as `FreeDownloadButton`

**Code Location:**
- `storefront/app/order-confirmation/page.tsx`

---

## Metadata Structure

### Required Metadata for Digital Products
```json
{
  "product_type": "digital"
}
```

OR

```json
{
  "is_digital": "true"
}
```

### Optional Metadata for Downloads
```json
{
  "model_3d_url": "https://example.com/model.glb",
  "download_url": "https://example.com/file.zip",
  "download_link": "https://example.com/file.zip"
}
```

---

## Issues & Fixes

### Issue 1: `isDigitalOnly: false` in Checkout
**Problem:** Cart API wasn't returning product metadata.

**Fix:** Changed `getCart()` to use `expand=items.variant.product` instead of `fields=*items.variant.product.metadata`.

**Code:** `storefront/lib/medusa.ts` (line 269)

### Issue 2: Free Products Still Required Checkout
**Problem:** Free digital products were showing "Add to Cart" button.

**Fix:** Updated product page logic to show `FreeDownloadButton` for free digital products (no cart/checkout).

**Code:** `storefront/app/products/[handle]/page.tsx` (lines 299-304)

### Issue 3: Paid Digital Products Required Cart Page
**Problem:** Users had to go through cart page for paid digital products.

**Fix:** Created `BuyNowButton` that goes directly to checkout.

**Code:** `storefront/components/BuyNowButton.tsx`

---

## Testing Checklist

### Free Digital Product
- [ ] Product has `product_type: digital` metadata
- [ ] Product price is €0
- [ ] Shows "Download Free" button
- [ ] No "Add to Cart" button
- [ ] Clicking download starts file download
- [ ] No cart/checkout required

### Paid Digital Product
- [ ] Product has `product_type: digital` metadata
- [ ] Product price is > €0
- [ ] Shows "Buy Now" button
- [ ] No "Add to Cart" button
- [ ] Clicking "Buy Now" creates cart and goes to checkout
- [ ] Checkout shows only email/name/country (no shipping)
- [ ] After payment, order confirmation shows download link

### Paid Physical Product
- [ ] Product does NOT have `product_type: digital` metadata
- [ ] Product price is > €0
- [ ] Shows "Add to Cart" button
- [ ] Can add multiple items to cart
- [ ] Cart page shows all items
- [ ] Checkout requires shipping address
- [ ] After payment, order confirmation shows order details

---

## Summary

### Free Digital Products
✅ **Direct download** - No cart, no checkout, no email needed

### Paid Digital Products
✅ **Buy Now → Checkout → Pay → Download** - Minimal info required (email/name only)

### Paid Physical Products
✅ **Add to Cart → Cart → Checkout → Pay → Ship** - Full checkout with shipping address

