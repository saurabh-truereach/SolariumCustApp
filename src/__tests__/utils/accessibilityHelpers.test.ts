/**
 * Accessibility Helpers Tests
 */

import {
  createButtonA11yProps,
  createTextInputA11yProps,
  createTextA11yProps,
  createImageA11yProps,
  createLoadingA11yProps,
  createErrorA11yProps,
  validateA11yProps,
  checkColorContrast,
  a11yTestIds,
  a11yRoles,
  a11yStates,
  announceForAccessibility,
  isScreenReaderEnabled,
} from '../../utils/accessibilityHelpers';

describe('Accessibility Helpers', () => {
  describe('Accessibility Props Creators', () => {
    describe('createButtonA11yProps', () => {
      it('should create complete button props', () => {
        const props = createButtonA11yProps(
          'Submit',
          'Submit the form',
          false,
          'submit-btn'
        );

        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'button',
          accessibilityLabel: 'Submit',
          accessibilityHint: 'Submit the form',
          accessibilityState: {disabled: false},
          testID: 'submit-btn',
        });
      });

      it('should handle disabled state', () => {
        const props = createButtonA11yProps('Disabled', undefined, true);
        expect(props.accessibilityState).toEqual({disabled: true});
      });

      it('should handle optional parameters', () => {
        const props = createButtonA11yProps('Simple');
        expect(props.accessibilityLabel).toBe('Simple');
        expect(props.accessibilityHint).toBeUndefined();
        expect(props.testID).toBeUndefined();
      });
    });

    describe('createTextInputA11yProps', () => {
      it('should create complete text input props', () => {
        const props = createTextInputA11yProps(
          'Email',
          'Enter email address',
          true,
          false,
          'email-input'
        );

        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'textbox',
          accessibilityLabel: 'Email (required)',
          accessibilityHint: 'Enter email address',
          accessibilityState: {disabled: false},
          testID: 'email-input',
        });
      });

      it('should handle error state', () => {
        const props = createTextInputA11yProps('Email', '', false, true);
        expect(props.accessibilityState).toEqual({
          disabled: false,
          invalid: true,
        });
      });

      it('should handle non-required fields', () => {
        const props = createTextInputA11yProps('Optional Field', '', false);
        expect(props.accessibilityLabel).toBe('Optional Field');
      });
    });

    describe('createTextA11yProps', () => {
      it('should create text props', () => {
        const props = createTextA11yProps('Hello World', 'text', 'hello-text');
        
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'text',
          accessibilityLabel: 'Hello World',
          testID: 'hello-text',
        });
      });

      it('should create header props', () => {
        const props = createTextA11yProps('Page Title', 'header');
        
        expect(props.accessibilityRole).toBe('header');
        expect(props.accessibilityLabel).toBe('Page Title');
      });
    });

    describe('createImageA11yProps', () => {
      it('should create image props', () => {
        const props = createImageA11yProps('Solar panel image', false, 'solar-img');
        
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'image',
          accessibilityLabel: 'Solar panel image',
          accessibilityElementsHidden: false,
          testID: 'solar-img',
        });
      });

      it('should handle decorative images', () => {
        const props = createImageA11yProps('Decoration', true);
        
        expect(props.accessible).toBe(false);
        expect(props.accessibilityLabel).toBeUndefined();
        expect(props.accessibilityElementsHidden).toBe(true);
      });
    });

    describe('createLoadingA11yProps', () => {
      it('should create loading props', () => {
        const props = createLoadingA11yProps('Loading data', 'loading-indicator');
        
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'progressbar',
          accessibilityLabel: 'Loading data',
          accessibilityState: {busy: true},
          testID: 'loading-indicator',
        });
      });

      it('should use default loading text', () => {
        const props = createLoadingA11yProps();
        expect(props.accessibilityLabel).toBe('Loading');
      });
    });

    describe('createErrorA11yProps', () => {
      it('should create error props', () => {
        const props = createErrorA11yProps('Invalid input', 'error-msg');
        
        expect(props).toEqual({
          accessible: true,
          accessibilityRole: 'alert',
          accessibilityLabel: 'Error: Invalid input',
          accessibilityLiveRegion: 'assertive',
          testID: 'error-msg',
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateA11yProps', () => {
      it('should validate correct props', () => {
        const validProps = {
          accessible: true,
          accessibilityLabel: 'Valid button',
          accessibilityRole: 'button',
          onPress: () => {},
        };
        
        const result = validateA11yProps(validProps);
        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it('should identify missing label', () => {
        const invalidProps = {
          accessible: true,
          // Missing accessibilityLabel
        };
        
        const result = validateA11yProps(invalidProps);
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Accessible element missing accessibilityLabel');
      });

      it('should identify missing role for pressable', () => {
        const invalidProps = {
          onPress: () => {},
          // Missing accessibilityRole
        };
        
        const result = validateA11yProps(invalidProps);
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Pressable element missing accessibilityRole');
      });

      it('should identify missing role for text input', () => {
        const invalidProps = {
          onChangeText: () => {},
          // Missing or wrong accessibilityRole
        };
        
        const result = validateA11yProps(invalidProps);
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Text input missing proper accessibilityRole');
      });

      it('should identify missing image alt text', () => {
        const invalidProps = {
          source: {uri: 'image.jpg'},
          // Missing accessibilityLabel and accessibilityElementsHidden
        };
        
        const result = validateA11yProps(invalidProps);
        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain('Image missing accessibilityLabel or accessibilityElementsHidden');
      });
    });
  });

  describe('Color Contrast Checker', () => {
    describe('checkColorContrast', () => {
      it('should calculate perfect contrast', () => {
        const result = checkColorContrast('#000000', '#FFFFFF');
        
        expect(result.ratio).toBeCloseTo(21, 1);
        expect(result.isAACompliant).toBe(true);
        expect(result.isAAACompliant).toBe(true);
      });

      it('should calculate poor contrast', () => {
        const result = checkColorContrast('#FFFFFF', '#EEEEEE');
        
        expect(result.ratio).toBeLessThan(2);
        expect(result.isAACompliant).toBe(false);
        expect(result.isAAACompliant).toBe(false);
      });

      it('should handle medium contrast', () => {
        const result = checkColorContrast('#666666', '#FFFFFF');
        
        expect(result.ratio).toBeGreaterThan(3);
        expect(result.ratio).toBeLessThan(7);
      });

      it('should handle large text thresholds', () => {
        const normalText = checkColorContrast('#999999', '#FFFFFF', false);
        const largeText = checkColorContrast('#999999', '#FFFFFF', true);
        
        expect(normalText.ratio).toEqual(largeText.ratio);
        // Large text has lower threshold requirements
        if (largeText.ratio >= 3 && largeText.ratio < 4.5) {
          expect(normalText.isAACompliant).toBe(false);
          expect(largeText.isAACompliant).toBe(true);
        }
      });

      it('should handle invalid colors', () => {
        const result = checkColorContrast('invalid', '#FFFFFF');
        
        expect(result.ratio).toBe(0);
        expect(result.isAACompliant).toBe(false);
        expect(result.isAAACompliant).toBe(false);
      });

      it('should handle colors without hash', () => {
        const result = checkColorContrast('000000', 'FFFFFF');
        
        expect(result.ratio).toBeCloseTo(21, 1);
        expect(result.isAACompliant).toBe(true);
      });
    });
  });

  describe('Constants', () => {
    describe('a11yTestIds', () => {
      it('should have consistent test IDs', () => {
        expect(a11yTestIds.loginForm).toBe('login-form');
        expect(a11yTestIds.phoneInput).toBe('phone-input');
        expect(a11yTestIds.submitButton).toBe('submit-button');
        expect(a11yTestIds.loadingIndicator).toBe('loading-indicator');
      });

      it('should have all required test IDs', () => {
        const requiredIds = [
          'loginForm',
          'phoneInput',
          'otpInput',
          'sendOtpButton',
          'loginButton',
          'errorMessage',
          'loadingIndicator',
        ];
        
        requiredIds.forEach(id => {
          expect(a11yTestIds).toHaveProperty(id);
        });
      });
    });

    describe('a11yRoles', () => {
      it('should have standard accessibility roles', () => {
        expect(a11yRoles.button).toBe('button');
        expect(a11yRoles.textInput).toBe('textbox');
        expect(a11yRoles.text).toBe('text');
        expect(a11yRoles.image).toBe('image');
        expect(a11yRoles.header).toBe('header');
      });
    });

    describe('a11yStates', () => {
      it('should have standard accessibility states', () => {
        expect(a11yStates.disabled).toEqual({disabled: true});
        expect(a11yStates.enabled).toEqual({disabled: false});
        expect(a11yStates.selected).toEqual({selected: true});
        expect(a11yStates.checked).toEqual({checked: true});
      });
    });
  });

  describe('Screen Reader Functions', () => {
    beforeEach(() => {
      // Mock React Native AccessibilityInfo
      jest.mock('react-native', () => ({
        AccessibilityInfo: {
          announceForAccessibility: jest.fn(),
          isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
          setAccessibilityFocus: jest.fn(),
        },
      }));
    });

    describe('announceForAccessibility', () => {
      it('should announce messages', () => {
        const mockAnnounce = jest.fn();
        require('react-native').AccessibilityInfo.announceForAccessibility = mockAnnounce;
        
        announceForAccessibility('Test message');
        expect(mockAnnounce).toHaveBeenCalledWith('Test message');
      });
    });

    describe('isScreenReaderEnabled', () => {
      it('should check screen reader status', async () => {
        const mockCheck = jest.fn(() => Promise.resolve(true));
        require('react-native').AccessibilityInfo.isScreenReaderEnabled = mockCheck;
        
        const result = await isScreenReaderEnabled();
        expect(result).toBe(true);
        expect(mockCheck).toHaveBeenCalled();
      });

      it('should handle errors gracefully', async () => {
        const mockCheck = jest.fn(() => Promise.reject(new Error('Access denied')));
        require('react-native').AccessibilityInfo.isScreenReaderEnabled = mockCheck;
        
        const result = await isScreenReaderEnabled();
        expect(result).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined props', () => {
      const result = validateA11yProps(undefined);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle empty props', () => {
      const result = validateA11yProps({});
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle null values', () => {
      const result = validateA11yProps({
        accessible: null,
        accessibilityLabel: null,
      });
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});
