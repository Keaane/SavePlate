import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import VendorForm from '../components/VendorForm';
import FoodCard from '../components/FoodCard';

export default function Vendors() {
  const { profile, loading: appLoading, auth } = useApp();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile && profile.role !== 'vendor') {
      navigate('/students');
    }
  }, [profile, navigate]);

  const fetchVendorItems = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVendorItems(data || []);
    } catch (error) {
      console.error('Error fetching vendor items:', error.message);
      setVendorItems([]);
      alert('❌ Failed to load food items. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    // Wait for AppContext to finish loading
    if (appLoading) {
      return;
    }
    
    if (profile?.id) {
      fetchVendorItems();
    } else {
      // Profile is loaded but no id (not logged in or not a vendor)
      setLoading(false);
    }
  }, [profile, appLoading, fetchVendorItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('🗑️ Delete this item?')) return;
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchVendorItems();
    } catch (error) {
      alert('❌ Delete failed');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchVendorItems();
  };

  if (loading) {
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
          Loading your dashboard...
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

  const stats = {
    total: vendorItems.length,
    lowStock: vendorItems.filter(i => i.quantity > 0 && i.quantity <= 3).length,
    outOfStock: vendorItems.filter(i => i.quantity === 0).length,
    revenue: vendorItems.reduce((sum, item) => sum + (item.price * 10), 0) // Estimate: 10 orders
  };

  // Badge styles based on verification status
  const getBadgeStyle = () => {
    const isVerified = profile?.verification_status === 'verified' || profile?.is_verified === true;
    
    if (!isVerified) {
      return { bg: 'rgba(245, 158, 11, 0.15)', color: '#d97706', text: 'Pending Verification' };
    }
    
    // Check badge level for verified vendors
    switch (profile?.verification_badge) {
      case 'trusted': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#1d4ed8', text: 'Trusted Vendor' };
      case 'active': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', text: 'Active Vendor' };
      default: return { bg: 'rgba(16, 185, 129, 0.15)', color: '#059669', text: 'Verified Vendor' };
    }
  };

  const badge = getBadgeStyle();
  const isVerified = profile?.verification_status === 'verified' || profile?.is_verified === true;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        alignItems: 'flex-start'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.8rem',
            color: '#fff',
            fontWeight: '700'
          }}>
            Vendor Dashboard
          </h1>
          <p style={{ 
            color: '#94a8b8', 
            margin: '0.5rem 0 0',
            fontSize: '0.95rem'
          }}>
            Manage your surplus food • Support community • Earn extra income 🇷🇼
          </p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Verification Badge */}
          <span style={{
            background: badge.bg,
            color: badge.color,
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {badge.text}
          </span>
          
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '10px 20px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            My Profile
          </button>
          
          <button
            onClick={() => navigate(`/vendors/${profile?.id}`)}
            style={{
              padding: '10px 20px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            View Public Profile
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              setEditingItem(null);
              setShowForm(true);
            }}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            + Add Food
          </button>
          
          <button
            onClick={async () => {
              try {
                await auth.signOut();
                navigate('/auth');
              } catch (error) {
                console.error('Logout error:', error);
                alert('Error logging out. Please try again.');
              }
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Verification Banner (For New/Unverified Vendors) */}
      {profile?.verification_status !== 'verified' && !profile?.is_verified && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(250,204,21,0.05))',
          border: '1px solid rgba(250,204,21,0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '100px',
            height: '100px',
            background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }}></div>
          
          <div style={{ position: 'relative', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ 
              fontSize: '2.5rem',
              background: 'rgba(245,158,11,0.15)',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📸
            </div>
            
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                margin: '0 0 0.75rem', 
                color: '#d97706',
                fontSize: '1.3rem'
              }}>
                🆕 Complete Your Verification
              </h3>
              <p style={{ 
                margin: 0, 
                color: '#92400e',
                lineHeight: 1.6
              }}>
                Upload your <strong>National ID</strong> and business details to get verified and start listing food.
              </p>
            </div>
            
            <button
              onClick={() => navigate('/vendor-onboarding')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(219,98,12,0.9))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Verify Now →
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {[
          { label: 'Your Active Listings', value: stats.total, icon: '🍽️', color: '#059669' },
          { label: 'Your Low Stock', value: stats.lowStock, icon: '⚠️', color: '#f59e0b' },
          { label: 'Your Revenue (Est.)', value: `Frw ${stats.revenue.toLocaleString()}`, icon: '💰', color: '#3b82f6' },
          { 
            label: 'Next Level', 
            value: profile?.verification_badge === 'new' ? '3 reviews' : 
                   profile?.verification_badge === 'active' ? '10 orders' : '✓ Trusted',
            icon: '➡️',
            color: '#6b7280'
          }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '1.8rem', 
              color: stat.color,
              marginBottom: '0.75rem'
            }}>
              {stat.icon}
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: stat.color,
              marginBottom: '0.25rem'
            }}>
              {stat.value}
            </div>
            <div style={{ 
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Food Items Grid */}
      {vendorItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(15,23,42,0.6)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
          <h3 style={{ color: '#94a8b8', marginBottom: '1rem' }}>
            {!isVerified 
              ? 'Get Verified First!' 
              : 'No food items listed'}
          </h3>
          <p style={{ 
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            {!isVerified 
              ? 'Complete verification to start listing surplus food and earn extra income.' 
              : 'Add your first surplus food item to help students and reduce waste!'}
          </p>
          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isVerified) {
                navigate('/vendor-onboarding');
              } else {
                setEditingItem(null);
                setShowForm(true);
              }
            }}
            style={{
              padding: '14px 28px',
              background: !isVerified 
                ? 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(219,98,12,0.9))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {!isVerified ? 'Verify Now' : 'Add Food Item'}
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3rem'
        }}>
          {vendorItems.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <FoodCard food={item} hideContactButton={true} />
              
              {/* Edit/Delete */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                display: 'flex',
                gap: '0.6rem'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleFormClose();
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div style={{
            background: 'rgba(10,10,10,0.95)',
            borderRadius: '20px',
            border: '1px solid rgba(45,212,191,0.2)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            backdropFilter: 'blur(12px)'
          }}>
            <VendorForm 
              editingItem={editingItem}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </div>
        </div>
      )}
    </div>
  );
}