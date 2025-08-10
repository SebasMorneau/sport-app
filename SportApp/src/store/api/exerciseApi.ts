import { baseApi } from './baseApi';
import {
  Exercise,
  CreateExerciseRequest,
  ExerciseSearchParams,
  ApiResponse,
  PaginatedResponse,
} from '../../types/api';

export const exerciseApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getExercises: builder.query<
      PaginatedResponse<Exercise>,
      ExerciseSearchParams
    >({
      query: params => ({
        url: '/exercises',
        params,
      }),
      providesTags: ['Exercise'],
    }),

    getExercise: builder.query<ApiResponse<Exercise>, number>({
      query: id => `/exercises/${id}`,
      providesTags: (result, error, id) => [{ type: 'Exercise', id }],
    }),

    searchExercises: builder.query<
      PaginatedResponse<Exercise>,
      ExerciseSearchParams
    >({
      query: params => ({
        url: '/exercises/search',
        params,
      }),
      providesTags: ['Exercise'],
    }),

    createExercise: builder.mutation<
      ApiResponse<Exercise>,
      CreateExerciseRequest
    >({
      query: data => ({
        url: '/exercises',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exercise'],
    }),

    updateExercise: builder.mutation<
      ApiResponse<Exercise>,
      { id: number; data: Partial<CreateExerciseRequest> }
    >({
      query: ({ id, data }) => ({
        url: `/exercises/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Exercise', id }],
    }),

    deleteExercise: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/exercises/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Exercise', id }],
    }),

    getMuscleGroups: builder.query<ApiResponse<string[]>, void>({
      query: () => '/exercises/muscle-groups',
      providesTags: ['Exercise'],
    }),

    getEquipmentTypes: builder.query<ApiResponse<string[]>, void>({
      query: () => '/exercises/equipment-types',
      providesTags: ['Exercise'],
    }),

    getPopularExercises: builder.query<
      ApiResponse<Exercise[]>,
      { limit?: number }
    >({
      query: params => ({
        url: '/exercises/popular',
        params,
      }),
      providesTags: ['Exercise'],
    }),
  }),
});

export const {
  useGetExercisesQuery,
  useGetExerciseQuery,
  useSearchExercisesQuery,
  useCreateExerciseMutation,
  useUpdateExerciseMutation,
  useDeleteExerciseMutation,
  useGetMuscleGroupsQuery,
  useGetEquipmentTypesQuery,
  useGetPopularExercisesQuery,
} = exerciseApi;
