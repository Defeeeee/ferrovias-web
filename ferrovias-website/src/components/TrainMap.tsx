'use client';

import React, { useEffect, useState } from 'react';
import { Train, RefreshCw, AlertTriangle, Info, MapPin, Navigation, Compass } from 'lucide-react';
import { STATION_ORDER } from '@/lib/config';
import { TrainWithLocation, DataSourceInfo } from '@/lib/types';
import { getProcessedTrainData, getTrainPositionPercent } from '@/lib/mapLogic';

interface TrainMapProps {
  className?: string;
}

export default function TrainMap({ className = '' }: TrainMapProps) {
  const [trains, setTrains] = useState<TrainWithLocation[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceInfo | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive train highlight state
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);

  const fetchTrainData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { trains: newTrains, dataSource: newDataSource } = await getProcessedTrainData();
      setTrains(newTrains);
      setDataSource(newDataSource);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainData();
    const interval = setInterval(fetchTrainData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTrainColors = (train: TrainWithLocation): { text: string; bg: string; border: string; glow: string; badge: string } => {
    const destination = train.destination.toUpperCase();
    const isToRetiro = destination.includes("RETIRO");

    if (destination.includes("BOULOGNE SUR MER")) {
      return { 
        text: 'text-emerald-400', 
        bg: 'bg-emerald-500/10', 
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      };
    } else if (destination.includes("GRAND BOURG")) {
      return { 
        text: 'text-orange-400', 
        bg: 'bg-orange-500/10', 
        border: 'border-orange-500/30',
        glow: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]',
        badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
      };
    } else if (isToRetiro) {
      return { 
        text: 'text-blue-400', 
        bg: 'bg-blue-500/10', 
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.35)]',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      };
    } else {
      return { 
        text: 'text-rose-400', 
        bg: 'bg-rose-500/10', 
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
        badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      };
    }
  };

  const getTrainDirection = (train: TrainWithLocation): string => {
    const isToRetiro = train.destination.toUpperCase().includes("RETIRO");
    return isToRetiro ? "scale-x-[-1]" : "";
  };

  const isTrainAtStation = (stationName: string): boolean => {
    return trains.some(
      (train) => train.location.type === 'station' && train.location.at === stationName
    );
  };

  return (
    <div className={`glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden ${className}`}>
      
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Controller Top Info Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
            <h2 className="text-2xl font-bold text-white tracking-tight">Active Rail Controller</h2>
          </div>
          <p className="text-slate-400 text-sm">
            Live estimation of running train coordinates and segments delay mapping
          </p>
        </div>
        
        <button
          onClick={fetchTrainData}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 disabled:bg-white/5 text-slate-200 border border-white/[0.08] hover:border-white/[0.15] font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-xs cursor-pointer shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Syncing...' : 'Sync Dispatch'}</span>
        </button>
      </div>

      {/* Alert fallback status banner */}
      {dataSource && !dataSource.isLive && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 mb-6 flex items-start gap-3 relative z-10 text-xs">
          <Info className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-amber-400 font-bold">API offline: </span>
            <span className="text-slate-300">Using mock schedules database. Background worker will restore sync automatically.</span>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER SPLIT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative z-10">
        
        {/* Track Line Map Controller (span 3) */}
        <div className="xl:col-span-3 bg-[#08090f] border border-white/[0.04] rounded-2xl p-4 sm:p-10 min-h-[220px] sm:min-h-[300px] overflow-x-auto flex flex-col justify-center">
          
          <div className="relative w-full min-w-[900px] mx-auto py-16">
            
            {/* Double Track Rail line structure */}
            <div className="relative h-3 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-brand-teal rounded-full shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              
              {/* Render Stations */}
              {STATION_ORDER.map((stationName, index) => {
                const percent = (index / (STATION_ORDER.length - 1)) * 100;
                const isEven = index % 2 === 0;
                const isFirst = index === 0;
                const isLast = index === STATION_ORDER.length - 1;
                const trainStopped = isTrainAtStation(stationName);

                return (
                  <div 
                    key={stationName} 
                    className="absolute top-1/2 transform -translate-y-1/2" 
                    style={{ left: `${percent}%` }}
                  >
                    
                    {trainStopped && (
                      <>
                        <div className="ripple-ring text-blue-500 w-10 h-10"></div>
                        <div className="ripple-ring ripple-ring-delay-1 text-blue-500 w-10 h-10"></div>
                      </>
                    )}

                    {/* Station dot indicator */}
                    <div className={`w-3.5 h-3.5 rounded-full border-2.5 transition-all duration-300 relative z-10 transform -translate-x-1/2 ${
                      trainStopped 
                        ? 'bg-blue-400 border-white scale-110 shadow-[0_0_10px_rgba(59,130,246,0.6)]' 
                        : 'bg-[#06070d] border-slate-500 hover:border-white hover:scale-105'
                    }`}></div>
                    
                    {/* Station Name Label */}
                    <div 
                      className={`absolute text-[10px] font-bold tracking-tight text-slate-500 whitespace-nowrap transform -translate-x-1/2 transition-colors duration-200 ${
                        trainStopped ? 'text-white font-black' : ''
                      } ${
                        isFirst ? 'left-0 transform-none' : 
                        isLast ? 'right-0 left-auto transform-none' :
                        isEven ? 'top-8' : 'bottom-8'
                      }`}
                    >
                      {stationName}
                    </div>
                  </div>
                );
              })}

              {/* Render Trains */}
              {trains.map((train) => {
                const posPercent = getTrainPositionPercent(train.location);
                if (posPercent === -999) return null;

                const colors = getTrainColors(train);
                const directionClass = getTrainDirection(train);
                const isSelected = selectedTrainId === train.id;

                return (
                  <div
                    key={train.id}
                    className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20 group cursor-pointer transition-all duration-1000 ease-in-out ${
                      isSelected ? 'z-30' : ''
                    }`}
                    style={{ left: `${posPercent}%` }}
                    onClick={() => setSelectedTrainId(isSelected ? null : train.id)}
                  >
                    
                    {/* Active highlight bounce ripple */}
                    {isSelected && (
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-blue-400 animate-bounce">
                        <Compass className="h-5 w-5 text-blue-400" />
                      </div>
                    )}

                    {/* Pulse outer glows */}
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-current opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${colors.text} ${isSelected ? 'opacity-100 animate-ping' : ''}`}>
                      <div className="ripple-ring w-full h-full text-current"></div>
                    </div>

                    {/* Glowing Train Badge Circle */}
                    <div className={`w-9.5 h-9.5 rounded-full bg-slate-950 border-2 flex items-center justify-center transition-all duration-300 relative z-10 ${
                      isSelected 
                        ? 'border-white scale-125 shadow-[0_0_20px_rgba(255,255,255,0.7)]' 
                        : `${colors.border} ${colors.glow} hover:scale-110 hover:border-white`
                    }`}>
                      <div className={`${colors.text} ${directionClass} transition-transform`}>
                        <Train size={18} />
                      </div>
                    </div>
                    
                    {/* Train Tag ID */}
                    <div className={`absolute top-10 left-1/2 transform -translate-x-1/2 bg-slate-950 border rounded px-1.5 py-0.5 text-[8px] font-bold font-mono transition-colors ${
                      isSelected ? 'border-white text-white font-black shadow-md' : 'border-white/5 text-slate-400'
                    }`}>
                      #{train.id}
                    </div>

                    {/* Advanced Tooltip Panel */}
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3.5 px-4 py-3 bg-[#0d101a]/95 backdrop-blur-md border text-white text-xs rounded-xl shadow-2xl transition-all duration-200 whitespace-nowrap pointer-events-none z-30 ${
                      isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="font-bold text-[13px]">Train {train.id}</span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 bg-white/5 rounded border border-white/5">
                          to {train.destination}
                        </span>
                      </div>
                      
                      <div className="text-slate-300 text-[11px] font-medium flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-400" />
                        <span>{train.location.description}</span>
                      </div>
                      
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#0d101a]/95"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Active Dispatch Feed (span 1) */}
        <div className="xl:col-span-1 bg-[#07080e]/60 border border-white/[0.04] rounded-2xl p-5 flex flex-col h-[350px] sm:h-[400px] xl:h-auto overflow-hidden">
          <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-b border-white/[0.04] pb-3 flex items-center justify-between">
            <span>Dispatch Feed</span>
            <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black font-mono px-2 py-0.5 rounded-full border border-blue-500/20">
              {trains.length} running
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 font-sans">
            {trains.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <Navigation className="h-6 w-6 text-slate-700 mx-auto mb-2" />
                <span>No active runs cataloged</span>
              </div>
            ) : (
              trains.map((train) => {
                const colors = getTrainColors(train);
                const isSelected = selectedTrainId === train.id;

                return (
                  <button
                    key={train.id}
                    onClick={() => setSelectedTrainId(isSelected ? null : train.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/40 shadow-sm shadow-blue-500/5'
                        : 'bg-white/[0.01] border-white/[0.04] hover:bg-white/5 hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white font-mono">#{train.id}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${colors.badge}`}>
                        {train.destination}
                      </span>
                    </div>
                    
                    <div className="text-slate-400 text-xs mt-2 flex items-start gap-1.5 leading-snug">
                      <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span className="truncate">{train.location.description}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Legend and timestamp bar */}
      <div className="mt-6 pt-5 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        
        {/* Colors Legend */}
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', text: 'To Retiro' },
            { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', text: 'To Villa Rosa' },
            { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', text: 'To Boulogne Sur Mer' },
            { color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', text: 'To Grand Bourg' }
          ].map((legend, idx) => (
            <div key={idx} className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${legend.color}`}>
              <Train size={12} />
              <span className="font-semibold">{legend.text}</span>
            </div>
          ))}
        </div>

        {/* Sync Info */}
        <div className="text-slate-500 font-medium text-center md:text-right">
          {lastUpdated && <span>Sync timestamp: {lastUpdated}</span>}
        </div>
      </div>
    </div>
  );
}