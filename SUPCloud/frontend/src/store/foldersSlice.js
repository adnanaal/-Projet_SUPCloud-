import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  folders: [],
  currentFolderId: null,
  loading: false,
  error: null,
  selectedFolders: [],
};

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setFolders: (state, action) => {
      state.folders = action.payload;
      state.loading = false;
      state.error = null;
    },
    addFolder: (state, action) => {
      state.folders.unshift(action.payload);
    },
    updateFolder: (state, action) => {
      const index = state.folders.findIndex((folder) => folder.id === action.payload.id);
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
    },
    removeFolder: (state, action) => {
      state.folders = state.folders.filter((folder) => folder.id !== action.payload);
    },
    setCurrentFolderId: (state, action) => {
      state.currentFolderId = action.payload;
    },
    setSelectedFolders: (state, action) => {
      state.selectedFolders = action.payload;
    },
    toggleFolderSelection: (state, action) => {
      const folderId = action.payload;
      const index = state.selectedFolders.indexOf(folderId);
      if (index === -1) {
        state.selectedFolders.push(folderId);
      } else {
        state.selectedFolders.splice(index, 1);
      }
    },
    clearSelectedFolders: (state) => {
      state.selectedFolders = [];
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
  setFolders,
  addFolder,
  updateFolder,
  removeFolder,
  setCurrentFolderId,
  setSelectedFolders,
  toggleFolderSelection,
  clearSelectedFolders,
  setLoading,
  setError,
  clearError,
} = foldersSlice.actions;

export default foldersSlice.reducer;
