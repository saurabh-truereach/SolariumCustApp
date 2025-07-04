/**
 * Navigation Types
 * Defines TypeScript types for all navigation stacks and screens
 */

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NavigatorScreenParams} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';

/**
 * Root Stack Navigator Params
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  // Modal screens can be added here
  ServiceDetail: {leadId: string};
};

/**
 * Authentication Stack Params
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/**
 * Main Tab Navigator Params
 */
export type MainTabParamList = {
  Home: undefined;
  Services: undefined;
  MyRecords: undefined;
  Documents: undefined;
  Help: undefined;
};

/**
 * Navigation Props Types
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/**
 * Deep Link Configuration
 */
export const linkingConfig = {
  prefixes: ['solarium://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Services: 'services',
          MyRecords: 'records',
          Documents: 'documents',
          Help: 'help',
        },
      },
      ServiceDetail: 'lead/:leadId',
    },
  },
};

/**
 * Navigation State Persistence Key
 */
export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';
