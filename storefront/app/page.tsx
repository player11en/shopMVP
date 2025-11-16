"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchProducts } from "@/lib/medusa";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await fetchProducts();
        setProducts(data.products || []);
      } catch (e: any) {
        setError(e.message);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EDE2' }}>
      {/* Hero Section */}
      <section className="text-white" style={{ background: 'linear-gradient(to bottom right, #B64845, #7A2E2C)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Professional 3D Printing & Modeling Services
              </h1>
              <p className="text-xl mb-8" style={{ color: '#FBF7F1' }}>
                High-quality 3D printed models, Daz3D conversions, and custom 3D modeling solutions for your creative projects.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#products"
                  className="px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                  style={{ backgroundColor: '#FBF7F1', color: '#7A2E2C' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5EDE2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FBF7F1'}
                >
                  Browse Products
                </Link>
                <Link
                  href="/about"
                  className="px-8 py-3 text-white rounded-lg font-semibold transition-colors border-2"
                  style={{ backgroundColor: '#7A2E2C', borderColor: '#FBF7F1' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#B64845'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7A2E2C'}
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative w-full h-96 rounded-2xl backdrop-blur-sm flex items-center justify-center" style={{ backgroundColor: 'rgba(122, 46, 44, 0.3)' }}>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <Image
                      src="https://cdn.renderhub.com/inn/avatar.png"
                      alt="inn 3D"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-lg font-semibold">inn 3D Druck und Modellierung</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16" style={{ backgroundColor: '#FBF7F1' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#2A2623' }}>Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5EDE2' }}>
                <svg className="w-8 h-8" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#2A2623' }}>3D Printing</h3>
              <p style={{ color: '#7A2E2C' }}>
                High-quality 3D printed models with precision and detail. Custom orders available.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5EDE2' }}>
                <svg className="w-8 h-8" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#2A2623' }}>Daz3D Conversions</h3>
              <p style={{ color: '#7A2E2C' }}>
                Professional model conversions for Daz3D. Optimized for performance and quality.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#F5EDE2' }}>
                <svg className="w-8 h-8" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#2A2623' }}>Custom Modeling</h3>
              <p style={{ color: '#7A2E2C' }}>
                Bespoke 3D modeling services tailored to your specific needs and requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16" style={{ backgroundColor: '#F5EDE2' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="px-4 py-3 rounded-lg mb-8" style={{ backgroundColor: '#FBF7F1', border: '1px solid #B64845', color: '#7A2E2C' }}>
              <p className="font-semibold">Error loading products: {error}</p>
              <p className="text-sm mt-1">
                Please check your API configuration.
              </p>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#2A2623' }}>Featured Products</h2>
            <Link
              href="/products"
              className="font-medium"
              style={{ color: '#B64845' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7A2E2C'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#B64845'}
            >
              View All →
            </Link>
          </div>

          {products.length === 0 && !error && (
            <div className="text-center py-12 rounded-lg shadow-sm" style={{ backgroundColor: '#FBF7F1' }}>
              <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#C7BFB6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg" style={{ color: '#7A2E2C' }}>No products available yet.</p>
              <p className="text-sm mt-2" style={{ color: '#C7BFB6' }}>Check back soon for new items!</p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <Link
                key={product.id}
                href={`/products/${product.handle}`}
                className="rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ backgroundColor: '#FBF7F1' }}
              >
                {product.thumbnail && (
                  <div className="relative w-full h-64" style={{ backgroundColor: '#F5EDE2' }}>
                    {product.thumbnail?.includes('localhost:9000') ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </div>
                )}
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
                        {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                      </p>
                    )}
                    <span className="font-medium" style={{ color: '#B64845' }}>View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-white py-16" style={{ backgroundColor: '#B64845' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8" style={{ color: '#FBF7F1' }}>
            Get in touch to discuss your 3D printing and modeling needs.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
            style={{ backgroundColor: '#FBF7F1', color: '#7A2E2C' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5EDE2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FBF7F1'}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
}
