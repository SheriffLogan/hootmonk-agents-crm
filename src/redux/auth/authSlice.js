import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user:          null,   // { id, email, firstName, lastName, role, subscribedAgents }
  accessToken:   null,
  refreshToken:  null,
  isLoggedIn:    false,
  loading:       false,
  error:         null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Triggers (picked up by saga)
    loginRequest:   (state) => { state.loading = true; state.error = null; },
    logoutRequest:  (state) => { state.loading = true; },
    refreshRequest: (state) => { state.loading = true; },

    // Success
    loginSuccess: (state, { payload }) => {
      state.loading      = false;
      state.isLoggedIn   = true;
      state.user         = payload.user;
      state.accessToken  = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.error        = null;
    },
    logoutSuccess: () => ({ ...initialState }),
    refreshSuccess: (state, { payload }) => {
      state.accessToken  = payload.accessToken;
      state.refreshToken = payload.refreshToken;
    },

    // Failure
    loginFailure:  (state, { payload }) => { state.loading = false; state.error = payload; },
    logoutFailure: (state)              => { state.loading = false; },

    // Hydrate from session storage on app load
    hydrateAuth: (state, { payload }) => {
      if (payload) {
        state.user         = payload.user;
        state.accessToken  = payload.accessToken;
        state.refreshToken = payload.refreshToken;
        state.isLoggedIn   = true;
      }
    },

    clearError: (state) => { state.error = null; },
  },
});

export const {
  loginRequest, loginSuccess, loginFailure,
  logoutRequest, logoutSuccess, logoutFailure,
  refreshRequest, refreshSuccess,
  hydrateAuth, clearError,
} = authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth        = (s) => s.auth;
export const selectUser        = (s) => s.auth.user;
export const selectIsLoggedIn  = (s) => s.auth.isLoggedIn;
export const selectAccessToken = (s) => s.auth.accessToken;
export const selectAgents      = (s) => s.auth.user?.subscribedAgents ?? [];
export const selectRole        = (s) => s.auth.user?.role ?? null;
export const selectIsAdmin     = (s) => s.auth.user?.role === 'admin';
