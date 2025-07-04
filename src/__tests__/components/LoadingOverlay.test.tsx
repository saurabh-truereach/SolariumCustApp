/**
 * LoadingOverlay Component tests
 */

import React from 'react';
import {renderWithProviders} from '../../utils/testUtils';
import {LoadingOverlay, PersistenceLoadingOverlay} from '../../components';

describe('LoadingOverlay', () => {
  it('renders when visible is true', () => {
    const {getByTestId} = renderWithProviders(
      <LoadingOverlay visible={true} testID="loading" />
    );

    expect(getByTestId('loading')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const {queryByTestId} = renderWithProviders(
      <LoadingOverlay visible={false} testID="loading" />
    );

    expect(queryByTestId('loading')).toBeNull();
  });

  it('displays custom message', () => {
    const {getByText} = renderWithProviders(
      <LoadingOverlay visible={true} message="Custom Loading Message" />
    );

    expect(getByText('Custom Loading Message')).toBeTruthy();
  });

  it('handles different sizes', () => {
    const {getByTestId} = renderWithProviders(
      <LoadingOverlay visible={true} size="small" testID="loading" />
    );

    expect(getByTestId('loading')).toBeTruthy();
  });

  it('applies custom color', () => {
    const {getByTestId} = renderWithProviders(
      <LoadingOverlay visible={true} color="#FF0000" testID="loading" />
    );

    expect(getByTestId('loading')).toBeTruthy();
  });

  it('handles transparent mode', () => {
    const {getByTestId} = renderWithProviders(
      <LoadingOverlay visible={true} transparent testID="loading" />
    );

    expect(getByTestId('loading')).toBeTruthy();
  });
});

describe('PersistenceLoadingOverlay', () => {
  it('renders with initializing stage', () => {
    const {getByText} = renderWithProviders(
      <PersistenceLoadingOverlay visible={true} stage="initializing" />
    );

    expect(getByText('Initializing app...')).toBeTruthy();
  });

  it('renders with rehydrating stage', () => {
    const {getByText} = renderWithProviders(
      <PersistenceLoadingOverlay visible={true} stage="rehydrating" />
    );

    expect(getByText('Restoring your data...')).toBeTruthy();
  });

  it('renders with migrating stage', () => {
    const {getByText} = renderWithProviders(
      <PersistenceLoadingOverlay visible={true} stage="migrating" />
    );

    expect(getByText('Updating app data...')).toBeTruthy();
  });

  it('displays progress bar when progress is provided', () => {
    const {getByText} = renderWithProviders(
      <PersistenceLoadingOverlay visible={true} stage="rehydrating" progress={50} />
    );

    expect(getByText('50%')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const {queryByText} = renderWithProviders(
      <PersistenceLoadingOverlay visible={false} stage="initializing" />
    );

    expect(queryByText('Initializing app...')).toBeNull();
  });
});
