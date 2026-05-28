'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  Clock, 
  MapPin,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  RefreshCw
} from 'lucide-react';
import { API_URL } from '@/lib/config';
import { StationPunctualityStats, SystemWideStats } from '@/lib/types';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [systemStats, setSystemStats] = useState<SystemWideStats | null>(null);
  const [stationStats, setStationStats] = useState<StationPunctualityStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  
  // Scraper status states
  const [collectionStatus, setCollectionStatus] = useState({ 
    isCollecting: false, 
    recordsCount: 0, 
    lastRunStatus: 'N/A',
    lastRunTime: 'N/A'
  });

  const getBaseUrl = () => {
    return API_URL.replace('/stations/all/status', '');
  };

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getBaseUrl();
      
      // Fetch stats from backend FastAPI endpoint
      const response = await fetch(`${baseUrl}/analytics/stats?days=${selectedPeriod}`);
      if (!response.ok) {
        throw new Error(`Failed to load stats: ${response.status}`);
      }
      
      const data = await response.json();
      setSystemStats({
        totalDepartures: data.totalDepartures,
        systemPunctuality: data.systemPunctuality,
        averageSystemDelay: data.averageSystemDelay,
        bestPerformingStation: data.bestPerformingStation,
        worstPerformingStation: data.worstPerformingStation,
        peakHours: data.peakHours,
        dataRange: data.dataRange
      });
      
      setStationStats(data.standings || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setImportStatus(`Loading error: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCollectionStatus = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/analytics/status`);
      if (response.ok) {
        const data = await response.json();
        setCollectionStatus({
          isCollecting: data.isCollecting,
          recordsCount: data.recordsCount,
          lastRunStatus: data.lastRunStatus,
          lastRunTime: data.lastRunTime
        });
      }
    } catch (error) {
      console.warn('Failed to update collector status:', error);
    }
  };

  useEffect(() => {
    loadAnalytics();
    updateCollectionStatus();
  }, [selectedPeriod]);

  const handleStartCollection = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/analytics/toggle?active=true`, { method: 'POST' });
      if (response.ok) {
        await updateCollectionStatus();
        setImportStatus('Scraper successfully enabled');
        setTimeout(() => setImportStatus(''), 3000);
      }
    } catch (error) {
      setImportStatus('Failed to enable scraper');
    }
  };

  const handleStopCollection = async () => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/analytics/toggle?active=false`, { method: 'POST' });
      if (response.ok) {
        await updateCollectionStatus();
        setImportStatus('Scraper successfully paused');
        setTimeout(() => setImportStatus(''), 3000);
      }
    } catch (error) {
      setImportStatus('Failed to pause scraper');
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-400';
    if (percentage >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getPerformanceBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-emerald-500/10 border-emerald-500/20';
    if (percentage >= 75) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    if (percentage >= 75) return <Target className="h-4 w-4 text-amber-400" />;
    return <AlertTriangle className="h-4 w-4 text-rose-400" />;
  };

  if (isLoading && !systemStats) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center max-w-4xl mx-auto">
        <RefreshCw className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" />
        <p className="text-slate-400 font-semibold text-sm">Syncing server-side logs...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-8 ${className}`}>
      
      {/* Collector Settings Header panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Reliability Center</h2>
            </div>
            <p className="text-slate-400 text-sm">
              Statistics loaded from local persistent SQLite database updating 24/7 in the background
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-[#090b14] text-slate-200 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <button
              onClick={() => { loadAnalytics(); updateCollectionStatus(); }}
              disabled={isLoading}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 border border-white/[0.08] hover:border-white/[0.15] font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 text-xs cursor-pointer"
            >
              <Activity className={`h-4 w-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            
            {collectionStatus.isCollecting ? (
              <button
                onClick={handleStopCollection}
                className="flex items-center gap-2 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600/15 text-rose-400 font-semibold px-4 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span>Pause Scraper</span>
              </button>
            ) : (
              <button
                onClick={handleStartCollection}
                className="flex items-center gap-2 bg-emerald-600/10 border border-emerald-500/20 hover:bg-emerald-600/15 text-emerald-400 font-semibold px-4 py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-emerald-400" />
                <span>Resume Scraper</span>
              </button>
            )}
          </div>
        </div>

        {/* Database log metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/[0.04] relative z-10">
          
          <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-sm">Background Polling Status</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                collectionStatus.isCollecting ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {collectionStatus.isCollecting ? 'Active Loop' : 'Paused'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-1 text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans mb-0.5">SQLite Rows logged</span>
                <span className="text-white font-bold text-sm">{collectionStatus.recordsCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider font-sans mb-0.5">Scraper Status</span>
                <span className={`font-bold text-sm ${collectionStatus.lastRunStatus === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {collectionStatus.lastRunStatus}
                </span>
              </div>
            </div>
            {importStatus && (
              <div className="bg-blue-500/5 border border-blue-500/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-blue-400 font-mono">
                {importStatus}
              </div>
            )}
          </div>

          <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5 space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-white font-bold text-sm block">System Daemon Configuration</span>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Daemon pulls station boards every 120s. SQLite registers arrivals when a train reports "En Estacion" (Docked).
              </p>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold font-mono">
              Last Poll Timestamp: {collectionStatus.lastRunTime}
            </div>
          </div>
        </div>
      </div>

      {/* Standings Grid Cards */}
      {systemStats && systemStats.totalDepartures > 0 ? (
        <>
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <span>Line Standings overview</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Calendar,
                  label: 'Departures Analyzed',
                  value: systemStats.totalDepartures.toLocaleString(),
                  color: 'text-white',
                  iconColor: 'text-blue-400',
                  iconBg: 'bg-blue-500/10 border-blue-500/20'
                },
                {
                  icon: Target,
                  label: 'Punctuality Ratio',
                  value: `${systemStats.systemPunctuality}%`,
                  color: getPerformanceColor(systemStats.systemPunctuality),
                  iconColor: getPerformanceColor(systemStats.systemPunctuality),
                  iconBg: getPerformanceBg(systemStats.systemPunctuality)
                },
                {
                  icon: Clock,
                  label: 'Average Delay',
                  value: `${systemStats.averageSystemDelay} min`,
                  color: 'text-white',
                  iconColor: 'text-amber-400',
                  iconBg: 'bg-amber-500/10 border-amber-500/20'
                },
                {
                  icon: Zap,
                  label: 'Peak traffic hours',
                  value: systemStats.peakHours.length.toString(),
                  color: 'text-white',
                  iconColor: 'text-purple-400',
                  iconBg: 'bg-purple-500/10 border-purple-500/20'
                }
              ].map((card, idx) => (
                <div key={idx} className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between min-h-[140px] hover:border-white/[0.1] transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.label}</span>
                    <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                      <card.icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <div className={`text-3xl font-black ${card.color} font-mono mt-4`}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#080d12] border border-emerald-500/10 hover:border-emerald-500/25 rounded-2xl p-5 flex items-center justify-between transition-all">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Top Performing Station</span>
                  <h4 className="text-xl font-black text-emerald-400 tracking-tight">{systemStats.bestPerformingStation}</h4>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <TrendingUp size={22} />
                </div>
              </div>

              <div className="bg-[#0f0a0c] border border-rose-500/10 hover:border-rose-500/25 rounded-2xl p-5 flex items-center justify-between transition-all">
                <div className="space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Needs Improvement</span>
                  <h4 className="text-xl font-black text-rose-400 tracking-tight">{systemStats.worstPerformingStation}</h4>
                </div>
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <TrendingDown size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Standing details table */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-brand-teal" />
              <h3 className="text-lg font-bold text-white tracking-tight">Line Performance Standings</h3>
            </div>
            
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                    <th className="py-4 px-4">Station stop</th>
                    <th className="py-4 px-4">Runs</th>
                    <th className="py-4 px-4">Punctuality Rate</th>
                    <th className="py-4 px-4 text-center">Avg Delay</th>
                    <th className="py-4 px-4 text-center">Worst Delay</th>
                    <th className="py-4 px-4">Best Interval</th>
                    <th className="py-4 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02] text-xs font-mono">
                  {stationStats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No records compiled in this interval.
                      </td>
                    </tr>
                  ) : (
                    stationStats.map((station) => (
                      <tr key={station.stationName} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-sans font-bold text-white text-sm">{station.stationName}</td>
                        <td className="py-4 px-4 text-slate-400">{station.totalDepartures.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getPerformanceColor(station.punctualityPercentage)}`}>
                              {station.punctualityPercentage}%
                            </span>
                            <span className="text-[10px] text-slate-600 font-sans">({station.onTimeDepartures} runs on time)</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-slate-400">{station.averageDelayMinutes}m</td>
                        <td className="py-4 px-4 text-center text-slate-400">{station.worstDelayMinutes}m</td>
                        <td className="py-4 px-4 text-slate-400 font-semibold">{station.bestPerformanceHour}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center justify-center p-1.5 rounded-lg bg-white/5 border border-white/[0.06]">
                            {getPerformanceIcon(station.punctualityPercentage)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Spread */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">Punctuality Spread Mapping</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Optimal Performance (≥90%)',
                  count: stationStats.filter(s => s.punctualityPercentage >= 90).length,
                  bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                  barBg: 'bg-emerald-500'
                },
                {
                  title: 'Standard Performance (75-89%)',
                  count: stationStats.filter(s => s.punctualityPercentage >= 75 && s.punctualityPercentage < 90).length,
                  bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                  barBg: 'bg-amber-500'
                },
                {
                  title: 'Critical Attention Required (<75%)',
                  count: stationStats.filter(s => s.punctualityPercentage < 75).length,
                  bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
                  barBg: 'bg-rose-500'
                }
              ].map((card, idx) => (
                <div key={idx} className={`border rounded-2xl p-5 flex flex-col justify-between min-h-[110px] ${card.bg}`}>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{card.title}</div>
                  <div className="flex items-end justify-between mt-4">
                    <span className="text-3xl font-black font-mono leading-none">{card.count}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Stations</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphical top-10 Standings */}
            {stationStats.length > 0 && (
              <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5 sm:p-6">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-6">Top 10 Most Reliable Stations</h4>
                
                <div className="space-y-4">
                  {stationStats
                    .slice(0, 10)
                    .map((station) => (
                      <div key={station.stationName} className="flex items-center gap-4 text-xs font-mono">
                        <div className="w-28 text-slate-300 font-sans font-bold truncate">
                          {station.stationName}
                        </div>
                        <div className="flex-1 bg-white/5 border border-white/[0.02] rounded-full h-4 relative overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              station.punctualityPercentage >= 90 
                                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                                : station.punctualityPercentage >= 75
                                ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                                : 'bg-gradient-to-r from-rose-600 to-rose-400'
                            }`}
                            style={{ width: `${station.punctualityPercentage}%` }}
                          />
                        </div>
                        <div className={`w-14 text-right font-black ${getPerformanceColor(station.punctualityPercentage)}`}>
                          {station.punctualityPercentage}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : systemStats && (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-4xl mx-auto border border-white/[0.04] space-y-6">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-blue-500/10 border border-blue-500/20 rounded-full animate-pulse">
            <Activity className="h-10 w-10 text-blue-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white tracking-tight">Collector Listening for Live Train Runs</h3>
            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
              The persistent background scraper is active and listening for live train arrivals reporting <code className="bg-[#090b14] px-1.5 py-0.5 rounded text-blue-400 border border-white/[0.04]">En Estacion</code> (Docked).
            </p>
          </div>
          
          <div className="max-w-md mx-auto bg-[#090b14] border border-white/[0.04] rounded-2xl p-6 text-left space-y-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 border-b border-white/[0.04] pb-2">Status Checklist</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-white font-semibold block">Schedules Pre-Loaded</span>
                  <span className="text-slate-500 font-sans">Timetable schedules mapped from HORARIO_21.pdf CSV data.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-white font-semibold block">Scraper Daemon Active</span>
                  <span className="text-slate-500 font-sans">FastAPI background thread is checking stations every 2 minutes.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="h-4 w-4 flex items-center justify-center shrink-0">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>
                </div>
                <div>
                  <span className="text-white font-semibold block">Awaiting First Logged Departure</span>
                  <span className="text-slate-500 font-sans">Once trains start running and arrivals are registered, statistics will build automatically.</span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-[11px] text-slate-500">
            No mock performance logs or invented statistics will be shown here. Only real-time scraper findings.
          </p>
        </div>
      )}

      {/* Dataset Range Footer */}
      {systemStats && (
        <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Dataset Analysis Window</span>
            <span className="text-slate-300 font-semibold">{systemStats.dataRange.from} to {systemStats.dataRange.to}</span>
          </div>
          <div className="space-y-1 sm:text-right">
            <span className="text-slate-500 uppercase font-bold text-[10px] tracking-wider block">Database Source</span>
            <span className="text-slate-300 font-semibold">SQLite persistent analytics DB on Python server</span>
          </div>
        </div>
      )}
    </div>
  );
}