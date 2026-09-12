import React from 'react';

export default function Home({ setTab, user, openAuth }) {
  return (
    <div className="hero-section">
      <div className="card-badge" style={{ fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
        ✨ Powered by Advanced AI
      </div>
      <h1 className="hero-title">
        Your Next Journey, Personalized by Intelligence
      </h1>
      <p className="hero-subtitle">
        Vantage AI crafts bespoke, day-by-day travel itineraries customized to your destination, budget, and unique preferences. Access weather forecasts, curated hotel stays, and dining recommendations in one unified workspace.
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button className="btn btn-primary" onClick={() => setTab('planner')}>
          Plan Your Trip Now
        </button>
        {!user && (
          <button className="btn btn-secondary" onClick={openAuth}>
            Sign In / Register
          </button>
        )}
      </div>

      <div className="cards-grid" style={{ marginTop: '4rem', width: '100%' }}>
        <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'left', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <h3>Instant Itineraries</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Generate comprehensive daily schedules in seconds. No more endless searching and tab clutter.
          </p>
        </div>
        <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'left', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🎯</div>
          <h3>Budget Optimization</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Compare, optimize, and organize expense estimates customized specifically to your travel budget tiers.
          </p>
        </div>
        <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'left', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>🔮</div>
          <h3>Centralized Services</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Get matching hotels, popular restaurants, and real-time weather forecasts mapped automatically to your trip.
          </p>
        </div>
      </div>
    </div>
  );
}
