/* ========================================
   Maharashtra Weather Hub - JavaScript
   Uses Open-Meteo API (No API Key Required)
   ======================================== */

// City coordinates mapping for Maharashtra
const CITIES = {
    mumbai: {
        name: "Mumbai",
        latitude: 19.0760,
        longitude: 72.8777
    },
    pune: {
        name: "Pune",
        latitude: 18.5204,
        longitude: 73.8567
    },
    nagpur: {
        name: "Nagpur",
        latitude: 21.1458,
        longitude: 79.0882
    },
    nashik: {
        name: "Nashik",
        latitude: 19.9975,
        longitude: 74.1860
    },
    aurangabad: {
        name: "Aurangabad",
        latitude: 19.8762,
        longitude: 75.3433
    },
    kolhapur: {
        name: "Kolhapur",
        latitude: 16.7050,
        longitude: 74.2314
    },
    solapur: {
        name: "Solapur",
        latitude: 17.6599,
        longitude: 75.9064
    },
    sangli: {
        name: "Sangli",
        latitude: 16.8538,
        longitude: 74.5854
    },
    satara: {
        name: "Satara",
        latitude: 17.6745,
        longitude: 73.9850
    },
    ahmednagar: {
        name: "Ahmednagar",
        latitude: 19.0950,
        longitude: 74.7421
    },
    jalna: {
        name: "Jalna",
        latitude: 19.8480,
        longitude: 75.8809
    },
    parbhani: {
        name: "Parbhani",
        latitude: 19.2683,
        longitude: 76.7597
    },
    beed: {
        name: "Beed",
        latitude: 18.9981,
        longitude: 76.4719
    },
    latur: {
        name: "Latur",
        latitude: 18.4088,
        longitude: 76.5246
    },
    washim: {
        name: "Washim",
        latitude: 20.1063,
        longitude: 76.9219
    },
    buldhana: {
        name: "Buldhana",
        latitude: 20.5229,
        longitude: 76.1795
    },
    akola: {
        name: "Akola",
        latitude: 20.7136,
        longitude: 77.0169
    },
    amravati: {
        name: "Amravati",
        latitude: 20.8449,
        longitude: 77.7540
    },
    yavatmal: {
        name: "Yavatmal",
        latitude: 20.4183,
        longitude: 78.1354
    },
    wardha: {
        name: "Wardha",
        latitude: 20.7465,
        longitude: 78.6033
    },
    chandrapur: {
        name: "Chandrapur",
        latitude: 19.2783,
        longitude: 79.3068
    },
    gondia: {
        name: "Gondia",
        latitude: 21.4447,
        longitude: 80.1854
    },
    nanded: {
        name: "Nanded",
        latitude: 19.1610,
        longitude: 77.3268
    },
    ratnagiri: {
        name: "Ratnagiri",
        latitude: 16.9891,
        longitude: 73.2993
    },
    thane: {
        name: "Thane",
        latitude: 19.2183,
        longitude: 72.9781
    }
};

// WMO Weather Code Mapping for display
const WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Heavy Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Heavy Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail"
};

// DOM Elements
const citySelect = document.getElementById("citySelect");
const fetchBtn = document.getElementById("fetchBtn");
const weatherCard = document.getElementById("weatherCard");
const errorMessage = document.getElementById("errorMessage");
const loadingSpinner = document.getElementById("loadingSpinner");

const forecastContainer = document.getElementById("forecastContainer");

// Event Listeners
fetchBtn.addEventListener("click", handleFetchWeather);
citySelect.addEventListener("change", resetUI);

/* ========================================
   Event Handlers
   ======================================== */

/**
 * Handle Fetch Weather Button Click
 * Validates selection and triggers weather fetch
 */
function handleFetchWeather() {
    const selectedCity = citySelect.value;

    // Validation: Ensure a city is selected
    if (!selectedCity) {
        showError("Please select a city first!");
        return;
    }

    // Fetch weather data for selected city
    fetchWeatherData(selectedCity);
}

/**
 * Reset UI - Clear displays when city selection changes
 */
function resetUI() {
    hideError();
    hideWeatherCard();
}

/* ========================================
   Main Weather Fetching Function (Async)
   ======================================== */

/**
 * Async function to fetch weather data from Open-Meteo API
 * @param {string} cityKey - The key of the selected city
 */
