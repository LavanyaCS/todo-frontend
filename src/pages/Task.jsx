import { jwtDecode } from "jwt-decode";
import { Plus, X, Pencil, Trash, MoreVertical } from "lucide-react";
import React, { useEffect, useState } from "react";
import { baseUrl } from "../api";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";

function Task() {
  const [taskform, setTaskForm] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    dueDate: ""
  });

  // Validation
  const [errors, setErrors] = useState({});

  // Kebab Menu
  const [openMenuid, setOpenMenuId] = useState(null);
  const token = localStorage.getItem("token");
  const decode = jwtDecode(token);

  // Show Popup
  const [showModal, setShowModal] = useState(false);

  // Edit Task
  const [editTask, setEditTask] = useState(false);
  const [editTaskId, setEditTaskId] = useState();

  // Tasks state
  const [tasks, setTasks] = useState([]);

  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Toggle kebab menu
  const toggleOpenMenu = (id) => {
    setOpenMenuId(openMenuid === id ? null : id);
  };

  // Handle input change with validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskForm({ ...taskform, [name]: value });

    let fieldError = "";
    if (name === "title") {
      if (!value.trim()) fieldError = "Title is required";
      else if (value.length < 3)
        fieldError = "Title must be at least 3 characters";
    }
    if (name === "description" && !value.trim()) {
      fieldError = "Description is required";
    }
    if (name === "status" && !value) {
      fieldError = "Please select a status";
    }
    if (name === "priority" && !value) {
      fieldError = "Please select a priority";
    }
    if (name === "dueDate") {
      if (!value) fieldError = "Please select a due date";
      else if (dayjs(value).isBefore(dayjs(), "day")) {
        fieldError = "Due date cannot be in the past";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Handle submit
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    const hasErrors = Object.values(errors).some((err) => err);
    if (hasErrors) {
      toast.error("Please fix validation errors before submitting");
      return;
    }

    try {
      let res;
      if (editTask && editTaskId) {
        res = await axios.put(`${baseUrl}/api/tasks/${editTaskId}`, taskform, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks((prev) =>
          prev.map((t) => (t._id === editTaskId ? res.data.task : t))
        );
      } else {
        res = await axios.post(`${baseUrl}/api/tasks/`, taskform, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Prepend new task so it's always first
        setTasks((prev) => [res.data.task, ...prev]);
      }

      toast.success(res.data.message || "Task saved successfully!");
      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        status: "",
        priority: ""
      });
      setErrors({});
      setShowModal(false);
      setEditTask(false);
      setEditTaskId(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // Fetch tasks with pagination
  const fetchTasks = async (pageNum = 1) => {
    if (loading) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${baseUrl}/api/tasks?page=${pageNum}&limit=6`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const merged = [...tasks, ...res.data.tasks].sort(
        (a, b) =>
          new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id)
      );

      setTasks(merged);
      setPage(res.data.page);
      setHasMore(res.data.page < res.data.pages);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        hasMore &&
        !loading
      ) {
        fetchTasks(page + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading]);

  // Initial load
  useEffect(() => {
    fetchTasks();
  }, []);

  // Edit task
  const handleTaskEdit = (data) => {
    setTaskForm({
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate
    });
    setErrors({});
    setEditTaskId(data._id);
    setEditTask(true);
    setShowModal(true);
    setOpenMenuId(null);
  };

  // Delete task
  const handleTaskDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Task?")) {
      try {
        const res = await axios.delete(`${baseUrl}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message);
        setTasks((prev) => prev.filter((task) => task._id !== id));
        setOpenMenuId(null);
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }
    }
  };

  return (
    <>
      <div className="max-w-6xl w-full mx-auto p-4">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Task List</h2>
          <button
            onClick={() => {
              setEditTask(false);
              setEditTaskId(null);
              setTaskForm({
                title: "",
                description: "",
                status: "",
                priority: "",
                dueDate: ""
              });
              setErrors({});
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Task Grid */}
        {tasks.length === 0 ? (
          <div className="border rounded p-4 text-gray-600">
            No Tasks available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {tasks.map((data, index) => (
              <div
                key={data._id || index}
                className="relative p-4 bg-white shadow-lg rounded-lg border border-slate-100 col-span-1"
              >
                <div className="space-y-2">
                  <p className="flex gap-4 mb-2">
                    <span className="w-28 font-medium">Title</span>
                    <span className="w-2">:</span>
                    <span className="text-gray-800">{data.title}</span>
                  </p>
                  <p className="flex gap-4 mb-2">
                    <span className="w-28 font-medium">Description</span>
                    <span className="w-2">:</span>
                    <span className="text-gray-800">{data.description}</span>
                  </p>
                  <p className="flex gap-4 mb-2 capitalize">
                    <span className="w-28 font-medium">Status</span>
                    <span className="w-2">:</span>
                    <span
                      className={`${
                        data.status.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-700 px-2 rounded"
                          : data.status.toLowerCase() === "in-progress"
                          ? "bg-yellow-100 text-yellow-700 px-2 rounded"
                          : data.status.toLowerCase() === "pending"
                          ? "bg-blue-100 text-blue-700 px-2 rounded"
                          : "bg-red-100 text-red-700 px-2 rounded"
                      }`}
                    >
                      {data.status}
                    </span>
                  </p>
                  <p className="flex gap-4 mb-2 capitalize">
                    <span className="w-28 font-medium">Priority</span>
                    <span className="w-2">:</span>
                    <span
                      className={`${
                        data.priority === "Low"
                          ? "bg-green-100 text-green-700 px-2 rounded"
                          : data.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700 px-2 rounded"
                          : data.priority === "High"
                          ? "bg-blue-100 text-blue-700 px-2 rounded"
                          : "bg-red-100 text-red-700 px-2 rounded"
                      }`}
                    >
                      {data.priority}
                    </span>
                  </p>
                  <p className="flex gap-4 mb-2 capitalize">
                    <span className="w-28 font-medium">Due Date</span>
                    <span className="w-2">:</span>
                    <span className="text-gray-800">
                      {dayjs(data.dueDate).format("DD-MM-YYYY")}
                    </span>
                  </p>
                </div>
                <div className="absolute right-4 bottom-4 flex gap-4 flex-row">
                  <button
                    onClick={() => toggleOpenMenu(data._id)}
                    className="p-2 rounded-full shadow border border-gray-50 hover:bg-gray-100 bg-white"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuid === data._id && (
                    <div className="absolute left-6 top-6 bg-white shadow-lg rounded-lg w-32 z-50">
                      <button
                        onClick={() => handleTaskEdit(data)}
                        className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleTaskDelete(data._id)}
                        className="flex items-center gap-2 px-3 py-2 w-full text-left hover:bg-gray-100 text-red-600"
                      >
                        <Trash size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <p className="text-center mt-4 text-gray-500">Loading more tasks...</p>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-[#0000003b] bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 py-2 relative h-[31rem]">
              <div className="px-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-2 text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>
                <h3 className="text-lg font-semibold mb-1">
                  {editTask ? "Edit Task" : "Add Task"}
                </h3>
              </div>
              <form className="space-y-4 w-full" onSubmit={handleTaskSubmit}>
                <div className="border-y px-6 py-3 border-slate-200 w-full h-96 overflow-y-auto">
                  {/* Title */}
                  <label className="block mb-1 text-sm font-medium text-left text-black">
                    Title
                  </label>
                  <input
                    type="text"
                    onChange={handleChange}
                    name="title"
                    value={taskform.title}
                    placeholder="Enter a Title"
                    className={`w-full px-4 py-2 border rounded ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}

                  {/* Description */}
                  <label className="block my-1 text-sm font-medium text-left text-black">
                    Description
                  </label>
                  <textarea
                    onChange={handleChange}
                    name="description"
                    value={taskform.description}
                    placeholder="Enter a Description"
                    className={`w-full px-4 py-2 border rounded ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.description}
                    </p>
                  )}

                  {/* Status */}
                  <label className="block my-1 text-sm font-medium text-left text-black">
                    Status
                  </label>
                  <select
                    onChange={handleChange}
                    name="status"
                    value={taskform.status}
                    className={`w-full px-4 py-2 border rounded ${
                      errors.status ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="" disabled hidden>
                      ---Select a Status---
                    </option>
                    <option value="Pending">Pending</option>
                    <option value="In-Progress">In-Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {errors.status && (
                    <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                  )}

                  {/* Priority */}
                  <label className="block my-1 text-sm font-medium text-left text-black">
                    Priority
                  </label>
                  <select
                    onChange={handleChange}
                    name="priority"
                    value={taskform.priority}
                    className={`w-full px-4 py-2 border rounded ${
                      errors.priority ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="" disabled hidden>
                      ---Select a Priority---
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  {errors.priority && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.priority}
                    </p>
                  )}

                  {/* Due Date */}
                  <label className="block my-1 text-sm font-medium text-left text-black">
                    Due Date
                  </label>
                  <input
                    type="date"
                    onChange={handleChange}
                    name="dueDate"
                    value={
                      taskform.dueDate
                        ? dayjs(taskform.dueDate).format("YYYY-MM-DD")
                        : ""
                    }
                    className={`w-full px-4 py-2 border rounded ${
                      errors.dueDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-4 px-6 -mt-1">
                  <button
                    type="submit"
                    disabled={Object.values(errors).some((err) => err)}
                    className={`w-full py-2 rounded-lg ${
                      Object.values(errors).some((err) => err)
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-gray-700 text-white hover:bg-gray-800 cursor-pointer"
                    }`}
                  >
                    {editTask ? "Edit" : "Add"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    type="button"
                    className="cursor-pointer w-full py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Task;
