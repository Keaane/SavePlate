import { useApp } from '../context/AppContext';

function VendorPayments() {
  const { state, dispatch } = useApp();

  // Get payments for current vendor
  const vendorPayments = state.vendorPayments.filter(
    payment => payment.vendorName === state.currentUser.name
  );

  const totalEarnings = vendorPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingEarnings = vendorPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleMarkAsPaid = (paymentId) => {
    if (window.confirm('Mark this order as completed and release payment?')) {
      dispatch({ type: 'MARK_ORDER_COMPLETED', payload: paymentId });
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
        💰 Payment Dashboard
      </h2>

      {/* Payment Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            ${totalEarnings.toFixed(2)}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Received</p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            ${pendingEarnings.toFixed(2)}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Pending Payments</p>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          color: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
            {vendorPayments.length}
          </h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Orders</p>
        </div>
      </div>

      {/* Payments Table */}
      {vendorPayments.length > 0 && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb',
            background: '#f8fafc'
          }}>
            <h3 style={{ margin: 0, color: '#374151' }}>Order History</h3>
          </div>

          <div style={{ overflow: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              minWidth: '600px'
            }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left', 
                    borderBottom: '1px solid #e5e7eb',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    Order Details
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'right', 
                    borderBottom: '1px solid #e5e7eb',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    Amount
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #e5e7eb',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    Status
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    borderBottom: '1px solid #e5e7eb',
                    color: '#374151',
                    fontWeight: '600'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {vendorPayments.map(payment => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <strong style={{ color: '#1f2937' }}>
                          Order #{payment.orderId.toString().slice(-6)}
                        </strong>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          {new Date(payment.orderDate).toLocaleDateString()}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                          {payment.items.map(item => 
                            `${item.quantity}x ${item.name}`
                          ).join(', ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                          Platform fee: -${payment.platformFee?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </td>
                    <td style={{ 
                      padding: '1rem', 
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#10b981'
                    }}>
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        background: 
                          payment.status === 'paid' ? '#dcfce7' :
                          payment.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color:
                          payment.status === 'paid' ? '#166534' :
                          payment.status === 'pending' ? '#92400e' : '#991b1b'
                      }}>
                        {payment.status === 'paid' ? '✅ Paid' : 
                         payment.status === 'pending' ? '⏳ Pending' : '❌ Cancelled'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          style={{
                            padding: '8px 16px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Mark as Completed
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <span style={{ 
                          color: '#6b7280', 
                          fontSize: '0.875rem',
                          fontStyle: 'italic'
                        }}>
                          Paid on {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h4 style={{ 
          color: '#166534', 
          margin: '0 0 1rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          💡 How Payments Work
        </h4>
        <ul style={{ 
          color: '#166534', 
          margin: 0, 
          paddingLeft: '1.5rem',
          lineHeight: '1.6'
        }}>
          <li>Students pay via mobile money when they checkout</li>
          <li>Funds are held securely until order completion</li>
          <li>Mark orders as "Completed" to release payments to your account</li>
          <li>Platform fee: {(state.platformFee * 100).toFixed(0)}% per transaction</li>
          <li>Payments are processed every 24-48 hours</li>
        </ul>
      </div>
    </div>
  );
}

export default VendorPayments;