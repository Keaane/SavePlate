import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Auth() {
  const { auth } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    location: '',
    role: 'student'
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          setError(error.message);
        } else {
          const from = location.state?.from?.pathname || 
            (data.user?.user_metadata?.role === 'vendor' ? '/vendors' : '/students');
          navigate(from, { replace: true });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              role: formData.role,
              full_name: formData.fullName
            }
          }
        });

        if (error) {
          setError(error.message);
        } else {
          if (data.user) {
            await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  role: formData.role,
                  full_name: formData.fullName,
                  phone: formData.phone,
                  location: formData.location,
                  created_at: new Date().toISOString()
                }
              ]);

            setSuccess('🎉 Account created successfully! You can now sign in.');
            setIsLogin(true);
            setFormData(prev => ({ ...prev, password: '' }));
          }
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setResetEmail('');
        setTimeout(() => setShowResetPassword(false), 3000);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async (role = 'student') => {
    setLoading(true);
    setError('');
    
    try {
      const testEmail = `test${Date.now()}@saveplate.com`;
      const testPassword = 'password123';
      const testName = role === 'vendor' ? 'Test Vendor' : 'Test Student';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            role: role,
            full_name: testName
          }
        }
      });

      if (error) {
        setError(`Test user creation failed: ${error.message}`);
      } else {
        if (data.user) {
          await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                role: role,
                full_name: testName,
                phone: '+250 78 000 0000',
                location: 'Kigali, Rwanda',
                created_at: new Date().toISOString()
              }
            ]);

          // Auto login after creation
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });

          if (!loginError) {
            const from = location.state?.from?.pathname || (role === 'vendor' ? '/vendors' : '/students');
            navigate(from, { replace: true });
          } else {
            setFormData({
              email: testEmail,
              password: testPassword,
              fullName: '',
              phone: '',
              location: '',
              role: role
            });
            setSuccess(`✅ ${testName} account created! Email: ${testEmail}`);
            setIsLogin(true);
          }
        }
      }
    } catch (error) {
      setError(`Test user error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #050505 0%, #000000 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Advanced Animated Background Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite',
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
        animation: 'float 10s ease-in-out infinite reverse',
        borderRadius: '50%'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
        filter: 'blur(50px)',
        animation: 'pulse 6s ease-in-out infinite',
        borderRadius: '50%'
      }}></div>

      {/* Grid Pattern Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        opacity: 0.5,
        pointerEvents: 'none'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'rgba(15, 15, 15, 0.85)',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.8),
          0 0 0 1px rgba(16, 185, 129, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.05)
        `,
        border: '1px solid rgba(16, 185, 129, 0.2)',
        backdropFilter: 'blur(20px) saturate(180%)',
        position: 'relative',
        zIndex: 1,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        {/* Glow Effect */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          right: '-2px',
          bottom: '-2px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(59, 130, 246, 0.3))',
          borderRadius: '24px',
          zIndex: -1,
          filter: 'blur(20px)',
          opacity: 0.6,
          animation: 'glow 3s ease-in-out infinite alternate'
        }}></div>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(59, 130, 246, 0.2))',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '2.5rem',
            width: '70px',
            height: '70px',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-50%',
              left: '-50%',
              width: '200%',
              height: '200%',
              background: 'linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              animation: 'shine 3s infinite'
            }}></div>
            🍽️
          </div>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #10b981 50%, #3b82f6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.75rem',
            letterSpacing: '-0.5px',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
          }}>
            SavePlate
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '1.05rem',
            fontWeight: '400',
            letterSpacing: '0.3px'
          }}>
            {isLogin ? 'Welcome back!' : 'Join the movement against food waste'}
          </p>
        </div>

        {/* Password Reset Form */}
        {showResetPassword && (
          <div style={{
            background: 'rgba(15, 15, 15, 0.85)',
            padding: '2rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
              Reset Password
            </h3>
            <form onSubmit={handlePasswordReset}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="input"
                  placeholder="your@email.com"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
            color: '#ff6b6b',
            padding: '1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: '500',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
            color: '#10b981',
            padding: '1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: '500',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{
              background: 'rgba(10, 10, 10, 0.6)',
              padding: '1.75rem',
              borderRadius: '16px',
              marginBottom: '1.5rem',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px'
                }}>
                  👤 Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="Enter your full name"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px'
                }}>
                  🎯 I am a *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="input"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <option value="student" style={{ background: '#0a0a0a' }}>🎓 Student</option>
                  <option value="vendor" style={{ background: '#0a0a0a' }}>🏪 Vendor</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px'
                }}>
                  📞 Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+250 78 123 4567"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.75rem', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  letterSpacing: '0.3px'
                }}>
                  📍 Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="input"
                  placeholder="Kigali, Rwanda"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#ffffff',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.75rem', 
              fontWeight: '600', 
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '0.95rem',
              letterSpacing: '0.3px'
            }}>
              📧 Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
              placeholder="your@email.com"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#ffffff',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '0.95rem',
                letterSpacing: '0.3px'
              }}>
                🔒 Password *
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(16, 185, 129, 0.8)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    padding: '0',
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="input"
              placeholder="Enter your password"
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#ffffff',
                transition: 'all 0.3s ease'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              fontWeight: '600',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)';
            }}
          >
            {loading ? '⏳ Processing...' : (isLogin ? '🚀 Sign In' : '✨ Create Account')}
          </button>
        </form>

        {/* Test User Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => createTestUser('student')}
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '14px',
              fontSize: '0.9rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🎓 Test Student
          </button>
          <button
            onClick={() => createTestUser('vendor')}
            disabled={loading}
            className="btn-secondary"
            style={{
              padding: '14px',
              fontSize: '0.9rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              color: 'rgba(255, 255, 255, 0.9)',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
              e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🏪 Test Vendor
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(16, 185, 129, 0.9)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#10b981';
              e.currentTarget.style.textShadow = '0 0 10px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(16, 185, 129, 0.9)';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-30px) translateX(20px) rotate(180deg); 
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }
        
        @keyframes glow {
          0% { 
            opacity: 0.4;
            filter: blur(20px);
          }
          100% { 
            opacity: 0.8;
            filter: blur(25px);
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
        
        .input:focus {
          border-color: rgba(16, 185, 129, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15), 0 0 20px rgba(16, 185, 129, 0.2) !important;
          background: rgba(0, 0, 0, 0.6) !important;
        }
      `}} />
    </div>
  );
}

export default Auth;