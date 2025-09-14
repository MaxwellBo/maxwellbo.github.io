
import * as Plot from 'https://esm.run/@observablehq/plot'

const me = document.getElementById('weather');
const time = document.getElementById('time');
const conditions = document.getElementById('conditions');
const conditionsEmoji = document.getElementById('conditionsEmoji');
const currentTemp = document.getElementById('currentTemp');
const low = document.getElementById('low');
const high = document.getElementById('high');

const setTime = () => {
  const time = new Date().toLocaleTimeString('en-AU', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true
  });
  document.getElementById('time').textContent = time;
};

setTime();
setInterval(setTime, 1000);

const lat = -33.8688;
const lon = 151.2093;


const url = 'https://api.open-meteo.com/v1/forecast?'
  + `latitude=${lat}&longitude=${lon}`
  + '&daily=temperature_2m_max,temperature_2m_min'
  + '&current=temperature_2m,is_day,weather_code'
  + '&timezone=America%2FNew_York';

fetch(url)
  .then(response => response.json())
  .then(data => {
    currentTemp.textContent = data.current.temperature_2m.toFixed(1) + '°C';
    high.textContent = "H: " + data.daily.temperature_2m_max[0].toFixed(1) + '°C';
    low.textContent = "L: " + data.daily.temperature_2m_min[0].toFixed(1) + '°C';

    // weather_code interpretation table as per https://open-meteo.com/en/docs
    // 0	Clear sky
    // 1, 2, 3	Mainly clear, partly cloudy, and overcast
    // 45, 48	Fog and depositing rime fog
    // 51, 53, 55	Drizzle: Light, moderate, and dense intensity
    // 56, 57	Freezing Drizzle: Light and dense intensity
    // 61, 63, 65	Rain: Slight, moderate and heavy intensity
    // 66, 67	Freezing Rain: Light and heavy intensity
    // 71, 73, 75	Snow fall: Slight, moderate, and heavy intensity
    // 77	Snow grains
    // 80, 81, 82	Rain showers: Slight, moderate, and violent
    // 85, 86	Snow showers slight and heavy
    // 95 *	Thunderstorm: Slight or moderate
    // 96, 99 *	Thunderstorm with slight and heavy hail
    switch (data.current.weather_code) {
      case 0: // Clear sky
        conditions.textContent = 'Clear sky';
        me.style.background = 'linear-gradient(90deg, #87CEEB, #FFD700)';
        conditionsEmoji.textContent = '☀️';
        break;
      case 1: // Mainly clear
        conditions.textContent = 'Mainly clear';
        me.style.background = 'linear-gradient(90deg, #B0E2FF, #FFFACD)';
        conditionsEmoji.textContent = '🌤️';
        break;
      case 2: // Partly cloudy
        conditions.textContent = 'Partly cloudy';
        me.style.background = 'linear-gradient(90deg, #CCCCFF, #F0E68C)';
        conditionsEmoji.textContent = '⛅';
        break;
      case 3: // Overcast
        conditions.textContent = 'Overcast';
        me.style.background = 'linear-gradient(90deg, #A9A9A9, #778899)';
        conditionsEmoji.textContent = '☁️';
        break;
      case 45: // Fog
        conditions.textContent = 'Fog';
        me.style.background = 'linear-gradient(90deg, #E6E6FA, #D3D3D3)';
        conditionsEmoji.textContent = '🌫️';
        break;
      case 48: // Depositing rime fog
        conditions.textContent = 'Depositing rime fog';
        me.style.background = 'linear-gradient(90deg, #E6E6FA, #D3D3D3)';
        conditionsEmoji.textContent = '🌫️❄️';
        break;
      case 51: // Light drizzle
        conditions.textContent = 'Light drizzle';
        me.style.background = 'linear-gradient(90deg, #B0E0E6, #778899)';
        conditionsEmoji.textContent = '🌦️';
        break;
      case 53: // Moderate drizzle
        conditions.textContent = 'Moderate drizzle';
        me.style.background = 'linear-gradient(90deg, #ADD8E6, #708090)';
        conditionsEmoji.textContent = '🌦️';
        break;
      case 55: // Dense drizzle
        conditions.textContent = 'Dense drizzle';
        me.style.background = 'linear-gradient(90deg, #87CEFA, #4682B4)';
        conditionsEmoji.textContent = '🌧️';
        break;
      case 56: // Light freezing drizzle
        conditions.textContent = 'Light freezing drizzle';
        me.style.background = 'linear-gradient(90deg, #E0FFFF, #5F9EA0)';
        conditionsEmoji.textContent = '🌨️';
        break;
      case 57: // Dense freezing drizzle
        conditions.textContent = 'Dense freezing drizzle';
        me.style.background = 'linear-gradient(90deg, #AFEEEE, #5F9EA0)';
        conditionsEmoji.textContent = '🌨️';
        break;
      case 61: // Slight rain
        conditions.textContent = 'Slight rain';
        me.style.background = 'linear-gradient(90deg, #4682B4, #B0C4DE)';
        conditionsEmoji.textContent = '🌧️';
        break;
      case 63: // Moderate rain
        conditions.textContent = 'Moderate rain';
        me.style.background = 'linear-gradient(90deg, #4169E1, #B0C4DE)';
        conditionsEmoji.textContent = '🌧️🌧️';
        break;
      case 65: // Heavy rain
        conditions.textContent = 'Heavy rain';
        me.style.background = 'linear-gradient(90deg, #2F4F4F, #708090)';
        conditionsEmoji.textContent = '🌧️🌧️🌧️';
        break;
      case 66: // Light freezing rain
        conditions.textContent = 'Light freezing rain';
        me.style.background = 'linear-gradient(90deg, #6495ED, #4682B4)';
        conditionsEmoji.textContent = '🌧️❄️';
        break;
      case 67: // Heavy freezing rain
        conditions.textContent = 'Heavy freezing rain';
        me.style.background = 'linear-gradient(90deg, #5F9EA0, #4682B4)';
        conditionsEmoji.textContent = '🌧️❄️❄️';
        break;
      case 71: // Slight snowfall
        conditions.textContent = 'Slight snowfall';
        me.style.background = 'linear-gradient(90deg, #FFFAFA, #B0E0E6)';
        conditionsEmoji.textContent = '❄️';
        break;
      case 73: // Moderate snowfall
        conditions.textContent = 'Moderate snowfall';
        me.style.background = 'linear-gradient(90deg, #E0FFFF, #AFEEEE)';
        conditionsEmoji.textContent = '❄️❄️';
        break;
      case 75: // Heavy snowfall
        conditions.textContent = 'Heavy snowfall';
        me.style.background = 'linear-gradient(90deg, #4682B4, #E0FFFF)';
        conditionsEmoji.textContent = '❄️❄️❄️';
        break;
      case 77: // Snow grains
        conditions.textContent = 'Snow grains';
        me.style.background = 'linear-gradient(90deg, #B0E0E6, #AFEEEE)';
        conditionsEmoji.textContent = '🌨️';
        break;
      case 80: // Slight rain showers
        conditions.textContent = 'Slight rain showers';
        me.style.background = 'linear-gradient(90deg, #B0E0E6, #87CEFA)';
        conditionsEmoji.textContent = '🌦️';
        break;
      case 81: // Moderate rain showers
        conditions.textContent = 'Moderate rain showers';
        me.style.background = 'linear-gradient(90deg, #87CEFA, #4682B4)';
        conditionsEmoji.textContent = '🌦️🌦️';
        break;
      case 82: // Violent rain showers
        conditions.textContent = 'Violent rain showers';
        me.style.background = 'linear-gradient(90deg, #4682B4, #0000FF)';
        conditionsEmoji.textContent = '⛈️';
        break;
      case 85: // Slight snow showers
        conditions.textContent = 'Slight snow showers';
        me.style.background = 'linear-gradient(90deg, #F0FFFF, #B0E0E6)';
        conditionsEmoji.textContent = '🌨️';
        break;
      case 86: // Heavy snow showers
        conditions.textContent = 'Heavy snow showers';
        me.style.background = 'linear-gradient(90deg, #E0FFFF, #AFEEEE)';
        conditionsEmoji.textContent = '🌨️🌨️';
        break;
      case 95: // Thunderstorm: Slight or moderate
        conditions.textContent = 'Thunderstorm: Slight or moderate';
        me.style.background = 'linear-gradient(90deg, #2F4F4F, #800080)';
        conditionsEmoji.textContent = '🌩️';
        break;
      case 96: // Thunderstorm with slight hail
        conditions.textContent = 'Thunderstorm with slight hail';
        me.style.background = 'linear-gradient(90deg, #2F4F4F, #800080)';
        conditionsEmoji.textContent = '⛈️🌨️';
        break;
      case 99: // Thunderstorm with heavy hail
        conditions.textContent = 'Thunderstorm with heavy hail';
        me.style.background = 'linear-gradient(90deg, #2F4F4F, #800080)';
        conditionsEmoji.textContent = '⛈️❄️❄️';
        break;
      default: // Unknown weather code
        conditions.textContent = 'Unknown weather code';
        me.style.background = 'linear-gradient(90deg, #696969, #8B8B8B)';
        conditionsEmoji.textContent = '❔';
        break;
    }

    if (
      [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(data.current.weather_code)
    ) {
      const rainDiv = document.getElementById('rain');
      if (rainDiv) {
        rainDiv.style.display = 'block';
      }
    }


    const daily = data.daily.time.map((time, i) => ({
      time,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i]
    }));

    const plot = Plot.plot({
      marks: [
        // Bar for temperature ranges
        Plot.barX(daily, {
          y: "time",
          x1: "min",
          x2: "max",
        }),
        // Dot for current temperature
        Plot.dot([data.current], {
          x: "temperature_2m",
          y: (d) => daily[0].time,
          fill: "white",
          title: (d) => `Current Temp: ${d.temperature_2m}°C`
        }),
        Plot.text(daily, {
          x: "max",
          y: "time",
          text: d => `${d.max.toFixed(0)}`,
          dx: -6, // Position adjustment on x-axis
          fill: "white",
        }),
        // Text for min temperatures
        Plot.text(daily, {
          x: "min",
          y: "time",
          text: d => `${d.min.toFixed(0)}`,
          dx: 6, // Position adjustment on x-axis
          fill: "white"
        })
      ],
      y: {
        label: null,
        tickSize: 0,
        tickFormat: (d) => Plot.formatWeekday("en-AU", "narrow")(new Date(d).getDay()),
        type: "band",
      },
      x: {
        // label: "",
        // include celius in tick mark
        tickFormat: (d) => `${d}°C`,
        grid: true
      },
      width: 175,
      height: 125,
      marginTop: 5,
      marginLeft: 20,
      marginBottom: 20,
    });

    // Render the plot
    document.getElementById('weather').appendChild(plot);
  });
