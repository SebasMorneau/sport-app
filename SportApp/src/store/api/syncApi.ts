import { baseApi } from './baseApi';
import { SyncQueueItem, SyncConflict, ApiResponse } from '../../types/api';

export const syncApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    // Sync Queue Management
    getSyncQueue: builder.query<ApiResponse<SyncQueueItem[]>, void>({
      query: () => '/sync/queue',
      providesTags: ['SyncQueue'],
    }),

    processSyncQueue: builder.mutation<
      ApiResponse<{
        processed: number;
        failed: number;
        conflicts: number;
      }>,
      void
    >({
      query: () => ({
        url: '/sync/process',
        method: 'POST',
      }),
      invalidatesTags: ['SyncQueue'],
    }),

    addToSyncQueue: builder.mutation<
      ApiResponse<SyncQueueItem>,
      {
        table_name: string;
        operation: 'create' | 'update' | 'delete';
        data: any;
      }
    >({
      query: data => ({
        url: '/sync/queue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SyncQueue'],
    }),

    removeFromSyncQueue: builder.mutation<ApiResponse<void>, number>({
      query: id => ({
        url: `/sync/queue/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SyncQueue'],
    }),

    // Conflict Resolution
    getSyncConflicts: builder.query<ApiResponse<SyncConflict[]>, void>({
      query: () => '/sync/conflicts',
    }),

    resolveConflict: builder.mutation<
      ApiResponse<void>,
      {
        conflictId: number;
        resolution: 'local' | 'server' | 'merge';
        mergedData?: any;
      }
    >({
      query: ({ conflictId, ...data }) => ({
        url: `/sync/conflicts/${conflictId}/resolve`,
        method: 'POST',
        body: data,
      }),
    }),

    // Full Sync
    performFullSync: builder.mutation<
      ApiResponse<{
        synced_tables: string[];
        total_records: number;
        conflicts: number;
      }>,
      {
        tables?: string[];
        force?: boolean;
      }
    >({
      query: data => ({
        url: '/sync/full',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SyncQueue'],
    }),

    // Sync Status
    getSyncStatus: builder.query<
      ApiResponse<{
        last_sync: string | null;
        pending_operations: number;
        conflicts: number;
        is_syncing: boolean;
      }>,
      void
    >({
      query: () => '/sync/status',
    }),
  }),
});

export const {
  useGetSyncQueueQuery,
  useProcessSyncQueueMutation,
  useAddToSyncQueueMutation,
  useRemoveFromSyncQueueMutation,
  useGetSyncConflictsQuery,
  useResolveConflictMutation,
  usePerformFullSyncMutation,
  useGetSyncStatusQuery,
} = syncApi;
