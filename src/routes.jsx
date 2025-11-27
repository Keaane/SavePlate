import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';

import Auth from './pages/Auth';
import Home from './pages/Home';
import About from './pages/About';
import Students from './pages/Students';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';
import VendorOnboarding from './pages/VendorOnboarding';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useApp();

  const renderLoading = () => (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #0c1929 0%, #000000 50%)',
      color: 'white'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
        <p>Loading...</p>
      </div>
    </div>
  );

  if (loading) return renderLoading();
  
  if (!user) return <Navigate to="/auth" replace />;

  if (!profile) return renderLoading();

  if (role && profile.role !== role) {
    const fallback = (() => {
      if (profile.role === 'vendor') {
        return profile.verification_status === 'verified' || profile.is_verified
          ? '/vendors'
          : '/vendor-onboarding';
      }
      if (profile.role === 'admin') {
        return '/admin';
      }
      return '/students';
    })();
    return <Navigate to={fallback} replace />;
  }

  return children;
}

function VendorOnboardingRoute({ children }) {
  const { user, profile, loading } = useApp();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #0c1929 0%, #000000 50%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user || !profile) return <Navigate to="/auth" replace />;
  if (profile.role !== 'vendor') return <Navigate to="/students" replace />;
  
  // Check if vendor is verified
  const isVerified = profile.verification_status === 'verified' || profile.is_verified === true;
  
  // If vendor is already verified, redirect to dashboard
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
      <Route path="/about" element={<About />} />
      
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
        element={
          <ProtectedRoute role="admin">
            <Admin />
          </ProtectedRoute>
        } 
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