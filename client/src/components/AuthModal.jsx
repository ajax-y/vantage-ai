import React, { useState } from 'react';
import { API_BASE_URL } from '../config';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!fullName || !email) {
        setError('Please fill in all registration fields');
        return;
      }
    }

    setLoading(true);
    const url = isRegister ? `${API_BASE_URL}/api/register` : `${API_BASE_URL}/api/login`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isRegister) {
        alert('Account created successfully! Please sign in with your credentials.');
        setIsRegister(false);
        // Clear registration helper states
        setFullName('');
        setEmail('');
        setConfirmPassword('');
      } else {
        onLoginSuccess({ username: data.username, preferences: data.preferences });
        onClose();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)', textAlign: 'center', color: 'white' }}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>

        {error && (
          <div style={{ color: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  className="input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              required
              placeholder="Enter username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="input-field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }} onClick={toggleMode}>
                Sign In
              </span>
            </p>
          ) : (
            <p>
              New to Vantage AI?{' '}
              <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: '600' }} onClick={toggleMode}>
                Register Now
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
