'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Zap
} from 'lucide-react';
import { analyticsDb, StationPunctualityStats, SystemWideStats } from '@/lib/database';

interface AnalyticsDashboardProps {
  className?: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const [systemStats, setSystemStats] = useState<SystemWideStats | null>(null);
  const [stationStats, setStationStats] = useState<StationPunctualityStats[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<string>('');
  const [collectionStatus, setCollectionStatus] = useState({ isCollecting: false, recordsCount: 0, performanceCount: 0 });

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use real-time analytics methods that incorporate live API data
      const [systemData, stationsData] = await Promise.all([
        analyticsDb.getRealTimeSystemStats(selectedPeriod),
        analyticsDb.getAllRealTimeStationStats(selectedPeriod)
      ]);
      setSystemStats(systemData);
      setStationStats(stationsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadAnalytics();
    updateCollectionStatus();
  }, [selectedPeriod, loadAnalytics]);

  const updateCollectionStatus = () => {
    const status = analyticsDb.getCollectionStatus();
    setCollectionStatus(status);
  };

  const handleStartCollection = async () => {
    try {
      await analyticsDb.startRealTimeCollection();
      updateCollectionStatus();
      setImportStatus('Real-time data collection started');
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      setImportStatus(`Failed to start collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setImportStatus(''), 5000);
    }
  };

  const handleStopCollection = () => {
    analyticsDb.stopRealTimeCollection();
    updateCollectionStatus();
    setImportStatus('Real-time data collection stopped');
    setTimeout(() => setImportStatus(''), 3000);
  };


  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPerformanceIcon = (percentage: number) => {
    if (percentage >= 90) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (percentage >= 75) return <Target className="h-5 w-5 text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  };

  if (isLoading && !systemStats) {
    return (
      <div className={`bg-slate-800 rounded-xl p-8 text-center ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-400">Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Railway Analytics Dashboard</h2>
            <p className="text-slate-400">
              Punctuality statistics and performance metrics based on historical timetable data
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            
            <button
              onClick={loadAnalytics}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              <Activity className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            {collectionStatus.isCollecting ? (
              <button
                onClick={handleStopCollection}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
                Stop Collection
              </button>
            ) : (
              <button
                onClick={handleStartCollection}
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Start Collection
              </button>
            )}
          </div>
        </div>

        {/* Data Information Section */}
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Data Sources</h3>
          
          {/* Real-time Collection Status */}
          <div className="bg-slate-700 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${collectionStatus.isCollecting ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">Real-time API Collection</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${collectionStatus.isCollecting ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'}`}>
                {collectionStatus.isCollecting ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">API Records:</span>
                <span className="text-white ml-2">{collectionStatus.recordsCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Performance Records:</span>
                <span className="text-white ml-2">{collectionStatus.performanceCount.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              {collectionStatus.isCollecting 
                ? 'Collecting data every 2 minutes from live API and comparing with scheduled times'
                : 'Start collection to gather real-time performance data'
              }
            </p>
          </div>
          
          {/* CSV Data Source */}
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-white font-medium">Scheduled Timetable (CSV Files)</span>
            </div>
            <p className="text-slate-400 text-sm mb-2">
              Baseline schedules loaded from 15 CSV files organized by direction and day type:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs text-slate-500 mb-2">
              <div>
                <div className="text-slate-400 font-medium">Villa Rosa destination:</div>
                <div>• weekdays.csv</div>
                <div>• saturdays.csv</div>
                <div>• sundays.csv</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Retiro destination:</div>
                <div>• weekdays.csv</div>
                <div>• saturdays.csv</div>
                <div>• sundays.csv</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Boulogne → Retiro:</div>
                <div>• weekdays.csv</div>
                <div>• saturdays.csv</div>
                <div>• sundays.csv</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Boulogne → Villa Rosa:</div>
                <div>• weekdays.csv</div>
                <div>• saturdays.csv</div>
                <div>• sundays.csv</div>
              </div>
              <div>
                <div className="text-slate-400 font-medium">Grand Bourg → Retiro:</div>
                <div>• weekdays.csv</div>
                <div>• saturdays.csv</div>
                <div>• sundays.csv</div>
              </div>
            </div>
            {importStatus && (
              <p className={`text-sm ${importStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
                {importStatus}
              </p>
            )}
            <p className="text-xs text-slate-500">
              CSV Format: trainId followed by sequential station times (e.g., &quot;3025 06:55 07:01 07:07...&quot;)
            </p>
          </div>
        </div>
      </div>

      {/* System-Wide Statistics */}
      {systemStats && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            System Performance Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-blue-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {systemStats.totalDepartures.toLocaleString()}
              </div>
              <div className="text-slate-400 text-sm">Total Departures</div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-green-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className={`text-2xl font-bold mb-1 ${getPerformanceColor(systemStats.systemPunctuality)}`}>
                {systemStats.systemPunctuality}%
              </div>
              <div className="text-slate-400 text-sm">System Punctuality</div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-orange-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {systemStats.averageSystemDelay}min
              </div>
              <div className="text-slate-400 text-sm">Average Delay</div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="bg-purple-600 p-3 rounded-lg w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {systemStats.peakHours.length}
              </div>
              <div className="text-slate-400 text-sm">Peak Hours</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Best Performing Station
              </h4>
              <div className="text-lg font-medium text-green-400">
                {systemStats.bestPerformingStation}
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                Needs Improvement
              </h4>
              <div className="text-lg font-medium text-red-400">
                {systemStats.worstPerformingStation}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-slate-700 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Peak Traffic Hours</h4>
            <div className="flex flex-wrap gap-2">
              {systemStats.peakHours.map((hour, index) => (
                <div
                  key={index}
                  className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium"
                >
                  {hour}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Station Performance Table */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-500" />
          Station Performance Rankings
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 font-medium py-3 px-4">Station</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Departures</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Punctuality</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Avg. Delay</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Worst Delay</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Best Hour</th>
                <th className="text-left text-slate-400 font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stationStats
                .sort((a, b) => b.punctualityPercentage - a.punctualityPercentage)
                .map((station) => (
                <tr key={station.stationName} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{station.stationName}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {station.totalDepartures.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`font-semibold ${getPerformanceColor(station.punctualityPercentage)}`}>
                      {station.punctualityPercentage}%
                    </div>
                    <div className="text-xs text-slate-500">
                      {station.onTimeDepartures} on time
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {station.averageDelayMinutes}min
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {station.worstDelayMinutes}min
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {station.bestPerformanceHour}
                  </td>
                  <td className="py-3 px-4">
                    {getPerformanceIcon(station.punctualityPercentage)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Distribution Chart */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-purple-500" />
          Punctuality Distribution
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {stationStats.filter(s => s.punctualityPercentage >= 90).length}
            </div>
            <div className="text-green-300 text-sm">Excellent (≥90%)</div>
          </div>
          
          <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {stationStats.filter(s => s.punctualityPercentage >= 75 && s.punctualityPercentage < 90).length}
            </div>
            <div className="text-yellow-300 text-sm">Good (75-89%)</div>
          </div>
          
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400 mb-1">
              {stationStats.filter(s => s.punctualityPercentage < 75).length}
            </div>
            <div className="text-red-300 text-sm">Needs Improvement (&lt;75%)</div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        <div className="bg-slate-700 rounded-lg p-6">
          <h4 className="text-white font-semibold mb-4">Punctuality by Station (Top 10)</h4>
          <div className="space-y-3">
            {stationStats
              .sort((a, b) => b.punctualityPercentage - a.punctualityPercentage)
              .slice(0, 10)
              .map((station) => (
                <div key={station.stationName} className="flex items-center gap-4">
                  <div className="w-20 text-xs text-slate-400 truncate">
                    {station.stationName}
                  </div>
                  <div className="flex-1 bg-slate-600 rounded-full h-4 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        station.punctualityPercentage >= 90 
                          ? 'bg-gradient-to-r from-green-600 to-green-400'
                          : station.punctualityPercentage >= 75
                          ? 'bg-gradient-to-r from-yellow-600 to-yellow-400'
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${station.punctualityPercentage}%` }}
                    />
                  </div>
                  <div className={`w-12 text-xs font-medium ${getPerformanceColor(station.punctualityPercentage)}`}>
                    {station.punctualityPercentage}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Data Info */}
      {systemStats && (
        <div className="bg-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Data Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-400 mb-1">Analysis Period:</div>
              <div className="text-white">
                {systemStats.dataRange.from} to {systemStats.dataRange.to}
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Total Stations:</div>
              <div className="text-white">{stationStats.length} stations</div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Last Updated:</div>
              <div className="text-white">
                {stationStats[0]?.lastUpdated 
                  ? new Date(stationStats[0].lastUpdated).toLocaleString()
                  : 'N/A'
                }
              </div>
            </div>
            <div>
              <div className="text-slate-400 mb-1">Data Source:</div>
              <div className="text-white">Timetable Database + CSV Import</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}