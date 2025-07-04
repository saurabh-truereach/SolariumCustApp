/**
 * Safe Area Layout Component
 * Provides consistent safe area handling and basic layout structure
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAppTheme} from '../../theme/ThemeProvider';

/**
 * Safe Area Layout Props
 */
interface SafeAreaLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  backgroundColor?: string;
  statusBarStyle?: 'default' | 'dark-content' | 'light-content';
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  style?: object;
}

/**
 * Safe Area Layout Component
 * Provides consistent safe area handling across all screens
 */
const SafeAreaLayout: React.FC<SafeAreaLayoutProps> = ({
  children,
  scrollable = false,
  keyboardAvoiding = true,
  backgroundColor,
  statusBarStyle = 'dark-content',
  edges = ['top', 'bottom', 'left', 'right'],
  style,
}) => {
  const theme = useAppTheme();
  const bgColor = backgroundColor || theme.colors.background;

  // Render content based on configuration
  const renderContent = () => {
    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {scrollable ? (
            <ScrollView
              style={[styles.scrollView, {backgroundColor: bgColor}]}
              contentContainerStyle={[styles.scrollContent, style]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={[styles.content, {backgroundColor: bgColor}, style]}>
              {children}
            </View>
          )}
        </KeyboardAvoidingView>
      );
    }

    if (scrollable) {
      return (
        <ScrollView
          style={[styles.scrollView, {backgroundColor: bgColor}]}
          contentContainerStyle={[styles.scrollContent, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={[styles.content, {backgroundColor: bgColor}, style]}>
        {children}
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={bgColor}
        translucent={false}
      />
      <SafeAreaView
        style={[styles.container, {backgroundColor: bgColor}]}
        edges={edges}
      >
        {renderContent()}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default SafeAreaLayout;
