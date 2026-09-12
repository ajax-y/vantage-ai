import React, { useState } from 'react';
import { API_BASE_URL } from '../config';


export default function Planner({ user, activeTrip, setActiveTrip, setTab, onSaveTrip }) {
  const [destination, setDestination] = useState(activeTrip ? activeTrip.destination : '');
  const [budget, setBudget] = useState(activeTrip ? activeTrip.budget.replace(/[^0-9]/g, '') : '25000');
  const [duration, setDuration] = useState(activeTrip ? activeTrip.duration : 3);
  const [preferences, setPreferences] = useState(activeTrip ? activeTrip.preferences : '');
  
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!destination || !budget) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/generate-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, budget, duration, preferences })
      });
      const data = await res.json();
      if (!data.id) {
        data.id = 'trip_' + Date.now();
      }
      setActiveTrip(data);
      setChatHistory([]);
    } catch (err) {
      console.error(err);
      alert('Failed to generate trip itinerary. Please check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeTrip) return;

    const userMsg = { role: 'user', text: chatMessage };
    setChatHistory((prev) => [...prev, userMsg]);
    const currentMsg = chatMessage;
    setChatMessage('');
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMsg,
          history: chatHistory,
          context: activeTrip
        })
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error communicating with the advisor server.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="planner-container">
      {/* Left panel: Input Form */}
      <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Plan with AI</h2>
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Paris, Tokyo, Bali"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Total Budget (INR ₹)</label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              className="input-field"
              placeholder="e.g. 30000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Duration (Days)</label>
            <input
              type="number"
              required
              min="1"
              max="15"
              className="input-field"
              placeholder="e.g. 5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || '')}
            />
          </div>

          <div className="form-group">
            <label>Preferences / Interests</label>
            <textarea
              className="input-field"
              rows="3"
              placeholder="e.g. Museums, local food, relaxing, photography"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Consulting Vantage AI...' : 'Generate Itinerary'}
          </button>
        </form>
      </div>

      {/* Right panel: Itinerary Viewer & Assistant */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading && (
          <div className="glass-panel" style={{ padding: '4rem', textCombineUpright: 'center', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: '50px', height: '50px', border: '5px solid rgba(99, 102, 241, 0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h3>Synthesizing Travel Intelligence...</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Mapping attractions, budgeting, and tailoring your day-by-day plan.</p>
          </div>
        )}

        {!loading && activeTrip && (
          <>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="card-badge">{activeTrip.budget} • {activeTrip.duration} Days</span>
                  <h1 style={{ marginTop: '0.5rem' }}>Trip to {activeTrip.destination}</h1>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" onClick={() => setTab('hotels')}>
                    Find Hotels
                  </button>
                  {user ? (
                    <button className="btn btn-primary" onClick={() => onSaveTrip(activeTrip)}>
                      Save Trip
                    </button>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Log in to save this trip</p>
                  )}
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>{activeTrip.summary || `Personalized ${activeTrip.duration || 3}-day trip to ${activeTrip.destination}.`}</p>

              {/* Budget Estimation section */}
              {activeTrip.budgetBreakdown && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Cost Estimates</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Hotel / Stay:</span>
                        <strong>₹{activeTrip.budgetBreakdown.accommodation || 0}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Food & Dining:</span>
                        <strong>₹{activeTrip.budgetBreakdown.foodAndDrinks || 0}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Activities:</span>
                        <strong>₹{activeTrip.budgetBreakdown.activities || 0}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Transport:</span>
                        <strong>₹{activeTrip.budgetBreakdown.transport || 0}</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ESTIMATED TOTAL</span>
                    <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--color-success)' }}>₹{activeTrip.budgetBreakdown.totalEstimate || 0}</span>
                    <div className="budget-meter">
                      <div className="budget-meter-fill" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline list */}
              <h3 style={{ marginBottom: '1.5rem' }}>Daily Schedule</h3>
              <div className="timeline">
                {activeTrip.itinerary.map((d) => (
                  <div key={d.day} className="timeline-item">
                    <div className="timeline-dot" />
                    <h4 style={{ color: 'white', marginBottom: '0.75rem' }}>{d.title}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem' }}>
                      <div>
                        <strong style={{ color: 'var(--color-accent)' }}>🌅 Morning:</strong> {d.morning.activity} <span style={{ color: 'var(--text-muted)' }}>(₹{d.morning.cost})</span>
                      </div>
                      <div>
                        <strong style={{ color: 'var(--color-primary)' }}>☀️ Afternoon:</strong> {d.afternoon.activity} <span style={{ color: 'var(--text-muted)' }}>(₹{d.afternoon.cost})</span>
                      </div>
                      <div>
                        <strong style={{ color: '#ec4899' }}>🌇 Evening:</strong> {d.evening.activity} <span style={{ color: 'var(--text-muted)' }}>(₹{d.evening.cost})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Travel packing tips */}
              {activeTrip.packingTips && activeTrip.packingTips.length > 0 && (
                <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--color-accent)', borderRadius: '0 8px 8px 0' }}>
                  <h4 style={{ color: 'var(--color-accent)', marginBottom: '0.5rem' }}>💡 Vantage Travel Tips</h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {activeTrip.packingTips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Chat Assistant */}
            <div className="glass-panel chat-widget">
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
                <h3>Chat Assistant</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ask questions or request modifications to this itinerary</p>
              </div>
              <div className="chat-messages">
                <div className="chat-message message-assistant">
                  Hello! I'm your Vantage travel assistant. Do you want to adjust schedules, suggest restaurants or look up hotels for this trip? All rates are simulated in INR (₹).
                </div>
                {chatHistory.map((m, idx) => (
                  <div key={idx} className={`chat-message ${m.role === 'user' ? 'message-user' : 'message-assistant'}`}>
                    {m.text}
                  </div>
                ))}
                {chatLoading && <div className="chat-message message-assistant">Planning...</div>}
              </div>
              <form onSubmit={handleSendChatMessage} className="chat-input-area">
                <input
                  type="text"
                  className="input-field"
                  style={{ flex: 1 }}
                  placeholder="Ask a question or adjust itinerary..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  disabled={chatLoading}
                />
                <button type="submit" className="btn btn-primary" disabled={chatLoading}>Send</button>
              </form>
            </div>
          </>
        )}

        {!activeTrip && !loading && (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h3>No Active Itinerary</h3>
            <p style={{ marginTop: '0.5rem' }}>Fill out the planning assistant form on the left to generate your custom travel intelligence plan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
