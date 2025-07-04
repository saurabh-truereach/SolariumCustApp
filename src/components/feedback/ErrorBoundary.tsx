/**
 * Error Boundary Component
 * Catches JavaScript errors and displays a fallback UI
 */

import React, {Component, ErrorInfo, ReactNode} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors, spacing, typography} from '../../theme/palette';

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void; // Optional callback for logging/analytics
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * Provides graceful error handling for the entire app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  /**
   * Static method to update state when an error occurs
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Lifecycle method called when an error occurs
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error('[ErrorBoundary] Caught an error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to a crash reporting service
    // Example: Crashlytics.recordError(error);
  }

  /**
   * Reset error boundary state
   * Handles its own reset and notifies parent
   */
  resetError = () => {
    console.log('[ErrorBoundary] Resetting error state');

    // Reset internal state
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });

    // Notify parent for logging/analytics (optional)
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  /**
   * Reload the app (alternative reset method)
   */
  reloadApp = () => {
    console.log('[ErrorBoundary] Reloading app requested');
    // In a real app, you might use RNRestart or similar
    this.resetError();
  };

  /**
   * Enhanced fallback UI with better design
   */
  renderDefaultFallback() {
    const {error, errorInfo} = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Modern Error Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>😔</Text>
          </View>

          {/* Main Error Message */}
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.description}>
            We apologize for the inconvenience. The app encountered an
            unexpected issue and needs to recover.
          </Text>

          {/* Error Details (development only) */}
          {__DEV__ && error && (
            <View style={styles.errorDetails}>
              <Text style={styles.errorTitle}>Debug Information:</Text>
              <Text style={styles.errorMessage}>{error.message}</Text>
              {errorInfo && (
                <Text style={styles.errorStack} numberOfLines={3}>
                  {errorInfo.componentStack.split('\n').slice(0, 3).join('\n')}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={this.resetError}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>🔄 Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={this.reloadApp}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>↻ Reload App</Text>
            </TouchableOpacity>
          </View>

          {/* Support Information */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>
              If this problem continues, please contact our support team.
            </Text>
            <Text style={styles.supportEmail}>support@solarium.in</Text>
          </View>
        </View>
      </View>
    );
  }

  render() {
    const {hasError} = this.state;
    const {children, fallback} = this.props;

    if (hasError) {
      // Use custom fallback if provided, otherwise use enhanced default
      return fallback || this.renderDefaultFallback();
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: 50,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  errorDetails: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    backgroundColor: '#f5f5f5',
    padding: spacing.xs,
    borderRadius: 4,
  },
  errorStack: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'monospace',
    color: colors.text.secondary,
    backgroundColor: '#f8f8f8',
    padding: spacing.xs,
    borderRadius: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  supportContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    width: '100%',
  },
  supportText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  supportEmail: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
