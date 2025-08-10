import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../index';
import Config from '../../config/config';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: Config.API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState;
    const token = state.auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Base query with reauthentication
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired, log out user
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Exercise',
    'Training',
    'Set',
    'Program',
    'UserProgram',
    'ProgressPhoto',
    'BodyMeasurement',
    'Food',
    'NutritionEntry',
    'UserProfile',
    'Friend',
    'WorkoutShare',
    'ActivityFeed',
    'AIRecommendation',
    'WearableDevice',
    'HeartRateData',
    'SleepData',
    'ActivityData',
    'SyncQueue',
  ],
  endpoints: () => ({}),
});
