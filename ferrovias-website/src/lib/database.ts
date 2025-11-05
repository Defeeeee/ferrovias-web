// Database schema and types for analytics
export interface TimetableEntry {
  id: string;
  trainId: string;
  stationName: string;
  scheduledTime: string; // ISO string format
  actualTime?: string; // ISO string format
  direction: 'retiro' | 'villarosa' | 'boulogne' | 'grandbourg';
  date: string; // ISO date string
  delayMinutes?: number;
  status: 'on_time' | 'delayed' | 'cancelled' | 'early';
}

// Interface for real-time API data collection
export interface RealTimeRecord {
  id: string;
  trainId: string;
  destination: string;
  stationName: string;
  apiStatus: string; // "En Estacion", "Proximo", "5 min", etc.
  timeMinutes: number; // Parsed time in minutes
  timestamp: string; // When this record was captured
  date: string; // Date of the record
}

// Interface for matching scheduled vs actual performance
export interface PerformanceRecord {
  id: string;
  trainId: string;
  stationName: string;
  scheduledTime: string;
  actualArrivalTime?: string;
  delayMinutes?: number;
  status: 'on_time' | 'delayed' | 'early' | 'no_show' | 'unknown';
  date: string;
  direction: 'retiro' | 'villarosa' | 'boulogne' | 'grandbourg';
}

export interface StationPunctualityStats {
  stationName: string;
  totalDepartures: number;
  onTimeDepartures: number;
  averageDelayMinutes: number;
  punctualityPercentage: number;
  worstDelayMinutes: number;
  bestPerformanceHour: string;
  worstPerformanceHour: string;
  lastUpdated: string;
}

export interface TrainPerformanceStats {
  trainId: string;
  direction: string;
  totalJourneys: number;
  punctualityPercentage: number;
  averageDelayMinutes: number;
  mostProblematicStation: string;
  bestPerformanceDay: string;
  worstPerformanceDay: string;
}

export interface SystemWideStats {
  totalDepartures: number;
  systemPunctuality: number;
  averageSystemDelay: number;
  bestPerformingStation: string;
  worstPerformingStation: string;
  peakHours: string[];
  dataRange: {
    from: string;
    to: string;
  };
}

