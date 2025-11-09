import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';

function Checkout({ onClose, onSuccess }) {
  const { profile, cart, dispatch } = useApp();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * (item.cartQuantity || 1)), 0);
  };

  const handleCheckout = async () => {
    if (!profile) {
      alert('Please log in to complete your order');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      alert('Please enter your phone number for mobile money payment');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = calculateTotal();

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            student_id: profile.id,
            total_amount: totalAmount,
            status: 'pending',
            payment_method: paymentMethod,
            payment_phone: paymentMethod === 'mobile_money' ? phoneNumber : null,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items and update food item quantities
      const orderItems = [];
      for (const item of cart) {
        const quantity = item.cartQuantity || 1;
        
        // Create order item
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert([
            {
              order_id: order.id,
              food_item_id: item.id,
              quantity: quantity,
              price: item.price,
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (itemError) throw itemError;
        orderItems.push(orderItem);

        // Update food item quantity
        const newQuantity = item.quantity - quantity;
        const { error: updateError } = await supabase
          .from('food_items')
          .update({ quantity: Math.max(0, newQuantity) })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      // Clear cart
      dispatch({ type: 'CLEAR_CART' });

      alert(`✅ Order placed successfully! Order #${order.id.slice(-8)}`);
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error placing order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(15, 15, 15, 0.95)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
            Checkout
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Order Summary */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', marginBottom: '1rem' }}>
            Order Summary
          </h3>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <span>
                  {item.name} × {item.cartQuantity || 1}
                </span>
                <span>
                  ${(item.price * (item.cartQuantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}
            <div style={{
              borderTop: '1px solid rgba(16, 185, 129, 0.2)',
              paddingTop: '0.5rem',
              marginTop: '0.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: '600',
              color: '#10b981',
              fontSize: '1.1rem'
            }}>
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '1rem'
            }}
          >
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card Payment</option>
            <option value="cash">Cash on Pickup</option>
          </select>
        </div>

        {/* Phone Number for Mobile Money */}
        {paymentMethod === 'mobile_money' && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+250 78 123 4567"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '1rem'
              }}
            />
          </div>
        )}

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || cart.length === 0
              ? 'rgba(156, 163, 175, 0.3)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: loading || cart.length === 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Processing...' : `Place Order - $${calculateTotal().toFixed(2)}`}
        </button>
      </div>
    </div>
  );
}

export default Checkout;

