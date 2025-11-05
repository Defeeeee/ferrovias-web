'use client';

import React from 'react';
import { Train, Github, ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Train className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Ferrovías</h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Belgrano Norte Live Tracking
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-6">
            <a
              href="#map"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Live Map
            </a>
            <a
              href="#departures"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Departures
            </a>
            <a
              href="#analytics"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Analytics
            </a>
            <a
              href="#about"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              About
            </a>
            <a
              href="#api"
              className="text-slate-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              API
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/Defeeeee/ferrovias-web"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://ferrovias.fdiaznem.com.ar/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <span>API</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-slate-400 hover:text-white p-2">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}