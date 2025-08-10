import { baseApi } from './baseApi';
import {
  AIRecommendation,
  UserPreferences,
  ApiResponse,
} from '../../types/api';

export const aiApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getRecommendations: builder.query<
      ApiResponse<AIRecommendation[]>,
      {
        type?: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/ai/recommendations',
        params,
      }),
      providesTags: ['AIRecommendation'],
    }),

    generateWorkoutRecommendation: builder.mutation<
      ApiResponse<AIRecommendation>,
      {
        preferences?: string[];
        excludeExercises?: number[];
      }
    >({
      query: data => ({
        url: '/ai/recommend/workout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    acceptRecommendation: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/ai/recommendations/${id}/accept`,
        method: 'POST',
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    dismissRecommendation: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/ai/recommendations/${id}/dismiss`,
        method: 'POST',
      }),
      invalidatesTags: ['AIRecommendation'],
    }),

    getUserPreferences: builder.query<ApiResponse<UserPreferences[]>, void>({
      query: () => '/ai/preferences',
    }),

    updateUserPreferences: builder.mutation<
      ApiResponse<void>,
      {
        preferences: { [key: string]: string };
      }
    >({
      query: data => ({
        url: '/ai/preferences',
        method: 'PUT',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetRecommendationsQuery,
  useGenerateWorkoutRecommendationMutation,
  useAcceptRecommendationMutation,
  useDismissRecommendationMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = aiApi;
