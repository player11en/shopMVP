import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { handle } = req.params;

  try {
    const productModuleService = req.scope.resolve("product");

    // Only fetch published products (status = "published")
    // This matches the behavior of the standard Medusa store API
    const [products] = await productModuleService.listAndCountProducts(
      {
        handle,
        status: "published", // Only published products are available in store API
      },
      {
        select: [
          "id",
          "title",
          "subtitle",
          "description",
          "handle",
          "thumbnail",
          "status",
          "metadata",
          "collection_id",
          "type_id",
          "created_at",
          "updated_at",
          "deleted_at",
        ],
        relations: [
          "images",
          "variants",
          "variants.options",
          "options",
          "options.values",
          "tags",
        ],
      }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        message: `Product with handle "${handle}" not found or not published`,
        hint: "Make sure the product status is set to 'published' in the Admin Dashboard",
      });
    }

    const product = products[0];
    
    // Double-check status (should be "published" but verify)
    if (product.status !== "published") {
      return res.status(404).json({
        message: `Product with handle "${handle}" is not published`,
        status: product.status,
        hint: "Please publish the product in the Admin Dashboard",
      });
    }
    
    const metadata = product.metadata || {};

    // Fetch prices for variants from price module
    let productWithPrices = product;
    if (product.variants && product.variants.length > 0) {
      try {
        const variantIds = product.variants.map((v: any) => v.id);
        
        // Try different methods to get prices
        let prices: any[] = [];
        
        try {
          // Method 1: Try price module service
          const priceModuleService = req.scope.resolve("price") as any;
          const [priceList] = await priceModuleService.listAndCountPrices({
            variant_id: variantIds,
          });
          prices = priceList || [];
        } catch (e1: any) {
          console.warn(`[Product ${handle}] Price module method 1 failed:`, e1.message);
          
          // Method 2: Try query service
          try {
            const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
            const { data: priceData } = await query.graph({
              entity: "price",
              fields: ["id", "amount", "currency_code", "variant_id"],
              filters: {
                variant_id: variantIds,
              } as any,
            });
            prices = priceData || [];
          } catch (e2: any) {
            console.warn(`[Product ${handle}] Price query method failed:`, e2.message);
          }
        }

        console.log(`[Product ${handle}] Found ${prices.length} prices for ${variantIds.length} variants`);

        // Attach prices to variants
        // Note: prices array amounts are in cents (e.g., 200 = €2.00)
        productWithPrices = {
          ...product,
          variants: product.variants.map((variant: any) => {
            const variantPrices = prices.filter((p: any) => p.variant_id === variant.id);
            console.log(`[Product ${handle}] Variant ${variant.id} has ${variantPrices.length} prices`);
            
            // Sort prices: prefer EUR, then USD, then others
            const sortedPrices = variantPrices.sort((a: any, b: any) => {
              const aCode = a.currency_code?.toLowerCase();
              const bCode = b.currency_code?.toLowerCase();
              if (aCode === 'eur') return -1;
              if (bCode === 'eur') return 1;
              if (aCode === 'usd') return -1;
              if (bCode === 'usd') return 1;
              return 0;
            });
            
            return {
              ...variant,
              prices: sortedPrices.map((p: any) => ({
                amount: p.amount, // Amount is in cents
                currency_code: p.currency_code,
              })),
            };
          }),
        };
      } catch (priceError: any) {
        // If price module fails, continue without prices
        console.error(`[Product ${handle}] Could not load prices:`, priceError.message, priceError.stack);
        productWithPrices = product;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Product ${handle}] Metadata:`, JSON.stringify(metadata, null, 2));
    }

    res.json({
      product: {
        ...productWithPrices,
        metadata,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
}
