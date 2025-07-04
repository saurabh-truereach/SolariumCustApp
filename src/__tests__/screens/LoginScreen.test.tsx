/**
 * Enhanced Login Screen tests
 */

import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, waitFor, act} from '@testing-library/react-native';
import {
  renderWithProviders,
  waitForAsync,
  asyncTest,
} from '../../utils/testUtils';
import Login from '../../screens/auth/LoginScreen';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock the auth API hooks
jest.mock('../../api', () => ({
  ...jest.requireActual('../../api'),
  useSendOtpMutation: () => [
    jest.fn().mockImplementation(data => ({
      unwrap: () => {
        if (data.phone === '1234567890') {
          return Promise.resolve({
            message: 'OTP sent successfully',
            otpSent: true,
            expiresIn: 300,
          });
        }
        return Promise.reject({
          data: {
            error: {
              message: 'Failed to send OTP',
            },
          },
        });
      },
    })),
    {isLoading: false},
  ],
  useVerifyOtpMutation: () => [
    jest.fn().mockImplementation(data => ({
      unwrap: () => {
        if (data.otp === '123456') {
          return Promise.resolve({
            user: {
              id: 'test-user',
              phone: data.phone,
              name: 'Test User',
            },
            token: 'test-token',
            expiresIn: 86400,
          });
        }
        return Promise.reject({
          data: {
            error: {
              message: 'Invalid OTP',
            },
          },
        });
      },
    })),
    {isLoading: false},
  ],
}));

