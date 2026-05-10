import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('All fields are required');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>✅</div>
        <h2 style={s.title}>Welcome Back</h2>
        <p style={s.subtitle}>Sign in to Team Task Manager</p>
        {error && <div style={s.error}>⚠️ {error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Email Address</label>
          <input style={s.input} type="email" placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)} required />
          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} required />
          <button style={{...s.btn, opacity: loading ? 0.7 : 1}}
            type="submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>
        <p style={s.link}>
          Don't have an account?{' '}
          <Link to="/register" style={s.a}>Create one here</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', fontFamily: "'Segoe UI', sans-serif"
  },
  card: {
    background: 'white', borderRadius: '20px', padding: '45px 40px',
    width: '100%', maxWidth: '420px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
  },
  logo: { fontSize: '45px', textAlign: 'center', marginBottom: '12px' },
  title: {
    textAlign: 'center', color: '#1a1a2e', fontSize: '26px',
    fontWeight: '800', margin: '0 0 6px'
  },
  subtitle: {
    textAlign: 'center', color: '#888', marginBottom: '28px',
    fontSize: '14px', margin: '0 0 28px'
  },
  label: {
    display: 'block', marginBottom: '6px', color: '#444',
    fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px'
  },
  input: {
    width: '100%', padding: '12px 16px', marginBottom: '18px',
    borderRadius: '10px', border: '2px solid #eef0f4', fontSize: '15px',
    boxSizing: 'border-box', outline: 'none', transition: 'border 0.2s',
    background: '#fafbfc'
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    marginTop: '5px', letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
  },
  error: {
    background: '#fff5f5', border: '1px solid #feb2b2',
    color: '#c53030', padding: '11px 15px', borderRadius: '10px',
    marginBottom: '18px', fontSize: '14px', fontWeight: '500'
  },
  link: { textAlign: 'center', marginTop: '22px', color: '#888', fontSize: '14px' },
  a: { color: '#667eea', fontWeight: '700', textDecoration: 'none' }
};