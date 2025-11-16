import Link from "next/link";
import { fetchProducts } from "@/lib/medusa";
import Image from "next/image";

export default async function ProductsPage() {
  let products = [];
  let error = null;

  try {
    const data = await fetchProducts();
    products = data.products || [];
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-lg text-gray-600">
            Browse our complete collection of 3D printed models and digital assets
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-8">
            <p className="font-semibold">Error loading products: {error}</p>
            <p className="text-sm mt-1">Please check your API configuration.</p>
          </div>
        )}

        {products.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <svg
              className="w-20 h-20 text-gray-400 mx-auto mb-4"
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
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Products Yet</h2>
            <p className="text-gray-500">Check back soon for new items!</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {product.thumbnail && (
                <div className="relative w-full h-64 bg-gray-100">
                  {product.thumbnail?.includes("localhost:9000") ? (
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
                <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-1">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                )}
                <div className="flex justify-between items-center">
                  {product.variants && product.variants.length > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      {product.variants.length} variant
                      {product.variants.length > 1 ? "s" : ""}
                    </p>
                  )}
                  <span className="text-blue-600 font-medium">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

