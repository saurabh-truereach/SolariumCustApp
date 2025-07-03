/**
 * Error Boundary tests
 */

import React from 'react';
import {Text} from 'react-native';
import renderer from 'react-test-renderer';
import {ErrorBoundary} from '../components';

const ThrowError = ({shouldThrow}: {shouldThrow: boolean}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('catches and displays error', () => {
    const tree = renderer.create(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();
    
    renderer.create(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalled();
  });
});
