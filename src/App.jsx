import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './layouts/AppShell';
import AuthLayout from './layouts/AuthLayout';
import PrivateRoute from './routes/PrivateRoute';
import {
  authRoutes, protectedRoutes, adminRoutes, agentRoutes,
  NotFoundPage,
} from './routes/index.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          {authRoutes.map(({ path, element: El }) => (
            <Route key={path} path={path} element={<El />} />
          ))}
        </Route>

        {/* Protected app routes */}
        <Route
          element={
            <PrivateRoute>
              <AppShell />
            </PrivateRoute>
          }
        >
          {/* General protected routes */}
          {protectedRoutes.map(({ path, element: El }) => (
            <Route key={path} path={path} element={<El />} />
          ))}

          {/* Admin routes */}
          {adminRoutes.map(({ path, element: El, adminOnly }) => (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute adminOnly={adminOnly}>
                  <El />
                </PrivateRoute>
              }
            />
          ))}

          {/* Agent-gated routes */}
          {agentRoutes.map(({ path, element: El, allowedAgents }) => (
            <Route
              key={path}
              path={path}
              element={
                <PrivateRoute allowedAgents={allowedAgents}>
                  <El />
                </PrivateRoute>
              }
            />
          ))}
        </Route>

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
