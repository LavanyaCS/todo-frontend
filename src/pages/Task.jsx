import { jwtDecode } from 'jwt-decode';
import { Plus, X, Pencil, Trash, MoreVertical } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { baseUrl } from '../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { toast } from 'react-toastify';
function Task() {
  const [taskform, setTaskForm] = useState({
    title: "", description: "", status: "", priority: "", dueDate: ""
  });
  const [openMenuid, setOpenMenuId] = useState(null);
  const token = localStorage.getItem("token");
  const decode = jwtDecode(token);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(false);
  const [editTaskId, setEditTaskId] = useState();
  const [tasks, setTasks] = useState([])
  //Open Kebab menu
  const toggleOpenMenu = (id) => {
    setOpenMenuId(openMenuid === id ? null : id)
  }
  //Handle Submit Change
  const handleChange = (e) => {
    setTaskForm({ ...taskform, [e.target.name]: e.target.value });
  }
  //Handle SUbmit
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let res;
      if (editTask && editTaskId) {
        res = await axios.put(`${baseUrl}/api/tasks/${editTaskId}`, taskform, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(tasks.map(t => (t._id === editTaskId ? res.data.task : t)));
      }
      else {
        res = await axios.post(`${baseUrl}/api/tasks/`, taskform, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks([res.data.task, ...tasks]);
      }
      // setTasks([res.data.task, ...tasks]);
      console.log(res.data);
      console.log(res.data.message);
      toast.success(res.data.message || "Task created successfully!");
      // alert(res.data.message);
      // console.log(res.data.tasks);
      setTaskForm({ title: "", description: "", dueDate: "", status: "", priority: "" });
      setShowModal(false);
      setEditTask(false);
      setEditTaskId(null);
      //fetch list
      // fetchTasks();
    }
    catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  }
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseUrl}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(res.data.tasks);
      // Sort tasks in descending order by _id
      const sortedTasks = (res.data.tasks || []).sort(
        (a, b) => (a._id < b._id ? 1 : -1)
      );

      setTasks(sortedTasks);
      // setTasks(res.data.tasks || []);

    }
    catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }

  }
  const handleTaskEdit = (data) => {
    setTaskForm({
      title: data.title, description: data.description, status: data.status, priority: data.priority, dueDate: data.dueDate
    })
    setEditTaskId(data._id); setEditTask(true); setShowModal(true);
    setOpenMenuId(null);
  }
  const handleTaskDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Task?")) {
      try {
        const res = await axios.delete(`${baseUrl}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success(res.data.message);
        fetchTasks();
        setOpenMenuId(null);
      }
      catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Something went wrong");
      }

    }
  }
  useEffect(() => {
    fetchTasks();
  }, [])
  return (
    <>
      <div className="max-w-6xl w-full mx-auto p-4">
        <div className="flex flex-row justify-between items-center mb-4">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800">Task List</h2>

          {/* Add Button */}

          <button onClick={() => {
            setEditTask(false);
            setEditTaskId(null);
            setTaskForm({
              title: "", description: "", status: "", priority: "", dueDate: ""
            });
            setShowModal(true)
          }
          } className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition">
            <Plus size={18} /> Add
          </button>

        </div>

        {/* Task Table / Cards will go here later */}
        {tasks.length === 0 ? (
          <div className="border rounded p-4 text-gray-600">
            No Tasks available.
          </div>)
          : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {
                tasks.map((data, index) => (
                  <div key={data._id || index} className="relative p-4 bg-white shadow-lg rounded-lg border border-slate-100 col-span-1">
                    {/* <h1 className="font-semibold text-lg">{data.name}</h1> */}
                    <div className="space-y-2">
                      <p className="flex gap-4 mb-2">
                        <span className="w-28 font-medium">Title</span><span className="w-2">:</span>
                        <span className="text-gray-800">{data.title}</span>
                      </p>
                      <p className="flex gap-4 mb-2">
                        <span className="w-28 font-medium">Description</span><span className="w-2">:</span>
                        <span className="text-gray-800">{data.description}</span>
                      </p>
                      <p className="flex gap-4 mb-2 capitalize">
                        <span className="w-28 font-medium">Status</span><span className="w-2">:</span>
                        <span className={`${data.status.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-700 px-2 rounded"
                            : data.status.toLowerCase() === "in-progress"
                              ? "bg-yellow-100 text-yellow-700 px-2 rounded"
                              : data.status.toLowerCase() === "pending"
                                ? "bg-blue-100 text-blue-700 px-2 rounded"
                                : "bg-red-100 text-red-700 px-2 rounded"
                          }`}
                        >{data.status}</span>
                      </p>
                      <p className="flex gap-4 mb-2 capitalize">
                        <span className="w-28 font-medium">Priority</span><span className="w-2">:</span>
                        <span className={`${data.priority === "Low"
                            ? "bg-green-100 text-green-700 px-2 rounded"
                            : data.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700 px-2 rounded"
                              : data.priority === "High"
                                ? "bg-blue-100 text-blue-700 px-2 rounded"
                                : "bg-red-100 text-red-700 px-2 rounded"
                          }`}
                        >{data.priority}</span>
                      </p>

                      <p className="flex gap-4 mb-2 capitalize">
                        <span className="w-28 font-medium">Due Date</span><span className="w-2">:</span>
                        {/* <span className="text-gray-800">{data.dueDate}</span> */}
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
                        <div className="absolute left-6 top-6 bg-white shadow-lg  rounded-lg w-32 z-50">
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
                ))
              }
            </div>

          )
        }
        {showModal && (
          <div className="fixed inset-0 bg-[#0000003b] bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-96 py-2 relative h-[31rem]">
              <div className="px-6">
                {/* Close Button */}
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-2 text-gray-500 hover:text-gray-800"
                >
                  <X size={20} />
                </button>

                <h3 className="text-lg font-semibold mb-1">{editTask ? 'Edit Task' : 'Add Task'}</h3></div>
              <form className="space-y-4 w-full" onSubmit={handleTaskSubmit}>
                <div className="border-y px-6 py-3 border-slate-200 w-full">
                  <label htmlFor="name" className="block mb-1 text-sm font-medium text-left text-black">Title</label>
                  <input type="text" onChange={handleChange} name="title" value={taskform.title} placeholder="Enter a Title"
                    className="w-full px-4 py-2 border rounded" />
                  <label htmlFor="description" className="block my-1 text-sm font-medium text-left text-black">Description</label>
                  <textarea onChange={handleChange} name="description" value={taskform.description} placeholder="Enter a Description"
                    className="w-full px-4 py-2 border rounded" ></textarea>
                  <label htmlFor="status" className="block my-1 text-sm font-medium text-left text-black">Status</label>
                  <select onChange={handleChange} name="status" value={taskform.status} className="w-full px-4 py-2 border rounded">
                    <option value="" disabled hidden>---Select a Status---</option>
                    <option value="Pending" >Pending</option>
                    <option value="In-Progress" >In-Progress</option>
                    <option value="Completed" >Completed</option>
                  </select>
                  <label htmlFor="priority" className="block my-1 text-sm font-medium text-left text-black">Priority</label>
                  <select onChange={handleChange} name="priority" value={taskform.priority} className="w-full px-4 py-2 border rounded">
                    <option value="" disabled hidden>---Select a Priority---</option>
                    <option value="Low" >Low</option>
                    <option value="Medium" >Medium</option>
                    <option value="High" >High</option>
                  </select>
                  <label htmlFor="dueDate" className="block my-1 text-sm font-medium text-left text-black">Due Date</label>
                  <input type="date" onChange={handleChange} name="dueDate"
                    value={taskform.dueDate ? dayjs(taskform.dueDate).format("YYYY-MM-DD") : ""}
                    placeholder="Enter a Due Date"
                    className="w-full px-4 py-2 border rounded" />
                </div><div className="flex justify-end gap-4 px-6 -mt-1">
                  <button type="submit"
                    disabled={!taskform.title || !taskform.description || !taskform.priority || !taskform.dueDate}
                    className="w-full py-2 text-white cursor-pointer bg-gray-700 rounded-lg hover:bg-gray-800">
                    {editTask ? 'Edit' : 'Add'}
                  </button>
                  <button onClick={() => setShowModal(false)} className="cursor-pointer w-full py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Cancel
                  </button>

                </div>
              </form>
            </div></div>
        )}

      </div>
    </>
  )
}

export default Task
