import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import VendorForm from '../components/VendorForm';
import FoodCard from '../components/FoodCard';
import VendorPayments from '../components/VendorPayments';
import { deactivateExpiredItems } from '../utils/expiryHandler';

function Vendors() {
  const { profile, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch vendor's food items
  useEffect(() => {
    // Deactivate expired items first
    deactivateExpiredItems();
    fetchVendorItems();
    
    // Set up interval to check for expired items every 5 minutes
    const interval = setInterval(() => {
      deactivateExpiredItems();
      fetchVendorItems();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [profile]);

  const fetchVendorItems = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendorItems(data || []);
    } catch (error) {
      console.error('Error fetching vendor items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const { error } = await supabase
          .from('food_items')
          .delete()
          .eq('id', itemId);

        if (error) throw error;
        fetchVendorItems(); // Refresh the list
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchVendorItems(); // Refresh after form close
  };

  const handleSeedData = async () => {
    if (!profile) return;
    
    if (!window.confirm('This will add 15 sample food items with various categories and expiry times. Continue?')) return;
    
    const seedItems = [
      { 
        name: 'Fresh Pizza Slices', 
        price: 5.99, 
        quantity: 12, 
        category: 'Fast Food', 
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), 
        image: '🍕',
        description: 'Delicious pepperoni and cheese pizza slices, freshly baked'
      },
      { 
        name: 'Sandwich Platter', 
        price: 8.50, 
        quantity: 8, 
        category: 'Lunch', 
        expiry_date: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), 
        image: '🥪',
        description: 'Assorted sandwiches with turkey, ham, and vegetarian options'
      },
      { 
        name: 'Fresh Salad Bowl', 
        price: 6.99, 
        quantity: 15, 
        category: 'Healthy', 
        expiry_date: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), 
        image: '🥗',
        description: 'Mixed greens with cherry tomatoes, cucumbers, and house dressing'
      },
      { 
        name: 'Bakery Pastries', 
        price: 3.50, 
        quantity: 20, 
        category: 'Dessert', 
        expiry_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), 
        image: '🥐',
        description: 'Fresh croissants, danishes, and sweet pastries'
      },
      { 
        name: 'Soup of the Day', 
        price: 4.99, 
        quantity: 10, 
        category: 'Dinner', 
        expiry_date: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(), 
        image: '🍲',
        description: 'Today\'s special: Creamy tomato basil soup'
      },
      { 
        name: 'Chicken Wrap', 
        price: 7.99, 
        quantity: 9, 
        category: 'Fast Food', 
        expiry_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), 
        image: '🌯',
        description: 'Grilled chicken wrap with lettuce, tomatoes, and ranch dressing'
      },
      { 
        name: 'Fresh Fruit Bowl', 
        price: 5.50, 
        quantity: 14, 
        category: 'Healthy', 
        expiry_date: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(), 
        image: '🍓',
        description: 'Seasonal mixed fruits: strawberries, blueberries, melon, and grapes'
      },
      { 
        name: 'Pasta Carbonara', 
        price: 9.99, 
        quantity: 6, 
        category: 'Dinner', 
        expiry_date: new Date(Date.now() + 16 * 60 * 60 * 1000).toISOString(), 
        image: '🍝',
        description: 'Creamy pasta with bacon, parmesan, and black pepper'
      },
      { 
        name: 'Fresh Muffins', 
        price: 2.99, 
        quantity: 18, 
        category: 'Dessert', 
        expiry_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), 
        image: '🧁',
        description: 'Assorted flavors: blueberry, chocolate chip, and banana nut'
      },
      { 
        name: 'Grilled Chicken', 
        price: 11.99, 
        quantity: 7, 
        category: 'Dinner', 
        expiry_date: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(), 
        image: '🍗',
        description: 'Herb-marinated grilled chicken breast with sides'
      },
      { 
        name: 'Vegetable Stir Fry', 
        price: 6.50, 
        quantity: 11, 
        category: 'Vegetarian', 
        expiry_date: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(), 
        image: '🥦',
        description: 'Fresh mixed vegetables stir-fried with soy sauce'
      },
      { 
        name: 'Burrito Bowl', 
        price: 8.99, 
        quantity: 13, 
        category: 'Lunch', 
        expiry_date: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), 
        image: '🌮',
        description: 'Rice, beans, grilled chicken, cheese, and salsa'
      },
      { 
        name: 'Sushi Platter', 
        price: 12.99, 
        quantity: 5, 
        category: 'Ready-to-eat', 
        expiry_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), 
        image: '🍣',
        description: 'Assorted sushi rolls: California, spicy tuna, and salmon'
      },
      { 
        name: 'Chocolate Chip Cookies', 
        price: 3.99, 
        quantity: 24, 
        category: 'Dessert', 
        expiry_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), 
        image: '🍪',
        description: 'Freshly baked soft chocolate chip cookies'
      },
      { 
        name: 'Caesar Salad', 
        price: 7.50, 
        quantity: 10, 
        category: 'Healthy', 
        expiry_date: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), 
        image: '🥬',
        description: 'Classic Caesar salad with romaine, parmesan, and croutons'
      },
    ];

    try {
      const itemsToInsert = seedItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        expiry_date: item.expiry_date,
        image: item.image,
        description: item.description,
        vendor_id: profile.id,
        is_active: true
      }));

      const { error } = await supabase
        .from('food_items')
        .insert(itemsToInsert);

      if (error) throw error;
      
      alert('✅ 15 sample food items added successfully!');
      fetchVendorItems();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error adding seed data: ' + error.message);
    }
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
            Vendor Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage your surplus food listings
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSeedData}
            type="button"
            style={{
              padding: '12px 24px',
              background: 'rgba(139, 92, 246, 0.2)',
              color: '#a78bfa',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease',
              zIndex: 100,
              position: 'relative',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            🌱 Add Seed Data
          </button>
          <button
            onClick={() => setShowForm(true)}
            type="button"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
              color: 'white',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease',
              zIndex: 100,
              position: 'relative',
              pointerEvents: 'auto'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            + Add New Item
          </button>
        </div>
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
            {vendorItems.length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Active Listings</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#f59e0b', fontSize: '2rem', margin: '0' }}>
            {vendorItems.filter(item => item.quantity <= 3 && item.quantity > 0).length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Low Stock</p>
        </div>
        
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#ef4444', fontSize: '2rem', margin: '0' }}>
            {vendorItems.filter(item => item.quantity === 0).length}
          </h3>
          <p style={{ color: '#6b7280', margin: '0' }}>Out of Stock</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <VendorForm 
            editingItem={editingItem}
            onCancel={handleFormClose}
            onSuccess={handleFormClose}
          />
        </div>
      )}

      {/* Food Items Grid */}
      {vendorItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>
            No food items listed yet
          </h3>
          <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>
            Start by adding your first surplus food item!
          </p>
          <button
            onClick={() => setShowForm(true)}
            type="button"
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
              color: 'white',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              zIndex: 100,
              position: 'relative',
              pointerEvents: 'auto',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            Add Your First Item
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '3rem'
        }}>
          {vendorItems.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <FoodCard food={item} />
              
              {/* Edit/Delete Buttons */}
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '0.5rem'
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(item);
                  }}
                  type="button"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9))',
                    color: 'white',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    zIndex: 200,
                    position: 'relative',
                    pointerEvents: 'auto',
                    boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(59, 130, 246, 0.3)';
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  type="button"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9))',
                    color: 'white',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    zIndex: 200,
                    position: 'relative',
                    pointerEvents: 'auto',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payments Dashboard */}
      <VendorPayments />
    </div>
  );
}

export default Vendors;