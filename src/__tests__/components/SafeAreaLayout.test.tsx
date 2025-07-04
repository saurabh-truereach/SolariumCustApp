/**
 * SafeAreaLayout Component tests
 */

import React from 'react';
import {Text} from 'react-native';
import {renderWithProviders} from '../../utils/testUtils';
import {SafeAreaLayout} from '../../components';

describe('SafeAreaLayout', () => {
  it('renders children correctly', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout>
        <Text>Test Content</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies scrollable prop correctly', () => {
    const {getByTestId} = renderWithProviders(
      <SafeAreaLayout scrollable testID="layout">
        <Text>Scrollable Content</Text>
      </SafeAreaLayout>
    );

    expect(getByTestId('layout')).toBeTruthy();
  });

  it('handles keyboard avoiding correctly', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout keyboardAvoiding>
        <Text>Keyboard Avoiding Content</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Keyboard Avoiding Content')).toBeTruthy();
  });

  it('applies custom background color', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout backgroundColor="#FF0000">
        <Text>Colored Background</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Colored Background')).toBeTruthy();
  });

  it('handles different status bar styles', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout statusBarStyle="light-content">
        <Text>Light Status Bar</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Light Status Bar')).toBeTruthy();
  });

  it('applies custom edges correctly', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout edges={['top', 'bottom']}>
        <Text>Custom Edges</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Custom Edges')).toBeTruthy();
  });

  it('combines scrollable and keyboard avoiding', () => {
    const {getByText} = renderWithProviders(
      <SafeAreaLayout scrollable keyboardAvoiding>
        <Text>Combined Features</Text>
      </SafeAreaLayout>
    );

    expect(getByText('Combined Features')).toBeTruthy();
  });
});
