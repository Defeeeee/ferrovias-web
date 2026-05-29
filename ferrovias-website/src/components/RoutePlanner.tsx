'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpDown, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Info, 
  RefreshCw, 
  Navigation,
  ChevronDown,
  ChevronUp,
  Train,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { STATION_ORDER, API_URL } from '@/lib/config';

interface RouteStop {
  stationName: string;
  scheduledTime: string;
  isCurrent: boolean;
}

interface PlannedRoute {
  trainId: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  delayMinutes: number;
  status: string;
  liveLocation: string | null;
  duration: string;
  stops: RouteStop[];
}

interface PlannerData {
  origin: string;
  destination: string;
  dayType: string;
  currentTime: string;
  trains: PlannedRoute[];
}

interface RoutePlannerProps {
  className?: string;
}

export default function RoutePlanner({ className = '' }: RoutePlannerProps) {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [plannerData, setPlannerData] = useState<PlannerData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Load saved trip preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrigin = localStorage.getItem('ferrovias_planner_origin');
      const savedDest = localStorage.getItem('ferrovias_planner_dest');
      if (savedOrigin && STATION_ORDER.includes(savedOrigin)) setOrigin(savedOrigin);
      if (savedDest && STATION_ORDER.includes(savedDest)) setDestination(savedDest);
    }
  }, []);

  const getBaseUrl = () => {
    return API_URL.replace('/stations/all/status', '');
  };

  const fetchRoute = async (o: string, d: string, silent: boolean = false) => {
    if (!o || !d || o === d) {
      setPlannerData(null);
      return;
    }

    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/route?origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}`);
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server returned error ${response.status}`);
      }
      const data: PlannerData = await response.json();
      setPlannerData(data);
      
      // Save query selections
      localStorage.setItem('ferrovias_planner_origin', o);
      localStorage.setItem('ferrovias_planner_dest', d);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve route plan.');
      setPlannerData(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Trigger search automatically when origin or destination changes
  useEffect(() => {
    if (origin && destination && origin !== destination) {
      fetchRoute(origin, destination);
    } else {
      setPlannerData(null);
    }
  }, [origin, destination]);

  // Set up auto-refresh interval for live delay tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (origin && destination && origin !== destination && !isLoading) {
        fetchRoute(origin, destination, true);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [origin, destination, isLoading]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const toggleExpandStops = (trainId: string) => {
    if (expandedTrainId === trainId) {
      setExpandedTrainId(null);
    } else {
      setExpandedTrainId(trainId);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delay') || s.includes('late')) return 'text-rose-400 border-rose-500/20 bg-rose-500/10';
    if (s.includes('time') || s.includes('early')) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    if (s.includes('running')) return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
    return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Route Selector Controls */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600/10 border border-blue-500/20 p-2 rounded-xl text-blue-400">
            <Navigation className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-none">Trip Planner</h3>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block mt-1">Select your route</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4">
          {/* Origin */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Origin Station</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 h-4.5 w-4.5" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-[#090b14] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
              >
                <option value="">Select Origin Station...</option>
                {STATION_ORDER.map((station) => (
                  <option key={station} value={station} disabled={station === destination}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-5 md:pt-6">
            <button
              onClick={handleSwap}
              disabled={!origin && !destination}
              className="p-3 bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/[0.08] rounded-xl text-slate-400 hover:text-white cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
              title="Swap origin and destination"
            >
              <ArrowUpDown className="h-5 w-5 rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3 space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Destination Station</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 h-4.5 w-4.5" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-[#090b14] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
              >
                <option value="">Select Destination Station...</option>
                {STATION_ORDER.map((station) => (
                  <option key={station} value={station} disabled={station === origin}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {origin === destination && origin && (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-xs">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Origin and destination must be different stations.</span>
          </div>
        )}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center space-y-4">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-slate-400 text-sm font-semibold">Calculating routes and live schedules...</span>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="glass-panel rounded-3xl p-8 flex items-start gap-4 border-rose-500/20 bg-rose-500/5">
          <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-white font-bold text-sm">Route Calculation Failed</h4>
            <p className="text-slate-400 text-xs leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!origin || !destination ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <div className="bg-slate-500/5 border border-white/[0.04] p-4 rounded-full w-fit mx-auto text-slate-500">
            <Train className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-bold text-base">Select Your Stations</h4>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
              Choose an origin and destination station above. We will fetch the next scheduled trains along with live delays and position tracking.
            </p>
          </div>
        </div>
      ) : null}

      {/* Route List Results */}
      {plannerData && !isLoading && (
        <div className="space-y-4">
          
          {/* Metadata Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 text-xs text-slate-500 font-semibold gap-2">
            <div>
              Day Schedule: <span className="text-slate-300 font-bold uppercase">{plannerData.dayType}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {isRefreshing && <RefreshCw size={12} className="animate-spin text-blue-400" />}
              <span>Auto-refreshing live delays every 30s</span>
            </div>
          </div>

          {plannerData.trains.length === 0 ? (
            <div className="glass-panel rounded-3xl p-12 text-center space-y-4 bg-amber-500/5 border-amber-500/10">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-full w-fit mx-auto text-amber-500">
                <Clock className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white font-bold text-base">No Upcoming Trains Found</h4>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  There are no scheduled trains for the rest of today from {origin} to {destination}.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {plannerData.trains.map((train) => {
                const isExpanded = expandedTrainId === train.trainId;
                
                return (
                  <div 
                    key={train.trainId}
                    className={`glass-panel rounded-2xl overflow-hidden border-white/[0.05] hover:border-white/[0.09] transition-all duration-300 ${
                      isExpanded ? 'ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5' : ''
                    }`}
                  >
                    {/* Header Row */}
                    <div 
                      onClick={() => toggleExpandStops(train.trainId)}
                      className="p-5 flex flex-col lg:flex-row justify-between items-stretch gap-4 cursor-pointer hover:bg-white/[0.02] select-none transition-colors duration-200"
                    >
                      {/* Train ID & Duration */}
                      <div className="flex items-center justify-between lg:justify-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white">
                            <Train className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Train ID</span>
                            <span className="text-white font-extrabold text-base tracking-tight font-mono">#{train.trainId}</span>
                          </div>
                        </div>

                        <div className="h-8 w-px bg-white/10 hidden lg:block"></div>

                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
                          <span className="text-blue-400 font-bold text-sm tracking-tight">{train.duration}</span>
                        </div>
                      </div>

                      {/* Timeline: Departure -> Arrival */}
                      <div className="flex items-center justify-between gap-6 py-2 px-1 lg:px-0">
                        {/* Departure */}
                        <div className="text-left space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Depart {origin}</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-white font-black text-lg font-mono tracking-tight">{train.estimatedDeparture}</span>
                            {train.delayMinutes > 0 && (
                              <span className="text-slate-500 text-[11px] font-bold font-mono line-through">{train.scheduledDeparture}</span>
                            )}
                          </div>
                        </div>

                        {/* Visual Connector Line */}
                        <div className="flex-1 min-w-[40px] md:min-w-[80px] flex items-center relative">
                          <div className="h-[2px] w-full bg-white/10 rounded"></div>
                          {train.liveLocation && (
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                          )}
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                        </div>

                        {/* Arrival */}
                        <div className="text-right space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Arrive {destination}</span>
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="text-white font-black text-lg font-mono tracking-tight">{train.estimatedArrival}</span>
                            {train.delayMinutes > 0 && (
                              <span className="text-slate-500 text-[11px] font-bold font-mono line-through">{train.scheduledArrival}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status, Live position & Expander */}
                      <div className="flex items-center justify-between lg:justify-end gap-4 border-t border-white/[0.04] lg:border-t-0 pt-3 lg:pt-0">
                        {/* Live tracking details */}
                        <div className="text-left lg:text-right space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Status</span>
                          <div className="flex items-center gap-2">
                            {train.liveLocation && (
                              <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                <span>{train.liveLocation}</span>
                              </span>
                            )}
                            <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded border tracking-wider ${getStatusColor(train.status)}`}>
                              {train.status}
                            </span>
                          </div>
                        </div>

                        {/* Chevron Trigger */}
                        <div className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/3">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>
                    </div>

                    {/* Timeline stops details view */}
                    {isExpanded && (
                      <div className="bg-[#070911]/85 border-t border-white/[0.04] p-6 space-y-4">
                        <h5 className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">Journey Station Timeline</h5>
                        
                        <div className="relative pl-6 border-l border-white/[0.08] ml-2 space-y-5">
                          {train.stops.map((stop, sIdx) => (
                            <div 
                              key={sIdx}
                              className={`relative flex items-center justify-between text-xs leading-none ${
                                stop.isCurrent ? 'text-blue-400 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {/* Dot representation */}
                              <span className={`absolute -left-[30px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
                                stop.isCurrent 
                                  ? 'bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)] scale-110' 
                                  : 'bg-[#06070d] border-white/20'
                              }`}>
                                {stop.isCurrent && (
                                  <span className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></span>
                                )}
                              </span>

                              {/* Station Name */}
                              <div className="flex items-center gap-2">
                                <span className={stop.isCurrent ? 'text-white' : 'text-slate-300'}>{stop.stationName}</span>
                                {stop.isCurrent && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    Current Station
                                  </span>
                                )}
                              </div>

                              {/* Scheduled Time */}
                              <div className="font-mono font-medium">{stop.scheduledTime}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
