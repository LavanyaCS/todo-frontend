import Task from '../pages/Task'
import { Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import React, { useEffect, useState } from 'react'
import Dashboard from '../pages/Dashboard'
import Home from '../pages/Home'
import { HomeIcon, LayoutDashboard, Menu, User, UserCircle, Workflow, X  } from 'lucide-react'
function Header() {
    const [username,setUsername] = useState("");

    const [isAdmin,setAdmin] = useState(false);
    const [isOpen,setIsOpen] = useState(false)
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/")
    }
    useEffect(() => {
        try{
            const token = localStorage.getItem("token");
            const decode = jwtDecode(token);
            setAdmin(decode.role === 'admin');
            setUsername(decode.username);

        }
            catch (err) {
      console.error("No User", err);
    }

    },[])
    return (
    <div className="bg-gray-700 text-white">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        {/* Logo / Title */}
        <div className="text-xl font-bold">To-Do List</div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-start px-8">
          {isAdmin ? (
<>           <Link to="/dashboard" className="hover:text-gray-300 flex justify-center items-center gap-x-3">
               <LayoutDashboard size={24} /> Dashboard
            </Link>
            <Link to="/home" className="hover:text-gray-300 flex justify-center items-center gap-x-3">
                <HomeIcon size={24} /> My Home
            </Link></> 
          ) : (
            <Link to="/home" className="hover:text-gray-300 flex justify-center items-center gap-x-3">
              <HomeIcon size={24} /> Home
            </Link>
          )}
          <Link to="/tasks" className="hover:text-gray-300 flex justify-center items-center">
           <Workflow size={24} /> Task
          </Link>
             <div className="hidden md:flex items-center gap-6 flex-1 justify-end">
          <span className="ml-4 font-bold capitalize flex gap-2 justify-center items-center"><UserCircle size={24} /> Hi {username}</span>
          
          <button onClick={handleLogout} className="hover:text-gray-700 hover:bg-white border-white border py-1 px-3 rounded-md shadow flex items-center justify-center">
            Logout
          </button>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col gap-4 px-4 pb-4">
          {isAdmin ? (
            <Link
              to="/dashboard"
              className="hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/home"
              className="hover:text-gray-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
          )}
          <Link
            to="/tasks"
            className="hover:text-gray-300"
            onClick={() => setIsOpen(false)}
          >
            Task
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="text-left hover:text-gray-300"
          >
            Logout
          </button>
          {/* <span>Hi Lavanya</span> */}
        </div>
      )}
    </div>
  );
}


export default Header
