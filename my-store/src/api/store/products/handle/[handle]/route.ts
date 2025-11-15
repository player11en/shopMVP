import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { handle } = req.params;

  try {
    const productModuleService = req.scope.resolve("product");

    const [products] = await productModuleService.listAndCountProducts(
      {
        handle,
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
        message: `Product with handle "${handle}" not found`,
      });
    }

    const product = products[0];
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
          const priceModuleService = req.scope.resolve("price");
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
              },
            });
            prices = priceData || [];
          } catch (e2: any) {
            console.warn(`[Product ${handle}] Price query method failed:`, e2.message);
          }
        }

        console.log(`[Product ${handle}] Found ${prices.length} prices for ${variantIds.length} variants`);

        // Attach prices to variants
        productWithPrices = {
          ...product,
          variants: product.variants.map((variant: any) => {
            const variantPrices = prices.filter((p: any) => p.variant_id === variant.id);
            console.log(`[Product ${handle}] Variant ${variant.id} has ${variantPrices.length} prices`);
            return {
              ...variant,
              prices: variantPrices.map((p: any) => ({
                amount: p.amount,
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
