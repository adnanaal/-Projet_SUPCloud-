import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import filesReducer from './filesSlice';
import foldersReducer from './foldersSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: filesReducer,
    folders: foldersReducer,
    ui: uiReducer,
  },
});

export default store;
