/**
 * Authentication Stack Navigator
 * Handles login and registration screens
 */

import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import {LoginScreen} from '../screens';
import {useAppTheme} from '../theme/ThemeProvider';
import type {AuthStackParamList} from './types';

const Stack = createStackNavigator<AuthStackParamList>();

/**
 * Auth Stack Navigator
 */
const AuthStack: React.FC = () => {
  const theme = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Welcome to Solarium',
          headerShown: false, // Login screen has its own header design
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthStack;
