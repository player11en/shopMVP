"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCart, updateLineItem, removeLineItem } from "@/lib/medusa";
import Image from "next/image";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadCart = async () => {
    const cartId = localStorage.getItem("cart_id");
    
    if (!cartId) {
      setError("No cart found. Add items to your cart first!");
      setLoading(false);
      return;
    }

    try {
      const cartData = await getCart(cartId);
      setCart(cartData.cart);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleUpdateQuantity = async (lineItemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(lineItemId);
      return;
    }

    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    setUpdating(lineItemId);
    try {
      await updateLineItem(cartId, lineItemId, newQuantity);
      await loadCart(); // Reload cart to get updated data
    } catch (e: any) {
      setError(e.message || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (lineItemId: string) => {
    const cartId = localStorage.getItem("cart_id");
    if (!cartId) return;

    setUpdating(lineItemId);
    try {
      await removeLineItem(cartId, lineItemId);
      await loadCart(); // Reload cart to get updated data
    } catch (e: any) {
      setError(e.message || "Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Medusa Store
            </Link>
            <Link
              href="/"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      {/* Cart Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {cart && cart.items && cart.items.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {item.thumbnail && (
                      <div className="relative w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.thumbnail?.includes('localhost:9000') ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <label className="text-sm text-gray-600">Quantity:</label>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={updating === item.id}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: 'var(--darkerblue)' }}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {updating === item.id ? "..." : item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={updating === item.id}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ color: 'var(--darkerblue)' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {item.unit_price !== undefined && item.unit_price !== null && (
                      <p className="font-semibold text-gray-900 min-w-[80px] text-right">
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
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove item"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {cart.total !== undefined && cart.total !== null && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
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

            <div className="mt-6">
              <Link
                href={`/checkout?cart_id=${cart.id}`}
                className="block w-full px-6 py-3 text-white rounded-md hover:opacity-90 font-semibold text-center transition-opacity"
                style={{ backgroundColor: '#B64845' }}
              >
                Proceed to Checkout →
              </Link>
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

