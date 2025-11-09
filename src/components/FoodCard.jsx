import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

function FoodCard({ food }) {
  const { dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!food.expiry_date) return 'N/A';
      
      const now = new Date();
      const expiry = new Date(food.expiry_date);
      const diff = expiry - now;
      
      if (diff <= 0) {
        return 'EXPIRED';
      }
      
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

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (food.quantity > 0 && timeLeft !== 'EXPIRED') {
      dispatch({ type: 'ADD_TO_CART', payload: food.id });
    }
  };

  const isExpired = timeLeft === 'EXPIRED';
  const isOutOfStock = food.quantity === 0;

  return (
    <div style={{
      background: 'rgba(15, 15, 15, 0.9)',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)',
      border: isExpired ? '2px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(16, 185, 129, 0.2)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'default',
      opacity: (isExpired || isOutOfStock) ? 0.6 : 1,
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    }}
    onMouseEnter={(e) => {
      if (!isExpired && !isOutOfStock) {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(16, 185, 129, 0.3)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)';
    }}
    >
      {/* Expiry Timer */}
      <div style={{
        background: isExpired 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3))' 
          : isOutOfStock 
          ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.3), rgba(75, 85, 99, 0.3))' 
          : 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(217, 119, 6, 0.3))',
        color: 'white',
        padding: '10px 14px',
        borderRadius: '12px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: '15px',
        border: `1px solid ${isExpired ? 'rgba(239, 68, 68, 0.5)' : isOutOfStock ? 'rgba(107, 114, 128, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
        boxShadow: `0 0 20px ${isExpired ? 'rgba(239, 68, 68, 0.2)' : isOutOfStock ? 'rgba(107, 114, 128, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
      }}>
        ⏰ {isExpired ? 'EXPIRED' : isOutOfStock ? 'OUT OF STOCK' : `Expires in: ${timeLeft}`}
      </div>

      {/* Food Image Placeholder */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
        height: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '12px',
        marginBottom: '15px',
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '3rem',
        border: '1px solid rgba(16, 185, 129, 0.2)'
      }}>
        {food.image || '🍽️'}
      </div>

      {/* Food Details */}
      <h3 style={{
        marginBottom: '12px',
        color: 'rgba(255, 255, 255, 0.95)',
        fontSize: '1.3rem',
        fontWeight: '700',
        letterSpacing: '-0.3px'
      }}>
        {food.name}
      </h3>
      
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontSize: '0.95rem' }}>
        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Vendor:</strong> {food.vendor || 'Unknown'}
      </p>
      
      <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px', fontSize: '0.95rem' }}>
        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Price:</strong> <span style={{ color: '#10b981', fontWeight: '600' }}>${food.price}</span>
      </p>
      
      <p style={{ 
        color: food.quantity > 3 ? 'rgba(255, 255, 255, 0.7)' : '#ff6b6b', 
        marginBottom: '8px',
        fontWeight: food.quantity <= 3 ? '600' : 'normal',
        fontSize: '0.95rem'
      }}>
        <strong style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Quantity:</strong> {food.quantity} left
        {food.quantity <= 3 && food.quantity > 0 && ' ⚠️ Low stock!'}
      </p>
      
      {food.expiry_date && (
        <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px', fontSize: '0.875rem' }}>
          <strong>Expires:</strong> {new Date(food.expiry_date).toLocaleDateString()}
        </p>
      )}

      {/* Add to Cart Button */}
      <button 
        onClick={handleAddToCart}
        disabled={isExpired || isOutOfStock}
        type="button"
        style={{
          background: (isExpired || isOutOfStock) 
            ? 'rgba(156, 163, 175, 0.3)' 
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9))',
          color: 'white',
          border: (isExpired || isOutOfStock) ? '1px solid rgba(156, 163, 175, 0.3)' : '1px solid rgba(16, 185, 129, 0.4)',
          padding: '12px 24px',
          borderRadius: '10px',
          fontWeight: '600',
          cursor: (isExpired || isOutOfStock) ? 'not-allowed' : 'pointer',
          width: '100%',
          opacity: (isExpired || isOutOfStock) ? 0.5 : 1,
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 100,
          pointerEvents: (isExpired || isOutOfStock) ? 'none' : 'auto',
          boxShadow: (isExpired || isOutOfStock) ? 'none' : '0 4px 20px rgba(16, 185, 129, 0.3)'
        }}
        onMouseEnter={(e) => {
          if (!isExpired && !isOutOfStock) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 30px rgba(16, 185, 129, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExpired && !isOutOfStock) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.3)';
          }
        }}
      >
        {isExpired ? '❌ Expired' : isOutOfStock ? '🚫 Out of Stock' : '🛒 Add to Cart'}
      </button>
    </div>
  );
}

export default FoodCard;