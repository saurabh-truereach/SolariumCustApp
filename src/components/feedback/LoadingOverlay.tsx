/**
 * Loading Overlay Component
 * Displays loading indicator with optional message
 */

import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useAppTheme} from '../../theme/ThemeProvider';

/**
 * Loading Overlay Props
 */
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  size?: 'small' | 'large';
  color?: string;
}

/**
 * Loading Overlay Component
 * Shows a loading spinner with optional message over the current screen
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  transparent = false,
  size = 'large',
  color,
}) => {
  const theme = useAppTheme();
  const spinnerColor = color || theme.colors.primary;

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent>
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: transparent
              ? theme.colors.background + '80' // 50% opacity
              : theme.colors.background + 'E6', // 90% opacity
          },
        ]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              ...theme.shadows.medium,
            },
          ]}>
          <ActivityIndicator
            size={size}
            color={spinnerColor}
            style={styles.spinner}
          />
          {message && (
            <Text
              style={[
                styles.message,
                {
                  color: theme.colors.onSurface,
                  fontSize: theme.typography.fontSize.sm,
                  fontFamily: theme.typography.fontFamily.medium,
                },
              ]}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  spinner: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginTop: 8,
  },
});

export default LoadingOverlay;