async function fetchWeatherData(cityKey) {
    const city = CITIES[cityKey];

    // Show loading spinner
    showLoadingSpinner();
    hideError();
    hideWeatherCard();
    clearForecast();

    try {
        // Build API URL with coordinates for current weather and 7-day forecast
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&timezone=auto&past_days=2&forecast_days=7`;

        // Fetch data from API
        const response = await fetch(apiUrl);

        // Check if response is successful
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Parse JSON response
        const data = await response.json();

        // Validate and extract data
        if (data.current && data.daily) {
            displayWeather(city.name, data.current);
            displayForecast(data.daily);
        } else {
            throw new Error("Invalid API response structure");
        }

    } catch (error) {
        // Handle any fetch errors
        console.error("Weather Fetch Error:", error);
        showError(`❌ Connection Error: ${error.message}. Please check your internet connection and try again.`);

    } finally {
        // Hide loading spinner
        hideLoadingSpinner();
    }
}

/* ========================================
   Data Display Functions
   ======================================== */

/**
 * Display weather data on the UI
 * @param {string} cityName - Name of the city
 * @param {object} currentData - Current weather data from API
 */
function displayWeather(cityName, currentData) {
    // Extract data from API response
    const temperature = currentData.temperature_2m;
    const windSpeed = currentData.wind_speed_10m;
    const weatherCode = currentData.weather_code;
    const weatherCondition = WEATHER_CODES[weatherCode] || "Unknown";
    const time = currentData.time;

    // Update DOM elements
    document.getElementById("cityName").textContent = cityName;
    document.getElementById("temperature").textContent = `${Math.round(temperature)}°C`;
    document.getElementById("windSpeed").textContent = `${Math.round(windSpeed)} km/h`;
    document.getElementById("condition").textContent = weatherCondition;
    document.getElementById("lastUpdate").textContent = `Updated: ${formatTime(time)}`;

    // Show weather card
    showWeatherCard();
}

/**
 * Display 7-day forecast data on the UI
 * @param {object} dailyData - Daily forecast data from API
 */
function displayForecast(dailyData) {
    const dates = dailyData.time;
    const tempMax = dailyData.temperature_2m_max;
    const tempMin = dailyData.temperature_2m_min;
    const weatherCodes = dailyData.weather_code;
    const precipitation = dailyData.precipitation_sum;

    // Clear previous forecast
    forecastContainer.innerHTML = "";

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Display 7 days
    dates.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        const dayName = date.toLocaleDateString("en-IN", { weekday: "short" });
        const formattedDate = date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        
        // Determine if it's past, today, or future
        let badgeClass = "future";
        let badgeText = "Forecast";
        if (dateStr < today) {
            badgeClass = "past";
            badgeText = "Past";
        } else if (dateStr === today) {
            badgeClass = "today";
            badgeText = "Today";
        }

        const weatherCondition = WEATHER_CODES[weatherCodes[index]] || "Unknown";

        // Create forecast card
        const forecastCard = document.createElement("div");
        forecastCard.className = "forecast-day";
        forecastCard.innerHTML = `
            <div class="forecast-date-badge ${badgeClass}">${badgeText}</div>
            <div class="forecast-day-name">${dayName}</div>
            <div class="forecast-date">${formattedDate}</div>
            <div class="forecast-condition">${weatherCondition}</div>
            <div class="forecast-temp">
                <span class="forecast-temp-max">${Math.round(tempMax[index])}°</span>
                <span class="forecast-temp-min">${Math.round(tempMin[index])}°</span>
            </div>
            <div class="forecast-detail">
                <span class="forecast-detail-label">Rainfall</span>
                <span class="forecast-detail-value">${Math.round(precipitation[index] * 10) / 10} mm</span>
            </div>
        `;

        forecastContainer.appendChild(forecastCard);
    });
}

/**
 * Format time string to readable format
 * @param {string} timeString - Time string from API (format: YYYY-MM-DD HH:MM)
 * @returns {string} - Formatted time (HH:MM:SS)
 */
function formatTime(timeString) {
    try {
        const date = new Date(timeString);
        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    } catch {
        return timeString;
    }
}

/* ========================================
   UI Control Functions
   ======================================== */

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add("hidden");
}

/**
 * Display weather card
 */
function showWeatherCard() {
    weatherCard.classList.remove("hidden");
}

/**
 * Hide weather card
 */
function hideWeatherCard() {
    weatherCard.classList.add("hidden");
}

/**
 * Clear forecast display
 */
function clearForecast() {
    forecastContainer.innerHTML = "";
}

/**
 * Display loading spinner
 */
function showLoadingSpinner() {
    loadingSpinner.classList.remove("hidden");
}

/**
 * Hide loading spinner
 */
function hideLoadingSpinner() {
    loadingSpinner.classList.add("hidden");
}

/* ========================================
   Initialization
   ======================================== */

// Hide all displays on page load
document.addEventListener("DOMContentLoaded", function () {
    hideError();
    hideWeatherCard();
    hideLoadingSpinner();
});
