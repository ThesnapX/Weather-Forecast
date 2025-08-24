// DOM
const apiKey = "6af26930f9c31a0b48cf508d0d01ab89";
const weatherApiKey = "7be7d2db88394ba9b1b71502252108";
const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const headerEl = document.querySelector("header");
const weatherMain = document.querySelector(".weather-main");
const error404 = document.querySelector(".error-404");
const searchCityMsg = document.querySelector(".search-city-message");
const cityName = document.querySelector(".city-name");
const currentDate = document.querySelector(".current-date");
const weatherDegreeText = document.querySelector(".weather-degree-text");
const weatherDegreeStats = document.querySelector(".weather-degree-stats");
const humidityStatstextText = document.querySelector(".humidity-stats-text");
const windStatstext = document.querySelector(".wind-stats-text");
const weatherIconImage = document.querySelector(".weather-icon-img");
const forecastWrapper = document.querySelector(".weather-forecast-wrapper");
let toggleBtn = document.querySelector(".unit-toggle");

let isCelsius = true; // current unit state
let latestWeatherData = null; // cache for current weather
let latestForecastData = null; // cache for forecast

// --- helpers for toggle button text ---
function setToggleText() {
  // If we are currently showing °C, offer to "Show °F", and vice-versa
  toggleBtn.textContent = isCelsius ? "Show °F" : "Show °C";
}

// Search Button Clicked
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    updateForecastData(cityInput.value.trim());
    cityInput.value = "";
  }
  if (document.activeElement && headerEl.contains(document.activeElement)) {
    document.activeElement.blur();
  }
});

// Keydown Enter
cityInput.addEventListener("keydown", (event) => {
  if (event.key == "Enter" && cityInput.value.trim() !== "") {
    updateWeatherInfo(cityInput.value.trim());
    updateForecastData(cityInput.value.trim());
    cityInput.value = "";
    if (document.activeElement && headerEl.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }
});

// Weather Fetching & DOM Manuipilation
async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.weatherapi.com/v1/${endPoint}.json?key=${weatherApiKey}&q=${city}&aqi=no&days=8`;
  const response = await fetch(apiUrl);
  const rawConvert = await response.json();
  return rawConvert;
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData("current", city);
  if (weatherData.error) {
    showDisplaySection(error404);
    return;
  } else {
    showDisplaySection(weatherMain);
  }

  latestWeatherData = weatherData; // cache latest for toggle
  renderCurrentWeather(); // draw with current unit
}

function renderCurrentWeather() {
  if (!latestWeatherData) return;

  const {
    current: {
      temp_c,
      temp_f,
      humidity,
      wind_kph,
      condition: { text, code },
    },
    location: { name },
  } = latestWeatherData;

  cityName.textContent = name;
  humidityStatstextText.textContent = humidity + "%";
  windStatstext.textContent = wind_kph + "km/h";
  weatherDegreeStats.textContent = text;
  weatherIconImage.setAttribute("src", `./assets/weather/${showIcon(code)}`);
  currentDate.textContent = getCurrentDate();

  // Set temperature based on unit
  weatherDegreeText.textContent = isCelsius
    ? Math.round(temp_c) + "°C"
    : Math.round(temp_f) + "°F";

  setToggleText(); // keep button label in sync
}

function showDisplaySection(activeSection) {
  [weatherMain, error404, searchCityMsg].forEach((section) =>
    section.classList.add("not-active")
  );
  activeSection.classList.remove("not-active");
}

// Weather Icon
function showIcon(code) {
  if ([1087, 1273, 1276, 1279, 1282].includes(code)) return "thunderstorm.svg";
  if ([1150, 1153, 1168, 1171].includes(code)) return "drizzle.svg";
  if (
    [1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(code)
  )
    return "rain.svg";
  if (
    [
      1066, 1069, 1072, 1114, 1117, 1210, 1213, 1216, 1219, 1222, 1225, 1255,
      1258, 1261, 1264,
    ].includes(code)
  )
    return "snow.svg";
  if (
    [
      1030, 1135, 1147, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192,
      1195, 1198, 1201, 1204, 1207, 1249, 1252,
    ].includes(code)
  )
    return "atmosphere.svg";
  if (code === 1000) return "clear.svg";
  if ([1003, 1006, 1009].includes(code)) return "clouds.svg";
  return "atmosphere.svg";
}

// Date
function getCurrentDate() {
  const currentDate = new Date();
  const options = { weekday: "short", day: "2-digit", month: "short" };
  return currentDate.toLocaleDateString("en-IN", options);
}

// Forecast
async function updateForecastData(city) {
  const weatherData = await getFetchData("forecast", city);
  latestForecastData = weatherData; // cache latest for toggle
  renderForecast();
}

function renderForecast() {
  if (!latestForecastData) return;

  let foreCastAccess = latestForecastData.forecast.forecastday;
  const today = new Date().toISOString().split("T")[0];
  foreCastAccess = foreCastAccess.filter((day) => day.date !== today);

  forecastWrapper.innerHTML = "";

  foreCastAccess.forEach((day) => {
    const noonForecast = day.hour.find((hour) => hour.time.endsWith("12:00"));
    if (noonForecast) {
      const forecastEl = document.createElement("div");
      forecastEl.classList.add("forecast");

      const dateObj = new Date(day.date);
      const options = { month: "short", day: "numeric" };
      const formattedDate = dateObj.toLocaleDateString("en-IN", options);

      const tempText = isCelsius
        ? Math.round(noonForecast.temp_c) + " °C"
        : Math.round(noonForecast.temp_f) + " °F";

      forecastEl.innerHTML = `
        <p>${formattedDate}</p>
        <img src="./assets/weather/${showIcon(noonForecast.condition.code)}" />
        <p>${tempText}</p>
      `;
      forecastWrapper.appendChild(forecastEl);
    }
  });
}

// Toggle Button Click
toggleBtn.addEventListener("click", () => {
  isCelsius = !isCelsius; // flip unit
  setToggleText(); // update button label
  renderCurrentWeather(); // redraw current temp in chosen unit
  renderForecast(); // redraw forecast temps in chosen unit
});

// set initial label on load
setToggleText();
