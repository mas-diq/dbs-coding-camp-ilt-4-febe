// API key is loaded directly from config.js
// const API_KEY is already defined in config.js

// Base URLs for OpenWeatherMap API
const CURRENT_WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherElement = document.getElementById('currentWeather');
const apiResultElement = document.getElementById('apiResult');
const forecastElement = document.getElementById('forecast');

// Function to format JSON for display
function formatJSON(json) {
    return JSON.stringify(json, null, 2);
}

// Convert temperature from Kelvin to Celsius
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Format date from timestamp
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    });
}

// Format time from timestamp
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get weather icon URL
function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Display current weather data
function displayCurrentWeather(data) {
    if (!data) return;

    const temp = kelvinToCelsius(data.main.temp);
    const feelsLike = kelvinToCelsius(data.main.feels_like);
    const iconUrl = getWeatherIconUrl(data.weather[0].icon);
    const weatherDescription = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h
    const sunriseTime = formatTime(data.sys.sunrise);
    const sunsetTime = formatTime(data.sys.sunset);

    currentWeatherElement.innerHTML = `
        <div class="city-name">${data.name}, ${data.sys.country}</div>
        <div class="weather-main">
            <img src="${iconUrl}" alt="${weatherDescription}" class="weather-icon">
            <div class="temperature">${temp}°C</div>
            <div class="weather-description">${weatherDescription}</div>
            <div class="feels-like">Feels like: ${feelsLike}°C</div>
        </div>
        <div class="weather-details">
            <div class="detail">
                <i class="fas fa-tint"></i>
                <div>Humidity</div>
                <div>${humidity}%</div>
            </div>
            <div class="detail">
                <i class="fas fa-wind"></i>
                <div>Wind</div>
                <div>${windSpeed} km/h</div>
            </div>
            <div class="detail">
                <i class="fas fa-sun"></i>
                <div>Sunrise</div>
                <div>${sunriseTime}</div>
            </div>
            <div class="detail">
                <i class="fas fa-moon"></i>
                <div>Sunset</div>
                <div>${sunsetTime}</div>
            </div>
        </div>
    `;
}

// Process and display forecast data
function displayForecast(data) {
    if (!data || !data.list) return;

    forecastElement.innerHTML = '';

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Group forecast data by day (taking one forecast per day)
    const dailyForecasts = {};

    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        date.setHours(0, 0, 0, 0);  // Set to beginning of day for comparison

        // Skip today's forecasts as we already show current weather
        if (date.getTime() === today.getTime()) {
            return;
        }

        const dateStr = date.toDateString();

        // Only keep one forecast per day (preferably around noon)
        const forecastHour = new Date(forecast.dt * 1000).getHours();
        if (!dailyForecasts[dateStr] ||
            Math.abs(forecastHour - 12) < Math.abs(new Date(dailyForecasts[dateStr].dt * 1000).getHours() - 12)) {
            dailyForecasts[dateStr] = forecast;
        }
    });

    // Convert to array and limit to 5 days
    const forecasts = Object.values(dailyForecasts).slice(0, 5);

    forecasts.forEach(forecast => {
        const day = formatDate(forecast.dt);
        const temp = kelvinToCelsius(forecast.main.temp);
        const iconUrl = getWeatherIconUrl(forecast.weather[0].icon);
        const description = forecast.weather[0].description;

        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <div class="forecast-date">${day}</div>
            <img src="${iconUrl}" alt="${description}" class="forecast-icon">
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-description">${description}</div>
            <div class="forecast-details">
                <div><i class="fas fa-tint"></i> ${forecast.main.humidity}%</div>
                <div><i class="fas fa-wind"></i> ${Math.round(forecast.wind.speed * 3.6)} km/h</div>
            </div>
        `;

        forecastElement.appendChild(forecastCard);
    });
}

// Fetch current weather data
async function fetchCurrentWeather(city) {
    try {
        const url = `${CURRENT_WEATHER_API}?q=${city}&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        apiResultElement.textContent = formatJSON(data);
        displayCurrentWeather(data);
        return data;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        apiResultElement.textContent = `Error: ${error.message}`;
        currentWeatherElement.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error fetching weather data: ${error.message}</p>
                <p>Please check your API key in config.js and make sure it's valid.</p>
            </div>
        `;
        return null;
    }
}

// Fetch 5-day forecast data
async function fetchForecast(city) {
    try {
        const url = `${FORECAST_API}?q=${city}&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayForecast(data);
        return data;
    } catch (error) {
        console.error('Error fetching forecast:', error);
        forecastElement.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error fetching forecast data: ${error.message}</p>
            </div>
        `;
        return null;
    }
}

// Handle the search function
async function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        alert('Please enter a city name');
        return;
    }

    currentWeatherElement.innerHTML = '<p>Loading weather data...</p>';
    forecastElement.innerHTML = '<p>Loading forecast data...</p>';
    apiResultElement.textContent = 'Fetching data...';

    await fetchCurrentWeather(city);
    await fetchForecast(city);
}

// Add event listeners
searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Load weather for a default city when the page loads
document.addEventListener('DOMContentLoaded', function () {
    if (API_KEY && API_KEY !== "your_openweathermap_api_key_here") {
        cityInput.value = 'Jakarta';  // Default city
        handleSearch();
    } else {
        alert('Please set your API key in config.js file!');
    }
});