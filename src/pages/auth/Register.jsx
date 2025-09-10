import React, { useState } from 'react'
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { baseUrl } from '../../api';
import { toast } from "react-toastify";
import { jwtDecode } from 'jwt-decode';
function Register() {
  const [form, setForm] = useState({
    username: "", email: "", password: "", role: ""
  });
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePasswordVisibility = (e) => {
    setShowPassword(!showPassword);
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/api/auth/register`, form);
      localStorage.setItem("token", res.data.token);
      const decode = jwtDecode(res.data.token);
toast.success("Registration successful!");
    if (decode?.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
    }
    catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response?.data?.message || "Something went wrong");
        setError(err.response.data.message); // Backend error message
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }

  }
  return (
    <div className='bg-image-auth w-full'>
      <div className="flex flex-col items-center justify-center w-full h-screen px-4 text-center bg-center bg-cover bg-image">
        <div className='w-1/2 max-w-2xl px-6 py-4 border rounded-lg xl:w-1/3 backdrop-blur-md bg-white/10 border-gray-500/10'>
          <form onSubmit={handleSubmit} className='space-y-4 w-full'>
            <h1 className='text-2xl font-bold text-center text-gray-900'>Sign Up</h1>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-left text-black">UserName</label>
            <input type="text" onChange={handleChange} required name="username" placeholder="User Name"
              className="w-full px-4 py-2 border border-gray-900 rounded focus:border-gray-700   focus:ring-1 focus:ring-gray-700  focus:outline-0" />
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-left text-black">Email Address</label>
            <input type="email" onChange={handleChange} required name="email" placeholder="Email"
              className="w-full px-4 py-2 border border-gray-900 rounded focus:border-gray-700   focus:ring-1 focus:ring-gray-700  focus:outline-0"
            />
            <div className="relative">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-left text-black">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password" name="password" minLength={6}
                className="w-full px-4 py-2 border border-gray-900 rounded focus:border-gray-700   focus:ring-1 focus:ring-gray-700 focus:outline-0"
                onChange={handleChange} required

              />
              <span onClick={handleTogglePasswordVisibility} className="absolute top-1/2 right-3 cursor-pointer">
                {showPassword ? (<EyeOff />) : (<Eye />)}
              </span>
            </div>
            <label htmlFor="role" className="block mb-1 text-sm font-medium text-left text-black">Role</label>
            <select onChange={handleChange} required name="role"
             className="w-full px-4 py-2 border rounded"
             value={form.role} >
               <option value="" disabled hidden>---Select a Role---</option>
              <option value="admin" >Admin</option>
              <option value="user" >User</option>
            </select>

            {error && <p className='text-red-500 text-sm font-semibold'>{error}</p>}

            <button type="submit" disabled={loading} className="w-full py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800">
              {loading ? "Registering..." : "Register"}
            </button>
            <p className="text-sm text-center text-black">
              Already have an account?{' '}
              <Link to="/" className="font-semibold hover:underline">
                Sign In
              </Link>
            </p>

          </form>
        </div></div>
    </div>
  )
}

export default Register
