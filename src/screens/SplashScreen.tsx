/**
 * Splash Screen Component
 *
 * Initial screen shown while the app is loading.
 * This is a temporary placeholder that will be replaced
 * with proper navigation and authentication flow.
 */

import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import Config from 'react-native-config';

/**
 * SplashScreen Component
 *
 * Displays app name and environment information during initial load
 */
const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.title}>Solarium Customer App</Text>
      <Text style={styles.subtitle}>Solar Energy Solutions</Text>
      <Text style={styles.environment}>Environment: {Config.BASE_API_URL}</Text>
      <Text style={styles.version}>Version: {Config.VERSION}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 40,
    textAlign: 'center',
  },
  environment: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
});

export default SplashScreen;
