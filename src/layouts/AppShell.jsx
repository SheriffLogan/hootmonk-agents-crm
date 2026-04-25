import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { selectSidebarCollapsed, selectMobileSidebarOpen, closeMobileSidebar } from '../redux/layout/layoutSlice';
import { hydrateAuth } from '../redux/auth/authSlice';
import { getSession } from '../helpers/api/apiCore';
import clsx from 'clsx';
import PageLoader from '../components/ui/PageLoader';

// Derive page title from pathname
function usePageTitle() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  if (!segments.length) return 'Dashboard';
  const last = segments[segments.length - 1];
  return last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AppShell() {
  const dispatch        = useDispatch();
  const collapsed       = useSelector(selectSidebarCollapsed);
  const mobileOpen      = useSelector(selectMobileSidebarOpen);
  const pageTitle       = usePageTitle();
  const { pathname }    = useLocation();

  // Hydrate auth from session storage on mount
  useEffect(() => {
    const session = getSession();
    if (session) dispatch(hydrateAuth(session));
  }, [dispatch]);

  // Close mobile sidebar on route change
  useEffect(() => { dispatch(closeMobileSidebar()); }, [pathname, dispatch]);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => dispatch(closeMobileSidebar())}
          />
          <div className="absolute inset-y-0 left-0 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Topbar pageTitle={pageTitle} />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
