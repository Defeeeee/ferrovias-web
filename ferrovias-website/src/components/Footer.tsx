'use client';

import React from 'react';
import { Heart, Github, ExternalLink, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">About Ferrovías</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              A modern, real-time tracking system for the Belgrano Norte railway line. 
              This application provides live train positions based on station arrival data, 
              helping passengers plan their journeys more effectively.
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Real-time updates</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>23 stations tracked</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#map" className="text-slate-400 hover:text-white transition-colors duration-200">
                  Live Map
                </a>
              </li>
              <li>
                <a href="#about" className="text-slate-400 hover:text-white transition-colors duration-200">
                  How it Works
                </a>
              </li>
              <li>
                <a 
                  href="https://ferrovias.fdiaznem.com.ar/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
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
                  className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1"
                >
                  Source Code
                  <Github className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Technical</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Built with Next.js</li>
              <li>TypeScript & Tailwind CSS</li>
              <li>Real-time API integration</li>
              <li>Responsive design</li>
              <li>Progressive Web App ready</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-slate-500 text-sm">
            © {currentYear} Ferrovías. Built with{' '}
            <Heart className="inline h-4 w-4 text-red-500 mx-1" />
            for better public transportation.
          </div>
          
          <div className="text-slate-500 text-xs">
            <p>
              Data provided by{' '}
              <a 
                href="https://ferrovias.fdiaznem.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                ferrovias.fdiaznem.com.ar
              </a>
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 text-center text-xs text-slate-600">
          <p>
            This is an unofficial application. Train positions are estimated based on arrival data and may not reflect exact locations. 
            Always verify schedules with official sources.
          </p>
        </div>
      </div>
    </footer>
  );
}