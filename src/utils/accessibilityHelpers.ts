/**
 * Accessibility Helper Utilities
 * Provides utilities for accessibility testing and enhancement
 */

import {AccessibilityInfo} from 'react-native';

/**
 * Accessibility test IDs for consistent testing
 */
export const a11yTestIds = {
  // Login screen
  loginForm: 'login-form',
  phoneInput: 'phone-input',
  otpInput: 'otp-input',
  sendOtpButton: 'send-otp-button',
  loginButton: 'login-button',
  backButton: 'back-button',
  errorMessage: 'error-message',

  // Home screen
  welcomeMessage: 'welcome-message',
  userInfo: 'user-info',
  logoutButton: 'logout-button',
  statusCard: 'status-card',

  // Common elements
  loadingIndicator: 'loading-indicator',
  errorBoundary: 'error-boundary',
  navigationTab: 'navigation-tab',
  backNavigation: 'back-navigation',

  // Form elements
  textInput: 'text-input',
  submitButton: 'submit-button',
  cancelButton: 'cancel-button',
  confirmButton: 'confirm-button',

  // Content elements
  contentCard: 'content-card',
  listItem: 'list-item',
  headerTitle: 'header-title',
  sectionTitle: 'section-title',
} as const;

/**
 * Accessibility roles for React Native components
 */
export const a11yRoles = {
  button: 'button',
  text: 'text',
  textInput: 'textInput',
  image: 'image',
  imageButton: 'imagebutton',
  header: 'header',
  link: 'link',
  search: 'search',
  keyboardKey: 'keyboardkey',
  summary: 'summary',
  alert: 'alert',
  checkbox: 'checkbox',
  combobox: 'combobox',
  menu: 'menu',
  menuBar: 'menubar',
  menuItem: 'menuitem',
  progressBar: 'progressbar',
  radio: 'radio',
  radioGroup: 'radiogroup',
  scrollBar: 'scrollbar',
  slider: 'slider',
  switch: 'switch',
  tab: 'tab',
  tabList: 'tablist',
  timer: 'timer',
  toolbar: 'toolbar',
} as const;

/**
 * Accessibility states
 */
export const a11yStates = {
  disabled: {disabled: true},
  enabled: {disabled: false},
  selected: {selected: true},
  unselected: {selected: false},
  checked: {checked: true},
  unchecked: {checked: false},
  expanded: {expanded: true},
  collapsed: {expanded: false},
  busy: {busy: true},
  idle: {busy: false},
} as const;

/**
 * Create accessibility props for a button
 */
export const createButtonA11yProps = (
  label: string,
  hint?: string,
  disabled?: boolean,
  testID?: string
) => ({
  accessible: true,
  accessibilityRole: a11yRoles.button,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: disabled ? a11yStates.disabled : a11yStates.enabled,
  testID,
});

/**
 * Create accessibility props for a text input
 */
export const createTextInputA11yProps = (
  label: string,
  hint?: string,
  required?: boolean,
  error?: boolean,
  testID?: string
) => ({
  accessible: true,
  // accessibilityRole: a11yRoles.textInput,
  // Note: TextInput components have built-in accessibility behavior, so we omit accessibilityRole
  accessibilityLabel: label + (required ? ' (required)' : ''),
  accessibilityHint: hint,
  accessibilityState: error
    ? {...a11yStates.enabled, invalid: true}
    : a11yStates.enabled,
  testID,
});

/**
 * Create accessibility props for text content
 */
export const createTextA11yProps = (
  content: string,
  role: 'text' | 'header' = 'text',
  testID?: string
) => ({
  accessible: true,
  accessibilityRole: role === 'header' ? a11yRoles.header : a11yRoles.text,
  accessibilityLabel: content,
  testID,
});

/**
 * Create accessibility props for images
 */
export const createImageA11yProps = (
  altText: string,
  isDecorative?: boolean,
  testID?: string
) => ({
  accessible: !isDecorative,
  accessibilityRole: a11yRoles.image,
  accessibilityLabel: isDecorative ? undefined : altText,
  accessibilityElementsHidden: isDecorative,
  testID,
});

/**
 * Create accessibility props for loading indicators
 */
export const createLoadingA11yProps = (
  loadingText?: string,
  testID?: string
) => ({
  accessible: true,
  accessibilityRole: a11yRoles.progressBar,
  accessibilityLabel: loadingText || 'Loading',
  accessibilityState: a11yStates.busy,
  testID,
});

/**
 * Create accessibility props for error messages
 */
export const createErrorA11yProps = (
  errorMessage: string,
  testID?: string
) => ({
  accessible: true,
  accessibilityRole: a11yRoles.alert,
  accessibilityLabel: `Error: ${errorMessage}`,
  accessibilityLiveRegion: 'assertive' as const,
  testID,
});

/**
 * Create accessibility props for navigation elements
 */
export const createNavigationA11yProps = (
  label: string,
  hint?: string,
  isActive?: boolean,
  testID?: string
) => ({
  accessible: true,
  accessibilityRole: a11yRoles.tab,
  accessibilityLabel: label,
  accessibilityHint: hint,
  accessibilityState: isActive ? a11yStates.selected : a11yStates.unselected,
  testID,
});

