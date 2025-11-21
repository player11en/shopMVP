"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { 
  getCart, 
  createPaymentSession, 
  selectPaymentSession, 
  getPaymentSession,
  updateCart, 
  completeCart,
  getRegionPaymentProviders,
} from "@/lib/medusa";

// Initialize Stripe (we'll get publishable key from backend or env)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

// Country code to name mapping
const getCountryName = (code: string): string => {
  const countries: Record<string, string> = {
    US: "United States",
    CA: "Canada",
    GB: "United Kingdom",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    NL: "Netherlands",
    BE: "Belgium",
    AT: "Austria",
    SE: "Sweden",
    DK: "Denmark",
    NO: "Norway",
    FI: "Finland",
    PL: "Poland",
    PT: "Portugal",
    IE: "Ireland",
    CH: "Switzerland",
    GR: "Greece",
    CZ: "Czech Republic",
    HU: "Hungary",
    RO: "Romania",
    BG: "Bulgaria",
    HR: "Croatia",
    SK: "Slovakia",
    SI: "Slovenia",
    EE: "Estonia",
    LV: "Latvia",
    LT: "Lithuania",
    LU: "Luxembourg",
    MT: "Malta",
    CY: "Cyprus",
  };
  return countries[code.toUpperCase()] || code.toUpperCase();
};

