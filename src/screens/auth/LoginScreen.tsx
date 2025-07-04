/**
 * Login Screen
 * Handles user authentication with phone and OTP
 */

import React, {useState, useCallback} from 'react';
import {Alert, StyleSheet, View, KeyboardAvoidingView, Platform, TouchableOpacity} from 'react-native';
import {Text, TextInput} from 'react-native-paper';
import type {AuthStackScreenProps} from '../../navigation/types';
import {SafeAreaLayout, LoadingOverlay} from '../../components';
import {useAppTheme} from '../../theme/ThemeProvider';
import {useAppDispatch} from '../../hooks/useTypedRedux';
import {
  loginSuccess,
} from '../../store/authSlice';
import {useSendOtpMutation, useVerifyOtpMutation} from '../../api';
import {
  createButtonA11yProps,
  createTextInputA11yProps,
  createTextA11yProps,
  createErrorA11yProps,
  a11yTestIds,
  // announceForAccessibility,
  screenReaderUtils,
} from '../../utils/accessibilityHelpers';

type Props = AuthStackScreenProps<'Login'>;

/**
 * Login Screen Component
 */
const LoginScreen: React.FC<Props> = ({navigation: _navigation}) => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');

  // RTK Query hooks
  const [sendOtp, {isLoading: isSendingOtp}] = useSendOtpMutation();
  const [verifyOtp, {isLoading: isVerifying}] = useVerifyOtpMutation();

  /**
   * Handle phone number input change
   */
  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    if (phoneError) {
      setPhoneError('');
    }
  }, [phoneError]);

  /**
   * Handle OTP input change
   */
  const handleOtpChange = useCallback((value: string) => {
    setOtp(value);
    if (otpError) {
      setOtpError('');
    }
  }, [otpError]);

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
   * Announce form errors to screen reader
   */
  const announceFormErrors = (errors: string[]) => {
    if (errors.length > 0) {
      screenReaderUtils.announceFormError(errors);
    }
  };

  /**
   * Handle sending OTP
   */
  const handleSendOtp = useCallback(async () => {
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      announceFormErrors(['Please enter a valid 10-digit phone number']);
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const result = await sendOtp({phone}).unwrap();
      setOtpSent(true);

      // Announce success and screen change
      screenReaderUtils.announceSuccess('OTP sent successfully');
      screenReaderUtils.announcePageChange('OTP Entry');

      Alert.alert(
        'OTP Sent', 
        result.message + '\n\nFor demo, use OTP: 123456',
        [{text: 'OK'}]
      );
    } catch (error: any) {
      const errorMessage = error?.data?.error?.message || error?.data?.message || error?.message || 'Failed to send OTP';
      setPhoneError(errorMessage);
      announceFormErrors([errorMessage]);
      Alert.alert('Error', errorMessage);
    }
  }, [phone, validatePhone, sendOtp]);

  /**
   * Handle login with OTP
   */
  const handleLogin = useCallback(async () => {
    console.log('handleLogin', otp, phone);
    if (!validateOtp(otp)) {
      setOtpError('Please enter a valid 6-digit OTP');
      announceFormErrors(['Please enter a valid 6-digit OTP']);
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      screenReaderUtils.announceLoading(true, 'login');

      const result = await verifyOtp({phone, otp}).unwrap();
      
      // Dispatch login success to Redux store
      dispatch(loginSuccess({
        token: result.token,
        refreshToken: result.refreshToken,
        user: result.user,
      }));
      
      // Announce successful login
      screenReaderUtils.announceSuccess('Login successful');
      screenReaderUtils.announcePageChange('Home');

      // Navigation will happen automatically via RootNavigator
    } catch (error: any) {
      // Extract the correct error message from RTK Query structure
      const errorMessage = error?.data?.error?.message || error?.data?.message || error?.message || 'Login failed';
      setOtpError(errorMessage);
      announceFormErrors([errorMessage]);
      Alert.alert('Login Failed', errorMessage);
    }
  }, [otp, phone, dispatch, validateOtp, verifyOtp]);

  /**
   * Reset form
   */
  const handleReset = useCallback(() => {
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setPhoneError('');
    setOtpError('');
  }, []);

  // Combined loading state for RTK Query mutations
  const isLoading = isSendingOtp || isVerifying;

  return (
    <SafeAreaLayout
      keyboardAvoiding
      {...createTextA11yProps('Login Form', 'text', a11yTestIds.loginForm)}>
      <KeyboardAvoidingView
        style={[styles.container, {backgroundColor: theme.colors.background}]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.title, {color: theme.colors.primary}]}
            {...createTextA11yProps('Solarium Login', 'header', a11yTestIds.headerTitle)}>
            Solarium Login
          </Text>
          <Text
            style={[styles.subtitle, {color: theme.colors.onSurface}]}
            {...createTextA11yProps('Enter your phone number to continue')}>
            Enter your phone number to continue
          </Text>
        </View>

        {/* Form */}
        <View 
          style={styles.form}
          {...createTextA11yProps('Login form', 'text')}>
          {!otpSent ? (
            // Phone Input Section
            <>
              <Text 
                style={[styles.label, {color: theme.colors.onSurface}]}
                {...createTextA11yProps('Phone Number (required)')}>
                Phone Number *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: phoneError ? theme.colors.error : theme.colors.outline,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
                {...createTextInputA11yProps(
                  'Phone number',
                  'Enter your 10-digit phone number to receive OTP',
                  true,
                  !!phoneError,
                  a11yTestIds.phoneInput
                )}
              />
              
              {phoneError ? (
                <Text 
                  style={[styles.errorText, {color: theme.colors.error}]}
                  {...createErrorA11yProps(phoneError, a11yTestIds.errorMessage)}>
                  {phoneError}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: validatePhone(phone) && !isLoading
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={handleSendOtp}
                disabled={!validatePhone(phone) || isLoading}
                {...createButtonA11yProps(
                  'Send OTP',
                  'Tap to send one-time password to your phone number',
                  !validatePhone(phone) || isLoading,
                  a11yTestIds.sendOtpButton
                )}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: validatePhone(phone) && !isLoading
                        ? theme.colors.onPrimary 
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}>
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            // OTP Input Section
            <>
              <Text 
                style={[styles.label, {color: theme.colors.onSurface}]}
                {...createTextA11yProps('One-time password (required)')}>
                Enter OTP *
              </Text>
              <Text 
                style={[styles.otpInfo, {color: theme.colors.onSurfaceVariant}]}
                {...createTextA11yProps(`OTP sent to ${phone}`)}>
                OTP sent to {phone}
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: otpError ? theme.colors.error : theme.colors.outline,
                    color: theme.colors.onSurface,
                  },
                ]}
                value={otp}
                onChangeText={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
                {...createTextInputA11yProps(
                  'One-time password',
                  'Enter the 6-digit OTP sent to your phone',
                  true,
                  !!otpError,
                  a11yTestIds.otpInput
                )}
              />
              
              {otpError ? (
                <Text 
                  style={[styles.errorText, {color: theme.colors.error}]}
                  {...createErrorA11yProps(otpError, a11yTestIds.errorMessage)}>
                  {otpError}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: validateOtp(otp) && !isLoading
                      ? theme.colors.primary 
                      : theme.colors.surfaceVariant,
                  },
                ]}
                onPress={handleLogin}
                disabled={!validateOtp(otp) || isLoading}
                {...createButtonA11yProps(
                  'Login',
                  'Tap to login with the entered one-time password',
                  !validateOtp(otp) || isLoading,
                  a11yTestIds.loginButton
                )}>
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color: validateOtp(otp) && !isLoading
                        ? theme.colors.onPrimary 
                        : theme.colors.onSurfaceVariant,
                    },
                  ]}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={handleReset}
                disabled={isLoading}
                {...createButtonA11yProps(
                  'Change phone number',
                  'Tap to go back and enter a different phone number',
                  isLoading,
                  a11yTestIds.backButton
                )}>
                <Text style={[styles.linkText, {color: theme.colors.primary}]}>
                  Change Phone Number
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Demo Instructions */}
          {__DEV__ && (
            <View 
              style={[styles.demoCard, {backgroundColor: theme.colors.secondaryContainer}]}
              {...createTextA11yProps('Demo instructions')}>
              <Text 
                style={[styles.demoTitle, {color: theme.colors.onSecondaryContainer}]}
                {...createTextA11yProps('Demo Instructions', 'header')}>
                Demo Instructions
              </Text>
              <Text 
                style={[styles.demoText, {color: theme.colors.onSecondaryContainer}]}
                {...createTextA11yProps('Demo usage instructions')}>
                • Enter any 10-digit phone number{'\n'}
                • Use OTP: 123456{'\n'}
                • Other OTPs will show error message
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="Authenticating..."
      />
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  otpInfo: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  demoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default LoginScreen;
