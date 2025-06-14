import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useWeather } from '../context/WeatherContext';

// --- Weather Insights Dashboard ---
const WeatherInsightsDashboard = ({ forecast }: { forecast: any[] }) => {
  if (!forecast || forecast.length === 0) return null;
  const temps = forecast.map(day => day.temperature);
  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 'N/A';
  const rainDays = forecast.filter(day => day.weatherIcon === '🌧️' || day.weatherIcon === '🌦️').length;
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);
  const barWidth = forecast.length > 10 ? 12 : 18;
  return (
    <View style={styles.dashboardContainer}>
      <View style={styles.dashboardSummaryRow}>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardCardLabel}>Avg. Temp</Text>
          <Text style={styles.dashboardCardValue}>{avgTemp}°C</Text>
        </View>
        <View style={styles.dashboardCard}>
          <Text style={styles.dashboardCardLabel}>Rainy Days</Text>
          <Text style={styles.dashboardCardValue}>{rainDays} / {temps.length}</Text>
        </View>
      </View>
      <Text style={styles.dashboardChartTitle}>This Month's Temperature</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dashboardBarChartScroll}>
        <View style={[styles.dashboardBarChart, { width: Math.max(forecast.length * (barWidth + 10), 320) }]}> 
          {forecast.map((day, idx) => {
            const isRainy = day.weatherIcon === '🌧️' || day.weatherIcon === '🌦️';
            const barHeight = ((day.temperature - minTemp) / (maxTemp - minTemp + 1e-6)) * 80 + 20;
            return (
              <View key={idx} style={styles.dashboardBarItem}>
                <View style={[styles.dashboardBar, { height: barHeight, width: barWidth, backgroundColor: isRainy ? '#4A90E2' : '#FFA500' }]} />
                <Text style={styles.dashboardBarLabel}>{Math.round(day.temperature)}°</Text>
                <Text style={styles.dashboardBarDay}>{new Date(day.date).getDate()}</Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default function SmartFeaturesScreen() {
  const { weather } = useWeather();

  // --- Smart Alerts ---
  const getSmartAlerts = () => {
    if (!weather) return [];
    const alerts = [];
    if (weather.precipitation > 0) alerts.push('Rain expected. Bring an umbrella!');
    if (weather.uvIndex > 6) alerts.push('High UV index. Wear sunscreen!');
    if (weather.windGusts > 30) alerts.push('Strong wind gusts. Be careful outdoors!');
    if (weather.temperature > 35) alerts.push('Extreme heat. Stay hydrated!');
    if (weather.temperature < 0) alerts.push('Freezing temperatures. Dress warmly!');
    return alerts;
  };

  // --- Improved Activity Suggestions ---
  const getActivitySuggestions = (weather: any) => {
    if (!weather) return [];
    const temp = weather.temperature;
    const isRaining = weather.precipitation > 0;
    const windSpeed = weather.windSpeed;
    const uvIndex = weather.uvIndex;
    const suggestions = [];

    if (temp > 28 && !isRaining && windSpeed < 15) {
      suggestions.push({
        emoji: '🏊',
        title: 'Go Swimming',
        tip: 'Great for hot, sunny days!'
      });
      suggestions.push({
        emoji: '🍦',
        title: 'Get Ice Cream',
        tip: 'Cool off with a treat.'
      });
      suggestions.push({
        emoji: '🧢',
        title: 'Wear a Hat',
        tip: 'Protect yourself from the sun.'
      });
    }
    if (temp > 18 && temp <= 28 && !isRaining) {
      suggestions.push({
        emoji: '🥾',
        title: 'Go Hiking',
        tip: 'Perfect for mild, dry weather.'
      });
      suggestions.push({
        emoji: '🚴',
        title: 'Bike Ride',
        tip: 'Enjoy the fresh air.'
      });
      suggestions.push({
        emoji: '🌳',
        title: 'Picnic in the Park',
        tip: 'Pack a lunch and relax.'
      });
    }
    if (isRaining) {
      suggestions.push({
        emoji: '☔',
        title: 'Read a Book',
        tip: 'Stay cozy indoors.'
      });
      suggestions.push({
        emoji: '🎬',
        title: 'Movie Marathon',
        tip: 'Perfect for rainy days.'
      });
      suggestions.push({
        emoji: '🍲',
        title: 'Try a New Recipe',
        tip: 'Cook something warm and delicious.'
      });
    }
    if (temp < 10) {
      suggestions.push({
        emoji: '☕',
        title: 'Hot Drinks',
        tip: 'Warm up with tea or coffee.'
      });
      suggestions.push({
        emoji: '🏛️',
        title: 'Visit a Museum',
        tip: 'Great for cold days.'
      });
    }
    if (windSpeed > 20) {
      suggestions.push({
        emoji: '🪁',
        title: 'Fly a Kite',
        tip: 'If it\'s not raining, enjoy the wind!'
      });
      suggestions.push({
        emoji: '🧥',
        title: 'Wear a Windbreaker',
        tip: 'Stay comfortable outdoors.'
      });
    }
    if (uvIndex > 6) {
      suggestions.push({
        emoji: '🧴',
        title: 'Apply Sunscreen',
        tip: 'Protect your skin from UV.'
      });
    }
    // Always add a fallback
    if (suggestions.length === 0) {
      suggestions.push({
        emoji: '📚',
        title: 'Learn Something New',
        tip: 'Explore a new hobby or skill.'
      });
    }
    return suggestions;
  };

  // --- Weather Insights Dashboard ---
  const getWeatherInsights = () => {
    if (!weather) return null;
    // Use available forecast data for insights
    const temps = weather.forecast?.map(day => day.temperature) || [];
    const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : 'N/A';
    const rainDays = weather.forecast?.filter(day => day.weatherIcon === '🌧️' || day.weatherIcon === '🌦️').length || 0;
    return { avgTemp, rainDays, totalDays: temps.length };
  };
  const insights = getWeatherInsights();

  const getClothingRecommendations = () => {
    if (!weather) return [];
    
    const recommendations = [];
    const temp = weather.temperature;
    const isRaining = weather.precipitation > 0;
    const windSpeed = weather.windSpeed;

    if (temp > 25) {
      recommendations.push('Light, breathable clothing');
      recommendations.push('Sunscreen recommended');
      recommendations.push('Hat and sunglasses');
    } else if (temp > 20) {
      recommendations.push('Light layers');
      recommendations.push('Comfortable walking shoes');
    } else if (temp > 15) {
      recommendations.push('Light jacket or sweater');
      recommendations.push('Long pants recommended');
    } else {
      recommendations.push('Warm jacket');
      recommendations.push('Layers recommended');
      recommendations.push('Gloves and hat if windy');
    }

    if (isRaining) {
      recommendations.push('Waterproof jacket or umbrella');
      recommendations.push('Waterproof shoes');
    }

    if (windSpeed > 20) {
      recommendations.push('Windbreaker recommended');
    }

    return recommendations;
  };

  const getBestTimeToGoOutside = () => {
    if (!weather) return 'No weather data available';
    
    const temp = weather.temperature;
    const isRaining = weather.precipitation > 0;
    const uvIndex = weather.uvIndex;
    const windSpeed = weather.windSpeed;

    if (isRaining) {
      return 'Better to stay indoors today';
    }

    if (temp > 25 && uvIndex > 6) {
      return 'Early morning or evening recommended';
    }

    if (windSpeed > 20) {
      return 'Wait for calmer conditions';
    }

    return 'Current conditions are good for outdoor activities';
  };

  const getAirQualityStatus = () => {
    if (!weather) return 'No data available';
    
    // This would normally come from an air quality API
    const aqi = 45; // Example value
    
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getPollenCount = () => {
    if (!weather) return 'No data available';
    
    // This would normally come from a pollen API
    const pollenCount = 'Low';
    return pollenCount;
  };

  const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: string }) => {
    return (
      <View style={styles.featureCard}>
        <BlurView intensity={80} style={styles.featureContent}>
          <Text style={{ fontSize: 32 }}>{icon}</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>{title}</Text>
            <Text style={styles.featureDescription}>{description}</Text>
          </View>
        </BlurView>
      </View>
    );
  };

  const features = [
    {
      title: 'Smart Alerts',
      description: 'Get notified about weather changes that might affect your plans',
      icon: '🔔'
    },
    {
      title: 'Activity Suggestions',
      description: 'Get personalized activity suggestions based on the weather',
      icon: '🎯'
    },
    {
      title: 'Weather Insights',
      description: 'Learn more about weather patterns and their impact',
      icon: '📊'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Smart Alerts */}
      <View style={styles.featureCard}>
        <BlurView intensity={80} style={styles.featureContent}>
          <Text style={{ fontSize: 32 }}>🔔</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Smart Alerts</Text>
            {getSmartAlerts().length > 0 ? (
              getSmartAlerts().map((alert, idx) => (
                <Text key={idx} style={styles.featureDescription}>{alert}</Text>
              ))
            ) : (
              <Text style={styles.featureDescription}>No weather alerts right now.</Text>
            )}
          </View>
        </BlurView>
      </View>

      {/* Activity Suggestions */}
      <View style={styles.featureCard}>
        <BlurView intensity={80} style={styles.featureContent}>
          <Text style={{ fontSize: 32 }}>🎯</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Activity Suggestions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
              {getActivitySuggestions(weather).map((s, idx) => (
                <View key={idx} style={styles.suggestionCard}>
                  <Text style={styles.suggestionEmoji}>{s.emoji}</Text>
                  <Text style={styles.suggestionTitle}>{s.title}</Text>
                  <Text style={styles.suggestionTip}>{s.tip}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </BlurView>
      </View>

      {/* Weather Insights Dashboard */}
      <View style={styles.featureCard}>
        <BlurView intensity={80} style={styles.featureContent}>
          <Text style={{ fontSize: 32 }}>📊</Text>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Weather Insights</Text>
            {weather && weather.forecast ? (
              <WeatherInsightsDashboard forecast={weather.forecast} />
            ) : (
              <Text style={styles.featureDescription}>No insights available.</Text>
            )}
          </View>
        </BlurView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 15,
  },
  featureCard: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  featureContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  featureInfo: {
    marginLeft: 10,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  featureDescription: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 22,
  },
  dashboardContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  dashboardSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dashboardCard: {
    flex: 1,
    backgroundColor: '#E8F4F8',
    borderRadius: 10,
    marginHorizontal: 5,
    padding: 10,
    alignItems: 'center',
  },
  dashboardCardLabel: {
    fontSize: 13,
    color: '#4A90E2',
    fontWeight: '600',
  },
  dashboardCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  dashboardChartTitle: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  dashboardBarChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginTop: 4,
  },
  dashboardBarItem: {
    alignItems: 'center',
    flex: 1,
  },
  dashboardBar: {
    width: 18,
    borderRadius: 6,
    marginBottom: 4,
  },
  dashboardBarLabel: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  dashboardBarDay: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
  },
  dashboardBarChartScroll: {
    marginTop: 4,
  },
  suggestionsScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  suggestionCard: {
    backgroundColor: '#E8F4F8',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  suggestionEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
    textAlign: 'center',
  },
  suggestionTip: {
    fontSize: 12,
    color: '#4A90E2',
    textAlign: 'center',
  },
}); 