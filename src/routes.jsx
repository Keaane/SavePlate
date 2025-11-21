// src/routes.jsx ✅ FIXED — NO BrowserRouter here!
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Students from './pages/Students';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import VendorsList from './pages/VendorsList';

function ProtectedRoute({ children }) {
  const { profile, loading } = useApp();
  
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  
  return children;
}

export default function AppRoutes() {
  return (
    <Routes> {/* ✅ Only <Routes> — no Router here */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Home />} />
      <Route path="/vendors-list" element={<VendorsList />} />
      <Route path="/vendors/:id" element={<VendorDetail />} />
      
      <Route 
        path="/students" 
        element={
          <ProtectedRoute>
            <Students />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendors" 
        element={
          <ProtectedRoute>
            <Vendors />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}