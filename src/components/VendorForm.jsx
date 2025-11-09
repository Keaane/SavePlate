import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

function VendorForm({ editingItem = null, onCancel = null, onSuccess = null }) {
  const { profile } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: editingItem?.name || '',
    quantity: editingItem?.quantity || '',
    price: editingItem?.price || '',
    expiryDate: editingItem?.expiry_date ? editingItem.expiry_date.split('T')[0] : '',
    expiryTime: editingItem?.expiry_date ? editingItem.expiry_date.split('T')[1].slice(0,5) : '18:00',
    category: editingItem?.category || 'Ready-to-eat',
    description: editingItem?.description || ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Food name is required';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'Quantity must be at least 1';
    if (!formData.price || formData.price < 0) newErrors.price = 'Price must be 0 or more';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    
    const expiryDateTime = new Date(`${formData.expiryDate}T${formData.expiryTime}`);
    if (expiryDateTime <= new Date()) {
      newErrors.expiryDate = 'Expiry date must be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!profile) {
      alert('You must be logged in to add food items');
      return;
    }

    // Check if vendor is verified
    if (profile.role === 'vendor' && !profile.is_verified && profile.verification_status !== 'verified') {
      alert('⚠️ Your vendor account is pending verification. Only verified vendors can post food listings. Please wait for admin approval.');
      return;
    }

    setLoading(true);

    try {
      const expiryDateTime = `${formData.expiryDate}T${formData.expiryTime}:00`;
      
      const foodItemData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        expiry_date: expiryDateTime,
        category: formData.category,
        description: formData.description.trim() || null,
        vendor_id: profile.id,
        is_active: true,
        image: '🍽️'
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('food_items')
          .update(foodItemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('✅ Food item updated successfully!');
      } else {
        // Insert new item
        const { error } = await supabase
          .from('food_items')
          .insert([foodItemData]);

        if (error) throw error;
        alert('✅ Food item added successfully!');
      }

      // Reset form
      if (onCancel) {
        onCancel();
      } else {
        setFormData({
          name: '',
          quantity: '',
          price: '',
          expiryDate: '',
          expiryTime: '18:00',
          category: 'Ready-to-eat',
          description: ''
        });
      }

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving food item:', error);
      alert('Error saving food item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1f2937' }}>
        {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
      </h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Food Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: `2px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
            borderRadius: '6px',
            fontSize: '1rem'
          }}
          placeholder="e.g., Fresh Sandwiches"
        />
        {errors.name && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.name}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Quantity *
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            style={{
              width: '100%',
              padding: '10px',
              border: `2px solid ${errors.quantity ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
          {errors.quantity && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.quantity}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Price ($) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '10px',
              border: `2px solid ${errors.price ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
          {errors.price && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.price}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Expiry Date *
          </label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: `2px solid ${errors.expiryDate ? '#ef4444' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
          {errors.expiryDate && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>{errors.expiryDate}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Expiry Time *
          </label>
          <input
            type="time"
            name="expiryTime"
            value={formData.expiryTime}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Category
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="Ready-to-eat">Ready-to-eat</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Fruits">Fruits</option>
          <option value="Bakery">Bakery</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          style={{
            width: '100%',
            padding: '10px',
            border: '2px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem',
            resize: 'vertical'
          }}
          placeholder="Brief description of the food item..."
        />
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              border: '2px solid #6b7280',
              background: 'white',
              color: '#6b7280',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            border: 'none',
            background: loading ? '#9ca3af' : '#10b981',
            color: 'white',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Saving...' : (editingItem ? 'Update Item' : 'Add Item')}
        </button>
      </div>
    </form>
  );
}

export default VendorForm;