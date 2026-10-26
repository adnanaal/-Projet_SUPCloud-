import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  files: [],
  currentFolderId: null,
  loading: false,
  error: null,
  selectedFiles: [],
};

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFile: (state, action) => {
      state.files.unshift(action.payload);
    },
    updateFile: (state, action) => {
      const index = state.files.findIndex((file) => file.id === action.payload.id);
      if (index !== -1) {
        state.files[index] = action.payload;
      }
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
    },
    setCurrentFolderId: (state, action) => {
      state.currentFolderId = action.payload;
    },
    setSelectedFiles: (state, action) => {
      state.selectedFiles = action.payload;
    },
    toggleFileSelection: (state, action) => {
      const fileId = action.payload;
      const index = state.selectedFiles.indexOf(fileId);
      if (index === -1) {
        state.selectedFiles.push(fileId);
      } else {
        state.selectedFiles.splice(index, 1);
      }
    },
    clearSelectedFiles: (state) => {
      state.selectedFiles = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setFiles,
  addFile,
  updateFile,
  removeFile,
  setCurrentFolderId,
  setSelectedFiles,
  toggleFileSelection,
  clearSelectedFiles,
  setLoading,
  setError,
  clearError,
} = filesSlice.actions;

export default filesSlice.reducer;
