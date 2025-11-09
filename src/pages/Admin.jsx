import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Admin() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'vendor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (vendorId) => {
    if (!window.confirm('Approve this vendor?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          verification_status: 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
      alert('✅ Vendor approved successfully!');
      fetchVendors(); // Refresh the list
    } catch (error) {
      console.error('Error verifying vendor:', error);
      alert('Error verifying vendor: ' + error.message);
    }
  };

  const handleReject = async (vendorId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled
    
    if (!window.confirm('Reject this vendor application?')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: false,
          verification_status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
      alert('Vendor application rejected.');
      fetchVendors();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      alert('Error rejecting vendor: ' + error.message);
    }
  };

  const handleSuspend = async (vendorId, currentStatus) => {
    const isSuspended = currentStatus === 'suspended';
    const action = isSuspended ? 'unsuspend' : 'suspend';
    
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this vendor?`)) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: isSuspended ? 'verified' : 'suspended',
          updated_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
      alert(`✅ Vendor ${action}ed successfully!`);
      fetchVendors();
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      alert(`Error ${action}ing vendor: ` + error.message);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      alert('✅ Listing deleted successfully!');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('Error deleting listing: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const pendingVendors = vendors.filter(v => v.verification_status === 'pending' || !v.verification_status);
  const verifiedVendors = vendors.filter(v => v.verification_status === 'verified');
  const suspendedVendors = vendors.filter(v => v.verification_status === 'suspended');
  const rejectedVendors = vendors.filter(v => v.verification_status === 'rejected');

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
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{vendor.full_name}</h3>
                <p style={{ margin: '0', color: '#6b7280' }}>{vendor.location}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Email: {vendor.id} {/* Using ID as email isn't stored in profiles */}
                </p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Status: <strong style={{ color: '#f59e0b' }}>Pending Review</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleVerify(vendor.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => handleReject(vendor.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Verified Vendors Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2>Verified Vendors ({verifiedVendors.length})</h2>
        {verifiedVendors.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <p style={{ color: '#6b7280', margin: 0 }}>No verified vendors</p>
          </div>
        ) : (
          verifiedVendors.map(vendor => (
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
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{vendor.full_name}</h3>
                <p style={{ margin: '0', color: '#6b7280' }}>{vendor.location}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Status: <strong style={{ color: '#10b981' }}>Verified</strong>
                </p>
              </div>
              <button
                onClick={() => handleSuspend(vendor.id, vendor.verification_status)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ⏸️ Suspend
              </button>
            </div>
          ))
        )}
      </section>

      {/* Suspended Vendors */}
      {suspendedVendors.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2>Suspended Vendors ({suspendedVendors.length})</h2>
          {suspendedVendors.map(vendor => (
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
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{vendor.full_name}</h3>
                <p style={{ margin: '0', color: '#6b7280' }}>{vendor.location}</p>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Status: <strong style={{ color: '#f59e0b' }}>Suspended</strong>
                </p>
              </div>
              <button
                onClick={() => handleSuspend(vendor.id, vendor.verification_status)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                ▶️ Unsuspend
              </button>
            </div>
          ))}
        </section>
      )}

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
            <h3 style={{ color: '#10b981', margin: '0' }}>{vendors.length}</h3>
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
            <h3 style={{ color: '#f59e0b', margin: '0' }}>{pendingVendors.length}</h3>
            <p style={{ margin: '0', color: '#6b7280' }}>Pending Vendors</p>
          </div>
          {suspendedVendors.length > 0 && (
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ef4444', margin: '0' }}>{suspendedVendors.length}</h3>
              <p style={{ margin: '0', color: '#6b7280' }}>Suspended Vendors</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Admin;