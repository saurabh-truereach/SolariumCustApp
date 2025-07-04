/**
 * API Module Export
 * Main export for the API layer
 */

// Base query and utilities
export {default as baseQuery} from './baseQuery';
export {
  transformResponse,
  transformError,
  createTag,
  provideTags,
  invalidateTags,
} from './baseQuery';

// API endpoints
export * from './endpoints';

// API utilities
export * from '../utils/apiHelpers';

// Convenience re-exports for commonly used items
export {
  // Auth hooks
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useLogoutUserMutation,
  
  // Services hooks
  useGetServicesQuery,
  useGetServiceCategoriesQuery,
  
  // Leads hooks
  useGetLeadsQuery,
  useCreateLeadMutation,
  useGetLeadByIdQuery,
} from './endpoints';
