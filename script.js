const $ = (selector) => document.querySelector(selector);

// Mobile menu
const menuToggle = $("#menuToggle");
const nav = $("#nav");

menuToggle.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

// Clock
function updateClock() {
  const now = new Date();

  $("#clock").textContent = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  $("#date").textContent = now.toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

updateClock();
setInterval(updateClock, 1000);

// Browser / device information
function updateDeviceInfo() {
  $("#platform").textContent = navigator.platform || "Nieznana";
  $("#language").textContent = navigator.language || "Nieznany";
  $("#screenSize").textContent = `${window.innerWidth} × ${window.innerHeight}`;
  $("#onlineStatus").textContent = navigator.onLine ? "Tak" : "Nie";
}

updateDeviceInfo();
window.addEventListener("resize", updateDeviceInfo);
window.addEventListener("online", updateDeviceInfo);
window.addEventListener("offline", updateDeviceInfo);

// Weather using Open-Meteo + browser geolocation
const weatherCodes = {
  0: ["Bezchmurnie", "☀️"],
  1: ["Głównie bezchmurnie", "🌤️"],
  2: ["Częściowe zachmurzenie", "⛅"],
  3: ["Pochmurno", "☁️"],
  45: ["Mgła", "🌫️"],
  48: ["Mgła", "🌫️"],
  51: ["Lekka mżawka", "🌦️"],
  53: ["Mżawka", "🌦️"],
  55: ["Silna mżawka", "🌧️"],
  61: ["Lekki deszcz", "🌦️"],
  63: ["Deszcz", "🌧️"],
  65: ["Silny deszcz", "🌧️"],
  71: ["Lekki śnieg", "🌨️"],
  73: ["Śnieg", "🌨️"],
  75: ["Silny śnieg", "❄️"],
  80: ["Przelotny deszcz", "🌦️"],
  81: ["Przelotny deszcz", "🌧️"],
  82: ["Silny przelotny deszcz", "🌧️"],
  95: ["Burza", "⛈️"],
  96: ["Burza z gradem", "⛈️"],
  99: ["Burza z gradem", "⛈️"]
};

async function getWeather(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Błąd API pogody");

  return response.json();
}

function renderWeather(data) {
  const current = data.current;
  const [description, icon] = weatherCodes[current.weather_code] || ["Nieznane warunki", "🌡️"];

  $("#weatherIcon").textContent = icon;
  $("#temperature").textContent = `${Math.round(current.temperature_2m)}°C`;
  $("#weatherDescription").textContent = description;
  $("#humidity").textContent = `Wilgotność: ${current.relative_humidity_2m}%`;
  $("#location").textContent = `Współrzędne: ${Number(data.latitude).toFixed(2)}, ${Number(data.longitude).toFixed(2)}`;
}

function loadWeather() {
  $("#weatherDescription").textContent = "Pobieranie pogody...";

  if (!navigator.geolocation) {
    $("#weatherDescription").textContent = "Przeglądarka nie obsługuje lokalizacji.";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      try {
        const data = await getWeather(
          position.coords.latitude,
          position.coords.longitude
        );
        renderWeather(data);
      } catch (error) {
        $("#weatherDescription").textContent = "Nie udało się pobrać pogody.";
        console.error(error);
      }
    },
    () => {
      $("#weatherDescription").textContent = "Zezwól na lokalizację, aby pokazać pogodę.";
      $("#location").textContent = "Lokalizacja: brak zgody";
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 600000
    }
  );
}

$("#weatherRefresh").addEventListener("click", loadWeather);
loadWeather();

// Notes
const notesArea = $("#notesArea");
const saveStatus = $("#saveStatus");
const NOTES_KEY = "darisoft_notes";

notesArea.value = localStorage.getItem(NOTES_KEY) || "";

let saveTimer;
notesArea.addEventListener("input", () => {
  saveStatus.textContent = "Zapisywanie...";

  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    localStorage.setItem(NOTES_KEY, notesArea.value);
    saveStatus.textContent = "Zapisano lokalnie";
  }, 400);
});

$("#clearNotes").addEventListener("click", () => {
  if (!confirm("Czy na pewno wyczyścić wszystkie lokalne notatki?")) return;

  notesArea.value = "";
  localStorage.removeItem(NOTES_KEY);
  saveStatus.textContent = "Notatki wyczyszczone";
});

// Footer year
$("#year").textContent = new Date().getFullYear();
