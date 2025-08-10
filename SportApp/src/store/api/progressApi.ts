import { baseApi } from './baseApi';
import {
  ProgressPhoto,
  BodyMeasurement,
  CreateProgressPhotoRequest,
  CreateBodyMeasurementRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  ProgressStats,
} from '../../types/api';

export const progressApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Progress Photos
    getProgressPhotos: builder.query<
      PaginatedResponse<ProgressPhoto>,
      PaginationParams & { type?: string }
    >({
      query: params => ({
        url: '/progress/photos',
        params,
      }),
      providesTags: ['ProgressPhoto'],
    }),

    getProgressPhoto: builder.query<ApiResponse<ProgressPhoto>, number>({
      query: id => `/progress/photos/${id}`,
      providesTags: (result, error, id) => [{ type: 'ProgressPhoto', id }],
    }),

    createProgressPhoto: builder.mutation<
      ApiResponse<ProgressPhoto>,
      CreateProgressPhotoRequest
    >({
      query: data => ({
        url: '/progress/photos',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ProgressPhoto'],
    }),

    updateProgressPhoto: builder.mutation<
      ApiResponse<ProgressPhoto>,
      { id: number; data: Partial<CreateProgressPhotoRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/progress/photos/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ProgressPhoto', id },
      ],
    }),

    deleteProgressPhoto: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/progress/photos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'ProgressPhoto', id }],
    }),

    // Body Measurements
    getBodyMeasurements: builder.query<
      PaginatedResponse<BodyMeasurement>,
      PaginationParams & {
        startDate?: string;
        endDate?: string;
      }
    >({
      query: params => ({
        url: '/progress/measurements',
        params,
      }),
      providesTags: ['BodyMeasurement'],
    }),

    getBodyMeasurement: builder.query<ApiResponse<BodyMeasurement>, number>({
      query: id => `/progress/measurements/${id}`,
      providesTags: (result, error, id) => [{ type: 'BodyMeasurement', id }],
    }),

    createBodyMeasurement: builder.mutation<
      ApiResponse<BodyMeasurement>,
      CreateBodyMeasurementRequest
    >({
      query: data => ({
        url: '/progress/measurements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BodyMeasurement'],
    }),

    updateBodyMeasurement: builder.mutation<
      ApiResponse<BodyMeasurement>,
      { id: number; data: Partial<CreateBodyMeasurementRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/progress/measurements/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'BodyMeasurement', id },
      ],
    }),

    deleteBodyMeasurement: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/progress/measurements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'BodyMeasurement', id }],
    }),

    // Progress Statistics
    getProgressStats: builder.query<
      ApiResponse<ProgressStats>,
      {
        startDate?: string;
        endDate?: string;
      }
    >({
      query: params => ({
        url: '/progress/stats',
        params,
      }),
      providesTags: ['ProgressPhoto', 'BodyMeasurement'],
    }),

    // Comparison endpoints
    compareProgress: builder.query<
      ApiResponse<{
        photos: ProgressPhoto[];
        measurements: BodyMeasurement[];
        weightChange: number;
        measurementChanges: Record<string, number>;
      }>,
      {
        startDate: string;
        endDate: string;
        photoType?: string;
      }
    >({
      query: params => ({
        url: '/progress/compare',
        params,
      }),
      providesTags: ['ProgressPhoto', 'BodyMeasurement'],
    }),

    // Export progress data
    exportProgressData: builder.query<
      Blob,
      {
        format: 'csv' | 'json';
        startDate?: string;
        endDate?: string;
        includePhotos?: boolean;
      }
    >({
      query: params => ({
        url: '/progress/export',
        params,
        responseHandler: 'blob' as any,
      }),
    }),
  }),
});

export const {
  useGetProgressPhotosQuery,
  useGetProgressPhotoQuery,
  useCreateProgressPhotoMutation,
  useUpdateProgressPhotoMutation,
  useDeleteProgressPhotoMutation,
  useGetBodyMeasurementsQuery,
  useGetBodyMeasurementQuery,
  useCreateBodyMeasurementMutation,
  useUpdateBodyMeasurementMutation,
  useDeleteBodyMeasurementMutation,
  useGetProgressStatsQuery,
  useCompareProgressQuery,
  useLazyExportProgressDataQuery,
} = progressApi;
