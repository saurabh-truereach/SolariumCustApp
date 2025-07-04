/**
 * Home Screen
 * Main dashboard for authenticated users
 */

import React, {useState, useMemo} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {SafeAreaLayout} from '../../components';
import {useAppDispatch, useAppSelector} from '../../hooks/useTypedRedux';
import type {MainTabScreenProps} from '../../navigation/types';
import {logoutUser} from '../../store/authSlice';
import {useAppTheme} from '../../theme/ThemeProvider';
import {
  createButtonA11yProps,
  createTextA11yProps,
  a11yTestIds,
  announceForAccessibility,
  screenReaderUtils,
} from '../../utils/accessibilityHelpers';

type Props = MainTabScreenProps<'Home'>;

/**
 * Home Screen Component
 */
const HomeScreen: React.FC<Props> = ({navigation}) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth?.user);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => {
          announceForAccessibility('Logout cancelled');
        },
      },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            setIsLoading(true);
            screenReaderUtils.announceLoading(true, 'logout');
            await dispatch(logoutUser()).unwrap();
            screenReaderUtils.announceSuccess('Logged out successfully');
          } catch (error) {
            console.error('[Home] Logout error:', error);
            announceForAccessibility('Logout failed, please try again');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const logoutButtonStyle = useMemo(
    () => [
      styles.logoutButton,
      {
        backgroundColor: theme.colors.error,
        opacity: isLoading ? 0.6 : 1,
      },
    ],
    [theme.colors.error, isLoading]
  );

  /**
   * Navigate to service detail (test deep linking)
   */
  const testDeepLink = () => {
    // This will test the deep link navigation
    navigation.navigate('ServiceDetail' as any, {leadId: '123'});
  };

  return (
    <SafeAreaLayout backgroundColor={theme.colors.background}>
      <ScrollView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        {...createTextA11yProps('Home screen content')}
      >
        {/* Welcome Header */}
        <Card style={styles.card} {...createTextA11yProps('Welcome card')}>
          <Card.Content>
            <Text
              style={[styles.welcome, {color: theme.colors.primary}]}
              {...createTextA11yProps(
                `Welcome, ${user?.name || 'User'}!`,
                'header',
                a11yTestIds.welcomeMessage
              )}
            >
              Welcome, {user?.name || 'User'}!
            </Text>
            <Text
              style={[styles.subtitle, {color: theme.colors.onSurface}]}
              {...createTextA11yProps('Your solar energy journey starts here')}
            >
              Your solar energy journey starts here
            </Text>
          </Card.Content>
        </Card>

        {/* User Info Card */}
        <Card
          style={styles.card}
          {...createTextA11yProps('Account information card')}
        >
          <Card.Content>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}
              {...createTextA11yProps('Account Information', 'header')}
            >
              Account Information
            </Text>

            <View
              style={styles.userInfo}
              {...createTextA11yProps(
                'User details',
                'text',
                a11yTestIds.userInfo
              )}
            >
              <Text
                style={styles.infoItem}
                {...createTextA11yProps(`Phone number: ${user?.phone}`)}
              >
                Phone: {user?.phone}
              </Text>
              {user?.email && (
                <Text
                  style={styles.infoItem}
                  {...createTextA11yProps(`Email address: ${user.email}`)}
                >
                  Email: {user.email}
                </Text>
              )}
              {user?.address && (
                <Text
                  style={styles.infoItem}
                  {...createTextA11yProps(`Address: ${user.address}`)}
                >
                  Address: {user.address}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Redux Store Status */}
        <Card
          style={styles.card}
          {...createTextA11yProps('System status card')}
        >
          <Card.Content>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.onSurface}]}
              {...createTextA11yProps('Redux Store Status', 'header')}
            >
              Redux Store Status
            </Text>

            <View
              style={styles.statusContainer}
              {...createTextA11yProps(
                'System status information',
                'text',
                a11yTestIds.statusCard
              )}
            >
              <Text
                style={[styles.status, {color: theme.colors.primary}]}
                {...createTextA11yProps(
                  `User authenticated: ${user ? 'Yes' : 'No'}`
                )}
              >
                ✅ User authenticated: {user ? 'Yes' : 'No'}
              </Text>
              <Text
                style={[styles.status, {color: theme.colors.primary}]}
                {...createTextA11yProps(`Token stored: ${user ? 'Yes' : 'No'}`)}
              >
                ✅ Token stored: {user ? 'Yes' : 'No'}
              </Text>
              <Text
                style={[styles.status, {color: theme.colors.primary}]}
                {...createTextA11yProps('Navigation working: Yes')}
              >
                ✅ Navigation working: Yes
              </Text>
              <Text
                style={[styles.status, {color: theme.colors.primary}]}
                {...createTextA11yProps('Redux integrated: Yes')}
              >
                ✅ Redux integrated: Yes
              </Text>
              <Text
                style={[styles.status, {color: theme.colors.primary}]}
                {...createTextA11yProps('Accessibility features: Enabled')}
              >
                ✅ Accessibility features: Enabled
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Development Tools */}
        {__DEV__ && (
          <Card
            style={styles.card}
            {...createTextA11yProps('Development tools card')}
          >
            <Card.Content>
              <Text
                style={[styles.sectionTitle, {color: theme.colors.onSurface}]}
                {...createTextA11yProps('Development Tools', 'header')}
              >
                Development Tools
              </Text>

              <View style={styles.actionsSection}>
                <TouchableOpacity
                  style={logoutButtonStyle}
                  onPress={handleLogout}
                  disabled={isLoading}
                  {...createButtonA11yProps(
                    isLoading ? 'Logging out' : 'Logout',
                    'Tap to logout from the application',
                    isLoading,
                    a11yTestIds.logoutButton
                  )}
                >
                  <Text
                    style={[
                      styles.logoutButtonText,
                      {color: theme.colors.onError},
                    ]}
                  >
                    {isLoading ? 'Logging out...' : 'Logout'}
                  </Text>
                </TouchableOpacity>

                {/* Test Deep Link Button */}
                <TouchableOpacity
                  style={[
                    styles.testButton,
                    {backgroundColor: theme.colors.secondary},
                  ]}
                  onPress={testDeepLink}
                  {...createButtonA11yProps(
                    'Test Deep Link',
                    'Tap to test navigation to service detail page'
                  )}
                >
                  <Text
                    style={[
                      styles.testButtonText,
                      {color: theme.colors.onSecondary},
                    ]}
                  >
                    Test Deep Link
                  </Text>
                </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  // actionButtons: {
  //   gap: 12,
  // },
  // actionButton: {
  //   marginVertical: 4,
  // },
  userInfo: {
    gap: 8,
  },
  infoItem: {
    fontSize: 16,
    paddingVertical: 4,
  },
  statusContainer: {
    gap: 8,
  },
  status: {
    fontSize: 16,
    paddingVertical: 2,
  },
  actionsSection: {
    marginTop: 16,
    gap: 12,
  },
  logoutButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
