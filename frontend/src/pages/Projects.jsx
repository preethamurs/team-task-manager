import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Projects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedToId: '', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => { logout(); navigate('/login'); };

  const fetchTasks = async (projectId) => {
    setTaskLoading(true);
    try {
      const res = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(res.data);
    } catch (e) {
      setTasks([]);
    } finally {
      setTaskLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
      if (res.data.length > 0) {
        setSelectedProject(res.data[0]);
        fetchTasks(res.data[0].id);
      }
    } catch (e) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectProject = (p) => {
    setSelectedProject(p);
    setShowTaskForm(false);
    setError('');
    setSuccess('');
    fetchTasks(p.id);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!projectForm.name.trim()) return setError('Project name is required');
    setSubmitting(true);
    try {
      const res = await api.post('/projects', projectForm);
      setSuccess('✅ Project created successfully!');
      setProjectForm({ name: '', description: '' });
      setShowProjectForm(false);
      await fetchProjects();
      handleSelectProject(res.data);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!taskForm.title.trim()) return setError('Task title is required');
    setSubmitting(true);
    try {
      await api.post('/tasks', {
        ...taskForm,
        projectId: selectedProject.id,
        assignedToId: taskForm.assignedToId ? parseInt(taskForm.assignedToId) : null
      });
      setSuccess('✅ Task created successfully!');
      setTaskForm({ title: '', description: '', assignedToId: '', dueDate: '' });
      setShowTaskForm(false);
      fetchTasks(selectedProject.id);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchTasks(selectedProject.id);
    } catch (e) {
      setError('Failed to update task status');
    }
  };

  const statusColor = {
    TODO: '#667eea', IN_PROGRESS: '#f59e0b', DONE: '#10b981', OVERDUE: '#ef4444'
  };

  const statusIcon = {
    TODO: '📋', IN_PROGRESS: '🔄', DONE: '✅', OVERDUE: '⚠️'
  };

  if (loading) return (
    <div style={s.loadingPage}>
      <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
      <p style={{ color: '#667eea', fontWeight: '600' }}>Loading projects...</p>
    </div>
  );

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>✅ Team Task Manager</span>
          <Link to="/dashboard" style={s.navLink}>Dashboard</Link>
          <Link to="/projects" style={{ ...s.navLink, color: '#667eea', fontWeight: '700' }}>Projects</Link>
        </div>
        <div style={s.navRight}>
          <span style={s.roleBadge}>{user?.role}</span>
          <span style={s.navUser}>👤 {user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div style={s.container}>
        {error && (
          <div style={s.errorBox}>
            ⚠️ {error}
            <button style={s.closeBtn} onClick={() => setError('')}>✕</button>
          </div>
        )}
        {success && (
          <div style={s.successBox}>
            {success}
            <button style={s.closeBtn} onClick={() => setSuccess('')}>✕</button>
          </div>
        )}

        <div style={s.layout}>
          <div style={s.leftPanel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>📁 Projects</h2>
              {user?.role === 'ADMIN' && (
                <button style={s.addBtn} onClick={() => { setShowProjectForm(!showProjectForm); setError(''); }}>
                  {showProjectForm ? '✕ Cancel' : '+ New'}
                </button>
              )}
            </div>

            {showProjectForm && (
              <form onSubmit={handleCreateProject} style={s.form}>
                <div style={s.formTitle}>Create New Project</div>
                <label style={s.label}>Project Name *</label>
                <input style={s.input} placeholder="e.g. Website Redesign"
                  value={projectForm.name}
                  onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  required />
                <label style={s.label}>Description</label>
                <textarea style={{ ...s.input, height: '70px', resize: 'vertical' }}
                  placeholder="What is this project about?"
                  value={projectForm.description}
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} />
                <button style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                  type="submit" disabled={submitting}>
                  {submitting ? '⏳ Creating...' : '🚀 Create Project'}
                </button>
              </form>
            )}

            {projects.length === 0 ? (
              <div style={s.emptyPanel}>
                <div style={{ fontSize: '36px' }}>📂</div>
                <p style={{ color: '#888', fontSize: '14px', margin: '8px 0' }}>No projects yet</p>
                {user?.role === 'ADMIN' && <p style={{ color: '#bbb', fontSize: '12px' }}>Click "+ New" to create one</p>}
              </div>
            ) : projects.map(p => (
              <div key={p.id}
                style={{
                  ...s.projectCard,
                  background: selectedProject?.id === p.id ? '#f0f0ff' : 'white',
                  borderLeft: `4px solid ${selectedProject?.id === p.id ? '#667eea' : '#eee'}`,
                }}
                onClick={() => handleSelectProject(p)}>
                <div style={s.projectName}>{p.name}</div>
                <div style={s.projectMeta}>{p.tasks?.length || 0} tasks · {p.members?.length || 0} members</div>
              </div>
            ))}
          </div>

          <div style={s.rightPanel}>
            {!selectedProject ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: '52px', marginBottom: '15px' }}>👈</div>
                <p style={{ color: '#888', fontWeight: '600', fontSize: '16px' }}>Select a project to view tasks</p>
              </div>
            ) : (
              <>
                <div style={s.taskHeader}>
                  <div>
                    <h2 style={s.taskTitle}>{selectedProject.name}</h2>
                    <p style={s.taskSubtitle}>{tasks.length} task{tasks.length !== 1 ? 's' : ''} in this project</p>
                  </div>
                  {user?.role === 'ADMIN' && (
                    <button style={s.addBtn} onClick={() => { setShowTaskForm(!showTaskForm); setError(''); }}>
                      {showTaskForm ? '✕ Cancel' : '+ Add Task'}
                    </button>
                  )}
                </div>

                {showTaskForm && (
                  <form onSubmit={handleCreateTask} style={s.form}>
                    <div style={s.formTitle}>Create New Task</div>
                    <label style={s.label}>Task Title *</label>
                    <input style={s.input} placeholder="e.g. Design homepage mockup"
                      value={taskForm.title}
                      onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                      required />
                    <label style={s.label}>Description</label>
                    <textarea style={{ ...s.input, height: '60px', resize: 'vertical' }}
                      placeholder="Task details (optional)"
                      value={taskForm.description}
                      onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
                    <label style={s.label}>Assign To</label>
                    <select style={s.input} value={taskForm.assignedToId}
                      onChange={e => setTaskForm({ ...taskForm, assignedToId: e.target.value })}>
                      <option value="">— Unassigned —</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <label style={s.label}>Due Date</label>
                    <input style={s.input} type="date"
                      value={taskForm.dueDate}
                      onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
                    <button style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                      type="submit" disabled={submitting}>
                      {submitting ? '⏳ Creating...' : '✅ Create Task'}
                    </button>
                  </form>
                )}

                {taskLoading ? (
                  <div style={s.emptyState}>
                    <div style={{ fontSize: '36px' }}>⏳</div>
                    <p style={{ color: '#667eea', fontWeight: '600' }}>Loading tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={{ fontSize: '46px', marginBottom: '12px' }}>📝</div>
                    <p style={{ color: '#888', fontWeight: '600' }}>No tasks yet</p>
                    {user?.role === 'ADMIN'
                      ? <p style={{ color: '#bbb', fontSize: '13px' }}>Click "+ Add Task" to create the first task</p>
                      : <p style={{ color: '#bbb', fontSize: '13px' }}>No tasks assigned yet</p>}
                  </div>
                ) : tasks.map(t => (
                  <div key={t.id} style={s.taskCard}>
                    <div style={s.taskLeft}>
                      <div style={s.taskName}>{statusIcon[t.status]} {t.title}</div>
                      {t.description && <div style={s.taskDesc}>{t.description}</div>}
                      <div style={s.taskMeta}>
                        {t.assignedTo && <span>👤 {t.assignedTo.name}</span>}
                        {t.dueDate && (
                          <span style={{ color: t.status === 'OVERDUE' ? '#ef4444' : '#aaa' }}>
                            📅 Due: {new Date(t.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {!t.assignedTo && !t.dueDate && <span style={{ color: '#ccc' }}>No assignee · No due date</span>}
                      </div>
                    </div>
                    <div style={s.taskRight}>
                      <span style={{ ...s.statusBadge, background: statusColor[t.status] }}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <select style={s.statusSelect} value={t.status}
                        onChange={e => handleStatusChange(t.id, e.target.value)}>
                        <option value="TODO">📋 TODO</option>
                        <option value="IN_PROGRESS">🔄 IN PROGRESS</option>
                        <option value="DONE">✅ DONE</option>
                      </select>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight: '100vh', background: '#f7f8fc', fontFamily: "'Segoe UI', sans-serif" },
  loadingPage: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f7f8fc' },
  nav: { background: 'white', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '28px' },
  navLogo: { fontWeight: '800', fontSize: '18px', color: '#1a1a2e' },
  navLink: { color: '#666', textDecoration: 'none', fontWeight: '500', fontSize: '15px' },
  navRight: { display: 'flex', alignItems: 'center', gap: '14px' },
  roleBadge: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  navUser: { color: '#555', fontSize: '14px' },
  logoutBtn: { padding: '8px 18px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '25px 20px' },
  errorBox: { background: '#fff5f5', border: '1px solid #feb2b2', color: '#c53030', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  successBox: { background: '#f0fff4', border: '1px solid #9ae6b4', color: '#276749', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit', padding: '0 4px' },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  leftPanel: { width: '280px', flexShrink: 0, background: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: '500px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  panelTitle: { margin: 0, fontSize: '17px', fontWeight: '700', color: '#1a1a2e' },
  addBtn: { padding: '7px 14px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  projectCard: { padding: '12px 14px', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid #f0f0f0' },
  projectName: { fontWeight: '600', color: '#1a1a2e', fontSize: '14px', marginBottom: '4px' },
  projectMeta: { color: '#aaa', fontSize: '12px' },
  emptyPanel: { textAlign: 'center', padding: '40px 10px' },
  rightPanel: { flex: 1, background: 'white', borderRadius: '14px', padding: '22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', minHeight: '500px' },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  taskTitle: { margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#1a1a2e' },
  taskSubtitle: { margin: 0, color: '#aaa', fontSize: '13px' },
  form: { background: '#fafbfc', border: '1px solid #eef0f4', borderRadius: '12px', padding: '18px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  formTitle: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px', marginBottom: '4px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  input: { padding: '10px 14px', border: '2px solid #eef0f4', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box', background: 'white', outline: 'none' },
  submitBtn: { padding: '12px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', border: '1px solid #f0f0f0', padding: '15px', borderRadius: '10px', marginBottom: '10px', gap: '15px' },
  taskLeft: { flex: 1 },
  taskName: { fontWeight: '700', color: '#1a1a2e', fontSize: '15px', marginBottom: '5px' },
  taskDesc: { color: '#666', fontSize: '13px', marginBottom: '6px', lineHeight: '1.4' },
  taskMeta: { display: 'flex', gap: '15px', color: '#aaa', fontSize: '12px' },
  taskRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' },
  statusSelect: { padding: '6px 10px', border: '2px solid #eef0f4', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', background: 'white' },
  emptyState: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '350px', textAlign: 'center' },
};