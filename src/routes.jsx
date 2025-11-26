import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import Auth from './pages/Auth';
import Home from './pages/Home';
import Students from './pages/Students';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import VendorOnboarding from './pages/VendorOnboarding';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function ProtectedRoute({ children, role }) {
  const { profile, loading } = useApp();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (role && profile.role !== role) return <Navigate to="/" replace />;

  return children;
}

function VendorOnboardingRoute({ children }) {
  const { profile, loading } = useApp();

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!profile) return <Navigate to="/auth" replace />;
  if (profile.role !== 'vendor') return <Navigate to="/" replace />;
  
  // Check if vendor is verified (multiple ways to check)
  const isVerified = profile.verification_status === 'verified' || 
                    profile.is_verified === true ||
                    (profile.verification_status !== 'pending' && 
                     profile.verification_status !== 'rejected' && 
                     profile.verification_status !== 'suspended' &&
                     profile.verification_status != null &&
                     profile.verification_status !== undefined &&
                     profile.verification_status !== '');
  
  // If vendor is already verified, redirect to dashboard immediately
  if (isVerified) {
    return <Navigate to="/vendors" replace />;
  }

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
      
      <Route 
        path="/vendors/:id" 
        element={<VendorDetail />} 
      />
      
      <Route 
        path="/vendor-onboarding" 
        element={
          <VendorOnboardingRoute>
            <VendorOnboarding />
          </VendorOnboardingRoute>
        } 
      />
      
      <Route 
        path="/admin" 
        element={<Admin />} 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}