import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isLoading: boolean;
  loadingMessage: string | null;
  error: string | null;
  notifications: Notification[];
  currentRoute: string;
  bottomTabVisible: boolean;
  theme: 'light' | 'dark' | 'system';
  refreshing: { [key: string]: boolean };
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

const initialState: UIState = {
  isLoading: false,
  loadingMessage: null,
  error: null,
  notifications: [],
  currentRoute: 'Home',
  bottomTabVisible: true,
  theme: 'system',
  refreshing: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (
      state,
      action: PayloadAction<{ isLoading: boolean; message?: string }>
    ) => {
      state.isLoading = action.payload.isLoading;
      state.loadingMessage = action.payload.message || null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
    setCurrentRoute: (state, action: PayloadAction<string>) => {
      state.currentRoute = action.payload;
    },
    setBottomTabVisible: (state, action: PayloadAction<boolean>) => {
      state.bottomTabVisible = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
    },
    setRefreshing: (
      state,
      action: PayloadAction<{ key: string; isRefreshing: boolean }>
    ) => {
      state.refreshing[action.payload.key] = action.payload.isRefreshing;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
  setCurrentRoute,
  setBottomTabVisible,
  setTheme,
  setRefreshing,
} = uiSlice.actions;

export default uiSlice.reducer;
