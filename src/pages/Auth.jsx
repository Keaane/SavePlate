import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

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
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!validateEmail(formData.email)) throw new Error('Invalid email');
      if (!formData.fullName.trim()) throw new Error('Full name required');
      if (formData.password.length < 6) throw new Error('Password ≥ 6 chars');

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

      // Update or create profile (trigger may have already created it)
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
        // Continue anyway - the trigger may have created the profile
      }

      setSuccess('✅ Account created!');
      // Redirect vendors to onboarding, students to dashboard
      setTimeout(() => {
        if (role === 'vendor') {
          navigate('/vendor-onboarding');
        } else {
          navigate('/students');
        }
      }, 2000);
    } catch (err) {
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
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin + '/auth' }
      });
      if (error) throw error;
    } catch (err) {
      setError('Google login failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'rgba(15,23,42,0.7)', borderRadius: '20px', maxWidth: '500px', width: '100%', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0c4a6e, #075985)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, #fff, #93c5fd)', backgroundClip: 'text', color: 'transparent' }}>SavePlate Rwanda</h1>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.8)' }}>Reduce food waste, support local vendors</p>
        </div>

        <div style={{ padding: '2rem' }}>
          {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>❌ {error}</div>}
          {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>✅ {success}</div>}

          {step === 'welcome' && (
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Welcome to SavePlate</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div onClick={() => { setRole('student'); setStep('signup'); }} style={{ background: role === 'student' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)', border: `2px solid ${role === 'student' ? '#3b82f6' : 'transparent'}`, borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎓</div>
                  <h3>Student</h3>
                  <p>Buy surplus food</p>
                </div>
                <div onClick={() => { setRole('vendor'); setStep('signup'); }} style={{ background: role === 'vendor' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: `2px solid ${role === 'vendor' ? '#10b981' : 'transparent'}`, borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏪</div>
                  <h3>Vendor</h3>
                  <p>List surplus food</p>
                </div>
              </div>
              <button onClick={() => setStep('signin')} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px' }}>Sign In</button>
            </div>
          )}

          {(step === 'signup' || step === 'signin') && (
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>{step === 'signup' ? '📝 Create Account' : '🔐 Sign In'}</h2>
              <form onSubmit={step === 'signup' ? handleSignup : handleSignin}>
                {step === 'signup' && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Full Name" required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                  </div>
                )}
                <div style={{ marginBottom: '1.25rem' }}>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Password" required minLength="6" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                </div>

                {role === 'vendor' && step === 'signup' && (
                  <>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Phone (e.g. 0788123456)" style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Location (e.g. Kigali, Gasabo)" required style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} />
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', background: loading ? '#6b7280' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600' }}>
                  {loading ? '⏳ Processing...' : step === 'signup' ? '✅ Sign Up' : '🔐 Sign In'}
                </button>
              </form>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center' }}>
                <p>Or continue with</p>
                <button onClick={() => handleOAuth('google')} disabled={loading} style={{ padding: '12px 24px', background: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" /> Google
                </button>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '1rem' }}>🇷🇼 Works with Gmail, YouTube, or Android accounts</p>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#34d399' }}>🌟 New users get Frw 200 bonus on first order!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;