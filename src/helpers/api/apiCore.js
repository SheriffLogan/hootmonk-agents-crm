import axios from 'axios';
import { API_BASE_URL } from '../../config/endpoints';

export const SESSION_KEY = 'hootmonk_crm_session';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach Bearer token
api.interceptors.request.use(
  (config) => {
    const session = getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 → refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const session = getSession();
        if (session?.refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: session.refreshToken,
          });
          const updated = { ...session, accessToken: data.accessToken, refreshToken: data.refreshToken };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        }
      } catch (_) { /* refresh failed – user will be logged out */ }
    }
    return Promise.reject(error);
  },
);

export default api;

// Helpers
export const getSession    = ()  => JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null');
export const getLoggedUser = ()  => getSession()?.user ?? null;
export const isAuthenticated = () => !!getSession()?.accessToken;
