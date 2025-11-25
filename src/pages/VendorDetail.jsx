// src/pages/VendorDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import ReportForm from '../components/ReportForm';

export default function VendorDetail() {
  const { id } = useParams();
  const { user } = useApp();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({ reason: '', description: '' });
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchVendor = async () => {
      if (!id) {
        navigate(-1); // Go back if no ID
        return;
      }

      try {
        // Fetch vendor (RLS allows public read)
        const { data: vendorData, error: vendorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('role', 'vendor')
          .single();

        if (vendorError) throw vendorError;
        if (!vendorData) {
          throw new Error('Vendor not found');
        }

        // Fetch food items
        const { data: foodData, error: foodError } = await supabase
          .from('food_items')
          .select('*')
          .eq('vendor_id', id)
          .eq('is_active', true)
          .gt('quantity', 0)
          .order('created_at', { ascending: false });

        if (foodError) throw foodError;

        // Fetch reviews (optional - table might not exist)
        let reviewData = [];
        try {
          const { data: reviews, error: reviewError } = await supabase
            .from('reviews')
            .select('*, profiles(full_name)')
            .eq('vendor_id', id)
            .order('created_at', { ascending: false });
          
          if (!reviewError) {
            reviewData = reviews || [];
          }
        } catch (reviewErr) {
          // Reviews table doesn't exist or error - continue without reviews
          console.warn('Reviews not available:', reviewErr);
        }

        setVendor(vendorData);
        setFoodItems(foodData || []);
        setReviews(reviewData);

        // Check if vendor is in favorites (for logged-in users)
        if (user) {
          try {
            const { data: favorite } = await supabase
              .from('favorites')
              .select('id')
              .eq('user_id', user.id)
              .eq('vendor_id', id)
              .single();
            
            setIsFavorite(!!favorite);
          } catch (error) {
            // Not in favorites or error - set to false
            setIsFavorite(false);
          }
        }
      } catch (error) {
        console.error('Vendor fetch error:', error);
        alert('Vendor not found. Redirecting...');
        navigate(-1); // Go back to previous page instead of non-existent route
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [id, navigate, user]);

  const submitReview = async () => {
    if (!user) {
      alert('Please log in to leave a review');
      return;
    }
    if (newReview.comment.length < 10) {
      alert('Review must be at least 10 characters');
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          vendor_id: id,
          user_id: user.id,
          rating: newReview.rating,
          comment: newReview.comment
        });

      if (error) throw error;

      // Refresh reviews
      const { data: reviewData, error: refreshError } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('vendor_id', id)
        .order('created_at', { ascending: false });
      
      if (!refreshError) {
        setReviews(reviewData || []);
      }
      setNewReview({ rating: 5, comment: '' });
      setShowReviewForm(false);
      alert('✅ Thank you for your review! 🇷🇼');
    } catch (error) {
      alert('❌ Failed to submit review: ' + (error.message || 'Please try again'));
    }
  };

  // Calculate stats
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const totalReviews = reviews.length;
  const availableFood = foodItems.filter(f => 
    f.quantity > 0 && new Date(f.expiry_date) > new Date()
  ).length;

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #050505 0%, #000000 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            animation: 'pulse 2s ease-in-out infinite'
          }}>🏪</div>
          <p style={{ color: 'rgba(255,255,255,0.7)' }}>Loading vendor details...</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: 'rgba(255,255,255,0.5)' }}>
            Fetching food items, reviews, and location info...
          </p>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div style={{ 
      background: 'radial-gradient(circle at top, #050505 0%, #000000 50%, #000000 100%)',
      color: '#fff',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      <div style={{ padding: '1rem 2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
        >
          ← Back
        </button>
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.2), transparent)',
        padding: '3rem 1rem 2rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>

        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Vendor Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              marginBottom: '1.5rem',
              border: '2px solid rgba(16,185,129,0.4)'
            }}>
              🏪
            </div>
            
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '800',
              margin: '0 0 0.5rem'
            }}>
              {vendor.business_name || vendor.full_name}
            </h1>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <span style={{
                background: 'rgba(16,185,129,0.2)',
                color: '#10b981',
                padding: '4px 12px',
                borderRadius: '20px',
                fontWeight: '600'
              }}>
                ✅ Verified
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ 
                    color: i < Math.floor(avgRating) ? '#fbbf24' : 'rgba(255,255,255,0.2)' 
                  }}>
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: '6px', fontSize: '0.9rem' }}>
                  {avgRating} ({totalReviews} reviews)
                </span>
              </div>
            </div>
            
            <p style={{ 
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.8)',
              maxWidth: '600px',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              {vendor.description || 'Local vendor fighting food waste in Rwanda. Fresh surplus food daily!'}
            </p>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📍 {vendor.location}
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📞 {vendor.phone}
              </div>
              <div style={{ 
                background: 'rgba(255,255,255,0.05)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🍽️ {availableFood} items available
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => alert(`📞 Call ${vendor.phone} to order!\n📍 Pickup: ${vendor.location}`)}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
              }}
            >
              📞 Contact Vendor
            </button>
            
            <button
              onClick={async () => {
                if (!user) {
                  alert('Please log in to save favorites');
                  return;
                }

                try {
                  if (isFavorite) {
                    // Remove from favorites
                    const { error } = await supabase
                      .from('favorites')
                      .delete()
                      .eq('user_id', user.id)
                      .eq('vendor_id', vendor.id);
                    
                    if (error) throw error;
                    setIsFavorite(false);
                    alert('❤️ Removed from favorites');
                  } else {
                    // Add to favorites
                    const { error } = await supabase
                      .from('favorites')
                      .insert({
                        user_id: user.id,
                        vendor_id: vendor.id
                      });
                    
                    if (error) throw error;
                    setIsFavorite(true);
                    alert('✅ Vendor saved to favorites! You\'ll be notified when they post new food.');
                  }
                } catch (error) {
                  alert('❌ Error: ' + (error.message || 'Failed to update favorites'));
                }
              }}
              style={{
                padding: '14px 28px',
                background: isFavorite 
                  ? 'rgba(239,68,68,0.2)' 
                  : 'rgba(255,255,255,0.08)',
                color: isFavorite ? '#ef4444' : 'rgba(255,255,255,0.8)',
                border: `1px solid ${isFavorite ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '14px',
                fontWeight: '500',
                fontSize: '1.1rem',
                cursor: 'pointer'
              }}
            >
              {isFavorite ? '❤️ Favorited' : '❤️ Save Vendor'}
            </button>
            
            {user && user.id !== vendor.id && (
              <button
                onClick={() => setShowReportForm(true)}
                style={{
                  padding: '14px 28px',
                  background: 'rgba(239,68,68,0.1)',
                  color: 'rgba(239,68,68,0.9)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '14px',
                  fontWeight: '500',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Report Vendor
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem 4rem',
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '2rem'
      }}>
        {/* Reviews Sidebar */}
        <div style={{
          background: 'rgba(15,23,42,0.6)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '1.5rem'
        }}>
          <h2 style={{ 
            fontSize: '1.4rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            🌟 Reviews ({totalReviews})
          </h2>
          
          {reviews.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              No reviews yet. Be the first to review {vendor.full_name}!
            </p>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  borderLeft: '3px solid #10b981'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ color: '#fbbf24' }}>
                      {'★'.repeat(review.rating)}
                    </span>
                    <span style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {review.profiles?.full_name?.split(' ')[0] || 'Student'}, UR
                    </span>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: 'rgba(255,255,255,0.8)'
                  }}>
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Review Form */}
          {user && (
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255,255,255,0.08)'
            }}>
              <h3 style={{ marginBottom: '1rem', color: '#10b981' }}>✏️ Leave a Review</h3>
              <p style={{ 
                fontSize: '0.9rem', 
                color: 'rgba(255,255,255,0.7)', 
                marginBottom: '1rem',
                lineHeight: 1.5
              }}>
                Share your experience after receiving your order! Help other students make informed decisions.
              </p>
              
              <div style={{ 
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem', color: '#d97706', fontSize: '0.95rem' }}>
                  🛡️ Have a Complaint?
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>
                  If you have any complaints about your order (wrong item, quality issues, etc.), 
                  please contact SavePlate Rwanda at{' '}
                  <a 
                    href="mailto:saveplate@gmail.com" 
                    style={{ color: '#10b981', textDecoration: 'underline' }}
                  >
                    saveplate@gmail.com
                  </a>
                  {' '}for assistance. We'll help resolve the issue!
                </p>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '1rem'
              }}>
                {[1,2,3,4,5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewReview({...newReview, rating: star})}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: star <= newReview.rating ? '#fbbf24' : 'rgba(255,255,255,0.2)',
                      fontSize: '1.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={newReview.comment}
                onChange={e => setNewReview({...newReview, comment: e.target.value})}
                placeholder="How was your experience? (min 10 chars)"
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  marginBottom: '1rem'
                }}
              />
              <button
                onClick={submitReview}
                disabled={newReview.comment.length < 10}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: newReview.comment.length < 10 ? '#94a3b8' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '500',
                  cursor: newReview.comment.length < 10 ? 'not-allowed' : 'pointer'
                }}
              >
                Submit Review 🇷🇼
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div>
          {/* Food Items */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🍽️ Available Food ({availableFood})
            </h2>
            
            {availableFood === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'rgba(15,23,42,0.6)',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '0.5rem' }}>
                  No food available right now
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {vendor.full_name} updates surplus food daily — check back at lunchtime!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.5rem'
              }}>
                {foodItems
                  .filter(f => f.quantity > 0 && new Date(f.expiry_date) > new Date())
                  .map(food => {
                    const hoursLeft = food.expiry_date 
                      ? Math.floor((new Date(food.expiry_date) - new Date()) / (1000 * 60 * 60))
                      : null;
                    return (
                      <div key={food.id} style={{
                        background: 'rgba(15,23,42,0.6)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '140px',
                          background: food.image 
                            ? `url(${food.image}) center/cover no-repeat` 
                            : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: food.image ? '0' : '3rem'
                        }}>
                          {!food.image && (
                            food.category === 'Fruits' ? '🍎' : 
                            food.category === 'Vegetarian' ? '🥗' : 
                            food.category === 'Bakery' ? '🥐' : '🍗'
                          )}
                        </div>
                        <div style={{ padding: '1.2rem' }}>
                          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>{food.name}</h3>
                          <p style={{ color: '#10b981', fontWeight: '700', marginBottom: '0.5rem' }}>
                            Frw {food.price.toLocaleString()}
                          </p>
                          <p style={{ 
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.85rem',
                            marginBottom: '0.75rem',
                            minHeight: '2.5rem'
                          }}>
                            {food.description?.length > 60 
                              ? food.description.substring(0, 57) + '...' 
                              : food.description || 'Fresh surplus food'}
                          </p>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{
                              background: hoursLeft <= 2 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                              color: hoursLeft <= 2 ? '#ef4444' : '#10b981',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '0.75rem'
                            }}>
                              ⏰ {hoursLeft}h
                            </span>
                            <button
                              onClick={() => alert(`📞 Call ${vendor.phone} to order ${food.name}!`)}
                              style={{
                                padding: '6px 12px',
                                background: 'rgba(16,185,129,0.3)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                              }}
                            >
                              Order
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          {/* Past Food Gallery */}
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}>
              📸 Past Items from {vendor.full_name}
            </h2>
            
            {foodItems.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                No food items posted yet.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {foodItems.slice(0, 6).map((food, i) => (
                  <div key={`past-${i}`} style={{
                    background: 'rgba(15,23,42,0.6)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    height: '140px'
                  }}>
                    <div style={{
                      height: '100px',
                      background: food.image 
                        ? `url(${food.image}) center/cover no-repeat` 
                        : 'linear-gradient(135deg, rgba(59,130,246,0.2), transparent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: food.image ? '0' : '2rem',
                      color: '#3b82f6'
                    }}>
                      {!food.image && '📸'}
                    </div>
                    <div style={{ 
                      padding: '6px', 
                      fontSize: '0.7rem',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.7)'
                    }}>
                      {food.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rwanda Impact */}
          <div style={{
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
              🇷🇼 Impact by {vendor.full_name}
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff' }}>247</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Meals Saved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff' }}>128 kg</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Food Waste Avoided</div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff' }}>89</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Happy Students</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Form Modal */}
      {showReportForm && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReportForm(false);
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
            zIndex: 10000,
            padding: '1rem'
          }}
        >
          <ReportForm
            vendorId={vendor.id}
            onClose={() => setShowReportForm(false)}
            onSuccess={() => setShowReportForm(false)}
          />
        </div>
      )}
    </div>
  );
}