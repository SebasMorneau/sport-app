import { baseApi } from './baseApi';
import {
  Training,
  Set,
  CreateTrainingRequest,
  CreateSetRequest,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  TrainingStats,
} from '../../types/api';

export const trainingApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getTrainings: builder.query<
      PaginatedResponse<Training>,
      PaginationParams & {
        startDate?: string;
        endDate?: string;
        completed?: boolean;
      }
    >({
      query: params => ({
        url: '/trainings',
        params,
      }),
      providesTags: ['Training'],
    }),

    getTraining: builder.query<ApiResponse<Training>, number>({
      query: id => `/trainings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Training', id }],
    }),

    createTraining: builder.mutation<
      ApiResponse<Training>,
      CreateTrainingRequest
    >({
      query: data => ({
        url: '/trainings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Training'],
    }),

    updateTraining: builder.mutation<
      ApiResponse<Training>,
      { id: number; data: Partial<CreateTrainingRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/trainings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Training', id }],
    }),

    deleteTraining: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/trainings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Training', id }],
    }),

    completeTraining: builder.mutation<
      ApiResponse<Training>,
      { id: number; duration?: number }
    >({
      query: ({ id, duration }) => ({
        url: `/trainings/${id}/complete`,
        method: 'POST',
        body: { duration },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Training', id }],
    }),

    // Sets management
    getTrainingSets: builder.query<ApiResponse<Set[]>, number>({
      query: trainingId => `/trainings/${trainingId}/sets`,
      providesTags: (result, error, trainingId) => [
        { type: 'Set', id: `training-${trainingId}` },
      ],
    }),

    createSet: builder.mutation<
      ApiResponse<Set>,
      { trainingId: number; data: CreateSetRequest }
    >({
      query: ({ trainingId, data }) => ({
        url: `/trainings/${trainingId}/sets`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { trainingId }) => [
        { type: 'Set', id: `training-${trainingId}` },
        { type: 'Training', id: trainingId },
      ],
    }),

    updateSet: builder.mutation<
      ApiResponse<Set>,
      { trainingId: number; setId: number; data: Partial<CreateSetRequest> }
    >({
      query: ({ trainingId, setId, data }) => ({
        url: `/trainings/${trainingId}/sets/${setId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { trainingId, setId }) => [
        { type: 'Set', id: setId },
        { type: 'Set', id: `training-${trainingId}` },
        { type: 'Training', id: trainingId },
      ],
    }),

    deleteSet: builder.mutation<
      ApiResponse<void>,
      { trainingId: number; setId: number }
    >({
      query: ({ trainingId, setId }) => ({
        url: `/trainings/${trainingId}/sets/${setId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { trainingId, setId }) => [
        { type: 'Set', id: setId },
        { type: 'Set', id: `training-${trainingId}` },
        { type: 'Training', id: trainingId },
      ],
    }),

    // Statistics
    getTrainingStats: builder.query<
      ApiResponse<TrainingStats>,
      {
        startDate?: string;
        endDate?: string;
        period?: 'week' | 'month' | 'year';
      }
    >({
      query: params => ({
        url: '/trainings/stats',
        params,
      }),
      providesTags: ['Training'],
    }),

    getExerciseHistory: builder.query<
      ApiResponse<Set[]>,
      {
        exerciseId: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/trainings/exercise-history',
        params,
      }),
      providesTags: ['Set'],
    }),

    getPersonalRecords: builder.query<
      ApiResponse<
        {
          exercise_id: number;
          exercise_name: string;
          max_weight: number;
          max_reps: number;
          max_volume: number;
          last_performed: string;
        }[]
      >,
      void
    >({
      query: () => '/trainings/personal-records',
      providesTags: ['Set'],
    }),

    // Templates
    saveAsTemplate: builder.mutation<
      ApiResponse<Training>,
      { id: number; templateName: string }
    >({
      query: ({ id, templateName }) => ({
        url: `/trainings/${id}/save-template`,
        method: 'POST',
        body: { templateName },
      }),
      invalidatesTags: ['Training'],
    }),

    getTemplates: builder.query<ApiResponse<Training[]>, void>({
      query: () => '/trainings/templates',
      providesTags: ['Training'],
    }),

    createFromTemplate: builder.mutation<
      ApiResponse<Training>,
      { templateId: number; date?: string }
    >({
      query: ({ templateId, date }) => ({
        url: '/trainings/from-template',
        method: 'POST',
        body: { templateId, date },
      }),
      invalidatesTags: ['Training'],
    }),
  }),
});

export const {
  useGetTrainingsQuery,
  useGetTrainingQuery,
  useCreateTrainingMutation,
  useUpdateTrainingMutation,
  useDeleteTrainingMutation,
  useCompleteTrainingMutation,
  useGetTrainingSetsQuery,
  useCreateSetMutation,
  useUpdateSetMutation,
  useDeleteSetMutation,
  useGetTrainingStatsQuery,
  useGetExerciseHistoryQuery,
  useGetPersonalRecordsQuery,
  useSaveAsTemplateMutation,
  useGetTemplatesQuery,
  useCreateFromTemplateMutation,
} = trainingApi;
