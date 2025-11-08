import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

const ProtectedRoute: React.FC = () => {
  const { token, loading } = useAuth();

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default ProtectedRoute;