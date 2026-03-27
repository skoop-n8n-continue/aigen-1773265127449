/* =====================================================
   WEATHER DISPLAY — app.js
   Uses Open-Meteo (free, no API key) + geolocation
   ===================================================== */

// ──────────────────────────────────────────────────────
// WMO Code → { label, theme, svgIcon }
// ──────────────────────────────────────────────────────
const WMO = {
  0:  { label: 'Clear Sky',        theme: null,      icon: 'sun'         },
  1:  { label: 'Mainly Clear',     theme: null,      icon: 'sun-cloud'   },
  2:  { label: 'Partly Cloudy',    theme: 'cloudy',  icon: 'part-cloud'  },
  3:  { label: 'Overcast',         theme: 'cloudy',  icon: 'cloud'       },
  45: { label: 'Foggy',            theme: 'foggy',   icon: 'fog'         },
  48: { label: 'Icy Fog',          theme: 'foggy',   icon: 'fog'         },
  51: { label: 'Light Drizzle',    theme: 'rainy',   icon: 'drizzle'     },
  53: { label: 'Drizzle',          theme: 'rainy',   icon: 'drizzle'     },
  55: { label: 'Heavy Drizzle',    theme: 'rainy',   icon: 'drizzle'     },
  61: { label: 'Slight Rain',      theme: 'rainy',   icon: 'rain'        },
  63: { label: 'Rain',             theme: 'rainy',   icon: 'rain'        },
  65: { label: 'Heavy Rain',       theme: 'rainy',   icon: 'rain-heavy'  },
  71: { label: 'Slight Snow',      theme: 'snowy',   icon: 'snow'        },
  73: { label: 'Snow',             theme: 'snowy',   icon: 'snow'        },
  75: { label: 'Heavy Snow',       theme: 'snowy',   icon: 'snow'        },
  77: { label: 'Snow Grains',      theme: 'snowy',   icon: 'snow'        },
  80: { label: 'Rain Showers',     theme: 'rainy',   icon: 'rain'        },
  81: { label: 'Rain Showers',     theme: 'rainy',   icon: 'rain'        },
  82: { label: 'Violent Showers',  theme: 'rainy',   icon: 'rain-heavy'  },
  85: { label: 'Snow Showers',     theme: 'snowy',   icon: 'snow'        },
  86: { label: 'Heavy Snow Shower',theme: 'snowy',   icon: 'snow'        },
  95: { label: 'Thunderstorm',     theme: 'stormy',  icon: 'storm'       },
  96: { label: 'Thunderstorm',     theme: 'stormy',  icon: 'storm'       },
  99: { label: 'Thunderstorm',     theme: 'stormy',  icon: 'storm'       },
};

