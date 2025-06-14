import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useWeather } from '../context/WeatherContext';
import { getActivitySuggestions, ActivitySuggestion } from '../services/weatherService';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ActivitiesScreen() {
  const { weather, loading, error } = useWeather();
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<number | null>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef<Animated.Value[]>([]).current;
  const scaleAnims = useRef<Animated.Value[]>([]).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnims = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    if (weather) {
      const activitySuggestions = getActivitySuggestions(weather.weatherCode, weather.isDay);
      setSuggestions(activitySuggestions);
      
      // Initialize animation values
      slideAnims.length = 0;
      scaleAnims.length = 0;
      iconRotateAnims.length = 0;
      activitySuggestions.forEach(() => {
        slideAnims.push(new Animated.Value(0));
        scaleAnims.push(new Animated.Value(1));
        iconRotateAnims.push(new Animated.Value(0));
      });

      // Reset animations
      fadeAnim.setValue(0);
      headerSlideAnim.setValue(-50);
      headerFadeAnim.setValue(0);
      slideAnims.forEach(anim => anim.setValue(0));
      scaleAnims.forEach(anim => anim.setValue(1));
      iconRotateAnims.forEach(anim => anim.setValue(0));

      // Start animations
      Animated.parallel([
        // Header animations
        Animated.sequence([
          Animated.timing(headerSlideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
          Animated.timing(headerFadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        // Content fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Activity cards animations
        ...slideAnims.map((anim, index) => 
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 800,
              delay: index * 200,
              useNativeDriver: true,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            Animated.timing(iconRotateAnims[index], {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
              easing: Easing.elastic(1),
            }),
          ])
        ),
      ]).start();
    }
  }, [weather]);

  const handleActivityPress = (index: number) => {
    const newSelected = selectedActivity === index ? null : index;
    setSelectedActivity(newSelected);

    // Animate the selected card
    Animated.parallel([
      Animated.spring(scaleAnims[index], {
        toValue: newSelected === index ? 1.05 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(iconRotateAnims[index], {
        toValue: newSelected === index ? 1 : 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </Animated.View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#4A90E2', '#87CEEB']}
        style={styles.header}
      >
        <Animated.View style={[
          styles.headerContent,
          {
            opacity: headerFadeAnim,
            transform: [{ translateY: headerSlideAnim }],
          },
        ]}>
          <Text style={styles.headerTitle}>Activity Suggestions</Text>
          <Text style={styles.headerSubtitle}>Based on current weather</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.activitiesContainer}>
        {suggestions.map((activity, index) => {
          const slideAnim = slideAnims[index] || new Animated.Value(0);
          const scaleAnim = scaleAnims[index] || new Animated.Value(1);
          const rotateAnim = iconRotateAnims[index] || new Animated.Value(0);
          
          return (
            <Animated.View
              key={index}
              style={[
                styles.activityCard,
                {
                  opacity: slideAnim,
                  transform: [
                    {
                      translateX: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [index % 2 === 0 ? -width : width, 0],
                      }),
                    },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handleActivityPress(index)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.activityContent,
                  selectedActivity === index && styles.selectedActivityContent
                ]}>
                  <BlurView intensity={80} style={styles.activityBlur}>
                    <Animated.View style={[
                      styles.iconContainer,
                      {
                        transform: [{
                          rotate: rotateAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        }],
                      },
                    ]}>
                      <Text style={styles.activityIcon}>🏋️</Text>
                    </Animated.View>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                      {selectedActivity === index && (
                        <Animated.View
                          style={[
                            styles.activityDetails,
                            {
                              opacity: fadeAnim,
                              transform: [{
                                translateY: fadeAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [10, 0],
                                }),
                              }],
                            },
                          ]}
                        >
                          <Text style={styles.activityType}>
                            {activity.type === 'indoor' ? 'Indoor Activity' : 'Outdoor Activity'}
                          </Text>
                          <TouchableOpacity 
                            style={styles.detailsButton}
                            onPress={() => {
                              // Add haptic feedback here if needed
                            }}
                          >
                            <Text style={styles.detailsButtonText}>View Details</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      )}
                    </View>
                  </BlurView>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
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
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    minHeight: 150,
  },
  headerContent: {
    alignItems: 'center',
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
  activitiesContainer: {
    padding: 20,
  },
  activityCard: {
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  activityContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  selectedActivityContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activityBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 25,
  },
  activityInfo: {
    marginLeft: 15,
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  activityDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  activityType: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  detailsButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  activityIcon: {
    fontSize: 24,
    color: '#4A90E2',
  },
}); 