export interface WeatherData {
  locationName: string;
  country: string;
  current: {
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    windSpeed: number;
    isDay: boolean;
    weatherCode: number;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    maxTemp: number[];
    minTemp: number[];
  };
}

const WEATHER_REGEX = /^(?:clima|tiempo|weather|pronostico|pronóstico)(?:\s+(?:en|de|para|in|for))?\s+(.+)$/i;

export async function getWeather(query: string, lang: string = 'en'): Promise<WeatherData | null> {
  const match = query.trim().match(WEATHER_REGEX);
  if (!match) {
    return null;
  }

  const locationQuery = match[1].trim();
  if (!locationQuery) return null;

  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationQuery)}&count=1&language=${lang}&format=json`);
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) {
      return null; // Location not found
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const locationName = location.name;
    const country = location.country || '';

    // 2. Weather Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();

    return {
      locationName,
      country,
      current: {
        temperature: weatherData.current.temperature_2m,
        apparentTemperature: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        isDay: weatherData.current.is_day === 1,
        weatherCode: weatherData.current.weather_code,
      },
      daily: {
        time: weatherData.daily.time,
        weatherCode: weatherData.daily.weather_code,
        maxTemp: weatherData.daily.temperature_2m_max,
        minTemp: weatherData.daily.temperature_2m_min,
      }
    };

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
}
