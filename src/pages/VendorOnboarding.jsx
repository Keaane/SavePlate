import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function VendorOnboarding() {
  const { profile } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: ID, 2: Business, 3: Contact
  const [formData, setFormData] = useState({
    id_card: null,
    business_name: '',
    business_type: 'restaurant',
    location: 'Kigali',
    phone: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);

  // Redirect verified vendors to dashboard
  useEffect(() => {
    if (profile?.verification_status === 'verified') {
      navigate('/vendors');
    }
  }, [profile, navigate]);

  const handleNext = async () => {
    if (step === 1 && !formData.id_card) {
      alert('📸 Please upload your National ID');
      return;
    }
    if (step === 2 && !formData.business_name) {
      alert('🏢 Please enter your business name');
      return;
    }

    if (step === 3) {
      // Submit verification
      setUploading(true);
      try {
        let idUrl = null;
        if (formData.id_card) {
          const fileName = `${profile.id}/id/${Date.now()}_${formData.id_card.name}`;
          const { error: uploadError } = await supabase.storage
            .from('vendor-docs')
            .upload(fileName, formData.id_card);
          if (uploadError) throw uploadError;
          
          const {  publicUrl } = supabase.storage
            .from('vendor-docs')
            .getPublicUrl(fileName);
          idUrl = publicUrl;
        }

        await supabase
          .from('profiles')
          .update({
            id_card_url: idUrl,
            business_name: formData.business_name,
            business_type: formData.business_type,
            location: formData.location,
            phone: formData.phone,
            description: formData.description || 'Local vendor fighting food waste',
            verification_status: 'verified',
            verification_badge: 'new'
          })
          .eq('id', profile.id);

        alert('✅ Verification complete! You can now add food items.');
        navigate('/vendors');
      } catch (err) {
        alert('❌ Failed: ' + err.message);
      } finally {
        setUploading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  if (!profile) return null;

  return (
    <div style={{
      background: 'radial-gradient(circle at top, #050505 0%, #000000 50%, #000000 100%)',
      color: '#fff',
      minHeight: '100vh',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '3rem'
        }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ 
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: step >= i ? '#10b981' : 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700'
            }}>
              {i}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div style={{
          background: 'rgba(15,23,42,0.7)',
          borderRadius: '20px',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          {step === 1 && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>📸</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>1. National ID</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>
                Upload your Rwandan National ID for verification
              </p>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => setFormData({...formData, id_card: e.target.files[0]})}
                style={{ width: '100%', marginBottom: '1rem' }}
              />
              {formData.id_card && (
                <p style={{ color: '#10b981' }}>✅ ID selected</p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(59,130,246,0.15)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>🏢</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>2. Business Info</h2>
              <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Business Name *"
                  value={formData.business_name}
                  onChange={e => setFormData({...formData, business_name: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    marginBottom: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                />
                <select
                  value={formData.business_type}
                  onChange={e => setFormData({...formData, business_type: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="canteen">University Canteen</option>
                  <option value="bakery">Bakery</option>
                  <option value="grocery">Grocery Store</option>
                </select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>📍</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>3. Contact Details</h2>
              <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="Location (e.g. Kigali, Gasabo) *"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    marginBottom: '1rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Phone (e.g. 0788123456) *"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ 
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#d97706' }}>🛡️ New Vendor Protection</h3>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  For your first 3 orders, SavePlate Rwanda acts as a mediator. 
                  If a student is unsatisfied, contact us for a full refund.
                </p>
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ 
            marginTop: '2.5rem',
            display: 'flex',
            gap: '1rem'
          }}>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={uploading}
              style={{
                flex: 1,
                padding: '14px',
                background: uploading ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {step < 3 ? 'Next →' : uploading ? 'Verifying...' : '✅ Complete Setup'}
            </button>
          </div>
        </div>

        <div style={{ 
          marginTop: '2rem', 
          textAlign: 'center',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '0.9rem'
        }}>
          🇷🇼 SavePlate Rwanda 
        </div>
      </div>
    </div>
  );
}