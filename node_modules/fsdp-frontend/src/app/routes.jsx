import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp, roleHome } from './providers.jsx';
export function RoleGuard({ allowed }) {
  const { user, authLoading } = useApp();
  const location = useLocation();
  if (authLoading) return <p role="status">Restoring your session?</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!allowed.includes(user.role)) return <Navigate to={roleHome(user)} replace />;
  return <Outlet />;
}
