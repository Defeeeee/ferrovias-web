// --- IMPORTS ---
import {
    STATION_ORDER,
    ESTIMATED_TRAVEL_TIMES,
    MOCK_API_DATA,
    TERMINAL_STATIONS
} from './config.js';

// --- 3. Core Functions ---

/**
 * Parses the time string from the API. Returns time in minutes.
 * This is a local helper function, not exported.
 */
function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return 999;
    const lowerTime = timeStr.toLowerCase();

    if (lowerTime === "en estacion") return 0;
    if (lowerTime === "proximo") return 1; // "Proximo" is ~1 minute

    const minutes = parseInt(lowerTime.match(/\d+/)?.[0] || '999', 10);
    return isNaN(minutes) ? 999 : minutes;
}

/**
 * Draws the station stops and labels on the track.
 */
export function initMap(trackElement) {
    trackElement.innerHTML = ''; // Clear existing stations
    const stationCount = STATION_ORDER.length;

    STATION_ORDER.forEach((stationName, index) => {
        const percent = (index / (stationCount - 1)) * 100;

        const stop = document.createElement('div');
        stop.className = 'station-stop';
        stop.style.left = `${percent}%`;

        const label = document.createElement('div');
        label.className = 'station-label';
        label.textContent = stationName;

        // *** NEW: Alternating label logic ***
        if (index % 2 === 0) { // Even stations go below
            label.classList.add('label-below');
        } else { // Odd stations go above
            label.classList.add('label-above');
        }

        // Override for first and last to ensure they are on the map
        if (index === 0) {
            label.className = 'station-label label-below'; // Force below
            label.style.transform = 'translateX(0)'; // Align left
            label.style.left = '0';
        } else if (index === stationCount - 1) {
            label.className = 'station-label label-below'; // Force below
            label.style.transform = 'translateX(-100%)'; // Align right
            label.style.left = '100%';
        }

        stop.appendChild(label);
        trackElement.appendChild(stop);
    });
}

/**
 * Fetches and processes the API data into a clean "trains" object.
 */
