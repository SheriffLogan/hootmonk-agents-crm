export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const ENDPOINTS = {
  AUTH: {
    LOGIN:   '/auth/login',
    LOGOUT:  '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    GOOGLE_CALLBACK: '/auth/google/callback',
  },
  USERS: {
    LIST:   '/users',
    DETAIL: (id) => `/users/${id}`,
    ME:     '/users/me',
  },
  AGENTS: {
    SUBSCRIPTIONS: '/agents/subscriptions',
  },
  FINANCIAL: {
    OVERVIEW:       '/financial/overview',
    TRANSACTIONS:   '/financial/transactions',
    TRANSACTION:    (id) => `/financial/transactions/${id}`,
    CATEGORIES:     '/financial/categories',
    SAVINGS_GOALS:  '/financial/savings-goals',
    SAVINGS_GOAL:   (id) => `/financial/savings-goals/${id}`,
    INVESTMENTS:    '/financial/investments',
    REPORTS:        '/financial/reports',
    GMAIL_CONNECT:     '/financial/gmail/connect',
    GMAIL_DISCONNECT:  '/financial/gmail/disconnect',
    GMAIL_SYNC:        '/financial/gmail/sync',
    GMAIL_STATUS:      '/financial/gmail/status',
    PDF_UPLOAD:     '/financial/statements/upload',
    ANALYSIS:       '/financial/analysis',
    INSIGHTS:       '/financial/insights',
  },
};
