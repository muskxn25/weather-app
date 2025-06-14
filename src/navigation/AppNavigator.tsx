import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? '🌞' : '🌞';
            } else if (route.name === 'Activities') {
              iconName = focused ? '🏄' : '🏄';
            } else if (route.name === 'Notifications') {
              iconName = focused ? '🔔' : '🔔';
            }

            return <Text style={{ fontSize: size, color: color }}>{iconName}</Text>;
          },
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 10,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            tabBarLabel: 'Weather',
          }}
        />
        <Tab.Screen 
          name="Activities" 
          component={ActivitiesScreen}
          options={{
            tabBarLabel: 'Activities',
          }}
        />
        <Tab.Screen 
          name="Notifications" 
          component={NotificationsScreen}
          options={{
            tabBarLabel: 'Alerts',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 