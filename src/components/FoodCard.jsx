import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FoodCard({ food, hideContactButton = false }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [hoursLeft, setHoursLeft] = useState(null);

  useEffect(() => {
    if (!food.expiry_date) {
      setHoursLeft(null);
      return;
    }

    const calculateTime = () => {
      const now = new Date();
      const expiry = new Date(food.expiry_date);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setHoursLeft(0);
        return;
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
        setHoursLeft(hours);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [food.expiry_date]);

  return (
    <div 
      onClick={() => navigate(`/vendors/${food.vendor_id}`)} // ← KEY CHANGE
      style={{
        background: 'rgba(15,23,42,0.6)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        cursor: 'pointer', // ← Indicates clickable
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {/* Food Image (Real or Emoji) */}
      <div style={{
        height: '180px',
        background: food.image 
          ? `url(${food.image}) center/cover no-repeat` 
          : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: food.image ? '0' : '4rem',
        color: '#fff'
      }}>
        {!food.image && (
          food.category === 'Fruits' ? '🍎' : 
          food.category === 'Vegetarian' ? '🥗' : 
          food.category === 'Bakery' ? '🥐' : 
          food.category === 'Beverages' ? '🥤' : '🍗'
        )}
      </div>

      {/* Rest of your card content */}
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: '700' }}>
          {food.name}
        </h3>
        <p style={{ color: '#10b981', fontWeight: '700', fontSize: '1.2rem' }}>
          Frw {food.price.toLocaleString()}
        </p>
        <p style={{ 
          color: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '0.75rem'
        }}>
          🏪 <span style={{ fontWeight: '500' }}>{food.profiles?.full_name || 'Vendor'}</span>
        </p>
        
        {/* Expiry & Stock */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1.25rem'
        }}>
          {hoursLeft !== null && (
            <span style={{
              background: hoursLeft <= 2 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
              color: hoursLeft <= 2 ? '#ef4444' : '#10b981',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              ⏰ {timeLeft}
            </span>
          )}
          <span style={{
            color: food.quantity <= 3 ? '#ef4444' : 'rgba(255,255,255,0.7)',
            fontWeight: food.quantity <= 3 ? '600' : 'normal'
          }}>
            {food.quantity} left
          </span>
        </div>

        {/* CTA Button — Only show if not owner's view */}
        {!hideContactButton && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // ← Prevents navigation on button click
              alert(`📞 Call ${food.profiles?.phone} to order!`);
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📞 Contact Vendor
          </button>
        )}
      </div>
    </div>
  );
}