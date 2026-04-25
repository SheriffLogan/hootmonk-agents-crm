import api from './apiCore';
import { ENDPOINTS } from '../../config/endpoints';

export const login   = (params) => api.post(ENDPOINTS.AUTH.LOGIN,   params).then((r) => r.data);
export const logout  = ()       => api.post(ENDPOINTS.AUTH.LOGOUT).then((r) => r.data);
export const refresh = (params) => api.post(ENDPOINTS.AUTH.REFRESH,  params).then((r) => r.data);
export const profile = ()       => api.get(ENDPOINTS.AUTH.PROFILE).then((r) => r.data);