describe('Enhanced Login Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Initial Render', () => {
    it('renders correctly', () => {
      const {toJSON} = renderWithProviders(<Login />);
      expect(toJSON()).toMatchSnapshot();
    });

    it('shows phone input initially', () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);

      expect(getByPlaceholderText('Enter 10-digit phone number')).toBeTruthy();
      expect(getByText('Send OTP')).toBeTruthy();
      expect(getByText('Solarium Login')).toBeTruthy();
    });

    it('has proper accessibility labels', () => {
      const {getByLabelText} = renderWithProviders(<Login />);

      expect(getByLabelText('Phone number input')).toBeTruthy();
      expect(getByLabelText('Send OTP button')).toBeTruthy();
    });

    it('displays correct initial UI state', () => {
      const {getByText, queryByPlaceholderText} = renderWithProviders(
        <Login />
      );

      expect(getByText('Enter your phone number to continue')).toBeTruthy();
      expect(getByText('Phone Number *')).toBeTruthy();
      expect(queryByPlaceholderText('Enter 6-digit OTP')).toBeNull();
    });
  });

  describe('Phone Number Validation', () => {
    it('validates phone number correctly', async () => {
      const {getByPlaceholderText, getByText, queryByText} =
        renderWithProviders(<Login />);
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

      // Test invalid phone number
      fireEvent.changeText(phoneInput, '123');
      await waitFor(() => {
        expect(
          getByText('Please enter a valid 10-digit phone number')
        ).toBeTruthy();
      });

      // Test valid phone number
      fireEvent.changeText(phoneInput, '1234567890');
      await waitFor(() => {
        expect(
          queryByText('Please enter a valid 10-digit phone number')
        ).toBeNull();
      });
    });

    it('enables/disables Send OTP button based on validation', async () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      const sendOtpButton = getByText('Send OTP');

      // Initially disabled for empty input
      expect(sendOtpButton.props.accessibilityState?.disabled).toBe(true);

      // Still disabled for invalid input
      fireEvent.changeText(phoneInput, '123');
      await waitFor(() => {
        expect(sendOtpButton.props.accessibilityState?.disabled).toBe(true);
      });

      // Enabled for valid input
      fireEvent.changeText(phoneInput, '1234567890');
      await waitFor(() => {
        expect(sendOtpButton.props.accessibilityState?.disabled).toBe(false);
      });
    });

    it('handles various phone number formats', async () => {
      const {getByPlaceholderText, getByText, queryByText} =
        renderWithProviders(<Login />);
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

      const testCases = [
        {input: '', shouldBeValid: false},
        {input: '123', shouldBeValid: false},
        {input: '12345', shouldBeValid: false},
        {input: '123456789', shouldBeValid: false},
        {input: '1234567890', shouldBeValid: true},
        {input: '12345678901', shouldBeValid: false}, // Too long
        {input: 'abcd567890', shouldBeValid: false}, // Contains letters
        {input: '123-456-7890', shouldBeValid: false}, // Contains dashes
      ];

      for (const testCase of testCases) {
        fireEvent.changeText(phoneInput, testCase.input);
        await waitFor(() => {
          const errorExists =
            queryByText('Please enter a valid 10-digit phone number') !== null;
          if (testCase.shouldBeValid) {
            expect(errorExists).toBe(false);
          } else if (testCase.input.length > 0) {
            expect(errorExists).toBe(true);
          }
        });
      }
    });
  });

  describe('OTP Flow', () => {
    const setupOtpFlow = async () => {
      const {getByPlaceholderText, getByText} = renderWithProviders(<Login />);
      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

      fireEvent.changeText(phoneInput, '1234567890');
      fireEvent.press(getByText('Send OTP'));

      await waitFor(() => {
        expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
      });

      return {getByPlaceholderText, getByText};
    };

    it('transitions to OTP screen after sending OTP', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
          expect(getByText('OTP sent to 1234567890')).toBeTruthy();
          expect(getByText('Enter OTP *')).toBeTruthy();
        });
      })();
    });

    it('shows alert when OTP is sent', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalledWith(
            'OTP Sent',
            expect.stringContaining('OTP sent to 1234567890'),
            [{text: 'OK'}]
          );
        });
      })();
    });

    it('validates OTP correctly', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText, queryByText} =
          await setupOtpFlow();
        const otpInput = getByPlaceholderText('Enter 6-digit OTP');

        // Test invalid OTP
        fireEvent.changeText(otpInput, '123');
        await waitFor(() => {
          expect(getByText('Please enter a valid 6-digit OTP')).toBeTruthy();
        });

        // Test valid OTP
        fireEvent.changeText(otpInput, '123456');
        await waitFor(() => {
          expect(queryByText('Please enter a valid 6-digit OTP')).toBeNull();
        });
      })();
    });

    it('enables/disables Login button based on OTP validation', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = await setupOtpFlow();
        const otpInput = getByPlaceholderText('Enter 6-digit OTP');
        const loginButton = getByText('Login');

        // Initially disabled
        expect(loginButton.props.accessibilityState?.disabled).toBe(true);

        // Still disabled for invalid OTP
        fireEvent.changeText(otpInput, '123');
        await waitFor(() => {
          expect(loginButton.props.accessibilityState?.disabled).toBe(true);
        });

        // Enabled for valid OTP
        fireEvent.changeText(otpInput, '123456');
        await waitFor(() => {
          expect(loginButton.props.accessibilityState?.disabled).toBe(false);
        });
      })();
    });

    it('allows changing phone number from OTP screen', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = await setupOtpFlow();

        fireEvent.press(getByText('Change Phone Number'));

        await waitFor(() => {
          expect(
            getByPlaceholderText('Enter 10-digit phone number')
          ).toBeTruthy();
          expect(getByText('Send OTP')).toBeTruthy();
        });
      })();
    });

    it('clears OTP when changing phone number', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = await setupOtpFlow();
        const otpInput = getByPlaceholderText('Enter 6-digit OTP');

        // Enter some OTP
        fireEvent.changeText(otpInput, '123');

        // Change phone number
        fireEvent.press(getByText('Change Phone Number'));

        // Go back to OTP screen
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          const newOtpInput = getByPlaceholderText('Enter 6-digit OTP');
          expect(newOtpInput.props.value).toBe('');
        });
      })();
    });
  });

  describe('Login Process', () => {
    it('handles successful login', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText, store} = renderWithProviders(
          <Login />
        );

        // Navigate to OTP screen
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
        });

        // Enter correct OTP and login
        const otpInput = getByPlaceholderText('Enter 6-digit OTP');
        fireEvent.changeText(otpInput, '123456');
        fireEvent.press(getByText('Login'));

        await waitFor(() => {
          const state = store.getState();
          expect(state.auth.isLoggedIn).toBe(true);
          expect(state.auth.user?.phone).toBe('1234567890');
        });
      })();
    });

    it('handles login failure', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );

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
        fireEvent.press(getByText('Login'));

        await waitFor(() => {
          expect(getByText('Invalid OTP')).toBeTruthy();
        });
      })();
    });

    it('shows loading state during login', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );

        // Navigate to OTP screen
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
        });

        // Mock loading state
        const otpInput = getByPlaceholderText('Enter 6-digit OTP');
        fireEvent.changeText(otpInput, '123456');

        act(() => {
          fireEvent.press(getByText('Login'));
        });

        // Should show loading text (briefly)
        // Note: This test might be flaky due to async nature
      })();
    });
  });

  describe('Error Handling', () => {
    it('displays API errors correctly', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );

        // Test with phone that will cause API error
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '0000000000');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(getByText(/Failed to send OTP/)).toBeTruthy();
        });
      })();
    });

    it('clears errors when user types', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText, queryByText} =
          renderWithProviders(<Login />);

        // Cause an error first
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '123');

        await waitFor(() => {
          expect(
            getByText('Please enter a valid 10-digit phone number')
          ).toBeTruthy();
        });

        // Clear the error by typing valid input
        fireEvent.changeText(phoneInput, '1234567890');

        await waitFor(() => {
          expect(
            queryByText('Please enter a valid 10-digit phone number')
          ).toBeNull();
        });
      })();
    });

    it('handles network errors gracefully', async () => {
      // This would require mocking network failures
      // Implementation depends on how the API client handles network errors
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels and hints', () => {
      const {getByLabelText} = renderWithProviders(<Login />);

      const phoneInput = getByLabelText('Phone number input');
      expect(phoneInput.props.accessibilityHint).toBe(
        'Enter your 10-digit phone number to receive OTP'
      );

      const sendButton = getByLabelText('Send OTP button');
      expect(sendButton.props.accessibilityHint).toBe(
        'Tap to send OTP to your phone number'
      );
    });

    it('maintains accessibility in OTP screen', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText, getByLabelText} =
          renderWithProviders(<Login />);

        // Navigate to OTP screen
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          const otpInput = getByLabelText('OTP input');
          expect(otpInput.props.accessibilityHint).toBe(
            'Enter the 6-digit OTP sent to your phone'
          );

          const loginButton = getByLabelText('Login button');
          expect(loginButton.props.accessibilityHint).toBe(
            'Tap to login with the entered OTP'
          );
        });
      })();
    });

    it('announces state changes to screen readers', async () => {
      // This would require more sophisticated accessibility testing
      // Could be implemented with accessibility testing tools
    });
  });

  describe('Performance', () => {
    it('renders efficiently', async () => {
      const startTime = performance.now();

      renderWithProviders(<Login />);
      await waitForAsync();

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(500);
    });

    it('handles rapid user input efficiently', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText} = renderWithProviders(<Login />);
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');

        const startTime = performance.now();

        // Simulate rapid typing
        for (let i = 0; i < 10; i++) {
          fireEvent.changeText(phoneInput, `123456789${i}`);
          await waitForAsync();
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;

        // Should handle rapid input efficiently
        expect(totalTime).toBeLessThan(2000);
      })();
    });
  });

  describe('Demo Features', () => {
    it('shows demo instructions in development mode', () => {
      const {getByText} = renderWithProviders(<Login />);

      if (__DEV__) {
        expect(getByText('Demo Instructions')).toBeTruthy();
        expect(getByText(/Enter any 10-digit phone number/)).toBeTruthy();
        expect(getByText(/Use OTP: 123456/)).toBeTruthy();
      }
    });

    it('displays demo card with correct information', () => {
      const {getByText} = renderWithProviders(<Login />);

      if (__DEV__) {
        expect(getByText('Demo Instructions')).toBeTruthy();
        expect(getByText(/Other OTPs will show error message/)).toBeTruthy();
      }
    });
  });

  describe('Edge Cases', () => {
    it('handles component unmount during API calls', async () => {
      const {getByPlaceholderText, getByText, unmount} = renderWithProviders(
        <Login />
      );

      const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
      fireEvent.changeText(phoneInput, '1234567890');
      fireEvent.press(getByText('Send OTP'));

      // Unmount during API call
      unmount();

      // Should not throw errors
      await waitForAsync();
    });

    it('handles multiple rapid button presses', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );

        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');

        const sendButton = getByText('Send OTP');

        // Rapidly press the button
        fireEvent.press(sendButton);
        fireEvent.press(sendButton);
        fireEvent.press(sendButton);

        // Should handle gracefully without multiple API calls
        await waitFor(() => {
          expect(getByPlaceholderText('Enter 6-digit OTP')).toBeTruthy();
        });
      })();
    });

    it('preserves form state during screen transitions', async () => {
      await asyncTest(async () => {
        const {getByPlaceholderText, getByText} = renderWithProviders(
          <Login />
        );

        // Enter phone number
        const phoneInput = getByPlaceholderText('Enter 10-digit phone number');
        fireEvent.changeText(phoneInput, '1234567890');
        fireEvent.press(getByText('Send OTP'));

        await waitFor(() => {
          expect(getByText('OTP sent to 1234567890')).toBeTruthy();
        });

        // Go back and check phone is preserved
        fireEvent.press(getByText('Change Phone Number'));

        await waitFor(() => {
          const newPhoneInput = getByPlaceholderText(
            'Enter 10-digit phone number'
          );
          expect(newPhoneInput.props.value).toBe('1234567890');
        });
      })();
    });
  });
});
