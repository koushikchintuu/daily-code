import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Task state
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [editId, setEditId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTask, setEditTask] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter/search state
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Helper: Axios config with auth
  const axiosConfig = user ? {
    auth: {
      username: user.username,
      password: user.password
    }
  } : {};

  // Fetch tasks
  const fetchTasks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = `${API_URL}/tasks`;
      // If any filter/search, use /tasks/search
      if (search || filterCategory || filterCompleted || filterPriority) {
        const params = [];
        if (search) params.push(`title=${encodeURIComponent(search)}`);
        if (filterCategory) params.push(`category=${encodeURIComponent(filterCategory)}`);
        if (filterCompleted) params.push(`completed=${filterCompleted}`);
        if (filterPriority) params.push(`priority=${filterPriority}`);
        url = `${API_URL}/tasks/search?${params.join('&')}`;
      }
      const res = await axios.get(url, axiosConfig);
      setTasks(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [user, search, filterCategory, filterCompleted, filterPriority]);

  // Auth handlers
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'register') {
        await axios.post(`${API_URL}/register`, { username, password });
        setAuthMode('login');
        setAuthError('Registered! Please log in.');
      } else {
        // login
        await axios.post(`${API_URL}/login`, {}, { auth: { username, password } });
        setUser({ username, password });
        setAuthError('');
      }
    } catch (err) {
      setAuthError('Authentication failed');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setTasks([]);
  };

  // Add/edit task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const taskData = {
      id: editMode ? editId : Date.now(),
      title,
      completed: editMode ? editTask.completed : false,
      due_date: dueDate || null,
      priority: priority ? parseInt(priority) : null,
      category: category || null,
      user: user.username
    };
    try {
      if (editMode) {
        await axios.put(`${API_URL}/tasks/${editId}`, taskData, axiosConfig);
        setEditMode(false);
        setEditId(null);
        setEditTask({});
      } else {
        await axios.post(`${API_URL}/tasks`, taskData, axiosConfig);
      }
      setTitle(''); setDueDate(''); setPriority(''); setCategory('');
      fetchTasks();
      setError('');
    } catch (err) {
      setError('Failed to save task');
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, axiosConfig);
      fetchTasks();
      setError('');
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  // Toggle complete
  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}/tasks/${task.id}`, { ...task, completed: !task.completed }, axiosConfig);
      fetchTasks();
    } catch (err) {
      setError('Failed to update task');
    }
  };

  // Edit task
  const startEdit = (task) => {
    setEditMode(true);
    setEditId(task.id);
    setEditTask(task);
    setTitle(task.title);
    setDueDate(task.due_date || '');
    setPriority(task.priority ? String(task.priority) : '');
    setCategory(task.category || '');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    setEditId(null);
    setEditTask({});
    setTitle(''); setDueDate(''); setPriority(''); setCategory('');
  };

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  return (
    <div className="todo-container">
      {!user ? (
        <div className="auth-container">
          <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>
          <form onSubmit={handleAuth} className="todo-form">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
            <button type="submit">{authMode === 'login' ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
            {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
          {authError && <div className="error">{authError}</div>}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>To-Do List</h1>
            <button onClick={handleLogout}>Logout</button>
          </div>
          <form onSubmit={handleTaskSubmit} className="todo-form">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              placeholder="Due date"
            />
            <input
              type="number"
              min="1"
              max="5"
              value={priority}
              onChange={e => setPriority(e.target.value)}
              placeholder="Priority (1-5)"
            />
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="Category"
            />
            <button type="submit">{editMode ? 'Update' : 'Add'}</button>
            {editMode && <button type="button" onClick={cancelEdit}>Cancel</button>}
          </form>
          <div className="filter-bar" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title"
              style={{ flex: 1 }}
            />
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={filterCompleted} onChange={e => setFilterCompleted(e.target.value)}>
              <option value="">All</option>
              <option value="true">Completed</option>
              <option value="false">Incomplete</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {[1,2,3,4,5].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {error && <div className="error">{error}</div>}
          {loading ? (
            <div>Loading...</div>
          ) : (
            <ul className="todo-list">
              {tasks.map((task) => (
                <li key={task.id} className="todo-item" style={{ opacity: task.completed ? 0.6 : 1 }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  <span style={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none', marginLeft: 8 }}>
                    {task.title}
                    {task.due_date && <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#555' }}>Due: {task.due_date}</span>}
                    {task.priority && <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#007bff' }}>Priority: {task.priority}</span>}
                    {task.category && <span style={{ marginLeft: 8, fontSize: '0.9em', color: '#28a745' }}>Category: {task.category}</span>}
                  </span>
                  <button onClick={() => startEdit(task)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;
