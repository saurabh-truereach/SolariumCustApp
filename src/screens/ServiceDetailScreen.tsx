/**
 * Service Detail Screen
 * Shows details for a specific lead/service (for deep link testing)
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Text} from 'react-native-paper';
import type {RootStackScreenProps} from '../navigation/types';
import {SafeAreaLayout} from '../components';
import {useAppTheme} from '../theme/ThemeProvider';

type Props = RootStackScreenProps<'ServiceDetail'>;

/**
 * Service Detail Screen Component
 */
const ServiceDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const theme = useAppTheme();
  const {leadId} = route.params;

  return (
    <SafeAreaLayout>
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={[styles.title, {color: theme.colors.primary}]}>
              Service Detail
            </Text>
            
            <Text
              variant="bodyLarge"
              style={[styles.description, {color: theme.colors.onSurface}]}>
              This screen shows details for Lead ID: {leadId}
            </Text>
            
            <Text
              variant="bodyMedium"
              style={[styles.note, {color: theme.colors.onSurface}]}>
              This screen was opened via deep link navigation.
              In a real app, this would show the actual lead/service details.
            </Text>
            
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
              icon="arrow-left">
              Go Back
            </Button>
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
    marginBottom: 16,
  },
  note: {
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 16,
  },
});

export default ServiceDetailScreen;
