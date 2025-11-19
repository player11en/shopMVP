// 🔑 API Key from environment variable or fallback
// Get it from: http://localhost:9000/app → Settings → API Keys → Copy Publishable Key
// Storefront API Key (for storefront)
export const MEDUSA_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || "pk_e5cf6887065474a34a6876ae4a1d17676a1ef068d0a51f97f9eff9f2cf10b91a";

// Backend URL
export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

async function medusaFetch(path: string, init: RequestInit & { body?: any } = {}) {
  const url = `${MEDUSA_BACKEND_URL}${path}`;
  const method = (init.method || "GET").toUpperCase();
  const headers: HeadersInit = {
    "x-publishable-api-key": MEDUSA_API_KEY,
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  // Always use proxy for client-side requests to avoid CORS issues
  if (typeof window !== "undefined") {
    const body =
      init.body && typeof init.body !== "string"
        ? JSON.stringify(init.body)
        : (init.body as string | null | undefined);

    try {
      const proxyResponse = await fetch("/api/medusa-proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path,
          method,
          headers,
          body: body ?? null,
        }),
      });

      // If proxy works, use it
      if (proxyResponse.ok) {
        return proxyResponse;
      }
      // If 404, proxy route doesn't exist yet - fall through to direct fetch
      if (proxyResponse.status === 404) {
        console.log("Proxy route not available (404), using direct backend call");
      }
    } catch (proxyError) {
      console.warn("Proxy request failed, trying direct:", proxyError);
    }
  }

  // Fallback to direct fetch (server-side or if proxy fails)
  // Since CORS is configured, this should work
  const fetchBody = init.body && typeof init.body !== "string"
    ? JSON.stringify(init.body)
    : init.body;
  
  return fetch(url, {
    ...init,
    headers,
    body: fetchBody,
  });
}

