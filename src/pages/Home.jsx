import React, { useEffect, useState } from "react";
import { Plus, CheckSquare, ListTodo, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { baseUrl } from "../api";
import axios from "axios";

function Home() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    pending: 0,
    dueToday: 0,
    overdue: 0,
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${baseUrl}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Normalize tasks: always have status + dueDate
        const allTasks = res.data.tasks.map((task) => ({
          ...task,
          status: task.status
            ? task.status.charAt(0).toUpperCase() + task.status.slice(1).toLowerCase()
            : "Pending",
          dueDate: task.dueDate ? task.dueDate : null,
        }));

        // Stats calculation
        const today = new Date().setHours(0, 0, 0, 0);
        let completed = 0,
          pending = 0,
          dueToday = 0,
          overdue = 0;

        allTasks.forEach((task) => {
          const dueDate = task.dueDate ? new Date(task.dueDate).setHours(0, 0, 0, 0) : null;

          if (task.status === "Completed") {
            completed++;
          } else if (task.status === "Pending" || task.status === "In-Progress") {
            pending++;
          }

          if (dueDate) {
            if (dueDate === today) {
              dueToday++;
            } else if (dueDate < today && task.status !== "Completed") {
              overdue++;
            }
          }
        });

        setStats({ completed, pending, dueToday, overdue });
        setTasks(allTasks);
      } catch (err) {
        console.error("Error fetching tasks", err);
      }
    };

    fetchTasks();
  }, [token]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h1>
        <p className="text-gray-600">Here’s what’s happening with your tasks today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <CheckSquare className="text-green-500" size={28} />
          <div>
            <h2 className="text-xl font-bold">{stats.completed}</h2>
            <p className="text-gray-500 text-sm">Completed</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <ListTodo className="text-blue-500" size={28} />
          <div>
            <h2 className="text-xl font-bold">{stats.pending}</h2>
            <p className="text-gray-500 text-sm">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <Calendar className="text-purple-500" size={28} />
          <div>
            <h2 className="text-xl font-bold">{stats.dueToday}</h2>
            <p className="text-gray-500 text-sm">Due Today</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
          <Clock className="text-red-500" size={28} />
          <div>
            <h2 className="text-xl font-bold">{stats.overdue}</h2>
            <p className="text-gray-500 text-sm">Overdue</p>
          </div>
        </div>
      </div>

      {/* Actions + Task Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
        <Link
          to="/tasks"
          className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-xl shadow hover:bg-gray-800 transition"
        >
          <Plus size={18} /> Add Task
        </Link>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl shadow divide-y">
        {tasks.length === 0 ? (
          <p className="p-4 text-gray-500">No tasks available.</p>
        ) : (
          tasks.slice(0, 5).map((task) => (
            <div key={task._id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-800">{task.title}</h3>
                <p className="text-sm text-gray-500">
                  Due:{" "}
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "No due date"}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  task.status.toLowerCase() === "completed"
                    ? "bg-green-100 text-green-700"
                    : task.status.toLowerCase() === "in-progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : task.status.toLowerCase() === "pending"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {task.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
