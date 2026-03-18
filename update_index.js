const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the inner contents of <div class="card" id="card">
const cardStart = html.indexOf('<div class="card" id="card">');
const cardEnd = html.indexOf('</div>', html.indexOf('<div class="condition" id="condition">')) + 6;

const newCardContent = `<div class="card" id="card">
    <div class="left-panel">
      <!-- Location -->
      <div class="location-row" id="locationRow">
        <svg class="pin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        <span class="location-text" id="locationText">Locating…</span>
      </div>

      <!-- Date & Time -->
      <div class="datetime-block">
        <div class="time" id="timeDisplay">--:--</div>
        <div class="date" id="dateDisplay">---</div>
      </div>
    </div>

    <div class="right-panel">
      <!-- Weather icon -->
      <div class="icon-wrap" id="iconWrap">
        <div class="weather-icon" id="weatherIcon">
          <div class="icon-spinner"></div>
        </div>
      </div>

      <!-- Temperature -->
      <div class="temp-block">
        <span class="temp-value" id="tempValue">--</span>
        <span class="temp-unit" id="tempUnit">°C</span>
      </div>

      <!-- Condition label -->
      <div class="condition" id="condition">Fetching weather…</div>
    </div>
  </div>`;

html = html.substring(0, cardStart) + newCardContent + html.substring(cardEnd);

// Generate new cache version
const v = Math.random().toString(36).substring(2, 8);
html = html.replace(/\?v=[a-z0-9]+/g, '?v=' + v);

fs.writeFileSync('index.html', html);
console.log("updated index.html");
