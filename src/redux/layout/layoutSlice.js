import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
};

const layoutSlice = createSlice({
  name: 'layout',
  initialState,
  reducers: {
    toggleSidebar:     (state) => { state.sidebarCollapsed  = !state.sidebarCollapsed; },
    toggleMobileSidebar:(state)=> { state.mobileSidebarOpen = !state.mobileSidebarOpen; },
    closeMobileSidebar:(state) => { state.mobileSidebarOpen = false; },
    setSidebarCollapsed:(state, { payload }) => { state.sidebarCollapsed = payload; },
  },
});

export const { toggleSidebar, toggleMobileSidebar, closeMobileSidebar, setSidebarCollapsed } = layoutSlice.actions;
export default layoutSlice.reducer;

export const selectSidebarCollapsed   = (s) => s.layout.sidebarCollapsed;
export const selectMobileSidebarOpen  = (s) => s.layout.mobileSidebarOpen;
