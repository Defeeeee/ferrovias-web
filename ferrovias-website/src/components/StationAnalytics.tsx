'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  MapPin,
  Activity,
  PieChart,
  Calendar,
  Info
} from 'lucide-react';
import { STATION_ORDER, MOCK_API_DATA } from '@/lib/config';

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

interface StationAnalyticsProps {
  selectedStation?: string;
  className?: string;
}

export default function StationAnalytics({ selectedStation = 'Retiro', className = '' }: StationAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<DepartureStats | null>(null);
  const [platformData, setPlatformData] = useState<PlatformInfo[]>([]);

  // Mock platform data - in real app this would come from API
  const generatePlatformData = (stationName: string): PlatformInfo[] => {
    const isTerminal = ['Retiro', 'Villa Rosa', 'Boulogne Sur Mer', 'Grand Bourg'].includes(stationName);
    const platformCount = isTerminal ? 4 : 2;
    
    const platforms: PlatformInfo[] = [];
    for (let i = 1; i <= platformCount; i++) {
      platforms.push({
        platform: `${i}${i % 2 === 1 ? 'A' : 'B'}`,
        type: i % 2 === 1 ? 'A' : 'B',
        direction: i % 2 === 1 ? 'Villa Rosa / Grand Bourg' : 'Retiro',
        status: Math.random() > 0.1 ? 'active' : 'maintenance'
      });
    }
    return platforms;
  };

  // Mock analytics data - in real app this would come from historical API data
  const generateAnalyticsData = (stationName: string): DepartureStats => {
    const baseTrains = MOCK_API_DATA[stationName] ? Object.keys(MOCK_API_DATA[stationName]).length : 0;
    return {
      station: stationName,
      totalDepartures: Math.floor(Math.random() * 50) + baseTrains * 10,
      onTimePercentage: Math.floor(Math.random() * 30) + 70,
      averageDelay: Math.floor(Math.random() * 8) + 2,
      peakHours: ['07:00-09:00', '17:00-19:00']
    };
  };

  useEffect(() => {
    setPlatformData(generatePlatformData(selectedStation));
    setAnalyticsData(generateAnalyticsData(selectedStation));
  }, [selectedStation]);

  const getStatusColor = (status: PlatformInfo['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'closed': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Platform Information */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-600 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Platform Information</h3>
            <p className="text-slate-400 text-sm">Current platform status at {selectedStation}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platformData.map((platform) => (
            <div
              key={platform.platform}
              className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold">Platform {platform.platform}</h4>
                  <p className="text-slate-400 text-sm">Direction: {platform.direction}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(platform.status)}`}>
                  {platform.status}
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Activity className="h-3 w-3" />
                <span>Type {platform.type} Platform</span>
              </div>
            </div>
          ))}
        </div>

        {platformData.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Info className="h-8 w-8 mx-auto mb-2" />
            <p>Platform information not available for this station</p>
          </div>
        )}
      </div>

      {/* Performance Analytics */}
      {analyticsData && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Performance Analytics</h3>
              <p className="text-slate-400 text-sm">Historical data and statistics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Departures */}
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-blue-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {analyticsData.totalDepartures}
              </div>
              <div className="text-slate-400 text-sm">Daily Departures</div>
            </div>

            {/* On-Time Performance */}
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-green-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(analyticsData.onTimePercentage)}`}>
                {analyticsData.onTimePercentage}%
              </div>
              <div className="text-slate-400 text-sm">On-Time Rate</div>
            </div>

            {/* Average Delay */}
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-orange-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {analyticsData.averageDelay}min
              </div>
              <div className="text-slate-400 text-sm">Avg. Delay</div>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Peak Hours
            </h4>
            <div className="flex flex-wrap gap-2">
              {analyticsData.peakHours.map((hour, index) => (
                <div
                  key={index}
                  className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {hour}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">
              Times with highest passenger traffic and departure frequency
            </p>
          </div>
        </div>
      )}

      {/* Historical Performance Chart Placeholder */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Performance Trends</h3>
            <p className="text-slate-400 text-sm">Weekly departure performance overview</p>
          </div>
        </div>

        {/* Mock Chart Area */}
        <div className="bg-slate-700 rounded-lg p-8 text-center">
          <div className="space-y-4">
            {/* Mock Chart Bars */}
            <div className="flex items-end justify-center gap-3 h-24">
              {[65, 80, 72, 90, 85, 78, 88].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm"
                  style={{ 
                    width: '20px', 
                    height: `${height}%`,
                    minHeight: '20px'
                  }}
                />
              ))}
            </div>
            
            {/* Days Labels */}
            <div className="flex justify-center gap-3 text-xs text-slate-500">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="w-5 text-center">{day}</div>
              ))}
            </div>
          </div>
          
          <p className="text-slate-400 text-sm mt-4">
            On-time performance percentage by day of the week
          </p>
        </div>
      </div>

      {/* Station Facts */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-cyan-600 p-2 rounded-lg">
            <Info className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Station Facts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="text-slate-400">Station Type:</div>
            <div className="text-white">
              {['Retiro', 'Villa Rosa', 'Boulogne Sur Mer', 'Grand Bourg'].includes(selectedStation) 
                ? 'Terminal Station' 
                : 'Intermediate Station'
              }
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-slate-400">Zone:</div>
            <div className="text-white">
              {STATION_ORDER.indexOf(selectedStation) < 10 ? 'Urban Zone' : 'Suburban Zone'}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-slate-400">Distance from Retiro:</div>
            <div className="text-white">
              ~{STATION_ORDER.indexOf(selectedStation) * 3.5} km
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-slate-400">Accessibility:</div>
            <div className="text-white">
              {Math.random() > 0.3 ? 'Wheelchair Accessible' : 'Limited Accessibility'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}