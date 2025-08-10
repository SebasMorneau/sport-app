import { baseApi } from './baseApi';
import {
  WearableDevice,
  HeartRateData,
  SleepData,
  ActivityData,
  ApiResponse,
  PaginatedResponse,
} from '../../types/api';

export const wearableApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Device Management
    getDevices: builder.query<ApiResponse<WearableDevice[]>, void>({
      query: () => '/wearables/devices',
      providesTags: ['WearableDevice'],
    }),

    connectDevice: builder.mutation<
      ApiResponse<WearableDevice>,
      {
        device_type: string;
        device_name: string;
        device_id: string;
      }
    >({
      query: data => ({
        url: '/wearables/devices/connect',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WearableDevice'],
    }),

    disconnectDevice: builder.mutation<ApiResponse<void>, number>({
      query: deviceId => ({
        url: `/wearables/devices/${deviceId}/disconnect`,
        method: 'POST',
      }),
      invalidatesTags: ['WearableDevice'],
    }),

    syncDevice: builder.mutation<ApiResponse<void>, number>({
      query: deviceId => ({
        url: `/wearables/devices/${deviceId}/sync`,
        method: 'POST',
      }),
      invalidatesTags: ['HeartRateData', 'SleepData', 'ActivityData'],
    }),

    // Heart Rate Data
    getHeartRateData: builder.query<
      PaginatedResponse<HeartRateData>,
      {
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/wearables/heart-rate',
        params,
      }),
      providesTags: ['HeartRateData'],
    }),

    syncHeartRateData: builder.mutation<ApiResponse<void>, HeartRateData[]>({
      query: data => ({
        url: '/wearables/heart-rate/sync',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['HeartRateData'],
    }),

    // Sleep Data
    getSleepData: builder.query<
      PaginatedResponse<SleepData>,
      {
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/wearables/sleep',
        params,
      }),
      providesTags: ['SleepData'],
    }),

    syncSleepData: builder.mutation<ApiResponse<void>, SleepData[]>({
      query: data => ({
        url: '/wearables/sleep/sync',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['SleepData'],
    }),

    // Activity Data
    getActivityData: builder.query<
      PaginatedResponse<ActivityData>,
      {
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
      }
    >({
      query: params => ({
        url: '/wearables/activity',
        params,
      }),
      providesTags: ['ActivityData'],
    }),

    syncActivityData: builder.mutation<ApiResponse<void>, ActivityData[]>({
      query: data => ({
        url: '/wearables/activity/sync',
        method: 'POST',
        body: { data },
      }),
      invalidatesTags: ['ActivityData'],
    }),
  }),
});

export const {
  useGetDevicesQuery,
  useConnectDeviceMutation,
  useDisconnectDeviceMutation,
  useSyncDeviceMutation,
  useGetHeartRateDataQuery,
  useSyncHeartRateDataMutation,
  useGetSleepDataQuery,
  useSyncSleepDataMutation,
  useGetActivityDataQuery,
  useSyncActivityDataMutation,
} = wearableApi;
