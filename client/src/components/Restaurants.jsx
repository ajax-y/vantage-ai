import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';


export default function Restaurants({ activeDestination }) {
  const [destination, setDestination] = useState(activeDestination || 'Paris');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRestaurants = async (dest) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/restaurants?destination=${encodeURIComponent(dest)}`);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchRestaurants(destination);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRestaurants(destination);
  };

  return (
    <div>
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Local Dining & Restaurants</h2>
        <form onSubmit={handleSubmit} className="responsive-form">
          <input
            type="text"
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Search dining by city..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Find Restaurants</button>
        </form>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Searching dining recommendations...</div>}

      {!loading && (
        <div className="cards-grid">
          {restaurants.map((restaurant) => (
            <div key={restaurant.id} className="glass-panel card" style={{ minHeight: '220px' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="card-badge">{restaurant.cuisine}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--color-accent)' }}>★ {restaurant.rating}</span>
                </div>
                <h3 style={{ margin: '0.5rem 0' }}>{restaurant.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', flex: 1 }}>{restaurant.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Average Price: <strong style={{ color: 'var(--text-primary)' }}>{restaurant.price}</strong></span>
                  <a
                    href={restaurant.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}
                  >
                    Maps & Directions 📍
                  </a>
                </div>
              </div>
            </div>
          ))}
          {restaurants.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>No restaurants found. Try searching a destination.</div>}
        </div>
      )}
    </div>
  );
}
