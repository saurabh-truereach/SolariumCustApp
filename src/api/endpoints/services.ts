/**
 * Services API Endpoints
 * Handles solar services catalog and related operations
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
 * Service Types
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  image: string;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  servicesCount: number;
  isActive: boolean;
}

/**
 * Request Types
 */
export interface GetServicesRequest extends PaginatedRequest {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
}

export interface GetServiceDetailsRequest {
  serviceId: string;
}

/**
 * Services API Definition
 */
export const servicesApi = createApi({
  reducerPath: 'servicesApi',
  baseQuery,
  tagTypes: ['Service', 'ServiceCategory'],
  endpoints: builder => ({
    /**
     * Get all services with filters
     */
    getServices: builder.query<PaginatedResponse<Service>, GetServicesRequest>({
      query: (params = {}) => {
        const {page = 1, limit = 20, ...filters} = params;
        return {
          url: 'services',
          params: {page, limit, ...filters},
        };
      },
      transformResponse: transformResponse<PaginatedResponse<Service>>,
      transformErrorResponse: transformError,
      providesTags: result => provideTags('Service', result?.data),
      // Demo implementation
      queryFn: async arg => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const demoServices: Service[] = [
          {
            id: 'service_1',
            name: 'Residential Solar Installation',
            description:
              'Complete solar panel installation for homes with warranty and maintenance',
            category: 'Installation',
            price: {min: 80000, max: 200000, currency: 'INR'},
            image: 'https://example.com/residential-solar.jpg',
            features: [
              'Free Site Survey',
              '25 Year Warranty',
              'Net Metering Support',
            ],
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'service_2',
            name: 'Commercial Solar Installation',
            description:
              'Large-scale solar installations for businesses and industries',
            category: 'Installation',
            price: {min: 500000, max: 2000000, currency: 'INR'},
            image: 'https://example.com/commercial-solar.jpg',
            features: [
              'Custom Design',
              'Grid Integration',
              'Energy Monitoring',
            ],
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
          {
            id: 'service_3',
            name: 'Solar Panel Maintenance',
            description:
              'Regular maintenance and cleaning services for solar panels',
            category: 'Maintenance',
            price: {min: 5000, max: 15000, currency: 'INR'},
            image: 'https://example.com/maintenance.jpg',
            features: [
              'Quarterly Cleaning',
              'Performance Check',
              'Repair Services',
            ],
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ];

        // Apply filters
        let filteredServices = demoServices;

        if (arg.category) {
          filteredServices = filteredServices.filter(s =>
            s.category.toLowerCase().includes(arg.category!.toLowerCase())
          );
        }

        if (arg.search) {
          filteredServices = filteredServices.filter(
            s =>
              s.name.toLowerCase().includes(arg.search!.toLowerCase()) ||
              s.description.toLowerCase().includes(arg.search!.toLowerCase())
          );
        }

        // Pagination
        const page = arg.page || 1;
        const limit = arg.limit || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedServices = filteredServices.slice(startIndex, endIndex);

        return {
          data: {
            data: paginatedServices,
            pagination: {
              page,
              limit,
              total: filteredServices.length,
              totalPages: Math.ceil(filteredServices.length / limit),
              hasNext: endIndex < filteredServices.length,
              hasPrev: page > 1,
            },
          },
        };
      },
    }),

    /**
     * Get service details by ID
     */
    getServiceDetails: builder.query<Service, string>({
      query: serviceId => `services/${serviceId}`,
      transformResponse: transformResponse<Service>,
      transformErrorResponse: transformError,
      providesTags: (result, error, serviceId) => [
        {type: 'Service', id: serviceId},
      ],
    }),

    /**
     * Get service categories
     */
    getServiceCategories: builder.query<ServiceCategory[], void>({
      query: () => 'services/categories',
      transformResponse: transformResponse<ServiceCategory[]>,
      transformErrorResponse: transformError,
      providesTags: ['ServiceCategory'],
      // Demo implementation
      queryFn: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const demoCategories: ServiceCategory[] = [
          {
            id: 'cat_1',
            name: 'Installation',
            description: 'Solar panel installation services',
            icon: 'solar-power',
            servicesCount: 2,
            isActive: true,
          },
          {
            id: 'cat_2',
            name: 'Maintenance',
            description: 'Solar panel maintenance and repair',
            icon: 'build',
            servicesCount: 1,
            isActive: true,
          },
          {
            id: 'cat_3',
            name: 'Consultation',
            description: 'Solar energy consultation services',
            icon: 'lightbulb',
            servicesCount: 0,
            isActive: true,
          },
        ];

        return {data: demoCategories};
      },
    }),

    /**
     * Search services
     */
    searchServices: builder.query<Service[], string>({
      query: searchTerm => ({
        url: 'services/search',
        params: {q: searchTerm},
      }),
      transformResponse: transformResponse<Service[]>,
      transformErrorResponse: transformError,
      providesTags: result => provideTags('Service', result),
    }),
  }),
});

// Export hooks
export const {
  useGetServicesQuery,
  useGetServiceDetailsQuery,
  useGetServiceCategoriesQuery,
  useSearchServicesQuery,
} = servicesApi;

export default servicesApi;
