/**
 * Services Screen
 * Shows available services catalog
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import {SafeAreaLayout} from '../../components';
import type {MainTabScreenProps} from '../../navigation/types';
import {useAppTheme} from '../../theme/ThemeProvider';

type Props = MainTabScreenProps<'Services'>;

const ServicesScreen: React.FC<Props> = () => {
  const theme = useAppTheme();

  return (
    <SafeAreaLayout>
      <View
        style={[styles.container, {backgroundColor: theme.colors.background}]}
      >
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={[styles.title, {color: theme.colors.primary}]}
            >
              Our Services
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.description, {color: theme.colors.onSurface}]}
            >
              Solar installation and maintenance services will be displayed
              here.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
  },
});

export default ServicesScreen;
