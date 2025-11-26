import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

/**
 * Authentication page for SavePlate
 * Handles sign up and sign in for students and vendors
 */
function Auth() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('welcome');
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    location: 'Kigali'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setFormData(prev => ({ ...prev, email }));
      setStep('signup');
    }
    
    // Handle OAuth callback - check for error or access_token in hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDescription = hashParams.get('error_description');
    if (errorDescription) {
      setError('Login failed: ' + errorDescription);
    }
    
    // Check for successful OAuth - session will be handled by AppContext
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      setLoading(true);
      setSuccess('Logging you in...');
      // The AppContext will handle the redirect once it detects the session
    }
    
    if (window.location.search || window.location.hash) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Check for existing session on mount (for OAuth callback)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // User is logged in, redirect based on role
        const userRole = session.user.user_metadata?.role || 'student';
        navigate(userRole === 'vendor' ? '/vendors' : '/students', { replace: true });
      }
    };
    
    // Only check if we're showing the "logging you in" message
    if (success === 'Logging you in...') {
      const timer = setTimeout(checkSession, 1000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!validateEmail(formData.email)) throw new Error('Invalid email');
      if (!formData.fullName.trim()) throw new Error('Full name required');
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role,
            full_name: formData.fullName.trim()
          }
        }
      });

      if (error) throw error;
      
      if (!data?.user) {
        throw new Error('Signup failed - please try again');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          role,
          full_name: formData.fullName.trim(),
          phone: formData.phone || null,
          location: formData.location || 'Kigali',
          verification_status: 'pending'
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile error:', profileError);
      }

      setSuccess('Account created! Redirecting...');
      setTimeout(() => {
        navigate(role === 'vendor' ? '/vendor-onboarding' : '/students');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const userRole = data.user.user_metadata?.role || 'student';
      navigate(userRole === 'vendor' ? '/vendors' : '/students');
    } catch (err) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    setError('');
    try {
      const redirectUrl = window.location.origin + '/auth';
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { 
          redirectTo: redirectUrl
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('OAuth error:', err);
      setError('Google login failed. Please try email/password instead.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at top, #0c1929 0%, #000000 50%)',
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem 1rem',
      position: 'relative',
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
        {['🍕', '🥗', '🍜', '🥐', '🍛', '🥤'].map((emoji, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              fontSize: '2rem',
              opacity: 0.06,
              left: `${10 + (i * 15)}%`,
              top: `${15 + (i * 12) % 70}%`,
              animation: `float${i % 3} ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Back to Home */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          padding: '10px 20px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '25px',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          zIndex: 10
        }}
      >
        Back to Home
      </button>

      <div style={{ 
        background: 'rgba(15,23,42,0.8)', 
        backdropFilter: 'blur(20px)',
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: '480px', 
        width: '100%', 
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{ 
            fontSize: '3.5rem', 
            marginBottom: '0.75rem',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
          }}>
            🍽️
          </div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.2rem', 
            fontWeight: '800', 
            color: 'white'
          }}>
            SavePlate
          </h1>
          <p style={{ 
            margin: '0.75rem 0 0', 
            color: 'rgba(255,255,255,0.7)', 
            fontStyle: 'italic', 
            fontSize: '1.05rem' 
          }}>
            Eat like royalty. Pay like a student.
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {error && (
            <div style={{ 
              background: 'rgba(239,68,68,0.1)', 
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ 
              background: 'rgba(16,185,129,0.1)', 
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#6ee7b7', 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              {success}
            </div>
          )}

          {step === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '0.5rem', fontSize: '1.4rem', fontWeight: '700' }}>
                Join SavePlate
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                Create your free account in 30 seconds
              </p>
              
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                marginBottom: '1rem',
                fontSize: '0.95rem',
                fontWeight: '600'
              }}>
                I want to...
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                  onClick={() => { setRole('student'); setStep('signup'); }} 
                  style={{ 
                    background: 'rgba(59,130,246,0.1)', 
                    border: '2px solid rgba(59,130,246,0.3)', 
                    borderRadius: '16px', 
                    padding: '1.5rem 1rem', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
                  <h3 style={{ margin: '0 0 0.25rem', color: '#60a5fa', fontSize: '1.1rem' }}>Buy Food</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    Find amazing deals
                  </p>
                </button>
                <button 
                  onClick={() => { setRole('vendor'); setStep('signup'); }} 
                  style={{ 
                    background: 'rgba(16,185,129,0.1)', 
                    border: '2px solid rgba(16,185,129,0.3)', 
                    borderRadius: '16px', 
                    padding: '1.5rem 1rem', 
                    cursor: 'pointer', 
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    color: 'white'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.2)';
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏪</div>
                  <h3 style={{ margin: '0 0 0.25rem', color: '#34d399', fontSize: '1.1rem' }}>Sell Food</h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    Reduce waste, earn more
                  </p>
                </button>
              </div>
              
              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.1)', 
                paddingTop: '1.5rem'
              }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  Already have an account?
                </p>
                <button 
                  onClick={() => setStep('signin')} 
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }}
                >
                  Sign In Instead
                </button>
              </div>
            </div>
          )}

          {(step === 'signup' || step === 'signin') && (
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <button
                  onClick={() => setStep('welcome')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Back
                </button>
                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                  {step === 'signup' ? (
                    <>Sign Up as <span style={{ color: role === 'vendor' ? '#34d399' : '#60a5fa' }}>{role === 'vendor' ? 'Vendor' : 'Student'}</span></>
                  ) : (
                    'Welcome Back'
                  )}
                </h2>
              </div>
              
              <form onSubmit={step === 'signup' ? handleSignup : handleSignin}>
                {step === 'signup' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.fullName} 
                      onChange={e => setFormData({...formData, fullName: e.target.value})} 
                      placeholder="Your name" 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '14px', 
                        background: 'rgba(0,0,0,0.3)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px', 
                        color: 'white',
                        fontSize: '1rem'
                      }} 
                    />
                  </div>
                )}
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    placeholder="you@email.com" 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      background: 'rgba(0,0,0,0.3)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px', 
                      color: 'white',
                      fontSize: '1rem'
                    }} 
                  />
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    Password
                  </label>
                  <input 
                    type="password" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                    placeholder="Min. 6 characters" 
                    required 
                    minLength="6" 
                    style={{ 
                      width: '100%', 
                      padding: '14px', 
                      background: 'rgba(0,0,0,0.3)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '12px', 
                      color: 'white',
                      fontSize: '1rem'
                    }} 
                  />
                </div>

                {role === 'vendor' && step === 'signup' && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        Phone (Optional)
                      </label>
                      <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        placeholder="0788123456" 
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          background: 'rgba(0,0,0,0.3)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', 
                          color: 'white',
                          fontSize: '1rem'
                        }} 
                      />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                        Location
                      </label>
                      <input 
                        type="text" 
                        value={formData.location} 
                        onChange={e => setFormData({...formData, location: e.target.value})} 
                        placeholder="Kigali, Gasabo" 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          background: 'rgba(0,0,0,0.3)', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px', 
                          color: 'white',
                          fontSize: '1rem'
                        }} 
                      />
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    background: loading 
                      ? 'rgba(107,114,128,0.5)' 
                      : 'linear-gradient(135deg, #10b981, #059669)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontWeight: '700',
                    fontSize: '1.05rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(16,185,129,0.3)'
                  }}
                >
                  {loading ? 'Please wait...' : step === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Or continue with
                </p>
                <button 
                  onClick={() => handleOAuth('google')} 
                  disabled={loading} 
                  style={{ 
                    padding: '12px 28px', 
                    background: 'white', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem', 
                    margin: '0 auto',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '0.95rem'
                  }}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" /> 
                  Google
                </button>
              </div>
              
              <p style={{ 
                textAlign: 'center', 
                marginTop: '1.5rem', 
                fontSize: '0.9rem', 
                color: 'rgba(255,255,255,0.5)' 
              }}>
                {step === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  onClick={() => setStep(step === 'signup' ? 'signin' : 'signup')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#34d399',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  {step === 'signup' ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          )}

          {/* Footer info */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(16,185,129,0.05)', 
            borderRadius: '12px', 
            textAlign: 'center',
            border: '1px solid rgba(16,185,129,0.1)'
          }}>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
              Join thousands saving money on quality food
            </p>
          </div>
        </div>
      </div>

      <style>{`
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

export default Auth;
