import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function Home() {
  const { user, profile, loading: appLoading } = useApp();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ food: 0, vendors: 0, cart: 0 });

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
          cart: 0
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
        background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading SavePlate...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #050505 0%, #000000 50%, #000000 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <section style={{
        position: 'relative',
        padding: '6rem 0 4rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          maxWidth: '800px', 
          margin: '0 auto' 
        }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #fff, #10b981)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: '800'
          }}>
            SavePlate Rwanda
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            maxWidth: '600px', 
            margin: '0 auto 2rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            {user 
              ? `Welcome back, ${profile?.full_name || 'friend'}!`
              : 'Reducing food waste, feeding communities across Rwanda.'}
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(16,185,129,0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🍽️</div>
              <strong style={{ fontSize: '1.5rem', color: '#10b981' }}>{counts.food}</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Food Items</div>
            </div>
            <div style={{ 
              background: 'rgba(255,255,255,0.05)',
              padding: '1.5rem',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(59,130,246,0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏪</div>
              <strong style={{ fontSize: '1.5rem', color: '#3b82f6' }}>{counts.vendors}</strong>
              <div style={{ color: 'rgba(255,255,255,0.6)' }}>Vendors</div>
            </div>
          </div>

          <div style={{ 
            marginTop: '3rem', 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button 
              onClick={() => navigate(user ? (profile?.role === 'vendor' ? '/vendors' : '/students') : '/auth')}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
              }}
            >
              {user ? 'Go to Dashboard 📊' : 'Get Started 🚀'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}