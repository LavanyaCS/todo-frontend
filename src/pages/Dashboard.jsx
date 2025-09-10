import { jwtDecode } from 'jwt-decode';
import React, { useState,useEffect } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import axios from 'axios'
import { baseUrl } from "../api"
import { useNavigate } from 'react-router';


function Dashboard() {
  const [isAdmin,setAdmin] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      const decode = jwtDecode(token);
      if (decode.role !== "admin") {
      navigate("/home", { replace: true, state: { message: "Admins only!" } });
    } else {
      setAdmin(true);
    }
      // setAdmin(decode.role === "admin");

    }
  }, [token,navigate]);
  //Task
  const [tasks,setTasks] = useState([]);
  const [statusData,setStatusData] = useState([]);  // Pending", "In-Progress", "Completed
  const [priorityData,setPriorityData] = useState([]) //Low", "Medium", "Hig"
  const [dueSeries,setDueSeries] = useState([]) //Due Date based Notifications
  // For COLOR TO DISPLAY ON CHART
  const STATUS_COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#F44336"]; // Completed, In-Progress, Pending, Overdue
  const PRIORITY_COLORS = ["#F44336", "#FFC107", "#4CAF50"];   // High, Medium, Low
  useEffect(() => {
    const fetchTasksAndBuildRechart = async() => {
      try{
        //API Fetch ALL Task
        const res = await axios.get(`${baseUrl}/api/tasks/all`,{
          headers:{Authorization:`Bearer ${token}`}
        });
        console.log(res.data);
        const allTasks = res.data.tasks || [];
        //Status 
        const statusCount = { Completed: 0, "In-Progress": 0, Pending: 0, Overdue: 0 };
        const today = new Date().setHours(0,0,0,0);
       allTasks.forEach((task) => {
  const dueDate = new Date(task.dueDate).setHours(0,0,0,0);
  if (dueDate < today && task.status !== "Completed") {
    statusCount.Overdue++;
  } else if (task.status === "Completed") {
    statusCount.Completed++;
  } else if (task.status === "In-Progress") {
    statusCount["In-Progress"]++;
  } else {
    statusCount.Pending++;
  }
});

        const statusDataFormat = Object.entries(statusCount).map(([name,value]) => ({name,value}));
        setStatusData(statusDataFormat);
        //Similar to status we will check priority count
        const priorityCount = {High : 0 ,Medium: 0,Low: 0};
        allTasks.forEach((task) => {
          if(task.priority === "High"){return priorityCount.High++}
          else if(task.priority === "Medium"){return priorityCount.Medium++}
          else if (task.priority === "Low") priorityCount.Low++;
        });
        const priorityDataFormat = Object.entries(priorityCount).map(([name,value]) => ({name,value}));
        setPriorityData(priorityDataFormat);
        //Due  Date Series
        const series = buildDueDateSeries(allTasks,14) // Last 14 days data
        setDueSeries(series);
        setTasks(allTasks);
        console.log(allTasks);
      }
      catch (err) {
        console.error("Error fetching tasks for dashboard", err);
      }
    };
    fetchTasksAndBuildRechart();

  },[token]);
  //Due Date
  function buildDueDateSeries(allTasks = [], days = 14) {
    const start = new Date(); //Today 
    start.setHours(0,0,0,0); //Start with 0 hours
    start.setDate(start.getDate() - (days -1)); //today added
    const map = {};

    //Data Normized into yyyy-mm-dd
    allTasks.forEach((task) => {
      if(!task.dueDate) return;
      const d = new Date(task.dueDate);
      d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0,10); //yyyy-mm-dd(10 count);
      map[key] = (map[key] || 0) + 1; 
    });
    const series = [];
    for(let i = 0;i< days;i++){
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0,10);
      //Label
      const label = d.toLocaleDateString(undefined,{month:"short",day:"numeric"});
      series.push({ date: key, label, count: map[key] || 0 });
    }
    return series;
  };
   // ✅ fallback safe data for charts
  const safeStatusData = statusData.length ? statusData : [{ name: "No Data", value: 0 }];
  const safePriorityData = priorityData.length ? priorityData : [{ name: "No Data", value: 0 }];

  return (
    <div>
      {isAdmin ? (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: status pie + timeline */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Task Status</h2>

          <div className="flex flex-col lg:flex-row gap-6">
            <div style={{ flex: 1, minWidth: 300, height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={STATUS_COLORS[idx % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
<Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Task Due</h2>

          <div className="flex flex-col lg:flex-row gap-6">
            <div style={{ flex: 1, minWidth: 320, height: 300 }}>
              <h3 className="text-sm text-gray-500 mb-2">Tasks due (last 14 days)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dueSeries} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip formatter={(value) => [value, "Tasks"]} />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: priority bar */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Task Priority</h2>
          <div style={{ width: "100%", height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value">
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-priority-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
</div>  ) : (
  <div className="p-6 text-center text-red-600 font-semibold">
    You are not authorized to view this page.
  </div>
)
    }
      
    </div>
  )
}

export default Dashboard
