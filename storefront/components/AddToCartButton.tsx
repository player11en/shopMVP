"use client";

import { useState } from "react";
import { createCart, addToCart } from "@/lib/medusa";

export function AddToCartButton({ variantId }: { variantId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddToCart = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Get or create cart
      let cartId: string | null = localStorage.getItem("cart_id");
      
      if (!cartId) {
        const cart = await createCart();
        cartId = cart.cart.id;
        if (cartId) {
          localStorage.setItem("cart_id", cartId);
        }
      }

      // Ensure we have a valid cart ID
      if (!cartId) {
        throw new Error("Failed to create or retrieve cart");
      }

      // Add item to cart
      try {
        await addToCart(cartId, variantId, 1);
        setMessage("Added to cart!");
        setTimeout(() => setMessage(""), 2000);
      } catch (error: any) {
        // If cart not found (404), create a new cart and try again
        if (error.message.includes("404") || error.message.includes("Not Found")) {
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
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: loading ? 'var(--browngrey)' : 'var(--lighterblue)' }}
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

