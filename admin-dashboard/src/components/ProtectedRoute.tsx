import { Navigate, Outlet } from 'react-router-dom';
import { getToken, getStoredUser } from '../lib/api';

export function ProtectedRoute() {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;

  const user = getStoredUser();
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  return <Outlet />;
}
