/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import type {MainTabParamList} from './types';
import {
  HomeScreen,
  ServicesScreen,
  MyRecordsScreen,
  DocumentsScreen,
  HelpScreen,
} from '../screens';
import {useAppTheme} from '../theme/ThemeProvider';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Tab Navigator
 */
const MainTabNavigator: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: 'Services',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="solar-power" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MyRecords"
        component={MyRecordsScreen}
        options={{
          title: 'My Records',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          title: 'Documents',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="description" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Help',
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="help" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
