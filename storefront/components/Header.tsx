"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="shadow-md sticky top-0 z-50" style={{ backgroundColor: '#FBF7F1' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src="https://cdn.renderhub.com/inn/avatar.png"
                alt="inn 3D Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold" style={{ color: '#2A2623' }}>inn 3D</span>
              <span className="text-xs hidden sm:block" style={{ color: '#7A2E2C' }}>
                Druck und Modellierung
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/products"
              className="transition-colors font-medium"
              style={{ color: '#7A2E2C' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#B64845'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#7A2E2C'}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="transition-colors font-medium"
              style={{ color: '#7A2E2C' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#B64845'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#7A2E2C'}
            >
              About
            </Link>
            <Link
              href="/cart"
              className="px-6 py-2 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: '#B64845' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A2E2C'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B64845'}
            >
              Cart
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: '#2A2623' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5EDE2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4" style={{ borderTop: '1px solid #C7BFB6' }}>
            <nav className="flex flex-col gap-3">
              <Link
                href="/products"
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#7A2E2C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5EDE2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 rounded-lg transition-colors"
                style={{ color: '#7A2E2C' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5EDE2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/cart"
                className="px-4 py-2 text-white rounded-lg transition-colors text-center"
                style={{ backgroundColor: '#B64845' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7A2E2C'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B64845'}
                onClick={() => setMenuOpen(false)}
              >
                Cart
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

