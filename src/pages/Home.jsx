import { useApp } from '../context/AppContext';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

// 🔔 Toast Component (lightweight, self-contained)
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = 
    type === 'success' ? 'rgba(16, 185, 129, 0.9)' :
    type === 'error' ? 'rgba(239, 68, 68, 0.9)' :
    'rgba(59, 130, 246, 0.9)';

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      background: bgColor,
      color: 'white',
      padding: '0.75rem 1.5rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontWeight: '500',
      animation: 'slideIn 0.3s ease-out'
    }}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem',
          cursor: 'pointer',
          marginLeft: '0.5rem'
        }}
      >
        ×
      </button>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      ` }} />
    </div>
  );
}

// 🦴 Skeleton Card (for loading state)
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(15,15,15,0.5)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
      backdropFilter: 'blur(8px)',
      overflow: 'hidden',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      {/* Shimmer effect */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        animation: 'shimmer 1.8s infinite'
      }} />

      <div style={{ height: '140px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '1.25rem' }}></div>
      
      <div style={{ height: '1.2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', marginBottom: '0.5rem' }}></div>
      <div style={{ height: '0.9rem', width: '60%', background: 'rgba(255,255,255,0.07)', borderRadius: '4px', marginBottom: '1rem' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ height: '1.5rem', width: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
        <div style={{ height: '0.9rem', width: '40px', background: 'rgba(255,255,255,0.07)', borderRadius: '4px' }}></div>
      </div>
      
      <div style={{ height: '3rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      ` }} />
    </div>
  );
}

