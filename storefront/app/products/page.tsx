"use client";

import Link from "next/link";
import { fetchProducts } from "@/lib/medusa";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data.products || []);
        setError(null);
      } catch (e: any) {
        setError(e.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EDE2' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#2A2623' }}>All Products</h1>
          <p className="text-lg" style={{ color: '#7A2E2C' }}>
            Browse our complete collection of 3D printed models and digital assets
          </p>
        </div>

        {loading && (
          <div className="text-center py-16 rounded-lg shadow-sm" style={{ backgroundColor: '#FBF7F1' }}>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#B64845' }}></div>
            <p className="mt-4" style={{ color: '#7A2E2C' }}>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8">
            <p className="font-semibold">Error loading products: {error}</p>
            <p className="text-sm mt-1">Please check your API configuration.</p>
          </div>
        )}

        {!loading && products.length === 0 && !error && (
          <div className="text-center py-16 rounded-lg shadow-sm" style={{ backgroundColor: '#FBF7F1' }}>
            <svg
              className="w-20 h-20 mx-auto mb-4"
              style={{ color: '#C7BFB6' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#2A2623' }}>No Products Yet</h2>
            <p style={{ color: '#7A2E2C' }}>Check back soon for new items!</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: '#FBF7F1' }}
              >
                {(() => {
                  // Get image URL: prefer thumbnail, fallback to first image
                  const imageUrl = product.thumbnail || (product.images && product.images.length > 0 ? product.images[0].url : null);
                  
                  if (!imageUrl) {
                    return (
                      <div className="relative w-full h-64 flex items-center justify-center" style={{ backgroundColor: '#F5EDE2' }}>
                        <svg className="w-16 h-16" style={{ color: '#C7BFB6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="relative w-full h-64" style={{ backgroundColor: '#F5EDE2' }}>
                      {imageUrl.includes("localhost:9000") ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      )}
                    </div>
                  );
                })()}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1" style={{ color: '#2A2623' }}>
                    {product.title}
                  </h3>
                  {product.description && (
                    <p className="text-sm line-clamp-2 mb-3" style={{ color: '#7A2E2C' }}>
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    {product.variants && product.variants.length > 0 && (
                      <p className="text-sm font-medium" style={{ color: '#B64845' }}>
                        {product.variants.length} variant
                        {product.variants.length > 1 ? "s" : ""}
                      </p>
                    )}
                    <span className="font-medium" style={{ color: '#B64845' }}>View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

