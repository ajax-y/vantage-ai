import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';


export default function Hotels({ activeDestination, activeBudget }) {
  const [destination, setDestination] = useState(activeDestination || 'Paris');
  const [maxBudget, setMaxBudget] = useState(activeBudget ? activeBudget.replace(/[^0-9]/g, '') : '50000');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async (dest, bud) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels?destination=${encodeURIComponent(dest)}&budget=${encodeURIComponent(bud)}`);
      const data = await res.json();
      setHotels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchHotels(destination, maxBudget);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchHotels(destination, maxBudget);
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Find Stays & Accommodations</h2>
        <form onSubmit={handleSubmit} className="responsive-form">
          <input
            type="text"
            className="input-field"
            style={{ flex: 2, minWidth: '200px' }}
            placeholder="Search destination..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            style={{ flex: 1, minWidth: '150px' }}
            placeholder="Max Rate/Night (₹)"
            value={maxBudget}
            onChange={(e) => setMaxBudget(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Find Hotels</button>
        </form>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Scanning hotel database...</div>}

      {!loading && (
        <div className="cards-grid">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="glass-panel card">
              <img src={hotel.image} alt={hotel.name} className="card-img" />
              <div className="card-body">
                <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-badge">{hotel.price}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>★ {hotel.rating}</span>
                </div>
                <h3>{hotel.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{hotel.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>EST. RATE</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success)' }}>₹{hotel.pricePerNight.toLocaleString('en-IN')} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/ night</span></span>
                  </div>
                  <a
                    href={hotel.bookingUrl || `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    Book Stay ↗
                  </a>
                </div>
              </div>
            </div>
          ))}
          {hotels.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No lodging properties found matching this selection. Try adjusting filters or searching.</div>}
        </div>
      )}
    </div>
  );
}