// Stripe Payment Form Component
// Following Medusa docs: https://docs.medusajs.com/resources/storefront-development/checkout/payment/stripe
function StripePaymentForm({ 
  cartId, 
  paymentSession, 
  cart,
  onSuccess, 
  onError 
}: { 
  cartId: string; 
  paymentSession: any; 
  cart?: any;
  onSuccess: () => void; 
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const clientSecret = paymentSession.data?.client_secret;
      if (!clientSecret) {
        throw new Error("Payment session not ready");
      }

      // Confirm payment with Stripe (following Medusa docs)
      // Include billing details from cart for better Stripe processing
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cart?.billing_address?.first_name 
              ? `${cart.billing_address.first_name} ${cart.billing_address.last_name || ''}`.trim()
              : cart?.email || undefined,
            email: cart?.email || undefined,
            phone: cart?.billing_address?.phone || undefined,
            address: cart?.billing_address ? {
              city: cart.billing_address.city || undefined,
              country: cart.billing_address.country_code || undefined,
              line1: cart.billing_address.address_1 || undefined,
              line2: cart.billing_address.address_2 || undefined,
              postal_code: cart.billing_address.postal_code || undefined,
            } : undefined,
          },
        },
      });

      if (confirmError) {
        throw new Error(confirmError.message || "Payment failed");
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful, complete order
        onSuccess();
      } else {
        throw new Error(`Payment not completed. Status: ${paymentIntent?.status || 'unknown'}`);
      }
    } catch (e: any) {
      const errorMsg = e.message || "Failed to process payment";
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--darkerblue)' }}>
        Card Details
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 p-3 bg-white border border-gray-300 rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full px-6 py-3 text-white rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: processing ? 'var(--browngrey)' : 'var(--darkerblue)' }}
        >
          {processing ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>Processing Payment...
            </>
          ) : (
            "Pay Now"
          )}
        </button>
      </form>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const cartId = searchParams.get("cart_id") || (typeof window !== 'undefined' ? localStorage.getItem("cart_id") : null);
  
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentProviders, setPaymentProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [paymentSessionData, setPaymentSessionData] = useState<any>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [bankTransferDetails, setBankTransferDetails] = useState<any>(null);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    const loadCart = async () => {
      if (!cartId) {
        setError("No cart found. Please add items to your cart first.");
        setLoading(false);
        return;
      }

      try {
        // Single API call to get cart - it may already include payment sessions
        const cartData = await getCart(cartId);
        const cart = cartData.cart || cartData;
        setCart(cart);

        // Helper function to format provider names
        const formatProviderName = (id: string) => {
          if (id === 'stripe') return '💳 Stripe';
          if (id === 'bank_transfer') return '🏦 Bank Transfer';
          if (id === 'paypal') return '💙 PayPal';
          if (id === 'pp_system_default') return 'Manual Payment (Test)';
          return id.replace(/^pp_/, '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        };

        // Check if cart already has payment sessions (Medusa v2 often includes them)
        let providers: any[] = [];
        
        if (cart.payment_sessions && cart.payment_sessions.length > 0) {
          // Use payment sessions from cart response (no extra API call needed!)
          console.log("✅ Using payment sessions from cart response");
          providers = cart.payment_sessions.map((ps: any) => ({
            id: ps.provider_id,
            name: formatProviderName(ps.provider_id),
            session: ps, // Store the session for later use
          }));
        } else if (cart.region?.payment_providers && cart.region.payment_providers.length > 0) {
          // Use payment providers from region in cart response
          console.log("✅ Using payment providers from region in cart response");
          providers = cart.region.payment_providers.map((provider: any) => ({
            id: provider.id || provider.provider_id,
            name: formatProviderName(provider.id || provider.provider_id),
          }));
        } else if (cart.region_id) {
          // Fallback: Fetch payment providers from region (one API call)
          try {
            console.log("🔄 Fetching payment providers from region");
            const providerResponse = await getRegionPaymentProviders(cart.region_id);
            const regionProviders = providerResponse.region?.payment_providers || [];
            if (regionProviders.length > 0) {
              providers = regionProviders.map((provider: any) => ({
                id: provider.id || provider.provider_id,
                name: formatProviderName(provider.id || provider.provider_id),
              }));
            }
          } catch (regionError) {
            console.warn("Could not load region payment providers:", regionError);
          }
        }
        
        // If still no providers, try creating payment sessions (last resort - 2 API calls)
        if (providers.length === 0) {
          try {
            console.log("🔄 Creating payment sessions (fallback method)");
            await createPaymentSession(cartId);
            const sessionData = await getPaymentSession(cartId);
            
            if (sessionData.payment_sessions && sessionData.payment_sessions.length > 0) {
              providers = sessionData.payment_sessions.map((ps: any) => ({
                id: ps.provider_id,
                name: formatProviderName(ps.provider_id),
                session: ps,
              }));
            }
          } catch (sessionError: any) {
            console.error("❌ Error creating payment sessions:", sessionError);
            // Continue without payment providers
          }
        }

        // Set providers if we found any
        if (providers.length > 0) {
          setPaymentProviders(providers);
          setSelectedProvider(providers[0].id);
          console.log(`✅ Found ${providers.length} payment provider(s):`, providers);
        } else {
          console.warn("⚠️ No payment providers found - check if providers are added to region in admin");
        }
        
        // Load available countries from region (already in cart data)
        if (cart.region?.countries) {
          const countries = cart.region.countries.map((c: any) => c.iso_2 || c.iso_2_code || c.code).filter(Boolean);
          setAvailableCountries(countries);
          // Set default country to first available
          if (countries.length > 0 && !formData.country) {
            setFormData(prev => ({ ...prev, country: countries[0] }));
          }
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [cartId]);

  // Check if cart is free (total = 0)
  const isFreeCart = cart && cart.total === 0;

  // Check if all products are digital (no shipping needed)
  const isDigitalOnly = cart?.items?.every((item: any) => {
    // Try multiple paths to get metadata
    const metadata = item.variant?.product?.metadata || 
                     item.product?.metadata || 
                     item.metadata ||
                     {};
    return metadata.product_type === 'digital' || metadata.is_digital === 'true';
  }) || false;

  // Handle payment setup (for Stripe, show card form)
  const handlePaymentSetup = async () => {
    if (!cartId) {
      setError("No cart ID found");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      // Step 1: Update cart with customer information
      // For digital products, shipping address is optional
      const email = (formData.email || "").trim()
      const safeEmail =
        email && email.includes("@") ? email : `guest+${cartId}@example.com`

      const updateData: any = {
        email: safeEmail,
      };

      // Only require shipping address for physical products
      if (!isDigitalOnly) {
        updateData.shipping_address = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          country_code: formData.country,
        };
      } else {
        // For digital products, just use email/name
        updateData.billing_address = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          country_code: formData.country || 'US',
        };
      }

      await updateCart(cartId, updateData);

      // Step 2: If free cart, skip payment and complete directly
      if (isFreeCart) {
        console.log("🎁 Free cart detected - completing order directly");
        await handleCompleteOrder();
        return;
      }

      // Step 3: Payment sessions should already be created in loadCart
      // But we'll refresh them to ensure they're up to date with the new address
      try {
      await createPaymentSession(cartId);
      } catch (paymentError: any) {
        // If payment session creation fails, check if it's because no providers are configured
        if (paymentError.message?.includes('payment provider') || paymentError.message?.includes('provider')) {
          throw new Error("No payment providers configured. Please add a payment provider in Admin: Settings → Regions → Edit Region → Payment Providers. For testing, you can add 'Manual Payment (Test)' provider.");
        }
        throw paymentError;
      }

      // Step 4: Select payment provider (only if providers are available)
      if (paymentProviders.length > 0) {
      if (selectedProvider) {
        await selectPaymentSession(cartId, selectedProvider);
        
        // Get payment session data
        const sessionData = await getPaymentSession(cartId);
        const paymentSession = sessionData.payment_sessions?.find((ps: any) => ps.provider_id === selectedProvider);
        
        if (paymentSession) {
          // If Stripe, show card form
          if (selectedProvider.includes('stripe') && paymentSession.data?.client_secret) {
            setPaymentSessionData(paymentSession);
            setShowStripeForm(true);
            setBankTransferDetails(null);
            setProcessing(false);
            return;
          }
          // If Bank Transfer, show bank details
          else if (selectedProvider === 'bank_transfer' && paymentSession.data) {
            setBankTransferDetails(paymentSession.data);
            setShowStripeForm(false);
            setPaymentSessionData(null);
          } else {
            setShowStripeForm(false);
            setBankTransferDetails(null);
            setPaymentSessionData(null);
          }
        }
        } else {
          throw new Error("Please select a payment method");
        }
      } else {
        // No payment providers - skip payment and complete order (for testing)
        console.warn("No payment providers configured - completing order without payment (testing mode)");
      }

      // For non-Stripe payments (manual, bank transfer, etc.), complete directly
      await handleCompleteOrder();
    } catch (e: any) {
      setError(e.message || "Failed to setup payment. Please try again.");
      console.error("Payment setup error:", e);
      setProcessing(false);
    }
  };

  // Complete the order (after Stripe payment or for manual payment)
  // Following Medusa docs: https://docs.medusajs.com/resources/storefront-development/checkout/payment/stripe
  const handleCompleteOrder = async () => {
    if (!cartId) {
      throw new Error("No cart ID found");
    }

    // Complete the cart (creates order)
    const result = await completeCart(cartId);
    
    // Check response type according to Medusa docs
    // If type is "cart", an error occurred
    if (result.type === "cart" && result.cart) {
      const errorMessage = result.error?.message || "Failed to complete order";
      throw new Error(errorMessage);
    }
    
    // If type is "order", order was placed successfully
    if (result.type === "order" && result.order) {
      const order = result.order;
      const orderId = order.id;
      
      // Store order in localStorage for guest access (no account needed)
      localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
      
      // Clear cart from localStorage
      localStorage.removeItem("cart_id");
      
      // Redirect to order confirmation page
      window.location.href = `/order-confirmation?order_id=${orderId}`;
      return;
    }
    
    // Fallback: try to extract order from result (for backwards compatibility)
    const order = result.data || result.order || result;
    const orderId = order?.id || result.data?.id || result.order?.id || result.id;
    
    if (!orderId) {
      throw new Error("Order ID not found in response");
    }
    
    // Store order in localStorage for guest access (no account needed)
    if (order) {
      localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
    }
    
    // Clear cart from localStorage
    localStorage.removeItem("cart_id");
    
    // Redirect to order confirmation page
    window.location.href = `/order-confirmation?order_id=${orderId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form - shipping address only required for physical products
    if (!formData.email || !formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields");
      return;
    }

    // For physical products, require shipping address
    if (!isDigitalOnly && (!formData.address || !formData.city || !formData.postalCode)) {
      setError("Please fill in shipping address for physical products");
      return;
    }

    // For free products, skip payment provider selection
    if (!isFreeCart && paymentProviders.length > 0 && !selectedProvider) {
      setError("Please select a payment method");
      return;
    }
    
    // If no payment providers and not free, show error but allow manual completion
    if (!isFreeCart && paymentProviders.length === 0) {
      console.warn("⚠️ No payment providers available, but attempting to complete order anyway");
      // Continue anyway - backend might handle it
    }

    // Start payment setup (or complete directly if free)
    await handlePaymentSetup();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading checkout...</p>
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
              <i className="fas fa-arrow-left mr-2"></i>Back to Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--darkerblue)' }}>
          Checkout
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--darkerblue)' }}>
                Order Summary
              </h2>
              
              <div className="space-y-4 mb-6">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <div>
                      <p className="font-medium" style={{ color: 'var(--darkerblue)' }}>
                        {item.title}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--browngrey)' }}>
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    {item.unit_price !== undefined && item.unit_price !== null && (
                      <p className="font-semibold" style={{ color: 'var(--darkerblue)' }}>
                        {(() => {
                          // Check if price is in cents (very large number) or already formatted
                          const totalPrice = item.unit_price * item.quantity;
                          // If price > 1000, assume cents, otherwise already formatted
                          const formattedPrice = totalPrice > 1000 
                            ? (totalPrice / 100).toFixed(2) 
                            : totalPrice.toFixed(2);
                          const currency = item.currency_code?.toLowerCase() === 'eur' ? '€' : '$';
                          return `${currency}${formattedPrice.replace(',', '.')}`;
                        })()}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {cart.total !== undefined && cart.total !== null && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold" style={{ color: 'var(--darkerblue)' }}>
                      Total:
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--darkerblue)' }}>
                      {(() => {
                        // Check if total is in cents (very large number) or already formatted
                        const formattedTotal = cart.total > 1000 
                          ? (cart.total / 100).toFixed(2) 
                          : cart.total.toFixed(2);
                        const currency = cart.currency_code?.toLowerCase() === 'eur' ? '€' : '$';
                        return `${currency}${formattedTotal.replace(',', '.')}`;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--darkerblue)' }}>
                {isDigitalOnly ? 'Customer Information' : 'Shipping Information'}
              </h2>

              {isFreeCart && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
                  <i className="fas fa-gift mr-2"></i>
                  <strong>Free Product!</strong> No payment required. You'll get instant access after checkout.
                </div>
              )}

              {isDigitalOnly && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
                  <i className="fas fa-download mr-2"></i>
                  <strong>Digital Product</strong> - No shipping address needed. You'll receive a download link after purchase.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>

                {!isDigitalOnly && (
                  <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                    Address *
                  </label>
                  <input
                    type="text"
                        required={!isDigitalOnly}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                      City *
                    </label>
                    <input
                      type="text"
                          required={!isDigitalOnly}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                      Postal Code *
                    </label>
                    <input
                      type="text"
                          required={!isDigitalOnly}
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--darkerblue)' }}>
                    Country *
                  </label>
                  <select
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    disabled={availableCountries.length === 0}
                  >
                    {availableCountries.length === 0 ? (
                      <option value="">Loading countries...</option>
                    ) : (
                      availableCountries.map((countryCode) => (
                        <option key={countryCode} value={countryCode}>
                          {getCountryName(countryCode)}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Payment Provider Selection - Hide for free products */}
                {!isFreeCart && paymentProviders.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--darkerblue)' }}>
                      Payment Method *
                    </label>
                    <div className="space-y-2">
                      {paymentProviders.map((provider: any) => (
                        <label
                          key={provider.id}
                          className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                            selectedProvider === provider.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentProvider"
                            value={provider.id}
                            checked={selectedProvider === provider.id}
                            onChange={async (e) => {
                              setSelectedProvider(e.target.value);
                              // When bank transfer is selected, fetch and show bank details
                              if (e.target.value === 'bank_transfer' && cartId) {
                                try {
                                  await selectPaymentSession(cartId, 'bank_transfer');
                                  const sessionData = await getPaymentSession(cartId);
                                  const bankSession = sessionData.payment_sessions?.find((ps: any) => ps.provider_id === 'bank_transfer');
                                  if (bankSession?.data) {
                                    setBankTransferDetails(bankSession.data);
                                  }
                                } catch (err) {
                                  console.error('Error loading bank transfer details:', err);
                                }
                              } else {
                                setBankTransferDetails(null);
                              }
                            }}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium" style={{ color: 'var(--darkerblue)' }}>
                              {(() => {
                                if (provider.id === 'pp_system_default') return 'Manual Payment (Test)'
                                if (provider.id === 'stripe') return '💳 Stripe'
                                if (provider.id === 'bank_transfer') return '🏦 Bank Transfer'
                                if (provider.id === 'paypal') return '💙 PayPal'
                                return provider.id.replace(/^pp_/, '').replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                              })()}
                            </p>
                            {provider.id === 'pp_system_default' && (
                              <p className="text-xs" style={{ color: 'var(--browngrey)' }}>
                                For testing - no real payment required
                              </p>
                            )}
                            {provider.id === 'stripe' && (
                              <p className="text-xs" style={{ color: 'var(--browngrey)' }}>
                                Credit card, Apple Pay, Google Pay, Klarna (Buy Now Pay Later)
                              </p>
                            )}
                            {provider.id === 'bank_transfer' && (
                              <p className="text-xs" style={{ color: 'var(--browngrey)' }}>
                                Direct bank transfer - Order confirmed after payment received
                              </p>
                            )}
                            {provider.id === 'paypal' && (
                              <p className="text-xs" style={{ color: 'var(--browngrey)' }}>
                                PayPal account or credit card
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {!isFreeCart && paymentProviders.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
                    <strong>⚠️ No payment providers detected.</strong>
                    <br />
                    <strong>Steps to fix:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                                <li>Go to <a href={`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}/app`} target="_blank" className="underline font-semibold">Admin Panel</a></li>
                      <li>Settings → Regions → Click your region</li>
                      <li>Scroll to "Payment Providers" section</li>
                      <li>Add: <code className="bg-yellow-100 px-1">bank_transfer</code> or <code className="bg-yellow-100 px-1">paypal</code> or <code className="bg-yellow-100 px-1">stripe</code></li>
                      <li>Save the region</li>
                      <li>Restart backend: <code className="bg-yellow-100 px-1">cd my-store && npm run dev:link</code></li>
                      <li>Refresh this page</li>
                    </ol>
                    <br />
                    <strong>Check browser console (F12) for detailed error messages.</strong>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {bankTransferDetails && selectedProvider === 'bank_transfer' && (
                  <div className="mt-4 p-4 border rounded-md" style={{ borderColor: '#C7BFB6', backgroundColor: '#FBF7F1' }}>
                    <h3 className="font-semibold mb-3" style={{ color: '#7A2E2C' }}>
                      <i className="fas fa-university mr-2"></i>Bank Transfer Instructions
                    </h3>
                    {bankTransferDetails.instructions && (
                      <p className="mb-3 text-sm" style={{ color: '#2A2623' }}>
                        {bankTransferDetails.instructions}
                      </p>
                    )}
                    <div className="space-y-2 text-sm" style={{ color: '#2A2623' }}>
                      {bankTransferDetails.bankName && (
                        <div>
                          <strong>Bank Name:</strong> {bankTransferDetails.bankName}
                        </div>
                      )}
                      {bankTransferDetails.accountNumber && (
                        <div>
                          <strong>Account Number:</strong> {bankTransferDetails.accountNumber}
                        </div>
                      )}
                      {bankTransferDetails.routingNumber && (
                        <div>
                          <strong>Routing Number:</strong> {bankTransferDetails.routingNumber}
                        </div>
                      )}
                      {bankTransferDetails.iban && (
                        <div>
                          <strong>IBAN:</strong> {bankTransferDetails.iban}
                        </div>
                      )}
                      {bankTransferDetails.swift && (
                        <div>
                          <strong>SWIFT:</strong> {bankTransferDetails.swift}
                        </div>
                      )}
                      {bankTransferDetails.amount && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: '#C7BFB6' }}>
                          <strong>Amount to Transfer:</strong> {bankTransferDetails.currency_code?.toUpperCase()} {bankTransferDetails.amount > 1000 ? (bankTransferDetails.amount / 100).toFixed(2) : bankTransferDetails.amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 rounded" style={{ backgroundColor: '#F5EDE2' }}>
                      <p className="text-xs" style={{ color: '#7A2E2C' }}>
                        <i className="fas fa-info-circle mr-2"></i>
                        After transferring the amount, your order will be confirmed manually. You'll receive a confirmation email once payment is received.
                      </p>
                    </div>
                  </div>
                )}

                {/* Stripe Payment Form */}
                {showStripeForm && paymentSessionData && (
                  <StripePaymentForm
                    cartId={cartId!}
                    paymentSession={paymentSessionData}
                    cart={cart}
                    onSuccess={handleCompleteOrder}
                    onError={(error: string) => {
                      setError(error);
                      setShowStripeForm(false);
                      setProcessing(false);
                    }}
                  />
                )}

                <button
                  type="submit"
                  disabled={processing || showStripeForm || (!isFreeCart && paymentProviders.length > 0 && !selectedProvider)}
                  className="w-full px-6 py-3 text-white rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: (processing || showStripeForm || (!isFreeCart && paymentProviders.length > 0 && !selectedProvider)) ? '#C7BFB6' : '#B64845',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: (processing || showStripeForm || (!isFreeCart && paymentProviders.length > 0 && !selectedProvider)) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
                    </>
                  ) : showStripeForm ? (
                    "Complete payment above"
                  ) : isFreeCart ? (
                    <>
                      <i className="fas fa-gift mr-2"></i>Complete Free Order
                    </>
                  ) : paymentProviders.length === 0 ? (
                    <>
                      <i className="fas fa-exclamation-triangle mr-2"></i>No Payment Method Available
                    </>
                  ) : (
                    <>
                      <i className="fas fa-credit-card mr-2"></i>Continue to Payment
                    </>
                  )}
                </button>
                
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 text-xs rounded" style={{ backgroundColor: '#F5EDE2', color: '#7A2E2C' }}>
                    <p><strong>Debug:</strong></p>
                    <p>Free Cart: {isFreeCart ? 'Yes' : 'No'}</p>
                    <p>Payment Providers: {paymentProviders.length}</p>
                    <p>Selected Provider: {selectedProvider || 'None'}</p>
                    <p>Show Stripe Form: {showStripeForm ? 'Yes' : 'No'}</p>
                    <p>Processing: {processing ? 'Yes' : 'No'}</p>
                    <p>Button Disabled: {processing || (!isFreeCart && paymentProviders.length > 0 && !selectedProvider) || showStripeForm ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">Your cart is empty</p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </Elements>
  );
}

