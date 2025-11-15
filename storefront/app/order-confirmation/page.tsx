"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/medusa";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        // First, try to get order from localStorage (stored after checkout)
        const storedOrder = localStorage.getItem(`order_${orderId}`);
        if (storedOrder) {
          try {
            const parsedOrder = JSON.parse(storedOrder);
            setOrder(parsedOrder);
            setLoading(false);
            return;
          } catch (e) {
            // Invalid JSON, continue to fetch from API
          }
        }

        // Try to get order with auth token if available (optional)
        const token = localStorage.getItem("customer_token");
        
        if (token) {
          try {
            const orderData = await getOrder(orderId, token);
            setOrder(orderData.order);
            // Store in localStorage for future access
            localStorage.setItem(`order_${orderId}`, JSON.stringify(orderData.order));
            setLoading(false);
            return;
          } catch (e) {
            // If auth fails, continue to show stored order or error
            console.warn("Could not fetch order with auth:", e);
          }
        }

        // If no stored order and no auth, show error but allow viewing if order data was passed
        if (!storedOrder) {
          setError("Order information not available. Please check your email for order details.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to load order");
        console.error("Order load error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  // Helper to check if product is digital
  const isDigitalProduct = (item: any) => {
    const metadata = item.variant?.product?.metadata || item.product?.metadata || {};
    return metadata.product_type === 'digital' || metadata.is_digital === 'true';
  };

  // Helper to get download URL from product metadata
  const getDownloadUrl = (item: any) => {
    const metadata = item.variant?.product?.metadata || item.product?.metadata || {};
    return metadata.download_url || metadata.download_link || metadata.file_url || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm" style={{ backgroundColor: 'var(--greywhite)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--darkerblue)' }}>
              Medusa Store
            </Link>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error || "Order not found"}
          </div>
          <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </main>
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
              href="/account/orders"
              className="px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--darkerblue)', color: 'white' }}
            >
              <i className="fas fa-user mr-2"></i>My Account
            </Link>
          </div>
        </div>
      </header>

      {/* Order Confirmation Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-6">
          <h1 className="text-2xl font-bold mb-2">
            <i className="fas fa-check-circle mr-2"></i>Order Confirmed!
          </h1>
          <p>Thank you for your purchase. Your order has been received.</p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--darkerblue)' }}>
            Order Details
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm" style={{ color: 'var(--browngrey)' }}>Order Number</p>
              <p className="font-semibold" style={{ color: 'var(--darkerblue)' }}>
                {order.display_id || order.id}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--browngrey)' }}>Order Date</p>
              <p className="font-semibold" style={{ color: 'var(--darkerblue)' }}>
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--browngrey)' }}>Status</p>
              <p className="font-semibold capitalize" style={{ color: 'var(--darkerblue)' }}>
                {order.status || 'pending'}
              </p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--browngrey)' }}>Total</p>
              <p className="font-semibold text-lg" style={{ color: 'var(--darkerblue)' }}>
                {(() => {
                  const total = order.total || 0;
                  const formattedTotal = total > 1000 
                    ? (total / 100).toFixed(2) 
                    : total.toFixed(2);
                  const currency = order.currency_code?.toLowerCase() === 'eur' ? '€' : '$';
                  return `${currency}${formattedTotal.replace(',', '.')}`;
                })()}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--darkerblue)' }}>
              Items Ordered
            </h3>
            <div className="space-y-4">
              {order.items?.map((item: any) => {
                const isDigital = isDigitalProduct(item);
                const downloadUrl = getDownloadUrl(item);
                
                return (
                  <div key={item.id} className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div className="flex-1">
                      <p className="font-medium" style={{ color: 'var(--darkerblue)' }}>
                        {item.title}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--browngrey)' }}>
                        Quantity: {item.quantity}
                      </p>
                      {isDigital && downloadUrl && (
                        <div className="mt-2">
                          <a
                            href={downloadUrl}
                            download
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <i className="fas fa-download mr-2"></i>
                            Download Now
                          </a>
                        </div>
                      )}
                      {isDigital && !downloadUrl && (
                        <p className="text-sm text-yellow-600 mt-2">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Download link will be available soon
                        </p>
                      )}
                    </div>
                    <p className="font-semibold" style={{ color: 'var(--darkerblue)' }}>
                      {(() => {
                        const totalPrice = item.unit_price * item.quantity;
                        const formattedPrice = totalPrice > 1000 
                          ? (totalPrice / 100).toFixed(2) 
                          : totalPrice.toFixed(2);
                        const currency = item.currency_code?.toLowerCase() === 'eur' ? '€' : '$';
                        return `${currency}${formattedPrice.replace(',', '.')}`;
                      })()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-md hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--darkerblue)', color: 'white' }}
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="px-6 py-3 border-2 rounded-md hover:opacity-90 transition-opacity"
            style={{ borderColor: 'var(--darkerblue)', color: 'var(--darkerblue)' }}
          >
            View All Orders
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}

