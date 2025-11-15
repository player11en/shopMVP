import Link from "next/link";
import { fetchProducts } from "@/lib/medusa";
import Image from "next/image";

export default async function Home() {
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
      {/* Header */}
      <header className="bg-white shadow-sm" style={{ backgroundColor: 'var(--greywhite)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--darkerblue)' }}>
              Medusa Store
            </Link>
            <div className="flex gap-3">
              <Link
                href="/cart"
                className="px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--darkerblue)', color: 'white' }}
              >
                <i className="fas fa-shopping-cart mr-2"></i>Cart
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-1">
              Make sure you&apos;ve set your API key in{" "}
              <code className="bg-red-100 px-1 rounded">lib/medusa.ts</code>
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--darkerblue)' }}>Products</h1>

        {products.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.handle}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ 
                boxShadow: '0 4px 6px var(--shadow)',
                backgroundColor: 'white'
              }}
            >
              {product.thumbnail && (
                <div className="relative w-full h-64" style={{ backgroundColor: 'var(--greywhite)' }}>
                  {/* Use regular img tag for localhost images */}
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
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--darkerblue)' }}>
                  {product.title}
                </h2>
                {product.description && (
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--browngrey)' }}>
                    {product.description}
                  </p>
                )}
                {product.variants && product.variants.length > 0 && (
                  <p className="text-sm mt-2" style={{ color: 'var(--lighterblue)' }}>
                    {product.variants.length} variant{product.variants.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
