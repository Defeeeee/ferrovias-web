'use client';

import React, { useState } from 'react';
import { Train, Github, ExternalLink, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#06070d]/85 backdrop-blur-md border-b border-white/[0.06] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-300">
              <Train className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                Ferrovías
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400/80 hidden sm:block">
                Belgrano Norte Live Tracking
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {[
              { label: 'Live Map', href: '#map' },
              { label: 'Departures', href: '#departures' },
              { label: 'Analytics', href: '#analytics' },
              { label: 'About', href: '#about' },
              { label: 'API', href: '#api' }
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative text-sm font-medium text-slate-300 hover:text-white transition-colors py-2 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="https://github.com/Defeeeee/ferrovias-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 p-2.5 rounded-xl transition-all duration-200"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://ferrovias.fdiaznem.com.ar/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all duration-200 text-sm font-semibold"
            >
              <span>API Docs</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-xl transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-350 ease-in-out bg-[#06070d]/98 border-b border-white/[0.06] ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-3">
          {[
            { label: 'Live Map', href: '#map' },
            { label: 'Departures', href: '#departures' },
            { label: 'Analytics', href: '#analytics' },
            { label: 'About', href: '#about' },
            { label: 'API', href: '#api' }
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl text-base font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between px-4">
            <a
              href="https://github.com/Defeeeee/ferrovias-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://ferrovias.fdiaznem.com.ar/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold"
            >
              <span>API Docs</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}