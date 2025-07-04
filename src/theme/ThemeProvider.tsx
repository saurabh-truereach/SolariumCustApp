/**
 * Theme Provider
 * Wraps the app with Material Design theme using react-native-paper
 */

import React, {createContext, useContext} from 'react';
import {MD3LightTheme, PaperProvider, configureFonts} from 'react-native-paper';
import type {MD3Theme} from 'react-native-paper';
import {colors, spacing, typography, shadows, borderRadius} from './palette';

// Extend the MD3Theme with our custom properties
export interface ExtendedTheme extends MD3Theme {
  spacing: typeof spacing;
  typography: typeof typography;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
}

/**
 * Configure fonts for react-native-paper
 */
const fontConfig = configureFonts({
  config: {
    displayLarge: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xxl,
      lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
    },
    displayMedium: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
    },
    displaySmall: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },
    headlineLarge: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.xl,
      lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
    },
    headlineMedium: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },
    headlineSmall: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    },
    titleLarge: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    },
    titleMedium: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.md,
      lineHeight: typography.fontSize.md * typography.lineHeight.normal,
    },
    titleSmall: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
    bodyLarge: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.md,
      lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    },
    bodyMedium: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
    bodySmall: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
    },
    labelLarge: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.sm,
      lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    },
    labelMedium: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    },
    labelSmall: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSize.xs,
      lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    },
  },
});

/**
 * Custom theme based on Material Design 3
 */
const customTheme: ExtendedTheme = {
  ...MD3LightTheme,
  fonts: fontConfig,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryLight,
    secondary: colors.secondary,
    secondaryContainer: colors.secondaryLight,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.text.primary,
    onSurface: colors.text.primary,
    onError: '#FFFFFF',
    outline: colors.border.default,
    outlineVariant: colors.border.light,
  },
  // Add our custom properties
  spacing,
  typography,
  shadows,
  borderRadius,
};

/**
 * Theme context for accessing theme outside of Paper components
 */
const ThemeContext = createContext<ExtendedTheme>(customTheme);

/**
 * Hook to access theme in components
 */
export const useAppTheme = (): ExtendedTheme => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return theme;
};

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider Component
 * Wraps the app with Material Design theme and custom theme context
 */
const ThemeProvider: React.FC<ThemeProviderProps> = ({children}) => {
  return (
    <PaperProvider theme={customTheme}>
      <ThemeContext.Provider value={customTheme}>
        {children}
      </ThemeContext.Provider>
    </PaperProvider>
  );
};

export default ThemeProvider;
