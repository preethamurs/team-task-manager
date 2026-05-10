import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/tasks').catch(() => ({ data: [] })),
      api.get('/projects').catch(() => ({ data: [] }))
    ]).then(([t, p]) => {
      setTasks(t.data);
      setProjects(p.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const stats = [
    { label: 'Total Tasks', count: tasks.length, color: '#667eea', bg: '#f0f0ff', icon: '📋' },
    { label: 'In Progress', count: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#f59e0b', bg: '#fffbeb', icon: '🔄' },
    { label: 'Completed', count: tasks.filter(t => t.status === 'DONE').length, color: '#10b981', bg: '#f0fdf4', icon: '✅' },
    { label: 'Overdue', count: tasks.filter(t => t.status === 'OVERDUE').length, color: '#ef4444', bg: '#fff5f5', icon: '⚠️' },
  ];

  const statusColor = {
    TODO: '#667eea',
    IN_PROGRESS: '#f59e0b',
    DONE: '#10b981',
    OVERDUE: '#ef4444'
  };

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={s.spinner}>⏳</div>
      <p style={s.loadingText}>Loading your dashboard...</p>
    </div>
  );

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>✅ Team Task Manager</span>
          <Link to="/dashboard" style={{...s.navLink, color: '#667eea', fontWeight: '700'}}>Dashboard</Link>
          <Link to="/projects" style={s.navLink}>Projects</Link>
        </div>
        <div style={s.navRight}>
          <span style={s.roleBadge}>{user?.role}</span>
          <span style={s.navUser}>👤 {user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={s.container}>
        {/* Welcome */}
        <div style={s.welcomeBox}>
          <div>
            <h1 style={s.welcomeTitle}>Good day, {user?.name}! 👋</h1>
            <p style={s.welcomeSub}>Here's an overview of your projects and tasks.</p>
          </div>
          <button style={s.newProjectBtn} onClick={() => navigate('/projects')}>
            + New Project
          </button>
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map(({ label, count, color, bg, icon }) => (
            <div key={label} style={{...s.statCard, background: bg, borderLeft: `4px solid ${color}`}}>
              <div style={s.statIcon}>{icon}</div>
              <div style={{...s.statCount, color}}>{count}</div>
              <div style={s.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        {/* Projects + Tasks Grid */}
        <div style={s.grid2}>

          {/* Projects */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h2 style={s.cardTitle}>📁 My Projects</h2>
              <Link to="/projects" style={s.viewAll}>View All →</Link>
            </div>
            {projects.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>📂</div>
                <p style={s.emptyText}>No projects yet</p>
                <button style={s.emptyBtn} onClick={() => navigate('/projects')}>
                  Create First Project
                </button>
              </div>
            ) : projects.slice(0, 5).map(p => (
              <div key={p.id} style={s.listItem} onClick={() => navigate('/projects')}>
                <div>
                  <div style={s.itemTitle}>{p.name}</div>
                  <div style={s.itemSub}>
                    {p.tasks?.length || 0} tasks · {p.members?.length || 0} members
                  </div>
                </div>
                <div style={s.itemCount}>{p.tasks?.length || 0}</div>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <h2 style={s.cardTitle}>📌 My Tasks</h2>
              <span style={s.taskCount}>{tasks.length} total</span>
            </div>
            {tasks.length === 0 ? (
              <div style={s.empty}>
                <div style={s.emptyIcon}>📝</div>
                <p style={s.emptyText}>No tasks assigned yet</p>
                <p style={s.emptyHint}>Tasks assigned to you will appear here</p>
              </div>
            ) : tasks.slice(0, 6).map(t => (
              <div key={t.id} style={s.listItem}>
                <div>
                  <div style={s.itemTitle}>{t.title}</div>
                  <div style={s.itemSub}>
                    {t.dueDate
                      ? `Due: ${new Date(t.dueDate).toLocaleDateString()}`
                      : 'No due date'}
                  </div>
                </div>
                <span style={{...s.statusBadge, background: statusColor[t.status]}}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue Warning */}
        {tasks.filter(t => t.status === 'OVERDUE').length > 0 && (
          <div style={s.overdueAlert}>
            ⚠️ You have <strong>{tasks.filter(t => t.status === 'OVERDUE').length} overdue task(s)</strong> — please review them in Projects.
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f7f8fc', fontFamily: "'Segoe UI', sans-serif" },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fc' },
  spinner: { fontSize: '48px', marginBottom: '15px' },
  loadingText: { color: '#667eea', fontWeight: '600', fontSize: '16px' },

  nav: { background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '28px' },
  navLogo: { fontWeight: '800', fontSize: '18px', color: '#1a1a2e' },
  navLink: { color: '#666', textDecoration: 'none', fontWeight: '500', fontSize: '15px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  roleBadge: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  navUser: { color: '#555', fontSize: '14px' },
  logoutBtn: { padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },

  container: { maxWidth: '1100px', margin: '0 auto', padding: '30px 20px' },

  welcomeBox: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '15px' },
  welcomeTitle: { fontSize: '26px', fontWeight: '800', color: '#1a1a2e', margin: '0 0 6px' },
  welcomeSub: { color: '#888', fontSize: '15px', margin: 0 },
  newProjectBtn: { padding: '11px 22px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '15px' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { padding: '22px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: '26px', marginBottom: '10px' },
  statCount: { fontSize: '34px', fontWeight: '800', margin: '0 0 4px' },
  statLabel: { color: '#888', fontSize: '13px', fontWeight: '600' },

  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' },
  card: { background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' },
  cardTitle: { fontSize: '17px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  viewAll: { color: '#667eea', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  taskCount: { color: '#888', fontSize: '13px', fontWeight: '600' },

  listItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5', cursor: 'pointer' },
  itemTitle: { fontWeight: '600', color: '#1a1a2e', fontSize: '14px', marginBottom: '3px' },
  itemSub: { color: '#aaa', fontSize: '12px' },
  itemCount: { background: '#667eea', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', minWidth: '28px' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },

  empty: { textAlign: 'center', padding: '35px 20px' },
  emptyIcon: { fontSize: '42px', marginBottom: '10px' },
  emptyText: { color: '#888', fontWeight: '600', marginBottom: '5px' },
  emptyHint: { color: '#bbb', fontSize: '13px', marginBottom: '15px' },
  emptyBtn: { padding: '9px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },

  overdueAlert: { background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '14px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '500' }
};