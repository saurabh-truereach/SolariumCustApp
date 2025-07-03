/**
 * Theme Palette
 * Defines color scheme, spacing, and design tokens for the app
 */

export interface ColorPalette {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    secondaryDark: string;
    secondaryLight: string;
    background: string;
    surface: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
      placeholder: string;
    };
    border: {
      default: string;
      light: string;
      focus: string;
    };
    overlay: {
      light: string;
      medium: string;
      dark: string;
    };
  }
  
  export interface SpacingScale {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  }
  
  export interface Typography {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
      light: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  }
  
  /**
   * Solarium Green Energy Color Palette
   */
  export const colors: ColorPalette = {
    // Primary colors - Green theme for solar energy
    primary: '#2E7D32', // Dark green
    primaryDark: '#1B5E20', // Darker green
    primaryLight: '#4CAF50', // Light green
  
    // Secondary colors - Complementary blue
    secondary: '#1976D2', // Blue
    secondaryDark: '#0D47A1', // Dark blue
    secondaryLight: '#42A5F5', // Light blue
  
    // Background colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
  
    // Status colors
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
  
    // Text colors
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
      placeholder: '#9E9E9E',
    },
  
    // Border colors
    border: {
      default: '#E0E0E0',
      light: '#F5F5F5',
      focus: '#2E7D32',
    },
  
    // Overlay colors
    overlay: {
      light: 'rgba(0, 0, 0, 0.1)',
      medium: 'rgba(0, 0, 0, 0.5)',
      dark: 'rgba(0, 0, 0, 0.8)',
    },
  };
  
  /**
   * Spacing scale based on 8px grid
   */
  export const spacing: SpacingScale = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  /**
   * Typography definitions
   */
  export const typography: Typography = {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
      light: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  };
  
  /**
   * Shadow definitions for elevation
   */
  export const shadows = {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  };
  
  /**
   * Border radius definitions
   */
  export const borderRadius = {
    small: 4,
    medium: 8,
    large: 12,
    xl: 16,
    round: 50,
  };
  