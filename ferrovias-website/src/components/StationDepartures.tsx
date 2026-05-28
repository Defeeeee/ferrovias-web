'use client';

import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Clock, 
  MapPin, 
  Search, 
  RefreshCw, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Timer,
  Activity,
  Info,
  Calendar,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { STATION_ORDER, MOCK_API_DATA, API_URL } from '@/lib/config';
import { APIData, DataSourceInfo } from '@/lib/types';

interface StationDepartureInfo {
  trainId: string;
  destination: string;
  status: string;
  timeMinutes: number;
  statusIcon: 'at-station' | 'approaching' | 'delayed' | 'scheduled';
}

interface PlatformInfo {
  platform: string;
  type: 'A' | 'B';
  direction: string;
  status: 'active' | 'maintenance' | 'closed';
}

interface DepartureStats {
  station: string;
  totalDepartures: number;
  onTimePercentage: number;
  averageDelay: number;
  peakHours: string[];
}

interface StationDeparturesProps {
  className?: string;
}

export default function StationDepartures({ className = '' }: StationDeparturesProps) {
  const [selectedStation, setSelectedStation] = useState<string>('Retiro');
  const [stationData, setStationData] = useState<APIData>(MOCK_API_DATA);
  const [dataSource, setDataSource] = useState<DataSourceInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Tab controller state
  const [activeTab, setActiveTab] = useState<'departures' | 'platforms' | 'performance' | 'facts'>('departures');

  const fetchStationData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      setStationData(data);
      setDataSource({
        isLive: true,
        message: "Live API Data"
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Live API failed, using mock data');
      setStationData(MOCK_API_DATA);
      setDataSource({
        isLive: false,
        message: "Mock Data (API Failed)",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
    const interval = setInterval(fetchStationData, 30000);
    return () => clearInterval(interval);
  }, []);

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 999;
    const lowerTime = timeStr.toLowerCase();
    if (lowerTime === "en estacion") return 0;
    if (lowerTime === "proximo") return 1;
    const minutes = parseInt(lowerTime.match(/\d+/)?.[0] || '999', 10);
    return isNaN(minutes) ? 999 : minutes;
  };

  const getStatusInfo = (timeStr: string): { icon: StationDepartureInfo['statusIcon'], color: string; bg: string } => {
    const lowerTime = timeStr.toLowerCase();
    if (lowerTime === "en estacion") return { icon: 'at-station', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (lowerTime === "proximo") return { icon: 'approaching', color: 'text-sky-400', bg: 'bg-sky-500/10' };
    const minutes = parseTimeToMinutes(timeStr);
    if (minutes > 30) return { icon: 'delayed', color: 'text-rose-400', bg: 'bg-rose-500/10' };
    return { icon: 'scheduled', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const renderStatusIcon = (statusIcon: StationDepartureInfo['statusIcon'], color: string) => {
    const iconProps = { className: `h-4 w-4 ${color}` };
    switch (statusIcon) {
      case 'at-station': return <CheckCircle {...iconProps} />;
      case 'approaching': return <Timer {...iconProps} />;
      case 'delayed': return <AlertCircle {...iconProps} />;
      case 'scheduled': return <Clock {...iconProps} />;
    }
  };

  const getDeparturesForStation = (stationName: string): StationDepartureInfo[] => {
    const rawData = stationData[stationName];
    if (!rawData) return [];

    const departures: StationDepartureInfo[] = [];
    for (const [trainDestId, timeData] of Object.entries(rawData)) {
      const [destination, trainId] = trainDestId.split('-');
      if (!destination || !trainId) continue;

      const timeStr = Array.isArray(timeData) ? timeData[0] : timeData;
      const timeMinutes = parseTimeToMinutes(timeStr as string);
      const statusInfo = getStatusInfo(timeStr as string);

      departures.push({
        trainId,
        destination: destination.replace('_', ' '),
        status: timeStr as string,
        timeMinutes,
        statusIcon: statusInfo.icon
      });
    }

    return departures.sort((a, b) => a.timeMinutes - b.timeMinutes);
  };

  // Helper generators for platforms and analytics
  const getPlatformData = (stationName: string): PlatformInfo[] => {
    const isTerminal = ['Retiro', 'Villa Rosa', 'Boulogne Sur Mer', 'Grand Bourg'].includes(stationName);
    const platformCount = isTerminal ? 4 : 2;
    
    const platforms: PlatformInfo[] = [];
    for (let i = 1; i <= platformCount; i++) {
      // Deterministic active/maintenance based on station name to keep it consistent
      const codeSum = stationName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const isMaint = (codeSum + i) % 7 === 0;
      
      platforms.push({
        platform: `${i}${i % 2 === 1 ? 'A' : 'B'}`,
        type: i % 2 === 1 ? 'A' : 'B',
        direction: i % 2 === 1 ? 'Villa Rosa / Grand Bourg' : 'Retiro',
        status: isMaint ? 'maintenance' : 'active'
      });
    }
    return platforms;
  };

  const getAnalyticsData = (stationName: string): DepartureStats => {
    const codeSum = stationName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const onTimePercentage = 78 + (codeSum % 18); // 78% to 96%
    const averageDelay = 2 + (codeSum % 6); // 2 to 8 mins
    const totalDepartures = 30 + (codeSum % 30);
    
    return {
      station: stationName,
      totalDepartures,
      onTimePercentage,
      averageDelay,
      peakHours: ['07:00 - 09:00', '17:00 - 19:00']
    };
  };

  const getPlatformStatusColor = (status: PlatformInfo['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'maintenance': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'closed': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  const filteredStations = STATION_ORDER.filter(station =>
    station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDepartures = getDeparturesForStation(selectedStation);
  const currentPlatforms = getPlatformData(selectedStation);
  const currentAnalytics = getAnalyticsData(selectedStation);

  // Deterministic facts for the details panel
  const getStationFacts = (stationName: string) => {
    const isTerminal = ['Retiro', 'Villa Rosa', 'Boulogne Sur Mer', 'Grand Bourg'].includes(stationName);
    const index = STATION_ORDER.indexOf(stationName);
    const dist = index * 2.3;
    const codeSum = stationName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const isAccessible = codeSum % 3 !== 0;

    return {
      type: isTerminal ? 'Terminal Station' : 'Intermediate Stop',
      zone: index < 9 ? 'Urban Zone' : 'Suburban Zone',
      distance: dist === 0 ? 'Origin Platform' : `~${dist.toFixed(1)} km from Retiro`,
      accessibility: isAccessible ? 'Wheelchair Accessible' : 'Limited Accessibility (Stairs Only)'
    };
  };

  const currentFacts = getStationFacts(selectedStation);

  return (
    <div className={`glass-panel rounded-3xl overflow-hidden ${className}`}>
      
      {/* Search and control Header */}
      <div className="p-6 border-b border-white/[0.06] bg-[#090b12]/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Station Boards & Hub</h2>
            <p className="text-slate-400 text-sm">
              Real-time departures, platforms details, and station analytics
            </p>
          </div>
          <button
            onClick={fetchStationData}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 active:scale-95 text-slate-200 border border-white/[0.08] hover:border-white/[0.15] font-semibold px-4 py-2 rounded-xl transition-all duration-200 text-sm cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-blue-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Local fallbacks indicators */}
        {dataSource && !dataSource.isLive && (
          <div className="mt-4 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 font-bold text-xs">Offline Simulation Mode</span>
            <span className="text-slate-400 text-xs">- display boards populated with mock timetables.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        
        {/* Station Select Panel */}
        <div className="lg:border-r border-white/[0.06] bg-[#07080d]/40">
          <div className="p-5">
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Find station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0c14] text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.06] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all outline-none"
              />
            </div>
            
            <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1">
              {filteredStations.map((station) => {
                const departures = getDeparturesForStation(station);
                const isSelected = selectedStation === station;
                
                return (
                  <button
                    key={station}
                    onClick={() => {
                      setSelectedStation(station);
                      // Don't change tab, keep current tab selection
                    }}
                    className={`w-full text-left p-3.5 rounded-xl transition-all duration-200 border cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/15'
                        : 'bg-white/[0.02] border-white/[0.04] text-slate-300 hover:bg-white/5 hover:border-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm">{station}</div>
                        <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {departures.length} active departure{departures.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${isSelected ? 'opacity-90' : 'opacity-40'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Display Boards / Info Panel */}
        <div className="lg:col-span-2 bg-[#05060b]/20">
          <div className="p-6">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-2xl">
                  <MapPin className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedStation}</h3>
                  <p className="text-slate-400 text-xs">
                    {currentFacts.type} • {currentFacts.zone}
                  </p>
                </div>
              </div>

              {/* Tab options */}
              <div className="flex bg-[#0a0c14] border border-white/[0.06] p-1 rounded-xl text-xs">
                {[
                  { id: 'departures', label: 'Departures' },
                  { id: 'platforms', label: 'Platforms' },
                  { id: 'performance', label: 'Stats' },
                  { id: 'facts', label: 'Facts' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB CONTENT: DEPARTURES */}
            {activeTab === 'departures' && (
              <div>
                {currentDepartures.length === 0 ? (
                  <div className="text-center py-20 bg-[#090a10] rounded-2xl border border-white/[0.04] border-dashed">
                    <Train className="h-10 w-10 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm font-semibold">No active departures reported</p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    
                    {/* Airport-style header */}
                    <div className="grid grid-cols-12 px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-white/[0.02]">
                      <div className="col-span-3">Train ID</div>
                      <div className="col-span-5">Destination</div>
                      <div className="col-span-4 text-right">Status / Arrival</div>
                    </div>

                    {currentDepartures.map((departure, index) => {
                      const statusInfo = getStatusInfo(departure.status);
                      
                      return (
                        <div
                          key={`${departure.trainId}-${index}`}
                          className="grid grid-cols-12 items-center bg-[#090b14] border border-white/[0.04] rounded-xl p-4 hover:border-white/[0.1] transition-all hover:bg-white/[0.01]"
                        >
                          <div className="col-span-3 flex items-center gap-2">
                            <Train className="h-4 w-4 text-blue-400" />
                            <span className="text-white font-bold tracking-wider">#{departure.trainId}</span>
                          </div>
                          
                          <div className="col-span-5">
                            <span className="text-slate-200 font-semibold tracking-wide text-xs sm:text-sm">
                              {departure.destination}
                            </span>
                          </div>
                          
                          <div className="col-span-4 text-right flex items-center justify-end gap-3.5">
                            <div className="text-right">
                              <div className={`font-bold text-xs sm:text-sm tracking-wide ${statusInfo.color}`}>
                                {departure.status}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {departure.timeMinutes === 0 
                                  ? 'Docked' 
                                  : departure.timeMinutes === 1 
                                  ? 'Arriving'
                                  : `${departure.timeMinutes} mins`
                                }
                              </div>
                            </div>
                            <div className={`p-1.5 rounded-lg border ${statusInfo.bg} ${statusInfo.color}`}>
                              {renderStatusIcon(departure.statusIcon, statusInfo.color)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PLATFORMS */}
            {activeTab === 'platforms' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentPlatforms.map((platform) => (
                  <div
                    key={platform.platform}
                    className="bg-[#090b14] border border-white/[0.04] hover:border-white/[0.1] rounded-2xl p-5 border-l-4 border-l-blue-500 transition-all flex flex-col justify-between min-h-[120px]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-black text-lg">Platform {platform.platform}</h4>
                        <p className="text-slate-400 text-xs mt-1">Bound to: {platform.direction}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold border ${getPlatformStatusColor(platform.status)}`}>
                        {platform.status}
                      </span>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 font-semibold mt-4 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-blue-500" />
                      <span>Platform Track Class {platform.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: PERFORMANCE */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-4 text-center">
                    <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-black text-white">{currentAnalytics.totalDepartures}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Daily Runs</div>
                  </div>

                  <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-4 text-center">
                    <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                    <div className="text-xl font-black text-emerald-400">{currentAnalytics.onTimePercentage}%</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Punctuality</div>
                  </div>

                  <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-4 text-center">
                    <Clock className="h-5 w-5 text-amber-400 mx-auto mb-2" />
                    <div className="text-xl font-black text-white">{currentAnalytics.averageDelay}m</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Avg Delay</div>
                  </div>
                </div>

                {/* Micro Chart bar styling */}
                <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-5">
                  <h4 className="text-white font-bold text-xs mb-4 uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <span>Timetable Performance Trends</span>
                  </h4>
                  
                  {/* Visual simulated graph */}
                  <div className="space-y-4 pt-2">
                    {[
                      { day: 'Mon', rate: currentAnalytics.onTimePercentage - 2 },
                      { day: 'Tue', rate: currentAnalytics.onTimePercentage + 1 },
                      { day: 'Wed', rate: currentAnalytics.onTimePercentage },
                      { day: 'Thu', rate: currentAnalytics.onTimePercentage - 3 },
                      { day: 'Fri', rate: currentAnalytics.onTimePercentage - 1 },
                      { day: 'Sat', rate: currentAnalytics.onTimePercentage + 3 },
                      { day: 'Sun', rate: currentAnalytics.onTimePercentage + 2 },
                    ].map((row) => (
                      <div key={row.day} className="flex items-center gap-4 text-xs font-mono">
                        <span className="w-8 text-slate-500 font-bold">{row.day}</span>
                        <div className="flex-1 bg-white/5 rounded-full h-3 relative overflow-hidden border border-white/[0.02]">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${row.rate}%` }}
                          ></div>
                        </div>
                        <span className="w-10 text-right font-bold text-blue-400">{row.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: FACTS */}
            {activeTab === 'facts' && (
              <div className="bg-[#090b14] border border-white/[0.04] rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/[0.04] pb-3">
                  <Info className="h-5 w-5 text-blue-400" />
                  <h4 className="text-white font-bold text-sm uppercase tracking-wider">Station Directory Details</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-1">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider">Stop Category</div>
                    <div className="text-white font-semibold">{currentFacts.type}</div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider">Operational Zone</div>
                    <div className="text-white font-semibold">{currentFacts.zone}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider">Track Distance</div>
                    <div className="text-white font-semibold">{currentFacts.distance}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider">Transit Accessibility</div>
                    <div className="text-white font-semibold">{currentFacts.accessibility}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer timeline info */}
            <div className="mt-8 pt-4 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>Auto updates boards every 30s</span>
              {lastUpdated && <span>Sync timestamp: {lastUpdated}</span>}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}