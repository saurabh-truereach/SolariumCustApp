/**
 * Home Screen
 * Main dashboard for authenticated users
 */

import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import type {MainTabScreenProps} from '../../navigation/types';
import {SafeAreaLayout} from '../../components';
import {useAppTheme} from '../../theme/ThemeProvider';
import {useAppDispatch, useAppSelector} from '../../hooks/useTypedRedux';
import {logout, selectUser} from '../../store/authSlice';

type Props = MainTabScreenProps<'Home'>;

/**
 * Home Screen Component
 */
const HomeScreen: React.FC<Props> = ({navigation}) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  /**
   * Handle logout
   */
  const handleLogout = () => {
    dispatch(logout());
  };

  /**
   * Navigate to service detail (test deep linking)
   */
  const testDeepLink = () => {
    // This will test the deep link navigation
    navigation.navigate('ServiceDetail' as any, {leadId: '123'});
  };

  return (
    <SafeAreaLayout>
      <ScrollView style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Welcome Header */}
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={[styles.welcome, {color: theme.colors.primary}]}>
              Welcome, {user?.name || 'User'}!
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.subtitle, {color: theme.colors.onSurface}]}>
              Your solar energy journey starts here
            </Text>
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              Quick Actions
            </Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Services')}
                style={styles.actionButton}
                icon="solar-power">
                Browse Services
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('MyRecords')}
                style={styles.actionButton}
                icon="file-document">
                My Records
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('Documents')}
                style={styles.actionButton}
                icon="folder">
                Documents
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* User Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleLarge"
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
              Account Information
            </Text>
            
            <View style={styles.userInfo}>
              <Text variant="bodyMedium" style={styles.infoItem}>
                Phone: {user?.phone}
              </Text>
              {user?.email && (
                <Text variant="bodyMedium" style={styles.infoItem}>
                  Email: {user.email}
                </Text>
              )}
              {user?.address && (
                <Text variant="bodyMedium" style={styles.infoItem}>
                  Address: {user.address}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Development Tools */}
        {__DEV__ && (
          <Card style={styles.card}>
            <Card.Content>
              <Text
                variant="titleLarge"
                style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
                Development Tools
              </Text>
              
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={testDeepLink}
                  style={styles.actionButton}
                  icon="link">
                  Test Deep Link
                </Button>
                
                <Button
                  mode="contained-tonal"
                  onPress={handleLogout}
                  style={styles.actionButton}
                  icon="logout">
                  Logout
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  welcome: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  userInfo: {
    gap: 8,
  },
  infoItem: {
    paddingVertical: 4,
  },
});

export default HomeScreen;
