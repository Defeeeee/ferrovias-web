'use client';

import React, { useState, useEffect } from 'react';
import { 
  Train, 
  Clock, 
  MapPin, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Timer
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

  const getStatusInfo = (timeStr: string): { icon: StationDepartureInfo['statusIcon'], color: string } => {
    const lowerTime = timeStr.toLowerCase();
    if (lowerTime === "en estacion") return { icon: 'at-station', color: 'text-green-400' };
    if (lowerTime === "proximo") return { icon: 'approaching', color: 'text-blue-400' };
    const minutes = parseTimeToMinutes(timeStr);
    if (minutes > 30) return { icon: 'delayed', color: 'text-red-400' };
    return { icon: 'scheduled', color: 'text-yellow-400' };
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

  const filteredStations = STATION_ORDER.filter(station =>
    station.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentDepartures = getDeparturesForStation(selectedStation);

  return (
    <div className={`bg-slate-800 rounded-xl shadow-2xl ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Station Departures</h2>
            <p className="text-slate-400 text-sm">
              Real-time departure information for individual stations
            </p>
          </div>
          <button
            onClick={fetchStationData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Data Source Alert */}
        {dataSource && !dataSource.isLive && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span className="text-amber-400 font-semibold text-sm">Using Mock Data</span>
            </div>
            <p className="text-slate-300 text-xs mt-1">
              Live API unavailable. Displaying sample departure data.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Station Selection Panel */}
        <div className="lg:border-r border-slate-700">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search stations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 text-white pl-10 pr-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredStations.map((station) => {
                const departures = getDeparturesForStation(station);
                const isSelected = selectedStation === station;
                
                return (
                  <button
                    key={station}
                    onClick={() => setSelectedStation(station)}
                    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{station}</div>
                        <div className="text-xs opacity-75">
                          {departures.length} departure{departures.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Departure Details Panel */}
        <div className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStation}</h3>
                <p className="text-slate-400 text-sm">
                  {currentDepartures.length} train{currentDepartures.length !== 1 ? 's' : ''} scheduled
                </p>
              </div>
            </div>

            {currentDepartures.length === 0 ? (
              <div className="text-center py-12">
                <Train className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No departures scheduled for this station</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDepartures.map((departure, index) => {
                  const statusInfo = getStatusInfo(departure.status);
                  
                  return (
                    <div
                      key={`${departure.trainId}-${index}`}
                      className="bg-slate-700 rounded-lg p-4 hover:bg-slate-650 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-slate-600 p-2 rounded-lg">
                            <Train className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold">
                              Train {departure.trainId}
                            </div>
                            <div className="text-slate-300 text-sm">
                              to {departure.destination}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-semibold ${statusInfo.color}`}>
                              {departure.status}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {departure.timeMinutes === 0 
                                ? 'At platform' 
                                : departure.timeMinutes === 1 
                                ? 'Arriving now'
                                : `${departure.timeMinutes} min`
                              }
                            </div>
                          </div>
                          {renderStatusIcon(departure.statusIcon, statusInfo.color)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t border-slate-600">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
                <div>
                  Data updates every 30 seconds
                </div>
                {lastUpdated && (
                  <div>
                    Last updated: {lastUpdated}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}