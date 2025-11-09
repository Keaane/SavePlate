import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

function Home() {
  const { user, profile, foodItems = [], vendors = [], cart = [] } = useApp();

  const availableFood = foodItems.filter(item => {
    if (!item.expiry_date) return item.quantity > 0;
    const isExpired = new Date(item.expiry_date) <= new Date();
    return item.quantity > 0 && !isExpired;
  });

  const cartItemCount = cart.reduce((total, item) => total + (item.cartQuantity || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top, #050505 0%, #000000 50%, #000000 100%)' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 4rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 12s ease-in-out infinite reverse',
          borderRadius: '50%'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            animation: 'pulse 3s ease-in-out infinite'
          }}>
            🍽️
          </div>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 50%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: '800',
            letterSpacing: '-1px'
          }}>
            SavePlate
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            maxWidth: '700px', 
            margin: '0 auto 3rem',
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: '300',
            lineHeight: '1.6'
          }}>
            {user ? `Welcome back, ${profile?.full_name || user.email?.split('@')[0] || 'User'}!` : 'Fighting food waste, one plate at a time.'}
          </p>
          
          {user && (
            <div style={{ 
              marginTop: '3rem', 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              <div style={{ 
                background: 'rgba(15, 15, 15, 0.7)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🍕</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '0.25rem' }}>
                  {availableFood.length}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Food Items</div>
              </div>
              <div style={{ 
                background: 'rgba(15, 15, 15, 0.7)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏪</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6', marginBottom: '0.25rem' }}>
                  {vendors.length}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Vendors</div>
              </div>
              <div style={{ 
                background: 'rgba(15, 15, 15, 0.7)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.25rem' }}>
                  {cartItemCount}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>Cart Items</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section style={{ padding: '4rem 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          {user ? (
            <div>
              <div style={{ 
                background: 'rgba(15, 15, 15, 0.7)', 
                padding: '3rem', 
                borderRadius: '24px', 
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)',
                textAlign: 'center',
                maxWidth: '700px',
                margin: '0 auto',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(20px)'
              }}>
                <div style={{ 
                  fontSize: '1.1rem', 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  marginBottom: '2rem',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontSize: '0.85rem'
                }}>
                  Logged in as <span style={{ color: '#10b981', fontWeight: '600' }}>{profile?.role || 'user'}</span>
                </div>
                
                {profile?.role === 'student' && (
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link 
                      to="/students" 
                      style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      📊 Student Dashboard
                    </Link>
                    <Link 
                      to="/vendors-list" 
                      style={{
                        padding: '14px 28px',
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 30px rgba(59, 130, 246, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
                      }}
                    >
                      🏪 Browse Vendors
                    </Link>
                  </div>
                )}
                
                {profile?.role === 'vendor' && (
                  <Link 
                    to="/vendors" 
                    style={{
                      padding: '14px 28px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                      display: 'inline-block',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    🛠️ Vendor Dashboard
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                background: 'rgba(15, 15, 15, 0.7)',
                padding: '3rem',
                borderRadius: '24px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <h2 style={{ 
                  color: 'rgba(255, 255, 255, 0.95)', 
                  marginBottom: '1rem',
                  fontSize: '2rem',
                  fontWeight: '700'
                }}>
                  Get Started with SavePlate
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  marginBottom: '2rem',
                  fontSize: '1.1rem'
                }}>
                  Sign in to start reducing food waste and helping your community.
                </p>
                <Link 
                  to="/auth" 
                  style={{
                    padding: '14px 32px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  Sign In / Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
      `}} />
    </div>
  );
}

export default Home;