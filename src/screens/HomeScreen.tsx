import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, TouchableOpacity, Dimensions, Platform, TextInput, Modal, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import { getWeatherData, WeatherData } from '../services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useWeather } from '../context/WeatherContext';

const { width } = Dimensions.get('window');

const formatTime = (timeString: string) => {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const WeatherAnimation = ({ weatherCode, isDay }: { weatherCode: number, isDay: boolean }) => {
  const sunAnim = useRef(new Animated.Value(0)).current;
  const rainAnim = useRef(new Animated.Value(0)).current;
  const snowAnim = useRef(new Animated.Value(0)).current;
  const cloudAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start continuous animations
    Animated.loop(
      Animated.sequence([
        Animated.timing(sunAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(sunAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rainAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(rainAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(snowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(snowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(cloudAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    ).start();
  }, []);

  const renderWeatherAnimation = () => {
    // Clear sky or mostly clear
    if (weatherCode === 0 || weatherCode === 1) {
      return (
        <Animated.View style={[
          styles.weatherAnimation,
          {
            transform: [{
              translateY: sunAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              }),
            }],
          },
        ]}>
          <Text style={{ fontSize: 80 }}>☀️</Text>
        </Animated.View>
      );
    }
    // Rain
    else if (weatherCode >= 51 && weatherCode <= 67) {
      return (
        <View style={styles.weatherAnimation}>
          <Animated.View style={[
            styles.rainDrop,
            {
              transform: [{
                translateY: rainAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              }],
              opacity: rainAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ]} />
          <Text style={{ fontSize: 80 }}>🌧️</Text>
        </View>
      );
    }
    // Snow
    else if (weatherCode >= 71 && weatherCode <= 77) {
      return (
        <View style={styles.weatherAnimation}>
          <Animated.View style={[
            styles.snowFlake,
            {
              transform: [{
                translateY: snowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 20],
                }),
              }],
              opacity: snowAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 0],
              }),
            },
          ]} />
          <Text style={{ fontSize: 80 }}>❄️</Text>
        </View>
      );
    }
    // Partly cloudy
    else if (weatherCode === 2) {
      return (
        <View style={styles.weatherAnimation}>
          <Animated.View style={[
            styles.cloudContainer,
            {
              transform: [{
                translateX: cloudAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 10],
                }),
              }],
            },
          ]}>
            <Text style={{ fontSize: 80 }}>⛅</Text>
          </Animated.View>
        </View>
      );
    }
    // Cloudy
    else {
      return (
        <View style={styles.weatherAnimation}>
          <Animated.View style={[
            styles.cloudContainer,
            {
              transform: [{
                translateX: cloudAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 10],
                }),
              }],
            },
          ]}>
            <Text style={{ fontSize: 80 }}>☁️</Text>
          </Animated.View>
        </View>
      );
    }
  };

  return renderWeatherAnimation();
};

const ForecastDay = ({ date, temp, icon, isDay }: { date: string, temp: number, icon: string, isDay: boolean }) => {
  return (
    <View style={styles.forecastDay}>
      <Text style={styles.forecastDate}>{date}</Text>
      <Text style={{ fontSize: 30 }}>{icon}</Text>
      <Text style={styles.forecastTemp}>{Math.round(temp)}°</Text>
    </View>
  );
};

