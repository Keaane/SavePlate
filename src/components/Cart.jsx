import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// 🔑 Configure in .env.local
const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY;
const AFRICASTALKING_USERNAME = 'sandbox'; // or your username
// API keys for backend only — never expose in frontend

function Cart({ isOpen, onClose }) {
  const { user, profile, cart, dispatch, foodItems, vendors } = useApp();
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState('mtn'); // 'mtn' | 'airtel'
  const [processingMessage, setProcessingMessage] = useState('');
  const [orderId, setOrderId] = useState(null);

  // Auto-fill phone if profile has it
  useEffect(() => {
    if (profile?.phone && checkoutStep === 'phone') {
      setPhoneNumber(profile.phone);
    }
  }, [checkoutStep, profile]);

  // Compute total in RWF (assuming your prices are in RWF)
  const totalAmount = cart.reduce((sum, item) => 
    sum + (item.price * (item.cartQuantity || 1)), 0
  );

  // 🇷🇼 Rwandan phone validation: +2507..., 07..., 7...
  const isValidRwandanPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    // Accept: +250788123456, 0788123456, 788123456
    return /^(?:\+?250|0)?7[23589]\d{7}$/.test(cleaned);
  };

  const formatRwandanPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('250')) return '+' + cleaned;
    if (cleaned.startsWith('0')) return '+250' + cleaned.substring(1);
    if (cleaned.length === 9 && cleaned.startsWith('7')) return '+250' + cleaned;
    return '+250' + (cleaned.startsWith('250') ? cleaned.substring(3) : cleaned);
  };

  const handleNext = () => {
    if (!user) {
      alert('Uzobanza kwinjira mu konti (Please sign in)');
      return;
    }
    if (cart.length === 0) {
      alert('Ikirukiro cyawe kiryari (Your cart is empty!)');
      return;
    }
    setCheckoutStep('phone');
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    
    if (!isValidRwandanPhone(phoneNumber)) {
      setPhoneError('Andika nimero ya telefoni yerekeye Rwanda (e.g. 0788123456)');
      return;
    }

    setPhoneError('');
    setCheckoutStep('confirm');
  };

  // 🇷🇼 Flutterwave Mobile Money Rwanda (via backend proxy)
  const initiatePayment = async () => {
    setCheckoutStep('processing');
    setProcessingMessage('Kugerageza kubikwa... (Initializing payment...)');

    try {
      // Backend API call (you'll create /api/pay endpoint)
      const response = await fetch('/api/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatRwandanPhone(phoneNumber),
          amount: totalAmount,
          network: mobileMoneyProvider === 'mtn' ? 'MTN' : 'AIRTEL',
          user_id: user.id,
          cart: cart.map(item => ({
            food_id: item.id,
            quantity: item.cartQuantity || 1
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Payment failed');

      setOrderId(data.order_id);
      
      // Poll for payment status (Flutterwave webhook may be delayed)
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/payment-status/${data.order_id}`);
        const statusData = await statusRes.json();
        
        if (statusData.status === 'successful') {
          clearInterval(pollInterval);
          setCheckoutStep('success');
          // Send SMS in background
          sendSMSConfirmation(data.order_id);
        } else if (statusData.status === 'failed' || statusData.status === 'cancelled') {
          clearInterval(pollInterval);
          setCheckoutStep('error');
        }
      }, 3000);

      setProcessingMessage(`Ibikwa bidasanzwe. Andika PIN y'ububiko bwawe mu telefoni (${mobileMoneyProvider.toUpperCase()})`);
    } catch (error) {
      console.error('Payment error:', error);
      setCheckoutStep('error');
    }
  };

  // 📲 Africa’s Talking SMS (via backend)
  const sendSMSConfirmation = async (orderId) => {
    try {
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formatRwandanPhone(phoneNumber),
          orderId,
          name: profile?.full_name || 'Customer',
          total: totalAmount.toLocaleString()
        })
      });
    } catch (err) {
      console.warn('SMS failed, but order succeeded', err);
    }
  };

  const resetCart = () => {
    setCheckoutStep('cart');
    onClose();
  };

  if (!isOpen) return null;

  // 🇷🇼 Vendor location helper (for pickup)
  const getVendorLocation = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor?.location || 'Kigali';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      background: 'rgba(10, 10, 10, 0.97)',
      backdropFilter: 'blur(12px)',
      boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.6)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '1px solid rgba(45, 212, 191, 0.2)', // Teal accent
      color: '#fff',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 1.5rem 1rem',
        borderBottom: '1px solid rgba(45, 212, 191, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(45, 212, 191, 0.05)'
      }}>
        <div>
          <h2 style={{ 
            margin: 0, 
            fontSize: '1.4rem', 
            fontWeight: '700',
            color: '#0f766e' // Rwandan green
          }}>
            {checkoutStep === 'cart' ? '🛒 Ikirukiro (Cart)' : 
             checkoutStep === 'phone' ? '📱 Ububiko bw\'ubutumwa (Mobile Money)' :
             checkoutStep === 'confirm' ? '✅ Gereka (Confirm)' :
             checkoutStep === 'processing' ? '⏳ Kugerageza (Processing)' :
             checkoutStep === 'success' ? '✅ Byagenze neza (Success!)' : '❌ Byarangiye (Failed)'}
          </h2>
          {checkoutStep === 'phone' && (
            <p style={{ 
              margin: '0.25rem 0 0', 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              Andika nimero ya telefoni yawe (Enter your phone number)
            </p>
          )}
        </div>
        <button
          onClick={checkoutStep === 'cart' ? onClose : () => setCheckoutStep('cart')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            color: 'rgba(45, 212, 191, 0.8)',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {checkoutStep === 'cart' && (
          <>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '1rem',
                  color: '#0f766e'
                }}>🛒</div>
                <h3 style={{ 
                  margin: '0 0 0.5rem', 
                  fontWeight: '600',
                  fontSize: '1.3rem'
                }}>
                  Ikirukiro cyawe kiryari!
                </h3>
                <p style={{ 
                  color: 'rgba(255,255,255,0.8)', 
                  lineHeight: 1.6,
                  fontSize: '1.05rem'
                }}>
                  Gera ubwo ufite amahago menshi y’ibyo bidakozwa!<br />
                  Add surplus food to save money and reduce waste!
                </p>
              </div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'rgba(45, 212, 191, 0.03)',
                    border: '1px solid rgba(45, 212, 191, 0.1)',
                    borderRadius: '14px',
                    marginBottom: '1rem',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        margin: '0 0 0.25rem', 
                        fontWeight: '600', 
                        fontSize: '1.1rem',
                        color: '#fff'
                      }}>
                        {item.name}
                      </h4>
                      <p style={{ 
                        margin: '0 0 0.25rem', 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: '0.9rem'
                      }}>
                        🏪 {item.vendor || 'Umuguzi'}
                      </p>
                      <p style={{ 
                        margin: 0, 
                        color: '#059669', 
                        fontWeight: '700',
                        fontSize: '1.05rem'
                      }}>
                        Frw {item.price.toLocaleString()} × {item.cartQuantity || 1}
                      </p>
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: '0.6rem'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem',
                        background: 'rgba(45, 212, 191, 0.1)',
                        borderRadius: '8px',
                        padding: '2px'
                      }}>
                        <button
                          onClick={() => {
                            const newQty = (item.cartQuantity || 1) - 1;
                            if (newQty < 1) {
                              dispatch({ type: 'REMOVE_FROM_CART', payload: item.id });
                            } else {
                              dispatch({ type: 'ADD_TO_CART', payload: item.id });
                            }
                          }}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          −
                        </button>
                        <span style={{ 
                          minWidth: '28px', 
                          textAlign: 'center',
                          fontWeight: '600',
                          fontSize: '1rem',
                          color: '#0f766e'
                        }}>
                          {item.cartQuantity || 1}
                        </span>
                        <button
                          onClick={() => dispatch({ type: 'ADD_TO_CART', payload: item.id })}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            background: 'rgba(45, 212, 191, 0.2)',
                            border: 'none',
                            color: '#059669',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: item.id })}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Siba (Remove)
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{ 
                  marginTop: '2rem',
                  padding: '1.25rem',
                  background: 'rgba(45, 212, 191, 0.05)',
                  borderRadius: '14px',
                  border: '1px solid rgba(45, 212, 191, 0.2)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '1.25rem',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    color: '#fff'
                  }}>
                    <span>Imodoka (Total):</span>
                    <span style={{ color: '#059669' }}>Frw {totalAmount.toLocaleString()}</span>
                  </div>
                  
                  <p style={{ 
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '1.5rem',
                    lineHeight: 1.5,
                    fontStyle: 'italic'
                  }}>
                    🇷🇼 Ubuguzi bwawe buryoheza abaguzi batuye mu Rwanda<br />
                    Your purchase supports local Rwandan food vendors.
                  </p>
                  
                  <button
                    onClick={handleNext}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(5, 150, 105, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(5, 150, 105, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.3)';
                    }}
                  >
                    📱 Kwihanganura na Mobile Money
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {checkoutStep === 'phone' && (
          <form onSubmit={handlePhoneSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                background: 'rgba(5, 150, 105, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem',
                color: '#059669'
              }}>
                📱
              </div>
              <h3 style={{ 
                margin: '0 0 0.5rem', 
                fontWeight: '700',
                color: '#fff'
              }}>
                Mobile Money (Rwanda)
              </h3>
              <p style={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}>
                Turuhuse kubikwa mu telefoni yawe. Kwemeza ubwo ukurikije amahame.
              </p>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="phone" style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#fff'
              }}>
                Nimero ya Telefoni (Phone Number)
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                placeholder="e.g. 0788123456"
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: phoneError ? '1px solid #ef4444' : '1px solid rgba(45, 212, 191, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1.1rem'
                }}
              />
              {phoneError && (
                <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  {phoneError}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#fff'
              }}>
                Ububiko (Provider)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setMobileMoneyProvider('mtn')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: mobileMoneyProvider === 'mtn' ? '#059669' : 'rgba(255,255,255,0.05)',
                    color: mobileMoneyProvider === 'mtn' ? 'white' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(45, 212, 191, 0.3)',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📶</span> MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMoneyProvider('airtel')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: mobileMoneyProvider === 'airtel' ? '#ec4899' : 'rgba(255,255,255,0.05)',
                    color: mobileMoneyProvider === 'airtel' ? 'white' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>📶</span> Airtel Money
                </button>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(5, 150, 105, 0.08)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.85)',
              marginBottom: '1.5rem'
            }}>
              <p style={{ 
                margin: '0 0 0.75rem', 
                fontWeight: '600', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: '#059669'
              }}>
                <span>ℹ️</span> Bite byagenza (How it works):
              </p>
              <ol style={{ padding: '0 1rem', margin: 0, lineHeight: 1.5 }}>
                <li style={{ marginBottom: '0.4rem' }}>Uzobona uruhushya mu telefoni yawe (You’ll get a prompt)</li>
                <li style={{ marginBottom: '0.4rem' }}>Andika PIN yawe (Enter your Mobile Money PIN)</li>
                <li>Byagenze! (Done!)</li>
              </ol>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ← Inyuma (Back)
              </button>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Erekana (Send)
              </button>
            </div>
          </form>
        )}

        {checkoutStep === 'confirm' && (
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                width: '70px', 
                height: '70px', 
                background: 'rgba(5, 150, 105, 0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '2rem',
                color: '#059669'
              }}>
                ✅
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontWeight: '700' }}>
                Gereka Igenamo (Confirm Order)
              </h3>
            </div>

            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Imodoka (Total):</span>
                <strong>Frw {totalAmount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Telefoni:</span>
                <span>{formatRwandanPhone(phoneNumber)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span>Ububiko:</span>
                <span>{mobileMoneyProvider === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}</span>
              </div>
            </div>

            <div style={{ 
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)',
              marginBottom: '1.5rem',
              borderLeft: '3px solid #059669'
            }}>
              <p style={{ margin: 0 }}>
                🇷🇼<strong> Urubuga rwawe rufite amahugurwa menshi!</strong><br />
                Your order supports local Rwandan food vendors & reduces waste.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setCheckoutStep('phone')}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                ← Inyuma
              </button>
              <button
                onClick={initiatePayment}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>📱</span> Kwihanganura
              </button>
            </div>
          </div>
        )}

        {checkoutStep === 'processing' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '4px solid rgba(5, 150, 105, 0.2)',
                borderLeftColor: '#059669',
                animation: 'spin 1.2s linear infinite'
              }}></div>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '1.5rem'
              }}>📱</div>
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              ` }} />
            </div>
            <h3 style={{ 
              margin: '0 0 1rem', 
              fontWeight: '700', 
              fontSize: '1.4rem',
              color: '#fff'
            }}>
              Kugerageza kubikwa... (Processing payment...)
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '1.1rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              fontStyle: 'italic'
            }}>
              "{processingMessage}"
            </p>
            <div style={{
              background: 'rgba(5, 150, 105, 0.1)',
              padding: '1rem',
              borderRadius: '12px',
              fontSize: '0.95rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <p style={{ margin: 0, fontWeight: '500' }}>
                📲 <strong>Gerageza telefoni yawe!</strong><br />
                Kwemeza uruhushya rwa Mobile Money ukurikije amahame.
              </p>
            </div>
          </div>
        )}

        {checkoutStep === 'success' && orderId && (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 1.5rem',
              background: 'rgba(5, 150, 105, 0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#059669'
            }}>
              ✅
            </div>
            <h3 style={{ 
              margin: '0 0 0.5rem', 
              fontWeight: '700', 
              fontSize: '1.6rem',
              color: '#fff'
            }}>
              Byagenze neza! (Success!)
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '1.2rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              Urakoze kubahiriza abaguzi batuye mu Rwanda!<br />
              Thank you for supporting local vendors.
            </p>

            {/* 🇷🇼 Pickup QR Code */}
            <div style={{ 
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              display: 'inline-block',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#333', 
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                #SAVEPLATE-RW-{orderId.substring(0, 6).toUpperCase()}
              </div>
              <div style={{
                width: '200px',
                height: '200px',
                background: `url('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  JSON.stringify({
                    orderId,
                    phone: formatRwandanPhone(phoneNumber),
                    amount: totalAmount,
                    timestamp: new Date().toISOString()
                  })
                )}') center/contain no-repeat`
              }}></div>
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#555', 
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                Scan for pickup
              </div>
            </div>

            <div style={{
              background: 'rgba(5, 150, 105, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <h4 style={{ 
                margin: '0 0 0.75rem', 
                color: '#059669',
                fontWeight: '700'
              }}>
                Amakuru yo kuriha (Pickup Info):
              </h4>
              <ul style={{ 
                padding: '0 1rem', 
                margin: 0, 
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.9)'
              }}>
                <li><strong>Itariki (Date):</strong> {new Date().toLocaleDateString('rw-RW')}</li>
                <li><strong>Igihe (Time):</strong> 10 min (kugeza) / Within 10 min</li>
                <li><strong>Aho (Location):</strong> {getVendorLocation(cart[0]?.vendor_id) || 'Kigali'}</li>
                <li><strong>SMS:</strong> Uzobona urubuga mu SMS (You’ll get SMS confirmation)</li>
              </ul>
            </div>

            <button
              onClick={resetCart}
              style={{
                padding: '14px 2rem',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                cursor: 'pointer',
                width: '100%',
                maxWidth: '300px'
              }}
            >
              ONGERA GUHAGARARA (Shop Again)
            </button>
          </div>
        )}

        {checkoutStep === 'error' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 1.5rem',
              background: 'rgba(239,68,68,0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              color: '#ef4444'
            }}>
              ❌
            </div>
            <h3 style={{ 
              margin: '0 0 0.5rem', 
              fontWeight: '700', 
              fontSize: '1.6rem',
              color: '#fff'
            }}>
              Byarangiye (Failed)
            </h3>
            <p style={{ 
              color: 'rgba(255,255,255,0.85)', 
              fontSize: '1.1rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem'
            }}>
              Kuri byagenze ikibazo. Gerageza tena, cyangwa ushake ubufasha.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setCheckoutStep('phone')}
                style={{
                  padding: '14px 1.5rem',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Ongera (Retry)
              </button>
              <button
                onClick={resetCart}
                style={{
                  padding: '14px 1.5rem',
                  background: 'linear-gradient(135deg, #059669, #047857)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600'
                }}
              >
                Ikirukiro (Cart)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;