// ──────────────────────────────────────────────────────
// SVG Icon Paths
// ──────────────────────────────────────────────────────
const ICONS = {
  sun: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="22" fill="#FFD95A" filter="url(#glow)"/>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${Array.from({length:8}, (_,i) => {
        const a = (i*45)*Math.PI/180;
        const x1 = 50 + 28*Math.cos(a), y1 = 50 + 28*Math.sin(a);
        const x2 = 50 + 38*Math.cos(a), y2 = 50 + 38*Math.sin(a);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD95A" stroke-width="4" stroke-linecap="round"/>`;
      }).join('')}
    </svg>`,

  'sun-cloud': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="38" cy="36" r="16" fill="#FFD95A" opacity="0.9"/>
      ${Array.from({length:6}, (_,i) => {
        const a = (i*60)*Math.PI/180;
        const x1 = 38+20*Math.cos(a), y1 = 36+20*Math.sin(a);
        const x2 = 38+26*Math.cos(a), y2 = 36+26*Math.sin(a);
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFD95A" stroke-width="3.5" stroke-linecap="round"/>`;
      }).join('')}
      <rect x="18" y="56" width="64" height="26" rx="13" fill="rgba(255,255,255,0.85)"/>
      <ellipse cx="36" cy="56" rx="14" ry="12" fill="rgba(255,255,255,0.85)"/>
      <ellipse cx="56" cy="53" rx="17" ry="14" fill="rgba(255,255,255,0.85)"/>
    </svg>`,

  'part-cloud': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="35" cy="38" r="15" fill="#FFD95A" opacity="0.75"/>
      <rect x="14" y="57" width="72" height="28" rx="14" fill="rgba(255,255,255,0.82)"/>
      <ellipse cx="34" cy="57" rx="15" ry="13" fill="rgba(255,255,255,0.82)"/>
      <ellipse cx="57" cy="54" rx="19" ry="16" fill="rgba(255,255,255,0.82)"/>
    </svg>`,

  cloud: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="55" width="80" height="32" rx="16" fill="rgba(255,255,255,0.78)"/>
      <ellipse cx="32" cy="55" rx="17" ry="15" fill="rgba(255,255,255,0.78)"/>
      <ellipse cx="58" cy="50" rx="22" ry="19" fill="rgba(255,255,255,0.78)"/>
      <ellipse cx="76" cy="56" rx="14" ry="12" fill="rgba(255,255,255,0.78)"/>
    </svg>`,

  fog: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      ${[30,44,58,72].map((y,i)=>`
        <rect x="${8+i*3}" y="${y}" width="${84-i*6}" height="7" rx="3.5" fill="rgba(255,255,255,${0.55-i*0.05})"/>
      `).join('')}
    </svg>`,

  drizzle: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="18" width="80" height="32" rx="16" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="32" cy="18" rx="17" ry="14" fill="rgba(255,255,255,0.7)"/>
      <ellipse cx="58" cy="14" rx="20" ry="17" fill="rgba(255,255,255,0.7)"/>
      ${[28,45,62].map((x,i)=>`
        <line x1="${x}" y1="${57+i*3}" x2="${x-4}" y2="${68+i*3}" stroke="#7dcfff" stroke-width="3" stroke-linecap="round"/>
      `).join('')}
    </svg>`,

  rain: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="80" height="30" rx="15" fill="rgba(255,255,255,0.65)"/>
      <ellipse cx="32" cy="14" rx="16" ry="13" fill="rgba(255,255,255,0.65)"/>
      <ellipse cx="58" cy="10" rx="20" ry="17" fill="rgba(255,255,255,0.65)"/>
      ${[25,40,55,70].map((x,i)=>`
        <line x1="${x}" y1="${52}" x2="${x-6}" y2="${68}" stroke="#7dcfff" stroke-width="3.5" stroke-linecap="round"/>
        <line x1="${x+3}" y1="${64}" x2="${x-3}" y2="${80}" stroke="#7dcfff" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
      `).join('')}
    </svg>`,

  'rain-heavy': `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="84" height="28" rx="14" fill="rgba(200,215,240,0.7)"/>
      <ellipse cx="30" cy="12" rx="17" ry="13" fill="rgba(200,215,240,0.7)"/>
      <ellipse cx="60" cy="8" rx="21" ry="17" fill="rgba(200,215,240,0.7)"/>
      ${[20,33,46,59,72].map((x,i)=>`
        <line x1="${x}" y1="${48}" x2="${x-8}" y2="${70}" stroke="#50b0f0" stroke-width="4" stroke-linecap="round"/>
        <line x1="${x+4}" y1="${64}" x2="${x-4}" y2="${86}" stroke="#50b0f0" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
      `).join('')}
    </svg>`,

  snow: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="12" width="80" height="30" rx="15" fill="rgba(220,235,255,0.75)"/>
      <ellipse cx="32" cy="12" rx="17" ry="13" fill="rgba(220,235,255,0.75)"/>
      <ellipse cx="58" cy="8" rx="20" ry="17" fill="rgba(220,235,255,0.75)"/>
      ${[26,40,54,68].map((x,i)=>`
        <circle cx="${x}" cy="${62}" r="4" fill="rgba(255,255,255,0.9)"/>
        <circle cx="${x+7}" cy="${76}" r="3" fill="rgba(255,255,255,0.7)"/>
        <circle cx="${x-5}" cy="${79}" r="3.5" fill="rgba(255,255,255,0.75)"/>
      `).join('')}
    </svg>`,

  storm: `
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="84" height="28" rx="14" fill="rgba(80,90,130,0.85)"/>
      <ellipse cx="30" cy="10" rx="18" ry="13" fill="rgba(80,90,130,0.85)"/>
      <ellipse cx="60" cy="6" rx="22" ry="17" fill="rgba(80,90,130,0.85)"/>
      <polygon points="56,42 44,64 52,64 40,88 64,58 55,58 66,42" fill="#FFE048" filter="url(#boltglow)"/>
      <defs>
        <filter id="boltglow"><feGaussianBlur stdDeviation="2.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
    </svg>`,
};

// ──────────────────────────────────────────────────────
// DOM refs
// ──────────────────────────────────────────────────────
const skyBg       = document.getElementById('skyBg');
const stars       = document.getElementById('stars');
const cloudsLayer = document.getElementById('cloudsLayer');
const rainLayer   = document.getElementById('rainLayer');
const snowLayer   = document.getElementById('snowLayer');
const lightLayer  = document.getElementById('lightningLayer');

const locationText = document.getElementById('locationText');
const timeDisplay  = document.getElementById('timeDisplay');
const dateDisplay  = document.getElementById('dateDisplay');
const weatherIcon  = document.getElementById('weatherIcon');
const condition    = document.getElementById('condition');
const forecastRow  = document.getElementById('forecastRow');

// ──────────────────────────────────────────────────────
// Clock
// ──────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  timeDisplay.textContent = `${hh}:${mm}`;

  const dayNames  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames= ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
  const day  = dayNames[now.getDay()];
  const date = now.getDate();
  const mon  = monthNames[now.getMonth()];
  const yr   = now.getFullYear();
  dateDisplay.textContent = `${day}, ${mon} ${date}, ${yr}`;
}
setInterval(updateClock, 1000);
updateClock();

// ──────────────────────────────────────────────────────
// Sky Particles
// ──────────────────────────────────────────────────────
function createStars(n = 80) {
  stars.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.8;
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --dur:${(Math.random()*3+2).toFixed(1)}s;
      --delay:-${(Math.random()*4).toFixed(1)}s;
    `;
    stars.appendChild(s);
  }
}

