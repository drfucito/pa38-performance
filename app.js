// app.js — Phase 1: core UI + navigation only

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll("[data-tab-target]");
  const tabPanels = document.querySelectorAll("[data-tab-panel]");

  function activateTab(targetId) {
    tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tabTarget === targetId);
    });

    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetId);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tabTarget;
      activateTab(targetId);
    });
  });

  // Default tab
  activateTab("tab-aircraft");

  // Register service worker (PWA)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((err) => console.error("SW registration failed:", err));
  }
});   // ← END OF PHASE 1

// -----------------------------
// PHASE 2: WEATHER ENGINE
// -----------------------------

// Fetch METAR from NOAA Aviation Weather API
async function fetchMetar(icao) {
  const url = `https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?station=${icao}&data=metar&tz=UTC&format=json&latlon=no&year1=2024&month1=1&day1=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return { error: "No METAR found for this airport." };
    }

    const metar = data.data[data.data.length - 1]; // latest report

    return {
      raw: metar.metar,
      temp: metar.tmpf ? ((metar.tmpf - 32) * 5) / 9 : null,
      dewpoint: metar.dwpf ? ((metar.dwpf - 32) * 5) / 9 : null,
      altimeter: metar.alti,
      windDir: metar.drct,
      windSpeed: metar.sknt,
      time: metar.valid
    };
  } catch (err) {
    return { error: "Error fetching METAR." };
  }
}

// Handle METAR button click
document.getElementById("fetchMetarBtn").addEventListener("click", async () => {
  const icao = document.getElementById("icaoInput").value.trim().toUpperCase();
  const resultBox = document.getElementById("metarResult");

  if (!icao) {
    resultBox.textContent = "Please enter an ICAO code.";
    return;
  }

  resultBox.textContent = "Fetching METAR...";

  const metar = await fetchMetar(icao);

  if (metar.error) {
    resultBox.textContent = metar.error;
    return;
  }

  resultBox.innerHTML = `
    <strong>Raw METAR:</strong> ${metar.raw}<br>
    <strong>Temp:</strong> ${metar.temp} °C<br>
    <strong>Dewpoint:</strong> ${metar.dewpoint} °C<br>
    <strong>Altimeter:</strong> ${metar.altimeter} inHg<br>
    <strong>Wind:</strong> ${metar.windDir}° @ ${metar.windSpeed} kt<br>
    <strong>Time:</strong> ${metar.time}
  `;
});

// Density altitude calculation
document.getElementById("calcDaBtn").addEventListener("click", () => {
  const temp = parseFloat(document.getElementById("tempInput").value);
  const altimeter = parseFloat(document.getElementById("altimeterInput").value);

  const daBox = document.getElementById("daResult");

  if (isNaN(temp) || isNaN(altimeter)) {
    daBox.textContent = "Enter temperature and altimeter first.";
    return;
  }

  // Pressure altitude formula
  const pressureAltitude = (29.92 - altimeter) * 1000;

  // ISA temperature at sea level = 15°C
  const isaTemp = 15;

  // Density altitude formula
  const densityAltitude = pressureAltitude + 120 * (temp - isaTemp);

  daBox.textContent = `Density Altitude: ${Math.round(densityAltitude)} ft`;
});
