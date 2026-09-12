import React, { useState } from 'react';
import { API_BASE_URL } from '../config';


export default function Profile({ user, onUpdatePreferences, logout }) {
  const [preferences, setPreferences] = useState(user ? user.preferences || '' : '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, preferences })
      });
      if (res.ok) {
        onUpdatePreferences(preferences);
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Profile Settings</h2>
        
        <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOGGED IN AS</span>
          <h2 style={{ color: 'white', marginTop: '0.25rem' }}>{user.username}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Default Travel Preferences</label>
            <textarea
              className="input-field"
              rows="4"
              placeholder="e.g. Vegetarian diet, luxury hotels, interest in museum hops, travel style is slow..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              These preferences will automatically suggest activities and filters throughout the app.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sign Out
            </button>
          </div>

          {success && (
            <p style={{ color: 'var(--color-success)', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              ✓ Preferences updated successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
