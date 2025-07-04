/**
 * Solarium Customer App
 * Main application entry point with react-native-config integration
 * 
 * Environment Handling:
 * - Production: Uses build-time configuration from react-native-config
 * - Development: Allows runtime environment simulation for testing
 */

/**
 * Solarium Customer App
 * Main application entry point with navigation, theming, and Redux
 * Enhanced with comprehensive persistence handling
 */

import React, {useState, useEffect} from 'react';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet, AppState, AppStateStatus} from 'react-native';
import {store, persistor, storeUtils} from './store';
import {ErrorBoundary, LoadingOverlay} from './components';
import { PersistenceLoadingOverlay } from './components/feedback/LoadingOverlay';
import {RootNavigator} from './navigation';
import ThemeProvider from './theme/ThemeProvider';
import {persistenceHelpers, debugPersistence} from './utils/persistenceHelpers';

/**
 * App State Management Component
 * Handles app lifecycle and persistence
 */
const AppStateManager: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [persistenceStage, setPersistenceStage] = useState<'initializing' | 'rehydrating' | 'migrating' | 'complete'>('initializing');

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      console.log('[App] App state changed:', appState, '->', nextAppState);
      
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground
        console.log('[App] App came to foreground');
        
        // Check persistence health
        const isHealthy = await persistenceHelpers.healthCheck();
        if (!isHealthy) {
          console.warn('[App] Persistence health check failed');
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App went to background
        console.log('[App] App went to background');
        
        // Flush any pending persistence operations
        try {
          await persistenceHelpers.flush();
        } catch (error) {
          console.error('[App] Failed to flush persistence:', error);
        }
      }
      
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  /**
   * Handle persistence stages
   */
  useEffect(() => {
    const handlePersistorState = () => {
      const persistorState = persistor.getState();
      
      if (persistorState.bootstrapped) {
        setPersistenceStage('complete');
        if (__DEV__) {
          debugPersistence();
        }
      } else {
        setPersistenceStage('rehydrating');
      }
    };

    // Initial check
    handlePersistorState();

    // Subscribe to persistor changes
    const unsubscribe = persistor.subscribe(handlePersistorState);
    
    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      {/* Development persistence info */}
      {__DEV__ && persistenceStage !== 'complete' && (
        <PersistenceLoadingOverlay
          visible={true}
          stage={persistenceStage}
        />
      )}
    </>
  );
};

/**
 * Enhanced Persistence Loading Component
 */
const PersistenceLoader: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePersistence = async () => {
      try {
        // Wait for rehydration
        await storeUtils.waitForRehydration();
        
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsReady(true);
      } catch (err) {
        console.error('[App] Persistence initialization failed:', err);
        setError('Failed to initialize app data');
      }
    };

    initializePersistence();
  }, []);

  if (error) {
    return (
      <LoadingOverlay
        visible={true}
        message={error}
      />
    );
  }

  if (!isReady) {
    return (
      <PersistenceLoadingOverlay
        visible={true}
        stage="rehydrating"
      />
    );
  }

  return null;
};

/**
 * Root App Component
 * Provides all necessary providers and wrappers
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[App] Error caught by boundary:', error);
        console.error('[App] Error info:', errorInfo);
      }}>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <PersistGate
            loading={<PersistenceLoader />}
            persistor={persistor}
            onBeforeLift={() => {
              console.log('[App] PersistGate: Before lift');
            }}>
            <ThemeProvider>
              <AppStateManager>
                <RootNavigator />
              </AppStateManager>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// Environment Types
// type Environment = 'development' | 'staging' | 'production';

// interface AppConfig {
//   BASE_API_URL: string;
//   APP_ENV: Environment;
//   API_TIMEOUT: number;
//   DEBUG_MODE: boolean;
// }

/**
 * Get build-time configuration from react-native-config
 * This loads the actual values from your active .env file
 */
// const getBuildTimeConfig = (): AppConfig => {
//   return {
//     BASE_API_URL: Config.BASE_API_URL || 'https://api.dev.solarium.in',
//     APP_ENV: (Config.APP_ENV as Environment) || 'development',
//     API_TIMEOUT: parseInt(Config.API_TIMEOUT || '10000', 10),
//     DEBUG_MODE: Config.DEBUG_MODE === 'true',
//   };
// };

/**
 * Environment configurations that mirror your actual .env files
 * These are used ONLY for development-time environment simulation
 * In production, only getBuildTimeConfig() values are used
 */
