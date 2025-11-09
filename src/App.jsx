import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Vendors from './pages/Vendors';
import Students from './pages/Students';
import VendorsList from './pages/VendorsList';
import Admin from './pages/Admin';
import About from './pages/About';

// Component to handle authentication redirects
function AppRoutes() {
  const { user, profile, loading } = useApp();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'radial-gradient(ellipse at top, #050505 0%, #000000 50%, #000000 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '20%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float 8s ease-in-out infinite',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          right: '20%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float 10s ease-in-out infinite reverse',
          borderRadius: '50%'
        }}></div>
        
        <div style={{
          textAlign: 'center',
          zIndex: 1,
          position: 'relative'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🍽️
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 50%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem'
          }}>
            SavePlate
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '1rem',
            marginTop: '1rem'
          }}>
            Loading...
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) translateX(0px); 
            }
            50% { 
              transform: translateY(-30px) translateX(20px); 
            }
          }
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 1;
            }
            50% { 
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}} />
      </div>
    );
  }

  // If no user, redirect to auth page
  if (!user) {
    return (
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // If user exists, show the main app
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/vendors-list" element={<VendorsList />} />
          
          {/* Protected Routes */}
          <Route 
            path="/vendors" 
            element={
              profile?.role === 'vendor' || profile?.role === 'admin' ? 
                <Vendors /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/students" 
            element={
              profile?.role === 'student' ? 
                <Students /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              profile?.role === 'admin' ? 
                <Admin /> : 
                <Navigate to="/" replace />
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <AppRoutes />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;