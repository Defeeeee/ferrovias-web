'use client';

import React, { useEffect, useState } from 'react';
import { Train } from 'lucide-react';
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
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTrainData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTrainColor = (train: TrainWithLocation): string => {
    const destination = train.destination.toUpperCase();
    const isToRetiro = destination.includes("RETIRO");

    if (destination.includes("BOULOGNE SUR MER")) {
      return "text-emerald-500";
    } else if (destination.includes("GRAND BOURG")) {
      return "text-orange-500";
    } else if (isToRetiro) {
      return "text-blue-500";
    } else {
      return "text-red-500";
    }
  };

  const getTrainDirection = (train: TrainWithLocation): string => {
    const isToRetiro = train.destination.toUpperCase().includes("RETIRO");
    return isToRetiro ? "scale-x-[-1]" : "";
  };

  return (
    <div className={`bg-slate-800 rounded-xl shadow-2xl p-8 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Belgrano Norte - Live Map</h2>
          <p className="text-slate-400 text-sm">
            Estimated train positions based on station arrival times
          </p>
        </div>
        <button
          onClick={fetchTrainData}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 text-sm"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-red-400 font-semibold mb-2">Error Loading Data</h3>
          <p className="text-slate-300 text-sm">{error}</p>
        </div>
      )}

      {/* Data Source Alert */}
      {dataSource && !dataSource.isLive && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
          <h3 className="text-amber-400 font-semibold mb-2">Using Mock Data</h3>
          <p className="text-slate-300 text-sm">
            Could not fetch live train data. Displaying mock data instead.
          </p>
          {dataSource.error && (
            <p className="text-slate-400 text-xs mt-1">Details: {dataSource.error}</p>
          )}
        </div>
      )}

      {/* Map Container */}
      <div className="relative bg-slate-900 rounded-lg p-4 sm:p-8 min-h-[200px] sm:min-h-[300px] overflow-x-auto">
        {/* Railway Track */}
        <div className="relative w-full min-w-[800px] mx-auto">
          {/* Track Line */}
          <div className="relative h-2 bg-slate-600 rounded-full mx-8 my-16">
            {/* Stations */}
            {STATION_ORDER.map((stationName, index) => {
              const percent = (index / (STATION_ORDER.length - 1)) * 100;
              const isEven = index % 2 === 0;
              const isFirst = index === 0;
              const isLast = index === STATION_ORDER.length - 1;

              return (
                <div key={stationName} className="absolute top-1/2 transform -translate-y-1/2" style={{ left: `${percent}%` }}>
                  {/* Station Stop */}
                  <div className="w-4 h-4 bg-slate-800 border-3 border-slate-400 rounded-full transform -translate-x-1/2 z-10 relative"></div>
                  
                  {/* Station Label */}
                  <div 
                    className={`absolute text-xs font-medium text-slate-300 whitespace-nowrap transform -translate-x-1/2 ${
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

            {/* Trains */}
            {trains.map((train) => {
              const posPercent = getTrainPositionPercent(train.location);
              if (posPercent === -999) return null;

              return (
                <div
                  key={train.id}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-20 group cursor-pointer transition-all duration-1000 ease-in-out"
                  style={{ left: `${posPercent}%` }}
                >
                  {/* Train Icon */}
                  <div className={`${getTrainColor(train)} ${getTrainDirection(train)} hover:scale-110 transition-transform duration-200`}>
                    <Train size={28} className="drop-shadow-lg" />
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30">
                    <div className="font-semibold">Tren {train.id} (a {train.destination})</div>
                    <div>{train.location.description}</div>
                    
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-slate-700"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-slate-400 text-sm">
          <strong>Note:</strong> This is an estimation. Positions are inferred from API data and may not be exact.
        </p>
        {lastUpdated && (
          <p className="text-slate-500 text-xs">Last Updated: {lastUpdated}</p>
        )}
        {dataSource && (
          <p className="text-slate-500 text-xs font-medium">{dataSource.message}</p>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Train size={16} className="text-blue-500" />
          <span className="text-slate-400">To Retiro</span>
        </div>
        <div className="flex items-center gap-2">
          <Train size={16} className="text-red-500" />
          <span className="text-slate-400">To Villa Rosa</span>
        </div>
        <div className="flex items-center gap-2">
          <Train size={16} className="text-emerald-500" />
          <span className="text-slate-400">To Boulogne Sur Mer</span>
        </div>
        <div className="flex items-center gap-2">
          <Train size={16} className="text-orange-500" />
          <span className="text-slate-400">To Grand Bourg</span>
        </div>
      </div>
    </div>
  );
}