// const getEnvironmentConfig = (env: Environment): AppConfig => {
//   const configs: Record<Environment, AppConfig> = {
//     development: {
//       BASE_API_URL: 'https://api.dev.solarium.in',
//       APP_ENV: 'development',
//       API_TIMEOUT: 10000,
//       DEBUG_MODE: true,
//     },
//     staging: {
//       BASE_API_URL: 'https://api.staging.solarium.in',
//       APP_ENV: 'staging',
//       API_TIMEOUT: 10000,
//       DEBUG_MODE: true,
//     },
//     production: {
//       BASE_API_URL: 'https://api.solarium.in',
//       APP_ENV: 'production',
//       API_TIMEOUT: 8000,
//       DEBUG_MODE: false,
//     },
//   };
  
//   return configs[env];
// };

/**
 * Main App Content Component
 */
// const AppContent: React.FC = () => {
//   const theme = useAppTheme();
  
//   // Get the actual build-time configuration
//   const buildTimeConfig = getBuildTimeConfig();
  
//   // For development: allow environment simulation
//   const [simulatedEnvironment, setSimulatedEnvironment] = useState<Environment | null>(null);
//   const [showEnvSelector, setShowEnvSelector] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [shouldThrowError, setShouldThrowError] = useState(false);

//   // Get effective configuration (build-time or simulated)
//   const getEffectiveConfig = (): AppConfig => {
//     if (__DEV__ && simulatedEnvironment) {
//       return getEnvironmentConfig(simulatedEnvironment);
//     }
//     return buildTimeConfig;
//   };

//   const currentConfig = getEffectiveConfig();
//   const isSimulating = __DEV__ && simulatedEnvironment !== null;

//   useEffect(() => {
//     console.log('[App] Solarium Customer App Started');
//     console.log('[App] Build-time Config (from react-native-config):', buildTimeConfig);
//     if (isSimulating) {
//       console.log('[App] Simulating Environment:', simulatedEnvironment);
//       console.log('[App] Simulated Config:', currentConfig);
//     }
//   }, [buildTimeConfig, simulatedEnvironment, currentConfig, isSimulating]);

//   // Error throwing component for testing
//   const ErrorThrowingComponent: React.FC = () => {
//     if (shouldThrowError) {
//       throw new Error('Test error for ErrorBoundary demonstration');
//     }
//     return null;
//   };

//   // Environment simulation (development only)
//   const simulateEnvironment = (env: Environment) => {
//     if (__DEV__) {
//       setIsLoading(true);
//       console.log(`[App] Simulating environment: ${env}`);
      
//       setTimeout(() => {
//         setSimulatedEnvironment(env);
//         setShowEnvSelector(false);
//         setIsLoading(false);
//         console.log(`[App] Now simulating: ${env} environment`);
//       }, 800);
//     }
//   };

//   // Reset to build-time configuration
//   const resetToBuildTime = () => {
//     if (__DEV__) {
//       setIsLoading(true);
//       console.log('[App] Resetting to build-time configuration');
      
//       setTimeout(() => {
//         setSimulatedEnvironment(null);
//         setShowEnvSelector(false);
//         setIsLoading(false);
//         console.log('[App] Reset to build-time configuration');
//       }, 500);
//     }
//   };

//   const toggleEnvSelector = () => {
//     setShowEnvSelector(!showEnvSelector);
//   };

//   // Test loading overlay
//   const testLoading = () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//     }, 2000);
//   };

//   // Test error boundary
//   const testError = () => {
//     console.log('[App] Testing ErrorBoundary...');
//     setShouldThrowError(true);
//   };

//   // Reset error test
//   const resetErrorTest = () => {
//     setShouldThrowError(false);
//   };

//   return (
//     <SafeAreaLayout
//       scrollable
//       backgroundColor={theme.colors.background}
//       statusBarStyle="dark-content">
//       <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        
//         {/* Header */}
//         <Text style={[styles.title, {
//           color: theme.colors.primary,
//           fontSize: theme.typography.fontSize.xxl,
//           fontFamily: theme.typography.fontFamily.bold,
//         }]}>
//           Solarium Customer App
//         </Text>

//         {/* Configuration Status */}
//         {isSimulating && (
//           <Card style={[styles.warningCard, {
//             backgroundColor: theme.colors.errorContainer,
//             marginBottom: theme.spacing.lg,
//           }]}>
//             <Card.Content>
//               <Text style={[styles.warningText, {color: theme.colors.onErrorContainer}]}>
//                 🧪 Development Mode: Simulating {simulatedEnvironment?.toUpperCase()} environment
//               </Text>
//             </Card.Content>
//           </Card>
//         )}

//         {/* Current Configuration Card */}
//         <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
//           <Card.Content>
//             <Text style={[styles.subtitle, {
//               color: theme.colors.onSurface,
//               fontSize: theme.typography.fontSize.lg,
//               fontFamily: theme.typography.fontFamily.medium,
//               marginBottom: theme.spacing.sm,
//             }]}>
//               {isSimulating ? 'Simulated Configuration' : 'Active Configuration'}
//             </Text>
            
