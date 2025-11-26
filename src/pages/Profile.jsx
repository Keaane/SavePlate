import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

/**
 * User Profile and Settings page
 * Allows users to view and update their profile information
 */
export default function Profile() {
  const { user, profile, dispatch } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    location: '',
    description: ''
  });
  const [favorites, setFavorites] = useState([]);
  const [userReports, setUserReports] = useState([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        description: profile.description || ''
      });
    }
    fetchUserData();
  }, [profile]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*, profiles!favorites_vendor_id_fkey(id, full_name, business_name, location)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch user's reports
      const { data: reportsData } = await supabase
        .from('reports')
        .select('*, profiles!reports_vendor_id_fkey(full_name, business_name)')
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setFavorites(favoritesData || []);
      setUserReports(reportsData || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim() || null,
          location: formData.location.trim() || null,
          description: formData.description.trim() || null
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update AppContext
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (updatedProfile) {
        dispatch({ type: 'SET_PROFILE', payload: updatedProfile });
      }

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (!confirm('Remove this vendor from favorites?')) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;
      fetchUserData();
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  if (!user || !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'white'
      }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: '#fff',
      padding: '2rem 1rem'
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>
            👤 My Profile
          </h1>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {/* Profile Settings */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Profile Settings</h2>
            
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '1rem',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                  Email cannot be changed
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0788123456"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: '500'
                }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Kigali, Gasabo"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {profile.role === 'student' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '500'
                  }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: saving
                    ? 'rgba(107,114,128,0.5)'
                    : 'linear-gradient(135deg, #059669, #047857)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Favorites & Reports */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Favorites */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '2rem'
            }}>
              <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>
                ⭐ Favorites ({favorites.length})
              </h2>
              {favorites.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '2rem 0' }}>
                  No favorite vendors yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {favorites.map(fav => (
                    <div
                      key={fav.id}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>
                          {fav.profiles?.business_name || fav.profiles?.full_name || 'Unknown'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                          {fav.profiles?.location || 'No location'}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => navigate(`/vendors/${fav.vendor_id}`)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(59,130,246,0.2)',
                            border: '1px solid rgba(59,130,246,0.3)',
                            borderRadius: '6px',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRemoveFavorite(fav.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'rgba(239,68,68,0.2)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: '6px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reports */}
            {userReports.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '2rem'
              }}>
                <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>
                  ⚠️ My Reports ({userReports.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {userReports.map(report => (
                    <div
                      key={report.id}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>
                          {report.profiles?.business_name || report.profiles?.full_name || 'Unknown Vendor'}
                        </h4>
                        <span style={{
                          background: report.status === 'resolved' ? 'rgba(16,185,129,0.2)' :
                                     report.status === 'pending' ? 'rgba(245,158,11,0.2)' :
                                     'rgba(107,114,128,0.2)',
                          color: report.status === 'resolved' ? '#10b981' :
                                 report.status === 'pending' ? '#d97706' :
                                 '#6b7280',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {report.status}
                        </span>
                      </div>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        {report.reason}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

