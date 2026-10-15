
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "https://jsonplaceholder.typicode.com/todos";


function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [errorTimer, setErrorTimer] = useState(null);

  function showError(message) {
    setError(message);

    if (errorTimer) {
      clearTimeout(errorTimer);
    }

    const timer = setTimeout(() => {
      setError("");
      setErrorTimer(null);
    }, 10000);

    setErrorTimer(timer);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (title.trim() === "") {
      showError("Please enter a task!");
      return;
    }

    if (errorTimer) {
      clearTimeout(errorTimer);
    }

    onAddTask(title.trim());
    setTitle("");
    setError("");
    setErrorTimer(null);
  }

  return (
    <div className="task-form-wrapper">
      <form className="task-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter a new task..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError("");
            if (errorTimer) {
              clearTimeout(errorTimer);
              setErrorTimer(null);
            }
          }}
        />

        <button type="submit">Add Task</button>
      </form>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}


function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty">No tasks available. Add a task!</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div className="task-card" key={task.id}>
          <div className="task-details">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggle(task)}
            />

            <span className={task.completed ? "completed" : ""}>
              {task.title}
            </span>
          </div>

          <div className="task-actions">
            <button
              className="edit-btn"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await axios.get(API_URL);
        setTasks(response.data.slice(0, 8));
      } catch (err) {
        setError("Unable to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  async function addTask(title) {
    try {
      const response = await axios.post(API_URL, {
        title: title,
        completed: false,
        userId: 1
      });

      const newTask = {
        ...response.data,
        id: Date.now(),
        title: title,
        completed: false
      };

      setTasks((previousTasks) => [newTask, ...previousTasks]);
      setError("");
    } catch (err) {
      setError("Unable to add task. Please try again.");
    }
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
  }

 
function saveEdit(id) {
  if (editTitle.trim() === "") {
    setError("Task name cannot be empty.");
    return;
  }

  const updatedTitle = editTitle.trim();

  setTasks((previousTasks) =>
    previousTasks.map((task) =>
      task.id === id
        ? { ...task, title: updatedTitle }
        : task
    )
  );

  setEditingId(null);
  setEditTitle("");
  setError("");

  // Send the update request to the demo API.
  // JSONPlaceholder does not permanently store changes.
  axios.put(`${API_URL}/${id}`, {
    title: updatedTitle,
    completed: tasks.find((task) => task.id === id)?.completed ?? false,
    userId: 1
  }).catch((err) => {
    console.error("Demo API update request failed:", err);
  });
}

  async function toggleTask(task) {
    try {
      await axios.patch(`${API_URL}/${task.id}`, {
        completed: !task.completed
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === task.id
            ? { ...item, completed: !item.completed }
            : item
        )
      );
    } catch (err) {
      setError("Unable to update task status.");
    }
  }

  async function deleteTask(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);

      setTasks((previousTasks) =>
        previousTasks.filter((task) => task.id !== id)
      );

      if (editingId === id) {
        setEditingId(null);
        setEditTitle("");
      }

      setError("");
    } catch (err) {
      setError("Unable to delete task. Please try again.");
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Task Management App</h1>
        <p>Organize your tasks and get things done!</p>
      </header>

      <main className="container">
        <TaskForm onAddTask={addTask} />

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="message">Loading tasks...</p>
        ) : (
          <>
            <div className="task-heading">
              <h2>My Tasks</h2>
              <span>Total: {tasks.length}</span>
            </div>

            {editingId !== null && (
              <div className="edit-box">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <button onClick={() => saveEdit(editingId)}>
                  Save
                </button>

                <button
                  className="cancel-btn"
                  onClick={() => {
                    setEditingId(null);
                    setEditTitle("");
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <TaskList
              tasks={tasks}
              onToggle={toggleTask}
              onEdit={startEdit}
              onDelete={deleteTask}
            />
          </>
        )}
      </main>

      <footer>Assignment 6 | React JS and Axios</footer>
    </div>
  );
}

export default App;
