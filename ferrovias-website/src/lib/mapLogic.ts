import { 
  STATION_ORDER, 
  ESTIMATED_TRAVEL_TIMES, 
  MOCK_API_DATA, 
  TERMINAL_STATIONS, 
  API_URL 
} from './config';
import { 
  Train, 
  TrainReport, 
  TrainLocation, 
  TrainWithLocation, 
  APIData, 
  DataSourceInfo 
} from './types';

/**
 * Parses the time string from the API. Returns time in minutes.
 */
function parseTime(timeStr: string | undefined): number {
  if (!timeStr || typeof timeStr !== 'string') return 999;
  const lowerTime = timeStr.toLowerCase();

  if (lowerTime === "en estacion") return 0;
  if (lowerTime === "proximo") return 1; // "Proximo" is ~1 minute

  const minutes = parseInt(lowerTime.match(/\d+/)?.[0] || '999', 10);
  return isNaN(minutes) ? 999 : minutes;
}

/**
 * Fetches and processes the API data into a clean "trains" object.
 */
export async function getProcessedTrainData(): Promise<{ trains: TrainWithLocation[], dataSource: DataSourceInfo }> {
  let allStationsData: APIData;
  let dataSource: DataSourceInfo;

  try {
    // Try live API first
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}. Is the server running?`);
    }
    allStationsData = await response.json();
    console.log("Using LIVE API data.");
    dataSource = {
      isLive: true,
      message: "Data Source: Live API"
    };
  } catch (err) {
    // Fallback to mock data
    console.warn(`Live API failed (${err instanceof Error ? err.message : 'Unknown error'}). Falling back to MOCK_API_DATA.`);
    allStationsData = MOCK_API_DATA;
    dataSource = {
      isLive: false,
      message: "Data Source: Mock Data (API Failed)",
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }

  const trains: Record<string, Train> = {}; // Master list of all active trains

  // Pass 1: Collate all reports for every train
  for (const stationName in allStationsData) {
    if (!STATION_ORDER.includes(stationName)) continue;

    const trainReports = allStationsData[stationName];

    for (const trainDestId in trainReports) {
      const [destination, id] = trainDestId.split('-');
      if (!id || !destination) continue;

      if (!trains[id]) {
        trains[id] = {
          id: id,
          destination: destination.replace("_", " "),
          reports: []
        };
      }

      const timeStr = Array.isArray(trainReports[trainDestId])
        ? trainReports[trainDestId][0]
        : trainReports[trainDestId];

      const timeMin = parseTime(timeStr as string);

      trains[id].reports.push({
        station: stationName,
        time: timeMin
      });
    }
  }

  // Pass 2: Calculate the best (most likely) location for each train
  const trainLocations: TrainWithLocation[] = [];
  for (const id in trains) {
    const train = trains[id];
    if (train.reports.length === 0) continue;

    const bestReport = train.reports.reduce((prev, curr) =>
      (prev.time < curr.time) ? prev : curr
    );

    const location = calculateTrainLocation(train, bestReport);
    if (location) {
      trainLocations.push({ ...train, location });
    }
  }

  return { trains: trainLocations, dataSource };
}

/**
 * Calculates a train's location based on its best report.
 */
export function calculateTrainLocation(train: Train, bestReport: TrainReport): TrainLocation | null {
  // Complex logic to hide departing trains from terminals
  const stationNameUpper = bestReport.station.toUpperCase();
  const destinationUpper = train.destination.toUpperCase();

  // Check if the train's BEST report (closest station) is a terminal
  if (TERMINAL_STATIONS.includes(stationNameUpper)) {
    // Case 1: The train's destination *IS* this terminal - arriving train, always show
    if (destinationUpper.includes(stationNameUpper)) {
      // Do nothing, proceed to location calculation
    }
    // Case 2: Terminal is BOULOGNE, destination is NOT Boulogne
    else if (stationNameUpper === "BOULOGNE SUR MER") {
      const isToRetiro = destinationUpper.includes("RETIRO");
      const allReports = train.reports || [];

      if (isToRetiro) {
        const hasVillaAdelinaReport = allReports.some(report => report.station === "Villa Adelina");
        const travelTime = ESTIMATED_TRAVEL_TIMES["Boulogne Sur Mer-Villa Adelina"]; // 4 min

        if (hasVillaAdelinaReport) {
          // Train is definitely approaching. SHOW.
        } else if (bestReport.time > travelTime) {
          console.log(`HIDING TRAIN ${train.id}: Departing from Boulogne to Retiro`);
          return null; // HIDE
        }
      } else {
        // Going to Villa Rosa / Grand Bourg
        const hasAMontesReport = allReports.some(report => report.station === "A. Montes");
        const travelTime = ESTIMATED_TRAVEL_TIMES["A. Montes-Boulogne Sur Mer"]; // 7 min

        if (hasAMontesReport) {
          // Train is definitely approaching. SHOW.
        } else if (bestReport.time > travelTime) {
          console.log(`HIDING TRAIN ${train.id}: Departing from Boulogne to V.Rosa/G.Bourg`);
          return null; // HIDE
        }
      }
    }
    // Case 3: Terminal is GRAND BOURG, destination is NOT Grand Bourg
    else if (stationNameUpper === "GRAND BOURG") {
      const isToRetiro = destinationUpper.includes("RETIRO");
      const allReports = train.reports || [];

      if (isToRetiro) {
        const hasTierrasAltasReport = allReports.some(report => report.station === "Tierras Altas");
        const travelTime = ESTIMATED_TRAVEL_TIMES["Grand Bourg-Tierras Altas"]; // 4 min

        if (hasTierrasAltasReport) {
          // Train is definitely approaching. SHOW.
        } else if (bestReport.time > travelTime) {
          console.log(`HIDING TRAIN ${train.id}: Departing from Grand Bourg to Retiro`);
          return null; // HIDE
        }
      } else {
        // Going to Villa Rosa
        const hasPabloNoguesReport = allReports.some(report => report.station === "Pablo Nogues");
        const travelTime = ESTIMATED_TRAVEL_TIMES["Grand Bourg-Pablo Nogues"]; // 4 min

        if (hasPabloNoguesReport) {
          // Train is definitely approaching. SHOW.
        } else if (bestReport.time > travelTime) {
          console.log(`HIDING TRAIN ${train.id}: Departing from Grand Bourg to V.Rosa`);
          return null; // HIDE
        }
      }
    }
    // Case 4: Terminal is RETIRO or VILLA ROSA, destination is NOT this terminal
    else {
      console.log(`HIDING TRAIN ${train.id}: Departing from simple terminal`);
      return null; // Hide this departing/passing train
    }
  }

  // Case 1: Train is AT a station
  if (bestReport.time === 0) {
    return {
      type: 'station',
      at: bestReport.station,
      description: `En Estación ${bestReport.station}`
    };
  }

  // Case 2: Train is BETWEEN stations
  const toStation = bestReport.station;
  const toStationIndex = STATION_ORDER.indexOf(toStation);
  if (toStationIndex === -1) return null;

  const isToRetiro = train.destination.toUpperCase().includes("RETIRO");
  const fromStationIndex = isToRetiro ? (toStationIndex + 1) : (toStationIndex - 1);

  // Check if train is approaching a terminal station
  if (fromStationIndex < 0 || fromStationIndex >= STATION_ORDER.length) {
    return {
      type: 'approaching_terminal',
      at: toStation,
      description: `Próximo a ${toStation} (${bestReport.time} min)`
    };
  }

  const fromStation = STATION_ORDER[fromStationIndex];

  // Get estimated travel time for this track segment
  const key = [fromStation, toStation].sort().join('-');
  const segmentTime = ESTIMATED_TRAVEL_TIMES[key] || 5; // Default 5 min

  let timeFromStart = segmentTime - bestReport.time;
  if (timeFromStart < 0) timeFromStart = 0.05; // Show it just left the station

  let percent = (timeFromStart / segmentTime) * 100;
  if (percent > 100) percent = 100;
  if (percent < 0) percent = 0;

  return {
    type: 'between',
    from: fromStation,
    to: toStation,
    percent: percent, // % of travel *from* fromStation *to* toStation
    description: `Entre ${fromStation} y ${toStation}`
  };
}

/**
 * Calculates the final CSS `left` percentage for a train's location.
 */
export function getTrainPositionPercent(location: TrainLocation): number {
  const stationCount = STATION_ORDER.length;
  const getStationPct = (stationName: string): number => {
    const index = STATION_ORDER.indexOf(stationName);
    if (index === -1) return -999;
    return (index / (stationCount - 1)) * 100;
  };

  if (location.type === 'station') {
    return getStationPct(location.at!);
  }

  if (location.type === 'approaching_terminal') {
    const MAX_APPROACH_MINUTES = 15.0;
    const MAX_APPROACH_OFFSET_PCT = 3.0; // Max 3% visual offset

    const toStationPct = getStationPct(location.at!);
    if (toStationPct === -999) return -999;

    const toStationIndex = STATION_ORDER.indexOf(location.at!);

    const time = Math.max(1, Math.min(parseInt(location.description.match(/\d+/)?.[0] || '1', 10), MAX_APPROACH_MINUTES));
    const offset = (time / MAX_APPROACH_MINUTES) * MAX_APPROACH_OFFSET_PCT;

    if (toStationIndex === 0) { // Approaching Retiro
      return toStationPct + offset; // Offset to the right
    } else { // Approaching Villa Rosa
      return toStationPct - offset; // Offset to the left
    }
  }

  if (location.type === 'between') {
    const fromPct = getStationPct(location.from!);
    const toPct = getStationPct(location.to!);
    if (fromPct === -999 || toPct === -999) return -999;

    const totalDistPct = toPct - fromPct;
    // This is the calculation for interpolation
    return fromPct + (totalDistPct * (location.percent! / 100));
  }

  return -999; // Should not happen
}