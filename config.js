// --- 1. CORE DATA (The "Map") ---

export const STATION_ORDER = [
    "Retiro", "Saldias", "Ciudad Universitaria", "A. del Valle", "Padilla",
    "Florida", "Munro", "Carapachay", "Villa Adelina", "Boulogne Sur Mer",
    "A. Montes", "Don Torcuato", "A. Sordeaux", "Villa de Mayo",
    "Los Polvorines", "Pablo Nogues", "Grand Bourg", "Tierras Altas",
    "Tortuguitas", "M. Alberti", "Del Viso", "Cecilia Grierson", "Villa Rosa"
];

// *** UPDATED TRAVEL TIMES ***
export const ESTIMATED_TRAVEL_TIMES = {
    "Retiro-Saldias": 6,
    "Ciudad Universitaria-Saldias": 6,
    "A. del Valle-Ciudad Universitaria": 5,
    "A. del Valle-Padilla": 4,
    "Florida-Padilla": 3,
    "Florida-Munro": 3,
    "Carapachay-Munro": 3,
    "Carapachay-Villa Adelina": 3,
    "Boulogne Sur Mer-Villa Adelina": 4,
    "A. Montes-Boulogne Sur Mer": 7,
    "A. Montes-Don Torcuato": 4,
    "A. Sordeaux-Don Torcuato": 4,
    "A. Sordeaux-Villa de Mayo": 2,
    "Los Polvorines-Villa de Mayo": 3,
    "Los Polvorines-Pablo Nogues": 4,
    "Grand Bourg-Pablo Nogues": 4,
    "Grand Bourg-Tierras Altas": 4,
    "Tierras Altas-Tortuguitas": 4,
    "M. Alberti-Tortuguitas": 3,
    "Del Viso-M. Alberti": 4,
    "Cecilia Grierson-Del Viso": 4,
    "Cecilia Grierson-Villa Rosa": 6
};

// --- MOCK API DATA ---
export const MOCK_API_DATA = {
    "Retiro": { "VILLA ROSA-3081": ["En Estacion"], "VILLA ROSA-3083": ["47 min"], "RETIRO-3086": ["Proximo"] }, // 3081 HIDDEN, 3086 SHOWN
    "Saldias": { "VILLA ROSA-3081": ["28 min"], "VILLA ROSA-3083": ["43 min"], "RETIRO-3086": ["En Estacion"] }, // 3086 SHOWN
    "Ciudad Universitaria": { "VILLA ROSA-3081": ["25 min"], "VILLA ROSA-3083": ["40 min"], },
    "A. del Valle": { "RETIRO-3086": ["12 min"], "VILLA ROSA-3081": ["22 min"], },
    "Padilla": { "RETIRO-3086": ["7 min"], "RETIRO-3088": ["20 min"], "VILLA ROSA-3081": ["18 min"], },
    "Florida": { "RETIRO-3086": ["2 min"], "RETIRO-3088": ["15 min"], "VILLA ROSA-3D81": ["15 min"], "VILLA ROSA-3083": ["En Estacion"], },
    "Munro": { "RETIRO-3086": ["Proximo"], "RETIRO-3088": ["12 min"], "VILLA ROSA-3081": ["12 min"], },
    "Carapachay": { "RETIRO-3088": ["8 min"], "VILLA ROSA-3081": ["7 min"], },
    "Villa Adelina": { "RETIRO-3088": ["4 min"], "VILLA ROSA-3081": ["3 min"], },
    "Boulogne Sur Mer": { "RETIRO-3088": ["En Estacion"], "BOULOGNE SUR MER-3089": ["En Estacion"], "VILLA ROSA-3081": ["Proximo"], "RETIRO-3099": ["10 min"] }, // 3088 SHOWN (arriving, has V.Adelina report), 3089 SHOWN (terminating), 3081 SHOWN (approaching, time < 7 min), 3099 HIDDEN (departing, no V.Adelina report, time > 4)
    "Pablo Nogues": { "RETIRO-3090": ["En Estacion"], "GRAND BOURG-3091": ["8 min"], "VILLA ROSA-3097": ["3 min"] }, // 3091 HIDDEN
    "Tierras Altas": { "RETIRO-3094": ["2 min"] },
    "Grand Bourg": { "RETIRO-3092": ["10 min"], "GRAND BOURG-3091": ["En Estacion"], "VILLA ROSA-3098": ["9 min"], "VILLA ROSA-3097": ["En Estacion"], "RETIRO-3094": ["En Estacion"] }, // 3092 HIDDEN (departing to Retiro), 3091 SHOWN (terminating), 3098 HIDDEN (departing to V.Rosa), 3097 SHOWN (arriving to V.Rosa), 3094 SHOWN (arriving to Retiro)
    "Villa Rosa": { "RETIRO-3095": ["Proximo"], "VILLA ROSA-3093": ["En Estacion"] } // 3095 HIDDEN, 3093 SHOWN
};

// --- TERMINAL STATIONS ---
export const TERMINAL_STATIONS = ["RETIRO", "VILLA ROSA", "BOULOGNE SUR MER", "GRAND BOURG"];