//             <View style={styles.configGrid}>
//               <View style={styles.configRow}>
//                 <Text style={[styles.configLabel, {color: theme.colors.onSurfaceVariant}]}>
//                   Environment
//                 </Text>
//                 <Text style={[styles.configValue, {
//                   color: theme.colors.primary,
//                   fontWeight: 'bold',
//                 }]}>
//                   {currentConfig.APP_ENV.toUpperCase()}
//                 </Text>
//               </View>

//               <View style={styles.configRow}>
//                 <Text style={[styles.configLabel, {color: theme.colors.onSurfaceVariant}]}>
//                   API Endpoint
//                 </Text>
//                 <Text style={[styles.configValue, {color: theme.colors.onSurface}]} numberOfLines={1}>
//                   {currentConfig.BASE_API_URL}
//                 </Text>
//               </View>

//               <View style={styles.configRow}>
//                 <Text style={[styles.configLabel, {color: theme.colors.onSurfaceVariant}]}>
//                   API Timeout
//                 </Text>
//                 <Text style={[styles.configValue, {color: theme.colors.onSurface}]}>
//                   {currentConfig.API_TIMEOUT}ms
//                 </Text>
//               </View>

//               <View style={styles.configRow}>
//                 <Text style={[styles.configLabel, {color: theme.colors.onSurfaceVariant}]}>
//                   Debug Mode
//                 </Text>
//                 <Text style={[styles.configValue, {
//                   color: currentConfig.DEBUG_MODE ? theme.colors.error : theme.colors.onSurface,
//                   fontWeight: currentConfig.DEBUG_MODE ? 'bold' : 'normal',
//                 }]}>
//                   {currentConfig.DEBUG_MODE ? 'ENABLED' : 'DISABLED'}
//                 </Text>
//               </View>
//             </View>
//           </Card.Content>
//         </Card>

//         {/* Development Environment Simulation */}
//         {__DEV__ && (
//           <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
//             <Card.Content>
//               <Text style={[styles.subtitle, {
//                 color: theme.colors.onSurface,
//                 fontSize: theme.typography.fontSize.lg,
//                 fontFamily: theme.typography.fontFamily.medium,
//                 marginBottom: theme.spacing.sm,
//               }]}>
//                 Environment Simulation (Dev Only)
//               </Text>
              
//               <View style={styles.envControls}>
//                 <Button
//                   mode="contained"
//                   onPress={toggleEnvSelector}
//                   style={styles.toggleButton}
//                   icon={showEnvSelector ? 'chevron-up' : 'chevron-down'}>
//                   {showEnvSelector ? 'Hide' : 'Show'} Environment Options
//                 </Button>

//                 {isSimulating && (
//                   <Button
//                     mode="outlined"
//                     onPress={resetToBuildTime}
//                     style={styles.resetButton}
//                     icon="restore">
//                     Reset to Build Config
//                   </Button>
//                 )}
//               </View>

//               {showEnvSelector && (
//                 <View style={styles.envSelector}>
//                   <Button
//                     mode={currentConfig.APP_ENV === 'development' ? 'contained' : 'outlined'}
//                     onPress={() => simulateEnvironment('development')}
//                     style={styles.envButton}
//                     disabled={!isSimulating && buildTimeConfig.APP_ENV === 'development'}>
//                     Development
//                   </Button>

//                   <Button
//                     mode={currentConfig.APP_ENV === 'staging' ? 'contained' : 'outlined'}
//                     onPress={() => simulateEnvironment('staging')}
//                     style={styles.envButton}
//                     disabled={!isSimulating && buildTimeConfig.APP_ENV === 'staging'}>
//                     Staging
//                   </Button>

//                   <Button
//                     mode={currentConfig.APP_ENV === 'production' ? 'contained' : 'outlined'}
//                     onPress={() => simulateEnvironment('production')}
//                     style={styles.envButton}
//                     disabled={!isSimulating && buildTimeConfig.APP_ENV === 'production'}>
//                     Production
//                   </Button>
//                 </View>
//               )}
//             </Card.Content>
//           </Card>
//         )}

//         {/* Testing Components */}
//         {__DEV__ && (
//           <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
//             <Card.Content>
//               <Text style={[styles.subtitle, {
//                 color: theme.colors.onSurface,
//                 fontSize: theme.typography.fontSize.lg,
//                 fontFamily: theme.typography.fontFamily.medium,
//                 marginBottom: theme.spacing.sm,
//               }]}>
//                 Component Testing
//               </Text>
              
