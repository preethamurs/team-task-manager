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
  const [submitting, setSubmitting] = useState(false);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: ''
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedToId: '',
    dueDate: ''
  });

  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    description: ''
  });

  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const statusOptions = [
    { value: 'TODO', label: '📋 TODO' },
    { value: 'IN_PROGRESS', label: '🔄 IN PROGRESS' },
    { value: 'DONE', label: '✅ DONE' },
    { value: 'OVERDUE', label: '⚠️ OVERDUE' }
  ];

  const statusColor = {
    TODO: '#667eea',
    IN_PROGRESS: '#f59e0b',
    DONE: '#10b981',
    OVERDUE: '#ef4444'
  };

  const statusIcon = {
    TODO: '📋',
    IN_PROGRESS: '🔄',
    DONE: '✅',
    OVERDUE: '⚠️'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

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
      } else {
        setSelectedProject(null);
        setTasks([]);
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
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    setShowTaskForm(false);
    clearMessages();
    fetchTasks(project.id);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!projectForm.name.trim()) {
      return setError('Project name is required');
    }

    setSubmitting(true);

    try {
      const res = await api.post('/projects', projectForm);

      setProjects((prev) => [res.data, ...prev]);
      setSelectedProject(res.data);
      setTasks([]);

      setProjectForm({ name: '', description: '' });
      setShowProjectForm(false);

      setSuccess('✅ Project created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditProject = (project) => {
    clearMessages();

    setEditingProject(project);
    setEditProjectForm({
      name: project.name || '',
      description: project.description || ''
    });
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!editProjectForm.name.trim()) {
      return setError('Project name is required');
    }

    setSubmitting(true);

    try {
      const res = await api.put(`/projects/${editingProject.id}`, editProjectForm);

      setProjects((prev) =>
        prev.map((project) =>
          project.id === editingProject.id ? res.data : project
        )
      );

      if (selectedProject?.id === editingProject.id) {
        setSelectedProject(res.data);
      }

      setEditingProject(null);
      setSuccess('✅ Project updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deletingProject) return;

    clearMessages();
    setSubmitting(true);

    try {
      await api.delete(`/projects/${deletingProject.id}`);

      const updatedProjects = projects.filter(
        (project) => project.id !== deletingProject.id
      );

      setProjects(updatedProjects);

      if (selectedProject?.id === deletingProject.id) {
        if (updatedProjects.length > 0) {
          setSelectedProject(updatedProjects[0]);
          fetchTasks(updatedProjects[0].id);
        } else {
          setSelectedProject(null);
          setTasks([]);
        }
      }

      setDeletingProject(null);
      setSuccess('✅ Project deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!selectedProject) {
      return setError('Please select a project first');
    }

    if (!taskForm.title.trim()) {
      return setError('Task title is required');
    }

    setSubmitting(true);

    try {
      const res = await api.post('/tasks', {
        ...taskForm,
        projectId: selectedProject.id,
        assignedToId: taskForm.assignedToId
          ? parseInt(taskForm.assignedToId)
          : null,
        dueDate: taskForm.dueDate || null
      });

      setTasks((prev) => [res.data, ...prev]);

      setTaskForm({
        title: '',
        description: '',
        assignedToId: '',
        dueDate: ''
      });

      setShowTaskForm(false);

      setSuccess('✅ Task created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    clearMessages();

    try {
      const res = await api.put(`/tasks/${taskId}`, {
        status: newStatus
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? res.data : task
        )
      );

      setSuccess('✅ Task status updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Failed to update task status');
    }
  };

  const openEditTask = (task) => {
    clearMessages();

    setEditingTask({
      ...task,
      assignedToId: task.assignedToId || task.assignedTo?.id || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!editingTask.title.trim()) {
      return setError('Task title is required');
    }

    setSubmitting(true);

    try {
      const res = await api.put(`/tasks/${editingTask.id}`, {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        assignedToId: editingTask.assignedToId
          ? parseInt(editingTask.assignedToId)
          : null,
        dueDate: editingTask.dueDate || null
      });

      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id ? res.data : task
        )
      );

      setEditingTask(null);
      setSuccess('✅ Task updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;

    clearMessages();
    setSubmitting(true);

    try {
      await api.delete(`/tasks/${deletingTask.id}`);

      setTasks((prev) =>
        prev.filter((task) => task.id !== deletingTask.id)
      );

      setDeletingTask(null);
      setSuccess('✅ Task deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={s.loadingPage}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>⏳</div>
        <p style={{ color: '#667eea', fontWeight: '600' }}>
          Loading projects...
        </p>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <span style={s.navLogo}>✅ Team Task Manager</span>
          <Link to="/dashboard" style={s.navLink}>
            Dashboard
          </Link>
          <Link
            to="/projects"
            style={{ ...s.navLink, color: '#667eea', fontWeight: '700' }}
          >
            Projects
          </Link>
        </div>

        <div style={s.navRight}>
          <span style={s.roleBadge}>{user?.role}</span>
          <span style={s.navUser}>👤 {user?.name}</span>
          <button style={s.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div style={s.container}>
        {error && (
          <div style={s.errorBox}>
            ⚠️ {error}
            <button style={s.closeBtn} onClick={() => setError('')}>
              ✕
            </button>
          </div>
        )}

        {success && (
          <div style={s.successBox}>
            {success}
            <button style={s.closeBtn} onClick={() => setSuccess('')}>
              ✕
            </button>
          </div>
        )}

        <div style={s.layout}>
          <div style={s.leftPanel}>
            <div style={s.panelHeader}>
              <h2 style={s.panelTitle}>📁 Projects</h2>

              {user?.role === 'ADMIN' && (
                <button
                  style={s.addBtn}
                  onClick={() => {
                    setShowProjectForm(!showProjectForm);
                    clearMessages();
                  }}
                >
                  {showProjectForm ? '✕ Cancel' : '+ New'}
                </button>
              )}
            </div>

            {showProjectForm && (
              <form onSubmit={handleCreateProject} style={s.form}>
                <div style={s.formTitle}>Create New Project</div>

                <label style={s.label}>Project Name *</label>
                <input
                  style={s.input}
                  placeholder="e.g. Website Redesign"
                  value={projectForm.name}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      name: e.target.value
                    })
                  }
                  required
                />

                <label style={s.label}>Description</label>
                <textarea
                  style={{ ...s.input, height: '70px', resize: 'vertical' }}
                  placeholder="What is this project about?"
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      description: e.target.value
                    })
                  }
                />

                <button
                  style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? '⏳ Creating...' : '🚀 Create Project'}
                </button>
              </form>
            )}

            {projects.length === 0 ? (
              <div style={s.emptyPanel}>
                <div style={{ fontSize: '36px' }}>📂</div>
                <p style={{ color: '#888', fontSize: '14px', margin: '8px 0' }}>
                  No projects yet
                </p>
                {user?.role === 'ADMIN' && (
                  <p style={{ color: '#bbb', fontSize: '12px' }}>
                    Click "+ New" to create one
                  </p>
                )}
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    ...s.projectCard,
                    background:
                      selectedProject?.id === project.id ? '#f0f0ff' : 'white',
                    borderLeft: `4px solid ${
                      selectedProject?.id === project.id ? '#667eea' : '#eee'
                    }`
                  }}
                  onClick={() => handleSelectProject(project)}
                >
                  <div style={s.projectCardTop}>
                    <div>
                      <div style={s.projectName}>{project.name}</div>
                      <div style={s.projectMeta}>
                        {project.tasks?.length || 0} tasks ·{' '}
                        {project.members?.length || 0} members
                      </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <div
                        style={s.projectActions}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          style={s.smallBtn}
                          onClick={() => openEditProject(project)}
                        >
                          Edit
                        </button>

                        <button
                          style={s.smallDangerBtn}
                          onClick={() => setDeletingProject(project)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={s.rightPanel}>
            {!selectedProject ? (
              <div style={s.emptyState}>
                <div style={{ fontSize: '52px', marginBottom: '15px' }}>
                  👈
                </div>
                <p style={{ color: '#888', fontWeight: '600', fontSize: '16px' }}>
                  Select a project to view tasks
                </p>
              </div>
            ) : (
              <>
                <div style={s.taskHeader}>
                  <div>
                    <h2 style={s.taskTitle}>{selectedProject.name}</h2>
                    <p style={s.taskSubtitle}>
                      {tasks.length} task{tasks.length !== 1 ? 's' : ''} in this
                      project
                    </p>
                  </div>

                  {user?.role === 'ADMIN' && (
                    <button
                      style={s.addBtn}
                      onClick={() => {
                        setShowTaskForm(!showTaskForm);
                        clearMessages();
                      }}
                    >
                      {showTaskForm ? '✕ Cancel' : '+ Add Task'}
                    </button>
                  )}
                </div>

                {showTaskForm && (
                  <form onSubmit={handleCreateTask} style={s.form}>
                    <div style={s.formTitle}>Create New Task</div>

                    <label style={s.label}>Task Title *</label>
                    <input
                      style={s.input}
                      placeholder="e.g. Design homepage mockup"
                      value={taskForm.title}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          title: e.target.value
                        })
                      }
                      required
                    />

                    <label style={s.label}>Description</label>
                    <textarea
                      style={{ ...s.input, height: '60px', resize: 'vertical' }}
                      placeholder="Task details optional"
                      value={taskForm.description}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          description: e.target.value
                        })
                      }
                    />

                    <label style={s.label}>Assign To</label>
                    <select
                      style={s.input}
                      value={taskForm.assignedToId}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          assignedToId: e.target.value
                        })
                      }
                    >
                      <option value="">— Unassigned —</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>

                    <label style={s.label}>Due Date</label>
                    <input
                      style={s.input}
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          dueDate: e.target.value
                        })
                      }
                    />

                    <button
                      style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                      type="submit"
                      disabled={submitting}
                    >
                      {submitting ? '⏳ Creating...' : '✅ Create Task'}
                    </button>
                  </form>
                )}

                {taskLoading ? (
                  <div style={s.emptyState}>
                    <div style={{ fontSize: '36px' }}>⏳</div>
                    <p style={{ color: '#667eea', fontWeight: '600' }}>
                      Loading tasks...
                    </p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div style={s.emptyState}>
                    <div style={{ fontSize: '46px', marginBottom: '12px' }}>
                      📝
                    </div>
                    <p style={{ color: '#888', fontWeight: '600' }}>
                      No tasks yet
                    </p>
                    {user?.role === 'ADMIN' ? (
                      <p style={{ color: '#bbb', fontSize: '13px' }}>
                        Click "+ Add Task" to create the first task
                      </p>
                    ) : (
                      <p style={{ color: '#bbb', fontSize: '13px' }}>
                        No tasks assigned yet
                      </p>
                    )}
                  </div>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} style={s.taskCard}>
                      <div style={s.taskLeft}>
                        <div style={s.taskName}>
                          {statusIcon[task.status]} {task.title}
                        </div>

                        {task.description && (
                          <div style={s.taskDesc}>{task.description}</div>
                        )}

                        <div style={s.taskMeta}>
                          {task.assignedTo && (
                            <span>👤 {task.assignedTo.name}</span>
                          )}

                          {task.dueDate && (
                            <span
                              style={{
                                color:
                                  task.status === 'OVERDUE'
                                    ? '#ef4444'
                                    : '#aaa'
                              }}
                            >
                              📅 Due:{' '}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}

                          {!task.assignedTo && !task.dueDate && (
                            <span style={{ color: '#ccc' }}>
                              No assignee · No due date
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={s.taskRight}>
                        <span
                          style={{
                            ...s.statusBadge,
                            background: statusColor[task.status]
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>

                        <select
                          style={s.statusSelect}
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(task.id, e.target.value)
                          }
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        {user?.role === 'ADMIN' && (
                          <div style={s.taskActions}>
                            <button
                              style={s.smallBtn}
                              onClick={() => openEditTask(task)}
                            >
                              Edit
                            </button>

                            <button
                              style={s.smallDangerBtn}
                              onClick={() => setDeletingTask(task)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {editingProject && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Edit Project</h3>
              <button style={s.closeBtn} onClick={() => setEditingProject(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProject} style={s.form}>
              <label style={s.label}>Project Name *</label>
              <input
                style={s.input}
                value={editProjectForm.name}
                onChange={(e) =>
                  setEditProjectForm({
                    ...editProjectForm,
                    name: e.target.value
                  })
                }
                required
              />

              <label style={s.label}>Description</label>
              <textarea
                style={{ ...s.input, height: '80px', resize: 'vertical' }}
                value={editProjectForm.description}
                onChange={(e) =>
                  setEditProjectForm({
                    ...editProjectForm,
                    description: e.target.value
                  })
                }
              />

              <button
                style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deletingProject && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Delete Project</h3>
              <button style={s.closeBtn} onClick={() => setDeletingProject(null)}>
                ✕
              </button>
            </div>

            <p>
              Are you sure you want to delete{' '}
              <strong>{deletingProject.name}</strong>?
            </p>

            <p style={s.warningText}>
              This may also delete all tasks inside this project.
            </p>

            <div style={s.modalActions}>
              <button
                style={s.cancelBtn}
                onClick={() => setDeletingProject(null)}
              >
                Cancel
              </button>

              <button
                style={s.deleteBtn}
                onClick={handleDeleteProject}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingTask && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Edit Task</h3>
              <button style={s.closeBtn} onClick={() => setEditingTask(null)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateTask} style={s.form}>
              <label style={s.label}>Task Title *</label>
              <input
                style={s.input}
                value={editingTask.title}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    title: e.target.value
                  })
                }
                required
              />

              <label style={s.label}>Description</label>
              <textarea
                style={{ ...s.input, height: '80px', resize: 'vertical' }}
                value={editingTask.description || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    description: e.target.value
                  })
                }
              />

              <label style={s.label}>Status</label>
              <select
                style={s.input}
                value={editingTask.status}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    status: e.target.value
                  })
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label style={s.label}>Assign To</label>
              <select
                style={s.input}
                value={editingTask.assignedToId || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    assignedToId: e.target.value
                  })
                }
              >
                <option value="">— Unassigned —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>

              <label style={s.label}>Due Date</label>
              <input
                style={s.input}
                type="date"
                value={editingTask.dueDate || ''}
                onChange={(e) =>
                  setEditingTask({
                    ...editingTask,
                    dueDate: e.target.value
                  })
                }
              />

              <button
                style={{ ...s.submitBtn, opacity: submitting ? 0.7 : 1 }}
                disabled={submitting}
                type="submit"
              >
                {submitting ? 'Updating...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deletingTask && (
        <div style={s.modalOverlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Delete Task</h3>
              <button style={s.closeBtn} onClick={() => setDeletingTask(null)}>
                ✕
              </button>
            </div>

            <p>
              Are you sure you want to delete{' '}
              <strong>{deletingTask.title}</strong>?
            </p>

            <div style={s.modalActions}>
              <button style={s.cancelBtn} onClick={() => setDeletingTask(null)}>
                Cancel
              </button>

              <button
                style={s.deleteBtn}
                onClick={handleDeleteTask}
                disabled={submitting}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#f7f8fc',
    fontFamily: "'Segoe UI', sans-serif"
  },

  loadingPage: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f7f8fc'
  },

  nav: {
    background: 'white',
    padding: '0 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },

  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px'
  },

  navLogo: {
    fontWeight: '800',
    fontSize: '18px',
    color: '#1a1a2e'
  },

  navLink: {
    color: '#666',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px'
  },

  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  roleBadge: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    padding: '3px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '700'
  },

  navUser: {
    color: '#555',
    fontSize: '14px'
  },

  logoutBtn: {
    padding: '8px 18px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },

  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '25px 20px'
  },

  errorBox: {
    background: '#fff5f5',
    border: '1px solid #feb2b2',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  successBox: {
    background: '#f0fff4',
    border: '1px solid #9ae6b4',
    color: '#276749',
    padding: '12px 16px',
    borderRadius: '10px',
    marginBottom: '16px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: 'inherit',
    padding: '0 4px'
  },

  layout: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start'
  },

  leftPanel: {
    width: '310px',
    flexShrink: 0,
    background: 'white',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minHeight: '500px'
  },

  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  panelTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a2e'
  },

  addBtn: {
    padding: '7px 14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700'
  },

  projectCard: {
    padding: '12px 14px',
    borderRadius: '10px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #f0f0f0'
  },

  projectCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px'
  },

  projectName: {
    fontWeight: '600',
    color: '#1a1a2e',
    fontSize: '14px',
    marginBottom: '4px'
  },

  projectMeta: {
    color: '#aaa',
    fontSize: '12px'
  },

  projectActions: {
    display: 'flex',
    gap: '6px',
    flexShrink: 0
  },

  rightPanel: {
    flex: 1,
    background: 'white',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minHeight: '500px'
  },

  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  },

  taskTitle: {
    margin: '0 0 4px',
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a2e'
  },

  taskSubtitle: {
    margin: 0,
    color: '#aaa',
    fontSize: '13px'
  },

  form: {
    background: '#fafbfc',
    border: '1px solid #eef0f4',
    borderRadius: '12px',
    padding: '18px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  formTitle: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
    marginBottom: '4px'
  },

  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#555'
  },

  input: {
    padding: '10px 14px',
    border: '2px solid #eef0f4',
    borderRadius: '8px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
    outline: 'none'
  },

  submitBtn: {
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer'
  },

  taskCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    border: '1px solid #f0f0f0',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '10px',
    gap: '15px'
  },

  taskLeft: {
    flex: 1
  },

  taskName: {
    fontWeight: '700',
    color: '#1a1a2e',
    fontSize: '15px',
    marginBottom: '5px'
  },

  taskDesc: {
    color: '#666',
    fontSize: '13px',
    marginBottom: '6px',
    lineHeight: '1.4'
  },

  taskMeta: {
    display: 'flex',
    gap: '15px',
    color: '#aaa',
    fontSize: '12px',
    flexWrap: 'wrap'
  },

  taskRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    flexShrink: 0
  },

  taskActions: {
    display: 'flex',
    gap: '6px'
  },

  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '700',
    whiteSpace: 'nowrap'
  },

  statusSelect: {
    padding: '6px 10px',
    border: '2px solid #eef0f4',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer',
    background: 'white'
  },

  smallBtn: {
    padding: '5px 9px',
    border: 'none',
    borderRadius: '6px',
    background: '#e5e7eb',
    color: '#111827',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  smallDangerBtn: {
    padding: '5px 9px',
    border: 'none',
    borderRadius: '6px',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600'
  },

  emptyPanel: {
    textAlign: 'center',
    padding: '40px 10px'
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '350px',
    textAlign: 'center'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px'
  },

  modal: {
    background: 'white',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },

  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '16px'
  },

  cancelBtn: {
    padding: '9px 14px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    background: 'white',
    cursor: 'pointer',
    fontWeight: '600'
  },

  deleteBtn: {
    padding: '9px 14px',
    border: 'none',
    borderRadius: '6px',
    background: '#ef4444',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600'
  },

  warningText: {
    color: '#ef4444',
    fontSize: '13px'
  }
};