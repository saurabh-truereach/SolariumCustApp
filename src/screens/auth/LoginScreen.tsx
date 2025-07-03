/**
 * Login Screen
 * Handles user authentication with phone and OTP
 */

import React, {useState, useCallback} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, Card, Text, TextInput} from 'react-native-paper';
import type {AuthStackScreenProps} from '../../navigation/types';
import {SafeAreaLayout} from '../../components';
import {useAppTheme} from '../../theme/ThemeProvider';
import {useAppDispatch, useAppSelector} from '../../hooks/useTypedRedux';
import {
  sendOtpThunk,
  loginThunk,
  selectIsLoading,
  selectIsSendingOtp,
  selectAuthError,
} from '../../store/authSlice';

type Props = AuthStackScreenProps<'Login'>;

/**
 * Login Screen Component
 */
const LoginScreen: React.FC<Props> = ({navigation: _navigation}) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectIsLoading);
  const isSendingOtp = useAppSelector(selectIsSendingOtp);
  const error = useAppSelector(selectAuthError);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneBlurred, setPhoneBlurred] = useState(false);
  const [otpBlurred, setOtpBlurred] = useState(false);

  /**
   * Validate phone number (10 digits)
   */
  const validatePhone = useCallback((phoneNumber: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
  }, []);

  /**
   * Validate OTP (6 digits)
   */
  const validateOtp = useCallback((otpValue: string): boolean => {
    const otpRegex = /^[0-9]{6}$/;
    return otpRegex.test(otpValue);
  }, []);

  /**
   * Handle sending OTP
   */
  const handleSendOtp = useCallback(async () => {
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      await dispatch(sendOtpThunk(phone)).unwrap();
      setOtpSent(true);
      Alert.alert('OTP Sent', `OTP sent to ${phone}. Use 123456 for demo.`);
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  }, [phone, validatePhone, dispatch]);

  /**
   * Handle login with OTP
   */
  const handleLogin = useCallback(async () => {
    if (!validateOtp(otp)) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await dispatch(loginThunk({phone, otp})).unwrap();
      // Success is handled automatically by the thunk
    } catch (error) {
      // Error is handled automatically by the thunk, but we can show an alert
      Alert.alert('Login Failed', error as string);
    }
  }, [otp, phone, dispatch, validateOtp]);

  /**
   * Reset form
   */
  const handleReset = useCallback(() => {
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setPhoneBlurred(false);
    setOtpBlurred(false);
  }, []);

  return (
    <SafeAreaLayout keyboardAvoiding>
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            variant="displaySmall"
            style={[styles.title, {color: theme.colors.primary}]}>
            Welcome to Solarium
          </Text>
          <Text
            variant="bodyLarge"
            style={[styles.subtitle, {color: theme.colors.onSurface}]}>
            Login with your phone number
          </Text>
        </View>

        {/* Login Form */}
        <Card style={styles.card}>
          <Card.Content>
            {!otpSent ? (
              // Phone Number Input
              <>
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  onBlur={() => setPhoneBlurred(true)}
                  onFocus={() => setPhoneBlurred(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  mode="outlined"
                  style={styles.input}
                  error={phoneBlurred && phone.length > 0 && !validatePhone(phone)}
                  disabled={isSendingOtp}
                  accessibilityLabel="Phone number input"
                  accessibilityHint="Enter your 10-digit phone number"
                />
                
                {phoneBlurred && phone.length > 0 && !validatePhone(phone) && (
                  <Text
                    variant="bodySmall"
                    style={[styles.errorText, {color: theme.colors.error}]}>
                    Please enter a valid 10-digit phone number
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleSendOtp}
                  style={styles.button}
                  loading={isSendingOtp}
                  disabled={!validatePhone(phone) || isSendingOtp}
                  accessibilityLabel="Send OTP button">
                  Send OTP
                </Button>
              </>
            ) : (
              // OTP Input
              <>
                <Text
                  variant="bodyMedium"
                  style={[styles.otpInfo, {color: theme.colors.onSurface}]}>
                  OTP sent to {phone}
                </Text>

                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  onBlur={() => setOtpBlurred(true)}
                  onFocus={() => setOtpBlurred(false)}
                  keyboardType="numeric"
                  maxLength={6}
                  mode="outlined"
                  style={styles.input}
                  error={otpBlurred && otp.length > 0 && !validateOtp(otp)}
                  disabled={isLoading}
                  accessibilityLabel="OTP input"
                  accessibilityHint="Enter the 6-digit OTP sent to your phone"
                />

                {otpBlurred && otp.length > 0 && !validateOtp(otp) && (
                  <Text
                    variant="bodySmall"
                    style={[styles.errorText, {color: theme.colors.error}]}>
                    Please enter a valid 6-digit OTP
                  </Text>
                )}

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.button}
                  loading={isLoading}
                  disabled={!validateOtp(otp) || isLoading}
                  accessibilityLabel="Login button">
                  Login
                </Button>

                <Button
                  mode="text"
                  onPress={handleReset}
                  style={styles.resetButton}
                  disabled={isLoading}
                  accessibilityLabel="Change phone number">
                  Change Phone Number
                </Button>
              </>
            )}

            {/* Error Message */}
            {error && (
              <Text
                variant="bodySmall"
                style={[styles.errorText, {color: theme.colors.error}]}>
                {error}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Demo Instructions */}
        {__DEV__ && (
          <Card style={[styles.demoCard, {backgroundColor: theme.colors.secondaryContainer}]}>
            <Card.Content>
              <Text
                variant="titleSmall"
                style={[styles.demoTitle, {color: theme.colors.onSecondaryContainer}]}>
                Demo Instructions
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.demoText, {color: theme.colors.onSecondaryContainer}]}>
                • Enter any 10-digit phone number{'\n'}
                • Use OTP: 123456{'\n'}
                • Other OTPs will show error message
              </Text>
            </Card.Content>
          </Card>
        )}
      </View>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  resetButton: {
    marginTop: 8,
  },
  otpInfo: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    marginTop: -12,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoCard: {
    marginTop: 16,
  },
  demoTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  demoText: {
    lineHeight: 20,
  },
});

export default LoginScreen;