function createClouds(n = 5, dark = false) {
  cloudsLayer.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    const w = 80 + Math.random()*160;
    const h = w * 0.38;
    const opacity = dark ? 0.09 + Math.random()*0.09 : 0.15 + Math.random()*0.12;
    c.style.cssText = `
      top:${5 + Math.random()*45}%;
      left:-${w*1.2}px;
      width:${w}px; height:${h}px;
      --dur:${(50 + Math.random()*50).toFixed(0)}s;
      animation-delay: -${(Math.random()*60).toFixed(0)}s;
      opacity:${opacity};
    `;
    cloudsLayer.appendChild(c);
  }
}

function createRain(n = 80) {
  rainLayer.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const d = document.createElement('div');
    d.className = 'raindrop';
    const h = 12 + Math.random()*20;
    d.style.cssText = `
      left:${Math.random()*100}%;
      height:${h}px;
      --dur:${(0.5 + Math.random()*0.6).toFixed(2)}s;
      --delay:-${(Math.random()*1.5).toFixed(2)}s;
      opacity:${0.5 + Math.random()*0.5};
    `;
    rainLayer.appendChild(d);
  }
}

function createSnow(n = 50) {
  snowLayer.innerHTML = '';
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'snowflake';
    const size = 3 + Math.random()*6;
    s.style.cssText = `
      left:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --dur:${(4 + Math.random()*5).toFixed(1)}s;
      --delay:-${(Math.random()*8).toFixed(1)}s;
      --drift:${(Math.random()*60-30).toFixed(0)}px;
    `;
    snowLayer.appendChild(s);
  }
}

// ──────────────────────────────────────────────────────
// Theme management
// ──────────────────────────────────────────────────────
function applyTheme(wmoCode, isDay) {
  const info    = WMO[wmoCode] || WMO[0];
  const baseTheme = info.theme;

  // Determine sky class
  let skyClass = '';
  if (!baseTheme) {
    skyClass = isDay ? (isGoldenHour() ? 'sunrise' : 'clear-day') : 'clear-night';
  } else {
    skyClass = baseTheme;
  }

  // Apply bg class
  skyBg.className = `sky-bg ${skyClass}`;

  // Stars (night only)
  stars.classList.toggle('visible', !isDay && !baseTheme);
  if (!isDay && !baseTheme) createStars(100);

  // Clouds
  const hasClouds = ['cloudy','foggy','rainy','snowy','stormy'].includes(skyClass)
    || [1,2,3].includes(wmoCode);
  cloudsLayer.classList.toggle('visible', hasClouds);
  if (hasClouds) createClouds(6, skyClass === 'stormy');

  // Rain
  const hasRain = skyClass === 'rainy';
  rainLayer.classList.toggle('visible', hasRain);
  if (hasRain) createRain(wmoCode >= 65 ? 120 : 70);

  // Snow
  const hasSnow = skyClass === 'snowy';
  snowLayer.classList.toggle('visible', hasSnow);
  if (hasSnow) createSnow(60);

  // Lightning
  if (skyClass === 'stormy') startLightning();
  else stopLightning();
}

function isGoldenHour() {
  const h = new Date().getHours();
  return (h >= 5 && h <= 8) || (h >= 17 && h <= 20);
}

let lightningTimer = null;
function startLightning() {
  if (lightningTimer) return;
  const flash = () => {
    lightLayer.classList.remove('flash');
    void lightLayer.offsetWidth; // reflow
    lightLayer.classList.add('flash');
    lightningTimer = setTimeout(flash, 4000 + Math.random()*8000);
  };
  lightningTimer = setTimeout(flash, 2000 + Math.random()*5000);
}
function stopLightning() {
  clearTimeout(lightningTimer);
  lightningTimer = null;
  lightLayer.classList.remove('flash');
}

