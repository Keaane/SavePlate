import { useState } from 'react';

function SearchBar({ onSearch, onFilter, onLocationFilter, onPriceFilter, onExpiryFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState('all');

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    onFilter(value);
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocationFilter(value);
    if (onLocationFilter) onLocationFilter(value);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPriceFilter(value);
    if (onPriceFilter) onPriceFilter(value);
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value;
    setExpiryFilter(value);
    if (onExpiryFilter) onExpiryFilter(value);
  };

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        alignItems: 'end'
      }}>
        {/* Search Input */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Search Food Items
          </label>
          <input
            type="text"
            placeholder="Search by food name, vendor, or category..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#10b981';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        {/* Filter Dropdown */}
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: '#374151'
          }}>
            Filter by Category
          </label>
          <select
            value={filter}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              background: 'white'
            }}
          >
            <option value="all">All Categories</option>
            <option value="Ready-to-eat">Ready-to-eat</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Fruits">Fruits</option>
            <option value="Bakery">Bakery</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Location Filter */}
        {onLocationFilter && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#374151'
            }}>
              📍 Location
            </label>
            <input
              type="text"
              placeholder="Filter by location..."
              value={locationFilter}
              onChange={handleLocationChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>
        )}

        {/* Price Filter */}
        {onPriceFilter && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#374151'
            }}>
              💰 Price Range
            </label>
            <select
              value={priceFilter}
              onChange={handlePriceChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="all">All Prices</option>
              <option value="0-5">$0 - $5</option>
              <option value="5-10">$5 - $10</option>
              <option value="10-15">$10 - $15</option>
              <option value="15+">$15+</option>
            </select>
          </div>
        )}

        {/* Expiry Filter */}
        {onExpiryFilter && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: '#374151'
            }}>
              ⏰ Expires In
            </label>
            <select
              value={expiryFilter}
              onChange={handleExpiryChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'white'
              }}
            >
              <option value="all">Any Time</option>
              <option value="1h">Within 1 hour</option>
              <option value="6h">Within 6 hours</option>
              <option value="24h">Within 24 hours</option>
              <option value="48h">Within 48 hours</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;