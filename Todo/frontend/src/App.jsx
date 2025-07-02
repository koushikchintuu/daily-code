import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:8000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch tasks');
    }
    setLoading(false);
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = { id: Date.now(), title };
    try {
      await axios.post(API_URL, newTask);
      setTasks([...tasks, newTask]);
      setTitle('');
      setError('');
    } catch (err) {
      setError('Failed to add task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task.id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  return (
    <div className="todo-container">
      <h1>To-Do List</h1>
      <form onSubmit={addTask} className="todo-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task"
        />
        <button type="submit">Add</button>
      </form>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="todo-list">
          {tasks.map((task) => (
            <li key={task.id} className="todo-item">
              {task.title}
              <button onClick={() => deleteTask(task.id)} className="delete-btn">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
