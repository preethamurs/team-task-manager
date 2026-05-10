import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.get('/tasks').then(res => setTasks(res.data));
    api.get('/projects').then(res => setProjects(res.data));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const todo = tasks.filter(t => t.status === 'TODO').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const done = tasks.filter(t => t.status === 'DONE').length;
  const overdue = tasks.filter(t => t.status === 'OVERDUE').length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Team Task Manager</h1>
        <div>
          <span style={styles.welcome}>Welcome, {user?.name} ({user?.role})</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.statsRow}>
        {[['Todo', todo, '#6366f1'], ['In Progress', inProgress, '#f59e0b'],
          ['Done', done, '#10b981'], ['Overdue', overdue, '#ef4444']].map(([label, count, color]) => (
          <div key={label} style={{...styles.statCard, borderTop: `4px solid ${color}`}}>
            <h3 style={{color}}>{count}</h3>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2>My Projects ({projects.length})</h2>
        {projects.length === 0 ? <p>No projects yet.</p> : projects.map(p => (
          <div key={p.id} style={styles.projectCard}>
            <h3>{p.name}</h3>
            <p>{p.description || 'No description'}</p>
            <p>{p.tasks?.length || 0} tasks · {p.members?.length || 0} members</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h2>My Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? <p>No tasks assigned yet.</p> : tasks.map(t => (
          <div key={t.id} style={styles.taskCard}>
            <h4>{t.title}</h4>
            <span style={{...styles.badge, background: t.status === 'DONE' ? '#10b981' :
              t.status === 'OVERDUE' ? '#ef4444' : t.status === 'IN_PROGRESS' ? '#f59e0b' : '#6366f1'}}>
              {t.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#4f46e5' },
  welcome: { marginRight: '15px', color: '#555' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  statsRow: { display: 'flex', gap: '15px', marginBottom: '30px' },
  statCard: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' },
  section: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' },
  projectCard: { border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '12px', borderRadius: '8px', marginBottom: '8px' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '12px' }
};