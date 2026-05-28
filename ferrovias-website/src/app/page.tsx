'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TrainMap from '@/components/TrainMap';
import StationDepartures from '@/components/StationDepartures';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import Footer from '@/components/Footer';
import { API_URL } from '@/lib/config';
import { 
  MapPin, 
  Clock, 
  Users, 
  Zap, 
  BarChart3, 
  Activity, 
  Terminal, 
  BookOpen, 
  Menu, 
  X, 
  Train,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const [activeView, setActiveView] = useState<'tracker' | 'stations' | 'analytics' | 'developer' | 'guide'>('tracker');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collectorStatus, setCollectorStatus] = useState({
    isCollecting: false,
    recordsCount: 0,
    lastRunStatus: 'N/A'
  });

  const fetchCollectorStatus = async () => {
    try {
      const baseUrl = API_URL.replace('/stations/all/status', '');
      const response = await fetch(`${baseUrl}/analytics/status`);
      if (response.ok) {
        const data = await response.json();
        setCollectorStatus({
          isCollecting: data.isCollecting,
          recordsCount: data.recordsCount,
          lastRunStatus: data.lastRunStatus
        });
      }
    } catch (err) {
      console.warn('Failed to fetch backend collector status, using fallback.');
    }
  };

  useEffect(() => {
    fetchCollectorStatus();
    const interval = setInterval(fetchCollectorStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'tracker', label: 'Live Train Tracker', icon: Activity, desc: 'Visual rail map & estimated positions' },
    { id: 'stations', label: 'Station Boards', icon: Train, desc: 'Departures, platforms, facts' },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, desc: 'Punctuality indices & rankings' },
    { id: 'developer', label: 'Developer Portal', icon: Terminal, desc: 'API endpoints, docs, JSON payloads' },
    { id: 'guide', label: 'Operations Guide', icon: BookOpen, desc: 'How schedules & algorithms work' },
  ];

  return (
    <div className="min-h-screen bg-[#05060b] text-slate-200 flex flex-col md:flex-row relative bg-grid">
      
      {/* Background neon glows */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* MOBILE HEADER BAR */}
      <div className="md:hidden flex items-center justify-between bg-[#080a12]/90 border-b border-white/[0.06] p-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg">
            <Train className="h-5 w-5 text-white" />
          </div>
          <span className="font-extrabold text-white text-lg tracking-tight">Ferrovías</span>
        </div>
        
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#06070d]/98 border-r border-white/[0.06] flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out backdrop-blur-xl md:sticky md:top-0 md:h-screen md:transform-none md:z-10
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="space-y-8">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <Train className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-black text-xl text-white tracking-tight leading-none">Ferrovías</h1>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">Rail Control Room</span>
              </div>
            </div>
            
            {/* Close button inside mobile menu */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl text-left border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500 text-white shadow-lg shadow-blue-500/15 font-bold scale-[1.02]'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/[0.04]'
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                  <div>
                    <div className="text-sm font-semibold leading-tight">{item.label}</div>
                    <div className={`text-[10px] mt-0.5 leading-snug font-medium ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Backend Daemon status log */}
        <div className="bg-[#090b14]/80 border border-white/[0.05] rounded-2xl p-4 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Collector Daemon</span>
            <span className={`flex items-center gap-1 text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${
              collectorStatus.isCollecting 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <span className={`w-1 h-1 rounded-full ${collectorStatus.isCollecting ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              {collectorStatus.isCollecting ? 'Active' : 'Offline'}
            </span>
          </div>
          
          <div className="space-y-1.5 text-[11px] text-slate-500">
            <div className="flex justify-between">
              <span>Database Runs:</span>
              <span className="text-white font-mono font-bold">{collectorStatus.recordsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Latest Sync:</span>
              <span className={`font-bold ${collectorStatus.lastRunStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {collectorStatus.lastRunStatus}
              </span>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN VIEWPORT AREA */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Dynamic Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/[0.04] pb-5 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">
              {navItems.find(n => n.id === activeView)?.label}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Operations Control • Belgrano Norte Railway line
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-[#090b14] border border-white/[0.06] px-4 py-2 rounded-xl text-xs font-semibold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="text-slate-400">Server Sync: OK</span>
          </div>
        </div>

        {/* ACTIVE VIEW SWAPPER */}
        <div className="relative z-10 transition-all duration-350">
          {activeView === 'tracker' && <TrainMap />}
          
          {activeView === 'stations' && <StationDepartures />}
          
          {activeView === 'analytics' && <AnalyticsDashboard />}
          
          {activeView === 'developer' && (
            <div className="glass-panel rounded-3xl p-8 space-y-8">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Developer API Console</h3>
                <p className="text-slate-400 text-sm">
                  Interact with the cached backend scraping daemon and pull system status.
                </p>
              </div>

              {/* API Endpoints */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'System Wide Status Map',
                    method: 'GET',
                    url: '/stations/all/status',
                    desc: 'Returns a nested dictionary mapping station names to lists of train arrivals.'
                  },
                  {
                    title: 'Timetable Analytics Stats',
                    method: 'GET',
                    url: '/analytics/stats',
                    desc: 'Retrieves calculated punctuality indices, delay rates, and standings.'
                  },
                  {
                    title: 'Collector Engine Logs',
                    method: 'GET',
                    url: '/analytics/status',
                    desc: 'Returns current logs count, engine status, and sync reports.'
                  },
                  {
                    title: 'Toggle Collector Scraper',
                    method: 'POST',
                    url: '/analytics/toggle?active=true',
                    desc: 'Admin configuration to activate or suspend the background parser loop.'
                  }
                ].map((ep, idx) => (
                  <div key={idx} className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-bold text-sm">{ep.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                        ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {ep.method}
                      </span>
                    </div>
                    <code className="text-blue-400 text-xs font-mono block bg-white/5 border border-white/[0.04] px-3 py-2 rounded-xl">
                      {ep.url}
                    </code>
                    <p className="text-slate-400 text-xs leading-relaxed">{ep.desc}</p>
                  </div>
                ))}
              </div>

              {/* Sample Code Block */}
              <div className="bg-[#080a12] border border-white/[0.06] rounded-2xl p-6 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.04] pb-3 text-slate-500 uppercase font-sans font-bold">
                  <span>Interactive JSON Payload Preview</span>
                  <span>Request latency: ~1.3ms</span>
                </div>
                <pre className="text-emerald-400 overflow-x-auto pt-2">
{`{
  "totalDepartures": 1803,
  "systemPunctuality": 73,
  "averageSystemDelay": 4.0,
  "bestPerformingStation": "Grand Bourg",
  "dataRange": {
    "from": "2026-04-28",
    "to": "2026-05-28"
  },
  "collector": {
    "status": "ACTIVE",
    "loopInterval": "120s"
  }
}`}
                </pre>
              </div>
            </div>
          )}

          {activeView === 'guide' && (
            <div className="glass-panel rounded-3xl p-8 space-y-8 max-w-4xl">
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Operational Calculation Logic</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Our train positioning engine employs mathematical interpolation to estimate physical location between nodes using sparse arrival timelines.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-blue-400" />
                    <span>How it works: Position Calculation</span>
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    1. When the FastAPI scraper fetches timetables, it checks for active schedules.
                    <br />
                    2. By matching a train ID to a station departure time, it measures the remaining minutes.
                    <br />
                    3. If the remaining minutes are lower than the standard travel segment time, we assume the train is between stations.
                    <br />
                    4. Position percentage is computed as:
                    <code className="block bg-[#090b14] border border-white/[0.04] p-2.5 rounded-lg font-mono text-blue-400 my-2 text-center">
                      percent = ((segment_time - remaining_time) / segment_time) * 100
                    </code>
                    5. We interpolate this percentage between the coordinate offsets of the two stations on the map track.
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-brand-teal" />
                    <span>How it works: Punctuality Analytics</span>
                  </h4>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    1. The API daemon runs background polls every 2 minutes.
                    <br />
                    2. When a train status is logged as "En Estacion" (At Platform), it triggers a database insertion event.
                    <br />
                    3. It cross-references the current date and train ID to resolve if it is a weekday, Saturday, or Sunday.
                    <br />
                    4. It compares the actual clock time with the parsed values of `HORARIO_21.pdf`.
                    <br />
                    5. It logs the delay coordinates to `analytics.db`, enabling continuous dashboard stats updating 24/7 without needing user sessions.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Unified minimal dashboard footer */}
        <div className="text-center text-xs text-slate-500 pt-8 border-t border-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1 font-semibold uppercase tracking-wider">
            <span>Ferrovías Ops Console</span>
            <span className="text-slate-700 font-black">|</span>
            <span className="text-slate-600">v1.1.0</span>
          </div>
          
          <div>
            Data estimated under Horario N° 21 schedules.
          </div>
        </div>

      </main>
    </div>
  );
}
