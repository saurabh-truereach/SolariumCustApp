/**
 * Leads API Endpoints
 * Handles lead management, quotations, and documents
 */

import {createApi} from '@reduxjs/toolkit/query/react';
import type {PaginatedRequest, PaginatedResponse} from '../../utils/apiHelpers';
import {
  baseQuery,
  transformResponse,
  transformError,
  provideTags,
} from '../baseQuery';

/**
 * Lead Types
 */
export type LeadStatus =
  | 'New Lead'
  | 'In Discussion'
  | 'Physical Meeting Assigned'
  | 'Customer Accepted'
  | 'Won'
  | 'Pending at Solarium'
  | 'Under Execution'
  | 'Executed'
  | 'Not Responding'
  | 'Not Interested'
  | 'Other Territory';

export interface Lead {
  id: string;
  customerId: string;
  services: string[]; // Service IDs
  status: LeadStatus;
  priority: 'Low' | 'Medium' | 'High';
  source: 'App' | 'Website' | 'Referral' | 'Direct';
  description?: string;
  address: string;
  state: string;
  pinCode: string;
  followUpDate?: string;
  assignedTo?: string;
  remarks?: string;
  tokenNumber?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  quotations?: Quotation[];
  documents?: Document[];
}

export interface Quotation {
  id: string;
  leadId: string;
  items: QuotationItem[];
  subtotal: number;
  subsidyAmount: number;
  total: number;
  currency: string;
  validUntil: string;
  status: 'Draft' | 'Created' | 'Shared' | 'Accepted' | 'Rejected';
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationItem {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  specifications?: Record<string, any>;
}

export interface Document {
  id: string;
  leadId: string;
  type: 'KYC' | 'Agreement' | 'Technical' | 'Other';
  category: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

/**
 * Request Types
 */
export interface CreateLeadRequest {
  services: string[];
  description?: string;
  address: string;
  state: string;
  pinCode: string;
}

export interface UpdateLeadRequest {
  status?: LeadStatus;
  priority?: 'Low' | 'Medium' | 'High';
  description?: string;
  address?: string;
  state?: string;
  pinCode?: string;
  followUpDate?: string;
  remarks?: string;
  tokenNumber?: string;
}

export interface GetLeadsRequest extends PaginatedRequest {
  status?: LeadStatus;
  priority?: 'Low' | 'Medium' | 'High';
  source?: 'App' | 'Website' | 'Referral' | 'Direct';
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface UploadDocumentRequest {
  leadId: string;
  type: 'KYC' | 'Agreement' | 'Technical' | 'Other';
  category: string;
  file: File | {uri: string; type: string; name: string};
}

/**
 * Leads API Definition
 */
export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  baseQuery,
  tagTypes: ['Lead', 'Quotation', 'Document'],
  endpoints: builder => ({
    /**
     * Get leads with filters
     */
    getLeads: builder.query<PaginatedResponse<Lead>, GetLeadsRequest>({
      query: (params = {}) => {
        const {page = 1, limit = 20, ...filters} = params;
        return {
          url: 'leads',
          params: {page, limit, ...filters},
        };
      },
      transformResponse: transformResponse<PaginatedResponse<Lead>>,
      transformErrorResponse: transformError,
      providesTags: result => provideTags('Lead', result?.data),
    }),

    /**
     * Get lead by ID
     */
    getLeadById: builder.query<Lead, string>({
      query: leadId => `leads/${leadId}`,
      transformResponse: transformResponse<Lead>,
      transformErrorResponse: transformError,
      providesTags: (result, error, leadId) => [{type: 'Lead', id: leadId}],
    }),

    /**
     * Create new lead
     */
    createLead: builder.mutation<Lead, CreateLeadRequest>({
      query: data => ({
        url: 'leads',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformResponse<Lead>,
      transformErrorResponse: transformError,
      invalidatesTags: ['Lead'],
      // Demo implementation
      queryFn: async arg => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const demoLead: Lead = {
          id: `lead_${Date.now()}`,
          customerId: 'current_user_id',
          services: arg.services,
          status: 'New Lead',
          priority: 'Medium',
          source: 'App',
          description: arg.description,
          address: arg.address,
          state: arg.state,
          pinCode: arg.pinCode,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          customer: {
            id: 'current_user_id',
            name: 'Demo User',
            phone: '1234567890',
            email: 'demo@solarium.com',
          },
          quotations: [],
          documents: [],
        };

        return {data: demoLead};
      },
    }),

    /**
     * Update lead
     */
    updateLead: builder.mutation<Lead, {leadId: string} & UpdateLeadRequest>({
      query: ({leadId, ...data}) => ({
        url: `leads/${leadId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: transformResponse<Lead>,
      transformErrorResponse: transformError,
      invalidatesTags: (result, error, {leadId}) => [
        {type: 'Lead', id: leadId},
        {type: 'Lead', id: 'LIST'},
      ],
    }),

    /**
     * Get quotations for a lead
     */
    getLeadQuotations: builder.query<Quotation[], string>({
      query: leadId => `leads/${leadId}/quotations`,
      transformResponse: transformResponse<Quotation[]>,
      transformErrorResponse: transformError,
      providesTags: (result, error, leadId) => [
        {type: 'Quotation', id: leadId},
      ],
    }),

    /**
     * Accept quotation
     */
    acceptQuotation: builder.mutation<{message: string}, {quotationId: string}>(
      {
        query: ({quotationId}) => ({
          url: `quotations/${quotationId}/accept`,
          method: 'POST',
        }),
        transformResponse: transformResponse<{message: string}>,
        transformErrorResponse: transformError,
        invalidatesTags: ['Lead', 'Quotation'],
      }
    ),

    /**
     * Reject quotation
     */
    rejectQuotation: builder.mutation<
      {message: string},
      {quotationId: string; reason?: string}
    >({
      query: ({quotationId, reason}) => ({
        url: `quotations/${quotationId}/reject`,
        method: 'POST',
        body: {reason},
      }),
      transformResponse: transformResponse<{message: string}>,
      transformErrorResponse: transformError,
      invalidatesTags: ['Lead', 'Quotation'],
    }),

    /**
     * Upload document
     */
    uploadDocument: builder.mutation<Document, UploadDocumentRequest>({
      query: ({leadId, type, category, file}) => {
        const formData = new FormData();
        formData.append('type', type);
        formData.append('category', category);
        formData.append('file', file as any);

        return {
          url: `leads/${leadId}/documents`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      transformResponse: transformResponse<Document>,
      transformErrorResponse: transformError,
      invalidatesTags: (result, error, {leadId}) => [
        {type: 'Lead', id: leadId},
        {type: 'Document', id: leadId},
      ],
    }),

    /**
     * Get lead documents
     */
    getLeadDocuments: builder.query<Document[], string>({
      query: leadId => `leads/${leadId}/documents`,
      transformResponse: transformResponse<Document[]>,
      transformErrorResponse: transformError,
      providesTags: (result, error, leadId) => [{type: 'Document', id: leadId}],
    }),

    /**
     * Delete lead
     */
    deleteLead: builder.mutation<{message: string}, string>({
      query: leadId => ({
        url: `leads/${leadId}`,
        method: 'DELETE',
      }),
      transformResponse: transformResponse<{message: string}>,
      transformErrorResponse: transformError,
      invalidatesTags: (result, error, leadId) => [
        {type: 'Lead', id: leadId},
        {type: 'Lead', id: 'LIST'},
      ],
    }),
  }),
});

// Export hooks
export const {
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
} = leadsApi;

export default leadsApi;
