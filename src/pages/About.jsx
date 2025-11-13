import { useNavigate } from 'react-router-dom';

function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        padding: '4rem 0',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <h1 style={{
            fontSize: '3rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, var(--text-primary), var(--accent-green))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            About SavePlate
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Fighting food waste, feeding communities, building a sustainable future for Africa
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/auth')}
            style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
          >
            Join the Movement 🚀
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: '2.5rem',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}>
                Our Mission 🌍
              </h2>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                marginBottom: '1.5rem',
                fontSize: '1.1rem'
              }}>
                SavePlate is on a mission to harness technology for positive impact, promoting human 
                well-being and sustainable practices while minimizing negative consequences.
              </p>
              <p style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                fontSize: '1.1rem'
              }}>
                Through SavePlate, we put this mission into action by creating a solution that 
                reduces food waste and increases access to affordable meals for students and 
                low-income communities in Africa.
              </p>
            </div>
            <div style={{
              background: 'var(--bg-card)',
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                The Problem
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                According to UNEP (2021), nearly <strong>37% of food in Sub-Saharan Africa is lost or wasted</strong>, 
                while millions still go hungry every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ 
        padding: '4rem 0',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem',
            color: 'var(--text-primary)'
          }}>
            How SavePlate Works 🔄
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🏪',
                title: 'Vendors List Surplus',
                description: 'Restaurants, cafes, and supermarkets list their surplus food at discounted prices'
              },
              {
                icon: '🎓',
                title: 'Students Browse & Order',
                description: 'Students browse available food, add to cart, and place orders'
              },
              {
                icon: '📱',
                title: 'Mobile Money Payments',
                description: 'Secure payments via mobile money platforms popular in Africa'
              },
              {
                icon: '🛵',
                title: 'Pickup & Enjoy',
                description: 'Students pick up their orders and enjoy affordable, quality meals'
              }
            ].map((step, index) => (
              <div key={index} style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            marginBottom: '3rem',
            color: 'var(--text-primary)'
          }}>
            Our Impact 📊
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { number: '37%', label: 'Food Waste in Africa', description: 'Reducing this massive waste' },
              { number: '0', label: 'Food Items Saved', description: 'And counting...' },
              { number: '0', label: 'Meals Provided', description: 'To students & communities' },
              { number: '0', label: 'Vendors Partnered', description: 'Joining the movement' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  {stat.label}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4rem 0',
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div className="container">
          <h2 style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}>
            Ready to Make a Difference?
          </h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.2rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Join SavePlate today and be part of the solution to food waste in Africa.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/auth')}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              Sign Up Now 🚀
            </button>
            <button 
              className="btn-secondary"
              onClick={() => navigate('/vendors-list')}
              style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}
            >
              Browse Vendors 🏪
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;