import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as Location from 'expo-location';
import { getForecast } from '../services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';

interface ForecastData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
}

export default function ForecastScreen() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const forecastData = await getForecast(location.coords.latitude, location.coords.longitude);
      setForecast(forecastData);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (err) {
      setError('Failed to fetch forecast data');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code: number) => {
    switch (code) {
      case 0:
        return '☀️';
      case 1:
      case 2:
        return '🌤️';
      case 3:
        return '☁️';
      case 45:
      case 48:
        return '🌧️';
      case 51:
      case 53:
      case 55:
      case 61:
      case 63:
      case 65:
      case 80:
      case 81:
      case 82:
        return '🌧️';
      case 71:
      case 73:
      case 75:
      case 77:
      case 85:
      case 86:
        return '❄️';
      case 95:
      case 96:
      case 99:
        return '🌩️';
      default:
        return '🌤️';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Fetching forecast data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchForecast}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#4A90E2', '#87CEEB']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>7-Day Forecast</Text>
      </LinearGradient>

      <Animated.View 
        style={[
          styles.forecastContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {forecast?.time.map((date, index) => (
          <BlurView key={date} intensity={80} style={styles.forecastItem}>
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(date)}</Text>
            </View>
            <View style={styles.weatherContainer}>
              <Text style={styles.weatherIcon}>{getWeatherIcon(forecast.weather_code[index])}</Text>
              <View style={styles.temperatureContainer}>
                <Text style={styles.maxTemp}>{Math.round(forecast.temperature_2m_max[index])}°</Text>
                <Text style={styles.minTemp}>{Math.round(forecast.temperature_2m_min[index])}°</Text>
              </View>
            </View>
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{forecast.precipitation_probability_max[index]}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailText}>{Math.round(forecast.wind_speed_10m_max[index])} km/h</Text>
              </View>
            </View>
          </BlurView>
        ))}
      </Animated.View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchForecast}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A90E2',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  forecastContainer: {
    padding: 20,
  },
  forecastItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  dateContainer: {
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  weatherIcon: {
    fontSize: 40,
    color: '#4A90E2',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxTemp: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginRight: 10,
  },
  minTemp: {
    fontSize: 32,
    color: '#7F8C8D',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 