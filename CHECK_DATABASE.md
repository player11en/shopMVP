# Database Check Commands

## PostgreSQL Status
- **Installed:** PostgreSQL 14.18 (Homebrew)
- **Running:** Yes (port 5432)
- **Database:** `medusa_db` exists
- **User:** `zinaghannadan`

## Quick Database Commands

### Connect to database
```bash
psql -U zinaghannadan -d medusa_db
```

### List all tables
```bash
psql -U zinaghannadan -d medusa_db -c "\dt"
```

### Check products
```bash
# Count products
psql -U zinaghannadan -d medusa_db -c "SELECT COUNT(*) FROM product;"

# List products with metadata
psql -U zinaghannadan -d medusa_db -c "SELECT id, title, handle, metadata FROM product;"

# Check if product has digital metadata
psql -U zinaghannadan -d medusa_db -c "SELECT id, title, handle, metadata->>'product_type' as product_type, metadata->>'is_digital' as is_digital FROM product WHERE metadata->>'product_type' = 'digital' OR metadata->>'is_digital' = 'true';"
```

### Check variants and prices
```bash
# List variants with prices
psql -U zinaghannadan -d medusa_db -c "SELECT p.title, v.id, v.title as variant_title, v.calculated_price FROM product p JOIN product_variant v ON p.id = v.product_id;"

# Check free products (price = 0)
psql -U zinaghannadan -d medusa_db -c "SELECT p.title, v.id, v.calculated_price FROM product p JOIN product_variant v ON p.id = v.product_id WHERE v.calculated_price = 0;"
```

### Update product metadata (if needed)
```bash
# Set product as digital
psql -U zinaghannadan -d medusa_db -c "UPDATE product SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{product_type}', '\"digital\"') WHERE handle = 'your-product-handle';"

# Set product price to 0 (free)
psql -U zinaghannadan -d medusa_db -c "UPDATE product_variant SET calculated_price = 0 WHERE product_id = (SELECT id FROM product WHERE handle = 'your-product-handle');"
```

## Medusa doesn't use Prisma
Medusa uses its own ORM and migration system. Use Medusa CLI commands:
- `npm run migrate` - Run migrations
- `medusa db:migrate` - Same as above
- `medusa exec ./src/scripts/seed.ts` - Seed data

