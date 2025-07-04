/**
 * Loading Overlay Component
 * Displays loading indicator with optional message
 */

import React from 'react';
import {ActivityIndicator, Modal, StyleSheet, Text, View} from 'react-native';
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
 * Persistence Loading Overlay Props
 */
interface PersistenceLoadingProps {
  visible: boolean;
  stage: 'initializing' | 'rehydrating' | 'migrating' | 'complete';
  progress?: number;
}

/**
 * Persistence Loading Overlay Component
 * Specialized loading overlay for Redux persistence operations
 */
export const PersistenceLoadingOverlay: React.FC<PersistenceLoadingProps> = ({
  visible,
  stage,
  progress,
}) => {
  const theme = useAppTheme();

  const getStageMessage = () => {
    switch (stage) {
      case 'initializing':
        return 'Initializing app...';
      case 'rehydrating':
        return 'Restoring your data...';
      case 'migrating':
        return 'Updating app data...';
      case 'complete':
        return 'Ready!';
      default:
        return 'Loading...';
    }
  };

  const getStageIcon = () => {
    switch (stage) {
      case 'initializing':
        return '🚀';
      case 'rehydrating':
        return '💾';
      case 'migrating':
        return '🔄';
      case 'complete':
        return '✅';
      default:
        return '⏳';
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View
        style={[
          styles.overlay,
          {backgroundColor: `${theme.colors.background}F0`}, // 94% opacity
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              ...theme.shadows.large,
            },
          ]}
        >
          {/* Stage Icon */}
          <Text style={styles.stageIcon}>{getStageIcon()}</Text>

          {/* Loading Spinner */}
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={styles.spinner}
          />

          {/* Stage Message */}
          <Text
            style={[
              styles.message,
              {
                color: theme.colors.onSurface,
                fontSize: theme.typography.fontSize.md,
                fontFamily: theme.typography.fontFamily.medium,
              },
            ]}
          >
            {getStageMessage()}
          </Text>

          {/* Progress Bar */}
          {progress !== undefined && (
            <View
              style={[
                styles.progressContainer,
                {backgroundColor: theme.colors.outline},
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: theme.colors.primary,
                    width: `${Math.max(0, Math.min(100, progress))}%`,
                  },
                ]}
              />
            </View>
          )}

          {/* Progress Text */}
          {progress !== undefined && (
            <Text
              style={[
                styles.progressText,
                {
                  color: theme.colors.onSurfaceVariant,
                  fontSize: theme.typography.fontSize.sm,
                },
              ]}
            >
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

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
      statusBarTranslucent
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: transparent
              ? `${theme.colors.background}80` // 50% opacity
              : `${theme.colors.background}E6`, // 90% opacity
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.surface,
              ...theme.shadows.medium,
            },
          ]}
        >
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
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const stylesLoadingOverlayOriginal = StyleSheet.create({
  // overlay: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  // container: {
  //   padding: 24,
  //   borderRadius: 12,
  //   alignItems: 'center',
  //   minWidth: 120,
  // },
  // spinner: {
  //   marginBottom: 8,
  // },
  // message: {
  //   textAlign: 'center',
  //   marginTop: 8,
  // },
});

const persistenceStyles = StyleSheet.create({
  // stageIcon: {
  //   fontSize: 32,
  //   marginBottom: 16,
  // },
  // progressContainer: {
  //   width: '100%',
  //   height: 4,
  //   borderRadius: 2,
  //   marginTop: 16,
  //   overflow: 'hidden',
  // },
  // progressBar: {
  //   height: '100%',
  //   borderRadius: 2,
  // },
  // progressText: {
  //   marginTop: 8,
  //   textAlign: 'center',
  // },
});

// Merge styles
const allStyles = StyleSheet.create({
  ...stylesLoadingOverlayOriginal,
  ...persistenceStyles,
});

// Update the styles reference
const styles = allStyles;

export default LoadingOverlay;