export async function getProcessedTrainData(dataSourceEl, errorOverlay, errorMessageEl) {
    let allStationsData;

    try {
        // --- TRY LIVE API ---
        // NOTE: To use MOCK DATA, uncomment the line "throw new Error('Using mock data');"
        // -----------------------------------------------------------------

        // throw new Error('Using mock data'); // <-- UNCOMMENT THIS LINE TO FORCE MOCK DATA

        const response = await fetch('https://ferrovias.fdiaznem.com.ar/stations/all/status');
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}. Is the server running?`);
        }
        allStationsData = await response.json();
        console.log("Using LIVE API data.");
        dataSourceEl.textContent = "Data Source: Live API";
        errorOverlay.style.display = 'none';

    } catch (err) {
        // --- FALLBACK TO MOCK DATA ---
        console.warn(`Live API failed (${err.message}). Falling back to MOCK_API_DATA.`);
        allStationsData = MOCK_API_DATA;
        dataSourceEl.textContent = "Data Source: Mock Data (API Failed)";
        errorMessageEl.textContent = `Details: ${err.message}`;
        errorOverlay.style.display = 'flex';
    }

    let trains = {}; // Master list of all active trains

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

            const timeMin = parseTime(timeStr);

            trains[id].reports.push({
                station: stationName,
                time: timeMin
            });
        }
    }

    // Pass 2: Calculate the best (most likely) location for each train
    let trainLocations = [];
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
    return trainLocations;
}

/**
 * Calculates a train's location based on its best report.
 * Returns an object with { type, at, from, to, percent, description }
 */
export function calculateTrainLocation(train, bestReport) {

    // --- NEW LOGIC TO HIDE DEPARTING TRAINS ---
    const stationNameUpper = bestReport.station.toUpperCase();
    const destinationUpper = train.destination.toUpperCase();

    // Check if the train's BEST report (closest station) is a terminal.
    if (TERMINAL_STATIONS.includes(stationNameUpper)) {

        // Case 1: The train's destination *IS* this terminal.
        // This is an arriving train. Always show it.
        if (destinationUpper.includes(stationNameUpper)) {
            // Do nothing, proceed to location calculation.
        }

        // Case 2: The terminal is BOULOGNE, and the destination is *NOT* Boulogne.
        else if (stationNameUpper === "BOULOGNE SUR MER") {
            const isToRetiro = destinationUpper.includes("RETIRO");
            const allReports = train.reports || []; // Get all reports for this train

            if (isToRetiro) {
                // Check for a "Villa Adelina" report (coming from)
                const hasVillaAdelinaReport = allReports.some(report => report.station === "Villa Adelina");
                const travelTime = ESTIMATED_TRAVEL_TIMES["Boulogne Sur Mer-Villa Adelina"]; // 4 min

                if (hasVillaAdelinaReport) {
                    // Train is definitely approaching. SHOW.
                } else if (bestReport.time > travelTime) {
                    // No report from Villa Adelina AND time is > travel time.
                    // This train must have *started* at Boulogne.
                    console.log(`HIDING TRAIN ${train.id}: 
- At terminal: ${bestReport.station} (Time: ${bestReport.time} min)
- Destination: ${train.destination}
- Reason: Best report at Boulogne (to Retiro), no report from Villa Adelina, and time is > ${travelTime} min.`);
                    return null; // HIDE
                }
                // Else (no V.A. report, but time <= travelTime): SHOW

            } else {
                // Going to Villa Rosa / Grand Bourg
                const hasAMontesReport = allReports.some(report => report.station === "A. Montes");
                const travelTime = ESTIMATED_TRAVEL_TIMES["A. Montes-Boulogne Sur Mer"]; // 7 min

                if (hasAMontesReport) {
                    // Train is definitely approaching. SHOW.
                } else if (bestReport.time > travelTime) {
                    // No report from A. Montes AND time is > travel time.
                    // This train must have *started* at Boulogne.
                    console.log(`HIDING TRAIN ${train.id}: 
- At terminal: ${bestReport.station} (Time: ${bestReport.time} min)
- Destination: ${train.destination}
- Reason: Best report at Boulogne (to V.Rosa/G.Bourg), no report from A. Montes, and time is > ${travelTime} min.`);
                    return null; // HIDE
                }
                // Else (no A.M. report, but time <= travelTime): SHOW
            }
        }

        // Case 3: The terminal is GRAND BOURG, and the destination is *NOT* Grand Bourg.
        else if (stationNameUpper === "GRAND BOURG") {
            const isToRetiro = destinationUpper.includes("RETIRO");
            const allReports = train.reports || []; // Get all reports for this train

            if (isToRetiro) {
                // Check for a "Tierras Altas" report (coming from)
                const hasTierrasAltasReport = allReports.some(report => report.station === "Tierras Altas");
                const travelTime = ESTIMATED_TRAVEL_TIMES["Grand Bourg-Tierras Altas"]; // 4 min

                if (hasTierrasAltasReport) {
                    // Train is definitely approaching. SHOW.
                } else if (bestReport.time > travelTime) {
                    // No report from Tierras Altas AND time is > travel time.
                    // This train must have *started* at Grand Bourg.
                    console.log(`HIDING TRAIN ${train.id}: 
- At terminal: ${bestReport.station} (Time: ${bestReport.time} min)
- Destination: ${train.destination}
- Reason: Best report at Grand Bourg (to Retiro), no report from Tierras Altas, and time is > ${travelTime} min.`);
                    return null; // HIDE
                }
                // Else (no T.A. report, but time <= travelTime): SHOW

            } else {
                // Going to Villa Rosa
                const hasPabloNoguesReport = allReports.some(report => report.station === "Pablo Nogues");
                const travelTime = ESTIMATED_TRAVEL_TIMES["Grand Bourg-Pablo Nogues"]; // 4 min

                if (hasPabloNoguesReport) {
                    // Train is definitely approaching. SHOW.
                } else if (bestReport.time > travelTime) {
                    // No report from Pablo Nogues AND time is > travel time.
                    // This train must have *started* at Grand Bourg.
                    console.log(`HIDING TRAIN ${train.id}: 
- At terminal: ${bestReport.station} (Time: ${bestReport.time} min)
- Destination: ${train.destination}
- Reason: Best report at Grand Bourg (to V.Rosa), no report from Pablo Nogues, and time is > ${travelTime} min.`);
                    return null; // HIDE
                }
                // Else (no P.N. report, but time <= travelTime): SHOW
            }
        }

        // Case 4: The terminal is RETIRO or VILLA ROSA, and the destination is *NOT* this terminal.
        // This is the simple old rule.
        else {
            console.log(`HIDING TRAIN ${train.id}: 
- At terminal: ${bestReport.station} (Time: ${bestReport.time} min)
- Destination: ${train.destination}
- Reason: Best report is at a simple terminal (Retiro/V.Rosa), but its destination is different.`);
            return null; // Hide this departing/passing train
        }
    }
    // --- END NEW LOGIC ---

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
export function getTrainPositionPercent(location) {
    const stationCount = STATION_ORDER.length;
    const getStationPct = (stationName) => {
        const index = STATION_ORDER.indexOf(stationName);
        if (index === -1) return -999;
        return (index / (stationCount - 1)) * 100;
    };

    if (location.type === 'station') {
        return getStationPct(location.at);
    }

    if (location.type === 'approaching_terminal') {
        const MAX_APPROACH_MINUTES = 15.0;
        const MAX_APPROACH_OFFSET_PCT = 3.0; // Max 3% visual offset

        const toStationPct = getStationPct(location.at);
        if (toStationPct === -999) return -999;

        const toStationIndex = STATION_ORDER.indexOf(location.at);

        const time = Math.max(1, Math.min(parseInt(location.description.match(/\d+/)?.[0] || 1, 10), MAX_APPROACH_MINUTES));
        const offset = (time / MAX_APPROACH_MINUTES) * MAX_APPROACH_OFFSET_PCT;

        if (toStationIndex === 0) { // Approaching Retiro
            return toStationPct + offset; // Offset to the right
        } else { // Approaching Villa Rosa
            return toStationPct - offset; // Offset to the left
        }
    }

    if (location.type === 'between') {
        const fromPct = getStationPct(location.from);
        const toPct = getStationPct(location.to);
        if (fromPct === -999 || toPct === -999) return -999;

        const totalDistPct = toPct - fromPct;
        // This is the calculation for interpolation
        return fromPct + (totalDistPct * (location.percent / 100));
    }

    return -999; // Should not happen
}

/**
 * Draws all trains on the map.
 */
export function updateMap(trains, trainLayerElement) {
    trainLayerElement.innerHTML = ''; // Clear old trains

    // A side-view train icon (Material Design 'tram')
    const trainIconSvg = `
        <svg class="train-icon" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 16.94V8.5c0-2.79-2.61-3.18-5.71-3.45C13.16 5.02 13 5 12.5 5h-1c-.66 0-1.16.02-1.29.05C7.11 5.32 4.5 5.71 4.5 8.5v8.44c-1.03.22-1.8.88-2.23 1.69c-.52 1.02-.34 2.37.44 3.14c.78.78 2.12.96 3.14.44c.82-.43 1.48-1.2 1.69-2.23h5.92c.22 1.03.88 1.8 1.69 2.23c1.02.52 2.37.34 3.14-.44c.78-.78.96-2.12.44-3.14c-.43-.81-1.2-1.47-2.23-1.69M6.5 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5m11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5M17 15H7V9h10v6Z"/>
        </svg>
    `;

    trains.forEach(train => {
        const posPercent = getTrainPositionPercent(train.location);
        if (posPercent === -999) return; // Skip invalid trains

        const trainEl = document.createElement('div');
        trainEl.className = 'train';
        trainEl.style.left = `${posPercent}%`;

        // Determine base direction class
        const isToRetiro = train.destination.toUpperCase().includes("RETIRO");
        const baseDirectionClass = isToRetiro ? 'dir-retiro' : 'dir-villarosa';
        trainEl.classList.add(baseDirectionClass);

        // Apply destination-specific classes
        const normalizedDestination = train.destination.toUpperCase();
        if (normalizedDestination.includes("BOULOGNE SUR MER")) {
            trainEl.classList.add('dir-boulogne');
        } else if (normalizedDestination.includes("GRAND BOURG")) {
            // Grand Bourg only goes Villa Rosa direction, but we added both styles for robustness
            trainEl.classList.add('dir-grandbourg');
        }
        // If no specific destination matches, it will retain the baseDirectionClass (retiro/villarosa)

        // Set icon
        trainEl.innerHTML = `
            ${trainIconSvg}
            <div class="train-tooltip">
                <strong>Tren ${train.id} (a ${train.destination})</strong>
                <br>
                ${train.location.description}
            </div>
        `;

        trainLayerElement.appendChild(trainEl);
    });
}
