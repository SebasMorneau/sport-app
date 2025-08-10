import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';

interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface OfflineState {
  isConnected: boolean;
  networkType: string | null;
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSyncTime: number | null;
  autoSync: boolean;
}

const initialState: OfflineState = {
  isConnected: true,
  networkType: null,
  pendingActions: [],
  syncInProgress: false,
  lastSyncTime: null,
  autoSync: true,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setNetworkState: (
      state,
      action: PayloadAction<{
        isConnected: boolean;
        networkType: string | null;
      }>
    ) => {
      state.isConnected = action.payload.isConnected;
      state.networkType = action.payload.networkType;
    },

    addOfflineAction: (
      state,
      action: PayloadAction<
        Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
      >
    ) => {
      const offlineAction: OfflineAction = {
        ...action.payload,
        id: `offline_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      state.pendingActions.push(offlineAction);
    },

    removeOfflineAction: (state, _action: PayloadAction<string>) => {
      state.pendingActions = state.pendingActions.filter(
        action => action.id !== _action.payload
      );
    },

    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const actionItem = state.pendingActions.find(
        item => item.id === action.payload
      );
      if (actionItem) {
        actionItem.retryCount += 1;
      }
    },

    removeFailedActions: state => {
      state.pendingActions = state.pendingActions.filter(
        action => action.retryCount < action.maxRetries
      );
    },

    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },

    setSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },

    setAutoSync: (state, action: PayloadAction<boolean>) => {
      state.autoSync = action.payload;
    },

    clearPendingActions: state => {
      state.pendingActions = [];
    },

    updateActionData: (
      state,
      action: PayloadAction<{
        id: string;
        data: any;
      }>
    ) => {
      const actionItem = state.pendingActions.find(
        item => item.id === action.payload.id
      );
      if (actionItem) {
        actionItem.data = { ...actionItem.data, ...action.payload.data };
      }
    },
  },
});

export const {
  setNetworkState,
  addOfflineAction,
  removeOfflineAction,
  incrementRetryCount,
  removeFailedActions,
  setSyncInProgress,
  setSyncTime,
  setAutoSync,
  clearPendingActions,
  updateActionData,
} = offlineSlice.actions;

// Async thunk for initializing network listener
export const initializeNetworkListener = () => async (dispatch: any) => {
  const unsubscribe = NetInfo.addEventListener(state => {
    dispatch(
      setNetworkState({
        isConnected: state.isConnected ?? false,
        networkType: state.type,
      })
    );
  });

  return unsubscribe;
};

export default offlineSlice.reducer;
