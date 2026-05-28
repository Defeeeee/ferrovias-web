'use client';

import React from 'react';
import { Heart, Github, ExternalLink, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030407] border-t border-white/[0.04] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* About Section */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-white">About Ferrovías</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              A modern, real-time tracking dashboard for the Belgrano Norte railway line. 
              Our service visualizes estimated train positions by running calculations on station arrival metrics, 
              giving commuters a clear overview of the line status.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-2">
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/[0.06] px-3 py-1 rounded-full">
                <Clock className="h-3 w-3 text-blue-400" />
                <span>Real-time calculations</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/[0.06] px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3 text-brand-teal" />
                <span>23 stations tracked</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#map" className="text-slate-400 hover:text-white hover:underline decoration-blue-500 transition-colors">
                  Live Map
                </a>
              </li>
              <li>
                <a href="#about" className="text-slate-400 hover:text-white hover:underline decoration-blue-500 transition-colors">
                  How it Works
                </a>
              </li>
              <li>
                <a 
                  href="https://ferrovias.fdiaznem.com.ar/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 hover:underline decoration-blue-500"
                >
                  API Documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/Defeeeee/ferrovias-web"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 hover:underline decoration-blue-500"
                >
                  Source Code
                  <Github className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Technical Details</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>FastAPI Backend Cache</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Next.js 16 Framework</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>Tailwind CSS v4 styling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                <span>SQLite Timetable Analytics</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <span>© {currentYear} Ferrovías. Made with</span>
            <Heart className="h-3.5 w-3.5 text-red-500 animate-pulse fill-red-500" />
            <span>for better urban transit.</span>
          </div>
          
          <div className="text-xs">
            <p>
              Data provided by{' '}
              <a 
                href="https://ferrovias.fdiaznem.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                ferrovias.fdiaznem.com.ar
              </a>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-center text-[11px] text-slate-600 max-w-4xl mx-auto border-t border-white/[0.02] pt-4">
          <p>
            Disclaimer: This is an unofficial tracking system. Train positions displayed are estimations calculated mathematically from station arrival reports and known segment times, and are not actual GPS locations. Please verify schedules and operations with Ferrovías SAC (Belgrano Norte operator) for travel decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}