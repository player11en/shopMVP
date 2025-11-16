import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5EDE2' }}>
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="rounded-2xl shadow-lg overflow-hidden mb-12" style={{ backgroundColor: '#FBF7F1' }}>
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            <div>
              <h1 className="text-4xl font-bold mb-6" style={{ color: '#2A2623' }}>
                About inn 3D
              </h1>
              <p className="text-lg mb-6" style={{ color: '#7A2E2C' }}>
                We specialize in professional 3D printing services, model conversions for Daz3D, 
                and custom 3D modeling solutions.
              </p>
              <p className="mb-6" style={{ color: '#7A2E2C' }}>
                With years of experience in digital fabrication and 3D design, we deliver 
                high-quality results that bring your creative visions to life.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <Image
                  src="https://cdn.renderhub.com/inn/avatar.png"
                  alt="inn 3D Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <section className="rounded-2xl shadow-lg p-8 md:p-12 mb-12" style={{ backgroundColor: '#FBF7F1' }}>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#2A2623' }}>What We Do</h2>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5EDE2' }}>
                  <svg className="w-6 h-6" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2A2623' }}>3D Printing Services</h3>
                <p style={{ color: '#7A2E2C' }}>
                  High-precision 3D printing for prototypes, figurines, and custom models. 
                  We use state-of-the-art equipment to ensure exceptional quality and detail in every print.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5EDE2' }}>
                  <svg className="w-6 h-6" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2A2623' }}>Daz3D Model Conversions</h3>
                <p style={{ color: '#7A2E2C' }}>
                  Expert conversion services for Daz3D models. We optimize models for performance while 
                  maintaining quality, ensuring they work seamlessly in your Daz3D projects.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5EDE2' }}>
                  <svg className="w-6 h-6" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#2A2623' }}>Custom 3D Modeling</h3>
                <p style={{ color: '#7A2E2C' }}>
                  Bespoke 3D modeling services tailored to your specific needs. From concept to final model, 
                  we bring your ideas to life with precision and creativity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="rounded-2xl shadow-lg p-8 md:p-12 mb-12" style={{ backgroundColor: '#FBF7F1' }}>
          <h2 className="text-3xl font-bold mb-8" style={{ color: '#2A2623' }}>Why Choose Us</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: '#2A2623' }}>Quality Guaranteed</h4>
                <p className="text-sm" style={{ color: '#7A2E2C' }}>Every project meets our high standards for detail and precision.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: '#2A2623' }}>Fast Turnaround</h4>
                <p className="text-sm" style={{ color: '#7A2E2C' }}>We deliver projects on time without compromising quality.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: '#2A2623' }}>Expert Support</h4>
                <p className="text-sm" style={{ color: '#7A2E2C' }}>Our team is here to help throughout your project.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#B64845' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h4 className="font-semibold mb-1" style={{ color: '#2A2623' }}>Competitive Pricing</h4>
                <p className="text-sm" style={{ color: '#7A2E2C' }}>Professional services at fair and transparent prices.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-2xl shadow-lg p-8 md:p-12 text-center text-white" style={{ background: 'linear-gradient(to bottom right, #B64845, #7A2E2C)' }}>
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8" style={{ color: '#FBF7F1' }}>
            Explore our products or get in touch to discuss your custom project.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg"
              style={{ backgroundColor: '#FBF7F1', color: '#7A2E2C' }}
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 text-white rounded-lg font-semibold transition-colors border-2"
              style={{ backgroundColor: '#7A2E2C', borderColor: '#FBF7F1' }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

