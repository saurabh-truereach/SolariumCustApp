/**
 * Jest Setup File
 * Global test configuration and mocks
 */

import 'react-native-gesture-handler/jestSetup';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock Encrypted Storage
jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native Config
jest.mock('react-native-config', () => ({
  BASE_API_URL: 'https://api.test.solarium.in',
  APP_ENV: 'test',
  API_TIMEOUT: '5000',
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({children}) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setParams: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    params: {},
    key: 'test-route',
    name: 'TestScreen',
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
  useNavigationContainerRef: () => ({current: null}),
}));

// Mock React Navigation Stack
jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
  CardStyleInterpolators: {
    forHorizontalIOS: {},
  },
  TransitionPresets: {
    SlideFromRightIOS: {},
  },
}));

// Mock React Navigation Bottom Tabs
jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}) => children,
    Screen: ({children}) => children,
  }),
}));

// Mock React Native Vector Icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

// Mock React Native Paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');

  return {
    // Provider
    PaperProvider: ({children}) => children,
    DefaultTheme: {},
    MD3LightTheme: {colors: {}, fonts: {}},
    configureFonts: jest.fn(() => ({})),

    // Components
    Button: ({children, onPress, ...props}) =>
      React.createElement(RN.TouchableOpacity, {onPress, ...props}, children),
    Card: {
      Content: ({children}) => children,
      Actions: ({children}) => children,
      Cover: ({children}) => children,
      Title: ({children}) => children,
    },
    Text: ({children, ...props}) =>
      React.createElement(RN.Text, props, children),
    TextInput: React.forwardRef((props, ref) =>
      React.createElement(RN.TextInput, {ref, ...props})
    ),
    Surface: ({children, ...props}) =>
      React.createElement(RN.View, props, children),
    Portal: ({children}) => children,
    Modal: ({children, visible, ...props}) =>
      visible ? React.createElement(RN.View, props, children) : null,
    Snackbar: ({children, visible, ...props}) =>
      visible ? React.createElement(RN.View, props, children) : null,
    FAB: props => React.createElement(RN.TouchableOpacity, props),
    Chip: ({children, ...props}) =>
      React.createElement(RN.TouchableOpacity, props, children),
    Avatar: {
      Text: ({children, ...props}) =>
        React.createElement(RN.View, props, children),
      Image: props => React.createElement(RN.Image, props),
      Icon: props => React.createElement(RN.View, props),
    },

    // Hooks
    useTheme: () => ({
      colors: {
        primary: '#2E7D32',
        onPrimary: '#FFFFFF',
        secondary: '#1976D2',
        onSecondary: '#FFFFFF',
        background: '#FFFFFF',
        onBackground: '#000000',
        surface: '#F8F9FA',
        onSurface: '#000000',
        error: '#F44336',
        onError: '#FFFFFF',
        outline: '#E0E0E0',
      },
      fonts: {},
    }),
  };
});

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}) => children,
  PanGestureHandler: ({children}) => children,
  State: {},
  Directions: {},
}));

// Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}) => children,
  SafeAreaView: ({children}) => children,
  useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
  useSafeAreaFrame: () => ({x: 0, y: 0, width: 375, height: 812}),
}));

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({width: 375, height: 812})),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Appearance
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(),
  removeChangeListener: jest.fn(),
}));

// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
  prompt: jest.fn(),
}));

// Mock Keyboard
jest.mock('react-native/Libraries/Components/Keyboard/Keyboard', () => ({
  addListener: jest.fn(() => ({remove: jest.fn()})),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  Version: '14.0',
  isPad: false,
  isTesting: true,
  select: jest.fn(obj => obj.ios || obj.default),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: () => ({isConnected: true}),
}));

// Global test utilities
global.requestAnimationFrame = cb => {
  setTimeout(cb, 0);
};

global.cancelAnimationFrame = id => {
  clearTimeout(id);
};

// Silence console warnings during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers for testing
jest.useFakeTimers();

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.useFakeTimers();
});
