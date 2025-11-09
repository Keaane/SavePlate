import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function VendorsList() {
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
        .order('full_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>
          Our Partner Vendors
        </h1>
        <p style={{ color: '#6b7280' }}>
          Discover local restaurants and stores offering surplus food
        </p>
      </div>

      {/* Vendors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem'
      }}>
        {vendors.map(vendor => (
          <div key={vendor.id} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            {/* Vendor Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div>
                <h3 style={{ 
                  margin: '0 0 0.5rem 0', 
                  color: '#1f2937',
                  fontSize: '1.3rem'
                }}>
                  {vendor.full_name}
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📍 {vendor.location || 'Location not specified'}
                </p>
              </div>
              
              {/* Verification Badge */}
              {vendor.is_verified && (
                <div style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  ✓ Verified
                </div>
              )}
            </div>

            {/* Vendor Description */}
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              Partner vendor offering quality surplus food to reduce waste and help the community.
            </p>

            {/* Contact Info */}
            <div style={{
              background: '#f3f4f6',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ 
                margin: 0, 
                color: '#374151',
                fontWeight: '500'
              }}>
                {vendor.phone ? `📞 ${vendor.phone}` : 'Contact vendor for details'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {vendors.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#6b7280', marginBottom: '1rem' }}>
            No vendors available yet
          </h3>
          <p style={{ color: '#9ca3af' }}>
            Check back later for new vendor partnerships.
          </p>
        </div>
      )}
    </div>
  );
}

export default VendorsList;