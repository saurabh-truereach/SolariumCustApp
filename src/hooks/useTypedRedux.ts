/**
 * Typed Redux Hooks
 * Provides typed versions of useDispatch and useSelector with additional utilities
 */

import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {useCallback, useEffect, useState} from 'react';
import type {RootState, AppDispatch} from '../store';
import {authApi, servicesApi, leadsApi} from '../api';
import {persistor, storeUtils} from '../store';
import {persistenceHelpers} from '../utils/persistenceHelpers';

/**
 * Typed useDispatch hook
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed useSelector hook
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * Hook for dispatching actions with automatic type inference
 */
export const useAppAction = () => {
  const dispatch = useAppDispatch();
  
  return useCallback(
    <T extends Parameters<AppDispatch>[0]>(action: T) => {
      return dispatch(action);
    },
    [dispatch]
  );
};

/**
 * Hook for selecting auth state
 */
export const useAuthState = () => {
  return useAppSelector(state => state.auth);
};

/**
 * Hook for selecting UI state
 */
export const useUIState = () => {
  return useAppSelector(state => state.ui);
};

/**
 * Hook for selecting cache state
 */
export const useCacheState = () => {
  return useAppSelector(state => state.cache);
};

/**
 * Hook for auth API operations
 */
export const useAuthAPI = () => {
  const [sendOtp] = authApi.useSendOtpMutation();
  const [verifyOtp] = authApi.useVerifyOtpMutation();
  const [logout] = authApi.useLogoutUserMutation();
  const [updateProfile] = authApi.useUpdateProfileMutation();
  
  return {
    sendOtp,
    verifyOtp,
    logout,
    updateProfile,
  };
};

/**
 * Hook for services API operations
 */
export const useServicesAPI = () => {
  const {
    data: services,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = servicesApi.useGetServicesQuery({});
  
  const {
    data: categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = servicesApi.useGetServiceCategoriesQuery();
  
  return {
    services,
    servicesLoading,
    servicesError,
    refetchServices,
    categories,
    categoriesLoading,
    categoriesError,
  };
};

/**
 * Hook for leads API operations
 */
export const useLeadsAPI = () => {
  const {
    data: leads,
    isLoading: leadsLoading,
    error: leadsError,
    refetch: refetchLeads,
  } = leadsApi.useGetLeadsQuery({});
  
  const [createLead] = leadsApi.useCreateLeadMutation();
  const [updateLead] = leadsApi.useUpdateLeadMutation();
  const [deleteLead] = leadsApi.useDeleteLeadMutation();
  
  return {
    leads,
    leadsLoading,
    leadsError,
    refetchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
};

/**
 * Hook for API loading states
 */
export const useAPILoadingStates = () => {
  const authQueries = useAppSelector(state => state.authApi?.queries || {});
  const servicesQueries = useAppSelector(state => state.servicesApi?.queries || {});
  const leadsQueries = useAppSelector(state => state.leadsApi?.queries || {});
  
  const isAnyLoading = 
    Object.values(authQueries).some((query: any) => query?.status === 'pending') ||
    Object.values(servicesQueries).some((query: any) => query?.status === 'pending') ||
    Object.values(leadsQueries).some((query: any) => query?.status === 'pending');
  
  return {
    isAnyLoading,
    authLoading: Object.values(authQueries).some((query: any) => query?.status === 'pending'),
    servicesLoading: Object.values(servicesQueries).some((query: any) => query?.status === 'pending'),
    leadsLoading: Object.values(leadsQueries).some((query: any) => query?.status === 'pending'),
  };
};

/**
 * Hook to check if Redux store is rehydrated
 */
export const useRehydrated = () => {
  const [isRehydrated, setIsRehydrated] = useState(
    persistor.getState().bootstrapped
  );

  useEffect(() => {
    if (isRehydrated) return;

    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        setIsRehydrated(true);
      }
    });

    return unsubscribe;
  }, [isRehydrated]);

  return isRehydrated;
};
