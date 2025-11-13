import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, location, is_verified, business_type')
        .eq('role', 'vendor')
        .eq('is_verified', true) // Only show verified vendors
        .order('full_name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique locations
  const locations = [...new Set(vendors.map(v => v.location).filter(Boolean))].sort();

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
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏪</div>
          <p>Loading vendors near you...</p>
        </div>
      </div>
    );
  }

  const filteredVendors = selectedLocation 
    ? vendors.filter(v => v.location === selectedLocation)
    : vendors;

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '0 1rem 4rem'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '2.5rem', 
        textAlign: 'center',
        padding: '2.5rem 0',
        background: 'rgba(250,204,21,0.05)',
        borderRadius: '16px',
        border: '1px solid rgba(250,204,21,0.1)'
      }}>
        <h1 style={{ 
          margin: '0 0 0.5rem', 
          fontSize: '2.4rem',
          fontWeight: '800',
          color: '#fff'
        }}>
          🇷🇼 Our Partner Vendors
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.2rem',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          Local restaurants & shops fighting food waste across Rwanda
        </p>
      </div>

      {/* Location Filter */}
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <label style={{ 
          color: 'rgba(255,255,255,0.8)', 
          fontWeight: '500' 
        }}>
          Location:
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '500'
          }}
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        
        {selectedLocation && (
          <button
            onClick={() => setSelectedLocation('')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Vendors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '2rem'
      }}>
        {filteredVendors.map(vendor => (
          <div key={vendor.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Header */}
            <div style={{
              background: 'rgba(5, 150, 105, 0.05)',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(45,212,191,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{ 
                    margin: '0 0 0.5rem', 
                    color: '#fff',
                    fontSize: '1.4rem'
                  }}>
                    {vendor.full_name}
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    color: 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📍 {vendor.location}
                  </p>
                </div>
                {vendor.is_verified && (
                  <div style={{
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <span>✓</span> Verified
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '1.75rem' }}>
              <p style={{ 
                color: 'rgba(255,255,255,0.7)', 
                marginBottom: '1.5rem',
                lineHeight: '1.6'
              }}>
                {vendor.business_type === 'restaurant' ? 'Restaurant' :
                 vendor.business_type === 'canteen' ? 'University Canteen' :
                 vendor.business_type === 'bakery' ? 'Bakery' :
                 vendor.business_type === 'grocery' ? 'Grocery Store' :
                 vendor.business_type === 'catering' ? 'Catering Service' : 'Vendor'} 
                offering surplus food to reduce waste in Rwanda.
              </p>

              {/* Call to Action */}
              <div style={{
                background: 'rgba(45,212,191,0.08)',
                borderRadius: '14px',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <p style={{ 
                  margin: '0 0 1rem', 
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: '500'
                }}>
                  📱 <strong>Contact for pickup/delivery</strong>
                </p>
                <p style={{ 
                  margin: 0, 
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.9rem',
                  fontStyle: 'italic'
                }}>
                  Phone number shared after placing an order
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {vendors.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</div>
          <h3 style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
            No vendors in your area yet
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            We're expanding across Rwanda! Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}

export default VendorsList;