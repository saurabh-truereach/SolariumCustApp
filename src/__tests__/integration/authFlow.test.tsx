/**
 * Authentication Flow Integration Tests
 */

import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {renderWithProviders, createMockAuthState} from '../../utils/testUtils';
import Login from '../../screens/auth/LoginScreen';
import HomePlaceholder from '../../screens/HomePlaceholder';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Flow', () => {
    it('should complete full login flow', async () => {
      const {getByPlaceholderText, getByText, queryByText} = renderWithProviders(
        <Login />
      );

      // Initial state - phone input visible
      expect(getByPlaceholderText('Enter 10-digit phone number')).toBeTruthy();

      // Enter phone number
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      fireEvent.changeText(phoneInput, '1234567890');

      // Send OTP
      const sendOtpButton = getByText('Send OTP');
      fireEvent.press(sendOtpButton);

      // Wait for OTP screen
      await waitFor(() => {
        expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
      });

      // Enter correct OTP
      const otpInput = getByPlaceholderText('Enter 6-digit OTP');
      fireEvent.changeText(otpInput, '123456');

      // Login
      const loginButton = getByText('Login');
      fireEvent.press(loginButton);

      // Should show success (in real app, navigation would happen)
      await waitFor(() => {
        expect(queryByText('Logging in...')).toBeNull();
      });
    });

    it('should handle invalid OTP', async () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);

      // Navigate to OTP screen
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      fireEvent.changeText(phoneInput, '1234567890');
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
      });

      // Enter incorrect OTP
      const otpInput = getByPlaceholderText('Enter 6-digit OTP');
      fireEvent.changeText(otpInput, '000000');

      const loginButton = getByText('Login');
      fireEvent.press(loginButton);

      // Should show error
      await waitFor(() => {
        expect(getByText(/Invalid OTP/)).toBeTruthy();
      });
    });

    it('should validate phone number format', async () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);

      // Enter invalid phone number
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      fireEvent.changeText(phoneInput, '123');

      // Should show validation error
      await waitFor(() => {
        expect(getByText('Please enter a valid 10-digit phone number')).toBeTruthy();
      });

      // Send OTP button should be disabled
      const sendOtpButton = getByText('Send OTP');
      expect(sendOtpButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should allow changing phone number from OTP screen', async () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);

      // Navigate to OTP screen
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      fireEvent.changeText(phoneInput, '1234567890');
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
      });

      // Go back to change phone number
      const changePhoneButton = getByText('Change Phone Number');
      fireEvent.press(changePhoneButton);

      // Should return to phone input screen
      await waitFor(() => {
        expect(getByPlaceholderText('Enter 10-digit phone number')).toBeTruthy();
      });
    });
  });

  describe('Logout Flow', () => {
    it('should handle logout confirmation', async () => {
      const preloadedState = {
        auth: createMockAuthState(),
      };

      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });

      // Should show user info
      expect(getByText('Welcome, Test User!')).toBeTruthy();

      // Trigger logout
      const logoutButton = getByText('Logout');
      fireEvent.press(logoutButton);

      // Should show confirmation alert
      expect(Alert.alert).toHaveBeenCalledWith(
        'Logout',
        'Are you sure you want to logout?',
        expect.arrayContaining([
          expect.objectContaining({text: 'Cancel'}),
          expect.objectContaining({text: 'Logout'}),
        ])
      );
    });
  });

  describe('State Persistence', () => {
    it('should maintain auth state across renders', () => {
      const preloadedState = {
        auth: createMockAuthState(),
      };

      const {getByText, rerender} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });

      expect(getByText('Welcome, Test User!')).toBeTruthy();

      // Re-render component
      rerender(<HomePlaceholder />);

      // Should still show authenticated state
      expect(getByText('Welcome, Test User!')).toBeTruthy();
    });
  });
});
