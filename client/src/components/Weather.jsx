import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';


export default function Weather({ activeDestination }) {
  const [destination, setDestination] = useState(activeDestination || 'Paris');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (dest) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/weather?destination=${encodeURIComponent(dest)}`);
      const data = await res.json();
      setWeather(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (destination) {
      fetchWeather(destination);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWeather(destination);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Weather Forecasts</h2>
        <form onSubmit={handleSubmit} className="responsive-form">
          <input
            type="text"
            className="input-field"
            style={{ flex: 1 }}
            placeholder="Enter destination (e.g. Paris, Tokyo, New York)..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Get Forecast</button>
        </form>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Fetching weather intelligence...</div>}

      {weather && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <span className="card-badge" style={{ marginBottom: '0.5rem' }}>CURRENTLY IN {destination.toUpperCase()}</span>
              <h1 style={{ fontSize: '3rem', margin: '0.5rem 0' }}>{weather.temp}°C</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>{weather.condition}</p>
            </div>
            <div style={{ display: 'flex', gap: '3rem' }}>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem' }}>HUMIDITY</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weather.humidity}%</span>
              </div>
              <div>
                <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem' }}>WIND SPEED</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{weather.windSpeed} km/h</span>
              </div>
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '-0.5rem' }}>7-Day Outlook</h3>
          <div className="weather-outlook-grid">
            {weather.forecast.map((f, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{f.day}</span>
                <span style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.25rem 0' }}>{f.temp}°</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minHeight: '2.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.condition}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