function Home() {
  const { user, profile, cart, dispatch } = useApp();
  const [foodItems, setFoodItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const navigate = useNavigate();

  // Cart count with quantity
  const cartItemCount = useMemo(() => 
    cart.reduce((total, item) => total + (item.cartQuantity || 1), 0),
    [cart]
  );

  // Categories extraction
  const categories = useMemo(() => {
    const cats = new Set(['All']);
    foodItems.forEach(item => cats.add(item.category || 'Uncategorized'));
    return Array.from(cats);
  }, [foodItems]);

  // 🔍 Filtered food (search + category)
  const filteredFood = useMemo(() => {
    return foodItems.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || 
        item.category === selectedCategory;

      if (!item.expiry_date) return item.quantity > 0 && matchesSearch && matchesCategory;
      const isExpired = new Date(item.expiry_date) <= new Date();
      return item.quantity > 0 && !isExpired && matchesSearch && matchesCategory;
    });
  }, [foodItems, searchTerm, selectedCategory]);

  const featuredFood = filteredFood.slice(0, 6);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        setLoading(true);

        const {  foodData, error: foodError } = await supabase
          .from('food_items')
          .select('*, profiles(full_name, location)')
          .eq('is_active', true)
          .gt('quantity', 0)
          .order('created_at', { ascending: false });

        if (foodError) throw foodError;

        const formattedFood = foodData.map(item => ({
          ...item,
          vendor: item.profiles?.full_name || 'Unknown Vendor',
          vendorLocation: item.profiles?.location
        }));

        const {  vendorData, error: vendorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'vendor')
          .eq('is_verified', true);

        if (vendorError) throw vendorError;

        setFoodItems(formattedFood);
        setVendors(vendorData || []);
      } catch (err) {
        console.error('Error fetching ', err);
        setError('Failed to load food data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🛒 Add to cart (with toast)
  const handleAddToCart = useCallback((foodItem) => {
    if (foodItem.quantity <= 0) return;

    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { 
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        vendor: foodItem.vendor,
        cartQuantity: 1
      } 
    });

    setToast({
      message: `✅ ${foodItem.name} added to cart!`,
      type: 'success'
    });
  }, [dispatch]);

  const getHoursLeft = useCallback((expiry) => {
    if (!expiry) return null;
    const diffMs = new Date(expiry) - new Date();
    return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60)) : 0;
  }, []);

  // Close toast
  const closeToast = () => setToast(null);

  // 🔎 Debounced search (prevent lag on typing)
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  // 🎯 Render
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(ellipse at top, #050505 0%, #000000 50%, #000000 100%)',
      color: '#fff'
    }}>
      {/* Toast */}
      {toast && <Toast {...toast} onClose={closeToast} />}

      {/* Hero */}
      <section style={{
        position: 'relative',
        padding: '6rem 0 3rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'float 10s ease-in-out infinite',
          borderRadius: '50%'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '10%',
          right: '10%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'float 12s ease-in-out infinite reverse',
          borderRadius: '50%'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1.5rem',
            animation: 'pulse 3s ease-in-out infinite'
          }}>🍽️</div>
          
          <h1 style={{ 
            fontSize: '3.5rem', fontWeight: '800', letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #fff, #10b981, #3b82f6)',
            backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'
          }}>
            SavePlate
          </h1>
          
          <p style={{ 
            fontSize: '1.3rem', maxWidth: '700px', margin: '0 auto 2.5rem',
            color: 'rgba(255,255,255,0.85)', lineHeight: '1.6'
          }}>
            {user 
              ? `Welcome back, ${profile?.full_name || user.email?.split('@')[0] || 'Friend'}!` 
              : 'Fighting food waste across Africa — one plate at a time.'}
          </p>
          
          {/* Stats */}
          <div style={{ 
            marginTop: '2.5rem', 
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem', maxWidth: '768px', margin: '0 auto'
          }}>
            {[
              { icon: '🍕', count: filteredFood.length, label: 'Available Items', color: '#10b981' },
              { icon: '🏪', count: vendors.length, label: 'Vendors', color: '#3b82f6' },
              { icon: '🛒', count: cartItemCount, label: 'In Cart', color: '#f59e0b' }
            ].map((stat, i) => (
              <div key={i} style={{ 
                background: 'rgba(15,15,15,0.7)', padding: '1.25rem', borderRadius: '16px',
                border: `1px solid rgba(${stat.color === '#10b981' ? '16,185,129' : stat.color === '#3b82f6' ? '59,130,246' : '245,158,11'}, 0.2)`,
                backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
              }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color, marginBottom: '0.25rem' }}>
                  {loading ? '—' : stat.count}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🔍 Search + Filter Bar */}
      <section style={{ padding: '0 1rem 2rem' }}>
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(10,10,10,0.6)',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)'
          }}>
            {/* Search */}
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label htmlFor="search" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>
                Search food, vendor, or description
              </label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="e.g. chapati, Mama Njeri..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Category Filter */}
            <div style={{ minWidth: '160px' }}>
              <label htmlFor="category" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  appearance: 'none',
                  backgroundImage: `url("image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3e%3cpath fill='rgba(255,255,255,0.5)' d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  paddingRight: '2.5rem'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat} style={{ background: '#000', color: '#fff' }}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 🍽️ Featured Food */}
      <section style={{ padding: '2rem 0 3rem' }}>
        <div className="container">
          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#f87171' }}>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          ) : featuredFood.length > 0 ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ 
                  fontSize: '2.3rem', fontWeight: '800',
                  background: 'linear-gradient(135deg, #fff, #10b981)',
                  backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent'
                }}>
                  {searchTerm || selectedCategory !== 'All' ? 'Matching Food' : 'Featured Surplus'}
                </h2>
                {filteredFood.length !== foodItems.length && (
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem' }}>
                    {filteredFood.length} item{filteredFood.length !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '2rem',
                maxWidth: '1400px',
                margin: '0 auto'
              }}>
                {featuredFood.map(food => {
                  const hoursLeft = getHoursLeft(food.expiry_date);
                  return (
                    <div 
                      key={food.id}
                      style={{
                        background: 'rgba(15,15,15,0.6)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        position: 'relative',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {/* Expiry badge */}
                      {hoursLeft !== null && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem', right: '1rem',
                          background: hoursLeft <= 2 ? 'linear-gradient(135deg, #ef4444, #b91c1c)' :
                                    hoursLeft <= 6 ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                    'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          ⏰ {hoursLeft}h
                        </div>
                      )}

                      {/* Food image (emoji placeholder — ready for <img loading="lazy" />) */}
                      <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        height: '140px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: hoursLeft <= 2 ? '#ef4444' : '#10b981',
                        marginBottom: '1.25rem'
                      }}>
                        {food.category === 'Fruits' ? '🍎' : 
                         food.category === 'Vegetarian' ? '🥗' : 
                         food.category === 'Bakery' ? '🥐' : 
                         food.category === 'Beverages' ? '🥤' : 
                         food.category === 'Meals' ? '🍛' : '🍗'}
                      </div>

                      <h3 style={{ margin: '0 0 0.5rem', fontWeight: '700', fontSize: '1.3rem' }}>
                        {food.name}
                      </h3>
                      
                      <p style={{ 
                        color: 'rgba(255,255,255,0.75)', 
                        margin: '0 0 0.5rem',
                        fontSize: '0.95rem',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                        🏪 <span style={{ fontWeight: '500' }}>{food.vendor}</span>
                      </p>

                      <p style={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        margin: '0 0 1.25rem',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        minHeight: '3.2rem',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {food.description || 'No description'}
                      </p>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1.25rem'
                      }}>
                        <div style={{ color: '#10b981', fontSize: '1.6rem', fontWeight: '800' }}>
                          ${food.price}
                        </div>
                        <div style={{
                          color: food.quantity <= 3 ? '#ef4444' : 'rgba(255,255,255,0.7)',
                          fontWeight: food.quantity <= 3 ? '700' : '500'
                        }}>
                          {food.quantity} left
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddToCart(food)}
                        disabled={food.quantity <= 0}
                        style={{
                          width: '100%',
                          padding: '0.9rem',
                          background: food.quantity > 0 
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))'
                            : 'rgba(80,80,80,0.5)',
                          color: '#fff',
                          border: '1px solid rgba(16,185,129,0.4)',
                          borderRadius: '12px',
                          fontWeight: '600',
                          cursor: food.quantity > 0 ? 'pointer' : 'not-allowed',
                          display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {food.quantity <= 0 ? 'Sold Out' : 'Add to Cart 🛒'}
                      </button>
                    </div>
                  );
                })}
              </div>

              {(filteredFood.length > 6 || !user) && (
                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <Link 
                    to={user ? "/students" : "/auth"}
                    style={{
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(37,99,235,0.95))',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      border: '1px solid rgba(59,130,246,0.4)',
                      boxShadow: '0 4px 20px rgba(59,130,246,0.2)',
                      display: 'inline-block',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(59,130,246,0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.2)';
                    }}
                  >
                    {user ? 'Browse All Food' : 'Sign Up to Save Food'}
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(15,15,15,0.6)',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(12px)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ color: '#fff', marginBottom: '0.75rem', fontWeight: '700' }}>
                {searchTerm || selectedCategory !== 'All' 
                  ? 'No matches found' 
                  : 'No food available right now'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem', lineHeight: '1.6' }}>
                {searchTerm 
                  ? 'Try different keywords or reset filters.'
                  : user && profile?.role === 'vendor'
                    ? 'Be the first to add surplus food!'
                    : 'Vendors are preparing fresh surplus food — check back soon!'}
              </p>
              {(!searchTerm && user && profile?.role === 'vendor') && (
                <Link 
                  to="/vendors"
                  style={{
                    padding: '0.9rem 2rem',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    display: 'inline-block'
                  }}
                >
                  Add Your First Item
                </Link>
              )}
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 💡 Value Props */}
      <section style={{ 
        padding: '4rem 0 6rem',
        background: 'rgba(0,0,0,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { icon: '🌍', title: 'Built for Africa', desc: 'Designed for African campuses & urban centers.' },
              { icon: '💰', title: 'Save Money', desc: 'Surplus food at up to 70% off retail.' },
              { icon: '♻️', title: 'Stop Waste', desc: 'Every meal saved = less in landfills.' }
            ].map((item, i) => (
              <div key={i}>
                <div style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: '700' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(15px); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.9; }
        }
      ` }} />
    </div>
  );
}

export default Home;