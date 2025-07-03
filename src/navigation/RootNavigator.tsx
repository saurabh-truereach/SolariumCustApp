/**
 * Root Navigator
 * Main navigation container with deep linking and state persistence
 */

import React, {useEffect, useState} from 'react';
import {
  NavigationContainer,
  useNavigationContainerRef,
  DefaultTheme,
} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import type {RootStackParamList} from './types';
import {linkingConfig, NAVIGATION_PERSISTENCE_KEY} from './types';
import {getStorageItem, setStorageItem} from '../utils/storageHelpers';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import {ServiceDetailScreen} from '../screens';
// import RoleBasedGuard from './roleBasedGuard';
import {useAppSelector} from '../hooks/useTypedRedux';
import {selectIsLoggedIn} from '../store/authSlice';
import {useAppTheme} from '../theme/ThemeProvider';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 */
const RootNavigator: React.FC = () => {
  const theme = useAppTheme();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const navigationRef = useNavigationContainerRef();
  
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  /**
   * Load persisted navigation state
   */
  useEffect(() => {
    const restoreState = async () => {
      try {
        const state = await getStorageItem(NAVIGATION_PERSISTENCE_KEY);

        if (state !== null) {
          setInitialState(state);
        }
      } catch (e) {
        console.warn('[Navigation] Failed to restore navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  /**
   * Persist navigation state changes
   */
  const onStateChange = (state: any) => {
    if (isReady && state) {
      setStorageItem(NAVIGATION_PERSISTENCE_KEY, state).catch((e: any) => {
        console.warn('[Navigation] Failed to persist navigation state:', e);
      });
    }
  };

  /**
   * Handle deep link
   */
  const onReady = () => {
    console.log('[Navigation] Navigation container ready');
  };

  if (!isReady) {
    // You could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linkingConfig}
      initialState={initialState}
      onStateChange={onStateChange}
      onReady={onReady}
      theme={{
        ...DefaultTheme,
        dark: false,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          notification: theme.colors.error,
        },
      }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: {
            backgroundColor: theme.colors.background,
          },
        }}>
        {isLoggedIn ? (
          // Authenticated Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ServiceDetail"
              component={ServiceDetailScreen}
              options={{
                headerShown: true,
                title: 'Service Detail',
                headerStyle: {
                  backgroundColor: theme.colors.primary,
                },
                headerTintColor: theme.colors.onPrimary,
              }}
            />
          </>
        ) : (
          // Unauthenticated Stack
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
