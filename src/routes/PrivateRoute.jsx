import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsLoggedIn, selectAgents, selectIsAdmin } from '../redux/auth/authSlice';
import { isAuthenticated } from '../helpers/api/apiCore';

/**
 * PrivateRoute
 * @param {string[]} allowedAgents  - agent keys required to access this route (empty = all authenticated)
 * @param {boolean}  adminOnly      - only admins can access
 */
export default function PrivateRoute({ children, allowedAgents = [], adminOnly = false }) {
  const location    = useLocation();
  const isLoggedIn  = useSelector(selectIsLoggedIn) || isAuthenticated();
  const agents      = useSelector(selectAgents);
  const isAdmin     = useSelector(selectIsAdmin);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedAgents.length > 0 && !isAdmin) {
    const hasAccess = allowedAgents.some((a) => agents.includes(a));
    if (!hasAccess) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