// API helper functions
export async function fetchProducts() {
  try {
    // Use medusaFetch to go through proxy (handles CORS automatically)
    const response = await medusaFetch(`/store/products?fields=*images`, {
      method: 'GET',
      headers: {
        "x-publishable-api-key": MEDUSA_API_KEY,
      },
      cache: 'no-store', // Don't cache in development
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Failed to fetch products: ${response.status} - ${errorText}`;
      
      // Check if it's a sales channel configuration error
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.message?.includes('sales channel')) {
          errorMessage = `API Key Configuration Error: ${errorJson.message}\n\n` +
            `To fix this:\n` +
            `1. Go to Medusa Admin: http://localhost:9000/app\n` +
            `2. Navigate to Settings → API Keys\n` +
            `3. Edit your publishable API key\n` +
            `4. Assign it to a Sales Channel\n\n` +
            `Or run: cd my-store && npm run link-storefront-api-key`;
        }
      } catch (e) {
        // Not JSON, use original error message
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    console.error('Error fetching products:', error);
    throw new Error(`Failed to fetch products: ${error.message || 'Network error'}`);
  }
}

// Helper to get default region
async function getDefaultRegion(): Promise<string | null> {
  try {
    // Use medusaFetch to go through proxy (handles CORS automatically)
    const response = await medusaFetch(`/store/regions`, {
      method: 'GET',
      headers: {
        "x-publishable-api-key": MEDUSA_API_KEY,
      },
      cache: 'no-store',
    });

    if (response.ok) {
      const data = await response.json();
      const regions = data.regions || [];
      if (regions.length > 0) {
        return regions[0].id;
      }
    }
  } catch (e: any) {
    // Silently fail - region is optional for product fetching
    // Only log in development if it's not a connection error
    if (process.env.NODE_ENV === 'development' && e?.message && !e.message.includes('fetch failed') && !e.message.includes('ECONNREFUSED')) {
      console.warn('Could not fetch regions:', e.message);
    }
  }
  return null;
}

export async function fetchProduct(handle: string) {
  try {
    // Fetch from BOTH endpoints and merge:
    // 1. Standard API: Has calculated_price for variants (prices)
    // 2. Custom endpoint: Has metadata and images
    const regionId = await getDefaultRegion();
    let standardUrl = `/store/products?handle=${handle}&fields=*variants.calculated_price,images`;
    if (regionId) {
      standardUrl += `&region_id=${regionId}`;
    }
    
    // Fetch both in parallel
    const [standardResponse, customResponse] = await Promise.allSettled([
      medusaFetch(standardUrl, {
        method: 'GET',
        headers: {
          "x-publishable-api-key": MEDUSA_API_KEY,
        },
        cache: 'no-store',
      }),
      medusaFetch(`/store/products/handle/${handle}`, {
        method: 'GET',
        headers: {
          "x-publishable-api-key": MEDUSA_API_KEY,
        },
        cache: 'no-store',
      })
    ]);

    let productWithPrices: any = null;
    let productWithMetadata: any = null;

    // Process standard API response (has prices)
    if (standardResponse.status === 'fulfilled' && standardResponse.value.ok) {
      const standardData = await standardResponse.value.json();
      const products = standardData.products || (Array.isArray(standardData) ? standardData : []);
      productWithPrices = products.find((p: any) => p.handle === handle) ||
                         products.find((p: any) => p.handle?.toLowerCase() === handle?.toLowerCase()) ||
                         products[0];
    }

    // Process custom endpoint response (has metadata/images)
    if (customResponse.status === 'fulfilled' && customResponse.value.ok) {
      const customData = await customResponse.value.json();
      if (customData.product) {
        productWithMetadata = customData.product;
      }
    }

    // If we have both, merge them intelligently
    if (productWithPrices && productWithMetadata) {
      // Merge: Use prices from standard API, metadata/images from custom endpoint
      const mergedProduct = {
        ...productWithMetadata, // Start with custom (has metadata/images and all fields)
        // Merge variants: combine prices from standard API with all other data from custom
        variants: productWithPrices.variants?.map((variantWithPrice: any) => {
          // Find matching variant from custom endpoint
          const customVariant = productWithMetadata.variants?.find(
            (v: any) => v.id === variantWithPrice.id
          ) || variantWithPrice;
          
          return {
            ...customVariant, // Start with custom variant (has all fields including SKU, options, etc.)
            // Override/add price-related fields from standard API
            calculated_price: variantWithPrice.calculated_price,
            prices: variantWithPrice.prices || customVariant?.prices,
            // Preserve any other fields from standard API that might be useful
            ...(variantWithPrice.original_price && { original_price: variantWithPrice.original_price }),
            ...(variantWithPrice.original_price_incl_tax && { original_price_incl_tax: variantWithPrice.original_price_incl_tax }),
          };
        }) || productWithMetadata.variants,
        // Ensure images from custom endpoint are preserved (it has the full image data)
        images: productWithMetadata.images || productWithPrices.images,
        // Ensure metadata from custom endpoint is preserved (it's properly formatted)
        metadata: productWithMetadata.metadata || productWithPrices.metadata,
        // Preserve thumbnail from custom if available
        thumbnail: productWithMetadata.thumbnail || productWithPrices.thumbnail,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Merged product data from both endpoints:', {
          hasPrices: !!mergedProduct.variants?.[0]?.calculated_price,
          hasMetadata: !!mergedProduct.metadata,
          hasImages: !!mergedProduct.images?.length,
          imagesCount: mergedProduct.images?.length || 0,
        });
      }
      
      return mergedProduct;
    }

    // Fallback: Use whichever one we have
    if (productWithPrices) {
      console.log('✅ Using product from standard API');
      return productWithPrices;
    }

    if (productWithMetadata) {
      console.log('✅ Using product from custom endpoint');
      return productWithMetadata;
    }

    // If both failed, throw error
    throw new Error(`Failed to fetch product with handle "${handle}"`);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function createCart() {
  // Get default region first
  const regionId = await getDefaultRegion();
  
  const body: any = {};
  if (regionId) {
    body.region_id = regionId;
  }
  
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: Object.keys(body).length > 0 ? body : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create cart: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1) {
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: {
      variant_id: variantId,
      quantity,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Failed to add to cart";
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // If not JSON, use the text as is
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(`${errorMessage} (${response.status})`);
  }

  return response.json();
}

export async function updateLineItem(cartId: string, lineItemId: string, quantity: number) {
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: {
      quantity,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update cart item: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function removeLineItem(cartId: string, lineItemId: string) {
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "DELETE",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove cart item: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getCart(cartId: string) {
  // Request cart - Medusa v2 includes relations by default
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts/${cartId}`, {
    method: 'GET',
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch cart: ${errorText}`);
  }

  const data = await response.json();
  return data;
}

// Payment functions
export async function createPaymentSession(cartId: string) {
  const response = await medusaFetch(`/store/carts/${cartId}/payment-sessions`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create payment session: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function selectPaymentSession(cartId: string, providerId: string) {
  // In Medusa v2, selecting a payment session updates the cart
  // Reference: https://medusajs.com/v2-overview/
  // The Cart Module handles payment options, so we update the cart directly
  
  // Try multiple approaches based on Medusa v2 API patterns
  const approaches = [
    // Approach 1: Update cart with payment_session object
    {
      body: {
        payment_session: {
          provider_id: providerId,
        },
      },
    },
    // Approach 2: Update cart with payment_session_id (if we have session ID)
    async () => {
      const sessionsResponse = await getPaymentSession(cartId);
      const paymentSessions = sessionsResponse.payment_sessions || sessionsResponse.data?.payment_sessions || [];
      const selectedSession = paymentSessions.find((ps: any) => ps.provider_id === providerId);
      if (selectedSession?.id) {
        return {
          body: {
            payment_session_id: selectedSession.id,
          },
        };
      }
      return null;
    },
    // Approach 3: Simple provider_id in payment_session field
    {
      body: {
        payment_session: providerId,
      },
    },
  ];

  let lastError: any = null;

  for (const approach of approaches) {
    try {
      let body: any;
      
      if (typeof approach === 'function') {
        const result = await approach();
        if (!result) continue;
        body = result.body;
      } else {
        body = approach.body;
      }

      const response = await medusaFetch(`/store/carts/${cartId}`, {
        method: "POST",
        headers: {
          "x-publishable-api-key": MEDUSA_API_KEY,
          "Content-Type": "application/json",
        },
        body,
      });

      if (response.ok) {
        return response.json();
      }
      
      lastError = new Error(`Failed to select payment session: ${response.status}`);
    } catch (error: any) {
      lastError = error;
      continue;
    }
  }

  // If all approaches fail, just return the cart (some Medusa setups auto-select)
  // The payment session might be selected automatically during cart completion
  console.warn(`Could not explicitly select payment session ${providerId}, continuing anyway`);
  return getCart(cartId);
}

export async function updateCart(cartId: string, data: any) {
  const response = await medusaFetch(`/store/carts/${cartId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update cart: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getPaymentSession(cartId: string) {
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/carts/${cartId}/payment-sessions`, {
    method: 'GET',
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get payment session: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function authorizePayment(cartId: string, data: any) {
  const response = await medusaFetch(`/store/carts/${cartId}/payment-sessions/${data.provider_id}/authorize`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: data,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to authorize payment: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function completeCart(cartId: string) {
  const response = await medusaFetch(`/store/carts/${cartId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to complete cart: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Customer authentication functions
export async function registerCustomer(email: string, password: string, firstName?: string, lastName?: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function loginCustomer(email: string, password: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to login: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getCustomer(token: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/customers/me`, {
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get customer: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getRegionPaymentProviders(regionId: string) {
  // Use medusaFetch to go through proxy (handles CORS automatically)
  const response = await medusaFetch(`/store/regions/${regionId}/payment-providers`, {
    method: 'GET',
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch payment providers: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Order functions
export async function getOrders(token: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/orders`, {
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get orders: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function getOrder(orderId: string, token: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}`, {
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get order: ${response.status} - ${errorText}`);
  }

  return response.json();
}

