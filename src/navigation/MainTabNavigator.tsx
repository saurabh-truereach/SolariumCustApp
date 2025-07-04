/**
 * Main Tab Navigator
 * Bottom tab navigation for authenticated users
 */

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  HomeScreen,
  ServicesScreen,
  MyRecordsScreen,
  DocumentsScreen,
  HelpScreen,
} from '../screens';
import {useAppTheme} from '../theme/ThemeProvider';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const HomeTabIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialIcons name="home" size={size} color={color} />
);
const ServicesTabIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialIcons name="solar-power" size={size} color={color} />
);
const MyRecordsTabIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialIcons name="folder" size={size} color={color} />
);
const DocumentsTabIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialIcons name="description" size={size} color={color} />
);
const HelpTabIcon = ({color, size}: {color: string; size: number}) => (
  <MaterialIcons name="help" size={size} color={color} />
);

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
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: HomeTabIcon,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{
          title: 'Services',
          tabBarIcon: ServicesTabIcon,
        }}
      />
      <Tab.Screen
        name="MyRecords"
        component={MyRecordsScreen}
        options={{
          title: 'My Records',
          tabBarIcon: MyRecordsTabIcon,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          title: 'Documents',
          tabBarIcon: DocumentsTabIcon,
        }}
      />
      <Tab.Screen
        name="Help"
        component={HelpScreen}
        options={{
          title: 'Help',
          tabBarIcon: HelpTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
