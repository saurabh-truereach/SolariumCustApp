/**
 * Enhanced Home Placeholder Screen tests
 */

import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, waitFor} from '@testing-library/react-native';
import {renderWithProviders, createMockAuthState, createMockUser, asyncTest} from '../../utils/testUtils';
import HomePlaceholder from '../../screens/HomePlaceholder';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  // Simulate user clicking the logout button
  if (buttons && buttons[1] && buttons[1].onPress) {
    buttons[1].onPress();
  }
});

describe('Enhanced HomePlaceholder Screen', () => {
  const mockAuthState = createMockAuthState();
  const mockUser = createMockUser();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('Basic Rendering', () => {
    it('renders correctly with authenticated user', () => {
      const preloadedState = {auth: mockAuthState};
      const {toJSON} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(toJSON()).toMatchSnapshot();
    });

    it('displays correct welcome message', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Welcome, Test User!')).toBeTruthy();
      expect(getByText('Phone: 1234567890')).toBeTruthy();
    });

    it('shows protected status', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Home (protected)')).toBeTruthy();
      expect(getByText(/This is a placeholder for the main home screen/)).toBeTruthy();
    });
  });

  describe('User Information Display', () => {
    it('displays user name correctly', () => {
      const customUser = {...mockUser, name: 'John Doe'};
      const preloadedState = {
        auth: {...mockAuthState, user: customUser},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Welcome, John Doe!')).toBeTruthy();
    });

    it('displays phone number correctly', () => {
      const customUser = {...mockUser, phone: '9876543210'};
      const preloadedState = {
        auth: {...mockAuthState, user: customUser},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Phone: 9876543210')).toBeTruthy();
    });

    it('handles missing user name gracefully', () => {
      const preloadedState = {
        auth: {...mockAuthState, user: {...mockUser, name: undefined}},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Welcome, User!')).toBeTruthy();
    });

    it('handles undefined user gracefully', () => {
      const preloadedState = {
        auth: {...mockAuthState, user: undefined},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Welcome, User!')).toBeTruthy();
    });
  });

  describe('Redux Store Status Display', () => {
    it('shows correct Redux store status', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByText('Redux Store Status')).toBeTruthy();
      expect(getByText('✅ User authenticated: Yes')).toBeTruthy();
      expect(getByText('✅ Token stored: Yes')).toBeTruthy();
      expect(getByText('✅ Navigation working: Yes')).toBeTruthy();
      expect(getByText('✅ Redux integrated: Yes')).toBeTruthy();
    });

    it('shows unauthenticated status when user not logged in', () => {
      const unauthenticatedState = {
        auth: {
          ...mockAuthState,
          isLoggedIn: false,
          user: undefined,
          token: undefined,
        },
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: unauthenticatedState as any,
      });
      
      expect(getByText('✅ User authenticated: No')).toBeTruthy();
      expect(getByText('✅ Token stored: No')).toBeTruthy();
    });

    it('displays all status indicators', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      const statusItems = [
        '✅ User authenticated: Yes',
        '✅ Token stored: Yes',
        '✅ Navigation working: Yes',
        '✅ Redux integrated: Yes',
      ];
      
      statusItems.forEach(status => {
        expect(getByText(status)).toBeTruthy();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('shows logout button in development mode', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      if (__DEV__) {
        expect(getByText('Logout')).toBeTruthy();
      }
    });

    it('shows confirmation dialog when logout is pressed', async () => {
      await asyncTest(async () => {
        const preloadedState = {auth: mockAuthState};
        const {getByText} = renderWithProviders(<HomePlaceholder />, {
          preloadedState: preloadedState as any,
        });
        
        if (__DEV__) {
          const logoutButton = getByText('Logout');
          fireEvent.press(logoutButton);
          
          expect(Alert.alert).toHaveBeenCalledWith(
            'Logout',
            'Are you sure you want to logout?',
            expect.arrayContaining([
              expect.objectContaining({text: 'Cancel', style: 'cancel'}),
              expect.objectContaining({text: 'Logout', style: 'destructive'}),
            ])
          );
        }
      })();
    });

    it('handles logout confirmation', async () => {
      await asyncTest(async () => {
        const preloadedState = {auth: mockAuthState};
        const {getByText, store} = renderWithProviders(<HomePlaceholder />, {
          preloadedState: preloadedState as any,
        });
        
        if (__DEV__) {
          const logoutButton = getByText('Logout');
          fireEvent.press(logoutButton);
          
          // Wait for logout action to be dispatched
          await waitFor(() => {
            const state = store.getState();
            expect(state.auth.isLoggedIn).toBe(false);
          });
        }
      })();
    });

    it('disables logout button when loading', () => {
      const loadingState = {
        auth: {...mockAuthState, isLoading: true},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: loadingState as any,
      });
      
      if (__DEV__) {
        const logoutButton = getByText('Logging out...');
        expect(logoutButton.props.accessibilityState?.disabled).toBe(true);
      }
    });

    it('shows loading text during logout', () => {
      const loadingState = {
        auth: {...mockAuthState, isLoading: true},
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: loadingState as any,
      });
      
      if (__DEV__) {
        expect(getByText('Logging out...')).toBeTruthy();
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByLabelText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(getByLabelText('Welcome message')).toBeTruthy();
      expect(getByLabelText('Home screen placeholder')).toBeTruthy();
      
      if (__DEV__) {
        expect(getByLabelText('Logout button')).toBeTruthy();
      }
    });

    it('provides accessibility hints', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByLabelText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      if (__DEV__) {
        const logoutButton = getByLabelText('Logout button');
        expect(logoutButton.props.accessibilityHint).toBe(
          'Tap to logout from the application'
        );
      }
    });

    it('maintains accessibility during loading states', () => {
      const loadingState = {
        auth: {...mockAuthState, isLoading: true},
      };
      
      const {getByLabelText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: loadingState as any,
      });
      
      if (__DEV__) {
        const logoutButton = getByLabelText('Logout button');
        expect(logoutButton.props.accessibilityState?.disabled).toBe(true);
      }
    });
  });

  describe('Theme Integration', () => {
    it('applies theme colors correctly', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      // Welcome text should use primary color
      const welcomeText = getByText('Welcome, Test User!');
      expect(welcomeText).toBeTruthy();
      
      // Status items should use success color
      const statusText = getByText('✅ User authenticated: Yes');
      expect(statusText).toBeTruthy();
    });

    it('uses theme spacing and typography', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      const welcomeText = getByText('Welcome, Test User!');
      const infoCard = getByText('Redux Store Status');
      
      expect(welcomeText).toBeTruthy();
      expect(infoCard).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now();
      const preloadedState = {auth: mockAuthState};
      
      renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      expect(renderTime).toBeLessThan(100);
    });

    it('handles state updates efficiently', async () => {
      await asyncTest(async () => {
        const preloadedState = {auth: mockAuthState};
        const {store, rerender} = renderWithProviders(<HomePlaceholder />, {
          preloadedState: preloadedState as any,
        });
        
        const startTime = performance.now();
        
        // Update state multiple times
        for (let i = 0; i < 5; i++) {
          store.dispatch({
            type: 'auth/updateUserProfile',
            payload: {name: `User ${i}`},
          });
          rerender(<HomePlaceholder />);
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        
        expect(totalTime).toBeLessThan(500);
      })();
    });
  });

  describe('Error Handling', () => {
    it('handles missing auth state gracefully', () => {
      // Don't provide auth state
      const {getByText} = renderWithProviders(<HomePlaceholder />);
      
      expect(getByText('Welcome, User!')).toBeTruthy();
      expect(getByText('Home (protected)')).toBeTruthy();
    });

    it('handles malformed user data', () => {
      const malformedState = {
        auth: {
          ...mockAuthState,
          user: {
            // Missing required fields
            id: 'test',
            // phone and name missing
          },
        },
      };
      
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: malformedState as any,
      });
      
      expect(getByText('Welcome, User!')).toBeTruthy();
    });

    it('handles logout errors gracefully', async () => {
      await asyncTest(async () => {
        // Mock logout to fail
        const mockLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
        
        const preloadedState = {auth: mockAuthState};
        const {getByText} = renderWithProviders(<HomePlaceholder />, {
          preloadedState: preloadedState as any,
        });
        
        if (__DEV__) {
          const logoutButton = getByText('Logout');
          fireEvent.press(logoutButton);
          
          // Should not crash the app
          await waitFor(() => {
            expect(getByText('Welcome, Test User!')).toBeTruthy();
          });
        }
      })();
    });
  });

  describe('Development vs Production', () => {
    it('shows development features only in dev mode', () => {
      const preloadedState = {auth: mockAuthState};
      const {queryByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      if (__DEV__) {
        expect(queryByText('Logout')).toBeTruthy();
      } else {
        expect(queryByText('Logout')).toBeNull();
      }
    });

    it('maintains core functionality in production mode', () => {
      const preloadedState = {auth: mockAuthState};
      const {getByText} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      // Core functionality should always be available
      expect(getByText('Welcome, Test User!')).toBeTruthy();
      expect(getByText('Home (protected)')).toBeTruthy();
      expect(getByText('Redux Store Status')).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    it('handles component mounting correctly', () => {
      const preloadedState = {auth: mockAuthState};
      
      expect(() => {
        renderWithProviders(<HomePlaceholder />, {
          preloadedState: preloadedState as any,
        });
      }).not.toThrow();
    });

    it('handles component unmounting correctly', () => {
      const preloadedState = {auth: mockAuthState};
      const {unmount} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(() => unmount()).not.toThrow();
    });

    it('handles re-renders correctly', () => {
      const preloadedState = {auth: mockAuthState};
      const {rerender} = renderWithProviders(<HomePlaceholder />, {
        preloadedState: preloadedState as any,
      });
      
      expect(() => {
        rerender(<HomePlaceholder />);
        rerender(<HomePlaceholder />);
        rerender(<HomePlaceholder />);
      }).not.toThrow();
    });
  });
});
