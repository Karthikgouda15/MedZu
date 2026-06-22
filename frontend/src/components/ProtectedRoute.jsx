import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading, getDashboardRoute } = useAuth();

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDashboardRoute(user.role)} replace />;
  }

  return children;
}
