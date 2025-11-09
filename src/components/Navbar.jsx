import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, auth, cart } = useApp();

  const cartItemCount = cart.reduce((total, item) => total + (item.cartQuantity || 0), 0);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
      <nav style={{
        background: 'var(--bg-secondary)',
        padding: '1rem 0',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            {/* Logo */}
            <Link to="/auth" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                padding: '8px',
                borderRadius: '10px',
                fontSize: '1.5rem'
              }}>
                🍽️
              </div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-green))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                SavePlate
              </h1>
            </Link>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link 
                to="/auth"
                className="btn btn-primary"
                style={{
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      padding: '1rem 0',
      boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      borderBottom: '1px solid var(--border-color)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
              padding: '8px',
              borderRadius: '10px',
              fontSize: '1.5rem'
            }}>
              🍽️
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, var(--text-primary), var(--accent-green))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              SavePlate
            </h1>
          </Link>

          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {/* Navigation Links */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <Link 
                to="/" 
                style={{
                  color: location.pathname === '/' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/' ? '600' : '400',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: location.pathname === '/' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                🏠 Home
              </Link>
              
              {/* Show based on role */}
              {profile?.role === 'student' && (
                <>
                  <Link 
                    to="/vendors-list" 
                    style={{
                      color: location.pathname === '/vendors-list' ? 'var(--accent-green)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/vendors-list' ? '600' : '400',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: location.pathname === '/vendors-list' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🏪 Vendors
                  </Link>
                  <Link 
                    to="/students" 
                    style={{
                      color: location.pathname === '/students' ? 'var(--accent-green)' : 'var(--text-secondary)',
                      textDecoration: 'none',
                      fontWeight: location.pathname === '/students' ? '600' : '400',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: location.pathname === '/students' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    📊 Dashboard
                  </Link>
                </>
              )}
              
              {profile?.role === 'vendor' && (
                <Link 
                  to="/vendors" 
                  style={{
                    color: location.pathname === '/vendors' ? 'var(--accent-green)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: location.pathname === '/vendors' ? '600' : '400',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: location.pathname === '/vendors' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🛠️ Vendor Dashboard
                </Link>
              )}
              
              <Link 
                to="/about" 
                style={{
                  color: location.pathname === '/about' ? 'var(--accent-green)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  fontWeight: location.pathname === '/about' ? '600' : '400',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: location.pathname === '/about' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                  transition: 'all 0.3s ease'
                }}
              >
                ℹ️ About
              </Link>
            </div>

            {/* Cart Icon - Show only for students */}
            {profile?.role === 'student' && cartItemCount > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-red))',
                padding: '8px 12px',
                borderRadius: '20px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                animation: 'pulse 2s infinite'
              }}>
                🛒 {cartItemCount}
              </div>
            )}

            {/* User Info and Sign Out */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'var(--bg-card)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: '500' }}>
                  {profile?.full_name || user.email}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  {profile?.role === 'student' ? '🎓 Student' : 
                   profile?.role === 'vendor' ? '🏪 Vendor' : '👤 User'}
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                type="button"
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  zIndex: 1000,
                  position: 'relative',
                  pointerEvents: 'auto'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}} />
    </nav>
  );
}

export default Navbar;