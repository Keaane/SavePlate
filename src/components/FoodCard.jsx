import { useState, useEffect } from 'react';

export default function FoodCard({ food }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!food.expiry_date) return 'N/A';
      
      const now = new Date();
      const expiry = new Date(food.expiry_date);
      const diff = expiry - now;
      
      if (diff <= 0) return 'EXPIRED';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${hours}h ${minutes}m`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);

    return () => clearInterval(timer);
  }, [food.expiry_date]);

  const isExpired = timeLeft === 'EXPIRED';
  const isOutOfStock = food.quantity === 0;

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: isExpired ? '2px solid #ef4444' : '1px solid #e5e7eb',
      opacity: (isExpired || isOutOfStock) ? 0.7 : 1
    }}>
      {/* Expiry Timer */}
      <div style={{
        background: isExpired 
          ? '#fee2e2' 
          : isOutOfStock 
          ? '#f3f4f6' 
          : '#ffedd5',
        color: isExpired ? '#ef4444' : isOutOfStock ? '#6b7280' : '#9a3412',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        marginBottom: '1rem',
        border: `1px solid ${isExpired ? '#fecaca' : isOutOfStock ? '#d1d5db' : '#fed7aa'}`
      }}>
        ⏰ {isExpired ? 'EXPIRED' : isOutOfStock ? 'OUT OF STOCK' : `Expires in: ${timeLeft}`}
      </div>

      {/* Food Info */}
      <h3 style={{ margin: '0 0 0.75rem', color: '#1f2937' }}>
        {food.name}
      </h3>
      
      <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>
        <strong>Price:</strong> Frw {food.price.toLocaleString()}
      </p>
      
      <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>
        <strong>📍 Location:</strong> {food.vendorLocation || 'Kigali'}
      </p>
      
      <p style={{ 
        margin: '0.5rem 0', 
        color: '#059669', 
        fontWeight: '600',
        fontSize: '1.1rem'
      }}>
        📞 <strong>{food.vendorPhone || 'Contact vendor'}</strong>
      </p>
      
      {food.quantity <= 3 && food.quantity > 0 && (
        <p style={{ color: '#dc2626', fontWeight: '500', margin: '0.5rem 0' }}>
          ⚠️ Only {food.quantity} left!
        </p>
      )}

      {/* Contact Button */}
      <button 
        onClick={() => {
          if (food.vendorPhone) {
            alert(`📞 Call ${food.vendorPhone} to order ${food.name}!\n\n📍 Pickup at: ${food.vendorLocation}`);
          } else {
            alert('Vendor phone not available. Check back later.');
          }
        }}
        disabled={isExpired || isOutOfStock}
        style={{
          background: (isExpired || isOutOfStock) 
            ? '#d1d5db' 
            : '#059669',
          color: 'white',
          border: 'none',
          padding: '12px',
          borderRadius: '8px',
          fontWeight: '600',
          cursor: (isExpired || isOutOfStock) ? 'not-allowed' : 'pointer',
          width: '100%',
          marginTop: '1rem',
          fontSize: '1rem'
        }}
      >
        {isExpired ? '❌ Expired' : 
         isOutOfStock ? '🚫 Out of Stock' : '📞 Contact Vendor'}
      </button>
    </div>
  );
}