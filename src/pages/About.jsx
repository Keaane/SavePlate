import { useApp } from '../context/AppContext';

function Admin() {
  const { state, dispatch } = useApp();

  const pendingVendors = state.vendors.filter(v => v.verificationStatus === 'pending');
  const verifiedVendors = state.vendors.filter(v => v.verificationStatus === 'verified');

  const handleVerify = (vendorId) => {
    dispatch({ type: 'VERIFY_VENDOR', payload: { vendorId } });
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      {/* Pending Verifications */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Pending Vendor Verifications ({pendingVendors.length})</h2>
        {pendingVendors.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', margin: 0 }}>No pending vendor verifications</p>
          </div>
        ) : (
          pendingVendors.map(vendor => (
            <div key={vendor.id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{vendor.name}</h3>
                <p style={{ margin: '0', color: '#6b7280' }}>{vendor.location}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Status: <strong style={{ color: '#f59e0b' }}>Pending Review</strong>
                </p>
              </div>
              <button
                onClick={() => handleVerify(vendor.id)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Verify Vendor
              </button>
            </div>
          ))
        )}
      </section>

      {/* System Stats */}
      <section>
        <h2>System Overview</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#10b981', margin: '0' }}>{state.vendors.length}</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>Total Vendors</p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#3b82f6', margin: '0' }}>{verifiedVendors.length}</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>Verified Vendors</p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#f59e0b', margin: '0' }}>{state.foodItems.length}</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>Active Listings</p>
          </div>
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#8b5cf6', margin: '0' }}>{state.orders.length}</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>Total Orders</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Admin;