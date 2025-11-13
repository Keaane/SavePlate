export default function SearchBar({ 
  onSearch, 
  onFilter, 
  onLocationFilter,
  priceFilter = null,
  expiryFilter = null
}) {
  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <h3 style={{ margin: '0 0 1rem', color: '#1f2937' }}>
        🔍 Search Food
      </h3>
      
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Food name, vendor..."
            onChange={(e) => onSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Kigali, Butare"
            onChange={(e) => onLocationFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          />
        </div>
      </div>
    </div>
  );
}