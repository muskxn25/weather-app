import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { WeatherProvider } from './src/context/WeatherContext.tsx';
import HomeScreen from './src/screens/HomeScreen.tsx';
import WeatherMapsScreen from './src/screens/WeatherMapsScreen.tsx';
import SmartFeaturesScreen from './src/screens/SmartFeaturesScreen.tsx';

type RootTabParamList = {
  Weather: undefined;
  Maps: undefined;
  Smart: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <WeatherProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }: { route: { name: keyof RootTabParamList } }) => ({
            tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => {
              let iconText = '';

              if (route.name === 'Weather') {
                iconText = '🌤️';
              } else if (route.name === 'Maps') {
                iconText = '🗺️';
              } else if (route.name === 'Smart') {
                iconText = '💡';
              }

              return <Text style={{ fontSize: 24 }}>{iconText}</Text>;
            },
            tabBarActiveTintColor: '#4A90E2',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: 'white',
              borderTopWidth: 1,
              borderTopColor: 'rgba(0, 0, 0, 0.1)',
              paddingBottom: 5,
              paddingTop: 5,
            },
            headerStyle: {
              backgroundColor: '#4A90E2',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Weather" 
            component={HomeScreen}
            options={{
              title: 'Weather',
            }}
          />
          <Tab.Screen 
            name="Maps" 
            component={WeatherMapsScreen}
            options={{
              title: 'Weather Maps',
            }}
          />
          <Tab.Screen 
            name="Smart" 
            component={SmartFeaturesScreen}
            options={{
              title: 'Smart Features',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </WeatherProvider>
  );
}
 