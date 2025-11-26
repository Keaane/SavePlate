// src/pages/Students.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { getVendorRatingsBatch } from '../utils/vendorRatings';
import { deactivateExpiredItems } from '../utils/expiryHandler';

export default function Students() {
  const { user, profile, auth } = useApp();
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorRatings, setVendorRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Automatically deactivate expired items
        await deactivateExpiredItems();
        
        // Fetch active food items with vendor details
        const { data: foodData, error: foodError } = await supabase
          .from('food_items')
          .select('*, profiles(full_name, location, phone, description, business_name)')
          .eq('is_active', true)
          .gt('quantity', 0)
          .order('created_at', { ascending: false });

        if (foodError) throw foodError;

        // Fetch verified vendors for sidebar
        const { data: vendorData, error: vendorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .eq('is_verified', true)
          .order('full_name');

        if (vendorError) throw vendorError;

        setFoodItems(foodData || []);
        setVendors(vendorData || []);

        // Fetch ratings for all vendors
        const vendorIds = [...new Set([
          ...(vendorData || []).map(v => v.id),
          ...(foodData || []).map(f => f.vendor_id)
        ])];
        
        if (vendorIds.length > 0) {
          const ratings = await getVendorRatingsBatch(vendorIds);
          setVendorRatings(ratings);
        }

        // Fetch user favorites if logged in
        if (user) {
          const { data: favoritesData } = await supabase
            .from('favorites')
            .select('vendor_id')
            .eq('user_id', user.id);
          
          setFavorites((favoritesData || []).map(f => f.vendor_id));
        }
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredFood = foodItems.filter(item => {
    const isExpired = item.expiry_date ? new Date(item.expiry_date) <= new Date() : false;
    if (item.quantity <= 0 || isExpired) return false;
    
    // Filter by selected vendor
    if (selectedVendor && item.vendor_id !== selectedVendor.id) return false;
    
    // Filter by favorites only
    if (showFavoritesOnly && !favorites.includes(item.vendor_id)) return false;
    
    // Filter by category
    if (selectedCategory && item.category !== selectedCategory) return false;
    
    // Filter by location
    if (selectedLocation && item.profiles?.location !== selectedLocation) return false;
    
    // Filter by search term
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.profiles?.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Get unique categories and locations for filters
  const categories = [...new Set(foodItems.map(item => item.category).filter(Boolean))];
  const locations = [...new Set(foodItems.map(item => item.profiles?.location).filter(Boolean))];

  const getHoursLeft = (expiry) => {
    if (!expiry) return null;
    const diff = new Date(expiry) - new Date();
    return diff > 0 ? Math.floor(diff / (1000 * 60 * 60)) : 0;
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Loading...
        </p>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '4px solid rgba(16,185,129,0.2)',
          borderTop: '4px solid #10b981',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes pulse { 
            0%, 100% { transform: scale(1); opacity: 1; } 
            50% { transform: scale(1.05); opacity: 0.8; } 
          }
          @keyframes spin { 
            to { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'radial-gradient(circle at top, #050505 0%, #000000 50%, #000000 100%)',
      color: '#fff',
      minHeight: '100vh'
    }}>
      {/* Header with Logout */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(5,5,5,0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
          SavePlate
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {profile && (
            <span style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.9rem'
            }}>
              {profile.full_name || user?.email}
            </span>
          )}
          <button
            onClick={() => navigate('/profile')}
            style={{
              padding: '10px 20px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            My Profile
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
              fontSize: '0.9rem',
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
            Logout
          </button>
        </div>
      </div>
      {/* Hero */}
      <section style={{
        padding: '4rem 1rem 2rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2.8rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #fff, #10b981)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          marginBottom: '0.5rem'
        }}>
          🇷🇼 Student Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          maxWidth: '700px',
          margin: '0 auto 1.5rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Find surplus food from local vendors — save money, reduce waste
        </p>
        
        {/* Search */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative'
        }}>
          <input
            type="text"
            placeholder="Search food, vendor, or location..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 20px 14px 50px',
              borderRadius: '16px',
              border: '1px solid rgba(16,185,129,0.3)',
              background: 'rgba(15,23,42,0.7)',
              color: 'white',
              fontSize: '1.1rem',
              backdropFilter: 'blur(10px)'
            }}
          />
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(16,185,129,0.7)',
            fontSize: '1.2rem'
          }}>🔍</div>
        </div>

        {/* Filters */}
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              padding: '10px 20px',
              background: showFavoritesOnly 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${showFavoritesOnly ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ⭐ {showFavoritesOnly ? 'Showing Favorites' : 'Show Favorites Only'}
          </button>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15,23,42,0.7)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(15,23,42,0.7)',
              color: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {(selectedCategory || selectedLocation || showFavoritesOnly || selectedVendor) && (
            <button
              onClick={() => {
                setSelectedCategory('');
                setSelectedLocation('');
                setShowFavoritesOnly(false);
                setSelectedVendor(null);
              }}
              style={{
                padding: '10px 20px',
                background: 'rgba(239,68,68,0.2)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '12px',
                color: '#ef4444',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </section>

      <div className="container" style={{ 
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem 4rem',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '2rem'
      }}>
        {/* Sidebar: Vendors */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          borderRadius: '20px',
          border: '1px solid rgba(56,189,248,0.1)',
          padding: '1.5rem',
          height: 'fit-content'
        }}>
          <h2 style={{ 
            fontSize: '1.4rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🏪 Verified Vendors ({vendors.length})
          </h2>
          
          <div style={{ 
            maxHeight: '600px',
            overflowY: 'auto',
            paddingRight: '10px'
          }}>
            {vendors.map(vendor => (
              <div 
                key={vendor.id}
                style={{
                  background: selectedVendor?.id === vendor.id ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selectedVendor?.id === vendor.id ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '14px',
                  padding: '1.2rem',
                  marginBottom: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(16,185,129,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    🏪
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.1rem',
                      fontWeight: '600'
                    }}>
                      {vendor.business_name || vendor.full_name}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.85rem',
                      color: 'rgba(255,255,255,0.6)'
                    }}>
                      📍 {vendor.location}
                    </p>
                  </div>
                </div>
                
                <p style={{ 
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '0.75rem',
                  lineHeight: 1.5
                }}>
                  {vendor.description || 'Local vendor fighting food waste'}
                </p>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      background: 'rgba(16,185,129,0.2)',
                      color: '#10b981',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      ✅ Verified
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        alert(`📞 Call ${vendor.phone} to order from ${vendor.full_name}`);
                      }}
                      style={{
                        padding: '6px 14px',
                        background: 'rgba(16,185,129,0.3)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Contact
                    </button>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      navigate(`/vendors/${vendor.id}`);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    👤 View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Favorites Section */}
          {favorites.length > 0 && (
            <>
              <h2 style={{ 
                fontSize: '1.4rem',
                marginTop: '2rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Favorite Vendors ({favorites.length})
              </h2>
              <div style={{ 
                maxHeight: '400px',
                overflowY: 'auto',
                paddingRight: '10px'
              }}>
                {vendors
                  .filter(v => favorites.includes(v.id))
                  .map(vendor => (
                    <div 
                      key={vendor.id}
                      style={{
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '14px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setSelectedVendor(selectedVendor?.id === vendor.id ? null : vendor)}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                        {vendor.business_name || vendor.full_name}
                      </h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                        {vendor.location}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/vendors/${vendor.id}`); }}
                        style={{
                          marginTop: '0.75rem',
                          width: '100%',
                          padding: '8px',
                          background: 'rgba(245,158,11,0.2)',
                          border: '1px solid rgba(245,158,11,0.4)',
                          borderRadius: '8px',
                          color: '#f59e0b',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Main: Food Grid */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #fff, #10b981)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              🍽️ Available Food ({filteredFood.length})
            </h2>
            {filteredFood.length > 0 && (
              <span style={{
                background: 'rgba(16,185,129,0.2)',
                color: '#10b981',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {vendors.length} vendors
              </span>
            )}
          </div>

          {filteredFood.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15,23,42,0.6)',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ 
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '0.5rem'
              }}>
                {foodItems.length === 0 ? 'No food available yet' : 'No matches found'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                {foodItems.length === 0 
                  ? 'Vendors are preparing fresh surplus food — check back soon!'
                  : 'Try adjusting your search or filter by vendor'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.8rem'
            }}>
              {filteredFood.map(food => {
                const hoursLeft = getHoursLeft(food.expiry_date);
                const isLowStock = food.quantity <= 3 && food.quantity > 0;
                
                return (
                  <div 
                    key={food.id}
                    style={{
                      background: 'rgba(15,23,42,0.6)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {/* Expiry Badge */}
                    {hoursLeft !== null && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: hoursLeft <= 2 
                          ? 'linear-gradient(135deg, #ef4444, #b91c1c)' 
                          : hoursLeft <= 6 
                          ? 'linear-gradient(135deg, #f59e0b, #d97706)' 
                          : 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: hoursLeft <= 2 
                          ? '0 0 20px rgba(239,68,68,0.3)' 
                          : hoursLeft <= 6 
                          ? '0 0 20px rgba(245,158,11,0.3)' 
                          : '0 0 20px rgba(16,185,129,0.3)'
                      }}>
                        ⏰ {hoursLeft}h left
                      </div>
                    )}

                    {/* Vendor Header */}
                    <div style={{
                      padding: '1.5rem 1.5rem 1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'rgba(16,185,129,0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem'
                        }}>
                          🏪
                        </div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '1.2rem',
                          fontWeight: '600',
                          color: '#fff'
                        }}>
                          {food.profiles?.business_name || food.profiles?.full_name || 'Vendor'}
                        </h3>
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        📍 {food.profiles?.location || 'Kigali'}
                      </p>
                    </div>

                    {/* Food Content */}
                    <div style={{ padding: '0 1.5rem 1.5rem' }}>
                      <h2 style={{ 
                        fontSize: '1.6rem', 
                        margin: '0 0 0.75rem', 
                        fontWeight: '700',
                        color: '#fff'
                      }}>
                        {food.name}
                      </h2>
                      
                      <p style={{ 
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.6,
                        marginBottom: '1.25rem',
                        minHeight: '3.2rem'
                      }}>
                        {food.description}
                      </p>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '1rem',
                        alignItems: 'center',
                        marginBottom: '1.5rem'
                      }}>
                        <div>
                          <div style={{ 
                            fontSize: '1.4rem', 
                            fontWeight: '800',
                            color: '#10b981',
                            marginBottom: '0.25rem'
                          }}>
                            Frw {food.price.toLocaleString()}
                          </div>
                          <div style={{ 
                            fontSize: '0.9rem',
                            color: isLowStock ? '#ef4444' : 'rgba(255,255,255,0.7)',
                            fontWeight: isLowStock ? '600' : 'normal'
                          }}>
                            {food.quantity} left {isLowStock && '⚠️ Low stock!'}
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'rgba(16,185,129,0.1)',
                          borderRadius: '12px',
                          padding: '12px',
                          textAlign: 'center'
                        }}>
                          <div style={{ 
                            fontSize: '2rem', 
                            marginBottom: '0.25rem' 
                          }}>
                            {food.category === 'Fruits' ? '🍎' : 
                             food.category === 'Vegetarian' ? '🥗' : 
                             food.category === 'Bakery' ? '🥐' : 
                             food.category === 'Beverages' ? '🥤' : '🍗'}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.7)'
                          }}>
                            {food.category}
                          </div>
                        </div>
                      </div>

                      {/* Vendor Promo */}
                      {food.profiles?.description?.includes('Promo') && (
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.15), transparent)',
                          border: '1px solid rgba(245,158,11,0.3)',
                          borderRadius: '12px',
                          padding: '10px',
                          marginBottom: '1.25rem',
                          fontSize: '0.85rem',
                          color: '#d97706',
                          fontWeight: '500'
                        }}>
                          🎯 {food.profiles.description}
                        </div>
                      )}

                      {/* Reviews - Real Data */}
                      {(() => {
                        const vendorRating = vendorRatings[food.vendor_id] || { avgRating: 0, totalReviews: 0 };
                        if (vendorRating.totalReviews === 0) return null;
                        
                        return (
                          <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            borderRadius: '12px',
                            padding: '12px',
                            marginBottom: '1.5rem'
                          }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px',
                              marginBottom: '0.5rem'
                            }}>
                              <span style={{ color: '#fbbf24' }}>
                                {'★'.repeat(Math.floor(vendorRating.avgRating))}
                                {'☆'.repeat(5 - Math.floor(vendorRating.avgRating))}
                              </span>
                              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                {vendorRating.avgRating} ({vendorRating.totalReviews} {vendorRating.totalReviews === 1 ? 'review' : 'reviews'})
                              </span>
                            </div>
                            <button
                              onClick={() => navigate(`/vendors/${food.vendor_id}`)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0
                              }}
                            >
                              View all reviews →
                            </button>
                          </div>
                        );
                      })()}

                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem'
                      }}>
                        <button
                          onClick={() => {
                            const phone = food.profiles?.phone;
                            if (phone) {
                              alert(`📞 Call ${phone} to order ${food.name} from ${food.profiles.full_name}!\n📍 Pickup: ${food.profiles.location}`);
                            } else {
                              alert('Vendor phone not available. Try another item.');
                            }
                          }}
                          style={{
                            padding: '14px',
                            background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          📞 Contact Vendor
                        </button>
                        
                        <button
                          onClick={() => navigate(`/vendors/${food.vendor_id}`)}
                          style={{
                            padding: '14px',
                            background: 'rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '14px',
                            fontWeight: '500',
                            fontSize: '1rem',
                            cursor: 'pointer'
                          }}
                        >
                          👤 View Vendor
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rwanda Stats */}
          <div style={{
            marginTop: '3rem',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: '16px',
            padding: '1.5rem'
          }}>
            <h3 style={{ 
              margin: '0 0 1rem', 
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🇷🇼 Impact This Week
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>1,247</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Meals Saved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>842 kg</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Food Waste Avoided</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>21</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Vendors Supported</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .container {
          width: 90%;
          max-width: 1400px;
          margin: 0 auto;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
}