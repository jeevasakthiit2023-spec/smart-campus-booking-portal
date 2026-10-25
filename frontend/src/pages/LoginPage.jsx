import React, { useState } from 'react';
import { LogIn, KeyRound, User, Sparkles, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

export default function LoginPage({ onLoginSuccess, onNavigateToRegister, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username || !password) {
      setErrorMsg('Please enter both your username and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.login(username, password);
      showToast(res.message || 'Logged in successfully!', 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoUser, demoPass) => {
    setUsername(demoUser);
    setPassword(demoPass);
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      const res = await authService.login(demoUser, demoPass);
      showToast(`Welcome! Signed in as ${res.user.first_name || demoUser}`, 'success');
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMsg(err.message || 'Quick login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2rem auto' }}>
      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary) 0%, #38bdf8 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            Portal Sign In
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Access campus labs, equipment reservations, and approvals.
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              borderRadius: 'var(--radius-sm)',
              color: '#fecdd3',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username / Campus ID</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. jeeva_student or admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-cyan)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} />
            <span>One-Click Demo Test Accounts</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemoLogin('jeeva_student', 'student123')}
            >
              <span>🎓 Student: <strong>Jeevasakthi</strong></span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>student123</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemoLogin('prof_sundar', 'faculty123')}
            >
              <span>👨‍🏫 Faculty: <strong>Prof. Sundar</strong></span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>faculty123</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemoLogin('admin', 'admin123')}
            >
              <span>🏛️ Lab Admin: <strong>Dr. Ramanathan</strong></span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>admin123</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateToRegister}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-cyan)',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
}
