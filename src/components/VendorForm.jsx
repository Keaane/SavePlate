import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function VendorForm({ editingItem, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    location: editingItem?.location || 'Kigali',
    phone: editingItem?.phone || '',
    delivery_available: editingItem?.delivery_available !== false,
    delivery_fee: editingItem?.delivery_fee || 500
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ FIXED: Correct Supabase auth syntax
      const {  { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not logged in');

      const updateData = {
        location: formData.location.trim(),
        phone: formData.phone.trim(),
        delivery_available: formData.delivery_available,
        delivery_fee: formData.delivery_available ? parseInt(formData.delivery_fee) : 0,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', editingItem?.id || user.id);

      if (error) throw error;
      
      alert('✅ Profile updated successfully!');
      onSuccess();
    } catch (err) {
      alert('❌ Failed to save: ' + (err.message || 'Unknown error'));
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '2rem',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ 
        margin: '0 0 1.5rem', 
        color: '#1f2937',
        fontSize: '1.8rem'
      }}>
        {editingItem ? 'Edit Profile' : 'Complete Your Profile'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📍 Location (for pickup)
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData({...formData, location: e.target.value})}
            placeholder="e.g. Kigali, Kimironko"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#6b7280', 
            marginTop: '0.5rem'
          }}>
            Where students will pick up food
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '600',
            color: '#374151'
          }}>
            📞 Phone Number (for orders)
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            placeholder="e.g. 0788123456"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem'
            }}
          />
          <p style={{ 
            fontSize: '0.85rem', 
            color: '#6b7280', 
            marginTop: '0.5rem'
          }}>
            Students will call/text you to arrange orders
          </p>
        </div>

        <div style={{ 
          marginBottom: '1.5rem', 
          padding: '1rem',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #dbeafe'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: '600',
            color: '#1e40af'
          }}>
            <input
              type="checkbox"
              checked={formData.delivery_available}
              onChange={e => setFormData({...formData, delivery_available: e.target.checked})}
              style={{ 
                marginRight: '10px',
                width: '18px',
                height: '18px'
              }}
            />
            🏍️ Offer moto delivery?
          </label>
          
          {formData.delivery_available && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '500'
              }}>
                Delivery Fee (RWF)
              </label>
              <input
                type="number"
                value={formData.delivery_fee}
                onChange={e => setFormData({...formData, delivery_fee: e.target.value})}
                min="0"
                step="100"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#6b7280',
                marginTop: '0.3rem'
              }}>
                Typical: Frw 300-1,000 (Kigali), Frw 500-2,000 (outside)
              </p>
            </div>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem',
          marginTop: '2rem'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#94a3b8' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Saving...' : '✅ Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}