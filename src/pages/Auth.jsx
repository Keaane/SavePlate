import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

function Auth() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  
  const [step, setStep] = useState('welcome'); // 'welcome', 'signup', 'signin'
  const [role, setRole] = useState('student'); // 'student', 'vendor'
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

  // Handle OAuth callback (for Google login)
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const email = urlParams.get('email');
      
      if (error) {
        setError(decodeURIComponent(error));
        return;
      }
      
      if (email) {
        // Prefill email after Google login
        setFormData(prev => ({ ...prev, email }));
        setStep('signup');
      }
    };

    handleOAuthCallback();
    
    // Clean up URL after processing
    if (window.location.search) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Real-time email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate email first
      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate required fields
      if (!formData.fullName.trim()) {
        throw new Error('Full name is required');
      }

      if (formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role,
            full_name: formData.fullName.trim(),
            phone: formData.phone || null,
            location: formData.location || 'Kigali'
          }
        }
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('email')) {
          throw new Error('This email is already registered. Try signing in.');
        }
        if (error.message.includes('password')) {
          throw new Error('Password must be at least 6 characters');
        }
        throw error;
      }

      if (data.user) {
        setSuccess('✅ Account created! Check your email for verification.');
        
        // Auto-login after 2 seconds
        setTimeout(() => {
          navigate(role === 'vendor' ? '/vendors' : '/students');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = 
        err.message || 
        err.error_description || 
        'Signup failed. Please try again.';
      
      setError(errorMessage);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account first');
        }
        throw error;
      }

      if (data.user) {
        // Get user role from metadata
        const userRole = data.user.user_metadata?.role || 'student';
        navigate(userRole === 'vendor' ? '/vendors' : '/students');
      }
    } catch (err) {
      const errorMessage = 
        err.message || 
        err.error_description || 
        'Sign in failed. Check your credentials.';
      
      setError(errorMessage);
      console.error('Signin error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          // Critical: Use your actual domain in production
          redirectTo: window.location.origin + '/auth',
          scopes: 'email,profile'
        }
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      const errorMessage = 
        err.message || 
        'Google login failed. Please try again.';
      
      setError(errorMessage);
      setLoading(false);
      console.error('OAuth error:', err);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #0f172a 0%, #020617 70%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'rgba(15,23,42,0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '20px',
        border: '1px solid rgba(56,189,248,0.1)',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0c4a6e, #075985)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #fff, #93c5fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}>
            SavePlate Rwanda
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0', 
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem'
          }}>
            Reduce food waste, support local vendors
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem' }}>
          {/* Error Message */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34d399',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.95rem'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Welcome Step */}
          {step === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                Welcome to SavePlate
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div 
                  onClick={() => { setRole('student'); setStep('signup'); }}
                  style={{
                    background: role === 'student' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${role === 'student' ? '#3b82f6' : 'transparent'}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                  <h3 style={{ margin: '0 0 0.5rem' }}>Student</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    Buy surplus food at discounted prices
                  </p>
                </div>
                
                <div 
                  onClick={() => { setRole('vendor'); setStep('signup'); }}
                  style={{
                    background: role === 'vendor' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${role === 'vendor' ? '#10b981' : 'transparent'}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
                  <h3 style={{ margin: '0 0 0.5rem' }}>Vendor</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                    List surplus food and earn extra income
                  </p>
                </div>
              </div>

              <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1.5rem'
              }}>
                <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                  Already have an account?
                </p>
                <button
                  onClick={() => setStep('signin')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    color: '#94a3b8',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* Signup/Signin Form */}
          {(step === 'signup' || step === 'signin') && (
            <><div>
              <h2 style={{
                marginBottom: '1.5rem',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {step === 'signup' ? '📝 Create Account' : '🔐 Sign In'}
                {role === 'vendor' && step === 'signup' && (
                  <span style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem'
                  }}>
                    Vendor
                  </span>
                )}
              </h2>

              <form onSubmit={step === 'signup' ? handleSignup : handleSignin}>
                {step === 'signup' && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Jean Nkusi"
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: 'white'
                      }} />
                  </div>
                )}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (error.includes('email')) setError('');
                    } }
                    placeholder="e.g. jean@gmail.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white'
                    }} />
                  {formData.email && !validateEmail(formData.email) && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem'
                    }}>
                      ❌ Please enter a valid email
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                    minLength="6"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: 'white'
                    }} />
                  {formData.password && formData.password.length < 6 && (
                    <p style={{
                      color: '#ef4444',
                      fontSize: '0.85rem',
                      marginTop: '0.5rem'
                    }}>
                      ❌ Password must be 6+ characters
                    </p>
                  )}
                </div>

                {role === 'vendor' && step === 'signup' && (
                  <>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Phone Number (for orders)
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. 0788123456"
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white'
                        }} />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Location (for pickup)
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Kicukiro, Kimihurura"
                        required
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: 'white'
                        }} />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading || (step === 'signup' && formData.password.length < 6) || (step === 'signup' && !validateEmail(formData.email))}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {loading ? (
                    <>
                      <span>⏳</span> Processing...
                    </>
                  ) : step === 'signup' ? (
                    <>
                      <span>✅</span> Create Account
                    </>
                  ) : (
                    <>
                      <span>🔐</span> Sign In
                    </>
                  )}
                </button>
              </form>

              <div style={{
                marginTop: '1.5rem',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                paddingTop: '1.5rem'
              }}>
                <p style={{
                  textAlign: 'center',
                  marginBottom: '1rem',
                  color: 'rgba(255,255,255,0.7)'
                }}>
                  Or continue with
                </p>


                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}>
                  <button
                    onClick={() => handleOAuth('google')}
                    disabled={loading}
                    style={{
                      padding: '12px 24px',
                      background: loading ? '#6b7280' : 'white',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                  >
                    <img
                      src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                      alt="Google"
                      width="20" />
                    Continue with Google
                  </button>
                </div>

                <p style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.6)',
                  fontStyle: 'italic'
                }}>
                  🇷🇼 You can signup with Google
                </p>

                <p style={{
                  textAlign: 'center',
                  marginTop: '1.5rem',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.6)'
                }}>
                  {step === 'signup' ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setStep('signin')}
                        style={{
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Need an account?{' '}
                      <button
                        type="button"
                        onClick={() => setStep('signup')}
                        style={{
                          color: '#3b82f6',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </p>
              </div>
            </div><div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
                <p style={{ margin: 0, fontWeight: '500', color: '#34d399' }}>
                  🇷🇼 <strong>Welcome!</strong> Treat yourself <strong>or friends</strong> today!
                </p>
              </div></>)}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      ` }} />
    </div>
  );
}

export default Auth;