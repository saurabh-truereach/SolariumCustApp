/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';
import Config from 'react-native-config';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  BASE_API_URL: 'https://api.dev.solarium.in',
  APP_ENV: 'development',
}));

describe('App Component', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('displays correct environment configuration', () => {
    expect(Config.BASE_API_URL).toBe('https://api.dev.solarium.in');
    expect(Config.APP_ENV).toBe('development');
  });
});