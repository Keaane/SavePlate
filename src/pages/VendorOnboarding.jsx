import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

export default function VendorOnboarding() {
  const { profile, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: ID, 2: Business, 3: Contact, 4: Products & Gallery
  const [formData, setFormData] = useState({
    id_card: null,
    business_name: '',
    business_type: 'restaurant',
    location: 'Kigali',
    phone: '',
    whatsapp: '',
    description: '',
    specialties: '', // What they most likely sell
    gallery_images: [] // Array of image files
  });
  const [uploading, setUploading] = useState(false);

  // Redirect verified vendors to dashboard (don't show onboarding form)
  useEffect(() => {
    if (!profile) return;
    
    // Check if vendor is verified (multiple ways to check for reliability)
    const isVerified = profile.verification_status === 'verified' || 
                      profile.is_verified === true ||
                      (profile.verification_status !== 'pending' && 
                       profile.verification_status !== 'rejected' && 
                       profile.verification_status !== 'suspended' &&
                       profile.verification_status != null &&
                       profile.verification_status !== undefined);
    
    // If vendor is already verified, redirect to dashboard immediately
    if (isVerified) {
      navigate('/vendors', { replace: true });
      return;
    }

    // Pre-fill form with existing data if vendor has already started onboarding
    if (profile.business_name || profile.phone) {
      setFormData(prev => ({
        ...prev,
        business_name: profile.business_name || '',
        business_type: profile.business_type || 'restaurant',
        location: profile.location || 'Kigali',
        phone: profile.phone || '',
        whatsapp: profile.phone || '', // Use phone as default for WhatsApp
        description: profile.description || ''
      }));
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
    if (step === 3 && (!formData.phone || !formData.whatsapp)) {
      alert('📱 Please provide both phone and WhatsApp numbers');
      return;
    }
    if (step === 4 && !formData.specialties.trim()) {
      alert('🍽️ Please describe what you most likely sell');
      return;
    }

    if (step === 4) {
      // Submit verification
      setUploading(true);
      try {
        let idUrl = null;
        let galleryUrls = [];

        // Try to upload ID card
        if (formData.id_card) {
          try {
            const fileName = `${profile.id}/id/${Date.now()}_${formData.id_card.name}`;
            const { error: uploadError } = await supabase.storage
              .from('vendor-docs')
              .upload(fileName, formData.id_card);
            
            if (!uploadError) {
              const { data: urlData } = supabase.storage
                .from('vendor-docs')
                .getPublicUrl(fileName);
              idUrl = urlData?.publicUrl || null;
            } else {
              console.warn('ID upload failed:', uploadError.message);
            }
          } catch (storageError) {
            console.warn('Storage upload failed:', storageError);
          }
        }

        // Upload gallery images
        if (formData.gallery_images && formData.gallery_images.length > 0) {
          for (let i = 0; i < formData.gallery_images.length; i++) {
            try {
              const file = formData.gallery_images[i];
              const fileName = `${profile.id}/gallery/${Date.now()}_${i}_${file.name}`;
              const { error: uploadError } = await supabase.storage
                .from('food-images')
                .upload(fileName, file);
              
              if (!uploadError) {
                const { data: urlData } = supabase.storage
                  .from('food-images')
                  .getPublicUrl(fileName);
                if (urlData?.publicUrl) {
                  galleryUrls.push(urlData.publicUrl);
                }
              }
            } catch (err) {
              console.warn('Gallery image upload failed:', err);
            }
          }
        }

        // Build update object
        const specialtiesText = formData.specialties ? `\n\nSpecialties: ${formData.specialties}` : '';
        const updateData = {
          business_name: formData.business_name,
          business_type: formData.business_type,
          location: formData.location,
          phone: formData.phone,
          description: (formData.description || 'Local vendor fighting food waste') + 
                      `\nWhatsApp: ${formData.whatsapp || formData.phone}` + 
                      specialtiesText,
          verification_status: 'verified',
          is_verified: true
        };

        // Add gallery URLs if we have any (stored as JSON array in description or separate field)
        if (galleryUrls.length > 0) {
          updateData.gallery_images = galleryUrls;
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', profile.id);

        if (updateError) throw updateError;

        // Fetch the updated profile to ensure we have the latest data
        const { data: updatedProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .single();

        if (fetchError) throw fetchError;

        // Update the profile in AppContext immediately
        if (updatedProfile) {
          dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
        }

        alert('✅ Verification complete! You can now add food items.');
        // Navigate immediately - the profile state is updated
        navigate('/vendors', { replace: true });
      } catch (err) {
        alert('❌ Failed: ' + (err.message || 'Please try again. Make sure all required fields are filled.'));
        console.error('Verification error:', err);
      } finally {
        setUploading(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  // Show loading or redirect if profile not loaded yet
  if (!profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
        color: 'white'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Double-check: Don't show form if already verified - redirect immediately
  const isVerified = profile.verification_status === 'verified' || 
                    profile.is_verified === true ||
                    (profile.verification_status !== 'pending' && 
                     profile.verification_status !== 'rejected' && 
                     profile.verification_status !== 'suspended' &&
                     profile.verification_status != null &&
                     profile.verification_status !== undefined &&
                     profile.verification_status !== '');
  
  if (isVerified) {
    // Redirect immediately in render - don't wait for useEffect
    navigate('/vendors', { replace: true });
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
        color: 'white'
      }}>
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

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
          {[1,2,3,4].map(i => (
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
                Upload your National ID or passport for verification
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
                  required
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
                  placeholder="WhatsApp Number (e.g. 0788123456) *"
                  value={formData.whatsapp}
                  onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px'
                  }}
                />
                <p style={{ 
                  margin: '0.75rem 0 0', 
                  fontSize: '0.85rem', 
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.5
                }}>
                  📱 We'll use your WhatsApp to contact you about claims, disputes, or important updates about your restaurant.
                </p>
              </div>

              <div style={{ 
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginTop: '1.5rem'
              }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#10b981' }}>ℹ️ Important Information</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Your WhatsApp number will be used by SavePlate Rwanda to contact you in case of:
                  <br />• Customer claims or disputes
                  <br />• Important updates about your account
                  <br />• New features and opportunities
                </p>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(245,158,11,0.15)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem'
              }}>🍽️</div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>4. Products & Gallery</h2>
              <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  color: 'rgba(255,255,255,0.9)' 
                }}>
                  What do you most likely sell? *
                </label>
                <textarea
                  placeholder="e.g. Pizza slices, Fresh sandwiches, Pastries, Rice dishes, etc."
                  value={formData.specialties}
                  onChange={e => setFormData({...formData, specialties: e.target.value})}
                  required
                  rows="3"
                  style={{ 
                    width: '100%', 
                    padding: '12px',
                    marginBottom: '1.5rem',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                />
                
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500', 
                  color: 'rgba(255,255,255,0.9)' 
                }}>
                  Gallery of Past Food Items (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    setFormData({...formData, gallery_images: files});
                  }}
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
                {formData.gallery_images.length > 0 && (
                  <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    ✅ {formData.gallery_images.length} image(s) selected
                  </p>
                )}
                <p style={{ 
                  margin: '0.75rem 0 0', 
                  fontSize: '0.85rem', 
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: 1.5
                }}>
                  📸 Upload photos of your past food items to showcase quality and attract more customers!
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
              {step < 4 ? 'Next →' : uploading ? 'Verifying...' : '✅ Complete Setup'}
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