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

    // Fetch prices for variants using price set service
    // In Medusa v2, prices are linked through price sets
    let productWithPrices = product;
    if (product.variants && product.variants.length > 0) {
      try {
        // Try to resolve price set service
        let priceSetService: any = null;
        try {
          priceSetService = req.scope.resolve("priceSet");
        } catch (e) {
          // Price set service not available, skip price fetching
          console.warn(`[Product ${handle}] Price set service not available, skipping price fetch`);
        }

        if (priceSetService) {
          const variantIds = product.variants.map((v: any) => v.id);
          
          // Get price sets for variants
          // In Medusa v2, variants have price_set_id
          const variantsWithPriceSets = product.variants.filter((v: any) => v.price_set_id);
          
          if (variantsWithPriceSets.length > 0) {
            const priceSetIds = variantsWithPriceSets.map((v: any) => v.price_set_id);
            
            try {
              const [priceSets] = await priceSetService.listAndCountPriceSets({
                id: priceSetIds,
              }, {
                relations: ["prices"],
              });

              // Map price sets to variants
              const priceSetMap = new Map();
              (priceSets || []).forEach((ps: any) => {
                priceSetMap.set(ps.id, ps.prices || []);
              });

              productWithPrices = {
                ...product,
                variants: product.variants.map((variant: any) => {
                  const prices = priceSetMap.get(variant.price_set_id) || [];
                  
                  // Sort prices: prefer EUR, then USD, then others
                  const sortedPrices = prices.sort((a: any, b: any) => {
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
            } catch (priceSetError: any) {
              console.warn(`[Product ${handle}] Could not fetch price sets:`, priceSetError.message);
              // Continue without prices
            }
          }
        }
      } catch (priceError: any) {
        // If price fetching fails, continue without prices
        // The frontend can use the standard API which handles prices automatically
        console.warn(`[Product ${handle}] Could not load prices:`, priceError.message);
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
