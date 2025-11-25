import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Admin() {
  const [vendors, setVendors] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendors'); // 'vendors' | 'listings' | 'analytics' | 'reports'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendors with auth email
      const { data: vendorData, error: vendorError } = await supabase
        .rpc('get_vendors_with_auth'); // We'll create this SQL function below
      
      if (vendorError) throw vendorError;

      // Fetch food items
      const {  foodData, error: foodError } = await supabase
        .from('food_items')
        .select('*, profiles(full_name, location, phone)')
        .order('created_at', { ascending: false });

      if (foodError) throw foodError;

      // Fetch reports
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('*, profiles!reports_reporter_id_fkey(full_name), profiles!reports_vendor_id_fkey(full_name, business_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (reportError) console.warn('Reports fetch error:', reportError);

      setVendors(vendorData || []);
      setFoodItems(foodData || []);
      setReports(reportData || []);
    } catch (error) {
      console.error('Error fetching ', error);
      alert('Failed to load admin data. Check console.');
    } finally {
      setLoading(false);
    }
  };


  const handleVerify = async (vendorId) => {
    if (!window.confirm('✅ Approve this vendor? They will be able to add food items.')) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: true,
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
      
      await sendSMS(vendorId, 'approved');
      alert('✅ Vendor approved! SMS sent.');
      fetchData();
    } catch (error) {
      console.error('Error verifying vendor:', error);
      alert('❌ Approval failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleReject = async (vendorId) => {
    const reason = prompt('Enter reason for rejection (visible to vendor):');
    if (reason === null) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_verified: false,
          verification_status: 'rejected',
          rejection_reason: reason
        })
        .eq('id', vendorId);

      if (error) throw error;
      await sendSMS(vendorId, 'rejected', reason);
      alert('❌ Vendor rejected. SMS sent.');
      fetchData();
    } catch (error) {
      console.error('Error rejecting vendor:', error);
      alert('❌ Rejection failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleSuspend = async (vendorId, currentStatus) => {
    const isSuspended = currentStatus === 'suspended';
    const action = isSuspended ? 'unsuspend' : 'suspend';
    
    const confirmMsg = isSuspended 
      ? '⏸️ Unsuspend this vendor? They will regain access.'
      : '⚠️ Suspend this vendor? They cannot add food until reinstated.';
      
    if (!window.confirm(confirmMsg)) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: isSuspended ? 'verified' : 'suspended',
          suspended_at: isSuspended ? null : new Date().toISOString()
        })
        .eq('id', vendorId);

      if (error) throw error;
      await sendSMS(vendorId, isSuspended ? 'unsuspended' : 'suspended');
      fetchData();
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
      alert(`❌ ${action.charAt(0).toUpperCase() + action.slice(1)} failed: ${error.message}`);
    }
  };

  const handleDeleteListing = async (listingId, vendorId) => {
    if (!window.confirm('🗑️ Delete this food listing? This cannot be undone.')) return;
    
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      
    
      await sendSMS(vendorId, 'listing_deleted');
      alert('✅ Listing deleted!');
      fetchData();
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('❌ Deletion failed: ' + (error.message || 'Unknown error'));
    }
  };

  const sendSMS = async (vendorId, type, reason = '') => {
    try {
      await fetch('/api/admin-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId, type, reason })
      });
    } catch (err) {
      console.warn('SMS notification failed (non-critical)', err);
    }
  };

  // Filter vendors
  const pendingVendors = vendors.filter(v => 
    v.verification_status === 'pending' || !v.verification_status
  );
  const verifiedVendors = vendors.filter(v => v.verification_status === 'verified');
  const suspendedVendors = vendors.filter(v => v.verification_status === 'suspended');
  const rejectedVendors = vendors.filter(v => v.verification_status === 'rejected');

  // 🇷🇼 Calculate impact metrics
  const totalFoodSaved = foodItems.reduce((sum, item) => 
    sum + (item.original_quantity - item.quantity), 0
  ); // kg or portions
  const co2Reduced = Math.round(totalFoodSaved * 0.5); // 0.5kg CO2 per kg food saved

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10,10,10,0.95)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>👑</div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(10,10,10,0.95)',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <div className="container" style={{ 
        padding: '2rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{ 
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            👑 Admin Dashboard
            <span style={{
              background: '#059669',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              Rwanda
            </span>
          </h1>
          
          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '4px'
          }}>
            {['vendors', 'listings', 'reports', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  background: activeTab === tab ? '#059669' : 'transparent',
                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.7)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {tab === 'vendors' ? '🛒 Vendors' : 
                 tab === 'listings' ? '🍽️ Listings' :
                 tab === 'reports' ? '⚠️ Reports' : '📊 Analytics'}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>📈 Rwanda Impact Metrics</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(45,212,191,0.08)',
                border: '1px solid rgba(45,212,191,0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#059669' }}>✅</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                  {verifiedVendors.length}
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>Verified Vendors</p>
              </div>
              
              <div style={{
                background: 'rgba(250,204,21,0.08)',
                border: '1px solid rgba(250,204,21,0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#d97706' }}>🍽️</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                  {foodItems.length}
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>Active Listings</p>
              </div>
              
              <div style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#16a34a' }}>🌍</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                  {totalFoodSaved}kg
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>Food Saved</p>
              </div>
              
              <div style={{
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                borderRadius: '16px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#2563eb' }}>🌳</div>
                <h3 style={{ margin: '0 0 0.5rem', fontSize: '2rem', fontWeight: '700' }}>
                  {co2Reduced}kg
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)' }}>CO₂ Reduced</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '16px',
              padding: '1.5rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>📍 Top Vendor Locations</h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                {[
                  { loc: 'Kigali (Gasabo)', count: 12 },
                  { loc: 'Kigali (Nyarugenge)', count: 8 },
                  { loc: 'Butare', count: 5 },
                  { loc: 'Musonoi', count: 3 },
                  { loc: 'Rubavu', count: 2 }
                ].map(({ loc, count }) => (
                  <span key={loc} style={{
                    background: 'rgba(45,212,191,0.1)',
                    color: '#059669',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem'
                  }}>
                    {loc} ({count})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <>
            {/* Pending */}
            <section style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2>⏳ Pending Verification ({pendingVendors.length})</h2>
                {pendingVendors.length > 0 && (
                  <span style={{
                    background: '#fbbf24',
                    color: '#92400e',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: '600'
                  }}>
                    Requires action
                  </span>
                )}
              </div>
              
              {pendingVendors.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem 1rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '16px'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
                  <p>No pending vendor applications</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingVendors.map(vendor => (
                    <div key={vendor.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(250,204,21,0.3)',
                      borderRadius: '16px',
                      padding: '1.5rem',
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem', color: '#fff' }}>
                          {vendor.full_name}
                        </h3>
                        <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                          📍 {vendor.location}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                          📞 {vendor.phone || 'Not provided'}
                        </p>
                        <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                          ✉️ <span style={{ fontFamily: 'monospace' }}>{vendor.email}</span>
                        </p>
                        
                        {vendor.documents && (
                          <div style={{ marginTop: '1rem' }}>
                            <p style={{ margin: '0.5rem 0', fontWeight: '600', color: '#fbbf24' }}>
                              📎 Submitted Documents:
                            </p>
                            {(vendor.documents.id_card || vendor.documents.business_license) && (
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {vendor.documents.id_card && (
                                  <a 
                                    href={vendor.documents.id_card} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#3b82f6',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    ID Card
                                  </a>
                                )}
                                {vendor.documents.business_license && (
                                  <a 
                                    href={vendor.documents.business_license} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: '#3b82f6',
                                      textDecoration: 'underline'
                                    }}
                                  >
                                    Business License
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        gap: '0.75rem'
                      }}>
                        <button
                          onClick={() => handleVerify(vendor.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #059669, #047857)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(vendor.id)}
                          style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Verified & Suspended */}
            <section style={{ marginBottom: '3rem' }}>
              <h2>✅ Verified Vendors ({verifiedVendors.length})</h2>
              {verifiedVendors.length === 0 ? (
                <p>No verified vendors yet.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {verifiedVendors.map(vendor => (
                    <div key={vendor.id} style={{
                      background: 'rgba(5,150,105,0.08)',
                      border: '1px solid rgba(5,150,105,0.3)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem' }}>{vendor.full_name}</h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                        📍 {vendor.location}
                      </p>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                        📞 {vendor.phone ? vendor.phone.replace(/(\d{3})$/, 'XXX') : 'N/A'}
                      </p>
                      <button
                        onClick={() => handleSuspend(vendor.id, 'verified')}
                        style={{
                          marginTop: '0.75rem',
                          padding: '6px 12px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        ⏸️ Suspend
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {suspendedVendors.length > 0 && (
              <section>
                <h2>⚠️ Suspended Vendors ({suspendedVendors.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {suspendedVendors.map(vendor => (
                    <div key={vendor.id} style={{
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '12px',
                      padding: '1rem'
                    }}>
                      <h4 style={{ margin: '0 0 0.5rem' }}>{vendor.full_name}</h4>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                        📅 Suspended: {vendor.suspended_at ? new Date(vendor.suspended_at).toLocaleDateString() : 'N/A'}
                      </p>
                      <button
                        onClick={() => handleSuspend(vendor.id, 'suspended')}
                        style={{
                          marginTop: '0.75rem',
                          padding: '6px 12px',
                          background: '#059669',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        ▶️ Unsuspend
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <section>
            <h2>⚠️ Vendor Reports ({reports.length})</h2>
            {reports.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <p>No reports yet. All vendors are in good standing!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reports.map(report => {
                  const statusColors = {
                    pending: { bg: 'rgba(245,158,11,0.2)', color: '#d97706', border: 'rgba(245,158,11,0.3)' },
                    reviewed: { bg: 'rgba(59,130,246,0.2)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
                    resolved: { bg: 'rgba(16,185,129,0.2)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
                    dismissed: { bg: 'rgba(107,114,128,0.2)', color: '#6b7280', border: 'rgba(107,114,128,0.3)' }
                  };
                  const statusStyle = statusColors[report.status] || statusColors.pending;

                  return (
                    <div key={report.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${statusStyle.border}`,
                      borderRadius: '16px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0, color: '#fff' }}>
                              Report #{report.id.slice(0, 8)}
                            </h3>
                            <span style={{
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                          <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                            <strong>Vendor:</strong> {report.profiles?.business_name || report.profiles?.full_name || 'Unknown'}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                            <strong>Reporter:</strong> {report.profiles?.full_name || 'Unknown'}
                          </p>
                          <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.7)' }}>
                            <strong>Reason:</strong> {report.reason}
                          </p>
                          <p style={{ margin: '0.5rem 0', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                            <strong>Description:</strong> {report.description}
                          </p>
                          <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                            📅 {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={async () => {
                                  const notes = prompt('Add admin notes (optional):');
                                  if (notes === null) return;
                                  
                                  try {
                                    const { error } = await supabase
                                      .from('reports')
                                      .update({ 
                                        status: 'reviewed',
                                        admin_notes: notes || null,
                                        updated_at: new Date().toISOString()
                                      })
                                      .eq('id', report.id);
                                    
                                    if (error) throw error;
                                    fetchData();
                                    alert('✅ Report marked as reviewed');
                                  } catch (error) {
                                    alert('❌ Error: ' + error.message);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                ✓ Review
                              </button>
                              <button
                                onClick={async () => {
                                  const action = prompt('Resolve reason (optional):');
                                  if (action === null) return;
                                  
                                  try {
                                    const { error } = await supabase
                                      .from('reports')
                                      .update({ 
                                        status: 'resolved',
                                        admin_notes: action || null,
                                        updated_at: new Date().toISOString()
                                      })
                                      .eq('id', report.id);
                                    
                                    if (error) throw error;
                                    fetchData();
                                    alert('✅ Report resolved');
                                  } catch (error) {
                                    alert('❌ Error: ' + error.message);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                ✓ Resolve
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Dismiss this report?')) return;
                                  
                                  try {
                                    const { error } = await supabase
                                      .from('reports')
                                      .update({ 
                                        status: 'dismissed',
                                        updated_at: new Date().toISOString()
                                      })
                                      .eq('id', report.id);
                                    
                                    if (error) throw error;
                                    fetchData();
                                    alert('✅ Report dismissed');
                                  } catch (error) {
                                    alert('❌ Error: ' + error.message);
                                  }
                                }}
                                style={{
                                  padding: '8px 16px',
                                  background: 'rgba(107,114,128,0.5)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {report.admin_notes && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '0.75rem',
                          background: 'rgba(59,130,246,0.1)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.8)'
                        }}>
                          <strong>Admin Notes:</strong> {report.admin_notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <section>
            <h2>🍽️ Active Food Listings ({foodItems.length})</h2>
            {foodItems.length === 0 ? (
              <p>No food listings.</p>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: '1.5rem' 
              }}>
                {foodItems.map(item => {
                  const hoursLeft = item.expiry_date 
                    ? Math.floor((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60))
                    : null;
                    
                  return (
                    <div key={item.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      padding: '1.5rem'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <h4 style={{ margin: 0 }}>{item.name}</h4>
                        <span style={{
                          background: hoursLeft <= 2 ? '#ef4444' : 
                                   hoursLeft <= 6 ? '#f59e0b' : '#059669',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '0.75rem'
                        }}>
                          {hoursLeft !== null ? `${hoursLeft}h left` : 'No expiry'}
                        </span>
                      </div>
                      
                      <p style={{ margin: '0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>
                        🏪 <strong>{item.profiles?.full_name}</strong>
                      </p>
                      <p style={{ margin: '0.5rem 0', color: 'rgba(255,255,255,0.7)' }}>
                        📍 {item.profiles?.location}
                      </p>
                      <p style={{ margin: '0.5rem 0', color: '#059669', fontWeight: '600' }}>
                        Frw {item.price.toLocaleString()} • {item.quantity} left
                      </p>
                      
                      <div style={{ 
                        display: 'flex', 
                        gap: '0.75rem',
                        marginTop: '1rem'
                      }}>
                        <a 
                          href={`/vendors/${item.vendor_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'rgba(59,130,246,0.2)',
                            color: '#3b82f6',
                            border: 'none',
                            borderRadius: '6px',
                            textAlign: 'center',
                            textDecoration: 'none'
                          }}
                        >
                          👤 View Vendor
                        </a>
                        <button
                          onClick={() => handleDeleteListing(item.id, item.vendor_id)}
                          style={{
                            padding: '8px',
                            background: 'rgba(239,68,68,0.2)',
                            color: '#ef4444',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default Admin;