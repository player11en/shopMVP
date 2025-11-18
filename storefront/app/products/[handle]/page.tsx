import Link from "next/link";
import Image from "next/image";
import { fetchProduct, createCart, addToCart } from "@/lib/medusa";
import { AddToCartButton } from "@/components/AddToCartButton";
import { BuyNowButton } from "@/components/BuyNowButton";
import { ProductGallery } from "@/components/ProductGallery";
import { FreeDownloadButton } from "@/components/FreeDownloadButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  
  // Temporary workaround: Check if handle contains "3d" or check description for model URL
  // This is a workaround until we can get metadata from store API
  let product = null;
  let error = null;

  try {
    product = await fetchProduct(handle);
  } catch (e: any) {
    error = e.message;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "Product does not exist"}</p>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm" style={{ backgroundColor: 'var(--greywhite)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--darkerblue)' }}>
              Medusa Store
            </Link>
            <Link
              href="/cart"
              className="px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--darkerblue)', color: 'white' }}
            >
              <i className="fas fa-shopping-cart mr-2"></i>Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="mb-4 inline-block hover:opacity-80 transition-opacity"
          style={{ color: 'var(--lighterblue)' }}
        >
          <i className="fas fa-arrow-left mr-2"></i>Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ boxShadow: '0 4px 6px var(--shadow)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Images / 3D Viewer Gallery */}
            <div>
              {/* Gallery Component with Tabs */}
              {(() => {
                let modelUrl = null;
                let videoUrl = null;
                
                // PRIMARY: Check metadata if available
                const metadata = product.metadata;
                if (metadata) {
                  // Handle metadata as object (most common)
                  if (typeof metadata === 'object' && !Array.isArray(metadata)) {
                    // Try direct access first (preferred naming)
                    modelUrl = metadata.model_3d_url || metadata['model_3d_url'] || null;
                    videoUrl = metadata.video_url || metadata['video_url'] || null;
                    
                    // Try alternative naming conventions (including admin UI keys)
                    if (!modelUrl) {
                      modelUrl = (metadata as any)?.model3dUrl || 
                                (metadata as any)?.model3DUrl ||
                                (metadata as any)?.model_3d ||
                                (metadata as any)?.['3d_model'] ||  // Admin UI key
                                null;
                    }
                    
                    if (!videoUrl) {
                      videoUrl = (metadata as any)?.videoUrl || 
                                (metadata as any)?.video ||
                                (metadata as any)?.video_path ||
                                (metadata as any)?.['video_product'] ||  // Admin UI key
                                null;
                    }
                  }
                  
                  // Handle metadata as array (if backend returns it that way)
                  if (Array.isArray(metadata)) {
                    const modelEntry = metadata.find((m: any) => 
                      m.key === 'model_3d_url' || 
                      m.name === 'model_3d_url' ||
                      m.key === 'model3dUrl' ||
                      m.name === 'model3dUrl' ||
                      m.key === '3d_model' ||  // Admin UI key
                      m.name === '3d_model'
                    );
                    if (modelEntry) {
                      modelUrl = modelEntry.value || modelEntry.data || null;
                    }
                    
                    const videoEntry = metadata.find((m: any) => 
                      m.key === 'video_url' || 
                      m.name === 'video_url' ||
                      m.key === 'videoUrl' ||
                      m.name === 'videoUrl' ||
                      m.key === 'video_product' ||  // Admin UI key
                      m.name === 'video_product'
                    );
                    if (videoEntry) {
                      videoUrl = videoEntry.value || videoEntry.data || null;
                    }
                  }
                }
                
                // WORKAROUND 2: Extract from description (MODEL_3D:/path/to/model.glb or VIDEO:/path/to/video.mp4)
                if (product.description) {
                  if (!modelUrl) {
                    const modelMatch = product.description.match(/MODEL_3D:([^\s]+)/i);
                    if (modelMatch) {
                      modelUrl = modelMatch[1];
                    }
                  }
                  
                  if (!videoUrl) {
                    const videoMatch = product.description.match(/VIDEO:([^\s]+)/i);
                    if (videoMatch) {
                      videoUrl = videoMatch[1];
                    }
                  }
                }
                
                // WORKAROUND 3: If handle contains "3d", use default model
                if (!modelUrl && product.handle?.toLowerCase().includes('3d')) {
                  modelUrl = '/models/Untitled.glb';
                }
                
                // WORKAROUND 4: If handle contains "video" or "zombie", use default video
                if (!videoUrl && product.handle?.toLowerCase().includes('video')) {
                  videoUrl = '/videos/Zombie.mp4';
                }
                if (!videoUrl && product.handle?.toLowerCase().includes('zombie')) {
                  videoUrl = '/videos/Zombie.mp4';
                }
                
                // Debug: Show what we detected (temporary)
                if (process.env.NODE_ENV === 'development') {
                  console.log('Gallery Detection:', {
                    handle: product.handle,
                    hasMetadata: !!metadata,
                    metadataType: typeof metadata,
                    metadataIsArray: Array.isArray(metadata),
                    metadataKeys: metadata && typeof metadata === 'object' ? Object.keys(metadata) : null,
                    rawMetadata: metadata,
                    modelUrl,
                    videoUrl,
                    description: product.description?.substring(0, 50)
                  });
                }
                
                return (
                  <ProductGallery
                    modelUrl={modelUrl}
                    videoUrl={videoUrl}
                    images={product.images}
                    productTitle={product.title}
                  />
                );
              })()}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--darkerblue)' }}>
                {product.title}
              </h1>

              {product.description && (() => {
                // Clean description: Remove technical markers (VIDEO:, MODEL_3D:) before displaying
                let cleanDescription = product.description;
                cleanDescription = cleanDescription.replace(/VIDEO:[^\s]+/gi, '').trim();
                cleanDescription = cleanDescription.replace(/MODEL_3D:[^\s]+/gi, '').trim();
                cleanDescription = cleanDescription.replace(/\s+/g, ' ').trim(); // Clean up extra spaces
                
                return cleanDescription ? (
                  <p className="mb-6" style={{ color: 'var(--browngrey)' }}>{cleanDescription}</p>
                ) : null;
              })()}

              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--darkerblue)' }}>
                    Available Variants
                  </h2>
                  <div className="space-y-2">
                    {product.variants.map((variant: any) => {
                      // Get metadata first
                      const metadata = product.metadata || {};
                      const isDigital = metadata.product_type === 'digital' || metadata.is_digital === 'true';
                      
                      // Get price from variant - Medusa stores prices in cents
                      // Check multiple possible price locations
                      let variantPrice = 0;
                      let currencyCode = 'usd';
                      
                      // Get price from calculated_price (Medusa v2 standard way)
                      if (variant.calculated_price) {
                        variantPrice = variant.calculated_price?.calculated_amount || 0;
                        currencyCode = variant.calculated_price?.currency_code?.toLowerCase() || 'usd';
                      }
                      
                      // Fallback to prices array if calculated_price not available
                      if (!variantPrice && variant.prices && variant.prices.length > 0) {
                        const usdPrice = variant.prices.find((p: any) => p.currency_code?.toLowerCase() === 'usd');
                        const priceObj = usdPrice || variant.prices[0];
                        variantPrice = priceObj?.amount || 0;
                        currencyCode = priceObj?.currency_code?.toLowerCase() || 'usd';
                      }
                      
                      const hasPrice = variantPrice > 0 || (variant.prices && variant.prices.length > 0) || variant.calculated_price;
                      const isFreeVariant = hasPrice && variantPrice === 0;
                      
                      // Debug: Only log if there's an issue
                      if (process.env.NODE_ENV === 'development' && isFreeVariant && isDigital) {
                        console.log('✅ Free Digital Product Detected:', {
                          variantId: variant.id,
                          isDigital,
                          isFree: isFreeVariant,
                          price: variantPrice,
                          metadata
                        });
                      }
                      
                      // Format price: calculated_amount is already in correct format (10 = €10), not cents
                      // But if it's very large (> 1000), it might be in cents, so check
                      let displayPrice = null;
                      if (variantPrice > 0) {
                        // If price is > 1000, assume it's in cents, otherwise it's already in correct format
                        if (variantPrice > 1000) {
                          displayPrice = (variantPrice / 100).toFixed(2);
                        } else {
                          displayPrice = variantPrice.toFixed(2);
                        }
                      }
                      const currencySymbol = currencyCode === 'eur' ? '€' : currencyCode === 'usd' ? '$' : '';
                      
                      return (
                        <div
                          key={variant.id}
                          className="border rounded-lg p-4"
                          style={{ borderColor: 'var(--skyblue)', backgroundColor: 'var(--greywhite)' }}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                            <div className="flex-1">
                              <p className="font-medium" style={{ color: 'var(--darkerblue)' }}>
                                {variant.title}
                              </p>
                              {variant.sku && (
                                <p className="text-sm" style={{ color: 'var(--browngrey)' }}>SKU: {variant.sku}</p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {isFreeVariant ? (
                                  <p className="text-sm font-semibold text-green-600">
                                    <i className="fas fa-gift mr-1"></i>Free
                                  </p>
                                ) : displayPrice ? (
                                  <p className="text-lg font-semibold" style={{ color: 'var(--darkerblue)' }}>
                                    {currencySymbol}{displayPrice}
                                  </p>
                                ) : (
                                  <p className="text-sm" style={{ color: 'var(--browngrey)' }}>
                                    Price not available
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0 w-full sm:w-auto">
                              {/* FREE DIGITAL: Show download button (no cart/checkout needed) */}
                              {isFreeVariant && isDigital && (
                                <FreeDownloadButton product={product} variant={variant} />
                              )}
                              {/* PAID DIGITAL: Show Buy Now button (goes directly to checkout) */}
                              {!isFreeVariant && isDigital && (
                                <BuyNowButton variantId={variant.id} />
                              )}
                              {/* PAID PHYSICAL: Show Add to Cart button (can add multiple items) */}
                              {!isFreeVariant && !isDigital && (
                                <AddToCartButton variantId={variant.id} />
                              )}
                              {/* FREE PHYSICAL: Show message */}
                              {isFreeVariant && !isDigital && (
                                <div className="p-3 rounded-md" style={{ backgroundColor: '#F5EDE2', border: '1px solid #C7BFB6' }}>
                                  <p className="text-sm" style={{ color: '#7A2E2C' }}>
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Free product - Add to cart to claim
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Options */}
              {product.options && product.options.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Options</h2>
                  <div className="space-y-2">
                    {product.options.map((option: any) => (
                      <div key={option.id}>
                        <p className="font-medium text-gray-700">{option.title}:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {option.values?.map((value: any) => (
                            <span
                              key={value.id}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                            >
                              {value.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

