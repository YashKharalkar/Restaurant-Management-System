import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();
  const location = useLocation();

  // 1. Not logged in -> Redirect to login page and remember previous route
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Admin-only route requested by a non-admin -> Access Denied / Redirect to home
  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
