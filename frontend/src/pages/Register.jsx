import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name || !form.email || !form.password) return setError('All fields are required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!form.email.includes('@')) return setError('Please enter a valid email');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🚀</div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.subtitle}>Join Team Task Manager today</p>

        {error && <div style={s.error}>⚠️ {error}</div>}
        {success && <div style={s.successBox}>✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <label style={s.label}>Full Name</label>
          <input style={s.input} type="text" placeholder="John Doe"
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} required />

          <label style={s.label}>Email Address</label>
          <input style={s.input} type="email" placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})} required />

          <label style={s.label}>Password</label>
          <input style={s.input} type="password" placeholder="Min. 6 characters"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})} required />

          <label style={s.label}>Select Role</label>
          <select style={s.input} value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}>
            <option value="MEMBER">👤 Member — Can view & update tasks</option>
            <option value="ADMIN">👑 Admin — Full project control</option>
          </select>

          <div style={s.roleHint}>
            {form.role === 'ADMIN'
              ? '👑 Admin can create projects, add members and manage all tasks'
              : '👤 Member can view projects and update assigned task status'}
          </div>

          <button style={{...s.btn, opacity: loading ? 0.7 : 1}}
            type="submit" disabled={loading}>
            {loading ? '⏳ Creating Account...' : 'Create Account →'}
          </button>
        </form>

        <p style={s.link}>
          Already have an account?{' '}
          <Link to="/login" style={s.a}>Sign in here</Link>
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
    width: '100%', maxWidth: '440px',
    boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
  },
  logo: { fontSize: '45px', textAlign: 'center', marginBottom: '12px' },
  title: {
    textAlign: 'center', color: '#1a1a2e', fontSize: '26px',
    fontWeight: '800', margin: '0 0 6px'
  },
  subtitle: {
    textAlign: 'center', color: '#888',
    fontSize: '14px', margin: '0 0 28px'
  },
  label: {
    display: 'block', marginBottom: '6px', color: '#444',
    fontSize: '13px', fontWeight: '600', letterSpacing: '0.5px'
  },
  input: {
    width: '100%', padding: '12px 16px', marginBottom: '16px',
    borderRadius: '10px', border: '2px solid #eef0f4', fontSize: '15px',
    boxSizing: 'border-box', outline: 'none', background: '#fafbfc'
  },
  roleHint: {
    background: '#f0f0ff', border: '1px solid #c7d2fe',
    color: '#4338ca', padding: '10px 14px', borderRadius: '8px',
    fontSize: '13px', marginBottom: '18px', lineHeight: '1.5'
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '10px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    letterSpacing: '0.5px', boxShadow: '0 4px 15px rgba(102,126,234,0.4)'
  },
  error: {
    background: '#fff5f5', border: '1px solid #feb2b2',
    color: '#c53030', padding: '11px 15px', borderRadius: '10px',
    marginBottom: '16px', fontSize: '14px', fontWeight: '500'
  },
  successBox: {
    background: '#f0fff4', border: '1px solid #9ae6b4',
    color: '#276749', padding: '11px 15px', borderRadius: '10px',
    marginBottom: '16px', fontSize: '14px', fontWeight: '500'
  },
  link: { textAlign: 'center', marginTop: '22px', color: '#888', fontSize: '14px' },
  a: { color: '#667eea', fontWeight: '700', textDecoration: 'none' }
};