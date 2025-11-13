import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import VendorForm from '../components/VendorForm';
import FoodCard from '../components/FoodCard';
import VendorPayments from '../components/VendorPayments';
import { deactivateExpiredItems } from '../utils/expiryHandler';

function Vendors() {
  const { profile } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendorItems = useCallback(async () => {
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
  }, [profile]);

  useEffect(() => {
    deactivateExpiredItems();
    fetchVendorItems();
    
    const interval = setInterval(() => {
      deactivateExpiredItems();
      fetchVendorItems();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchVendorItems]);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('🗑️ Delete this item? Students won\'t see it anymore.')) return;
    
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchVendorItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('❌ Deletion failed. Try again.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchVendorItems();
  };

  const handleSeedData = async () => {
    if (!profile) return;
    
    if (!window.confirm('🌱 Add 15 sample food items in RWF? (Kigali locations, moto delivery)')) return;
    
    const seedItems = [
      { name: 'Pizza Slices', price: 1500, quantity: 12, category: 'Fast Food', image: '🍕', location: 'Kigali, Gasabo' },
      { name: 'Sandwich Pack', price: 2500, quantity: 8, category: 'Lunch', image: '🥪', location: 'Kigali, Nyarugenge' },
      { name: 'Fruit Salad', price: 2000, quantity: 15, category: 'Healthy', image: '🥗', location: 'Kigali, Kicukiro' },
      { name: 'Croissants', price: 800, quantity: 20, category: 'Bakery', image: '🥐', location: 'Butare' },
      { name: 'Soup & Bread', price: 1800, quantity: 10, category: 'Dinner', image: '🍲', location: 'Kigali, Gasabo' },
      { name: 'Chicken Wrap', price: 2200, quantity: 9, category: 'Fast Food', image: '🌯', location: 'Kigali, Nyarugenge' },
      { name: 'Mixed Fruit Bowl', price: 1600, quantity: 14, category: 'Healthy', image: '🍓', location: 'Kigali, Kicukiro' },
      { name: 'Pasta Meal', price: 3000, quantity: 6, category: 'Dinner', image: '🍝', location: 'Butare' },
      { name: 'Muffins', price: 700, quantity: 18, category: 'Bakery', image: '🧁', location: 'Kigali, Gasabo' },
      { name: 'Grilled Chicken', price: 3500, quantity: 7, category: 'Dinner', image: '🍗', location: 'Kigali, Nyarugenge' },
      { name: 'Veg Stir Fry', price: 2000, quantity: 11, category: 'Vegetarian', image: '🥦', location: 'Kigali, Kicukiro' },
      { name: 'Burrito Bowl', price: 2700, quantity: 13, category: 'Lunch', image: '🌮', location: 'Butare' },
      { name: 'Sushi Set', price: 4000, quantity: 5, category: 'Ready-to-eat', image: '🍣', location: 'Kigali, Gasabo' },
      { name: 'Cookies', price: 600, quantity: 24, category: 'Bakery', image: '🍪', location: 'Kigali, Nyarugenge' },
      { name: 'Caesar Salad', price: 2400, quantity: 10, category: 'Healthy', image: '🥬', location: 'Kigali, Kicukiro' },
    ].map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      category: item.category,
      expiry_date: new Date(Date.now() + Math.floor(Math.random() * 48) * 60 * 60 * 1000).toISOString(),
      image: item.image,
      description: `Fresh surplus food from ${profile.full_name}'s kitchen`,
      vendor_id: profile.id,
      is_active: true,
      location: item.location
    }));

    try {
      const { error } = await supabase.from('food_items').insert(seedItems);
      if (error) throw error;
      alert('✅ 15 sample items added (RWF pricing, Rwanda locations)');
      fetchVendorItems();
    } catch (error) {
      console.error('Error seeding ', error);
      alert('❌ Seed failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,10,10,0.95)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏪</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Stats
  const totalListings = vendorItems.length;
  const lowStock = vendorItems.filter(item => item.quantity > 0 && item.quantity <= 3).length;
  const outOfStock = vendorItems.filter(item => item.quantity === 0).length;
  const todayExpired = vendorItems.filter(item => 
    item.expiry_date && new Date(item.expiry_date) <= new Date()
  ).length;

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem 4rem'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '2.2rem',
            fontWeight: '800',
            color: '#fff'
          }}>
            Vendor Dashboard
          </h1>
          <p style={{ 
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1.1rem'
          }}>
            Manage surplus food • Support community • Earn extra income 🇷🇼
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeedData}
            style={{
              padding: '12px 20px',
              background: 'rgba(107, 114, 128, 0.2)',
              color: '#9ca3af',
              border: '1px solid rgba(107, 114, 128, 0.3)',
              borderRadius: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.3s ease'
            }}
          >
            🌱 Seed Data (RWF)
          </button>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700',
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            + Add Food Item
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem'
      }}>
        {[
          { label: 'Active Listings', value: totalListings, color: '#059669', icon: '🍽️' },
          { label: 'Low Stock', value: lowStock, color: '#f59e0b', icon: '⚠️' },
          { label: 'Out of Stock', value: outOfStock, color: '#ef4444', icon: '❌' },
          { label: 'Expired Today', value: todayExpired, color: '#8b5cf6', icon: '⏰' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <h3 style={{ 
              color: stat.color, 
              fontSize: '2rem', 
              margin: '0 0 0.25rem',
              fontWeight: '700'
            }}>
              {stat.value}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '0.95rem' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{
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
        }}>
          <div style={{
            background: 'rgba(10,10,10,0.95)',
            borderRadius: '20px',
            border: '1px solid rgba(45,212,191,0.2)',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <VendorForm 
              editingItem={editingItem}
              onCancel={handleFormClose}
              onSuccess={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* Food Items Grid */}
      {vendorItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏪</div>
          <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
            No food items listed
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
            Add surplus food to help students and earn extra income!
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontWeight: '700'
            }}
          >
            + Add Your First Item
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
              <FoodCard food={item} />
              
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
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(14, 165, 233, 0.3)'
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
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payments */}
      <VendorPayments />
    </div>
  );
}

export default Vendors;