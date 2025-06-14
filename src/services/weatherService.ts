const BASE_URL = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  cloudCover: number;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  weatherIcon: string;
  weatherCode: number;
  isDay: boolean;
  forecast: {
    date: string;
    temperature: number;
    weatherIcon: string;
    isDay: boolean;
  }[];
  hourly: {
    time: string;
    temperature: number;
    weatherIcon: string;
    precipitation: number;
  }[];
}

// Weather code to icon mapping
const WEATHER_ICONS: { [key: number]: string } = {
  0: '☀️', // Clear sky
  1: '🌤️', // Mainly clear
  2: '⛅', // Partly cloudy
  3: '☁️', // Overcast
  45: '🌫️', // Foggy
  48: '🌫️', // Depositing rime fog
  51: '🌦️', // Light drizzle
  53: '🌦️', // Moderate drizzle
  55: '🌦️', // Dense drizzle
  61: '🌧️', // Light rain
  63: '🌧️', // Moderate rain
  65: '🌧️', // Heavy rain
  71: '🌨️', // Light snow
  73: '🌨️', // Moderate snow
  75: '🌨️', // Heavy snow
  77: '🌨️', // Snow grains
  80: '🌧️', // Light rain showers
  81: '🌧️', // Moderate rain showers
  82: '🌧️', // Heavy rain showers
  85: '❄️', // Light snow showers
  86: '❄️', // Heavy snow showers
  95: '⛈️', // Thunderstorm
  96: '⛈️', // Thunderstorm with light hail
  99: '⛈️', // Thunderstorm with heavy hail
};

interface ForecastData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max: number[];
  uv_index_max: number[];
  sunrise: string[];
  sunset: string[];
}

interface NotificationData {
  alerts: {
    event: string;
    severity: string;
    description: string;
  }[];
}

export interface WeatherAlert {
  time: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ActivitySuggestion {
  type: 'indoor' | 'outdoor';
  title: string;
  description: string;
  icon: string;
}

const INDOOR_ACTIVITIES: ActivitySuggestion[] = [
  {
    type: 'indoor',
    title: 'Read a Book',
    description: 'Perfect weather to curl up with a good book',
    icon: 'book'
  },
  {
    type: 'indoor',
    title: 'Visit a Museum',
    description: 'Explore art and history indoors',
    icon: 'museum'
  },
  {
    type: 'indoor',
    title: 'Movie Marathon',
    description: 'Great day for watching your favorite films',
    icon: 'film'
  },
  {
    type: 'indoor',
    title: 'Cook Something New',
    description: 'Try a new recipe in your kitchen',
    icon: 'restaurant'
  },
  {
    type: 'indoor',
    title: 'Home Workout',
    description: 'Stay active with indoor exercises',
    icon: 'fitness'
  }
];

const OUTDOOR_ACTIVITIES: ActivitySuggestion[] = [
  {
    type: 'outdoor',
    title: 'Go for a Run',
    description: 'Perfect weather for outdoor exercise',
    icon: 'running'
  },
  {
    type: 'outdoor',
    title: 'Have a Picnic',
    description: 'Enjoy a meal in the great outdoors',
    icon: 'picnic'
  },
  {
    type: 'outdoor',
    title: 'Visit a Park',
    description: 'Explore nature and fresh air',
    icon: 'park'
  },
  {
    type: 'outdoor',
    title: 'Outdoor Sports',
    description: 'Play your favorite outdoor sports',
    icon: 'sports'
  },
  {
    type: 'outdoor',
    title: 'Gardening',
    description: 'Perfect day for tending to your garden',
    icon: 'garden'
  }
];

export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates provided');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      throw new Error('Coordinates out of valid range');
    }

    console.log('Fetching weather data for coordinates:', { latitude, longitude });
    
    const url = `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,cloud_cover,is_day,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset&hourly=temperature_2m,weather_code,precipitation&timezone=auto&forecast_days=6`;
    console.log('Request URL:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Weather API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData?.error?.reason || `Failed to fetch weather data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Weather API Response:', data);

    if (!data || !data.current || !data.daily) {
      console.error('Invalid API Response:', data);
      throw new Error('Invalid weather data received from API');
    }

    const current = data.current;
    if (!current.temperature_2m || !current.weather_code) {
      console.error('Missing Required Data:', current);
      throw new Error('Required weather data is missing from API response');
    }

    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m || 0,
      windSpeed: current.wind_speed_10m,
      windGusts: current.wind_gusts_10m,
      precipitation: current.precipitation,
      cloudCover: current.cloud_cover,
      uvIndex: current.uv_index,
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
      weatherIcon: WEATHER_ICONS[current.weather_code] || '⛅',
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
      forecast: data.daily.time.map((date: string, index: number) => ({
        date,
        temperature: data.daily.temperature_2m_max[index],
        weatherIcon: WEATHER_ICONS[data.daily.weather_code[index]] || '⛅',
        isDay: true
      })),
      hourly: data.hourly.time.slice(0, 24).map((time: string, index: number) => ({
        time,
        temperature: data.hourly.temperature_2m[index],
        weatherIcon: WEATHER_ICONS[data.hourly.weather_code[index]] || '⛅',
        precipitation: data.hourly.precipitation[index]
      }))
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

