"use client";

import { useState } from "react";
import { createCart, addToCart } from "@/lib/medusa";

export function AddToCartButton({ variantId }: { variantId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Debug: Log when component renders
  console.log("🔘 AddToCartButton rendered with variantId:", variantId);

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage("");

    try {
      console.log("🛒 Add to Cart clicked, variantId:", variantId);
      
      // Get or create cart
      let cartId: string | null = localStorage.getItem("cart_id");
      console.log("📦 Existing cart ID:", cartId);
      
      if (!cartId) {
        console.log("🆕 Creating new cart...");
        const cart = await createCart();
        console.log("✅ Cart created:", cart);
        cartId = cart.cart.id;
        if (cartId) {
          localStorage.setItem("cart_id", cartId);
          console.log("💾 Cart ID saved to localStorage");
        }
      }

      // Ensure we have a valid cart ID
      if (!cartId) {
        throw new Error("Failed to create or retrieve cart");
      }

      // Add item to cart
      try {
        console.log("➕ Adding variant to cart:", { cartId, variantId, quantity: 1 });
        await addToCart(cartId, variantId, 1);
        console.log("✅ Successfully added to cart!");
        setMessage("Added to cart!");
        setTimeout(() => setMessage(""), 2000);
      } catch (error: any) {
        console.error("❌ Error adding to cart:", error);
        // If cart not found (404), create a new cart and try again
        if (error.message.includes("404") || error.message.includes("Not Found")) {
          console.log("🔄 Cart not found, creating new cart...");
          localStorage.removeItem("cart_id");
          const cart = await createCart();
          cartId = cart.cart.id;
          if (cartId) {
            localStorage.setItem("cart_id", cartId);
            await addToCart(cartId, variantId, 1);
            setMessage("Added to cart!");
            setTimeout(() => setMessage(""), 2000);
          } else {
            throw new Error("Failed to create new cart");
          }
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("❌ Final error:", error);
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if variantId is missing
  if (!variantId) {
    console.error("❌ AddToCartButton: variantId is missing!");
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
        onClick={(e) => {
          console.log("🖱️ Button clicked!", { variantId, event: e });
          e.preventDefault();
          e.stopPropagation();
          handleAddToCart();
        }}
        disabled={loading}
        className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity cursor-pointer font-medium"
        style={{ 
          backgroundColor: loading ? '#C7BFB6' : '#B64845',
          color: '#FFFFFF',
          border: 'none',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>Adding...
          </>
        ) : (
          <>
            <i className="fas fa-cart-plus mr-2"></i>Add to Cart
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

