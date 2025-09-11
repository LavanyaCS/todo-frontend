import React, { useState } from 'react'
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { baseUrl } from '../../api';
import { jwtDecode } from 'jwt-decode';
import { toast } from "react-toastify";
function Login() {
  const [form, setForm] = useState({
    email: "", password: ""
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  const [showPassword, setShowPassword] = useState(false);
  //Minor Validate
  const validate = () => {
    let errValidate = {}
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      errValidate.email = "Please enter a valid email address";
    }
    if (form.password.length < 6) {
      errValidate.password = "Password must be at least 6 characters long";
    }
    setError(errValidate);
    return Object.keys(errValidate).length === 0;

  }
  const handleTogglePasswordVisibility = (e) => {
    setShowPassword(!showPassword);
  }
  const handleSubmit = async (e) => {

    e.preventDefault(); console.log("Form Data:", form);
    setLoading(true);
    if (!validate()) return;
    try {
      const res = await axios.post(`${baseUrl}/api/auth/login`, form);
      console.log("Login Successfully", res.data);

      toast.success("Login successful!");
      localStorage.setItem("token", res.data.token);
      const decode = jwtDecode(res.data.token);
      if (decode.role === 'admin') {
        navigate("/dashboard")
      } else {
        navigate("/home");
      }
      setForm({ email: "", password: "" });
    }
    catch (err) {
      if (err.response?.data?.message) {

        toast.error(err.response.data.message);
      } else {
        toast.error('Something went wrong. Please try again.');
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
            <h1 className='text-2xl font-bold text-center text-gray-900'>Sign In</h1>
            <div><label htmlFor="email" className="block mb-1 text-sm font-medium text-left text-black">Email Address</label>
              <input type="email" onChange={handleChange} required name="email" placeholder="Email"
                className="w-full px-4 py-2 border border-gray-900 rounded focus:border-gray-700   focus:ring-1 focus:ring-gray-700  focus:outline-0"
              />
              {error.email && <p className="text-red-500 text-sm flex">{error.email}</p>}</div>
            <div>

              <div className="relative">
                <label htmlFor="password" className="block mb-1 text-sm font-medium text-left text-black">Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password" name="password"
                  className="w-full px-4 py-2 border border-gray-900 rounded focus:border-gray-700   focus:ring-1 focus:ring-gray-700 focus:outline-0"
                  onChange={handleChange} required

                />
                <span onClick={handleTogglePasswordVisibility} className="absolute top-1/2 right-3 cursor-pointer">
                  {showPassword ? (<EyeOff />) : (<Eye />)}
                </span>
              </div>
              {error.password && <p className="text-red-500 text-sm flex">{error.password}</p>}

            </div>

            <button type="submit" disabled={loading} className="cursor-pointer w-full py-2 text-white bg-gray-700 rounded-lg hover:bg-gray-800">
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="text-sm text-center text-black">
              Don't have an account?{' '}
              <Link to="/register" className="cursor-pointer font-semibold hover:underline">
                Sign Up
              </Link>
            </p>

          </form>
        </div></div>
    </div>
  )
}

export default Login
