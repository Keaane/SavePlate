function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      color: 'var(--text-secondary)',
      padding: '3rem 0 2rem',
      marginTop: 'auto',
      borderTop: '1px solid var(--border-color)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Brand Section */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '1rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))',
                padding: '6px',
                borderRadius: '8px',
                fontSize: '1.2rem'
              }}>
                🍽️
              </div>
              <h3 style={{ 
                fontSize: '1.3rem',
                background: 'linear-gradient(135deg, var(--text-primary), var(--accent-green))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                SavePlate
              </h3>
            </div>
            <p style={{ 
              color: 'var(--text-muted)', 
              lineHeight: '1.6',
              marginBottom: '1rem'
            }}>
              Reducing food waste, feeding communities across Africa. 
              Join us in creating a sustainable future.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-card)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                🌍 Made for Africa
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                🏠 Home
              </a>
              <a href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                ℹ️ About
              </a>
              <a href="/vendors-list" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                🏪 Vendors
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              fontSize: '1.1rem'
            }}>
              Contact
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: 'var(--text-muted)' }}>
                📧 hello@saveplate.com
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                📱 +250 78 123 4567
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                📍 Kigali, Rwanda
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              &copy; 2024 SavePlate. All rights reserved.
            </p>
          </div>
          <div>
            <p style={{ 
              color: 'var(--text-muted)', 
              margin: 0,
              fontSize: '0.9rem'
            }}>
              Built with ❤️ for African communities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;