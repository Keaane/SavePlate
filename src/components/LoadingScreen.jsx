export default function LoadingScreen({ message = "Connecting to Kigali’s food network..." }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
      color: 'white'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1.2rem',
        animation: 'pulse 2s ease-in-out infinite'
      }}>🍽️</div>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.5rem' }}>
        SavePlate Rwanda
      </h2>
      <p style={{ 
        color: 'rgba(255,255,255,0.7)', 
        fontSize: '1.1rem',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        {message}
      </p>
      <div style={{
        marginTop: '2rem',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: '4px solid rgba(16,185,129,0.2)',
        borderTop: '4px solid #10b981',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes pulse { 50% { transform: scale(1.05); opacity: 0.8; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}