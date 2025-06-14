import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Switch, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { getWeatherData, getNotifications, WeatherAlert } from '../services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useWeather } from '../context/WeatherContext';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NotificationsScreen() {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    checkNotificationPermissions();
    fetchAlerts();
  }, []);

  const checkNotificationPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      // Enable notifications
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        // Send initial notifications
        await sendNotifications();
      }
    } else {
      // Disable notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotificationsEnabled(false);
    }
  };

  const sendNotifications = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const weatherAlerts = await getNotifications(location.coords.latitude, location.coords.longitude);
      
      // Send notifications for each alert
      for (const alert of weatherAlerts) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: alert.type,
            body: alert.description,
            data: { alert },
          },
          trigger: null, // null trigger means show immediately
        });
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const weatherData = await getWeatherData(location.coords.latitude, location.coords.longitude);
      const weatherAlerts = await getNotifications(location.coords.latitude, location.coords.longitude);
      
      setAlerts(weatherAlerts);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Alerts fetch error:', err);
      setError('Failed to fetch weather alerts');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FF4B4B';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#4CAF50';
      default:
        return '#4A90E2';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Fetching weather alerts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ fontSize: 50 }}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchAlerts}>
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
        <Text style={styles.headerTitle}>Weather Alerts</Text>
        <Text style={styles.headerSubtitle}>Stay informed about weather changes</Text>
      </LinearGradient>

      <View style={styles.notificationSettings}>
        <BlurView intensity={80} style={styles.settingsContent}>
          <View style={styles.settingRow}>
            <Text style={{ fontSize: 24 }}>🔔</Text>
            <Text style={styles.settingText}>
              {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={notificationsEnabled ? '#4A90E2' : '#f4f3f4'}
            />
          </View>
        </BlurView>
      </View>

      <Animated.View style={[styles.alertsContainer, { opacity: fadeAnim }]}>
        {alerts.length === 0 ? (
          <View style={styles.noAlertsContainer}>
            <Text style={{ fontSize: 50 }}>✅</Text>
            <Text style={styles.noAlertsText}>No weather alerts at this time</Text>
          </View>
        ) : (
          alerts.map((alert, index) => (
            <View key={index} style={styles.alertCard}>
              <BlurView intensity={80} style={styles.alertContent}>
                <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(alert.severity) }]} />
                <View style={styles.alertInfo}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={styles.alertTime}>{formatDate(alert.time)}</Text>
                  <Text style={styles.alertDescription}>{alert.description}</Text>
                </View>
              </BlurView>
            </View>
          ))
        )}
      </Animated.View>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchAlerts}>
        <Text style={{ fontSize: 24 }}>🔄</Text>
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
    minHeight: 150,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  notificationSettings: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  settingsContent: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: {
    fontSize: 16,
    color: '#2C3E50',
    flex: 1,
    marginLeft: 15,
  },
  alertsContainer: {
    padding: 20,
  },
  noAlertsContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
  },
  noAlertsText: {
    marginTop: 15,
    fontSize: 18,
    color: '#2C3E50',
    textAlign: 'center',
  },
  alertCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  alertContent: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  severityIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 15,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  alertTime: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  alertDescription: {
    fontSize: 16,
    color: '#34495E',
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