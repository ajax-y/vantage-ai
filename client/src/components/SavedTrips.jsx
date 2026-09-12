import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';


export default function SavedTrips({ user, setActiveTrip, setTab }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTrips = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/trips?username=${encodeURIComponent(user.username)}`);
      const data = await res.json();
      setTrips(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved trip?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/trips/${id}`, { method: 'DELETE' });
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectTrip = (trip) => {
    setActiveTrip(trip);
    setTab('planner');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Your Saved Trips</h2>

        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Loading saved itineraries...</div>}

        {!loading && trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
            <p>No saved trips found.</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setTab('planner')}>
              Plan a New Trip
            </button>
          </div>
        )}

        {!loading && trips.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}
                onClick={() => handleSelectTrip(trip)}
              >
                <div>
                  <h3 style={{ color: 'white' }}>{trip.destination}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span>Budget: {trip.budget}</span>
                    <span>•</span>
                    <span>Duration: {trip.duration} Days</span>
                    <span>•</span>
                    <span>Saved: {new Date(trip.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => handleSelectTrip(trip)}>
                    Load Itinerary
                  </button>
                  <button className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', border: 'none', borderRadius: '8px' }} onClick={(e) => handleDelete(trip.id, e)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
