import { useNavigate } from 'react-router-dom';

/**
 * About page explaining SavePlate's mission and purpose
 * Designed to be fun, engaging, and informative
 */
export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #0c1929 0%, #000000 50%)',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Floating food elements for fun */}
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
        {['🍕', '🥗', '🍜', '🥐', '🍛', '🥤', '🍱', '🥪'].map((emoji, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: '2rem',
              opacity: 0.1,
              left: `${10 + (i * 12)}%`,
              top: `${15 + (i * 10) % 70}%`,
              animation: `float${i % 3} ${3 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
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
        <div 
          onClick={() => navigate('/')}
          style={{ 
            fontSize: '1.5rem', 
            fontWeight: '800',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #10b981, #34d399)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          SavePlate
        </div>
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
      </nav>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '4rem 1rem 3rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          animation: 'bounce 2s ease-in-out infinite'
        }}>
          🍽️
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '900',
          marginBottom: '1rem',
          lineHeight: 1.1
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #fff 0%, #10b981 50%, #34d399 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Good Food.
          </span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            Good Price.
          </span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>
            Good Karma.
          </span>
        </h1>
        <p style={{
          fontSize: '1.3rem',
          color: 'rgba(255,255,255,0.7)',
          maxWidth: '600px',
          margin: '0 auto 2rem',
          lineHeight: 1.6
        }}>
          Where surplus food meets hungry students.
          <br />
          <em style={{ color: '#10b981' }}>Eat like royalty, pay like a student.</em>
        </p>
      </section>

      {/* The Problem We Solve */}
      <section style={{
        padding: '3rem 1rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '24px',
          padding: '2.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '6rem',
            opacity: 0.1
          }}>😱</div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            color: '#fca5a5'
          }}>
            The Problem
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>🗑️</span>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>Food Goes to Waste</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Restaurants throw away perfectly good food every day. It hurts the planet and their pockets.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>💸</span>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>Students Are Broke</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Let's be real - that budget is tight. Choosing between lunch and lecture notes shouldn't be a thing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The Solution */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '24px',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            fontSize: '6rem',
            opacity: 0.1
          }}>🎉</div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            color: '#34d399'
          }}>
            The SavePlate Solution
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>🤝</span>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>We Connect You</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Vendors list their surplus food. Students grab it at amazing prices. Everyone wins!
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '2rem' }}>🌍</span>
              <div>
                <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>Save the Planet</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  Every meal saved is less waste in landfills. You're literally saving the world, one bite at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '3rem 1rem 4rem',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          marginBottom: '2.5rem'
        }}>
          How It Works
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { step: '1', icon: '👀', title: 'Browse', desc: 'Check out what local vendors have available today' },
            { step: '2', icon: '📞', title: 'Contact', desc: 'Call the vendor directly to place your order' },
            { step: '3', icon: '🏃', title: 'Pickup', desc: 'Grab your food and enjoy those savings!' },
            { step: '4', icon: '⭐', title: 'Review', desc: 'Leave a review to help other students' }
          ].map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
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
                background: '#10b981',
                color: 'white',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700'
              }}>
                {item.step}
              </div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                {item.icon}
              </div>
              <h3 style={{ margin: '0 0 0.5rem' }}>{item.title}</h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Fun Facts */}
      <section style={{
        background: 'rgba(16, 185, 129, 0.05)',
        padding: '3rem 1rem',
        borderTop: '1px solid rgba(16, 185, 129, 0.1)',
        borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '1.8rem',
            marginBottom: '2rem',
            color: '#10b981'
          }}>
            Why Students Love Us
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            {[
              { stat: '50-70%', label: 'Off Regular Prices', icon: '💰' },
              { stat: 'Fresh', label: 'Quality Food', icon: '✨' },
              { stat: 'Local', label: 'Verified Vendors', icon: '🏪' },
              { stat: 'Zero', label: 'Hidden Fees', icon: '🎯' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>
                  {item.stat}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section style={{
        padding: '3rem 1rem',
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
          Are You a Vendor?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '2rem',
          fontSize: '1.1rem',
          lineHeight: 1.6
        }}>
          Stop throwing away good food and start earning extra income!
          Join SavePlate and connect with hungry students in your area.
          It's free to join and you're in full control.
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
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
        >
          Join as Vendor
        </button>
      </section>

      {/* CTA */}
      <section style={{
        padding: '4rem 1rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, transparent 0%, rgba(16, 185, 129, 0.1) 100%)'
      }}>
        <h2 style={{
          fontSize: '2.2rem',
          marginBottom: '1rem'
        }}>
          Ready to Eat Smart?
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '2rem',
          fontSize: '1.1rem'
        }}>
          Join the movement. Save food. Save money. Save the planet.
        </p>
        <button
          onClick={() => navigate('/auth')}
          style={{
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 4px 30px rgba(16, 185, 129, 0.3)'
          }}
        >
          Get Started - It's Free
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
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
