// 🔑 API Key from environment variable or fallback
// Get it from: http://localhost:9000/app → Settings → API Keys → Copy Publishable Key
export const MEDUSA_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || "pk_4c2de4f8b6923e0566e9e7ccfd5d1c282db97ade5b2d360fd8930f0bcc22ed2d";

// Backend URL
export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";

async function medusaFetch(path: string, init: RequestInit = {}) {
  const url = `${MEDUSA_BACKEND_URL}${path}`;
  const method = (init.method || "GET").toUpperCase();
  const headers: HeadersInit = {
    "x-publishable-api-key": MEDUSA_API_KEY,
    ...(init.headers || {}),
  };

  // Server-side or simple GET can hit backend directly
  if (typeof window === "undefined" || method === "GET") {
    return fetch(url, {
      ...init,
      headers,
    });
  }

  const body =
    init.body && typeof init.body !== "string"
      ? JSON.stringify(init.body)
      : (init.body as string | null | undefined);

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

  if (proxyResponse.status !== 404) {
    return proxyResponse;
  }

  return fetch(url, {
    ...init,
    headers,
    body,
  });
}

// API helper functions
export async function fetchProducts() {
  try {
    // Request products with images included
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products?fields=*images`, {
      headers: {
        "x-publishable-api-key": MEDUSA_API_KEY,
      },
      cache: 'no-store', // Don't cache in development
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch products: ${response.status} - ${errorText}`);
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
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, {
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
  } catch (e) {
    console.warn('Could not fetch regions:', e);
  }
  return null;
}

export async function fetchProduct(handle: string) {
  try {
    // Get default region for price calculation
    const regionId = await getDefaultRegion();
    
    // Build URL with fields parameter for calculated_price
    let url = `${MEDUSA_BACKEND_URL}/store/products?handle=${handle}&fields=*variants.calculated_price`;
    if (regionId) {
      url += `&region_id=${regionId}`;
    }
    
    const response = await fetch(url, {
      headers: {
        "x-publishable-api-key": MEDUSA_API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const data = await response.json();
    let product = data.products?.find((p: any) => p.handle === handle);
    
    if (!product) {
      throw new Error(`Product with handle "${handle}" not found`);
    }
    
    // Try to get metadata from custom endpoint
    try {
      const customResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/products/handle/${handle}`, {
          headers: {
            "x-publishable-api-key": MEDUSA_API_KEY,
          },
          cache: 'no-store',
        });

      if (customResponse.ok) {
        const customData = await customResponse.json();
        // Merge metadata from custom endpoint
        if (customData.product?.metadata) {
          product = {
            ...product,
            metadata: customData.product.metadata,
          };
        }
      }
    } catch (customError) {
      // Ignore custom endpoint errors
      console.warn('Could not fetch metadata from custom endpoint:', customError);
    }
    
    // Debug: Log product data
    if (process.env.NODE_ENV === 'development') {
      console.log('=== PRODUCT API RESPONSE ===');
      console.log('Product handle:', product.handle);
      console.log('Product title:', product.title);
      console.log('Variants count:', product.variants?.length || 0);
      if (product.variants?.[0]) {
        console.log('First variant keys:', Object.keys(product.variants[0]));
        console.log('First variant calculated_price:', product.variants[0].calculated_price);
        console.log('Full first variant:', JSON.stringify(product.variants[0], null, 2));
      }
      console.log('===========================================');
    }
    
    return product;
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
  
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create cart: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      variant_id: variantId,
      quantity,
    }),
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
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
    method: "POST",
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update cart item: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function removeLineItem(cartId: string, lineItemId: string) {
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/line-items/${lineItemId}`, {
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
  // Request cart with product relations to get metadata
  // Use expand parameter to include full product data with metadata
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}?expand=items.variant.product`, {
    headers: {
      "x-publishable-api-key": MEDUSA_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch cart: ${errorText}`);
  }

  const data = await response.json();
  
  // Debug: Log cart structure to see metadata
  if (data.cart?.items) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Cart items structure:', data.cart.items.map((item: any) => ({
      title: item.title,
      hasVariant: !!item.variant,
      hasProduct: !!item.variant?.product,
      metadata: item.variant?.product?.metadata || item.product?.metadata || {},
    })));
    }
  }
  
  return data;
}

// Payment functions
export async function createPaymentSession(cartId: string) {
  const response = await medusaFetch(`/store/carts/${cartId}/payment-sessions`, {
    method: "POST",
    headers: {
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
  const response = await medusaFetch(`/store/carts/${cartId}/payment-session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider_id: providerId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to select payment session: ${response.status} - ${errorText}`);
  }

  return response.json();
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
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/carts/${cartId}/payment-sessions`, {
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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
  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/regions/${regionId}/payment-providers`, {
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

