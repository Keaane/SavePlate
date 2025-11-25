import { useApp } from '../context/AppContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const { state } = useApp();
  
  if (!allowedRoles.includes(state.userRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;