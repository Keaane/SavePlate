import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

function VendorPayments() {
  const { user, profile, dispatch, orders } = useApp();
  const [loading, setLoading] = useState(false);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter orders for current vendor
  const vendorOrders = orders.filter(order => 
    order.items?.some(item => item.vendor_id === user?.id)
  );

  // Calculate earnings
  const completedOrders = vendorOrders.filter(o => o.status === 'confirmed');
  const pendingOrders = vendorOrders.filter(o => o.status === 'pending');
  
  const totalEarnings = completedOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendor_id === user.id);
    return sum + vendorItems.reduce((s, item) => s + item.price * item.quantity, 0);
  }, 0);

  const totalDeliveryFees = completedOrders.reduce((sum, order) => {
    if (order.delivery_fee && order.vendor_id === user.id) {
      return sum + order.delivery_fee;
    }
    return sum;
  }, 0);

  const platformFeeRate = 0.1; // 10%
  const totalPlatformFees = totalEarnings * platformFeeRate;
  const netEarnings = totalEarnings + totalDeliveryFees - totalPlatformFees;

  const pendingAmount = pendingOrders.reduce((sum, order) => {
    const vendorItems = order.items.filter(item => item.vendor_id === user.id);
    return sum + vendorItems.reduce((s, item) => s + item.price * item.quantity, 0);
  }, 0) * (1 - platformFeeRate);

  // Handle payout request
  const handlePayoutRequest = async () => {
    if (!profile?.mobile_money_number && profile?.payout_method === 'mobile_money') {
      alert('Please add your Mobile Money number in profile settings.');
      return;
    }

    if (netEarnings < 1000) {
      alert('Minimum payout: Frw 1,000');
      return;
    }

    if (!window.confirm(`Withdraw Frw ${netEarnings.toLocaleString()} to your Mobile Money?`)) {
      return;
    }

    setPayoutLoading(true);
    
    try {
      // In production: call Flutterwave Payouts API
      // For demo: simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Record payout request
      const { error } = await supabase
        .from('payout_requests')
        .insert({
          vendor_id: user.id,
          amount: netEarnings,
          method: profile.payout_method,
          status: 'processing',
          mobile_money_number: profile.mobile_money_number || null,
          bank_account: profile.bank_account || null
        });

      if (error) throw error;

      // Clear "available" balance
      dispatch({ type: 'CLEAR_PAYOUT_BALANCE' }); // You’ll implement this in reducer

      setSuccessMessage(`✅ Frw ${netEarnings.toLocaleString()} sent to your Mobile Money!`);
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      alert('Payout failed. Please try again or contact support.');
      console.error('Payout error:', err);
    } finally {
      setPayoutLoading(false);
    }
  };

  // Export orders (CSV)
  const exportOrders = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Items', 'Amount (RWF)', 'Delivery', 'Status'];
    const rows = vendorOrders.map(order => {
      const items = order.items
        .filter(item => item.vendor_id === user.id)
        .map(item => `${item.quantity}x ${item.name}`)
        .join('; ');
      
      return [
        order.id.substring(0, 8),
        new Date(order.created_at).toLocaleDateString(),
        order.customer_name || 'Anonymous',
        `"${items}"`,
        Math.round(order.total_amount * (1 - platformFeeRate)),
        order.delivery_fee ? `Frw ${order.delivery_fee}` : 'Pickup',
        order.status
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `saveplate_orders_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{ color: '#1e293b', fontWeight: '700' }}>
          💰 Vendor Payment Dashboard
        </h2>
        <button
          onClick={exportOrders}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          📥 Export Orders
        </button>
      </div>

      {/* Balance Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #059669, #047857)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
        }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem', opacity: 0.9 }}>
            AVAILABLE BALANCE
          </h3>
          <p style={{ fontSize: '2rem', margin: '0', fontWeight: '800' }}>
            Frw {netEarnings.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', opacity: 0.8 }}>
            After 10% platform fee
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #6d28d9, #5b21b6)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)'
        }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem', opacity: 0.9 }}>
            PENDING PAYMENTS
          </h3>
          <p style={{ fontSize: '2rem', margin: '0', fontWeight: '800' }}>
            Frw {pendingAmount.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', opacity: 0.8 }}>
            Orders in progress
          </p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
        }}>
          <h3 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem', opacity: 0.9 }}>
            DELIVERY FEES EARNED
          </h3>
          <p style={{ fontSize: '2rem', margin: '0', fontWeight: '800' }}>
            Frw {totalDeliveryFees.toLocaleString()}
          </p>
          <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0', opacity: 0.8 }}>
            From deliveries
          </p>
        </div>
      </div>

      {/* Payout Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        marginBottom: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📲 Request Payout
        </h3>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{
            flex: 1,
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #cbd5e1'
          }}>
            <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              <strong>Payout Method:</strong>
            </p>
            <p style={{ margin: 0, fontWeight: '600' }}>
              {profile?.payout_method === 'mobile_money' ? (
                <span>
                  📱 Mobile Money ({profile?.mobile_money_number ? `...${profile.mobile_money_number.slice(-4)}` : 'Not set'})
                </span>
              ) : (
                <span>🏦 Bank Account</span>
              )}
            </p>
            <p style={{ 
              fontSize: '0.8rem', 
              color: '#94a3b8', 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              Update in Profile Settings
            </p>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handlePayoutRequest}
              disabled={payoutLoading || netEarnings < 1000}
              style={{
                padding: '12px 24px',
                background: netEarnings >= 1000 ? '#059669' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: netEarnings >= 1000 ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {payoutLoading ? (
                <>
                  <span>⏳</span> Processing...
                </>
              ) : (
                <>
                  <span>💰</span> Withdraw Frw {netEarnings.toLocaleString()}
                </>
              )}
            </button>
            {netEarnings < 1000 && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#ef4444',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Min: Frw 1,000
              </p>
            )}
          </div>
        </div>

        {successMessage && (
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: '#dcfce7',
            color: '#166534',
            borderRadius: '8px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
      </div>

      {/* Orders Table */}
      {vendorOrders.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>Recent Orders ({vendorOrders.length})</h3>
          </div>

          <div style={{ overflow: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '700px'
            }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#334155' }}>Order</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#334155' }}>Items</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#334155' }}>Amount (RWF)</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#334155' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#334155' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#334155' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendorOrders.slice(0, 10).map(order => {
                  const vendorItems = order.items.filter(item => item.vendor_id === user.id);
                  const subtotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                  const netAmount = subtotal * (1 - platformFeeRate);
                  
                  return (
                    <tr key={order.id} style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      background: order.status === 'confirmed' ? '#f0fdf4' : 'white'
                    }}>
                      <td style={{ padding: '1rem' }}>
                        <div>
                          <strong>#{order.id.substring(0, 6)}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                            {new Date(order.created_at).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                            📞 <span style={{ fontFamily: 'monospace' }}>
                              {order.phone_number ? order.phone_number.replace(/(\d{3})$/, 'XXX') : 'Hidden'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.9rem' }}>
                          {vendorItems.map(item => (
                            <div key={item.food_id}>
                              {item.quantity}x {item.name} (Frw {item.price.toLocaleString()})
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#059669'
                      }}>
                        Frw {Math.round(netAmount).toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center',
                        fontSize: '0.85rem'
                      }}>
                        {order.delivery_fee ? (
                          <span style={{ 
                            background: '#dbeafe', 
                            color: '#1d4ed8',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '500'
                          }}>
                            🏍️ Delivery (Frw {order.delivery_fee})
                          </span>
                        ) : (
                          <span style={{ 
                            background: '#dcfce7', 
                            color: '#059669',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '500'
                          }}>
                            📍 Pickup
                          </span>
                        )}
                      </td>
                      <td style={{ 
                        padding: '1rem', 
                        textAlign: 'center'
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          background: 
                            order.status === 'confirmed' ? '#dcfce7' :
                            order.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color:
                            order.status === 'confirmed' ? '#059669' :
                            order.status === 'pending' ? '#92400e' : '#dc2626'
                        }}>
                          {order.status === 'confirmed' ? '✅ Paid' : 
                           order.status === 'pending' ? '⏳ Processing' : '❌ Failed'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => {
                              // In real app: show pickup/delivery instructions
                              alert(`Contact customer at ${order.phone_number} to arrange pickup/delivery.`);
                            }}
                            style={{
                              padding: '6px 12px',
                              background: '#0ea5e9',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            📞 Contact
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {vendorOrders.length > 10 && (
            <div style={{
              padding: '1rem',
              textAlign: 'center',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={() => {/* Navigate to full orders page */}}
                style={{
                  color: '#3b82f6',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                View all orders →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info Panel */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '2rem'
      }}>
        <h4 style={{ 
          color: '#065f46', 
          margin: '0 0 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💡 How It Works for Rwanda
        </h4>
        <ul style={{ 
          color: '#065f46', 
          margin: 0, 
          paddingLeft: '1.5rem',
          lineHeight: '1.7',
          fontSize: '0.95rem'
        }}>
          <li><strong>Students pay instantly</strong> via MTN MoMo or Airtel Money</li>
          <li>Funds are held securely until you confirm order completion</li>
          <li><strong>Delivery option</strong>: Charge Frw 300–1,000 for moto delivery (set in your profile)</li>
          <li><strong>Pickup option</strong>: Students collect at your location (e.g., campus canteen, shop)</li>
          <li>Platform fee: <strong>10%</strong> (covers payment processing & app maintenance)</li>
          <li>Payouts sent to your Mobile Money <strong>within 24 hours</strong></li>
        </ul>
      </div>
    </div>
  );
}

export default VendorPayments;