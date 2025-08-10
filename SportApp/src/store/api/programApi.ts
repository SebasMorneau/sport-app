import { baseApi } from './baseApi';
import {
  Program,
  UserProgram,
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
} from '../../types/api';

export const programApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    getPrograms: builder.query<
      PaginatedResponse<Program>,
      PaginationParams & {
        difficulty?: string;
        search?: string;
      }
    >({
      query: params => ({
        url: '/programs',
        params,
      }),
      providesTags: ['Program'],
    }),

    getProgram: builder.query<ApiResponse<Program>, number>({
      query: id => `/programs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Program', id }],
    }),

    subscribeToProgram: builder.mutation<ApiResponse<UserProgram>, number>({
      query: programId => ({
        url: `/programs/${programId}/subscribe`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProgram'],
    }),

    unsubscribeFromProgram: builder.mutation<ApiResponse<void>, number>({
      query: programId => ({
        url: `/programs/${programId}/unsubscribe`,
        method: 'POST',
      }),
      invalidatesTags: ['UserProgram'],
    }),

    getUserPrograms: builder.query<ApiResponse<UserProgram[]>, void>({
      query: () => '/programs/user-programs',
      providesTags: ['UserProgram'],
    }),

    updateProgramProgress: builder.mutation<
      ApiResponse<UserProgram>,
      {
        programId: number;
        week: number;
        completed?: boolean;
      }
    >({
      query: ({ programId, ...data }) => ({
        url: `/programs/${programId}/progress`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProgram'],
    }),
  }),
});

export const {
  useGetProgramsQuery,
  useGetProgramQuery,
  useSubscribeToProgramMutation,
  useUnsubscribeFromProgramMutation,
  useGetUserProgramsQuery,
  useUpdateProgramProgressMutation,
} = programApi;
