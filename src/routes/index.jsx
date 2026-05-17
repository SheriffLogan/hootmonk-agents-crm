import { lazy } from 'react';
import { AGENTS } from '../config/agents';

// Auth (always loaded — small bundle)
export const LoginPage    = lazy(() => import('../pages/auth/Login'));
export const RegisterPage = lazy(() => import('../pages/auth/Register'));
export const ForgotPage   = lazy(() => import('../pages/auth/ForgotPassword'));

// Core (always loaded)
export const DashboardPage = lazy(() => import('../pages/Dashboard'));
export const ProfilePage   = lazy(() => import('../pages/Profile'));
export const SettingsPage  = lazy(() => import('../pages/Settings'));
export const NotFoundPage  = lazy(() => import('../pages/NotFound'));

// Admin (loaded on demand — admin bundle)
export const AdminUsersPage         = lazy(() => import('../pages/admin/Users'));
export const AdminSubscriptionsPage = lazy(() => import('../pages/admin/Subscriptions'));

// ─── Financial Advisor module ────────────────────────────────────────────────
// All FA pages are in the same lazy chunk (configured in vite.config.js)
export const FADashboardPage    = lazy(() => import('../modules/financial-advisor/Dashboard'));
export const FASpendingPage     = lazy(() => import('../modules/financial-advisor/Spending'));
export const FASavingsPage      = lazy(() => import('../modules/financial-advisor/Savings'));
export const FAInvestmentsPage  = lazy(() => import('../modules/financial-advisor/Investments'));
export const FAReportsPage      = lazy(() => import('../modules/financial-advisor/Reports'));
export const FALedgerPage       = lazy(() => import('../modules/financial-advisor/Ledger'));

// ─── Route definitions ───────────────────────────────────────────────────────
export const authRoutes = [
  { path: '/auth/login',   element: LoginPage    },
  { path: '/auth/register',element: RegisterPage },
  { path: '/auth/forgot',  element: ForgotPage   },
];

export const protectedRoutes = [
  { path: '/dashboard',   element: DashboardPage },
  { path: '/profile',     element: ProfilePage   },
  { path: '/settings',    element: SettingsPage  },
];

export const adminRoutes = [
  { path: '/admin/users',         element: AdminUsersPage,          adminOnly: true },
  { path: '/admin/subscriptions', element: AdminSubscriptionsPage,  adminOnly: true },
];

export const agentRoutes = [
  // Financial Advisor — each route declares which agent subscription is required
  { path: '/financial-advisor/dashboard',   element: FADashboardPage,   allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
  { path: '/financial-advisor/spending',    element: FASpendingPage,    allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
  { path: '/financial-advisor/savings',     element: FASavingsPage,     allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
  { path: '/financial-advisor/investments', element: FAInvestmentsPage, allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
  { path: '/financial-advisor/reports',     element: FAReportsPage,     allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
  { path: '/financial-advisor/ledger',      element: FALedgerPage,      allowedAgents: [AGENTS.FINANCIAL_ADVISOR] },
];
