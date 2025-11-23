// src/routes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import Auth from './pages/Auth';
import Home from './pages/Home';
import Students from './pages/Students';
import Vendors from './pages/Vendors';

function ProtectedRoute({ children, role }) {
  const { profile, loading } = useApp();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (role && profile.role !== role) return <Navigate to="/" replace />;

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Home />} />
      
      <Route 
        path="/students" 
        element={
          <ProtectedRoute role="student">
            <Students />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/vendors" 
        element={
          <ProtectedRoute role="vendor">
            <Vendors />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}