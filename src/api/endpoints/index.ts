/**
 * API Endpoints Export
 * Central export for all API endpoints
 */

export {default as authApi} from './auth';
export {default as servicesApi} from './services';
export {default as leadsApi} from './leads';

// Re-export hooks for convenience
export {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterUserMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutUserMutation,
  useDeleteAccountMutation,
} from './auth';

export {
  useGetServicesQuery,
  useGetServiceDetailsQuery,
  useGetServiceCategoriesQuery,
  useSearchServicesQuery,
} from './services';

export {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useGetLeadQuotationsQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useUploadDocumentMutation,
  useGetLeadDocumentsQuery,
  useDeleteLeadMutation,
} from './leads';

// Re-export types
export type {
  SendOtpRequest,
  VerifyOtpRequest,
  RegisterUserRequest,
  UpdateProfileRequest,
  AuthResponse,
  SendOtpResponse,
} from './auth';

export type {
  Service,
  ServiceCategory,
  GetServicesRequest,
} from './services';

export type {
  Lead,
  Quotation,
  Document,
  LeadStatus,
  CreateLeadRequest,
  UpdateLeadRequest,
  GetLeadsRequest,
} from './leads';
