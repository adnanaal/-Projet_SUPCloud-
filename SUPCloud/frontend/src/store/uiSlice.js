import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
  uploadModalOpen: false,
  createFolderModalOpen: false,
  renameModalOpen: false,
  moveModalOpen: false,
  shareModalOpen: false,
  deleteModalOpen: false,
  selectedItem: null,
  itemType: null, // 'file' or 'folder'
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    openUploadModal: (state) => {
      state.uploadModalOpen = true;
    },
    closeUploadModal: (state) => {
      state.uploadModalOpen = false;
    },
    openCreateFolderModal: (state) => {
      state.createFolderModalOpen = true;
    },
    closeCreateFolderModal: (state) => {
      state.createFolderModalOpen = false;
    },
    openRenameModal: (state, action) => {
      state.renameModalOpen = true;
      state.selectedItem = action.payload.item;
      state.itemType = action.payload.type;
    },
    closeRenameModal: (state) => {
      state.renameModalOpen = false;
      state.selectedItem = null;
      state.itemType = null;
    },
    openMoveModal: (state, action) => {
      state.moveModalOpen = true;
      state.selectedItem = action.payload.item;
      state.itemType = action.payload.type;
    },
    closeMoveModal: (state) => {
      state.moveModalOpen = false;
      state.selectedItem = null;
      state.itemType = null;
    },
    openShareModal: (state, action) => {
      state.shareModalOpen = true;
      state.selectedItem = action.payload.item;
      state.itemType = action.payload.type;
    },
    closeShareModal: (state) => {
      state.shareModalOpen = false;
      state.selectedItem = null;
      state.itemType = null;
    },
    openDeleteModal: (state, action) => {
      state.deleteModalOpen = true;
      state.selectedItem = action.payload.item;
      state.itemType = action.payload.type;
    },
    closeDeleteModal: (state) => {
      state.deleteModalOpen = false;
      state.selectedItem = null;
      state.itemType = null;
    },
    addToast: (state, action) => {
      state.toasts.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  openUploadModal,
  closeUploadModal,
  openCreateFolderModal,
  closeCreateFolderModal,
  openRenameModal,
  closeRenameModal,
  openMoveModal,
  closeMoveModal,
  openShareModal,
  closeShareModal,
  openDeleteModal,
  closeDeleteModal,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

export default uiSlice.reducer;
