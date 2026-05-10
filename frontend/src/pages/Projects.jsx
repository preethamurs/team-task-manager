import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Projects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToId: '', dueDate: '' });
  const [tasks, setTasks] = useState([]);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    fetchProjects();
    api.get('/auth/users').catch(() => {});
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (e) {}
  };

  const fetchProjectTasks = async (projectId) => {
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (e) {
      setTasks([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (e) {}
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await api.post('/projects', form);
      setSuccess('Project created successfully!');
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
    setLoading(false);
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setShowTaskForm(false);
    fetchProjectTasks(project.id);
    fetchUsers();
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/tasks', { ...taskForm, projectId: selectedProject.id });
      setSuccess('Task created!');
      setTaskForm({ title: '', description: '', assignedToId: '', dueDate: '' });
      setShowTaskForm(false);
      fetchProjectTasks(selectedProject.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
    setLoading(false);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectTasks(selectedProject.id);
    } catch (e) {}
  };

  const statusColor = (status) => {
    if (status === 'DONE') return '#10b981';
    if (status === 'OVERDUE') return '#ef4444';
    if (status === 'IN_PROGRESS') return '#f59e0b';
    return '#6366f1';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Team Task Manager</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={styles.welcome}>Welcome, {user?.name} ({user?.role})</span>
          <button style={styles.navBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Messages */}
      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      <div style={styles.layout}>
        {/* Left Panel - Projects List */}
        <div style={styles.leftPanel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0 }}>Projects</h2>
            {user?.role === 'ADMIN' && (
              <button style={styles.createBtn} onClick={() => setShowForm(!showForm)}>
                {showForm ? 'Cancel' : '+ New Project'}
              </button>
            )}
          </div>

          {/* Create Project Form */}
          {showForm && (
            <form onSubmit={handleCreateProject} style={styles.form}>
              <input
                style={styles.input}
                placeholder="Project Name *"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
              <textarea
                style={{ ...styles.input, height: '70px', resize: 'vertical' }}
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
              <button style={styles.submitBtn} type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </form>
          )}

          {/* Projects List */}
          {projects.length === 0 ? (
            <p style={{ color: '#888' }}>No projects yet.{user?.role === 'ADMIN' ? ' Create one above!' : ''}</p>
          ) : (
            projects.map(p => (
              <div
                key={p.id}
                style={{
                  ...styles.projectCard,
                  background: selectedProject?.id === p.id ? '#ede9fe' : 'white',
                  borderLeft: selectedProject?.id === p.id ? '4px solid #6366f1' : '4px solid transparent',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectProject(p)}
              >
                <h4 style={{ margin: '0 0 4px 0', color: '#333' }}>{p.name}</h4>
                <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>{p.description || 'No description'}</p>
              </div>
            ))
          )}
        </div>

        {/* Right Panel - Tasks */}
        <div style={styles.rightPanel}>
          {!selectedProject ? (
            <div style={styles.emptyState}>
              <p>👈 Select a project to view tasks</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>{selectedProject.name} — Tasks</h2>
                {user?.role === 'ADMIN' && (
                  <button style={styles.createBtn} onClick={() => setShowTaskForm(!showTaskForm)}>
                    {showTaskForm ? 'Cancel' : '+ Add Task'}
                  </button>
                )}
              </div>

              {/* Create Task Form */}
              {showTaskForm && (
                <form onSubmit={handleCreateTask} style={styles.form}>
                  <input
                    style={styles.input}
                    placeholder="Task Title *"
                    value={taskForm.title}
                    onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                    required
                  />
                  <textarea
                    style={{ ...styles.input, height: '60px', resize: 'vertical' }}
                    placeholder="Description (optional)"
                    value={taskForm.description}
                    onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                  <select
                    style={styles.input}
                    value={taskForm.assignedToId}
                    onChange={e => setTaskForm({ ...taskForm, assignedToId: e.target.value })}
                  >
                    <option value="">Assign to... (optional)</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                  <input
                    style={styles.input}
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    placeholder="Due Date"
                  />
                  <button style={styles.submitBtn} type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Task'}
                  </button>
                </form>
              )}

              {/* Tasks List */}
              {tasks.length === 0 ? (
                <p style={{ color: '#888' }}>No tasks yet.{user?.role === 'ADMIN' ? ' Add one above!' : ''}</p>
              ) : (
                tasks.map(t => (
                  <div key={t.id} style={styles.taskCard}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0' }}>{t.title}</h4>
                      {t.description && <p style={{ margin: '0 0 6px 0', color: '#666', fontSize: '13px' }}>{t.description}</p>}
                      {t.assignedTo && <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>Assigned to: {t.assignedTo.name}</p>}
                      {t.dueDate && <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ ...styles.badge, background: statusColor(t.status) }}>{t.status}</span>
                      <select
                        style={styles.statusSelect}
                        value={t.status}
                        onChange={e => handleStatusChange(t.id, e.target.value)}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  title: { color: '#4f46e5', margin: 0 },
  welcome: { color: '#555', fontSize: '14px' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  navBtn: { padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  createBtn: { padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '14px' },
  submitBtn: { padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%', fontWeight: 'bold' },
  form: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '15px', marginBottom: '15px', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  leftPanel: { width: '300px', flexShrink: 0, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  rightPanel: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minHeight: '400px' },
  projectCard: { padding: '12px', borderRadius: '8px', marginBottom: '8px', transition: 'all 0.2s' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #eee', padding: '12px', borderRadius: '8px', marginBottom: '10px' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', whiteSpace: 'nowrap' },
  statusSelect: { padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '5px', fontSize: '12px', cursor: 'pointer' },
  emptyState: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#888', fontSize: '16px' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px' },
  success: { background: '#d1fae5', color: '#065f46', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px' },
};