// ──────────────────────────────────────────────────────
// Reverse geocode (nominatim)
// ──────────────────────────────────────────────────────
async function getCityName(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    const addr = data.address || {};
    return addr.city || addr.town || addr.village || addr.county || addr.state || 'Unknown';
  } catch { return null; }
}

// ──────────────────────────────────────────────────────
// Fetch weather from Open-Meteo
// ──────────────────────────────────────────────────────
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weathercode',
      'is_day',
    ].join(','),
    daily: [
      'weathercode',
      'temperature_2m_max',
      'temperature_2m_min',
    ].join(','),
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ──────────────────────────────────────────────────────
// Render weather data
// ──────────────────────────────────────────────────────
function renderWeather(data, cityName) {
  const cur = data.current;
  const code  = cur.weathercode;
  const isDay = cur.is_day === 1;
  const info  = WMO[code] || WMO[0];

  // Icon
  const iconSvg = ICONS[info.icon] || ICONS['sun'];
  weatherIcon.innerHTML = iconSvg;

  // Condition
  condition.textContent = info.label;

  // Location
  if (cityName) locationText.textContent = cityName;

  // Forecast
  renderForecast(data.daily);

  // Apply sky theme
  applyTheme(code, isDay);
}

function renderForecast(daily) {
  forecastRow.innerHTML = '';
  // Show 4 days: Today + 3
  for (let i = 0; i < 4; i++) {
    const code = daily.weathercode[i];
    const max  = Math.round(daily.temperature_2m_max[i]);
    const min  = Math.round(daily.temperature_2m_min[i]);
    const info = WMO[code] || WMO[0];
    const icon = ICONS[info.icon] || ICONS['sun'];

    const dayName = i === 0 ? 'Today' : getShortDayName(daily.time[i]);

    const item = document.createElement('div');
    item.className = 'forecast-item';
    item.innerHTML = `
      <div class="forecast-day">${dayName}</div>
      <div class="forecast-icon">${icon}</div>
      <div class="forecast-temps">
        <span class="forecast-max">${max}°</span>
        <span class="forecast-min">${min}°</span>
      </div>
    `;
    forecastRow.appendChild(item);
  }
}

function getShortDayName(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

// ──────────────────────────────────────────────────────
// Error rendering
// ──────────────────────────────────────────────────────
function renderError(msg) {
  weatherIcon.innerHTML = `<svg viewBox="0 0 100 100" fill="none"><text y="60" x="50" text-anchor="middle" font-size="52">🌐</text></svg>`;
  condition.innerHTML   = `<span class="error-msg">${msg}</span>`;
  // Apply default clear-day theme
  applyTheme(0, true);
}

// ──────────────────────────────────────────────────────
// Main load function
// ──────────────────────────────────────────────────────
async function loadWeather(lat, lon, skipGeocode = false) {
  try {
    const [weatherData, city] = await Promise.all([
      fetchWeather(lat, lon),
      skipGeocode ? Promise.resolve(null) : getCityName(lat, lon),
    ]);
    renderWeather(weatherData, city);
  } catch (err) {
    console.error('Weather fetch failed:', err);
    renderError('Unable to load weather data. Retrying…');
    applyTheme(0, true);
  }
}

// ──────────────────────────────────────────────────────
// Geolocation → weather
// ──────────────────────────────────────────────────────
let userLat = null, userLon = null;

function init() {
  if ('geolocation' in navigator) {
    locationText.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(
      pos => {
        userLat = pos.coords.latitude;
        userLon = pos.coords.longitude;
        loadWeather(userLat, userLon);
      },
      err => {
        console.warn('Geolocation denied, using fallback coordinates');
        // Fallback: New York City
        userLat = 40.7128;
        userLon = -74.0060;
        locationText.textContent = 'New York, NY';
        loadWeather(userLat, userLon, true);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  } else {
    // No geolocation support — fallback
    userLat = 40.7128;
    userLon = -74.0060;
    locationText.textContent = 'New York, NY';
    loadWeather(userLat, userLon, true);
  }
}

// ──────────────────────────────────────────────────────
// Auto-refresh every 10 minutes
// ──────────────────────────────────────────────────────
setInterval(() => {
  if (userLat !== null) loadWeather(userLat, userLon, true);
}, 10 * 60 * 1000);

// ──────────────────────────────────────────────────────
// Bootstrap
// ──────────────────────────────────────────────────────
createStars(80);
createClouds(3);
init();