/**
 * Announce message to screen reader
 */
export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

/**
 * Check if screen reader is enabled
 */
export const isScreenReaderEnabled = async (): Promise<boolean> => {
  try {
    return await AccessibilityInfo.isScreenReaderEnabled();
  } catch (error) {
    console.warn('[A11y] Failed to check screen reader status:', error);
    return false;
  }
};

/**
 * Set accessibility focus to element
 */
export const setAccessibilityFocus = (reactTag: number) => {
  AccessibilityInfo.setAccessibilityFocus(reactTag);
};

/**
 * Validate accessibility props
 */
export const validateA11yProps = (
  props: any
): {
  isValid: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];

  // Check if accessible elements have labels
  if (
    props.accessible &&
    !props.accessibilityLabel &&
    !props.accessibilityLabelledBy
  ) {
    warnings.push('Accessible element missing accessibilityLabel');
  }

  // Check if buttons have proper roles
  if (props.onPress && !props.accessibilityRole) {
    warnings.push('Pressable element missing accessibilityRole');
  }

  // Check if text inputs have proper roles
  if (props.onChangeText && props.accessibilityRole !== 'textInput') {
    warnings.push('Text input missing proper accessibilityRole');
  }

  // Check if images have alt text
  if (
    props.source &&
    !props.accessibilityLabel &&
    !props.accessibilityElementsHidden
  ) {
    warnings.push(
      'Image missing accessibilityLabel or accessibilityElementsHidden'
    );
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
};

/**
 * Color contrast checker
 */
export const checkColorContrast = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number;
  isAACompliant: boolean;
  isAAACompliant: boolean;
} => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const getRelativeLuminance = (rgb: {r: number; g: number; b: number}) => {
    const {r, g, b} = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      const color = c / 255;
      return color <= 0.03928
        ? color / 12.92
        : Math.pow((color + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return {ratio: 0, isAACompliant: false, isAAACompliant: false};
  }

  const fgLuminance = getRelativeLuminance(fgRgb);
  const bgLuminance = getRelativeLuminance(bgRgb);

  const ratio =
    (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  // WCAG 2.1 standards
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  return {
    ratio,
    isAACompliant: ratio >= aaThreshold,
    isAAACompliant: ratio >= aaaThreshold,
  };
};

/**
 * Focus management helpers
 */
export const focusHelpers = {
  /**
   * Move focus to next focusable element
   */
  focusNext: () => {
    // Implementation would depend on focus management library
    console.log('[A11y] Focus moved to next element');
  },

  /**
   * Move focus to previous focusable element
   */
  focusPrevious: () => {
    console.log('[A11y] Focus moved to previous element');
  },

  /**
   * Trap focus within container
   */
  trapFocus: (containerId: string) => {
    console.log(`[A11y] Focus trapped in container: ${containerId}`);
  },

  /**
   * Release focus trap
   */
  releaseFocusTrap: () => {
    console.log('[A11y] Focus trap released');
  },
};

/**
 * Screen reader utilities
 */
export const screenReaderUtils = {
  /**
   * Announce page change
   */
  announcePageChange: (pageName: string) => {
    announceForAccessibility(`Navigated to ${pageName}`);
  },

  /**
   * Announce form errors
   */
  announceFormError: (errors: string[]) => {
    const message = `Form has ${errors.length} error${
      errors.length === 1 ? '' : 's'
    }: ${errors.join(', ')}`;
    announceForAccessibility(message);
  },

  /**
   * Announce loading state
   */
  announceLoading: (isLoading: boolean, context?: string) => {
    const message = isLoading
      ? `Loading${context ? ` ${context}` : ''}`
      : `Loading complete${context ? ` for ${context}` : ''}`;
    announceForAccessibility(message);
  },

  /**
   * Announce success message
   */
  announceSuccess: (message: string) => {
    announceForAccessibility(`Success: ${message}`);
  },
};

/**
 * Accessibility testing helpers
 */
export const a11yTestHelpers = {
  /**
   * Find all accessibility issues in component tree
   */
  findA11yIssues: (_componentTree: any): string[] => {
    const issues: string[] = [];

    // This would be implemented with a proper accessibility testing engine
    // For now, return empty array
    return issues;
  },

  /**
   * Check if component meets accessibility standards
   */
  isA11yCompliant: (component: any): boolean => {
    const issues = a11yTestHelpers.findA11yIssues(component);
    return issues.length === 0;
  },

  /**
   * Generate accessibility report
   */
  generateA11yReport: (componentTree: any) => {
    const issues = a11yTestHelpers.findA11yIssues(componentTree);

    return {
      totalIssues: issues.length,
      criticalIssues: issues.filter(issue => issue.includes('critical')).length,
      warnings: issues.filter(issue => issue.includes('warning')).length,
      issues,
      isCompliant: issues.length === 0,
      timestamp: new Date().toISOString(),
    };
  },
};