//               <View style={styles.testButtons}>
//                 <Button
//                   mode="outlined"
//                   onPress={testLoading}
//                   style={styles.testButton}>
//                   Test Loading
//                 </Button>
                
//                 <Button
//                   mode="outlined"
//                   onPress={testError}
//                   style={styles.testButton}
//                   icon="alert"
//                   disabled={shouldThrowError}>
//                   Test Error
//                 </Button>
//               </View>

//               {shouldThrowError && (
//                 <Button
//                   mode="contained"
//                   onPress={resetErrorTest}
//                   style={[styles.resetErrorButton, {backgroundColor: theme.colors.error}]}
//                   icon="refresh">
//                   Reset Error Test
//                 </Button>
//               )}
//             </Card.Content>
//           </Card>
//         )}

//         {/* Application Status */}
//         <Card style={styles.card}>
//           <Card.Content>
//             <Text style={[styles.subtitle, {
//               color: theme.colors.onSurface,
//               fontSize: theme.typography.fontSize.lg,
//               fontFamily: theme.typography.fontFamily.medium,
//               marginBottom: theme.spacing.sm,
//             }]}>
//               System Status
//             </Text>
            
//             <View style={styles.statusGrid}>
//               <Text style={[styles.statusItem, {color: theme.colors.primary}]}>
//                 ✅ React Native {__DEV__ ? 'Development' : 'Production'} Build
//               </Text>
//               <Text style={[styles.statusItem, {color: theme.colors.primary}]}>
//                 ✅ Environment Configuration Loaded
//               </Text>
//               <Text style={[styles.statusItem, {color: theme.colors.primary}]}>
//                 ✅ Theme System Active
//               </Text>
//               <Text style={[styles.statusItem, {color: theme.colors.primary}]}>
//                 ✅ Error Boundary Protected
//               </Text>
//               <Text style={[styles.statusItem, {color: theme.colors.primary}]}>
//                 ✅ Layout Components Ready
//               </Text>
//             </View>
//           </Card.Content>
//         </Card>

//         {/* Error Test Component */}
//         <ErrorThrowingComponent />
//       </View>

//       {/* Loading Overlay */}
//       <LoadingOverlay
//         visible={isLoading}
//         message={
//           simulatedEnvironment 
//             ? `Switching to ${simulatedEnvironment}...` 
//             : 'Loading...'
//         }
//       />
//     </SafeAreaLayout>
//   );
// };

/**
 * Root App Component with Error Boundary
 */
// const App: React.FC = () => {
//   const handleErrorReset = () => {
//     // This is just for logging/analytics - ErrorBoundary handles its own reset
//     console.log('[App] ErrorBoundary was reset by user');
//     // Could send analytics/crash reporting event here
//     // Example: analytics.track('error_boundary_reset');
//   };

//   return (
//     <ErrorBoundary
//       onReset={handleErrorReset}  // Optional callback for logging
//       onError={(error, errorInfo) => {
//         console.error('[ErrorBoundary] Application error:', error.message);
//         console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
        
//         // In production, send to crash reporting service
//         // Example: crashlytics().recordError(error);
//       }}>
//       <ThemeProvider>
//         <AppContent />
//       </ThemeProvider>
//     </ErrorBoundary>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   title: {
//     textAlign: 'center',
//     marginVertical: 24,
//   },
//   card: {
//     elevation: 2,
//   },
//   warningCard: {
//     elevation: 1,
//   },
//   warningText: {
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontWeight: '600',
//   },
//   configGrid: {
//     gap: 12,
//   },
//   configRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 4,
//   },
//   configLabel: {
//     fontSize: 14,
//     flex: 1,
//   },
//   configValue: {
//     fontSize: 14,
//     flex: 2,
//     textAlign: 'right',
//   },
//   envControls: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   toggleButton: {
//     flex: 1,
//   },
//   resetButton: {
//     flex: 1,
//   },
//   envSelector: {
//     gap: 8,
//   },
//   envButton: {
//     marginVertical: 2,
//   },
//   testButtons: {
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 8,
//   },
//   testButton: {
//     flex: 1,
//   },
//   resetErrorButton: {
//     marginTop: 8,
//   },
//   statusGrid: {
//     gap: 6,
//   },
//   statusItem: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   // Error Fallback Styles
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   errorContent: {
//     alignItems: 'center',
//     maxWidth: 320,
//   },
//   errorIconContainer: {
//     marginBottom: 24,
//   },
//   errorIcon: {
//     fontSize: 64,
//   },
//   errorTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   errorDescription: {
//     fontSize: 16,
//     textAlign: 'center',
//     lineHeight: 24,
//     marginBottom: 32,
//   },
//   errorButton: {
//     paddingHorizontal: 32,
//   },
// });

export default App;