"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCart, addToCart } from "@/lib/medusa";

export function BuyNowButton({ variantId }: { variantId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleBuyNow = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log("Buy Now clicked, variantId:", variantId);
      }
      
      // Create a new cart
      const cart = await createCart();
      const cartId = cart.cart.id;
      
      if (!cartId) {
        throw new Error("Failed to create cart");
      }

      // Add item to cart
      await addToCart(cartId, variantId, 1);
      
      // Save cart ID to localStorage
      localStorage.setItem("cart_id", cartId);
      
      // Redirect directly to checkout
      router.push(`/checkout?cart_id=${cartId}`);
      
    } catch (error: any) {
      console.error("Buy Now error:", error);
      setMessage("Error: " + error.message);
      setLoading(false);
    }
  };

  if (!variantId) {
    console.error("BuyNowButton: variantId is missing!");
    return (
      <div>
        <button disabled className="px-4 py-2 text-gray-400 rounded-md cursor-not-allowed opacity-50">
          <i className="fas fa-exclamation-triangle mr-2"></i>Variant ID missing
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleBuyNow}
        disabled={loading}
        className="px-6 py-3 text-white rounded-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ 
          backgroundColor: loading ? '#C7BFB6' : '#B64845',
          color: '#FFFFFF',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>Processing...
          </>
        ) : (
          <>
            <i className="fas fa-credit-card mr-2"></i>Buy Now
          </>
        )}
      </button>
      {message && (
        <p className={`text-sm mt-2 ${message.includes("Error") ? "text-red-600" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}

