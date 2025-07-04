/**
 * Role-Based Guard HOC
 * Protects screens based on authentication status
 */

import React from 'react';
import {useAppSelector} from '../hooks/useTypedRedux';
import {selectIsLoggedIn, selectIsLoading} from '../store/authSlice';
import {LoadingOverlay} from '../components';

/**
 * Role-Based Guard Props
 */
interface RoleBasedGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Role-Based Guard Component
 * Redirects unauthenticated users or shows loading state
 */
const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({
  children,
  requireAuth = true,
  fallback = null,
}) => {
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isLoading = useAppSelector(selectIsLoading);

  // Show loading overlay during authentication check
  if (isLoading) {
    return (
      <LoadingOverlay visible={true} message="Checking authentication..." />
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !isLoggedIn) {
    return fallback ? <>{fallback}</> : null;
  }

  // If user is logged in but trying to access auth screens
  if (!requireAuth && isLoggedIn) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * HOC wrapper for components
 */
export function withRoleBasedGuard<T extends object>(
  Component: React.ComponentType<T>,
  options: Omit<RoleBasedGuardProps, 'children'> = {}
) {
  const WrappedComponent = (props: T) => (
    <RoleBasedGuard {...options}>
      <Component {...props} />
    </RoleBasedGuard>
  );

  WrappedComponent.displayName = `withRoleBasedGuard(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

export default RoleBasedGuard;