// Mock database class - in production this would connect to a real database
export class AnalyticsDatabase {
  private timetableData: TimetableEntry[] = [];
  private realTimeRecords: RealTimeRecord[] = [];
  private performanceRecords: PerformanceRecord[] = [];
  private isCollecting: boolean = false;
  private collectionInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize with data from local CSV file
    this.loadLocalCSVData();
  }

  private generateSampleData() {
    const stations = [
      "Retiro", "Saldias", "Ciudad Universitaria", "A. del Valle", "Padilla",
      "Florida", "Munro", "Carapachay", "Villa Adelina", "Boulogne Sur Mer",
      "A. Montes", "Don Torcuato", "A. Sordeaux", "Villa de Mayo",
      "Los Polvorines", "Pablo Nogues", "Grand Bourg", "Tierras Altas",
      "Tortuguitas", "M. Alberti", "Del Viso", "Cecilia Grierson", "Villa Rosa"
    ];
    
    const directions = ['retiro', 'villarosa', 'boulogne', 'grandbourg'] as const;
    
    // Generate 30 days of historical data
    for (let day = 0; day < 30; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate entries for each station
      stations.forEach(station => {
        // Generate 10-20 trains per station per day
        const trainsCount = Math.floor(Math.random() * 10) + 10;
        
        for (let i = 0; i < trainsCount; i++) {
          const trainId = `30${Math.floor(Math.random() * 99) + 10}`;
          const direction = directions[Math.floor(Math.random() * directions.length)];
          
          // Random scheduled time between 5:00 and 23:00
          const scheduledHour = Math.floor(Math.random() * 18) + 5;
          const scheduledMinute = Math.floor(Math.random() * 60);
          const scheduledTime = new Date(date);
          scheduledTime.setHours(scheduledHour, scheduledMinute, 0, 0);
          
          // Calculate actual time with some probability of delay
          const actualTime = new Date(scheduledTime);
          let delayMinutes = 0;
          let status: TimetableEntry['status'] = 'on_time';
          
          const random = Math.random();
          if (random < 0.05) { // 5% cancelled
            status = 'cancelled';
          } else if (random < 0.1) { // 5% early
            delayMinutes = -(Math.floor(Math.random() * 3) + 1);
            actualTime.setMinutes(actualTime.getMinutes() + delayMinutes);
            status = 'early';
          } else if (random < 0.35) { // 25% delayed
            delayMinutes = Math.floor(Math.random() * 15) + 1; // 1-15 min delay
            actualTime.setMinutes(actualTime.getMinutes() + delayMinutes);
            status = 'delayed';
          }
          
          const entry: TimetableEntry = {
            id: `${dateStr}-${station}-${trainId}-${i}`,
            trainId,
            stationName: station,
            scheduledTime: scheduledTime.toISOString(),
            actualTime: status !== 'cancelled' ? actualTime.toISOString() : undefined,
            direction,
            date: dateStr,
            delayMinutes: status !== 'cancelled' ? delayMinutes : undefined,
            status
          };
          
          this.timetableData.push(entry);
        }
      });
    }
  }

  private async loadLocalCSVData() {
    try {
      // Enhanced CSV files including intermediate terminal origins
      const csvFiles = [
        '/data/villarosa/weekdays.csv',
        '/data/villarosa/saturdays.csv',
        '/data/villarosa/sundays.csv',
        '/data/retiro/weekdays.csv',
        '/data/retiro/saturdays.csv',
        '/data/retiro/sundays.csv',
        '/data/boulogne/retiro/weekdays.csv',
        '/data/boulogne/retiro/saturdays.csv',
        '/data/boulogne/retiro/sundays.csv',
        '/data/boulogne/villarosa/weekdays.csv',
        '/data/boulogne/villarosa/saturdays.csv',
        '/data/boulogne/villarosa/sundays.csv',
        '/data/grandbourg/weekdays.csv',
        '/data/grandbourg/saturdays.csv',
        '/data/grandbourg/sundays.csv'
      ];
      
      let totalImported = 0;
      let loadedFiles = 0;
      
      for (const csvFile of csvFiles) {
        try {
          const response = await fetch(csvFile);
          if (response.ok) {
            const csvData = await response.text();
            const imported = await this.importCSVData(csvData, csvFile);
            totalImported += imported;
            loadedFiles++;
            console.log(`Successfully loaded ${imported} entries from ${csvFile}`);
          } else {
            console.warn(`CSV file not found: ${csvFile}`);
          }
        } catch (error) {
          console.warn(`Failed to load CSV file ${csvFile}:`, error);
        }
      }
      
      if (loadedFiles > 0) {
        console.log(`Successfully loaded ${totalImported} total entries from ${loadedFiles} CSV files`);
      } else {
        console.warn('No CSV files found, using sample data');
        this.generateSampleData();
      }
    } catch (error) {
      console.warn('Failed to load CSV files, using sample data:', error);
      this.generateSampleData();
    }
  }

  async importCSVData(csvData: string, filename?: string): Promise<number> {
    // Parse CSV data in the new format: trainId followed by sequential station times
    // Example: "3025 06:55 07:01 07:07 07:12 07:16 07:19 07:22 07:25 07:28 07:32 07:39 07:43 07:47 07:49 07:52 07:56 08:00"
    const lines = csvData.trim().split('\n');
    let imported = 0;
    
    // Station order for the Belgrano Norte line
    const stationOrder = [
      "Retiro", "Saldias", "Ciudad Universitaria", "A. del Valle", "Padilla",
      "Florida", "Munro", "Carapachay", "Villa Adelina", "Boulogne Sur Mer",
      "A. Montes", "Don Torcuato", "A. Sordeaux", "Villa de Mayo",
      "Los Polvorines", "Pablo Nogues", "Grand Bourg", "Tierras Altas",
      "Tortuguitas", "M. Alberti", "Del Viso", "Cecilia Grierson", "Villa Rosa"
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(' ');
      if (parts.length < 2) continue;
      
      const trainId = parts[0];
      const times = parts.slice(1);
      
      // Determine direction and starting point based on filename
      let direction: TimetableEntry['direction'];
      let actualStations: string[];
      let startingStationIndex = 0;
      
      if (filename?.includes('/villarosa/')) {
        direction = times.length <= 11 ? 'boulogne' : 'villarosa';
        actualStations = stationOrder.slice(0, times.length);
      } else if (filename?.includes('/retiro/')) {
        direction = 'retiro';
        actualStations = stationOrder.slice(stationOrder.length - times.length).reverse();
      } else if (filename?.includes('/boulogne/retiro/')) {
        // Trains originating from Boulogne Sur Mer going to Retiro
        direction = 'retiro';
        startingStationIndex = stationOrder.indexOf("Boulogne Sur Mer");
        actualStations = stationOrder.slice(startingStationIndex, startingStationIndex + times.length);
      } else if (filename?.includes('/boulogne/villarosa/')) {
        // Trains originating from Boulogne Sur Mer going to Villa Rosa terminals
        direction = 'villarosa';
        startingStationIndex = stationOrder.indexOf("Boulogne Sur Mer");
        actualStations = stationOrder.slice(startingStationIndex, startingStationIndex + times.length);
      } else if (filename?.includes('/grandbourg/')) {
        // Trains originating from Grand Bourg
        direction = 'retiro';
        startingStationIndex = stationOrder.indexOf("Grand Bourg");
        actualStations = stationOrder.slice(startingStationIndex, startingStationIndex + times.length);
      } else {
        // Fallback logic
        direction = parseInt(trainId) % 2 === 0 ? 'villarosa' : 'retiro';
        actualStations = parseInt(trainId) % 2 === 0 
          ? stationOrder.slice(0, times.length)
          : stationOrder.slice(stationOrder.length - times.length).reverse();
      }
      
      // Get current date for entries
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Create entries for each station
      for (let j = 0; j < times.length; j++) {
        const timeStr = times[j];
        const stationName = actualStations[j];
        
        if (!stationName || !timeStr) continue;
        
        // Parse time (format HH:MM)
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
        if (isNaN(hours) || isNaN(minutes)) continue;
        
        // Create scheduled time (use current date)
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // Simulate some realistic delays/on-time performance
        const actualTime = new Date(scheduledTime);
        let delayMinutes = 0;
        let status: TimetableEntry['status'] = 'on_time';
        
        const random = Math.random();
        if (random < 0.05) {
          // 5% cancelled
          status = 'cancelled';
        } else if (random < 0.1) {
          // 5% early
          delayMinutes = -(Math.floor(Math.random() * 3) + 1);
          actualTime.setMinutes(actualTime.getMinutes() + delayMinutes);
          status = 'early';
        } else if (random < 0.35) {
          // 25% delayed
          delayMinutes = Math.floor(Math.random() * 15) + 1;
          actualTime.setMinutes(actualTime.getMinutes() + delayMinutes);
          status = 'delayed';
        }
        
        const entry: TimetableEntry = {
          id: `${currentDate}-${stationName}-${trainId}-${j}`,
          trainId,
          stationName,
          scheduledTime: scheduledTime.toISOString(),
          actualTime: status !== 'cancelled' ? actualTime.toISOString() : undefined,
          direction,
          date: currentDate,
          delayMinutes: status !== 'cancelled' ? delayMinutes : undefined,
          status
        };
        
        this.timetableData.push(entry);
        imported++;
      }
    }
    
    return imported;
  }

  async getStationPunctualityStats(stationName: string, days: number = 30): Promise<StationPunctualityStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const stationData = this.timetableData.filter(entry => 
      entry.stationName === stationName && 
      new Date(entry.date) >= cutoffDate
    );
    
    const totalDepartures = stationData.length;
    const onTimeDepartures = stationData.filter(entry => 
      entry.status === 'on_time' || entry.status === 'early'
    ).length;
    
    const delayedEntries = stationData.filter(entry => 
      entry.delayMinutes !== undefined && entry.delayMinutes > 0
    );
    
    const averageDelayMinutes = delayedEntries.length > 0 
      ? delayedEntries.reduce((sum, entry) => sum + (entry.delayMinutes || 0), 0) / delayedEntries.length
      : 0;
    
    const worstDelayMinutes = Math.max(...stationData.map(entry => entry.delayMinutes || 0));
    
    // Find best and worst performance hours
    const hourlyStats: Record<string, { total: number, onTime: number }> = {};
    stationData.forEach(entry => {
      const hour = new Date(entry.scheduledTime).getHours().toString().padStart(2, '0') + ':00';
      if (!hourlyStats[hour]) hourlyStats[hour] = { total: 0, onTime: 0 };
      hourlyStats[hour].total++;
      if (entry.status === 'on_time' || entry.status === 'early') {
        hourlyStats[hour].onTime++;
      }
    });
    
    let bestHour = '06:00';
    let worstHour = '18:00';
    let bestPercentage = 0;
    let worstPercentage = 100;
    
    Object.entries(hourlyStats).forEach(([hour, stats]) => {
      const percentage = (stats.onTime / stats.total) * 100;
      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestHour = hour;
      }
      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstHour = hour;
      }
    });
    
    return {
      stationName,
      totalDepartures,
      onTimeDepartures,
      averageDelayMinutes: Math.round(averageDelayMinutes * 100) / 100,
      punctualityPercentage: Math.round((onTimeDepartures / totalDepartures) * 100),
      worstDelayMinutes,
      bestPerformanceHour: bestHour,
      worstPerformanceHour: worstHour,
      lastUpdated: new Date().toISOString()
    };
  }

  async getSystemWideStats(days: number = 30): Promise<SystemWideStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentData = this.timetableData.filter(entry => 
      new Date(entry.date) >= cutoffDate
    );
    
    const totalDepartures = recentData.length;
    const onTimeDepartures = recentData.filter(entry => 
      entry.status === 'on_time' || entry.status === 'early'
    ).length;
    
    const systemPunctuality = Math.round((onTimeDepartures / totalDepartures) * 100);
    
    const delayedEntries = recentData.filter(entry => 
      entry.delayMinutes !== undefined && entry.delayMinutes > 0
    );
    const averageSystemDelay = delayedEntries.length > 0 
      ? Math.round((delayedEntries.reduce((sum, entry) => sum + (entry.delayMinutes || 0), 0) / delayedEntries.length) * 100) / 100
      : 0;
    
    // Calculate station performance
    const stationPerformance: Record<string, { total: number, onTime: number }> = {};
    recentData.forEach(entry => {
      if (!stationPerformance[entry.stationName]) {
        stationPerformance[entry.stationName] = { total: 0, onTime: 0 };
      }
      stationPerformance[entry.stationName].total++;
      if (entry.status === 'on_time' || entry.status === 'early') {
        stationPerformance[entry.stationName].onTime++;
      }
    });
    
    let bestStation = '';
    let worstStation = '';
    let bestPercentage = 0;
    let worstPercentage = 100;
    
    Object.entries(stationPerformance).forEach(([station, stats]) => {
      const percentage = (stats.onTime / stats.total) * 100;
      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestStation = station;
      }
      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstStation = station;
      }
    });
    
    // Find peak hours
    const hourlyTraffic: Record<string, number> = {};
    recentData.forEach(entry => {
      const hour = new Date(entry.scheduledTime).getHours().toString().padStart(2, '0') + ':00';
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourlyTraffic)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);
    
    return {
      totalDepartures,
      systemPunctuality,
      averageSystemDelay,
      bestPerformingStation: bestStation,
      worstPerformingStation: worstStation,
      peakHours,
      dataRange: {
        from: cutoffDate.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      }
    };
  }

  async getAllStationStats(days: number = 30): Promise<StationPunctualityStats[]> {
    const stations = [
      "Retiro", "Saldias", "Ciudad Universitaria", "A. del Valle", "Padilla",
      "Florida", "Munro", "Carapachay", "Villa Adelina", "Boulogne Sur Mer",
      "A. Montes", "Don Torcuato", "A. Sordeaux", "Villa de Mayo",
      "Los Polvorines", "Pablo Nogues", "Grand Bourg", "Tierras Altas",
      "Tortuguitas", "M. Alberti", "Del Viso", "Cecilia Grierson", "Villa Rosa"
    ];
    
    const stats: StationPunctualityStats[] = [];
    for (const station of stations) {
      stats.push(await this.getStationPunctualityStats(station, days));
    }
    
    return stats;
  }

  // Real-time data collection methods
  async startRealTimeCollection(): Promise<void> {
    if (this.isCollecting) {
      console.log('Real-time collection already running');
      return;
    }

    this.isCollecting = true;
    console.log('Starting real-time data collection...');

    // Collect data immediately
    await this.collectRealTimeData();

    // Set up interval to collect data every 2 minutes
    this.collectionInterval = setInterval(async () => {
      await this.collectRealTimeData();
    }, 2 * 60 * 1000);
  }

  stopRealTimeCollection(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = null;
    }
    this.isCollecting = false;
    console.log('Stopped real-time data collection');
  }

  private async collectRealTimeData(): Promise<void> {
    try {
      const API_URL = 'https://ferrovias.fdiaznem.com.ar/stations/all/status';
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiData = await response.json();
      const timestamp = new Date().toISOString();
      const date = new Date().toISOString().split('T')[0];

      // Process each station's data
      for (const [stationName, trainReports] of Object.entries(apiData)) {
        if (!trainReports || typeof trainReports !== 'object') continue;

        for (const [trainDestId, timeData] of Object.entries(trainReports as Record<string, any>)) {
          const [destination, trainId] = trainDestId.split('-');
          if (!destination || !trainId) continue;

          const timeStr = Array.isArray(timeData) ? timeData[0] : timeData;
          if (typeof timeStr !== 'string') continue;

          const timeMinutes = this.parseTimeToMinutes(timeStr);

          const record: RealTimeRecord = {
            id: `${timestamp}-${stationName}-${trainId}`,
            trainId,
            destination: destination.replace('_', ' '),
            stationName,
            apiStatus: timeStr,
            timeMinutes,
            timestamp,
            date
          };

          this.realTimeRecords.push(record);

          // If train is at station, try to match with scheduled data
          if (timeMinutes === 0) {
            await this.processTrainArrival(record);
          }
        }
      }

      // Clean old records (keep only last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString();

      this.realTimeRecords = this.realTimeRecords.filter(record => 
        record.timestamp >= weekAgoStr
      );

      console.log(`Collected real-time data: ${Object.keys(apiData).length} stations processed`);
    } catch (error) {
      console.error('Failed to collect real-time data:', error);
    }
  }

  private parseTimeToMinutes(timeStr: string): number {
    if (!timeStr || typeof timeStr !== 'string') return 999;
    const lowerTime = timeStr.toLowerCase();

    if (lowerTime === "en estacion") return 0;
    if (lowerTime === "proximo") return 1;

    const minutes = parseInt(lowerTime.match(/\d+/)?.[0] || '999', 10);
    return isNaN(minutes) ? 999 : minutes;
  }

  private async processTrainArrival(record: RealTimeRecord): Promise<void> {
    // Find matching scheduled entry for this train at this station
    const matchingScheduled = this.timetableData.find(entry => {
      if (entry.trainId !== record.trainId || entry.stationName !== record.stationName) {
        return false;
      }

      // Check if this is for the same date
      const scheduledDate = new Date(entry.scheduledTime).toISOString().split('T')[0];
      return scheduledDate === record.date;
    });

    if (!matchingScheduled) {
      // No scheduled entry found, this might be an unscheduled train or data mismatch
      return;
    }

    // Calculate performance metrics
    const scheduledTime = new Date(matchingScheduled.scheduledTime);
    const actualArrivalTime = new Date(record.timestamp);
    const delayMs = actualArrivalTime.getTime() - scheduledTime.getTime();
    const delayMinutes = Math.round(delayMs / (1000 * 60));

    let status: PerformanceRecord['status'] = 'on_time';
    if (delayMinutes < -2) {
      status = 'early';
    } else if (delayMinutes > 5) {
      status = 'delayed';
    }

    const performanceRecord: PerformanceRecord = {
      id: `${record.date}-${record.stationName}-${record.trainId}`,
      trainId: record.trainId,
      stationName: record.stationName,
      scheduledTime: matchingScheduled.scheduledTime,
      actualArrivalTime: actualArrivalTime.toISOString(),
      delayMinutes,
      status,
      date: record.date,
      direction: matchingScheduled.direction
    };

    // Check if we already have a performance record for this train/station/date
    const existingIndex = this.performanceRecords.findIndex(pr => pr.id === performanceRecord.id);
    if (existingIndex >= 0) {
      // Update existing record
      this.performanceRecords[existingIndex] = performanceRecord;
    } else {
      // Add new record
      this.performanceRecords.push(performanceRecord);
    }
  }

  // Get real-time analytics based on actual performance data
  async getRealTimeStationStats(stationName: string, days: number = 30): Promise<StationPunctualityStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Use performance records instead of mock data
    const stationPerformance = this.performanceRecords.filter(record => 
      record.stationName === stationName && 
      new Date(record.date) >= cutoffDate
    );

    if (stationPerformance.length === 0) {
      // Fallback to original method if no real-time data available
      return this.getStationPunctualityStats(stationName, days);
    }

    const totalDepartures = stationPerformance.length;
    const onTimeDepartures = stationPerformance.filter(record => 
      record.status === 'on_time' || record.status === 'early'
    ).length;
    
    const delayedRecords = stationPerformance.filter(record => 
      record.delayMinutes !== undefined && record.delayMinutes > 0
    );
    
    const averageDelayMinutes = delayedRecords.length > 0 
      ? delayedRecords.reduce((sum, record) => sum + (record.delayMinutes || 0), 0) / delayedRecords.length
      : 0;
    
    const worstDelayMinutes = Math.max(...stationPerformance.map(record => record.delayMinutes || 0));
    
    // Calculate best and worst performance hours based on actual data
    const hourlyStats: Record<string, { total: number, onTime: number }> = {};
    stationPerformance.forEach(record => {
      const hour = new Date(record.scheduledTime).getHours().toString().padStart(2, '0') + ':00';
      if (!hourlyStats[hour]) hourlyStats[hour] = { total: 0, onTime: 0 };
      hourlyStats[hour].total++;
      if (record.status === 'on_time' || record.status === 'early') {
        hourlyStats[hour].onTime++;
      }
    });
    
    let bestHour = '06:00';
    let worstHour = '18:00';
    let bestPercentage = 0;
    let worstPercentage = 100;
    
    Object.entries(hourlyStats).forEach(([hour, stats]) => {
      const percentage = (stats.onTime / stats.total) * 100;
      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestHour = hour;
      }
      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstHour = hour;
      }
    });
    
    return {
      stationName,
      totalDepartures,
      onTimeDepartures,
      averageDelayMinutes: Math.round(averageDelayMinutes * 100) / 100,
      punctualityPercentage: Math.round((onTimeDepartures / totalDepartures) * 100),
      worstDelayMinutes,
      bestPerformanceHour: bestHour,
      worstPerformanceHour: worstHour,
      lastUpdated: new Date().toISOString()
    };
  }

  // Get real-time system stats
  async getRealTimeSystemStats(days: number = 30): Promise<SystemWideStats> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const recentPerformance = this.performanceRecords.filter(record => 
      new Date(record.date) >= cutoffDate
    );

    if (recentPerformance.length === 0) {
      // Fallback to original method if no real-time data available
      return this.getSystemWideStats(days);
    }
    
    const totalDepartures = recentPerformance.length;
    const onTimeDepartures = recentPerformance.filter(record => 
      record.status === 'on_time' || record.status === 'early'
    ).length;
    
    const systemPunctuality = Math.round((onTimeDepartures / totalDepartures) * 100);
    
    const delayedRecords = recentPerformance.filter(record => 
      record.delayMinutes !== undefined && record.delayMinutes > 0
    );
    const averageSystemDelay = delayedRecords.length > 0 
      ? Math.round((delayedRecords.reduce((sum, record) => sum + (record.delayMinutes || 0), 0) / delayedRecords.length) * 100) / 100
      : 0;
    
    // Calculate station performance
    const stationPerformance: Record<string, { total: number, onTime: number }> = {};
    recentPerformance.forEach(record => {
      if (!stationPerformance[record.stationName]) {
        stationPerformance[record.stationName] = { total: 0, onTime: 0 };
      }
      stationPerformance[record.stationName].total++;
      if (record.status === 'on_time' || record.status === 'early') {
        stationPerformance[record.stationName].onTime++;
      }
    });
    
    let bestStation = '';
    let worstStation = '';
    let bestPercentage = 0;
    let worstPercentage = 100;
    
    Object.entries(stationPerformance).forEach(([station, stats]) => {
      const percentage = (stats.onTime / stats.total) * 100;
      if (percentage > bestPercentage) {
        bestPercentage = percentage;
        bestStation = station;
      }
      if (percentage < worstPercentage) {
        worstPercentage = percentage;
        worstStation = station;
      }
    });
    
    // Find peak hours based on actual data
    const hourlyTraffic: Record<string, number> = {};
    recentPerformance.forEach(record => {
      const hour = new Date(record.scheduledTime).getHours().toString().padStart(2, '0') + ':00';
      hourlyTraffic[hour] = (hourlyTraffic[hour] || 0) + 1;
    });
    
    const peakHours = Object.entries(hourlyTraffic)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);
    
    return {
      totalDepartures,
      systemPunctuality,
      averageSystemDelay,
      bestPerformingStation: bestStation,
      worstPerformingStation: worstStation,
      peakHours,
      dataRange: {
        from: cutoffDate.toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      }
    };
  }

  // Get all real-time station stats
  async getAllRealTimeStationStats(days: number = 30): Promise<StationPunctualityStats[]> {
    const stations = [
      "Retiro", "Saldias", "Ciudad Universitaria", "A. del Valle", "Padilla",
      "Florida", "Munro", "Carapachay", "Villa Adelina", "Boulogne Sur Mer",
      "A. Montes", "Don Torcuato", "A. Sordeaux", "Villa de Mayo",
      "Los Polvorines", "Pablo Nogues", "Grand Bourg", "Tierras Altas",
      "Tortuguitas", "M. Alberti", "Del Viso", "Cecilia Grierson", "Villa Rosa"
    ];
    
    const stats: StationPunctualityStats[] = [];
    for (const station of stations) {
      stats.push(await this.getRealTimeStationStats(station, days));
    }
    
    return stats;
  }

  // Method to get collection status
  getCollectionStatus(): { isCollecting: boolean, recordsCount: number, performanceCount: number } {
    return {
      isCollecting: this.isCollecting,
      recordsCount: this.realTimeRecords.length,
      performanceCount: this.performanceRecords.length
    };
  }
}

// Singleton instance
export const analyticsDb = new AnalyticsDatabase();