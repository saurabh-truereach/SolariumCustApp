/**
 * Solarium Customer App
 * Main application entry point with theming and error boundary
 */

import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Card} from 'react-native-paper';
import {ErrorBoundary, LoadingOverlay, SafeAreaLayout} from './components';
import {getAppConfig} from './config/environments';
import {setEnvironment} from './config/environmentSelector';
import ThemeProvider, {useAppTheme} from './theme/ThemeProvider';

type Environment = 'development' | 'staging' | 'production';

/**
 * Main App Content Component
 * Contains the actual app logic (separated for theme access)
 */
const AppContent: React.FC = () => {
  const theme = useAppTheme();
  const [currentConfig, setCurrentConfig] = useState(getAppConfig());
  const [showEnvSelector, setShowEnvSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('[App] Starting Solarium Customer App');
    console.log('[App] Configuration loaded:', currentConfig);
    console.log('[App] Theme loaded:', theme.colors.primary);
  }, [currentConfig, theme]);

  // Environment switching (development only)
  const switchEnvironment = (env: Environment) => {
    if (__DEV__) {
      setIsLoading(true);
      setTimeout(() => {
        setEnvironment(env);
        setCurrentConfig(getAppConfig());
        setShowEnvSelector(false);
        setIsLoading(false);
      }, 500); // Simulate loading
    }
  };

  const toggleEnvSelector = () => {
    setShowEnvSelector(!showEnvSelector);
  };

  // Test loading overlay
  const testLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Test error boundary
  const testError = () => {
    throw new Error('Test error for ErrorBoundary');
  };

  return (
    <SafeAreaLayout
      scrollable
      backgroundColor={theme.colors.background}
      statusBarStyle="dark-content">
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Header */}
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.primary,
              fontSize: theme.typography.fontSize.xxl,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}>
          Solarium Customer App
        </Text>

        {/* Environment Info Card */}
        <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
          <Card.Content>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.fontSize.lg,
                  fontFamily: theme.typography.fontFamily.medium,
                  marginBottom: theme.spacing.sm,
                },
              ]}>
              Environment Configuration
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.onSurface}]}>
              Environment: {currentConfig.APP_ENV}
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.onSurface}]}>
              API: {currentConfig.BASE_API_URL}
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.onSurface}]}>
              Timeout: {currentConfig.API_TIMEOUT}ms
            </Text>
            <Text style={[styles.infoText, {color: theme.colors.error}]}>
              Debug: {currentConfig.DEBUG_MODE ? 'ON' : 'OFF'}
            </Text>
          </Card.Content>
        </Card>

        {/* Development Environment Selector */}
        {__DEV__ && (
          <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
            <Card.Content>
              <Button
                mode="contained"
                onPress={toggleEnvSelector}
                style={{marginBottom: theme.spacing.md}}>
                Switch Environment
              </Button>

              {showEnvSelector && (
                <View style={styles.envSelector}>
                  <Button
                    mode={currentConfig.APP_ENV === 'development' ? 'contained' : 'outlined'}
                    onPress={() => switchEnvironment('development')}
                    style={styles.envButton}>
                    Development
                  </Button>

                  <Button
                    mode={currentConfig.APP_ENV === 'staging' ? 'contained' : 'outlined'}
                    onPress={() => switchEnvironment('staging')}
                    style={styles.envButton}>
                    Staging
                  </Button>

                  <Button
                    mode={currentConfig.APP_ENV === 'production' ? 'contained' : 'outlined'}
                    onPress={() => switchEnvironment('production')}
                    style={styles.envButton}>
                    Production
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Test Components Card */}
        {__DEV__ && (
          <Card style={[styles.card, {marginBottom: theme.spacing.lg}]}>
            <Card.Content>
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: theme.colors.onSurface,
                    fontSize: theme.typography.fontSize.lg,
                    fontFamily: theme.typography.fontFamily.medium,
                    marginBottom: theme.spacing.sm,
                  },
                ]}>
                Test Components
              </Text>
              <View style={styles.testButtons}>
                <Button
                  mode="outlined"
                  onPress={testLoading}
                  style={styles.testButton}>
                  Test Loading
                </Button>
                <Button
                  mode="outlined"
                  onPress={testError}
                  style={styles.testButton}>
                  Test Error
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text
              style={[
                styles.subtitle,
                {
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.fontSize.lg,
                  fontFamily: theme.typography.fontFamily.medium,
                  marginBottom: theme.spacing.sm,
                },
              ]}>
              Setup Status
            </Text>
            <Text style={[styles.status, {color: theme.colors.primary}]}>
              ✅ App Bootstrap Complete
            </Text>
            <Text style={[styles.status, {color: theme.colors.primary}]}>
              ✅ Environment Configuration Loaded
            </Text>
            <Text style={[styles.status, {color: theme.colors.primary}]}>
              ✅ Code Quality Tools Configured
            </Text>
            <Text style={[styles.status, {color: theme.colors.primary}]}>
              ✅ Theme & Layout Components Ready
            </Text>
            <Text style={[styles.status, {color: theme.colors.primary}]}>
              ✅ Error Boundary Configured
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="Switching environment..."
      />
    </SafeAreaLayout>
  );
};

/**
 * Root App Component
 * Provides theme and error boundary wrappers
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[App] Error caught by boundary:', error);
        console.error('[App] Error info:', errorInfo);
      }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 24,
  },
  card: {
    elevation: 2,
  },
  subtitle: {
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  envSelector: {
    gap: 8,
  },
  envButton: {
    marginVertical: 2,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testButton: {
    flex: 1,
  },
  status: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default App;
