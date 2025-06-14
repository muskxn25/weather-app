import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWeatherData, WeatherData } from '../services/weatherService';
import * as Location from 'expo-location';

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          lat: location.coords.latitude,
          lon: location.coords.longitude
        });
      } catch (err) {
        setError('Failed to get location');
      }
    })();
  }, []);

  const refreshWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!currentLocation) {
        throw new Error('Location not available');
      }
      const data = await getWeatherData(currentLocation.lat, currentLocation.lon);
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLocation) {
      refreshWeather();
    }
  }, [currentLocation]);

  return (
    <WeatherContext.Provider value={{ weather, loading, error, refreshWeather }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}; 