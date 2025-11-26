import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

/**
 * Home page - Landing page for SavePlate
 * Designed to match the fun, engaging About page style
 */
export default function Home() {
  const { user, profile, loading: appLoading } = useApp();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ food: 0, vendors: 0, saved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [foodRes, vendorRes] = await Promise.all([
          supabase
            .from('food_items')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .gt('quantity', 0),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'vendor')
            .eq('is_verified', true)
        ]);

        setCounts({
          food: foodRes.count || 0,
          vendors: vendorRes.count || 0,
          saved: Math.floor((foodRes.count || 0) * 2.5) // Estimate meals saved
        });
      } catch (error) {
        console.error('Stats fetch failed:', error);
      }
    };

    fetchStats();
  }, []);

  if (appLoading) {
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
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '1rem',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            🍽️
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading SavePlate...</p>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0c1929 0%, #000000 50%)',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Floating food elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {['🍕', '🥗', '🍜', '🥐', '🍛', '🥤', '🍱', '🥪', '🍲', '🥘'].map((emoji, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: '2.5rem',
              opacity: 0.08,
              left: `${5 + (i * 10)}%`,
              top: `${10 + (i * 8) % 80}%`,
              animation: `float${i % 3} ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          fontSize: '1.6rem', 
          fontWeight: '800',
          background: 'linear-gradient(135deg, #10b981, #34d399)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent'
        }}>
          SavePlate
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => navigate('/about')}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            About
          </button>
          {user ? (
            <button
              onClick={() => navigate(profile?.role === 'vendor' ? '/vendors' : '/students')}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Get Started
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '4rem 1rem 3rem'
      }}>
        <div style={{
          fontSize: '4.5rem',
          marginBottom: '1rem',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          🍽️
        </div>
        
        <h1 style={{
          fontSize: 'clamp(2.8rem, 7vw, 4.5rem)',
          fontWeight: '900',
          marginBottom: '0.5rem',
          lineHeight: 1.1
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #fff 0%, #10b981 50%, #34d399 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            SavePlate
          </span>
        </h1>
        
        <p style={{
          fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
          color: '#6ee7b7',
          fontStyle: 'italic',
          marginBottom: '1.5rem',
          fontWeight: '500'
        }}>
          Eat like royalty. Pay like a student.
        </p>
        
        <p style={{
          fontSize: '1.15rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '550px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          {user 
            ? `Welcome back, ${profile?.full_name || 'friend'}! Ready to discover today's deals?`
            : 'Surplus food from local vendors at amazing prices. Save money, save food, save the planet.'}
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          <button 
            onClick={() => navigate(user ? (profile?.role === 'vendor' ? '/vendors' : '/students') : '/auth')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 25px rgba(16,185,129,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(16,185,129,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 25px rgba(16,185,129,0.4)';
            }}
          >
            {user ? 'Go to Dashboard' : 'Start Saving Now'}
          </button>
          
          {!user && (
            <button 
              onClick={() => navigate('/about')}
              style={{
                padding: '16px 36px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              }}
            >
              How It Works
            </button>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '2rem 1rem 3rem',
        maxWidth: '900px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {[
            { value: counts.food, label: 'Food Items Available', icon: '🍽️', color: '#10b981' },
            { value: counts.vendors, label: 'Verified Vendors', icon: '🏪', color: '#3b82f6' },
            { value: `${counts.saved}+`, label: 'Meals Saved', icon: '🌍', color: '#f59e0b' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{stat.icon}</div>
              <div style={{ 
                fontSize: '2.2rem', 
                fontWeight: '800', 
                color: stat.color,
                marginBottom: '0.25rem'
              }}>
                {stat.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works - Quick Version */}
      <section style={{
        padding: '3rem 1rem',
        background: 'rgba(16, 185, 129, 0.03)',
        borderTop: '1px solid rgba(16, 185, 129, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2rem',
            marginBottom: '2.5rem',
            fontWeight: '700'
          }}>
            Simple as 1-2-3
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              { step: '1', icon: '👀', title: 'Browse Deals', desc: 'Find surplus food from verified local vendors at 50-70% off' },
              { step: '2', icon: '📞', title: 'Contact & Order', desc: 'Call the vendor directly - no middleman, no extra fees' },
              { step: '3', icon: '😋', title: 'Enjoy & Save', desc: 'Pick up your food and enjoy. You just saved money AND the planet!' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem'
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '3rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  {item.icon}
                </div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{item.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Vendors CTA */}
      {!user && (
        <section style={{
          padding: '3rem 1rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(217,119,6,0.05))',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '24px',
            padding: '2.5rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Are You a Vendor?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Stop throwing away good food. Start earning extra income by selling your surplus to hungry students.
            </p>
            <button
              onClick={() => navigate('/auth')}
              style={{
                padding: '14px 32px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none',
                borderRadius: '25px',
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Join as Vendor
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 1
      }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          SavePlate Rwanda - Fighting food waste, one meal at a time
        </p>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float0 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-10deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
