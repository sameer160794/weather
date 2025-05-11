const apiKey = "8f5e4df0d07a3f27f4b056d7d6650f4e";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const dropdownBtn = document.getElementById("dropdownBtn");
const dropdownMenu = document.getElementById("dropdownMenu");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city === "") return alert("Please enter a city name");
  getWeatherByCity(city);
});

function getWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayCurrentWeather(data);
      saveCityToHistory(city);
      getForecast(city);
    })
    .catch(err => alert(err.message));
}

function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error("Forecast not found");
      return res.json();
    })
    .then(data => displayForecast(data))
    .catch(err => console.error("Forecast error:", err));
}

function displayCurrentWeather(data) {
  document.getElementById("currentWeather").classList.remove("hidden");
  document.getElementById("cityName").innerText = data.name;
  document.getElementById("temperature").innerText = `Temp: ${data.main.temp}°C`;
  document.getElementById("humidity").innerText = `Humidity: ${data.main.humidity}%`;
  document.getElementById("wind").innerText = `Wind: ${data.wind.speed} m/s`;
  document.getElementById("description").innerText = data.weather[0].description;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

function displayForecast(data) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";
  forecastContainer.classList.remove("hidden");

  const filtered = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  filtered.forEach(day => {
    const div = document.createElement("div");
    div.className = "p-2 border rounded bg-blue-50";
    div.innerHTML = `
      <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" />
      <p>${day.main.temp}°C</p>
      <p>💨 ${day.wind.speed} m/s</p>
      <p>💧 ${day.main.humidity}%</p>
    `;
    forecastContainer.appendChild(div);
  });
}

function saveCityToHistory(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
    updateDropdown();
  }
}

function updateDropdown() {
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  dropdownMenu.innerHTML = "";
  if (cities.length === 0) {
    dropdownBtn.classList.add("hidden");
    return;
  }
  dropdownBtn.classList.remove("hidden");

  cities.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.className = "p-2 hover:bg-gray-100 cursor-pointer";
    li.addEventListener("click", () => getWeatherByCity(city));
    dropdownMenu.appendChild(li);
  });
}

dropdownBtn.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// Get weather by current location
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
      .then(res => {
        if (!res.ok) throw new Error("Location weather not found");
        return res.json();
      })
      .then(data => {
        displayCurrentWeather(data);
        getForecast(data.name);
      })
      .catch(err => console.warn("Error fetching current location weather:", err));
  },
  (error) => console.warn("Location access denied")
);

// Initialize dropdown on page load
updateDropdown();
