import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type MapType = 'temperature' | 'precipitation' | 'wind' | 'air-quality' | 'radar';

const MAP_OPTIONS: { type: MapType; icon: string; label: string; image: string }[] = [
  {
    type: 'temperature',
    icon: '🌡️',
    label: 'Temperature',
    image: 'https://eoimages.gsfc.nasa.gov/images/imagerecords/146000/146593/land_ocean_ice_202012.png',
  },
  {
    type: 'precipitation',
    icon: '🌧️',
    label: 'Precipitation',
    image: 'https://www.ncei.noaa.gov/sites/default/files/2023-07/GlobalPrecipAnomalyMap.png',
  },
  {
    type: 'wind',
    icon: '💨',
    label: 'Wind',
    image: 'https://www.windy.com/images/windy/wind-forecast.jpg',
  },
  {
    type: 'air-quality',
    icon: '🍃',
    label: 'Air Quality',
    image: 'https://waqi.info/images/world-map.png',
  },
  {
    type: 'radar',
    icon: '🛰️',
    label: 'Radar',
    image: 'https://cdn.star.nesdis.noaa.gov/GOES16/ABI/CONUS/GEOCOLOR/GOES16-CONUS-GEOCOLOR-900x540.jpg',
  },
];

export default function WeatherMapsScreen() {
  const [selectedMap, setSelectedMap] = useState<MapType>('temperature');
  const selectedOption = MAP_OPTIONS.find(opt => opt.type === selectedMap);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4A90E2', '#87CEEB']} style={styles.header}>
        <Text style={styles.headerTitle}>Weather Maps</Text>
      </LinearGradient>
      <View style={styles.buttonRow}>
        {MAP_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.type}
            style={[styles.mapButton, selectedMap === option.type && styles.selectedMapButton]}
            onPress={() => setSelectedMap(option.type)}
            activeOpacity={0.8}
          >
            <Text style={[styles.mapButtonIcon, selectedMap === option.type && styles.selectedMapButtonIcon]}>{option.icon}</Text>
            <Text style={[styles.mapButtonLabel, selectedMap === option.type && styles.selectedMapButtonLabel]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: selectedOption?.image || '' }}
          style={styles.map}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 18,
    marginTop: 10,
  },
  mapButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 4,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 18,
    minWidth: 70,
    maxWidth: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedMapButton: {
    backgroundColor: '#E8F4F8',
    borderColor: '#4A90E2',
    elevation: 4,
  },
  mapButtonIcon: {
    fontSize: 28,
    marginBottom: 4,
    color: '#2C3E50',
  },
  selectedMapButtonIcon: {
    color: '#4A90E2',
  },
  mapButtonLabel: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 15,
  },
  selectedMapButtonLabel: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: width - 32,
    height: 240,
    borderRadius: 20,
  },
}); 