function calculateAQI(pm2_5: number, pm10: number): number {
  // Simple AQI calculation based on PM2.5 and PM10
  const pm2_5AQI = pm2_5 * 2; // Simplified conversion
  const pm10AQI = pm10; // Simplified conversion
  return Math.max(pm2_5AQI, pm10AQI);
}

function getAQICategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export const getForecast = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Forecast data fetch failed: ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    return data.daily;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch forecast data');
  }
};

export const getActivitySuggestions = (weatherCode: number, isDay: boolean): ActivitySuggestion[] => {
  const suggestions: ActivitySuggestion[] = [];
  
  // Add indoor activities for bad weather
  if (weatherCode >= 51 || weatherCode === 3) { // Rain or overcast
    const indoorActivities = [...INDOOR_ACTIVITIES];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * indoorActivities.length);
      suggestions.push(indoorActivities[randomIndex]);
      indoorActivities.splice(randomIndex, 1);
    }
  }
  
  // Add outdoor activities for good weather
  if (weatherCode <= 2 && isDay) { // Clear or partly cloudy during day
    const outdoorActivities = [...OUTDOOR_ACTIVITIES];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * outdoorActivities.length);
      suggestions.push(outdoorActivities[randomIndex]);
      outdoorActivities.splice(randomIndex, 1);
    }
  }
  
  return suggestions;
};

export const getNotifications = async (latitude: number, longitude: number): Promise<WeatherAlert[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_gusts_10m,uv_index&timezone=auto&forecast_days=2`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`Weather alerts fetch failed: ${errorData?.error || response.statusText}`);
    }

    const data = await response.json();
    const alerts: WeatherAlert[] = [];

    // Check for significant weather changes
    for (let i = 0; i < data.hourly.time.length; i++) {
      const temp = data.hourly.temperature_2m[i];
      const feelsLike = data.hourly.apparent_temperature[i];
      const precip = data.hourly.precipitation_probability[i];
      const weatherCode = data.hourly.weather_code[i];
      const windGusts = data.hourly.wind_gusts_10m[i];
      const uvIndex = data.hourly.uv_index[i];

      // Temperature drop alert
      if (i > 0 && (temp - data.hourly.temperature_2m[i-1]) < -10) {
        alerts.push({
          time: data.hourly.time[i],
          type: 'Temperature Drop',
          description: `Temperature will drop by ${Math.round(Math.abs(temp - data.hourly.temperature_2m[i-1]))}°C - Layer up!`,
          severity: 'medium'
        });
      }

      // Rain alert
      if (precip > 60) {
        alerts.push({
          time: data.hourly.time[i],
          type: 'Rain Expected',
          description: `High chance of rain (${precip}%) - Bring an umbrella!`,
          severity: 'medium'
        });
      }

      // UV alert
      if (uvIndex > 6) {
        alerts.push({
          time: data.hourly.time[i],
          type: 'High UV Index',
          description: `UV Index is ${uvIndex} - Don't forget sunscreen!`,
          severity: 'medium'
        });
      }

      // Wind alert
      if (windGusts > 30) {
        alerts.push({
          time: data.hourly.time[i],
          type: 'Strong Winds',
          description: `Wind gusts up to ${Math.round(windGusts)} km/h - Be careful!`,
          severity: 'medium'
        });
      }

      // Snow alert
      if (weatherCode >= 71 && weatherCode <= 77) {
        alerts.push({
          time: data.hourly.time[i],
          type: 'Snow Alert',
          description: 'Snow expected - Drive carefully!',
          severity: 'medium'
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch weather alerts');
  }
}; 