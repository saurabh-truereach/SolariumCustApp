/**
 * Documents Screen
 * Shows user's uploaded documents and KYC
 */

import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Card, Text} from 'react-native-paper';
import type {MainTabScreenProps} from '../../navigation/types';
import {SafeAreaLayout} from '../../components';
import {useAppTheme} from '../../theme/ThemeProvider';

type Props = MainTabScreenProps<'Documents'>;

const DocumentsScreen: React.FC<Props> = () => {
  const theme = useAppTheme();

  return (
    <SafeAreaLayout>
      <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="headlineMedium"
              style={[styles.title, {color: theme.colors.primary}]}>
              Documents
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.description, {color: theme.colors.onSurface}]}>
              Your uploaded documents and KYC files will be displayed here.
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

export default DocumentsScreen;
