import { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn } from '../redux/auth/authSlice';
import { isAuthenticated } from '../helpers/api/apiCore';
import PageLoader from '../components/ui/PageLoader';

export default function AuthLayout() {
  const isLoggedIn = useSelector(selectIsLoggedIn) || isAuthenticated();
  if (isLoggedIn) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-900 via-primary-950 to-surface-900 p-4">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-card-lg mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2"/>
              <path d="M2 7l10 5 10-5" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hootmonk CRM</h1>
          <p className="text-sm text-slate-400 mt-1">Your intelligent agent platform</p>
        </div>

        {/* Auth form card */}
        <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200 p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
