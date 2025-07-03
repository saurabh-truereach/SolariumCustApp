/**
 * Solarium Customer App
 * Main application entry point
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import {Config} from 'react-native-config';

/**
 * Root App Component
 * Provides safe area context and displays initial splash screen
 */
const App: React.FC = () => {
  console.log('ENV:', Config);
  console.log('ENV:', Config.APP_ENV);
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <Text style={styles.title}>Solarium Customer App</Text>
        <Text style={styles.subtitle}>Environment: {Config.APP_ENV}</Text>
        <Text style={styles.api}>API URL: {Config.BASE_API_URL}</Text>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
    textAlign: 'center',
  },
  api: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default App;