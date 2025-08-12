import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API slices
import { authApi } from './api/authApi';
import { exerciseApi } from './api/exerciseApi';
import { trainingApi } from './api/trainingApi';
import { programApi } from './api/programApi';
import { progressApi } from './api/progressApi';
import { nutritionApi } from './api/nutritionApi';
import { socialApi } from './api/socialApi';
import { aiApi } from './api/aiApi';
import { wearableApi } from './api/wearableApi';
import { syncApi } from './api/syncApi';

// Slice reducers
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import offlineReducer from './slices/offlineSlice';
import workoutReducer from './slices/workoutSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'offline', 'ui'], // Persist auth, offline data, and UI preferences (theme)
};

const rootReducer = combineReducers({
  // API reducers
  authApi: authApi.reducer,
  exerciseApi: exerciseApi.reducer,
  trainingApi: trainingApi.reducer,
  programApi: programApi.reducer,
  progressApi: progressApi.reducer,
  nutritionApi: nutritionApi.reducer,
  socialApi: socialApi.reducer,
  aiApi: aiApi.reducer,
  wearableApi: wearableApi.reducer,
  syncApi: syncApi.reducer,

  // Slice reducers
  auth: authReducer,
  ui: uiReducer,
  offline: offlineReducer,
  workout: workoutReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      authApi.middleware,
      exerciseApi.middleware,
      trainingApi.middleware,
      programApi.middleware,
      progressApi.middleware,
      nutritionApi.middleware,
      socialApi.middleware,
      aiApi.middleware,
      wearableApi.middleware,
      syncApi.middleware
    ),
});

export const persistor = persistStore(store);

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
