import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Planner from './components/Planner';
import Hotels from './components/Hotels';
import Restaurants from './components/Restaurants';
import Weather from './components/Weather';
import SavedTrips from './components/SavedTrips';
import Profile from './components/Profile';
import AuthModal from './components/AuthModal';
import { API_BASE_URL } from './config';


export default function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('vantage_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('vantage_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('vantage_user');
    setTab('home');
  };

  const handleUpdatePreferences = (preferences) => {
    setUser((prev) => {
      const updated = { ...prev, preferences };
      localStorage.setItem('vantage_user', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveTrip = async (tripToSave) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...tripToSave,
          username: user.username
        })
      });
      if (res.ok) {
        alert('Trip saved successfully!');
      } else {
        alert('Failed to save trip.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend database.');
    }
  };

  // Nav link helper
  const renderNavLink = (tabName, label) => (
    <li>
      <span
        className={`nav-link ${tab === tabName ? 'active' : ''}`}
        onClick={() => setTab(tabName)}
      >
        {label}
      </span>
    </li>
  );

  return (
    <div className="app-container">
      {/* Premium Navbar */}
      <header className="navbar">
        <div className="nav-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setTab('home')}>
          <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '10px' }}>
            <circle cx="50" cy="50" r="45" stroke="url(#logo-grad)" strokeWidth="6" fill="rgba(99, 102, 241, 0.05)" />
            <path d="M50 15L62 45L92 50L62 55L50 85L38 55L8 50L38 45Z" fill="url(#logo-grad)" />
            <circle cx="50" cy="50" r="10" fill="#ffffff" />
            <defs>
              <linearGradient id="logo-grad" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
          <span>Vantage AI</span>
        </div>
        <nav>
          <ul className="nav-links">
            {renderNavLink('home', 'Home')}
            {renderNavLink('planner', 'AI Planner')}
            {renderNavLink('hotels', 'Hotels')}
            {renderNavLink('restaurants', 'Restaurants')}
            {renderNavLink('weather', 'Weather')}
            {user && renderNavLink('saved-trips', 'Saved Trips')}
            {user && renderNavLink('profile', 'Profile')}
            {!user && (
              <li>
                <span className="nav-link" onClick={() => setAuthOpen(true)} style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Sign In
                </span>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {tab === 'home' && (
          <Home
            setTab={setTab}
            user={user}
            openAuth={() => setAuthOpen(true)}
          />
        )}
        {tab === 'planner' && (
          <Planner
            user={user}
            activeTrip={activeTrip}
            setActiveTrip={setActiveTrip}
            setTab={setTab}
            onSaveTrip={handleSaveTrip}
          />
        )}
        {tab === 'hotels' && (
          <Hotels
            activeDestination={activeTrip?.destination}
            activeBudget={activeTrip?.budget}
          />
        )}
        {tab === 'restaurants' && (
          <Restaurants
            activeDestination={activeTrip?.destination}
          />
        )}
        {tab === 'weather' && (
          <Weather
            activeDestination={activeTrip?.destination}
          />
        )}
        {tab === 'saved-trips' && user && (
          <SavedTrips
            user={user}
            setActiveTrip={setActiveTrip}
            setTab={setTab}
          />
        )}
        {tab === 'profile' && user && (
          <Profile
            user={user}
            onUpdatePreferences={handleUpdatePreferences}
            logout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', background: 'var(--bg-secondary)' }}>
        <p>© 2026 Vantage AI Travel Technologies. Built with premium intelligence.</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <div className="mobile-nav-list">
          <div className={`mobile-nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
            <span className="mobile-nav-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className={`mobile-nav-item ${tab === 'planner' ? 'active' : ''}`} onClick={() => setTab('planner')}>
            <span className="mobile-nav-icon">✈️</span>
            <span>Planner</span>
          </div>
          <div className={`mobile-nav-item ${tab === 'hotels' ? 'active' : ''}`} onClick={() => setTab('hotels')}>
            <span className="mobile-nav-icon">🏨</span>
            <span>Stays</span>
          </div>
          <div className={`mobile-nav-item ${tab === 'restaurants' ? 'active' : ''}`} onClick={() => setTab('restaurants')}>
            <span className="mobile-nav-icon">🍴</span>
            <span>Dining</span>
          </div>
          <div className={`mobile-nav-item ${tab === 'weather' ? 'active' : ''}`} onClick={() => setTab('weather')}>
            <span className="mobile-nav-icon">⛅</span>
            <span>Weather</span>
          </div>
          {user ? (
            <div className={`mobile-nav-item ${tab === 'saved-trips' ? 'active' : ''}`} onClick={() => setTab('saved-trips')}>
              <span className="mobile-nav-icon">💾</span>
              <span>Saved</span>
            </div>
          ) : (
            <div className="mobile-nav-item" onClick={() => setAuthOpen(true)}>
              <span className="mobile-nav-icon">👤</span>
              <span>Login</span>
            </div>
          )}
        </div>
      </nav>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
