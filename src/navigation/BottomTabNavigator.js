import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import CabinetScreen from '../screens/CabinetScreen';
import TrendsScreen from '../screens/TrendsScreen';
import SettingsScreen from '../screens/SettingsScreen';

import IconToday from '../assets/today.svg';
import IconCabinet from '../assets/Container.svg';
import IconTrends from '../assets/Margin (1).svg';
import IconSetting from '../assets/Margin (2).svg';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Today') {
            return <IconToday width={size} height={size} color={color} />;
          } else if (route.name === 'Cabinet') {
            return <IconCabinet width={size} height={size} color={color} />;
          } else if (route.name === 'Trends') {
            return <IconTrends width={size} height={size} color={color} />;
          } else if (route.name === 'Setting') {
            return <IconSetting width={size} height={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: '#0285FF',
        tabBarInactiveTintColor: '#CBD5E1',
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 12,
          paddingTop: 8,
          height: 68,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Today" component={HomeScreen} />
      <Tab.Screen name="Cabinet" component={CabinetScreen} />
      <Tab.Screen name="Trends" component={TrendsScreen} />
      <Tab.Screen name="Setting" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
