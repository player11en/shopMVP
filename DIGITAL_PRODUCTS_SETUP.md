# Digital Products Setup Guide

## Overview
For digital products (3D models, downloads) that don't require shipping, you need to configure both the **backend** and **product metadata**.

## Backend Requirements

### 1. Region Setup (Required for Cart)
Medusa requires a region to create carts. Make sure you have:
- At least one region created (e.g., "Europe" with EUR currency)
- The region has payment providers configured
- The region includes countries (e.g., DE, GB, FR, etc.)

**Check if region exists:**
- Go to Admin Dashboard → Settings → Regions
- Or run the seed script: `npm run seed` (creates a default "Europe" region)

### 2. Product Metadata (Required for Digital Products)

When creating/editing a product in the Admin Dashboard, add these metadata fields:

#### Option 1: Using `product_type` (Recommended)
```
Key: product_type
Value: digital
```

#### Option 2: Using `is_digital`
```
Key: is_digital
Value: true
```

**How to add metadata in Admin:**
1. Go to Admin Dashboard → Products → Select your product
2. Scroll to "Metadata" section
3. Click "Add Metadata"
4. Add one of the key-value pairs above
5. Save the product

## What This Does

When `product_type: digital` or `is_digital: true` is set:
- ✅ Checkout page skips shipping address requirement
- ✅ Only asks for email and billing address
- ✅ No shipping costs are calculated
- ✅ Free download button appears for free products

## Example Product Setup

For a digital 3D model product:

**Product Details:**
- Title: "Duck-Toy"
- Description: "A 3d model of a bathing duck toy"
- Price: €2.00

**Metadata:**
```
product_type: digital
```

**Optional Metadata (for 3D models):**
```
model_3d_url: https://example.com/model.glb
image_url: https://example.com/preview.jpg
```

## Troubleshooting

### Cart Creation Fails
- **Issue**: "Failed to create cart"
- **Solution**: Make sure a region exists. Run `npm run seed` in the backend.

### Shipping Still Required
- **Issue**: Checkout still asks for shipping address
- **Solution**: Verify product metadata has `product_type: digital` or `is_digital: true`

### Add to Cart Button Not Working
- **Issue**: Button doesn't respond or shows error
- **Solution**: 
  1. Check browser console for errors
  2. Verify region exists in backend
  3. Verify variant has a price set
  4. Check that API keys are configured correctly

## Testing

1. Create a product with `product_type: digital` metadata
2. Add it to cart
3. Go to checkout
4. Verify: No shipping address fields should appear
5. Complete order (should only need email + billing address)

