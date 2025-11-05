// --- 1. IMPORTS ---
import {
    initMap,
    getProcessedTrainData,
    updateMap
} from './mapLogic.js';

// --- 2. DOM Elements ---
const track = document.getElementById('track');
const trainLayer = document.getElementById('train-layer');
const lastUpdatedEl = document.getElementById('last-updated');
const dataSourceEl = document.getElementById('data-source');
const refreshButton = document.getElementById('refresh-button');
const errorOverlay = document.getElementById('error-overlay');
const errorMessageEl = document.getElementById('error-message');

/**
 * Main function to initialize map and fetch data.
 */
async function main() {
    // 1. Set loading state
    refreshButton.disabled = true;
    refreshButton.textContent = "Refreshing...";

    // 2. Fetch and process data
    try {
        // Pass the DOM elements the function needs to update
        const trains = await getProcessedTrainData(dataSourceEl, errorOverlay, errorMessageEl);

        // 3. Update the map with new data
        updateMap(trains, trainLayer);

        // 4. Update timestamp
        lastUpdatedEl.textContent = `Last Updated: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error("Critical error in main():", err);
        errorMessageEl.textContent = `A critical error occurred: ${err.message}. Please reload.`;
        errorOverlay.style.display = 'flex';
    } finally {
        // 5. Re-enable button
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh";
    }
}

// --- 4. Initial Run ---
refreshButton.addEventListener('click', main);
initMap(track); // Draw stations once
main(); // Fetch data and draw trains
