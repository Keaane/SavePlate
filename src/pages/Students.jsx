import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import FoodCard from '../components/FoodCard';
import SearchBar from '../components/SearchBar';

function Students() {
  const { profile } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, [profile]);

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*, profiles(full_name, location, phone)')
        .eq('is_active', true)
        .gt('quantity', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map(item => ({
        ...item,
        vendor: item.profiles?.full_name || 'Vendor',
        vendorLocation: item.profiles?.location || 'Kigali',
        vendorPhone: item.profiles?.phone || ''
      }));
      
      setFoodItems(formattedData);
    } catch (error) {
      console.error('Error fetching food items:', error);
      alert('Failed to load food items. Check console.');
    } finally {
      setLoading(false);
    }
  };

  // Filter available food
  const availableFood = foodItems.filter(item => {
    if (!item.expiry_date) return item.quantity > 0;
    const isExpired = new Date(item.expiry_date) <= new Date();
    return item.quantity > 0 && !isExpired;
  });

  const filteredFood = availableFood.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    
    const matchesLocation = !locationFilter || 
      (item.vendorLocation?.toLowerCase().includes(locationFilter.toLowerCase()));

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <div style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
          <p>Loading food items...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        padding: '2rem',
        background: '#f0fdf4',
        borderRadius: '16px'
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '2.2rem',
          color: '#065f46'
        }}>
          🇷🇼 SavePlate Rwanda
        </h1>
        <p style={{ 
          color: '#166534', 
          fontSize: '1.2rem',
          marginTop: '0.5rem'
        }}>
          Find surplus food from local vendors — contact directly to order!
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
          <h3 style={{ color: '#059669', fontSize: '2rem', margin: '0' }}>
            {availableFood.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Available Items</p>
        </div>
      </div>

      {/* Search */}
      <SearchBar 
        onSearch={setSearchTerm}
        onFilter={setFilterCategory}
        onLocationFilter={setLocationFilter}
        priceFilter={null}
        expiryFilter={null}
      />

      {/* Food Items */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ 
          marginBottom: '1.5rem',
          color: '#1f2937'
        }}>
          🍽️ Available Food ({filteredFood.length})
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
              {availableFood.length === 0 ? 'No food available' : 'No matches found'}
            </h3>
            <p style={{ color: '#9ca3af' }}>
              {availableFood.length === 0 
                ? 'Vendors will add food soon!' 
                : 'Try adjusting your search or location'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {filteredFood.map(food => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* Instructions */}
      <div style={{
        background: '#dbeafe',
        border: '1px solid #93c5fd',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem', 
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📱 How to Order
        </h3>
        <ol style={{ 
          color: '#1e40af', 
          paddingLeft: '1.5rem',
          lineHeight: '1.8'
        }}>
          <li><strong>Contact the vendor</strong> using the phone number shown</li>
          <li>Confirm food availability and quantity</li>
          <li>Arrange pickup location and time</li>
          <li>Pay directly via Mobile Money or cash</li>
        </ol>
        <p style={{ 
          marginTop: '1rem',
          fontStyle: 'italic',
          color: '#3b82f6'
        }}>
          💡 Tip: Save vendor numbers in your phone for faster ordering!
        </p>
      </div>
    </div>
  );
}

export default Students;