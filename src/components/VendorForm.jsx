// src/components/VendorForm.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function VendorForm({ editingItem = null, onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    price: editingItem?.price || '',
    quantity: editingItem?.quantity || 1,
    category: editingItem?.category || 'Fast Food',
    description: editingItem?.description || '',
    location: editingItem?.location || 'Kigali',
    expiry_date: editingItem?.expiry_date 
      ? new Date(editingItem.expiry_date).toISOString().slice(0, 16)
      : new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString().slice(0, 16),
    image: null,
    imagePreview: editingItem?.image || null
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Handle file upload preview
  useEffect(() => {
    if (editingItem?.image) {
      setFormData(prev => ({ ...prev, imagePreview: editingItem.image }));
    }
  }, [editingItem]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imagePreview: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
 
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('Not logged in');

  let imageUrl = formData.imagePreview;
      
      // Upload image if new
      if (formData.image && formData.image instanceof File) {
        setUploading(true);
        const fileName = `${user.id}/food/${Date.now()}_${formData.image.name}`;
        const { error: uploadError } = await supabase.storage
          .from('food-images')
          .upload(fileName, formData.image);
        
        if (uploadError) throw uploadError;
        
        const {  publicUrl } = supabase.storage
          .from('food-images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
        setUploading(false);
      }

      const foodData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        expiry_date: formData.expiry_date,
        image: imageUrl,
        vendor_id: user.id,
        is_active: true
      };

      let error;
      if (editingItem) {
        ({ error } = await supabase
          .from('food_items')
          .update(foodData)
          .eq('id', editingItem.id));
      } else {
        ({ error } = await supabase
          .from('food_items')
          .insert([foodData]));
      }

      if (error) throw error;

      alert(editingItem ? '✅ Food item updated!' : '✅ Food item added!');
      onSuccess();
    } catch (err) {
      alert('❌ Error: ' + (err.message || 'Failed to save. Try again.'));
      console.error('Form error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(15,23,42,0.9)',
      borderRadius: '20px',
      border: '1px solid rgba(56,189,248,0.2)',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto'
    }}>
      <div style={{ padding: '2rem' }}>
        <h2 style={{ 
          margin: '0 0 1.5rem', 
          fontSize: '1.8rem',
          color: '#fff',
          fontWeight: '700'
        }}>
          {editingItem ? '✏️ Edit Food Item' : '➕ Add New Food Item'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
              Food Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Pizza Slices"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
              Food Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ width: '100%' }}
            />
            {formData.imagePreview && (
              <div style={{ 
                marginTop: '0.75rem', 
                textAlign: 'center',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <img 
                  src={formData.imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '200px', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
            )}
            <p style={{ 
              fontSize: '0.85rem', 
              color: 'rgba(255,255,255,0.6)',
              marginTop: '0.5rem'
            }}>
              📸 Real photos increase orders by 73% (Rwanda pilot data)
            </p>
          </div>

          {/* Price & Quantity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
                Price (RWF) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="1500"
                min="0"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({...formData, quantity: e.target.value})}
                placeholder="10"
                min="1"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white'
              }}
            >
              <option value="Fast Food">Fast Food</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Bakery">Bakery</option>
              <option value="Healthy">Healthy</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="e.g. Fresh pepperoni pizza slices, hot from the oven"
              rows="3"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Location & Expiry */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                placeholder="e.g. Kigali, Gasabo"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#94a3b8' }}>
                Expiry (Local Time)
              </label>
              <input
                type="datetime-local"
                value={formData.expiry_date}
                onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white'
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '14px',
                background: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              style={{
                flex: 1,
                padding: '14px',
                background: loading || uploading 
                  ? 'rgba(16,185,129,0.5)' 
                  : 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontWeight: '600',
                cursor: loading || uploading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {uploading ? (
                <>
                  <span>📤</span> Uploading...
                </>
              ) : loading ? (
                <>
                  <span>⏳</span> Saving...
                </>
              ) : editingItem ? (
                '✅ Update Item'
              ) : (
                '✅ Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}