import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import VendorForm from '../components/VendorForm';

export default function Vendors() {
  const { profile, loading: appLoading } = useApp(); // ← Add appLoading
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

  const fetchVendorItems = async () => {
    // ✅ FIX: Always set loading to false, even if no profile
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVendorItems(data || []);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      setLoading(false); // ← This was already here, but now the early return is fixed
    }
  };

  useEffect(() => {
    // ✅ FIX: Wait for AppContext to finish loading before fetching items
    if (!appLoading) {
      fetchVendorItems();
    }
  }, [profile, appLoading]);

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

  const handleSeedData = async () => {
    if (!profile) return;
    if (!confirm('🌱 Add 10 sample items (RWF)?')) return;

    const items = Array.from({ length: 10 }, (_, i) => ({
      name: ['Pizza Slices', 'Fruit Salad', 'Sandwich Pack', 'Croissants', 'Soup & Bread'][i % 5],
      price: [1500, 2000, 2500, 800, 1800][i % 5],
      quantity: 5 + i,
      category: ['Fast Food', 'Healthy', 'Lunch', 'Bakery', 'Dinner'][i % 5],
      expiry_date: new Date(Date.now() + (i + 1) * 2 * 60 * 60 * 1000).toISOString(),
      description: `Fresh surplus food from ${profile.full_name || 'vendor'}`,
      vendor_id: profile.id,
      is_active: true,
      location: ['Kigali, Gasabo', 'Kigali, Nyarugenge', 'Kigali, Kicukiro', 'Butare'][i % 4]
    }));

    try {
      const { error } = await supabase.from('food_items').insert(items);
      if (error) throw error;
      alert('✅ 10 items added!');
      fetchVendorItems();
    } catch (error) {
      alert('❌ Failed: ' + error.message);
    }
  };

  // ✅ Show loading while AppContext is still initializing
  if (appLoading || loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Loading vendor dashboard...</p>
      </div>
    );
  }

  // ✅ Show message if no profile yet
  if (!profile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <p>Profile not found. Please sign in again.</p>
        <button onClick={() => navigate('/auth')} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Vendor Dashboard</h1>
          <p style={{ color: '#666', margin: 0 }}>Welcome, {profile.full_name || 'Vendor'}!</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleSeedData} style={{ padding: '8px 16px', background: '#999', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>🌱 Seed Data</button>
          <button onClick={() => setShowForm(true)} style={{ padding: '8px 16px', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Food</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Active Listings', value: vendorItems.length, color: '#059669' },
          { label: 'Low Stock', value: vendorItems.filter(i => i.quantity > 0 && i.quantity <= 3).length, color: '#f59e0b' },
          { label: 'Out of Stock', value: vendorItems.filter(i => i.quantity === 0).length, color: '#ef4444' }
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '1.8rem', color: s.color, fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px' }}>
            <VendorForm editingItem={editingItem} onCancel={handleFormClose} onSuccess={handleFormClose} />
          </div>
        </div>
      )}

      {vendorItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🍽️</div>
          <h3 style={{ marginBottom: '0.5rem' }}>No food items yet</h3>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Start by adding your first surplus food item!</p>
          <button onClick={() => setShowForm(true)} style={{ padding: '12px 24px', background: '#059669', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>+ Add Your First Item</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {vendorItems.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '8px', padding: '1.25rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem' }}>{item.name}</h3>
              <p style={{ margin: '0.5rem 0', color: '#059669', fontWeight: '600' }}>Frw {item.price.toLocaleString()}</p>
              <p style={{ margin: '0.5rem 0', color: item.quantity <= 3 ? '#ef4444' : '#666' }}>
                {item.quantity > 0 ? `${item.quantity} left` : '❌ Out of stock'}
              </p>
              <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#666' }}>📍 {item.location || 'Kigali'}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => handleEdit(item)} style={{ flex: 1, padding: '8px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>✏️ Edit</button>
                <button onClick={() => handleDelete(item.id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}>🗑️ Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', background: '#f0fdf4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#059669' }}>💡 Pro Tip</h3>
        <p style={{ margin: 0, color: '#065f46' }}>Keep your listings updated! Students search for fresh food near them.</p>
      </div>
    </div>
  );
}