import { baseApi } from './baseApi';
import {
  UserProfile,
  Friend,
  WorkoutShare,
  ActivityFeed,
  ApiResponse,
  PaginatedResponse,
} from '../../types/api';

export const socialApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Profile Management
    getUserProfile: builder.query<ApiResponse<UserProfile>, number | void>({
      query: userId =>
        userId ? `/social/profiles/${userId}` : '/social/profile',
      providesTags: ['UserProfile'],
    }),

    updateUserProfile: builder.mutation<
      ApiResponse<UserProfile>,
      Partial<UserProfile>
    >({
      query: data => ({
        url: '/social/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['UserProfile'],
    }),

    // Friends Management
    getFriends: builder.query<ApiResponse<Friend[]>, void>({
      query: () => '/social/friends',
      providesTags: ['Friend'],
    }),

    sendFriendRequest: builder.mutation<ApiResponse<void>, { email: string }>({
      query: data => ({
        url: '/social/friends/request',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Friend'],
    }),

    respondToFriendRequest: builder.mutation<
      ApiResponse<void>,
      {
        requestId: number;
        accept: boolean;
      }
    >({
      query: ({ requestId, accept }) => ({
        url: `/social/friends/respond/${requestId}`,
        method: 'POST',
        body: { accept },
      }),
      invalidatesTags: ['Friend'],
    }),

    removeFriend: builder.mutation<ApiResponse<void>, number>({
      query: friendId => ({
        url: `/social/friends/${friendId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Friend'],
    }),

    // Workout Sharing
    shareWorkout: builder.mutation<
      ApiResponse<WorkoutShare>,
      {
        trainingId: number;
        message?: string;
      }
    >({
      query: data => ({
        url: '/social/share/workout',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WorkoutShare', 'ActivityFeed'],
    }),

    getSharedWorkouts: builder.query<
      PaginatedResponse<WorkoutShare>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/social/share/workouts',
        params,
      }),
      providesTags: ['WorkoutShare'],
    }),

    // Activity Feed
    getActivityFeed: builder.query<
      PaginatedResponse<ActivityFeed>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/social/feed',
        params,
      }),
      providesTags: ['ActivityFeed'],
    }),

    // Search Users
    searchUsers: builder.query<
      ApiResponse<UserProfile[]>,
      {
        query: string;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/social/search/users',
        params,
      }),
      providesTags: ['UserProfile'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useGetFriendsQuery,
  useSendFriendRequestMutation,
  useRespondToFriendRequestMutation,
  useRemoveFriendMutation,
  useShareWorkoutMutation,
  useGetSharedWorkoutsQuery,
  useGetActivityFeedQuery,
  useSearchUsersQuery,
} = socialApi;