const HourlyForecast = ({ 
  hourly, 
  fadeAnim, 
  slideAnim 
}: { 
  hourly: WeatherData['hourly'],
  fadeAnim: Animated.Value,
  slideAnim: Animated.Value
}) => {
  const formatHour = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });
  };

  return (
    <Animated.View style={[styles.hourlyContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.forecastTitle}>24-Hour Forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyScroll}>
        {hourly.map((hour: WeatherData['hourly'][0], index: number) => (
          <View key={index} style={styles.hourlyItem}>
            <Text style={styles.hourlyTime}>{formatHour(hour.time)}</Text>
            <Text style={{ fontSize: 30 }}>{hour.weatherIcon}</Text>
            <Text style={styles.hourlyTemp}>{Math.round(hour.temperature)}°</Text>
            {hour.precipitation > 0 && (
              <Text style={styles.hourlyPrecip}>
                {Math.round(hour.precipitation * 100)}%
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const getLocationName = async (latitude: number, longitude: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
    );
    const data = await response.json();
    return data.display_name.split(',')[0]; // Get the city name
  } catch (error) {
    console.error('Error getting location name:', error);
    return 'Unknown Location';
  }
};

export default function HomeScreen() {
  const { weather, loading, error, refreshWeather } = useWeather();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ name: string; lat: number; lon: number } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const detailSlideAnims = useRef([
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
  ]).current;

  // Initial location fetch
  useEffect(() => {
    getCurrentLocation();
  }, []); // Empty dependency array - only run once on mount

  // Animation effect
  useEffect(() => {
    if (weather) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      iconRotateAnim.setValue(0);
      detailSlideAnims.forEach(anim => anim.setValue(30));

      // Start animations
      Animated.parallel([
        // Main content fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Slide up animation
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
        // Scale animation
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // Icon rotation
        Animated.sequence([
          Animated.timing(iconRotateAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.elastic(1),
          }),
        ]),
        // Detail cards slide in
        ...detailSlideAnims.map((anim, index) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 800,
            delay: index * 200,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        ),
      ]).start();
    }
  }, [weather]); // Only run animations when weather changes

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      const { latitude, longitude } = location.coords;
      
      // Get location name
      const locationName = await getLocationName(latitude, longitude);
      
      setCurrentLocation({
        name: locationName,
        lat: latitude,
        lon: longitude
      });

      // Update weather for the new location
      await refreshWeather();
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      
      setSearchResults(data.map((result: any) => ({
        name: result.display_name.split(',')[0],
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      })));
    } catch (error) {
      console.error('Error searching locations:', error);
    }
  };

  const handleLocationSelect = (location: { name: string; lat: number; lon: number }) => {
    setCurrentLocation(location);
    setSearchModalVisible(false);
    setSearchQuery('');
    setSearchResults([]);
    // Update weather for new location
    refreshWeather();
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.9);
      iconRotateAnim.setValue(0);
      detailSlideAnims.forEach(anim => anim.setValue(30));

      // Start refresh animation
      Animated.sequence([
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]).start();

      if (currentLocation) {
        await refreshWeather();
      } else {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error refreshing weather:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatForecastDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={{ fontSize: 50 }}>❌</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.errorContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={{ fontSize: 50 }}>☁️</Text>
          <Text style={styles.errorText}>No weather data available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor="#4A90E2"
          colors={["#4A90E2"]}
        />
      }
    >
      <LinearGradient
        colors={['#4A90E2', '#87CEEB']}
        style={styles.header}
      >
        <View style={styles.locationContainer}>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => setSearchModalVisible(true)}
          >
            <Text style={{ fontSize: 24 }}>📍</Text>
            <Text style={styles.locationText}>
              {currentLocation?.name || 'Loading location...'}
            </Text>
            <Text style={{ fontSize: 24 }}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshLocationButton}
            onPress={handleRefresh}
            disabled={isRefreshing}
          >
            <Animated.View style={{
              transform: [{
                rotate: iconRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              }],
            }}>
              <Text style={{ fontSize: 24 }}>🔄</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <Animated.View style={[
          styles.headerContent,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}>
          {weather && (
            <WeatherAnimation 
              weatherCode={weather.weatherCode} 
              isDay={weather.isDay} 
            />
          )}
          <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
          <Text style={styles.feelsLike}>Feels like {Math.round(weather.feelsLike)}°C</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.detailsContainer}>
        <View style={styles.detailsRow}>
          <Animated.View style={[
            styles.detailCard,
            styles.detailCardHalf,
            {
              opacity: fadeAnim,
              transform: [{ translateY: detailSlideAnims[0] }],
            },
          ]}>
            <BlurView intensity={80} style={styles.detailContent}>
              <Text style={{ fontSize: 24 }}>💧</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Precipitation</Text>
                <Text style={styles.detailValue}>
                  {weather.precipitation > 0 ? `${weather.precipitation}mm` : 'None'}
                </Text>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View style={[
            styles.detailCard,
            styles.detailCardHalf,
            {
              opacity: fadeAnim,
              transform: [{ translateY: detailSlideAnims[1] }],
            },
          ]}>
            <BlurView intensity={80} style={styles.detailContent}>
              <Text style={{ fontSize: 24 }}>🌬️</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Wind</Text>
                <Text style={styles.detailValue}>
                  {weather.windSpeed} km/h
                  {weather.windGusts > 30 && (
                    <Text style={styles.warningText}> ⚠️ Gusts up to {weather.windGusts} km/h</Text>
                  )}
                </Text>
              </View>
            </BlurView>
          </Animated.View>
        </View>

        <View style={styles.detailsRow}>
          <Animated.View style={[
            styles.detailCard,
            styles.detailCardHalf,
            {
              opacity: fadeAnim,
              transform: [{ translateY: detailSlideAnims[2] }],
            },
          ]}>
            <BlurView intensity={80} style={styles.detailContent}>
              <Text style={{ fontSize: 24 }}>☁️</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Cloud Cover</Text>
                <Text style={styles.detailValue}>{weather.cloudCover}%</Text>
              </View>
            </BlurView>
          </Animated.View>

          <Animated.View style={[
            styles.detailCard,
            styles.detailCardHalf,
            {
              opacity: fadeAnim,
              transform: [{ translateY: detailSlideAnims[0] }],
            },
          ]}>
            <BlurView intensity={80} style={styles.detailContent}>
              <Text style={{ fontSize: 24 }}>☀️</Text>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>UV Index</Text>
                <Text style={styles.detailValue}>
                  {weather.uvIndex}
                  {weather.uvIndex > 6 && <Text style={styles.warningText}> ⚠️ High</Text>}
                </Text>
              </View>
            </BlurView>
          </Animated.View>
        </View>

        {weather && (
          <HourlyForecast 
            hourly={weather.hourly} 
            fadeAnim={fadeAnim}
            slideAnim={detailSlideAnims[2]}
          />
        )}

        <Animated.View style={[
          styles.forecastContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: detailSlideAnims[2] }],
          },
        ]}>
          <Text style={styles.forecastTitle}>5-Day Forecast</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.forecastScroll}
          >
            {weather.forecast?.slice(1, 6).map((day: WeatherData['forecast'][0], index: number) => (
              <ForecastDay
                key={index}
                date={formatForecastDate(day.date)}
                temp={day.temperature}
                icon={day.weatherIcon}
                isDay={day.isDay}
              />
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View style={[
          styles.sunTimesCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: detailSlideAnims[1] }],
          },
        ]}>
          <BlurView intensity={80} style={styles.sunTimesContent}>
            <View style={styles.sunTimesRow}>
              <View style={styles.sunTime}>
                <Text style={{ fontSize: 24 }}>🌞</Text>
                <Text style={styles.sunTimeText}>Sunrise: {formatTime(weather.sunrise)}</Text>
              </View>
              <View style={styles.sunTime}>
                <Text style={{ fontSize: 24 }}>🌙</Text>
                <Text style={styles.sunTimeText}>Sunset: {formatTime(weather.sunset)}</Text>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>

      <Modal
        visible={searchModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={100} style={styles.modalContent}>
            <View style={styles.searchContainer}>
              <Text style={{ fontSize: 24 }}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a city..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
              <Text style={{ fontSize: 24 }}>❌</Text>
            </View>
            <ScrollView style={styles.searchResults}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.searchResult}
                  onPress={() => handleLocationSelect(result)}
                >
                  <Text style={{ fontSize: 24 }}>📍</Text>
                  <Text style={styles.searchResultText}>{result.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </BlurView>
        </View>
      </Modal>
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
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    minHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  temperature: {
    fontSize: 84,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  feelsLike: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 30,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  detailCardHalf: {
    width: '48%',
  },
  detailContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  detailInfo: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 15,
    color: '#7F8C8D',
    marginBottom: 6,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  warningText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  sunTimesCard: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  sunTimesContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  sunTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sunTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sunTimeText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
  forecastContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  forecastScroll: {
    flexDirection: 'row',
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: 25,
    minWidth: 80,
  },
  forecastDate: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: '500',
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  hourlyContainer: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  hourlyScroll: {
    flexDirection: 'row',
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
    fontWeight: '500',
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
  },
  hourlyPrecip: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 4,
  },
  locationContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  refreshLocationButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
    paddingVertical: 8,
  },
  searchResults: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
  },
  searchResultText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#2C3E50',
    fontWeight: '500',
  },
  weatherAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rainDrop: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#4A90E2',
    borderRadius: 1,
    top: 0,
  },
  snowFlake: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    top: 0,
  },
  cloudContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    opacity: 0.7,
  },
}); 

function setError(arg0: string) {
  throw new Error('Function not implemented.');
}
