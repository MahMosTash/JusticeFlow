/**
 * Redux store configuration
 */
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import caseSlice from './slices/caseSlice';
import uiSlice from './slices/uiSlice';
import detectiveBoardReducer from './slices/detectiveBoardSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cases: caseSlice,
    ui: uiSlice,
    detectiveBoard: detectiveBoardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

