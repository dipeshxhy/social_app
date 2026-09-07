import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { FLUSH, PAUSE, PERSIST, persistReducer, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage/index.js';
import authSlice from './authSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage: storage.default || storage,
};

const rootReducer = combineReducers({
  auth: authSlice,
});

// Now rootReducer is a function, which is exactly what persistReducer needs
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
