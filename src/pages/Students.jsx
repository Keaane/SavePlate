import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';
import Checkout from '../components/Checkout';
import { deactivateExpiredItems } from '../utils/expiryHandler';

function Students() {
  const { profile, cart, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  // Fetch food items and orders
  useEffect(() => {
    // Deactivate expired items first
    deactivateExpiredItems();
    fetchFoodItems();
    fetchOrders();
    
    // Set up interval to check for expired items every 5 minutes
    const interval = setInterval(() => {
      deactivateExpiredItems();
      fetchFoodItems();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [profile]);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*, profiles(full_name, location)')
        .eq('is_active', true)
        .gt('quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Format data to include vendor name
      const formattedData = data.map(item => ({
        ...item,
        vendor: item.profiles?.full_name || 'Unknown Vendor',
        vendorLocation: item.profiles?.location
      }));
      
      setFoodItems(formattedData);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, food_items(*))')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Filter available food items (quantity > 0 and not expired)
  const availableFood = foodItems.filter(item => {
    const isExpired = new Date(item.expiry_date) <= new Date();
    return item.quantity > 0 && !isExpired;
  });

  // Search and filter logic
  const filteredFood = availableFood.filter(item => {
    // Search filter
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    // Location filter
    const matchesLocation = !locationFilter || 
                           (item.vendorLocation && item.vendorLocation.toLowerCase().includes(locationFilter.toLowerCase()));
    
    // Price filter
    let matchesPrice = true;
    if (priceFilter !== 'all') {
      const price = item.price;
      switch (priceFilter) {
        case '0-5':
          matchesPrice = price >= 0 && price <= 5;
          break;
        case '5-10':
          matchesPrice = price > 5 && price <= 10;
          break;
        case '10-15':
          matchesPrice = price > 10 && price <= 15;
          break;
        case '15+':
          matchesPrice = price > 15;
          break;
      }
    }
    
    // Expiry filter
    let matchesExpiry = true;
    if (expiryFilter !== 'all' && item.expiry_date) {
      const now = new Date();
      const expiry = new Date(item.expiry_date);
      const diffHours = (expiry - now) / (1000 * 60 * 60);
      
      switch (expiryFilter) {
        case '1h':
          matchesExpiry = diffHours <= 1 && diffHours > 0;
          break;
        case '6h':
          matchesExpiry = diffHours <= 6 && diffHours > 0;
          break;
        case '24h':
          matchesExpiry = diffHours <= 24 && diffHours > 0;
          break;
        case '48h':
          matchesExpiry = diffHours <= 48 && diffHours > 0;
          break;
      }
    }
    
    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesExpiry;
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (category) => {
    setFilterCategory(category);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
          Student Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Find and reserve surplus food from local vendors
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#10b981', fontSize: '2rem', margin: '0' }}>
            {availableFood.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Available Items</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#3b82f6', fontSize: '2rem', margin: '0' }}>
            {orders.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Your Orders</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>
            {cart.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Cart Items</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <SearchBar 
        onSearch={handleSearch} 
        onFilter={handleFilter}
        onLocationFilter={setLocationFilter}
        onPriceFilter={setPriceFilter}
        onExpiryFilter={setExpiryFilter}
      />

      {/* Available Food Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          Available Food Items
          {searchTerm || filterCategory !== 'all' ? ` (${filteredFood.length} found)` : ` (${filteredFood.length})`}
        </h2>
        
        {filteredFood.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>
              {availableFood.length === 0 ? 'No food items available' : 'No items match your search'}
            </h3>
            <p style={{ color: '#9ca3af' }}>
              {availableFood.length === 0 
                ? 'Check back later for new surplus food listings.' 
                : 'Try adjusting your search terms or filters.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredFood.map(food => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* Cart and Checkout */}
      {cart.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1000
        }}>
          <button
            onClick={() => setShowCheckout(true)}
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.4)';
            }}
          >
            🛒 Checkout ({cart.length} items)
          </button>
        </div>
      )}

      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setShowCheckout(false);
            fetchFoodItems();
            fetchOrders();
          }}
        />
      )}

      {/* Order History Section */}
      <section>
        <h2 style={{ 
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          Your Order History ({orders.length})
        </h2>
        
        {orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#6b7280' }}>
              You haven't placed any orders yet. Your order history will appear here.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gap: '1rem'
          }}>
            {orders.map(order => (
              <div key={order.id} style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${
                  order.status === 'completed' ? '#10b981' : 
                  order.status === 'confirmed' ? '#3b82f6' : '#f59e0b'
                }`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>
                      Order #{order.id.slice(-8)}
                    </h4>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#6b7280' }}>
                      <strong>Total:</strong> ${order.total_amount}
                    </p>
                    <p style={{ margin: '0 0 0.25rem 0', color: '#6b7280' }}>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                      Ordered on: {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      background: 
                        order.status === 'completed' ? '#dcfce7' :
                        order.status === 'confirmed' ? '#dbeafe' : '#fef3c7',
                      color:
                        order.status === 'completed' ? '#166534' :
                        order.status === 'confirmed' ? '#1e40af' : '#92400e'
                    }}>
                      {order.status === 'completed' ? '✅ Completed' : 
                       order.status === 'confirmed' ? '📦 Confirmed' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Students;